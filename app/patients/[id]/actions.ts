"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { nextUrgency, type Urgency } from "@/lib/urgency";
import { extractObservations } from "@/lib/extract";
import { getTemplateForPatient } from "@/lib/templates";

/**
 * The resident has read what was heard and stands behind it.
 *
 * Accepting the words confirms the values that came out of them in the same act, because it
 * is the same claim: these words, and therefore these numbers. Confirming them one by one
 * afterwards would be asking twice about one decision.
 */
export async function acceptEntry(formData: FormData) {
  const entryId = String(formData.get("entry_id") ?? "");
  const patientId = String(formData.get("patient_id") ?? "");
  if (!entryId) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const now = new Date().toISOString();

  await supabase
    .from("entries")
    .update({ accepted_at: now, accepted_by: user.id })
    .eq("id", entryId);

  await supabase
    .from("observations")
    .update({ confirmed_at: now, confirmed_by: user.id })
    .eq("entry_id", entryId)
    .is("confirmed_at", null);

  revalidateEverywhere(patientId);
}

/**
 * The words were misheard. Correct them, and work the values out again from the corrected
 * words.
 *
 * Nothing is patched by hand. The corrected transcript goes back through the same extraction,
 * with the same check that every value's quote appears verbatim in the text — so a value can
 * never reach the record without a sentence containing it, however it was arrived at. That is
 * why this replaces the entry's observations rather than editing them.
 *
 * What the engine originally heard is kept, so an edited entry can still be held against the
 * audio it came from.
 */
export async function editEntry(formData: FormData) {
  const entryId = String(formData.get("entry_id") ?? "");
  const patientId = String(formData.get("patient_id") ?? "");
  const corrected = String(formData.get("transcript") ?? "").trim();
  if (!entryId || !patientId || !corrected) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { data: entry } = await supabase
    .from("entries")
    .select("id, transcript, original_transcript")
    .eq("id", entryId)
    .maybeSingle();
  if (!entry) return;

  const { data: patient } = await supabase
    .from("current_patients")
    .select("id, surgery_date, post_op_day, admission_day, template_family, template_variant")
    .eq("id", patientId)
    .maybeSingle();
  if (!patient) return;

  const template = await getTemplateForPatient(patient);
  const expectedLabels = template?.items.map((i) => i.label) ?? [];

  let extraction;
  try {
    extraction = await extractObservations(corrected, expectedLabels);
  } catch {
    // Keep the correction even when structuring fails. The words are the evidence, and a
    // resident who has just fixed a mis-hearing should not lose the fix as well.
    await supabase
      .from("entries")
      .update({
        transcript: corrected,
        original_transcript: entry.original_transcript ?? entry.transcript,
        edited_at: new Date().toISOString(),
        edited_by: user.id,
      })
      .eq("id", entryId);
    revalidateEverywhere(patientId);
    return;
  }

  await supabase.from("observations").delete().eq("entry_id", entryId);

  await supabase
    .from("entries")
    .update({
      transcript: corrected,
      original_transcript: entry.original_transcript ?? entry.transcript,
      edited_at: new Date().toISOString(),
      edited_by: user.id,
      // A corrected entry is one the resident has just read word by word, so it is accepted
      // by the act of correcting it.
      accepted_at: new Date().toISOString(),
      accepted_by: user.id,
      extraction_model: extraction.model,
      extraction_raw: extraction.raw as never,
      extraction_error: null,
    })
    .eq("id", entryId);

  const rows = extraction.observations.map((o) => ({
    entry_id: entryId,
    patient_id: patientId,
    kind: o.kind,
    label: o.label,
    value_text: o.value_text,
    value_num: o.value_num,
    unit: o.unit,
    source_quote: o.source_quote,
    // Typed out by the resident just now, so the mis-hearing this exists to catch has
    // already been caught.
    needs_confirmation: false,
    confirmed_at: new Date().toISOString(),
    confirmed_by: user.id,
    urgency: o.urgency,
  }));

  if (rows.length > 0) await supabase.from("observations").insert(rows);

  revalidateEverywhere(patientId);
}

/**
 * It should not have been recorded at all — the wrong patient, a false start, a conversation
 * caught by an open microphone. Takes the entry's observations with it.
 */
export async function deleteEntry(formData: FormData) {
  const entryId = String(formData.get("entry_id") ?? "");
  const patientId = String(formData.get("patient_id") ?? "");
  if (!entryId) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("entries").delete().eq("id", entryId);

  revalidateEverywhere(patientId);
}

function revalidateEverywhere(patientId: string) {
  revalidatePath(`/patients/${patientId}`);
  revalidatePath("/todo");
  revalidatePath("/handover");
  revalidatePath("/");
}

/**
 * Correct one value by hand, where it is shown.
 *
 * The source quote is deliberately left alone. It records what was SAID, and that does not
 * change because the resident has corrected what it was taken to mean — so an edited value
 * sits beside the original words, and the (i) panel shows both. A quote rewritten to match
 * would destroy the only evidence that the two ever differed.
 *
 * Editing also confirms: the resident has just typed this value while looking at it, which is
 * a stronger check than the tap that confirming asks for.
 */
export async function updateObservation(formData: FormData) {
  const id = String(formData.get("observation_id") ?? "");
  const patientId = String(formData.get("patient_id") ?? "");
  const value = String(formData.get("value_text") ?? "").trim();
  if (!id || !patientId) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  // An emptied value deletes the observation rather than storing a blank: a value the
  // resident has cleared is one the app should never have recorded, and a row reading
  // "temperature:" with nothing after it is worse than no row.
  if (!value) {
    await supabase.from("observations").delete().eq("id", id).eq("patient_id", patientId);
  } else {
    await supabase
      .from("observations")
      .update({
        value_text: value,
        needs_confirmation: false,
        confirmed_at: new Date().toISOString(),
        confirmed_by: user.id,
      })
      .eq("id", id)
      .eq("patient_id", patientId);
  }

  revalidateEverywhere(patientId);
}

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
