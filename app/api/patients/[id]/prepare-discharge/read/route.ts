import { NextResponse } from "next/server";
import { plainAiError } from "@/lib/ai-error";
import { createClient } from "@/lib/supabase/server";
import { readPaper } from "@/lib/read-paper";
import { readLabPhoto } from "@/lib/read-lab-photo";

const ALLOWED_IMAGE = ["image/jpeg", "image/png", "image/webp"] as const;
const MAX_PHOTO_BYTES = 12 * 1024 * 1024;

/**
 * Read ONE page of a patient's file and say what is on it. Stores nothing.
 *
 * Reading and storing are two requests on purpose. The resident sees what each photograph
 * produced — and what it could not read — and corrects the kind before any of it enters the
 * record. A misread page caught here is a tap; caught later it is a wrong line in a document
 * that has gone home with a patient.
 *
 * One photo per request rather than the whole pile in one, so a page that fails to read fails
 * alone, the ones already done stay done, and the screen can show progress rather than a
 * spinner over a minute of silence.
 *
 * The photo IS uploaded here, under the patient's own folder, and its path handed back. The
 * store request attaches that path to the entry it creates. An abandoned review therefore
 * leaves an orphan image in the bucket and nothing in the record — the safe direction: a
 * photograph nobody references costs storage, whereas an observation with no photograph
 * behind it costs the thing this app exists to prevent.
 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: patientId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  // Row security decides whether this doctor may see the patient at all; a patient they are
  // not on the ward for simply is not found.
  const { data: patient } = await supabase
    .from("current_patients")
    .select("id")
    .eq("id", patientId)
    .maybeSingle();
  if (!patient) return NextResponse.json({ error: "Patient not found." }, { status: 404 });

  const form = await request.formData();
  const photo = form.get("photo");

  if (!(photo instanceof Blob) || photo.size === 0) {
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
  const base64 = bytes.toString("base64");

  let read;
  try {
    read = await readPaper(base64, mediaType);
  } catch (e) {
    return NextResponse.json(
      { error: plainAiError(e) },
      { status: 502 }
    );
  }

  // A lab report is read a second time by the reader built for it. That one returns each value
  // with the reference range PRINTED BESIDE IT on the page, which no transcript can carry and
  // no table this app ships could be as authoritative about — same laboratory, same assay,
  // same page as the number. See lib/read-lab-photo.ts.
  let labValues: Awaited<ReturnType<typeof readLabPhoto>>["values"] | null = null;
  if (read.kind === "lab_report") {
    try {
      labValues = (await readLabPhoto(base64, mediaType)).values;
    } catch {
      // Fall back to the transcript. A lab report that would not parse is still a page of
      // numbers the resident can read, and saying nothing about it would be worse.
      labValues = null;
    }
  }

  const ext = mediaType === "image/png" ? "png" : mediaType === "image/webp" ? "webp" : "jpg";
  const path = `${patientId}/prep-${crypto.randomUUID()}.${ext}`;
  const { error: uploadError } = await supabase.storage
    .from("evidence")
    .upload(path, bytes, { contentType: mediaType, upsert: false });

  return NextResponse.json({
    kind: read.kind,
    kindConfidence: read.kindConfidence,
    transcript: read.transcript,
    unreadable: read.unreadable,
    procedure: read.procedure,
    surgeryDate: read.surgeryDate,
    model: read.model,
    labValues,
    // Null when the upload failed. The page can still be stored; it simply has no photograph
    // behind it, and the review screen says so.
    photoPath: uploadError ? null : path,
    photoError: uploadError ? uploadError.message : null,
  });
}
