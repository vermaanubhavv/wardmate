/**
 * Checks the lab-photo reader against an image whose contents are known.
 *
 *   node --env-file=.env.local scripts/test-lab-photo.ts <path-to-image>
 *
 * The thing being tested is not only "did it read the numbers" but "did it stay inside the
 * page" — reference ranges must not come back as results, and nothing absent from the image
 * may appear in the output.
 */
import { readFileSync } from "node:fs";
import { readLabPhoto } from "../lib/read-lab-photo.ts";

const path = process.argv[2];
if (!path) {
  console.error("usage: node scripts/test-lab-photo.ts <image>");
  process.exit(1);
}

const bytes = readFileSync(path);
const mediaType = path.endsWith(".png")
  ? "image/png"
  : path.endsWith(".webp")
    ? "image/webp"
    : "image/jpeg";

const t0 = Date.now();
const result = await readLabPhoto(bytes.toString("base64"), mediaType as "image/png");
const ms = Date.now() - t0;

console.log(`report type: ${result.report_type || "(not stated)"}`);
console.log(`${result.values.length} values, ${ms} ms\n`);

for (const v of result.values) {
  console.log(`  ${v.label}: ${v.value_text}${v.uncertain ? "   [UNCLEAR]" : ""}`);
  console.log(`      quote: "${v.source_quote}"`);
}
