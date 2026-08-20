"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { DraftSegment } from "@/lib/round-draft";

/**
 * Writes the segments the resident approved, and only those.
 *
 * An unchecked segment sends no patient, so it is skipped without any write at all. A segment
 * whose bed the resident re-pointed sends the patient they chose — the spoken bed is a
 * suggestion until somebody agrees with it.
 */
export async function applyRound(formData: FormData) {
  const dictationId = String(formData.get("dictation_id") ?? "");
  if (!dictationId) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { data: dictation } = await supabase
    .from("round_dictations")
    .select("id, ward_id, transcript, audio_path, raw, status")
    .eq("id", dictationId)
    .maybeSingle();

  if (!dictation || dictation.status !== "draft") return;

  const segments = ((dictation.raw as { segments?: DraftSegment[] } | null)?.segments ??
    []) as DraftSegment[];

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];

    if (segment.intent === "new_patient") {
      await admitPatient(formData, i, segment, dictation.ward_id, user.id, supabase);
      continue;
    }

    const patientId = String(formData.get(`patient_${i}`) ?? "");
    if (!patientId) continue;

    const { data: entry } = await supabase
      .from("entries")
      .insert({
        patient_id: patientId,
        author_id: user.id,
        source: "voice",
        // The segment, not the whole dictation: what lands on this patient's record is what
        // was said about this patient, never the sentences about the bed next door.
        transcript: segment.text,
        audio_path: dictation.audio_path,
      })
      .select("id")
      .single();

    if (!entry) continue;

    const rows = segment.observations.map((o) => ({
      entry_id: entry.id,
      patient_id: patientId,
      kind: o.kind,
      label: o.label,
      value_text: o.value_text,
      value_num: o.value_num,
      unit: o.unit,
      source_quote: o.source_quote,
      // Dictated ABOUT a bed rather than AT one, so every value carries the extra doubt of
      // having been routed: the resident was not standing in front of this patient.
      needs_confirmation: true,
      urgency: o.urgency,
      conflict_note: segment.uncertain
        ? "Dictated for the whole round and flagged as unclear — check this is the right patient."
        : null,
    }));

    if (rows.length > 0) await supabase.from("observations").insert(rows);

    revalidatePath(`/patients/${patientId}`);
  }

  await supabase
    .from("round_dictations")
    .update({ status: "applied", applied_at: new Date().toISOString() })
    .eq("id", dictationId);

  revalidatePath("/");
  revalidatePath("/ward");
  revalidatePath("/todo");
  revalidatePath("/handover");
  redirect("/ward");
}

/**
 * Admit somebody dictated into a free bed.
 *
 * Every field comes from the form rather than the draft, because the review screen shows them
 * as editable boxes — a name heard across a noisy ward is exactly the thing to correct before
 * it becomes a patient. Only bed and name are required; an age nobody said stays empty.
 */
async function admitPatient(
  formData: FormData,
  i: number,
  segment: DraftSegment,
  wardId: string,
  userId: string,
  supabase: Awaited<ReturnType<typeof createClient>>
) {
  if (String(formData.get(`admit_${i}`) ?? "") !== "yes") return;

  const bed = String(formData.get(`bed_${i}`) ?? "").trim();
  const name = String(formData.get(`name_${i}`) ?? "").trim();
  if (!bed || !name) return;

  const ageRaw = String(formData.get(`age_${i}`) ?? "").trim();
  const age = ageRaw ? Number(ageRaw) : null;
  const sex = String(formData.get(`sex_${i}`) ?? "").trim();
  const diagnosis = String(formData.get(`diagnosis_${i}`) ?? "").trim();

  // Admitted today: the app is being told about them now, and no admission date was spoken.
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });

  const { data: patient } = await supabase
    .from("patients")
    .insert({
      ward_id: wardId,
      bed,
      display_name: name,
      age_years: age !== null && Number.isInteger(age) && age >= 0 && age <= 120 ? age : null,
      sex: ["M", "F", "other"].includes(sex) ? sex : null,
      primary_diagnosis: diagnosis || null,
      admitted_on: today,
      created_by: userId,
    })
    .select("id")
    .single();

  if (!patient) return;

  // The words that admitted them, kept from the start, so the first thing on the chart is the
  // sentence it all came from.
  await supabase.from("entries").insert({
    patient_id: patient.id,
    author_id: userId,
    source: "voice",
    transcript: segment.text,
  });
}

export async function discardRound(formData: FormData) {
  const dictationId = String(formData.get("dictation_id") ?? "");
  if (!dictationId) return;

  const supabase = await createClient();
  await supabase.from("round_dictations").update({ status: "discarded" }).eq("id", dictationId);

  redirect("/ward");
}
