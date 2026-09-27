import type { HistoryTree } from "@/lib/history-check/types";
import { commonHpi, HUTCHISONS, KAPLAN_SADOCK, MACLEODS, val, yn } from "@/content/history-trees/_helpers";

/**
 * FORGETFULNESS / MEMORY LOSS — v1.0.0. CLINICAL CONTENT: REVIEWED (Dr Anubhav Verma).
 * Psychiatry ward and OPD, north India, often a geriatric referral where the family says
 * "bhoolne lage hain" and the patient says nothing is wrong. The history is the family's, and
 * its first job is to separate a slow decline over years from a change over days, because the
 * second is delirium or a treatable cause until shown otherwise.
 * Differentials: Alzheimer's disease, vascular dementia, delirium, depression presenting as
 * memory loss (pseudodementia), alcohol-related memory loss (Korsakoff), hypothyroidism,
 * vitamin B12 deficiency, normal pressure hydrocephalus, chronic subdural haematoma,
 * neurosyphilis or HIV, and drug-induced memory impairment.
 */
export const memoryLossV1: HistoryTree = {
  id: "memory_loss",
  version: "1.0.0",
  complaint: "Forgetfulness / memory loss",
  triggers: ["forgetfulness", "forgetful", "forgets things", "memory loss", "loss of memory", "poor memory", "memory problem", "memory decline", "dementia", "bhoolna", "bhool jana", "bhoolne lage", "yaad nahi rehta", "yaad nahi", "cognitive decline", "gets lost", "repeats questions"],
  setting: "Psychiatry ward and OPD, north India",
  reviewStatus: "reviewed",
  reviewedBy: "Dr Anubhav Verma",
  references: [KAPLAN_SADOCK, MACLEODS, HUTCHISONS],
  slots: [
    ...commonHpi("memory loss"),
    val("hpi", "memory_description", "What is being forgotten", "In the family's own words, what is being forgotten — recent conversations, where things are kept, names, the way home — and what is still remembered from long ago?", ["recent events", "just said", "where kept", "misplaces", "names", "faces", "way home", "old memories intact", "repeats questions", "own words"]),
    val("hpi", "course_pattern", "Steady, stepwise or fluctuating", "Has the decline been slow and steady, in sudden steps, or up and down from day to day?", ["gradual", "steady", "slowly worsening", "stepwise", "sudden drop", "after a stroke", "fluctuating", "good and bad days", "worse at night", "same"], { teach: "A slow steady course, a stepwise one and a fluctuating one each point towards different causes." }),
    yn("hpi", "daily_function", "Managing money, cooking, medicines, travel", "Can the patient still handle money, cook, take their own medicines, and travel alone, and which of these was lost first?", ["money", "cooking", "medicines", "travel alone", "bathing", "dressing", "needs help", "dependent", "manages alone", "lost first"]),
    yn("hpi", "language_recognition", "Finding words and recognising people", "Is there difficulty finding words, following conversation, or recognising familiar people and places?", ["word finding", "cannot find words", "speech", "does not recognise", "recognises", "familiar places", "gets lost", "understanding"]),
    yn("hpi", "behaviour_personality", "Change in behaviour or personality", "Has the personality changed — suspicion, irritability, disinhibition, apathy, or wandering at night?", ["suspicious", "accuses of stealing", "irritable", "disinhibited", "inappropriate", "apathy", "withdrawn", "wandering at night", "no change in personality"]),
    yn("hpi", "hallucinations_parkinsonism", "Seeing things, slowness, stiffness", "Does the patient see people or animals that are not there, or has walking become slow and stiff with a tremor?", ["seeing people", "seeing animals", "visual hallucinations", "slow walking", "stiffness", "tremor", "shuffling", "falls"], { tier: "detailed" }),
    yn("associated", "gait_urine", "Walking difficulty and urine control", "Has walking become unsteady or magnetic, with urgency or wetting of clothes?", ["unsteady", "small steps", "feet stuck", "magnetic", "falls", "urgency", "wetting", "incontinence", "urine control lost"], { teach: "Walking trouble and loss of bladder control alongside memory decline are asked about together because the combination is a treatable pattern." }),
    yn("associated", "vascular_risk", "Stroke, BP, sugar, heart disease", "Any previous stroke or weakness of a limb, high blood pressure, diabetes, or heart disease?", ["stroke", "paralysis", "weakness of limb", "hypertension", "bp", "diabetes", "sugar", "heart disease", "smoker", "tia"]),
    yn("associated", "mood_symptoms", "Low mood, sleep and complaint of poor memory", "Is there low mood, poor sleep or loss of interest, and does the patient complain more about memory than the family does?", ["low mood", "sad", "loss of interest", "not sleeping", "complains of memory", "worried about memory", "gives up easily", "i don't know answers", "mood okay"], { teach: "Depression in older adults can present as memory complaint, and who is more worried about the memory, the patient or the family, is a useful clue." }),
    yn("associated", "thyroid_b12", "Slowness, cold intolerance, numb feet, pallor", "Any slowness, weight gain, cold intolerance, constipation, or numbness of the feet, pallor, or a vegetarian diet with no supplements?", ["slowness", "weight gain", "cold intolerance", "constipation", "dry skin", "hoarse", "numbness", "tingling feet", "pale", "vegetarian", "thyroid"]),
    yn("associated", "infection_risk", "Sexual health, HIV or syphilis", "Is there any history of HIV, syphilis, genital sores, or high-risk exposure?", ["hiv", "syphilis", "vdrl", "genital sore", "ulcer", "multiple partners", "blood transfusion", "tested", "negative"], { tier: "detailed" }),
    yn("associated", "family_history", "Memory loss in the family", "Did a parent or sibling have memory loss, and at what age did it begin?", ["mother", "father", "brother", "sister", "family history", "at a young age", "no family history"], { tier: "detailed" }),
    yn("exposure", "alcohol_use", "Alcohol and diet", "How much alcohol is taken and for how long, and has the diet been poor?", ["alcohol", "drinking", "daily", "years", "country liquor", "poor diet", "stopped drinking", "non drinker"]),
    val("exposure", "current_medicines", "Current medicines", "What medicines are taken — sleeping tablets, bladder or allergy tablets, painkillers, anti-epileptics or psychiatric medicines — and were any started recently?", ["sleeping tablets", "alprazolam", "clonazepam", "bladder tablets", "oxybutynin", "allergy tablets", "cough syrup", "tramadol", "anti epileptic", "new medicine", "started recently", "many medicines"], { teach: "Several common medicines cloud memory in older adults, and the timing of a new one against the decline is often telling." }),
    // Red flags
    yn("red_flag", "acute_change", "Sudden change over days", "Did the confusion come on over hours or days, with drowsiness, poor attention, or fever, urine infection or a new illness?", ["sudden", "over days", "since yesterday", "drowsy", "not attending", "fever", "burning urine", "cough", "not passing urine", "dehydrated", "acute"], { teach: "Change over days rather than months, with poor attention, points towards delirium, which carries its own mortality and a cause to be found." }),
    yn("red_flag", "head_injury_headache", "Fall or head injury, headache, blood thinners", "Has there been a fall or head injury in the past weeks or months, a new headache, or use of blood thinners?", ["fall", "head injury", "hit head", "headache", "vomiting", "blood thinner", "aspirin", "warfarin", "acitrom", "weakness one side"], { teach: "A minor fall weeks earlier, especially on blood thinners, can precede a slow bleed that resembles dementia." }),
    yn("red_flag", "rapid_progression_focal", "Rapid decline, fits, weakness, early onset", "Has the decline been rapid over weeks to months, or come with fits, weakness of one side, jerks, or begun before about sixty?", ["rapid", "within weeks", "fits", "seizures", "jerks", "weakness", "one side", "young age", "early onset", "under sixty"], { teach: "Fast decline, fits or new weakness change the list of causes towards ones that need urgent imaging and tests." }),
    yn("red_flag", "safety_risks", "Getting lost, leaving the gas on, driving, being exploited", "Has the patient got lost, left the stove or gas on, driven unsafely, had falls, or been exploited over money or property?", ["got lost", "wandered off", "gas left on", "stove", "fire", "driving", "falls", "money taken", "property", "exploited", "neglected", "abuse"], { teach: "Safety at home and vulnerability to exploitation are part of the history because they change what the family needs to arrange." }),
    yn("red_flag", "suicide_self_neglect", "Thoughts of ending life, not eating", "Has the patient spoken of ending life, stopped eating or drinking, or stopped caring for themselves?", ["wants to die", "suicidal", "end life", "not eating", "not drinking", "self neglect", "not bathing", "denies"], { teach: "Depression in older adults carries a real risk of suicide and of self-neglect, and both are known only when asked." }),
    yn("red_flag", "carer_strain", "Carer strain or harm to others", "Has the patient been aggressive towards the carer, and is the carer coping?", ["aggressive", "hits", "carer", "caregiver", "not coping", "exhausted", "alone", "no help", "coping"], { tier: "detailed", teach: "Aggression and an exhausted carer are the commonest reasons home care breaks down, and both put someone at risk." }),
  ],
  differentials: [
    { id: "alzheimers", name: "Alzheimer's disease", pointers: ["memory_description", "language_recognition"], discriminators: ["course_pattern", "memory_description", "daily_function", "language_recognition", "family_history"] },
    { id: "vascular_dementia", name: "Vascular dementia", pointers: ["vascular_risk", "course_pattern"], discriminators: ["course_pattern", "vascular_risk", "gait_urine", "rapid_progression_focal", "mood_symptoms"] },
    { id: "delirium", name: "Delirium", pointers: ["acute_change"], discriminators: ["acute_change", "course_pattern", "onset_mode", "current_medicines", "alcohol_use"] },
    { id: "pseudodementia", name: "Depression presenting as memory loss (pseudodementia)", pointers: ["mood_symptoms"], discriminators: ["mood_symptoms", "onset_mode", "suicide_self_neglect", "daily_function", "course_pattern"] },
    { id: "korsakoff", name: "Alcohol-related memory loss (Korsakoff)", pointers: ["alcohol_use"], discriminators: ["alcohol_use", "memory_description", "gait_urine", "thyroid_b12", "onset_mode"] },
    { id: "hypothyroidism", name: "Hypothyroidism", pointers: ["thyroid_b12"], discriminators: ["thyroid_b12", "mood_symptoms", "course_pattern", "current_medicines"] },
    { id: "b12_deficiency", name: "Vitamin B12 deficiency", pointers: ["thyroid_b12"], discriminators: ["thyroid_b12", "alcohol_use", "gait_urine", "course_pattern"] },
    { id: "nph", name: "Normal pressure hydrocephalus", pointers: ["gait_urine"], discriminators: ["gait_urine", "course_pattern", "head_injury_headache", "hallucinations_parkinsonism"] },
    { id: "subdural", name: "Chronic subdural haematoma", pointers: ["head_injury_headache"], discriminators: ["head_injury_headache", "course_pattern", "rapid_progression_focal", "alcohol_use", "current_medicines"] },
    { id: "infective", name: "Neurosyphilis or HIV-associated cognitive impairment", pointers: ["infection_risk"], discriminators: ["infection_risk", "rapid_progression_focal", "behaviour_personality", "course_pattern"] },
    { id: "drug_induced", name: "Drug-induced memory impairment", pointers: ["current_medicines"], discriminators: ["current_medicines", "onset", "course_pattern", "acute_change"] },
    { id: "lewy_body", name: "Dementia with Lewy bodies or Parkinson's disease dementia", pointers: ["hallucinations_parkinsonism"], discriminators: ["hallucinations_parkinsonism", "course_pattern", "current_medicines", "behaviour_personality"] },
  ],
  output: {
    durationSlot: "duration",
    hpiOrder: ["onset", "duration", "onset_mode", "memory_description", "course_pattern", "daily_function", "language_recognition", "behaviour_personality", "progression", "prior_treatment", "prior_investigations"],
  },
};
