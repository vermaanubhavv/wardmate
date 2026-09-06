import type { AdviceItem } from "@/lib/discharge-entities";
import type { DischargeTemplate } from "@/lib/discharge-templates";

/**
 * INTERNAL MEDICINE discharge templates.
 *
 * NOT CLINICALLY SIGNED OFF, AND DELIBERATELY MINIMAL FOR NOW. The surgical templates carry
 * the unit's v1.0 review and the oncology set is drafted from standard practice; the medicine
 * unit has not yet done its read-through (docs/specialty-packs.md §2a). Until it has, this
 * ward ships with the generic template only — a scaffold of `[ … ]` placeholders that prints
 * as visible blanks, never a guess. The condition-keyed set (enteric fever, dengue, DKA,
 * hypertensive emergency, …) is added here after that sign-off; `MEDICINE_DISCHARGE_TEMPLATES`
 * is an empty array on purpose, not an oversight.
 *
 * WHY NO DEFAULT DRUG LIST. A medicine discharge prescription is entirely patient-specific —
 * the diagnosis, the organ function and the comorbid drugs decide every line. A generic set
 * would be wrong more often than right, so the resident writes it from the inpatient chart.
 */

const adv = (items: { module: string; text: string }[]): AdviceItem[] =>
  items.map((it, i) => ({ id: `adv-${i}`, module: it.module, text: it.text }));

export const MEDICINE_GENERIC_DISCHARGE_TEMPLATE: DischargeTemplate = {
  key: "medicine_generic",
  label: "Internal medicine — generic template",
  match: /.^/,
  scaffold: {
    indication:
      "Patient was admitted with [ presenting problem ] for [ investigation / medical management / stabilisation ].",
    primaryDiagnosis: "",
    procedure: {
      name: "[ Bedside procedure during this admission, if any — pleural/ascitic tap, lumbar puncture, central line ]",
      anaesthesia: "",
      findings: "[ relevant results — cultures, counts, imaging, organ function ]",
      drains: "[ lines / catheters at discharge, if any ]",
      complications: "Nil",
      outcome: "[ Outcome of this admission ]",
    },
    clinicalCourse:
      "Admitted on day [ … ] with [ presentation ]. [ Working diagnosis and how it was reached. ] [ Treatment given during the admission. ] The patient improved, was afebrile and haemodynamically stable, tolerating orals, and was fit for discharge on [ date ] with the plan below.",
    medications: [],
    advice: adv([
      { module: "Medicines", text: "Take the medicines exactly as listed. Do not stop or change a dose without asking the doctor. Bring the full list to every visit." },
      { module: "Diet", text: "[ diet advice for this condition — salt / fluid / sugar restriction as applicable ]" },
      { module: "Follow-up", text: "Attend the medicine OPD on [ … ] with all reports. Get the tests below done before that visit." },
    ]),
    redFlags: [
      "Fever that returns or does not settle, or chills and rigors",
      "Breathlessness, chest pain, or a fast or irregular heartbeat",
      "Confusion, drowsiness, fainting, or a fit",
      "Not passing urine, or much less than usual",
      "Any new bleeding, or black stools",
    ],
    patientActions: [
      "Get [ … ] repeated on [ … ] and bring the report to the next visit.",
      "Attend the medicine OPD on [ … ].",
      "Bring this summary and all reports to every visit.",
    ],
    primaryCareActions: [],
    conditionAllSatisfactory: true,
  },
  clerkingFocus:
    "Presenting complaint with onset, duration and course; associated symptoms and pertinent negatives; the problem list; past medical history and all current drugs including native medicines; examination on arrival; provisional diagnosis and the workup planned. Baseline: CBC with differential, renal and liver function, electrolytes, glucose, urinalysis, and the condition-specific tests (cultures, serologies, imaging).",
  progressNote:
    "Each day — symptoms; vitals including the temperature trend; examination; oral intake; the results back and the problem each addresses; the day's plan. For discharge — afebrile, stable off support, tolerating orals, oral medicines prescribed, and follow-up with repeat-test dates written down.",
};

export const MEDICINE_DISCHARGE_TEMPLATES: DischargeTemplate[] = [];
