/**
 * The shape of one entry in the WardMate master medical lexicon, and the vocabulary the
 * selection engine speaks.
 *
 * WHY THIS EXISTS. Deepgram Nova-3 Medical already understands common medical English. What it
 * does not reliably get is Indian hospital shorthand ("PAC", "P/A"), Indian surgical ward
 * terminology, brand drug names off an Indian chart ("Monocef", "Piptaz"), uncommon diagnoses
 * ("appendicular lump", "walled-off necrosis") and the scoring systems a surgical unit quotes
 * ("Ranson's criteria", "MCTSI"). Nova-3 boosts a *keyterm* list — one phrase per entry, no
 * weights — chosen when the streaming/REST session starts. See docs/medical-dictation-keyterms.md.
 *
 * The master lexicon is large. We never send all of it. Instead:
 *
 *   MASTER LEXICON  →  patient/context selector  →  ~20–50 high-value terms  →  Nova-3 keyterms
 *
 * `priority` is INTERNAL ONLY. It, and the score the selector computes from it, decide which
 * terms make the cut. They are NEVER sent to Deepgram — Nova-3 keyterms carry no weight.
 */

/**
 * Coarse buckets a term belongs to. Used both to describe the lexicon and to let the selector
 * pull in a whole facet ("this is a general-surgery unit, keep the surgery core") without
 * hand-listing every term.
 */
export type LexiconCategory =
  | "core" //            universal ward vocabulary, sent on nearly every dictation
  | "india-ward" //      Indian hospital / documentation language
  | "india-round" //     daily surgical ward-round phrases
  | "device" //          drains, tubes, lines, stomas
  | "investigation" //   blood tests, panels, markers
  | "microbiology" //    cultures, stains, molecular tests
  | "radiology" //       imaging studies
  | "diagnosis" //       conditions and presentations
  | "procedure" //       operations and bedside procedures
  | "anatomy" //         high-value operative anatomy
  | "medication" //      generic drug names
  | "medication-brand" // Indian brand names
  | "fluid" //           IV fluids
  | "critical-care" //   sepsis / ICU vocabulary
  | "score"; //          scoring systems and classifications

/** The specialty tag. WardMate is a surgical-ward product today; the field exists so a future
 *  medicine or ortho pack can be merged through the same selector. */
export type Specialty = "general-surgery" | "surgical-gastroenterology" | "vascular-surgery";

export type NoteType =
  | "ward-round"
  | "case-history"
  | "post-op"
  | "pre-op"
  | "discharge"
  | "procedure-note";

export type MedicalLexiconEntry = {
  /** The preferred spelling — this exact string is what gets sent to Deepgram. */
  term: string;
  /**
   * Alternate spellings, expansions and pronunciations the *context* or a trigger may be
   * written as. Aliases are matched against, never emitted — so "Ryle's tube" covers "Ryles
   * tube" and "NG tube" without three keyterms competing for the budget.
   */
  aliases?: string[];
  categories: LexiconCategory[];
  /**
   * Free-text fragments in the patient context (diagnosis, procedure, plan, note) that should
   * pull this term in even when the term itself is not written out. Matched case-insensitively
   * as normalised substrings.
   */
  triggers?: string[];
  /** Specialty cores this term belongs to. */
  specialties?: Specialty[];
  /** Diagnosis tokens this term is clinically associated with (e.g. "pancreatitis"). */
  diagnoses?: string[];
  /** Procedure tokens this term is associated with (e.g. "cholecystectomy"). */
  procedures?: string[];
  /** Device tokens this term is associated with (e.g. "drain"). */
  devices?: string[];
  /** Note types this term is especially relevant to. Advisory only today. */
  noteTypes?: NoteType[];
  /**
   * INTERNAL priority, roughly:
   *   100 — exact patient diagnosis / procedure / device / medication
   *    90 — strongly related terminology
   *    80 — relevant scoring system / classification / investigation
   *    70 — specialty-specific terminology
   *    60 — Indian ward terminology
   *    40 — generic clinical vocabulary
   * NEVER sent to Deepgram.
   */
  priority: number;
  /**
   * Near-duplicate family. When two *separate* entries mean almost the same thing on a chart
   * (e.g. "pigtail catheter" / "pigtail drain"), only the highest-scoring member of a group is
   * sent. Exact-string and alias de-duplication happen anyway; this is the extra guard for
   * synonyms that were authored as their own rows.
   */
  dedupeGroup?: string;
};

export const PRIORITY = {
  EXACT_PATIENT: 100,
  RELATED: 90,
  SCORING_OR_INVESTIGATION: 80,
  SPECIALTY: 70,
  INDIA_WARD: 60,
  GENERIC: 40,
} as const;

/** One chosen keyterm, with why it was chosen. `score` and `reason` are for the debug view
 *  and tests only — only `term` is ever sent to Deepgram. */
export type SelectedKeyterm = {
  term: string;
  score: number;
  reason: string[];
};

/**
 * A normalised view of a WardMate patient, in the shape the selector reads. Built from
 * existing patient data (see lib/transcription/patient-context.ts) — no schema migration.
 */
export type DictationContext = {
  patientId?: string;
  specialty?: Specialty;
  ward?: string;
  noteType?: NoteType;
  /** Confirmed / recorded diagnoses, most specific first. */
  diagnoses?: string[];
  /** Working or differential diagnoses. */
  suspectedDiagnoses?: string[];
  /** Operations already performed. */
  procedures?: string[];
  /** Operations planned but not yet done. */
  plannedProcedures?: string[];
  /** Active drug names — generic or brand, as charted. */
  medications?: string[];
  /** Devices in situ that are not drains. */
  devices?: string[];
  /** Drains in situ. */
  drains?: string[];
  /** Investigations already ordered / resulted. */
  investigations?: string[];
  /** Days since surgery, when the patient has been operated on. */
  postOpDay?: number | null;
  /** Anything else worth feeding the matcher — free-text notes, ward name, unit shorthand. */
  freeTextContext?: string[];
  /** Hospital- or unit-specific vocabulary merged in at selection time. */
  customTerms?: MedicalLexiconEntry[];
};

/** Tuning knobs for the selector. Defaults match the WardMate application ceilings. */
export type SelectKeytermOptions = {
  /** Hard maximum number of keyterms. Deepgram's own limit is higher; this is our safety cap. */
  maxTerms?: number;
  /** Target upper bound — the selector aims for this before the hard cap. */
  targetTerms?: number;
  /** Approximate keyterm token ceiling. Deepgram's API limit is ~500; we stay well under. */
  tokenBudget?: number;
  /** Minimum score an untriggered term needs to be included. */
  inclusionFloor?: number;
  /** Extra lexicon entries (hospital / unit packs) to consider alongside the master lexicon. */
  extraTerms?: MedicalLexiconEntry[];
};
