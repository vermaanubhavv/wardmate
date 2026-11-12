import { NextResponse } from "next/server";
import type { ImageType } from "@/lib/model";

const ALLOWED: readonly ImageType[] = ["image/jpeg", "image/png", "image/webp"];

/** The checks every photo-upload route makes on its image field: present and non-empty (400),
 *  within the size limit (413), a type the readers accept (415). Returns the image, or the
 *  reply to send instead. */
export async function readImage(
  value: FormDataEntryValue | null,
  {
    maxBytes = 12 * 1024 * 1024,
    missing = "No photo was received.",
    tooLarge = "That photo is too large.",
  }: { maxBytes?: number; missing?: string; tooLarge?: string } = {}
): Promise<{ mediaType: ImageType; ext: string; bytes: Buffer } | NextResponse> {
  if (!(value instanceof Blob) || value.size === 0) {
    return NextResponse.json({ error: missing }, { status: 400 });
  }
  if (value.size > maxBytes) return NextResponse.json({ error: tooLarge }, { status: 413 });
  const mediaType = ALLOWED.find((t) => value.type === t);
  if (!mediaType) {
    return NextResponse.json(
      { error: `Unsupported image type (${value.type || "unknown"}).` },
      { status: 415 }
    );
  }
  const ext = mediaType === "image/png" ? "png" : mediaType === "image/webp" ? "webp" : "jpg";
  return { mediaType, ext, bytes: Buffer.from(await value.arrayBuffer()) };
}
