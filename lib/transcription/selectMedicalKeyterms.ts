import {
  MASTER_LEXICON,
  NON_OPERATIVE_SPECIALTIES,
  type MedicalLexiconEntry,
  type DictationContext,
  type SelectedKeyterm,
} from "./lexicon";

/**
 * Turn a patient context into the 20–50 Deepgram keyterms that matter for that patient.
 *
 *   MASTER LEXICON → this selector → ~20–50 terms → Nova-3 Medical keyterm list
 *
 * Deterministic: the same context always yields the same ordered list. No network, no LLM —
 * pure string matching over structured patient fields, so it costs nothing to run every time
 * a dictation session starts. See docs/medical-dictation-keyterms.md.
 *
 * The scores and reasons on each result are for the dev debug view and the tests. ONLY `term`
 * is ever sent to Deepgram; Nova-3 keyterms carry no weight.
 */

const DEFAULTS = {
  /** Hard application safety cap. Deepgram's own limit is higher; this leaves headroom. */
  maxTerms: 80,
  /** If a real patient context produces fewer than this, top up from the specialty core. */
  targetMin: 16,
  /** Application-side token ceiling, well below Deepgram's ~500-token API limit. */
  tokenBudget: 400,
  /** Minimum score an entry needs to be selected on its own merits. */
  inclusionFloor: 55,
} as const;

// --- normalisation --------------------------------------------------------------------

/**
 * Fold a charted string or a lexicon name to the form everything here matches on.
 *
 * Hyphens become spaces and apostrophes vanish, so that word-run matching (see `tokenIn` and
 * `phraseContains`) sees the words a reader sees: "post-burn contracture" holds the word
 * "burn", "chemotherapy-induced cytopenia" holds "chemotherapy", "fistula-in-ano" holds
 * "fistula", "ryle's tube" holds "ryle" (as "ryles", which the plural rule covers) and "PT/INR"
 * holds "PT". Without this a hyphen, slash or apostrophe hides a word from an exact match.
 *
 * Matching and dedupe keys only — never the output. `term: entry.term` is emitted raw, so what
 * Deepgram receives keeps its real hyphens, apostrophes and capitals.
 *
 * `keepCase` is for charted strings, which keep their capitals so an acronym needle can tell
 * "ALL" from "all" (see `needle`).
 */
function norm(s: string, keepCase = false): string {
  return (keepCase ? s : s.toLowerCase())
    .replace(/[‘’]/g, "'")
    .replace(/'/g, "")
    .replace(/[.,;:()\[\]]/g, " ")
    .replace(/[-\u2010-\u2015/]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Approximate Deepgram keyterm token count for one term.
 *
 * Deliberately an over-estimate — words, plus one for each apostrophe / hyphen / slash split,
 * plus one — so the application ceiling (400) sits comfortably under Deepgram's real limit.
 */
export function estimateKeytermTokens(term: string): number {
  const words = term.trim().split(/\s+/).filter(Boolean).length;
  const splits = (term.match(/['\-/]/g) ?? []).length;
  return words + splits + 1;
}

export function estimateTotalTokens(terms: readonly string[]): number {
  return terms.reduce((n, t) => n + estimateKeytermTokens(t), 0);
}

// Lives in buildDeepgramUrl.ts so the browser's live-dictation code can use it without
// pulling the whole master lexicon (this file's import) into every page's bundle.
export { dedupeCaseInsensitive } from "./buildDeepgramUrl";

/**
 * A lexicon name or family token in the form it is matched as. A short all-caps acronym keeps
 * its capitals and only matches a chart that writes it in capitals: lower-cased, "ALL" (acute
 * lymphoblastic leukaemia) is the word "all", so an obstetric history of "All NVD" pulled
 * leukaemia, hyper-CVAD and Philadelphia chromosome onto a gallstone patient. "TOD" and "BE"
 * are the same trap. Everything else matches without regard to case.
 */
function needle(s: string): string {
  return /^[A-Z]{2,4}$/.test(s.trim()) ? norm(s, true) : norm(s);
}

// --- context shaping ------------------------------------------------------------------

type ShapedContext = {
  exactDx: string[];
  familyDx: string[];
  procedures: string[];
  planned: string[];
  meds: string[];
  devices: string[];
  investigations: string[];
  freeText: string[];
  specialty?: DictationContext["specialty"];
  noteType?: DictationContext["noteType"];
};

function shape(context: DictationContext): ShapedContext {
  // Charted strings keep their case; `phraseContains` folds it unless the needle is an acronym.
  const cased = (list: string[] | undefined) => (list ?? []).map((s) => norm(s, true)).filter(Boolean);
  const dx = cased(context.diagnoses);
  const sdx = cased(context.suspectedDiagnoses);
  const procedures = cased(context.procedures);
  const planned = cased(context.plannedProcedures);
  const meds = cased(context.medications);
  const devices = cased([...(context.devices ?? []), ...(context.drains ?? [])]);
  const investigations = cased(context.investigations);

  const freeText = [
    ...dx,
    ...sdx,
    ...procedures,
    ...planned,
    ...devices,
    ...investigations,
    ...cased(context.freeTextContext),
  ];

  if (context.postOpDay != null) {
    freeText.push("post operative day", "post-op", "pod");
  }

  return {
    exactDx: [...dx, ...sdx],
    familyDx: [...dx, ...sdx],
    procedures,
    planned,
    meds,
    devices,
    investigations,
    freeText,
    specialty: context.specialty,
    noteType: context.noteType ?? (context.postOpDay != null ? "post-op" : undefined),
  };
}

// --- matching -------------------------------------------------------------------------

/** Whole-phrase containment: is `needle` present in `haystack` as a run of complete words?
 *  " right inguinal hernia " contains " inguinal hernia " but not " hernia repair ".
 *  Case is ignored unless the needle carries capitals — an acronym from `needle()`. */
function phraseContains(haystack: string, needle: string): boolean {
  const h = needle === needle.toLowerCase() ? haystack.toLowerCase() : haystack;
  if (h === needle) return true;
  return (` ${h} `).includes(` ${needle} `);
}

/**
 * True when a charted fact IS one of the entry's names — the charted string equals a name, or
 * contains it as a whole phrase ("right inguinal hernia" ⊇ "inguinal hernia"). The reverse
 * ("severe acute pancreatitis" being an alias that contains the charted "acute pancreatitis")
 * deliberately does NOT count as exact — that is an association, not an identity.
 */
function exactFactMatch(entryNames: string[], ctxStrings: string[]): boolean {
  return entryNames.some((e) => e.length >= 2 && ctxStrings.some((c) => phraseContains(c, e)));
}

/**
 * True when any family token appears in any context string as a run of COMPLETE words,
 * allowing the token's last word to be pluralised in the chart ("burn" matches "flame burns").
 *
 * Word runs, not substrings. "fever" matching "dengue fever" and "chest" matching "chest
 * x ray" are real matches and still count — the token is a whole word in each. What does not
 * count is a token landing inside an unrelated word, which is what a plain `includes` gave us:
 * "dic" inside "appendicitis" pulled disseminated intravascular coagulation onto an
 * appendicectomy, "abg" inside "cabg" pulled COPD vocabulary onto a bypass, "al" inside
 * "inguinal" pulled an antimalarial onto a hernia, and "anc" inside "pancreatitis" pulled
 * oncology terms onto a pancreatitis. Each specialty core had grown an `entry()` rule dropping
 * auto-derived triggers below five characters to dodge that rather than fix it.
 *
 * Plurals are matched by trying the token with "s" and "es" appended, never by stripping
 * letters: lengthening the needle can only ever make a match more specific, so it cannot
 * reintroduce the mid-word matching this function exists to prevent. Triggers are authored
 * singular ("burn", "ulcer", "wound") while a chart reads "flame burns", so without this the
 * fix would silently drop grafting vocabulary from a burns patient.
 *
 * The per-specialty length rules and collision tests stay: they stop a short alias being sent
 * to Deepgram as a keyterm in its own right, which is a separate concern from matching.
 */
function tokenIn(tokens: string[], ctxStrings: string[]): boolean {
  return tokens.some((t) =>
    ctxStrings.some(
      (c) => phraseContains(c, t) || phraseContains(c, `${t}s`) || phraseContains(c, `${t}es`)
    )
  );
}

type Scored = {
  term: string;
  score: number;
  reason: string[];
  priority: number;
  dedupeGroup?: string;
  specialties?: DictationContext["specialty"][];
};

function scoreEntry(entry: MedicalLexiconEntry, ctx: ShapedContext): Scored {
  const names = [entry.term, ...(entry.aliases ?? [])].map(needle);
  const reason: string[] = [];
  let score = 0;
  const add = (n: number, r: string) => {
    score += n;
    reason.push(r);
  };

  // Exact patient facts — these must outrank everything generic.
  if (exactFactMatch(names, ctx.procedures)) add(100, "current procedure");
  else if (exactFactMatch(names, ctx.planned)) add(95, "planned procedure");
  if (exactFactMatch(names, ctx.devices)) add(100, "current device / drain");
  if (exactFactMatch(names, ctx.meds)) add(100, "current medication");
  if (exactFactMatch(names, ctx.exactDx)) add(100, "exact diagnosis");

  // Clinically associated vocabulary, pulled in by family tokens.
  const dxTokens = (entry.diagnoses ?? []).map(needle);
  if (dxTokens.length && tokenIn(dxTokens, ctx.familyDx)) {
    if (entry.categories.includes("score")) add(80, "scoring system for diagnosis");
    else if (
      entry.categories.some(
        (c) => c === "investigation" || c === "radiology" || c === "microbiology"
      )
    )
      add(70, "investigation for diagnosis");
    else add(70, "diagnosis-associated term");
  }

  const procTokens = (entry.procedures ?? []).map(needle);
  if (procTokens.length && tokenIn(procTokens, [...ctx.procedures, ...ctx.planned])) {
    if (entry.categories.includes("anatomy")) add(70, "operative anatomy");
    else add(60, "related procedure");
  }

  const devTokens = (entry.devices ?? []).map(needle);
  if (devTokens.length && tokenIn(devTokens, ctx.devices)) add(100, "device-specific term");

  if ((entry.triggers ?? []).length && tokenIn((entry.triggers ?? []).map(needle), ctx.freeText))
    add(60, "context trigger");

  // A patient's resulted investigations lightly boost the matching lexicon term.
  if (ctx.investigations.length && exactFactMatch(names, ctx.investigations))
    add(40, "resulted investigation");

  if (ctx.noteType && (entry.noteTypes ?? []).includes(ctx.noteType))
    add(25, `note type: ${ctx.noteType}`);

  if (ctx.specialty && (entry.specialties ?? []).includes(ctx.specialty))
    add(30, "specialty core");

  if (entry.categories.some((c) => c === "india-ward" || c === "india-round"))
    add(20, "Indian ward vocabulary");

  if (entry.categories.includes("core") && score < 62) {
    add(62 - score, "universal ward core");
  }

  return {
    term: entry.term,
    score,
    reason,
    priority: entry.priority,
    dedupeGroup: entry.dedupeGroup,
    specialties: entry.specialties,
  };
}

// --- synthetic patient terms --------------------------------------------------------

type LexIndexEntry = { names: string[]; term: string; dedupeGroup?: string };

/** A charted value emitted as its own keyterm — the patient's actual words win over the
 *  library's. When the value maps onto a lexicon entry, that entry's de-dupe group is carried
 *  so synonymous charted spellings ("Ryles tube", "NG tube") still collapse to one keyterm. */
function syntheticTerm(
  raw: string,
  score: number,
  why: string,
  lexIndex: LexIndexEntry[]
): Scored | null {
  const cleaned = raw.trim().replace(/\s+/g, " ");
  if (!cleaned || cleaned.length < 2) return null;
  const value = norm(cleaned);
  const cased = norm(cleaned, true);

  // A charted value maps onto an entry that it contains, or (for a lower-case name) one that
  // contains it. An acronym name only counts the first way, and only in capitals.
  const hit = lexIndex.find((e) =>
    e.names.some((n) => phraseContains(cased, n) || (n === n.toLowerCase() && phraseContains(n, value)))
  );

  if (hit && value === norm(hit.term)) {
    // The charted value IS the canonical term — emit the library's casing and let it win its
    // group over the near-synonyms.
    return { term: hit.term, score, reason: [why], priority: 101, dedupeGroup: hit.dedupeGroup };
  }

  // Multi-word charted phrases read better lower-cased ("Acute pancreatitis"); a lone token
  // that is probably a brand is left as written.
  const term = cleaned.includes(" ") ? cleaned.toLowerCase() : cleaned;
  return { term, score, reason: [why], priority: 100, dedupeGroup: hit?.dedupeGroup };
}

function syntheticPatientTerms(context: DictationContext, lexIndex: LexIndexEntry[]): Scored[] {
  const out: Scored[] = [];
  const push = (list: string[] | undefined, score: number, why: string) => {
    for (const v of list ?? []) {
      const t = syntheticTerm(v, score, why, lexIndex);
      if (t) out.push(t);
    }
  };
  push(context.diagnoses, 100, "charted diagnosis");
  push(context.suspectedDiagnoses, 88, "working diagnosis");
  push(context.procedures, 100, "charted procedure");
  push(context.plannedProcedures, 95, "planned procedure");
  push(context.medications, 100, "charted medication");
  push(context.devices, 100, "device in situ");
  push(context.drains, 100, "drain in situ");
  return out;
}

// --- ordering & de-duplication -----------------------------------------------------

function compare(a: Scored, b: Scored): number {
  if (b.score !== a.score) return b.score - a.score;
  if (b.priority !== a.priority) return b.priority - a.priority;
  if (a.term.length !== b.term.length) return a.term.length - b.term.length;
  return a.term.localeCompare(b.term);
}

function dedupe(sorted: Scored[]): Scored[] {
  const seenTerm = new Set<string>();
  const seenGroup = new Set<string>();
  const kept: Scored[] = [];

  for (const cand of sorted) {
    const key = norm(cand.term);
    if (seenTerm.has(key)) continue;
    if (cand.dedupeGroup && seenGroup.has(cand.dedupeGroup)) continue;

    // Near-duplicate guard: skip a term that is wholly contained in one already kept, or that
    // wholly contains one already kept (e.g. "Ryle's tube" vs "Ryle's tube aspirate").
    if (
      kept.some((k) => {
        const kk = norm(k.term);
        return kk !== key && (kk.includes(key) || key.includes(kk));
      })
    ) {
      continue;
    }

    seenTerm.add(key);
    if (cand.dedupeGroup) seenGroup.add(cand.dedupeGroup);
    kept.push(cand);
  }
  return kept;
}

// --- public API -------------------------------------------------------------------

export function selectMedicalKeyterms(context: DictationContext): SelectedKeyterm[] {
  const cfg = DEFAULTS;
  const ctx = shape(context);

  // A unit that does not operate never gets the surgical ward phrases boosted.
  const nonOperative = !!ctx.specialty && NON_OPERATIVE_SPECIALTIES.has(ctx.specialty);
  const lexicon = MASTER_LEXICON.filter((e) => !(nonOperative && e.operativeOnly));

  const lexIndex: LexIndexEntry[] = lexicon.map((e) => ({
    names: [e.term, ...(e.aliases ?? [])].map(needle),
    term: e.term,
    dedupeGroup: e.dedupeGroup,
  }));

  const scoredAll = lexicon.map((e) => scoreEntry(e, ctx)).filter((s) => s.score > 0);

  const primary = scoredAll.filter((s) => s.score >= cfg.inclusionFloor);
  const candidates = [...syntheticPatientTerms(context, lexIndex), ...primary];

  let kept = dedupe(candidates.slice().sort(compare));

  // Top up from the specialty core if a real context came back thin.
  if (kept.length < cfg.targetMin && ctx.specialty) {
    const keptTerms = new Set(kept.map((k) => norm(k.term)));
    const pool = scoredAll
      .filter(
        (s) =>
          s.score < cfg.inclusionFloor &&
          (s.specialties ?? []).includes(ctx.specialty) &&
          !keptTerms.has(norm(s.term))
      )
      .sort((a, b) => b.priority - a.priority || a.term.localeCompare(b.term));
    kept = dedupe([...kept, ...pool].slice().sort(compare)).slice(0, cfg.targetMin);
  }

  // Hard cap, then token budget — lowest-scoring terms fall off first (they are last).
  if (kept.length > cfg.maxTerms) kept = kept.slice(0, cfg.maxTerms);
  while (kept.length > 1 && estimateTotalTokens(kept.map((k) => k.term)) > cfg.tokenBudget) {
    kept.pop();
  }

  return kept.map((k) => ({ term: k.term, score: k.score, reason: k.reason }));
}

/** The flat list to feed straight into the Deepgram keyterm parameter. */
export function getDeepgramKeyterms(context: DictationContext): string[] {
  return selectMedicalKeyterms(context).map((s) => s.term);
}

/**
 * A PHI-safe summary of a selection, for the development-only debug view (STEP 13). Contains
 * no patient name, UHID, phone number or free text — only the chosen terms and why.
 */
export function describeSelection(
  context: DictationContext
): { selectedCount: number; estimatedTokens: number; reasons: string[]; terms: string[] } {
  const selected = selectMedicalKeyterms(context);
  const terms = selected.map((s) => s.term);
  const reasons = Array.from(
    new Set(selected.flatMap((s) => s.reason))
  ).sort();
  return {
    selectedCount: selected.length,
    estimatedTokens: estimateTotalTokens(terms),
    reasons,
    terms,
  };
}
