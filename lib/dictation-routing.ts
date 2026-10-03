import Anthropic from "@anthropic-ai/sdk";
import { FAST_MODEL } from "@/lib/model";
import { correctTranscript } from "@/lib/glossary";

/**
 * Live dictation routing for any form — the progress note, the discharge summary. The same
 * SORTING step as lib/case-history-routing.ts (which stays the clerking's router, with its
 * specialty packs and Jev path), but the sections come from the screen that is open: each one
 * a key, a label and a one-line hint of what goes there.
 *
 * Nothing is stored here. The caller drops each line into its card's local state, where the
 * resident sees it land, edits it, and saves it the way the card always saves.
 */

export type DictationSection = { key: string; label: string; hint?: string };
export type DictationLine = { section: string; text: string };

const SYSTEM = `You sort one fragment of a doctor's dictation into the sections of the form they are filling. They dictate out of order and pause between thoughts; you get one pause-delimited fragment at a time, plus the form's sections.

Rules:
1. Output the doctor's own words. Fix obvious mis-hearings and punctuation only. Never add a symptom, sign, value, drug, dose, duration or negative that was not said. Never complete a trailing sentence.
2. One fragment may hold more than one thing — split it into several lines, each in its section.
3. A section described as "the value only" takes just the spoken value ("BP is 120 by 80" → "120/80").
4. Filler ("okay", "next", "let me see") or anything you cannot place confidently: return no line for it.
5. Do not resolve contradictions with anything said earlier — just file what this fragment says.

Return JSON: { "lines": [ { "section": string, "text": string } ] }.`;

/** Only a section the form offered, only non-empty text. The model's word alone never adds a
 *  section the screen does not have. */
export function keepOffered(raw: unknown, sections: DictationSection[]): DictationLine[] {
  const keys = new Set(sections.map((s) => s.key));
  const lines = (raw as { lines?: unknown })?.lines;
  const out: DictationLine[] = [];
  for (const l of Array.isArray(lines) ? lines : []) {
    const r = l as Record<string, unknown>;
    const section = String(r.section ?? "");
    const text = String(r.text ?? "").trim();
    if (text && keys.has(section)) out.push({ section, text });
  }
  return out;
}

export async function routeToSections(
  chunk: string,
  sections: DictationSection[]
): Promise<DictationLine[]> {
  const text = chunk.trim();
  if (!text || sections.length === 0) return [];
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not set on the server.");

  const corrected = (await correctTranscript(text)).text.trim() || text;
  const list = sections.map((s) => `- "${s.key}" — ${s.label}${s.hint ? `: ${s.hint}` : ""}`).join("\n");

  const response = await new Anthropic({ apiKey }).messages.create({
    model: FAST_MODEL,
    max_tokens: 700,
    system: [{ type: "text", text: SYSTEM, cache_control: { type: "ephemeral" } }],
    output_config: {
      format: {
        type: "json_schema",
        schema: {
          type: "object",
          properties: {
            lines: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  section: { type: "string", enum: sections.map((s) => s.key) },
                  text: { type: "string" },
                },
                required: ["section", "text"],
                additionalProperties: false,
              },
            },
          },
          required: ["lines"],
          additionalProperties: false,
        },
      },
    },
    messages: [{ role: "user", content: `Sections of this form:\n${list}\n\nFragment:\n${corrected}` }],
  });

  const block = response.content.find((b) => b.type === "text");
  return keepOffered(block && block.type === "text" ? JSON.parse(block.text) : null, sections);
}
