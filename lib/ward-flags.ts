import { classifyVital } from "@/lib/vital-ranges";
import { canonicalLabName } from "@/lib/lab-ranges";
import type { WardPatient } from "@/lib/patients";
import { criticalThresholds, type CriticalThresholds } from "@/lib/specialty/critical-values";

export type WardFlag = { label: string; value: string; reason: string };

/**
 * The one genuinely critical finding on a patient's latest vitals and most recent bloods, for
 * the ward list's "Critical" chip and filter.
 *
 * This is NOT "anything out of range". A mildly raised SGPT, an eosinophil count of 0.35, a
 * pulse of 108 — all abnormal, none critical, none belong on this list. The bar here is
 * deliberately high and fixed by absolute clinical thresholds, not by how far a number sits
 * from a lab's reference band:
 *
 *   • On the ICU / HDU  — any value in the Vitals card's "ICU / support" field
 *   • On vasopressor / inotrope support   (fallback: read from the management text)
 *   • Hypoxia            — SpO₂ < 90
 *   • Hypotension        — systolic BP < 90
 *   • Tachycardia        — pulse > 120
 *   • Severe leucocytosis — TLC / WBC > 16,000
 *   • Severe thrombocytopenia — platelets < 50,000
 *   • Severe anaemia     — haemoglobin < 5
 *
 * A medical ward (internal / pulmonary medicine) adds K⁺, Na⁺, glucose, RR and
 * GCS, and raises the TLC bar — see lib/specialty/critical-values.ts.
 *
 * Nothing else. Every other abnormal result still shows on the patient's own page with its
 * range; it just does not raise the ward alarm. The value carried in the chip is exactly the
 * value recorded — never a diagnosis about it.
 *
 * Checked worst-first; criticalFlags() returns every hit, criticalFlag() the first.
 */

const VASOPRESSOR =
  /\b(nor-?ad(renaline)?|norepinephrine|adrenaline|epinephrine|vasopressin|dopamine|dobutamine|phenylephrine|metaraminol|milrinone|(vaso|iono|ino)trop\w*|vasopressor\w*)\b/i;

function num(s: string | null | undefined): number | null {
  if (!s) return null;
  const m = s.match(/-?\d+(?:\.\d+)?/);
  if (!m) return null;
  const n = Number(m[0]);
  return Number.isFinite(n) ? n : null;
}

const AFFIRMATIVE = /^(y|yes|on|true|✓|✔|present)$/i;

/** Labels a blood sugar is recorded under — at the bedside (GRBS, as a vital) or off a report. */
const GLUCOSE = /^(grbs|rbs|cbg|fbs|ppbs|blood sugar|random blood sugar|capillary blood glucose|blood glucose|glucose|plasma glucose|serum glucose)$/i;
const GCS = /^(gcs|glasgow coma scale|glasgow coma score)$/i;

/** "E2V3M4" sums its parts; "9/15" or "9" reads as is. VT (intubated) is not a number to sum. */
function gcsScore(text: string): number | null {
  const evm = text.match(/E\s*(\d)\s*V\s*(\d)\s*M\s*(\d)/i);
  if (evm) return Number(evm[1]) + Number(evm[2]) + Number(evm[3]);
  if (/E\s*\d/i.test(text)) return null;
  const n = num(text);
  return n !== null && n >= 3 && n <= 15 ? n : null;
}

/** Glucose in mg/dL — a value written "mmol" is converted; anything else is read as mg/dL. */
function glucoseMgDl(text: string, n: number): number {
  return /mmol/i.test(text) ? n * 18 : n;
}

function glucoseHit(label: string, text: string, n: number, t: CriticalThresholds): WardFlag | null {
  const g = glucoseMgDl(text, n);
  if (t.glucoseBelow !== undefined && g < t.glucoseBelow) return { label, value: text, reason: "hypoglycaemia" };
  if (t.glucoseAbove !== undefined && g > t.glucoseAbove) return { label, value: text, reason: "severe hyperglycaemia" };
  return null;
}

/**
 * Every critical finding on the patient, worst-first — the ward chip shows the first and
 * counts the rest ("K⁺ 6.4 +1"). `specialty` is the unit's pack key; anything that is not a
 * medical ward gets the surgical list above, unchanged (lib/specialty/critical-values.ts).
 */
export function criticalFlags(patient: WardPatient, specialty?: string | null): WardFlag[] {
  const t = criticalThresholds(specialty);
  const hits: WardFlag[] = [];

  // ICU / organ support — recorded in the Vitals card. Being sick enough to be on the unit is
  // itself the flag; the value (e.g. "on noradrenaline 0.08") rides along in the chip.
  for (const v of patient.vitals ?? []) {
    if (v.label.trim().toLowerCase().replace(/\s+/g, " ") !== "icu") continue;
    const support = (v.value_text ?? "").trim();
    if (!support) continue;
    hits.push({
      label: "ICU",
      value: AFFIRMATIVE.test(support) ? "" : support,
      reason: "on ICU / organ support",
    });
    break;
  }

  // Vitals — hard numbers.
  for (const v of patient.vitals ?? []) {
    const text = (v.value_text ?? "").trim();
    const label = v.label.trim();
    if (t.gcsAtMost !== undefined && GCS.test(label)) {
      const g = gcsScore(text);
      if (g !== null && g <= t.gcsAtMost) hits.push({ label: "GCS", value: text, reason: "reduced consciousness" });
      continue;
    }
    if (GLUCOSE.test(label)) {
      const n = num(text);
      const hit = n === null ? null : glucoseHit(label, text, n, t);
      if (hit) hits.push(hit);
      continue;
    }
    for (const c of classifyVital(v.label, v.value_text)) {
      const n = num(c.value);
      if (n === null) continue;
      if (c.label === "SpO₂" && n < 90) {
        hits.push({ label: "SpO₂", value: String(n), reason: "hypoxia" });
      }
      if (c.label === "Systolic" && n < 90) {
        hits.push({ label: "BP", value: text || c.value.trim(), reason: "hypotension" });
      }
      if (c.label === "PR" && n > 120) {
        hits.push({ label: "PR", value: String(n), reason: "tachycardia" });
      }
      if (c.label === "RR" && t.rrAtLeast !== undefined && n >= t.rrAtLeast) {
        hits.push({ label: "RR", value: String(n), reason: "tachypnoea" });
      }
    }
  }

  // Vasopressor / inotrope support, if the management line records it.
  if (patient.management && VASOPRESSOR.test(patient.management)) {
    hits.push({ label: "On vasopressor", value: "", reason: "vasopressor support" });
  }

  // Bloods — absolute thresholds, scale-tolerant (a total count is written "16200" on one
  // report and "16.2" on the next; platelets as "45000", "45" or "0.45").
  for (const l of patient.labs ?? []) {
    const name = canonicalLabName(l.label);
    const n = num(l.value_text);
    if (n === null) continue;
    const value = (l.value_text ?? "").trim();

    if (name === "Hb" && n < 5) {
      hits.push({ label: "Hb", value, reason: "severe anaemia" });
    }
    if (name === "TLC") {
      const wbc = n < 1000 ? n * 1000 : n;
      if (wbc > t.tlcAbove) hits.push({ label: "TLC", value, reason: "leucocytosis" });
    }
    if (name === "Platelets") {
      const plt = n < 10 ? n * 100000 : n < 1000 ? n * 1000 : n;
      if (plt < 50000) hits.push({ label: "Platelets", value, reason: "severe thrombocytopenia" });
    }
    if (name === "K") {
      if (t.kAtLeast !== undefined && n >= t.kAtLeast) hits.push({ label: "K⁺", value, reason: "hyperkalaemia" });
      if (t.kAtMost !== undefined && n <= t.kAtMost) hits.push({ label: "K⁺", value, reason: "hypokalaemia" });
    }
    if (name === "Na") {
      if (t.naAtMost !== undefined && n <= t.naAtMost) hits.push({ label: "Na⁺", value, reason: "severe hyponatraemia" });
      if (t.naAtLeast !== undefined && n >= t.naAtLeast) hits.push({ label: "Na⁺", value, reason: "severe hypernatraemia" });
    }
    if (GLUCOSE.test(l.label.trim())) {
      const hit = glucoseHit(l.label.trim(), value, n, t);
      if (hit) hits.push(hit);
    }
  }

  return hits;
}

/** The most pressing critical finding, or null — the first of criticalFlags(). */
export function criticalFlag(patient: WardPatient, specialty?: string | null): WardFlag | null {
  return criticalFlags(patient, specialty)[0] ?? null;
}

/**
 * Nothing critical, nothing outstanding — the ward page's "Dischargeable" stat/filter
 * (app/ward/page.tsx). A fair, transparent proxy for "worth considering for discharge
 * today," not a clinical certification: `flag` is this same file's own criticalFlag(),
 * and `unconfirmed_count`/`open_task_count` already ride along in the one ward_screen()
 * round trip (lib/ward-screen.ts), so this costs nothing extra to compute.
 */
export function isDischargeable(
  patient: Pick<WardPatient, "unconfirmed_count" | "open_task_count">,
  flag: WardFlag | null
): boolean {
  return !flag && patient.unconfirmed_count === 0 && patient.open_task_count === 0;
}
