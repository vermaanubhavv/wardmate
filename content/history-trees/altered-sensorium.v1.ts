import type { HistoryTree } from "@/lib/history-check/types";
import { commonHpi, IMMUNOCOMPROMISE, MACLEODS, PREGNANCY, rce, val, yn } from "@/content/history-trees/_helpers";

/**
 * ALTERED SENSORIUM / SEIZURES — v1.0.0. CLINICAL CONTENT: PENDING CLINICIAN REVIEW.
 * Adult medicine ward, north India. Differentials: meningitis / encephalitis (incl.
 * tuberculous, Japanese encephalitis), stroke, hypoglycaemia / metabolic (uraemia, hepatic,
 * hyponatraemia), sepsis-associated encephalopathy, poisoning / alcohol withdrawal,
 * epilepsy (known / breakthrough), cerebral malaria, hypertensive encephalopathy,
 * post-ictal state, syncope mistaken for seizure.
 */
export const alteredSensoriumV1: HistoryTree = {
  id: "altered_sensorium",
  version: "1.0.0",
  complaint: "Altered sensorium / seizures",
  triggers: ["altered sensorium", "unconscious", "unconsciousness", "drowsy", "drowsiness", "confusion", "confused", "irrelevant talk", "seizure", "seizures", "fit", "fits", "convulsion", "convulsions", "loss of consciousness", "not responding", "unresponsive", "coma"],
  setting: "Adult medicine ward, north India",
  reviewStatus: "pending_clinician_review",
  reviewedBy: null,
  references: [
    rce("The rational clinical examination. Does this adult patient have acute meningitis?", 1999, "10411200"),
    rce("Is this patient having a stroke?", 2005, "15900010"),
    { title: "Historical criteria that distinguish syncope from seizures", source: "J Am Coll Cardiol", year: 2002, pmid: "12103267" },
    { title: "Alcohol withdrawal syndrome — clinical features and assessment (CIWA-Ar)", source: "Br J Addict", year: 1989, pmid: "2597811" },
    { title: "ILAE operational classification of seizure types (2017)", source: "Epilepsia", year: 2017, pmid: "28276060" },
    { title: "Guidelines for diagnosis and treatment of malaria in India", source: "NCVBDC / NVBDCP", year: 2014 },
    MACLEODS,
  ],
  slots: [
    ...commonHpi("altered sensorium"),
    val("hpi", "witness", "Eyewitness account", "Was the episode witnessed, and by whom?", ["witnessed", "eyewitness", "saw", "seen by", "nobody saw", "unwitnessed", "found"]),
    val("hpi", "level", "Level of consciousness", "How responsive is the patient — drowsy, confused, responding to pain, or unresponsive?", ["drowsy", "confused", "responding", "responds to", "unresponsive", "not responding", "arousable", "stuporous", "comatose", "gcs", "obeying"]),
    val("hpi", "fluctuation", "Fluctuation", "Is the sensorium fluctuating, steadily worsening, or improving?", ["fluctuating", "waxing", "waning", "lucid", "steadily", "worsening", "improving", "better", "worse"]),
    val("hpi", "prodrome", "Prodrome", "What happened in the hours before — headache, fever, vomiting, giddiness, palpitations?", ["before", "prior to", "preceded by", "prodrome", "headache", "giddiness", "light headed", "palpitations", "sweating", "aura", "warning"]),
    yn("hpi", "seizure_activity", "Seizure activity", "Was there any jerking, stiffening, uprolling of eyes, tongue bite, or frothing?", ["jerking", "jerks", "stiffening", "tonic", "clonic", "uprolling", "eyes rolled", "tongue bite", "frothing", "froth", "convulsion", "fits", "seizure", "shaking"]),
    val("hpi", "seizure_onset_type", "Seizure onset — focal or generalised", "Did the jerking start in one limb or one side before spreading, or all over at once?", ["one limb", "one side", "started in", "spread", "focal", "generalised", "generalized", "whole body", "all four limbs", "both sides", "head turning", "deviation"], { tier: "detailed" }),
    val("hpi", "seizure_duration", "Seizure duration / number", "How long did each episode last, and how many episodes?", ["lasted", "minutes", "seconds", "episodes", "number of", "times", "recurrent", "back to back", "continuous", "status"], { numeric: true }),
    yn("hpi", "incontinence", "Incontinence", "Was there urinary or faecal incontinence?", ["incontinence", "passed urine", "urine in clothes", "wet", "passed stool", "soiled"]),
    val("hpi", "post_ictal", "Post-episode state", "After the episode, was there confusion, deep sleep, weakness of a limb, or rapid full recovery?", ["post ictal", "postictal", "after the episode", "confusion after", "slept", "deep sleep", "todd", "weakness after", "recovered", "recovery", "immediately normal", "came back"]),
    val("hpi", "sleep_wake", "Sleep-wake / behaviour", "Any change in sleep pattern, behaviour, or irrelevant talk over the preceding days?", ["irrelevant talk", "behaviour", "behavior", "agitated", "restless", "sleep", "not sleeping", "talking to self", "hallucinations", "seeing things"]),
    // Associated
    yn("associated", "fever", "Fever", "Any fever, and for how many days before the change in sensorium?", ["fever", "febrile", "temperature", "chills", "rigors"]),
    yn("associated", "headache", "Headache", "Any headache before the change in sensorium?", ["headache", "head ache", "head pain"]),
    yn("associated", "vomiting", "Vomiting", "Any vomiting, especially projectile or early-morning?", ["vomiting", "vomit", "vomited", "projectile"]),
    yn("associated", "focal_deficit", "Focal weakness / speech / facial deviation", "Any weakness of a limb, facial deviation, slurred speech, or difficulty swallowing?", ["weakness", "hemiparesis", "paralysis", "facial deviation", "deviation of mouth", "slurred", "slurring", "speech", "aphasia", "dysphagia", "difficulty swallowing"]),
    yn("associated", "visual_symptoms", "Visual symptoms", "Any blurring, double vision or loss of vision?", ["blurring", "blurred", "double vision", "diplopia", "loss of vision", "vision"], { tier: "detailed" }),
    yn("associated", "jaundice", "Jaundice", "Any yellowness of eyes or urine?", ["jaundice", "yellow", "yellowish", "icterus"]),
    yn("associated", "reduced_urine", "Reduced urine output", "Has urine output reduced?", ["reduced urine", "less urine", "oliguria", "anuria", "not passing urine", "urine output"]),
    yn("associated", "breathlessness", "Breathlessness", "Any breathlessness or fast breathing?", ["breathlessness", "breathless", "dyspnoea", "dyspnea", "fast breathing", "shortness of breath"], { tier: "detailed" }),
    yn("associated", "palpitations_chest", "Palpitations / chest pain before collapse", "Any palpitations or chest pain before losing consciousness?", ["palpitations", "chest pain", "racing heart", "fluttering"], { tier: "detailed" }),
    yn("associated", "tremor_sweating", "Tremor / sweating / anxiety", "Any tremulousness, sweating, or restlessness (withdrawal, hypoglycaemia)?", ["tremor", "tremulous", "shaking hands", "sweating", "sweaty", "restless", "anxious"], { tier: "detailed" }),
    yn("associated", "weight_loss", "Weight loss / anorexia", "Any weight loss or loss of appetite over the preceding weeks?", ["weight loss", "lost weight", "anorexia", "loss of appetite", "not eating"], { tier: "detailed" }),
    // Red flags
    yn("red_flag", "neck_stiffness", "Neck stiffness", "Any neck stiffness or pain on bending the neck?", ["neck stiffness", "stiff neck", "neck rigidity", "neck pain"], { teach: "Neck stiffness in an obtunded patient points to meningitis or subarachnoid bleeding; the sign fades as coma deepens, so the history from attendants matters." }),
    yn("red_flag", "head_injury", "Head injury / fall", "Any recent head injury or fall, even weeks ago?", ["head injury", "trauma", "fall", "fell", "hit", "accident", "rta"], { teach: "A fall days or weeks ago, forgotten by the family, is the usual story behind a subdural haematoma." }),
    yn("red_flag", "poisoning", "Poisoning / overdose", "Any possibility of poisoning, insecticide, or overdose — empty containers, suicidal intent, smell?", ["poison", "poisoning", "insecticide", "organophosphate", "op poisoning", "overdose", "consumed", "ingested", "tablets consumed", "suicidal", "smell", "empty bottle", "celphos", "aluminium phosphide"], { teach: "Empty containers, a smell, or a family dispute are asked about because the patient cannot tell you, and organophosphate poisoning needs recognising at once." }),
    yn("red_flag", "alcohol", "Alcohol use / recent cessation", "Does the patient drink alcohol, and when was the last drink?", ["alcohol", "alcoholic", "drinks", "drinking", "last drink", "stopped drinking", "withdrawal", "liquor", "daru"], { teach: "The last drink, not just the habit, matters: withdrawal seizures and delirium begin one to three days after stopping." }),
    yn("red_flag", "diabetes_insulin", "Diabetes / insulin / sulfonylurea", "Is the patient diabetic, on insulin or sugar-lowering tablets, and when did they last eat?", ["diabetes", "diabetic", "insulin", "sugar tablets", "sugar medicine", "hypoglycaemia", "hypoglycemia", "sugar low", "not eaten", "skipped meals", "last meal"], { teach: "Insulin or sulfonylurea use with a missed meal makes hypoglycaemia the first thing to check; it mimics every other cause." }),
    yn("red_flag", "hypertension", "Hypertension", "Is the patient hypertensive, and was a high reading recorded?", ["hypertension", "hypertensive", "blood pressure", "bp", "high bp"], { teach: "A very high blood pressure with altered sensorium raises hypertensive encephalopathy and intracerebral haemorrhage." }),
    yn("red_flag", "known_epilepsy", "Known epilepsy / drug adherence", "Is the patient a known case of seizures, and have anti-seizure medicines been missed?", ["epilepsy", "epileptic", "known seizure", "seizure disorder", "on antiepileptic", "missed", "stopped medicine", "not taking", "compliance", "adherence"], { teach: "In a known epileptic, missed doses, alcohol and sleep loss explain most breakthrough seizures; a post-ictal state should be improving hour by hour." }),
    yn("red_flag", "kidney_liver_disease", "Known kidney / liver disease", "Any known kidney disease, liver disease, or dialysis?", ["kidney disease", "ckd", "renal failure", "dialysis", "liver disease", "cirrhosis", "cld", "hepatic"], { teach: "Known kidney or liver disease makes uraemic or hepatic encephalopathy the likely cause, often with a precipitant to find." }),
    yn("red_flag", "focal_onset_or_first", "First seizure in adulthood / focal onset", "Is this the first-ever seizure in an adult, or did it start focally?", ["first seizure", "first time", "never before", "new onset", "focal", "one side", "started in"], { tier: "detailed", teach: "A first adult seizure, or one that began in one limb, points to a structural brain lesion and needs imaging." }),
    PREGNANCY,
    IMMUNOCOMPROMISE,
    // Exposures
    yn("exposure", "malaria_area", "Malaria / endemic area / travel", "Any travel to or residence in a malaria-endemic area, or recent malaria?", ["malaria", "endemic", "travel", "travelled", "visited", "village", "forest", "jharkhand", "odisha", "chhattisgarh", "north east"]),
    yn("exposure", "tb_contact", "TB contact / past TB", "Any past tuberculosis or contact (tuberculous meningitis)?", ["tb", "tuberculosis", "koch", "att", "akt", "tb contact", "past tb"]),
    yn("exposure", "pig_rice_mosquito", "Pig rearing / paddy fields / mosquito exposure", "Any pig rearing, paddy field work, or heavy mosquito exposure (Japanese encephalitis)?", ["pig", "pigs", "paddy", "rice field", "mosquito", "je", "japanese encephalitis"], { tier: "detailed" }),
    yn("exposure", "drug_history", "Sedatives / psychiatric drugs / new drugs", "Any sedatives, sleeping pills, psychiatric medicines, or newly started drugs?", ["sedative", "sleeping pills", "psychiatric", "antipsychotic", "new drug", "started recently", "tramadol", "opioid", "benzodiazepine"], { tier: "detailed" }),
    yn("exposure", "dog_bite", "Animal bite", "Any dog or other animal bite in the past months (rabies)?", ["dog bite", "animal bite", "bite", "bitten", "rabies"], { tier: "detailed" }),
  ],
  differentials: [
    { id: "meningitis", name: "Meningitis / encephalitis (including tuberculous, viral)", pointers: ["fever", "headache", "neck_stiffness", "seizure_activity"], discriminators: ["fever", "headache", "neck_stiffness", "vomiting", "seizure_activity", "tb_contact", "pig_rice_mosquito", "immunocompromise", "duration"] },
    { id: "stroke", name: "Stroke (ischaemic / haemorrhagic)", pointers: ["focal_deficit", "onset_mode", "hypertension"], discriminators: ["focal_deficit", "onset_mode", "hypertension", "headache", "vomiting", "head_injury", "diabetes_insulin"] },
    { id: "hypoglycaemia", name: "Hypoglycaemia", pointers: ["diabetes_insulin", "tremor_sweating"], discriminators: ["diabetes_insulin", "tremor_sweating", "onset_mode", "seizure_activity", "alcohol"] },
    { id: "metabolic", name: "Metabolic encephalopathy (uraemic / hepatic / electrolyte)", pointers: ["kidney_liver_disease", "jaundice", "reduced_urine", "fluctuation"], discriminators: ["kidney_liver_disease", "jaundice", "reduced_urine", "fluctuation", "sleep_wake", "tremor_sweating", "vomiting"] },
    { id: "sepsis", name: "Sepsis-associated encephalopathy", pointers: ["fever", "fluctuation", "breathlessness"], discriminators: ["fever", "fluctuation", "breathlessness", "reduced_urine", "neck_stiffness", "immunocompromise"] },
    { id: "poisoning", name: "Poisoning / overdose", pointers: ["poisoning", "drug_history"], discriminators: ["poisoning", "drug_history", "onset_mode", "witness", "vomiting", "tremor_sweating"] },
    { id: "alcohol_withdrawal", name: "Alcohol withdrawal / Wernicke's", pointers: ["alcohol", "tremor_sweating", "sleep_wake"], discriminators: ["alcohol", "tremor_sweating", "sleep_wake", "seizure_activity", "visual_symptoms", "jaundice"] },
    { id: "epilepsy", name: "Epilepsy (known / breakthrough) with post-ictal state", pointers: ["known_epilepsy", "seizure_activity", "post_ictal"], discriminators: ["known_epilepsy", "seizure_activity", "post_ictal", "seizure_onset_type", "seizure_duration", "incontinence", "focal_onset_or_first", "alcohol"] },
    { id: "cerebral_malaria", name: "Cerebral malaria", pointers: ["fever", "malaria_area", "seizure_activity"], discriminators: ["fever", "malaria_area", "seizure_activity", "jaundice", "reduced_urine", "neck_stiffness"] },
    { id: "hypertensive_encephalopathy", name: "Hypertensive encephalopathy / eclampsia", pointers: ["hypertension", "headache", "visual_symptoms", "pregnancy"], discriminators: ["hypertension", "headache", "visual_symptoms", "pregnancy", "seizure_activity", "focal_deficit"] },
    { id: "syncope", name: "Syncope (not a seizure)", pointers: ["prodrome", "palpitations_chest", "post_ictal"], discriminators: ["prodrome", "palpitations_chest", "post_ictal", "seizure_duration", "seizure_activity", "incontinence", "witness"] },
  ],
  output: {
    durationSlot: "duration",
    hpiOrder: ["onset", "duration", "onset_mode", "witness", "level", "fluctuation", "prodrome", "seizure_activity", "seizure_onset_type", "seizure_duration", "incontinence", "post_ictal", "sleep_wake", "progression", "prior_treatment", "prior_investigations"],
  },
};
