import Anthropic from "@anthropic-ai/sdk";
import { AI_MODEL } from "@/lib/model";

/**
 * The last pass over a finished document — case history, progress note, discharge summary.
 * Sonnet reads the whole thing once and may only proofread it.
 *
 * WHY THE EDITS ARE SO NARROW. A finished document has already been reviewed by the resident,
 * so anything this pass changes is changed without a second look. The audit that prompted it
 * (a discharge summary with "Inscision", "500 mg 500 mg", "08/14/2026" beside "14/08/2026",
 * and "[ … as the perforation template ]" in print) needed two kinds of help: mechanical
 * clean-up nobody should have to do by hand, and clinical contradictions only the resident can
 * settle. The first is applied here; the second comes back as QUESTIONS and is never applied.
 *
 * The model's word alone is not enough for an edit (the lib/extract.ts rule). safeFix() checks
 * each one in code: its `before` must be a real span of the field, and its kind must hold —
 * a spelling fix is one word, at most two letters off, with the same hypo/hyper-type prefix;
 * punctuation may not touch a letter or digit; a repeat must be an exact repeat; a placeholder
 * must be a whole [ … ] span and never [illegible]. Anything else is dropped.
 *
 * FAILSAFE: no key, an error or the timeout returns the document exactly as it came in. This
 * pass can only ever make a document tidier; it can never stop one being finished.
 */

export type FixKind = "spelling" | "repeated_words" | "punctuation" | "placeholder" | "date_format" | "reworded";
export type FinalFix = { field: string; kind: FixKind; before: string; after: string };
export type FinalCheck = { fields: Record<string, string>; fixes: FinalFix[]; questions: string[] };

const TIMEOUT_MS = 25_000;
const MODEL_KINDS = new Set<FixKind>(["spelling", "repeated_words", "punctuation", "placeholder"]);
// A prefix that flips meaning. A two-letter "typo" between these is a different word.
const PREFIX = /^(hypo|hyper|intra|extra|inter|infra|supra|sub|pre|post|ante|anti|non|un|dys)/i;

function distance(a: string, b: string): number {
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++)
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    prev = cur;
  }
  return prev[b.length];
}

export function safeFix(text: string, fix: { kind: string; before: string; after: string }): boolean {
  const { kind, before, after } = fix;
  if (!before || before === after || !text.includes(before)) return false;
  switch (kind) {
    case "spelling": {
      const word = /^[A-Za-z][A-Za-z-]*$/;
      return (
        word.test(before) && word.test(after) && before.length >= 5 &&
        distance(before.toLowerCase(), after.toLowerCase()) <= 2 &&
        (before.match(PREFIX)?.[0] ?? "").toLowerCase() === (after.match(PREFIX)?.[0] ?? "").toLowerCase()
      );
    }
    case "repeated_words": {
      const m = /^(.+?)[\s,]+\1$/i.exec(before);
      return !!m && after === m[1];
    }
    case "punctuation": {
      const strip = (s: string) => s.replace(/[\s,.;:]/g, "");
      const numbers = (s: string) => (s.match(/\d[\d.,]*/g) ?? []).join("|");
      return strip(before) === strip(after) && numbers(before) === numbers(after);
    }
    case "placeholder":
      return /^\[[^\]]*\]$/.test(before.trim()) && !/illegible/i.test(before) && after === "";
    default:
      return false;
  }
}

/** A date that can only be month-first (day > 12) in a document that is day-first everywhere
 *  else. Deterministic, so not left to the model. */
const US_DATE = /\b(0?[1-9]|1[0-2])\/(1[3-9]|2\d|3[01])\/(\d{4}|\d{2})\b/g;

/** Apply the edits that pass safeFix, plus the US-date fix. Pure — the tested half. */
export function applyFixes(
  fields: Record<string, string>,
  proposed: { field: string; kind: string; before: string; after: string }[]
): { fields: Record<string, string>; fixes: FinalFix[] } {
  const out = { ...fields };
  const fixes: FinalFix[] = [];
  for (const p of proposed) {
    const text = out[p.field];
    if (text === undefined || !MODEL_KINDS.has(p.kind as FixKind) || !safeFix(text, p)) continue;
    const next = text.replace(p.before, p.after);
    out[p.field] = p.kind === "placeholder" ? next.replace(/ {2,}/g, " ").trim() : next;
    fixes.push({ field: p.field, kind: p.kind as FixKind, before: p.before, after: p.after });
  }
  for (const [field, text] of Object.entries(out)) {
    out[field] = text.replace(US_DATE, (before, m, d, y) => {
      const after = `${d.padStart(2, "0")}/${m.padStart(2, "0")}/${y}`;
      fixes.push({ field, kind: "date_format", before, after });
      return after;
    });
  }
  return { fields: out, fixes };
}

const SYSTEM = `You are the last proofreading pass over a finished clinical document written by a resident in an Indian hospital. It has already been reviewed. You do two things.

1. EDITS — only these four mechanical kinds, nothing else:
   - "spelling": one misspelt word to its correct spelling ("Inscision" -> "Incision"). before and after are single words.
   - "repeated_words": an accidental exact repeat ("500 mg 500 mg" -> "500 mg").
   - "punctuation": spacing or punctuation only ("soft , tender" -> "soft, tender").
   - "placeholder": an unfilled template instruction in square brackets, removed entirely (after is ""). Never remove [illegible].
   "before" must be copied exactly from the field, character for character.
   Never edit a number, unit, date, drug name, dose, side (left/right), or a negative. Never reword, complete or reorder anything.

2. QUESTIONS — anything else that looks wrong: dates that disagree, an event out of order, a finding filed under the wrong heading, garbled text whose meaning you would have to guess, a drug name or dose that looks wrong, a diagnosis the text does not support. Each is one short question to the resident ("The laparotomy is dated 29/08 here but 'the same day' in the course — which is right?"). Never a diagnosis, never an instruction. At most 8; the most important first. None if the document reads cleanly.

Return JSON: { "edits": [ { "field": string, "kind": string, "before": string, "after": string } ], "questions": string[] }.`;

const SCHEMA = {
  type: "object",
  properties: {
    edits: {
      type: "array",
      items: {
        type: "object",
        properties: {
          field: { type: "string" },
          kind: { type: "string", enum: ["spelling", "repeated_words", "punctuation", "placeholder"] },
          before: { type: "string" },
          after: { type: "string" },
        },
        required: ["field", "kind", "before", "after"],
        additionalProperties: false,
      },
    },
    questions: { type: "array", items: { type: "string" } },
  },
  required: ["edits", "questions"],
  additionalProperties: false,
} as const;

/** Run the pass. `what` names the document ("discharge summary"). Never throws. */
export async function finalCheck(fields: Record<string, string>, what: string): Promise<FinalCheck> {
  let proposed: { field: string; kind: string; before: string; after: string }[] = [];
  let questions: string[] = [];
  const key = process.env.ANTHROPIC_API_KEY;
  if (key && Object.keys(fields).length > 0) {
    try {
      const response = await new Anthropic({ apiKey: key }).messages.create(
        {
          model: AI_MODEL,
          max_tokens: 2000,
          system: [{ type: "text", text: SYSTEM, cache_control: { type: "ephemeral" } }],
          output_config: {
            effort: "low",
            format: { type: "json_schema", schema: SCHEMA as unknown as Record<string, unknown> },
          },
          messages: [{ role: "user", content: `The finished ${what}, field by field:\n\n${JSON.stringify(fields, null, 2)}` }],
        },
        { timeout: TIMEOUT_MS, maxRetries: 0 }
      );
      const block = response.content.find((b) => b.type === "text");
      const parsed = block && block.type === "text" ? JSON.parse(block.text) : {};
      proposed = Array.isArray(parsed.edits) ? parsed.edits : [];
      // Product rule: suggestions are questions. Anything else is dropped, not rephrased.
      questions = (Array.isArray(parsed.questions) ? parsed.questions : [])
        .map((q: unknown) => String(q).trim())
        .filter((q: string) => q.endsWith("?"))
        .slice(0, 8);
    } catch (e) {
      console.warn("final-check: skipped", e instanceof Error ? e.message : e);
    }
  }
  return { ...applyFixes(fields, proposed), questions };
}

// --- Rewording a prose paragraph -------------------------------------------------------
//
// The one place the pass may do more than proofread: a resident's own Clinical Course, typed as
// one run-on line ("…and advise was followed neurosurgery opinion taken…"), is re-punctuated and
// re-framed into sentences. Rewording can lose a fact the edit guards above cannot see, so the
// result is kept only if sameFacts() holds: every number, every left/right, every negative and
// roughly the same length. Otherwise the resident's text stays exactly as it was.

const SIDE = /\b(left|right|bilateral|l|r)\b/gi;
const NEGATIVE = /\b(no|not|nil|without|absent|negative|denied|denies|never)\b/gi;

function tally(text: string, re: RegExp): string {
  return (text.toLowerCase().match(re) ?? []).sort().join("|");
}

export function sameFacts(before: string, after: string): boolean {
  const words = (s: string) => s.split(/\s+/).filter(Boolean).length;
  const ratio = words(after) / Math.max(1, words(before));
  return (
    tally(before, /\d+(?:\.\d+)?/g) === tally(after, /\d+(?:\.\d+)?/g) &&
    tally(before, SIDE) === tally(after, SIDE) &&
    tally(before, NEGATIVE) === tally(after, NEGATIVE) &&
    ratio >= 0.7 && ratio <= 1.6
  );
}

const PROSE_SYSTEM = `You copy-edit one paragraph of a discharge summary written by a resident in an Indian hospital: fix punctuation, sentence boundaries, grammar and spelling, and frame it as clear clinical prose — third person, past tense, in the order the events are written.

Absolute rules:
1. Keep every fact, finding, opinion, drug, number, date, side (left/right) and negative. Add nothing — no event, reason, result or detail that is not already there. Remove nothing except accidental repeats.
2. Do not reorder events and do not change what caused what.
3. Keep numbers, units and dates exactly as written. Keep drug names exactly as written.
4. Expand ward shorthand only where it is unambiguous ("IV" to "intravenous", "Ortho" to "orthopaedic"); keep abbreviations a clinician expects (NCCT, USG, BP).
5. If the paragraph already reads cleanly, return it unchanged.

Return JSON: { "text": string }.`;

/** Re-frame a prose paragraph. Never throws; returns the input on failure or a failed guard. */
export async function polishProse(text: string, what: string): Promise<string> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key || !text.trim()) return text;
  try {
    const response = await new Anthropic({ apiKey: key }).messages.create(
      {
        model: AI_MODEL,
        max_tokens: 2000,
        system: [{ type: "text", text: PROSE_SYSTEM, cache_control: { type: "ephemeral" } }],
        output_config: {
          effort: "low",
          format: {
            type: "json_schema",
            schema: { type: "object", properties: { text: { type: "string" } }, required: ["text"], additionalProperties: false },
          },
        },
        messages: [{ role: "user", content: `The ${what}:\n\n${text}` }],
      },
      { timeout: TIMEOUT_MS, maxRetries: 0 }
    );
    const block = response.content.find((b) => b.type === "text");
    const out = String((block && block.type === "text" ? JSON.parse(block.text) : {}).text ?? "").trim();
    if (out && sameFacts(text, out)) return out;
    if (out) console.warn("final-check: rewording dropped, a fact did not survive");
  } catch (e) {
    console.warn("final-check: rewording skipped", e instanceof Error ? e.message : e);
  }
  return text;
}
