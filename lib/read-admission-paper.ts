import Anthropic from "@anthropic-ai/sdk";
import { AI_MODEL } from "@/lib/model";

/** Details printed on an OPD paper or admission sheet that can safely prefill a new record. */
export type AdmissionPaperPatient = {
  name: string | null;
  age_years: number | null;
  sex: "M" | "F" | "other" | null;
  /** Preserve the identifier exactly as printed; hospitals use different formats and labels. */
  uhid_ip_no: string | null;
  diagnosis: string | null;
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

7. The response only suggests form values. A clinician will review it before creating the patient record.`;

const SCHEMA = {
  type: "object",
  properties: {
    name: { anyOf: [{ type: "string" }, { type: "null" }] },
    age_years: { anyOf: [{ type: "integer" }, { type: "null" }] },
    sex: { anyOf: [{ type: "string", enum: ["M", "F", "other"] }, { type: "null" }] },
    uhid_ip_no: { anyOf: [{ type: "string" }, { type: "null" }] },
    diagnosis: { anyOf: [{ type: "string" }, { type: "null" }] },
  },
  required: ["name", "age_years", "sex", "uhid_ip_no", "diagnosis"],
  additionalProperties: false,
} as const;

export async function readAdmissionPaper(
  base64Image: string,
  mediaType: "image/jpeg" | "image/png" | "image/webp"
): Promise<AdmissionPaperResult> {
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
          { type: "text", text: "Read this admission or OPD paper." },
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

  return {
    patient: {
      name: typeof parsed.name === "string" ? parsed.name : null,
      age_years: age,
      sex: ["M", "F", "other"].includes(parsed.sex) ? parsed.sex : null,
      uhid_ip_no: typeof parsed.uhid_ip_no === "string" ? parsed.uhid_ip_no : null,
      diagnosis: typeof parsed.diagnosis === "string" ? parsed.diagnosis : null,
    },
    model,
  };
}
