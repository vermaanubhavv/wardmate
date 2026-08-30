import Anthropic from "@anthropic-ai/sdk";
import { AI_MODEL } from "@/lib/model";

export type RegisterRow = {
  /** Patient name as written in the register. Empty if the row has none. */
  name: string;
  /** Bed as written, if the register records one. */
  bed: string;
  /** The whole row copied as written — the thing a human checks against the photo. */
  source_quote: string;
  /** Anything clinical recorded on the row, one per finding, as written. */
  findings: { label: string; value_text: string }[];
  /** Anything to be done, as written. */
  plans: string[];
  /** Handwriting unclear, cut off, overwritten, or ambiguous. */
  uncertain: boolean;
};

export type RegisterResult = {
  rows: RegisterRow[];
  model: string;
  raw: unknown;
};

const SYSTEM_PROMPT = `You read a photograph of a hospital ward round register and transcribe what is written in it, one entry per patient.

You are transcribing handwriting, not interpreting medicine. You are not being asked what the entries mean or whether they are complete.

Absolute rules:

1. Transcribe ONLY what is written on the page. Never add a finding, a plan, a bed number, or a patient that is not there. Never complete a half-written entry with what would normally follow. A register row that records only a name and a diagnosis yields exactly that — no invented observations.

2. Do NOT carry information sideways between rows. If one patient's row records a temperature and the next does not, the next patient has no temperature. Registers are laid out in columns and it is easy to read a value off the wrong line — when you are unsure which row a value belongs to, mark that row uncertain rather than assigning it.

3. source_quote must be the row as written, copied as closely as you can read it. It is what a human will check the photograph against.

4. Set uncertain to true whenever the handwriting is hard to read, the row is cut off at the edge of the photo, words are overwritten or struck through, or you are unsure which row a value belongs to. A register is handwritten under time pressure; flagging is expected and is much safer than guessing.

5. Keep the writer's own words and units. Do not expand abbreviations, do not convert units, do not tidy phrasing. "abd soft" stays "abd soft".

6. If the image is not a ward register, or nothing is legible, return an empty list of rows. That is a correct answer.

7. Every written column of a row must end up somewhere in your output. A register is usually ruled into columns with headings such as BED, NAME, DIAGNOSIS, POD, FINDINGS, ADVICE, PLAN, TREATMENT or REMARKS. Work across the row column by column and account for all of them. Silently dropping a column — the advice column especially — loses the instructions the round depends on.

Splitting the row:
- findings: things observed or measured — temperature, examination findings, drain output, oral intake, lab values. Usually the FINDINGS column, plus the diagnosis and post-operative day.
- plans: things to be done or to continue — "remove drain tomorrow", "repeat CBC", "plan discharge", "continue antibiotics", "NPO from 10 pm". This is usually the ADVICE, PLAN or TREATMENT column, and it is often the last column on the page. Split a cell holding several instructions into one entry each.
- Anything you cannot confidently place as one or the other belongs in findings, with the text as written.`;

const SCHEMA = {
  type: "object",
  properties: {
    rows: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          bed: { type: "string" },
          source_quote: { type: "string" },
          findings: {
            type: "array",
            items: {
              type: "object",
              properties: {
                label: { type: "string" },
                value_text: { type: "string" },
              },
              required: ["label", "value_text"],
              additionalProperties: false,
            },
          },
          plans: { type: "array", items: { type: "string" } },
          uncertain: { type: "boolean" },
        },
        required: ["name", "bed", "source_quote", "findings", "plans", "uncertain"],
        additionalProperties: false,
      },
    },
  },
  required: ["rows"],
  additionalProperties: false,
} as const;

export async function readRegister(
  base64Image: string,
  mediaType: "image/jpeg" | "image/png" | "image/webp"
): Promise<RegisterResult> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error("ANTHROPIC_API_KEY is not set on the server.");

  const model = AI_MODEL;
  const client = new Anthropic({ apiKey: key });

  const response = await client.messages.create({
    model,
    // A full register page is many rows of handwriting; give it room.
    max_tokens: 16000,
    system: SYSTEM_PROMPT,
    // The highest effort of the three AI paths. This is dense handwriting, read once, and
    // the consequence of getting a row boundary wrong is a value on the wrong patient.
    output_config: {
      effort: "high",
      format: { type: "json_schema", schema: SCHEMA as unknown as Record<string, unknown> },
    },
    messages: [
      {
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: mediaType, data: base64Image } },
          {
            type: "text",
            text: "Transcribe this ward round register, one entry per patient.",
          },
        ],
      },
    ],
  });

  const text = response.content.find((b) => b.type === "text");
  const parsed = text && text.type === "text" ? JSON.parse(text.text) : { rows: [] };

  return { rows: parsed.rows ?? [], model, raw: parsed };
}
