import Link from "next/link";
import {
  getOverview,
  getFriction,
  getWeeklyActive,
  getFunnel,
  getFeatureUsage,
  getSttBreakdown,
  getScreenUsage,
  getFeedbackResponses,
} from "@/lib/admin";
import { recommend, tallyFeedback } from "@/lib/admin-insights";
import { Empty, ErrorNote, Section, Stat, StatGrid, SeverityDot, Bars } from "./ui";

export const dynamic = "force-dynamic";

/**
 * The console's front page, read top to bottom as a feedback loop: what to fix next, whether
 * usage is growing, where new people get stuck, and what they say — then the raw totals.
 */
export default async function AdminInsightsPage() {
  const [ov, fr, wk, fn, us, st, sc, fb] = await Promise.all([
    getOverview(),
    getFriction(),
    getWeeklyActive(),
    getFunnel(),
    getFeatureUsage(),
    getSttBreakdown(),
    getScreenUsage(),
    getFeedbackResponses(),
  ]);

  if (ov.error) return <ErrorNote message={ov.error} />;
  const o = ov.row;
  if (!o) return <Empty>Nothing to show yet, or this sign-in is not an admin.</Empty>;
  // The newer reports come from patch 0100; until it is run they error, and the page says so.
  const missing = [wk, fn, sc].find((r) => r.error)?.error;

  const recs = recommend({
    funnel: fn.rows,
    weeks: wk.rows,
    usage: us.rows,
    stt: st.rows,
    screens: sc.rows,
    friction: fr.rows,
    feedback: fb.rows,
  });
  const weeks = wk.rows;
  const lastFull = weeks.at(-2)?.active_users ?? 0;
  const prevFull = weeks.at(-3)?.active_users ?? 0;
  const top = fn.rows[0]?.users ?? 0;
  const feedback = tallyFeedback(fb.rows);

  return (
    <>
      {missing && (
        <p className="mt-4 ios-group px-4 py-3 text-footnote text-warn-fg">
          Some reports are unavailable — run <code>supabase/patches/0100_admin_insights.sql</code>{" "}
          ({missing}).
        </p>
      )}

      <Section title="What to work on next" subtitle="Worked out from the numbers below. Highest priority first.">
        {recs.length === 0 ? (
          <p className="ios-group px-4 py-3 text-footnote text-muted">Nothing stands out right now.</p>
        ) : (
          <div className="ios-group divide-y divide-line/40">
            {recs.map((r, i) => (
              <Link key={i} href={r.href} className="flex items-start gap-2.5 px-4 py-3 active:bg-chip">
                <SeverityDot severity={r.priority} />
                <div className="min-w-0">
                  <div className="text-footnote font-semibold">{r.title}</div>
                  <div className="mt-0.5 text-caption text-muted">{r.evidence}</div>
                  <div className="mt-1 text-caption">→ {r.action}</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Section>

      <Section title="Is it growing?" subtitle="People who used the app each week (anything: opening a screen, dictating, a round).">
        <StatGrid>
          <Stat label="Active last week" value={lastFull} hint={delta(lastFull, prevFull)} />
          <Stat label="Active this week so far" value={weeks.at(-1)?.active_users ?? 0} />
          <Stat label="Total users" value={o.users} hint={`${o.signups_7d} new in 7d`} />
        </StatGrid>
        <div className="mt-2">
          <Bars
            items={weeks.map((w) => ({ key: w.week, value: w.active_users, title: `Week of ${w.week}: ${w.active_users} active, ${w.new_users} new` }))}
          />
          <p className="mt-1 px-1 text-caption2 text-muted">Last 12 weeks, oldest on the left. The last bar is the current, unfinished week.</p>
        </div>
      </Section>

      <Section
        title="Where new people get stuck"
        subtitle="Everyone who signed up, and how far they got. Each step counts only people who also did every step above it."
      >
        {fn.rows.length === 0 ? (
          <p className="ios-group px-4 py-3 text-footnote text-muted">No funnel data.</p>
        ) : (
          <div className="ios-group divide-y divide-line/40">
            {fn.rows.map((s, i) => {
              const prev = fn.rows[i - 1]?.users;
              const lost = prev != null ? prev - s.users : 0;
              return (
                <div key={s.step} className="px-4 py-2.5">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-footnote">{s.label}</span>
                    <span className="text-footnote font-medium tabular-nums">
                      {s.users}
                      <span className="ml-1.5 text-caption2 font-normal text-muted">{top ? `${Math.round((s.users / top) * 100)}%` : ""}</span>
                    </span>
                  </div>
                  <div className="mt-1 h-1.5 rounded-full bg-chip">
                    <div className="h-1.5 rounded-full bg-accent/70" style={{ width: `${top ? (s.users / top) * 100 : 0}%` }} />
                  </div>
                  {lost > 0 && <div className="mt-0.5 text-caption2 text-muted">−{lost} dropped off here</div>}
                </div>
              );
            })}
          </div>
        )}
      </Section>

      <Section title="What people say" subtitle={`From ${feedback.total} feedback form response${feedback.total === 1 ? "" : "s"}.`}>
        {feedback.total === 0 ? (
          <p className="ios-group px-4 py-3 text-footnote text-muted">
            No responses yet. <Link href="/admin/feedback" className="text-accent underline">Send the form</Link>.
          </p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            <Tally title="Experience" rows={feedback.experience} total={feedback.total} />
            <Tally title="Improve first" rows={feedback.improvement} total={feedback.total} />
            <Tally title="Would use again" rows={feedback.would_return} total={feedback.total} />
            <Tally title="Have they used it" rows={feedback.usage} total={feedback.total} />
          </div>
        )}
      </Section>

      <Section title="All-time totals">
        <StatGrid>
          <Stat label="Active units" value={o.wards_active} hint={`${o.active_wards_7d} active in 7d · ${o.wards_archived} archived`} />
          <Stat label="Active patients" value={o.patients_active} hint={`${o.patients_total} all-time`} />
          <Stat label="Voice dictations" value={o.voice_entries} hint={`${o.photo_entries} photo reads`} />
          <Stat label="Round dictations" value={o.round_dictations} />
          <Stat label="Discharge summaries" value={o.discharges_finalised} hint={`${o.discharges_draft} in draft`} />
          <Stat label="Events logged 7d" value={o.events_7d} />
        </StatGrid>
      </Section>
    </>
  );
}

function delta(now: number, before: number): string {
  if (!before) return "no prior week to compare";
  const d = Math.round(((now - before) / before) * 100);
  return `${d >= 0 ? "+" : ""}${d}% vs week before (${before})`;
}

function Tally({ title, rows, total }: { title: string; rows: [string, number][]; total: number }) {
  return (
    <div className="ios-group px-4 py-3">
      <div className="text-caption2 uppercase tracking-wide text-muted">{title}</div>
      {rows.map(([label, n]) => (
        <div key={label} className="mt-1.5">
          <div className="flex justify-between gap-2 text-caption">
            <span>{label}</span>
            <span className="tabular-nums text-muted">{n}</span>
          </div>
          <div className="mt-0.5 h-1 rounded-full bg-chip">
            <div className="h-1 rounded-full bg-accent/70" style={{ width: `${(n / total) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}
