import Anthropic from "@anthropic-ai/sdk";

/**
 * One page out of a patient's file: what kind of paper it is, and what it says.
 *
 * "Prepare discharge" is handed a pile of photographs with nothing said about them, so the
 * first question is which paper each one is — the operation note and the drug chart of the
 * same patient produce completely different parts of a discharge summary. That answer is a
 * guess, and it is shown to the resident as a guess they can change before anything is stored.
 *
 * Transcription is the same job lib/read-case-sheet.ts does and is held to the same rule:
 * copy out what is written, never complete it. The transcript then goes through
 * correctTranscript and extractObservations exactly as a spoken note does, which is what makes
 * a photographed operation note land as real observations with a verbatim quote each, instead
 * of as a blob of text nothing can check.
 */
export const PAPER_KINDS = [
  { kind: "case_sheet", label: "Case sheet", hint: "Admission clerking — history, examination, provisional diagnosis, plan" },
  { kind: "ot_note", label: "OT note", hint: "Operation note — procedure, findings, post-op orders" },
  { kind: "lab_report", label: "Lab report", hint: "Printed results with reference ranges" },
  { kind: "prescription", label: "Prescription", hint: "The drug chart or discharge prescription" },
  { kind: "advice", label: "Advice / follow-up", hint: "Follow-up date, advice on discharge" },
  { kind: "other", label: "Something else", hint: "Read as plain text and kept as notes" },
] as const;

export type PaperKind = (typeof PAPER_KINDS)[number]["kind"];

export type ReadPaperResult = {
  kind: PaperKind;
  /** How sure the model was about the KIND, not about the words. */
  kindConfidence: "high" | "low";
  /** The page, copied out. Empty when nothing legible was found. */
  transcript: string;
  /** What could not be read — glare, a cut-off edge, handwriting. Shown to the resident so a
   *  half-read page is obvious before it is stored, rather than looking complete. */
  unreadable: string | null;
  /** Operation notes only. The operation as the note names it, and the date it gives, copied
   *  not interpreted. Offered to the resident to confirm — see the store route for why this is
   *  a question rather than something applied on its own. Null on every other kind of page,
   *  and null on an operation note that does not print them. */
  procedure: string | null;
  surgeryDate: string | null;
  model: string;
};

const SYSTEM_PROMPT = `You are handed ONE photograph of one page from a surgical patient's hospital file. You do two things: say which kind of paper it is, and transcribe it.

You are transcribing, not summarising, not interpreting, and not completing a medical record.

Absolute rules:

1. Transcribe only what you can actually read. Never complete a partial word from what it probably says. Never fill in a value that would make the page internally consistent. Never expand an abbreviation into what you assume it means. Where a word is illegible write [illegible] in its place.

2. Copy values exactly as written, including the units as written. "Hb 9.4" stays "Hb 9.4". Do not convert, round, or normalise anything.

3. Keep the order of the page. Keep the headings the page uses, on their own lines.

4. If a whole region is unreadable — glare, a fold, a cut-off edge, handwriting you cannot make out — say so in "unreadable" naming which part. Do not quietly leave it out.

5. If the photograph is not a page from a patient's file at all, use kind "other" and transcribe whatever text is visible.

The kinds:
- case_sheet: admission clerking sheet — complaints, history, examination, provisional diagnosis, plan.
- ot_note: operation note — date of surgery, procedure performed, findings, steps, post-operative orders.
- lab_report: printed laboratory results, usually with reference ranges.
- prescription: a drug chart or discharge prescription — drug names with dose, route, frequency, duration.
- advice: discharge advice, follow-up date, review instructions.
- other: anything else.

Set kindConfidence to "low" whenever the page could reasonably be two of these, or when you are reading it mostly from the layout rather than from what it says.

For an operation note ONLY, also pull out two things, copied and not interpreted:
- "procedure": the operation as the note names it, in the note's own words ("Laparoscopic cholecystectomy"). Null if the note does not name one.
- "surgeryDate": the date of surgery the note prints, as YYYY-MM-DD. Null if it prints no date, and null if the date is ambiguous about which number is the day and which the month — a date you had to choose between two readings of is not a date.
Both are null for every other kind of page.

Reply with a single JSON object and nothing else:
{"kind": "...", "kindConfidence": "high" | "low", "transcript": "...", "unreadable": null or "...", "procedure": null or "...", "surgeryDate": null or "YYYY-MM-DD"}`;

export async function readPaper(
  base64Image: string,
  mediaType: "image/jpeg" | "image/png" | "image/webp"
): Promise<ReadPaperResult> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const model = "claude-opus-5";

  const response = await client.messages.create({
    model,
    max_tokens: 4000,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: mediaType, data: base64Image } },
          { type: "text", text: "Which paper is this, and what does it say?" },
        ],
      },
    ],
  });

  const text = response.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("")
    .trim();

  const parsed = parseJson(text);
  const kind = (PAPER_KINDS.find((k) => k.kind === parsed.kind)?.kind ?? "other") as PaperKind;

  return {
    kind,
    kindConfidence: parsed.kindConfidence === "high" ? "high" : "low",
    transcript: typeof parsed.transcript === "string" ? parsed.transcript.trim() : "",
    unreadable:
      typeof parsed.unreadable === "string" && parsed.unreadable.trim()
        ? parsed.unreadable.trim()
        : null,
    procedure:
      kind === "ot_note" && typeof parsed.procedure === "string" && parsed.procedure.trim()
        ? parsed.procedure.trim()
        : null,
    // Only a date this app can act on. Anything else is left for the resident to type, rather
    // than stored as a guess about which number was the month.
    surgeryDate:
      kind === "ot_note" &&
      typeof parsed.surgeryDate === "string" &&
      /^\d{4}-\d{2}-\d{2}$/.test(parsed.surgeryDate.trim())
        ? parsed.surgeryDate.trim()
        : null,
    model,
  };
}

/** The model is asked for bare JSON; a fenced block is tolerated rather than failing the page. */
function parseJson(text: string): Record<string, unknown> {
  const body = text.startsWith("```")
    ? text.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "")
    : text;
  try {
    return JSON.parse(body) as Record<string, unknown>;
  } catch {
    throw new Error("Could not read that photo — the reply was not in the expected form.");
  }
}
