/**
 * Minor head injury — pathway definition v1.0.0. ONE rule: the Canadian CT Head Rule.
 *
 * Applies to GCS 13–15 minor head injury with witnessed loss of consciousness, definite
 * amnesia or witnessed disorientation. HIGH risk (for neurosurgical intervention): GCS < 15 at
 * 2 h after injury, suspected open or depressed skull fracture, any sign of basal skull
 * fracture, ≥ 2 episodes of vomiting, age ≥ 65. MEDIUM risk (for brain injury on CT): amnesia
 * before impact ≥ 30 min, dangerous mechanism. Any criterion present → the rule indicates CT.
 *
 * The card states what the rule says; it never tells the clinician CT is "not needed". Outside
 * the rule's population (anticoagulation, seizure, age < 16 …) the rule does not apply.
 *
 * STATUS: draft — PENDING CLINICIAN REVIEW (drafted 2026-09-28 from the cited source; not yet
 * signed off). Source: Stiell IG et al., Lancet 2001;357:1391–6.
 */

import type { CardDefinition, PathwayDefinition, TimeWindow } from "../types";

const W: TimeWindow = { anchor: "admission", startHours: -12, label: "since presentation" };

const yn = (componentId: string, label: string, question: string, tier: "high" | "medium") => ({
  componentId,
  label,
  inputKey: componentId.replace("cch.", "cch_"),
  canonicalUnit: null,
  window: W,
  selector: "first" as const,
  points: 0,
  rule: { op: "present" as const },
  required: true,
  tier,
  noAutoTask: true,
  clinicianAssessed: true,
  assess: {
    question,
    recordLabel: label,
    options: [
      { label: "No", record: "absent", satisfied: false, normal: true },
      { label: "Yes", record: "present", satisfied: true },
    ],
  },
});

const cchCard: CardDefinition = {
  cardId: "canadian_ct_head",
  title: "Canadian CT Head Rule",
  shortName: "Canadian CT Head",
  citation:
    "Canadian CT Head Rule — Stiell IG et al., Lancet 2001;357:1391–6. For GCS 13–15 minor head injury with LOC, amnesia or disorientation. High risk: GCS < 15 at 2 h, suspected open/depressed skull fracture, sign of basal skull fracture, ≥ 2 vomiting episodes, age ≥ 65. Medium risk: amnesia before impact ≥ 30 min, dangerous mechanism. Not applicable with anticoagulation/bleeding disorder, seizure, age < 16, focal deficit or unstable vitals.",
  type: "structured_classification",
  timingLabel: "at assessment — re-check at 2 h after injury",
  calculation: { kind: "tiered_classification", tiers: ["high", "medium"], fallback: "not_met" },
  requiresConfirmation: true,
  recomputeOn: ["new_observation", "manual"],
  interpretationBands: [
    { min: 0, class: "high", text: "Rule positive — high-risk criterion present; CT head is indicated by this rule", tone: "attention" },
    { min: 0, class: "medium", text: "Rule positive — medium-risk criterion; CT head is indicated by this rule", tone: "attention" },
    { min: 0, class: "not_met", text: "No criterion recorded — the rule does not indicate CT; it applies only to GCS 13–15 minor head injury without the rule's exclusions (anticoagulation, seizure, age < 16…)", tone: "neutral" },
  ],
  inputs: [
    // --- High risk (neurosurgical intervention) ---
    yn("cch.gcs_2h", "GCS < 15 at 2 h after injury", "GCS below 15 at 2 hours after the injury?", "high"),
    yn("cch.open_depressed", "Suspected open or depressed skull fracture", "Suspected open or depressed skull fracture?", "high"),
    yn("cch.basal_skull", "Any sign of basal skull fracture", "Any sign of basal skull fracture (haemotympanum, raccoon eyes, CSF oto-/rhinorrhoea, Battle's sign)?", "high"),
    yn("cch.vomiting", "Vomiting ≥ 2 episodes", "Two or more episodes of vomiting?", "high"),
    {
      componentId: "cch.age",
      label: "Age ≥ 65 years",
      inputKey: "age_years",
      canonicalUnit: null,
      window: { anchor: "admission", startHours: -12, endHours: 24, label: "at admission" },
      selector: "admission",
      points: 0,
      rule: { op: "gte", value: 65 },
      required: true,
      tier: "high",
    },
    // --- Medium risk (brain injury on CT) ---
    yn("cch.amnesia", "Amnesia before impact ≥ 30 min", "Retrograde amnesia (before impact) of 30 minutes or more?", "medium"),
    yn("cch.mechanism", "Dangerous mechanism", "Dangerous mechanism (pedestrian struck by a vehicle, occupant ejected from a vehicle, fall from > 3 ft or > 5 stairs)?", "medium"),
  ],
};

export const canadianCtHeadV1: PathwayDefinition = {
  pathwayId: "canadian_ct_head",
  pathwayVersion: "1.0.0",
  title: "Minor head injury",
  status: "draft",
  clinicalOwner: "PENDING CLINICIAN REVIEW — drafted 2026-09-28 from the cited source; not yet signed off. Departmental review due 2027-09-01.",
  sourceReferences: [
    { label: "Stiell IG et al., Lancet 2001", citation: "The Canadian CT Head Rule for patients with minor head injury. Lancet 2001;357:1391–6." },
  ],
  reviewDueAt: "2027-09-01",
  diagnosisTriggers: {
    codes: [],
    textPatterns: ["head injury", "minor head injury", "rta with head injury", "fall with head injury", "concussion"],
    excludePatterns: ["no head injury", "old head injury"],
  },
  eligibility: { minAgeYears: 16, notes: ["GCS 13–15 after head injury with witnessed loss of consciousness, definite amnesia or witnessed disorientation."] },
  exclusions: [
    "Age < 16 years.",
    "Minimal head injury (no LOC, amnesia or disorientation).",
    "No clear history of trauma as the primary event.",
    "Obvious penetrating skull injury or obvious depressed fracture.",
    "Acute focal neurological deficit.",
    "Unstable vital signs associated with major trauma.",
    "Seizure before assessment.",
    "Bleeding disorder or oral anticoagulant use.",
    "Returned for reassessment of the same head injury.",
    "Pregnancy.",
  ],
  cards: [cchCard],
  tasks: [],
  checkpoints: [],
  recomputePolicy: ["new_observation", "manual"],
  institutionalToggles: {},
};
