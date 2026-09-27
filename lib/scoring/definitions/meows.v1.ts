/**
 * Obstetric early warning — pathway definition v1.0.0. ONE card: MEOWS (Modified Early
 * Obstetric Warning Score), the CEMACH-recommended chart as validated by Singh et al. 2012.
 *
 * Each parameter falls in a red (grossly abnormal) or yellow (mildly abnormal) band. ONE red
 * OR TWO yellow = a trigger — a prompt for review by the obstetric team, never a treatment.
 * Implemented as a tiered classification: tier "red" needs 1 satisfied component, tier
 * "yellow" needs 2. A two-sided parameter has a `highest` component for the high side and a
 * `lowest` component for the low side.
 *
 * Window: worst value since presentation (admission − 6 h, open-ended). The engine has no
 * "last N hours before now" anchor, so this is the qSOFA-style dynamic window, not the latest
 * set — a trigger early in the stay keeps showing until the clinician reviews it.
 * ponytail: worst-since-presentation, add a now-relative window anchor to score the latest set.
 *
 * STATUS: PENDING CLINICIAN REVIEW — draft, not signed off. Source: Singh S, McGlennan A,
 * England A, Simons R. A validation study of the CEMACH recommended modified early obstetric
 * warning system (MEOWS). Anaesthesia 2012;67:12–18.
 */

import type { CardDefinition, ComponentInput, PathwayDefinition, TimeWindow } from "../types";

const W: TimeWindow = { anchor: "admission", startHours: -6, label: "since presentation (dynamic)" };

type Vital = Pick<ComponentInput, "componentId" | "label" | "inputKey" | "canonicalUnit" | "selector" | "rule" | "tier" | "required">;
const vital = (v: Vital): ComponentInput => ({ ...v, window: W, points: 0 });

const yn = (recordLabel: string, question: string) => ({
  question,
  recordLabel,
  options: [
    { label: "No", record: "absent", satisfied: false, normal: true },
    { label: "Yes", record: "present", satisfied: true },
  ],
});

const meowsCard: CardDefinition = {
  cardId: "meows",
  title: "MEOWS — Modified Early Obstetric Warning Score",
  shortName: "MEOWS",
  citation:
    "MEOWS (CEMACH) — Singh S et al., Anaesthesia 2012;67:12–18. Red: temp < 35 or > 38 °C; SBP < 90 or > 160; DBP > 100; HR < 40 or > 120; RR < 10 or > 30; SpO₂ < 95 %; responds only to pain / unresponsive. Yellow: temp 35–36 °C; SBP 150–160 or 90–100; DBP 90–100; HR 100–120 or 40–50; RR 21–30; responds to voice. One red or two yellow triggers a prompt review by the obstetric team. A prompt for review, not a diagnosis.",
  type: "structured_classification",
  timingLabel: "worst since presentation — re-score on change",
  calculation: {
    kind: "tiered_classification",
    tiers: ["red", "yellow"],
    fallback: "no_trigger",
    tierThresholds: { red: 1, yellow: 2 },
  },
  requiresConfirmation: true,
  recomputeOn: ["new_observation", "deterioration", "manual"],
  // Order matters: interpret() falls back to a text match, and "recorded" contains "red".
  interpretationBands: [
    { min: 0, class: "red", text: "MEOWS triggers (a red parameter) — prompt review by the obstetric team.", tone: "attention" },
    { min: 0, class: "yellow", text: "MEOWS triggers (two or more yellow parameters) — prompt review by the obstetric team.", tone: "attention" },
    { min: 0, class: "no_trigger", text: "Below the MEOWS trigger on the values recorded (no red parameter, fewer than two yellow). Re-score on change.", tone: "neutral" },
  ],
  // Required = every RED component (an unmeasured parameter could itself be red, so "no trigger"
  // or a yellow trigger would be premature) plus the AVPU-voice assessment, which is a separate
  // question from AVPU-pain. Yellow vitals share their red twin's input and window, so they are
  // unknown exactly when it is — no need to mark them required too.
  inputs: [
    // --- Red: any one triggers ---
    vital({ componentId: "meows.temp_low_red", label: "Temperature < 35 °C", inputKey: "temp", canonicalUnit: "C", selector: "lowest", rule: { op: "lt", value: 35 }, tier: "red", required: true }),
    vital({ componentId: "meows.temp_high_red", label: "Temperature > 38 °C", inputKey: "temp", canonicalUnit: "C", selector: "highest", rule: { op: "gt", value: 38 }, tier: "red", required: true }),
    vital({ componentId: "meows.sbp_low_red", label: "Systolic BP < 90 mmHg", inputKey: "sbp", canonicalUnit: "mmHg", selector: "lowest", rule: { op: "lt", value: 90 }, tier: "red", required: true }),
    vital({ componentId: "meows.sbp_high_red", label: "Systolic BP > 160 mmHg", inputKey: "sbp", canonicalUnit: "mmHg", selector: "highest", rule: { op: "gt", value: 160 }, tier: "red", required: true }),
    vital({ componentId: "meows.dbp_high_red", label: "Diastolic BP > 100 mmHg", inputKey: "dbp", canonicalUnit: "mmHg", selector: "highest", rule: { op: "gt", value: 100 }, tier: "red", required: true }),
    vital({ componentId: "meows.hr_low_red", label: "Heart rate < 40 /min", inputKey: "hr", canonicalUnit: "/min", selector: "lowest", rule: { op: "lt", value: 40 }, tier: "red", required: true }),
    vital({ componentId: "meows.hr_high_red", label: "Heart rate > 120 /min", inputKey: "hr", canonicalUnit: "/min", selector: "highest", rule: { op: "gt", value: 120 }, tier: "red", required: true }),
    vital({ componentId: "meows.rr_low_red", label: "Respiratory rate < 10 /min", inputKey: "rr", canonicalUnit: "/min", selector: "lowest", rule: { op: "lt", value: 10 }, tier: "red", required: true }),
    vital({ componentId: "meows.rr_high_red", label: "Respiratory rate > 30 /min", inputKey: "rr", canonicalUnit: "/min", selector: "highest", rule: { op: "gt", value: 30 }, tier: "red", required: true }),
    vital({ componentId: "meows.spo2_red", label: "SpO₂ < 95 %", inputKey: "spo2", canonicalUnit: null, selector: "lowest", rule: { op: "lt", value: 95 }, tier: "red", required: true }),
    { componentId: "meows.avpu_red", label: "Responds only to pain, or unresponsive (AVPU P/U)", inputKey: "meows_avpu_pain", canonicalUnit: null, window: W, selector: "first", points: 0, rule: { op: "present" }, required: true, tier: "red", noAutoTask: true, clinicianAssessed: true, assess: yn("Responds only to pain / unresponsive (MEOWS)", "Does she respond only to pain, or not at all (AVPU P or U)?") },
    // --- Yellow: any two trigger ---
    vital({ componentId: "meows.temp_low_yellow", label: "Temperature 35–36 °C", inputKey: "temp", canonicalUnit: "C", selector: "lowest", rule: { op: "in_range", range: [35, 36] }, tier: "yellow", required: false }),
    vital({ componentId: "meows.sbp_low_yellow", label: "Systolic BP 90–100 mmHg", inputKey: "sbp", canonicalUnit: "mmHg", selector: "lowest", rule: { op: "in_range", range: [90, 100] }, tier: "yellow", required: false }),
    vital({ componentId: "meows.sbp_high_yellow", label: "Systolic BP 150–160 mmHg", inputKey: "sbp", canonicalUnit: "mmHg", selector: "highest", rule: { op: "in_range", range: [150, 160] }, tier: "yellow", required: false }),
    vital({ componentId: "meows.dbp_high_yellow", label: "Diastolic BP 90–100 mmHg", inputKey: "dbp", canonicalUnit: "mmHg", selector: "highest", rule: { op: "in_range", range: [90, 100] }, tier: "yellow", required: false }),
    vital({ componentId: "meows.hr_low_yellow", label: "Heart rate 40–50 /min", inputKey: "hr", canonicalUnit: "/min", selector: "lowest", rule: { op: "in_range", range: [40, 50] }, tier: "yellow", required: false }),
    vital({ componentId: "meows.hr_high_yellow", label: "Heart rate 100–120 /min", inputKey: "hr", canonicalUnit: "/min", selector: "highest", rule: { op: "in_range", range: [100, 120] }, tier: "yellow", required: false }),
    vital({ componentId: "meows.rr_high_yellow", label: "Respiratory rate 21–30 /min", inputKey: "rr", canonicalUnit: "/min", selector: "highest", rule: { op: "in_range", range: [21, 30] }, tier: "yellow", required: false }),
    { componentId: "meows.avpu_yellow", label: "Responds to voice (AVPU V)", inputKey: "meows_avpu_voice", canonicalUnit: null, window: W, selector: "first", points: 0, rule: { op: "present" }, required: true, tier: "yellow", noAutoTask: true, clinicianAssessed: true, assess: yn("Responds to voice, not fully alert (MEOWS)", "Is she responding to voice rather than fully alert (AVPU V)?") },
  ],
};

export const meowsV1: PathwayDefinition = {
  pathwayId: "meows",
  pathwayVersion: "1.0.0",
  title: "Obstetric early warning (MEOWS)",
  status: "draft",
  clinicalOwner: "PENDING CLINICIAN REVIEW — drafted 2026-09-28 from the cited source; not yet signed off. Departmental review due 2027-09-01.",
  sourceReferences: [
    {
      label: "Singh S et al., Anaesthesia 2012",
      citation: "Singh S, McGlennan A, England A, Simons R. A validation study of the CEMACH recommended modified early obstetric warning system (MEOWS). Anaesthesia 2012;67:12–18.",
    },
  ],
  reviewDueAt: "2027-09-01",
  diagnosisTriggers: {
    codes: [],
    textPatterns: [
      "pregnan",
      "antenatal",
      "postpartum",
      "post partum",
      "postnatal",
      "puerper",
      "lscs",
      "caesarean",
      "cesarean",
      "c section",
      "delivery",
      "in labour",
      "in labor",
      "preterm labour",
      "preterm labor",
      "eclampsia",
      "pph",
      "hellp",
      "gestational hypertension",
      "weeks gestation",
      "primigravida",
      "multigravida",
      "abruption",
      "placenta praevia",
      "placenta previa",
    ],
    excludePatterns: ["not pregnant", "pregnancy test negative", "upt negative"],
  },
  eligibility: { minAgeYears: 12, notes: ["Pregnant or recently delivered women (up to 6 weeks postpartum). A prompt for review, not a diagnosis."] },
  exclusions: ["Non-obstetric admissions — use the general early-warning score."],
  cards: [meowsCard],
  tasks: [],
  checkpoints: [],
  recomputePolicy: ["new_observation", "deterioration", "manual"],
  institutionalToggles: {},
};
