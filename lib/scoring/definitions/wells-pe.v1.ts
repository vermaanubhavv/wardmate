/**
 * Suspected pulmonary embolism — pathway definition v1.0.0. ONE score: the (two-tier)
 * Wells PE score.
 *
 * Seven weighted clinical features. Score > 4 → PE likely (proceed to CT pulmonary
 * angiography); ≤ 4 → PE unlikely (a D-dimer can rule it out without imaging).
 *
 * STATUS: active for the internal-medicine pilot (2026-09-05) — formal governance review still
 * due. Source: Wells PS et al., Thromb Haemost 2000;83:416–20 (derivation); Christopher Study
 * Investigators, JAMA 2006;295:172–9 (two-tier validation).
 */

import type { CardDefinition, PathwayDefinition, TimeWindow } from "../types";

const W: TimeWindow = { anchor: "admission", startHours: -24, label: "at assessment" };

const yesNo = [
  { label: "No", record: "absent", satisfied: false, normal: true },
  { label: "Yes", record: "present", satisfied: true },
];

const clin = (componentId: string, label: string, inputKey: string, question: string, recordLabel: string, points: number) => ({
  componentId,
  label,
  inputKey,
  canonicalUnit: null,
  window: W,
  selector: "first" as const,
  points,
  rule: { op: "present" as const },
  required: true,
  noAutoTask: true,
  clinicianAssessed: true,
  assess: { question, recordLabel, options: yesNo },
});

const card: CardDefinition = {
  cardId: "wells_pe",
  title: "Wells score — pulmonary embolism",
  shortName: "Wells PE",
  citation:
    "Wells PE (two-tier) — Wells PS et al., Thromb Haemost 2000;83:416–20; Christopher Study Investigators, JAMA 2006;295:172–9. Score > 4: PE likely — proceed to CT pulmonary angiography. Score ≤ 4: PE unlikely — a negative D-dimer can rule it out without imaging.",
  type: "calculator",
  timingLabel: "at assessment",
  calculation: { kind: "sum_points" },
  recomputeOn: ["new_observation", "manual"],
  interpretationBands: [
    { min: 0, max: 4, text: "Wells PE ≤ 4 — PE unlikely. A negative D-dimer can rule it out without imaging.", tone: "neutral" },
    { min: 4.5, max: 12.5, text: "Wells PE > 4 — PE likely. Proceed to CT pulmonary angiography.", tone: "attention" },
  ],
  inputs: [
    clin("wells_pe.dvt_signs", "Clinical signs and symptoms of DVT (leg swelling, tenderness on palpation)", "dvt_signs", "Clinical signs of DVT (leg swelling, deep vein tenderness)?", "Clinical signs of DVT", 3),
    clin("wells_pe.pe_most_likely", "PE is the #1 diagnosis, or equally likely", "pe_top_diagnosis", "Is PE the top diagnosis, or equally likely as an alternative?", "PE the leading diagnosis", 3),
    clin("wells_pe.tachycardia", "Heart rate > 100 /min", "tachycardia_gt_100", "Heart rate > 100/min?", "Heart rate > 100", 1.5),
    clin("wells_pe.immobilisation", "Immobilisation ≥ 3 days, or surgery in the previous 4 weeks", "immobilisation_or_surgery", "Immobilised ≥ 3 days, or surgery in the last 4 weeks?", "Immobilisation / recent surgery", 1.5),
    clin("wells_pe.prior_vte", "Previous objectively diagnosed DVT or PE", "prior_dvt_or_pe", "Previous DVT or PE?", "Prior DVT / PE", 1.5),
    clin("wells_pe.haemoptysis", "Haemoptysis", "haemoptysis", "Haemoptysis?", "Haemoptysis", 1),
    clin("wells_pe.malignancy", "Malignancy (treated within 6 months, or palliative)", "malignancy_active", "Active malignancy (treated within 6 months, or palliative)?", "Active malignancy", 1),
  ],
};

export const wellsPeV1: PathwayDefinition = {
  pathwayId: "wells_pe",
  pathwayVersion: "1.0.0",
  title: "Suspected pulmonary embolism",
  status: "active",
  clinicalOwner: "Internal Medicine unit (pilot activation 2026-09-05; formal review pending)",
  sourceReferences: [
    { label: "Wells PS et al., Thromb Haemost 2000", citation: "Derivation of a simple clinical model to categorize patients probability of pulmonary embolism. Thromb Haemost 2000;83:416–20." },
    { label: "Christopher Study, JAMA 2006", citation: "Effectiveness of managing suspected pulmonary embolism using an algorithm combining clinical probability, D-dimer testing, and CT. JAMA 2006;295:172–9." },
  ],
  reviewDueAt: "2027-09-01",
  diagnosisTriggers: {
    codes: ["I26", "I26.9"],
    textPatterns: [
      "pulmonary embolism",
      " pe ",
      "? pe",
      "suspected pe",
      "acute breathlessness",
      "sudden onset breathlessness",
      "pleuritic chest pain",
    ],
    excludePatterns: ["on anticoagulation for pe", "known pe", "old pe", "chronic thromboembolic"],
  },
  eligibility: { minAgeYears: 16, notes: ["Not validated in pregnancy without adjustment (use a pregnancy-adapted algorithm)."] },
  exclusions: ["A patient already anticoagulated for a confirmed PE."],
  cards: [card],
  tasks: [
    {
      key: "wells_pe_next_step",
      cardId: "wells_pe",
      componentId: null,
      action: "Order CT pulmonary angiography (score > 4) or a D-dimer (score ≤ 4) per the result",
      reason: "The score exists to decide which test comes next, not to replace it.",
      priority: "urgent",
      responsibleRole: "resident",
      institutionalToggle: null,
    },
    {
      key: "wells_pe_obs",
      cardId: "wells_pe",
      componentId: null,
      action: "Chart oxygen saturation, heart rate and respiratory rate",
      reason: "Baseline observations before any imaging or treatment decision.",
      priority: "urgent",
      responsibleRole: "nursing",
      institutionalToggle: null,
    },
  ],
  checkpoints: [],
  recomputePolicy: ["new_observation", "manual"],
  institutionalToggles: {},
};
