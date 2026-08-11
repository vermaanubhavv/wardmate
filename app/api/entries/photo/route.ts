import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { readLabPhoto } from "@/lib/read-lab-photo";

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
    .select("id")
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
    kind: "lab" as const,
    label: v.label,
    value_text: v.value_text,
    value_num: v.value_num,
    unit: v.unit,
    source_quote: v.source_quote,
    // Every lab value off a photo needs confirming: these are numbers, and unlike speech
    // there is no automatic check behind them. Unclear ones say so explicitly.
    needs_confirmation: true,
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

  return NextResponse.json({
    entry_id: entry.id,
    report_type: result.report_type,
    values: result.values,
    unclear: result.values.filter((v) => v.uncertain).length,
  });
}
