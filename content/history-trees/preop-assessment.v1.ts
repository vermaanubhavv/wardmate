import type { HistoryTree } from "@/lib/history-check/types";
import { BAILEY_LOVE, DAS_CLINICAL_SURGERY, HAMILTON_BAILEY, PREGNANCY, SABISTON, SABISTON_GERIATRIC, SCHWARTZ, surgicalBackground, val, yn } from "@/content/history-trees/_helpers";

/**
 * BEFORE AN OPERATION (PRE-OPERATIVE ASSESSMENT) — v1.0.0. CLINICAL CONTENT: PENDING REVIEW.
 * Adult surgical ward, north India. Built from Sabiston (20th ed.) ch. 10 "Principles of
 * Preoperative and Operative Surgery", ch. 13 "Surgery in the Geriatric Patient" and ch. 14
 * "Anesthesiology Principles" — the systems review the text says every patient gets before
 * theatre, the ACS NSQIP / AGS geriatric checklist (Box 10-1), and the bleeding-history
 * questions it says every surgical patient is asked. docs/surgical-history.md §9.
 *
 * This is the one tree that does not start from a symptom: the "complaint" is that an operation
 * is planned. The differentials are therefore not diseases but the kinds of perioperative
 * trouble the history is screening for — each one a reason to ask, never a verdict on fitness.
 * Nothing here is a score: no ASA class, no RCRI, no Caprini total is computed or shown.
 *
 * `surgicalBackground()` carries previous operations, anaesthetic and transfusion trouble,
 * blood thinners, regular medicines, allergy, exercise tolerance (Sabiston's two flights of
 * stairs), implants and last meal — this file adds only what that block does not ask.
 */
export const preopAssessmentV1: HistoryTree = {
  id: "preop_assessment",
  version: "1.0.0",
  complaint: "Before an operation (pre-operative assessment)",
  triggers: ["pre op", "pre-op", "preop", "preoperative", "pre operative", "pre-operative", "pre anaesthetic", "pre-anaesthetic", "pre anesthetic", "pac clearance", "fitness for surgery", "fitness for anaesthesia", "posted for surgery", "planned for surgery", "scheduled for surgery", "elective surgery", "admitted for surgery"],
  setting: "Adult surgical ward, north India",
  reviewStatus: "pending_clinician_review",
  reviewedBy: null,
  references: [DAS_CLINICAL_SURGERY, HAMILTON_BAILEY, SABISTON, SABISTON_GERIATRIC, SCHWARTZ, BAILEY_LOVE],
  slots: [
    val("informant", "informant", "Informant", "Who gave the history — the patient or an attendant?", ["attendant", "informant", "history given by", "relative", "wife", "husband", "son", "daughter", "mother", "father", "patient himself", "patient herself"], { tier: "detailed" }),
    val("hpi", "planned_operation", "Planned operation", "What operation is planned, for what problem, and is it planned in advance or an emergency?", ["planned for", "posted for", "operation", "surgery", "cholecystectomy", "hernia repair", "laparotomy", "laparoscopic", "elective", "emergency", "urgent"]),
    val("hpi", "duration", "Duration of the problem", "How long has the problem that the operation is for been present?", ["days", "day", "weeks", "week", "months", "month", "years", "year", "since", "duration"], { tier: "detailed", numeric: true }),
    val("hpi", "patient_understanding", "What the patient understands and expects", "What does the patient understand about the operation, and what do they hope it will achieve?", ["understands", "explained", "expects", "wants", "hopes", "aware", "worried", "afraid", "consent"], { tier: "detailed", teach: "Sabiston asks for the patient's goals and expectations to be recorded before theatre; a mismatch is easier to address before the operation than after it." }),

    // Heart
    yn("associated", "angina_exertion", "Chest pain or breathlessness on exertion", "Does the patient get chest pain, tightness or breathlessness on walking or climbing stairs?", ["chest pain on exertion", "chest pain on walking", "chest pain on climbing", "tightness on exertion", "angina", "breathless on walking", "breathless on climbing", "breathlessness on exertion", "stairs with breathlessness", "on exertion", "on stairs"], { teach: "Symptoms on effort, read with exercise tolerance, are how Sabiston's cardiac algorithm decides whether anything more is needed before an elective operation." }),
    yn("associated", "heart_history", "Known heart disease", "Has the patient ever been told of a heart attack, heart failure, a valve problem, or an irregular heartbeat?", ["heart attack", "mi", "heart failure", "weak heart", "valve", "rheumatic heart", "irregular heartbeat", "atrial fibrillation", "palpitations", "no heart disease"]),
    yn("associated", "stroke_tia", "Stroke or mini-stroke", "Has the patient ever had a stroke or a short spell of weakness, numbness or loss of speech, and when?", ["stroke", "paralysis", "tia", "mini stroke", "transient weakness", "loss of speech", "facial deviation", "no stroke"]),

    // Lungs and airway
    yn("associated", "lung_disease", "Chest disease", "Has the patient asthma, COPD, old TB or any chest disease, uses an inhaler, or has had a recent bad spell or a past admission needing a breathing tube?", ["asthma", "copd", "bronchitis", "old tb", "tuberculosis", "inhaler", "nebulisation", "exacerbation", "ventilator", "no chest disease"]),
    yn("associated", "recent_chest_infection", "Recent cough with sputum", "Has there been a cough with phlegm, a cold or a chest infection in the past month?", ["cough", "sputum", "phlegm", "cold", "chest infection", "pneumonia", "fever with cough", "no cough"], { teach: "Sabiston lists sputum production and a recent chest infection among the specific risk factors for a chest complication after an operation." }),
    yn("associated", "neck_jaw_teeth", "Teeth, jaw and neck", "Are there loose or false teeth, or any difficulty opening the mouth wide or bending the neck back?", ["loose teeth", "dentures", "false teeth", "capped", "cannot open mouth", "restricted mouth opening", "stiff neck", "cervical", "no loose teeth"], { tier: "detailed" }),

    // Kidney, liver, endocrine
    yn("associated", "kidney_disease", "Kidney disease", "Has the patient kidney disease, or is on dialysis, and how much urine is passed in a day?", ["kidney disease", "renal failure", "ckd", "dialysis", "creatinine", "swelling of feet", "less urine", "no kidney disease"]),
    yn("associated", "liver_disease", "Liver disease", "Has the patient ever had jaundice, hepatitis, liver disease, swelling of the abdomen, or itching?", ["jaundice", "hepatitis", "hepatitis b", "hepatitis c", "liver disease", "cirrhosis", "ascites", "abdominal swelling", "itching", "no liver disease"], { teach: "Sabiston asks about liver disease and any past hepatitis before every operation: cirrhosis changes the risk of the operation itself, and a known infection matters if a member of the team is injured." }),
    val("associated", "diabetes", "Diabetes and its control", "Has the patient diabetes — since when, was insulin needed from the start or added later, tablets or insulin now, how well controlled, and any eye, kidney or nerve trouble from it?", ["diabetes", "diabetic", "sugar", "insulin", "tablets for sugar", "hba1c", "controlled", "uncontrolled", "neuropathy", "retinopathy", "no diabetes", "non diabetic"]),
    yn("associated", "thyroid", "Thyroid disease", "Has the patient an overactive or underactive thyroid, or a swelling in the neck?", ["thyroid", "hyperthyroid", "hypothyroid", "goitre", "neck swelling", "thyroxine", "no thyroid"], { tier: "detailed" }),

    // Bleeding and clots
    yn("associated", "previous_clot", "Previous clot in a vein or the lungs", "Has the patient ever had a clot in a leg vein or in the lungs — how long ago, and is it still being treated?", ["dvt", "clot in leg", "deep vein thrombosis", "pulmonary embolism", "clot in lungs", "leg swelling with clot", "blood thinner for clot", "no clot"], { teach: "A clot in the past few months changes when an elective operation can safely be done and how the blood is thinned around it." }),
    yn("red_flag", "recent_mi_or_stent", "Heart attack, angioplasty or stent in the past year", "Has there been a heart attack, an angioplasty or a stent in the past year — on what date, what kind of stent, and is the card or discharge summary available?", ["heart attack", "angioplasty", "stent", "ptca", "drug eluting stent", "bypass surgery", "cabg", "last month", "last year", "no stent"], { teach: "Schwartz times elective surgery from the stent — at least a month after a bare-metal stent and up to a year after a drug-eluting one — and counts a recent heart attack as an active cardiac condition, so the date and the stent type are the parts of the answer that matter." }),
    yn("red_flag", "unstable_cardiac", "Chest pain or breathlessness at rest or getting worse", "Is chest pain or breathlessness now coming at rest or on very little effort, getting worse over recent days, or is the patient breathless lying flat or woken at night by it?", ["chest pain at rest", "breathless at rest", "at rest", "on minimal exertion", "wakes at night", "orthopnoea", "pnd", "getting worse", "increasing", "new chest pain", "unstable", "pillows", "propped up", "wakes breathless"], { teach: "Symptoms that have changed recently are asked first, because Sabiston's algorithm stops at this step for any elective operation." }),
    PREGNANCY,

    // Reserve: nutrition, function, cognition (Sabiston Box 10-1)
    yn("associated", "function_adl", "Managing daily activities", "Can the patient get out of bed, dress and bathe, cook and go to the market without help?", ["independent", "needs help", "dependent", "bedridden", "walks with support", "walking stick", "walker", "cannot bathe", "cannot dress", "does own work"], { tier: "detailed", teach: "Sabiston's four-question screen for function: dependence on others for daily activities predicts complications and decides what help is needed at discharge." }),
    yn("associated", "falls", "Falls", "Has the patient fallen in the past year?", ["fell", "fall", "falls", "slipped", "lost balance", "no falls"], { tier: "detailed" }),
    yn("associated", "memory_cognition", "Memory and confusion", "Has the patient or the family noticed forgetfulness, confusion, or any decline in managing affairs?", ["forgetful", "forgetfulness", "memory", "confused", "confusion", "dementia", "decline", "repeats", "memory normal"], { tier: "detailed", teach: "Sabiston asks for the starting level of memory and thinking to be recorded, because confusion after an operation is common and cannot be judged without it; the family is often the better informant." }),
    yn("associated", "previous_delirium", "Confusion after a past operation or illness", "Did the patient become confused after a previous operation or a hospital admission?", ["confused after surgery", "delirium", "disoriented after", "agitated in hospital", "no confusion before"], { tier: "detailed" }),
    yn("associated", "vision_hearing", "Vision and hearing", "Is there any difficulty with seeing or hearing, and are glasses or a hearing aid used?", ["poor vision", "glasses", "spectacles", "cataract", "hard of hearing", "deaf", "hearing aid"], { tier: "detailed" }),
    yn("associated", "low_mood", "Low mood", "In the past year, has there been a spell of two weeks or more of feeling low, or of losing interest in things usually enjoyed?", ["low mood", "sad", "depressed", "lost interest", "no interest", "crying", "mood normal"], { tier: "detailed", teach: "Sabiston's checklist screens mood with these two questions before an operation in an older patient." }),

    // Habits and home
    val("exposure", "smoking", "Smoking or tobacco", "Does the patient smoke or use tobacco, how much and for how long, and when was the last one?", ["smoker", "smokes", "bidi", "cigarette", "pack years", "tobacco", "gutka", "hookah", "quit", "ex smoker", "non smoker", "never smoked"]),
    val("exposure", "alcohol", "Alcohol", "How much alcohol does the patient drink, how often, and when was the last drink — and have there ever been shakes or confusion on stopping?", ["alcohol", "drinks", "daily drinker", "quarter", "peg", "last drink", "shakes", "tremors", "withdrawal", "non alcoholic", "teetotaller", "does not drink"], { teach: "Sabiston screens every patient for alcohol before an operation; regular heavy drinking stopped suddenly on admission can surface as withdrawal on the ward." }),
    val("exposure", "support_at_home", "Support after discharge", "Who will look after the patient at home after the operation, and who will bring them back for follow-up?", ["lives alone", "lives with", "family", "son", "daughter", "wife", "husband", "caregiver", "no one", "will accompany"], { tier: "detailed" }),
    val("exposure", "decision_maker", "Who decides if the patient cannot", "Has the patient said who should make decisions for them if they are unable to?", ["decision", "decides", "son will decide", "wife will decide", "next of kin", "wishes", "advance directive", "not discussed"], { tier: "detailed" }),

    // Hamilton Bailey's Demonstrations of Physical Signs, 19th ed. (docs/surgical-history.md §11)
    yn("associated", "hypertension_cholesterol", "High blood pressure", "Has the patient high blood pressure — since when, and is it controlled on treatment?", ["high blood pressure", "hypertension", "bp tablets", "no high bp", "controlled", "uncontrolled"], { teach: "Uncontrolled blood pressure is a common reason an operation is put off, and long-standing hypertension is read with the other cardiac questions." }),
    yn("red_flag", "exertional_faint", "Fainting on effort", "Has the patient ever fainted or nearly fainted while exerting, or blacked out without warning?", ["fainted", "blackout", "passed out on walking", "near faint", "no fainting"], { teach: "Hamilton Bailey calls fainting on exertion a cardinal sign of severe narrowing of the aortic valve, and also names heart block and rhythm disturbance, all of which change anaesthetic risk." }),
    yn("associated", "claudication_aneurysm", "Leg pain on walking or known aneurysm", "Does the patient get calf pain on walking that eases with rest, or has a swelling of a main artery ever been found?", ["calf pain on walking", "claudication", "aneurysm", "bypass", "no leg pain on walking"], { tier: "detailed", teach: "Hamilton Bailey lists peripheral vascular and aneurysmal disease among the pertinent questions before surgery, as markers of widespread arterial disease." }),
    // Schwartz's Principles of Surgery, 11th ed. (docs/surgical-history.md §12)
    yn("exposure", "antithrombotic_stopped", "Blood thinner stopped for the operation", "Has any blood-thinning or platelet medicine been stopped for this operation — which, on what date, and on whose advice?", ["stopped", "held", "withheld", "stopped blood thinner", "stopped aspirin", "stopped clopidogrel", "stopped acitrom", "cardiologist advised", "not stopped", "continuing"], { teach: "Schwartz notes that platelet medicine is continued when an operation cannot wait in a patient with a recent stent, because stopping it early risks clotting of the stent; who stopped it and when matters as much as whether it was stopped." }),
    yn("associated", "reflux_aspiration", "Heartburn or food coming back up", "Does the patient get heartburn, sour water or food coming back into the mouth, especially lying flat?", ["heartburn", "acidity", "sour water", "regurgitation", "food comes back", "reflux", "worse lying flat", "achalasia", "no acidity"], { tier: "detailed", teach: "Schwartz treats marked reflux, achalasia and a slow-emptying stomach as an aspiration risk at induction whatever the fasting time." }),
    yn("exposure", "hormone_pill", "Contraceptive or hormone pill", "In a woman, is she taking a contraceptive pill or hormone replacement, and when was the last one?", ["contraceptive pill", "oral pill", "mala d", "mala n", "ocp", "hormone pill", "hormone replacement", "hrt", "not on pills"], { tier: "detailed", teach: "Schwartz lists the contraceptive pill and hormone replacement among the acquired risk factors for a clot in the veins." }),
    ...surgicalBackground({ acute: true, omit: ["surg_other_illnesses", "surg_patient_concern"], core: ["surg_steroid_past_year", "surg_implants"] }),
  ],
  differentials: [
    { id: "cardiac", name: "Heart complication around the operation", pointers: ["angina_exertion", "heart_history", "recent_mi_or_stent", "unstable_cardiac"], discriminators: ["unstable_cardiac", "recent_mi_or_stent", "angina_exertion", "surg_exercise_tolerance", "heart_history", "stroke_tia", "diabetes", "kidney_disease", "hypertension_cholesterol", "exertional_faint", "claudication_aneurysm", "antithrombotic_stopped"] },
    { id: "pulmonary", name: "Chest complication after the operation", pointers: ["lung_disease", "recent_chest_infection", "smoking", "surg_snoring_apnoea"], discriminators: ["lung_disease", "recent_chest_infection", "smoking", "surg_snoring_apnoea", "surg_exercise_tolerance", "surg_weight_loss", "function_adl", "memory_cognition", "unstable_cardiac"] },
    { id: "bleeding", name: "Bleeding around the operation", pointers: ["surg_bleeding_tendency", "surg_blood_thinners", "liver_disease"], discriminators: ["surg_bleeding_tendency", "surg_blood_thinners", "recent_mi_or_stent", "liver_disease", "kidney_disease", "surg_regular_drugs", "surg_transfusion", "antithrombotic_stopped"] },
    { id: "vte", name: "Clot in a vein after the operation", pointers: ["previous_clot", "pregnancy"], discriminators: ["previous_clot", "pregnancy", "surg_regular_drugs", "function_adl", "surg_weight_loss", "heart_history", "hormone_pill"] },
    { id: "endocrine", name: "Sugar, steroid or thyroid trouble around the operation", pointers: ["diabetes", "surg_steroid_past_year", "thyroid"], discriminators: ["diabetes", "surg_steroid_past_year", "thyroid", "surg_regular_drugs", "kidney_disease"] },
    { id: "delirium", name: "Confusion after the operation", pointers: ["memory_cognition", "previous_delirium", "alcohol"], discriminators: ["memory_cognition", "previous_delirium", "alcohol", "vision_hearing", "function_adl", "falls", "low_mood"] },
    { id: "reserve", name: "Low reserve — frailty or undernutrition", pointers: ["surg_weight_loss", "function_adl", "falls"], discriminators: ["surg_weight_loss", "function_adl", "falls", "surg_exercise_tolerance", "support_at_home", "memory_cognition"] },
    { id: "anaesthetic", name: "Trouble with the anaesthetic or the airway", pointers: ["surg_anaesthetic_problem", "surg_snoring_apnoea", "neck_jaw_teeth"], discriminators: ["surg_anaesthetic_problem", "surg_snoring_apnoea", "neck_jaw_teeth", "surg_allergy", "surg_last_meal", "surg_previous_operations", "exertional_faint", "reflux_aspiration"] },
  ],
  output: {
    durationSlot: "duration",
    hpiOrder: ["planned_operation", "duration", "patient_understanding"],
  },
};
