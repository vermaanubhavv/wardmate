import type { DischargeDraft } from "@/lib/discharge-entities";

/**
 * Date checks for a discharge summary: an operation dated in the future, an event of this
 * admission dated before it began or after discharge, one event given two different dates.
 *
 * The split is deliberate. Haiku only READS: it lists each date the free text mentions, with a
 * verbatim quote, the event and whether the event belongs to this admission. Every comparison is
 * done here, in code — date arithmetic is not left to a model. A date is used only if its quote
 * is a real span of the text and the quote carries the date's day number (the lib/extract.ts
 * rule: the model's word alone is not enough).
 *
 * Everything comes back as a question, never applied. No key, an error or the timeout returns
 * no questions — the structured-date half (structuredDateQuestions) still runs without a model.
 */

export type DateAnchors = {
  /** yyyy-mm-dd, IST. */
  today: string;
  admittedOn: string | null;
  dischargedOn: string | null;
  procedures: { name: string; date: string | null }[];
};

export type FoundDate = { quote: string; date: string; event: string; thisAdmission: boolean };

const ISO = /^\d{4}-\d{2}-\d{2}$/;

/** yyyy-mm-dd in IST from an ISO timestamp or a bare date; null when unparseable. */
export function istDay(value: string | null | undefined): string | null {
  if (!value) return null;
  if (ISO.test(value)) return value;
  const t = Date.parse(value);
  return Number.isNaN(t) ? null : new Date(t).toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
}

/** dd/mm/yyyy, as the summary prints dates. */
function shown(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

/** A found date survives only if its quote is in the text and carries its day number. */
export function groundedDates(found: FoundDate[], text: string): FoundDate[] {
  return found.filter((f) => {
    if (!ISO.test(f.date) || Number.isNaN(Date.parse(f.date)) || !f.quote || !text.includes(f.quote)) return false;
    const day = Number(f.date.slice(8));
    return (f.quote.match(/\d+/g) ?? []).some((n) => Number(n) === day);
  });
}

/** The comparisons, on dates already grounded. Pure — the tested half. */
export function dateQuestions(found: FoundDate[], a: DateAnchors): string[] {
  const q: string[] = [];
  for (const f of found) {
    if (f.date > a.today) q.push(`"${f.quote}" is dated ${shown(f.date)}, which is after today — is that right?`);
    else if (f.thisAdmission && a.admittedOn && f.date < a.admittedOn)
      q.push(`"${f.quote}" is dated ${shown(f.date)}, before the admission on ${shown(a.admittedOn)} — is that right?`);
    else if (f.thisAdmission && a.dischargedOn && f.date > a.dischargedOn)
      q.push(`"${f.quote}" is dated ${shown(f.date)}, after the discharge on ${shown(a.dischargedOn)} — is that right?`);
  }
  // One event, two dates — within the text, or against the operation record.
  const byEvent = new Map<string, Set<string>>();
  for (const f of found) {
    const key = f.event.toLowerCase().trim();
    if (key) byEvent.set(key, (byEvent.get(key) ?? new Set()).add(f.date));
  }
  for (const [event, dates] of byEvent) {
    const recorded = a.procedures.find((p) => p.date && (p.name.toLowerCase().includes(event) || event.includes(p.name.toLowerCase().trim())));
    if (recorded?.date) dates.add(recorded.date);
    if (a.admittedOn && /admi|present/.test(event)) dates.add(a.admittedOn);
    if (dates.size > 1)
      q.push(`The ${event} is given ${[...dates].sort().map(shown).join(" and ")} — which is right?`);
  }
  return [...new Set(q)];
}

/** The structured dates alone: no model, so it can also run in the browser. */
export function structuredDateQuestions(a: DateAnchors): string[] {
  const q: string[] = [];
  for (const p of a.procedures) {
    if (!p.date) continue;
    const what = p.name.trim() || "The operation";
    if (p.date > a.today) q.push(`${what} is dated ${shown(p.date)}, which is after today — is that right?`);
    else if (a.admittedOn && p.date < a.admittedOn)
      q.push(`${what} is dated ${shown(p.date)}, before the admission on ${shown(a.admittedOn)} — is that right?`);
    else if (a.dischargedOn && p.date > a.dischargedOn)
      q.push(`${what} is dated ${shown(p.date)}, after the discharge on ${shown(a.dischargedOn)} — is that right?`);
  }
  return q;
}

/** The dates a summary is checked against, from the draft's own structured fields. */
export function dateAnchors(d: DischargeDraft): DateAnchors {
  return {
    today: istDay(new Date().toISOString())!,
    // Optional chaining: a stored or partial draft may predate a field.
    admittedOn: istDay(d.encounter?.admittedAt),
    dischargedOn: istDay(d.encounter?.dischargedAt),
    procedures: (d.procedures ?? []).map((p) => ({ name: p.name, date: istDay(p.date) })),
  };
}
