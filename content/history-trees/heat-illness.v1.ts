import type { HistoryTree } from "@/lib/history-check/types";
import { commonHpi, HUTCHISONS, MACLEODS, NPCCHH_HEAT, PREGNANCY, TINTINALLI, val, yn } from "@/content/history-trees/_helpers";

/**
 * HEAT ILLNESS / COLLAPSE IN THE HEAT — v1.0.0. CLINICAL CONTENT: PENDING CLINICIAN REVIEW.
 * Emergency department, north India. Summer heat waves bring two groups: people working hard
 * outdoors (construction, farming, traffic duty, daily-wage labour) who collapse at work, and
 * older or unwell people alone indoors without cooling who are found confused at home. The
 * history has two jobs: to establish the heat exposure and whether the brain is affected, and
 * to keep the mimics in view, because a patient with fever and confusion in May may have an
 * infection that the heat only made worse. Differentials: exertional heat stroke, classic heat
 * stroke, heat exhaustion, heat syncope, heat cramps, dehydration or low sodium, and the mimics
 * — meningitis or encephalitis, cerebral malaria, sepsis, anticholinergic or sympathomimetic
 * toxicity, thyroid storm, neuroleptic malignant syndrome and stroke.
 */
export const heatIllnessV1: HistoryTree = {
  id: "heat_illness",
  version: "1.0.0",
  complaint: "Heat illness / collapse in the heat",
  triggers: ["heat stroke", "heatstroke", "sunstroke", "sun stroke", "heat exhaustion", "heat illness", "heat cramps", "heat syncope", "hyperthermia", "hyperpyrexia", "collapse in heat", "collapsed in sun", "heat wave", "loo lagna", "loo lag gayi", "loo lagi", "garmi lag gayi"],
  setting: "Emergency department, north India",
  reviewStatus: "pending_clinician_review",
  reviewedBy: null,
  references: [NPCCHH_HEAT, TINTINALLI, MACLEODS, HUTCHISONS],
  slots: [
    ...commonHpi("illness"),
    val("informant", "found_by", "Who found the patient", "Who found the patient, where, and how long had the patient been lying there?", ["found", "found lying", "co worker", "coworker", "neighbour", "family", "police", "brought by", "lying since", "unwitnessed"]),
    // HPI
    val("hpi", "heat_setting", "Where the heat exposure happened", "Where was the patient — outdoors in the sun, at a construction site or field, on traffic duty, in a closed room without a fan or cooler, or in a parked vehicle?", ["outdoors", "in the sun", "construction site", "field", "farm", "traffic duty", "road", "closed room", "no fan", "no cooler", "tin roof", "vehicle", "kitchen", "factory", "brick kiln"]),
    val("hpi", "exertion", "Activity at the time", "What was the patient doing — heavy labour, running, a march or sport — or resting at home?", ["labour", "lifting", "digging", "harvesting", "running", "march", "sports", "training", "working", "resting", "sitting at home", "sleeping"]),
    val("hpi", "time_in_heat", "Time spent in the heat", "How many hours was the patient in the heat, and over how many days has the heat been this bad?", ["hours", "whole day", "since morning", "afternoon", "days", "heat wave", "noon"], { numeric: true }),
    val("hpi", "collapse_pattern", "How the collapse happened", "Did the patient collapse during effort, on standing up, or become gradually confused at rest, and was the recovery quick on lying down?", ["collapsed", "fell", "during work", "on standing", "stood up", "gradually", "confused", "recovered", "lying down", "woke up quickly"]),
    val("hpi", "fluid_salt_intake", "Water and salt taken", "How much water was taken that day, was any salt or ORS taken with it, or was a large amount of plain water drunk?", ["water", "litres", "glasses", "bottles", "ors", "salt", "nimbu pani", "lassi", "plain water", "very little water", "no water", "a lot of water"], { numeric: true }),
    yn("hpi", "sweating_state", "Sweating or dry skin", "Was the patient sweating heavily, or was the skin hot and dry?", ["sweating", "drenched", "wet", "hot and dry", "dry skin", "not sweating", "stopped sweating"]),
    val("hpi", "temperature_recorded", "Temperature recorded", "Was a temperature recorded before or on arrival, where on the body, and how long after the collapse?", ["temperature", "degrees", "fahrenheit", "celsius", "rectal", "axillary", "oral", "thermometer", "not measured", "very hot to touch"], { numeric: true }),
    val("hpi", "cooling_before", "Cooling before arrival", "Was any cooling done before arrival — shade, wet cloth, fanning, water poured over, or ice — and how soon?", ["shade", "wet cloth", "fan", "fanning", "water poured", "ice", "cool water", "sponging", "no cooling"]),
    // Associated
    yn("associated", "headache_heat", "Headache", "Any headache, nausea or giddiness before or after the collapse?", ["headache", "sir dard", "nausea", "giddiness", "chakkar", "lightheaded"]),
    yn("associated", "vomiting_loose_stools", "Vomiting or loose stools", "Any vomiting or loose stools, and how many times?", ["vomiting", "ulti", "loose stools", "loose motions", "diarrhoea", "times"]),
    yn("associated", "muscle_cramps", "Muscle cramps", "Any painful cramps in the legs, arms or abdomen during or after the work?", ["cramps", "cramp", "muscle spasm", "painful muscles", "khinchav", "calf pain"]),
    yn("associated", "thirst_giddiness", "Thirst and giddiness on standing", "Any marked thirst, dry mouth, or giddiness on standing up?", ["thirst", "thirsty", "dry mouth", "giddiness on standing", "blackout on standing", "weak"]),
    yn("associated", "urine_colour_heat", "Urine colour and amount", "When was urine last passed, and was it dark, cola-coloured or reduced in amount?", ["urine", "dark urine", "cola coloured", "brown urine", "reduced urine", "not passed urine", "last passed"]),
    yn("associated", "illness_before", "Illness in the days before", "Was there fever, chills, cough, burning urine or any illness in the days before the heat exposure?", ["fever before", "chills", "rigors", "cough", "burning urine", "unwell before", "ill for days", "fever since"]),
    // Red flags
    yn("red_flag", "altered_mentation", "Confusion or unconsciousness", "Is there any confusion, irrelevant talk, agitation, drowsiness or unconsciousness?", ["confusion", "confused", "irrelevant talk", "agitated", "drowsy", "unconscious", "not responding", "abnormal behaviour", "altered sensorium"], { teach: "Any change in the brain's function after heat exposure separates heat stroke from milder heat illness, and the damage grows with every minute the body stays hot." }),
    yn("red_flag", "seizure_heat", "Seizure", "Any fit or seizure during or after the collapse?", ["seizure", "fit", "fits", "convulsion", "jerking", "daura"], { teach: "A seizure after heat exposure marks the brain as involved, and also keeps infection of the brain and drug toxicity in view." }),
    yn("red_flag", "very_high_temperature", "Very high temperature", "Was the patient extremely hot to touch, or was a very high temperature recorded?", ["very hot", "burning hot", "high temperature", "hyperpyrexia"], { teach: "A very high core temperature with confusion carries a high mortality, and a temperature taken late or after cooling may read falsely low." }),
    yn("red_flag", "dark_scanty_urine", "Dark or scanty urine", "Has urine become very dark, cola-coloured or stopped?", ["cola coloured", "dark urine", "brown urine", "no urine", "stopped passing urine", "scanty urine"], { teach: "Dark or absent urine after heavy exertion in the heat raises muscle breakdown and kidney injury, which may declare themselves only after the collapse." }),
    yn("red_flag", "bleeding_heat", "Bleeding", "Any bleeding from the gums or nose, blood in vomit or stools, or easy bruising?", ["bleeding", "gums", "nose bleed", "blood in vomit", "black stools", "blood in stool", "bruising", "red spots"], { teach: "Bleeding after heat stroke suggests the clotting system is failing, and the same picture can come from severe infection or malaria." }),
    yn("red_flag", "neck_stiffness_rash", "Neck stiffness or rash", "Any neck stiffness, a rash, or sensitivity to light?", ["neck stiffness", "stiff neck", "rash", "spots", "photophobia", "light hurts"], { teach: "Neck stiffness or a rash with fever and confusion keeps meningitis and meningococcal infection in the differential even in a heat wave." }),
    yn("red_flag", "one_sided_weakness", "Weakness of one side or slurred speech", "Any weakness of one side, deviation of the face, or slurred speech?", ["one side weakness", "weakness of one side", "facial deviation", "slurred speech", "cannot speak", "hemiparesis", "lakwa"], { teach: "A one-sided deficit in an older person found at home in the heat raises a stroke, which may have caused the patient to lie there in the first place." }),
    yn("red_flag", "rigidity_on_antipsychotic", "Stiffness on psychiatric medicine", "Is the patient on any psychiatric medicine, recently started or increased, and is there marked muscle stiffness?", ["antipsychotic", "psychiatric medicine", "haloperidol", "olanzapine", "risperidone", "stiffness", "rigid", "stiff body", "recently started", "dose increased"], { teach: "High temperature with rigidity in someone on an antipsychotic raises neuroleptic malignant syndrome, which can look very like heat stroke." }),
    PREGNANCY,
    // Exposure and background
    yn("exposure", "outdoor_occupation", "Outdoor or heavy work", "Does the patient work outdoors or in hot conditions — construction, farming, traffic duty, daily-wage labour, a kitchen or a factory?", ["construction", "labourer", "labour", "farmer", "farming", "traffic police", "traffic duty", "daily wage", "mazdoor", "kitchen", "factory", "brick kiln", "delivery", "rickshaw"]),
    yn("exposure", "lives_alone_vulnerable", "Older, living alone or dependent", "Is the patient elderly, living alone, bedbound or dependent on others for water, without a fan or cooler at home?", ["elderly", "old", "lives alone", "alone", "bedbound", "dependent", "no fan", "no cooler", "no electricity", "power cut", "top floor"], { teach: "Older people living alone, bedbound or without cooling are the ones found with classic heat stroke after days of a heat wave rather than hours of effort." }),
    yn("exposure", "heat_risk_medicines", "Medicines that impair heat loss", "Is the patient taking water tablets, medicines for allergy, bladder, sleep or mood, psychiatric medicines, or blood pressure medicines?", ["water tablet", "diuretic", "furosemide", "anticholinergic", "antihistamine", "allergy medicine", "bladder medicine", "sleeping pill", "antidepressant", "antipsychotic", "bp medicine", "beta blocker"], { teach: "Water tablets, anticholinergic and psychiatric medicines each reduce the body's ability to shed heat or hold fluid, and some cause a toxic picture of their own." }),
    yn("exposure", "stimulant_use", "Stimulant or other drug use", "Any use of stimulants, recreational drugs, or large amounts of energy drinks or pre-workout supplements?", ["stimulant", "amphetamine", "cocaine", "ecstasy", "party drugs", "energy drink", "pre workout", "supplement", "smack", "ganja"], { teach: "Stimulant drugs generate heat themselves, so a hot, agitated patient may be showing a drug effect as much as the weather." }),
    yn("exposure", "thyroid_symptoms", "Thyroid disease or symptoms", "Is there known thyroid disease, or recent weight loss, tremor, palpitations or heat intolerance before this?", ["thyroid", "hyperthyroid", "weight loss", "tremor", "palpitations", "heat intolerance", "goitre", "neck swelling"], { tier: "detailed", teach: "Fever, agitation and a racing heart in someone with an overactive thyroid raise thyroid storm, which heat or infection can set off." }),
    yn("exposure", "malaria_exposure", "Malaria exposure", "Has the patient had fever with chills recently, or travelled to or live in an area where malaria is common?", ["malaria", "chills", "rigors", "mosquito", "travelled", "endemic area", "previous malaria"], { teach: "Fever with confusion in the season when malaria also rises means cerebral malaria stays in view until a smear or rapid test has been done." }),
    yn("exposure", "chronic_illness_heat", "Chronic illness or alcohol", "Any heart failure, kidney disease, diabetes, dementia, or heavy alcohol use?", ["heart failure", "kidney disease", "diabetes", "sugar", "dementia", "alcohol", "daru", "obesity"], { tier: "detailed" }),
    yn("exposure", "previous_heat_illness", "Previous heat illness", "Has the patient had heat illness before, and were others at the same site also affected this time?", ["previous heat stroke", "before", "last summer", "others affected", "co workers also", "same site"], { tier: "detailed" }),
  ],
  differentials: [
    { id: "exertional_heat_stroke", name: "Exertional heat stroke", pointers: ["altered_mentation", "exertion", "outdoor_occupation", "very_high_temperature"], discriminators: ["altered_mentation", "exertion", "very_high_temperature", "sweating_state", "dark_scanty_urine", "stimulant_use", "time_in_heat"] },
    { id: "classic_heat_stroke", name: "Classic (non-exertional) heat stroke", pointers: ["altered_mentation", "lives_alone_vulnerable", "heat_risk_medicines", "very_high_temperature"], discriminators: ["altered_mentation", "lives_alone_vulnerable", "heat_risk_medicines", "sweating_state", "found_by", "chronic_illness_heat"] },
    { id: "heat_exhaustion", name: "Heat exhaustion", pointers: ["thirst_giddiness", "headache_heat", "vomiting_loose_stools"], discriminators: ["altered_mentation", "thirst_giddiness", "headache_heat", "sweating_state", "fluid_salt_intake", "temperature_recorded"] },
    { id: "heat_syncope", name: "Heat syncope", pointers: ["collapse_pattern", "thirst_giddiness"], discriminators: ["collapse_pattern", "altered_mentation", "thirst_giddiness", "heat_risk_medicines", "seizure_heat"] },
    { id: "heat_cramps", name: "Heat cramps", pointers: ["muscle_cramps", "exertion"], discriminators: ["muscle_cramps", "fluid_salt_intake", "altered_mentation", "dark_scanty_urine"] },
    { id: "dehydration_hyponatraemia", name: "Dehydration or low sodium", pointers: ["fluid_salt_intake", "vomiting_loose_stools", "heat_risk_medicines"], discriminators: ["fluid_salt_intake", "vomiting_loose_stools", "heat_risk_medicines", "seizure_heat", "altered_mentation"] },
    { id: "meningitis_encephalitis", name: "Meningitis or encephalitis", pointers: ["neck_stiffness_rash", "illness_before", "seizure_heat"], discriminators: ["neck_stiffness_rash", "illness_before", "seizure_heat", "headache_heat", "exertion"] },
    { id: "cerebral_malaria", name: "Cerebral malaria", pointers: ["malaria_exposure", "illness_before", "altered_mentation"], discriminators: ["malaria_exposure", "illness_before", "urine_colour_heat", "bleeding_heat", "seizure_heat"] },
    { id: "sepsis", name: "Sepsis", pointers: ["illness_before", "chronic_illness_heat"], discriminators: ["illness_before", "chronic_illness_heat", "exertion", "heat_setting", "urine_colour_heat"] },
    { id: "drug_toxicity", name: "Anticholinergic or sympathomimetic toxicity", pointers: ["stimulant_use", "heat_risk_medicines"], discriminators: ["stimulant_use", "heat_risk_medicines", "sweating_state", "altered_mentation", "seizure_heat"] },
    { id: "thyroid_storm", name: "Thyroid storm", pointers: ["thyroid_symptoms"], discriminators: ["thyroid_symptoms", "illness_before", "vomiting_loose_stools", "altered_mentation"] },
    { id: "nms", name: "Neuroleptic malignant syndrome", pointers: ["rigidity_on_antipsychotic"], discriminators: ["rigidity_on_antipsychotic", "heat_risk_medicines", "exertion", "dark_scanty_urine", "onset_mode"] },
    { id: "stroke", name: "Stroke", pointers: ["one_sided_weakness", "lives_alone_vulnerable"], discriminators: ["one_sided_weakness", "found_by", "chronic_illness_heat", "onset_mode", "very_high_temperature"] },
  ],
  output: {
    durationSlot: "duration",
    hpiOrder: ["onset", "duration", "heat_setting", "exertion", "time_in_heat", "collapse_pattern", "fluid_salt_intake", "sweating_state", "temperature_recorded", "cooling_before", "progression", "prior_treatment", "prior_investigations"],
  },
};
