import type { HistoryTree } from "@/lib/history-check/types";
import { commonHpi, MACLEODS, PREGNANCY, val, yn } from "@/content/history-trees/_helpers";

/**
 * SNAKE BITE — v1.0.0. CLINICAL CONTENT: PENDING CLINICIAN REVIEW.
 * Differentials: haemotoxic envenomation (Russell's viper, saw-scaled viper), neurotoxic
 * envenomation (cobra, krait), dry bite / non-venomous bite, scorpion sting, other bite
 * mimics, anxiety reaction.
 */
export const snakeBiteV1: HistoryTree = {
  id: "snake_bite",
  version: "1.0.0",
  complaint: "Snake bite",
  triggers: ["snake bite", "snakebite", "bitten by snake", "snake", "unknown bite", "bite mark", "krait", "cobra", "viper", "scorpion sting", "sting"],
  setting: "Adult medicine ward, north India",
  reviewStatus: "pending_clinician_review",
  reviewedBy: null,
  references: [
    { title: "Standard treatment guidelines: management of snake bite", source: "Ministry of Health and Family Welfare, India", year: 2017 },
    { title: "WHO guidelines for the management of snakebites, 2nd edition (South-East Asia Region)", source: "World Health Organization", year: 2016 },
    { title: "Snake envenoming", source: "Nat Rev Dis Primers", year: 2017, pmid: "28905944" },
    MACLEODS,
  ],
  slots: [
    ...commonHpi("bite"),
    val("hpi", "time_of_bite", "Time of the bite", "At what time was the bite, and how many hours ago?", ["at", "am", "pm", "hours ago", "last night", "this morning", "yesterday", "time", "while sleeping", "night"], { numeric: true }),
    val("hpi", "circumstances", "Circumstances", "Where and how did it happen — in the field, at night while sleeping on the floor, near water, in the house?", ["field", "farm", "sleeping", "floor", "night", "house", "water", "paddy", "grass", "walking", "dark", "toilet", "circumstance"]),
    val("hpi", "snake_description", "Description of the snake", "Was the snake seen, killed or brought — its colour, length, hood, pattern, and any photograph?", ["seen", "saw", "killed", "brought", "colour", "black", "brown", "hood", "pattern", "length", "photograph", "photo", "not seen", "cobra", "krait", "viper", "identified"]),
    val("hpi", "bite_site", "Site of the bite", "Where on the body is the bite, and how many fang marks?", ["foot", "leg", "hand", "finger", "arm", "toe", "ankle", "site", "fang marks", "two marks", "puncture", "no mark"]),
    val("hpi", "local_symptoms", "Local symptoms and progression", "Is there pain, swelling, blistering or bleeding at the site, and how fast is the swelling spreading?", ["pain", "swelling", "swollen", "spreading", "blister", "blisters", "bleeding from bite", "oozing", "blackening", "no swelling", "painless", "local"]),
    yn("hpi", "first_aid", "First aid and pre-hospital treatment", "Was a tourniquet or tight tie applied, was the wound cut or sucked, and was any traditional treatment or antivenom given before arrival?", ["tourniquet", "tied", "tight", "cut", "incision", "sucked", "herbal", "traditional", "tantrik", "ojha", "stone", "antivenom", "asv", "given at", "referred from", "phc"]),
    val("hpi", "symptom_timeline", "Symptoms since the bite", "What symptoms have appeared since the bite and in what order?", ["since then", "after", "then", "started", "vomiting", "drowsy", "drooping", "bleeding", "pain", "swelling", "weakness", "timeline"]),
    // Associated
    yn("associated", "bleeding", "Bleeding from anywhere", "Any bleeding from the gums, bite site, old wounds, nose, in vomit, urine or stool?", ["bleeding", "gums", "bite site", "oozing", "nose", "epistaxis", "blood in vomit", "haematemesis", "blood in urine", "haematuria", "black stools", "bruising", "wounds bleeding"]),
    yn("associated", "ptosis_diplopia", "Drooping eyelids / double vision", "Any drooping of the eyelids or double vision?", ["ptosis", "drooping", "eyelids", "double vision", "diplopia", "cannot open eyes", "heavy eyes"]),
    yn("associated", "swallowing_speech", "Difficulty swallowing or speaking", "Any difficulty swallowing, pooling of saliva, nasal voice, or slurred speech?", ["swallowing", "dysphagia", "saliva", "drooling", "nasal voice", "slurred", "speech", "cannot speak"]),
    yn("associated", "breathing_difficulty", "Breathing difficulty", "Any breathlessness, weak cough, or inability to lift the head or limbs?", ["breathlessness", "breathless", "breathing difficulty", "weak cough", "cannot lift head", "neck weakness", "broken neck sign", "weakness of limbs", "gasping"]),
    yn("associated", "abdominal_pain_vomiting", "Abdominal pain / vomiting", "Any abdominal pain or vomiting since the bite (krait bites present this way)?", ["abdominal pain", "pain abdomen", "vomiting", "vomit", "nausea"]),
    yn("associated", "urine_output_colour", "Urine output and colour", "How much urine has been passed since the bite, and is it dark, red, or cola-coloured?", ["urine", "passed urine", "less urine", "no urine", "dark urine", "red urine", "cola", "haematuria", "oliguria"]),
    yn("associated", "giddiness_sweating", "Giddiness / sweating / fainting", "Any giddiness, profuse sweating, palpitations, or fainting?", ["giddiness", "giddy", "sweating", "palpitations", "fainting", "collapse", "low bp"]),
    yn("associated", "headache_drowsiness", "Headache / drowsiness / confusion", "Any headache, drowsiness, or confusion?", ["headache", "drowsy", "drowsiness", "confused", "unconscious", "seizure"], { tier: "detailed" }),
    yn("associated", "chest_pain_ecg", "Chest pain / palpitations", "Any chest pain or palpitations (cardiotoxicity, scorpion sting)?", ["chest pain", "palpitations", "irregular heart", "scorpion"], { tier: "detailed" }),
    yn("associated", "previous_bite_asv", "Previous snake bite or antivenom", "Has the patient ever been bitten before, or received antivenom before?", ["previous bite", "bitten before", "antivenom before", "asv before", "reaction to antivenom", "allergy"], { tier: "detailed" }),
    // Red flags
    yn("red_flag", "neurotoxic_signs", "Any drooping, swallowing or breathing difficulty", "Is there any drooping of the eyelids, difficulty swallowing, or breathing difficulty?", ["ptosis", "drooping", "swallowing", "breathing difficulty", "breathless", "weak cough", "cannot lift head"], { teach: "Neurotoxic envenomation progresses from ptosis to respiratory paralysis within hours; the first droop is the moment to act, not the first gasp." }),
    yn("red_flag", "any_bleeding", "Any spontaneous bleeding", "Is there any bleeding from the gums, bite site, or elsewhere?", ["bleeding", "gums", "oozing", "nose", "blood in urine", "haematemesis", "black stools"], { teach: "Spontaneous bleeding means the venom has consumed the clotting factors; the bedside clotting test decides antivenom, and the history is the first clotting test." }),
    yn("red_flag", "rapid_swelling", "Rapidly spreading swelling", "Is the swelling spreading up the limb, past the next joint, within hours?", ["spreading", "rapidly", "past the knee", "past the elbow", "whole limb", "increasing", "within hours", "tense"], { teach: "Swelling crossing a joint within hours marks significant viper envenomation and the limb at risk of compartment syndrome." }),
    yn("red_flag", "reduced_dark_urine", "Reduced or dark urine", "Is the urine reduced, dark, or red?", ["less urine", "no urine", "dark urine", "red urine", "cola", "oliguria", "anuria"], { teach: "Acute kidney injury follows viper bites through haemolysis, myoglobin and shock; urine colour and volume are its earliest signs." }),
    yn("red_flag", "krait_pattern", "Bitten while asleep on the floor / no local signs / abdominal pain", "Was the patient bitten while asleep on the floor at night, with little or no local swelling, and abdominal pain or vomiting?", ["sleeping", "asleep", "floor", "night", "no swelling", "no mark", "painless", "abdominal pain", "vomiting"], { teach: "The krait bites the sleeping and leaves almost no mark; unexplained morning ptosis with abdominal pain after a night on the floor is a krait bite until proven otherwise." }),
    yn("red_flag", "tourniquet_traditional", "Tourniquet / cutting / traditional treatment", "Was a tight tourniquet applied, the wound cut, or traditional treatment given?", ["tourniquet", "tied tightly", "tight tie", "cut", "incision", "sucked", "herbal", "traditional", "tantrik", "ojha"], { teach: "A tight tourniquet removed suddenly can release a bolus of venom; how and when it comes off is a decision, not an afterthought." }),
    yn("red_flag", "delay_hours", "Long delay since the bite", "Has more than a few hours passed since the bite, especially with symptoms already present?", ["hours ago", "last night", "yesterday", "delay", "late", "days"], { teach: "Delay allows envenomation to establish; a patient arriving late with symptoms needs antivenom more urgently, not less." }),
    PREGNANCY,
    // Exposures
    yn("exposure", "occupation_area", "Occupation / area", "Is the patient a farmer or field worker, and are snake bites common in the village?", ["farmer", "fields", "farm worker", "village", "common", "area", "forest"], { tier: "detailed" }),
    yn("exposure", "allergy_asthma", "Allergy / asthma", "Any known allergy, asthma, or previous reaction to antivenom (antivenom reaction risk)?", ["allergy", "allergic", "asthma", "reaction", "anaphylaxis"], { tier: "detailed" }),
  ],
  differentials: [
    { id: "haemotoxic", name: "Haemotoxic envenomation (Russell's viper, saw-scaled viper)", pointers: ["bleeding", "any_bleeding", "rapid_swelling", "local_symptoms", "reduced_dark_urine"], discriminators: ["bleeding", "any_bleeding", "rapid_swelling", "local_symptoms", "reduced_dark_urine", "snake_description", "circumstances", "time_of_bite"] },
    { id: "neurotoxic", name: "Neurotoxic envenomation (cobra, krait)", pointers: ["ptosis_diplopia", "swallowing_speech", "breathing_difficulty", "neurotoxic_signs", "krait_pattern"], discriminators: ["ptosis_diplopia", "swallowing_speech", "breathing_difficulty", "neurotoxic_signs", "krait_pattern", "abdominal_pain_vomiting", "local_symptoms", "snake_description"] },
    { id: "dry_bite", name: "Dry bite / non-venomous bite", pointers: ["local_symptoms", "symptom_timeline"], discriminators: ["local_symptoms", "symptom_timeline", "bleeding", "ptosis_diplopia", "time_of_bite", "snake_description"] },
    { id: "scorpion", name: "Scorpion sting", pointers: ["giddiness_sweating", "chest_pain_ecg", "bite_site"], discriminators: ["giddiness_sweating", "chest_pain_ecg", "bite_site", "snake_description", "local_symptoms", "bleeding"] },
    { id: "anxiety", name: "Anxiety reaction after a suspected bite", pointers: ["giddiness_sweating", "snake_description"], discriminators: ["giddiness_sweating", "snake_description", "local_symptoms", "bleeding", "ptosis_diplopia", "symptom_timeline"] },
  ],
  output: {
    durationSlot: "duration",
    hpiOrder: ["onset", "duration", "time_of_bite", "circumstances", "snake_description", "bite_site", "local_symptoms", "first_aid", "symptom_timeline", "progression", "prior_treatment", "prior_investigations"],
  },
};
