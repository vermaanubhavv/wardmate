/**
 * Pure checkpoint helpers. Kept out of `store.ts` so the single-execution rule (DOCX test 11)
 * and the timezone-safe due-time computation (test 18) can be unit-tested without a database.
 */

import type { Checkpoint, Instant } from "./types";

/** Absolute due instant for a checkpoint, measured from the admission instant. */
export function checkpointDueInstant(admission: Instant, cp: Pick<Checkpoint, "dueAtHours">): Instant {
  return new Date(Date.parse(admission) + cp.dueAtHours * 3_600_000).toISOString();
}

export type CheckpointRow = { checkpointKey: string; dueAt: Instant; executedAt: Instant | null };

/**
 * The checkpoints that should run now: due time reached AND not already executed. A row with
 * `executedAt` set is never returned again — so a 48-hour checkpoint fires exactly once, no
 * matter how often the patient page is opened or the cron backstop runs.
 */
export function dueCheckpoints(rows: CheckpointRow[], now: Instant): CheckpointRow[] {
  const t = Date.parse(now);
  return rows.filter((r) => r.executedAt == null && Date.parse(r.dueAt) <= t);
}

export function isCheckpointDue(row: CheckpointRow, now: Instant): boolean {
  return row.executedAt == null && Date.parse(row.dueAt) <= Date.parse(now);
}
