"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { historyCheckEnabled } from "@/lib/history-check/flag";
import { SLOT_STATES, type SlotState } from "@/lib/history-check/types";
import type { Resolutions } from "@/lib/history-check/store";

/**
 * The resident's own answers to what the check flagged. A resolution is written beside the
 * run, never over it: the model's output and the validator's verdict stay as stored, and the
 * card overlays the tap on read (applyResolutions). Nothing here touches observations.
 *
 * Read-modify-write on the jsonb: one resident resolving two things quickly must not lose
 * the first tap. RLS limits both the read and the update to ward members.
 */
async function updateResolutions(
  runId: string,
  patientId: string,
  patch: (current: Resolutions, userId: string, now: string) => Resolutions
): Promise<{ error?: string }> {
  if (!historyCheckEnabled()) return { error: "History check is not enabled." };
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

  const { data: row } = await supabase
    .from("history_checks")
    .select("id, resolutions")
    .eq("id", runId)
    .eq("patient_id", patientId)
    .maybeSingle();
  if (!row) return { error: "That check no longer exists." };

  const next = patch((row.resolutions as Resolutions | null) ?? {}, user.id, new Date().toISOString());
  const { error } = await supabase.from("history_checks").update({ resolutions: next }).eq("id", runId);
  if (error) return { error: "Could not save. Try again." };
  revalidatePath(`/patients/${patientId}`);
  return {};
}

/** "Present" / "Explicitly absent" / "Not asked" for a slot in conflict — or dismiss the flag. */
export async function resolveHistorySlot(formData: FormData): Promise<{ error?: string }> {
  const runId = String(formData.get("run_id") ?? "");
  const patientId = String(formData.get("patient_id") ?? "");
  const slotId = String(formData.get("slot_id") ?? "");
  const state = String(formData.get("state") ?? "");
  if (!runId || !patientId || !/^[a-z][a-z0-9_]*$/.test(slotId)) return { error: "Malformed request." };
  if (state !== "dismiss" && !(SLOT_STATES as readonly string[]).includes(state)) return { error: "Malformed request." };

  return updateResolutions(runId, patientId, (cur, by, at) => ({
    ...cur,
    [slotId]: state === "dismiss" ? { dismissed: true, at, by } : { state: state as SlotState, at, by },
  }));
}

/** The resident has read the flagged sentence and confirms the dictation is this patient's. */
export async function dismissWrongPatient(formData: FormData): Promise<{ error?: string }> {
  const runId = String(formData.get("run_id") ?? "");
  const patientId = String(formData.get("patient_id") ?? "");
  if (!runId || !patientId) return { error: "Malformed request." };
  return updateResolutions(runId, patientId, (cur, by, at) => ({ ...cur, wrong_patient: { dismissed: true, at, by } }));
}
