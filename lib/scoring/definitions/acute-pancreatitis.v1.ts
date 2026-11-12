/**
 * Acute pancreatitis — pathway definition v1.0.0.
 *
 * ONE score: BISAP. It is the modern first-line bedside severity screen (5 items, first 24 h,
 * no gallstone/non-gallstone split) and current guidelines favour it over Ranson. The score is
 * shown as a line in the progress note, auto-calculated whenever the inputs exist; the inputs
 * it still needs appear as ordinary items in the to-do list. There is no separate scoring
 * screen.
 *
 * Clinical content: DOCX §1 (Wardmate_General_Surgery_Scoring_Engine_v1). Sources [1]–[4].
 * STATUS: active — signed off for pilot use by Dr. Anubhav on 2026-09-07; departmental governance review still due (reviewDueAt).
 */

import type { CardDefinition, PathwayDefinition, TimeWindow } from "../types";

const W_FIRST_24: TimeWindow = { anchor: "admission", startHours: -6, endHours: 24, label: "first 24 hours" };
const W_AT_ADMISSION: TimeWindow = { anchor: "admission", startHours: -12, endHours: 24, label: "at admission" };

// ---------------------------------------------------------------------------
// BISAP — the one shipped card
// ---------------------------------------------------------------------------

const bisapCard: CardDefinition = {
  cardId: "bisap",
  title: "BISAP",
  shortName: "BISAP",
  citation:
    "BISAP — Wu BU et al., Gut 2008. A score of ≥ 3 carries roughly 15% inpatient mortality, versus under 1% at 0–1. Interpret with clinical assessment; it does not declare severe pancreatitis or mandate ICU.",
  type: "calculator",
  calculation: { kind: "sum_points" },
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
      noAutoTask: true,
      clinicianAssessed: true,
      assess: {
        question: "Mental status?",
        recordLabel: "Mental status",
        options: [
          { label: "Alert / oriented", record: "alert and oriented (GCS 15)", satisfied: false, normal: true },
          { label: "Impaired", record: "impaired — disoriented / GCS < 15", satisfied: true },
        ],
      },
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
      noAutoTask: true, // never order imaging just to complete the score
      clinicianAssessed: true,
      assess: {
        question: "Pleural effusion on chest imaging?",
        recordLabel: "Pleural effusion",
        options: [
          { label: "None on imaging", record: "none on chest imaging", satisfied: false, normal: true },
          { label: "Present on imaging", record: "present on chest imaging", satisfied: true },
        ],
      },
    },
  ],
};

export const acutePancreatitisV1: PathwayDefinition = {
  pathwayId: "acute_pancreatitis",
  pathwayVersion: "1.0.0",
  title: "Acute pancreatitis",
  // Reviewed against the cited source and signed off for pilot use by Dr. Anubhav on
  // 2026-09-07. Triple-gated at runtime; departmental governance review still due (reviewDueAt).
  status: "active",
  clinicalOwner: "Reviewed against the cited sources and signed off for pilot use by Dr. Anubhav, General Surgery — 2026-09-07. Single-clinician sign-off; departmental / multidisciplinary review due 2027-09-01.",
  sourceReferences: [
    { label: "BISAP", citation: "Wu BU et al. Gut 2008;57:1698–1703." },
    { label: "ACG Acute Pancreatitis guideline (2024 update)", citation: "American College of Gastroenterology." },
    { label: "Revised Atlanta 2012", citation: "Banks PA et al. Gut 2013;62:102–111." },
    { label: "Ranson criteria review", citation: "World J Clin Cases 2019;7:1006–1020. PMC6511926." },
  ],
  reviewDueAt: "2027-08-31",

  diagnosisTriggers: {
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

  institutionalToggles: {},
};
