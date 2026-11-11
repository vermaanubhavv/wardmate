/**
 * Feature flag for the whole History check.
 *
 * One gate, ON by default since the paper-replacement phase made the differentials a visible
 * part of the History tab: `NEXT_PUBLIC_HISTORY_CHECK=off` turns the whole thing off — the card
 * is not rendered, the route answers 404, and no history_checks row is read or written. Same
 * pattern as NEXT_PUBLIC_SCORING_ENGINE (lib/scoring/flag.ts) minus the per-ward table.
 */
export function historyCheckEnabled(): boolean {
  return process.env.NEXT_PUBLIC_HISTORY_CHECK !== "off";
}
