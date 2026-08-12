import Anthropic from "@anthropic-ai/sdk";

export const OBSERVATION_KINDS = [
  "diagnosis",
  "day_number",
  "vital",
  "exam",
  "drain",
  "intake_output",
  "medication",
  "lab",
  "plan",
  "note",
] as const;

export const URGENCIES = ["red", "yellow", "green"] as const;

export type ExtractedObservation = {
  kind: (typeof OBSERVATION_KINDS)[number];
  label: string;
  value_text: string;
  value_num: number | null;
  unit: string | null;
  source_quote: string;
  needs_confirmation: boolean;
  /** Plans only, and only when the speaker gave a timeframe. Null otherwise. */
  urgency: (typeof URGENCIES)[number] | null;
};

const SYSTEM_PROMPT = `You convert a surgical resident's spoken ward-round note into structured observations.

The transcript is the only source of truth. You are recording what was said — not interpreting it, not completing it, and not improving it.

Absolute rules:

1. Never output a clinical value that is not present in the transcript. Do not infer, estimate, normalise to a typical value, or fill a gap with anything plausible. If the resident did not say a patient's temperature, there is no temperature observation. Absent is a valid and expected outcome.

2. Every observation must carry a source_quote that is copied VERBATIM from the transcript — an exact, contiguous span of the transcript's own characters. Not a paraphrase, not a tidied version, not a reconstruction. If you cannot copy an exact span that contains the value, do not emit the observation at all.

3. Do not expand abbreviations inside value_text, and do not convert units. If the resident said "30 ml serous", value_text is "30 ml serous" — not "30 millilitres of serous fluid". Store what was said.

4. Set needs_confirmation to true for anything where a mis-hearing would be dangerous: any number, any drug name, any dose, any route or frequency, and any bed number. These get surfaced to the resident for a one-tap check. Soft findings ("abdomen soft", "tolerating orals") do not need confirmation.

5. If the transcript is empty, inaudible, or contains nothing clinical, return an empty list. Returning nothing is correct and expected — never manufacture an observation to avoid an empty result.

Guidance on fields:
- kind: the closest category. Use "note" only for clinical content that fits nothing else.
- label: the short name of the thing measured or described, lowercase — "temperature", "drain output", "ceftriaxone", "abdomen".
- value_text: always populated, exactly as said.
- value_num and unit: populate ONLY when the resident actually stated a number and (where relevant) a unit. Otherwise null.
- day_number: use when a post-operative or admission day is spoken, with value_num as the integer.
- plan: things to be done — "remove drain tomorrow", "repeat haemoglobin", "discharge if afebrile".

Urgency — plans only, and rule 1 applies to it as hard as to any number:

- "red": the transcript gives a timeframe of hours, or today. "now", "stat", "urgently", "immediately", "this evening", "before I leave", "today", "in two hours".
- "yellow": the transcript gives a timeframe of today or tomorrow, without pressure. "tomorrow", "in the morning", "on the next round", "by tomorrow".
- "green": the transcript itself says there is time. "sometime this week", "before discharge", "no hurry", "whenever the report comes", "at follow-up".
- null: THE DEFAULT, and the correct answer whenever the resident stated no timeframe at all. "Repeat the haemoglobin" is null — not green. Absence of urgency in the words is not evidence of low urgency, and a job wrongly graded green is a job that looks safe to leave undone. Grading it null puts it in front of the resident to grade themselves.

Set urgency to null for every observation that is not a plan.`;

const SCHEMA = {
  type: "object",
  properties: {
    observations: {
      type: "array",
      items: {
        type: "object",
        properties: {
          kind: { type: "string", enum: OBSERVATION_KINDS as unknown as string[] },
          label: { type: "string" },
          value_text: { type: "string" },
          value_num: { type: ["number", "null"] },
          unit: { type: ["string", "null"] },
          source_quote: {
            type: "string",
            description: "A verbatim, contiguous span copied from the transcript.",
          },
          needs_confirmation: { type: "boolean" },
          // anyOf rather than type: ["string", "null"] with an enum beside it — the API
          // rejects that combination, because the enum's values do not match a union type.
          urgency: {
            anyOf: [{ type: "string", enum: URGENCIES as unknown as string[] }, { type: "null" }],
            description:
              "Plans only, and only when the transcript states a timeframe. Null otherwise.",
          },
        },
        required: [
          "kind",
          "label",
          "value_text",
          "value_num",
          "unit",
          "source_quote",
          "needs_confirmation",
          "urgency",
        ],
        additionalProperties: false,
      },
    },
  },
  required: ["observations"],
  additionalProperties: false,
} as const;

export type ExtractionResult = {
  observations: ExtractedObservation[];
  /** Observations the model produced whose quote was not actually in the transcript. */
  rejected: ExtractedObservation[];
  model: string;
  raw: unknown;
};

/**
 * `expectedLabels` comes from the patient's template. It constrains NAMING only — when the
 * resident mentions something the template knows about, it gets stored under exactly that
 * name so the two can be matched later. It grants no permission to produce a value that was
 * not said; an expected item the resident skipped simply yields no observation, which is the
 * whole point of showing it as missing.
 */
export async function extractObservations(
  transcript: string,
  expectedLabels: string[] = []
): Promise<ExtractionResult> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error("ANTHROPIC_API_KEY is not set on the server.");

  const model = "claude-opus-5";
  const client = new Anthropic({ apiKey: key });

  const expected =
    expectedLabels.length > 0
      ? `\n\nThis patient is being followed against a template. If — and only if — the resident actually mentions one of the things below, use that exact wording as the label so it can be matched:\n${expectedLabels.map((l) => `- ${l}`).join("\n")}\n\nThis list tells you what to CALL things. It does not tell you what is true. Anything on this list that the resident did not mention must simply be absent from your output — never emit an observation for it.`
      : "";

  const response = await client.messages.create({
    model,
    max_tokens: 4000,
    system: SYSTEM_PROMPT + expected,
    // Low effort: this is constrained extraction from a short transcript, and the resident
    // is standing at a bedside. Raise it if extraction quality turns out to need it.
    output_config: {
      effort: "low",
      format: { type: "json_schema", schema: SCHEMA as unknown as Record<string, unknown> },
    },
    messages: [
      {
        role: "user",
        content: `Transcript:\n\n${transcript}`,
      },
    ],
  });

  const text = response.content.find((b) => b.type === "text");
  const parsed = text && text.type === "text" ? JSON.parse(text.text) : { observations: [] };
  const candidates: ExtractedObservation[] = parsed.observations ?? [];

  // THE ENFORCEMENT STEP. The prompt asks for verbatim quotes; this checks. Any observation
  // whose quote is not actually present in the transcript is discarded rather than stored —
  // an invented value has nothing to quote, so it cannot survive this filter. The prompt is
  // a request; this is the guarantee.
  const haystack = normalise(transcript);
  const observations: ExtractedObservation[] = [];
  const rejected: ExtractedObservation[] = [];

  for (const obs of candidates) {
    const quote = normalise(obs.source_quote ?? "");
    if (quote.length > 0 && haystack.includes(quote)) {
      // A grade on anything that is not a job has no meaning and nowhere to show, and a value
      // outside the three colours would be rejected by the database anyway. Dropped here
      // rather than trusted, for the same reason the quote is checked rather than trusted.
      if (obs.kind !== "plan" || !URGENCIES.includes(obs.urgency as never)) obs.urgency = null;
      observations.push(obs);
    } else rejected.push(obs);
  }

  return { observations, rejected, model, raw: parsed };
}

/**
 * Lowercase and collapse whitespace before comparing. Deliberately conservative: it does not
 * strip words or punctuation, so the quote still has to be the transcript's own wording.
 */
function normalise(s: string): string {
  return s.toLowerCase().replace(/\s+/g, " ").trim();
}
