import type { HistoryTree } from "@/lib/history-check/types";
import { commonHpi, IMMUNOCOMPROMISE, MACLEODS, PREGNANCY, rce, val, yn } from "@/content/history-trees/_helpers";

/**
 * GENERALISED SWELLING (OEDEMA) — v1.0.0. CLINICAL CONTENT: PENDING CLINICIAN REVIEW.
 * Adult medicine ward, north India. Differentials: nephrotic syndrome, heart failure, chronic
 * liver disease, chronic kidney disease / acute glomerulonephritis, severe anaemia /
 * hypoalbuminaemia (malnutrition), hypothyroidism, drug-induced oedema, deep vein thrombosis
 * (unilateral), filariasis / lymphoedema, constrictive pericarditis.
 */
export const oedemaV1: HistoryTree = {
  id: "oedema",
  version: "1.0.0",
  complaint: "Swelling of the body",
  triggers: ["swelling", "oedema", "edema", "anasarca", "pedal oedema", "pedal edema", "swelling of feet", "swelling of legs", "facial puffiness", "puffiness"],
  setting: "Adult medicine ward, north India",
  reviewStatus: "pending_clinician_review",
  reviewedBy: null,
  references: [
    rce("Does this dyspneic patient in the emergency department have congestive heart failure?", 2005, "16234501"),
    rce("Does this patient with liver disease have cirrhosis?", 2012, "22357834"),
    rce("Does this patient have deep vein thrombosis?", 1998, "9546569"),
    rce("The rational clinical examination. Does this patient have ascites? How to divine fluid in the abdomen", 1992),
    { title: "Peripheral Edema: Evaluation and Management in Primary Care", source: "American Family Physician", year: 2022, url: "https://www.aafp.org/afp/2022/1100/peripheral-edema" },
    MACLEODS,
  ],
  slots: [
    ...commonHpi("swelling"),
    val("hpi", "where_started", "Where it started", "Where did the swelling start — face and eyelids, feet, or abdomen — and how did it spread?", ["face", "eyelids", "periorbital", "puffiness", "feet", "ankles", "legs", "abdomen", "started in", "then spread", "spread to", "generalised", "whole body"]),
    val("hpi", "diurnal", "Diurnal variation", "Is the swelling worse in the morning (face) or by evening (feet)?", ["morning", "evening", "on waking", "by evening", "end of the day", "diurnal", "after standing"]),
    val("hpi", "distribution", "Symmetry", "Is the swelling on both sides equally, or one limb only?", ["both", "bilateral", "symmetrical", "one leg", "unilateral", "one side", "left leg", "right leg", "asymmetrical"]),
    yn("hpi", "pitting", "Pitting", "Does the swelling pit on pressure (as noticed by the patient or family)?", ["pitting", "pits", "dent", "impression", "non pitting", "non-pitting"], { tier: "detailed" }),
    yn("associated", "frothy_urine", "Frothy urine / reduced output", "Is the urine frothy, or has the output reduced?", ["frothy urine", "froth", "foamy", "urine output", "decreased urine", "reduced urine", "less urine", "oliguria"]),
    yn("associated", "haematuria", "Blood in urine / cola urine", "Any blood or cola-coloured urine?", ["haematuria", "hematuria", "blood in urine", "cola coloured", "red urine", "smoky urine"]),
    yn("associated", "breathlessness_orthopnoea", "Breathlessness / orthopnoea / PND", "Any breathlessness, breathlessness on lying flat, or waking at night gasping?", ["breathlessness", "breathless", "shortness of breath", "orthopnoea", "orthopnea", "pillows", "pnd", "wakes up gasping", "dyspnoea"]),
    yn("associated", "abdominal_distension", "Abdominal distension", "Any abdominal distension?", ["abdominal distension", "distension", "distended", "ascites", "fullness"]),
    yn("associated", "jaundice", "Jaundice / alcohol / liver disease", "Any jaundice, alcohol use, or known liver disease?", ["jaundice", "yellow", "alcohol", "drinker", "liver disease", "cirrhosis", "hepatitis"]),
    yn("associated", "sore_throat_skin_infection", "Recent sore throat / skin infection", "Any sore throat or skin infection in the preceding weeks (post-infectious nephritis)?", ["sore throat", "throat infection", "skin infection", "boils", "impetigo", "pyoderma", "two weeks ago", "weeks before"], { tier: "detailed" }),
    yn("associated", "fatigue_pallor", "Fatigue / pallor", "Any easy fatiguability or pallor?", ["fatigue", "tiredness", "weakness", "pallor", "pale", "easy fatiguability"]),
    yn("associated", "cold_intolerance", "Cold intolerance / constipation / weight gain", "Any cold intolerance, constipation, hoarseness, or weight gain (hypothyroidism)?", ["cold intolerance", "constipation", "hoarseness", "weight gain", "lethargy", "hair loss", "thyroid"], { tier: "detailed" }),
    yn("associated", "diet", "Diet / intake", "What is the diet like — any prolonged poor intake or protein deficiency?", ["diet", "intake", "poor intake", "malnourished", "not eating", "vegetarian", "protein"], { tier: "detailed" }),
    yn("associated", "joint_pain_rash", "Joint pain / rash / oral ulcers", "Any joint pain, rash, oral ulcers or hair loss (connective tissue disease)?", ["joint pain", "arthralgia", "rash", "oral ulcers", "mouth ulcers", "hair loss", "photosensitivity", "lupus"], { tier: "detailed" }),
    yn("associated", "calf_pain", "Calf pain / unilateral swelling", "Is one calf painful or swollen more than the other?", ["calf pain", "calf tenderness", "one leg", "unilateral", "painful swelling"]),
    // Red flags
    yn("red_flag", "urine_output", "Reduced urine output", "Has the urine output reduced markedly?", ["urine output", "decreased urine", "reduced urine", "less urine", "oliguria", "anuria", "not passing urine"], { teach: "Reduced or frothy urine with swelling points to the kidney; a normal output points elsewhere." }),
    yn("red_flag", "rest_dyspnoea", "Breathless at rest", "Is the patient breathless at rest?", ["at rest", "unable to speak", "gasping", "severe breathlessness"], { teach: "Swelling with breathlessness at rest or when lying flat points to heart failure and fluid in the lungs." }),
    yn("red_flag", "altered_sensorium", "Drowsiness / confusion", "Any drowsiness or confusion?", ["drowsy", "drowsiness", "confused", "confusion", "altered sensorium", "disoriented"], { teach: "Confusion in an oedematous patient raises uraemia, hepatic encephalopathy and severe hyponatraemia." }),
    yn("red_flag", "chest_pain", "Chest pain", "Any chest pain?", ["chest pain", "pain in chest", "chest discomfort"], { teach: "Chest pain with new swelling of the legs raises a cardiac cause and pulmonary embolism from a leg clot." }),
    yn("red_flag", "hypertension_diabetes", "Hypertension / diabetes / kidney disease", "Is the patient hypertensive, diabetic, or known to have kidney disease?", ["hypertension", "hypertensive", "blood pressure", "diabetes", "diabetic", "kidney disease", "ckd", "renal", "dialysis", "creatinine"], { teach: "Long-standing hypertension or diabetes makes kidney and heart disease the likely causes." }),
    yn("red_flag", "cardiac_history", "Known heart disease", "Any known heart disease, rheumatic fever, or prior heart attack?", ["heart disease", "heart failure", "rheumatic", "valve", "heart attack", "ihd", "cad", "cardiomyopathy"], { teach: "Prior heart disease, rheumatic fever or a known valve lesion points to a cardiac cause." }),
    yn("red_flag", "drugs", "Drugs that cause oedema / kidney injury", "Any amlodipine, NSAIDs, steroids, or other new drugs?", ["amlodipine", "nifedipine", "nsaid", "painkillers", "steroid", "steroids", "pioglitazone", "drug history", "on medication", "new medicine"], { teach: "Amlodipine, NSAIDs, steroids and pioglitazone cause swelling; asking about every tablet avoids a search for a disease that is not there." }),
    PREGNANCY,
    IMMUNOCOMPROMISE,
    // Exposures
    yn("exposure", "filariasis_area", "Filaria-endemic area / recurrent limb swelling", "Does the patient live in a filaria-endemic area, or have recurrent episodes of limb swelling with fever?", ["filaria", "filariasis", "elephantiasis", "endemic", "recurrent swelling", "lymphangitis"], { tier: "detailed" }),
    yn("exposure", "tb_contact", "TB contact / past TB", "Any past tuberculosis or contact (constrictive pericarditis, TB peritonitis)?", ["tb", "tuberculosis", "koch", "att", "akt", "tb contact", "past tb"], { tier: "detailed" }),
  ],
  differentials: [
    { id: "nephrotic", name: "Nephrotic syndrome", pointers: ["where_started", "frothy_urine", "diurnal"], discriminators: ["where_started", "frothy_urine", "diurnal", "haematuria", "hypertension_diabetes", "drugs", "joint_pain_rash"] },
    { id: "heart_failure", name: "Heart failure", pointers: ["breathlessness_orthopnoea", "cardiac_history", "diurnal"], discriminators: ["breathlessness_orthopnoea", "cardiac_history", "chest_pain", "diurnal", "where_started", "rest_dyspnoea"] },
    { id: "liver", name: "Chronic liver disease", pointers: ["jaundice", "abdominal_distension"], discriminators: ["jaundice", "abdominal_distension", "altered_sensorium", "where_started"] },
    { id: "kidney", name: "Kidney disease (CKD / nephritis)", pointers: ["urine_output", "haematuria", "hypertension_diabetes", "sore_throat_skin_infection"], discriminators: ["urine_output", "haematuria", "hypertension_diabetes", "sore_throat_skin_infection", "fatigue_pallor", "drugs"] },
    { id: "hypoalbuminaemia", name: "Malnutrition / severe anaemia", pointers: ["diet", "fatigue_pallor"], discriminators: ["diet", "fatigue_pallor", "abdominal_distension", "breathlessness_orthopnoea"] },
    { id: "hypothyroid", name: "Hypothyroidism", pointers: ["cold_intolerance", "pitting"], discriminators: ["cold_intolerance", "pitting", "where_started"] },
    { id: "drug", name: "Drug-induced oedema", pointers: ["drugs"], discriminators: ["drugs", "distribution", "diurnal"] },
    { id: "dvt", name: "Deep vein thrombosis", pointers: ["distribution", "calf_pain"], discriminators: ["distribution", "calf_pain", "chest_pain", "rest_dyspnoea"] },
    { id: "lymphoedema", name: "Filariasis / lymphoedema", pointers: ["filariasis_area", "distribution", "pitting"], discriminators: ["filariasis_area", "distribution", "pitting", "duration"] },
    { id: "constrictive", name: "Constrictive pericarditis / TB", pointers: ["tb_contact", "abdominal_distension"], discriminators: ["tb_contact", "abdominal_distension", "breathlessness_orthopnoea", "where_started"] },
  ],
  output: {
    durationSlot: "duration",
    hpiOrder: ["onset", "duration", "onset_mode", "where_started", "diurnal", "distribution", "pitting", "progression", "prior_treatment", "prior_investigations"],
  },
};
