/**
 * Turns the admin console's raw counts into a short, ranked "what to work on next" list.
 *
 * Pure functions over the rows `lib/admin.ts` already reads — no database, no clinical values —
 * so the rules are testable and easy to tune. Every recommendation carries the evidence behind
 * it and a link to the tab that shows the detail, so the owner can check before acting.
 */

import type { FeatureUsage, FeedbackResponse, Friction, FunnelStep, ScreenUsage, SttRow, UsageFriction, WeekActive } from "./admin";

export type Priority = "high" | "medium" | "low";
export type Recommendation = { priority: Priority; title: string; evidence: string; action: string; href: string };

/** Plain-English name for each screen path `page-view.tsx` reports. Unknown paths show as-is. */
export const SCREENS: Record<string, string> = {
  "/": "Home",
  "/home": "Home",
  "/ward": "Ward list",
  "/unit": "Unit settings",
  "/unit/discharged": "Discharged patients",
  "/unit/trash": "Trash",
  "/unit/access-log": "Access log",
  "/patients/new": "Add patient",
  "/patients/:id": "Patient page",
  "/patients/:id/note": "Progress note",
  "/patients/:id/note/build": "Progress note builder",
  "/patients/:id/case-history": "Case history",
  "/patients/:id/case-history/new": "New case history",
  "/patients/:id/case-history/print": "Case history print",
  "/patients/:id/discharge": "Discharge summary",
  "/patients/:id/discharge/print": "Discharge print",
  "/patients/:id/prepare-discharge": "Prepare discharge",
  "/prepare-discharge": "Prepare discharge (unit)",
  "/prepare-discharge/new": "Prepare discharge (new)",
  "/round/:id": "Ward round",
  "/register/:id": "Paper register",
  "/handover": "Handover",
  "/todo": "To-do",
  "/confirm": "Confirm values",
  "/learn": "Learn",
  "/learn/history/:treeId": "Learn · history",
  "/learn/examination/:id": "Learn · examination",
  "/learn/fluids/:id": "Learn · IV fluids",
  "/protocols": "Protocols",
  "/formats": "Formats",
  "/onboarding": "Onboarding",
  "/feedback": "Feedback form",
};

/** Screens worth flagging when nobody opens them — the features, not the plumbing. */
const FEATURE_SCREENS = [
  "/handover",
  "/todo",
  "/learn",
  "/protocols",
  "/patients/:id/case-history",
  "/patients/:id/discharge",
  "/patients/:id/note",
  "/round/:id",
  "/register/:id",
  "/confirm",
];

export function screenLabel(path: string): string {
  // Learn ids are slugs, not uuids, so page-view.tsx leaves them in; collapse them here.
  const learn = path.match(/^\/learn\/(history|examination|fluids)\/[^/]+$/);
  if (learn) return SCREENS[`/learn/${learn[1]}/${learn[1] === "history" ? ":treeId" : ":id"}`];
  return SCREENS[path] ?? path;
}

/** Merge rows whose paths map to the same label (e.g. many learn trees → "Learn · history"). Admin screens are the owner, not users, so they are dropped. */
export function groupScreens(rows: ScreenUsage[]) {
  const out = new Map<string, { label: string; views: number; views_30d: number; people: number; people_30d: number; last_seen: string }>();
  for (const r of rows) {
    if (r.screen.startsWith("/admin")) continue;
    const label = screenLabel(r.screen);
    const g = out.get(label);
    if (!g) out.set(label, { label, views: r.views, views_30d: r.views_30d, people: r.people, people_30d: r.people_30d, last_seen: r.last_seen });
    else {
      g.views += r.views;
      g.views_30d += r.views_30d;
      // ponytail: people summed across merged paths can double-count one person; fine for ranking.
      g.people = Math.max(g.people, r.people);
      g.people_30d = Math.max(g.people_30d, r.people_30d);
      if (r.last_seen > g.last_seen) g.last_seen = r.last_seen;
    }
  }
  return [...out.values()].sort((a, b) => b.views_30d - a.views_30d || b.views - a.views);
}

/** Count answers per question, in the form's own option order where known. */
export function tallyFeedback(rows: FeedbackResponse[]) {
  const count = (key: keyof FeedbackResponse) => {
    const m = new Map<string, number>();
    for (const r of rows) {
      const v = r[key];
      if (typeof v === "string" && v) m.set(v, (m.get(v) ?? 0) + 1);
    }
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  };
  return {
    total: rows.length,
    experience: count("experience"),
    improvement: count("improvement"),
    would_return: count("would_return"),
    usage: count("usage"),
    discovered: count("discovered"),
    wantsToTalk: rows.filter((r) => r.talk === "Yes, contact me" && r.contact),
    notes: rows.filter((r) => r.open_feedback?.trim()),
  };
}

const NEGATIVE_EXPERIENCE = new Set(["Not great", "Poor"]);
const NEGATIVE_RETURN = new Set(["Probably not", "Definitely not"]);

/** What to do about the people lost at each funnel step, keyed by the step they failed to reach. */
const FUNNEL_ACTION: Record<number, string> = {
  2: "Make creating or joining a unit the first thing onboarding asks for, and check the join-code flow on a phone.",
  3: "Look at the empty-unit screen: is 'Add patient' obvious, and can it be done by photo of the admission sheet?",
  4: "The first dictation is the magic moment. Prompt it right after a patient is added, with a 10-second example.",
  5: "People tried it once and did not come back. Ask them why — send the feedback form to this group.",
  6: "People who used it regularly have gone quiet. A short personal message usually tells you more than a dashboard.",
};

export function recommend(input: {
  funnel: FunnelStep[];
  weeks: WeekActive[];
  usage: FeatureUsage[];
  stt: SttRow[];
  screens: ScreenUsage[];
  friction: Friction[];
  feedback: FeedbackResponse[];
  usageFriction?: UsageFriction[];
}): Recommendation[] {
  const out: Recommendation[] = [];
  const pct = (a: number, b: number) => (b > 0 ? Math.round((a / b) * 100) : 0);

  // 1. The single biggest leak in the funnel.
  const f = [...input.funnel].sort((a, b) => a.step - b.step);
  let worst: { from: FunnelStep; to: FunnelStep; lost: number } | null = null;
  for (let i = 1; i < f.length; i++) {
    const lost = f[i - 1].users - f[i].users;
    if (f[i - 1].users >= 3 && lost / f[i - 1].users >= 0.3 && (!worst || lost > worst.lost))
      worst = { from: f[i - 1], to: f[i], lost };
  }
  if (worst)
    out.push({
      priority: pct(worst.lost, worst.from.users) >= 50 ? "high" : "medium",
      title: `Biggest drop-off: “${worst.to.label.toLowerCase()}”`,
      evidence: `${worst.lost} of ${worst.from.users} people (${pct(worst.lost, worst.from.users)}%) who ${worst.from.label.toLowerCase()} never got to this step.`,
      action: FUNNEL_ACTION[worst.to.step] ?? "Look at what stands between these two steps.",
      href: "/admin/users",
    });

  // 2. Weekly active trend: this full week vs the one before (the current week is still partial).
  const w = input.weeks;
  if (w.length >= 3) {
    const last = w[w.length - 2].active_users;
    const prev = w[w.length - 3].active_users;
    if (prev >= 3 && last < prev * 0.8)
      out.push({
        priority: last < prev * 0.6 ? "high" : "medium",
        title: "Weekly active people fell",
        evidence: `${last} active last week, down from ${prev} the week before (−${pct(prev - last, prev)}%).`,
        action: "Check the activity log for the week it dropped — a release, an outage, or a unit rotating out.",
        href: "/admin/activity",
      });
  }

  // 3. Speech pipeline reliability.
  const voice = input.stt.reduce((s, r) => s + r.entries, 0);
  const errors = input.stt.reduce((s, r) => s + r.errors, 0);
  if (voice >= 10 && errors / voice >= 0.05)
    out.push({
      priority: errors / voice >= 0.15 ? "high" : "medium",
      title: "Dictations are failing to extract",
      evidence: `${errors} of ${voice} voice dictations (${pct(errors, voice)}%) ended with an extraction error.`,
      action: "Open the Speech engine table to see which provider or model is failing, then check Sentry for the error text.",
      href: "/admin/usage",
    });

  // 4. Outcome ratios from feature usage.
  const u = (feature: string, metric: string) => input.usage.find((r) => r.feature === feature && r.metric === metric)?.count ?? 0;
  const rounds = u("Ward round", "Applied") + u("Ward round", "Discarded") + u("Ward round", "Draft (unapplied)");
  const discarded = u("Ward round", "Discarded");
  if (rounds >= 5 && discarded / rounds >= 0.25)
    out.push({
      priority: "medium",
      title: "Ward-round dictations are being thrown away",
      evidence: `${discarded} of ${rounds} round dictations (${pct(discarded, rounds)}%) were discarded.`,
      action: "Residents don't trust how the round was split across beds. Look at bed matching on the discarded ones.",
      href: "/admin/friction",
    });
  const drafts = u("Discharge summary", "Draft (worked on)");
  const finals = u("Discharge summary", "Finalised");
  if (drafts + finals >= 5 && drafts > finals)
    out.push({
      priority: "medium",
      title: "Discharge summaries start but don't finish",
      evidence: `${drafts} in draft vs ${finals} finalised.`,
      action: "Find the step people stop at on the discharge screen — missing fields, slow AI, or printing.",
      href: "/admin/friction",
    });
  const pending = u("Value confirmation", "Pending");
  const confirmed = u("Value confirmation", "Confirmed");
  if (pending >= 10 && pending > confirmed)
    out.push({
      priority: "low",
      title: "Flagged values are left unconfirmed",
      evidence: `${pending} values waiting for a tap-to-confirm, ${confirmed} confirmed.`,
      action: "The amber confirm queue may be too easy to ignore. Consider surfacing it on the ward list.",
      href: "/admin/usage",
    });

  // 5. What people tell you.
  const fb = tallyFeedback(input.feedback);
  if (fb.total > 0) {
    const neg = input.feedback.filter((r) => NEGATIVE_EXPERIENCE.has(r.experience)).length;
    const wontReturn = input.feedback.filter((r) => NEGATIVE_RETURN.has(r.would_return)).length;
    const [topAsk, topAskN] = fb.improvement[0] ?? ["", 0];
    if (topAskN >= 2)
      out.push({
        priority: topAskN / fb.total >= 0.4 ? "high" : "medium",
        title: `Most-asked improvement: “${topAsk}”`,
        evidence: `${topAskN} of ${fb.total} feedback responses picked this first.`,
        action: "Read the free-text notes from these responses before deciding what to build.",
        href: "/admin/feedback",
      });
    if (neg + wontReturn > 0 && (neg / fb.total >= 0.25 || wontReturn / fb.total >= 0.25))
      out.push({
        priority: "high",
        title: "A meaningful share of feedback is negative",
        evidence: `${neg} rated the experience poorly, ${wontReturn} said they probably won't use it again (of ${fb.total}).`,
        action: "Talk to these people first — their reasons are your roadmap.",
        href: "/admin/feedback",
      });
    if (fb.wantsToTalk.length > 0)
      out.push({
        priority: "medium",
        title: `${fb.wantsToTalk.length} ${fb.wantsToTalk.length === 1 ? "person has" : "people have"} offered to talk`,
        evidence: "They ticked “Yes, contact me” on the feedback form and left a contact.",
        action: "Book 15 minutes with each. It is the fastest feedback you will get.",
        href: "/admin/feedback",
      });
  } else {
    out.push({
      priority: "low",
      title: "No feedback collected yet",
      evidence: "The feedback form has no responses.",
      action: "Send the form to users who have been active for a week or more.",
      href: "/admin/feedback",
    });
  }

  // 6. Features nobody opens (only once there is enough traffic to tell).
  const totalViews30 = input.screens.reduce((s, r) => s + r.views_30d, 0);
  if (totalViews30 >= 200) {
    const seen = new Set(input.screens.filter((r) => r.views_30d > 0).map((r) => r.screen));
    const unused = FEATURE_SCREENS.filter((s) => !seen.has(s)).map((s) => SCREENS[s]);
    if (unused.length > 0)
      out.push({
        priority: "low",
        title: `${unused.length} feature${unused.length === 1 ? "" : "s"} not opened in 30 days`,
        evidence: unused.join(", "),
        action: "Either people don't know these exist or don't need them. Surface them, or stop investing in them.",
        href: "/admin/usage",
      });
  }

  // 7. Stalled accounts and units, from the friction report.
  const quiet = input.friction.filter((x) => x.category === "Quiet account").length;
  const cold = input.friction.filter((x) => x.category === "Cold unit").length;
  if (quiet + cold > 0)
    out.push({
      priority: quiet + cold >= 5 ? "medium" : "low",
      title: "Accounts and units have stalled",
      evidence: `${quiet} signed up and never dictated; ${cold} unit${cold === 1 ? "" : "s"} silent for 2+ weeks.`,
      action: "Reach out personally to the most recent ones — they still remember why they signed up.",
      href: "/admin/friction",
    });

  // 8. The worst friction seen during use (patch 0101) — at most three, high severity only.
  for (const x of (input.usageFriction ?? []).filter((x) => x.severity === "high").slice(0, 3))
    out.push({
      priority: "high",
      title: `${x.area}: ${x.signal.toLowerCase()}`,
      evidence: x.out_of
        ? `${x.occurrences} of ${x.out_of} (${pct(x.occurrences, x.out_of)}%) in the last 30 days${x.people ? `, ${x.people} people` : ""}.`
        : `${x.occurrences} times in the last 30 days.`,
      action: x.detail,
      href: "/admin/friction",
    });

  const rank: Record<Priority, number> = { high: 0, medium: 1, low: 2 };
  return out.sort((a, b) => rank[a.priority] - rank[b.priority]);
}
