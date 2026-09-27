/**
 * The quick-tap chips offered on the Complaints and Past-history cards of the case-history
 * workspace, one set per specialty.
 *
 * WHY THIS FILE EXISTS. Before this, every unit — surgical, medicine, oncology alike — saw the
 * same surgical-flavoured chips ("Pain abdomen", "Lump", "Bleeding per rectum"), because the
 * oncology and internal-medicine packs only ever added EXTRA cards (onco_disease and friends)
 * on top of that shared set rather than replacing it. A medicine resident admitting a fever
 * ward got no one-tap shortcut for their own casemix and had to type everything the surgical
 * resident got to tap. See docs/specialty-packs.md §2a for the medicine unit's actual casemix,
 * which is what INTERNAL_MEDICINE below is built from.
 *
 * No dependencies — safe to import from the client workspace component the same way
 * lib/case-history-sections.ts is (see that file's own header).
 *
 * Unlike lib/specialty/, which is a server-side module (its SpecialtyPack pulls in discharge
 * templates and scoring keys not meant for the client bundle), this file is pure chip data and
 * lives on its own so the "use client" workspace can import it directly.
 */

// Every department's presenting complaints, in the words a resident writes as the chief
// complaint — worded, where one exists, the way that department's history-check tree is
// triggered (content/history-trees/), so tapping a chip also offers the right history check.
// Order: the ward's commonest admissions first, emergencies near the top, then the rest.

const COMPLAINT_CHIPS_GENERAL_SURGERY = [
  "Pain abdomen",
  "Vomiting",
  "Fever",
  "Abdominal distension",
  "Constipation",
  "Not passing flatus",
  "Jaundice",
  "Lump",
  "Groin swelling",
  "Scrotal swelling",
  "Breast lump",
  "Swelling in front of the neck",
  "Bleeding per rectum",
  "Pain in anus",
  "Vomiting blood",
  "Difficulty swallowing",
  "Loose stools",
  "Burning micturition",
  "Non-healing ulcer",
  "Wound discharge",
  "Injury",
  "Loss of appetite",
  "Loss of weight",
];

// The medicine unit's own casemix, in the order docs/specialty-packs.md §2a gives it: infective
// etiologies first, then blood/immunity, then uncontrolled HTN/diabetes.
const COMPLAINT_CHIPS_INTERNAL_MEDICINE = [
  "Fever",
  "Fever with rash",
  "Breathlessness",
  "Cough",
  "Chest pain",
  "Palpitations",
  "Altered sensorium",
  "Seizures",
  "Weakness of limbs",
  "Headache",
  "Giddiness",
  "Generalised weakness",
  "Loose stools",
  "Vomiting",
  "Vomiting blood",
  "Yellowish discolouration of eyes",
  "Swelling of legs",
  "Decreased urine output",
  "Increased thirst and urination",
  "Joint pain",
  "Coughing blood",
  "Poisoning",
  "Snake bite",
  "Loss of appetite",
  "Loss of weight",
];

// What brings a chemo patient in between cycles — the tumour-specific detail lives on the
// onco_disease/onco_toxicity cards, so these are the presenting-complaint words, not the
// disease itself.
const COMPLAINT_CHIPS_MEDICAL_ONCOLOGY = [
  "Fever",
  "Fever on chemotherapy",
  "Fatigue",
  "Loss of appetite",
  "Loss of weight",
  "Pain",
  "Bone pain",
  "Back pain",
  "Breathlessness",
  "Cough",
  "Coughing blood",
  "Vomiting",
  "Mouth ulcers",
  "Difficulty swallowing",
  "Loose stools",
  "Pain abdomen",
  "Abdominal distension",
  "Swelling of legs",
  "Lump",
  "Breast lump",
  "Bleeding",
  "Weakness of limbs",
  "Due for chemotherapy",
];

// An O&G admission's own presenting words — obstetric emergencies and labour first, then the
// gynaecological complaints. The current pregnancy's own detail (gravida/para, LMP/EDD/POG)
// is captured as free text on the existing "menstrual and obstetric history" card, not here.
const COMPLAINT_CHIPS_OBSTETRICS_GYNAECOLOGY = [
  "Labour pains",
  "Leaking per vaginum",
  "Bleeding per vaginum",
  "Decreased fetal movements",
  "Pain abdomen",
  "Headache / blurring of vision",
  "Swelling of legs",
  "Vomiting in pregnancy",
  "Fever",
  "Burning micturition",
  "Amenorrhoea",
  "Heavy periods",
  "Irregular periods",
  "Postmenopausal bleeding",
  "White discharge per vaginum",
  "Mass per abdomen",
  "Something coming out per vaginum",
  "Lower abdominal pain",
  "Breast lump",
  "Infertility",
];

const COMPLAINT_CHIPS_PULMONARY_MEDICINE = [
  "Breathlessness",
  "Cough",
  "Cough with sputum",
  "Coughing blood",
  "Wheeze",
  "Chest pain",
  "Fever",
  "Breathlessness and dry cough for months",
  "Problem on TB treatment",
  "Snoring",
  "Daytime sleepiness",
  "Swelling of legs",
  "Loss of appetite",
  "Loss of weight",
  "Hoarseness of voice",
  "Altered sensorium",
];

const COMPLAINT_CHIPS_ENT = [
  "Ear discharge",
  "Decreased hearing",
  "Earache",
  "Ringing in the ear",
  "Giddiness",
  "Bleeding from nose",
  "Nasal obstruction",
  "Running nose",
  "Headache / facial pain",
  "Sore throat",
  "Difficulty swallowing",
  "Hoarseness of voice",
  "Noisy breathing",
  "Neck swelling",
  "Foreign body in ear / nose / throat",
  "Snoring",
  "Facial weakness",
  "Fever",
];

const COMPLAINT_CHIPS_PSYCHIATRY = [
  "Low mood",
  "Suicidal thoughts / attempt",
  "Abnormal behaviour",
  "Hearing voices",
  "Suspiciousness",
  "Aggressive behaviour",
  "Decreased sleep",
  "Anxiety",
  "Panic attacks",
  "Repeated thoughts / acts",
  "Alcohol use",
  "Substance use",
  "Forgetfulness",
  "Confusion",
  "Poor self-care",
  "Not eating",
  "Unexplained physical complaints",
  "Overdose",
];

const COMPLAINT_CHIPS_OPHTHALMOLOGY = [
  "Decreased vision",
  "Sudden loss of vision",
  "Red eye",
  "Eye pain",
  "Watering eye",
  "Eye discharge",
  "Itching in the eyes",
  "Double vision",
  "Eyelid swelling",
  "Injury to the eye",
  "Chemical in eye",
  "Foreign body in eye",
  "Floaters / flashes",
  "Glare / haloes",
  "Drooping of eyelid",
  "Squint",
  "Headache",
];

const COMPLAINT_CHIPS_DERMATOLOGY = [
  "Itching",
  "Skin rash",
  "Fever with rash",
  "Blisters on the skin",
  "Redness and scaling of the whole body",
  "White patch on skin",
  "Hypopigmented patch with loss of sensation",
  "Scaly plaques",
  "Hives",
  "Skin ulcer",
  "Mouth ulcers",
  "Hair loss",
  "Nail changes",
  "Genital ulcer",
  "Joint pain",
  "Lump",
  "Drug reaction",
];

const COMPLAINT_CHIPS_BURNS_PLASTIC_SURGERY = [
  "Burns",
  "Scald burns",
  "Electrical burns",
  "Chemical burns",
  "Hand injury",
  "Cut on hand",
  "Crush hand",
  "Degloving injury",
  "Bed sore",
  "Non-healing ulcer",
  "Scar tightening after burn",
  "Keloid / hypertrophic scar",
  "Facial injury",
  "Cleft lip / palate",
  "Lump",
  "Diabetic foot",
];

const COMPLAINT_CHIPS_ORTHOPAEDICS = [
  "Limb injury",
  "Fracture",
  "Cannot bear weight",
  "Deformity after fall",
  "Joint pain",
  "Joint swelling",
  "Low back pain",
  "Neck pain",
  "Radiating pain to leg",
  "Limp",
  "Bone swelling",
  "Discharging sinus",
  "Numbness / tingling",
  "Weakness of limbs",
  "Stiffness of joint",
  "Non-healing wound",
  "Lump",
];

const COMPLAINT_CHIPS_UROLOGY = [
  "Loin pain",
  "Burning micturition",
  "Blood in urine",
  "Difficulty passing urine",
  "Retention of urine",
  "Frequency of urination",
  "Leaking of urine",
  "Decreased urine output",
  "Scrotal swelling",
  "Pain in testis",
  "Groin swelling",
  "Fever with chills",
  "Pain abdomen",
  "Passing stone",
  "Catheter problem",
  "Swelling of penis / foreskin",
  "Erectile dysfunction",
];

const COMPLAINT_CHIPS_NEUROSURGERY = [
  "Head injury",
  "Loss of consciousness",
  "Headache",
  "Vomiting",
  "Seizures",
  "Altered sensorium",
  "Weakness of limbs",
  "Numbness",
  "Spine injury",
  "Neck pain",
  "Low back pain",
  "Bladder / bowel disturbance",
  "Shunt problem",
  "Swelling on back of baby",
  "Large head in a baby",
  "Blurring of vision",
  "Giddiness",
];

const COMPLAINT_CHIPS_PAEDIATRICS = [
  "Fever",
  "Cough",
  "Fast breathing child",
  "Noisy breathing child",
  "Loose stools",
  "Vomiting",
  "Seizures",
  "Baby not feeding",
  "Lethargy",
  "Yellowish discolouration of skin",
  "Rash",
  "Swelling of body",
  "Pain abdomen",
  "Poor weight gain",
  "Pallor",
  "Decreased urine output",
  "Poisoning",
  "Dog bite",
  "Delayed milestones",
];

const COMPLAINT_CHIPS_EMERGENCY_MEDICINE = [
  "Road traffic accident",
  "Fall from height",
  "Assault",
  "Head injury",
  "Burns",
  "Chest pain",
  "Breathlessness",
  "Unconscious / altered sensorium",
  "Seizures",
  "Weakness of one side",
  "Poisoning",
  "Snake bite",
  "Dog bite",
  "Collapse in heat",
  "Vomiting blood",
  "Pain abdomen",
  "Bleeding",
  "Palpitations",
  "Fever",
  "Hanging / drowning",
];

const PAST_CHIPS_GENERAL_SURGERY = [
  "DM",
  "HTN",
  "TB (Koch's)",
  "IHD",
  "Asthma / COPD",
  "Thyroid",
  "Seizure",
  "CKD",
];

// Same comorbidities a surgical fitness check asks about, reordered to what a medicine
// admission actually leans on and with CVA added — a medicine ward carries far more of these.
const PAST_CHIPS_INTERNAL_MEDICINE = [
  "DM",
  "HTN",
  "CAD / IHD",
  "CKD",
  "CLD",
  "Asthma / COPD",
  "CVA / Stroke",
  "Hypothyroid",
  "Seizure disorder",
  "TB (Koch's)",
];

const PAST_CHIPS_MEDICAL_ONCOLOGY = PAST_CHIPS_INTERNAL_MEDICINE;

// The fitness-relevant comorbidities a pregnancy or a gynaecological operation is actually
// weighed against — GDM and a prior PIH/pre-eclampsia lead, because they are the two that
// change how this pregnancy is watched, not just whether the patient is fit for anaesthesia.
const PAST_CHIPS_OBSTETRICS_GYNAECOLOGY = [
  "GDM (previous pregnancy)",
  "PIH / pre-eclampsia (previous pregnancy)",
  "DM",
  "HTN",
  "Hypothyroid",
  "Asthma",
  "Rh negative",
  "Previous LSCS",
  "Anaemia",
];

const COMPLAINT_CHIPS_BY_SPECIALTY: Record<string, string[]> = {
  general_surgery: COMPLAINT_CHIPS_GENERAL_SURGERY,
  internal_medicine: COMPLAINT_CHIPS_INTERNAL_MEDICINE,
  medical_oncology: COMPLAINT_CHIPS_MEDICAL_ONCOLOGY,
  obstetrics_gynaecology: COMPLAINT_CHIPS_OBSTETRICS_GYNAECOLOGY,
  pulmonary_medicine: COMPLAINT_CHIPS_PULMONARY_MEDICINE,
  ent: COMPLAINT_CHIPS_ENT,
  psychiatry: COMPLAINT_CHIPS_PSYCHIATRY,
  ophthalmology: COMPLAINT_CHIPS_OPHTHALMOLOGY,
  dermatology: COMPLAINT_CHIPS_DERMATOLOGY,
  burns_plastic_surgery: COMPLAINT_CHIPS_BURNS_PLASTIC_SURGERY,
  orthopaedics: COMPLAINT_CHIPS_ORTHOPAEDICS,
  urology: COMPLAINT_CHIPS_UROLOGY,
  neurosurgery: COMPLAINT_CHIPS_NEUROSURGERY,
  paediatrics: COMPLAINT_CHIPS_PAEDIATRICS,
  emergency_medicine: COMPLAINT_CHIPS_EMERGENCY_MEDICINE,
};

const PAST_CHIPS_PULMONARY_MEDICINE = [
  "TB (Koch's) — treated",
  "Asthma",
  "COPD",
  "Bronchiectasis",
  "ILD",
  "Previous ICD / tapping",
  "Previous NIV / ventilation",
  "DM",
  "HTN",
  "CAD / IHD",
  "HIV",
];

const PAST_CHIPS_ENT = [
  "Recurrent tonsillitis",
  "Chronic sinusitis",
  "Allergic rhinitis",
  "Previous ear discharge",
  "Hearing aid",
  "Previous ENT surgery",
  "DM",
  "HTN",
  "Bleeding disorder",
  "On blood thinners",
];

const PAST_CHIPS_PSYCHIATRY = [
  "Previous psychiatric illness",
  "Previous admission",
  "Previous self-harm",
  "Alcohol use",
  "Substance use",
  "Seizure disorder",
  "Head injury",
  "Thyroid",
  "DM",
  "HTN",
];

const PAST_CHIPS_OPHTHALMOLOGY = [
  "DM",
  "HTN",
  "Glaucoma",
  "Previous cataract surgery",
  "Previous eye laser",
  "Uses glasses",
  "Previous eye injury",
  "Steroid use",
  "Thyroid",
  "Asthma / COPD",
];

const PAST_CHIPS_DERMATOLOGY = [
  "Psoriasis",
  "Atopic dermatitis / eczema",
  "Asthma / allergic rhinitis",
  "Leprosy — treated",
  "Previous drug reaction",
  "DM",
  "HTN",
  "Thyroid",
  "HIV",
  "Steroid use",
];

const PAST_CHIPS_BURNS_PLASTIC_SURGERY = [
  "DM",
  "HTN",
  "Seizure disorder",
  "Previous burns",
  "Previous grafting / flap",
  "Keloid tendency",
  "Smoker",
  "Asthma / COPD",
  "CKD",
  "Tetanus immunised",
];

const PAST_CHIPS_ORTHOPAEDICS = [
  "DM",
  "HTN",
  "Osteoporosis",
  "Rheumatoid arthritis",
  "Previous fracture",
  "Previous joint replacement / implant",
  "TB (Koch's)",
  "Previous DVT",
  "CKD",
  "Smoker",
];

const PAST_CHIPS_UROLOGY = [
  "Renal / ureteric stones",
  "BPH",
  "Recurrent UTI",
  "Previous catheterisation",
  "Previous urological surgery",
  "DM",
  "HTN",
  "CKD",
  "TB (Koch's)",
  "On blood thinners",
];

const PAST_CHIPS_NEUROSURGERY = [
  "Seizure disorder",
  "Previous head injury",
  "Previous neurosurgery",
  "VP shunt",
  "HTN",
  "DM",
  "Stroke",
  "On blood thinners",
  "Known brain tumour",
  "Alcohol use",
];

const PAST_CHIPS_PAEDIATRICS = [
  "Preterm birth",
  "NICU admission",
  "Previous admissions",
  "Asthma / wheeze",
  "Seizures",
  "Congenital heart disease",
  "Malnutrition",
  "TB contact",
  "Incomplete immunisation",
  "Allergies",
];

const PAST_CHIPS_EMERGENCY_MEDICINE = [
  "DM",
  "HTN",
  "CAD / IHD",
  "Asthma / COPD",
  "Seizure disorder",
  "CKD",
  "Stroke",
  "On blood thinners",
  "Allergies",
  "Pregnant",
];

const PAST_CHIPS_BY_SPECIALTY: Record<string, string[]> = {
  general_surgery: PAST_CHIPS_GENERAL_SURGERY,
  internal_medicine: PAST_CHIPS_INTERNAL_MEDICINE,
  medical_oncology: PAST_CHIPS_MEDICAL_ONCOLOGY,
  obstetrics_gynaecology: PAST_CHIPS_OBSTETRICS_GYNAECOLOGY,
  pulmonary_medicine: PAST_CHIPS_PULMONARY_MEDICINE,
  ent: PAST_CHIPS_ENT,
  psychiatry: PAST_CHIPS_PSYCHIATRY,
  ophthalmology: PAST_CHIPS_OPHTHALMOLOGY,
  dermatology: PAST_CHIPS_DERMATOLOGY,
  burns_plastic_surgery: PAST_CHIPS_BURNS_PLASTIC_SURGERY,
  orthopaedics: PAST_CHIPS_ORTHOPAEDICS,
  urology: PAST_CHIPS_UROLOGY,
  neurosurgery: PAST_CHIPS_NEUROSURGERY,
  paediatrics: PAST_CHIPS_PAEDIATRICS,
  emergency_medicine: PAST_CHIPS_EMERGENCY_MEDICINE,
};

/** Unknown or missing specialty (including "patch not run yet") degrades to the surgical set —
 *  the same "degrade, don't crash" rule lib/specialty/index.ts's getSpecialtyPack() follows. */
export function complaintChipsFor(specialty: string | null | undefined): string[] {
  return COMPLAINT_CHIPS_BY_SPECIALTY[(specialty ?? "").trim()] ?? COMPLAINT_CHIPS_GENERAL_SURGERY;
}

export function pastChipsFor(specialty: string | null | undefined): string[] {
  return PAST_CHIPS_BY_SPECIALTY[(specialty ?? "").trim()] ?? PAST_CHIPS_GENERAL_SURGERY;
}
