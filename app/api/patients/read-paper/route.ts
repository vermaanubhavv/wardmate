import { NextResponse } from "next/server";
import { readAdmissionPaper } from "@/lib/read-admission-paper";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth";
import { getCurrentWard, getWardSpecialtyStored } from "@/lib/ward";
import { claimPhotoRead } from "@/lib/photo-cap";
import { readImage } from "@/lib/image-upload";

/** Read a paper into suggestions only. Creating the patient remains a separate, reviewed action. */
export async function POST(request: Request) {
  const supabase = await createClient();
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const form = await request.formData();
  const image = await readImage(form.get("paper"), {
    missing: "No paper image was received.",
    tooLarge: "That image is too large. Try a closer, well-lit photo.",
  });
  if (image instanceof Response) return image;
  const { mediaType, bytes } = image;

  // The unit's department. It changes only what the paper is expected to carry — an oncology
  // day-care sheet prints a regimen and a cycle where an admission sheet prints an operation —
  // never a rule about what may be returned.
  const { ward } = await getCurrentWard();
  const capped = await claimPhotoRead(supabase, ward?.id);
  if (capped) return NextResponse.json({ error: capped }, { status: 429 });
  const specialty = ward ? await getWardSpecialtyStored(ward.id) : null;

  try {
    const result = await readAdmissionPaper(bytes.toString("base64"), mediaType, specialty);
    return NextResponse.json({ patient: result.patient });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not read that paper." },
      { status: 502 }
    );
  }
}
