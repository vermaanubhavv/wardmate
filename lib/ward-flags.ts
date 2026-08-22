import { classifyVital } from "@/lib/vital-ranges";
import { classifyLab, canonicalLabName, type SuppliedRange } from "@/lib/lab-ranges";
import type { WardRanges } from "@/lib/exam-summary";
import type { WardPatient } from "@/lib/patients";

export type WardFlag = { label: string; value: string; direction: "high" | "low" | "abnormal" };

/**
 * The single worst flagged reading on a patient's latest vitals and most recent labs, for the
 * ward list. Reuses classifyVital and classifyLab exactly as the patient page does — no second
 * opinion about what counts as deranged lives here, because a list that disagreed with the page
 * underneath it would be worse than no list at all.
 *
 * SpO2 leads the priority order deliberately: a resident scanning a ward of twenty during a
 * round should see hypoxia before a mildly abnormal potassium, even though both would flag.
 * Everything else keeps whatever order it was recorded or matched in — this is triage of what
 * to show first, not a ranking of clinical severity beyond that one deliberate choice.
 */
const PRIORITY = ["SpO₂", "Systolic", "Diastolic", "PR", "RR", "Temp"];

export function worstFlag(patient: WardPatient, wardRanges: WardRanges): WardFlag | null {
  const vitalFlags = (patient.vitals ?? [])
    .flatMap((v) => classifyVital(v.label, v.value_text))
    .filter((c) => c.flag);

  if (vitalFlags.length > 0) {
    vitalFlags.sort((a, b) => PRIORITY.indexOf(a.label) - PRIORITY.indexOf(b.label));
    const f = vitalFlags[0];
    return { label: f.label, value: f.value, direction: f.flag! };
  }

  for (const l of patient.labs ?? []) {
    const supplied: SuppliedRange | null =
      l.ref_low !== null || l.ref_high !== null
        ? { low: l.ref_low, high: l.ref_high, text: l.ref_text, source: "report" }
        : (() => {
            const w = wardRanges.get(canonicalLabName(l.label));
            return w && (w.low !== null || w.high !== null) ? { ...w, source: "ward" } : null;
          })();

    const reading = classifyLab(l.label, l.value_text, patient.sex, supplied);
    if (reading?.flag) return { label: reading.label, value: reading.value, direction: reading.flag };
  }

  return null;
}
