import { NextResponse } from "next/server";
import { plainAiError } from "@/lib/ai-error";
import { createClient } from "@/lib/supabase/server";
import { readPaper } from "@/lib/read-paper";
import { readLabPhoto } from "@/lib/read-lab-photo";

const ALLOWED_IMAGE = ["image/jpeg", "image/png", "image/webp"] as const;
const MAX_PHOTO_BYTES = 12 * 1024 * 1024;

/**
 * Read one page for a ONE-OFF discharge — somebody who is not a patient in WardMate.
 *
 * The same reader as the per-patient route, minus the storage upload: evidence is filed under
 * the patient it belongs to, and here there is no patient. A one-off keeps nothing at all —
 * no photograph, no observation, no record. It produces a document and forgets, which is the
 * whole point of it and also its cost: nothing is traceable afterwards, and the resident is
 * told so on the screen.
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

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

  const base64 = Buffer.from(await photo.arrayBuffer()).toString("base64");

  let read;
  try {
    read = await readPaper(base64, mediaType);
  } catch (e) {
    return NextResponse.json(
      { error: plainAiError(e) },
      { status: 502 }
    );
  }

  let labValues: Awaited<ReturnType<typeof readLabPhoto>>["values"] | null = null;
  if (read.kind === "lab_report") {
    try {
      labValues = (await readLabPhoto(base64, mediaType)).values;
    } catch {
      labValues = null;
    }
  }

  return NextResponse.json({
    kind: read.kind,
    kindConfidence: read.kindConfidence,
    transcript: read.transcript,
    unreadable: read.unreadable,
    procedure: read.procedure,
    surgeryDate: read.surgeryDate,
    labValues,
    model: read.model,
    photoPath: null,
  });
}
