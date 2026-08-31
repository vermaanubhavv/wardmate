/**
 * Acute pancreatitis — pathway definition v1.0.0.
 *
 * This is CONFIGURATION, not application logic. Every clinical threshold below is data the
 * engine reads; none of it is a scattered `if` in a component. The other 19 pathways in the
 * DOCX are added the same way (see `definitions/skeletons.ts`), without touching the engine.
 *
 * Clinical content: DOCX §1 (Wardmate_General_Surgery_Scoring_Engine_v1). Sources [1]–[4].
 * STATUS: `draft` until a clinical governance owner signs off — the engine will suggest but
 * not auto-activate a non-`active` pathway, and the UI shows the "supports, does not replace
 * clinical judgement" disclaimer on every card.
 */

import type { PathwayDefinition, TimeWindow } from "../types";

const W_FIRST_24: TimeWindow = { anchor: "admission", startHours: -6, endHours: 24, label: "first 24 hours" };
const W_AT_ADMISSION: TimeWindow = { anchor: "admission", startHours: -12, endHours: 24, label: "at admission" };
const W_AT_48H: TimeWindow = { anchor: "admission", startHours: 36, endHours: 60, label: "at 48 hours" };
const W_DYNAMIC: TimeWindow = { anchor: "admission", startHours: 0, label: "since admission (dynamic)" };

export const acutePancreatitisV1: PathwayDefinition = {
  pathwayId: "acute_pancreatitis",
  pathwayVersion: "1.0.0",
  title: "Acute pancreatitis",
  status: "draft",
  clinicalOwner: "PENDING_CLINICAL_OWNER (General Surgery + Gastroenterology/HPB)",
  sourceReferences: [
    { label: "Revised Atlanta 2012", citation: "Banks PA et al. Gut 2013;62:102–111." },
    { label: "ACG Acute Pancreatitis guideline (2024 update)", citation: "American College of Gastroenterology." },
    { label: "BISAP", citation: "Wu BU et al. Gut 2008;57:1698–1703." },
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
    notes: [
      "Adult general-surgery ward workflow.",
      "Store symptom onset time separately from hospital admission time.",
    ],
  },
  exclusions: [
    "Chronic pancreatitis without an acute episode.",
    "Post-ERCP hyperamylasaemia without clinical pancreatitis.",
  ],

  cards: [
    // ---------------------------------------------------------------- BISAP
    {
      cardId: "bisap",
      title: "BISAP",
      type: "calculator",
      timingLabel: "first 24 hours",
      calculation: { kind: "sum_points" },
      recomputeOn: ["new_lab", "new_observation", "new_imaging", "scheduled_checkpoint", "manual"],
      interpretationBands: [
        { min: 0, max: 2, text: "BISAP 0–2. Lower-risk screen. Interpret alongside clinical assessment and Atlanta severity.", tone: "neutral" },
        { min: 3, max: 5, text: "Higher-risk screen — review monitoring and escalation needs. This does not declare severe pancreatitis or mandate ICU transfer.", tone: "attention" },
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
          rule: { op: "eq", value: 0 }, // adapter: 0 = impaired, 1 = intact
          required: true,
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
          // Never order a CT solely to complete BISAP — stays unknown until suitable imaging exists.
          noAutoTask: true,
        },
      ],
    },

    // ------------------------------------------------ Ranson — admission, non-gallstone
    ransonAdmission("ranson_admission_nongallstone", "Ranson — admission (non-gallstone)", {
      age: 55,
      wbc: 16000,
      glucose: 200,
      ldh: 350,
      ast: 250,
    }),
    ransonAdmission("ranson_admission_gallstone", "Ranson — admission (gallstone)", {
      age: 70,
      wbc: 18000,
      glucose: 220,
      ldh: 400,
      ast: 250,
    }),

    // ------------------------------------------------ Ranson — 48 hours
    ranson48h("ranson_48h_nongallstone", "Ranson — 48 hours (non-gallstone)", {
      hctFall: 10,
      bunRise: 5,
      calcium: 8,
      pao2: 60,
      baseDeficit: 4,
      fluidSeq: 6,
    }),
    ranson48h("ranson_48h_gallstone", "Ranson — 48 hours (gallstone)", {
      hctFall: 10,
      bunRise: 2,
      calcium: 8,
      baseDeficit: 5,
      fluidSeq: 4,
    }),

    // -------------------------------------------- Revised Atlanta / Modified Marshall
    {
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
        {
          componentId: "atlanta.marshall_window",
          label: "Modified Marshall organ-failure assessment",
          inputKey: "creatinine",
          canonicalUnit: null,
          window: W_DYNAMIC,
          selector: "worst",
          points: 0,
          rule: { op: "present" },
          required: false,
        },
      ],
    },

    // --------------------------------------------------- Modified CT Severity Index
    {
      cardId: "mctsi",
      title: "Modified CT Severity Index",
      type: "documentation_only",
      timingLabel: "only when a contrast CT report exists",
      calculation: { kind: "structured_extraction" },
      requiresConfirmation: true,
      requiresAnyInputPresent: true,
      recomputeOn: ["new_imaging", "manual"],
      interpretationBands: [
        { min: 0, max: 2, text: "mCTSI 0–2 (as reported).", tone: "neutral" },
        { min: 4, max: 10, text: "mCTSI 4–10 (as reported) — higher radiological severity. Verified against the signed report.", tone: "attention" },
      ],
      inputs: [
        {
          componentId: "mctsi.pancreatic_inflammation",
          label: "Pancreatic inflammation (normal 0 / intrinsic 2 / peripancreatic 4)",
          inputKey: "ct_pancreatic_inflammation",
          canonicalUnit: null,
          window: W_DYNAMIC,
          selector: "first",
          points: 0,
          rule: { op: "present" },
          required: true,
          noAutoTask: true,
        },
        {
          componentId: "mctsi.pancreatic_necrosis",
          label: "Pancreatic necrosis (none 0 / ≤30% 2 / >30% 4)",
          inputKey: "ct_pancreatic_necrosis",
          canonicalUnit: null,
          window: W_DYNAMIC,
          selector: "first",
          points: 0,
          rule: { op: "present" },
          required: true,
          noAutoTask: true,
        },
        {
          componentId: "mctsi.extrapancreatic",
          label: "Extrapancreatic complications (2 if present)",
          inputKey: "ct_extrapancreatic",
          canonicalUnit: null,
          window: W_DYNAMIC,
          selector: "first",
          points: 0,
          rule: { op: "present" },
          required: true,
          noAutoTask: true,
        },
      ],
    },
  ],

  tasks: [
    dayOne("cbc", "Send CBC with differential", "Baseline haematology; feeds BISAP SIRS, Ranson WBC and haematocrit trend.", "resident", "soon"),
    dayOne("renal_profile", "Send urea / BUN, creatinine and electrolytes", "Feeds BISAP BUN, Ranson BUN, Modified Marshall renal score and fluid status.", "resident", "soon"),
    dayOne("glucose", "Send blood glucose", "Ranson admission criterion; also relevant to management.", "resident", "soon"),
    dayOne("calcium", "Send serum calcium", "Ranson 48-hour criterion (calcium < 8 mg/dL).", "resident", "routine"),
    dayOne("lft", "Send liver function tests with bilirubin", "Aetiology (biliary vs non-biliary) and Ranson AST.", "resident", "soon"),
    dayOne("crp", "Send CRP", "Trend marker for pancreatitis severity.", "resident", "routine"),
    { ...dayOne("triglycerides", "Send serum triglycerides", "When aetiology is unclear — hypertriglyceridaemic pancreatitis.", "resident", "routine"), institutionalToggle: "triglycerides" },
    dayOne("usg_biliary", "Arrange ultrasound abdomen for biliary cause", "Identify gallstones / CBD dilatation as aetiology.", "resident", "soon"),
    dayOne("strict_io", "Start strict intake/output and hourly urine-output charting", "Fluid resuscitation monitoring; oliguria is an escalation prompt.", "nursing", "soon"),
    dayOne("serial_vitals", "Record serial vital signs (temp, HR, RR, BP)", "SIRS tracking and early deterioration.", "nursing", "soon"),
    dayOne("oximetry", "Continuous SpO₂ / oxygenation monitoring", "Hypoxaemia is an escalation prompt and a Modified Marshall input.", "nursing", "soon"),
    { ...dayOne("ldh_ast", "Send LDH (and AST if not already sent)", "Only if the unit completes Ranson or the patient's condition warrants it.", "resident", "routine"), institutionalToggle: "ranson_extended" },
    { ...dayOne("abg", "Send arterial blood gas (PaO₂, base deficit)", "Only if locally required for Ranson or clinically indicated (hypoxaemia, shock).", "resident", "routine"), institutionalToggle: "ranson_extended" },
    {
      key: "bisap_review_24h",
      cardId: "bisap",
      componentId: null,
      action: "Review and complete BISAP; verify mental status, SIRS and pleural-effusion evidence",
      reason: "BISAP is a first-24-hour score; the checkpoint refreshes it from the defined window and asks for clinician verification.",
      priority: "soon",
      responsibleRole: "resident",
      institutionalToggle: null,
      dueFromAnchor: "admission",
      dueAtHours: 24,
    },
    {
      key: "ranson_48h_review",
      cardId: null,
      componentId: null,
      action: "Complete the Ranson 48-hour stage and resolve transient vs persistent organ failure",
      reason: "Ranson's second stage is defined at exactly 48 hours from admission; Atlanta persistence is resolved at the same point.",
      priority: "soon",
      responsibleRole: "resident",
      institutionalToggle: null,
      dueFromAnchor: "admission",
      dueAtHours: 48,
    },
  ],

  checkpoints: [
    { key: "bisap_24h", dueFrom: "admission", dueAtHours: 24, label: "BISAP review by 24 hours", recomputeCards: ["bisap"] },
    { key: "ranson_48h", dueFrom: "admission", dueAtHours: 48, label: "Ranson second stage at 48 hours", recomputeCards: ["ranson_48h_nongallstone", "ranson_48h_gallstone"] },
    { key: "atlanta_persistence", dueFrom: "admission", dueAtHours: 48, label: "Atlanta organ-failure persistence check", recomputeCards: ["atlanta"] },
  ],

  recomputePolicy: ["new_lab", "new_observation", "new_imaging", "scheduled_checkpoint", "deterioration", "manual"],

  institutionalToggles: {
    ranson_extended: false, // LDH / AST / ABG / PaO₂ / base deficit only when the unit completes Ranson
    triglycerides: true,
  },
};

// ---------------------------------------------------------------------------
// Builders — keep the two Ranson variants defined once each.
// ---------------------------------------------------------------------------

function ransonAdmission(
  cardId: string,
  title: string,
  t: { age: number; wbc: number; glucose: number; ldh: number; ast: number }
): PathwayDefinition["cards"][number] {
  return {
    cardId,
    title,
    type: "calculator",
    timingLabel: "admission stage — due now",
    calculation: { kind: "sum_points" },
    recomputeOn: ["new_lab", "new_observation", "manual"],
    interpretationBands: [
      { min: 0, max: 2, text: "Ranson admission 0–2. Commonly used staged/legacy academic score — not the sole pancreatitis severity assessment.", tone: "neutral" },
      { min: 3, max: 5, text: "≥ 3 Ranson admission criteria met. Staged legacy score — interpret alongside BISAP and Revised Atlanta.", tone: "attention" },
    ],
    inputs: [
      { componentId: `${cardId}.age`, label: `Age > ${t.age} years`, inputKey: "age_years", canonicalUnit: null, window: W_AT_ADMISSION, selector: "admission", points: 1, rule: { op: "gt", value: t.age }, required: true },
      { componentId: `${cardId}.wbc`, label: `WBC > ${t.wbc.toLocaleString()}/mm³`, inputKey: "wbc", canonicalUnit: "cells/mm3", window: W_AT_ADMISSION, selector: "worst", points: 1, rule: { op: "gt", value: t.wbc }, required: true },
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
): PathwayDefinition["cards"][number] {
  const inputs: PathwayDefinition["cards"][number]["inputs"] = [
    {
      componentId: `${cardId}.hct_fall`,
      label: `Haematocrit fall > ${t.hctFall} percentage points`,
      inputKey: "hct",
      canonicalUnit: "%",
      window: W_AT_48H,
      selector: "change_from_baseline",
      baselineWindow: W_AT_ADMISSION,
      points: 1,
      rule: { op: "lt", value: -t.hctFall },
      required: true,
    },
    {
      componentId: `${cardId}.bun_rise`,
      label: `BUN rise > ${t.bunRise} mg/dL despite IV fluids`,
      inputKey: "bun",
      canonicalUnit: "mg/dL",
      window: W_AT_48H,
      selector: "change_from_baseline",
      baselineWindow: W_AT_ADMISSION,
      points: 1,
      rule: { op: "gt", value: t.bunRise },
      required: true,
    },
    { componentId: `${cardId}.calcium`, label: `Calcium < ${t.calcium} mg/dL`, inputKey: "calcium", canonicalUnit: "mg/dL", window: W_AT_48H, selector: "worst", points: 1, rule: { op: "lt", value: t.calcium }, required: true },
  ];
  if (t.pao2 != null) {
    inputs.push({ componentId: `${cardId}.pao2`, label: `PaO₂ < ${t.pao2} mmHg`, inputKey: "pao2", canonicalUnit: "mmHg", window: W_AT_48H, selector: "worst", points: 1, rule: { op: "lt", value: t.pao2 }, required: true });
  }
  inputs.push(
    { componentId: `${cardId}.base_deficit`, label: `Base deficit > ${t.baseDeficit} mEq/L`, inputKey: "base_deficit", canonicalUnit: "mEq/L", window: W_AT_48H, selector: "worst", points: 1, rule: { op: "gt", value: t.baseDeficit }, required: true },
    { componentId: `${cardId}.fluid_sequestration`, label: `Estimated fluid sequestration > ${t.fluidSeq} L`, inputKey: "fluid_sequestration", canonicalUnit: null, window: W_AT_48H, selector: "highest", points: 1, rule: { op: "gt", value: t.fluidSeq }, required: true }
  );
  return {
    cardId,
    title,
    type: "calculator",
    timingLabel: "Scheduled for 48 hours after admission",
    calculation: { kind: "sum_points" },
    lockedUntilCheckpoint: "ranson_48h",
    recomputeOn: ["new_lab", "new_observation", "scheduled_checkpoint", "manual"],
    interpretationBands: [
      { min: 0, max: 2, text: "Ranson 48-hour 0–2. Staged legacy score; combine with the admission stage only, not with incompatible time windows.", tone: "neutral" },
      { min: 3, max: 6, text: "≥ 3 Ranson 48-hour criteria met. Staged legacy score — interpret alongside Revised Atlanta.", tone: "attention" },
    ],
    inputs,
  };
}

function dayOne(
  key: string,
  action: string,
  reason: string,
  role: "resident" | "nursing" | "senior" | "radiology",
  priority: "routine" | "soon" | "urgent"
): PathwayDefinition["tasks"][number] {
  return {
    key,
    cardId: null,
    componentId: null,
    action,
    reason,
    priority,
    responsibleRole: role,
    institutionalToggle: null,
  };
}
