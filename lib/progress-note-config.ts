import type { SpecialtyKey } from "@/lib/specialty/types";

/**
 * What the daily progress note looks like on each department's ward — the exam lines it prints,
 * the chips the note workspace offers, and how the AI compile is told which ward it is on.
 *
 * Only this varies by department. The rest of the sheet is the same everywhere and lives in
 * lib/progress-note.ts: diagnosis/phase line, complaints, sensorium ("OE"), vitals, assessment,
 * issues, plan and medications. Which LAYOUT a ward prints on (ESIC sheet vs SOAP) is a separate,
 * per-ward switch (wards.is_esic_faridabad) and has nothing to do with this file.
 *
 * general_surgery prints P/Abdomen, Wound, Drains / tubes / I-O, Chest and Flatus / Stool — the
 * wound and drain lines were added after a senior-surgeon review against Schwartz 11e (ch. 12, 50),
 * since dictated drain and intake/output observations had no line to print on.
 *
 * Rules every entry follows, the same as every other clinical text in the app: chips are words a
 * resident says, never a dose; an exam line that nobody spoke prints its heading and nothing
 * else; nothing here decides a finding.
 *
 * CLINICAL CONTENT: general_surgery PENDING REVIEW since the wound / drains lines and the chip
 * changes; every other department was read and signed off with the PR that added it.
 */

export type NoteExamSection = {
  /** Card id in the workspace and field name in the AI compile. snake_case, unique per
   *  department, and never one of the shared card ids (see RESERVED_SECTION_IDS). */
  id: string;
  /** Card title in the workspace: "Per abdomen". */
  title: string;
  /** Heading on the printed sheet: "P/Abdomen" prints as "P/Abdomen - …". */
  printLabel: string;
  /** Label the finding is stored under (an `exam` observation). Lowercase. */
  label: string;
  /** Labels a dictated finding may already carry that belong on this line. Lowercase, and
   *  includes `label`. */
  aliases: string[];
  pills: string[];
  placeholder: string;
};

export type ProgressNoteConfig = {
  /** Finishes "an inpatient on …" in the AI compile's instructions. */
  wardPhrase: string;
  /** Progress-sheet shorthand the AI may use on this ward. */
  registerHint: string;
  complaintPills: string[];
  examSections: NoteExamSection[];
  /** Whether the sheet carries the Flatus / Stool line and the workspace its card — a
   *  post-operative abdominal question, kept where the ward operates on or near the gut. */
  bowelLine: boolean;
  planPills: string[];
  /** Vitals card fields this ward charts beyond the shared BP, PR, RR, Temp, SpO₂, GRBS and
   *  ICU. `key` is the label the value is stored under (a `vital` observation) — never one
   *  lib/vital-ranges.ts matchVitalLabel() reads as another vital. Absent: the shared set only. */
  extraVitals?: NoteVitalField[];
  /** The example in the patient page's "Type" box. Absent: the surgical one. */
  bedsideExample?: string;
};

export type NoteVitalField = { key: string; label: string; ph: string; aliases: string[] };

/** Card ids the workspace uses for the lines every department shares. */
export const RESERVED_SECTION_IDS = ["complaints", "sensorium", "vitals", "bowel", "assessment", "plan", "meds", "review"];

// ── Sections shared by several departments ────────────────────────────────────────────────

const ABDOMEN: NoteExamSection = {
  id: "abdomen",
  title: "Per abdomen",
  printLabel: "P/Abdomen",
  label: "per abdomen",
  aliases: ["per abdomen", "abdomen", "p/a", "pa", "abdominal examination"],
  pills: ["Soft", "Non-tender", "Tender", "Guarding", "Distended", "Non-distended", "Bowel sounds present", "Bowel sounds absent"],
  placeholder: "Anything else on the abdomen",
};

const CHEST: NoteExamSection = {
  id: "chest",
  title: "Chest",
  printLabel: "Chest",
  label: "chest",
  aliases: ["chest", "respiratory system", "rs", "lungs", "air entry"],
  pills: ["Clear", "NVBS", "B/L air entry equal", "Added sounds", "Decreased air entry"],
  placeholder: "Anything else on the chest",
};

const CVS: NoteExamSection = {
  id: "cvs",
  title: "Cardiovascular",
  printLabel: "CVS",
  label: "cvs",
  aliases: ["cvs", "cardiovascular system", "cardiovascular", "heart", "s1 s2", "s1s2"],
  pills: ["S1 S2 heard", "No murmur", "Murmur", "Gallop", "Raised JVP", "Pedal oedema", "Peripheries warm", "Peripheries cold"],
  placeholder: "Anything else on the heart and circulation",
};

// The neurological examination beyond the OE / sensorium line. Labelled "nervous system" — not
// "cns", which lib/progress-note.ts already reads as the OE line — so a finding prints once.
const CNS: NoteExamSection = {
  id: "nervous_system",
  title: "Nervous system",
  printLabel: "CNS",
  label: "nervous system",
  aliases: ["nervous system", "cns examination", "power", "tone", "reflexes", "plantars", "plantar", "neck stiffness", "meningeal signs"],
  pills: [
    "Moving all four limbs", "Weakness", "Tone normal", "Tone increased", "Tone decreased",
    "Reflexes normal", "Reflexes brisk", "Reflexes diminished",
    "Plantars flexor", "Plantar extensor", "No neck stiffness", "Neck stiffness",
  ],
  placeholder: "Power as graded in each limb, and anything else found; GCS goes on the Vitals card",
};

const WOUND: NoteExamSection = {
  id: "wound",
  title: "Wound / dressing",
  printLabel: "Wound",
  label: "wound",
  aliases: ["wound", "dressing", "suture line", "incision", "local wound", "surgical site"],
  pills: ["Healthy", "Dry", "Soakage", "Serous discharge", "Pus discharge", "Erythema", "Gaping", "Sutures intact"],
  placeholder: "Anything else on the wound",
};

const MEDICINE_COMPLAINTS = [
  "No fresh complaints",
  "Fever",
  "Breathlessness",
  "Cough",
  "Chest pain",
  "Vomiting",
  "Loose stools",
  "Poor oral intake",
  "Decreased urine output",
  "Giddiness",
  "Headache",
  "Pain",
];

const MEDICINE_PLAN = [
  "Continue same treatment",
  "Step down antibiotics",
  "Switch to oral medicines",
  "Stop IV fluids",
  "Repeat CBC",
  "Repeat RFT / electrolytes",
  "Repeat LFT",
  "Blood culture",
  "Chest X-ray",
  "ECG",
  "Monitor input / output",
  "Physician / cross-consult",
  "Plan for discharge",
  "Refer",
];

// ── Per department ────────────────────────────────────────────────────────────────────────

// A unit with no department: the systemic exam lines and the decisions any ward round makes.
const GENERAL: ProgressNoteConfig = {
  wardPhrase: "a hospital ward",
  registerHint: "S1 S2 +, NVBS, B/L air entry equal, P/A soft, NT, conscious and oriented",
  complaintPills: MEDICINE_COMPLAINTS,
  examSections: [CHEST, CVS, ABDOMEN, CNS],
  bowelLine: false,
  planPills: [
    "Continue same treatment",
    "Step down antibiotics",
    "Switch to oral medicines",
    "Stop IV fluids",
    "Repeat CBC",
    "Repeat RFT / electrolytes",
    "Monitor input / output",
    "Cross-consult",
    "Plan for discharge",
    "Refer",
  ],
  bedsideExample: "Day 3, afebrile, BP 120/80, plan repeat RFT…",
};

const GENERAL_SURGERY: ProgressNoteConfig = {
  wardPhrase: "a general-surgery ward",
  registerHint:
    "P/A soft, NT, ND, BS+; wound healthy; drain output and character as said; Ryle's aspirate as said; UO as said; NVBS, B/L air entry equal",
  complaintPills: [
    "No fresh complaints",
    "Pain",
    "Nausea",
    "Vomiting",
    "Fever",
    "Abdominal distension",
    "Not tolerating orals",
    "Wound discharge",
    "Unable to pass urine",
    "Cough",
    "Breathlessness",
    "Calf pain",
    "Giddiness",
  ],
  // A surgical round is about the wound and every tube in the patient, so both get a line of
  // their own (Schwartz 11e ch. 12 and 50). Dictation already extracts `drain` and
  // `intake_output` observations; without this line they never reached the printed note.
  examSections: [
    ABDOMEN,
    { ...WOUND, pills: [...WOUND.pills, "Induration", "Staples intact", "Port sites healthy"] },
    {
      id: "drains",
      title: "Drains, tubes & output",
      printLabel: "Drains / tubes / I-O",
      label: "drains",
      // ponytail: one line, first match prints; several dictated tubes under different labels show
      // only one. The card is where all of them get written.
      aliases: [
        "drains", "drain", "drain output", "abdominal drain", "pelvic drain", "subhepatic drain",
        "ryle's tube", "ryles tube", "ryle's tube output", "rt aspirate", "rt output", "nasogastric tube", "ng output",
        "catheter", "foley", "urine output", "stoma", "stoma output",
        "intake output", "intake / output", "input / output", "i/o",
      ],
      pills: [
        "No drain", "Drain serous", "Drain serosanguinous", "Drain haemorrhagic", "Drain bilious", "Drain feculent", "Drain removed",
        "Ryle's aspirate clear", "Ryle's aspirate bilious", "Ryle's removed",
        "Catheter draining clear", "Catheter removed", "Voiding well",
        "Stoma pink, functioning", "Stoma dusky",
      ],
      placeholder: "Each drain / tube: output in ml and character; urine output; intake / output, as measured",
    },
    CHEST,
  ],
  bowelLine: true,
  // The decisions a surgical round actually makes: the diet ladder, tubes out, mobilisation,
  // chest, wound, stoma, thromboprophylaxis and antibiotics (Schwartz 11e ch. 6, 12, 50).
  planPills: [
    "Continue same treatment",
    "NBM",
    "Sips",
    "Liquids",
    "Soft diet",
    "Normal diet",
    "Stop IV fluids",
    "Clamp Ryle's tube",
    "Remove Ryle's tube",
    "Remove catheter",
    "Remove drain",
    "Mobilise out of bed",
    "Incentive spirometry / chest physio",
    "Dressing change",
    "Suture / staple removal",
    "Stoma care / teaching",
    "DVT prophylaxis review",
    "Step down antibiotics",
    "Stop antibiotics",
    "Culture report follow-up",
    "Repeat CBC",
    "Repeat RFT / electrolytes",
    "PAC / consent",
    "Plan for discharge",
    "Refer",
  ],
};

const INTERNAL_MEDICINE: ProgressNoteConfig = {
  wardPhrase: "an internal-medicine ward",
  registerHint: "S1 S2 +, no murmur, NVBS, B/L air entry equal, crepts, P/A soft, NT",
  complaintPills: MEDICINE_COMPLAINTS,
  examSections: [CVS, CHEST, ABDOMEN, CNS],
  bowelLine: false,
  planPills: MEDICINE_PLAN,
  // Neither label is a vital lib/vital-ranges.ts knows, so neither is flagged against a range;
  // "urine output" and "GCS" are the labels a photographed chart is read under (read-lab-photo).
  extraVitals: [
    {
      key: "Urine output",
      label: "Urine output / I-O",
      ph: "e.g. 1.2 L / 24 h",
      aliases: ["urine output", "uo", "intake output", "intake / output", "input / output", "i/o", "i-o"],
    },
    { key: "GCS", label: "GCS", ph: "E_V_M_", aliases: ["gcs", "glasgow coma scale"] },
  ],
  bedsideExample: "Day 3, afebrile, BP 120/80, plan repeat RFT…",
};

const MEDICAL_ONCOLOGY: ProgressNoteConfig = {
  wardPhrase: "a medical-oncology ward",
  registerHint: "NVBS, P/A soft, NT, oral mucositis grade as said, PICC / port site healthy",
  complaintPills: [
    "No fresh complaints",
    "Fever",
    "Nausea",
    "Vomiting",
    "Mouth ulcers",
    "Loose stools",
    "Bleeding",
    "Pain",
    "Fatigue",
    "Breathlessness",
    "Poor oral intake",
  ],
  examSections: [
    {
      id: "oral_cavity",
      title: "Oral cavity",
      printLabel: "Oral cavity",
      label: "oral cavity",
      aliases: ["oral cavity", "mouth", "mucositis", "oral mucosa"],
      pills: ["Healthy", "Mucositis", "Oral thrush", "Ulcers", "Bleeding gums"],
      placeholder: "Mucositis grade or anything else in the mouth",
    },
    CHEST,
    ABDOMEN,
    {
      id: "line_site",
      title: "Line / port site",
      printLabel: "Line / port",
      label: "line site",
      aliases: ["line site", "port site", "picc", "picc site", "central line", "chemoport", "port"],
      pills: ["Healthy", "Erythema", "Tender", "Discharge", "Blocked", "No line"],
      placeholder: "Anything else on the line or port",
    },
  ],
  bowelLine: false,
  planPills: [
    "Continue same treatment",
    "Next cycle as planned",
    "Hold chemotherapy",
    "Repeat CBC",
    "Repeat RFT / electrolytes",
    "Repeat LFT",
    "Blood culture",
    "Transfuse as per plan",
    "Mouth care",
    "Pain review",
    "Palliative care review",
    "Plan for discharge",
    "Refer",
  ],
};

const OBSTETRICS_GYNAECOLOGY: ProgressNoteConfig = {
  wardPhrase: "an obstetrics and gynaecology ward",
  registerHint: "P/A soft, uterus well contracted, FHS +, lochia normal, suture line healthy, POD / PND as said",
  complaintPills: [
    "No fresh complaints",
    "Pain abdomen",
    "Bleeding PV",
    "Leaking PV",
    "Reduced fetal movements",
    "Headache",
    "Blurring of vision",
    "Fever",
    "Vomiting",
    "Burning micturition",
    "Breast pain",
    "Not passed flatus",
  ],
  examSections: [
    {
      ...ABDOMEN,
      pills: ["Soft", "Tender", "Uterus well contracted", "Uterus boggy", "Fundal height as dates", "FHS present", "Contractions present", "Distended"],
      placeholder: "Uterus, fundal height, FHS, anything else on the abdomen",
    },
    {
      id: "pv",
      title: "Bleeding / lochia",
      printLabel: "PV / Lochia",
      label: "lochia",
      aliases: ["lochia", "pv", "bleeding pv", "per vaginum", "per vaginal"],
      pills: ["Lochia normal", "Lochia excessive", "Foul-smelling lochia", "No bleeding PV", "Spotting", "Leaking PV"],
      placeholder: "Anything else per vaginum",
    },
    {
      ...WOUND,
      title: "Wound / episiotomy",
      printLabel: "Wound / episiotomy",
      aliases: [...WOUND.aliases, "episiotomy", "perineum", "perineal wound"],
    },
    {
      id: "breasts",
      title: "Breasts",
      printLabel: "Breasts",
      label: "breasts",
      aliases: ["breasts", "breast"],
      pills: ["Soft", "Engorged", "Tender", "Cracked nipple", "Feeding well"],
      placeholder: "Anything else on the breasts or feeding",
    },
  ],
  bowelLine: true,
  planPills: [
    "Continue same treatment",
    "Start orals",
    "Remove catheter",
    "Ambulate",
    "BP charting",
    "Repeat CBC",
    "Repeat Hb",
    "Fetal monitoring / NST",
    "Obstetric USG",
    "Breastfeeding support",
    "Suture removal",
    "Plan for discharge",
    "Refer",
  ],
};

const PULMONARY_MEDICINE: ProgressNoteConfig = {
  wardPhrase: "a pulmonary-medicine (chest) ward",
  registerHint: "NVBS, B/L air entry equal, crepts, wheeze, ICD column moving, SpO₂ on the device said",
  complaintPills: [
    "No fresh complaints",
    "Breathlessness",
    "Cough",
    "Sputum",
    "Blood in sputum",
    "Chest pain",
    "Fever",
    "Wheeze",
    "Poor sleep",
    "Poor oral intake",
  ],
  examSections: [
    {
      ...CHEST,
      pills: ["NVBS", "B/L air entry equal", "Decreased air entry", "Crepts", "Wheeze", "Bronchial breathing", "Pleural rub"],
    },
    {
      id: "oxygen",
      title: "Oxygen / support",
      printLabel: "O₂ / support",
      label: "oxygen support",
      aliases: ["oxygen support", "oxygen", "o2", "o2 support", "niv", "bipap", "hfnc"],
      pills: ["Room air", "Nasal prongs", "Face mask", "NRBM", "NIV / BiPAP", "HFNC", "Weaned off oxygen"],
      placeholder: "Device and flow as said",
    },
    {
      id: "drain",
      title: "Chest drain (ICD)",
      printLabel: "ICD",
      label: "icd",
      aliases: ["icd", "chest drain", "intercostal drain", "drain"],
      pills: ["Column moving", "Column not moving", "Air leak present", "No air leak", "Clamped", "Removed", "No drain"],
      placeholder: "Output and anything else on the drain",
    },
    CVS,
  ],
  bowelLine: false,
  planPills: [
    "Continue same treatment",
    "Nebulisation",
    "Wean oxygen",
    "Chest physiotherapy",
    "Incentive spirometry",
    "Sputum AFB / CBNAAT",
    "Sputum culture",
    "Repeat ABG",
    "Repeat chest X-ray",
    "Clamp ICD",
    "Remove ICD",
    "Plan for discharge",
    "Refer",
  ],
};

const ENT: ProgressNoteConfig = {
  wardPhrase: "an ENT (otorhinolaryngology) ward",
  registerHint: "pack in situ, no active bleed, graft uptake as said, tonsillar fossae healthy, stoma patent",
  complaintPills: [
    "No fresh complaints",
    "Pain",
    "Bleeding",
    "Ear discharge",
    "Nasal block",
    "Painful swallowing",
    "Change in voice",
    "Breathing difficulty",
    "Giddiness",
    "Fever",
  ],
  examSections: [
    {
      id: "ear",
      title: "Ear",
      printLabel: "Ear",
      label: "ear",
      aliases: ["ear", "ears", "otoscopy", "right ear", "left ear"],
      pills: ["Dressing dry", "Pack in situ", "Discharge", "No discharge", "Graft in place", "Canal clear"],
      placeholder: "Which ear, and anything else",
    },
    {
      id: "nose",
      title: "Nose",
      printLabel: "Nose",
      label: "nose",
      aliases: ["nose", "nasal", "anterior rhinoscopy", "nasal cavity"],
      pills: ["Pack in situ", "Pack removed", "No active bleed", "Oozing", "Crusting", "Patent"],
      placeholder: "Anything else on the nose",
    },
    {
      id: "throat",
      title: "Throat / oral cavity",
      printLabel: "Throat",
      label: "throat",
      aliases: ["throat", "oropharynx", "oral cavity", "tonsillar fossa", "tonsillar fossae"],
      pills: ["Fossae healthy", "Slough", "Clot", "Active bleed", "Swallowing well"],
      placeholder: "Anything else in the throat",
    },
    {
      id: "neck",
      title: "Neck / stoma / wound",
      printLabel: "Neck / stoma",
      label: "neck",
      aliases: ["neck", "stoma", "tracheostomy", "neck wound"],
      pills: ["Wound healthy", "Stoma patent", "Tube in situ", "Secretions", "Surgical emphysema", "Drain in situ"],
      placeholder: "Anything else on the neck, stoma or wound",
    },
  ],
  bowelLine: false,
  planPills: [
    "Continue same treatment",
    "Remove pack",
    "Start soft diet",
    "Saline nasal wash",
    "Steam inhalation",
    "Tracheostomy care",
    "Change tracheostomy tube",
    "Decannulation trial",
    "Suture removal",
    "Audiometry",
    "Plan for discharge",
    "Refer",
  ],
};

const PSYCHIATRY: ProgressNoteConfig = {
  wardPhrase: "a psychiatry ward",
  registerHint: "MSE in short phrases — appearance, behaviour, mood, affect, thought, perception, insight — as said",
  complaintPills: [
    "No fresh complaints",
    "Poor sleep",
    "Low mood",
    "Anxious",
    "Irritable",
    "Hearing voices",
    "Suspicious",
    "Aggressive",
    "Not eating",
    "Craving",
    "Side effects",
  ],
  examSections: [
    {
      id: "behaviour",
      title: "Appearance & behaviour",
      printLabel: "Appearance / behaviour",
      label: "behaviour",
      aliases: ["behaviour", "behavior", "appearance", "appearance and behaviour", "psychomotor"],
      pills: ["Kempt", "Unkempt", "Calm", "Cooperative", "Restless", "Agitated", "Withdrawn", "Eye contact maintained"],
      placeholder: "Anything else on appearance and behaviour",
    },
    {
      id: "mood",
      title: "Mood & affect",
      printLabel: "Mood / affect",
      label: "mood",
      aliases: ["mood", "affect", "mood and affect"],
      pills: ["Euthymic", "Low", "Anxious", "Irritable", "Elevated", "Blunted affect", "Restricted affect", "Reactive"],
      placeholder: "The patient's own word for the mood, and the affect",
    },
    {
      id: "thought",
      title: "Thought & perception",
      printLabel: "Thought / perception",
      label: "thought",
      aliases: ["thought", "thought content", "perception", "hallucinations", "delusions"],
      pills: ["No delusions elicited", "Delusions present", "Hallucinations present", "No hallucinations", "Preoccupied", "Thought disorder"],
      placeholder: "Anything else on thought or perception",
    },
    {
      id: "risk",
      title: "Risk",
      printLabel: "Risk",
      label: "risk",
      aliases: ["risk", "suicide risk", "self harm", "harm to others", "risk assessment"],
      pills: ["No suicidal ideas", "Suicidal ideas", "Self-harm", "Harm to others", "Absconding risk"],
      placeholder: "What was asked about risk today, and the answer",
    },
    {
      id: "insight",
      title: "Insight",
      printLabel: "Insight",
      label: "insight",
      aliases: ["insight", "judgement", "judgment"],
      pills: ["Present", "Partial", "Absent"],
      placeholder: "Anything else on insight or judgement",
    },
  ],
  bowelLine: false,
  planPills: [
    "Continue same treatment",
    "Review medicines",
    "Watch for side effects",
    "Close observation",
    "Suicide precautions",
    "Withdrawal charting (CIWA)",
    "Psychotherapy session",
    "Family session",
    "Psychoeducation",
    "Repeat LFT",
    "Plan for discharge",
    "Refer",
  ],
};

const OPHTHALMOLOGY: ProgressNoteConfig = {
  wardPhrase: "an ophthalmology (eye) ward",
  registerHint: "VA as said, lids NAD, conj congested, cornea clear / oedema, AC formed and quiet, IOL in bag, IOP as said",
  complaintPills: [
    "No fresh complaints",
    "Pain in the eye",
    "Watering",
    "Redness",
    "Blurred vision",
    "Discomfort in light",
    "Discharge",
    "Headache",
    "Vomiting",
  ],
  examSections: [
    {
      id: "visual_acuity",
      title: "Visual acuity",
      printLabel: "VA",
      label: "visual acuity",
      aliases: ["visual acuity", "va", "vision"],
      pills: ["Improved", "Same as before", "Reduced"],
      placeholder: "Right eye / left eye, as tested",
    },
    {
      id: "right_eye",
      title: "Right eye",
      printLabel: "RE",
      label: "right eye",
      aliases: ["right eye", "re", "od"],
      pills: ["Lids normal", "Conjunctiva congested", "Cornea clear", "Corneal oedema", "AC formed and quiet", "IOL in place", "Pupil reacting", "Dressing in place"],
      placeholder: "Anything else on the right eye",
    },
    {
      id: "left_eye",
      title: "Left eye",
      printLabel: "LE",
      label: "left eye",
      aliases: ["left eye", "le", "os"],
      pills: ["Lids normal", "Conjunctiva congested", "Cornea clear", "Corneal oedema", "AC formed and quiet", "IOL in place", "Pupil reacting", "Dressing in place"],
      placeholder: "Anything else on the left eye",
    },
    {
      id: "iop",
      title: "Intraocular pressure",
      printLabel: "IOP",
      label: "iop",
      aliases: ["iop", "intraocular pressure", "tension"],
      pills: ["Digitally normal", "Digitally raised"],
      placeholder: "Right eye / left eye, as measured",
    },
  ],
  bowelLine: false,
  planPills: [
    "Continue same drops",
    "Remove dressing",
    "Start drops as charted",
    "Taper drops",
    "Check IOP",
    "Fundus examination",
    "Refraction",
    "Suture removal",
    "Protective shield at night",
    "Plan for discharge",
    "Refer",
  ],
};

const DERMATOLOGY: ProgressNoteConfig = {
  wardPhrase: "a dermatology ward",
  registerHint: "lesions as described — new lesions, crusting, epithelialisation, % BSA as said; mucosae as said",
  complaintPills: [
    "No fresh complaints",
    "Itching",
    "New lesions",
    "Burning of skin",
    "Pain",
    "Fever",
    "Difficulty eating",
    "Eye discomfort",
    "Painful urination",
    "Chills",
  ],
  examSections: [
    {
      id: "skin",
      title: "Skin lesions",
      printLabel: "Skin",
      label: "skin",
      aliases: ["skin", "skin lesions", "lesions", "cutaneous", "local examination"],
      pills: ["No new lesions", "New lesions", "Crusting", "Healing", "Epithelialising", "Erosions", "Oozing", "Scaling", "Secondary infection"],
      placeholder: "Sites, extent (BSA) and anything else on the skin",
    },
    {
      id: "mucosa",
      title: "Mucosae",
      printLabel: "Mucosae",
      label: "mucosa",
      aliases: ["mucosa", "mucosae", "oral mucosa", "eyes", "genital mucosa", "mucosal"],
      pills: ["Oral healthy", "Oral erosions", "Conjunctival congestion", "Genital erosions", "Healing"],
      placeholder: "Oral, eye and genital mucosa",
    },
    CHEST,
  ],
  bowelLine: false,
  planPills: [
    "Continue same treatment",
    "Barrier nursing",
    "Wet compresses",
    "Emollients",
    "Mouth care",
    "Eye care / ophthalmology review",
    "Skin swab culture",
    "Repeat CBC",
    "Repeat LFT / RFT",
    "Skin biopsy",
    "Plan for discharge",
    "Refer",
  ],
};

const BURNS_PLASTIC_SURGERY: ProgressNoteConfig = {
  wardPhrase: "a burns and plastic-surgery ward",
  registerHint: "wound as described — slough, granulation, graft take %, donor site; urine output as said",
  complaintPills: [
    "No fresh complaints",
    "Pain",
    "Fever",
    "Itching",
    "Not tolerating orals",
    "Vomiting",
    "Breathlessness",
    "Decreased urine output",
    "Poor sleep",
  ],
  examSections: [
    {
      id: "burn_wound",
      title: "Burn wound / dressing",
      printLabel: "Burn wound",
      label: "burn wound",
      aliases: ["burn wound", "wound", "dressing", "burn", "raw area"],
      pills: ["Healthy", "Slough", "Granulating", "Epithelialising", "Discharge", "Foul smell", "Eschar", "Cellulitis"],
      placeholder: "Sites and anything else on the wound",
    },
    {
      id: "graft",
      title: "Graft / flap / donor site",
      printLabel: "Graft / donor",
      label: "graft",
      aliases: ["graft", "graft site", "flap", "donor site", "graft take"],
      pills: ["Graft take good", "Graft loss", "Flap healthy", "Flap congested", "Donor site healthy", "Donor site soaked", "No graft"],
      placeholder: "Take, flap colour and donor site as seen",
    },
    {
      id: "perfusion",
      title: "Limb circulation",
      printLabel: "Distal circulation",
      label: "distal circulation",
      aliases: ["distal circulation", "perfusion", "limb circulation", "distal pulses", "capillary refill"],
      pills: ["Warm", "Cold", "Pulses felt", "Pulses not felt", "CRT normal", "Tense limb"],
      placeholder: "Which limb, and anything else",
    },
    CHEST,
  ],
  bowelLine: false,
  planPills: [
    "Continue same treatment",
    "Dressing change",
    "Wound swab culture",
    "Fluid charting",
    "Monitor urine output",
    "High-protein diet",
    "Physiotherapy / splinting",
    "Repeat CBC",
    "Repeat albumin / electrolytes",
    "Posted for debridement",
    "Posted for grafting",
    "Plan for discharge",
    "Refer",
  ],
};

const ORTHOPAEDICS: ProgressNoteConfig = {
  wardPhrase: "an orthopaedics ward",
  registerHint: "limb elevated, DNVD intact, cast / slab intact, wound healthy, SLR / active toe movements as said",
  complaintPills: [
    "No fresh complaints",
    "Pain",
    "Swelling",
    "Numbness / tingling",
    "Fever",
    "Wound discharge",
    "Unable to move toes / fingers",
    "Calf pain",
    "Breathlessness",
  ],
  examSections: [
    {
      id: "local_limb",
      title: "Local examination",
      printLabel: "Local",
      label: "local examination",
      aliases: ["local examination", "local", "limb", "affected limb", "local exam"],
      pills: ["Swelling reduced", "Swelling increased", "Tender", "Limb elevated", "Deformity", "Tense compartment"],
      placeholder: "Which limb, and anything else on it",
    },
    {
      id: "neurovascular",
      title: "Distal neurovascular status",
      printLabel: "DNVS",
      label: "distal neurovascular status",
      aliases: ["distal neurovascular status", "dnvs", "dnvd", "neurovascular", "distal pulses", "distal sensation"],
      pills: ["Intact", "Pulses felt", "Pulses not felt", "Sensation intact", "Sensation reduced", "Active toe movements", "Active finger movements"],
      placeholder: "Anything else on distal pulses, sensation and movement",
    },
    {
      ...WOUND,
      pills: [...WOUND.pills, "Pin sites healthy", "Pin site discharge"],
    },
    {
      id: "cast",
      title: "Cast / slab / traction",
      printLabel: "Cast / traction",
      label: "cast",
      aliases: ["cast", "slab", "pop", "traction", "splint", "brace", "fixator"],
      pills: ["Intact", "Tight", "Loose", "Soaked", "Traction in place", "No cast"],
      placeholder: "Anything else on the cast, slab or traction",
    },
  ],
  bowelLine: false,
  planPills: [
    "Continue same treatment",
    "Limb elevation",
    "Active toe / finger movements",
    "Static quadriceps exercises",
    "Physiotherapy",
    "Mobilise with walker",
    "Non-weight bearing",
    "Check X-ray",
    "Dressing change",
    "Suture removal",
    "DVT prophylaxis review",
    "Plan for discharge",
    "Refer",
  ],
};

const UROLOGY: ProgressNoteConfig = {
  wardPhrase: "a urology ward",
  registerHint: "P/A soft, catheter in situ draining clear / haematuria, CBI running, drain output as said, stent as said",
  complaintPills: [
    "No fresh complaints",
    "Pain",
    "Blood in urine",
    "Clots",
    "Burning micturition",
    "Leak around catheter",
    "Fever",
    "Vomiting",
    "Not passed flatus",
    "Unable to pass urine",
  ],
  examSections: [
    ABDOMEN,
    {
      id: "catheter",
      title: "Catheter / urine",
      printLabel: "Catheter / urine",
      label: "catheter",
      aliases: ["catheter", "urine", "foley", "catheter drainage", "cbi", "urine colour", "urine output"],
      pills: ["Draining clear", "Haematuria", "Clots", "CBI running", "Blocked", "Removed", "Voiding well"],
      placeholder: "Colour, output and anything else",
    },
    {
      id: "drain",
      title: "Drain",
      printLabel: "Drain",
      label: "drain",
      aliases: ["drain", "drain output", "pcn", "nephrostomy", "abdominal drain"],
      pills: ["Minimal output", "Serous", "Haemorrhagic", "Urinous", "Removed", "No drain"],
      placeholder: "Output and anything else on the drain",
    },
    {
      ...WOUND,
      title: "Wound / external genitalia",
      printLabel: "Wound / genitalia",
      aliases: [...WOUND.aliases, "external genitalia", "scrotum", "meatus"],
      pills: [...WOUND.pills, "Scrotal swelling"],
    },
  ],
  bowelLine: true,
  planPills: [
    "Continue same treatment",
    "Continue CBI",
    "Stop CBI",
    "Remove catheter",
    "Trial void",
    "Remove drain",
    "Start orals",
    "Ambulate",
    "Repeat RFT",
    "Urine culture",
    "KUB X-ray / USG",
    "Plan for discharge",
    "Refer",
  ],
};

const NEUROSURGERY: ProgressNoteConfig = {
  wardPhrase: "a neurosurgery ward",
  registerHint: "GCS E_V_M_ as said, pupils B/L NSRL, power as graded when said, wound healthy, drain output as said",
  complaintPills: [
    "No fresh complaints",
    "Headache",
    "Vomiting",
    "Seizure",
    "Drowsy",
    "Weakness",
    "Numbness",
    "Fever",
    "Wound discharge",
    "Neck stiffness",
  ],
  examSections: [
    {
      id: "pupils",
      title: "Pupils",
      printLabel: "Pupils",
      label: "pupils",
      aliases: ["pupils", "pupil", "pupillary reaction"],
      pills: ["B/L NSRL", "Unequal", "Sluggish", "Fixed dilated"],
      placeholder: "Size and reaction, each side",
    },
    {
      id: "motor",
      title: "Motor / sensory",
      printLabel: "Motor / sensory",
      label: "motor",
      aliases: ["motor", "power", "limbs", "motor examination", "sensory", "sensation"],
      pills: ["Moving all four limbs", "Weakness", "Power improved", "Power worse", "Sensation intact", "Sensory level"],
      placeholder: "Which limbs and power as graded",
    },
    {
      ...WOUND,
      title: "Wound / drain",
      printLabel: "Wound / drain",
      aliases: [...WOUND.aliases, "drain", "evd", "subgaleal drain", "csf leak"],
      pills: [...WOUND.pills, "Drain in situ", "CSF leak", "Bulging flap"],
    },
    CHEST,
  ],
  bowelLine: false,
  planPills: [
    "Continue same treatment",
    "GCS / pupil charting",
    "Head end elevation",
    "Seizure precautions",
    "Repeat CT head",
    "Remove drain",
    "Physiotherapy",
    "Bladder care",
    "Pressure-area care",
    "Suture removal",
    "Plan for discharge",
    "Refer",
  ],
};

const PAEDIATRICS: ProgressNoteConfig = {
  wardPhrase: "a paediatrics ward",
  registerHint: "active / lethargic, feeding well, no chest indrawing, NVBS, P/A soft, CFT < 3 s as said, weight as said",
  complaintPills: [
    "No fresh complaints",
    "Fever",
    "Cough",
    "Fast breathing",
    "Vomiting",
    "Loose stools",
    "Not feeding well",
    "Seizure",
    "Irritable",
    "Rash",
    "Decreased urine output",
  ],
  examSections: [
    {
      id: "hydration",
      title: "Hydration / feeding",
      printLabel: "Hydration / feeds",
      label: "hydration",
      aliases: ["hydration", "feeding", "feeds", "dehydration", "hydration status"],
      pills: ["Feeding well", "Poor feeding", "Well hydrated", "Some dehydration", "Sunken eyes", "Skin pinch slow", "Passing urine"],
      placeholder: "Anything else on feeds and hydration",
    },
    {
      ...CHEST,
      pills: ["Clear", "NVBS", "B/L air entry equal", "Chest indrawing", "Crepts", "Wheeze", "Nasal flaring"],
    },
    ABDOMEN,
    CVS,
  ],
  bowelLine: false,
  planPills: [
    "Continue same treatment",
    "Continue feeds",
    "Increase feeds",
    "Stop IV fluids",
    "ORS",
    "Nebulisation",
    "Wean oxygen",
    "Tepid sponging",
    "Daily weight",
    "Repeat CBC",
    "Repeat electrolytes",
    "Plan for discharge",
    "Refer",
  ],
};

const EMERGENCY_MEDICINE: ProgressNoteConfig = {
  wardPhrase: "an emergency department / emergency ward",
  registerHint: "airway patent, NVBS, S1 S2 +, P/A soft, GCS as said, FAST as said",
  complaintPills: [
    "No fresh complaints",
    "Pain",
    "Breathlessness",
    "Chest pain",
    "Vomiting",
    "Bleeding",
    "Seizure",
    "Drowsy",
    "Fever",
    "Decreased urine output",
  ],
  examSections: [
    {
      id: "airway",
      title: "Airway",
      printLabel: "Airway",
      label: "airway",
      aliases: ["airway", "airway status"],
      pills: ["Patent", "Maintaining own airway", "Airway adjunct", "Intubated", "Stridor"],
      placeholder: "Anything else on the airway",
    },
    CHEST,
    CVS,
    ABDOMEN,
  ],
  bowelLine: false,
  planPills: [
    "Continue same treatment",
    "Monitor vitals hourly",
    "Repeat ABG",
    "Repeat ECG",
    "Repeat bedside USG / FAST",
    "Stop IV fluids",
    "CT as per plan",
    "Specialty consult",
    "Shift to ward",
    "Shift to ICU",
    "Plan for discharge",
    "Refer",
  ],
};

export const PROGRESS_NOTE_CONFIGS: Record<SpecialtyKey, ProgressNoteConfig> = {
  general: GENERAL,
  general_surgery: GENERAL_SURGERY,
  medical_oncology: MEDICAL_ONCOLOGY,
  internal_medicine: INTERNAL_MEDICINE,
  obstetrics_gynaecology: OBSTETRICS_GYNAECOLOGY,
  pulmonary_medicine: PULMONARY_MEDICINE,
  ent: ENT,
  psychiatry: PSYCHIATRY,
  ophthalmology: OPHTHALMOLOGY,
  dermatology: DERMATOLOGY,
  burns_plastic_surgery: BURNS_PLASTIC_SURGERY,
  orthopaedics: ORTHOPAEDICS,
  urology: UROLOGY,
  neurosurgery: NEUROSURGERY,
  paediatrics: PAEDIATRICS,
  emergency_medicine: EMERGENCY_MEDICINE,
};

/** The general (no-department) sheet — what a unit without a department prints. */
export const DEFAULT_PROGRESS_NOTE_CONFIG = GENERAL;

/** Same "degrade, don't crash" rule as getSpecialtyPack(): an unknown key is the general sheet. */
export function progressNoteConfigFor(key: string | null | undefined): ProgressNoteConfig {
  return (key && PROGRESS_NOTE_CONFIGS[key as SpecialtyKey]) || DEFAULT_PROGRESS_NOTE_CONFIG;
}
