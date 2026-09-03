import {
  MASTER_LEXICON,
  mergeLexicon,
  type MedicalLexiconEntry,
  type DictationContext,
  type SelectedKeyterm,
  type SelectKeytermOptions,
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
  /** The selector aims to stay at or below this before the hard cap bites. */
  targetTerms: 50,
  /** If a real patient context produces fewer than this, top up from the specialty core. */
  targetMin: 16,
  /** Application-side token ceiling, well below Deepgram's ~500-token API limit. */
  tokenBudget: 400,
  /** Minimum score an entry needs to be selected on its own merits. */
  inclusionFloor: 55,
} as const;

// --- normalisation --------------------------------------------------------------------

function norm(s: string): string {
  return s
    .toLowerCase()
    .replace(/[‘’]/g, "'")
    .replace(/[.,;:()\[\]]/g, " ")
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
  const dx = (context.diagnoses ?? []).map(norm).filter(Boolean);
  const sdx = (context.suspectedDiagnoses ?? []).map(norm).filter(Boolean);
  const procedures = (context.procedures ?? []).map(norm).filter(Boolean);
  const planned = (context.plannedProcedures ?? []).map(norm).filter(Boolean);
  const meds = (context.medications ?? []).map(norm).filter(Boolean);
  const devices = [...(context.devices ?? []), ...(context.drains ?? [])].map(norm).filter(Boolean);
  const investigations = (context.investigations ?? []).map(norm).filter(Boolean);

  const freeText = [
    ...dx,
    ...sdx,
    ...procedures,
    ...planned,
    ...devices,
    ...investigations,
    ...(context.freeTextContext ?? []).map(norm),
  ].filter(Boolean);

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
 *  " right inguinal hernia " contains " inguinal hernia " but not " hernia repair ". */
function phraseContains(haystack: string, needle: string): boolean {
  if (haystack === needle) return true;
  return (` ${haystack} `).includes(` ${needle} `);
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

/** True when any family token appears as a substring of any context string. */
function tokenIn(tokens: string[], ctxStrings: string[]): boolean {
  return tokens.some((t) => ctxStrings.some((c) => c.includes(t)));
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
  const names = [entry.term, ...(entry.aliases ?? [])].map(norm);
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
  const dxTokens = (entry.diagnoses ?? []).map(norm);
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

  const procTokens = (entry.procedures ?? []).map(norm);
  if (procTokens.length && tokenIn(procTokens, [...ctx.procedures, ...ctx.planned])) {
    if (entry.categories.includes("anatomy")) add(70, "operative anatomy");
    else add(60, "related procedure");
  }

  const devTokens = (entry.devices ?? []).map(norm);
  if (devTokens.length && tokenIn(devTokens, ctx.devices)) add(100, "device-specific term");

  if ((entry.triggers ?? []).length && tokenIn((entry.triggers ?? []).map(norm), ctx.freeText))
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

  const hit = lexIndex.find((e) =>
    e.names.some((n) => n === value || phraseContains(value, n) || phraseContains(n, value))
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

export function selectMedicalKeyterms(
  context: DictationContext,
  options: SelectKeytermOptions = {}
): SelectedKeyterm[] {
  const cfg = { ...DEFAULTS, ...options };
  const ctx = shape(context);

  const lexicon = mergeLexicon(MASTER_LEXICON, [
    ...(options.extraTerms ?? []),
    ...(context.customTerms ?? []),
  ]);

  const lexIndex: LexIndexEntry[] = lexicon.map((e) => ({
    names: [e.term, ...(e.aliases ?? [])].map(norm),
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
export function getDeepgramKeyterms(
  context: DictationContext,
  options: SelectKeytermOptions = {}
): string[] {
  return selectMedicalKeyterms(context, options).map((s) => s.term);
}

/**
 * A PHI-safe summary of a selection, for the development-only debug view (STEP 13). Contains
 * no patient name, UHID, phone number or free text — only the chosen terms and why.
 */
export function describeSelection(
  context: DictationContext,
  options: SelectKeytermOptions = {}
): { selectedCount: number; estimatedTokens: number; reasons: string[]; terms: string[] } {
  const selected = selectMedicalKeyterms(context, options);
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
