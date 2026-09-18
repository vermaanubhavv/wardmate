import type { HistoryTree } from "@/lib/history-check/types";

/**
 * FEVER — complaint tree v1.0.0.
 *
 * CLINICAL CONTENT: PENDING CLINICIAN REVIEW. Written for an adult medicine / surgery ward in
 * north India, conservatively: the differentials are the ones a resident there is expected to
 * keep in mind (dengue, enteric fever, malaria, scrub typhus, sepsis / pneumonia, tuberculosis,
 * hepatitis, urinary infection, leptospirosis, meningitis, post-operative fever). It carries no
 * doses and no treatment advice, by design and by validator (lib/history-check/schema.ts).
 *
 * What this file is for: it tells the engine which questions a fever history is expected to
 * answer, which of them must never be missed, and which help tell the differentials apart. It
 * says what to ASK. It never says what is TRUE — a slot the resident did not dictate is
 * "unasked" and prints as "not recorded".
 *
 * Slots are one item each on purpose: "diarrhoea" and "constipation" are separate, as are
 * "jaundice" and "dark urine", "breathlessness" and "chest pain". A negative for one must never
 * be read as a negative for the other, and the validator matches terms per slot.
 *
 * Tiers: everything is "core" unless marked "detailed". Core is what a ward-round history
 * needs; detailed is what a long case adds. Red flags ignore the tier and always show.
 * `teach` lines on the red flags say why each is asked; they are shown in academic mode only
 * and, like the rest, await clinician review.
 *
 * Editing rules:
 *  - Any change to a slot id, its terms, or the output order is a NEW version file
 *    (fever.v2.ts). Stored results reference the version they were run against.
 *  - Wording of questions can be tidied in place; that is display only.
 *  - `terms` are lowercase and are what the validator needs to see inside a quote before it
 *    will accept a NEGATIVE for that slot. Keep them to the words a resident actually says.
 */
export const feverV1: HistoryTree = {
  id: "fever",
  version: "1.0.0",
  complaint: "Fever",
  triggers: ["fever", "febrile", "pyrexia", "temperature", "high temperature", "pyrexial", "puo"],
  setting: "Adult medicine / general surgery ward, north India",
  reviewStatus: "pending_clinician_review",
  reviewedBy: null,

  references: [
    { title: "National Guidelines for Clinical Management of Dengue Fever 2023", source: "NCVBDC, Ministry of Health and Family Welfare, India", year: 2023, url: "https://ncvbdc.mohfw.gov.in/Doc/National%20Guidelines%20for%20Clinical%20Management%20of%20Dengue%20Fever%202023.pdf" },
    { title: "Value of clinical features in the diagnosis of enteric fever", source: "Journal (PubMed)", pmid: "9465434" },
    { title: "Frequency and distribution of eschar in patients with scrub typhus in India: systematic review and meta-analysis", source: "PubMed", pmid: "39282546" },
    { title: "Leptospirosis in India: a systematic review and meta-analysis of clinical profile, treatment and outcomes", source: "PubMed", year: 2023, pmid: "37701390" },
    { title: "The rational clinical examination. Does this adult patient have acute meningitis?", source: "JAMA (Rational Clinical Examination)", year: 1999, pmid: "10411200" },
    { title: "Does this patient have community-acquired pneumonia? Diagnosing pneumonia by history and physical examination", source: "JAMA (Rational Clinical Examination)", year: 1997 },
    { title: "National TB Elimination Programme: presumptive TB definition (cough > 2 weeks, fever, weight loss, night sweats, contact)", source: "NTEP, Government of India", url: "https://journals.lww.com/ascp/fulltext/2022/10020/national_tb_elimination_program__ntep___at_a.1.aspx" },
    { title: "Macleod's Clinical Examination — history taking", source: "Elsevier (textbook)" },
  ],

  slots: [
    // --- Informant ------------------------------------------------------------------------
    {
      id: "informant",
      group: "informant",
      kind: "value",
      label: "Informant",
      question: "Who gave the history — the patient or an attendant?",
      terms: ["attendant", "informant", "history given by", "relative", "wife", "husband", "son", "daughter", "mother", "father", "patient himself", "patient herself", "bystander"],
    },
    {
      id: "reliability",
      group: "informant",
      kind: "value",
      tier: "detailed",
      label: "Reliability",
      question: "Is the history reliable?",
      terms: ["reliable", "unreliable", "reliability"],
    },

    // --- HPI: the story of the fever -------------------------------------------------------
    {
      id: "onset",
      group: "hpi",
      kind: "value",
      label: "Onset",
      question: "When did the fever start?",
      terms: ["since", "started", "onset", "ago", "from", "began"],
    },
    {
      id: "duration",
      group: "hpi",
      kind: "value",
      label: "Duration",
      question: "How many days has the fever been present?",
      terms: ["days", "day", "weeks", "week", "months", "since", "duration"],
      numeric: true,
    },
    {
      id: "onset_mode",
      group: "hpi",
      kind: "value",
      label: "Mode of onset",
      question: "Was the onset sudden or gradual?",
      terms: ["sudden", "gradual", "abrupt", "insidious", "acute onset"],
    },
    {
      id: "grade",
      group: "hpi",
      kind: "value",
      label: "Grade",
      question: "How high does the fever go — was a temperature documented?",
      terms: ["high grade", "low grade", "moderate grade", "temperature", "degrees", "grade", "documented"],
      numeric: true,
    },
    {
      id: "pattern",
      group: "hpi",
      kind: "value",
      label: "Pattern",
      question: "Is the fever continuous, intermittent or remittent — any step-ladder or alternate-day pattern?",
      terms: ["continuous", "intermittent", "remittent", "comes and goes", "step ladder", "step-ladder", "periodic", "alternate day", "every day", "pattern", "throughout the day"],
    },
    {
      id: "diurnal",
      group: "hpi",
      kind: "value",
      label: "Time of day",
      question: "Is there an evening or night rise of temperature?",
      terms: ["evening rise", "evening", "night", "morning", "nocturnal", "time of day"],
    },
    {
      id: "chills_rigors",
      group: "hpi",
      kind: "yes_no",
      label: "Chills and rigors",
      question: "Is the fever accompanied by chills or rigors?",
      terms: ["chills", "rigors", "rigor", "chill", "shivering", "shaking"],
    },
    {
      id: "relieving",
      group: "hpi",
      kind: "value",
      label: "Relieved by",
      question: "Does the fever settle with medication or sponging, and for how long?",
      terms: ["relieved", "comes down", "settles", "subsides", "sponging", "antipyretic", "paracetamol", "medication", "medicine", "relief", "not relieved", "does not come down"],
    },
    {
      id: "progression",
      group: "hpi",
      kind: "value",
      label: "Progression",
      question: "Is the fever getting better, worse or staying the same?",
      terms: ["better", "worse", "same", "improving", "worsening", "increasing", "progressive", "decreasing", "persisting", "progression"],
    },
    {
      id: "prior_treatment",
      group: "hpi",
      kind: "value",
      label: "Treatment taken outside",
      question: "Was any treatment taken before admission — including antibiotics or antimalarials from a local practitioner?",
      terms: ["treatment", "took", "taken", "antibiotic", "antibiotics", "antimalarial", "injection", "injections", "local doctor", "outside", "medication", "medicines", "tablets", "self medication"],
    },
    {
      id: "prior_investigations",
      group: "hpi",
      kind: "value",
      label: "Tests already done",
      question: "Were any tests done before admission, and are the reports available?",
      terms: ["report", "reports", "test", "tests", "investigation", "investigations", "done outside", "widal", "dengue", "ns1", "platelet", "malaria", "card test", "smear", "culture", "x-ray", "cbc"],
    },

    // --- Associated symptoms ------------------------------------------------------------------
    { id: "headache", group: "associated", kind: "yes_no", label: "Headache", question: "Any headache with the fever?", terms: ["headache", "head ache", "head pain"] },
    { id: "retro_orbital_pain", group: "associated", kind: "yes_no", label: "Retro-orbital pain", question: "Any pain behind the eyes?", terms: ["retro-orbital", "retro orbital", "retroorbital", "behind the eyes", "eye pain"] },
    { id: "body_ache", group: "associated", kind: "yes_no", label: "Body ache", question: "Any body ache or muscle pain?", terms: ["body ache", "bodyache", "body pain", "myalgia", "muscle pain", "generalised weakness", "generalized weakness", "backache", "back pain"] },
    { id: "joint_pain", group: "associated", kind: "yes_no", label: "Joint pain", question: "Any joint pain or joint swelling?", terms: ["joint pain", "joint pains", "arthralgia", "joint swelling", "joints", "arthritis"] },
    { id: "rash", group: "associated", kind: "yes_no", label: "Rash", question: "Any rash, and when did it appear relative to the fever?", terms: ["rash", "rashes", "skin lesions", "red spots", "petechiae", "eruption"] },
    { id: "cough", group: "associated", kind: "yes_no", label: "Cough", question: "Any cough — dry or with sputum, and for how long?", terms: ["cough", "sputum", "expectoration", "phlegm", "haemoptysis", "hemoptysis", "blood in sputum"] },
    { id: "sore_throat", group: "associated", kind: "yes_no", tier: "detailed", label: "Sore throat / coryza", question: "Any sore throat or runny nose?", terms: ["sore throat", "throat pain", "runny nose", "cold", "coryza", "nasal discharge", "throat"] },
    { id: "ear_symptoms", group: "associated", kind: "yes_no", tier: "detailed", label: "Ear pain / discharge", question: "Any ear pain or ear discharge?", terms: ["ear pain", "ear discharge", "earache", "ear ache", "ear"] },
    { id: "abdominal_pain", group: "associated", kind: "yes_no", label: "Abdominal pain", question: "Any abdominal pain, and where?", terms: ["abdominal pain", "pain abdomen", "pain in abdomen", "stomach pain", "abdomen pain", "abdominal discomfort", "epigastric pain", "right hypochondrium"] },
    { id: "vomiting", group: "associated", kind: "yes_no", label: "Vomiting", question: "Any vomiting or nausea?", terms: ["vomiting", "vomit", "vomited", "nausea", "vomitings"] },
    { id: "diarrhoea", group: "associated", kind: "yes_no", label: "Diarrhoea", question: "Any diarrhoea or loose stools?", terms: ["diarrhoea", "diarrhea", "loose stools", "loose stool", "loose motion", "loose motions", "watery stools"] },
    { id: "constipation", group: "associated", kind: "yes_no", tier: "detailed", label: "Constipation", question: "Any constipation?", terms: ["constipation", "constipated", "not passing stool", "not passed stool", "bowels not open"] },
    { id: "jaundice", group: "associated", kind: "yes_no", label: "Jaundice", question: "Any yellowing of the eyes or skin?", terms: ["jaundice", "yellow", "yellowish", "yellowness", "icterus", "icteric", "yellow eyes", "yellow urine"] },
    { id: "dark_urine", group: "associated", kind: "yes_no", label: "Dark urine / pale stools", question: "Any dark-coloured urine or pale stools?", terms: ["dark urine", "dark coloured urine", "dark colored urine", "high coloured urine", "high colored urine", "cola coloured urine", "pale stools", "clay coloured stools", "clay colored stools"] },
    { id: "urinary", group: "associated", kind: "yes_no", label: "Urinary symptoms", question: "Any burning micturition, frequency or flank pain?", terms: ["burning micturition", "dysuria", "frequency", "urgency", "flank pain", "loin pain", "burning urination", "burning while passing urine", "urinary", "haematuria", "hematuria", "increased frequency"] },
    { id: "night_sweats", group: "associated", kind: "yes_no", tier: "detailed", label: "Night sweats", question: "Any night sweats?", terms: ["night sweats", "night sweat", "sweating at night", "drenching sweats"] },
    { id: "weight_loss", group: "associated", kind: "yes_no", tier: "detailed", label: "Weight loss", question: "Any weight loss?", terms: ["weight loss", "lost weight", "losing weight", "loss of weight"] },
    { id: "appetite", group: "associated", kind: "yes_no", tier: "detailed", label: "Appetite", question: "Any loss of appetite?", terms: ["loss of appetite", "appetite", "anorexia", "not eating", "decreased appetite", "reduced appetite", "reduced intake", "decreased intake"] },
    { id: "local_infection", group: "associated", kind: "yes_no", label: "Local site of infection", question: "Any painful swelling, boil, wound, tooth or skin infection?", terms: ["swelling", "boil", "abscess", "wound", "cellulitis", "skin infection", "tooth", "dental", "ulcer", "pus", "discharge from"] },
    { id: "eschar", group: "associated", kind: "yes_no", label: "Eschar / insect bite", question: "Any black scab (eschar) or history of an insect or tick bite?", terms: ["eschar", "black scab", "scab", "insect bite", "tick bite", "mite", "bite mark", "black spot"] },
    { id: "calf_pain", group: "associated", kind: "yes_no", tier: "detailed", label: "Calf pain", question: "Any calf pain or calf swelling?", terms: ["calf pain", "calf tenderness", "calf swelling", "calf", "leg pain", "leg swelling"] },
    { id: "red_eyes", group: "associated", kind: "yes_no", tier: "detailed", label: "Red eyes", question: "Any redness of the eyes?", terms: ["red eyes", "red eye", "redness of eyes", "conjunctival suffusion", "conjunctival congestion", "congested eyes"] },
    { id: "lymph_nodes", group: "associated", kind: "yes_no", tier: "detailed", label: "Lymph node swelling", question: "Any swelling in the neck, armpit or groin?", terms: ["lymph node", "lymph nodes", "lymphadenopathy", "neck swelling", "swelling in neck", "swelling in the neck", "glands", "armpit", "groin swelling"] },

    // --- Must-not-miss red flags -------------------------------------------------------------
    // Always listed as gaps when unasked, whatever the leading differential looks like.
    { id: "altered_sensorium", group: "red_flag", kind: "yes_no", label: "Altered sensorium", question: "Any drowsiness, confusion, irritability or altered sensorium?", terms: ["altered sensorium", "drowsy", "drowsiness", "confused", "confusion", "irrelevant talk", "irritable", "irritability", "unconscious", "unresponsive", "sensorium", "disoriented", "not responding"], teach: "Any change in sensorium with fever moves the question from 'which fever' to 'is the brain involved': meningitis, encephalitis, cerebral malaria and sepsis all begin this way." },
    { id: "neck_stiffness", group: "red_flag", kind: "yes_no", label: "Neck stiffness", question: "Any neck stiffness or photophobia?", terms: ["neck stiffness", "neck rigidity", "stiff neck", "photophobia", "neck pain"], teach: "Asked of every febrile patient, whatever the story sounds like: meningeal irritation is easy to miss when the complaint is 'just fever' and costly to miss by a day." },
    { id: "seizures", group: "red_flag", kind: "yes_no", label: "Seizures", question: "Any seizure or fit?", terms: ["seizure", "seizures", "fit", "fits", "convulsion", "convulsions", "episode of unconsciousness"], teach: "A first seizure with fever in an adult points to the brain rather than the fever itself and changes the urgency of imaging and lumbar puncture." },
    { id: "breathlessness", group: "red_flag", kind: "yes_no", label: "Breathlessness", question: "Any breathlessness or fast breathing?", terms: ["breathlessness", "breathless", "shortness of breath", "dyspnoea", "dyspnea", "difficulty breathing", "difficulty in breathing", "fast breathing", "sob"], teach: "Breathlessness with fever is the earliest bedside marker of pneumonia, ARDS in dengue or leptospirosis, and of sepsis; ask it before the saturation falls." },
    { id: "chest_pain", group: "red_flag", kind: "yes_no", label: "Chest pain", question: "Any chest pain?", terms: ["chest pain", "pain in chest", "chest discomfort", "chest tightness", "pleuritic"], teach: "Pleuritic pain with fever points to the pleura and pericardium; asking separates a chest cause from a systemic fever." },
    { id: "bleeding", group: "red_flag", kind: "yes_no", label: "Bleeding", question: "Any bleeding — gums, nose, skin, black stools, blood in vomit or urine, heavy menses?", terms: ["bleeding", "bleed", "gum bleeding", "gum bleed", "nose bleed", "epistaxis", "black stools", "malena", "melena", "melaena", "blood in vomit", "haematemesis", "hematemesis", "petechiae", "bruising", "blood in urine", "heavy menses", "menorrhagia", "bleeding per vaginum"], teach: "Gum bleeding, petechiae or black stools with fever raise the possibility of thrombocytopenia (dengue) or coagulopathy (sepsis, leptospirosis) before any count comes back." },
    { id: "urine_output", group: "red_flag", kind: "yes_no", label: "Reduced urine output", question: "Has the urine output decreased?", terms: ["urine output", "decreased urine", "reduced urine", "less urine", "not passing urine", "oliguria", "anuria", "passing less urine"], teach: "Falling urine output is the simplest bedside sign of hypoperfusion or kidney injury in a febrile patient and is often unrecorded." },
    { id: "hypotension_symptoms", group: "red_flag", kind: "yes_no", label: "Giddiness / fainting", question: "Any giddiness on standing, cold extremities or fainting?", terms: ["giddiness", "giddy", "fainting", "syncope", "postural", "cold extremities", "cold peripheries", "cold hands", "lightheaded", "dizziness", "dizzy", "collapse"], teach: "Giddiness on standing, cold hands or fainting are what shock feels like from the inside; they are asked because the blood pressure may still read normal." },
    { id: "oral_intake", group: "red_flag", kind: "yes_no", label: "Unable to take orally", question: "Is the patient able to take fluids orally, or is vomiting persistent?", terms: ["persistent vomiting", "unable to take orally", "not able to take orally", "not taking orally", "not tolerating orals", "unable to drink", "not drinking", "oral intake", "orally"], teach: "Whether the patient can drink decides whether they can be managed on oral fluids at all, and poor intake is a warning sign in dengue." },
    { id: "severe_abdominal_pain", group: "red_flag", kind: "yes_no", label: "Severe abdominal pain", question: "Any severe or persistent abdominal pain, or abdominal distension?", terms: ["severe abdominal pain", "severe pain", "persistent abdominal pain", "abdominal distension", "distension", "distended abdomen", "guarding"], teach: "Persistent severe abdominal pain in a febrile patient is a dengue warning sign and also the presentation of a surgical cause hiding behind the fever." },
    { id: "immunocompromise", group: "red_flag", kind: "yes_no", label: "Immunocompromise", question: "Is the patient immunocompromised — HIV, steroids, chemotherapy, uncontrolled diabetes, transplant, splenectomy?", terms: ["hiv", "immunocompromised", "immunosuppressed", "steroid", "steroids", "chemotherapy", "chemo", "transplant", "splenectomy", "diabetic", "diabetes", "uncontrolled sugars", "cancer", "malignancy"] },
    { id: "pregnancy", group: "red_flag", kind: "yes_no", label: "Pregnancy / recent delivery", question: "Is the patient pregnant, or recently delivered or aborted?", terms: ["pregnant", "pregnancy", "lmp", "amenorrhoea", "amenorrhea", "postpartum", "post partum", "delivered", "delivery", "abortion", "miscarriage", "recently delivered"] },
    { id: "recent_surgery", group: "red_flag", kind: "yes_no", label: "Recent surgery / procedure", question: "Any recent surgery, procedure, catheter, drain or intravenous line?", terms: ["surgery", "operated", "operation", "procedure", "catheter", "foley", "drain", "iv line", "cannula", "central line", "post operative", "post-operative", "postoperative", "wound", "stitches", "suture", "dressing"], teach: "A recent operation adds wound, chest, line and clot causes that the usual fever differentials do not contain." },
    // --- India-relevant exposures ------------------------------------------------------------
    { id: "mosquito_exposure", group: "exposure", kind: "yes_no", label: "Mosquito exposure / local cases", question: "Any mosquito exposure, stagnant water nearby, or similar fever cases in the family or locality?", terms: ["mosquito", "mosquitoes", "stagnant water", "similar complaints", "similar cases", "fever in the family", "others at home", "neighbourhood", "locality", "outbreak", "dengue cases"] },
    { id: "travel", group: "exposure", kind: "yes_no", label: "Travel", question: "Any travel in the last month — rural, forest, hilly or malaria-endemic areas?", terms: ["travel", "travelled", "traveled", "visited", "village", "rural", "forest", "hilly", "hills", "jungle", "endemic", "outstation", "journey", "went to"] },
    { id: "tb_contact", group: "exposure", kind: "yes_no", label: "TB contact / past TB", question: "Any contact with a tuberculosis patient, or past tuberculosis or treatment for it?", terms: ["tb", "tuberculosis", "koch", "kochs", "koch's", "att", "akt", "dots", "contact with tb", "tb contact", "past tb", "previous tb", "anti tubercular"] },
    { id: "water_food", group: "exposure", kind: "yes_no", label: "Unsafe water / outside food", question: "Any outside food, street food or unsafe drinking water?", terms: ["outside food", "street food", "unsafe water", "contaminated water", "drinking water", "tap water", "food from outside", "hotel food", "roadside", "unhygienic"] },
    { id: "flood_rodent", group: "exposure", kind: "yes_no", label: "Flood water / rodents / animals", question: "Any wading in flood or drain water, rat or rodent exposure, or animal contact?", terms: ["flood", "flood water", "rain water", "wading", "sewage", "drain water", "rat", "rats", "rodent", "rodents", "animal", "animals", "cattle", "dog bite", "farm", "paddy", "fields"] },
    { id: "blood_sexual", group: "exposure", kind: "yes_no", tier: "detailed", label: "Blood / needle / sexual exposure", question: "Any blood transfusion, injections, needle sharing, tattoo or unprotected sexual exposure?", terms: ["transfusion", "blood transfusion", "injection", "needle", "needles", "tattoo", "sexual", "unprotected", "multiple partners", "iv drug", "intravenous drug", "drug abuse", "dialysis"] },
    { id: "recent_hospitalisation", group: "exposure", kind: "yes_no", tier: "detailed", label: "Recent hospitalisation", question: "Any hospital admission or invasive procedure in the last three months?", terms: ["hospitalised", "hospitalized", "hospitalisation", "hospitalization", "admitted", "admission", "icu", "recent admission", "previous admission", "nursing home"] },
  ],

  differentials: [
    {
      id: "dengue",
      name: "Dengue",
      pointers: ["headache", "retro_orbital_pain", "body_ache", "joint_pain", "rash", "bleeding", "mosquito_exposure"],
      discriminators: ["retro_orbital_pain", "rash", "bleeding", "body_ache", "joint_pain", "mosquito_exposure", "urine_output", "severe_abdominal_pain", "oral_intake", "prior_investigations"],
    },
    {
      id: "enteric",
      name: "Enteric fever",
      pointers: ["pattern", "abdominal_pain", "diarrhoea", "constipation", "water_food", "headache"],
      discriminators: ["pattern", "diurnal", "abdominal_pain", "diarrhoea", "constipation", "water_food", "prior_treatment", "prior_investigations", "appetite"],
    },
    {
      id: "malaria",
      name: "Malaria",
      pointers: ["chills_rigors", "pattern", "travel", "jaundice", "dark_urine", "mosquito_exposure"],
      discriminators: ["chills_rigors", "pattern", "travel", "jaundice", "dark_urine", "altered_sensorium", "urine_output", "prior_investigations"],
    },
    {
      id: "scrub_typhus",
      name: "Scrub typhus",
      pointers: ["eschar", "travel", "rash", "headache", "lymph_nodes"],
      discriminators: ["eschar", "travel", "flood_rodent", "rash", "lymph_nodes", "breathlessness", "headache"],
    },
    {
      id: "sepsis_pneumonia",
      name: "Sepsis / pneumonia",
      pointers: ["cough", "breathlessness", "chills_rigors", "altered_sensorium", "local_infection"],
      discriminators: ["cough", "breathlessness", "chest_pain", "chills_rigors", "local_infection", "urinary", "altered_sensorium", "hypotension_symptoms", "recent_hospitalisation"],
    },
    {
      id: "tuberculosis",
      name: "Tuberculosis",
      pointers: ["diurnal", "night_sweats", "weight_loss", "cough", "tb_contact", "lymph_nodes"],
      discriminators: ["duration", "diurnal", "night_sweats", "weight_loss", "cough", "tb_contact", "lymph_nodes", "appetite"],
    },
    {
      id: "hepatitis",
      name: "Acute viral hepatitis",
      pointers: ["jaundice", "dark_urine", "appetite", "vomiting", "water_food", "blood_sexual"],
      discriminators: ["jaundice", "dark_urine", "appetite", "vomiting", "water_food", "blood_sexual", "abdominal_pain", "altered_sensorium"],
    },
    {
      id: "uti",
      name: "Urinary tract infection / pyelonephritis",
      pointers: ["urinary", "chills_rigors", "recent_surgery"],
      discriminators: ["urinary", "chills_rigors", "recent_surgery", "vomiting", "abdominal_pain"],
    },
    {
      id: "leptospirosis",
      name: "Leptospirosis",
      pointers: ["flood_rodent", "calf_pain", "red_eyes", "jaundice", "urine_output"],
      discriminators: ["flood_rodent", "calf_pain", "red_eyes", "jaundice", "urine_output", "bleeding", "breathlessness"],
    },
    {
      id: "meningitis",
      name: "Meningitis / encephalitis",
      pointers: ["headache", "neck_stiffness", "altered_sensorium", "seizures", "vomiting"],
      discriminators: ["headache", "neck_stiffness", "altered_sensorium", "seizures", "vomiting", "rash"],
    },
    {
      id: "post_op_fever",
      name: "Post-operative fever",
      appliesWhen: "post_op",
      pointers: ["recent_surgery", "local_infection", "cough", "urinary", "calf_pain"],
      discriminators: ["recent_surgery", "local_infection", "cough", "breathlessness", "urinary", "calf_pain", "abdominal_pain"],
    },
  ],

  output: {
    durationSlot: "duration",
    hpiOrder: [
      "onset",
      "duration",
      "onset_mode",
      "grade",
      "pattern",
      "diurnal",
      "chills_rigors",
      "relieving",
      "progression",
      "prior_treatment",
      "prior_investigations",
    ],
  },
};
