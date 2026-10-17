/**
 * Sonnet 5.5 writes synthetic ward-round dictations with known answers for the extraction route;
 * code keeps only the cases it can verify. Output: scripts/eval-models/library/extract.json,
 * committed, and run as set D by cases.ts.
 *
 *   node --env-file=.env.eval --import ./scripts/alias-register.mjs scripts/eval-models/generate.ts --batches 30
 *
 * Every patient is invented. A case is dropped unless every finding's quote is verbatim in its
 * transcript and no "never said" word (or synonym) appears in it — so nothing in the library
 * rests on the writer's word alone. Spend is booked in the shared ledger (.eval-models/).
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import Anthropic from "@anthropic-ai/sdk";

const arg = (n: string) => {
  const i = process.argv.indexOf(`--${n}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
};
const CALLS = Number(arg("batches") ?? 30);
const PER_CALL = 10;
const OUT = new URL("./library/extract.json", import.meta.url);
const LEDGER = ".eval-models/ledger.json";

export type LibraryCase = {
  id: string;
  specialty: string;
  transcript: string;
  findings: { what: string; quote: string; confirm: boolean }[];
  never_said: { label: string; synonyms: string[] }[];
};

const THEMES = [
  "post-operative day rounds after common general-surgery operations",
  "medicine ward: diabetes, heart failure, pneumonia, CKD",
  "orthopaedic ward: fractures, traction, post-op limbs",
  "paediatric ward: fever, dehydration, weights in kg",
  "obstetrics and gynaecology ward: post-caesarean, PIH",
  "emergency admissions dictated in a hurry, half sentences",
  "Hinglish dictation (Hindi words in Roman script mixed with English)",
  "numbers and doses spoken as words ('one gram', 'ninety eight')",
  "explicit negatives next to things simply not mentioned",
  "lab results read out from a report",
];

const SYSTEM = `You write synthetic test cases for a hospital app that turns a resident's spoken ward-round dictation (already transcribed to text) into structured observations. Every patient is invented; never use a real person or hospital.

For each case write:
- transcript: 1–4 sentences as an Indian resident actually dictates — abbreviations, run-ons, no names except occasionally an invented first name.
- findings: every clinical item the transcript states (vital, exam, lab, drug, dose, plan, complaint, history, negative). "quote" is copied CHARACTER FOR CHARACTER from the transcript (a contiguous span). "confirm" is true when the item contains a number, a drug name, a dose, a route or a frequency.
- never_said: 2–4 things a reader might expect for this patient that the transcript does NOT mention at all (e.g. temperature, pulse, haemoglobin, drain). "label" is one lowercase word or two; "synonyms" are the other words a model might use for it ("temperature" → ["temp","fever","febrile"]). None of these words may appear anywhere in the transcript.

Vary specialties, length and style. Make some cases deliberately tempting: a familiar context where a typical value is NOT said.`;

const SCHEMA = {
  type: "object",
  properties: {
    cases: {
      type: "array",
      items: {
        type: "object",
        properties: {
          specialty: { type: "string", enum: ["general_surgery", "internal_medicine", "orthopaedics", "paediatrics", "obstetrics_gynaecology"] },
          transcript: { type: "string" },
          findings: {
            type: "array",
            items: {
              type: "object",
              properties: { what: { type: "string" }, quote: { type: "string" }, confirm: { type: "boolean" } },
              required: ["what", "quote", "confirm"],
              additionalProperties: false,
            },
          },
          never_said: {
            type: "array",
            items: {
              type: "object",
              properties: { label: { type: "string" }, synonyms: { type: "array", items: { type: "string" } } },
              required: ["label", "synonyms"],
              additionalProperties: false,
            },
          },
        },
        required: ["specialty", "transcript", "findings", "never_said"],
        additionalProperties: false,
      },
    },
  },
  required: ["cases"],
  additionalProperties: false,
} as const;

/** The checks that let a case in. Returns why it is rejected, or null. */
export function rejectReason(c: Omit<LibraryCase, "id">): string | null {
  const t = c.transcript.toLowerCase();
  if (!c.findings.length) return "no findings";
  const badQuote = c.findings.find((f) => !c.transcript.includes(f.quote));
  if (badQuote) return `quote not verbatim: "${badQuote.quote}"`;
  for (const n of c.never_said) {
    const hit = [n.label, ...n.synonyms].find((w) => w.trim() && new RegExp(`\\b${w.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`).test(t));
    if (hit) return `"never said" ${n.label} appears as "${hit}"`;
  }
  // A number in a quote means a value: it must be flagged for confirmation.
  const unflagged = c.findings.find((f) => /\d/.test(f.quote) && !f.confirm);
  if (unflagged) return `number not flagged: "${unflagged.quote}"`;
  return null;
}

if (import.meta.url.endsWith(process.argv[1]?.split("/").pop() ?? "")) {
  const key = process.env.EVAL_ANTHROPIC_API_KEY;
  if (!key) throw new Error("EVAL_ANTHROPIC_API_KEY is not set");
  const api = new Anthropic({ apiKey: key });
  const library: LibraryCase[] = existsSync(OUT) ? JSON.parse(readFileSync(OUT, "utf8")) : [];
  let cost = 0;
  let kept = 0;
  // Saved after every set, spend included, so a failure part-way (a spend limit, a network
  // drop) loses one set at most — not the run.
  const save = (setCost: number, label: string) => {
    mkdirSync(new URL("./library/", import.meta.url), { recursive: true });
    writeFileSync(OUT, JSON.stringify(library, null, 1));
    const l = existsSync(LEDGER) ? JSON.parse(readFileSync(LEDGER, "utf8")) : { spent: 0, reserved: {}, batches: [] };
    l.spent += setCost;
    l.batches.push({ id: `generate-${Date.now()}-${label}`, run: "library", requests: 1, cost: setCost });
    writeFileSync(LEDGER, JSON.stringify(l, null, 2));
    return l.spent as number;
  };
  const rejected: string[] = [];
  let next = 0;
  await Promise.all(Array.from({ length: 6 }, async () => {
    while (next < CALLS) {
      const n = next++;
      const theme = THEMES[n % THEMES.length];
      const r = await api.messages.create({
        model: "claude-sonnet-5-5",
        max_tokens: 16000,
        system: [{ type: "text", text: SYSTEM, cache_control: { type: "ephemeral" } }],
        output_config: { effort: "medium", format: { type: "json_schema", schema: SCHEMA as unknown as Record<string, unknown> } },
        messages: [{ role: "user", content: `Write ${PER_CALL} cases. Theme for this set: ${theme}. Set number ${n + library.length} — make them different from the obvious first ideas.` }],
      });
      const u = r.usage;
      const setCost = (u.input_tokens * 2 + (u.cache_creation_input_tokens ?? 0) * 2.5 + (u.cache_read_input_tokens ?? 0) * 0.2 + u.output_tokens * 10) / 1e6;
      cost += setCost;
      const t = r.content.find((b) => b.type === "text");
      const cases = (JSON.parse(t && t.type === "text" ? t.text : "{}").cases ?? []) as Omit<LibraryCase, "id">[];
      for (const c of cases) {
        const why = rejectReason(c);
        if (why) { rejected.push(why); continue; }
        library.push({ id: `lib-${String(library.length + 1).padStart(4, "0")}`, ...c });
        kept++;
      }
      const spent = save(setCost, String(n));
      console.log(`set ${n + 1}/${CALLS} (${theme}): kept ${kept} so far, cost $${cost.toFixed(2)}, total spent $${spent.toFixed(2)}`);
    }
  }));
  console.log(`\nlibrary: ${library.length} cases (+${kept}), rejected ${rejected.length}; cost $${cost.toFixed(2)}`);
  for (const r of rejected.slice(0, 8)) console.log("  rejected:", r);
}
