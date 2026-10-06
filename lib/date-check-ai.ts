import Anthropic from "@anthropic-ai/sdk";
import { FAST_MODEL } from "@/lib/model";
import { dateQuestions, groundedDates, structuredDateQuestions, type DateAnchors } from "@/lib/date-check";

/** Haiku's half of the date check: it reads the dates out of the free text. The comparisons,
 *  and why the work is split this way, are in lib/date-check.ts. */

const TIMEOUT_MS = 15_000;

const SYSTEM = `You list every calendar date written in the text of a hospital discharge summary. You only read; you do not judge whether a date is right.

For each date give:
- quote: the exact words around the date, copied character for character from the text, at most about 12 words, including the date itself.
- date: the date as YYYY-MM-DD. The hospital writes dates day-first (dd/mm/yyyy); a two-digit year is 20yy. If the text writes 08/14/2026, the day is 14 and the month 08.
- event: what happened on that date, in two to four lowercase words ("exploratory laparotomy", "admission", "laparoscopic cholecystectomy").
- this_admission: true if the event happened during the hospital stay this summary covers, false for past history (an earlier operation, a diagnosis made years ago).

Skip a date you cannot read unambiguously. Skip relative dates ("the same day", "POD 3"). Return { "dates": [] } if there are none.`;

const SCHEMA = {
  type: "object",
  properties: {
    dates: {
      type: "array",
      items: {
        type: "object",
        properties: {
          quote: { type: "string" },
          date: { type: "string" },
          event: { type: "string" },
          this_admission: { type: "boolean" },
        },
        required: ["quote", "date", "event", "this_admission"],
        additionalProperties: false,
      },
    },
  },
  required: ["dates"],
  additionalProperties: false,
} as const;

/** Haiku reads the dates, code compares them. Never throws. */
export async function checkDates(text: string, anchors: DateAnchors): Promise<string[]> {
  const structured = structuredDateQuestions(anchors);
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key || !text.trim()) return structured;
  try {
    const response = await new Anthropic({ apiKey: key }).messages.create(
      {
        model: FAST_MODEL,
        max_tokens: 1500,
        system: [{ type: "text", text: SYSTEM, cache_control: { type: "ephemeral" } }],
        // No `effort`: Haiku rejects it with a 400 (see lib/final-check.ts).
        output_config: { format: { type: "json_schema", schema: SCHEMA as unknown as Record<string, unknown> } },
        messages: [{ role: "user", content: text }],
      },
      { timeout: TIMEOUT_MS, maxRetries: 0 }
    );
    const block = response.content.find((b) => b.type === "text");
    const raw: Record<string, unknown>[] = (block && block.type === "text" ? JSON.parse(block.text).dates : null) ?? [];
    const found = groundedDates(
      raw.map((d) => ({
        quote: String(d.quote ?? ""),
        date: String(d.date ?? ""),
        event: String(d.event ?? ""),
        thisAdmission: d.this_admission === true,
      })),
      text
    );
    return [...new Set([...structured, ...dateQuestions(found, anchors)])];
  } catch (e) {
    console.warn("date-check: skipped", e instanceof Error ? e.message : e);
    return structured;
  }
}
