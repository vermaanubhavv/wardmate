import { NextResponse } from "next/server";
import { plainAiError } from "@/lib/ai-error";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth";
import { getCurrentWard, getWardPack } from "@/lib/ward";
import { readRegister } from "@/lib/read-register";
import { claimPhotoRead } from "@/lib/photo-cap";
import { readImage } from "@/lib/image-upload";

/**
 * Reads a photographed round register into a DRAFT. Writes no observations and touches no
 * patient — that only happens after the resident has been through the review screen. The
 * photo and the model's reading are stored so the review has something to show.
 */
export async function POST(request: Request) {
  const supabase = await createClient();

  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const { ward } = await getCurrentWard();
  if (!ward) return NextResponse.json({ error: "No ward found." }, { status: 404 });

  const form = await request.formData();
  const image = await readImage(form.get("photo"), { maxBytes: 16 * 1024 * 1024 });
  if (image instanceof Response) return image;
  const { mediaType, ext, bytes } = image;

  const capped = await claimPhotoRead(supabase, ward.id);
  if (capped) return NextResponse.json({ error: capped }, { status: 429 });

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

  const path = `register/${ward.id}/${read.id}.${ext}`;

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
    const result = await readRegister(bytes.toString("base64"), mediaType, await getWardPack(ward.id));
    await supabase
      .from("register_reads")
      .update({ raw: { model: result.model, rows: result.rows } as never })
      .eq("id", read.id);

    return NextResponse.json({ read_id: read.id, rows: result.rows.length });
  } catch (e) {
    await supabase.from("register_reads").update({ status: "discarded" }).eq("id", read.id);
    return NextResponse.json(
      { error: plainAiError(e) },
      { status: 502 }
    );
  }
}
