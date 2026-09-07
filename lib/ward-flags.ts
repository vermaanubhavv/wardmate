import { classifyVital } from "@/lib/vital-ranges";
import { canonicalLabName } from "@/lib/lab-ranges";
import type { WardPatient } from "@/lib/patients";

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
 * Nothing else. Every other abnormal result still shows on the patient's own page with its
 * range; it just does not raise the ward alarm. The value carried in the chip is exactly the
 * value recorded — never a diagnosis about it.
 *
 * Checked worst-first so the single chip shows the most pressing thing when more than one
 * applies.
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

export function criticalFlag(patient: WardPatient): WardFlag | null {
  // ICU / organ support — recorded in the Vitals card. Being sick enough to be on the unit is
  // itself the flag; the value (e.g. "on noradrenaline 0.08") rides along in the chip.
  for (const v of patient.vitals ?? []) {
    if (v.label.trim().toLowerCase().replace(/\s+/g, " ") !== "icu") continue;
    const support = (v.value_text ?? "").trim();
    if (!support) continue;
    return {
      label: "ICU",
      value: AFFIRMATIVE.test(support) ? "" : support,
      reason: "on ICU / organ support",
    };
  }

  // Vitals — hard numbers.
  for (const v of patient.vitals ?? []) {
    for (const c of classifyVital(v.label, v.value_text)) {
      const n = num(c.value);
      if (n === null) continue;
      if (c.label === "SpO₂" && n < 90) {
        return { label: "SpO₂", value: String(n), reason: "hypoxia" };
      }
      if (c.label === "Systolic" && n < 90) {
        return { label: "BP", value: (v.value_text ?? c.value).trim(), reason: "hypotension" };
      }
      if (c.label === "PR" && n > 120) {
        return { label: "PR", value: String(n), reason: "tachycardia" };
      }
    }
  }

  // Vasopressor / inotrope support, if the management line records it.
  if (patient.management && VASOPRESSOR.test(patient.management)) {
    return { label: "On vasopressor", value: "", reason: "vasopressor support" };
  }

  // Bloods — CBC only, absolute thresholds, scale-tolerant (a total count is written "16200"
  // on one report and "16.2" on the next; platelets as "45000", "45" or "0.45").
  for (const l of patient.labs ?? []) {
    const name = canonicalLabName(l.label);
    const n = num(l.value_text);
    if (n === null) continue;
    const value = (l.value_text ?? "").trim();

    if (name === "Hb" && n < 5) {
      return { label: "Hb", value, reason: "severe anaemia" };
    }
    if (name === "TLC") {
      const wbc = n < 1000 ? n * 1000 : n;
      if (wbc > 16000) return { label: "TLC", value, reason: "leucocytosis" };
    }
    if (name === "Platelets") {
      const plt = n < 10 ? n * 100000 : n < 1000 ? n * 1000 : n;
      if (plt < 50000) return { label: "Platelets", value, reason: "severe thrombocytopenia" };
    }
  }

  return null;
}
