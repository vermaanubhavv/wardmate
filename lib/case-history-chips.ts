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

const COMPLAINT_CHIPS_GENERAL_SURGERY = [
  "Pain abdomen",
  "Vomiting",
  "Fever",
  "Jaundice",
  "Lump",
  "Abdominal distension",
  "Constipation",
  "Loose stools",
  "Bleeding per rectum",
  "Burning micturition",
  "Loss of appetite",
  "Loss of weight",
];

// The medicine unit's own casemix, in the order docs/specialty-packs.md §2a gives it: infective
// etiologies first, then blood/immunity, then uncontrolled HTN/diabetes.
const COMPLAINT_CHIPS_INTERNAL_MEDICINE = [
  "Fever",
  "Breathlessness",
  "Cough",
  "Altered sensorium",
  "Generalised weakness",
  "Loose stools",
  "Vomiting",
  "Decreased urine output",
  "Swelling of legs",
  "Yellowish discolouration of eyes",
  "Giddiness",
  "Loss of appetite",
];

// What brings a chemo patient in between cycles — the tumour-specific detail lives on the
// onco_disease/onco_toxicity cards, so these are the presenting-complaint words, not the
// disease itself.
const COMPLAINT_CHIPS_MEDICAL_ONCOLOGY = [
  "Fever",
  "Fatigue",
  "Loss of appetite",
  "Loss of weight",
  "Pain",
  "Breathlessness",
  "Vomiting",
  "Mouth ulcers",
  "Loose stools",
  "Swelling",
  "Lump",
  "Bleeding",
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
  "Amenorrhoea",
  "Vaginal discharge",
  "Mass per abdomen",
  "Postmenopausal bleeding",
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
};

const PAST_CHIPS_BY_SPECIALTY: Record<string, string[]> = {
  general_surgery: PAST_CHIPS_GENERAL_SURGERY,
  internal_medicine: PAST_CHIPS_INTERNAL_MEDICINE,
  medical_oncology: PAST_CHIPS_MEDICAL_ONCOLOGY,
  obstetrics_gynaecology: PAST_CHIPS_OBSTETRICS_GYNAECOLOGY,
};

/** Unknown or missing specialty (including "patch not run yet") degrades to the surgical set —
 *  the same "degrade, don't crash" rule lib/specialty/index.ts's getSpecialtyPack() follows. */
export function complaintChipsFor(specialty: string | null | undefined): string[] {
  return COMPLAINT_CHIPS_BY_SPECIALTY[(specialty ?? "").trim()] ?? COMPLAINT_CHIPS_GENERAL_SURGERY;
}

export function pastChipsFor(specialty: string | null | undefined): string[] {
  return PAST_CHIPS_BY_SPECIALTY[(specialty ?? "").trim()] ?? PAST_CHIPS_GENERAL_SURGERY;
}
