import Anthropic from "@anthropic-ai/sdk";
import { AI_MODEL } from "@/lib/model";
import { isIdentifierLabel } from "@/lib/patients";
import { extractClinicalEntities } from "@/lib/clinical-ner";

export const OBSERVATION_KINDS = [
  "diagnosis",
  "day_number",
  "planned_procedure",
  "procedure_done",
  "pac_status",
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

export const PAC_VERDICTS = ["fit", "fit_with_conditions", "unfit", "pending"] as const;

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
  /** PAC rows only — the normalised reading of a stated verdict. Null otherwise. */
  pac_verdict: (typeof PAC_VERDICTS)[number] | null;
};

const SYSTEM_PROMPT = `You convert a surgical resident's spoken ward-round note into structured observations.

The transcript is the only source of truth. You are recording what was said — not interpreting it, not completing it, and not improving it.

Absolute rules:

1. Never output a clinical value that is not present in the transcript. Do not infer, estimate, normalise to a typical value, or fill a gap with anything plausible. If the resident did not say a patient's temperature, there is no temperature observation. Absent is a valid and expected outcome.

2. Every observation must carry a source_quote that is copied VERBATIM from the transcript — an exact, contiguous span of the transcript's own characters. Not a paraphrase, not a tidied version, not a reconstruction. If you cannot copy an exact span that contains the value, do not emit the observation at all.

3. Do not expand abbreviations inside value_text, and do not convert units. If the resident said "30 ml serous", value_text is "30 ml serous" — not "30 millilitres of serous fluid". Store what was said.

4. Set needs_confirmation to true for anything where a mis-hearing would be dangerous: any number, any drug name, any dose, any route or frequency, any bed number, and every procedure_done observation (see below — it silently flips the patient's post-op status). These get surfaced to the resident for a one-tap check. Soft findings ("abdomen soft", "tolerating orals") do not need confirmation.

5. If the transcript is empty, inaudible, or contains nothing clinical, return an empty list. Returning nothing is correct and expected — never manufacture an observation to avoid an empty result.

6. WHO THE PATIENT IS, AND WHERE THEY ARE, IS NOT AN OBSERVATION. The app already knows the bed, the name, the age and the sex — they are properties of the patient, not findings from a round. A resident naming them is telling you WHOSE round this is, not recording a clinical value.

   So "bed number 1, Shyamlal, 36-year-old male, post-op day 2, abdomen soft" yields exactly TWO observations: the day number and the abdomen. Not a "bed number" observation, not a "patient name" observation, not an age or a sex.

   This matters beyond tidiness: those rows end up in the patient's record and in their discharge summary, where "patient name: Shyamlal" under HISTORY is noise that a doctor then has to read past.

Guidance on fields:
- kind: the closest category. Use "note" only for clinical content that fits nothing else.
- label: the short name of the thing measured or described, lowercase — "temperature", "drain output", "ceftriaxone", "abdomen". Never let the label and the value be the same word: a diagnosis of cholelithiasis is label "diagnosis", value "cholelithiasis", not both.
- value_text: always populated, exactly as said.
- value_num and unit: populate ONLY when the resident actually stated a number and (where relevant) a unit. Otherwise null.
- day_number: use when a post-operative or admission day is spoken, with value_num as the integer.
- planned_procedure: When the transcript names the operation a patient is intended to have — "pt for radical hysterectomy", "posted for lap chole", "planned for TAH + BSO", "case posted for appendicectomy", "listed for" — record kind "planned_procedure", label "planned procedure", and value_text as the named operation exactly as said, including every part joined by "+" or "and" ("TAH + BSO + frozen" stays together, it is one planned operation, not three). This is only for a genuinely FUTURE, not-yet-done operation — an operation already performed is procedure_done instead, never this kind.

- procedure_done: When the transcript states that an operation has ALREADY been carried out — not planned, not upcoming — for example "patient underwent lap chole", "taken up for surgery, cholecystectomy done", "operated today", "s/p appendicectomy". Record kind "procedure_done", label "procedure done", and value_text as the operation named exactly as said. This is a significant fact: the app flips the patient to post-operative the moment this is recorded, which changes their post-op day count and their checklist. Use it ONLY for an operation reported as freshly performed — someone naming a distant, unrelated PAST surgery as background history ("K/C/O appendicectomy 10 years back", "prior C-section") is a comorbidities/history note, never this kind. Because a mis-heard "planned for" versus "underwent" would wrongly flip a patient to post-op, set needs_confirmation to true on every procedure_done observation without exception.
- pac_status: When the transcript states the outcome of a pre-anaesthetic checkup — "PAC done, fit for surgery", "PAC clearance given", "declared unfit", "fit subject to control of sugars", "PAC awaited", "anaesthetist has not seen him yet" — record kind "pac_status", label "PAC", and value_text as the verdict exactly as said, INCLUDING any stated conditions. Set pac_verdict to the normalised reading of that sentence:
  - "fit": cleared outright, with nothing attached. "PAC done, fit", "cleared for surgery", "fit for GA".
  - "fit_with_conditions": cleared, but the transcript attaches something that must happen or hold — "fit subject to control of blood sugar", "fit provided BP is controlled", "fit for spinal but not GA", "clearance given, needs cardiology review first".
  - "unfit": explicitly not cleared. "declared unfit", "not fit for surgery", "PAC refused clearance".
  - "pending": the transcript says the checkup has not happened or the answer is not back yet — "PAC awaited", "PAC pending", "anaesthetist yet to review", "sent for PAC".
  Set pac_verdict to null for every observation that is not a pac_status. NEVER infer a verdict the transcript did not state: a resident mentioning "PAC" with no outcome ("PAC file is on the trolley") is not a verdict, and a patient simply being scheduled for theatre is not a clearance. If no PAC outcome was stated, emit no pac_status at all — silence is the correct answer.

  WHEN A PAC VERDICT CARRIES CONDITIONS, EMIT THE CONDITIONS AS PLANS TOO. "Fit subject to control of blood sugar and a cardiology opinion" is THREE observations: the pac_status carrying the whole verdict, plus a plan "control of blood sugar" and a plan "cardiology opinion". They are separate because the verdict is a finding to read and the conditions are jobs someone has to do, ticked off one at a time. Both carry a source_quote from the same sentence, which is correct and expected.
- plan: unfinished future actions only — "remove drain tomorrow", "repeat haemoglobin", "discharge if afebrile". Do NOT use plan for treatment updates: "Telma Amlo given stat", "CST", "continue same treatment", "antibiotics started", or "drain removed" are medication/exam/note updates, never jobs.

- comorbidities: When the transcript explicitly says a patient is a known case of a condition — for example "K/C/O asthma", "H/O HTN and DM", "known to have HIV", or "previous TB" — record it as kind "note", label "comorbidities", and value_text containing only the stated condition or conditions. This includes explicitly stated chronic/background illness in every system, not only diabetes or hypertension: respiratory (asthma, COPD, OSA); cardiac/vascular (IHD/CAD, prior MI, heart failure, atrial fibrillation, stroke/TIA); renal (CKD, dialysis); liver (cirrhosis, hepatitis B/C); endocrine (thyroid disease); neurological (epilepsy); inflammatory disease (rheumatoid arthritis, ankylosing spondylitis, SLE); cancer, transplant/immunosuppression, and mental-health conditions. Previous TB is included. Never infer a co-morbidity from the current diagnosis, symptoms, medication, or procedure. If multiple conditions are stated together, keep them together in one value. If they are stated separately, record each separately.

ONE ACTION PER PLAN. A sentence naming several things to be done becomes several plans, not one. "Drain out and discharge tomorrow" is two plans — "drain out tomorrow" and "discharge tomorrow" — because they are ticked off at different moments and one may happen without the other. A shared timeframe belongs to each of them: both are "tomorrow".

Both plans carry the same source_quote, which is the span that contains them. That is correct and expected; the quote is what was said, and one sentence can be the source of two jobs.

Do not split a single action into pieces. "Remove the drain" is one plan, not "remove" and "the drain". Do not invent an action that was not said in order to make a pair.

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
          pac_verdict: {
            anyOf: [
              { type: "string", enum: PAC_VERDICTS as unknown as string[] },
              { type: "null" },
            ],
            description:
              "pac_status rows only, and only when the transcript states an outcome. Null otherwise.",
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
          "pac_verdict",
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
  /** Published protocols the transcript looks related to — a suggestion, not an action. */
  matchedProtocolIds: string[];
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
  expectedLabels: string[] = [],
  protocols: { id: string; title: string; summary: string }[] = []
): Promise<ExtractionResult> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error("ANTHROPIC_API_KEY is not set on the server.");

  const model = AI_MODEL;
  const client = new Anthropic({ apiKey: key });

  const expected =
    expectedLabels.length > 0
      ? `\n\nThis patient is being followed against a template. If — and only if — the resident actually mentions one of the things below, use that exact wording as the label so it can be matched:\n${expectedLabels.map((l) => `- ${l}`).join("\n")}\n\nThis list tells you what to CALL things. It does not tell you what is true. Anything on this list that the resident did not mention must simply be absent from your output — never emit an observation for it.`
      : "";

  const protocolBlock =
    protocols.length > 0
      ? `\n\nThe unit has these approved protocols on file. Each has a line describing when it applies — where that line gives a concrete threshold (a number, a count, a named sign), treat it as a rule to check the transcript's own stated values against, not a vibe to judge by. Where the transcript states a value crossing that threshold, list the protocol's exact title in related_protocol_titles. Where the description is looser, use it only when the transcript's actual clinical content genuinely matches, not on a passing shared word. This is a suggestion for the resident to go read, not a diagnosis and not something that changes anything on its own. Leave it empty rather than guess; a wrong suggestion is read and dismissed, a missing one is merely not offered, and the second is the safer failure.\n\n${protocols.map((p) => `- "${p.title}"${p.summary ? `: ${p.summary}` : ""}`).join("\n")}`
      : "";

  // A specialised medical term-spotter's read of the transcript — see lib/clinical-ner.ts. Not
  // this app's judgement and not proof of anything: it exists purely so a term the LLM might
  // otherwise mishear or skip in a noisy dictation gets a second look. Rule 2 above still
  // applies in full — a listed term with no verbatim quote in the transcript is not real.
  const detectedEntities = await extractClinicalEntities(transcript);
  const detectedBlock =
    detectedEntities.length > 0
      ? `\n\nA specialised medical term-spotter (not this app's judgement, and not proof anything was actually said) flagged these terms as possibly present in the transcript below. Use this only to catch a term you might otherwise mishear or skip over in a noisy dictation — every rule above still applies in full, especially rule 2: an observation is only valid if you can copy its own verbatim source_quote from the transcript. A term listed here that you cannot actually find quoted in the transcript is not real and must not be emitted just because it is on this list.\n${detectedEntities.map((e) => `- ${e.text} (${e.label})`).join("\n")}`
      : "";

  const schema =
    protocols.length > 0
      ? {
          ...SCHEMA,
          properties: {
            ...SCHEMA.properties,
            related_protocol_titles: {
              type: "array",
              items: { type: "string" },
              description: "Exact titles, copied from the list given, or empty.",
            },
          },
          required: [...SCHEMA.required, "related_protocol_titles"],
        }
      : SCHEMA;

  const response = await client.messages.create({
    model,
    max_tokens: 4000,
    // Still caches on Sonnet 5: ~2,400 tokens against its 1024-token minimum.
    // Two blocks, not one concatenated string. The first is identical on every call and is
    // the expensive part (~2,400 tokens, sent again for every bed on the round); the rest
    // varies by patient — expected labels, this unit's protocols — and would invalidate the
    // cache on every request if it sat inside the same block. Caching is a prefix match, so
    // the stable half has to physically come first.
    system: [
      { type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } },
      { type: "text", text: expected + protocolBlock + detectedBlock },
    ],
    // Low effort: this is constrained extraction from a short transcript, and the resident
    // is standing at a bedside. Raise it if extraction quality turns out to need it.
    output_config: {
      effort: "low",
      format: { type: "json_schema", schema: schema as unknown as Record<string, unknown> },
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

  // Only a title that was actually offered can survive — the same "the model's word alone is
  // not enough" rule the quote check below applies to observations. A hallucinated or
  // paraphrased title is dropped rather than fuzzy-matched.
  const offeredTitles: string[] = parsed.related_protocol_titles ?? [];
  const matchedProtocolIds = protocols
    .filter((p) => offeredTitles.includes(p.title))
    .map((p) => p.id);

  // THE ENFORCEMENT STEP. The prompt asks for verbatim quotes; this checks. Any observation
  // whose quote is not actually present in the transcript is discarded rather than stored —
  // an invented value has nothing to quote, so it cannot survive this filter. The prompt is
  // a request; this is the guarantee.
  const haystack = normalise(transcript);
  const observations: ExtractedObservation[] = [];
  const rejected: ExtractedObservation[] = [];

  for (const obs of candidates) {
    // Identifiers are not findings, and the prompt asking nicely is not a guarantee — the
    // quote check is enforced in code for the same reason, so this is too. A "bed number"
    // row on a chart is noise the resident has to read past for the rest of the admission,
    // and it follows them into the discharge summary.
    if (isIdentifierLabel(obs.label)) {
      rejected.push(obs);
      continue;
    }

    const quote = normalise(obs.source_quote ?? "");
    if (quote.length > 0 && haystack.includes(quote)) {
      // A grade on anything that is not a job has no meaning and nowhere to show, and a value
      // outside the three colours would be rejected by the database anyway. Dropped here
      // rather than trusted, for the same reason the quote is checked rather than trusted.
      if (obs.kind !== "plan" || !URGENCIES.includes(obs.urgency as never)) obs.urgency = null;

      // Same rule for the PAC verdict, and the database would refuse the row anyway — see the
      // observations_pac_verdict_kind constraint in 0042_pac_status.sql. A PAC row that arrived
      // without a recognisable verdict is dropped entirely rather than stored as a verdictless
      // PAC: the whole point of the section is to say fit or not, and a row that cannot answer
      // that would sit at the top of a pre-op patient's screen saying nothing.
      if (obs.kind !== "pac_status") obs.pac_verdict = null;
      else if (!PAC_VERDICTS.includes(obs.pac_verdict as never)) {
        rejected.push(obs);
        continue;
      } else obs.label = "PAC";

      // The prompt asks the model never to let a diagnosis's label repeat its value — "label:
      // diagnosis, value: cholelithiasis", not "label: cholelithiasis, value: cholelithiasis".
      // Enforced here rather than trusted for the same reason everything else on this list is:
      // a row that says the same word twice is exactly the noise this app exists to cut.
      if (obs.kind === "diagnosis") obs.label = "diagnosis";

      observations.push(obs);
    } else rejected.push(obs);
  }

  return { observations, rejected, matchedProtocolIds, model, raw: parsed };
}

/**
 * Lowercase and collapse whitespace before comparing. Deliberately conservative: it does not
 * strip words or punctuation, so the quote still has to be the transcript's own wording.
 */
function normalise(s: string): string {
  return s.toLowerCase().replace(/\s+/g, " ").trim();
}
