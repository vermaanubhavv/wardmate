import { NextResponse } from "next/server";
import { readAdmissionPaper } from "@/lib/read-admission-paper";
import { createClient } from "@/lib/supabase/server";
import { getCurrentWard, getWardSpecialtyStored } from "@/lib/ward";

const ALLOWED = ["image/jpeg", "image/png", "image/webp"] as const;
const MAX_BYTES = 12 * 1024 * 1024;

/** Read a paper into suggestions only. Creating the patient remains a separate, reviewed action. */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const form = await request.formData();
  const paper = form.get("paper");
  if (!(paper instanceof Blob) || paper.size === 0) {
    return NextResponse.json({ error: "No paper image was received." }, { status: 400 });
  }
  if (paper.size > MAX_BYTES) {
    return NextResponse.json({ error: "That image is too large. Try a closer, well-lit photo." }, { status: 413 });
  }

  const mediaType = ALLOWED.find((type) => type === paper.type);
  if (!mediaType) {
    return NextResponse.json(
      { error: `Unsupported image type (${paper.type || "unknown"}).` },
      { status: 415 }
    );
  }

  // The unit's department. It changes only what the paper is expected to carry — an oncology
  // day-care sheet prints a regimen and a cycle where an admission sheet prints an operation —
  // never a rule about what may be returned.
  const { ward } = await getCurrentWard();
  const specialty = ward ? await getWardSpecialtyStored(ward.id) : null;

  try {
    const result = await readAdmissionPaper(
      Buffer.from(await paper.arrayBuffer()).toString("base64"),
      mediaType,
      specialty
    );
    return NextResponse.json({ patient: result.patient });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not read that paper." },
      { status: 502 }
    );
  }
}
