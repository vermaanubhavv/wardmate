import { NextResponse } from "next/server";
import { plainAiError } from "@/lib/ai-error";
import { createClient } from "@/lib/supabase/server";
import { getTranscriber, MEDICAL_VOCABULARY_HINT } from "@/lib/stt";
import { correctTranscript } from "@/lib/glossary";
import { readCaseSheet } from "@/lib/read-case-sheet";
import { extractObservations } from "@/lib/extract";
import { getTemplateForPatient } from "@/lib/templates";
import { applyProcedureDone } from "@/lib/apply-procedure-done";

const ALLOWED_IMAGE = ["image/jpeg", "image/png", "image/webp"] as const;
const MAX_PHOTO_BYTES = 12 * 1024 * 1024;

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

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const form = await request.formData();
  const patientId = String(form.get("patient_id") ?? "");
  const photo = form.get("photo");
  const audio = form.get("audio");

  if (!patientId) return NextResponse.json({ error: "No patient." }, { status: 400 });
  if (!(photo instanceof Blob) && !(audio instanceof Blob)) {
    return NextResponse.json(
      { error: "Nothing was photographed or recorded." },
      { status: 400 }
    );
  }

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

  if (photo instanceof Blob) {
    if (photo.size === 0) {
      return NextResponse.json({ error: "No photo was received." }, { status: 400 });
    }
    if (photo.size > MAX_PHOTO_BYTES) {
      return NextResponse.json({ error: "That photo is too large." }, { status: 413 });
    }
    const mediaType = ALLOWED_IMAGE.find((t) => photo.type === t);
    if (!mediaType) {
      return NextResponse.json(
        { error: `Unsupported image type (${photo.type || "unknown"}).` },
        { status: 415 }
      );
    }

    const bytes = Buffer.from(await photo.arrayBuffer());

    let read;
    try {
      read = await readCaseSheet(bytes.toString("base64"), mediaType);
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

    let heard: string;
    let stt;
    try {
      stt = getTranscriber();
      const result = await stt.transcribe(audioBlob, MEDICAL_VOCABULARY_HINT);
      heard = result.text;
    } catch (e) {
      return NextResponse.json(
        { error: plainAiError(e) },
        { status: 502 }
      );
    }

    const corrected = await correctTranscript(heard);
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
      stt_provider: stt.provider,
      stt_model: stt.model,
    };
  }

  let extraction;
  try {
    extraction = await extractObservations(transcript, expectedLabels);
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

    return NextResponse.json({
      entry_id: entry?.id ?? null,
      transcript,
      observations: [],
      error: "Saved the case history, but could not structure it. Open it to read the words.",
    });
  }

  const { data: entry, error: entryError } = await supabase
    .from("entries")
    .insert({
      patient_id: patientId,
      author_id: user.id,
      is_case_history: true,
      transcript,
      ...insertFields,
      extraction_raw: extraction.raw as never,
    })
    .select("id")
    .single();

  if (entryError || !entry) {
    return NextResponse.json(
      { error: `Could not save: ${entryError?.message ?? "unknown error"}` },
      { status: 500 }
    );
  }

  // The photo itself, kept as evidence for exactly the reason lab photos are — see the branch
  // above. Uploaded after the entry exists so the stored file can be named after it.
  if (photo instanceof Blob) {
    const mediaType = ALLOWED_IMAGE.find((t) => photo.type === t)!;
    const ext = mediaType === "image/png" ? "png" : mediaType === "image/webp" ? "webp" : "jpg";
    const path = `${patientId}/${entry.id}.${ext}`;
    const bytes = Buffer.from(await photo.arrayBuffer());

    const { error: uploadError } = await supabase.storage
      .from("evidence")
      .upload(path, bytes, { contentType: mediaType, upsert: false });

    if (!uploadError) {
      await supabase.from("entries").update({ photo_path: path }).eq("id", entry.id);
    }
    // A failed upload does not fail the request — the transcript and its observations are
    // already saved, which is the part that feeds the to-do list. The photo is corroborating
    // evidence, not the record itself.
  }

  const rows = extraction.observations.map((o) => ({
    entry_id: entry.id,
    patient_id: patientId,
    kind: o.kind,
    label: o.label,
    value_text: o.value_text,
    value_num: o.value_num,
    unit: o.unit,
    source_quote: o.source_quote,
    needs_confirmation: forceConfirm || o.needs_confirmation,
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
    discarded: extraction.rejected.length,
  });
}

/** Same rule as every other entry point: a day the resident stated is checked against the
 *  dates already on record, and shown as a disagreement rather than overwritten by either. */
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
