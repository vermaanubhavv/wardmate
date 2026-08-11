import Anthropic from "@anthropic-ai/sdk";

export type ReadLabValue = {
  label: string;
  value_text: string;
  value_num: number | null;
  unit: string | null;
  /** The line as printed on the report, copied exactly. */
  source_quote: string;
  /** True when the printing is unclear — blurred, cut off, handwritten, glare. */
  uncertain: boolean;
};

export type LabPhotoResult = {
  values: ReadLabValue[];
  /** What kind of report it appears to be, as printed. Empty if not stated. */
  report_type: string;
  model: string;
  raw: unknown;
};

const SYSTEM_PROMPT = `You read a photograph of a laboratory report and transcribe the values printed on it.

You are transcribing, not interpreting. You are not being asked what the values mean, whether they are normal, or what should be done about them.

Absolute rules:

1. Report ONLY values you can actually read in the image. Never supply a value from typical reference ranges, from what a test usually shows, or from what would make the report internally consistent. If a number is illegible, do not guess it.

2. source_quote must be the line as printed on the report, copied character for character as best you can read it — including the test name and the value as they appear together. It is what a human will check the photograph against.

3. Set uncertain to true for any value where the printing is blurred, cropped, obscured by glare, handwritten, or where you are reading against a fold or shadow. A wrong lab value is more dangerous than a missing one, so prefer flagging over guessing. When a digit could plausibly be two different digits, it is uncertain.

4. Do not convert units, do not round, and do not reformat. If the report prints "11.2 gm%", that is the value_text — not "11.2 g/dL".

5. Reference ranges printed beside a result are NOT values. Do not report them as results.

6. If the image is not a laboratory report, or no values are legible, return an empty list. That is a correct answer.

For value_num, give the number alone when the result is numeric; otherwise null. For qualitative results ("positive", "nil", "trace"), put the word in value_text and leave value_num null.`;

const SCHEMA = {
  type: "object",
  properties: {
    report_type: { type: "string" },
    values: {
      type: "array",
      items: {
        type: "object",
        properties: {
          label: { type: "string" },
          value_text: { type: "string" },
          value_num: { type: ["number", "null"] },
          unit: { type: ["string", "null"] },
          source_quote: { type: "string" },
          uncertain: { type: "boolean" },
        },
        required: ["label", "value_text", "value_num", "unit", "source_quote", "uncertain"],
        additionalProperties: false,
      },
    },
  },
  required: ["report_type", "values"],
  additionalProperties: false,
} as const;

export async function readLabPhoto(
  base64Image: string,
  mediaType: "image/jpeg" | "image/png" | "image/webp"
): Promise<LabPhotoResult> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error("ANTHROPIC_API_KEY is not set on the server.");

  const model = "claude-opus-5";
  const client = new Anthropic({ apiKey: key });

  const response = await client.messages.create({
    model,
    max_tokens: 8000,
    system: SYSTEM_PROMPT,
    // Higher effort than the voice path: reading small print off a phone photo taken at an
    // angle under ward lighting is genuinely harder than parsing a clean sentence, and a
    // misread digit here is a wrong lab value.
    output_config: {
      effort: "medium",
      format: { type: "json_schema", schema: SCHEMA as unknown as Record<string, unknown> },
    },
    messages: [
      {
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: mediaType, data: base64Image } },
          { type: "text", text: "Transcribe the values printed on this report." },
        ],
      },
    ],
  });

  const text = response.content.find((b) => b.type === "text");
  const parsed =
    text && text.type === "text" ? JSON.parse(text.text) : { values: [], report_type: "" };

  return {
    values: parsed.values ?? [],
    report_type: parsed.report_type ?? "",
    model,
    raw: parsed,
  };
}
