import { NextResponse } from "next/server";
import { plainAiError } from "@/lib/ai-error";
import { createClient } from "@/lib/supabase/server";
import { getTranscriber, MEDICAL_VOCABULARY_HINT } from "@/lib/stt";
import { getPatientDictationKeyterms } from "@/lib/transcription/patient-context";
import { extractObservations } from "@/lib/extract";
import { correctTranscript } from "@/lib/glossary";
import { getTemplateForPatient } from "@/lib/templates";
import { getPublishedProtocolContext } from "@/lib/protocols";
import { applyProcedureDone } from "@/lib/apply-procedure-done";

/**
 * The whole voice round-trip, on the server: audio in, stored observations out.
 *
 * This route exists so the two API keys live only on Vercel's servers. The phone sends
 * audio here and gets back structured results; it never sees, and cannot be made to reveal,
 * either key.
 */
export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const form = await request.formData();
  const patientId = String(form.get("patient_id") ?? "");
  const audio = form.get("audio");

  if (!patientId) return NextResponse.json({ error: "No patient." }, { status: 400 });
  if (!(audio instanceof Blob) || audio.size === 0) {
    return NextResponse.json({ error: "No audio was recorded." }, { status: 400 });
  }

  // Confirm this doctor may write to this patient before spending money on the AI calls.
  // The database would refuse the insert anyway; this just fails earlier and cheaper.
  const { data: patient, error: patientError } = await supabase
    .from("current_patients")
    .select(
      "id, surgery_date, post_op_day, admission_day, template_family, template_variant, procedure_text"
    )
    .eq("id", patientId)
    .maybeSingle();

  if (patientError || !patient) {
    return NextResponse.json({ error: "Patient not found." }, { status: 404 });
  }

  // 1. Speech to text, then the engine's known mishearings of surgical terms — "lab chole" for
  // lap chole, "PAS" for PAC. Corrected BEFORE extraction, so a template matches the operation
  // it was meant to and the quote check still holds against the words actually stored. The raw
  // hearing goes into original_transcript below and is never thrown away.
  // Pick the ~20–50 Deepgram keyterms for THIS patient — their diagnoses, operation, drains
  // and drugs first — before the session opens. Falls back to the static ward list ([] here)
  // if anything about the patient cannot be read; the keyterm layer never blocks dictation.
  const keyterms = await getPatientDictationKeyterms(supabase, patientId);

  let transcript: string;
  let heard: string;
  let stt;
  try {
    stt = getTranscriber();
    const result = await stt.transcribe(audio, MEDICAL_VOCABULARY_HINT, {
      keyterms: keyterms.length ? keyterms : undefined,
    });
    heard = result.text;
    transcript = (await correctTranscript(heard)).text;
  } catch (e) {
    return NextResponse.json(
      { error: plainAiError(e) },
      { status: 502 }
    );
  }

  if (!transcript.trim()) {
    return NextResponse.json(
      { error: "Nothing was heard. Hold the button while speaking and try again." },
      { status: 422 }
    );
  }

  // 2. Text to structured observations, with verbatim-quote enforcement inside. The template's
  // expected labels go along so that anything the resident does mention is named consistently
  // and can be matched back — it does not license inventing the ones they skipped.
  const template = await getTemplateForPatient(patient);
  const expectedLabels = template?.items.map((i) => i.label) ?? [];
  const protocols = await getPublishedProtocolContext();

  let extraction;
  try {
    extraction = await extractObservations(transcript, expectedLabels, protocols);
  } catch (e) {
    // The transcript is worth keeping even when extraction fails — it is the evidence, and
    // the resident can still read it. Store the entry with the error recorded against it.
    const { data: entry } = await supabase
      .from("entries")
      .insert({
        patient_id: patientId,
        author_id: user.id,
        source: "voice",
        transcript,
        original_transcript: heard === transcript ? null : heard,
        stt_provider: stt.provider,
        stt_model: stt.model,
        extraction_error: e instanceof Error ? e.message : String(e),
      })
      .select("id")
      .single();

    return NextResponse.json(
      {
        entry_id: entry?.id ?? null,
        transcript,
        observations: [],
        error: "Saved what you said, but could not structure it. Tap the entry to read it.",
      },
      { status: 200 }
    );
  }

  // 3. Store the evidence.
  const { data: entry, error: entryError } = await supabase
    .from("entries")
    .insert({
      patient_id: patientId,
      author_id: user.id,
      source: "voice",
      transcript,
      // Only when the app changed something. Equal strings would just be noise behind the (i).
      original_transcript: heard === transcript ? null : heard,
      stt_provider: stt.provider,
      stt_model: stt.model,
      extraction_model: extraction.model,
      extraction_raw: extraction.raw as never,
      matched_protocol_ids: extraction.matchedProtocolIds,
    })
    .select("id")
    .single();

  if (entryError || !entry) {
    return NextResponse.json(
      { error: `Could not save: ${entryError?.message ?? "unknown error"}` },
      { status: 500 }
    );
  }

  // 4. Store the values, each tied to the entry and its quote.
  const rows = extraction.observations.map((o) => ({
    entry_id: entry.id,
    patient_id: patientId,
    kind: o.kind,
    label: o.label,
    value_text: o.value_text,
    value_num: o.value_num,
    unit: o.unit,
    source_quote: o.source_quote,
    needs_confirmation: o.needs_confirmation,
    urgency: o.urgency,
    pac_verdict: o.pac_verdict,
    conflict_note: dayConflict(o, patient),
  }));

  if (rows.length > 0) {
    const { error: obsError } = await supabase.from("observations").insert(rows);
    if (obsError) {
      return NextResponse.json(
        { entry_id: entry.id, transcript, observations: [], error: obsError.message },
        { status: 500 }
      );
    }
  }

  await applyProcedureDone(supabase, patientId, patient, extraction.observations);

  return NextResponse.json({
    entry_id: entry.id,
    transcript,
    observations: extraction.observations,
    // Surfaced rather than hidden: if the model produced values it could not point at in the
    // transcript, that is worth knowing about, not silently swallowing.
    discarded: extraction.rejected.length,
  });
}

/**
 * A spoken day number is stored as said, and flagged when it disagrees with the day computed
 * from the surgery date. Neither one silently wins — the resident decides.
 */
function dayConflict(
  o: { kind: string; value_num: number | null },
  patient: { post_op_day: number | null; admission_day: number }
): string | null {
  if (o.kind !== "day_number" || o.value_num === null) return null;

  const computed = patient.post_op_day ?? patient.admission_day;
  const label = patient.post_op_day !== null ? "post-op day" : "day of admission";

  if (Math.round(o.value_num) === computed) return null;
  return `You said day ${o.value_num}; recorded dates give ${label} ${computed}.`;
}
