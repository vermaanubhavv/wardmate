"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { nextUrgency, type Urgency } from "@/lib/urgency";

/** One-tap confirmation of a number, drug or dose the app flagged as worth checking. */
export async function confirmObservation(formData: FormData) {
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
    .update({ confirmed_at: new Date().toISOString(), confirmed_by: user.id })
    .eq("id", id);

  revalidatePath(`/patients/${patientId}`);
  revalidatePath("/todo");
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
