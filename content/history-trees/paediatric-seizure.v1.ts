import type { HistoryTree } from "@/lib/history-check/types";
import { commonHpi, HUTCHISONS, MACLEODS, paedBackground, rce, val, yn } from "@/content/history-trees/_helpers";

/**
 * SEIZURE IN A CHILD — v1.0.0. CLINICAL CONTENT: REVIEWED (Dr Anubhav Verma).
 * Paediatric ward, north India. Almost all of this history comes from whoever watched the
 * event, and the description of the event itself carries more than any test that follows.
 * Neurocysticercosis is a leading cause of new focal seizures in Indian children and belongs
 * in the differential from the outset. Differentials: febrile seizure, epilepsy, central
 * nervous system infection, neurocysticercosis, metabolic causes (low sugar, sodium, calcium),
 * head injury, hypoxic or structural brain injury, poisoning, and breath-holding or syncope
 * mistaken for a seizure.
 */
export const paediatricSeizureV1: HistoryTree = {
  id: "paediatric_seizure",
  version: "1.0.0",
  complaint: "Seizure in a child",
  triggers: ["seizure in child", "child fits", "convulsion child", "child seizure", "febrile seizure", "jerking child", "fits in baby", "paediatric seizure", "daura", "child convulsion"],
  setting: "Paediatric ward, north India",
  reviewStatus: "reviewed",
  reviewedBy: "Dr Anubhav Verma",
  references: [
    rce("The rational clinical examination. Does this adult patient have acute meningitis?", 1999, "10411200"),
    MACLEODS,
    HUTCHISONS,
  ],
  slots: [
    ...commonHpi("seizure"),
    ...paedBackground(),
    val("hpi", "eyewitness", "Who saw it", "Who actually watched the episode, and can they describe it from the beginning?", ["mother", "father", "grandmother", "teacher", "witnessed", "saw", "found afterwards", "nobody saw", "describes"]),
    val("hpi", "event_description", "What happened, from the start", "What exactly happened — did the child stiffen, jerk, go limp, or stare, and did it start in one part of the body?", ["stiffened", "jerking", "limp", "staring", "blank", "one side", "one limb", "started in", "whole body", "eyes rolled", "frothing", "tongue bite"]),
    val("hpi", "seizure_duration", "How long it lasted", "How long did the episode last, timed if possible, and did it stop on its own?", ["minutes", "seconds", "how long", "stopped on its own", "given medicine", "still going", "more than five", "brief"], { numeric: true }),
    val("hpi", "post_ictal", "Afterwards", "After it stopped, was the child sleepy, confused, or back to normal straight away, and was any limb weak?", ["sleepy", "drowsy", "confused", "normal immediately", "weak", "one side", "could not speak", "slept", "vomited"]),
    yn("hpi", "number_of_episodes", "How many episodes", "Was there one episode or more than one, and did the child recover fully in between?", ["one", "more than one", "several", "repeated", "recovered in between", "did not recover", "clusters", "back to back"]),
    yn("hpi", "fever_at_time", "Fever at the time", "Was there fever at the time of the episode, and for how long before it?", ["fever", "at the time", "before", "hours", "days", "high grade", "no fever", "measured"]),
    yn("associated", "preceding_illness", "Illness before the seizure", "Was there any cough, loose stools, ear discharge, vomiting or headache in the days before?", ["cough", "loose stools", "ear discharge", "vomiting", "headache", "cold", "unwell", "before"]),
    yn("associated", "headache_vomiting", "Headache or persistent vomiting", "Any headache, especially early morning, or repeated vomiting in recent weeks?", ["headache", "early morning", "vomiting", "repeated", "projectile", "weeks", "worsening"]),
    yn("associated", "behaviour_school", "Change in behaviour or school performance", "Any change in behaviour, alertness, or performance at school in recent weeks?", ["behaviour", "school", "performance", "declining", "not concentrating", "irritable", "withdrawn", "change"]),
    yn("associated", "weakness_vision", "Weakness or visual change", "Any weakness of a limb, unsteadiness, squint, or change in vision?", ["weakness", "one side", "unsteady", "squint", "vision", "blurring", "double", "falling"]),
    yn("associated", "trauma_recent", "Recent head injury", "Any fall or blow to the head in recent days or weeks?", ["head injury", "fall", "blow", "trauma", "hit", "recently"]),
    yn("associated", "skin_lesions", "Skin patches or lumps under the skin", "Any pale or depigmented patches on the skin, or small firm lumps under the skin?", ["patches", "depigmented", "pale patch", "lumps", "nodules", "under the skin", "birthmark", "cafe au lait"], { tier: "detailed" }),
    yn("associated", "feeding_fasting", "Missed feeds or fasting", "Had the child missed feeds, been fasting, or been vomiting before the episode?", ["missed feeds", "fasting", "not eaten", "vomiting", "since morning", "empty stomach"], { tier: "detailed" }),
    // Red flags
    yn("red_flag", "prolonged_seizure", "Seizure lasting more than five minutes or repeated", "Did the episode last more than five minutes, or did episodes repeat without the child waking fully in between?", ["more than five minutes", "prolonged", "still going", "repeated", "did not wake", "back to back", "clusters", "status"], { teach: "A seizure past five minutes is unlikely to stop on its own, and the longer it runs the harder it becomes to stop." }),
    yn("red_flag", "focal_features", "Seizure starting in one part of the body", "Did the movement begin in one limb or one side of the face, or did the eyes turn persistently to one side?", ["one limb", "one side", "started in", "face", "eyes turned", "focal", "then spread", "arm first"], { teach: "A seizure that begins in one part of the body points to a focus in the brain rather than a generalised cause, which in this setting includes neurocysticercosis." }),
    yn("red_flag", "post_ictal_weakness", "Weakness of a limb afterwards", "Was any limb weak after the episode, and how long did that last?", ["weakness after", "one side", "could not move", "lasted", "hours", "still weak", "todd"], { teach: "Weakness persisting after a seizure points to a structural focus, and if it does not resolve it raises a lesion rather than an after-effect." }),
    yn("red_flag", "meningeal_features", "Neck stiffness, bulging soft spot or rash", "Any neck stiffness, a bulging soft spot in an infant, or a rash that does not fade on pressure?", ["neck stiffness", "bulging fontanelle", "soft spot", "rash", "does not fade", "non blanching", "arching", "photophobia"], { teach: "A seizure with neck stiffness or a non-blanching rash shifts this from a febrile seizure to an infection of the brain and its coverings." }),
    yn("red_flag", "not_returning_to_normal", "Not back to normal after the episode", "Has the child failed to return to normal alertness since the episode?", ["not normal", "still drowsy", "not waking", "unresponsive", "hours later", "confused", "not recognising"], { teach: "A child who does not return to baseline after a seizure has an ongoing process, and continued drowsiness is itself the finding." }),
    yn("red_flag", "age_outside_febrile", "Fever-associated seizure outside the usual age", "Was this a seizure with fever in a child under six months or over five years?", ["under six months", "over five years", "age", "six months", "five years", "outside", "first time at"], { teach: "A fever-associated seizure outside the six-month to five-year band does not fit a simple febrile seizure, and the cause has to be sought elsewhere." }),
    yn("red_flag", "raised_pressure_features", "Early morning headache with vomiting", "Any early morning headache with vomiting, a head that is growing fast, or a squint appearing recently?", ["early morning headache", "vomiting", "head circumference", "growing fast", "squint", "bulging", "sunset eyes", "irritable"], { teach: "Early morning headache with vomiting in a child raises pressure inside the skull, which needs imaging before anything else." }),
    yn("red_flag", "poisoning_access", "Access to medicines or chemicals", "Could the child have swallowed any medicine, kerosene, pesticide or other chemical?", ["swallowed", "medicine", "tablets", "kerosene", "pesticide", "chemical", "access", "found open", "bottle", "grandmother medicine"], { teach: "A first seizure in a previously well toddler always asks what they might have swallowed, because the history is the only way to find it." }),
    yn("red_flag", "hypoglycaemia_risk", "Missed feeds, vomiting or known metabolic problem", "Had the child not eaten for a long period, been vomiting, or is a metabolic condition known?", ["not eaten", "fasting", "vomiting", "metabolic", "known condition", "low sugar", "hypoglycaemia", "early morning"], { teach: "Low blood sugar causes seizures and is corrected in moments, so the question comes before the longer investigations begin." }),
    yn("exposure", "family_history_seizures", "Family history of seizures", "Any seizures, febrile fits or epilepsy in the parents, siblings or close family?", ["family history", "seizures", "febrile fits", "epilepsy", "sibling", "mother", "father", "cousin"]),
    yn("exposure", "previous_seizures", "Previous episodes and treatment", "Has the child had seizures before, is any regular medicine being taken, and have any doses been missed?", ["previous", "before", "known epilepsy", "medicine", "regular", "missed doses", "stopped", "phenytoin", "valproate", "levetiracetam"]),
    yn("exposure", "pork_sanitation", "Diet and sanitation", "Is there pork in the diet, open defecation nearby, or untreated drinking water?", ["pork", "open defecation", "sanitation", "untreated water", "village", "hygiene", "vegetables", "raw"], { tier: "detailed" }),
    yn("exposure", "birth_asphyxia_delay", "Birth difficulty or developmental delay", "Was there any difficulty at birth, and has development been normal since?", ["did not cry", "birth asphyxia", "nicu", "delayed", "development", "milestones", "cerebral palsy", "not sitting", "not walking"]),
  ],
  differentials: [
    { id: "febrile_seizure", name: "Febrile seizure", pointers: ["fever_at_time", "event_description", "family_history_seizures"], discriminators: ["fever_at_time", "seizure_duration", "focal_features", "age_outside_febrile", "meningeal_features", "not_returning_to_normal", "post_ictal"] },
    { id: "epilepsy", name: "Epilepsy", pointers: ["previous_seizures", "family_history_seizures", "number_of_episodes"], discriminators: ["previous_seizures", "family_history_seizures", "fever_at_time", "event_description", "focal_features", "birth_asphyxia_delay"] },
    { id: "cns_infection", name: "Central nervous system infection", pointers: ["meningeal_features", "fever_at_time", "not_returning_to_normal", "preceding_illness"], discriminators: ["meningeal_features", "fever_at_time", "not_returning_to_normal", "preceding_illness", "immunisation", "seizure_duration"] },
    { id: "neurocysticercosis", name: "Neurocysticercosis", pointers: ["focal_features", "post_ictal_weakness", "pork_sanitation", "headache_vomiting"], discriminators: ["focal_features", "post_ictal_weakness", "pork_sanitation", "headache_vomiting", "fever_at_time", "behaviour_school"] },
    { id: "metabolic_seizure", name: "Metabolic cause (sugar, sodium, calcium)", pointers: ["hypoglycaemia_risk", "feeding_fasting"], discriminators: ["hypoglycaemia_risk", "feeding_fasting", "fever_at_time", "number_of_episodes", "birth_history"] },
    { id: "head_injury_child", name: "Head injury", pointers: ["trauma_recent"], discriminators: ["trauma_recent", "focal_features", "not_returning_to_normal", "post_ictal_weakness"] },
    { id: "structural_hypoxic", name: "Structural or hypoxic brain injury", pointers: ["birth_asphyxia_delay", "development", "focal_features"], discriminators: ["birth_asphyxia_delay", "development", "focal_features", "previous_seizures", "skin_lesions"] },
    { id: "poisoning_child", name: "Poisoning", pointers: ["poisoning_access"], discriminators: ["poisoning_access", "fever_at_time", "not_returning_to_normal", "event_description", "previous_seizures"] },
    { id: "raised_icp_child", name: "Raised intracranial pressure", pointers: ["raised_pressure_features", "headache_vomiting", "behaviour_school"], discriminators: ["raised_pressure_features", "headache_vomiting", "behaviour_school", "weakness_vision", "focal_features"] },
    { id: "non_epileptic", name: "Breath-holding or faint mistaken for a seizure", pointers: ["event_description", "post_ictal"], discriminators: ["event_description", "post_ictal", "seizure_duration", "eyewitness", "fever_at_time"] },
  ],
  output: {
    durationSlot: "duration",
    hpiOrder: ["onset", "duration", "eyewitness", "event_description", "seizure_duration", "number_of_episodes", "post_ictal", "fever_at_time", "progression", "birth_history", "development", "immunisation", "prior_treatment", "prior_investigations"],
  },
};
