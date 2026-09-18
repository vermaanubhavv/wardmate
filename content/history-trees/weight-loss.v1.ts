import type { HistoryTree } from "@/lib/history-check/types";
import { commonHpi, IMMUNOCOMPROMISE, MACLEODS, PREGNANCY, val, yn } from "@/content/history-trees/_helpers";

/**
 * UNINTENTIONAL WEIGHT LOSS — v1.0.0. CLINICAL CONTENT: PENDING CLINICIAN REVIEW.
 * Differentials: tuberculosis, malignancy (GI, lung, haematological), uncontrolled diabetes,
 * thyroid excess, HIV and chronic infection, malabsorption / chronic diarrhoea, chronic
 * organ failure (kidney, liver, heart, lung), depression / eating disorder, poor intake
 * from dysphagia or dental or social causes, adrenal insufficiency, chronic pancreatitis.
 */
export const weightLossV1: HistoryTree = {
  id: "weight_loss",
  version: "1.0.0",
  complaint: "Weight loss",
  triggers: ["weight loss", "loss of weight", "losing weight", "lost weight", "wasting", "cachexia", "loss of appetite", "anorexia", "emaciated", "becoming thin"],
  setting: "Adult medicine ward, north India",
  reviewStatus: "pending_clinician_review",
  reviewedBy: null,
  references: [
    { title: "Unintentional weight loss in older adults (review)", source: "Am Fam Physician", year: 2014, pmid: "24784121" },
    { title: "Unexplained weight loss: a systematic review of diagnostic evaluation", source: "Am J Med", year: 2017 },
    { title: "Technical and operational guidelines for TB control in India (NTEP)", source: "Central TB Division, Ministry of Health and Family Welfare", year: 2016 },
    MACLEODS,
  ],
  slots: [
    ...commonHpi("weight loss"),
    val("hpi", "amount", "Amount of weight lost", "How much weight has been lost, over what period, and from what starting weight — or how loose have the clothes become?", ["kg", "kilo", "kilos", "lost", "from", "to", "clothes loose", "belt", "notches", "amount", "percent", "months", "weeks"], { numeric: true }),
    val("hpi", "appetite", "Appetite", "Is the appetite reduced, normal, or increased despite the weight loss?", ["appetite", "reduced appetite", "not hungry", "anorexia", "normal appetite", "eating well", "increased appetite", "eating more", "hunger"]),
    val("hpi", "intake", "What is actually being eaten", "What does a day's food look like now, compared with before — meals skipped, portions, foods avoided?", ["meals", "portions", "skipping", "eats", "eating", "food", "avoid", "less than before", "half", "diet", "roti", "rice"]),
    yn("hpi", "early_satiety_dysphagia", "Early fullness / difficulty swallowing", "Does the patient feel full after a few mouthfuls, or have difficulty or pain on swallowing?", ["full early", "early satiety", "few mouthfuls", "difficulty swallowing", "dysphagia", "food sticks", "pain on swallowing", "odynophagia"]),
    yn("hpi", "intentional_check", "Any intention to lose weight", "Was the patient trying to lose weight — dieting, exercise, fasting, or a religious fast?", ["dieting", "diet", "exercise", "gym", "fasting", "trying to lose", "intentional", "on purpose", "vrat", "roza"]),
    // Associated
    yn("associated", "fever_night_sweats", "Fever / evening rise / night sweats", "Any fever, evening rise of temperature, or drenching night sweats?", ["fever", "evening rise", "night sweats", "sweating at night", "low grade", "chills"]),
    yn("associated", "cough", "Cough", "Any cough, and for how long, with or without blood?", ["cough", "sputum", "phlegm", "haemoptysis", "blood in sputum", "weeks"]),
    yn("associated", "gi_symptoms", "Change in bowel habit / blood / bulky stools / abdominal pain", "Any diarrhoea, blood in the stool, bulky pale greasy stools, or abdominal pain?", ["diarrhoea", "diarrhea", "loose stools", "blood in stool", "black stools", "bulky", "greasy", "pale stools", "foul", "abdominal pain", "constipation", "bowel habit"]),
    yn("associated", "polyuria_polydipsia", "Excess thirst / urine", "Any excessive thirst, passing large amounts of urine, or night-time urination?", ["thirst", "thirsty", "polyuria", "large amounts of urine", "nocturia", "at night", "sugar"]),
    yn("associated", "heat_intolerance_palpitations", "Heat intolerance / palpitations / tremor / neck swelling", "Any heat intolerance, palpitations, tremor, sweating, or swelling in the neck?", ["heat intolerance", "palpitations", "tremor", "sweating", "neck swelling", "goitre", "goiter", "thyroid", "loose motions"]),
    yn("associated", "lumps_nodes", "Lumps / swellings", "Any lumps in the neck, armpits, groin, breast, or abdomen?", ["lump", "lumps", "swelling", "node", "nodes", "neck", "armpit", "groin", "breast", "abdomen", "mass"]),
    yn("associated", "mood_sleep", "Mood / sleep / interest", "Has the patient felt low, lost interest, slept badly, or felt hopeless?", ["low", "sad", "depressed", "lost interest", "sleep", "not sleeping", "hopeless", "worthless", "crying", "anxiety"]),
    yn("associated", "dental_swallowing_social", "Teeth / dentures / cooking / money", "Any problem with teeth or dentures, with getting or cooking food, or with money for food, or does the patient live alone?", ["teeth", "dentures", "cannot chew", "cooking", "cook", "money", "poverty", "lives alone", "alone", "nobody to cook", "old age home"], { tier: "detailed" }),
    yn("associated", "breathlessness_swelling", "Breathlessness / swelling", "Any breathlessness on exertion or swelling of the legs (heart, kidney, liver)?", ["breathlessness", "breathless", "dyspnoea", "swelling", "oedema", "leg swelling"], { tier: "detailed" }),
    yn("associated", "jaundice_abdominal_swelling", "Jaundice / abdominal swelling", "Any yellowness of the eyes or swelling of the abdomen?", ["jaundice", "yellow", "abdominal swelling", "distension", "ascites"], { tier: "detailed" }),
    yn("associated", "skin_pigmentation_vomiting", "Darkening of skin / vomiting / salt craving", "Any darkening of the skin or gums, vomiting, salt craving, or giddiness on standing?", ["darkening", "pigmentation", "dark gums", "vomiting", "salt craving", "giddy", "postural", "low bp"], { tier: "detailed" }),
    yn("associated", "pain_anywhere", "Pain", "Any persistent pain anywhere — bone, back, abdomen, chest?", ["pain", "bone pain", "back pain", "abdominal pain", "chest pain", "persistent"], { tier: "detailed" }),
    yn("associated", "oral_thrush_recurrent_infections", "Mouth ulcers / white patches / recurrent infections / rash", "Any white patches in the mouth, recurrent infections, shingles, or persistent rash (HIV)?", ["white patches", "thrush", "candida", "recurrent infections", "shingles", "herpes zoster", "rash", "diarrhoea for months"], { tier: "detailed" }),
    // Red flags
    yn("red_flag", "marked_rapid_loss", "Marked or rapid loss", "Has more than a tenth of the body weight been lost in six months, or is the loss visibly rapid?", ["more than", "kg in", "rapid", "quickly", "months", "10 percent", "marked", "visible", "wasting"], { teach: "A tenth of body weight in six months is the threshold at which a cause is found in most patients; the number turns an impression into a workup." }),
    yn("red_flag", "tb_symptoms", "Tuberculosis symptoms", "Any cough over two weeks, evening fever, night sweats, or a lump in the neck?", ["two weeks", "2 weeks", "evening fever", "night sweats", "chronic cough", "neck lump", "tb symptoms"], { teach: "In India weight loss with any one of these is presumptive tuberculosis and needs a sputum or a node before anything else." }),
    yn("red_flag", "bleeding_or_lump", "Bleeding or a lump", "Any blood in the stool, urine, sputum or vomit, postmenopausal bleeding, or a new lump?", ["blood in stool", "black stools", "blood in urine", "haemoptysis", "blood in vomit", "postmenopausal bleeding", "lump", "mass"], { teach: "Bleeding or a mass with weight loss points to malignancy and to the organ to image first." }),
    yn("red_flag", "dysphagia_progressive", "Progressive difficulty swallowing", "Is there difficulty swallowing that is getting worse, first for solids then liquids?", ["difficulty swallowing", "dysphagia", "food sticks", "solids then liquids", "progressive", "getting worse", "cannot swallow"], { teach: "Progressive dysphagia for solids then liquids with weight loss is oesophageal cancer until endoscopy says otherwise." }),
    yn("red_flag", "polyuria_with_vomiting", "Thirst and urine with vomiting or drowsiness", "Any excessive thirst and urine along with vomiting, abdominal pain, fast breathing, or drowsiness?", ["thirst", "polyuria", "vomiting", "abdominal pain", "fast breathing", "drowsy", "drowsiness", "sugar", "ketoacidosis"], { teach: "New diabetes presents as weight loss; with vomiting and fast breathing it presents as ketoacidosis, which is an emergency the history alone can call." }),
    yn("red_flag", "risk_behaviour_hiv", "HIV risk", "Any unprotected sex, multiple partners, injecting drug use, transfusion, or a partner with HIV?", ["unprotected", "multiple partners", "injecting", "iv drug", "transfusion", "hiv", "partner", "sex worker", "truck driver", "migrant"], { teach: "HIV remains a common cause of wasting on Indian wards and is missed when the question feels awkward to ask; asked plainly and privately, the answer changes everything." }),
    yn("red_flag", "suicidal_thoughts", "Thoughts of ending life", "Has the patient had thoughts that life is not worth living, or of ending it?", ["not worth living", "ending life", "suicidal", "suicide", "die", "better off dead", "hopeless"], { tier: "detailed", teach: "Weight loss from depression is common and treatable; the question about suicidal thoughts is the one that must not be skipped once low mood is found." }),
    IMMUNOCOMPROMISE,
    PREGNANCY,
    // Exposures
    yn("exposure", "tb_contact", "TB contact / past TB", "Any contact with tuberculosis, or past treatment for it?", ["tb", "tuberculosis", "koch", "att", "tb contact", "past tb", "dots"]),
    yn("exposure", "alcohol_tobacco", "Alcohol / tobacco", "How much alcohol and tobacco does the patient use?", ["alcohol", "drinks", "liquor", "tobacco", "smoking", "beedi", "gutkha", "khaini", "pan"]),
    yn("exposure", "drugs", "Medicines", "Any medicines — metformin, thyroxine, anti-tuberculosis drugs, chemotherapy, antidepressants, laxatives, or herbal preparations?", ["metformin", "thyroxine", "att", "chemotherapy", "antidepressant", "laxative", "herbal", "ayurvedic", "medicines", "tablets", "weight loss pills"], { tier: "detailed" }),
    yn("exposure", "occupation_travel", "Occupation / migration / travel", "What is the patient's occupation, and any migration or travel?", ["occupation", "work", "labourer", "migrant", "travel", "returned from", "city", "mines", "factory"], { tier: "detailed" }),
    yn("exposure", "family_history_cancer", "Family history of cancer / diabetes / thyroid", "Any family history of cancer, diabetes, or thyroid disease?", ["family history", "cancer in family", "diabetes in family", "thyroid in family", "mother", "father"], { tier: "detailed" }),
  ],
  differentials: [
    { id: "tuberculosis", name: "Tuberculosis (pulmonary or extrapulmonary)", pointers: ["tb_symptoms", "fever_night_sweats", "cough", "lumps_nodes", "tb_contact"], discriminators: ["tb_symptoms", "fever_night_sweats", "cough", "lumps_nodes", "tb_contact", "gi_symptoms", "immunocompromise", "pain_anywhere"] },
    { id: "malignancy", name: "Malignancy (GI, lung, haematological, other)", pointers: ["bleeding_or_lump", "dysphagia_progressive", "early_satiety_dysphagia", "lumps_nodes", "pain_anywhere"], discriminators: ["bleeding_or_lump", "dysphagia_progressive", "early_satiety_dysphagia", "lumps_nodes", "pain_anywhere", "alcohol_tobacco", "family_history_cancer", "appetite", "cough"] },
    { id: "diabetes", name: "Uncontrolled diabetes", pointers: ["polyuria_polydipsia", "appetite", "polyuria_with_vomiting"], discriminators: ["polyuria_polydipsia", "appetite", "polyuria_with_vomiting", "family_history_cancer", "oral_thrush_recurrent_infections"] },
    { id: "thyrotoxicosis", name: "Thyroid excess", pointers: ["heat_intolerance_palpitations", "appetite", "gi_symptoms"], discriminators: ["heat_intolerance_palpitations", "appetite", "gi_symptoms", "mood_sleep", "drugs", "family_history_cancer"] },
    { id: "hiv", name: "HIV / chronic infection", pointers: ["risk_behaviour_hiv", "oral_thrush_recurrent_infections", "fever_night_sweats", "gi_symptoms"], discriminators: ["risk_behaviour_hiv", "oral_thrush_recurrent_infections", "fever_night_sweats", "gi_symptoms", "lumps_nodes", "occupation_travel"] },
    { id: "malabsorption", name: "Malabsorption / chronic pancreatitis / chronic diarrhoea", pointers: ["gi_symptoms", "appetite", "alcohol_tobacco"], discriminators: ["gi_symptoms", "appetite", "alcohol_tobacco", "pain_anywhere", "polyuria_polydipsia", "tb_contact"] },
    { id: "organ_failure", name: "Chronic organ failure (kidney, liver, heart, lung)", pointers: ["breathlessness_swelling", "jaundice_abdominal_swelling", "appetite"], discriminators: ["breathlessness_swelling", "jaundice_abdominal_swelling", "appetite", "alcohol_tobacco", "cough", "polyuria_polydipsia"] },
    { id: "depression", name: "Depression / eating disorder", pointers: ["mood_sleep", "appetite", "suicidal_thoughts", "intentional_check"], discriminators: ["mood_sleep", "appetite", "suicidal_thoughts", "intentional_check", "fever_night_sweats", "bleeding_or_lump", "dental_swallowing_social"] },
    { id: "poor_intake", name: "Poor intake (dental, social, dysphagia)", pointers: ["dental_swallowing_social", "intake", "early_satiety_dysphagia"], discriminators: ["dental_swallowing_social", "intake", "early_satiety_dysphagia", "appetite", "mood_sleep", "fever_night_sweats"] },
    { id: "adrenal", name: "Adrenal insufficiency", pointers: ["skin_pigmentation_vomiting", "appetite"], discriminators: ["skin_pigmentation_vomiting", "appetite", "drugs", "tb_contact", "polyuria_polydipsia"] },
    { id: "drug_induced", name: "Drug-induced weight loss", pointers: ["drugs"], discriminators: ["drugs", "appetite", "gi_symptoms", "mood_sleep"] },
  ],
  output: {
    durationSlot: "duration",
    hpiOrder: ["onset", "duration", "onset_mode", "amount", "appetite", "intake", "early_satiety_dysphagia", "intentional_check", "progression", "prior_treatment", "prior_investigations"],
  },
};
