import { createClient } from "@/lib/supabase/server";

/**
 * Who still shows up as "discharged" — shared by the settings-list count
 * (app/unit/page.tsx) and the page itself (app/unit/discharged/page.tsx), so the two never
 * drift apart on what "discharged" means.
 *
 * A patient is visible here for one of two reasons: their discharge summary was
 * deliberately finalised (permanent), or they were discharged within the last
 * DISCHARGE_UNDO_WINDOW_HOURS and might still be undone. Past that window with nothing
 * finalised, they simply stop being asked for — see app/unit/discharged/page.tsx's own
 * comment on why that is a query filter and never a deletion.
 */
export const DISCHARGE_UNDO_WINDOW_HOURS = 48;

export function dischargeCutoffIso(): string {
  return new Date(Date.now() - DISCHARGE_UNDO_WINDOW_HOURS * 3_600_000).toISOString();
}

/** patient_id → when their summary was finalised, for every finalised summary on this ward. */
export async function getFinalisedDischargeMap(
  supabase: Awaited<ReturnType<typeof createClient>>,
  wardId: string
): Promise<Map<string, string | null>> {
  const { data } = await supabase
    .from("discharge_summaries")
    .select("patient_id, finalised_at")
    .eq("ward_id", wardId)
    .eq("status", "finalised");

  return new Map((data ?? []).map((f) => [f.patient_id as string, f.finalised_at as string | null]));
}

/** The `.or()` filter string for "saved, or still inside the undo window" — applied on top
 *  of a `patients` query already scoped to `.eq("ward_id", wardId).eq("status", "discharged")`. */
export function visibleDischargedFilter(finalisedIds: string[]): string {
  const cutoffIso = dischargeCutoffIso();
  return finalisedIds.length > 0
    ? `discharged_at.gte.${cutoffIso},id.in.(${finalisedIds.join(",")})`
    : `discharged_at.gte.${cutoffIso}`;
}
