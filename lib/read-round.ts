import Anthropic from "@anthropic-ai/sdk";
import { AI_MODEL } from "@/lib/model";

export type RoundSegment = {
  /** The bed as spoken — "1", "SW-12", "ICU-3". Empty if none was said. */
  bed: string;
  /** "update" for an instruction about someone already on the ward, "new_patient" to admit. */
  intent: "update" | "new_patient";
  /** The words for this bed alone, copied verbatim from the transcript. */
  text: string;
  /** Details spoken while admitting someone. Every field null unless it was actually said. */
  new_patient: {
    name: string | null;
    age_years: number | null;
    sex: "M" | "F" | "other" | null;
    diagnosis: string | null;
  } | null;
  /** The speech was unclear, the bed was ambiguous, or the split is uncertain. */
  uncertain: boolean;
};

export type RoundResult = {
  segments: RoundSegment[];
  model: string;
  raw: unknown;
};

const SYSTEM_PROMPT = `You split a surgical resident's dictation of a whole ward round into one segment per bed.

You are splitting speech, not interpreting medicine. Do not decide what the instructions mean, do not expand them, and do not judge whether they are complete. Something else does that afterwards, one bed at a time.

Absolute rules:

1. "text" must be copied VERBATIM from the transcript — an exact, contiguous span of its own characters. Not a paraphrase, not a tidied version. Everything said about that bed, and nothing said about any other bed. If you cannot copy an exact span, do not emit the segment.

2. Never invent a bed, a patient, an instruction, or a detail. If the resident said "bed 4" and then nothing before moving to bed 5, bed 4 gets no segment. Returning fewer segments than there are beds on the ward is normal and expected — a round rarely mentions everyone.

3. Every word of the transcript that belongs to a bed must end up in exactly one segment. Do not carry words sideways between beds. When you cannot tell which bed a phrase belongs to, attach it to the bed it follows and set uncertain to true.

4. Set uncertain to true whenever the bed is unclear or was never said, the audio evidently garbled, or you are unsure where one bed's words end and the next begin. Flagging is expected; guessing which patient an instruction is about is the one thing that must not happen.

5. If the transcript contains no bed at all, return an empty list. That is a correct answer.

Two intents:

- "update": anything about a patient already on the ward. This is the common case. Set new_patient to null.
- "new_patient": the resident is admitting somebody — "add another patient on bed 5", "new patient bed 12", "admit to bed 3". Fill new_patient with ONLY what was actually said. A field nobody stated is null. Do not infer sex from a name. Do not infer age from anything.

For new_patient, "diagnosis" is what they are in with, as said — "abdominal lump", "for abdominal lump workup" gives "abdominal lump". Words about what is being done ("workup", "for surgery") belong in text, not in the diagnosis.

The bed field: copy the bed as spoken, without the word "bed". "bed number 5" gives "5". "bed SW-12" gives "SW-12".`;

const SCHEMA = {
  type: "object",
  properties: {
    segments: {
      type: "array",
      items: {
        type: "object",
        properties: {
          bed: { type: "string" },
          intent: { type: "string", enum: ["update", "new_patient"] },
          text: {
            type: "string",
            description: "A verbatim, contiguous span copied from the transcript.",
          },
          new_patient: {
            anyOf: [
              {
                type: "object",
                properties: {
                  name: { anyOf: [{ type: "string" }, { type: "null" }] },
                  age_years: { anyOf: [{ type: "integer" }, { type: "null" }] },
                  sex: {
                    anyOf: [{ type: "string", enum: ["M", "F", "other"] }, { type: "null" }],
                  },
                  diagnosis: { anyOf: [{ type: "string" }, { type: "null" }] },
                },
                required: ["name", "age_years", "sex", "diagnosis"],
                additionalProperties: false,
              },
              { type: "null" },
            ],
          },
          uncertain: { type: "boolean" },
        },
        required: ["bed", "intent", "text", "new_patient", "uncertain"],
        additionalProperties: false,
      },
    },
  },
  required: ["segments"],
  additionalProperties: false,
} as const;

/**
 * Split one dictation into per-bed segments.
 *
 * `wardBeds` is passed only so spoken beds can be recognised in the unit's own notation — it
 * grants no permission to invent a segment for a bed nobody mentioned, and the matching that
 * actually decides which patient is meant happens afterwards, in code, where it can be shown
 * to the resident.
 */
export async function readRoundDictation(
  transcript: string,
  wardBeds: string[] = []
): Promise<RoundResult> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error("ANTHROPIC_API_KEY is not set on the server.");

  const model = AI_MODEL;
  const client = new Anthropic({ apiKey: key });

  const beds =
    wardBeds.length > 0
      ? `\n\nThe beds on this ward are: ${wardBeds.join(", ")}. Use these to recognise how this unit names its beds. A bed on this list being unmentioned in the transcript means it gets no segment — never create one for it.`
      : "";

  const response = await client.messages.create({
    model,
    max_tokens: 8000,
    system: SYSTEM_PROMPT + beds,
    // Getting a boundary wrong here puts one patient's instruction onto another patient, so
    // this is the last read that should be economised on. It is still set to "medium": "high"
    // is off across the whole app for now, on cost. The escalation path if per-bed accuracy
    // slips is to put this back to "high" or move to Opus (see lib/model.ts) once there is
    // funding for it — not to leave it here and hope.
    output_config: {
      effort: "medium",
      format: { type: "json_schema", schema: SCHEMA as unknown as Record<string, unknown> },
    },
    messages: [{ role: "user", content: `Transcript:\n\n${transcript}` }],
  });

  const text = response.content.find((b) => b.type === "text");
  const parsed = text && text.type === "text" ? JSON.parse(text.text) : { segments: [] };
  const candidates: RoundSegment[] = parsed.segments ?? [];

  // THE ENFORCEMENT STEP, same as the bedside extraction: a segment whose words are not
  // actually in the transcript is discarded rather than shown. A segment invented whole has
  // nothing to copy, so it cannot survive this.
  const haystack = normalise(transcript);
  const segments = candidates.filter((s) => {
    const span = normalise(s.text ?? "");
    return span.length > 0 && haystack.includes(span);
  });

  return { segments, model, raw: parsed };
}

function normalise(s: string): string {
  return s.toLowerCase().replace(/\s+/g, " ").trim();
}
