/**
 * Feature flag for the whole History check.
 *
 * One gate, off by default: `NEXT_PUBLIC_HISTORY_CHECK` must equal "on". With it absent the
 * card is not rendered, the route answers 404, and no history_checks row is read or written —
 * WardMate behaves exactly as before. Same pattern as NEXT_PUBLIC_SCORING_ENGINE
 * (lib/scoring/flag.ts) minus the per-ward table, which one pilot unit does not need yet.
 */
export function historyCheckEnabled(): boolean {
  return process.env.NEXT_PUBLIC_HISTORY_CHECK === "on";
}
