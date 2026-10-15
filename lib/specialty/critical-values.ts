import type { SpecialtyKey } from "./types";

/**
 * The ward list's "Critical" bar, per department — read by lib/ward-flags.ts.
 *
 * Every department not listed below gets SURGERY, which is exactly the list the ward screen
 * has always used. A threshold left undefined means "not a ward alarm in this department";
 * the value still shows, with its range, on the patient's own page.
 *
 * Medicine adds the values a medical round acts on first. Each is an absolute bedside
 * threshold, not "out of range":
 *   • K⁺ ≥ 6.0 or ≤ 2.5 mmol/L — arrhythmia risk at either end
 *   • Na⁺ ≤ 120 or ≥ 160 mmol/L — the level at which seizures / encephalopathy are expected
 *   • Glucose < 70 mg/dL (hypoglycaemia) or > 400 mg/dL
 *   • No absolute creatinine cut-off — it is red every day on a known CKD / dialysis patient.
 *     A RISE is flagged instead, by NICE NG148 (aki, below), from the last week's results.
 *   • Vital signs: NEWS2, below.
 * TLC: surgery keeps > 16,000 (a post-op leak or collection). On a medical ward sepsis and
 * steroids push the count past that daily, so medicine raises the bar to > 30,000 — a count
 * that still wants someone to look (leukaemoid reaction, haematological malignancy).
 *
 * Internal and pulmonary medicine, emergency medicine, medical oncology and paediatrics take
 * their VITAL-SIGN bars from NICE (the owner's choice, October 2026):
 *   • Adults (16 and over) — NICE NG253 rec 1.6.2: a single NEWS2 parameter scoring 3 points
 *     calls for a high-priority review. The 3-point values are the Royal College of
 *     Physicians' NEWS2 chart (2017): RR ≤ 8 or ≥ 25; SpO₂ ≤ 91% (scale 1); systolic ≤ 90 or
 *     ≥ 220; pulse ≤ 40 or ≥ 131; temperature ≤ 35.0 °C; any response short of Alert (CVPU),
 *     read here from a recorded GCS below 15.
 *   • Under 16s — NICE NG254 tables 1–3, the "high risk" column, by age (paediatricVitals).
 *   • Neutropenic sepsis — NICE CG151 rec 1.4.4.1: neutrophil count ≤ 0.5 × 10⁹/L, flagged
 *     on an oncology unit from an absolute count only, never from a percentage.
 * NICE sets no ward thresholds for potassium, sodium, glucose or white count, so the medical,
 * emergency and oncology units keep medicine's laboratory bar for those; paediatrics carries none
 * beyond the universal haemoglobin and platelet bars in ward-flags.ts (adult cut-offs do not
 * transfer to children).
 */
export type CriticalThresholds = {
  /** Undefined: the white count raises no ward alarm in this department. */
  tlcAbove?: number;
  // Vital signs. Each comparison is stated in its name: Below / Above are strict, AtMost /
  // AtLeast include the value.
  spo2Below?: number;
  sbpBelow?: number;
  sbpAtLeast?: number;
  prAbove?: number;
  prBelow?: number;
  rrAtLeast?: number;
  rrAtMost?: number;
  /** °C — a value recorded in °F is converted first. */
  tempAtMost?: number;
  tempBelow?: number;
  gcsAtMost?: number;
  // Bloods.
  kAtLeast?: number;
  kAtMost?: number;
  naAtMost?: number;
  naAtLeast?: number;
  glucoseBelow?: number;
  glucoseAbove?: number;
  /** × 10⁹/L, absolute neutrophil count only. */
  ancAtMost?: number;
  /** Rising creatinine by NICE NG148 rec 1.3.1: a rise of 26 µmol/L or more within 48 hours,
   *  or of 50% or more within 7 days. Needs creatinine_7d (patch 0106). */
  aki?: boolean;
};

// Rising creatinine (NICE NG148) on every unit — post-operative AKI included (owner's call).
const SURGERY: CriticalThresholds = { tlcAbove: 16000, spo2Below: 90, sbpBelow: 90, prAbove: 120, aki: true };

const MEDICINE_LABS: CriticalThresholds = {
  tlcAbove: 30000,
  kAtLeast: 6.0,
  kAtMost: 2.5,
  naAtMost: 120,
  naAtLeast: 160,
  glucoseBelow: 70,
  glucoseAbove: 400,
};

/** NEWS2 single parameter scoring 3 (RCP chart; NICE NG253 1.6.2). */
const NEWS2_RED: CriticalThresholds = {
  rrAtMost: 8,
  rrAtLeast: 25,
  spo2Below: 92,
  sbpBelow: 91,
  sbpAtLeast: 220,
  prBelow: 41,
  prAbove: 130,
  tempAtMost: 35.0,
  gcsAtMost: 14,
};

const EMERGENCY: CriticalThresholds = { ...MEDICINE_LABS, ...NEWS2_RED, aki: true };
const ONCOLOGY: CriticalThresholds = { ...MEDICINE_LABS, ...NEWS2_RED, ancAtMost: 0.5, aki: true };

/**
 * NICE NG254 "high risk" vital signs for a child of this age (tables 1–3). Unknown age gets
 * only the criteria that hold at every age; 16 and over is an adult (NEWS2).
 */
export function paediatricVitals(ageYears: number | null | undefined): CriticalThresholds {
  // Every age under 16: SpO₂ < 90% (in air), heart rate < 60, temperature < 36 °C (table 1;
  // tables 2–3 carry the same SpO₂ and bradycardia criteria).
  const any: CriticalThresholds = { spo2Below: 90, prBelow: 60 };
  if (ageYears === null || ageYears === undefined || !Number.isFinite(ageYears)) return any;
  if (ageYears >= 16) return NEWS2_RED;
  if (ageYears < 1) return { ...any, tempBelow: 36, rrAtLeast: 60, prAbove: 159 };
  if (ageYears < 3) return { ...any, tempBelow: 36, rrAtLeast: 50, prAbove: 149 };
  if (ageYears < 5) return { ...any, tempBelow: 36, rrAtLeast: 40, prAbove: 139 };
  if (ageYears < 6) return { ...any, rrAtLeast: 29, prAbove: 129 };
  if (ageYears < 8) return { ...any, rrAtLeast: 27, prAbove: 119 };
  if (ageYears < 12) return { ...any, rrAtLeast: 25, prAbove: 114 };
  // 12 to 15 (table 3): RR ≥ 25, heart rate > 130, systolic ≤ 90.
  return { rrAtLeast: 25, prAbove: 130, sbpBelow: 91 };
}

// Medical wards (internal and pulmonary medicine) take NEWS2 for vital signs too — NG253
// covers every adult — and keep the medicine lab bar.
const MEDICINE: CriticalThresholds = { ...MEDICINE_LABS, ...NEWS2_RED, aki: true };

const BY_PACK: Partial<Record<SpecialtyKey, CriticalThresholds>> = {
  internal_medicine: MEDICINE,
  pulmonary_medicine: MEDICINE,
  emergency_medicine: EMERGENCY,
  medical_oncology: ONCOLOGY,
};

export function criticalThresholds(key: string | null | undefined, ageYears?: number | null): CriticalThresholds {
  // NG148's creatinine criteria cover children and young people too.
  if (key === "paediatrics") return { ...paediatricVitals(ageYears), aki: true };
  return BY_PACK[key as SpecialtyKey] ?? SURGERY;
}
