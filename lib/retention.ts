/**
 * How long WardMate keeps a patient after discharge.
 *
 * WardMate is a documentation and clinical tool, not the medical record — the hospital's file
 * or HMIS is. So a discharged patient is kept only long enough to cover follow-up visits and
 * readmissions, then deleted with everything recorded about them (the owner's decision,
 * 2026-11-25; DPDP: hold no personal data past its purpose). The daily job that does it is
 * app/api/cron/retention/route.ts.
 */
export const DISCHARGE_RETENTION_DAYS = 90;

/** A patient discharged before this moment is past retention. */
export function retentionCutoffIso(now: Date = new Date()): string {
  return new Date(now.getTime() - DISCHARGE_RETENTION_DAYS * 86_400_000).toISOString();
}

/** Whole days left before a discharged patient is deleted; 0 once due. */
export function daysUntilDeletion(dischargedAt: string, now: Date = new Date()): number {
  const due = new Date(dischargedAt).getTime() + DISCHARGE_RETENTION_DAYS * 86_400_000;
  return Math.max(0, Math.ceil((due - now.getTime()) / 86_400_000));
}
