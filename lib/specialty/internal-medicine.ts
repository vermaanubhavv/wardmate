import {
  MEDICINE_DISCHARGE_TEMPLATES,
  MEDICINE_GENERIC_DISCHARGE_TEMPLATE,
} from "@/lib/discharge-templates-medicine";
import type { FormatKind } from "@/lib/formats";
import type { SpecialtyPack } from "./types";

/**
 * The internal medicine pack.
 *
 * WHAT MAKES A MEDICINE WARD DIFFERENT, and what each difference here is for:
 *
 * 1. THERE IS NO OPERATION AND NO CYCLE. The day a medicine patient is on is simply the
 *    hospital day — counted from admission, every patient, always. `dayCount` below never
 *    looks at `surgery_date` or the chemo fields. A medicine patient who happens to get a
 *    bedside procedure (a pleural tap, a lumbar puncture, a central line, temporary dialysis
 *    access) still has `procedure_done` recorded the normal way, but it does NOT make them
 *    "POD 0" and does not restart the count. `phaseFor()` returns `before_surgery` for a
 *    patient with no surgery date, so the checklist picker is filed under that phase — the
 *    same reasoning the oncology pack documents.
 *
 * 2. THE ADMISSION IS A PROBLEM, NOT A PROCEDURE. `admissionNoun` is "problem". The round
 *    thinks in a problem list — "fever with thrombocytopenia", "uncontrolled diabetes with a
 *    foot infection" — and the discharge templates are keyed to conditions, not operations.
 *
 * 3. THE CASEMIX IS INFECTION, BLOOD AND UNCONTROLLED HTN/DIABETES. In the unit's own order:
 *    febrile illness and sepsis (enteric fever, dengue, malaria, scrub typhus, TB, pneumonia,
 *    UTI, cellulitis); anaemias and thrombocytopenia and the haematological workups;
 *    hypertensive emergency, DKA and HHS. Everything specialty-specific in this pack — the
 *    discharge templates, the checklist patch 0063, the dictation lexicon — is shaped and
 *    ordered by that list. See docs/specialty-packs.md §2a.
 *
 * 4. FEVER MEANS "SEND CULTURES BEFORE THE FIRST ANTIBIOTIC". The one time-critical rule on
 *    this ward, and it is a checklist line (patch 0063), raised to a gap the moment the
 *    patient is more than an hour into the admission — the same mechanism the oncology
 *    febrile-neutropenia checklist uses.
 *
 * PILOT-ACTIVATED 2026-09-04 on the product owner's direction. The four scores in `scoringKeys`
 * are now `status: "active"` and the checklist protocols (patch 0064) are published. Formal
 * clinical governance review is still on the books (each score's `reviewDueAt`). The discharge
 * *condition* templates remain the one hold-back — see lib/discharge-templates-medicine.ts.
 * Runtime is still gated: the scoring engine's env flag + a per-ward `ward_scoring_engine`
 * row, and `SPECIALTY_PACKS=on` for the picker. See docs/specialty-packs.md §8.
 */
export const internalMedicinePack: SpecialtyPack = {
  key: "internal_medicine",
  label: "Internal Medicine",
  blurb: "Counts hospital days. Problem-list rounds, infection-first checklists and medical discharge summaries.",

  terminology: {
    dayLabel: "HD",
    admissionNoun: "problem",
  },

  admissionPhrase: "an internal medicine admission",

  // Always the hospital day. A medicine patient has no operation and no cycle; `post_op_day`
  // and the chemo fields are ignored on purpose. The label still says "Day n" so a bed on a
  // mixed corridor is never ambiguous against a surgical "POD n" next to it.
  dayCount: (p) => ({ clock: "admission", n: p.admission_day, text: `Day ${p.admission_day}` }),

  extractRoleLine:
    "You convert a physician's spoken ward-round note into structured observations.",

  // Guidance only. It tells the model what a word MEANS on a medicine ward. It never permits
  // inferring a value, and the verbatim-quote check applies to everything it produces.
  extractGuidance: `
Internal medicine ward — what the words mean here:

- The day number spoken is a HOSPITAL DAY (day of admission), not a post-operative day. "day 3", "hospital day 3", "D3 of admission" all mean days since admission. Record kind "day_number" with value_num as the day. There is no post-op day on this ward.
- A DIAGNOSIS here is usually a syndrome under workup, not a single word: "fever with thrombocytopenia", "anaemia for evaluation", "AKI on CKD", "uncontrolled type 2 diabetes with a diabetic foot", "?enteric fever ?dengue". Record kind "diagnosis" and keep the whole phrase, including a leading "?" and any "for evaluation" — the uncertainty is the clinical fact, do not resolve it.
- COUNTS AND CULTURES drive the infective admissions. "TLC", "platelets 40", "ANC", "blood culture sent", "NS1 positive", "Widal", "peripheral smear for MP", "dengue serology", "sputum for AFB", "GeneXpert" are kind "lab" or kind "investigation". Record a number only when a number was spoken.
- A PROCEDURE on this ward is a pleural or ascitic tap, a lumbar puncture, a bone marrow aspiration, a central line or a temporary dialysis catheter. Record these as procedure_done exactly as on any ward, but they do NOT make the patient post-operative and do not reset the day count. A blood transfusion, dialysis session or nebulisation being given is NOT procedure_done — it is a note.
- ANTIBIOTICS AND ANTI-TUBERCULAR THERAPY are medications. "piptaz started", "ceftriaxone 2 g OD", "started on ATT", "HRZE", "doxycycline for scrub", "artesunate" — record kind "medication" with the drug and any spoken dose, route and frequency. Do NOT expand "ATT" or "HRZE" into the individual drugs the resident did not name.
- INSULIN AND GLUCOSE: "GRBS 340", "on insulin infusion", "shifted to subcutaneous insulin", "basal bolus", "sliding scale", "DKA resolving", "anion gap closed" — record the number when one is spoken, the regimen wording as said. Never infer a glucose or a ketone that was not spoken.
- BLOOD PRESSURE in this group is often the reason for admission. Record every spoken BP exactly. "hypertensive emergency", "hypertensive urgency", "target organ damage", "on labetalol infusion", "GTN drip" — keep the wording as said; do not decide urgency versus emergency yourself.
- Abbreviations to leave EXPANDED-AS-SAID and never rewrite: "RT" (ambiguous — radiotherapy or Ryle's tube), "MP" (malaria parasite), "AFB" (acid-fast bacilli), "ATT"/"HRZE" (anti-tubercular therapy), "PUO"/"FUO" (fever of unknown origin), "DKA"/"HHS", "AKI"/"CKD", "ILD". Store the letters that were said.
`.trim(),

  // Fever, counts and the hospital day drive the checklist here, and none of them hang off an
  // operation. See lib/checklist-triggers.ts — the admission-anchored conditions
  // (hours_since_admission_gte, lab, history) already exist and need no new code.
  checklistAnchor: "admission",

  dischargeTemplates: MEDICINE_DISCHARGE_TEMPLATES,
  genericDischargeTemplate: MEDICINE_GENERIC_DISCHARGE_TEMPLATE,

  // The medicine scores. No surgical pathway (Ranson's, AIR, TG18, Glasgow-Blatchford) can
  // ever be offered here — only these four, and only because they are listed. All four are
  // `status: "active"` (pilot activation 2026-09-04), still gated at runtime by the scoring
  // engine's env flag and a per-ward `ward_scoring_engine` row. SIRS rides along inside the
  // qSOFA pathway as a second card.
  scoringKeys: [
    "curb_65", "qsofa", "cha2ds2_vasc", "has_bled", "wells_dvt", "wells_pe", "dka_severity",
    // Batch 2 — signed off for pilot use 2026-09-07 (Dr. Anubhav).
    "heart_score", "ciwa_ar", "child_pugh", "kdigo_aki",
  ],

  // No OT notes slot: this unit has no operating theatre. Everything else stays.
  formatKinds: [
    "investigation",
    "interdepartmental",
    "discharge",
    "notes",
    "logo",
  ] as FormatKind[],

  pickerPhase: "before_surgery",

  lexiconSpecialty: "internal-medicine",
};
