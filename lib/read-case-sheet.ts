import Anthropic from "@anthropic-ai/sdk";
import { AI_MODEL } from "@/lib/model";

export type CaseSheetResult = {
  /** The whole page, transcribed. Fed into extractObservations exactly like a spoken
   *  transcript — see the API route for why that reuse matters. */
  transcript: string;
  model: string;
  raw: unknown;
};

const SYSTEM_PROMPT = `You transcribe a photograph of a surgical admission clerking sheet — history, examination findings, provisional diagnosis, plan of management, whatever the page holds.

You are transcribing, not summarising and not interpreting. Copy out what is written, in the order it is written.

Absolute rules:

1. Transcribe only what you can actually read. Never complete a partial word from what it probably says, never fill in a value that would make the note internally consistent, never expand an abbreviation into what you assume it means. If a word is illegible, write [illegible] in its place rather than guessing at it.

2. Preserve the page's own structure as plain text — headings, line breaks — so somebody reading the transcript can still tell "History" from "O/E" from "Plan". Do not reorganise it into a different structure than the one on the page.

3. Handwriting is often uneven. Where you are genuinely unsure between two readings, write the one you believe is correct — do not hedge inline with "or" — but keep in mind that whatever you write here becomes the ONLY thing the next step can quote from, so a wrong guess here cannot be caught downstream. When truly illegible, [illegible] is the honest answer, not a guess dressed as one.

4. If the image is not this kind of document, or nothing on it is legible, return an empty transcript. That is a correct answer, not a failure.

Output the transcript as one block of plain text.`;

const SCHEMA = {
  type: "object",
  properties: {
    transcript: { type: "string" },
  },
  required: ["transcript"],
  additionalProperties: false,
} as const;

/**
 * A photographed case sheet, turned into plain text.
 *
 * Deliberately NOT its own structured extraction, unlike lib/read-lab-photo.ts. A clerking
 * sheet is prose and headings, not a table of values, and forcing it into a narrow schema here
 * would mean either inventing one wide enough to hold history and exam and a plan of
 * management, or losing whatever did not fit it.
 *
 * Instead this produces a transcript and nothing else, and the caller runs it through the exact
 * same extractObservations() a spoken round uses. That gets the diagnosis/vital/exam/plan
 * vocabulary for free, and — the actual point — it means the verbatim-quote check in
 * lib/extract.ts applies here too: an observation pulled from this transcript still has to
 * quote a real span of it. What the check CANNOT do is verify this transcript against the
 * photograph itself; nothing on the server can re-read an image. So the same caveat as the lab
 * photo route holds — the photo is kept and shown as the evidence, and this is why the API
 * route marks everything from this path needs_confirmation regardless of kind.
 */
export async function readCaseSheet(
  base64Image: string,
  mediaType: "image/jpeg" | "image/png" | "image/webp"
): Promise<CaseSheetResult> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error("ANTHROPIC_API_KEY is not set on the server.");

  const model = AI_MODEL;
  const client = new Anthropic({ apiKey: key });

  const response = await client.messages.create({
    model,
    max_tokens: 8000,
    system: SYSTEM_PROMPT,
    // Same tier as the lab photo: reading handwriting off a ward-lit phone photo is harder
    // than parsing clean speech, and a case sheet is usually a fuller page than a lab slip.
    output_config: {
      effort: "medium",
      format: { type: "json_schema", schema: SCHEMA as unknown as Record<string, unknown> },
    },
    messages: [
      {
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: mediaType, data: base64Image } },
          { type: "text", text: "Transcribe this case sheet." },
        ],
      },
    ],
  });

  const text = response.content.find((b) => b.type === "text");
  const parsed =
    text && text.type === "text" ? JSON.parse(text.text) : { transcript: "" };

  return { transcript: String(parsed.transcript ?? ""), model, raw: parsed };
}
