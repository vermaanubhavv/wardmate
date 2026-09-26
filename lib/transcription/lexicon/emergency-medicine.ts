import type { MedicalLexiconEntry } from "./types";
import { PRIORITY } from "./types";

/**
 * The emergency medicine keyterm core.
 *
 * WHY THESE WORDS. A casualty note is dictated in times, interventions and dispositions: "ROSC at
 * 10:46", "two litres crystalloid", "intubated at second attempt", "OP poisoning, unknown
 * compound", "declared brought dead", "referred to higher centre". Half of it is resuscitation
 * vocabulary that no other pack needs, and the Indian casualty words — LAMA, AMA, brought dead,
 * medico-legal case — are not in Nova-3 Medical at all.
 *
 * Everything here is tagged `emergency-medicine`. The shared categories carry the drugs, the
 * gases and the imaging; what is here is the resuscitation and disposition language.
 *
 * Auto-derived triggers below five characters are dropped by `entry()`, so "ROSC", "CPR", "FAST",
 * "AMA", "LAMA", "ETT" and "RTA" are never triggers — only spoken content stored verbatim.
 */

const EM = "emergency-medicine" as const;

function entry(
  term: string,
  categories: MedicalLexiconEntry["categories"],
  aliases: string[] = [],
  triggers: string[] = [],
  priority: number = PRIORITY.SPECIALTY
): MedicalLexiconEntry {
  return {
    term,
    aliases,
    categories,
    specialties: [EM],
    triggers: [term, ...aliases, ...triggers]
      .map((t) => t.toLowerCase())
      .filter((t) => t.length >= 5),
    priority,
  };
}

const dx = (t: string, a: string[] = [], tr: string[] = []) =>
  entry(t, ["diagnosis"], a, tr, PRIORITY.EXACT_PATIENT);
const proc = (t: string, a: string[] = [], tr: string[] = []) =>
  entry(t, ["procedure"], a, tr, PRIORITY.RELATED);
const crit = (t: string, a: string[] = [], tr: string[] = []) =>
  entry(t, ["critical-care"], a, tr, PRIORITY.RELATED);
const drug = (t: string, a: string[] = [], tr: string[] = []) =>
  entry(t, ["medication"], a, tr, PRIORITY.RELATED);
const test = (t: string, a: string[] = [], tr: string[] = []) =>
  entry(t, ["investigation"], a, tr, PRIORITY.SCORING_OR_INVESTIGATION);
const ward = (t: string, a: string[] = [], tr: string[] = []) =>
  entry(t, ["india-ward"], a, tr, PRIORITY.INDIA_WARD);

export const EMERGENCY_MEDICINE: MedicalLexiconEntry[] = [
  // --- The resuscitation itself ------------------------------------------------------------
  crit("cardiopulmonary resuscitation", ["CPR started", "CPR ongoing", "chest compressions given", "return of spontaneous circulation", "ROSC achieved", "cycles of CPR", "asystole on monitor", "ventricular fibrillation", "pulseless ventricular tachycardia", "pulseless electrical activity", "shock delivered", "defibrillated at two hundred joules", "resuscitation abandoned"], ["cardiac arrest"]),
  crit("airway management", ["intubated with endotracheal tube", "rapid sequence intubation", "bag and mask ventilation", "oropharyngeal airway inserted", "laryngeal mask airway", "cricoid pressure", "difficult airway", "second attempt intubation", "surgical airway", "suctioning done", "maintaining own airway"], ["airway"]),
  crit("shock and its resuscitation", ["hypovolaemic shock", "septic shock", "cardiogenic shock", "neurogenic shock", "anaphylactic shock", "crystalloid bolus given", "fluid responsive", "noradrenaline started", "vasopressor requirement", "central line inserted", "massive transfusion protocol", "blood products arranged"], ["shock", "hypotension"]),
  crit("monitoring in the bay", ["attached to monitor", "continuous cardiac monitoring", "saturation in room air", "on oxygen by mask", "non-rebreathing mask", "high flow nasal oxygen", "non-invasive ventilation started", "shifted to ventilator", "urine output monitored hourly"], ["monitoring"]),

  // --- What arrives through the door ------------------------------------------------------
  dx("polytrauma", ["road traffic accident", "pedestrian hit by vehicle", "fall from height", "alleged assault", "blunt abdominal trauma", "penetrating injury", "crush injury", "seat belt not worn", "helmet not worn", "primary survey done", "secondary survey done"], ["multiple injuries", "road accident"]),
  dx("poisoning", ["organophosphate poisoning", "unknown compound consumed", "rodenticide ingestion", "corrosive ingestion", "alcohol intoxication", "drug overdose", "tablets consumed", "kerosene ingestion", "snake bite", "scorpion sting", "dog bite", "hanging", "drowning", "electrocution", "burns on arrival"], ["poisoning", "ingestion"]),
  dx("acute coronary syndrome presentation", ["ST elevation myocardial infarction", "non-ST elevation myocardial infarction", "unstable angina", "atypical chest pain for evaluation", "thrombolysed in the department", "referred for primary angioplasty"], ["chest pain"]),
  dx("acute dyspnoea presentation", ["acute exacerbation of asthma", "acute pulmonary oedema", "acute exacerbation of COPD", "pulmonary embolism suspected", "tension pneumothorax", "silent chest"], ["breathlessness"]),
  dx("altered mental status presentation", ["hypoglycaemia corrected", "diabetic ketoacidosis presentation", "hyperosmolar state", "uraemic encephalopathy", "hepatic encephalopathy", "status epilepticus", "stroke within window", "meningitis suspected", "heat stroke"], ["unconscious", "altered behaviour"]),
  dx("obstetric and paediatric emergency", ["seizure in a pregnant patient", "antepartum haemorrhage", "postpartum haemorrhage", "precipitate delivery in casualty", "child brought with seizure", "neonate brought unresponsive"], ["emergency"]),

  // --- Bedside procedures -----------------------------------------------------------------
  proc("casualty bedside interventions", ["intercostal drainage tube inserted", "needle thoracostomy", "pericardiocentesis", "gastric lavage done", "Ryle's tube inserted", "urinary catheter placed", "cervical collar applied", "splint applied", "wound toilet and suturing", "pressure dressing applied", "tourniquet applied", "intraosseous access", "focused assessment with sonography for trauma"], ["procedure in casualty"]),

  // --- The numbers that come back in minutes ----------------------------------------------
  test("point of care tests", ["capillary blood glucose", "arterial blood gas", "lactate level", "serum potassium on gas", "electrocardiogram taken", "bedside ultrasound", "FAST positive", "free fluid in Morison's pouch", "chest radiograph portable", "CT head plain urgent", "troponin sent", "urine pregnancy test"], ["point of care"]),
  drug("emergency drugs", ["adrenaline given", "atropine given", "amiodarone bolus", "hydrocortisone given", "pheniramine given", "dextrose fifty percent", "naloxone given", "atropine infusion for poisoning", "pralidoxime started", "anti-snake venom vials", "tetanus toxoid given", "anti-rabies vaccine and immunoglobulin", "tranexamic acid given", "labetalol bolus", "magnesium sulphate given"], ["emergency drug"]),

  // --- The Indian casualty record ----------------------------------------------------------
  ward("disposition", ["admitted under surgery", "admitted under medicine", "shifted to intensive care unit", "shifted to operation theatre", "referred to higher centre", "discharged from casualty", "left against medical advice", "discharged against medical advice", "left without being seen", "declared brought dead", "death in the department", "observation in casualty", "handed over to relatives"], ["disposition", "referral"]),
  ward("casualty documentation", ["medico-legal case registered", "police informed", "unknown patient", "no attendant available", "brought by police", "brought by ambulance", "triage category assigned", "time of arrival recorded", "consent taken from attendant", "high risk consent explained", "referral note given"], ["medico-legal", "documentation"]),
];
