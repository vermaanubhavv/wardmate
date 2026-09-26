import type { HistoryTree } from "@/lib/history-check/types";
import { commonHpi, HUTCHISONS, KAPLAN_SADOCK, MACLEODS, val, yn } from "@/content/history-trees/_helpers";

/**
 * ABNORMAL BEHAVIOUR — v1.0.0. CLINICAL CONTENT: REVIEWED (Dr Anubhav Verma).
 * Psychiatry ward and casualty, north India. The history is almost always the attendant's.
 * Its first job is not to name the illness but to ask whether this is delirium: a medical
 * cause wearing a psychiatric face, fluctuating, with a clouded sensorium. Separate from the
 * altered-sensorium tree, which starts from an unconscious patient rather than a behaving one.
 * Differentials: delirium from infection, metabolic derangement, drugs or withdrawal;
 * substance intoxication or withdrawal; first episode psychosis; mania; relapse from stopping
 * treatment; dementia with behavioural change; post-ictal state; thyroid disease.
 */
export const alteredBehaviourV1: HistoryTree = {
  id: "altered_behaviour",
  version: "1.0.0",
  complaint: "Abnormal behaviour",
  triggers: ["abnormal behaviour", "abnormal behavior", "behaving oddly", "talking to self", "muttering", "irritable", "aggressive", "violent", "not sleeping", "restless", "suspicious", "psychosis", "mania", "confused", "pagal", "harkatein", "abusive", "wandering"],
  setting: "Psychiatry ward and casualty, north India",
  reviewStatus: "reviewed",
  reviewedBy: "Dr Anubhav Verma",
  references: [KAPLAN_SADOCK, MACLEODS, HUTCHISONS],
  slots: [
    ...commonHpi("change in behaviour"),
    val("hpi", "behaviour_description", "What the family actually saw", "In the attendant's own words, what has the patient been doing that is different?", ["talking to self", "muttering", "laughing alone", "abusive", "aggressive", "wandering", "not sleeping", "staring", "suspicious", "own words", "restless", "undressing"]),
    yn("hpi", "fluctuation", "Fluctuating through the day", "Does the behaviour come and go through the day, and is it worse at night?", ["fluctuating", "comes and goes", "worse at night", "sundowning", "lucid periods", "constant", "same all day", "better in morning"], { teach: "Behaviour that fluctuates through the day and worsens at night, with lucid periods in between, points towards delirium rather than a primary psychiatric illness." }),
    yn("hpi", "orientation", "Knows the time, place and people", "Does the patient know where they are, what time of day it is, and recognise the people around?", ["knows", "does not know", "disoriented", "recognises", "not recognising", "asking where", "time", "place", "oriented"], { teach: "Disorientation to time, place or people is the finding that separates a clouded sensorium from a psychiatric illness with clear consciousness." }),
    yn("hpi", "sleep_wake", "Sleep over the past nights", "How has sleep been — awake all night, reversed day and night, or needing very little sleep without tiredness?", ["awake all night", "not slept", "day night reversed", "little sleep", "not tired", "sleeping through day", "sleep normal"]),
    yn("associated", "hallucinations", "Seeing or hearing things others do not", "Does the patient hear voices or see things that others cannot, and what are they described as?", ["voices", "hearing", "seeing", "insects", "animals", "shadows", "commands", "commenting", "nobody there", "denies"]),
    yn("associated", "delusions", "Fixed beliefs others find untrue", "Are there beliefs that the family finds untrue — being watched, followed, poisoned, or having special powers?", ["watched", "followed", "poisoned", "suspicious", "conspiracy", "special powers", "wealth", "infidelity", "fixed belief", "cannot be convinced"]),
    yn("associated", "elevated_mood", "Overactivity, overspending, talking excessively", "Is the patient unusually cheerful, talking a great deal, spending or giving away money, or claiming abilities they do not have?", ["cheerful", "elated", "talking too much", "spending", "giving away", "grandiose", "overactive", "irritable", "singing", "religious"]),
    yn("associated", "self_care_decline", "Self-care and function", "Has bathing, dressing, eating or work stopped, and over how long?", ["not bathing", "not changing clothes", "not eating", "stopped working", "stopped studying", "withdrawn", "sitting idle", "months", "gradual"]),
    yn("associated", "memory_decline", "Memory and its course", "Has memory been failing over months, with getting lost, forgetting names, or repeating questions?", ["memory", "forgetting", "names", "getting lost", "repeating", "months", "years", "gradual", "recent memory", "no memory problem"], { tier: "detailed", teach: "A behaviour change on a background of months of failing memory asks a different set of questions from one that began this week." }),
    yn("associated", "past_psychiatric", "Past psychiatric illness and treatment now", "Any previous psychiatric illness, and is the treatment being taken or was it stopped recently?", ["previous illness", "psychiatric treatment", "tablets", "stopped", "irregular", "relapse", "admitted before", "injection", "never"], { teach: "A relapse after treatment was stopped is the commonest reason a known patient returns, and the family usually knows when the tablets ran out." }),
    yn("associated", "recent_medical_illness", "Fever, injury, breathlessness, passing urine, bowels", "Any fever, head injury, breathlessness, burning urine, constipation, or a fall in the days before?", ["fever", "head injury", "fall", "breathless", "cough", "burning urine", "not passing urine", "constipation", "vomiting", "dehydration", "recent illness"], { teach: "In an older patient a chest or urinary infection often shows first as changed behaviour, with no complaint of the infection itself." }),
    yn("associated", "seizure_history", "Fits before the behaviour change", "Was there a fit, or a period of staring and unresponsiveness, before the behaviour changed?", ["fit", "seizure", "convulsion", "staring", "unresponsive", "tongue bite", "urine passed", "after the fit", "known epilepsy"], { tier: "detailed" }),
    yn("exposure", "substance_use", "Alcohol or drugs, and when last taken", "Any alcohol or drug use, how much, and when was the last drink or dose?", ["alcohol", "drinking", "daily", "last drink", "cannabis", "ganja", "opioid", "smack", "tablets", "injected", "stopped", "days ago"], { teach: "Behaviour changing two to four days after the last drink asks about withdrawal, which follows a different course from intoxication." }),
    yn("exposure", "new_medicines", "New medicines or steroids", "Any new medicines, steroids, or treatment for tuberculosis or fits started recently?", ["new medicine", "steroid", "tuberculosis", "atb", "fits medicine", "started recently", "changed dose", "injection", "sleeping tablets"]),
    // Red flags
    yn("red_flag", "fever_neck_stiffness", "Fever with headache or neck stiffness", "Any fever with headache, vomiting, or neck stiffness since the behaviour changed?", ["fever", "headache", "vomiting", "neck stiffness", "photophobia", "drowsy", "rash", "seizure"], { teach: "Fever with headache or neck stiffness alongside changed behaviour raises infection of the brain or its coverings." }),
    yn("red_flag", "drowsiness_clouding", "Drowsy, difficult to rouse, or in and out of sleep", "Is the patient drowsy, difficult to wake, or drifting in and out through the day?", ["drowsy", "difficult to wake", "sleepy", "in and out", "not responding", "eyes closed", "rousable", "alert"], { teach: "Drowsiness with changed behaviour marks a clouded sensorium, which does not belong to a primary psychiatric illness." }),
    yn("red_flag", "tremor_sweating_withdrawal", "Tremor, sweating and agitation after stopping alcohol", "Any shaking of the hands, sweating, or agitation since alcohol or a sedative was stopped, and any fits?", ["tremor", "shaking", "sweating", "agitated", "stopped alcohol", "last drink", "sedative", "fit", "seeing insects", "two days"], { teach: "Tremor and sweating days after the last drink raise withdrawal, which can progress to fits and a confusional state." }),
    yn("red_flag", "violence_risk", "Threat or harm to self or others", "Has the patient threatened or harmed anyone, threatened to harm themselves, or handled a weapon?", ["violent", "hit", "threatened", "weapon", "knife", "harm to self", "suicidal", "jumping", "running away", "aggressive", "none"], { teach: "Threats or acts already made are asked about plainly, because the people at home are the ones who will be with the patient tonight." }),
    yn("red_flag", "not_eating_drinking", "Refusing food and fluids", "Has the patient refused food and fluids, and for how long?", ["not eating", "refusing food", "not drinking", "fluids", "days", "dehydrated", "dry tongue", "not passing urine"], { teach: "Refusing fluids turns a behavioural presentation into a medical one within a day or two." }),
    yn("red_flag", "focal_neuro_signs", "Weakness, speech difficulty or a new gait problem", "Any weakness of a limb, difficulty speaking, or a new unsteadiness of walking?", ["weakness", "limb", "speech", "slurring", "unsteady", "gait", "one side", "face deviation", "double vision"], { teach: "A limb or speech deficit alongside changed behaviour points at a structural cause in the brain." }),
    yn("red_flag", "poisoning_overdose", "Anything consumed before the change", "Was anything consumed before the behaviour changed — extra tablets, pesticide, or an unknown substance?", ["consumed", "tablets", "overdose", "pesticide", "insecticide", "unknown", "found empty", "container", "accidental", "nothing"], { teach: "Behaviour that changed abruptly in a previously well person asks what was taken, including things taken by accident." }),
  ],
  differentials: [
    { id: "delirium", name: "Delirium from a medical cause", pointers: ["fluctuation", "orientation", "recent_medical_illness", "drowsiness_clouding"], discriminators: ["fluctuation", "orientation", "recent_medical_illness", "drowsiness_clouding", "onset_mode", "fever_neck_stiffness"] },
    { id: "substance_intoxication", name: "Substance intoxication", pointers: ["substance_use", "onset_mode"], discriminators: ["substance_use", "onset_mode", "orientation", "hallucinations", "duration"] },
    { id: "withdrawal", name: "Alcohol or sedative withdrawal", pointers: ["tremor_sweating_withdrawal", "substance_use"], discriminators: ["tremor_sweating_withdrawal", "substance_use", "fluctuation", "hallucinations", "seizure_history"] },
    { id: "first_episode_psychosis", name: "First episode psychosis", pointers: ["hallucinations", "delusions", "self_care_decline"], discriminators: ["hallucinations", "delusions", "self_care_decline", "orientation", "duration", "past_psychiatric"] },
    { id: "mania", name: "Mania", pointers: ["elevated_mood", "sleep_wake"], discriminators: ["elevated_mood", "sleep_wake", "delusions", "past_psychiatric", "duration"] },
    { id: "relapse", name: "Relapse after stopping treatment", pointers: ["past_psychiatric"], discriminators: ["past_psychiatric", "duration", "hallucinations", "delusions", "self_care_decline"] },
    { id: "dementia_behaviour", name: "Dementia with behavioural change", pointers: ["memory_decline", "self_care_decline"], discriminators: ["memory_decline", "self_care_decline", "duration", "fluctuation", "orientation"] },
    { id: "post_ictal", name: "Post-ictal state", pointers: ["seizure_history", "onset_mode"], discriminators: ["seizure_history", "onset_mode", "duration", "orientation", "drowsiness_clouding"] },
    { id: "cns_infection", name: "Infection of the brain or its coverings", pointers: ["fever_neck_stiffness", "focal_neuro_signs"], discriminators: ["fever_neck_stiffness", "focal_neuro_signs", "drowsiness_clouding", "onset_mode", "seizure_history"] },
  ],
  output: {
    durationSlot: "duration",
    hpiOrder: ["onset", "duration", "behaviour_description", "onset_mode", "fluctuation", "orientation", "sleep_wake", "progression", "prior_treatment", "prior_investigations"],
  },
};
