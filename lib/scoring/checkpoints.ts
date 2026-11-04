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

/**
 * Whether a patient's pathways need recomputing on this open of the page.
 *
 * Recomputing is the expensive part of a sync (several queries per open pathway), so it runs
 * only when something could have changed its answer: an observation was written, edited or
 * removed since the last compute (`changedAt`, stamped by the database — patch 0111), a
 * checkpoint has fallen due, or the caller knows better (`force`, after a clinician's own
 * scoring edit). Without the marker (a database before 0111) it always recomputes, as before.
 */
export function needsRecompute(a: {
  force: boolean;
  changedAt: Instant | null | undefined;
  instances: { updated_at: Instant; next_checkpoint_at: Instant | null }[];
  now: Instant;
}): boolean {
  if (a.force || a.changedAt === undefined) return true;
  const t = Date.parse(a.now);
  return a.instances.some(
    (i) =>
      (a.changedAt != null && Date.parse(a.changedAt) > Date.parse(i.updated_at)) ||
      (i.next_checkpoint_at != null && Date.parse(i.next_checkpoint_at) <= t)
  );
}
