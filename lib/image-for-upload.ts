/** What the server and the reading model both accept. */
const ALLOWED = ["image/jpeg", "image/png", "image/webp"];

/** Above this, the upload risks the serverless request-size limit and is worth shrinking. */
const TOO_BIG_BYTES = 4_000_000;

/** Long edge to fit within when shrinking. Generous on purpose: a register page is dense
 *  handwriting, and legibility here decides what the model can read. */
const MAX_EDGE = 3000;

/**
 * Make a chosen file safe to upload.
 *
 * Two problems, both only reachable once the photo library is allowed as a source. A photo
 * taken through the camera arrives as JPEG at a predictable size; one picked from an iPhone's
 * library is frequently HEIC, which the server refuses outright, and can be far larger than a
 * serverless request may carry.
 *
 * Conversion happens in the browser because that is the only place the HEIC can be decoded —
 * Safari can display it natively, so a canvas can re-encode it, while the server has no
 * decoder for it at all.
 *
 * Anything already in an accepted format and a sane size is passed through untouched. The
 * register is the most safety-critical thing the app reads, and re-encoding a file that did
 * not need it would cost quality for nothing.
 */
export async function prepareImageForUpload(file: File): Promise<File> {
  const acceptable = ALLOWED.includes(file.type);
  if (acceptable && file.size <= TOO_BIG_BYTES) return file;

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    // Nothing here can decode it. Hand back the original so the server can say why it was
    // refused, rather than failing with something vaguer from the canvas.
    return file;
  }

  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);

  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    // 0.92 rather than the usual 0.8: this is handwriting, and the difference between a
    // legible and an illegible drug dose is worth the extra bytes.
    canvas.toBlob(resolve, "image/jpeg", 0.92)
  );
  if (!blob) return file;

  return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".jpg", {
    type: "image/jpeg",
    lastModified: file.lastModified,
  });
}
