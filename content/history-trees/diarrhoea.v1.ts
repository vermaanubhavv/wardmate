import type { HistoryTree } from "@/lib/history-check/types";
import { commonHpi, IMMUNOCOMPROMISE, MACLEODS, PREGNANCY, rce, val, yn } from "@/content/history-trees/_helpers";

/**
 * ACUTE DIARRHOEA / VOMITING — v1.0.0. CLINICAL CONTENT: PENDING CLINICIAN REVIEW.
 * Adult medicine ward, north India. Differentials: acute gastroenteritis (viral / bacterial),
 * cholera, dysentery (bacillary / amoebic), food poisoning, enteric fever, antibiotic-
 * associated diarrhoea, inflammatory bowel disease flare, drug / toxin ingestion,
 * chronic diarrhoea with malabsorption, and surgical mimics (obstruction, appendicitis).
 */
export const diarrhoeaV1: HistoryTree = {
  id: "diarrhoea",
  version: "1.0.0",
  complaint: "Diarrhoea / vomiting",
  triggers: ["diarrhoea", "diarrhea", "loose stools", "loose motions", "loose motion", "watery stools", "vomiting", "vomitings", "gastroenteritis", "dysentery", "blood in stool", "frequent stools"],
  setting: "Adult medicine ward, north India",
  reviewStatus: "pending_clinician_review",
  reviewedBy: null,
  references: [
    rce("Is this patient hypovolemic?", 1999, "10086438"),
    { title: "Infectious Diseases Society of America clinical practice guidelines for the diagnosis and management of infectious diarrhea", source: "Clin Infect Dis", year: 2017, pmid: "29053792" },
    { title: "ACG clinical guideline: diagnosis, treatment, and prevention of acute diarrheal infections in adults", source: "Am J Gastroenterol", year: 2016, pmid: "27068718" },
    { title: "Cholera — WHO fact sheet and outbreak case definition", source: "World Health Organization", url: "https://www.who.int/news-room/fact-sheets/detail/cholera" },
    { title: "Enteric fever — clinical features (Bhutta ZA, BMJ review)", source: "BMJ", year: 2006, pmid: "16825230" },
    MACLEODS,
  ],
  slots: [
    ...commonHpi("diarrhoea"),
    val("hpi", "frequency", "Frequency", "How many stools in 24 hours?", ["times a day", "times", "episodes", "frequency", "stools a day", "motions", "per day", "in 24 hours"], { numeric: true }),
    val("hpi", "consistency", "Consistency", "Are the stools watery, loose, semi-formed, or rice-water?", ["watery", "loose", "semi formed", "semi-formed", "rice water", "rice-water", "profuse", "consistency", "mushy", "bulky", "greasy", "frothy"]),
    val("hpi", "volume", "Volume", "Are the stools large-volume or small and frequent?", ["large volume", "small volume", "large", "small", "profuse", "scanty", "volume", "copious"]),
    yn("hpi", "blood_mucus", "Blood or mucus", "Any blood or mucus in the stool?", ["blood", "bloody", "mucus", "mucous", "slimy", "red", "fresh blood", "black", "melaena", "melena"]),
    yn("hpi", "tenesmus_urgency", "Tenesmus / urgency", "Any urgency, or straining with a feeling of incomplete evacuation?", ["tenesmus", "urgency", "straining", "incomplete evacuation", "urge", "cannot hold"]),
    yn("hpi", "nocturnal", "Nocturnal stools", "Is the patient woken at night by the need to pass stool?", ["night", "nocturnal", "wakes", "at night"], { tier: "detailed" }),
    yn("hpi", "vomiting", "Vomiting", "Any vomiting — how many times, and what does it contain?", ["vomiting", "vomit", "vomited", "vomitings", "nausea", "retching", "bilious", "blood in vomit", "haematemesis", "hematemesis", "coffee ground"]),
    val("hpi", "vomit_diarrhoea_sequence", "Sequence of vomiting and diarrhoea", "Which started first — vomiting or diarrhoea, and how many hours after eating?", ["first", "then", "followed by", "after eating", "hours after", "within", "started with", "sequence"], { tier: "detailed" }),
    val("hpi", "abdominal_pain", "Abdominal pain", "Any abdominal pain — where, and is it cramping, continuous, or relieved by passing stool?", ["abdominal pain", "pain abdomen", "cramps", "cramping", "colicky", "colic", "continuous", "relieved by passing", "lower abdomen", "around the umbilicus", "right lower", "pain"]),
    val("hpi", "oral_intake", "Oral intake", "Is the patient able to keep down fluids and food?", ["oral intake", "able to drink", "not able to drink", "keeping down", "unable to eat", "not eating", "taking orally", "ors", "fluids"]),
    val("hpi", "urine_output", "Urine output", "When did the patient last pass urine, and how much?", ["urine", "passed urine", "urine output", "last passed", "not passed urine", "reduced urine", "less urine", "dark urine", "oliguria"]),
    // Associated
    yn("associated", "fever", "Fever", "Any fever, with or without chills?", ["fever", "febrile", "temperature", "chills", "rigors"]),
    yn("associated", "thirst_dryness", "Thirst / dry mouth / giddiness", "Any excessive thirst, dry mouth, giddiness on standing, or cramps in the legs?", ["thirst", "thirsty", "dry mouth", "giddiness", "giddy", "dizzy", "light headed", "on standing", "leg cramps", "cramps in legs", "weakness"]),
    yn("associated", "abdominal_distension", "Abdominal distension", "Any abdominal distension, or has passing of flatus stopped?", ["distension", "distended", "bloating", "not passing flatus", "flatus", "no gas", "swelling of abdomen"]),
    yn("associated", "jaundice", "Jaundice", "Any yellowness of eyes or urine?", ["jaundice", "yellow", "yellowish", "icterus"], { tier: "detailed" }),
    yn("associated", "weight_loss", "Weight loss", "Any weight loss over the preceding weeks (chronic diarrhoea)?", ["weight loss", "lost weight", "losing weight", "wasting", "thin"], { tier: "detailed" }),
    yn("associated", "joint_eye_skin", "Joint / eye / skin symptoms", "Any joint pains, red eyes, mouth ulcers, or rash (inflammatory bowel disease)?", ["joint pain", "arthritis", "red eyes", "mouth ulcers", "oral ulcers", "rash", "erythema nodosum"], { tier: "detailed" }),
    yn("associated", "headache_bodyache", "Headache / body ache", "Any headache or body ache with the fever?", ["headache", "body ache", "bodyache", "myalgia"], { tier: "detailed" }),
    yn("associated", "constipation_history", "Alternating constipation", "Any alternating constipation or long-standing change in bowel habit?", ["constipation", "alternating", "bowel habit", "change in bowel", "long standing", "chronic"], { tier: "detailed" }),
    // Red flags
    yn("red_flag", "dehydration_signs", "Severe dehydration symptoms", "Is the patient very thirsty, drowsy, unable to drink, or not passing urine?", ["very thirsty", "drowsy", "lethargic", "unable to drink", "not passing urine", "no urine", "sunken", "cold hands", "collapse", "fainted", "unconscious"]),
    yn("red_flag", "bloody_with_fever", "Bloody stools with high fever", "Are there bloody stools together with high fever?", ["bloody", "blood", "dysentery", "high fever", "fever"]),
    yn("red_flag", "severe_pain_tenderness", "Severe abdominal pain / rigidity", "Is there severe continuous abdominal pain, or an abdomen that is hard to touch?", ["severe pain", "continuous pain", "rigid", "hard abdomen", "board like", "guarding", "tender", "cannot touch", "worsening pain"]),
    yn("red_flag", "rice_water_profuse", "Profuse rice-water stools", "Are the stools profuse and rice-water like, with rapid weakness (cholera)?", ["rice water", "rice-water", "profuse", "copious", "painless watery", "large volume", "cholera"]),
    yn("red_flag", "elderly_comorbid", "Elderly / kidney / heart disease / diabetes", "Is the patient elderly, or known to have kidney disease, heart disease, or diabetes?", ["elderly", "old age", "kidney disease", "ckd", "dialysis", "heart disease", "heart failure", "diabetes", "diabetic", "age"]),
    yn("red_flag", "recent_antibiotics", "Recent antibiotics / hospital stay", "Any antibiotics or hospital admission in the past 2 months (antibiotic-associated diarrhoea)?", ["antibiotic", "antibiotics", "recent hospital", "admitted", "hospital stay", "after antibiotics", "clindamycin", "amoxicillin", "cephalosporin"]),
    yn("red_flag", "persistent_over_2_weeks", "Diarrhoea beyond 2 weeks", "Has the diarrhoea lasted more than 14 days?", ["14 days", "two weeks", "2 weeks", "more than a fortnight", "persistent", "three weeks", "a month", "chronic"], { tier: "detailed" }),
    PREGNANCY,
    IMMUNOCOMPROMISE,
    // Exposures
    yn("exposure", "food_history", "Suspect food / meal", "What was eaten in the last 72 hours — outside food, a feast, reheated rice, milk products, seafood?", ["outside food", "street food", "hotel", "feast", "marriage", "wedding", "party", "prasad", "reheated", "rice", "milk", "sweets", "seafood", "fish", "chicken", "meat", "ate", "eaten", "food"]),
    yn("exposure", "water_source", "Water source", "What is the drinking water source — tap, hand pump, well, tanker, or bottled?", ["tap", "hand pump", "handpump", "well", "tanker", "bottled", "ro", "boiled", "river", "pond", "water", "water source"]),
    yn("exposure", "contacts_similar", "Similar illness in contacts", "Did anyone else who ate or drank the same thing fall ill?", ["others also", "family also", "similar illness", "same food", "contacts", "many people", "outbreak", "neighbours", "hostel", "mess"]),
    yn("exposure", "travel", "Travel", "Any recent travel, pilgrimage, or fair (mela)?", ["travel", "travelled", "journey", "pilgrimage", "mela", "fair", "yatra", "village", "visited"]),
    yn("exposure", "drugs_toxins", "Laxatives / metformin / other drugs / toxins", "Any laxatives, metformin, magnesium antacids, herbal medicines, or possible poisoning?", ["laxative", "metformin", "antacid", "magnesium", "herbal", "ayurvedic", "desi medicine", "mushroom", "poison", "pesticide", "arsenic", "colchicine"], { tier: "detailed" }),
    yn("exposure", "sexual_history", "Sexual history / HIV risk", "Any risk factors for HIV or sexually transmitted infection (in chronic or bloody diarrhoea)?", ["sexual", "unprotected", "multiple partners", "hiv", "msm", "sti"], { tier: "detailed" }),
    yn("exposure", "occupation_animals", "Occupation / animal contact", "Any contact with animals, farm work, or food handling?", ["farm", "animals", "cattle", "poultry", "food handler", "cook", "dairy", "goat"], { tier: "detailed" }),
  ],
  differentials: [
    { id: "gastroenteritis", name: "Acute gastroenteritis (viral / bacterial)", pointers: ["consistency", "vomiting", "fever", "abdominal_pain"], discriminators: ["consistency", "vomiting", "fever", "abdominal_pain", "blood_mucus", "food_history", "contacts_similar", "duration"] },
    { id: "cholera", name: "Cholera", pointers: ["rice_water_profuse", "volume", "thirst_dryness", "dehydration_signs"], discriminators: ["rice_water_profuse", "volume", "consistency", "fever", "abdominal_pain", "blood_mucus", "water_source", "contacts_similar", "urine_output"] },
    { id: "dysentery", name: "Dysentery (bacillary / amoebic)", pointers: ["blood_mucus", "tenesmus_urgency", "bloody_with_fever"], discriminators: ["blood_mucus", "tenesmus_urgency", "bloody_with_fever", "frequency", "volume", "fever", "abdominal_pain", "duration"] },
    { id: "food_poisoning", name: "Food poisoning (toxin-mediated)", pointers: ["food_history", "contacts_similar", "vomit_diarrhoea_sequence"], discriminators: ["food_history", "contacts_similar", "vomit_diarrhoea_sequence", "vomiting", "fever", "onset_mode", "duration"] },
    { id: "enteric_fever", name: "Enteric fever", pointers: ["fever", "headache_bodyache", "abdominal_pain", "duration"], discriminators: ["fever", "headache_bodyache", "abdominal_pain", "constipation_history", "duration", "water_source", "abdominal_distension"] },
    { id: "antibiotic_associated", name: "Antibiotic-associated diarrhoea / C. difficile", pointers: ["recent_antibiotics", "elderly_comorbid"], discriminators: ["recent_antibiotics", "elderly_comorbid", "fever", "blood_mucus", "abdominal_distension", "immunocompromise"] },
    { id: "ibd_flare", name: "Inflammatory bowel disease flare", pointers: ["blood_mucus", "nocturnal", "joint_eye_skin", "weight_loss"], discriminators: ["blood_mucus", "nocturnal", "joint_eye_skin", "weight_loss", "persistent_over_2_weeks", "tenesmus_urgency", "fever", "constipation_history"] },
    { id: "drug_toxin", name: "Drug or toxin induced", pointers: ["drugs_toxins", "vomiting"], discriminators: ["drugs_toxins", "vomiting", "fever", "contacts_similar", "onset_mode"] },
    { id: "chronic_malabsorption", name: "Chronic diarrhoea / malabsorption (including tuberculosis, HIV-related)", pointers: ["persistent_over_2_weeks", "weight_loss", "consistency"], discriminators: ["persistent_over_2_weeks", "weight_loss", "consistency", "nocturnal", "sexual_history", "immunocompromise", "fever", "blood_mucus"] },
    { id: "surgical_mimic", name: "Surgical abdomen (obstruction / appendicitis / ischaemia)", pointers: ["severe_pain_tenderness", "abdominal_distension", "elderly_comorbid"], discriminators: ["severe_pain_tenderness", "abdominal_distension", "abdominal_pain", "vomiting", "frequency", "elderly_comorbid", "blood_mucus"] },
  ],
  output: {
    durationSlot: "duration",
    hpiOrder: ["onset", "duration", "onset_mode", "frequency", "consistency", "volume", "blood_mucus", "tenesmus_urgency", "nocturnal", "vomiting", "vomit_diarrhoea_sequence", "abdominal_pain", "oral_intake", "urine_output", "progression", "prior_treatment", "prior_investigations"],
  },
};
