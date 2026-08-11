import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentWard } from "@/lib/ward";
import { readRegister } from "@/lib/read-register";

const ALLOWED = ["image/jpeg", "image/png", "image/webp"] as const;
const MAX_BYTES = 16 * 1024 * 1024;

/**
 * Reads a photographed round register into a DRAFT. Writes no observations and touches no
 * patient — that only happens after the resident has been through the review screen. The
 * photo and the model's reading are stored so the review has something to show.
 */
export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const { ward } = await getCurrentWard();
  if (!ward) return NextResponse.json({ error: "No ward found." }, { status: 404 });

  const form = await request.formData();
  const photo = form.get("photo");

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

  const { data: read, error: readError } = await supabase
    .from("register_reads")
    .insert({ ward_id: ward.id, author_id: user.id, photo_path: "pending" })
    .select("id")
    .single();

  if (readError || !read) {
    return NextResponse.json(
      { error: `Could not start: ${readError?.message ?? "unknown error"}` },
      { status: 500 }
    );
  }

  const ext = mediaType === "image/png" ? "png" : mediaType === "image/webp" ? "webp" : "jpg";
  const path = `register/${ward.id}/${read.id}.${ext}`;
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

  await supabase.from("register_reads").update({ photo_path: path }).eq("id", read.id);

  try {
    const result = await readRegister(bytes.toString("base64"), mediaType);
    await supabase
      .from("register_reads")
      .update({ raw: { model: result.model, rows: result.rows } as never })
      .eq("id", read.id);

    return NextResponse.json({ read_id: read.id, rows: result.rows.length });
  } catch (e) {
    await supabase.from("register_reads").update({ status: "discarded" }).eq("id", read.id);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Could not read that register page." },
      { status: 502 }
    );
  }
}
