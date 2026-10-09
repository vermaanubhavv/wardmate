import Anthropic from "@anthropic-ai/sdk";
import { FAST_MODEL } from "@/lib/model";
import { correctTranscript } from "@/lib/glossary";
import { log } from "@/lib/observability";
import { askJev, chosenProbability, type JevAnswers } from "@/lib/jev";
import { MIN_PROBABILITY, splitSentences } from "@/lib/case-history-routing";

/**
 * Live dictation routing for any form — the progress note, the discharge summary. The same
 * SORTING step as lib/case-history-routing.ts (which stays the clerking's router, with its
 * specialty packs), but the sections come from the screen that is open: each one a key, a
 * label and a one-line hint of what goes there.
 *
 * TypeSafe (Jev) first, Haiku as the failsafe — the clerking's arrangement. Jev only LABELS:
 * each sentence is filed whole, in the doctor's words. A sentence mixing two sections, a label
 * Jev is unsure of, a "the value only" section (taking just "120/80" out of "BP is 120 by 80"
 * is writing, not labelling), no key, an error — any of these sends the whole fragment to
 * Haiku. No TYPESAFE_API_KEY means Haiku only, exactly as before.
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

  const corrected = (await correctTranscript(text)).text.trim() || text;

  if (process.env.TYPESAFE_API_KEY) {
    const first = await routeWithJev(corrected, sections);
    if ("lines" in first) return first.lines;
    // The reason only, never the dictation.
    log.info("route-dictation: TypeSafe declined, using Haiku", { reason: first.fallback });
  }
  return routeWithHaiku(corrected, sections);
}

const NONE = "__none";
const valueOnly = (s: DictationSection) => /the value only/i.test(s.hint ?? "");

async function routeWithJev(
  corrected: string,
  sections: DictationSection[]
): Promise<{ lines: DictationLine[] } | { fallback: string }> {
  const sentences = splitSentences(corrected);
  const criteria: Record<string, string> = {};
  for (const s of sections) criteria[s.key] = s.hint ? `${s.label} — ${s.hint}` : s.label;
  criteria[NONE] = `filler ("okay", "next", "let me see") or nothing that belongs on this form`;

  const questions: Record<string, unknown> = {};
  sentences.forEach((_, i) => {
    questions[`section_${i}`] = {
      type: "choice",
      instructions: `Which section of the form the doctor is filling does \`sentences[${i}]\` belong in? It is part of a ward note dictated out of order.`,
      criteria,
    };
    questions[`mixed_${i}`] = {
      type: "noul",
      instructions: `Does \`sentences[${i}]\` contain material for more than one section of the form (for example a vital sign and an examination finding)?`,
    };
  });

  const jev = await askJev({ sentences }, questions);
  if ("fallback" in jev) return jev;
  return linesFromJev(sentences, jev.answers, sections);
}

/** Jev's answers to lines, or the reason to hand the fragment to Haiku instead. All or nothing:
 *  a fragment is never half-filed by one router and half by the other. */
export function linesFromJev(
  sentences: string[],
  answers: JevAnswers,
  sections: DictationSection[]
): { lines: DictationLine[] } | { fallback: string } {
  const byKey = new Map(sections.map((s) => [s.key, s]));
  const lines: DictationLine[] = [];
  for (let i = 0; i < sentences.length; i++) {
    const section = answers[`section_${i}`];
    const mixed = answers[`mixed_${i}`]?.noul;
    if (!section?.choice || mixed == null) return { fallback: "missing answer" };
    if (mixed >= 0.5) return { fallback: "mixed sentence" };
    if (chosenProbability(section) < MIN_PROBABILITY) return { fallback: "unsure section" };
    if (section.choice === NONE) continue;
    const offered = byKey.get(section.choice);
    if (!offered) return { fallback: "section not on this form" };
    if (valueOnly(offered)) return { fallback: "value-only section" };
    lines.push({ section: offered.key, text: sentences[i] });
  }
  return { lines };
}

async function routeWithHaiku(corrected: string, sections: DictationSection[]): Promise<DictationLine[]> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not set on the server.");
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
