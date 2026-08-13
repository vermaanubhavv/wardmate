"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { nextUrgency, type Urgency } from "@/lib/urgency";

/** Confirm the ones that were ticked. Nothing ticked writes nothing. */
export async function confirmChecked(formData: FormData) {
  const ids = formData.getAll("observation_ids").map(String).filter(Boolean);
  const patientId = String(formData.get("patient_id") ?? "");
  if (ids.length === 0) return;

  await confirmIds(ids, patientId);
}

/**
 * Confirm everything outstanding on this patient.
 *
 * Reads the ids from the database rather than the form, so it means "everything outstanding
 * now" — including anything that arrived while the screen was open, and unaffected by which
 * boxes happen to be ticked.
 */
export async function confirmAll(formData: FormData) {
  const patientId = String(formData.get("patient_id") ?? "");
  if (!patientId) return;

  const supabase = await createClient();
  const { data: pending } = await supabase
    .from("observations")
    .select("id")
    .eq("patient_id", patientId)
    .eq("needs_confirmation", true)
    .is("confirmed_at", null);

  const ids = (pending ?? []).map((o) => o.id);
  if (ids.length === 0) return;

  await confirmIds(ids, patientId);
}

async function confirmIds(ids: string[], patientId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  // Scoped to the patient as well as the ids: a tampered form cannot reach a confirmation on
  // somebody else's record. Row security would refuse a patient outside this doctor's wards
  // anyway, but this keeps one screen's Accept to one patient.
  await supabase
    .from("observations")
    .update({ confirmed_at: new Date().toISOString(), confirmed_by: user.id })
    .in("id", ids)
    .eq("patient_id", patientId);

  revalidatePath(`/patients/${patientId}`);
  revalidatePath("/todo");
  revalidatePath("/handover");
  revalidatePath("/");
}

/**
 * Cycle a job's colour by hand. Records that a person set it, so the grade a doctor stands
 * behind is distinguishable from the one read out of a sentence.
 */
export async function cycleUrgency(formData: FormData) {
  const id = String(formData.get("observation_id") ?? "");
  const patientId = String(formData.get("patient_id") ?? "");
  const current = String(formData.get("current") ?? "") || null;
  if (!id) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const next = nextUrgency(current as Urgency);

  await supabase
    .from("observations")
    .update({
      urgency: next,
      graded_by: user.id,
      graded_at: new Date().toISOString(),
    })
    .eq("id", id);

  revalidatePath(`/patients/${patientId}`);
  revalidatePath("/todo");
  revalidatePath("/");
}

/** Tick a job off. The plan itself is kept — only its done state changes. */
export async function completeTask(formData: FormData) {
  await setTaskDone(formData, true);
}

/** Put it back on the list, for when something was ticked in error. */
export async function reopenTask(formData: FormData) {
  await setTaskDone(formData, false);
}

async function setTaskDone(formData: FormData, done: boolean) {
  const id = String(formData.get("observation_id") ?? "");
  const patientId = String(formData.get("patient_id") ?? "");
  if (!id) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("observations")
    .update(
      done
        ? { done_at: new Date().toISOString(), done_by: user.id }
        : { done_at: null, done_by: null }
    )
    .eq("id", id);

  revalidatePath(`/patients/${patientId}`);
  revalidatePath("/todo");
  revalidatePath("/");
}
