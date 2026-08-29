/**
 * The lookup key for a drug: short, lowercased, punctuation-free, so "T. Pan" and "pan" and
 * "Pan." all reach the same confirmed mapping. Deliberately built from extraction's own drug
 * LABEL rather than the whole dictated phrase, which carries dose and route too.
 *
 * Its own file, away from lib/formulary.ts, because that module opens a server-side Supabase
 * client at import time — and this pure function is needed by lib/discharge.ts, which the
 * discharge sheet renders from in the browser for a one-off summary. A client component
 * importing it used to drag the whole server client in behind it.
 */
export function drugKey(label: string): string {
  return label
    .toLowerCase()
    .replace(/\b(tab|tabs|t|cap|caps|c|syp|syrup|inj|injection|mdi|oint|ointment)\b\.?/g, " ")
    .replace(/[^a-z0-9 ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
