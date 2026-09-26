import type { HistoryTree } from "@/lib/history-check/types";
import { commonHpi, IMMUNOCOMPROMISE, MACLEODS, PREGNANCY, rce, val, yn } from "@/content/history-trees/_helpers";

/**
 * WEAKNESS OF LIMBS — v1.0.0. CLINICAL CONTENT: REVIEWED.
 * Adult medicine ward, north India. Differentials: stroke (hemiparesis), Guillain-Barré
 * syndrome, compressive myelopathy (Pott's spine, tumour, disc), transverse myelitis,
 * hypokalaemic periodic paralysis, myasthenia gravis, peripheral neuropathy, myopathy,
 * spinal tuberculosis, Todd's paresis, functional weakness.
 */
export const limbWeaknessV1: HistoryTree = {
  id: "limb_weakness",
  version: "1.0.0",
  complaint: "Weakness of limbs",
  triggers: ["weakness", "weakness of limbs", "hemiparesis", "hemiplegia", "paraparesis", "paraplegia", "quadriparesis", "unable to walk", "cannot walk", "not able to walk", "limb weakness", "paralysis", "difficulty walking", "unable to move"],
  setting: "Adult medicine ward, north India",
  reviewStatus: "reviewed",
  reviewedBy: "Dr. Anubhav, General Surgery — 2026-09-26",
  references: [
    rce("Is this patient having a stroke?", 2005, "15900010"),
    { title: "Diagnosis and management of Guillain-Barré syndrome in ten steps", source: "Nat Rev Neurol", year: 2019, pmid: "31541214" },
    { title: "Metastatic spinal cord compression — diagnosis and management (NICE CG75)", source: "NICE", year: 2008, url: "https://www.nice.org.uk/guidance/cg75" },
    { title: "Hypokalemic periodic paralysis — clinical features", source: "Muscle Nerve", year: 2008, pmid: "18506713" },
    { title: "Index-TB guidelines: extrapulmonary tuberculosis (spinal TB)", source: "Ministry of Health and Family Welfare, India", year: 2016 },
    MACLEODS,
  ],
  slots: [
    ...commonHpi("weakness"),
    val("hpi", "distribution", "Distribution", "Which limbs are weak — one side, both legs, all four, or patchy?", ["one side", "right side", "left side", "hemiparesis", "both legs", "both lower limbs", "paraparesis", "all four", "quadriparesis", "one limb", "monoparesis", "patchy", "distribution"]),
    val("hpi", "proximal_distal", "Proximal vs distal", "Is it difficult to rise from squatting or climb stairs (proximal), or to grip and to lift the foot (distal)?", ["squatting", "rise from", "climb stairs", "stairs", "combing", "overhead", "proximal", "grip", "slippers", "slipping of slippers", "foot drop", "buttoning", "distal"]),
    val("hpi", "pattern_of_spread", "Pattern of spread", "Did it start in the feet and ascend, start in one limb and spread, or come on all at once?", ["ascending", "started in feet", "legs first", "then arms", "spread", "descending", "all at once", "at the same time", "one limb first"]),
    val("hpi", "time_course", "Time course", "Did the weakness reach maximum in minutes, hours, days, or weeks?", ["minutes", "within hours", "hours", "over days", "days", "weeks", "months", "maximum", "peak", "static", "stepwise"]),
    val("hpi", "fluctuation", "Fluctuation / fatigability", "Is the weakness worse at the end of the day or after activity, and better after rest?", ["evening", "end of the day", "after activity", "fatigable", "fatigability", "better after rest", "worse with use", "fluctuating", "variable"], { tier: "detailed" }),
    val("hpi", "functional_status", "Functional status", "Can the patient walk, stand, sit unsupported, hold objects, and manage self-care?", ["walk", "walking", "stand", "sitting", "unsupported", "bedridden", "bed bound", "hold", "self care", "needs support", "wheelchair", "adl"]),
    yn("hpi", "sensory_symptoms", "Sensory symptoms", "Any numbness, tingling, or altered sensation, and up to what level?", ["numbness", "tingling", "pins and needles", "sensation", "sensory level", "band like", "girdle", "loss of sensation", "burning"]),
    yn("hpi", "bladder_bowel", "Bladder / bowel involvement", "Any retention, incontinence, urgency, or constipation since the weakness?", ["retention", "incontinence", "urgency", "unable to pass urine", "catheter", "constipation", "bowel", "bladder", "dribbling"]),
    yn("hpi", "back_neck_pain", "Back or neck pain", "Any back or neck pain, and is it localised to a spot or radiating?", ["back pain", "backache", "neck pain", "spine", "radiating", "girdle pain", "spinal tenderness"]),
    yn("hpi", "muscle_pain_cramps", "Muscle pain / cramps", "Any muscle pain, cramps, or dark urine after exertion?", ["muscle pain", "myalgia", "cramps", "cramping", "dark urine after", "cola coloured"], { tier: "detailed" }),
    // Associated
    yn("associated", "facial_speech", "Facial weakness / speech", "Any facial deviation, drooping, slurred speech, or difficulty finding words?", ["facial deviation", "deviation of mouth", "drooping", "facial weakness", "slurred", "slurring", "speech", "aphasia", "cannot speak", "word finding", "dysarthria"]),
    yn("associated", "swallowing_breathing", "Swallowing / breathing difficulty", "Any difficulty swallowing, nasal regurgitation, choking, or breathing difficulty?", ["swallowing", "dysphagia", "nasal regurgitation", "choking", "breathing difficulty", "breathless", "single breath count", "cannot cough"]),
    yn("associated", "eye_symptoms", "Drooping eyelids / double vision", "Any drooping of the eyelids or double vision, especially in the evening?", ["ptosis", "drooping eyelid", "double vision", "diplopia", "eyelid"], { tier: "detailed" }),
    yn("associated", "headache_vomiting", "Headache / vomiting", "Any headache or vomiting with the weakness?", ["headache", "vomiting", "vomit"]),
    yn("associated", "fever", "Fever", "Any fever, before or with the weakness?", ["fever", "febrile", "temperature", "chills"]),
    yn("associated", "preceding_infection", "Preceding infection", "Any diarrhoea, cough, cold, or fever in the 1 to 4 weeks before the weakness?", ["diarrhoea", "diarrhea", "loose stools", "cold", "cough", "sore throat", "viral", "infection before", "weeks before", "vaccination"]),
    yn("associated", "weight_loss", "Weight loss / night sweats", "Any weight loss, evening fever, or night sweats?", ["weight loss", "lost weight", "night sweats", "evening rise", "anorexia"], { tier: "detailed" }),
    yn("associated", "palpitations_thyroid", "Palpitations / heat intolerance", "Any palpitations, heat intolerance, tremor, or weight loss despite appetite (thyroid)?", ["palpitations", "heat intolerance", "tremor", "sweating", "thyroid", "goitre", "goiter"], { tier: "detailed" }),
    yn("associated", "rash_joint", "Rash / joint pain / oral ulcers", "Any rash, joint pains, or oral ulcers (connective tissue disease, myositis)?", ["rash", "joint pain", "arthritis", "oral ulcers", "photosensitivity", "heliotrope"], { tier: "detailed" }),
    yn("associated", "previous_episodes", "Previous episodes", "Has this happened before, and did it recover fully?", ["previous", "earlier", "before", "recurrent", "episodes", "recovered", "similar"], { tier: "detailed" }),
    // Red flags
    yn("red_flag", "sudden_onset", "Sudden onset", "Did the weakness come on suddenly, over minutes?", ["sudden", "suddenly", "abrupt", "minutes", "woke up with", "on waking"], { teach: "Weakness that came on within minutes is a stroke until proven otherwise, and the time of onset decides eligibility for time-critical treatment." }),
    yn("red_flag", "sensory_level_bladder", "Sensory level with bladder involvement", "Is there a level below which sensation is lost, along with bladder or bowel disturbance?", ["sensory level", "level", "below the", "band", "girdle", "retention", "incontinence", "catheter"], { teach: "A level below which sensation is lost, with bladder disturbance, localises the problem to the spinal cord and makes it a compression question." }),
    yn("red_flag", "rapid_ascending", "Rapidly ascending weakness", "Is the weakness ascending from the legs and progressing over hours to days?", ["ascending", "progressing", "rapidly", "hours", "spreading up", "now arms", "climbing up"], { teach: "Weakness climbing from the legs over hours to days is the pattern of Guillain-Barre syndrome, where the breathing can fail within days." }),
    yn("red_flag", "respiratory_bulbar", "Breathing or swallowing involvement", "Is there any breathing difficulty, weak cough, or difficulty swallowing?", ["breathing difficulty", "breathless", "weak cough", "cannot cough", "swallowing", "choking", "nasal regurgitation", "single breath"], { teach: "Difficulty swallowing, a weak cough or breathlessness in a weak patient means the respiratory muscles are involved; the single-breath count is the bedside test." }),
    yn("red_flag", "altered_sensorium", "Altered sensorium / seizure", "Any drowsiness, confusion, or seizure?", ["drowsy", "drowsiness", "confused", "confusion", "altered sensorium", "seizure", "fit", "convulsion", "unconscious"], { teach: "Weakness with drowsiness points to the brain rather than the nerves or muscles." }),
    yn("red_flag", "hypertension_diabetes", "Hypertension / diabetes / heart disease", "Is the patient hypertensive, diabetic, or known to have heart disease or atrial fibrillation?", ["hypertension", "hypertensive", "diabetes", "diabetic", "heart disease", "atrial fibrillation", "af", "valve", "rheumatic", "stroke before"], { teach: "Vascular risk factors and atrial fibrillation raise the probability of stroke." }),
    yn("red_flag", "trauma", "Trauma / fall", "Any fall or injury to the spine or head?", ["fall", "fell", "injury", "trauma", "accident", "rta", "lifting"], { teach: "A fall or a lifting injury before weakness raises a spinal cause." }),
    yn("red_flag", "cancer_history", "Known malignancy", "Any known cancer, or symptoms suggestive of one?", ["cancer", "malignancy", "carcinoma", "tumour", "tumor", "lump", "chemotherapy"], { tier: "detailed", teach: "A known malignancy with back pain and leg weakness is metastatic cord compression until imaged." }),
    PREGNANCY,
    IMMUNOCOMPROMISE,
    // Exposures
    yn("exposure", "tb_contact", "TB contact / past TB", "Any past tuberculosis or contact (Pott's spine, tuberculous meningitis)?", ["tb", "tuberculosis", "koch", "att", "akt", "tb contact", "past tb", "pott"]),
    yn("exposure", "alcohol_nutrition", "Alcohol / nutrition", "Does the patient drink alcohol, or have a poor diet (neuropathy, thiamine deficiency)?", ["alcohol", "alcoholic", "drinks", "poor diet", "malnourished", "vegetarian", "b12", "nutrition"], { tier: "detailed" }),
    yn("exposure", "toxin_drug", "Toxin / drug exposure", "Any exposure to pesticides, heavy metals, or drugs known to cause weakness (statins, steroids, isoniazid)?", ["pesticide", "organophosphate", "lead", "arsenic", "heavy metal", "statin", "steroid", "isoniazid", "att", "drug induced", "toxin"], { tier: "detailed" }),
    yn("exposure", "heavy_meal_exertion", "Heavy carbohydrate meal / exertion before onset", "Did the weakness follow a heavy meal, exertion, or rest after exertion (periodic paralysis)?", ["heavy meal", "after eating", "rice", "carbohydrate", "after exertion", "after exercise", "rest after", "morning weakness", "woke up unable"], { tier: "detailed" }),
    yn("exposure", "snake_bite", "Snake bite / animal bite", "Any snake bite or unexplained bite mark, especially while sleeping on the floor?", ["snake", "snake bite", "bite", "bitten", "bite mark", "sleeping on floor", "krait"]),
  ],
  differentials: [
    { id: "stroke", name: "Stroke (hemiparesis)", pointers: ["sudden_onset", "distribution", "facial_speech", "hypertension_diabetes"], discriminators: ["sudden_onset", "distribution", "facial_speech", "hypertension_diabetes", "headache_vomiting", "altered_sensorium", "time_course"] },
    { id: "gbs", name: "Guillain-Barré syndrome", pointers: ["rapid_ascending", "pattern_of_spread", "preceding_infection", "sensory_symptoms"], discriminators: ["rapid_ascending", "pattern_of_spread", "preceding_infection", "sensory_symptoms", "respiratory_bulbar", "bladder_bowel", "facial_speech", "back_neck_pain", "time_course"] },
    { id: "cord_compression", name: "Compressive myelopathy (Pott's spine / tumour / disc)", pointers: ["sensory_level_bladder", "back_neck_pain", "distribution", "tb_contact"], discriminators: ["sensory_level_bladder", "back_neck_pain", "distribution", "tb_contact", "weight_loss", "cancer_history", "trauma", "time_course", "fever"] },
    { id: "transverse_myelitis", name: "Transverse myelitis", pointers: ["sensory_level_bladder", "time_course", "preceding_infection"], discriminators: ["sensory_level_bladder", "time_course", "preceding_infection", "back_neck_pain", "eye_symptoms", "previous_episodes"] },
    { id: "hypokalaemic_paralysis", name: "Hypokalaemic periodic paralysis / hypokalaemia", pointers: ["heavy_meal_exertion", "previous_episodes", "palpitations_thyroid", "proximal_distal"], discriminators: ["heavy_meal_exertion", "previous_episodes", "palpitations_thyroid", "proximal_distal", "sensory_symptoms", "bladder_bowel", "time_course", "fever"] },
    { id: "myasthenia", name: "Myasthenia gravis", pointers: ["fluctuation", "eye_symptoms", "swallowing_breathing"], discriminators: ["fluctuation", "eye_symptoms", "swallowing_breathing", "sensory_symptoms", "proximal_distal", "time_course"] },
    { id: "neuropathy", name: "Peripheral neuropathy", pointers: ["proximal_distal", "sensory_symptoms", "alcohol_nutrition", "toxin_drug"], discriminators: ["proximal_distal", "sensory_symptoms", "alcohol_nutrition", "toxin_drug", "hypertension_diabetes", "time_course", "bladder_bowel"] },
    { id: "myopathy", name: "Myopathy / myositis", pointers: ["proximal_distal", "muscle_pain_cramps", "rash_joint"], discriminators: ["proximal_distal", "muscle_pain_cramps", "rash_joint", "sensory_symptoms", "toxin_drug", "palpitations_thyroid", "time_course"] },
    { id: "snake_envenomation", name: "Neurotoxic snake envenomation", pointers: ["snake_bite", "eye_symptoms", "swallowing_breathing", "sudden_onset"], discriminators: ["snake_bite", "eye_symptoms", "swallowing_breathing", "pattern_of_spread", "time_course"] },
    { id: "todds", name: "Todd's paresis after a seizure", pointers: ["altered_sensorium", "sudden_onset"], discriminators: ["altered_sensorium", "sudden_onset", "time_course", "previous_episodes"] },
  ],
  output: {
    durationSlot: "duration",
    hpiOrder: ["onset", "duration", "onset_mode", "distribution", "proximal_distal", "pattern_of_spread", "time_course", "fluctuation", "sensory_symptoms", "bladder_bowel", "back_neck_pain", "muscle_pain_cramps", "functional_status", "progression", "prior_treatment", "prior_investigations"],
  },
};
