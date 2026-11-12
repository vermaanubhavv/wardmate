import { NextResponse } from "next/server";
import { plainAiError } from "@/lib/ai-error";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth";
import { STT_MODEL, STT_PROVIDER, transcribe } from "@/lib/stt";
import { getPatientDictationKeyterms } from "@/lib/transcription/patient-context";
import { correctTranscript } from "@/lib/glossary";
import { readCaseSheet } from "@/lib/read-case-sheet";
import { extractObservations } from "@/lib/extract";
import { claimPhotoRead } from "@/lib/photo-cap";
import { getWardPack } from "@/lib/ward";
import { getTemplateForPatient } from "@/lib/templates";
import { ENTRY_PATIENT_COLUMNS, storeExtractedEntry } from "@/lib/store-entry";
import { readReceipt, saveReceipt } from "@/lib/dictation-receipt";
import { readImage } from "@/lib/image-upload";
import type { ImageType } from "@/lib/model";

/**
 * The admission clerking note, in — by photo or by dictation — structured observations out.
 *
 * Both branches converge on the exact pipeline every other entry uses: correctTranscript, then
 * extractObservations with its verbatim-quote enforcement, then the same observations table.
 * That reuse is the whole point, not a shortcut — see lib/read-case-sheet.ts for why. A plan
 * stated in the case history ("for appendicectomy tomorrow", "start antibiotics") lands as a
 * real plan observation exactly the way a spoken one would, which is what puts it on the to-do
 * list rather than leaving it sitting unread inside a document.
 *
 * The only marker distinguishing this from an ordinary entry is is_case_history — see
 * supabase/patches/0030_case_history.sql. Everything else about how it is captured, checked
 * and stored is identical to a round note.
 */
export async function POST(request: Request) {
  const supabase = await createClient();

  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const form = await request.formData();
  const patientId = String(form.get("patient_id") ?? "");
  const photo = form.get("photo");
  const audio = form.get("audio");
  const clientUuid = String(form.get("client_uuid") ?? "") || null;

  if (!patientId) return NextResponse.json({ error: "No patient." }, { status: 400 });
  if (!(photo instanceof Blob) && !(audio instanceof Blob)) {
    return NextResponse.json(
      { error: "Nothing was photographed or recorded." },
      { status: 400 }
    );
  }

  const { data: patient, error: patientError } = await supabase
    .from("current_patients")
    .select(ENTRY_PATIENT_COLUMNS)
    .eq("id", patientId)
    .maybeSingle();

  if (patientError || !patient) {
    return NextResponse.json({ error: "Patient not found." }, { status: 404 });
  }

  // Already processed this exact recording — a retry, or a duplicate from the offline queue.
  const prior = await readReceipt(supabase, clientUuid, user.id);
  if (prior) return NextResponse.json(prior);

  // The unit's department, for the dictation prompt. Started here and awaited at the
  // extraction call so it overlaps the speech-to-text step. Null — and so general surgery —
  // on any database without patch 0060.
  const packP = getWardPack(patient.ward_id);

  const template = await getTemplateForPatient(patient);
  // The sections a clerking note is written in, so that when the resident dictates one it is
  // stored under the name the case-history card looks for — see lib/case-history.ts. This
  // constrains NAMING only, exactly as the template labels do: a section nobody mentioned must
  // simply be absent, and the card then says NR for it rather than the extractor inventing one.
  const HISTORY_SECTIONS = [
    "chief complaints",
    "history of presenting illness",
    "past history",
    "family history",
    "medication history",
    "surgical history",
    "menstrual and obstetric history",
  ];
  const expectedLabels = [...(template?.items.map((i) => i.label) ?? []), ...HISTORY_SECTIONS];

  // Everything from here shares one shape regardless of how the transcript was obtained, so
  // the two branches below only have to produce { transcript, insertFields, forceConfirm } and
  // hand off to this.
  let transcript: string;
  let insertFields: Record<string, unknown>;
  let forceConfirm: boolean;
  let image: { mediaType: ImageType; ext: string; bytes: Buffer } | null = null;

  if (photo instanceof Blob) {
    const checked = await readImage(photo);
    if (checked instanceof Response) return checked;
    image = checked;
    const capped = await claimPhotoRead(supabase, patient.ward_id);
    if (capped) return NextResponse.json({ error: capped }, { status: 429 });

    let read;
    try {
      read = await readCaseSheet(image.bytes.toString("base64"), image.mediaType, await packP);
    } catch (e) {
      return NextResponse.json(
        { error: plainAiError(e) },
        { status: 502 }
      );
    }

    if (!read.transcript.trim()) {
      return NextResponse.json(
        { error: "Nothing legible was found on that photo." },
        { status: 422 }
      );
    }

    transcript = read.transcript;
    // Nothing on the server can re-read the photograph, so unlike a spoken transcript there is
    // no automatic check behind this text — the same reason app/api/entries/photo/route.ts
    // marks a lab photo's values for confirmation. Every value from this path needs a human's
    // eyes against the original, not only the ones that would normally ask for it.
    forceConfirm = true;
    insertFields = {
      source: "photo",
      extraction_model: read.model,
    };
  } else {
    const audioBlob = audio as Blob;
    if (audioBlob.size === 0) {
      return NextResponse.json({ error: "No audio was recorded." }, { status: 400 });
    }

    const keyterms = await getPatientDictationKeyterms(supabase, patientId, {
      noteType: "case-history",
    });

    let heard: string;
    try {
      const result = await transcribe(audioBlob, keyterms);
      heard = result.text;
    } catch (e) {
      return NextResponse.json(
        { error: plainAiError(e) },
        { status: 502 }
      );
    }

    const corrected = await correctTranscript(heard, await packP);
    transcript = corrected.text;

    if (!transcript.trim()) {
      return NextResponse.json(
        { error: "Nothing was heard. Hold the button while speaking and try again." },
        { status: 422 }
      );
    }

    forceConfirm = false;
    insertFields = {
      source: "voice",
      original_transcript: heard === transcript ? null : heard,
      stt_provider: STT_PROVIDER,
      stt_model: STT_MODEL,
    };
  }

  let extraction;
  try {
    extraction = await extractObservations(transcript, expectedLabels, [], (await packP).key, { name: patient.display_name, bed: patient.bed });
  } catch (e) {
    // The transcript is the evidence even when structuring fails, exactly as for a round note.
    const { data: entry } = await supabase
      .from("entries")
      .insert({
        patient_id: patientId,
        author_id: user.id,
        is_case_history: true,
        transcript,
        ...insertFields,
        extraction_error: e instanceof Error ? e.message : String(e),
      })
      .select("id")
      .single();

    const body = {
      entry_id: entry?.id ?? null,
      transcript,
      observations: [],
      error: "Saved the case history, but could not structure it. Open it to read the words.",
    };
    await saveReceipt(supabase, clientUuid, user.id, "case-history", body);
    return NextResponse.json(body);
  }

  const evidence = image; // const, so the callback below keeps the narrowing
  const entryId = await storeExtractedEntry(supabase, {
    patientId,
    authorId: user.id,
    patient,
    pack: await packP,
    extraction,
    transcript,
    row: { is_case_history: true, transcript, ...insertFields },
    observationOpts: { forceConfirm },
    // The photo itself, kept as evidence for exactly the reason lab photos are — see the branch
    // above. Uploaded after the entry exists so the stored file can be named after it.
    afterInsert: async (id) => {
      if (!evidence) return;
      const path = `${patientId}/${id}.${evidence.ext}`;
      const { error: uploadError } = await supabase.storage
        .from("evidence")
        .upload(path, evidence.bytes, { contentType: evidence.mediaType, upsert: false });

      if (!uploadError) {
        await supabase.from("entries").update({ photo_path: path }).eq("id", id);
      }
      // A failed upload does not fail the request — the transcript and its observations are
      // already saved, which is the part that feeds the to-do list. The photo is corroborating
      // evidence, not the record itself.
    },
  });
  if (entryId instanceof Response) return entryId;

  const body = {
    entry_id: entryId,
    transcript,
    observations: extraction.observations,
    discarded: extraction.rejected.length,
  };
  await saveReceipt(supabase, clientUuid, user.id, "case-history", body);
  return NextResponse.json(body);
}
