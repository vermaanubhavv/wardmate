import Anthropic from "@anthropic-ai/sdk";
import { AI_MODEL } from "@/lib/model";
import { getSpecialtyPack } from "@/lib/specialty";

/** Details printed on an OPD paper or admission sheet that can safely prefill a new record. */
export type AdmissionPaperPatient = {
  name: string | null;
  age_years: number | null;
  sex: "M" | "F" | "other" | null;
  /** Preserve the identifier exactly as printed; hospitals use different formats and labels. */
  uhid_ip_no: string | null;
  /** The MRD / hospital record number, kept apart from the IP number on purpose. */
  mrd_no: string | null;
  bed: string | null;
  /** Date of admission as printed, normalised to YYYY-MM-DD. Null unless unambiguous. */
  admitted_on: string | null;
  diagnosis: string | null;
  /** An operation the paper names as already performed. Never a planned one. */
  procedure: string | null;
  /** Chemotherapy, for an oncology unit. Null on any paper that does not print them. */
  regimen: string | null;
  cycle_number: number | null;
  cycle_started_on: string | null;
};

export type AdmissionPaperResult = {
  patient: AdmissionPaperPatient;
  model: string;
};

const SYSTEM_PROMPT = `You read one hospital admission paper or OPD paper and copy patient details into a new patient form.

You are transcribing, not interpreting or completing a medical record.

Absolute rules:

1. Return only information that is legible and explicitly printed or handwritten on the supplied paper. If a field is absent, ambiguous, crossed out, or unreadable, return null. Never guess.

2. name is the patient's name, copied as written. Do not use the consultant's, attendant's, or doctor's name.

3. age_years is an age in completed years only. Do not calculate it from a date of birth. Ages outside 0–120 must be null.

4. sex may be M, F, or other only when explicitly indicated. Do not infer it from a name, title, or relationship.

5. uhid_ip_no is the IP number ONLY — the value labelled IP number, IP no., or inpatient number. Never copy a UHID into this field, even when it is the only identifier printed on the paper and no IP number is present — leave this null rather than substitute a UHID. Copy the identifier exactly; do not include its label. Do not put an MRD number here.

6. diagnosis is a diagnosis, provisional diagnosis, clinical diagnosis, or impression explicitly stated for this patient. Copy its wording without expanding abbreviations or making it more specific. Symptoms, complaints, and a proposed procedure are not a diagnosis unless the paper itself labels them as one.

7. mrd_no is the MRD / medical record / hospital number — the value labelled MRD, MR no., CR no., hospital no., or registration no. It is a DIFFERENT field from the IP number and the two must never be swapped. When a paper prints only one identifier and does not say which kind it is, put it in mrd_no and leave uhid_ip_no null. Copy it exactly, without its label.

8. bed is a bed or ward-bed number if the paper prints one, copied as written and without the word "bed". A ward name on its own is not a bed.

9. admitted_on is the date of admission, as YYYY-MM-DD. Return null unless the date is unambiguous — a date you would have to choose between two readings of (03/04/2026) is not a date. Never use the date the paper was printed, a date of birth, or an appointment date.

10. procedure is an operation the paper states has ALREADY been performed. An operation the patient is listed, posted or planned for has not happened, and is null here.

11. Chemotherapy, when the paper is an oncology one:
   - regimen is the regimen named as written — "R-CHOP", "FOLFOX", "ABVD", "carboplatin-paclitaxel". Copy the letters as printed. Never expand an acronym into its drugs, and never assemble a regimen name out of a list of drugs that the paper did not itself name as one.
   - cycle_number is which cycle, as a whole number. "C3D1", "cycle 3 day 1", "3rd cycle" all give 3. A day number is NOT a cycle number: in "C3D1" the cycle is 3 and the 1 is the day.
   - cycle_started_on is the date that cycle started, as YYYY-MM-DD, and only when the paper prints a date for it. Do not calculate it from a day number. Do not use the date of the next cycle.
   Every one of these is null on a paper that does not print it, which includes every surgical paper.

12. The response only suggests form values. A clinician will review it before creating the patient record.`;

const SCHEMA = {
  type: "object",
  properties: {
    name: { anyOf: [{ type: "string" }, { type: "null" }] },
    age_years: { anyOf: [{ type: "integer" }, { type: "null" }] },
    sex: { anyOf: [{ type: "string", enum: ["M", "F", "other"] }, { type: "null" }] },
    uhid_ip_no: { anyOf: [{ type: "string" }, { type: "null" }] },
    mrd_no: { anyOf: [{ type: "string" }, { type: "null" }] },
    bed: { anyOf: [{ type: "string" }, { type: "null" }] },
    admitted_on: { anyOf: [{ type: "string" }, { type: "null" }] },
    diagnosis: { anyOf: [{ type: "string" }, { type: "null" }] },
    procedure: { anyOf: [{ type: "string" }, { type: "null" }] },
    regimen: { anyOf: [{ type: "string" }, { type: "null" }] },
    cycle_number: { anyOf: [{ type: "integer" }, { type: "null" }] },
    cycle_started_on: { anyOf: [{ type: "string" }, { type: "null" }] },
  },
  required: [
    "name",
    "age_years",
    "sex",
    "uhid_ip_no",
    "mrd_no",
    "bed",
    "admitted_on",
    "diagnosis",
    "procedure",
    "regimen",
    "cycle_number",
    "cycle_started_on",
  ],
  additionalProperties: false,
} as const;

/** YYYY-MM-DD, or null. A date the model returned in any other shape is discarded rather than
 *  reinterpreted — guessing which number is the day is exactly what rule 9 forbids. */
function isoDateOrNull(v: unknown): string | null {
  return typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v.trim()) ? v.trim() : null;
}

function textOrNull(v: unknown): string | null {
  return typeof v === "string" && v.trim() ? v.trim() : null;
}

export async function readAdmissionPaper(
  base64Image: string,
  mediaType: "image/jpeg" | "image/png" | "image/webp",
  /** The unit's department. Only changes the closing instruction — what a paper is expected to
   *  print — never a rule. Anything unrecognised reads as general surgery. */
  specialty?: string | null
): Promise<AdmissionPaperResult> {
  const pack = getSpecialtyPack(specialty);
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error("ANTHROPIC_API_KEY is not set on the server.");

  const model = AI_MODEL;
  const client = new Anthropic({ apiKey: key });
  const response = await client.messages.create({
    model,
    max_tokens: 1000,
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
          {
            type: "text",
            text:
              pack.key === "medical_oncology"
                ? "Read this admission, OPD or day-care chemotherapy paper. It may carry a regimen and a cycle; it may equally carry neither, and null is the right answer then."
                : "Read this admission or OPD paper.",
          },
        ],
      },
    ],
  });

  const text = response.content.find((block) => block.type === "text");
  const parsed = text && text.type === "text" ? JSON.parse(text.text) : {};
  const age =
    typeof parsed.age_years === "number" &&
    Number.isInteger(parsed.age_years) &&
    parsed.age_years >= 0 &&
    parsed.age_years <= 120
      ? parsed.age_years
      : null;

  // A cycle number outside the range a real course of chemotherapy runs to is a misread of
  // something else on the paper — a day, a dose, a bed — so it is dropped rather than stored.
  const cycle =
    typeof parsed.cycle_number === "number" &&
    Number.isInteger(parsed.cycle_number) &&
    parsed.cycle_number >= 1 &&
    parsed.cycle_number <= 60
      ? parsed.cycle_number
      : null;

  return {
    patient: {
      name: textOrNull(parsed.name),
      age_years: age,
      sex: ["M", "F", "other"].includes(parsed.sex) ? parsed.sex : null,
      uhid_ip_no: textOrNull(parsed.uhid_ip_no),
      mrd_no: textOrNull(parsed.mrd_no),
      bed: textOrNull(parsed.bed),
      admitted_on: isoDateOrNull(parsed.admitted_on),
      diagnosis: textOrNull(parsed.diagnosis),
      procedure: textOrNull(parsed.procedure),
      regimen: textOrNull(parsed.regimen),
      cycle_number: cycle,
      cycle_started_on: isoDateOrNull(parsed.cycle_started_on),
    },
    model,
  };
}
