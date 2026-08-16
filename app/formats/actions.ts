"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { FORMAT_KINDS } from "@/lib/formats";

const KINDS = FORMAT_KINDS.map((k) => k.kind) as readonly string[];

/** Images and PDFs — a format arrives as a photograph of a paper form or as a document. */
const ALLOWED = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
  "application/pdf",
];

export type FormatState = { error: string | null };

/**
 * Store one of the unit's formats, replacing whatever was there.
 *
 * A unit has one current discharge layout, not a history of them, so the old file is removed
 * rather than left orphaned in the bucket. That deletion is the only one the app performs on
 * stored files, and the storage policy allows it only inside the formats folder — a lab photo
 * or a register page is evidence behind a recorded value, and nothing here should be able to
 * pull those out from under a record.
 */
export async function uploadFormat(
  _prev: FormatState,
  formData: FormData
): Promise<FormatState> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You are signed out. Sign in again." };

  const wardId = String(formData.get("ward_id") ?? "");
  const kind = String(formData.get("kind") ?? "");
  const file = formData.get("file");

  if (!wardId) return { error: "No ward." };
  if (!KINDS.includes(kind)) return { error: "Unknown kind of format." };
  if (!(file instanceof File) || file.size === 0) return { error: "No file was chosen." };

  if (!ALLOWED.includes(file.type)) {
    return { error: `That file type is not accepted (${file.type || "unknown"}).` };
  }
  if (file.size > 10_000_000) {
    return { error: "That file is larger than 10 MB." };
  }

  const { data: existing } = await supabase
    .from("ward_formats")
    .select("file_path")
    .eq("ward_id", wardId)
    .eq("kind", kind)
    .maybeSingle();

  const ext = file.name.includes(".") ? file.name.split(".").pop() : "bin";
  const path = `formats/${wardId}/${kind}-${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("evidence")
    .upload(path, file, { contentType: file.type });

  if (uploadError) return { error: `Could not upload: ${uploadError.message}` };

  const { error } = await supabase.from("ward_formats").upsert(
    {
      ward_id: wardId,
      kind,
      file_path: path,
      file_name: file.name,
      mime_type: file.type,
      uploaded_at: new Date().toISOString(),
      uploaded_by: user.id,
    },
    { onConflict: "ward_id,kind" }
  );

  if (error) {
    // Do not leave the just-uploaded file behind if the row it belongs to never landed.
    await supabase.storage.from("evidence").remove([path]);
    return { error: error.message };
  }

  // Only once the row points at the new file, so a failure never leaves the unit with a
  // record pointing at nothing.
  if (existing?.file_path) {
    await supabase.storage.from("evidence").remove([existing.file_path]);
  }

  revalidatePath("/formats");
  return { error: null };
}

export async function removeFormat(formData: FormData) {
  const wardId = String(formData.get("ward_id") ?? "");
  const kind = String(formData.get("kind") ?? "");
  if (!wardId || !KINDS.includes(kind)) return;

  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("ward_formats")
    .select("file_path")
    .eq("ward_id", wardId)
    .eq("kind", kind)
    .maybeSingle();

  await supabase.from("ward_formats").delete().eq("ward_id", wardId).eq("kind", kind);

  if (existing?.file_path) {
    await supabase.storage.from("evidence").remove([existing.file_path]);
  }

  revalidatePath("/formats");
}
