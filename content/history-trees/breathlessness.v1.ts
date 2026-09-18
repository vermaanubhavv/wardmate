import type { HistoryTree } from "@/lib/history-check/types";
import { commonHpi, IMMUNOCOMPROMISE, MACLEODS, PREGNANCY, rce, val, yn } from "@/content/history-trees/_helpers";

/**
 * BREATHLESSNESS — v1.0.0. CLINICAL CONTENT: PENDING CLINICIAN REVIEW.
 * Adult medicine ward, north India. Differentials: heart failure, COPD / asthma exacerbation,
 * pneumonia, pulmonary embolism, pleural effusion, anaemia, pneumothorax, metabolic acidosis
 * (DKA, uraemia), tuberculosis, interstitial lung disease.
 */
export const breathlessnessV1: HistoryTree = {
  id: "breathlessness",
  version: "1.0.0",
  complaint: "Breathlessness",
  triggers: ["breathlessness", "breathless", "shortness of breath", "dyspnoea", "dyspnea", "difficulty in breathing", "difficulty breathing", "sob"],
  setting: "Adult medicine ward, north India",
  reviewStatus: "pending_clinician_review",
  reviewedBy: null,
  references: [
    rce("Does this dyspneic patient in the emergency department have congestive heart failure?", 2005, "16234501"),
    rce("Does this patient have pulmonary embolism?", 2003, "14657070"),
    rce("Does this patient have community-acquired pneumonia? Diagnosing pneumonia by history and physical examination", 1997),
    rce("Does this patient have a pleural effusion?", 2009, "19155458"),
    rce("Does this patient have abnormal central venous pressure?", 1996),
    { title: "National TB Elimination Programme: presumptive TB definition", source: "NTEP, Government of India", url: "https://journals.lww.com/ascp/fulltext/2022/10020/national_tb_elimination_program__ntep___at_a.1.aspx" },
    MACLEODS,
  ],
  slots: [
    ...commonHpi("breathlessness"),
    val("hpi", "grade", "Grade / exercise tolerance", "How far can the patient walk or how many stairs before stopping — what is the functional grade?", ["grade", "nyha", "mmrc", "walking", "stairs", "flight", "at rest", "on exertion", "on lying down", "exercise tolerance", "metres", "steps"], { numeric: true }),
    yn("hpi", "orthopnoea", "Orthopnoea", "Is the breathlessness worse lying flat, needing extra pillows?", ["orthopnoea", "orthopnea", "lying flat", "lying down", "pillows", "propped up", "sitting up"]),
    yn("hpi", "pnd", "Paroxysmal nocturnal dyspnoea", "Does the patient wake at night gasping for breath?", ["pnd", "paroxysmal nocturnal", "wakes up", "waking at night", "at night gasping", "night time breathlessness", "nocturnal"]),
    val("hpi", "diurnal_seasonal", "Diurnal / seasonal variation", "Is there a diurnal or seasonal pattern, or a trigger such as dust, cold or smoke?", ["morning", "night", "seasonal", "winter", "dust", "cold", "smoke", "trigger", "triggered by", "pollen", "variation"]),
    yn("associated", "wheeze", "Wheeze", "Any wheeze or whistling sound from the chest?", ["wheeze", "wheezing", "whistling", "wheezy"]),
    yn("associated", "cough", "Cough / sputum", "Any cough, and is the sputum purulent, copious or blood-stained?", ["cough", "sputum", "expectoration", "phlegm", "purulent", "copious", "frothy", "pink frothy"]),
    yn("associated", "fever", "Fever", "Any fever?", ["fever", "febrile", "temperature", "chills", "rigors"]),
    yn("associated", "chest_pain", "Chest pain", "Any chest pain, and is it pleuritic or exertional?", ["chest pain", "pain in chest", "pleuritic", "chest tightness", "chest discomfort"]),
    yn("associated", "leg_swelling", "Leg swelling", "Any swelling of the feet or legs?", ["leg swelling", "pedal oedema", "pedal edema", "swelling of feet", "swollen feet", "swelling of legs", "ankle swelling", "oedema", "edema"]),
    yn("associated", "abdominal_distension", "Abdominal distension", "Any abdominal distension or fullness?", ["abdominal distension", "distension", "distended abdomen", "fullness", "ascites"]),
    yn("associated", "palpitations", "Palpitations", "Any palpitations?", ["palpitations", "palpitation", "racing heart", "irregular heartbeat"]),
    yn("associated", "weight_loss", "Weight loss / night sweats", "Any weight loss or night sweats?", ["weight loss", "lost weight", "night sweats", "night sweat", "loss of appetite"]),
    yn("associated", "urine_output", "Reduced urine output", "Has the urine output reduced, or is the urine frothy?", ["urine output", "decreased urine", "reduced urine", "less urine", "oliguria", "frothy urine", "passing less urine"]),
    yn("associated", "polyuria_polydipsia", "Polyuria / polydipsia / vomiting", "Any excessive urination, thirst, or vomiting (as in ketoacidosis)?", ["polyuria", "polydipsia", "excessive thirst", "excessive urination", "passing more urine", "vomiting", "abdominal pain"], { tier: "detailed" }),
    yn("associated", "pallor_symptoms", "Symptoms of anaemia", "Any easy fatiguability, pallor noticed by family, or blood loss (menorrhagia, black stools)?", ["pallor", "pale", "fatigue", "easy fatiguability", "tiredness", "weakness", "black stools", "malena", "melena", "menorrhagia", "heavy periods", "blood loss"]),
    yn("associated", "anxiety", "Anxiety / hyperventilation", "Any tingling of the fingers or around the mouth, or panic with the episodes?", ["tingling", "perioral", "panic", "anxiety", "anxious", "hyperventilation", "carpopedal"], { tier: "detailed" }),
    // Red flags
    yn("red_flag", "rest_dyspnoea", "Breathless at rest / unable to speak", "Is the patient breathless at rest or unable to complete sentences?", ["at rest", "unable to speak", "cannot speak", "cannot complete sentences", "sentences", "gasping", "severe breathlessness"]),
    yn("red_flag", "sudden_onset", "Sudden onset", "Did it begin suddenly, over minutes?", ["sudden", "suddenly", "abrupt", "over minutes", "all of a sudden"]),
    yn("red_flag", "haemoptysis", "Haemoptysis", "Any blood in the sputum?", ["haemoptysis", "hemoptysis", "blood in sputum", "coughing blood", "blood in cough"]),
    yn("red_flag", "syncope", "Syncope / giddiness", "Any fainting or giddiness?", ["syncope", "fainted", "fainting", "blackout", "collapse", "giddiness", "giddy", "dizziness"]),
    yn("red_flag", "altered_sensorium", "Drowsiness / confusion", "Any drowsiness or confusion?", ["drowsy", "drowsiness", "confused", "confusion", "altered sensorium", "irritable", "disoriented"]),
    yn("red_flag", "cyanosis_symptoms", "Bluish lips / nails", "Any bluish discolouration of lips or nails noticed?", ["bluish", "blue lips", "blue nails", "cyanosis", "cyanosed", "discolouration"]),
    yn("red_flag", "recent_immobilisation", "Recent immobilisation / surgery / calf pain", "Any recent surgery, bed rest, long travel, or calf pain or swelling?", ["immobilisation", "immobilization", "bed rest", "bedridden", "long travel", "long journey", "recent surgery", "operated", "calf pain", "calf swelling", "plaster", "dvt"]),
    yn("red_flag", "cardiac_history", "Known heart / lung / kidney disease", "Any known heart disease, hypertension, COPD, asthma, kidney disease or diabetes?", ["heart disease", "heart failure", "ihd", "cad", "hypertension", "copd", "asthma", "asthmatic", "kidney disease", "ckd", "dialysis", "diabetes", "diabetic", "valve", "rheumatic"]),
    IMMUNOCOMPROMISE,
    PREGNANCY,
    // Exposures
    yn("exposure", "smoking_biomass", "Smoking / biomass smoke", "Any smoking, or cooking with wood or cow-dung fuel (biomass smoke)?", ["smoker", "smoking", "beedi", "cigarette", "hookah", "chulha", "wood fire", "biomass", "cow dung", "smoke exposure", "kitchen smoke"]),
    yn("exposure", "occupation", "Occupational / dust exposure", "Any occupational dust, stone, mining, farming or bird exposure?", ["occupation", "occupational", "dust", "stone", "mining", "quarry", "farmer", "farming", "birds", "pigeons", "cotton", "silica", "construction"]),
    yn("exposure", "tb_contact", "TB contact / past TB", "Any past tuberculosis or contact with a TB patient?", ["tb", "tuberculosis", "koch", "att", "akt", "dots", "tb contact", "past tb"]),
    yn("exposure", "drugs", "Drugs that affect the lungs / heart", "Any long-term drugs such as amiodarone, methotrexate, nitrofurantoin, beta-blockers or NSAIDs?", ["amiodarone", "methotrexate", "nitrofurantoin", "beta blocker", "nsaid", "painkillers", "drug history", "on medication"], { tier: "detailed" }),
  ],
  differentials: [
    { id: "heart_failure", name: "Heart failure", pointers: ["orthopnoea", "pnd", "leg_swelling", "cardiac_history", "abdominal_distension"], discriminators: ["orthopnoea", "pnd", "leg_swelling", "cardiac_history", "palpitations", "grade", "chest_pain", "abdominal_distension"] },
    { id: "copd_asthma", name: "COPD / asthma exacerbation", pointers: ["wheeze", "smoking_biomass", "diurnal_seasonal", "cough"], discriminators: ["wheeze", "smoking_biomass", "diurnal_seasonal", "cough", "fever", "rest_dyspnoea"] },
    { id: "pneumonia", name: "Pneumonia", pointers: ["fever", "cough", "chest_pain"], discriminators: ["fever", "cough", "chest_pain", "haemoptysis", "altered_sensorium", "tb_contact"] },
    { id: "pe", name: "Pulmonary embolism", pointers: ["sudden_onset", "recent_immobilisation", "haemoptysis", "chest_pain"], discriminators: ["sudden_onset", "recent_immobilisation", "haemoptysis", "chest_pain", "syncope", "palpitations"] },
    { id: "effusion", name: "Pleural effusion", pointers: ["chest_pain", "tb_contact", "weight_loss"], discriminators: ["chest_pain", "tb_contact", "weight_loss", "fever", "cough"] },
    { id: "anaemia", name: "Anaemia", pointers: ["pallor_symptoms"], discriminators: ["pallor_symptoms", "grade", "palpitations", "weight_loss"] },
    { id: "pneumothorax", name: "Pneumothorax", pointers: ["sudden_onset", "chest_pain"], discriminators: ["sudden_onset", "chest_pain", "smoking_biomass", "tb_contact"] },
    { id: "metabolic", name: "Metabolic acidosis (DKA / uraemia)", pointers: ["polyuria_polydipsia", "urine_output", "cardiac_history"], discriminators: ["polyuria_polydipsia", "urine_output", "altered_sensorium", "cardiac_history"] },
    { id: "tb", name: "Tuberculosis", pointers: ["tb_contact", "weight_loss", "cough", "haemoptysis"], discriminators: ["tb_contact", "weight_loss", "cough", "haemoptysis", "fever", "immunocompromise"] },
    { id: "ild", name: "Interstitial lung disease", pointers: ["occupation", "drugs"], discriminators: ["occupation", "drugs", "cough", "grade", "progression"] },
  ],
  output: {
    durationSlot: "duration",
    hpiOrder: ["onset", "duration", "onset_mode", "grade", "orthopnoea", "pnd", "diurnal_seasonal", "progression", "prior_treatment", "prior_investigations"],
  },
};
