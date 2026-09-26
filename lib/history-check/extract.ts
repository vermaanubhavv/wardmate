import Anthropic from "@anthropic-ai/sdk";
import { AI_MODEL } from "@/lib/model";
import { traced, recordAiUsage } from "@/lib/observability";
import type { HistoryTree } from "@/lib/history-check/types";
import type { HistorySource } from "@/lib/history-check/sources";
import type { RawExtraction } from "@/lib/history-check/validate";

/**
 * The one model call in the feature: map the case-history dictation onto a complaint tree.
 *
 * Server-side only. What comes back is RAW and is never used until lib/history-check/validate.ts
 * has been over it — the prompt asks for verbatim quotes and explicit negatives, the validator
 * checks. Read that file for the rules; this one only has to ask well.
 *
 * PROMPT_VERSION is stored with every run beside the tree version and the model. Bump it on
 * ANY change to the wording below, so an old result can never be mistaken for a new one.
 */
export const PROMPT_VERSION = "1";

const SYSTEM = `You map a resident's dictated case history onto a fixed list of history questions for one presenting complaint. You are recording what the resident SAID — not what is likely, not what a good history would contain, not what the diagnosis suggests.

You will be given numbered SOURCES (each is one dictation or one typed note, verbatim) and a list of SLOTS. For every slot, answer with exactly one state:

- "positive": the resident stated the item is present, or gave it a value.
- "negative": the resident EXPLICITLY stated the item is absent — the words "no", "not", "denies", "nil", "absent" or similar are attached to that item in the dictation.
- "unasked": the dictation does not mention the item at all, or mentions it too vaguely to say either way.

Absolute rules:

1. "unasked" is the default and the expected answer for most slots. A history that does not mention rash has rash = unasked. Never infer absence from silence, from the diagnosis, from the pattern of other answers, or from what a complete history "would have" covered. A negative without an explicit denial in the words is a fabricated finding.

2. Every positive and negative must carry a "quote": a contiguous span copied VERBATIM from ONE source, and "source": that source's number. Not a paraphrase, not a tidied version, not two fragments joined. If you cannot copy an exact span that establishes the state, the answer is "unasked". For a negative, the quote must itself contain the denial and the item ("no vomiting"), not just the item.

3. For slots of kind "value" (onset, duration, pattern and the like), a positive also carries "value": the resident's own phrase for it, copied verbatim from the same source ("since 5 days", "high grade", "comes and goes"). Do not normalise it, convert units, or expand it. If no phrase can be copied, the slot is "unasked".

4. Contradictions. If one statement says present and another says absent — an attendant and the patient disagreeing, or two dictations disagreeing — answer with the FIRST statement's state and quote, and put the contradicting statement's quote and source in "conflict". Do not choose which is true.

5. Wrong patient. If a source explicitly says it is about a different patient or bed than the one named in the patient line ("this is bed 7's history", "wrong patient"), set "wrong_patient" to that sentence and its source, and answer every slot from that source as "unasked". If nothing says so, leave wrong_patient null — you cannot tell otherwise, and must not guess.

6. Identity is not a finding. The patient's name, age, sex and bed are given to you; they are never a slot answer.

7. Return every slot id you were given, exactly once, and no others. Missing slots are treated as unasked, so listing them explicitly changes nothing — but do not invent ids.

Terms listed beside each slot are the words the item is commonly dictated as; they help you find it. They do not license a state the words do not support.`;

const SCHEMA = {
  type: "object",
  properties: {
    slots: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          state: { type: "string", enum: ["positive", "negative", "unasked"] },
          quote: { type: ["string", "null"], description: "Verbatim contiguous span from the cited source. Null when unasked." },
          source: { type: ["integer", "null"], description: "0-based source number the quote is copied from. Null when unasked." },
          value: { type: ["string", "null"], description: "Value slots, positive only: the resident's own phrase, verbatim. Null otherwise." },
          conflict: {
            anyOf: [
              {
                type: "object",
                properties: {
                  quote: { type: "string" },
                  source: { type: "integer" },
                },
                required: ["quote", "source"],
                additionalProperties: false,
              },
              { type: "null" },
            ],
            description: "A contradicting statement, verbatim, or null.",
          },
        },
        required: ["id", "state", "quote", "source", "value", "conflict"],
        additionalProperties: false,
      },
    },
    wrong_patient: {
      anyOf: [
        {
          type: "object",
          properties: { quote: { type: "string" }, source: { type: "integer" } },
          required: ["quote", "source"],
          additionalProperties: false,
        },
        { type: "null" },
      ],
    },
  },
  required: ["slots", "wrong_patient"],
  additionalProperties: false,
} as const;

export type PatientLine = {
  bed: string | null;
  age_years: number | null;
  sex: string | null;
};

export type ExtractionUsage = {
  input_tokens: number;
  output_tokens: number;
  cache_read_input_tokens: number;
  cache_creation_input_tokens: number;
};

/** The slot list as the model sees it. Stable per tree version, so it caches with the system. */
export function slotsBlock(tree: HistoryTree): string {
  return tree.slots
    .map((s) => `- ${s.id} (${s.kind}) — ${s.label}. Terms: ${s.terms.join(", ")}`)
    .join("\n");
}

export function sourcesBlock(sources: HistorySource[]): string {
  return sources
    .map((s) => `SOURCE ${s.index} (${s.kind}, ${s.recordedAt.slice(0, 10)}):\n${s.text}`)
    .join("\n\n");
}

export function patientLine(p: PatientLine): string {
  const bits = [
    p.bed ? `bed ${p.bed}` : null,
    p.age_years != null ? `${p.age_years} years` : null,
    p.sex ?? null,
  ].filter(Boolean);
  return bits.length ? `Patient: ${bits.join(", ")}` : "Patient: (no details on record)";
}

/**
 * One call. Throws on transport or API failure (the caller turns that into a stored error
 * run and a plain message via lib/ai-error.ts). Returns the raw parse and the usage.
 */
export async function extractHistoryCheck(
  tree: HistoryTree,
  sources: HistorySource[],
  patient: PatientLine,
  opts: { model?: string } = {}
): Promise<{ raw: RawExtraction; model: string; usage: ExtractionUsage }> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error("ANTHROPIC_API_KEY is not set on the server.");
  const model = opts.model ?? AI_MODEL;
  const client = new Anthropic({ apiKey: key });

  // Two system blocks, as lib/extract.ts does: the rules and the tree are identical on every
  // call for a given tree version and sit first, cached; the patient line varies and sits after.
  const stable = `${SYSTEM}\n\nCOMPLAINT: ${tree.complaint} (tree ${tree.id} v${tree.version})\n\nSLOTS:\n${slotsBlock(tree)}`;

  const response = await traced(
    "ai.history-check",
    "gen_ai.chat",
    () =>
      client.messages.create({
        model,
        max_tokens: 8000,
        system: [
          { type: "text", text: stable, cache_control: { type: "ephemeral" } },
          { type: "text", text: patientLine(patient) },
        ],
        // Haiku 4.5 rejects `effort`; every current model accepts the structured format.
        output_config: {
          ...(model.startsWith("claude-haiku") ? {} : { effort: "low" as const }),
          format: { type: "json_schema", schema: SCHEMA as unknown as Record<string, unknown> },
        },
        messages: [{ role: "user", content: `SOURCES:\n\n${sourcesBlock(sources)}` }],
      }),
    {
      "gen_ai.request.model": model,
      "sources.count": sources.length,
      "sources.chars": sources.reduce((n, s) => n + s.text.length, 0),
      "tree.id": tree.id,
      "tree.version": tree.version,
    }
  );
  recordAiUsage(response.usage);

  if (response.stop_reason === "max_tokens") {
    throw new Error("The history check reply was cut off (max_tokens). Nothing was stored.");
  }
  const text = response.content.find((b) => b.type === "text");
  const raw: RawExtraction =
    text && text.type === "text" ? (JSON.parse(text.text) as RawExtraction) : { slots: [], wrong_patient: null };

  return {
    raw,
    model,
    usage: {
      input_tokens: response.usage.input_tokens ?? 0,
      output_tokens: response.usage.output_tokens ?? 0,
      cache_read_input_tokens: response.usage.cache_read_input_tokens ?? 0,
      cache_creation_input_tokens: response.usage.cache_creation_input_tokens ?? 0,
    },
  };
}

/**
 * Rough USD cost of one call, for the per-run log and the eval printout. First-party rates
 * per million tokens as of 2026-06; cache reads at a tenth, cache writes at 1.25x. Unknown
 * models return null rather than a wrong number.
 */
const RATES: Record<string, { input: number; output: number }> = {
  "claude-opus-5": { input: 5, output: 25 },
  "claude-sonnet-5": { input: 2, output: 10 },
  "claude-haiku-4-5": { input: 1, output: 5 },
};

export function estimateCostUsd(model: string, u: ExtractionUsage): number | null {
  const rate = RATES[model] ?? RATES[Object.keys(RATES).find((k) => model.startsWith(k)) ?? ""];
  if (!rate) return null;
  const m = 1_000_000;
  return (
    (u.input_tokens * rate.input +
      u.cache_read_input_tokens * rate.input * 0.1 +
      u.cache_creation_input_tokens * rate.input * 1.25 +
      u.output_tokens * rate.output) /
    m
  );
}
