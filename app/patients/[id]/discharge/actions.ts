"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { searchFormulary } from "@/lib/formulary";

/**
 * Look up candidate formulary entries for a drug, for a clinician to choose between.
 *
 * Returns candidates and nothing else — no "best" one, no auto-selection, not even a
 * highlighted suggestion. See lib/formulary.ts for the measured reason: on this hospital's real
 * formulary, nearest-text matching picks a combination product over the plain drug most of the
 * time, and the wrong one reads perfectly plausibly on a discharge summary.
 */
export async function findFormularyOptions(wardId: string, query: string): Promise<string[]> {
  if (!wardId || !query.trim()) return [];
  return searchFormulary(wardId, query);
}

/**
 * Remember that this drug means this formulary entry, for this ward.
 *
 * Written only from a clinician's own tap on a named entry. Upserted on (ward, drug) so
 * correcting a mapping later replaces it rather than leaving two.
 */
export async function confirmFormularyMapping(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const wardId = String(formData.get("ward_id") ?? "");
  const patientId = String(formData.get("patient_id") ?? "");
  const key = String(formData.get("drug_key") ?? "").trim();
  const itemText = String(formData.get("item_text") ?? "").trim();
  if (!wardId || !key || !itemText) return;

  await supabase
    .from("medication_formulary_map")
    .upsert(
      { ward_id: wardId, drug_key: key, item_text: itemText, confirmed_by: user.id, confirmed_at: new Date().toISOString() },
      { onConflict: "ward_id,drug_key" }
    );

  if (patientId) revalidatePath(`/patients/${patientId}/discharge`);
}

/** Undo a mapping — whoever spots that a drug is linked to the wrong entry can clear it,
 *  not only whoever first confirmed it. */
export async function clearFormularyMapping(formData: FormData) {
  const supabase = await createClient();
  const wardId = String(formData.get("ward_id") ?? "");
  const patientId = String(formData.get("patient_id") ?? "");
  const key = String(formData.get("drug_key") ?? "").trim();
  if (!wardId || !key) return;

  await supabase
    .from("medication_formulary_map")
    .delete()
    .eq("ward_id", wardId)
    .eq("drug_key", key);

  if (patientId) revalidatePath(`/patients/${patientId}/discharge`);
}
