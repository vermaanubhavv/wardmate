import {
  MEDICINE_DISCHARGE_TEMPLATES,
  MEDICINE_GENERIC_DISCHARGE_TEMPLATE,
} from "@/lib/discharge-templates-medicine";
import type { FormatKind } from "@/lib/formats";
import type { SpecialtyPack } from "./types";

/**
 * The pulmonary medicine pack — chest medicine, respiratory medicine, the same department
 * under all three names. Named `pulmonary_medicine` everywhere in code and in the database.
 *
 * WHAT MAKES A CHEST WARD DIFFERENT FROM A GENERAL MEDICINE ONE, since it is medicine's
 * nearest neighbour and this pack starts from the medicine one:
 *
 * 1. THE DAY IS THE HOSPITAL DAY, as in medicine. There is no operation and no cycle. A
 *    pleural tap, an intercostal drain or a bronchoscopy is recorded as `procedure_done` and
 *    does NOT make the patient post-operative or restart the count — the same rule the
 *    internal medicine pack documents, and for the same reason.
 *
 * 2. TUBERCULOSIS IS THE CASEMIX, not one diagnosis among many. Active disease, the lung left
 *    behind after it, and drug resistance run through the admissions, the dictation lexicon
 *    (`lib/transcription/lexicon/pulmonary-medicine.ts`) and the history trees below. The
 *    programme shorthand is spoken constantly and must be stored as the letters said —
 *    "CBNAAT", "HRZE", "NTEP" — never expanded by the app into drugs nobody named.
 *
 * 3. OXYGEN AND VENTILATION ARE THE OBSERVATIONS THAT MOVE. Saturation with the delivery
 *    device, the gas, and whether the patient is on NIV are the numbers this ward rounds on,
 *    and all three are ordinary observations — no new field, no new screen.
 *
 * 4. THE COMPLAINT THAT DEFINES IT IS BLOOD IN THE COUGH. `historyTreeIds` therefore leads
 *    with haemoptysis rather than with fever.
 *
 * WHAT THIS PACK DELIBERATELY BORROWS, AND WHEN TO STOP BORROWING:
 *
 * - DISCHARGE TEMPLATES are the medicine ones. They already carry pulmonary tuberculosis and
 *   community-acquired pneumonia, which is most of what this ward discharges, and a wrong-but-
 *   generic template is better than a missing one. A chest unit's own templates — COPD
 *   exacerbation, asthma, pleural effusion after drainage, post-tubercular lung disease — are
 *   the first thing to add when this pack goes past its pilot, in a
 *   `lib/discharge-templates-pulmonary.ts` beside the medicine one.
 * - SCORING is CURB-65, qSOFA and the two Wells pathways, all of which already exist and are
 *   active. Nothing respiratory-specific (BAP-65, PESI, GOLD grading) is offered, because
 *   offering a score this app has not built and reviewed would be worse than offering none.
 *
 * CLINICIAN SIGNED OFF FOR PILOT USE 2026-09-26 (Dr. Anubhav), product owner and general-surgery
 * resident, on his own direction and covering this pack's clinical content: the extraction
 * guidance, the day counter, the keyterm lexicon, the history-tree order and the scoring list
 * — including what it deliberately refuses to offer. NOT YET PILOTED ON A REAL UNIT: sign-off is
 * permission to pilot, not evidence of one. Runtime gating is unchanged. The picker needs `SPECIALTY_PACKS=on`, and the
 * scoring engine needs its own flag plus a per-ward row.
 */
export const pulmonaryMedicinePack: SpecialtyPack = {
  key: "pulmonary_medicine",
  label: "Pulmonary Medicine",
  blurb: "Chest and respiratory medicine. Counts hospital days, leads with tuberculosis, oxygen and the airway.",

  terminology: {
    dayLabel: "HD",
    admissionNoun: "problem",
  },

  admissionPhrase: "a pulmonary medicine admission",

  // The hospital day, always. Same clock as internal medicine, same label, so a mixed corridor
  // never has two meanings of "day 3" on adjacent beds.
  dayCount: (p) => ({ clock: "admission", n: p.admission_day, text: `Day ${p.admission_day}` }),

  extractRoleLine:
    "You convert a chest physician's spoken ward-round note into structured observations.",

  // Guidance only. It says what a word MEANS on a chest ward. It never permits inferring a
  // value, and the verbatim-quote check applies to everything it produces.
  extractGuidance: `
Pulmonary medicine ward — what the words mean here:

- The day number spoken is a HOSPITAL DAY (day of admission). A pleural tap, an intercostal drain insertion, a bronchoscopy or a bronchoalveolar lavage is recorded as procedure_done, but it does NOT make the patient post-operative and does not reset the day count.
- OXYGEN IS ALWAYS TWO FACTS: the saturation and what the patient was breathing when it was taken. "94 on room air", "88 on 4 litres by nasal prongs", "on NIV", "on 15 litres by NRBM", "FiO2 0.4" — record the number spoken as a vital and keep the delivery wording verbatim in the same observation. Never record a saturation without the device if the device was said, and never assume room air when nothing was said.
- A BLOOD GAS is spoken as a run of numbers: "pH 7.28, PCO2 68, PO2 55, bicarb 30". Record each value that was actually spoken, as spoken. Do not compute a P/F ratio, an anion gap or a corrected value the resident did not say.
- TUBERCULOSIS SHORTHAND IS STORED AS SAID and never expanded: "CBNAAT", "GeneXpert", "MTB detected, rifampicin resistance not detected", "ATT", "HRZE", "AKT-4", "intensive phase", "continuation phase", "NTEP", "Nikshay". Do not turn "HRZE" into four drug names, and do not turn "MTB detected" into a diagnosis line the resident did not dictate.
- SPUTUM IS BOTH A SYMPTOM AND A SPECIMEN. "one cupful of sputum daily", "foul smelling sputum" is a symptom; "sputum for AFB sent", "sputum culture", "sputum for GeneXpert" is an investigation. Record the amount only when an amount was spoken.
- HAEMOPTYSIS IS RECORDED WITH ITS VOLUME AND NOTHING INFERRED: "streaks", "one spoonful", "half a cup", "about 200 ml in 24 hours". If only "blood in sputum" was said, that is what is stored — do not grade it as mild, moderate or massive yourself.
- A DRAIN has things said about it every round: "column moving", "air leak present", "50 ml serous drained", "drain clamped", "drain removed". These are notes or outputs on the existing drain fields; an intercostal drain is a device, not a new operation.
- INHALERS AND NEBULISATION are medications, usually spoken by brand off an Indian chart: "Foracort rotacap", "Duolin nebulisation", "Budecort", "Seroflo", "Asthalin respule". Record the drug and any spoken dose, route and frequency. "Nebulisation given" is a medication, not procedure_done.
- SPIROMETRY AND SLEEP STUDIES: "FEV1 1.2 litres", "FEV1 by FVC 58 percent", "post bronchodilator reversibility 8 percent", "AHI 42", "Epworth 16" are investigations. Record the number spoken; never infer a GOLD stage or a severity grade.
- Abbreviations to leave AS SAID: "RT" (ambiguous — radiotherapy or Ryle's tube), "ICD" (intercostal drain here, but store the letters said), "ATT"/"HRZE", "AFB", "CBNAAT", "NIV"/"BiPAP"/"HFNC", "ILD", "ABPA", "OSA", "ARDS".
`.trim(),

  // Nothing here hangs off an operation: the checklist conditions that matter on this ward are
  // hours since admission (oxygen reassessed, sputum sent before the first dose) and labs.
  checklistAnchor: "admission",

  // Borrowed from medicine on purpose — see the note above for what to add and when.
  dischargeTemplates: MEDICINE_DISCHARGE_TEMPLATES,
  genericDischargeTemplate: MEDICINE_GENERIC_DISCHARGE_TEMPLATE,

  // Only scores this app has actually built and activated. CURB-65 is the pneumonia pathway,
  // qSOFA carries SIRS alongside it, and the two Wells pathways are here because a breathless
  // chest patient with a swollen calf is the question this ward asks most often.
  scoringKeys: ["curb_65", "qsofa", "wells_pe", "wells_dvt"],

  // No OT notes slot: no operating theatre.
  formatKinds: ["investigation", "interdepartmental", "discharge", "notes", "logo"] as FormatKind[],

  pickerPhase: "before_surgery",

  // Borrowed from medicine, on the same terms as the discharge templates above: these three
  // ARE the chest casemix (§2 of this header, and the Wells pathways in scoringKeys). The rest
  // of the medicine list — DKA, SLE, enteric fever — is not this ward's and is not offered.
  // A chest unit's own checklists (COPD exacerbation, asthma, pleural effusion, post-TB lung)
  // replace this list when they are written.
  checklistFamilies: ["cap", "pulmonary_tb", "vte_suspected"],

  lexiconSpecialty: "pulmonary-medicine",

  // Blood in the cough first — the complaint that brings a patient onto this ward and the one
  // counted in hours. Then the daily casemix, then the OPD sleep referral.
  historyTreeIds: [
    "haemoptysis",
    "breathlessness",
    "cough",
    "chest_pain",
    "fever",
    "loss_of_weight_appetite",
    "snoring_sleepiness",
    "oedema",
    "shock",
    "altered_sensorium",
  ],
};
