import { NextResponse } from "next/server";
import { plainAiError } from "@/lib/ai-error";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth";
import { readPaper } from "@/lib/read-paper";
import { readLabPhoto } from "@/lib/read-lab-photo";
import { getCurrentWard, getWardPack } from "@/lib/ward";
import { claimPhotoRead } from "@/lib/photo-cap";
import { readImage } from "@/lib/image-upload";

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
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const form = await request.formData();
  const image = await readImage(form.get("photo"));
  if (image instanceof Response) return image;
  const { mediaType, bytes } = image;

  const { ward } = await getCurrentWard();
  const capped = await claimPhotoRead(supabase, ward?.id);
  if (capped) return NextResponse.json({ error: capped }, { status: 429 });

  const base64 = bytes.toString("base64");

  let read;
  try {
    read = await readPaper(base64, mediaType, await getWardPack(ward?.id));
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
