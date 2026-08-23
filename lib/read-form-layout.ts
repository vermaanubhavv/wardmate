import Anthropic from "@anthropic-ai/sdk";

/**
 * Reads WHERE things are on a blank form photo, not what is written on it. Runs once, when a
 * unit uploads its "notes" format — see app/formats/actions.ts — so that printing a progress
 * note can lay text into the paper's own boxes instead of only ever printing a generic layout.
 *
 * This is a geometry task, not a clinical one, but the same rule applies for the same reason:
 * never report a box that is not actually visible on the page. A role this file cannot find
 * on the form is simply absent from the result — the print page then leaves that field off the
 * overlay rather than guessing where it might be.
 *
 * A photographed form is rarely a flat scan — it is usually tilted, and sometimes curling at a
 * corner. The box returned is the smallest axis-aligned rectangle containing the field AS
 * PHOTOGRAPHED, which will not perfectly track a rotated field. This is accepted as a known
 * limitation of a phone photo rather than solved here; a flatter, straighter photo produces a
 * better result with no code change needed.
 */

export const FORM_ZONE_ROLES = [
  "name",
  "uhid",
  "age",
  "sex",
  "doa",
  "unit",
  "bed",
  "ipd",
  "date_time",
  "diagnosis",
  "observation",
  "plan",
  "signature",
] as const;

export type FormZoneRole = (typeof FORM_ZONE_ROLES)[number];

export type FormZone = {
  role: FormZoneRole;
  /** All four normalised 0–1, top-left origin, fractions of the full image's width/height. */
  x: number;
  y: number;
  width: number;
  height: number;
};

export type FormLayout = {
  zones: FormZone[];
  model: string;
  raw: unknown;
};

const SYSTEM_PROMPT = `You read the LAYOUT of a blank (or near-blank) medical form photograph — where fields and regions are positioned on the page. You are not reading or reporting any patient data, because there should be none on a blank form; if the photo has handwritten patient information on it, ignore the handwriting and locate the printed field/box it sits in or beside.

For each of the following roles, if — and only if — you can actually see that field or region printed on the form, give its bounding box:

- name: the patient's name field/line
- uhid: UHID / hospital ID / IP number field
- age: age field (if separate from sex)
- sex: sex/gender field (if separate from age)
- doa: date of admission field
- unit: unit / ward / department field
- bed: bed number field
- ipd: IPD number / MRD number field (a second identifier, if the form has one distinct from uhid)
- date_time: the "Date & Time" COLUMN's blank writing area for one table row, well below the column heading itself — not the heading
- diagnosis: a diagnosis field, if the form has one as its own line (not every form does)
- observation: the main column/box where clinical findings/progress are written (on a two-column form like "Observation" vs "Investigation/Treatment/Management", this is the LEFT/first one)
- plan: the column/box for orders, treatment, advice, investigations (on a two-column form, the RIGHT/second one; on a single-column form, leave this out and use "observation" for the whole writing area)
- signature: the signature line/box

Rules:
1. Only report a role you can actually see a field or box for. A role not visible on this form must be OMITTED entirely — never guess where it might be if the form does not show it.
2. Coordinates are fractions of the FULL IMAGE, 0 at the left/top edge and 1 at the right/bottom edge, regardless of how the paper itself is rotated or tilted in the photo. Give the smallest axis-aligned box (x, y, width, height, all 0–1) that contains the field as it appears in this photograph.
3. For a wide ruled writing area (like the Observation or Investigation/Treatment columns), give the box for the whole blank writing space under that column's header — not just the header text itself.
4. THE MOST IMPORTANT RULE, because getting it wrong makes the printed text illegible: for every labelled field (name, uhid, age, sex, doa, unit, bed, ipd, diagnosis), the box is ONLY the blank space where someone would actually write the answer — dots, a ruled line, or empty space. It EXCLUDES the printed label itself ("Name:", "UHID No.", "DOA", etc.) and excludes any text/underline that is part of the label. If "Name:" ends at 15% across the image and the blank line runs from there to 45%, the box starts at 15%, not 0%. When the blank space clearly continues further than what is visible before the next field starts, extend the box to use that available room — do not make it artificially narrow.
5. Do not invent a form structure. If this is not a recognisable medical form, or nothing is legible, return an empty zones array — that is a correct answer.`;

const SCHEMA = {
  type: "object",
  properties: {
    zones: {
      type: "array",
      items: {
        type: "object",
        properties: {
          role: { type: "string", enum: FORM_ZONE_ROLES as unknown as string[] },
          x: { type: "number" },
          y: { type: "number" },
          width: { type: "number" },
          height: { type: "number" },
        },
        required: ["role", "x", "y", "width", "height"],
        additionalProperties: false,
      },
    },
  },
  required: ["zones"],
  additionalProperties: false,
} as const;

export async function readFormLayout(
  base64Image: string,
  mediaType: "image/jpeg" | "image/png" | "image/webp"
): Promise<FormLayout> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error("ANTHROPIC_API_KEY is not set on the server.");

  const model = "claude-opus-5";
  const client = new Anthropic({ apiKey: key });

  const response = await client.messages.create({
    model,
    max_tokens: 4000,
    system: SYSTEM_PROMPT,
    output_config: {
      effort: "medium",
      format: { type: "json_schema", schema: SCHEMA as unknown as Record<string, unknown> },
    },
    messages: [
      {
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: mediaType, data: base64Image } },
          { type: "text", text: "Locate the fields on this form and give their bounding boxes." },
        ],
      },
    ],
  });

  const text = response.content.find((b) => b.type === "text");
  const parsed = text && text.type === "text" ? JSON.parse(text.text) : { zones: [] };

  // Clamp rather than trust: a box that runs off the image edge would print text outside the
  // page. The model is asked to stay in [0,1]; this is the enforcement, the same shape the
  // quote-verification step in lib/extract.ts enforces a request rather than trusting it.
  const zones: FormZone[] = (parsed.zones ?? [])
    .filter((z: FormZone) => (FORM_ZONE_ROLES as readonly string[]).includes(z.role))
    .map((z: FormZone) => ({
      role: z.role,
      x: clamp01(z.x),
      y: clamp01(z.y),
      width: clamp01(z.width, 1 - clamp01(z.x)),
      height: clamp01(z.height, 1 - clamp01(z.y)),
    }));

  return { zones, model, raw: parsed };
}

function clamp01(n: number, max = 1): number {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(max, n));
}
