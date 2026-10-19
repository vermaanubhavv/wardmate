import { MASTER_LEXICON, type MedicalLexiconEntry } from "@/lib/transcription/lexicon";
import { getSpecialtyPack } from "@/lib/specialty";
import { SPECIALTY_KEYS } from "@/lib/specialty/types";
import { HAND_RULES } from "@/lib/shorthand";

/**
 * Builds lib/shorthand-table.ts from the dictation lexicon. Never imported by the app — the
 * lexicon is 200 KB and the shorthand runs in client components — only by the test that keeps
 * the generated table in step (lib/__tests__/shorthand-table.test.ts).
 *
 * A pair is taken only where one side is an abbreviation whose letters are the initials of the
 * other side's words, in order ("known case of" / "K/C/O", "range of motion" / "ROM"). That is
 * what keeps synonyms and opposites out: "afebrile" is an alias of "febrile" in spirit, but
 * no abbreviation spells it, so no rule can turn one into the other.
 */

// Joining words an abbreviation may skip: "history of presenting illness" → HPI.
const STOP = new Set(["of", "the", "and", "in", "on", "with", "to", "for", "by", "a", "an", "&"]);
// Two capitals at least, letters only (a number is never the table's to write), / & - inside.
const ABBR = /^(?=(?:[^A-Z]*[A-Z]){2})[A-Z][A-Za-z]*(?:[/&-][A-Za-z]+)*$/;

/** Initials that fit, but the ward means something else by the letters: HR is heart rate not
 *  "high risk", GA is general anaesthesia as often as gestational age, AL is not ward
 *  shorthand for an anastomotic leak, IUD is the device as often as intrauterine death. */
const NOT_SHORTHAND = new Set(["HR", "GA", "AL", "IUD"]);

/**
 * One word that gives an abbreviation two letters: "intraocular" is the IO of IOP,
 * "transurethral" the TU of TURP. Hand-checked, one by one — a word joins this list only
 * where the ward writes its parts as letters. Anything not here gives one letter.
 */
const COMPOUNDS: Record<string, string[]> = {
  intraocular: ["intra", "ocular"],
  subdural: ["sub", "dural"],
  extradural: ["extra", "dural"],
  subarachnoid: ["sub", "arachnoid"],
  intracranial: ["intra", "cranial"],
  intracerebral: ["intra", "cerebral"],
  intraventricular: ["intra", "ventricular"],
  cerebrospinal: ["cerebro", "spinal"],
  ventriculoperitoneal: ["ventriculo", "peritoneal"],
  intervertebral: ["inter", "vertebral"],
  midline: ["mid", "line"],
  cardiopulmonary: ["cardio", "pulmonary"],
  ketoacidosis: ["keto", "acidosis"],
  intraosseous: ["intra", "osseous"],
  electroconvulsive: ["electro", "convulsive"],
  bipolar: ["bi", "polar"],
  extrapyramidal: ["extra", "pyramidal"],
  hyperactivity: ["hyper", "activity"],
  intravenous: ["intra", "venous"],
  immunoglobulin: ["immuno", "globulin"],
  transurethral: ["trans", "urethral"],
  percutaneous: ["per", "cutaneous"],
  nephrolithotomy: ["nephro", "lithotomy"],
  suprapubic: ["supra", "pubic"],
  intrarenal: ["intra", "renal"],
  extracorporeal: ["extra", "corporeal"],
  ureteroscopy: ["uretero", "scopy"],
  pelviureteric: ["pelvi", "ureteric"],
  vesicoureteric: ["vesico", "ureteric"],
  anterolateral: ["antero", "lateral"],
  intrauterine: ["intra", "uterine"],
  gastroenteritis: ["gastro", "enteritis"],
  enterocolitis: ["entero", "colitis"],
  postpartum: ["post", "partum"],
  antepartum: ["ante", "partum"],
};

export function spells(abbr: string, words: string[]): boolean {
  const letters = abbr.replace(/[/&-]/g, "").toLowerCase();
  const go = (i: number, j: number): boolean => {
    if (i === letters.length) return j === words.length;
    if (j === words.length) return false;
    const parts = COMPOUNDS[words[j]];
    return (
      (words[j][0] === letters[i] && go(i + 1, j + 1)) ||
      (!!parts && parts.every((w, k) => w[0] === letters[i + k]) && go(i + parts.length, j + 1)) ||
      (j > 0 && STOP.has(words[j]) && go(i, j + 1))
    );
  };
  return go(0, 0);
}

/** What a phrase means, coarsely: its content words' first three letters. "malarial parasite"
 *  and "malaria parasite" agree; "atrial fibrillation" and "atrial flutter" do not. Spelled
 *  letters ("c and s") say nothing either way. */
export const meaningKey = (phrase: string) =>
  // British and American spellings are one word: haemorrhage / hemorrhage, oedema / edema.
  phrase.toLowerCase().replace(/ae|oe/g, "e").split(/[\s-]+/).filter((w) => w.length > 2 && !STOP.has(w)).map((w) => w.slice(0, 3)).join(" ");

type Pair = [string, string];

/** Every phrase → abbreviation pair the entries carry: the whole phrase, or its opening words
 *  ("split thickness skin graft harvested" → STSG), never words from its middle. */
export function derivePairs(entries: readonly MedicalLexiconEntry[]): Pair[] {
  const out = new Map<string, Pair>();
  for (const e of entries) {
    const phrases = [e.term, ...(e.aliases ?? [])];
    const abbrs = new Set(
      phrases.flatMap((p) => p.split(/\s+/)).map((t) => t.replace(/[,.;:()]+$/, "")).filter((t) => ABBR.test(t) && !NOT_SHORTHAND.has(t))
    );
    for (const abbr of abbrs) {
      for (const p of phrases) {
        const words = p.toLowerCase().replace(/[(),.;:]/g, " ").split(/[\s-]+/).filter(Boolean);
        for (let t = 1; t <= words.length; t++) {
          const sub = words.slice(0, t);
          if (sub.includes(abbr.toLowerCase())) continue;
          if (spells(abbr, sub)) out.set(`${sub.join(" ")}|${abbr}`, [sub.join(" "), abbr]);
        }
      }
    }
  }
  return [...out.values()];
}

/** Drop every pair whose abbreviation would mean two things on the same ward — against the
 *  rules already `taken`, or among the candidates themselves. One meaning per abbreviation. */
function resolve(cands: Pair[], taken: Map<string, Set<string>>): Pair[] {
  const keys = new Map<string, Set<string>>();
  for (const [phrase, abbr] of cands) {
    const k = abbr.toUpperCase();
    const set = keys.get(k) ?? new Set(taken.get(k));
    if (meaningKey(phrase)) set.add(meaningKey(phrase));
    keys.set(k, set);
  }
  return cands.filter(([, abbr]) => !conflicting(keys.get(abbr.toUpperCase())!));
}

/** Two phrases mean the same when one's words are all in the other: "per abdomen" and "per
 *  abdominal examination" do, "pulse rate" and "per rectum" do not. */
export function conflicting(keys: Iterable<string>): boolean {
  const list = [...keys].map((k) => k.split(" "));
  const within = (a: string[], b: string[]) => a.every((w) => b.includes(w));
  return list.some((a) => list.some((b) => !within(a, b) && !within(b, a)));
}

function meanings(pairs: Pair[], into = new Map<string, Set<string>>()) {
  for (const [phrase, abbr] of pairs) {
    const k = abbr.toUpperCase();
    if (!into.has(k)) into.set(k, new Set());
    if (meaningKey(phrase)) into.get(k)!.add(meaningKey(phrase));
  }
  return into;
}

export function deriveTable(lexicon: readonly MedicalLexiconEntry[] = MASTER_LEXICON) {
  const hand = meanings(HAND_RULES.map((r) => [r.example, r.to] as Pair));
  const core = resolve(derivePairs(lexicon.filter((e) => !e.specialties?.length)), hand);
  const taken = meanings(core, meanings(HAND_RULES.map((r) => [r.example, r.to] as Pair)));
  const corePhrases = new Set(core.map(([p]) => p));
  const departments = Object.fromEntries(
    SPECIALTY_KEYS.map((key) => {
      const spec = getSpecialtyPack(key).lexiconSpecialty;
      const own = derivePairs(lexicon.filter((e) => e.specialties?.includes(spec))).filter(([p]) => !corePhrases.has(p));
      return [key, resolve(own, taken)];
    })
  ) as Record<(typeof SPECIALTY_KEYS)[number], Pair[]>;
  return { core, departments };
}

const rows = (pairs: Pair[], indent: string) =>
  pairs
    .slice()
    .sort((a, b) => a[1].localeCompare(b[1]) || a[0].localeCompare(b[0]))
    .map(([p, a]) => `${indent}[${JSON.stringify(p)}, ${JSON.stringify(a)}],`)
    .join("\n");

/** lib/shorthand-table.ts, as text. */
export function renderTable(): string {
  const { core, departments } = deriveTable();
  return `// GENERATED from lib/transcription/lexicon by lib/shorthand-derive.ts — do not edit by hand.
// After a lexicon change: npx vitest run shorthand-table -u
import type { SpecialtyKey } from "@/lib/specialty/types";

type Pair = readonly [string, string];

/** Every ward: phrase → abbreviation. */
export const CORE_PAIRS: readonly Pair[] = [
${rows(core, "  ")}
];

/** Each department's own, on top of the core. */
export const DEPARTMENT_PAIRS: Record<SpecialtyKey, readonly Pair[]> = {
${Object.entries(departments)
  .map(([k, pairs]) => (pairs.length ? `  ${k}: [\n${rows(pairs, "    ")}\n  ],` : `  ${k}: [],`))
  .join("\n")}
};
`;
}
