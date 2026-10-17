import type { AdviceItem } from "@/lib/discharge-entities";
import type { DischargeTemplate, TemplateMedication } from "@/lib/discharge-templates";

/**
 * INTERNAL MEDICINE discharge templates.
 *
 * PUBLISHED FOR ALPHA TESTING (2026-09-13), on the product owner's direction, ahead of a full
 * departmental read-through — same basis as the scores in lib/scoring/definitions/*.v1.ts
 * ("reviewed and signed off for pilot use by Dr. Anubhav"; formal review still due). Intended
 * to be corrected from real use, not treated as finished.
 *
 * DEFAULT DRUG LISTS. On the product owner's direction (2026-09-28), as for every other
 * department, each condition template now pre-fills the typical discharge medicines as a
 * starting set the resident checks and edits per patient. Anything titrated, organ-function-
 * dependent, culture-dependent or specialist-set (insulin, antihypertensives, steroids and
 * immunosuppressants, ATT, ART, culture-directed antibiotics) keeps its dose as `[ … ]` —
 * never a guessed number. The generic template stays `medications: []`.
 *
 * MEDICINE LINES: REVIEWED (Dr Anubhav Verma, 2026-09-28).
 *
 * Each template's `match` is tried against the typed diagnosis/procedure text; `families`
 * is the fallback via the care_templates picker (patches 0064, 0067). Ordered specific before
 * general, per lib/specialty/discharge.ts.
 */

const adv = (items: { module: string; text: string }[]): AdviceItem[] =>
  items.map((it, i) => ({ id: `adv-${i}`, module: it.module, text: it.text }));

export const STANDARD_RED_FLAGS = [
  "Fever that returns or does not settle, or chills and rigors",
  "Breathlessness, chest pain, or a fast or irregular heartbeat",
  "Confusion, drowsiness, fainting, or a fit",
  "Not passing urine, or much less than usual",
  "Any new bleeding, or black stools",
];

const MEDICINE_ADVICE = adv([
  { module: "Medicines", text: "Take the medicines exactly as listed. Do not stop or change a dose without asking the doctor. Bring the full list to every visit." },
  { module: "Follow-up", text: "Attend the medicine OPD on [ … ] with all reports. Get the tests below done before that visit." },
]);

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
    redFlags: STANDARD_RED_FLAGS,
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

const M = {
  paracetamolSos: { generic: "Paracetamol", strength: "650 mg", route: "PO", frequency: "SOS for fever or pain (not more than 4 doses a day)", status: "prn" } as TemplateMedication,
  pantoprazole: { generic: "Pantoprazole", strength: "40 mg", route: "PO", frequency: "OD before breakfast", duration: "While on steroid", status: "new" } as TemplateMedication,
  ors: { generic: "Oral rehydration salts (ORS)", dose: "1 sachet in 1 litre of clean water", route: "PO", frequency: "Sip through the day", duration: "[ … ] days", indication: "while intake is poor", status: "temporary" } as TemplateMedication,
  culturedAntibiotic: { generic: "[ Oral antibiotic as per culture sensitivity ]", dose: "[ … ]", route: "PO", frequency: "[ … ]", duration: "To complete [ … ] days in total", indication: "culture-directed step-down", status: "new" } as TemplateMedication,
  att: { generic: "FDC as per NTEP weight band (HRZE, then HRE)", dose: "[ as per weight band ]", route: "PO", frequency: "OD, empty stomach", duration: "Intensive phase 2 months, then continuation phase [ … ] months as per NTEP", status: "new" } as TemplateMedication,
  pyridoxine: { generic: "Pyridoxine", dose: "[ … ]", route: "PO", frequency: "OD", duration: "Throughout ATT", status: "new" } as TemplateMedication,
  insulinBasal: { generic: "Insulin — basal ([ glargine / NPH ])", dose: "[ as titrated on the ward ]", route: "SC", frequency: "[ OD / BD ]", duration: "Long term", status: "new" } as TemplateMedication,
  insulinBolus: { generic: "Insulin — prandial ([ regular / rapid-acting ])", dose: "[ as titrated on the ward ]", route: "SC", frequency: "Before meals", duration: "Long term", status: "new" } as TemplateMedication,
  metformin: { generic: "Metformin", dose: "[ … ]", route: "PO", frequency: "[ … ] with meals", duration: "Long term", indication: "restart only if renal function allows, as advised", status: "changed" } as TemplateMedication,
};

/** Shared shell for a febrile-illness-family template — only the parts that genuinely differ
 *  by diagnosis are overridden per condition below. */
function febrile(opts: {
  key: string;
  label: string;
  match: RegExp;
  families: string[];
  indication: string;
  course: string;
  extraRedFlags?: string[];
  followUp: string[];
  medications?: TemplateMedication[];
}): DischargeTemplate {
  return {
    key: opts.key,
    label: opts.label,
    match: opts.match,
    families: opts.families,
    scaffold: {
      indication: opts.indication,
      primaryDiagnosis: "",
      procedure: {
        name: "[ Bedside procedure during this admission, if any ]",
        anaesthesia: "",
        findings: "[ relevant cultures / serology / imaging results ]",
        drains: "[ lines / catheters at discharge, if any ]",
        complications: "Nil",
        outcome: "[ Outcome of this admission ]",
      },
      clinicalCourse: opts.course,
      medications: opts.medications ?? [],
      advice: MEDICINE_ADVICE,
      redFlags: [...STANDARD_RED_FLAGS, ...(opts.extraRedFlags ?? [])],
      patientActions: opts.followUp,
      primaryCareActions: [],
      conditionAllSatisfactory: true,
    },
    clerkingFocus:
      "Onset and duration of fever, pattern, localising symptoms, exposure/travel/contact history, past episodes; examination for a focus; provisional differential and the workup planned.",
    progressNote:
      "Each day — temperature chart, localising symptoms, examination, the results back and what they change, the day's plan. For discharge — afebrile for at least 24–48 hours, haemodynamically stable, tolerating orals, oral step-down prescribed.",
  };
}

export const MEDICINE_DISCHARGE_TEMPLATES: DischargeTemplate[] = [
  // --- Infective tranche --------------------------------------------------------------
  febrile({
    key: "sepsis",
    label: "Sepsis / bacteraemia",
    match: /sepsis|septic shock|bacteraemia|bacteremia|urosepsis/i,
    families: ["sepsis"],
    indication: "Patient was admitted with fever and features of sepsis for source identification and treatment.",
    course:
      "Admitted on day [ … ] with fever and [ presentation ]. Blood cultures sent before the first antibiotic dose. [ Source identified / source not identified. ] Started on empirical [ … ], [ de-escalated / continued ] once cultures resulted. The patient defervesced and was haemodynamically stable throughout / after [ … ], tolerating orals, and was fit for discharge on [ date ].",
    extraRedFlags: ["Return of fever, chills, or feeling generally unwell again"],
    followUp: [
      "Complete the full course of antibiotics as prescribed, even if feeling better.",
      "Get [ repeat CBC / renal function / … ] repeated on [ … ].",
      "Attend the medicine OPD on [ … ] with all reports.",
    ],
    medications: [
      M.culturedAntibiotic,
      M.paracetamolSos,
    ],
  }),
  febrile({
    key: "enteric_fever",
    label: "Enteric fever",
    match: /enteric fever|typhoid/i,
    families: ["enteric_fever"],
    indication: "Patient was admitted with fever and a clinical picture suggestive of enteric fever.",
    course:
      "Admitted on day [ … ] with fever for [ … ] days. [ Widal / Typhidot / blood culture ] [ positive / negative ]. Treated with [ … ] for [ … ] days. Defervesced on day [ … ] of treatment, tolerating orals, and was fit for discharge on [ date ]. No abdominal complications (perforation, GI bleed) during the stay.",
    extraRedFlags: ["Severe abdominal pain or distension", "Bloody or black stools"],
    followUp: [
      "Complete the full course of antibiotics as prescribed.",
      "Maintain food and hand hygiene; avoid outside water and raw food until reviewed.",
      "Attend the medicine OPD on [ … ] with all reports.",
    ],
    medications: [
      { generic: "Azithromycin", strength: "500 mg", route: "PO", frequency: "OD", duration: "To complete [ 7 ] days in total", indication: "or as per blood-culture sensitivity", status: "new" },
      { generic: "Cefixime", strength: "200 mg", route: "PO", frequency: "BD", duration: "To complete [ 14 ] days in total", indication: "alternative to azithromycin — pick one", status: "new" },
      M.paracetamolSos,
    ],
  }),
  febrile({
    key: "dengue",
    label: "Dengue",
    match: /dengue/i,
    families: ["dengue"],
    indication: "Patient was admitted with fever and a clinical/serological picture of dengue for monitoring through the critical phase.",
    course:
      "Admitted on day [ … ] of fever. NS1 / dengue serology [ positive / negative ]. Platelet count and haematocrit trended through the febrile, critical and recovery phases; [ warning signs were / were not ] noted. [ No / Some ] bleeding manifestations. Passed through the critical phase without shock, platelets recovering to [ … ] at discharge, tolerating orals, and was fit for discharge on [ date ].",
    extraRedFlags: [
      "Severe abdominal pain or persistent vomiting",
      "Bleeding from gums, nose, or in urine/stool",
      "Cold hands and feet, or unusual sleepiness/restlessness",
    ],
    followUp: [
      "Get a platelet count repeated on [ … ] and bring the report to the next visit.",
      "Avoid NSAIDs/aspirin and intramuscular injections until reviewed.",
      "Attend the medicine OPD on [ … ] with all reports.",
    ],
    medications: [
      M.paracetamolSos,
      M.ors,
    ],
  }),
  febrile({
    key: "pulmonary_tb",
    label: "Pulmonary tuberculosis",
    match: /pulmonary tuberculosis|pulmonary tb|sputum positive tb/i,
    families: ["pulmonary_tb"],
    indication: "Patient was admitted with cough and constitutional symptoms, diagnosed with pulmonary tuberculosis.",
    course:
      "Admitted on day [ … ] with [ presentation ]. Sputum [ AFB / CBNAAT ] [ positive / negative ]; baseline liver function checked before starting anti-tubercular therapy (ATT). Started on weight-based ATT ([ HRZE regimen, weight [ … ] kg ]) on [ date ]. [ Tolerated treatment without hepatotoxicity / … ]. Case notified. Tolerating orals and was fit for discharge on [ date ] to continue ATT as an outpatient under DOTS.",
    extraRedFlags: ["Yellowing of eyes or skin, or loss of appetite (possible drug reaction)", "Persistent cough with blood-streaked sputum"],
    followUp: [
      "Continue ATT exactly as prescribed for the full duration — do not stop even if feeling better.",
      "Get liver function repeated on [ … ] and bring the report to the next visit.",
      "Register with the local DOTS centre / continue follow-up as arranged.",
      "All household contacts should be screened for TB symptoms.",
    ],
    medications: [
      M.att,
      { ...M.pyridoxine, indication: "with ATT, as per NTEP" },
      M.paracetamolSos,
    ],
  }),
  febrile({
    key: "cap",
    label: "Community-acquired pneumonia",
    match: /community-acquired pneumonia|community acquired pneumonia|\bcap\b|lobar pneumonia|bronchopneumonia/i,
    families: ["cap"],
    indication: "Patient was admitted with fever, cough and breathlessness, with imaging confirming community-acquired pneumonia.",
    course:
      "Admitted on day [ … ] with [ presentation ]. CURB-65 [ … ] on admission. Chest imaging showed [ … ]. Treated with [ … ] and supportive care [ including oxygen ]. Defervesced and oxygen saturation normalised on room air by day [ … ], tolerating orals, and was fit for discharge on [ date ].",
    extraRedFlags: ["Worsening breathlessness or fast breathing", "Bluish lips or fingertips"],
    followUp: [
      "Complete the full course of antibiotics as prescribed.",
      "Get a repeat chest X-ray on [ … ] if symptoms have not fully settled.",
      "Attend the medicine OPD on [ … ] with all reports.",
    ],
    medications: [
      { generic: "Amoxicillin-clavulanate", strength: "625 mg", route: "PO", frequency: "TDS", duration: "To complete [ 5–7 ] days in total", indication: "or as per sputum / blood culture sensitivity", status: "new" },
      { generic: "Azithromycin", strength: "500 mg", route: "PO", frequency: "OD", duration: "To complete [ 3–5 ] days in total", indication: "if atypical cover was started", status: "new" },
      M.paracetamolSos,
    ],
  }),
  febrile({
    key: "pyelonephritis",
    label: "UTI / pyelonephritis",
    match: /pyelonephritis|urinary tract infection|\buti\b/i,
    families: ["pyelonephritis"],
    indication: "Patient was admitted with fever and urinary symptoms, diagnosed with a urinary tract infection / acute pyelonephritis.",
    course:
      "Admitted on day [ … ] with [ dysuria / fever / flank pain ]. Urine routine and culture sent before antibiotics. [ Organism / sensitivity ]. Treated with [ … ]. Defervesced and symptomatically improved, tolerating orals, and was fit for discharge on [ date ].",
    extraRedFlags: ["Flank pain, or fever returning"],
    followUp: [
      "Complete the full course of antibiotics as prescribed.",
      "Get a repeat urine routine on [ … ] if symptoms persist.",
      "Drink adequate fluids; attend the medicine OPD on [ … ] with all reports.",
    ],
    medications: [
      { ...M.culturedAntibiotic, duration: "To complete [ 7–14 ] days in total" },
      M.paracetamolSos,
    ],
  }),
  febrile({
    key: "cellulitis",
    label: "Cellulitis / soft-tissue infection",
    match: /cellulitis|erysipelas|skin and soft tissue infection/i,
    families: ["cellulitis"],
    indication: "Patient was admitted with fever and a spreading skin/soft-tissue infection.",
    course:
      "Admitted on day [ … ] with [ site ] cellulitis, [ margin marked / not marked ] on admission. Treated with [ … ]. The margin regressed and the area was non-tender with [ resolving / resolved ] erythema at discharge, tolerating orals, and was fit for discharge on [ date ].",
    extraRedFlags: ["Rapidly spreading redness, severe pain out of proportion, or blackening of the skin (return immediately)"],
    followUp: [
      "Complete the full course of antibiotics as prescribed.",
      "Elevate the limb where possible; keep the area clean and dry.",
      "Attend the medicine OPD on [ … ] for a wound check.",
    ],
    medications: [
      { generic: "Amoxicillin-clavulanate", strength: "625 mg", route: "PO", frequency: "TDS", duration: "To complete [ 5–7 ] days in total", indication: "or as per pus culture sensitivity", status: "new" },
      M.paracetamolSos,
    ],
  }),

  // --- Uncontrolled hypertension and diabetes tranche --------------------------------
  febrile({
    key: "dka",
    label: "Diabetic ketoacidosis",
    match: /diabetic ketoacidosis|\bdka\b/i,
    families: ["dka"],
    indication: "Patient was admitted with diabetic ketoacidosis for correction of acidosis, fluid and electrolyte deficit.",
    course:
      "Admitted on day [ … ] with [ presentation ]; venous gas showed pH [ … ], bicarbonate [ … ], graded [ mild / moderate / severe ] DKA (see the DKA severity card). Precipitant: [ infection / missed insulin / new onset / … ]. Treated with fixed-rate insulin infusion, fluid and potassium replacement per protocol; anion gap closed by [ … ] hours. Transitioned to subcutaneous [ basal-bolus / … ] insulin with overlap on [ date ], tolerating orals, and was fit for discharge on [ date ].",
    extraRedFlags: ["Very high or very low blood sugar on home glucose checks", "Vomiting, abdominal pain, or breathing fast again"],
    followUp: [
      "Check blood sugar as advised and keep a chart; never stop insulin, even if not eating.",
      "Get HbA1c and renal function repeated on [ … ].",
      "Attend the medicine / diabetes OPD on [ … ] with the glucose chart and all reports.",
    ],
    medications: [
      M.insulinBasal,
      M.insulinBolus,
      M.metformin,
    ],
  }),
  febrile({
    key: "hhs",
    label: "Hyperosmolar hyperglycaemic state",
    match: /hyperosmolar hyperglycaemic state|\bhhs\b|hyperosmolar non-ketotic/i,
    families: ["hhs"],
    indication: "Patient was admitted with hyperosmolar hyperglycaemic state for correction of the fluid deficit and hyperglycaemia.",
    course:
      "Admitted on day [ … ] with [ presentation ]; glucose [ … ], calculated osmolality [ … ], minimal ketosis. Precipitant: [ infection / non-compliance / new onset / … ]. Treated with cautious fluid replacement and insulin infusion per protocol, with hourly glucose and neurological monitoring. Osmolality normalised and sensorium returned to baseline by [ … ], tolerating orals, and was fit for discharge on [ date ].",
    extraRedFlags: ["Confusion, drowsiness, or reduced urine output"],
    followUp: [
      "Check blood sugar as advised and keep a chart.",
      "Get renal function and electrolytes repeated on [ … ].",
      "Attend the medicine / diabetes OPD on [ … ] with the glucose chart and all reports.",
    ],
    medications: [
      { ...M.insulinBasal, indication: "if discharged on insulin" },
      { ...M.insulinBolus, indication: "if discharged on insulin" },
      { generic: "[ Oral hypoglycaemic agent ]", dose: "[ … ]", route: "PO", frequency: "[ … ]", duration: "Long term", indication: "restart only as advised, per renal function", status: "changed" },
    ],
  }),
  febrile({
    key: "hypertensive_emergency",
    label: "Hypertensive emergency",
    match: /hypertensive emergency|hypertensive crisis|malignant hypertension|hypertensive encephalopathy/i,
    families: ["hypertensive_emergency"],
    indication: "Patient was admitted with severely elevated blood pressure and evidence of target-organ damage.",
    course:
      "Admitted on day [ … ] with BP [ … ] and [ target-organ finding — fundal changes / renal impairment / encephalopathy / … ]. Blood pressure lowered in a controlled manner with [ … ], avoiding an overly rapid drop. Target-organ workup: [ fundus / renal function / ECG / urine protein ] — [ findings ]. Blood pressure stable on oral agents at discharge, tolerating orals, and was fit for discharge on [ date ].",
    extraRedFlags: ["Severe headache, visual change, chest pain, or one-sided weakness"],
    followUp: [
      "Check blood pressure at home as advised and keep a chart.",
      "Get renal function repeated on [ … ].",
      "Attend the medicine OPD on [ … ] with the BP chart and all reports.",
    ],
    medications: [
      { generic: "Amlodipine", dose: "[ … ]", route: "PO", frequency: "[ OD ]", duration: "Long term", status: "new" },
      { generic: "Telmisartan", dose: "[ … ]", route: "PO", frequency: "[ OD ]", duration: "Long term", indication: "if renal function and potassium allow", status: "new" },
      { generic: "Chlorthalidone", dose: "[ … ]", route: "PO", frequency: "[ OD ]", duration: "Long term", indication: "if a third agent is needed", status: "new" },
    ],
  }),

  // --- Blood and immunity tranche -----------------------------------------------------
  febrile({
    key: "anaemia_evaluation",
    label: "Anaemia for evaluation",
    match: /anaemia for evaluation|anemia for evaluation|severe anaemia|nutritional anaemia/i,
    families: ["anaemia_evaluation"],
    indication: "Patient was admitted with symptomatic anaemia for evaluation of the cause and correction.",
    course:
      "Admitted on day [ … ] with [ presentation ], haemoglobin [ … ] g/dL. Peripheral smear: [ … ]. Workup for cause: [ iron studies / B12-folate / reticulocyte count / haemolytic workup / occult blood / … ] — [ findings, cause identified / cause not identified ]. [ Transfused [ … ] units PRBC / managed without transfusion. ] Symptomatically improved, hemoglobin [ … ] g/dL at discharge, tolerating orals, and was fit for discharge on [ date ].",
    followUp: [
      "Get a repeat CBC on [ … ] and bring the report to the next visit.",
      "Take iron / haematinic supplements exactly as prescribed, with the diet advice given.",
      "Attend the medicine OPD on [ … ] with all reports.",
    ],
    medications: [
      { generic: "Ferrous sulphate + Folic acid", strength: "[ 100 mg elemental iron + 0.5 mg ]", route: "PO", frequency: "OD, 1 hour before a meal", duration: "[ 3 ] months after haemoglobin normalises", indication: "only for iron deficiency confirmed", status: "new" },
      { generic: "Vitamin B12 (cyanocobalamin / methylcobalamin)", dose: "[ … ]", route: "[ IM / PO ]", frequency: "[ … ]", duration: "[ … ]", indication: "only if B12 deficiency confirmed", status: "new" },
    ],
  }),
  febrile({
    key: "thrombocytopenia",
    label: "Thrombocytopenia / ITP",
    match: /thrombocytopenia|\bitp\b|immune thrombocytopenic purpura/i,
    families: ["thrombocytopenia"],
    indication: "Patient was admitted with a low platelet count for evaluation and monitoring.",
    course:
      "Admitted on day [ … ] with platelet count [ … ], [ with / without ] bleeding manifestations. Workup for cause: [ dengue / drug-induced / ITP / marrow evaluation / … ] — [ findings ]. [ Platelet transfusion given [ … ] units / managed without transfusion. ] Platelet count trended up to [ … ] at discharge with no active bleeding, tolerating orals, and was fit for discharge on [ date ].",
    extraRedFlags: ["Any new bruising, gum bleeding, blood in urine or stool, or a severe headache"],
    followUp: [
      "Get a repeat platelet count on [ … ] and bring the report to the next visit.",
      "Avoid NSAIDs/aspirin and contact sports until the platelet count is reviewed.",
      "Attend the medicine / haematology OPD on [ … ] with all reports.",
    ],
    medications: [
      { generic: "Prednisolone", dose: "[ … ]", route: "PO", frequency: "OD after breakfast", duration: "[ taper as written ]", indication: "if ITP — as per haematology", status: "new" },
      { ...M.pantoprazole, indication: "while on prednisolone" },
      M.paracetamolSos,
    ],
  }),
  febrile({
    key: "sle_flare",
    label: "SLE flare",
    match: /systemic lupus erythematosus|\bsle\b|lupus flare|lupus nephritis/i,
    families: ["sle_flare"],
    indication: "Patient, a known/newly diagnosed case of SLE, was admitted with a disease flare for evaluation and treatment.",
    course:
      "Admitted on day [ … ] with [ presentation — organ system involved ]. Flare confirmed on [ ANA / anti-dsDNA / complement / urinalysis / … ]. Treated with [ … ] under Rheumatology input. Symptomatically improved with [ organ function stable / improving ] at discharge, tolerating orals, and was fit for discharge on [ date ].",
    extraRedFlags: ["New rash, joint swelling, chest pain, breathlessness, or decreased urine output"],
    followUp: [
      "Take immunosuppressive / steroid medicines exactly as prescribed — do not stop suddenly.",
      "Get [ renal function / urine protein / complement ] repeated on [ … ].",
      "Attend the Rheumatology / medicine OPD on [ … ] with all reports.",
    ],
    medications: [
      { generic: "Prednisolone", dose: "[ … ]", route: "PO", frequency: "OD after breakfast", duration: "[ taper as written ]", indication: "as per rheumatology", status: "new" },
      { ...M.pantoprazole, indication: "while on prednisolone" },
      { generic: "Hydroxychloroquine", dose: "[ by weight ]", route: "PO", frequency: "[ OD ]", duration: "Long term", status: "continue" },
      { generic: "Mycophenolate mofetil / Azathioprine", dose: "[ … ]", route: "PO", frequency: "[ … ]", duration: "Long term", indication: "if started by rheumatology", status: "new" },
      { generic: "Calcium + Vitamin D3", strength: "[ 500 mg + 250 IU ]", route: "PO", frequency: "[ BD ]", duration: "While on steroid", status: "new" },
    ],
  }),
  febrile({
    key: "hiv_oi",
    label: "HIV with opportunistic infection",
    match: /hiv with opportunistic infection|retroviral disease|\brvd\b/i,
    families: ["hiv_oi"],
    indication: "Patient, known/newly diagnosed HIV-positive, was admitted with an opportunistic infection for treatment.",
    course:
      "Admitted on day [ … ] with [ presentation ]. CD4 count [ … ]. Opportunistic infection identified: [ … ], treated with [ … ]. [ ART started / continued / deferred as per OI timing guidance. ] Symptomatically improved, tolerating orals, and was fit for discharge on [ date ].",
    extraRedFlags: ["Fever, breathlessness, or worsening of the presenting symptoms"],
    followUp: [
      "Take ART and OI treatment exactly as prescribed — do not miss doses.",
      "Attend the ART centre / medicine OPD on [ … ] with all reports.",
      "Get [ CD4 / relevant follow-up test ] repeated on [ … ].",
    ],
    medications: [
      { generic: "Tenofovir + Lamivudine + Dolutegravir (TLD) FDC", dose: "[ as per ART centre ]", route: "PO", frequency: "OD", duration: "Lifelong", indication: "start / continue as per ART centre and OI timing", status: "new" },
      { generic: "Cotrimoxazole", dose: "[ … ]", route: "PO", frequency: "OD", duration: "[ until CD4 recovers, as per NACO ]", indication: "if CD4 < 200 / as per NACO", status: "new" },
      { generic: "[ OI treatment ]", dose: "[ … ]", route: "[ … ]", frequency: "[ … ]", duration: "[ … ]", indication: "as per the OI identified", status: "new" },
    ],
  }),
];
