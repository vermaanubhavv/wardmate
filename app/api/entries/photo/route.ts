import { NextResponse } from "next/server";
import { plainAiError } from "@/lib/ai-error";
import { createClient } from "@/lib/supabase/server";
import { readLabPhoto } from "@/lib/read-lab-photo";
import { canonicalLabName } from "@/lib/lab-ranges";

const ALLOWED = ["image/jpeg", "image/png", "image/webp"] as const;
const MAX_BYTES = 12 * 1024 * 1024;

/**
 * Photograph of a lab report in, stored values out.
 *
 * A note on the verification guarantee, because it is weaker here than for voice. For a
 * spoken note the server can check that every quote really is a span of the transcript, so an
 * invented value cannot survive. There is no equivalent check against an image — nothing on
 * the server can re-read the photograph. So the photo itself is kept as the evidence and
 * shown beside every value it produced, and anything the model reports as unclear is flagged
 * for confirmation. Verification here is your eyes on the original, not an automatic test.
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

  if (!patientId) return NextResponse.json({ error: "No patient." }, { status: 400 });
  if (!(photo instanceof Blob) || photo.size === 0) {
    return NextResponse.json({ error: "No photo was received." }, { status: 400 });
  }
  if (photo.size > MAX_BYTES) {
    return NextResponse.json({ error: "That photo is too large." }, { status: 413 });
  }

  const mediaType = ALLOWED.find((t) => photo.type === t);
  if (!mediaType) {
    return NextResponse.json(
      { error: `Unsupported image type (${photo.type || "unknown"}).` },
      { status: 415 }
    );
  }

  const { data: patient } = await supabase
    .from("current_patients")
    .select("id, ward_id")
    .eq("id", patientId)
    .maybeSingle();
  if (!patient) return NextResponse.json({ error: "Patient not found." }, { status: 404 });

  // Create the entry first so the stored file can be named after it, keeping the photo and
  // the record that points at it tied together by construction.
  const { data: entry, error: entryError } = await supabase
    .from("entries")
    .insert({ patient_id: patientId, author_id: user.id, source: "photo" })
    .select("id")
    .single();

  if (entryError || !entry) {
    return NextResponse.json(
      { error: `Could not save: ${entryError?.message ?? "unknown error"}` },
      { status: 500 }
    );
  }

  const ext = mediaType === "image/png" ? "png" : mediaType === "image/webp" ? "webp" : "jpg";
  const path = `${patientId}/${entry.id}.${ext}`;
  const bytes = Buffer.from(await photo.arrayBuffer());

  const { error: uploadError } = await supabase.storage
    .from("evidence")
    .upload(path, bytes, { contentType: mediaType, upsert: false });

  if (uploadError) {
    return NextResponse.json(
      { error: `Could not store the photo: ${uploadError.message}` },
      { status: 500 }
    );
  }

  await supabase.from("entries").update({ photo_path: path }).eq("id", entry.id);

  // Read it.
  let result;
  try {
    result = await readLabPhoto(bytes.toString("base64"), mediaType);
  } catch (e) {
    await supabase
      .from("entries")
      .update({ extraction_error: e instanceof Error ? e.message : String(e) })
      .eq("id", entry.id);

    return NextResponse.json({
      entry_id: entry.id,
      values: [],
      error: "Photo saved, but it could not be read. You can still open it from the record.",
    });
  }

  await supabase
    .from("entries")
    .update({ extraction_model: result.model, extraction_raw: result.raw as never })
    .eq("id", entry.id);

  const rows = result.values.map((v) => ({
    entry_id: entry.id,
    patient_id: patientId,
    // A bedside sign off an obs chart / monitor is stored as a vital, so it lands on the
    // vitals line of the note and the ward screen rather than under lab results.
    kind: v.category === "vital" ? ("vital" as const) : ("lab" as const),
    label: v.label,
    value_text: v.value_text,
    value_num: v.value_num,
    unit: v.unit,
    source_quote: v.source_quote,
    // Every lab value off a photo needs confirming: these are numbers, and unlike speech
    // there is no automatic check behind them. Unclear ones say so explicitly.
    needs_confirmation: true,
    // The range as printed beside this very result. More authoritative than any table this app
    // could ship — it is this laboratory, this assay, the same page as the number.
    ref_low: v.ref_low,
    ref_high: v.ref_high,
    ref_text: v.ref_text,
    conflict_note: v.uncertain ? "Printing was unclear — check against the photo." : null,
  }));

  if (rows.length > 0) {
    const { error: obsError } = await supabase.from("observations").insert(rows);
    if (obsError) {
      return NextResponse.json(
        { entry_id: entry.id, values: [], error: obsError.message },
        { status: 500 }
      );
    }
  }

  // Teach the ward its own laboratory's ranges, so a result dictated on a round — with no
  // report to read — can still be judged against what this lab actually uses. Each sighting is
  // a vote rather than an overwrite; see supabase/patches/0043_lab_reference_ranges.sql.
  //
  // Deliberately excludes anything the model flagged as unclear: a range misread off a blurred
  // photograph must not be allowed to teach the ward something wrong. Failures here are
  // swallowed on purpose — the values are already saved, and a lost vote is not worth failing
  // an upload the resident is standing at a bedside waiting for.
  const teachable = result.values.filter(
    (v) => v.category === "lab" && !v.uncertain && v.ref_low !== null && v.ref_high !== null
  );
  if (teachable.length > 0 && patient.ward_id) {
    await Promise.allSettled(
      teachable.map((v) =>
        supabase.rpc("record_lab_range", {
          _ward: patient.ward_id,
          _analyte: canonicalLabName(v.label),
          _unit: v.unit ?? "",
          _low: v.ref_low,
          _high: v.ref_high,
          _text: v.ref_text,
        })
      )
    );
  }

  return NextResponse.json({
    entry_id: entry.id,
    report_type: result.report_type,
    values: result.values,
    unclear: result.values.filter((v) => v.uncertain).length,
  });
}
