import { judgeObservations, type PatientIdentifiers, type TaskCategoryJudgment } from "@/lib/jev-observations";
import { tidyIsFaithful } from "@/lib/chart-shorthand";
import { AI_MODEL, anthropic, replyJson } from "@/lib/model";
import { traced, recordAiUsage } from "@/lib/observability";
import { isIdentifierLabel } from "@/lib/patients";
import { generalSurgeryPack, getSpecialtyPack, type SpecialtyPack } from "@/lib/specialty";
import { extractExamplesFor, type ExtractExamples } from "@/lib/specialty/prompt-words";

const OBSERVATION_KINDS = [
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

const URGENCIES = ["red", "yellow", "green"] as const;

const PAC_VERDICTS = ["fit", "fit_with_conditions", "unfit", "pending"] as const;

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
  /** Plans only, set by Jev after extraction (lib/jev-observations.ts); absent = not judged. */
  task_open?: boolean;
  task_category?: TaskCategoryJudgment;
};

/**
 * The shared body of the extraction prompt — everything after the "who is speaking" line.
 *
 * EVERY SAFETY RULE LIVES HERE, and none of it is specialty-specific. A pack supplies the role
 * line and, optionally, a section of guidance about what words mean on its ward; it can never
 * remove or weaken a rule below, and the verbatim-quote CHECK that enforces rule 2 is done in
 * code after the model answers, not by the prompt. See lib/specialty/types.ts.
 *
 * The worked examples, and the planned/done-operation and PAC guidance, come from
 * lib/specialty/prompt-words.ts: a unit with no operation clock is never taught to flip a
 * patient to post-op. Every unit with one gets the text exactly as it always was.
 */
const sharedPromptBody = (ex: ExtractExamples) => `

The transcript is the only source of truth. You are recording what was said — not interpreting it, not completing it, and not improving it.

Absolute rules:

1. Never output a clinical value that is not present in the transcript. Do not infer, estimate, normalise to a typical value, or fill a gap with anything plausible. If the resident did not say a patient's temperature, there is no temperature observation. Absent is a valid and expected outcome.

2. Every observation must carry a source_quote that is copied VERBATIM from the transcript — an exact, contiguous span of the transcript's own characters. Not a paraphrase, not a tidied version, not a reconstruction. If you cannot copy an exact span that contains the value, do not emit the observation at all.

3. Do not expand abbreviations inside value_text, and do not convert units. If the resident said "30 ml serous", value_text is "30 ml serous" — not "30 millilitres of serous fluid". Store what was said.
   The one tidying allowed: an examination finding or a diagnosis is written the way a chart writes it, shorter, from the resident's own words. Drop a false start or a repeated phrase, and name an abdominal quadrant by its abbreviation when its side and level were both said. "upper abdomen is tender in the right upper abdomen" → "RUQ tenderness"; "right upper right liver lobe abscess" → "right liver lobe abscess". Never add a word of meaning, a number, a side, a site or a negation that was not said — source_quote keeps the words exactly as spoken.

4. Set needs_confirmation to true for anything where a mis-hearing would be dangerous: any number, any drug name, any dose, any route or frequency, any bed number${ex.confirmProcedure}. These get surfaced to the resident for a one-tap check. Soft findings ("abdomen soft", "tolerating orals") do not need confirmation.

5. If the transcript is empty, inaudible, or contains nothing clinical, return an empty list. Returning nothing is correct and expected — never manufacture an observation to avoid an empty result.

6. WHO THE PATIENT IS, AND WHERE THEY ARE, IS NOT AN OBSERVATION. The app already knows the bed, the name, the age and the sex — they are properties of the patient, not findings from a round. A resident naming them is telling you WHOSE round this is, not recording a clinical value.

   So ${ex.identity}. Not a "bed number" observation, not a "patient name" observation, not an age or a sex.

   This matters beyond tidiness: those rows end up in the patient's record and in their discharge summary, where "patient name: Shyamlal" under HISTORY is noise that a doctor then has to read past.

Guidance on fields:
- kind: the closest category. Use "note" only for clinical content that fits nothing else.
- label: the short name of the thing measured or described, lowercase — ${ex.labels}. Never let the label and the value be the same word: a diagnosis of ${ex.diagnosis} is label "diagnosis", value "${ex.diagnosis}", not both.
- value_text: always populated, exactly as said (exam findings and diagnoses in chart shorthand — rule 3).
- value_num and unit: populate ONLY when the resident actually stated a number and (where relevant) a unit. Otherwise null.
- day_number: use when ${ex.dayNumber} is spoken, with value_num as the integer.${ex.procedureBlocks}
- plan: unfinished future actions only — ${ex.planExamples}. Do NOT use plan for treatment updates: ${ex.notPlanExamples} are medication/exam/note updates, never jobs.

- comorbidities: When the transcript explicitly says a patient is a known case of a condition — for example "K/C/O asthma", "H/O HTN and DM", "known to have HIV", or "previous TB" — record it as kind "note", label "comorbidities", and value_text containing only the stated condition or conditions. This includes explicitly stated chronic/background illness in every system, not only diabetes or hypertension: respiratory (asthma, COPD, OSA); cardiac/vascular (IHD/CAD, prior MI, heart failure, atrial fibrillation, stroke/TIA); renal (CKD, dialysis); liver (cirrhosis, hepatitis B/C); endocrine (thyroid disease); neurological (epilepsy); inflammatory disease (rheumatoid arthritis, ankylosing spondylitis, SLE); cancer, transplant/immunosuppression, and mental-health conditions. Previous TB is included. Never infer a co-morbidity from the current diagnosis, symptoms, medication, or procedure. If multiple conditions are stated together, keep them together in one value. If they are stated separately, record each separately.
- personal / addiction history: When the transcript states a habit, or its explicit absence — smoking, alcohol use, tobacco or gutka/paan/areca-nut chewing, diet, or bowel/bladder habit — record it as kind "note", label "personal history", and value_text containing only what was said, including any quantity or duration given: "chronic smoker, one pack a day for fifteen years", "occasional alcohol", "chews tobacco", "non-smoker, no alcohol", "normal bowel and bladder". Never infer a habit from a diagnosis or medication — a patient with COPD or pancreatitis is not thereby a smoker or a drinker unless the transcript says so.

ONE ACTION PER PLAN. A sentence naming several things to be done becomes several plans, not one. ${ex.splitPlan} — because they are ticked off at different moments and one may happen without the other. A shared timeframe belongs to each of them: both are "tomorrow".

Both plans carry the same source_quote, which is the span that contains them. That is correct and expected; the quote is what was said, and one sentence can be the source of two jobs.

Do not split a single action into pieces. ${ex.onePlan}. Do not invent an action that was not said in order to make a pair.

Urgency — plans only, and rule 1 applies to it as hard as to any number:

- "red": the transcript gives a timeframe of hours, or today. "now", "stat", "urgently", "immediately", "this evening", "before I leave", "today", "in two hours".
- "yellow": the transcript gives a timeframe of today or tomorrow, without pressure. "tomorrow", "in the morning", "on the next round", "by tomorrow".
- "green": the transcript itself says there is time. "sometime this week", "before discharge", "no hurry", "whenever the report comes", "at follow-up".
- null: THE DEFAULT, and the correct answer whenever the resident stated no timeframe at all. "Repeat the haemoglobin" is null — not green. Absence of urgency in the words is not evidence of low urgency, and a job wrongly graded green is a job that looks safe to leave undone. Grading it null puts it in front of the resident to grade themselves.

Set urgency to null for every observation that is not a plan.`;

/**
 * The system prompt for one unit's specialty.
 *
 * Kept as a pure function of the pack so it can be built once per request and still hit the
 * prompt cache: the cache is a PREFIX match, and every call from a given unit produces the
 * identical string. Two specialties simply keep two cache entries.
 *
 * For general surgery this returns byte-for-byte what the single hardcoded prompt used to be.
 */
export function buildSystemPrompt(pack: SpecialtyPack = generalSurgeryPack): string {
  const guidance = pack.extractGuidance.trim();
  return (
    pack.extractRoleLine +
    sharedPromptBody(extractExamplesFor(pack)) +
    (guidance ? `\n\n${guidance}\n` : "")
  );
}


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
  protocols: { id: string; title: string; summary: string }[] = [],
  /** The unit's specialty (wards.specialty). Anything unknown — including undefined, because
   *  patch 0060 has not been run — gets the surgery pack and the prompt this app has always
   *  sent. */
  specialty?: string | null,
  /** The patient this is about, so their name and bed are kept out of what Jev is sent. */
  who?: PatientIdentifiers
): Promise<ExtractionResult> {
  const pack = getSpecialtyPack(specialty);
  const client = anthropic();

  const expected =
    expectedLabels.length > 0
      ? `\n\nThis patient is being followed against a template. If — and only if — the resident actually mentions one of the things below, use that exact wording as the label so it can be matched:\n${expectedLabels.map((l) => `- ${l}`).join("\n")}\n\nThis list tells you what to CALL things. It does not tell you what is true. Anything on this list that the resident did not mention must simply be absent from your output — never emit an observation for it.`
      : "";

  const protocolBlock =
    protocols.length > 0
      ? `\n\nThe unit has these approved protocols on file. Each has a line describing when it applies — where that line gives a concrete threshold (a number, a count, a named sign), treat it as a rule to check the transcript's own stated values against, not a vibe to judge by. Where the transcript states a value crossing that threshold, list the protocol's exact title in related_protocol_titles. Where the description is looser, use it only when the transcript's actual clinical content genuinely matches, not on a passing shared word. This is a suggestion for the resident to go read, not a diagnosis and not something that changes anything on its own. Leave it empty rather than guess; a wrong suggestion is read and dismissed, a missing one is merely not offered, and the second is the safer failure.\n\n${protocols.map((p) => `- "${p.title}"${p.summary ? `: ${p.summary}` : ""}`).join("\n")}`
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

  const response = await traced(
    "ai.extract-observations",
    "gen_ai.chat",
    () =>
      client.messages.create({
        model: AI_MODEL,
        max_tokens: 4000,
        // Still caches on Sonnet 5: ~2,400 tokens against its 1024-token minimum.
        // Two blocks, not one concatenated string. The first is identical on every call and
        // is the expensive part (~2,400 tokens, sent again for every bed on the round); the
        // rest varies by patient — expected labels, this unit's protocols — and would
        // invalidate the cache on every request if it sat inside the same block. Caching is a
        // prefix match, so the stable half has to physically come first.
        system: [
          { type: "text", text: buildSystemPrompt(pack), cache_control: { type: "ephemeral" } },
          // The API rejects an empty text block (400), so with no template and no protocols —
          // the one-off discharge build, a patient on no template — there is no second block.
          ...(expected + protocolBlock ? [{ type: "text" as const, text: expected + protocolBlock }] : []),
        ],
        // Low effort: this is constrained extraction from a short transcript, and the
        // resident is standing at a bedside. Raise it if extraction quality needs it.
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
      }),
    {
      "gen_ai.request.model": AI_MODEL,
      "transcript.chars": transcript.length,
      "expected_labels.count": expectedLabels.length,
      "protocols.count": protocols.length,
    }
  );
  recordAiUsage(response.usage);

  const parsed = replyJson(response, { observations: [] });
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

      // Rule 3's chart shorthand, checked: a tidied exam finding or diagnosis that brings in a
      // word, number, side or negation the quote does not have goes back to the quote itself.
      if ((obs.kind === "exam" || obs.kind === "diagnosis") && obs.value_text && !tidyIsFaithful(obs.value_text, obs.source_quote)) {
        obs.value_text = obs.source_quote.trim();
      }

      observations.push(obs);
    } else rejected.push(obs);
  }

  // A second, independent look at what survived: does each quote actually say its value?
  // Can only add amber and to-do judgments; see lib/jev-observations.ts.
  await judgeObservations(observations, who, pack);

  return { observations, rejected, matchedProtocolIds, model: AI_MODEL, raw: parsed };
}

/**
 * Lowercase and collapse whitespace before comparing. Deliberately conservative: it does not
 * strip words or punctuation, so the quote still has to be the transcript's own wording.
 */
function normalise(s: string): string {
  return s.toLowerCase().replace(/\s+/g, " ").trim();
}
