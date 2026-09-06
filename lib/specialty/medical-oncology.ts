import {
  ONCOLOGY_DISCHARGE_TEMPLATES,
  ONCOLOGY_GENERIC_DISCHARGE_TEMPLATE,
} from "@/lib/discharge-templates-oncology";
import type { FormatKind } from "@/lib/formats";
import type { SpecialtyPack } from "./types";

/**
 * The medical oncology pack.
 *
 * WHAT MAKES AN ONCOLOGY WARD DIFFERENT, and what each difference here is for:
 *
 * 1. THE DAY IS A CYCLE DAY. A surgeon says "POD 2". An oncologist says "cycle 2, day 3 of
 *    ABVD" — the cycle is the unit of treatment and the day within it is what predicts
 *    everything: when the count nadir falls, when to expect mucositis, when a fever means
 *    neutropenia. A patient not on an active cycle (admitted for a toxicity that has already
 *    passed, or for a workup) still gets a hospital day, because every patient needs a number.
 *
 * 2. FEVER IS AN EMERGENCY, NOT A SYMPTOM. Everything in the discharge templates and the
 *    checklist anchor is shaped around getting cultures before the first antibiotic dose and
 *    that dose inside an hour.
 *
 * 3. THERE IS NO OPERATION. `procedure_done` is still recognised — an oncology patient does
 *    get a chemoport, a PICC line or a marrow biopsy — but it does NOT start a new day count.
 *    A port inserted on cycle 2 day 1 does not make the patient "POD 0". That is enforced by
 *    dayCount below reading the cycle and the admission, never surgery_date.
 *
 * NOT CLINICALLY SIGNED OFF. The discharge templates this pack points at are drafted from
 * standard practice and are waiting on the unit's review — see the header of
 * lib/discharge-templates-oncology.ts.
 */
export const medicalOncologyPack: SpecialtyPack = {
  key: "medical_oncology",
  label: "Medical Oncology",
  blurb: "Counts chemotherapy cycle days. Neutropenia-first checklists and oncology discharge summaries.",

  terminology: {
    dayLabel: "C·D",
    admissionNoun: "cycle",
  },

  // "C2 D3" is how it is said and written on a treatment card, so it is what prints. A patient
  // with no active cycle falls back to the hospital day rather than showing nothing — and the
  // label says which, the same guarantee the surgical pack gives.
  dayCount: (p) => {
    if (p.cycle_day != null && p.cycle_day > 0) {
      const cycle = p.cycle_number != null && p.cycle_number > 0 ? `C${p.cycle_number} ` : "";
      return { clock: "cycle", n: p.cycle_day, text: `${cycle}D${p.cycle_day}` };
    }
    return { clock: "admission", n: p.admission_day, text: `Day ${p.admission_day}` };
  },

  extractRoleLine:
    "You convert a medical oncology resident's spoken ward-round note into structured observations.",

  // Guidance only. It tells the model what a word MEANS on this ward. It never permits
  // inferring a value, and the verbatim-quote check applies to everything it produces.
  extractGuidance: `
Medical oncology ward — what the words mean here:

- The day number spoken is usually a CHEMOTHERAPY CYCLE DAY, not a post-operative day. "cycle two day three", "C2D3", "day 3 of ABVD", "day 8" all mean the day within the current cycle. Record kind "day_number" with value_num as the day. If a cycle number is also said, keep it in value_text exactly as said ("cycle 2 day 3").
- The REGIMEN is a diagnosis-level fact, not a medication list. "started on FOLFOX", "R-CHOP cycle 4", "on ABVD" — record kind "diagnosis", label "regimen", value_text as the regimen named exactly as said. Do NOT split a regimen acronym into its individual drugs; the app must not decide that R-CHOP means six drugs the resident never said.
- COUNTS drive everything on this ward. "ANC", "absolute neutrophil count", "counts are down", "nadir", "platelets 20", "haemoglobin 7" are kind "lab". Record the number only when a number was spoken.
- A PROCEDURE on this ward is a chemoport insertion, a PICC line, a bone marrow aspiration or biopsy, a pleural or ascitic tap, a lumbar puncture with intrathecal chemotherapy. These are recorded as procedure_done exactly as on any ward, but they do NOT make the patient post-operative and they do not reset the day count. Chemotherapy being given is NOT a procedure_done — "cycle 2 given today" is a note, not an operation.
- LINES AND ACCESS are devices: "chemoport", "PICC", "central line", "port flushed", "port site red". Use kind "drain" for line and drain sites, the way the app already records a drain, and keep the wording as said.
- TOXICITY is usually spoken as a grade — "grade 2 mucositis", "grade 3 diarrhoea", "grade 1 neuropathy". Record it as kind "exam" with the grade kept verbatim in value_text. NEVER assign, upgrade or infer a grade that was not spoken.
- FEVER in this patient group is time-critical. Record temperature, "febrile", "spiked", "rigors" exactly as said. Do not soften and do not interpret — "no fever documented" is a valid and useful outcome.
- Abbreviations to leave EXPANDED-AS-SAID and never rewrite: "RT" (ambiguous — radiotherapy or Ryle's tube), "CR" / "PR" / "SD" / "PD" (response categories), "BM" (bone marrow), "IT" (intrathecal), "FN" (febrile neutropenia), "TLS" (tumour lysis syndrome). Store the letters that were said.
`.trim(),

  // Fever, counts and the cycle drive the checklist here, and none of them hang off an
  // operation. See CYCLE_ANCHORED in lib/checklist-triggers.ts.
  checklistAnchor: "cycle",

  dischargeTemplates: ONCOLOGY_DISCHARGE_TEMPLATES,
  genericDischargeTemplate: ONCOLOGY_GENERIC_DISCHARGE_TEMPLATE,

  // Deliberately empty. The surgical pathways (Ranson's, AIR, TG18, Glasgow-Blatchford) are
  // wrong for this ward and showing them would be worse than showing nothing. The oncology
  // scores — MASCC for febrile neutropenia risk, Cairo-Bishop for tumour lysis, ECOG — are the
  // next phase and land after the pilot, with the same clinical sign-off the surgical ones get.
  scoringKeys: [],

  // No OT notes slot: this unit has no operating theatre. Everything else stays.
  formatKinds: [
    "investigation",
    "interdepartmental",
    "discharge",
    "notes",
    "logo",
  ] as FormatKind[],

  pickerPhase: "before_surgery",

  lexiconSpecialty: "medical-oncology",
};
