/**
 * Shared types for the clinical scoring & auto-trigger engine.
 *
 * The engine is configuration-driven: a *pathway definition* is versioned data (see
 * `lib/scoring/definitions/`), validated against `lib/scoring/schema.ts`, and executed by the
 * pure functions in `lib/scoring/engine.ts`. No clinical threshold lives in a scattered `if`.
 *
 * The whole module obeys the rules in CONTEXT.md §2 and the DOCX
 * (Wardmate_General_Surgery_Scoring_Engine_v1): missing is never zero, time windows are part of
 * the definition, nothing is prescribed or escalated autonomously, and every component keeps
 * its raw value, unit, source and timestamp — never just the final number.
 */

// ---------------------------------------------------------------------------
// Time
// ---------------------------------------------------------------------------

/** An ISO-8601 instant, stored UTC. Day arithmetic is done in Asia/Kolkata elsewhere. */
export type Instant = string;

/**
 * A named anchor a time window is measured from. `admission` and `symptom_onset` are the two
 * the pancreatitis pathway needs kept apart (DOCX §1: store symptom onset separately from
 * admission). `checkpoint` is resolved to the checkpoint's own due time at evaluation.
 */
export type WindowAnchor = "admission" | "symptom_onset" | "activation" | "checkpoint";

/**
 * An explicit time window. Every time-window helper REQUIRES one — there is no "just use the
 * latest value" path, because that is exactly how admission and 48-hour values get mixed.
 */
export type TimeWindow = {
  anchor: WindowAnchor;
  /** Hours after the anchor the window opens. Negative allowed (pre-admission is explicit). */
  startHours?: number;
  /** Hours after the anchor the window closes. Omit for "open-ended from start". */
  endHours?: number;
  /** Human label shown in the evidence drawer, e.g. "first 24 hours". */
  label: string;
};

// ---------------------------------------------------------------------------
// Inputs (WardMate observations mapped into the engine)
// ---------------------------------------------------------------------------

/**
 * One timestamped measurement available to the engine, already unit-normalised where the
 * analyte is one the engine knows. Produced by `lib/scoring/observations-adapter.ts` from
 * `observations` rows; the engine itself never touches the database.
 */
export type EngineInput = {
  /** Canonical analyte/finding key, e.g. "bun", "wbc", "gcs", "pleural_effusion". */
  key: string;
  /** Normalised numeric value in the engine's canonical unit for this key (if numeric). */
  value: number | null;
  /** Canonical unit for `value`, or null for booleans/categoricals. */
  unit: string | null;
  /** Categorical/boolean value exactly as recorded ("present", "absent", free text). */
  text: string | null;
  /** The value and unit exactly as recorded, before any conversion. Never discarded. */
  original: { value: string; unit: string | null };
  at: Instant;
  /** `observations.id` this came from, so the UI can open the evidence. */
  sourceId: string;
  /** The verbatim sentence / report line (`observations.source_quote`). */
  sourceQuote: string;
  /** Lab-specific reference range printed beside the result, when one was captured. */
  refLow: number | null;
  refHigh: number | null;
  /** Set when the recorded unit could not be resolved — the component becomes `unknown`. */
  unitError?: string;
};

// ---------------------------------------------------------------------------
// Component results
// ---------------------------------------------------------------------------

/** Why a component has no satisfied/not-satisfied answer. Never rendered as normal or zero. */
export type MissingReason =
  | "no_data"
  | "outside_time_window"
  | "unsupported_unit"
  | "ambiguous_unit"
  | "checkpoint_not_due"
  | "not_applicable"
  | "requires_verification"
  | "insufficient_inputs";

export type ComponentStatus =
  | "satisfied"
  | "not_satisfied"
  | "unknown"
  | "not_applicable"
  | "stale";

/**
 * One scored line of a card. Persisted in full (DOCX: "Never persist only the final score").
 */
export type ComponentResult = {
  componentId: string;
  label: string;
  status: ComponentStatus;
  /** Raw value as recorded, e.g. "27 mg/dL" or "GCS 14". Null when unknown. */
  rawValue: string | null;
  /** Engine-normalised numeric value. Null when unknown or non-numeric. */
  normalizedValue: number | null;
  unit: string | null;
  sourceId: string | null;
  sourceAt: Instant | null;
  /** The window this component's value had to fall inside. */
  window: TimeWindow;
  /** Points contributed to the card total (0 when not satisfied / unknown). */
  points: number;
  /** For classification cards: the category this component maps to, if any. */
  contribution: string | null;
  missingReason: MissingReason | null;
  /** Set only when a clinician has overridden the imported value. Original is kept below. */
  override?: {
    value: string;
    reason: string;
    by: string;
    at: Instant;
    /** The imported component result this replaced — never destroyed. */
    original: Omit<ComponentResult, "override">;
  };
};

// ---------------------------------------------------------------------------
// Card results
// ---------------------------------------------------------------------------

export type CardType = "calculator" | "structured_classification" | "documentation_only";

export type CardState =
  | "not_started"
  | "incomplete"
  | "complete_unverified"
  | "verified"
  | "stale"
  | "not_applicable";

export type Interpretation = {
  /** Neutral clinical meaning. Never an instruction to prescribe / transfer / operate. */
  text: string;
  /** Presentation hint only. */
  tone: "neutral" | "attention";
};

export type CardResult = {
  cardId: string;
  cardType: CardType;
  title: string;
  state: CardState;
  components: ComponentResult[];
  /** Numeric total for calculators; null for classification / documentation cards. */
  total: number | null;
  /**
   * Provisional total — computed treating still-unknown clinician-assessed criteria as not
   * satisfied — set only when every objective input is known and ≥ 1 assessment is pending.
   * The assumption is surfaced (see `assumedComponentIds`), never stored.
   */
  provisionalTotal: number | null;
  /** Clinician-assessed criteria still unknown and assumed normal for `provisionalTotal`. */
  assumedComponentIds: string[];
  /** Category for classification cards; null otherwise. */
  classification: string | null;
  interpretation: Interpretation | null;
  /** The formula/config version this result was produced under. */
  formulaVersion: string;
  computedAt: Instant;
  verifiedBy: string | null;
  verifiedAt: Instant | null;
  /** Count of mandatory components still `unknown`. State is never `verified` while > 0. */
  missingRequiredCount: number;
};

// ---------------------------------------------------------------------------
// Tasks
// ---------------------------------------------------------------------------

export type TaskStatus = "suggested" | "linked" | "accepted" | "declined" | "completed";
export type TaskPriority = "routine" | "soon" | "urgent";
export type ResponsibleRole = "resident" | "nursing" | "senior" | "radiology";

export type GeneratedTask = {
  cardId: string | null;
  componentId: string | null;
  /** What to do, e.g. "Send serum calcium". */
  action: string;
  /** Why the engine is suggesting it — always answerable (DOCX UI requirement). */
  reason: string;
  priority: TaskPriority;
  responsibleRole: ResponsibleRole;
  /** The rule/id that produced this task, for the audit trail. */
  sourceRule: string;
  /**
   * Stable idempotency key. Repeated trigger delivery with the same key never creates a
   * second task. Shape: `<pathwayId>:<cardId>:<componentId|action-slug>`.
   */
  dedupKey: string;
  dueAt: Instant | null;
  /** Institution toggle key — the task is suppressed when the ward has disabled it. */
  institutionalToggle: string | null;
};

// ---------------------------------------------------------------------------
// Checkpoints
// ---------------------------------------------------------------------------

export type Checkpoint = {
  key: string;
  /** Window anchor + offset the due time is computed from. */
  dueFrom: WindowAnchor;
  dueAtHours: number;
  label: string;
  /** Cards to recompute / unlock when the checkpoint comes due. */
  recomputeCards: string[];
};

// ---------------------------------------------------------------------------
// Pathway definition (the versioned configuration entity)
// ---------------------------------------------------------------------------

export type ComparisonOperator =
  | "gt"
  | "gte"
  | "lt"
  | "lte"
  | "eq"
  | "present"
  | "absent"
  | "in_range";

/** A single allow-listed, deterministic condition. No expression evaluator, no eval. */
export type ComponentRule = {
  op: ComparisonOperator;
  /** Threshold for gt/gte/lt/lte/eq. */
  value?: number | string;
  /** [low, high] for in_range. */
  range?: [number, number];
};

export type ComponentInput = {
  componentId: string;
  label: string;
  /** Canonical analyte/finding key the adapter produces. */
  inputKey: string;
  /** The engine's canonical unit; the adapter converts to this or the component is `unknown`. */
  canonicalUnit: string | null;
  window: TimeWindow;
  /**
   * How to pick one value out of the window when several exist.
   * `admission` = closest to window start; `first` = earliest; `worst` = engine picks the
   * value that maximises the score contribution; `highest`/`lowest` = numeric extremes;
   * `change_from_baseline` = (value in window) − (baseline value), baseline window in
   * `baselineWindow`; `at_checkpoint` = value at the checkpoint instant.
   */
  selector:
    | "admission"
    | "first"
    | "worst"
    | "highest"
    | "lowest"
    | "change_from_baseline"
    | "at_checkpoint";
  baselineWindow?: TimeWindow;
  /** The point(s) this component scores. Ignored when `bands` is set. */
  points: number;
  /** The rule that has to hold for the points to be awarded (single-threshold criteria). */
  rule: ComponentRule;
  /**
   * Graded criteria (Glasgow-Blatchford urea 6.5–7.9 → 2, 8.0–9.9 → 3, …): the FIRST band
   * whose rule matches awards its points. Bands are evaluated in order. When set, `rule`/`points`
   * are ignored except `rule` still gates evaluability (use `{op:"present"}`).
   */
  bands?: { rule: ComponentRule; points: number; label?: string }[];
  /** Mandatory components keep the card out of `verified` until answered or marked N/A. */
  required: boolean;
  /**
   * A component that must never be auto-completed by ordering a test (DOCX: no CT solely for
   * BISAP / mCTSI). The engine will not emit a missing-data task for these.
   */
  noAutoTask?: boolean;
  /**
   * A criterion that comes from a clinician's eye, not a lab or a device (impaired mental
   * status, guarding, pleural effusion). When still unknown, a *provisional* score is computed
   * assuming it is not satisfied — with the assumption shown, never stored. One tap confirms.
   * Its value is read from the pathway instance's recorded assessments, not from observations.
   */
  clinicianAssessed?: boolean;
  /** UI + write mapping for a clinician-assessed criterion. */
  assess?: {
    question: string;
    /** Observation label written alongside, for visibility in the record. */
    recordLabel: string;
    options: {
      /** Button text. */
      label: string;
      /** Observation value_text written when chosen. */
      record: string;
      /** Does this option satisfy the criterion (award its points)? */
      satisfied: boolean;
      /** Points for graded criteria (AIR guarding 1/2/3). Defaults to the component `points`. */
      points?: number;
      /** The "nothing abnormal" option — used by the one-tap "confirm normal". Exactly one. */
      normal?: boolean;
    }[];
  };
  /** For `tiered_classification` cards: which severity tier this criterion belongs to. */
  tier?: string;
};

export type CardCalculation =
  | { kind: "sum_points" }
  | { kind: "sirs" }
  | { kind: "modified_marshall" }
  | { kind: "revised_atlanta" }
  | { kind: "structured_extraction" }
  /**
   * Tiered severity classification (Tokyo Guidelines Grade I/II/III): walk `tiers` from most
   * severe; the class is the first tier with any `satisfied` criterion, else `fallback`.
   */
  | {
      kind: "tiered_classification";
      tiers: string[];
      fallback: string;
      /** tier → how many of its criteria must be satisfied for the tier to apply (default 1). */
      tierThresholds?: Record<string, number>;
    };

export type CardInterpretationBand = {
  /** Inclusive lower bound on the total (calculators). */
  min: number;
  max?: number;
  /** The classification this band describes (tiered / structured cards). */
  class?: string;
  text: string;
  tone: "neutral" | "attention";
};

export type CardDefinition = {
  cardId: string;
  title: string;
  /** Short name shown on the card and in the note, e.g. "BISAP", "AIR", "Tokyo grade". */
  shortName?: string;
  /** One-line source + interpretation, shown behind a tap. */
  citation?: string;
  type: CardType;
  /** Sub-heading shown under the title, e.g. "first 24 hours". */
  timingLabel: string;
  calculation: CardCalculation;
  inputs: ComponentInput[];
  interpretationBands: CardInterpretationBand[];
  /** A card locked until a checkpoint is due (Ranson 48-hour stage). */
  lockedUntilCheckpoint?: string;
  /** Events that cause this card to be recomputed. */
  recomputeOn: RecomputeEvent[];
  /** Only build/activate this card when at least one input is present (mCTSI needs a CT). */
  requiresAnyInputPresent?: boolean;
  /** Structured-classification / documentation cards need explicit clinician confirmation. */
  requiresConfirmation?: boolean;
};

export type RecomputeEvent =
  | "new_lab"
  | "new_observation"
  | "new_imaging"
  | "scheduled_checkpoint"
  | "deterioration"
  | "manual";

export type DiagnosisTrigger = {
  /** Local diagnosis codes, if the ward ever configures a coding system. */
  codes: string[];
  /** Case-insensitive phrases matched against `primary_diagnosis` / diagnosis observations. */
  textPatterns: string[];
  /** Phrases that, if present, block the trigger (e.g. "chronic pancreatitis"). */
  excludePatterns: string[];
};

export type GeneratedTaskDefinition = Omit<GeneratedTask, "dedupKey" | "dueAt" | "sourceRule"> & {
  /** Slug appended to the dedup key; also the source-rule id. */
  key: string;
  dueFromAnchor?: WindowAnchor;
  dueAtHours?: number;
  /**
   * The engine input key whose presence means this task is already satisfied — the task is
   * then linked to the existing result rather than created. Omit for tasks with no single
   * result to check (e.g. "chart the vitals").
   */
  linkKey?: string;
};

export type PathwayStatus = "active" | "draft" | "unavailable" | "retired";

export type PathwayDefinition = {
  pathwayId: string;
  pathwayVersion: string;
  title: string;
  status: PathwayStatus;
  clinicalOwner: string;
  sourceReferences: { label: string; citation: string }[];
  /** ISO date the clinical content is due for governance review. */
  reviewDueAt: string;
  diagnosisTriggers: DiagnosisTrigger;
  eligibility: { minAgeYears?: number; maxAgeYears?: number; notes: string[] };
  exclusions: string[];
  cards: CardDefinition[];
  tasks: GeneratedTaskDefinition[];
  checkpoints: Checkpoint[];
  recomputePolicy: RecomputeEvent[];
  /** Ward-configurable toggles: key → default enabled. */
  institutionalToggles: Record<string, boolean>;
};

// ---------------------------------------------------------------------------
// Pathway instance (runtime state, one per patient + pathway version)
// ---------------------------------------------------------------------------

export type PathwayInstanceStatus = "suggested" | "active" | "dismissed" | "resolved";

export type TriggerSource =
  | "diagnosis_text"
  | "diagnosis_code"
  | "manual_activation"
  | "problem_list_change";

export type PathwayInstance = {
  id: string;
  patientId: string;
  wardId: string;
  pathwayId: string;
  pathwayVersion: string;
  status: PathwayInstanceStatus;
  triggerSource: TriggerSource;
  triggeredAt: Instant;
  triggerDiagnosis: string;
  activatedBy: string | null;
  activatedAt: Instant | null;
  dismissedReason: string | null;
  nextCheckpointAt: Instant | null;
};

/** Anchor instants an instance is evaluated against. */
export type InstanceClock = {
  admission: Instant;
  symptomOnset: Instant | null;
  activation: Instant | null;
  now: Instant;
};
