import Anthropic from "@anthropic-ai/sdk";
import { AI_MODEL } from "@/lib/model";

export type SpokenPatient = {
  name: string | null;
  age_years: number | null;
  sex: "M" | "F" | "other" | null;
  bed: string | null;
  diagnosis: string | null;
  /** The operation, if one was named. Free text — the unit's own wording. */
  procedure: string | null;
};

export type SpokenPatientResult = {
  patient: SpokenPatient;
  transcript: string;
  model: string;
};

const SYSTEM_PROMPT = `You pull the details of ONE patient being admitted out of a sentence a surgical resident has spoken.

You are filling in a form from what was said. You are not interpreting medicine and you are not completing the form.

Absolute rules:

1. Every field the resident did not state is null. This is the whole job. "Madina, 50 year old female" gives a name, an age and a sex, and nothing else — no bed, no diagnosis, no operation. A form arriving half empty is the correct outcome and the resident will fill the rest in by hand.

2. Never infer. Do not guess sex from a name — names do not carry it reliably, and a wrong one is on the record from the first day. Do not guess an age from a description. Do not guess a diagnosis from an operation, or an operation from a diagnosis. Only what was said.

3. Copy the resident's own words for diagnosis and operation. Do not expand abbreviations, do not translate, do not tidy. "Lap chole" stays "lap chole". "Abdominal lump" stays "abdominal lump".

4. bed: the bed as spoken, without the word "bed". "bed number 5" gives "5". "bed SW-12" gives "SW-12".

5. diagnosis is what the patient is in with — "abdominal lump", "acute appendicitis", "obstructed hernia". Words about what is being DONE ("for workup", "for surgery tomorrow", "planned for") are not part of the diagnosis.

6. procedure is an operation that has been performed or is named as the operation. If the resident only says a patient is "for" an operation that has not happened, that is a plan, not a procedure — leave procedure null.

7. If nothing about a patient was said at all, every field is null.`;

const SCHEMA = {
  type: "object",
  properties: {
    name: { anyOf: [{ type: "string" }, { type: "null" }] },
    age_years: { anyOf: [{ type: "integer" }, { type: "null" }] },
    sex: { anyOf: [{ type: "string", enum: ["M", "F", "other"] }, { type: "null" }] },
    bed: { anyOf: [{ type: "string" }, { type: "null" }] },
    diagnosis: { anyOf: [{ type: "string" }, { type: "null" }] },
    procedure: { anyOf: [{ type: "string" }, { type: "null" }] },
  },
  required: ["name", "age_years", "sex", "bed", "diagnosis", "procedure"],
  additionalProperties: false,
} as const;

export async function readSpokenPatient(transcript: string): Promise<SpokenPatientResult> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error("ANTHROPIC_API_KEY is not set on the server.");

  const model = AI_MODEL;
  const client = new Anthropic({ apiKey: key });

  const response = await client.messages.create({
    model,
    max_tokens: 1000,
    system: SYSTEM_PROMPT,
    // Low effort: one short sentence into six fields, and the resident is looking at the
    // filled form before any of it is saved.
    output_config: {
      effort: "low",
      format: { type: "json_schema", schema: SCHEMA as unknown as Record<string, unknown> },
    },
    messages: [{ role: "user", content: `Spoken:\n\n${transcript}` }],
  });

  const text = response.content.find((b) => b.type === "text");
  const parsed = text && text.type === "text" ? JSON.parse(text.text) : {};

  // Age is the one field where a wrong value is silently plausible, so anything outside a
  // human lifespan is dropped rather than typed into the form.
  const age =
    typeof parsed.age_years === "number" &&
    Number.isInteger(parsed.age_years) &&
    parsed.age_years >= 0 &&
    parsed.age_years <= 120
      ? parsed.age_years
      : null;

  return {
    patient: {
      name: parsed.name ?? null,
      age_years: age,
      sex: ["M", "F", "other"].includes(parsed.sex) ? parsed.sex : null,
      bed: parsed.bed ?? null,
      diagnosis: parsed.diagnosis ?? null,
      procedure: parsed.procedure ?? null,
    },
    transcript,
    model,
  };
}
