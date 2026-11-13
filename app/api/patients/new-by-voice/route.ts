import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { plainAiError } from "@/lib/ai-error";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth";
import { transcribe } from "@/lib/stt";
import { correctTranscript } from "@/lib/glossary";
import { readSpokenPatient } from "@/lib/read-new-patient";
import { getWardPack, getWardSpecialtyStored } from "@/lib/ward";
import { wardKeyterms } from "@/lib/transcription/patient-context";
import { listTemplateChoices, resolveProcedure } from "@/lib/templates";
import { stripPatientHonorific } from "@/lib/patients";
import { readReceipt, saveReceipt } from "@/lib/dictation-receipt";
import { istDate } from "@/lib/urgency";
import { recordedAtFrom } from "@/lib/late-dictation";
import { sameAdmission, type NewPatientResult } from "@/lib/new-patient-voice";

/**
 * A new patient spoken on the add-patient screen with no signal, sent by the outbox once the
 * signal is back. The owner's call: create the patient straight away, no draft step.
 *
 * Two guards against doubling a patient. The same recording sent twice is answered from its
 * client_uuid receipt. And an active patient on the same unit with the same bed and name is
 * not added again — the answer names them instead, for the resident to look at.
 *
 * Only what was said is stored (lib/read-new-patient.ts leaves the rest null). A recording
 * with no name or no bed cannot become a patient; the words come back so it can be typed in.
 * Every outcome is a 200 once the words are heard, so the phone deletes the audio.
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const form = await request.formData();
  const wardId = String(form.get("ward_id") ?? "");
  const audio = form.get("audio");
  const clientUuid = String(form.get("client_uuid") ?? "") || null;
  if (!wardId) return NextResponse.json({ error: "No unit." }, { status: 400 });
  if (!(audio instanceof Blob) || audio.size === 0)
    return NextResponse.json({ error: "Nothing was recorded." }, { status: 400 });

  const prior = await readReceipt(supabase, clientUuid, user.id);
  if (prior) return NextResponse.json(prior);

  const recordedAt = recordedAtFrom(form.get("recorded_at"));
  const pack = await getWardPack(wardId);

  let transcript: string;
  let spoken;
  try {
    transcript = (await correctTranscript((await transcribe(audio, wardKeyterms(pack.lexiconSpecialty))).text, pack)).text.trim();
    if (!transcript) return NextResponse.json({ error: "Nothing was heard in that recording." }, { status: 422 });
    spoken = (await readSpokenPatient(transcript, pack)).patient;
  } catch (e) {
    return NextResponse.json({ error: plainAiError(e) }, { status: 502 });
  }

  const done = async (result: NewPatientResult) => {
    await saveReceipt(supabase, clientUuid, user.id, "new-patient", result);
    return NextResponse.json(result);
  };
  const name = stripPatientHonorific(spoken.name ?? "");
  const bed = (spoken.bed ?? "").trim();
  const base = { recorded_at: recordedAt, processed_at: new Date().toISOString(), name, bed, transcript };
  if (!name || !bed) return done({ ...base, status: "incomplete" });

  const { data: onWard } = await supabase
    .from("patients")
    .select("id, display_name, bed")
    .eq("ward_id", wardId)
    .eq("status", "active");
  const match = (onWard ?? []).find((p) => sameAdmission(p, { name, bed }));
  if (match) return done({ ...base, status: "exists", patient_id: match.id as string });

  const { data: created, error } = await supabase
    .from("patients")
    .insert({
      ward_id: wardId,
      bed,
      display_name: name,
      age_years: spoken.age_years != null && Number.isInteger(spoken.age_years) && spoken.age_years >= 0 && spoken.age_years <= 120 ? spoken.age_years : null,
      sex: spoken.sex,
      primary_diagnosis: spoken.diagnosis || null,
      // The day it was said, not the day the signal came back.
      admitted_on: istDate(recordedAt),
      ...resolveProcedure(spoken.procedure ?? "", await listTemplateChoices(await getWardSpecialtyStored(wardId))),
      created_by: user.id,
    })
    .select("id")
    .single();
  // Not a 5xx: the words are in the answer, and retrying a refused insert would refuse again.
  if (error || !created) return done({ ...base, status: "failed", error: error?.message ?? "Could not add the patient." });

  revalidatePath("/");
  revalidatePath("/ward");
  return done({ ...base, status: "created", patient_id: created.id as string });
}
