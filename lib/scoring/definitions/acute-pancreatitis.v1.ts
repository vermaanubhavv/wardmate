/**
 * Acute pancreatitis — pathway definition v1.0.0.
 *
 * ONE score: BISAP. It is the modern first-line bedside severity screen (5 items, first 24 h,
 * no gallstone/non-gallstone split) and current guidelines favour it over Ranson. The score is
 * shown as a line in the progress note, auto-calculated whenever the inputs exist; the inputs
 * it still needs appear as ordinary items in the to-do list. There is no separate scoring
 * screen.
 *
 * Ranson / Revised Atlanta / Modified CTSI card builders are kept below and exported for the
 * engine test-suite only (`PANCREATITIS_EXTENDED_CARDS`) — they are NOT part of the shipped
 * pathway and would need clinical governance before being added.
 *
 * Clinical content: DOCX §1 (Wardmate_General_Surgery_Scoring_Engine_v1). Sources [1]–[4].
 * STATUS: `draft` until a clinical governance owner signs off.
 */

import type { CardDefinition, PathwayDefinition, TimeWindow } from "../types";

const W_FIRST_24: TimeWindow = { anchor: "admission", startHours: -6, endHours: 24, label: "first 24 hours" };
const W_AT_ADMISSION: TimeWindow = { anchor: "admission", startHours: -12, endHours: 24, label: "at admission" };
const W_AT_48H: TimeWindow = { anchor: "admission", startHours: 36, endHours: 60, label: "at 48 hours" };
const W_DYNAMIC: TimeWindow = { anchor: "admission", startHours: 0, label: "since admission (dynamic)" };

// ---------------------------------------------------------------------------
// BISAP — the one shipped card
// ---------------------------------------------------------------------------

const bisapCard: CardDefinition = {
  cardId: "bisap",
  title: "BISAP",
  type: "calculator",
  timingLabel: "first 24 hours",
  calculation: { kind: "sum_points" },
  recomputeOn: ["new_lab", "new_observation", "new_imaging", "scheduled_checkpoint", "manual"],
  interpretationBands: [
    { min: 0, max: 2, text: "BISAP 0–2. Lower-risk screen. Interpret alongside clinical assessment.", tone: "neutral" },
    { min: 3, max: 5, text: "BISAP ≥ 3 — higher-risk screen; review monitoring and escalation needs. Does not declare severe pancreatitis or mandate ICU.", tone: "attention" },
  ],
  inputs: [
    {
      componentId: "bisap.bun",
      label: "BUN > 25 mg/dL",
      inputKey: "bun",
      canonicalUnit: "mg/dL",
      window: W_FIRST_24,
      selector: "worst",
      points: 1,
      rule: { op: "gt", value: 25 },
      required: true,
    },
    {
      componentId: "bisap.mental_status",
      label: "Impaired mental status (GCS < 15 / documented disorientation)",
      inputKey: "mental_status",
      canonicalUnit: null,
      window: W_FIRST_24,
      selector: "worst",
      points: 1,
      rule: { op: "eq", value: 0 },
      required: true,
      // Assessed clinically at the bedside — not something to raise a lab/investigation task for.
      noAutoTask: true,
    },
    {
      componentId: "bisap.sirs",
      label: "SIRS present (≥ 2 criteria)",
      inputKey: "sirs_present",
      canonicalUnit: null,
      window: W_FIRST_24,
      selector: "worst",
      points: 1,
      rule: { op: "present" },
      required: true,
      // Its inputs (temp / pulse / RR / WBC) have their own explicit day-1 tasks below.
      noAutoTask: true,
    },
    {
      componentId: "bisap.age",
      label: "Age > 60 years",
      inputKey: "age_years",
      canonicalUnit: null,
      window: W_AT_ADMISSION,
      selector: "admission",
      points: 1,
      rule: { op: "gt", value: 60 },
      required: true,
      noAutoTask: true,
    },
    {
      componentId: "bisap.pleural_effusion",
      label: "Pleural effusion on chest or abdominal imaging",
      inputKey: "pleural_effusion",
      canonicalUnit: null,
      window: W_FIRST_24,
      selector: "first",
      points: 1,
      rule: { op: "present" },
      required: true,
      // Never order imaging just to complete the score — stays unknown until imaging exists.
      noAutoTask: true,
    },
  ],
};

export const acutePancreatitisV1: PathwayDefinition = {
  pathwayId: "acute_pancreatitis",
  pathwayVersion: "1.0.0",
  title: "Acute pancreatitis",
  status: "draft",
  clinicalOwner: "PENDING_CLINICAL_OWNER (General Surgery + Gastroenterology/HPB)",
  sourceReferences: [
    { label: "BISAP", citation: "Wu BU et al. Gut 2008;57:1698–1703." },
    { label: "ACG Acute Pancreatitis guideline (2024 update)", citation: "American College of Gastroenterology." },
    { label: "Revised Atlanta 2012", citation: "Banks PA et al. Gut 2013;62:102–111." },
    { label: "Ranson criteria review", citation: "World J Clin Cases 2019;7:1006–1020. PMC6511926." },
  ],
  reviewDueAt: "2027-08-31",

  diagnosisTriggers: {
    codes: ["K85", "K85.9", "K85.90"],
    textPatterns: [
      "acute pancreatitis",
      "ac pancreatitis",
      "pancreatitis",
      "acute on chronic pancreatitis",
      "gallstone pancreatitis",
      "biliary pancreatitis",
      "necrotising pancreatitis",
      "severe acute pancreatitis",
    ],
    excludePatterns: ["chronic pancreatitis", "pancreatic cancer", "pancreatic carcinoma", "resolved pancreatitis", "h/o pancreatitis"],
  },

  eligibility: {
    minAgeYears: 16,
    notes: ["Adult general-surgery ward workflow.", "Store symptom onset time separately from hospital admission time."],
  },
  exclusions: [
    "Chronic pancreatitis without an acute episode.",
    "Post-ERCP hyperamylasaemia without clinical pancreatitis.",
  ],

  cards: [bisapCard],

  tasks: [
    // One investigations to-do only. The routine panel (CBC / LFT / KFT / SE) covers both
    // BISAP inputs that come from bloods — WBC (CBC) and BUN (KFT) — plus the rest of the
    // routine pancreatitis work-up. Serial vitals are continuous monitoring, not a to-do.
    {
      key: "bisap_investigations",
      cardId: "bisap",
      componentId: null,
      action: "Send routine investigations — CBC, LFT, KFT, SE",
      reason: "BISAP needs white-cell count (CBC) and BUN (KFT); LFT and electrolytes complete the routine pancreatitis panel.",
      priority: "soon",
      responsibleRole: "resident",
      institutionalToggle: null,
      // Clears once the kidney panel (BUN/urea) is back — the BISAP-critical result.
      linkKey: "bun",
    },
  ],

  checkpoints: [
    { key: "bisap_24h", dueFrom: "admission", dueAtHours: 24, label: "BISAP review by 24 hours", recomputeCards: ["bisap"] },
  ],

  recomputePolicy: ["new_lab", "new_observation", "new_imaging", "scheduled_checkpoint", "manual"],
  institutionalToggles: {},
};

// ===========================================================================
// TEST-ONLY: extended cards, not part of the shipped pathway.
// ===========================================================================

function ransonAdmission(
  cardId: string,
  title: string,
  t: { age: number; wbc: number; glucose: number; ldh: number; ast: number }
): CardDefinition {
  return {
    cardId,
    title,
    type: "calculator",
    timingLabel: "admission stage",
    calculation: { kind: "sum_points" },
    recomputeOn: ["new_lab", "new_observation", "manual"],
    interpretationBands: [
      { min: 0, max: 2, text: "Ranson admission 0–2 (legacy staged score).", tone: "neutral" },
      { min: 3, max: 5, text: "≥ 3 Ranson admission criteria met (legacy staged score).", tone: "attention" },
    ],
    inputs: [
      { componentId: `${cardId}.age`, label: `Age > ${t.age} years`, inputKey: "age_years", canonicalUnit: null, window: W_AT_ADMISSION, selector: "admission", points: 1, rule: { op: "gt", value: t.age }, required: true },
      { componentId: `${cardId}.wbc`, label: `WBC > ${t.wbc}/mm³`, inputKey: "wbc", canonicalUnit: "cells/mm3", window: W_AT_ADMISSION, selector: "worst", points: 1, rule: { op: "gt", value: t.wbc }, required: true },
      { componentId: `${cardId}.glucose`, label: `Glucose > ${t.glucose} mg/dL`, inputKey: "glucose", canonicalUnit: "mg/dL", window: W_AT_ADMISSION, selector: "worst", points: 1, rule: { op: "gt", value: t.glucose }, required: true },
      { componentId: `${cardId}.ldh`, label: `LDH > ${t.ldh} IU/L`, inputKey: "ldh", canonicalUnit: "IU/L", window: W_AT_ADMISSION, selector: "worst", points: 1, rule: { op: "gt", value: t.ldh }, required: true },
      { componentId: `${cardId}.ast`, label: `AST > ${t.ast} IU/L`, inputKey: "ast", canonicalUnit: "IU/L", window: W_AT_ADMISSION, selector: "worst", points: 1, rule: { op: "gt", value: t.ast }, required: true },
    ],
  };
}

function ranson48h(
  cardId: string,
  title: string,
  t: { hctFall: number; bunRise: number; calcium: number; pao2?: number; baseDeficit: number; fluidSeq: number }
): CardDefinition {
  const inputs: CardDefinition["inputs"] = [
    { componentId: `${cardId}.hct_fall`, label: `Haematocrit fall > ${t.hctFall} points`, inputKey: "hct", canonicalUnit: "%", window: W_AT_48H, selector: "change_from_baseline", baselineWindow: W_AT_ADMISSION, points: 1, rule: { op: "lt", value: -t.hctFall }, required: true },
    { componentId: `${cardId}.bun_rise`, label: `BUN rise > ${t.bunRise} mg/dL`, inputKey: "bun", canonicalUnit: "mg/dL", window: W_AT_48H, selector: "change_from_baseline", baselineWindow: W_AT_ADMISSION, points: 1, rule: { op: "gt", value: t.bunRise }, required: true },
    { componentId: `${cardId}.calcium`, label: `Calcium < ${t.calcium} mg/dL`, inputKey: "calcium", canonicalUnit: "mg/dL", window: W_AT_48H, selector: "worst", points: 1, rule: { op: "lt", value: t.calcium }, required: true },
  ];
  if (t.pao2 != null) {
    inputs.push({ componentId: `${cardId}.pao2`, label: `PaO₂ < ${t.pao2} mmHg`, inputKey: "pao2", canonicalUnit: "mmHg", window: W_AT_48H, selector: "worst", points: 1, rule: { op: "lt", value: t.pao2 }, required: true });
  }
  inputs.push(
    { componentId: `${cardId}.base_deficit`, label: `Base deficit > ${t.baseDeficit} mEq/L`, inputKey: "base_deficit", canonicalUnit: "mEq/L", window: W_AT_48H, selector: "worst", points: 1, rule: { op: "gt", value: t.baseDeficit }, required: true },
    { componentId: `${cardId}.fluid_sequestration`, label: `Fluid sequestration > ${t.fluidSeq} L`, inputKey: "fluid_sequestration", canonicalUnit: null, window: W_AT_48H, selector: "highest", points: 1, rule: { op: "gt", value: t.fluidSeq }, required: true }
  );
  return {
    cardId,
    title,
    type: "calculator",
    timingLabel: "Scheduled for 48 hours after admission",
    calculation: { kind: "sum_points" },
    lockedUntilCheckpoint: "ranson_48h",
    recomputeOn: ["new_lab", "new_observation", "scheduled_checkpoint", "manual"],
    interpretationBands: [{ min: 0, max: 11, text: "Ranson 48-hour (legacy staged score).", tone: "neutral" }],
    inputs,
  };
}

const atlantaCard: CardDefinition = {
  cardId: "atlanta",
  title: "Revised Atlanta classification",
  type: "structured_classification",
  timingLabel: "dynamic — persistence resolved at 48 h",
  calculation: { kind: "revised_atlanta" },
  requiresConfirmation: true,
  recomputeOn: ["new_lab", "new_observation", "deterioration", "scheduled_checkpoint", "manual"],
  interpretationBands: [
    { min: 0, max: 0, text: "Mild: no organ failure and no local or systemic complication.", tone: "neutral" },
    { min: 1, max: 1, text: "Moderately severe: transient organ failure (< 48 h) and/or local or systemic complication.", tone: "attention" },
    { min: 2, max: 2, text: "Severe: persistent organ failure (≥ 48 h).", tone: "attention" },
  ],
  inputs: [
    { componentId: "atlanta.marshall_window", label: "Modified Marshall organ-failure assessment", inputKey: "creatinine", canonicalUnit: null, window: W_DYNAMIC, selector: "worst", points: 0, rule: { op: "present" }, required: false },
  ],
};

const mctsiCard: CardDefinition = {
  cardId: "mctsi",
  title: "Modified CT Severity Index",
  type: "documentation_only",
  timingLabel: "only when a contrast CT report exists",
  calculation: { kind: "structured_extraction" },
  requiresConfirmation: true,
  requiresAnyInputPresent: true,
  recomputeOn: ["new_imaging", "manual"],
  interpretationBands: [{ min: 0, max: 10, text: "mCTSI as reported.", tone: "neutral" }],
  inputs: [
    { componentId: "mctsi.pancreatic_inflammation", label: "Pancreatic inflammation", inputKey: "ct_pancreatic_inflammation", canonicalUnit: null, window: W_DYNAMIC, selector: "first", points: 0, rule: { op: "present" }, required: true, noAutoTask: true },
    { componentId: "mctsi.pancreatic_necrosis", label: "Pancreatic necrosis", inputKey: "ct_pancreatic_necrosis", canonicalUnit: null, window: W_DYNAMIC, selector: "first", points: 0, rule: { op: "present" }, required: true, noAutoTask: true },
    { componentId: "mctsi.extrapancreatic", label: "Extrapancreatic complications", inputKey: "ct_extrapancreatic", canonicalUnit: null, window: W_DYNAMIC, selector: "first", points: 0, rule: { op: "present" }, required: true, noAutoTask: true },
  ],
};

/** Not shipped — exercised by the engine test-suite to keep generic-engine coverage. */
export const PANCREATITIS_EXTENDED_CARDS: CardDefinition[] = [
  ransonAdmission("ranson_admission_nongallstone", "Ranson — admission (non-gallstone)", { age: 55, wbc: 16000, glucose: 200, ldh: 350, ast: 250 }),
  ransonAdmission("ranson_admission_gallstone", "Ranson — admission (gallstone)", { age: 70, wbc: 18000, glucose: 220, ldh: 400, ast: 250 }),
  ranson48h("ranson_48h_nongallstone", "Ranson — 48 hours (non-gallstone)", { hctFall: 10, bunRise: 5, calcium: 8, pao2: 60, baseDeficit: 4, fluidSeq: 6 }),
  ranson48h("ranson_48h_gallstone", "Ranson — 48 hours (gallstone)", { hctFall: 10, bunRise: 2, calcium: 8, baseDeficit: 5, fluidSeq: 4 }),
  atlantaCard,
  mctsiCard,
];
