import type { HistoryTree } from "@/lib/history-check/types";
import { commonHpi, IMMUNOCOMPROMISE, MACLEODS, PREGNANCY, val, yn } from "@/content/history-trees/_helpers";

/**
 * GENERALISED WEAKNESS / FATIGUE / PALLOR — v1.0.0. CLINICAL CONTENT: PENDING CLINICIAN REVIEW.
 * The "weakness all over" admission. Differentials: anaemia (iron, B12, chronic disease,
 * haemolysis, marrow failure), uncontrolled diabetes / hypoglycaemia, thyroid deficiency,
 * chronic kidney disease, chronic liver disease, tuberculosis and chronic infection (HIV),
 * malignancy, heart failure, depression, electrolyte disturbance (hypokalaemia,
 * hyponatraemia), adrenal insufficiency.
 */
export const weaknessFatigueV1: HistoryTree = {
  id: "weakness_fatigue",
  version: "1.0.0",
  complaint: "Generalised weakness / fatigue",
  triggers: ["generalised weakness", "generalized weakness", "weakness all over", "fatigue", "tiredness", "easy fatigability", "easy fatiguability", "lethargy", "pallor", "anaemia", "anemia", "not feeling well", "malaise", "body weakness", "low haemoglobin", "low hb"],
  setting: "Adult medicine ward, north India",
  reviewStatus: "pending_clinician_review",
  reviewedBy: null,
  references: [
    { title: "Anaemia Mukt Bharat: operational guidelines", source: "Ministry of Health and Family Welfare, India", year: 2018 },
    { title: "British Society of Gastroenterology guidelines for the management of iron deficiency anaemia in adults", source: "Gut", year: 2021, pmid: "34497146" },
    { title: "Fatigue in primary care: evaluation (systematic review)", source: "BMJ", year: 2010 },
    MACLEODS,
  ],
  slots: [
    ...commonHpi("weakness"),
    val("hpi", "meaning", "What the patient means by weakness", "Is it tiredness and lack of energy, true loss of muscle power, breathlessness on effort, or sleepiness?", ["tiredness", "tired", "no energy", "lack of energy", "cannot work", "muscle power", "cannot lift", "breathless on", "sleepy", "sleepiness", "exhausted", "meaning"]),
    val("hpi", "effort_tolerance", "Effort tolerance", "How far can the patient walk, or how many stairs, before stopping, compared with before?", ["walk", "stairs", "floors", "metres", "km", "before stopping", "used to", "compared", "effort", "tolerance", "housework"], { numeric: true }),
    val("hpi", "pattern", "Pattern through the day", "Is it worse in the morning, the evening, after meals, or constant?", ["morning", "evening", "after meals", "constant", "all day", "worse", "better", "pattern", "afternoon"], { tier: "detailed" }),
    yn("hpi", "breathlessness_palpitations", "Breathlessness / palpitations on effort", "Any breathlessness or palpitations on exertion?", ["breathlessness", "breathless", "dyspnoea", "palpitations", "on exertion", "on walking", "climbing"]),
    yn("hpi", "giddiness", "Giddiness / blackouts", "Any giddiness on standing, or blackouts?", ["giddiness", "giddy", "dizziness", "blackout", "fainting", "syncope", "light headed"]),
    yn("hpi", "weight_change", "Weight change", "Has the weight gone up or down, and by how much?", ["weight loss", "lost weight", "weight gain", "gained weight", "weight", "kg", "thinner", "clothes loose"]),
    yn("hpi", "appetite", "Appetite", "Has the appetite changed?", ["appetite", "anorexia", "not eating", "eating less", "eating more", "hunger"]),
    yn("hpi", "sleep", "Sleep", "How is the sleep — too little, too much, or unrefreshing, and any snoring?", ["sleep", "sleeping", "insomnia", "not sleeping", "sleeping too much", "unrefreshing", "snoring", "daytime sleepiness"], { tier: "detailed" }),
    // Associated
    yn("associated", "pallor_noticed", "Pallor noticed", "Has anyone noticed the patient looking pale?", ["pale", "pallor", "looking white", "anaemic", "anemic"]),
    yn("associated", "blood_loss", "Blood loss", "Any heavy periods, black stools, blood in stool or urine, or nosebleeds?", ["heavy periods", "menorrhagia", "black stools", "melaena", "blood in stool", "piles", "haemorrhoids", "blood in urine", "nosebleed", "bleeding"]),
    yn("associated", "diet", "Diet", "What does the patient eat — vegetarian, how many meals, any green vegetables, pulses, meat, milk?", ["vegetarian", "veg", "non veg", "meals", "green vegetables", "pulses", "dal", "meat", "milk", "diet", "eats", "food", "tea only"]),
    yn("associated", "pica_tongue_nails", "Pica / sore tongue / cracked mouth angles / brittle nails", "Any craving for mud, ice or raw rice, a sore tongue, cracked mouth corners, or brittle nails?", ["pica", "mud", "clay", "ice", "raw rice", "sore tongue", "burning tongue", "cracked", "angular", "brittle nails", "spoon nails"], { tier: "detailed" }),
    yn("associated", "tingling_numbness", "Tingling / numbness / unsteadiness", "Any tingling of the feet, numbness, or unsteadiness in the dark (B12)?", ["tingling", "numbness", "pins and needles", "unsteady", "in the dark", "balance", "burning feet"], { tier: "detailed" }),
    yn("associated", "jaundice_dark_urine", "Yellow eyes / dark urine", "Any yellowness of the eyes or dark urine (haemolysis, liver disease)?", ["jaundice", "yellow", "dark urine", "cola", "icterus"], { tier: "detailed" }),
    yn("associated", "polyuria_polydipsia", "Excess urine / thirst", "Any excessive urination, thirst, or night-time urination?", ["polyuria", "passing more urine", "thirst", "thirsty", "polydipsia", "nocturia", "at night", "sugar"]),
    yn("associated", "cold_intolerance_constipation", "Cold intolerance / constipation / dry skin / hoarse voice", "Any intolerance of cold, constipation, dry skin, hoarse voice, or swelling of the face?", ["cold intolerance", "feels cold", "constipation", "dry skin", "hoarse", "voice", "puffy face", "facial swelling", "hair loss", "thyroid"], { tier: "detailed" }),
    yn("associated", "fever_night_sweats_cough", "Fever / night sweats / cough", "Any low-grade fever, night sweats, or chronic cough?", ["fever", "low grade", "evening rise", "night sweats", "cough", "chronic cough"]),
    yn("associated", "swelling_frothy_urine", "Swelling / frothy urine / reduced urine", "Any swelling of the face or legs, frothy urine, or reduced urine (kidney)?", ["swelling", "oedema", "puffiness", "frothy urine", "reduced urine", "less urine", "kidney"], { tier: "detailed" }),
    yn("associated", "mood", "Mood / interest / hopelessness", "Has the patient felt low, lost interest in things, or felt hopeless for more than two weeks?", ["low mood", "sad", "depressed", "lost interest", "hopeless", "crying", "worthless", "not interested", "two weeks", "suicid"]),
    yn("associated", "lumps_bone_pain", "Lumps / bone pain / bruising", "Any lumps in the neck, armpit or groin, bone pain, or easy bruising?", ["lump", "lumps", "swelling in neck", "armpit", "groin", "bone pain", "bruising", "bleeding gums", "petechiae"], { tier: "detailed" }),
    // Red flags
    yn("red_flag", "breathless_at_rest_chest_pain", "Breathlessness at rest / chest pain", "Is the patient breathless at rest, or having chest pain?", ["breathless at rest", "at rest", "chest pain", "angina", "cannot lie flat", "orthopnoea"], { teach: "Severe anaemia decompensates as angina and heart failure; these symptoms mark the patient who cannot wait for a slow correction." }),
    yn("red_flag", "bleeding_bruising_fever", "Bleeding, bruising or fever with weakness", "Any bleeding, bruising, petechiae, or fever with the weakness?", ["bleeding", "bruising", "petechiae", "gum bleeding", "fever", "infections"], { teach: "Anaemia with bleeding or fever means all three cell lines may be low: marrow failure, leukaemia, or severe infection." }),
    yn("red_flag", "weight_loss_marked", "Marked weight loss", "Has there been marked, unintentional weight loss?", ["weight loss", "lost weight", "marked", "kg", "clothes loose", "wasting", "unintentional"], { teach: "Unintentional weight loss with fatigue moves tuberculosis, malignancy, HIV and uncontrolled diabetes to the top of the list." }),
    yn("red_flag", "altered_sensorium_hypoglycaemia", "Confusion / drowsiness / hypoglycaemia symptoms", "Any confusion, drowsiness, sweating spells, or known diabetes on treatment?", ["confusion", "confused", "drowsy", "drowsiness", "sweating spells", "diabetes", "insulin", "sugar low", "hypoglycaemia"], { teach: "Weakness with drowsiness is a metabolic emergency until the sugar, sodium and urea are known." }),
    yn("red_flag", "vomiting_pigmentation_hypotension", "Vomiting, darkening of skin, giddiness on standing", "Any vomiting, darkening of the skin or gums, salt craving, or giddiness on standing?", ["vomiting", "darkening", "pigmentation", "dark gums", "salt craving", "giddy on standing", "postural", "low bp", "steroid stopped"], { teach: "Adrenal insufficiency, including after stopping long-term steroids, presents as weakness with vomiting and postural giddiness and is fatal if missed." }),
    yn("red_flag", "muscle_weakness_true", "True muscle weakness", "Is there difficulty lifting the arms, rising from squatting, or holding the head up (hypokalaemia, myopathy, neuromuscular)?", ["cannot lift", "rising from", "squatting", "climbing stairs", "head drop", "cannot hold", "true weakness", "muscle weakness", "paralysis", "cannot walk"], { teach: "True loss of power, as opposed to tiredness, belongs to the limb-weakness tree and needs potassium checked today." }),
    yn("red_flag", "chronic_disease_known", "Known kidney, liver, heart or thyroid disease / HIV", "Any known kidney, liver, heart or thyroid disease, or HIV?", ["kidney disease", "ckd", "dialysis", "liver disease", "cirrhosis", "heart failure", "heart disease", "thyroid", "hypothyroid", "hiv"], { teach: "Fatigue in a patient with a known chronic disease usually means that disease has progressed or a complication has been added." }),
    IMMUNOCOMPROMISE,
    PREGNANCY,
    // Exposures
    yn("exposure", "worms_barefoot", "Barefoot / worm infestation / deworming", "Does the patient walk barefoot in fields, or pass worms, and when was the last deworming?", ["barefoot", "fields", "worms", "deworming", "albendazole", "hookworm"], { tier: "detailed" }),
    yn("exposure", "drugs_toxins", "Drugs / toxins", "Any anti-tuberculosis drugs, chemotherapy, anticonvulsants, painkillers, or exposure to lead or pesticides?", ["att", "akt", "chemotherapy", "phenytoin", "carbamazepine", "painkillers", "nsaid", "lead", "pesticide", "drug", "medicines"], { tier: "detailed" }),
    yn("exposure", "alcohol_tobacco", "Alcohol / tobacco", "Any alcohol or tobacco use?", ["alcohol", "drinks", "tobacco", "smoking", "beedi", "gutkha"], { tier: "detailed" }),
    yn("exposure", "family_history_anaemia", "Family history of anaemia / transfusions", "Any family history of anaemia, transfusions, or thalassaemia or sickle cell disease?", ["family history", "thalassaemia", "thalassemia", "sickle", "transfusions in family", "anaemia in family"], { tier: "detailed" }),
    yn("exposure", "menstrual_obstetric", "Menstrual and obstetric history", "For women: how heavy and how frequent are the periods, and how many pregnancies and how close together?", ["periods", "menses", "menstrual", "heavy", "clots", "days", "pregnancies", "deliveries", "gravida", "para", "spacing", "breastfeeding"]),
  ],
  differentials: [
    { id: "iron_deficiency", name: "Iron-deficiency anaemia", pointers: ["pallor_noticed", "blood_loss", "diet", "pica_tongue_nails", "menstrual_obstetric"], discriminators: ["pallor_noticed", "blood_loss", "diet", "pica_tongue_nails", "menstrual_obstetric", "worms_barefoot", "breathlessness_palpitations", "weight_loss_marked"] },
    { id: "b12_folate", name: "B12 / folate deficiency", pointers: ["diet", "tingling_numbness", "jaundice_dark_urine", "pica_tongue_nails"], discriminators: ["diet", "tingling_numbness", "jaundice_dark_urine", "pica_tongue_nails", "mood", "alcohol_tobacco"] },
    { id: "haemolysis_marrow", name: "Haemolysis / marrow failure / haematological malignancy", pointers: ["jaundice_dark_urine", "bleeding_bruising_fever", "lumps_bone_pain", "family_history_anaemia"], discriminators: ["jaundice_dark_urine", "bleeding_bruising_fever", "lumps_bone_pain", "family_history_anaemia", "drugs_toxins", "fever_night_sweats_cough"] },
    { id: "diabetes", name: "Uncontrolled diabetes / hypoglycaemia", pointers: ["polyuria_polydipsia", "weight_change", "altered_sensorium_hypoglycaemia"], discriminators: ["polyuria_polydipsia", "weight_change", "altered_sensorium_hypoglycaemia", "appetite", "chronic_disease_known"] },
    { id: "hypothyroid", name: "Thyroid deficiency", pointers: ["cold_intolerance_constipation", "weight_change", "sleep"], discriminators: ["cold_intolerance_constipation", "weight_change", "sleep", "mood", "menstrual_obstetric", "chronic_disease_known"] },
    { id: "ckd", name: "Chronic kidney disease", pointers: ["swelling_frothy_urine", "chronic_disease_known", "appetite"], discriminators: ["swelling_frothy_urine", "chronic_disease_known", "appetite", "polyuria_polydipsia", "pallor_noticed", "vomiting_pigmentation_hypotension"] },
    { id: "tb_chronic_infection", name: "Tuberculosis / chronic infection (HIV)", pointers: ["fever_night_sweats_cough", "weight_loss_marked", "lumps_bone_pain"], discriminators: ["fever_night_sweats_cough", "weight_loss_marked", "lumps_bone_pain", "immunocompromise", "appetite"] },
    { id: "malignancy", name: "Occult malignancy", pointers: ["weight_loss_marked", "blood_loss", "lumps_bone_pain"], discriminators: ["weight_loss_marked", "blood_loss", "lumps_bone_pain", "appetite", "alcohol_tobacco", "duration"] },
    { id: "heart_failure", name: "Heart failure", pointers: ["breathlessness_palpitations", "breathless_at_rest_chest_pain", "chronic_disease_known"], discriminators: ["breathlessness_palpitations", "breathless_at_rest_chest_pain", "chronic_disease_known", "swelling_frothy_urine", "effort_tolerance"] },
    { id: "depression", name: "Depression", pointers: ["mood", "sleep", "appetite"], discriminators: ["mood", "sleep", "appetite", "pattern", "weight_change", "pallor_noticed"] },
    { id: "adrenal", name: "Adrenal insufficiency", pointers: ["vomiting_pigmentation_hypotension", "giddiness", "appetite"], discriminators: ["vomiting_pigmentation_hypotension", "giddiness", "appetite", "weight_change", "drugs_toxins"] },
    { id: "electrolyte", name: "Hypokalaemia / hyponatraemia", pointers: ["muscle_weakness_true", "drugs_toxins"], discriminators: ["muscle_weakness_true", "drugs_toxins", "vomiting_pigmentation_hypotension", "altered_sensorium_hypoglycaemia"] },
  ],
  output: {
    durationSlot: "duration",
    hpiOrder: ["onset", "duration", "onset_mode", "meaning", "effort_tolerance", "pattern", "breathlessness_palpitations", "giddiness", "weight_change", "appetite", "sleep", "progression", "prior_treatment", "prior_investigations"],
  },
};
