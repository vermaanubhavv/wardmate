import type { DischargeTemplate, TemplateMedication } from "@/lib/discharge-templates";
import type { AdviceItem } from "@/lib/discharge-entities";

/**
 * PULMONARY MEDICINE discharge templates. CLINICAL CONTENT: REVIEWED (Dr Anubhav Verma, 2026-09-28).
 *
 * Unlike the internal-medicine set, these PRE-FILL a typical adult discharge prescription, on the
 * product owner's direction. The medication lines are a STARTING SET to be checked against each
 * patient — allergy, weight, renal and liver function, cultures, what they were already taking,
 * and the inhaler device they can actually use. Anything dose-titrated, weight-banded or
 * organ-function dependent is left as `[ … ]` and prints as a visible blank, never a guess.
 *
 * `[ … ]` marks every patient-specific blank. Ordered specific before general — first match wins
 * (lib/specialty/discharge.ts): drug-resistant TB before TB; pneumothorax before effusion (so a
 * hydropneumothorax lands on the ICD template); effusion before TB (so a tubercular effusion
 * after a tap lands on the effusion template, which carries the ATT line); bronchiectasis, ILD,
 * OSA, COPD and asthma before TB (so "post-TB bronchiectasis" is not caught by the TB pattern);
 * TB before pneumonia.
 */

const adv = (items: { module: string; text: string }[]): AdviceItem[] =>
  items.map((it, i) => ({ id: `adv-${i}`, module: it.module, text: it.text }));

// --- reusable pieces -------------------------------------------------------------------

const M = {
  salbutamolSos: { generic: "Salbutamol", strength: "100 mcg/puff", dose: "2 puffs", route: "Inhaled (MDI with spacer)", frequency: "SOS for breathlessness", status: "prn" } as TemplateMedication,
  budesonideFormoterol: { generic: "Budesonide + Formoterol", strength: "200/6 mcg", dose: "2 puffs", route: "Inhaled (MDI with spacer / rotacap via rotahaler)", frequency: "BD", duration: "Long term", indication: "rinse the mouth after each use", status: "new" } as TemplateMedication,
  tiotropium: { generic: "Tiotropium", strength: "18 mcg", dose: "1 rotacap", route: "Inhaled (rotacap via rotahaler)", frequency: "OD", duration: "Long term", status: "new" } as TemplateMedication,
  prednisolone5: { generic: "Prednisolone", strength: "40 mg", route: "PO", frequency: "OD after breakfast", duration: "5 days in total (including the days in hospital)", status: "temporary" } as TemplateMedication,
  pantoprazole: { generic: "Pantoprazole", strength: "40 mg", route: "PO", frequency: "OD before breakfast", duration: "5 days", status: "new" } as TemplateMedication,
  amoxClav: { generic: "Amoxicillin-clavulanate", strength: "625 mg", route: "PO", frequency: "TDS", duration: "5 days", status: "new" } as TemplateMedication,
  azithromycin: { generic: "Azithromycin", strength: "500 mg", route: "PO", frequency: "OD", duration: "3 days", status: "new" } as TemplateMedication,
  paracetamolSos: { generic: "Paracetamol", strength: "650 mg", route: "PO", frequency: "SOS for fever or pain", status: "prn" } as TemplateMedication,
  paracetamol: { generic: "Paracetamol", strength: "650 mg", route: "PO", frequency: "TDS", duration: "5 days", status: "new" } as TemplateMedication,
  att: { generic: "FDC as per NTEP weight band (HRZE, then HRE)", dose: "[ as per weight band ]", route: "PO", frequency: "OD, empty stomach", duration: "Intensive phase 2 months, then continuation phase [ … ] months as per NTEP", status: "new" } as TemplateMedication,
  pyridoxine: { generic: "Pyridoxine", dose: "[ … ]", route: "PO", frequency: "OD", duration: "Throughout treatment", status: "new" } as TemplateMedication,
};

const RF_BREATH = [
  "Breathlessness that is worse, or not relieved by the reliever inhaler",
  "Needing the reliever inhaler more often than every 4 hours",
  "Lips or fingertips turning blue, or too breathless to speak in full sentences",
  "Drowsiness or confusion",
];
const RF_FEVER = ["Fever that returns or does not settle"];
const RF_CHEST = [
  "Sudden chest pain or sudden breathlessness",
  "Coughing up blood",
];

const INHALER = { module: "Medication instructions", text: "Use the inhalers with the technique taught on the ward (with the spacer where given). Bring the inhalers to every visit so the technique can be checked. Do not stop the daily inhaler when you feel better." };
const SMOKING = { module: "Activity restrictions", text: "Stop smoking completely, including bidis and hookah. Avoid smoke from chulhas, mosquito coils and incense; ask about the smoking-cessation clinic." };
const VACCINE = { module: "Medication instructions", text: "Ask at follow-up about the yearly influenza vaccine and the pneumococcal vaccine." };
const CHEST_OPD = "Attend the Pulmonary Medicine OPD on [ … ] with this summary and all reports.";
const NTEP_ADHERENCE = { module: "Medication instructions", text: "Take the TB medicines every day without missing a dose, for the full duration. Do not stop when you feel better — stopping early causes drug-resistant TB. Collect the next supply from the DOTS centre / health facility named below before it runs out." };
const COUGH_HYGIENE = { module: "Activity restrictions", text: "Cover the mouth when coughing, spit into a closed container (not in the open), keep windows open, and sleep in a separate well-ventilated room if possible for the first weeks of treatment." };

function proc(name: string, findings: string, drains = "[ nil ]"): DischargeTemplate["scaffold"]["procedure"] {
  return { name, anaesthesia: "", findings, drains, complications: "Nil", outcome: "[ Outcome of this admission ]" };
}

// --- generic -------------------------------------------------------------------------

export const PULMONARY_GENERIC_DISCHARGE_TEMPLATE: DischargeTemplate = {
  key: "pulmonary_generic",
  label: "Pulmonary medicine — generic template",
  match: /.^/,
  scaffold: {
    indication: "Patient was admitted with [ presenting respiratory problem ] for [ investigation / medical management / stabilisation ].",
    primaryDiagnosis: "",
    procedure: proc(
      "[ Bedside procedure during this admission, if any — pleural tap, ICD, bronchoscopy, NIV ]",
      "[ relevant results — ABG, sputum AFB / CBNAAT / culture, chest X-ray, CT, pleural fluid, PFT ]",
      "[ lines / drains at discharge, if any ]"
    ),
    clinicalCourse:
      "Admitted on [ date ] with [ presentation ]. [ Working diagnosis and how it was reached. ] [ Treatment given — oxygen / NIV / nebulisation / antibiotics / procedures. ] The patient improved, was afebrile, maintaining saturation [ … ]% on [ room air / … L/min oxygen ], tolerating orals, and was fit for discharge on [ date ] with the plan below.",
    medications: [],
    advice: adv([
      { module: "Medication instructions", text: "Take the medicines exactly as listed. Do not stop or change a dose without asking the doctor. Bring the full list and all inhalers to every visit." },
      SMOKING,
      { module: "Diet", text: "[ diet advice for this condition ]" },
    ]),
    redFlags: [...RF_BREATH, ...RF_FEVER, ...RF_CHEST],
    patientActions: ["Get [ … ] repeated on [ … ] and bring the report to the next visit.", CHEST_OPD],
    primaryCareActions: [],
    conditionAllSatisfactory: true,
  },
  clerkingFocus:
    "Cough — duration, sputum colour and volume, blood; breathlessness grade (mMRC) and its course; wheeze; chest pain; fever, weight loss, night sweats; smoking in pack-years and biomass exposure; occupation; past TB and its treatment; previous admissions, NIV or intubation; current inhalers and technique; comorbidities. Examination: respiratory rate, SpO2 on air, accessory muscles, clubbing, cyanosis, chest findings, signs of right heart failure. Baseline: chest X-ray, CBC, renal function, ABG where indicated, sputum AFB / CBNAAT.",
  progressNote:
    "Each day — breathlessness, cough, sputum; respiratory rate, SpO2 and the oxygen it needs; chest findings; temperature; results back and the day's plan. For discharge — stable on room air (or on the home-oxygen plan), afebrile, inhaler technique checked, oral step-down prescribed, follow-up written down.",
};

// --- the ten -------------------------------------------------------------------------

export const PULMONARY_DISCHARGE_TEMPLATES: DischargeTemplate[] = [
  // ---- Drug-resistant TB (before drug-sensitive TB) ----
  {
    key: "dr_tb",
    label: "Drug-resistant tuberculosis",
    match: /\b(DR|MDR|XDR|RR)[- ]?TB\b|pre[- ]?XDR|drug[- ]resistant (tb|tuberculosis|koch)|multi[- ]?drug[- ]resistant|rifampicin[- ]resist|\bRif(ampicin)? resistance\b/i,
    scaffold: {
      indication: "Patient was admitted with [ presentation ] and diagnosed with / known to have [ rifampicin-resistant / MDR / pre-XDR ] tuberculosis, for regimen initiation and monitoring.",
      primaryDiagnosis: "[ RR / MDR / pre-XDR / XDR ] pulmonary tuberculosis — [ CBNAAT / LPA / culture DST result ]",
      procedure: proc("[ Nil / bronchoscopy / pleural tap ]", "[ CBNAAT, first- and second-line LPA, liquid culture DST; baseline ECG with QTc; audiometry; visual acuity and colour vision; TSH; renal and liver function; HIV; blood sugar ]"),
      clinicalCourse:
        "Admitted on [ date ] with [ presentation ]. Drug resistance was confirmed by [ … ]. After pre-treatment evaluation, the [ shorter oral / longer oral / BPaLM ] regimen was started on [ date ] as decided by the DR-TB centre. The drugs were tolerated [ without / with … ] adverse effects; QTc on treatment was [ … ] ms. Registered on Nikshay (ID [ … ]) and linked to [ district DR-TB centre / TU ]. Discharged on [ date ] to continue treatment under supervision.",
      medications: [
        { generic: "Bedaquiline", dose: "[ … ]", route: "PO", frequency: "[ … ]", duration: "[ … ]", indication: "with food", status: "new" },
        { generic: "Pretomanid", dose: "[ … ]", route: "PO", frequency: "[ … ]", duration: "[ … ]", indication: "if on the BPaLM regimen", status: "new" },
        { generic: "Linezolid", dose: "[ … ]", route: "PO", frequency: "[ … ]", duration: "[ … ]", status: "new" },
        { generic: "Moxifloxacin / Levofloxacin", dose: "[ … ]", route: "PO", frequency: "[ … ]", duration: "[ … ]", indication: "as per the regimen and DST", status: "new" },
        { generic: "Clofazimine", dose: "[ … ]", route: "PO", frequency: "[ … ]", duration: "[ … ]", indication: "if part of the regimen", status: "new" },
        { generic: "Cycloserine", dose: "[ … ]", route: "PO", frequency: "[ … ]", duration: "[ … ]", indication: "if part of the regimen", status: "new" },
        M.pyridoxine,
      ],
      advice: adv([
        { ...NTEP_ADHERENCE, text: "Take every dose of the DR-TB medicines exactly as listed, for the full duration decided by the DR-TB centre. Missing doses can make the TB incurable. Collect supplies only from the DR-TB centre / health facility named below." },
        COUGH_HYGIENE,
        { module: "Medication instructions", text: "Report side effects early rather than stopping the drugs: tingling or numbness in the feet, blurred or changed vision, hearing loss or ringing, palpitations or fainting, low mood or unusual behaviour, yellow eyes, skin darkening (clofazimine)." },
        { module: "Diet", text: "High-protein, high-calorie diet. Avoid alcohol and tobacco completely. Nikshay Poshan Yojana support is paid to the registered bank account." },
      ]),
      redFlags: [
        "Palpitations, fainting or a very fast heartbeat",
        "Blurred vision, changed colour vision, or loss of hearing",
        "Yellow eyes or urine, persistent vomiting, or severe abdominal pain",
        "Severe low mood, thoughts of self-harm, fits or confused behaviour",
        "Coughing up blood",
        ...RF_BREATH.slice(0, 1),
      ],
      patientActions: [
        "Continue treatment at [ DR-TB centre / DOTS centre ] — Nikshay ID [ … ], treatment supporter [ … ].",
        "Get the monitoring tests (ECG, CBC, renal / liver function, sputum culture) on the dates written by the DR-TB centre: [ … ].",
        "Bring all household contacts for TB screening and, where eligible, preventive treatment.",
        CHEST_OPD,
      ],
      primaryCareActions: [
        "Ensure daily supervised dosing and record doses on Nikshay.",
        "Screen household contacts; offer TB preventive treatment as per current NTEP guidance.",
        "Watch for QT prolongation, neuropathy, myelosuppression and psychiatric effects; refer early.",
      ],
      conditionAllSatisfactory: false,
    },
    clerkingFocus:
      "Previous TB episodes — regimens, adherence, outcome, where treated; contact with a known DR-TB patient; current symptoms (cough, haemoptysis, weight loss, fever); HIV and diabetes status; alcohol, tobacco and substance use; psychiatric history (cycloserine); hearing, vision and neuropathy at baseline; drugs that prolong QT. Baseline: CBNAAT, LPA, culture DST, ECG with QTc, CBC, renal and liver function, electrolytes including potassium and magnesium, TSH, HIV, blood sugar, audiometry, visual acuity and colour vision, chest X-ray, weight.",
    progressNote:
      "Each day — cough, haemoptysis, appetite, weight; temperature; tolerance of each drug; neuropathy, vision and mood checks; QTc on the scheduled ECGs; electrolytes. For discharge — regimen tolerated, Nikshay registration and DR-TB centre linkage done, treatment supporter identified, monitoring dates written down.",
  },

  // ---- Pneumothorax after ICD (before effusion, so hydropneumothorax lands here) ----
  {
    key: "pneumothorax",
    label: "Pneumothorax after ICD",
    match: /pneumothora(x|ces)|hydropneumothorax|pyopneumothorax/i,
    scaffold: {
      indication: "Patient was admitted with [ sudden breathlessness / chest pain ] and a [ right / left ] [ primary / secondary ] spontaneous pneumothorax requiring intercostal drainage.",
      primaryDiagnosis: "[ Right / left ] [ primary / secondary ] spontaneous pneumothorax [ — underlying: COPD / TB / … ]",
      procedure: {
        name: "[ Right / left ] intercostal chest drain insertion",
        anaesthesia: "Local anaesthesia",
        findings: "[ size on X-ray; ICD size and site; air leak — duration; underlying lung disease ]",
        drains: "ICD removed on [ date ] after the lung re-expanded and the air leak stopped",
        complications: "Nil",
        outcome: "Lung fully re-expanded on the chest X-ray before discharge.",
      },
      clinicalCourse:
        "Admitted on [ date ] with a [ right / left ] pneumothorax. An intercostal drain was inserted on [ date ]. The air leak settled by [ … ]; the drain was clamped / removed on [ date ] and the check X-ray showed the lung re-expanded. [ Underlying disease and its management. ] Discharged comfortable on room air on [ date ].",
      medications: [M.paracetamol, M.paracetamolSos],
      advice: adv([
        { module: "Wound care", text: "Keep the drain-site dressing clean and dry for 48 hours. The stitch at the drain site comes out on day [ … ]." },
        { module: "Activity restrictions", text: "No flying until cleared by the chest physician after a check X-ray. Never go scuba diving unless a chest surgeon says it is safe. Avoid heavy exertion and contact sport until reviewed." },
        SMOKING,
      ]),
      redFlags: [
        "Sudden chest pain or sudden breathlessness — the lung may have collapsed again; come to the emergency immediately",
        "Redness, pus or leakage at the drain site",
        ...RF_FEVER,
      ],
      patientActions: [
        "Attend for stitch removal at the drain site on day [ … ].",
        "Get a chest X-ray on [ … ] and bring it to the Pulmonary Medicine OPD on [ … ].",
        "Stop smoking — it is the biggest risk for it happening again.",
      ],
      primaryCareActions: ["Any sudden breathlessness — chest X-ray and refer.", "Support smoking cessation."],
      conditionAllSatisfactory: true,
    },
    clerkingFocus:
      "Onset — sudden, at rest or exertion; pleuritic chest pain; breathlessness; previous episodes and side; smoking (tobacco, cannabis); underlying lung disease — COPD, TB, cystic lung disease; trauma or recent procedure; occupation (diver, pilot). Examination: respiratory rate, SpO2, tracheal position, hyper-resonance, absent breath sounds, signs of tension. Baseline: chest X-ray (size), ABG if secondary.",
    progressNote:
      "Each day — breathlessness, pain; SpO2; ICD — swinging, bubbling, output; drain site; check X-ray. For discharge — air leak stopped, drain removed, lung re-expanded on X-ray, stable on room air, flying and diving advice given.",
  },

  // ---- Pleural effusion after ICD / tap (incl. tubercular) ----
  {
    key: "pleural_effusion",
    label: "Pleural effusion after ICD / tapping",
    match: /pleural effusion|\beffusion\b.*(pleura|ICD|tap)|hydrothorax|empyema|parapneumonic|thora(co)?centesis|pleural (tap|aspiration|fluid)|(tubercular|tb) pleur/i,
    scaffold: {
      indication: "Patient was admitted with [ breathlessness / chest pain / fever ] and a [ right / left ] pleural effusion for evaluation and drainage.",
      primaryDiagnosis: "[ Right / left ] [ tubercular / parapneumonic / malignant / transudative ] pleural effusion [ / empyema ]",
      procedure: {
        name: "[ Diagnostic and therapeutic thoracocentesis / intercostal drain insertion ] [ right / left ]",
        anaesthesia: "Local anaesthesia",
        findings: "[ volume drained; appearance; pleural fluid protein, LDH, sugar, ADA, cell count and differential, Gram stain, AFB / CBNAAT, culture, cytology; Light's criteria ]",
        drains: "[ ICD removed on [ date ] / nil ]",
        complications: "Nil",
        outcome: "[ Residual effusion on the check X-ray: nil / minimal / … ]",
      },
      clinicalCourse:
        "Admitted on [ date ] with a [ right / left ] pleural effusion. [ Thoracocentesis / ICD insertion ] was done on [ date ], draining [ … ] ml of [ straw-coloured / turbid / haemorrhagic ] fluid. Fluid analysis showed [ … ], consistent with a [ … ] effusion. [ ATT started on [ date ] and registered on Nikshay (ID [ … ]) / antibiotics given for [ … ] days / oncology referral. ] [ The drain was removed on [ date ]. ] Discharged comfortable on room air on [ date ].",
      medications: [
        { ...M.att, indication: "if tubercular — registered on Nikshay" },
        { ...M.pyridoxine, indication: "with ATT" },
        { ...M.amoxClav, duration: "[ … ] days in total", indication: "if parapneumonic / empyema — or as per pleural fluid culture" },
        M.paracetamolSos,
      ],
      advice: adv([
        { module: "Wound care", text: "Keep the tap / drain site dressing clean and dry for 48 hours; the drain-site stitch comes out on day [ … ]." },
        { module: "Physiotherapy", text: "Do the deep-breathing exercises (and incentive spirometer, if given) taught on the ward several times a day to help the lung expand." },
        NTEP_ADHERENCE,
        { module: "Diet", text: "High-protein diet." },
      ]),
      redFlags: [
        "Breathlessness returning or getting worse",
        ...RF_FEVER,
        "Redness, pus or leakage at the tap or drain site",
        "Yellow eyes or urine, or persistent vomiting while on TB medicines",
      ],
      patientActions: [
        "Get a chest X-ray on [ … ] and bring it to the Pulmonary Medicine OPD on [ … ].",
        "Collect the pending reports — [ pleural fluid culture / cytology / AFB culture ] — and bring them to the next visit.",
        "If on TB medicines: continue at [ DOTS centre ] — Nikshay ID [ … ]; bring household contacts for screening.",
      ],
      primaryCareActions: [
        "If tubercular: supervise ATT, record on Nikshay, check liver function if symptomatic, screen contacts.",
        "Repeat chest X-ray if breathlessness recurs.",
      ],
      conditionAllSatisfactory: true,
    },
    clerkingFocus:
      "Breathlessness and its course; pleuritic pain; fever, weight loss, night sweats (TB); cough and sputum (parapneumonic); past TB or contact; symptoms of heart, liver or kidney failure (transudate); weight loss, smoking, breast or other cancer (malignant). Examination: side, stony dullness, mediastinal shift, signs of the underlying cause. Baseline: chest X-ray, USG thorax, pleural fluid protein / LDH / sugar / ADA / cell count / AFB / CBNAAT / culture / cytology, serum protein and LDH, CBC, renal and liver function.",
    progressNote:
      "Each day — breathlessness; SpO2; temperature; drain output and character; drain site; fluid reports back and what they change; check X-ray. For discharge — drain removed, minimal residual fluid, afebrile, cause established or pending reports listed, ATT / Nikshay linkage done if tubercular.",
  },

  // ---- COPD exacerbation ----
  {
    key: "copd_exacerbation",
    label: "COPD exacerbation",
    match: /\bA?E?COPD\b|chronic obstructive|chronic bronchitis|emphysema/i,
    scaffold: {
      indication: "Patient, a known case of COPD, was admitted with an acute exacerbation — increased breathlessness [ and sputum volume / purulence ].",
      primaryDiagnosis: "Acute exacerbation of COPD [ — infective / non-infective ] [ with type 2 respiratory failure ]",
      procedure: proc("[ Nil / NIV (BiPAP) for [ … ] days ]", "[ ABG on admission and at discharge; chest X-ray; sputum culture; ECG; echo if cor pulmonale ]"),
      clinicalCourse:
        "Admitted on [ date ] with an exacerbation of COPD. Treated with controlled oxygen, nebulised bronchodilators, systemic steroids [ and antibiotics ] [ and NIV for [ … ] days ]. Breathlessness improved; saturation [ … ]% on [ room air / … L/min ] at discharge. Inhaler technique was checked. Discharged on [ date ].",
      medications: [
        M.tiotropium,
        M.budesonideFormoterol,
        M.salbutamolSos,
        M.prednisolone5,
        { ...M.pantoprazole, indication: "while on prednisolone" },
        { ...M.amoxClav, indication: "if the exacerbation was infective (purulent sputum)" },
      ],
      advice: adv([
        INHALER,
        SMOKING,
        { module: "Activity restrictions", text: "[ Home oxygen at [ … ] L/min for [ … ] hours a day — do not increase the flow on your own. ]" },
        { module: "Physiotherapy", text: "Walk a little more each day; pursed-lip breathing when breathless; ask about pulmonary rehabilitation." },
        VACCINE,
      ]),
      redFlags: [...RF_BREATH, "Swelling of the feet increasing", ...RF_FEVER],
      patientActions: [
        "Finish the steroid tablets on the day written, then stop.",
        "Attend the Pulmonary Medicine OPD in 2–4 weeks with the inhalers; spirometry on [ … ] when stable.",
      ],
      primaryCareActions: ["Check inhaler technique and adherence.", "Smoking cessation.", "Influenza and pneumococcal vaccination."],
      conditionAllSatisfactory: true,
    },
    clerkingFocus:
      "Baseline breathlessness (mMRC) and the change; sputum volume and colour; fever; exacerbations and admissions in the past year; previous NIV or intubation; smoking in pack-years and biomass exposure; current inhalers, technique and adherence; home oxygen; comorbidities — heart failure, diabetes. Examination: respiratory rate, SpO2, accessory muscles, flap, cyanosis, wheeze, signs of cor pulmonale. Baseline: ABG, chest X-ray, CBC, renal function, ECG, sputum culture if purulent.",
    progressNote:
      "Each day — breathlessness, sputum; respiratory rate, SpO2 on the oxygen given; ABG if on NIV; wheeze; day of steroid / antibiotic. For discharge — stable on room air or home oxygen, off NIV for 24 hours, inhaler technique checked, steroid end-date written.",
  },

  // ---- Acute asthma ----
  {
    key: "acute_asthma",
    label: "Acute asthma",
    match: /asthma|status asthmaticus|acute severe asthma/i,
    scaffold: {
      indication: "Patient was admitted with an acute exacerbation of bronchial asthma — [ moderate / acute severe / life-threatening ].",
      primaryDiagnosis: "Acute exacerbation of bronchial asthma [ — trigger: viral infection / allergen / non-adherence / … ]",
      procedure: proc("[ Nil ]", "[ PEFR on admission and at discharge; ABG; chest X-ray ]"),
      clinicalCourse:
        "Admitted on [ date ] with acute asthma (PEFR [ … ]% of best / predicted). Treated with oxygen, nebulised salbutamol and ipratropium and systemic steroids [ and IV magnesium ]. Improved steadily; PEFR at discharge [ … ]%, stable on room air. Inhaler technique was checked and a written action plan given. Discharged on [ date ].",
      medications: [M.budesonideFormoterol, M.salbutamolSos, M.prednisolone5, { generic: "Montelukast", strength: "10 mg", route: "PO", frequency: "HS", indication: "if already on it before admission", status: "continue" }],
      advice: adv([
        INHALER,
        { module: "Activity restrictions", text: "Avoid known triggers — smoke, dust, pollen, pets, cold air as applicable. No smoking." },
        { module: "Medication instructions", text: "Follow the written asthma action plan. If the reliever is needed more than usual, use it as the plan says and come to the emergency if not better." },
        VACCINE,
      ]),
      redFlags: RF_BREATH,
      patientActions: ["Finish the steroid tablets on the day written, then stop.", "Attend the Pulmonary Medicine OPD within 1–2 weeks with the inhalers."],
      primaryCareActions: ["Review within 2 working days of discharge.", "Check technique, adherence and triggers."],
      conditionAllSatisfactory: true,
    },
    clerkingFocus:
      "Onset and trigger; usual control — night waking, reliever use, activity limitation; previous admissions, ICU or intubation; current controller and technique; adherence; atopy, rhinitis; NSAID / beta-blocker use; occupation. Examination: ability to speak, respiratory rate, heart rate, SpO2, PEFR, wheeze or silent chest, exhaustion. Baseline: PEFR, SpO2, ABG if SpO2 < 92%, chest X-ray if pneumothorax or pneumonia suspected.",
    progressNote:
      "Each day — breathlessness, night symptoms; PEFR (best of three) morning and evening; SpO2; reliever needed. For discharge — PEFR > 75% of best, stable on room air, inhaler technique checked, action plan given, steroid end-date written.",
  },

  // ---- Bronchiectasis exacerbation ----
  {
    key: "bronchiectasis",
    label: "Bronchiectasis exacerbation",
    match: /bronchiectasis/i,
    scaffold: {
      indication: "Patient, a known case of bronchiectasis [ post-TB / … ], was admitted with an infective exacerbation — increased cough, sputum and breathlessness [ with haemoptysis ].",
      primaryDiagnosis: "Infective exacerbation of bronchiectasis [ — cause: post-infective / post-TB / ABPA / … ] [ — organism: … ]",
      procedure: proc("[ Nil ]", "[ sputum culture and sensitivity; HRCT chest; chest X-ray ]"),
      clinicalCourse:
        "Admitted on [ date ] with an exacerbation of bronchiectasis. Sputum was sent for culture before antibiotics; treated with [ … ] [ changed to … as per culture ], airway-clearance physiotherapy and bronchodilators. Sputum volume reduced and fever settled. Discharged on [ date ] to complete the course.",
      medications: [
        { ...M.amoxClav, duration: "To complete 14 days in total", indication: "or as per sputum culture sensitivity" },
        M.salbutamolSos,
        M.paracetamolSos,
      ],
      advice: adv([
        { module: "Physiotherapy", text: "Do the airway-clearance routine (active cycle of breathing / postural drainage) taught on the ward once or twice every day, even when well." },
        SMOKING,
        VACCINE,
      ]),
      redFlags: ["Coughing up more than a spoonful of blood", "Sputum becoming more or darker again with fever", ...RF_BREATH.slice(0, 1)],
      patientActions: ["Complete the full antibiotic course.", "Collect the sputum culture report and bring it to the Pulmonary Medicine OPD on [ … ]."],
      primaryCareActions: ["Early antibiotics for exacerbations, guided by the last sputum culture.", "Vaccination and airway-clearance adherence."],
      conditionAllSatisfactory: true,
    },
    clerkingFocus:
      "Daily sputum volume and colour at baseline and now; haemoptysis; breathlessness; exacerbations per year; previous sputum organisms (Pseudomonas); cause — past TB, childhood infections, ABPA, immunodeficiency; smoking. Examination: clubbing, coarse crackles, SpO2. Baseline: sputum culture before antibiotics, sputum AFB / CBNAAT, CBC, chest X-ray, HRCT if not done.",
    progressNote:
      "Each day — sputum volume and colour, haemoptysis, breathlessness; temperature; SpO2; antibiotic day and culture result. For discharge — afebrile, sputum reduced, airway clearance taught, antibiotic end-date written.",
  },

  // ---- Interstitial lung disease ----
  {
    key: "ild",
    label: "Interstitial lung disease",
    match: /\bILD\b|interstitial lung|pulmonary fibrosis|\bIPF\b|\bUIP\b|\bNSIP\b|hypersensitivity pneumonitis|fibrotic lung/i,
    scaffold: {
      indication: "Patient was admitted with progressive breathlessness [ / an acute exacerbation ] of interstitial lung disease for evaluation and management.",
      primaryDiagnosis: "Interstitial lung disease — [ IPF / NSIP / hypersensitivity pneumonitis / CTD-ILD / … ] [ with acute exacerbation ]",
      procedure: proc("[ Nil / bronchoscopy with BAL ]", "[ HRCT pattern; PFT (FVC, DLCO); 6-minute walk distance and desaturation; ANA / ENA / RF / anti-CCP; echo for pulmonary hypertension ]"),
      clinicalCourse:
        "Admitted on [ date ] with [ presentation ]. HRCT showed a [ … ] pattern. [ Triggers — infection, pulmonary embolism, heart failure — excluded / treated. ] [ Antifibrotic / steroid / immunosuppressant ] started or continued as below. Saturation [ … ]% on [ room air / … L/min oxygen ] at rest [ and … on exertion ]. Discharged on [ date ].",
      medications: [
        { generic: "Nintedanib / Pirfenidone", dose: "[ … ]", route: "PO", frequency: "[ … ]", duration: "Long term", indication: "if started for progressive fibrosis — dose per liver function and tolerance", status: "new" },
        { generic: "Prednisolone", dose: "[ … ]", route: "PO", frequency: "OD after breakfast", duration: "[ taper as written ]", indication: "if steroid-responsive ILD (HP / CTD-ILD)", status: "new" },
        { generic: "Pantoprazole", strength: "40 mg", route: "PO", frequency: "OD before breakfast", duration: "While on steroid", status: "new" },
      ],
      advice: adv([
        { module: "Activity restrictions", text: "[ Home oxygen at [ … ] L/min at rest / on exertion — do not change the flow on your own. ] Avoid the exposure identified (birds, moulds, dust) completely." },
        { module: "Physiotherapy", text: "Stay active within limits; ask about pulmonary rehabilitation." },
        SMOKING,
        VACCINE,
      ]),
      redFlags: [...RF_BREATH, ...RF_FEVER, "Diarrhoea, or yellow eyes, on the antifibrotic medicine"],
      patientActions: ["Get liver function tested on [ … ] (antifibrotic).", "Attend the Pulmonary Medicine OPD on [ … ] for PFT and a 6-minute walk test."],
      primaryCareActions: ["Monitor oxygen needs and liver function; vaccinate; treat infections early."],
      conditionAllSatisfactory: true,
    },
    clerkingFocus:
      "Breathlessness duration and progression; dry cough; exposures — birds, moulds, cooler, dusts, occupation; drugs (amiodarone, methotrexate, nitrofurantoin); connective-tissue symptoms — joint pain, Raynaud's, rash, dry eyes / mouth, muscle weakness; smoking; family history. Examination: clubbing, fine end-inspiratory crackles, SpO2 at rest and on walking, signs of CTD and pulmonary hypertension. Baseline: HRCT, PFT with DLCO, 6-minute walk, ANA / ENA / RF / anti-CCP / myositis panel as indicated, echo, CBC, renal and liver function.",
    progressNote:
      "Each day — breathlessness; SpO2 at rest and on exertion; oxygen requirement; temperature; results back. For discharge — stable oxygen requirement, home-oxygen plan written, antifibrotic / steroid plan and monitoring tests written.",
  },

  // ---- OSA started on CPAP ----
  {
    key: "osa_cpap",
    label: "Obstructive sleep apnoea — started on CPAP",
    match: /\bOSA\b|\bOSAS\b|obstructive sleep apn|sleep apn|\bCPAP\b|obesity hypoventilation|\bOHS\b|polysomnograph/i,
    scaffold: {
      indication: "Patient was admitted with [ snoring, witnessed apnoeas, daytime sleepiness / hypercapnic respiratory failure ] for evaluation of sleep-disordered breathing and initiation of positive-airway-pressure therapy.",
      primaryDiagnosis: "Obstructive sleep apnoea — [ mild / moderate / severe ], AHI [ … ] / h [ with obesity hypoventilation ]",
      procedure: proc("[ Polysomnography with CPAP titration ]", "[ AHI; lowest saturation; titrated pressure; ABG (bicarbonate, PaCO2); BMI; neck circumference; TSH ]"),
      clinicalCourse:
        "Admitted on [ date ]. Polysomnography showed AHI [ … ] / h with a lowest saturation of [ … ]%. CPAP was titrated to [ … ] cmH2O [ / BiPAP … ] and tolerated with a [ nasal / oronasal ] mask. Mask fitting and machine use were taught to the patient and family. Discharged on [ date ].",
      medications: [
        { generic: "CPAP", dose: "[ … ] cmH2O", route: "Via [ nasal / oronasal ] mask", frequency: "Every night, for the whole sleep, and during daytime naps", duration: "Long term", status: "new" },
      ],
      advice: adv([
        { module: "Medication instructions", text: "Use the CPAP every night for the whole sleep — at least 4 hours a night is the minimum for benefit. Wash the mask daily and the tubing weekly." },
        { module: "Diet", text: "Weight reduction diet; aim for steady weight loss." },
        { module: "Activity restrictions", text: "Do not drive or operate machinery while sleepy. Avoid alcohol and sleeping tablets, especially in the evening. Sleep on the side if possible." },
      ]),
      redFlags: ["Morning headaches, confusion or excessive drowsiness", "Swelling of the feet or breathlessness increasing", "Unable to use the CPAP — mask leak, nose block, discomfort — come back rather than stopping"],
      patientActions: ["Attend the Pulmonary / Sleep OPD in 4–6 weeks with the CPAP machine (usage data) on [ … ]."],
      primaryCareActions: ["Check CPAP adherence, BP, blood sugar and weight; treat nasal blockage."],
      conditionAllSatisfactory: true,
    },
    clerkingFocus:
      "Snoring, witnessed apnoeas, choking at night; daytime sleepiness (Epworth score); morning headache; nocturia; driving and near-misses; alcohol and sedatives; weight trend; hypertension, diabetes, heart failure, hypothyroidism. Examination: BMI, neck circumference, Mallampati, nasal obstruction, tonsils, retrognathia, signs of right heart failure. Baseline: polysomnography, ABG, TSH, blood sugar, echo if right heart failure.",
    progressNote:
      "Each night / day — CPAP hours used, mask leak, comfort; morning sleepiness; SpO2 overnight. For discharge — pressure titrated, mask fitted, patient uses the machine independently, driving advice given.",
  },

  // ---- Pulmonary TB (drug-sensitive) ----
  {
    key: "pulmonary_tb",
    label: "Pulmonary tuberculosis (new / on ATT)",
    match: /\btb\b|tubercul|koch|\bATT\b|anti[- ]?tubercular|\bPTB\b/i,
    scaffold: {
      indication: "Patient was admitted with [ cough / fever / weight loss / haemoptysis ] and [ diagnosed with / known to have ] pulmonary tuberculosis, for [ evaluation and initiation of ATT / management of complication ].",
      primaryDiagnosis: "Pulmonary tuberculosis — [ new / previously treated ], [ microbiologically confirmed (CBNAAT / smear) / clinically diagnosed ], rifampicin [ sensitive / not detected ]",
      procedure: proc("[ Nil / bronchoscopy with BAL / pleural tap ]", "[ sputum smear, CBNAAT (rifampicin resistance), chest X-ray; HIV; blood sugar; liver function ]"),
      clinicalCourse:
        "Admitted on [ date ] with [ presentation ]. Pulmonary TB was diagnosed on [ … ]; rifampicin resistance was [ not detected ]. ATT (FDC, [ … ] kg weight band) was started on [ date ] / continued, and tolerated [ without adverse effects / with … ]. Registered on Nikshay (ID [ … ]) and linked to [ DMC / TU / DOTS centre ]. [ HIV / diabetes status. ] Discharged on [ date ], afebrile and tolerating orals.",
      medications: [M.att, { ...M.pyridoxine, indication: "as per NTEP" }, M.paracetamolSos],
      advice: adv([NTEP_ADHERENCE, COUGH_HYGIENE, { module: "Diet", text: "High-protein, high-calorie diet. No alcohol and no tobacco. Nikshay Poshan Yojana support is paid to the registered bank account." }]),
      redFlags: [
        "Yellow eyes or urine, loss of appetite, persistent vomiting or severe abdominal pain — stop the medicines and come to hospital",
        "Skin rash, itching or blistering",
        "Blurred vision or changed colour vision",
        "Coughing up blood",
        ...RF_BREATH.slice(0, 1),
      ],
      patientActions: [
        "Continue ATT at [ DOTS centre / health facility ] — Nikshay ID [ … ], treatment supporter [ … ].",
        "Give a sputum sample at the end of the intensive phase, on [ … ].",
        "Bring all household contacts for TB screening and, where eligible, preventive treatment.",
        CHEST_OPD,
      ],
      primaryCareActions: [
        "Ensure daily dosing and record adherence on Nikshay.",
        "Check liver function if jaundice or vomiting; screen household contacts; confirm HIV and diabetes status.",
      ],
      conditionAllSatisfactory: true,
    },
    clerkingFocus:
      "Cough duration, sputum, haemoptysis; fever, night sweats, weight loss; past TB — regimen, adherence, outcome; contact history; HIV, diabetes, alcohol, tobacco; liver disease; current drugs. Examination: weight, pallor, nodes, chest findings. Baseline: sputum smear and CBNAAT, chest X-ray, CBC, liver and renal function, HIV, blood sugar, weight for the NTEP band.",
    progressNote:
      "Each day — cough, fever, appetite; temperature; weight; tolerance of ATT — nausea, jaundice, rash; results back. For discharge — ATT tolerated, afebrile, Nikshay registration and DOTS linkage done, treatment supporter identified, sputum follow-up date written down.",
  },

  // ---- Community-acquired pneumonia (most general; last) ----
  {
    key: "cap",
    label: "Community-acquired pneumonia",
    match: /pneumonia|pneumonitis|\bCAP\b|\bLRTI\b|lower respiratory (tract )?infection|consolidation/i,
    scaffold: {
      indication: "Patient was admitted with fever, cough and breathlessness and features of community-acquired pneumonia [ CURB-65 score [ … ] ].",
      primaryDiagnosis: "Community-acquired pneumonia — [ right / left ] [ lobe ] [ — organism: … ]",
      procedure: proc("[ Nil ]", "[ chest X-ray; blood and sputum cultures; sputum AFB / CBNAAT; CBC; CRP; renal function ]"),
      clinicalCourse:
        "Admitted on [ date ] with community-acquired pneumonia (CURB-65 [ … ]). Blood and sputum cultures were sent before antibiotics; treated with IV [ … ] and oxygen as needed. Fever settled by [ … ] and oxygen was weaned. Switched to oral antibiotics on [ date ]. Afebrile for 48 hours, stable on room air at discharge on [ date ].",
      medications: [
        { ...M.amoxClav, duration: "To complete [ 5–7 ] days in total", indication: "or as per culture / allergy" },
        { ...M.azithromycin, indication: "if atypical cover is intended" },
        M.paracetamolSos,
      ],
      advice: adv([
        { module: "Medication instructions", text: "Complete the full course of antibiotics even if feeling better." },
        { module: "Diet", text: "Drink plenty of fluids; normal diet." },
        SMOKING,
        VACCINE,
      ]),
      redFlags: [...RF_BREATH.slice(0, 1), ...RF_FEVER, "Chest pain on breathing that is getting worse", "Confusion or drowsiness"],
      patientActions: ["Complete the antibiotic course.", "Get a chest X-ray on [ … ] (about 6 weeks) if a smoker or over 50, and bring it to the Pulmonary Medicine OPD on [ … ]."],
      primaryCareActions: ["Check that fever and cough are settling at the end of the course; repeat X-ray at 6 weeks where indicated.", "Vaccinate."],
      conditionAllSatisfactory: true,
    },
    clerkingFocus:
      "Fever, cough, sputum, pleuritic pain, breathlessness — onset and duration; confusion; recent hospitalisation or antibiotics; aspiration risk; smoking, alcohol, diabetes, immune suppression; TB exposure or symptoms. Examination: respiratory rate, BP, SpO2, confusion, consolidation signs; CURB-65. Baseline: chest X-ray, CBC, renal function, blood cultures, sputum Gram stain and culture, sputum AFB / CBNAAT, ABG if hypoxic.",
    progressNote:
      "Each day — fever curve; cough, sputum; respiratory rate, SpO2 and oxygen; chest findings; cultures; antibiotic day. For discharge — afebrile 48 hours, stable on room air, tolerating orals, oral step-down prescribed with end-date, follow-up X-ray date where indicated.",
  },
];
