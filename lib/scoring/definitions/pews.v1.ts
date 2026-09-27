/**
 * Paediatric early warning — pathway definition v1.0.0. ONE card: the Brighton Paediatric
 * Early Warning Score (PEWS).
 *
 * Three clinician-assessed domains scored 0–3 (behaviour, cardiovascular, respiratory), plus
 * 2 points each for ¼-hourly nebulisers and persistent post-operative vomiting. Total 0–13.
 * 0–2 routine; 3 → more frequent observations and inform the nurse in charge; ≥ 4, or any
 * single domain scoring 3 → prompt review by the doctor. The engine bands on the total only,
 * so the "any single 3" rule is stated in the band text for the resident to apply.
 *
 * Heart- and respiratory-rate thresholds are relative to the normal range FOR AGE. The engine
 * cannot age-band, so the resident judges "above the normal rate for age" when answering.
 *
 * STATUS: active — signed off for pilot use by Dr Anubhav Verma, 2026-09-28 (single-clinician sign-off;
 * departmental review due 2027-09-01). Source: Monaghan A. Detecting and
 * managing deterioration in children. Paediatr Nurs 2005;17:32–5.
 */

import type { CardDefinition, ComponentInput, PathwayDefinition, TimeWindow } from "../types";

const W: TimeWindow = { anchor: "admission", startHours: -6, label: "since presentation (dynamic)" };

/** A Brighton domain scored 0–3; option i scores i points. */
const domain = (id: string, label: string, question: string, levels: [string, string, string, string]): ComponentInput => ({
  componentId: `pews.${id}`,
  label,
  inputKey: `pews_${id}`,
  canonicalUnit: null,
  window: W,
  selector: "worst",
  points: 3,
  rule: { op: "present" },
  required: true,
  noAutoTask: true,
  clinicianAssessed: true,
  assess: {
    question,
    recordLabel: `${label} (PEWS)`,
    options: levels.map((l, i) => ({
      label: l,
      record: `${label} (PEWS ${i}): ${l.toLowerCase()}`,
      satisfied: i > 0,
      ...(i > 0 ? { points: i } : { normal: true }),
    })),
  },
});

/** A yes/no 2-point add-on. */
const addOn = (id: string, label: string, question: string): ComponentInput => ({
  componentId: `pews.${id}`,
  label,
  inputKey: `pews_${id}`,
  canonicalUnit: null,
  window: W,
  selector: "worst",
  points: 2,
  rule: { op: "present" },
  required: true,
  noAutoTask: true,
  clinicianAssessed: true,
  assess: {
    question,
    recordLabel: `${label} (PEWS)`,
    options: [
      { label: "No", record: `${label}: no`, satisfied: false, normal: true },
      { label: "Yes", record: `${label}: yes`, satisfied: true },
    ],
  },
});

const pewsCard: CardDefinition = {
  cardId: "pews",
  title: "PEWS — Brighton Paediatric Early Warning Score",
  shortName: "PEWS",
  citation:
    "Brighton PEWS — Monaghan A, Paediatr Nurs 2005;17:32–5. Behaviour, cardiovascular and respiratory 0–3 each; +2 for ¼-hourly nebulisers; +2 for persistent post-operative vomiting. Heart and respiratory rates are judged against the normal range for age. 3 → more frequent observations, inform the nurse in charge; ≥ 4 or any single 3 → prompt review by the doctor. A prompt for review, not a diagnosis.",
  type: "calculator",
  timingLabel: "re-score at each observation set",
  calculation: { kind: "sum_points" },
  recomputeOn: ["new_observation", "deterioration", "manual"],
  interpretationBands: [
    { min: 0, max: 2, text: "PEWS 0–2 — routine observations for age; re-score on change.", tone: "neutral" },
    {
      min: 3,
      max: 3,
      text: "PEWS 3 — consider more frequent observations and informing the nurse in charge. If this 3 comes from a single domain scoring 3, the Brighton rule prompts review by the doctor — check which domain it came from.",
      tone: "attention",
    },
    { min: 4, text: "PEWS ≥ 4 — prompts review by the doctor.", tone: "attention" },
  ],
  inputs: [
    domain("behaviour", "Behaviour", "Behaviour?", [
      "Playing / appropriate",
      "Sleeping",
      "Irritable",
      "Lethargic / confused, or reduced response to pain",
    ]),
    domain("cardiovascular", "Cardiovascular", "Colour, capillary refill and heart rate (judged against the normal rate for age)?", [
      "Pink, or CRT 1–2 s",
      "Pale, or CRT 3 s",
      "Grey, or CRT 4 s, or heart rate 20 above the normal rate for age",
      "Grey and mottled, or CRT ≥ 5 s, or heart rate 30 above the normal rate for age, or bradycardia",
    ]),
    domain("respiratory", "Respiratory", "Breathing (respiratory rate judged against the normal rate for age) and oxygen?", [
      "Within normal parameters for age, no recession",
      "> 10 above the normal rate for age, accessory muscles, or FiO₂ 30 %+ / 4+ L/min",
      "> 20 above the normal rate for age, recession / tracheal tug, or FiO₂ 40 %+ / 6+ L/min",
      "5 below the normal rate for age with sternal recession, tug or grunting, or FiO₂ 50 %+ / 8+ L/min",
    ]),
    addOn("nebulisers", "¼-hourly nebulisers", "Needing nebulisers every 15 minutes?"),
    addOn("postop_vomiting", "Persistent post-operative vomiting", "Persistent vomiting after surgery?"),
  ],
};

export const pewsV1: PathwayDefinition = {
  pathwayId: "pews",
  pathwayVersion: "1.0.0",
  title: "Paediatric early warning (PEWS)",
  status: "active",
  clinicalOwner: "Reviewed against the cited source and signed off for pilot use by Dr Anubhav Verma — 2026-09-28. Single-clinician sign-off; departmental review due 2027-09-01.",
  sourceReferences: [
    { label: "Monaghan A, Paediatr Nurs 2005", citation: "Monaghan A. Detecting and managing deterioration in children. Paediatr Nurs 2005;17(1):32–5." },
  ],
  reviewDueAt: "2027-09-01",
  diagnosisTriggers: {
    codes: [],
    textPatterns: [
      "paediatric",
      "pediatric",
      "infant",
      "neonat",
      "toddler",
      "in a child",
      "child with",
      "bronchiolitis",
      "croup",
      "febrile seizure",
      "febrile convulsion",
      "age with dehydration",
      "gastroenteritis with dehydration",
      "pneumonia in child",
      "sepsis in child",
      "childhood",
      "intussusception",
      "kawasaki",
    ],
    excludePatterns: ["child pugh", "childbirth"],
  },
  eligibility: { maxAgeYears: 16, notes: ["Children on a paediatric ward. Heart- and respiratory-rate bands are judged against the normal range for age by the resident."] },
  exclusions: ["Adults — use the adult early-warning score."],
  cards: [pewsCard],
  tasks: [],
  checkpoints: [],
  recomputePolicy: ["new_observation", "deterioration", "manual"],
  institutionalToggles: {},
};
