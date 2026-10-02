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
 *   • No creatinine rule: an absolute cut-off is red every day on a known CKD / dialysis
 *     patient, and a rising-creatinine rule needs the previous result, which the ward screen
 *     does not carry (only the latest per test). Add it with that data.
 *   • RR ≥ 30, GCS ≤ 8
 * TLC: surgery keeps > 16,000 (a post-op leak or collection). On a medical ward sepsis and
 * steroids push the count past that daily, so medicine raises the bar to > 30,000 — a count
 * that still wants someone to look (leukaemoid reaction, haematological malignancy).
 */
export type CriticalThresholds = {
  tlcAbove: number;
  kAtLeast?: number;
  kAtMost?: number;
  naAtMost?: number;
  naAtLeast?: number;
  glucoseBelow?: number;
  glucoseAbove?: number;
  rrAtLeast?: number;
  gcsAtMost?: number;
};

const SURGERY: CriticalThresholds = { tlcAbove: 16000 };

const MEDICINE: CriticalThresholds = {
  tlcAbove: 30000,
  kAtLeast: 6.0,
  kAtMost: 2.5,
  naAtMost: 120,
  naAtLeast: 160,
  glucoseBelow: 70,
  glucoseAbove: 400,
  rrAtLeast: 30,
  gcsAtMost: 8,
};

// Pulmonary medicine is a medical ward (its pack starts from medicine's) — same bar.
const BY_PACK: Partial<Record<SpecialtyKey, CriticalThresholds>> = {
  internal_medicine: MEDICINE,
  pulmonary_medicine: MEDICINE,
};

export function criticalThresholds(key: string | null | undefined): CriticalThresholds {
  return BY_PACK[key as SpecialtyKey] ?? SURGERY;
}
