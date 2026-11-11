/**
 * A checklist gap said the way a senior says it on the round: "POD 3 lap chole — drain
 * removal, suture removal not documented". Nothing here decides WHAT is a gap — that is the
 * template and its POD/day triggers (lib/checklist-triggers.ts); this only puts the day, the
 * operation and the missing items into one sentence. Empty when nothing is missing.
 */
export function nudgeSentence(day: string, procedure: string | null, missing: string[]): string | null {
  if (missing.length === 0) return null;
  const who = [day, procedure].filter(Boolean).join(" ");
  const what = missing.map((m) => m.charAt(0).toLowerCase() + m.slice(1)).join(", ");
  return `${who} — ${what} not documented`;
}
