import type { HistoryTree } from "@/lib/history-check/types";
import { commonHpi, IMMUNOCOMPROMISE, MACLEODS, rce, val, yn } from "@/content/history-trees/_helpers";

/**
 * CHEST PAIN — v1.0.0. CLINICAL CONTENT: REVIEWED.
 * Adult medicine ward, north India. Differentials a resident is expected to weigh at the
 * bedside: acute coronary syndrome, aortic dissection, pulmonary embolism, pericarditis,
 * pneumonia / pleurisy, pneumothorax, oesophageal / peptic, musculoskeletal, herpes zoster.
 * Must-not-miss slots are the features that separate the four killers. No doses, no advice.
 */
export const chestPainV1: HistoryTree = {
  id: "chest_pain",
  version: "1.0.0",
  complaint: "Chest pain",
  triggers: ["chest pain", "pain in chest", "chest discomfort", "chest heaviness", "retrosternal pain", "angina"],
  setting: "Adult medicine ward, north India",
  reviewStatus: "reviewed",
  reviewedBy: "Dr. Anubhav, General Surgery — 2026-09-26",
  references: [
    rce("Does this patient with chest pain have acute coronary syndrome? The Rational Clinical Examination systematic review", 2015, "26547467"),
    rce("Does this patient have an acute thoracic aortic dissection?", 2002, "11980527"),
    rce("Does this patient have pulmonary embolism?", 2003, "14657070"),
    rce("Does this patient have community-acquired pneumonia? Diagnosing pneumonia by history and physical examination", 1997),
    rce("Does this patient have a pleural effusion?", 2009, "19155458"),
    MACLEODS,
  ],
  slots: [
    ...commonHpi("chest pain"),
    val("hpi", "site", "Site", "Where exactly is the pain — central, left, right, or diffuse?", ["central", "retrosternal", "left side", "left sided", "right side", "right sided", "precordial", "substernal", "site", "epigastric", "diffuse"]),
    val("hpi", "character", "Character", "What is the pain like — pressure, tightness, sharp, tearing, burning?", ["pressure", "tightness", "heaviness", "squeezing", "sharp", "stabbing", "tearing", "ripping", "burning", "dull", "aching", "pricking", "crushing"]),
    val("hpi", "radiation", "Radiation", "Does the pain go anywhere — arm, jaw, back, shoulder?", ["radiating", "radiates", "radiation", "left arm", "right arm", "both arms", "jaw", "neck", "back", "shoulder", "interscapular", "epigastrium"]),
    val("hpi", "severity", "Severity", "How severe is the pain, and did it reach maximum intensity at onset?", ["severe", "mild", "moderate", "worst", "maximum", "10/10", "out of 10", "severity", "intensity", "at onset"], { numeric: true }),
    val("hpi", "pattern", "Pattern / duration of episodes", "Is the pain continuous or in episodes, and how long does each last?", ["continuous", "episodes", "episodic", "minutes", "lasting", "lasts", "comes and goes", "intermittent", "constant", "seconds"]),
    val("hpi", "exertional", "Relation to exertion", "Is it brought on by exertion and relieved by rest?", ["exertion", "exertional", "on walking", "on climbing", "rest", "relieved by rest", "at rest", "effort", "activity", "walking"]),
    val("hpi", "positional_pleuritic", "Relation to breathing / posture", "Is it worse on deep breathing, coughing, or lying flat, and better sitting forward?", ["deep breath", "breathing", "inspiration", "coughing", "lying down", "lying flat", "sitting forward", "leaning forward", "posture", "position", "movement", "pleuritic"]),
    yn("hpi", "sweating", "Sweating with pain", "Was there sweating with the pain?", ["sweating", "diaphoresis", "profuse sweating", "cold sweat", "sweat"]),
    yn("associated", "nausea_vomiting", "Nausea / vomiting", "Any nausea or vomiting with the pain?", ["nausea", "vomiting", "vomited", "vomit", "nauseated"]),
    yn("associated", "palpitations", "Palpitations", "Any palpitations?", ["palpitations", "palpitation", "racing heart", "heart racing", "pounding"]),
    yn("associated", "cough", "Cough / sputum", "Any cough or sputum, and for how long?", ["cough", "sputum", "expectoration", "phlegm"]),
    yn("associated", "fever", "Fever", "Any fever?", ["fever", "febrile", "temperature", "chills", "rigors"]),
    yn("associated", "heartburn", "Heartburn / relation to food", "Any heartburn, acid regurgitation, or relation to meals?", ["heartburn", "acidity", "regurgitation", "after food", "after meals", "on eating", "water brash", "belching", "relation to food"]),
    yn("associated", "chest_wall_tenderness", "Tenderness / trauma", "Is the chest wall tender to touch, or was there any injury or heavy lifting?", ["tender", "tenderness", "on touching", "on pressing", "trauma", "injury", "lifting", "strain", "fall"], { tier: "detailed" }),
    yn("associated", "rash", "Rash along the pain", "Any vesicular rash or burning along a band of skin?", ["rash", "vesicles", "blisters", "herpes", "zoster", "band"], { tier: "detailed" }),
    yn("associated", "previous_episodes", "Previous similar episodes", "Have there been similar episodes before, and were they evaluated?", ["previous episode", "previous episodes", "similar episode", "similar episodes", "earlier", "before this", "first time", "first episode", "history of similar"]),
    yn("associated", "recent_immobilisation", "Recent immobilisation / surgery / travel", "Any recent surgery, prolonged bed rest, long travel, or leg swelling?", ["immobilisation", "immobilization", "bed rest", "bedridden", "long travel", "long journey", "recent surgery", "operated", "leg swelling", "calf pain", "calf swelling", "plaster"]),
    // Red flags
    yn("red_flag", "breathlessness", "Breathlessness", "Any breathlessness with the pain?", ["breathlessness", "breathless", "shortness of breath", "dyspnoea", "dyspnea", "difficulty breathing", "difficulty in breathing", "sob"], { teach: "Breathlessness with chest pain raises the stakes: the pair occurs in myocardial infarction, pulmonary embolism, pneumothorax and dissection alike." }),
    yn("red_flag", "syncope", "Syncope / giddiness", "Any fainting, near-fainting, or giddiness?", ["syncope", "fainted", "fainting", "blackout", "collapse", "giddiness", "giddy", "lightheaded", "dizziness", "dizzy", "unconscious"], { teach: "Fainting with chest pain points to a sudden fall in cardiac output: arrhythmia, massive embolism, aortic stenosis or dissection." }),
    yn("red_flag", "tearing_to_back", "Tearing pain to the back", "Was the pain tearing or ripping in character, radiating to the back?", ["tearing", "ripping", "to the back", "interscapular", "between the shoulder blades"], { teach: "A tearing pain that goes to the back at its onset is the classic description of aortic dissection, which is missed when the question is not asked." }),
    yn("red_flag", "neuro_deficit", "Focal neurological symptom", "Any weakness of a limb, slurred speech, or facial deviation with the pain?", ["weakness", "slurred speech", "slurring", "facial deviation", "deviation of face", "paralysis", "numbness", "hemiparesis"], { teach: "A limb weakness or speech problem with chest pain suggests dissection involving a carotid or spinal artery." }),
    yn("red_flag", "haemoptysis", "Haemoptysis", "Any blood in the sputum?", ["haemoptysis", "hemoptysis", "blood in sputum", "coughing blood", "blood in cough"], { teach: "Blood in the sputum with pleuritic pain raises pulmonary embolism and pneumonia." }),
    yn("red_flag", "cardiac_risk", "Cardiac risk factors", "Any diabetes, hypertension, smoking, dyslipidaemia, family history of early heart disease, or known heart disease?", ["diabetes", "diabetic", "hypertension", "hypertensive", "smoker", "smoking", "beedi", "cholesterol", "dyslipidaemia", "dyslipidemia", "family history", "heart attack", "heart disease", "ihd", "cad", "angioplasty", "stent", "bypass", "cabg"], { teach: "Diabetes, hypertension, smoking, family history and prior events raise the prior probability of a cardiac cause before any ECG is read." }),
    yn("red_flag", "cocaine_drugs", "Stimulant / drug use", "Any cocaine, amphetamine or other stimulant use?", ["cocaine", "amphetamine", "stimulant", "drug abuse", "drugs"], { tier: "detailed", teach: "Stimulant use can cause coronary spasm and infarction in the young, and comes to light only when asked about, privately." }),
    yn("red_flag", "hypertension_uncontrolled", "Known / uncontrolled hypertension", "Is the patient hypertensive, and is it controlled?", ["hypertension", "hypertensive", "blood pressure", "bp", "uncontrolled"], { teach: "A very high blood pressure with chest pain is part of the picture of dissection and hypertensive emergency." }),
    IMMUNOCOMPROMISE,
    // Exposures / background
    yn("exposure", "tobacco_alcohol", "Tobacco / alcohol", "Any tobacco (smoked or chewed) or alcohol use, and how much?", ["smoker", "smoking", "beedi", "cigarette", "tobacco", "gutka", "khaini", "alcohol", "drinks", "drinker"]),
    yn("exposure", "tb_contact", "TB contact / past TB", "Any past tuberculosis or contact with a TB patient?", ["tb", "tuberculosis", "koch", "att", "akt", "dots", "tb contact"], { tier: "detailed" }),
    yn("exposure", "oral_contraceptives", "Oral contraceptives / hormones", "Any oral contraceptive or hormone use?", ["oral contraceptive", "ocp", "contraceptive pills", "hormone", "hrt"], { tier: "detailed" }),
  ],
  differentials: [
    { id: "acs", name: "Acute coronary syndrome", pointers: ["exertional", "radiation", "sweating", "cardiac_risk", "nausea_vomiting"], discriminators: ["character", "radiation", "exertional", "sweating", "pattern", "severity", "cardiac_risk", "previous_episodes", "breathlessness", "syncope"] },
    { id: "dissection", name: "Aortic dissection", pointers: ["tearing_to_back", "neuro_deficit", "hypertension_uncontrolled", "syncope"], discriminators: ["tearing_to_back", "severity", "neuro_deficit", "hypertension_uncontrolled", "syncope", "onset_mode"] },
    { id: "pe", name: "Pulmonary embolism", pointers: ["breathlessness", "recent_immobilisation", "haemoptysis", "positional_pleuritic"], discriminators: ["breathlessness", "recent_immobilisation", "haemoptysis", "positional_pleuritic", "syncope", "oral_contraceptives", "palpitations"] },
    { id: "pericarditis", name: "Pericarditis", pointers: ["positional_pleuritic", "fever"], discriminators: ["positional_pleuritic", "fever", "character", "previous_episodes"] },
    { id: "pneumonia_pleurisy", name: "Pneumonia / pleurisy", pointers: ["fever", "cough", "positional_pleuritic"], discriminators: ["fever", "cough", "positional_pleuritic", "haemoptysis", "tb_contact"] },
    { id: "pneumothorax", name: "Pneumothorax", pointers: ["onset_mode", "breathlessness", "positional_pleuritic"], discriminators: ["onset_mode", "breathlessness", "positional_pleuritic", "tobacco_alcohol", "tb_contact"] },
    { id: "oesophageal", name: "Oesophageal / peptic", pointers: ["heartburn", "character"], discriminators: ["heartburn", "character", "exertional", "positional_pleuritic"] },
    { id: "musculoskeletal", name: "Musculoskeletal / chest wall", pointers: ["chest_wall_tenderness"], discriminators: ["chest_wall_tenderness", "positional_pleuritic", "exertional"] },
    { id: "zoster", name: "Herpes zoster", pointers: ["rash"], discriminators: ["rash", "character", "immunocompromise"] },
  ],
  output: {
    durationSlot: "duration",
    hpiOrder: ["onset", "duration", "onset_mode", "site", "character", "radiation", "severity", "pattern", "exertional", "positional_pleuritic", "sweating", "progression", "prior_treatment", "prior_investigations"],
  },
};
