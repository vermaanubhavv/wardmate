import type { HistoryTree } from "@/lib/history-check/types";
import { commonHpi, MACLEODS, PREGNANCY, val, yn } from "@/content/history-trees/_helpers";

/**
 * SYNCOPE / TRANSIENT LOSS OF CONSCIOUSNESS — v1.0.0. CLINICAL CONTENT: PENDING CLINICIAN REVIEW.
 * Differentials: vasovagal (reflex) syncope, orthostatic hypotension (dehydration, drugs,
 * autonomic failure, bleeding), cardiac arrhythmia, structural (aortic stenosis, HOCM,
 * pulmonary embolism), seizure, hypoglycaemia, situational syncope, psychogenic.
 */
export const syncopeV1: HistoryTree = {
  id: "syncope",
  version: "1.0.0",
  complaint: "Syncope / fainting",
  triggers: ["syncope", "fainting", "fainted", "faint", "blackout", "black out", "collapse", "collapsed", "fell unconscious", "transient loss of consciousness", "giddiness and fall"],
  setting: "Adult medicine ward, north India",
  reviewStatus: "pending_clinician_review",
  reviewedBy: null,
  references: [
    { title: "ESC guidelines for the diagnosis and management of syncope", source: "Eur Heart J", year: 2018, pmid: "29562304" },
    { title: "Historical criteria that distinguish syncope from seizures", source: "J Am Coll Cardiol", year: 2002, pmid: "12103267" },
    { title: "Is this patient hypovolemic? (Rational Clinical Examination)", source: "JAMA", year: 1999, pmid: "10086438" },
    MACLEODS,
  ],
  slots: [
    ...commonHpi("fainting"),
    val("hpi", "witness", "Eyewitness account", "Who saw the episode, and what did they see?", ["witnessed", "eyewitness", "saw", "seen by", "nobody saw", "unwitnessed", "found on the floor"]),
    val("hpi", "circumstance", "Circumstance", "What was the patient doing — standing long, just stood up, exertion, coughing, passing urine, pain or fright, hot crowded place?", ["standing", "stood up", "exertion", "coughing", "passing urine", "micturition", "defecation", "pain", "fright", "blood", "hot", "crowded", "queue", "temple", "sitting", "lying", "circumstance"]),
    val("hpi", "prodrome", "Prodrome", "Was there any warning — nausea, sweating, warmth, vision going grey, ringing in the ears, palpitations, chest pain — or none at all?", ["nausea", "sweating", "warm", "vision", "greying", "tunnel", "ringing", "tinnitus", "palpitations", "chest pain", "no warning", "without warning", "prodrome", "felt"]),
    val("hpi", "loc_duration", "Duration of unconsciousness", "How long was the patient unconscious?", ["seconds", "minute", "minutes", "brief", "long", "duration", "unconscious for"], { numeric: true }),
    val("hpi", "during", "What happened during", "During the episode was there jerking, tongue biting, incontinence, colour change, or injury?", ["jerking", "jerks", "twitching", "tongue bite", "incontinence", "pale", "blue", "flushed", "injury", "injured", "hit", "limp", "stiff"]),
    val("hpi", "recovery", "Recovery", "After the episode was the patient immediately alert, or confused and drowsy for a period?", ["immediately", "alert", "recovered", "confused", "drowsy", "sleepy", "confusion", "post ictal", "recovery", "came round"]),
    yn("hpi", "injury", "Injury from the fall", "Was the patient injured in the fall?", ["injury", "injured", "head injury", "fracture", "bruise", "cut", "bleeding from"]),
    yn("hpi", "previous_episodes", "Previous episodes", "Has this happened before — how many times, and in what circumstances?", ["previous", "before", "earlier", "recurrent", "times", "episodes", "first time"]),
    yn("associated", "palpitations_before", "Palpitations before", "Any palpitations just before the blackout?", ["palpitations", "racing", "pounding", "fluttering"]),
    yn("associated", "chest_pain_breathless", "Chest pain / breathlessness", "Any chest pain or breathlessness before or after?", ["chest pain", "breathless", "breathlessness", "dyspnoea"]),
    yn("associated", "fluid_loss", "Vomiting / diarrhoea / poor intake / bleeding", "Any recent vomiting, diarrhoea, poor intake, or blood loss (black stools, heavy periods)?", ["vomiting", "diarrhoea", "diarrhea", "not eating", "poor intake", "black stools", "melaena", "bleeding", "heavy periods", "dehydrat"]),
    yn("associated", "headache_focal", "Headache / focal symptoms", "Any headache, weakness, speech disturbance or double vision around the episode?", ["headache", "weakness", "speech", "slurred", "double vision", "numbness"], { tier: "detailed" }),
    yn("associated", "hypoglycaemia_features", "Hunger / sweating / diabetic on treatment", "Is the patient a treated diabetic, and was there hunger or sweating before?", ["diabetic", "diabetes", "insulin", "hunger", "sweating", "sugar low", "hypoglycaemia"]),
    yn("associated", "postural_symptoms", "Symptoms on standing", "Does the patient get giddy on standing up from bed or a chair?", ["standing", "on getting up", "postural", "giddy on standing", "orthostatic"], { tier: "detailed" }),
    // Red flags
    yn("red_flag", "exertional_or_supine", "Syncope on exertion or lying down", "Did it happen during exertion or while lying down?", ["exertion", "exercise", "running", "lying", "supine", "in bed", "while lying", "during activity"], { teach: "A faint during exertion or lying flat is not a reflex faint; it points to an arrhythmia or an outflow obstruction." }),
    yn("red_flag", "no_prodrome", "No warning at all", "Was there no warning at all before the blackout?", ["no warning", "without warning", "suddenly", "no prodrome", "did not feel anything"], { teach: "A blackout without any warning is the hallmark of an arrhythmic cause; reflex syncope almost always gives a few seconds of notice." }),
    yn("red_flag", "known_heart_disease", "Known heart disease", "Any known heart attack, heart failure, valve disease, cardiomyopathy, or an abnormal ECG?", ["heart attack", "myocardial infarction", "heart failure", "valve", "aortic stenosis", "cardiomyopathy", "hocm", "abnormal ecg", "pacemaker", "heart disease"], { teach: "Structural heart disease is the strongest predictor of a cardiac cause and of death after syncope." }),
    yn("red_flag", "family_sudden_death", "Family history of sudden death", "Has any relative died suddenly before the age of 50?", ["sudden death", "died suddenly", "family history", "young", "before 50", "drowning"], { teach: "Inherited arrhythmia syndromes and cardiomyopathies run in families and present first as syncope." }),
    yn("red_flag", "seizure_features", "Seizure features", "Was there prolonged jerking, tongue biting, head turning, or confusion afterwards?", ["jerking", "prolonged", "tongue bite", "tongue biting", "head turning", "confused after", "confusion", "post ictal", "frothing"], { teach: "Lateral tongue biting and prolonged post-episode confusion separate a seizure from a faint; a few brief jerks after a faint do not." }),
    yn("red_flag", "bleeding_anaemia", "Blood loss / severe anaemia", "Any black stools, blood in vomit, heavy menstrual loss, or known severe anaemia?", ["black stools", "melaena", "melena", "haematemesis", "blood in vomit", "heavy periods", "menorrhagia", "anaemia", "anemia", "pallor"], { teach: "Syncope may be the first sign of concealed bleeding; the haemoglobin has not fallen yet when the patient stands and faints." }),
    yn("red_flag", "drugs_bp", "Blood-pressure and rhythm drugs", "Any antihypertensives, diuretics, nitrates, prostate tablets, antidepressants, or drugs for the heart rhythm?", ["antihypertensive", "bp tablets", "diuretic", "nitrate", "tamsulosin", "prazosin", "antidepressant", "amiodarone", "digoxin", "beta blocker", "tablets for", "medication"], { teach: "Drugs are the commonest reversible cause of orthostatic syncope in the elderly, and the list is only found by asking about every tablet." }),
    yn("red_flag", "elderly_injury", "Elderly with injury", "Is the patient elderly, and did the fall cause an injury?", ["elderly", "old", "years old", "injury", "fracture", "head injury"], { tier: "detailed", teach: "An injurious fall in an older person changes admission and imaging decisions whatever the cause of the faint." }),
    PREGNANCY,
    // Exposures
    yn("exposure", "heat_fasting", "Heat / fasting / dehydration", "Was the patient fasting, in the heat, or short of fluids that day?", ["fasting", "heat", "hot", "sun", "not drunk", "dehydrated", "roza", "vrat", "no water"], { tier: "detailed" }),
    yn("exposure", "alcohol_drugs", "Alcohol / sedatives", "Any alcohol or sedatives before the episode?", ["alcohol", "drink", "drunk", "sedative", "sleeping pills"], { tier: "detailed" }),
  ],
  differentials: [
    { id: "vasovagal", name: "Reflex (vasovagal) syncope", pointers: ["circumstance", "prodrome", "recovery"], discriminators: ["circumstance", "prodrome", "recovery", "loc_duration", "previous_episodes", "no_prodrome", "exertional_or_supine"] },
    { id: "orthostatic", name: "Orthostatic hypotension (drugs, fluid loss, bleeding, autonomic)", pointers: ["postural_symptoms", "fluid_loss", "drugs_bp", "bleeding_anaemia"], discriminators: ["postural_symptoms", "fluid_loss", "drugs_bp", "bleeding_anaemia", "circumstance", "heat_fasting", "hypoglycaemia_features"] },
    { id: "arrhythmia", name: "Cardiac arrhythmia", pointers: ["no_prodrome", "palpitations_before", "known_heart_disease", "exertional_or_supine"], discriminators: ["no_prodrome", "palpitations_before", "known_heart_disease", "exertional_or_supine", "family_sudden_death", "injury", "loc_duration"] },
    { id: "structural", name: "Structural / obstructive (aortic stenosis, HOCM, pulmonary embolism)", pointers: ["exertional_or_supine", "chest_pain_breathless", "known_heart_disease"], discriminators: ["exertional_or_supine", "chest_pain_breathless", "known_heart_disease", "family_sudden_death", "prodrome"] },
    { id: "seizure", name: "Seizure (not syncope)", pointers: ["seizure_features", "during", "recovery"], discriminators: ["seizure_features", "during", "recovery", "prodrome", "circumstance", "injury", "witness"] },
    { id: "hypoglycaemia", name: "Hypoglycaemia", pointers: ["hypoglycaemia_features"], discriminators: ["hypoglycaemia_features", "prodrome", "recovery", "heat_fasting"] },
    { id: "situational", name: "Situational syncope (cough, micturition, defecation)", pointers: ["circumstance"], discriminators: ["circumstance", "prodrome", "previous_episodes"] },
    { id: "psychogenic", name: "Psychogenic pseudosyncope", pointers: ["previous_episodes", "loc_duration", "witness"], discriminators: ["previous_episodes", "loc_duration", "witness", "injury", "during", "recovery"] },
  ],
  output: {
    durationSlot: "duration",
    hpiOrder: ["onset", "duration", "onset_mode", "witness", "circumstance", "prodrome", "loc_duration", "during", "recovery", "injury", "previous_episodes", "progression", "prior_treatment", "prior_investigations"],
  },
};
