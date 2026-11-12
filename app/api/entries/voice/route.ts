import { NextResponse } from "next/server";
import { plainAiError } from "@/lib/ai-error";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth";
import { STT_MODEL, STT_PROVIDER, transcribe } from "@/lib/stt";
import { getPatientDictationKeyterms } from "@/lib/transcription/patient-context";
import { extractObservations } from "@/lib/extract";
import { getWardPack } from "@/lib/ward";
import { correctTranscript } from "@/lib/glossary";
import { getTemplateForPatient } from "@/lib/templates";
import { getPublishedProtocolContext } from "@/lib/protocols";
import { ENTRY_PATIENT_COLUMNS, storeExtractedEntry } from "@/lib/store-entry";
import { readReceipt, saveReceipt } from "@/lib/dictation-receipt";
import { tagRequest, log } from "@/lib/observability";

/**
 * The whole voice round-trip, on the server: audio in, stored observations out.
 *
 * This route exists so the two API keys live only on Vercel's servers. The phone sends
 * audio here and gets back structured results; it never sees, and cannot be made to reveal,
 * either key.
 */
export async function POST(request: Request) {
  const supabase = await createClient();

  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const form = await request.formData();
  const patientId = String(form.get("patient_id") ?? "");
  const audio = form.get("audio");
  const clientUuid = String(form.get("client_uuid") ?? "") || null;

  if (!patientId) return NextResponse.json({ error: "No patient." }, { status: 400 });
  if (!(audio instanceof Blob) || audio.size === 0) {
    return NextResponse.json({ error: "No audio was recorded." }, { status: 400 });
  }

  // Already processed this exact recording (a retry after a lost connection, a duplicate from
  // the offline queue): return what it got the first time, touch nothing.
  const prior = await readReceipt(supabase, clientUuid, user.id);
  if (prior) return NextResponse.json(prior);

  // Confirm this doctor may write to this patient before spending money on the AI calls.
  // The database would refuse the insert anyway; this just fails earlier and cheaper.
  const { data: patient, error: patientError } = await supabase
    .from("current_patients")
    .select(ENTRY_PATIENT_COLUMNS)
    .eq("id", patientId)
    .maybeSingle();

  if (patientError || !patient) {
    return NextResponse.json({ error: "Patient not found." }, { status: 404 });
  }

  // Per-request context on every span, log and error from here on. ward_id only — no patient
  // id, no name (same rule as app_events).
  tagRequest({ "wardmate.route": "entries/voice", "ward.id": patient.ward_id });

  // The unit's department pack, the checklist and the published protocols: none depends on
  // what was said, so they are read while the audio is being transcribed rather than after it.
  // The no-op catches only keep an early return below from leaving a rejection unhandled; the
  // awaits still throw.
  const packP = getWardPack(patient.ward_id);
  const templateP = getTemplateForPatient(patient);
  const protocolsP = getPublishedProtocolContext();
  packP.catch(() => {});
  templateP.catch(() => {});
  protocolsP.catch(() => {});

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
  try {
    const result = await transcribe(audio, keyterms);
    heard = result.text;
    transcript = (await correctTranscript(heard, await packP)).text;
    log.info("dictation transcribed", {
      "stt.provider": STT_PROVIDER,
      "transcript.chars": transcript.length,
      "keyterms.count": keyterms.length,
      corrected: heard !== transcript,
    });
  } catch (e) {
    log.error("dictation transcription failed", { "stt.provider": STT_PROVIDER });
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
  const template = await templateP;
  const expectedLabels = template?.items.map((i) => i.label) ?? [];
  const protocols = await protocolsP;

  let extraction;
  try {
    extraction = await extractObservations(transcript, expectedLabels, protocols, (await packP).key, { name: patient.display_name, bed: patient.bed });
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
        stt_provider: STT_PROVIDER,
        stt_model: STT_MODEL,
        extraction_error: e instanceof Error ? e.message : String(e),
      })
      .select("id")
      .single();

    const body = {
      entry_id: entry?.id ?? null,
      transcript,
      observations: [],
      error: "Saved what you said, but could not structure it. Tap the entry to read it.",
    };
    // The entry is saved — a resend would duplicate it, so this counts as processed.
    await saveReceipt(supabase, clientUuid, user.id, "voice", body);
    return NextResponse.json(body, { status: 200 });
  }

  // 3. Store the evidence, then the values, each tied to the entry and its quote.
  const entryId = await storeExtractedEntry(supabase, {
    patientId,
    authorId: user.id,
    patient,
    pack: await packP,
    extraction,
    transcript,
    row: {
      source: "voice",
      transcript,
      // Only when the app changed something. Equal strings would just be noise behind the (i).
      original_transcript: heard === transcript ? null : heard,
      stt_provider: STT_PROVIDER,
      stt_model: STT_MODEL,
      extraction_model: extraction.model,
      matched_protocol_ids: extraction.matchedProtocolIds,
    },
  });
  if (entryId instanceof Response) return entryId;

  const body = {
    entry_id: entryId,
    transcript,
    observations: extraction.observations,
    // Surfaced rather than hidden: if the model produced values it could not point at in the
    // transcript, that is worth knowing about, not silently swallowing.
    discarded: extraction.rejected.length,
  };
  await saveReceipt(supabase, clientUuid, user.id, "voice", body);
  log.info("dictation stored", {
    observations: extraction.observations.length,
    discarded: extraction.rejected.length,
    "extraction.model": extraction.model,
  });
  return NextResponse.json(body);
}
