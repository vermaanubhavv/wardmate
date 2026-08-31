/**
 * Feature flag for the whole scoring engine.
 *
 * TWO gates, both must be open (DOCX safety rule: "Put the complete module behind a feature
 * flag"; test 16: flag-off leaves current WardMate behaviour unchanged):
 *
 *   1. Global kill-switch — env var `NEXT_PUBLIC_SCORING_ENGINE` must equal `"on"`.
 *      Absent / anything else ⇒ the module is completely inert.
 *   2. Per-ward opt-in — a row in `ward_scoring_engine` for the ward. Lets one pilot unit
 *      run it while every other ward is untouched.
 *
 * `syncPatientPathways` and the patient-page panel both call `isScoringEngineEnabled` first
 * and do nothing when it returns false. No table is read, no card is rendered, no task made.
 */

export function scoringEngineGloballyEnabled(): boolean {
  return process.env.NEXT_PUBLIC_SCORING_ENGINE === "on";
}

import { createClient } from "@/lib/supabase/server";

/** Global switch AND this ward has opted in. */
export async function isScoringEngineEnabled(wardId: string): Promise<boolean> {
  if (!scoringEngineGloballyEnabled()) return false;
  const supabase = await createClient();
  const { data } = await supabase
    .from("ward_scoring_engine")
    .select("ward_id")
    .eq("ward_id", wardId)
    .maybeSingle();
  return Boolean(data);
}
