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
  /** The reference range printed beside this result, read off the report — never supplied
   *  from general knowledge. Null on all three when the report does not print one. */
  ref_low: number | null;
  ref_high: number | null;
  /** The range as printed, e.g. "13.0 - 17.0". Checkable against the photo like source_quote. */
  ref_text: string | null;
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

5. Reference ranges printed beside a result are NOT values — never report a range as a result of its own. But DO capture the range against the result it belongs to, in ref_low, ref_high and ref_text.

   Rule 1 applies to a range exactly as hard as to a value: read it off the report or leave it null. Never supply the range you know a test usually has. If the report prints no range for that result, or the range is illegible, all three fields are null — that is the correct answer, and a missing range is harmless whereas an invented one would make a normal result look deranged or, far worse, a deranged one look normal.

   ref_text is the range as printed, character for character — "13.0 - 17.0", "3.5–5.1 mmol/L", "< 5", "Up to 40". ref_low and ref_high are the two numbers of that range. For a one-sided range printed as "< 5" or "Up to 40", ref_low is 0 and ref_high is the number. For "> 60", ref_low is the number and ref_high is null. Where the range is qualitative ("Negative", "Nil"), put it in ref_text and leave both numbers null.

   Where a report prints separate male and female ranges side by side, use ref_text to record what is printed and leave ref_low and ref_high null unless the report itself marks which one applies to this patient. Choosing between them is not transcription.

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
          ref_low: { type: ["number", "null"] },
          ref_high: { type: ["number", "null"] },
          ref_text: {
            type: ["string", "null"],
            description: "The reference range exactly as printed beside this result, or null.",
          },
        },
        required: [
          "label",
          "value_text",
          "value_num",
          "unit",
          "source_quote",
          "uncertain",
          "ref_low",
          "ref_high",
          "ref_text",
        ],
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
    // Cached: fixed prompt, and lab reports arrive several at a time.
    system: [{ type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
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
