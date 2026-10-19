import { STANDARD_RED_FLAGS } from "@/lib/discharge-templates-medicine";
import type { DischargeTemplate } from "@/lib/discharge-templates";

/**
 * The General (no-department) unit's discharge templates: none of its own — a department's
 * condition templates are that department's — and one neutral generic that never auto-matches.
 */
export const GENERAL_DISCHARGE_TEMPLATES: DischargeTemplate[] = [];

export const GENERAL_GENERIC_DISCHARGE_TEMPLATE: DischargeTemplate = {
  key: "general_generic",
  label: "General — generic template",
  match: /.^/,
  scaffold: {
    indication: "Patient was admitted with [ presenting problem ] for [ investigation / management / procedure ].",
    primaryDiagnosis: "",
    procedure: {
      name: "[ Procedure during this admission, if any ]",
      anaesthesia: "",
      findings: "[ relevant findings and results ]",
      drains: "[ lines / tubes / catheters at discharge, if any ]",
      complications: "Nil",
      outcome: "[ Outcome of this admission ]",
    },
    clinicalCourse:
      "Admitted on [ … ] with [ presentation ]. [ Working diagnosis and how it was reached. ] [ Treatment given during the admission. ] The patient improved, was stable, and was fit for discharge on [ date ] with the plan below.",
    medications: [],
    advice: [
      { id: "adv-0", module: "Medicines", text: "Take the medicines exactly as listed. Do not stop or change a dose without asking the doctor. Bring the full list to every visit." },
      { id: "adv-1", module: "Follow-up", text: "Attend the OPD on [ … ] with all reports. Get the tests below done before that visit." },
    ],
    redFlags: STANDARD_RED_FLAGS,
    patientActions: ["Attend the OPD on [ … ].", "Bring this summary and all reports to every visit."],
    primaryCareActions: [],
    conditionAllSatisfactory: true,
  },
  clerkingFocus:
    "Presenting complaint with onset, duration and course; associated symptoms and pertinent negatives; past medical and surgical history and all current drugs; examination on arrival; provisional diagnosis and the workup planned.",
  progressNote:
    "Each day — symptoms; vitals; examination; oral intake; results back; the day's plan. For discharge — stable, tolerating orals, medicines prescribed, and follow-up written down.",
};
