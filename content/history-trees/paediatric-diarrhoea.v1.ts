import type { HistoryTree } from "@/lib/history-check/types";
import { commonHpi, ebem, HUTCHISONS, MACLEODS, paedBackground, val, yn } from "@/content/history-trees/_helpers";

/**
 * DIARRHOEA IN A CHILD — v1.0.0. CLINICAL CONTENT: REVIEWED (Dr Anubhav Verma).
 * Paediatric ward, north India. The history exists to answer one question first — how much
 * fluid has been lost and can the child still take fluid by mouth — and only then what caused
 * it. Nappy count, tears, feeding and alertness carry that answer better than any single sign.
 * Differentials: acute watery diarrhoea (viral or bacterial), dysentery, cholera, persistent
 * diarrhoea, diarrhoea accompanying another infection, antibiotic-associated diarrhoea,
 * lactose intolerance after an infection, and surgical causes presenting as loose stools.
 */
export const paediatricDiarrhoeaV1: HistoryTree = {
  id: "paediatric_diarrhoea",
  version: "1.0.0",
  complaint: "Diarrhoea in a child",
  triggers: ["diarrhoea in child", "child loose stools", "loose motions child", "baby loose stools", "gastroenteritis child", "dehydration child", "paediatric diarrhoea", "child vomiting and loose stools", "dast"],
  setting: "Paediatric ward, north India",
  reviewStatus: "reviewed",
  reviewedBy: "Dr Anubhav Verma",
  references: [
    ebem("Dehydration in infants and young children", 2008, "19231668"),
    MACLEODS,
    HUTCHISONS,
  ],
  slots: [
    ...commonHpi("loose stools"),
    ...paedBackground(),
    val("hpi", "stool_frequency", "How many stools a day", "How many loose stools in the past twenty-four hours, and how does that compare with normal for this child?", ["times", "stools", "per day", "twenty four hours", "more than", "normal for child", "frequency", "countless"], { numeric: true }),
    val("hpi", "stool_character", "What the stool looks like", "Are the stools watery, rice-water like, or do they contain blood or mucus?", ["watery", "rice water", "blood", "mucus", "green", "loose", "semi solid", "foul", "frothy", "bulky"]),
    yn("hpi", "vomiting", "Vomiting", "Is there vomiting, how many times, and can anything be kept down?", ["vomiting", "times", "everything", "keeps down", "cannot keep", "green", "bilious", "after feeds"]),
    val("hpi", "fluid_given", "What has been given by mouth", "What fluids have been given since this started — oral rehydration solution, home fluids, breast milk — and is the child taking them?", ["ors", "oral rehydration", "home fluids", "rice water", "breast milk", "taking", "refusing", "eagerly", "cannot drink", "salt sugar"]),
    val("hpi", "urine_output_nappies", "Wet nappies or urine passed", "How many wet nappies in the past day, or when did the child last pass urine?", ["nappies", "wet", "dry", "last passed", "hours ago", "fewer", "reduced", "normal", "since morning"], { numeric: true }),
    val("hpi", "activity_alertness", "Alertness and behaviour", "Is the child playing normally, restless and irritable, or drowsy and difficult to wake?", ["playing", "normal", "restless", "irritable", "thirsty", "drowsy", "lethargic", "difficult to wake", "floppy", "unconscious"]),
    yn("associated", "fever", "Fever", "Any fever with the loose stools?", ["fever", "temperature", "chills", "high grade", "measured"]),
    yn("associated", "abdominal_pain_distension", "Abdominal pain or distension", "Any abdominal pain, crying with drawing up of the legs, or a swollen abdomen?", ["abdominal pain", "crying", "drawing up legs", "distension", "swollen", "colicky", "tender"]),
    yn("associated", "tears_mouth", "Tears and mouth", "Does the child still produce tears when crying, and is the mouth moist or dry?", ["tears", "no tears", "crying without tears", "moist", "dry mouth", "dry tongue", "sticky"]),
    yn("associated", "eyes_fontanelle", "Sunken eyes or soft spot", "Are the eyes sunken, or the soft spot on the head sunken in an infant?", ["sunken eyes", "sunken", "fontanelle", "soft spot", "depressed", "hollow"]),
    yn("associated", "skin_pinch", "Skin that stays pinched", "When the skin of the abdomen is pinched, does it go back slowly?", ["skin pinch", "goes back slowly", "slow", "tenting", "immediately", "very slowly", "turgor"]),
    yn("associated", "cough_breathing", "Cough or fast breathing", "Any cough or fast breathing alongside the loose stools?", ["cough", "fast breathing", "breathless", "chest indrawing", "noisy"], { tier: "detailed" }),
    yn("associated", "rash_other", "Rash or other symptoms", "Any rash, ear discharge, or burning urine at the same time?", ["rash", "ear discharge", "burning urine", "other symptoms"], { tier: "detailed" }),
    // Red flags
    yn("red_flag", "unable_to_drink", "Unable to drink or drinking poorly", "Is the child unable to drink, or drinking very poorly?", ["cannot drink", "unable to drink", "refusing", "drinking poorly", "not taking", "vomits everything", "will not feed"], { teach: "A child who cannot drink cannot be corrected by mouth, and that single answer decides the route of every fluid that follows." }),
    yn("red_flag", "lethargic_unconscious", "Lethargic or difficult to wake", "Is the child abnormally sleepy, floppy, or difficult to wake?", ["lethargic", "drowsy", "difficult to wake", "floppy", "unconscious", "unresponsive", "not alert", "limp"], { teach: "Lethargy in a child with fluid loss marks severe depletion, and it appears well before the blood pressure changes." }),
    yn("red_flag", "sunken_eyes_no_urine", "Sunken eyes with no urine passed", "Are the eyes sunken, with no urine passed for six hours or more?", ["sunken eyes", "no urine", "six hours", "dry nappy", "not passed", "hours"], { teach: "Sunken eyes together with a dry nappy for hours mark severe fluid loss, which needs correcting before the cause is pursued." }),
    yn("red_flag", "blood_in_stool", "Blood in the stool", "Is there visible blood in the stool?", ["blood", "bloody", "red", "dysentery", "streaks", "frank blood", "mucus and blood"], { teach: "Visible blood changes the likely organism and the whole approach, and it raises the surgical causes that present as bloody stool in a child." }),
    yn("red_flag", "bilious_vomiting_distension", "Green vomiting or a tense swollen abdomen", "Is the vomit green or yellow-green, or is the abdomen tense and swollen?", ["green vomit", "bilious", "yellow green", "tense", "swollen abdomen", "distended", "hard", "not passing stool"], { teach: "Green vomiting with a distended abdomen in a child raises obstruction, which is a surgical problem wearing the clothes of gastroenteritis." }),
    yn("red_flag", "severe_malnutrition", "Severe wasting or swelling of the feet", "Is the child visibly very thin, or is there swelling of both feet?", ["very thin", "wasted", "visible ribs", "swelling of feet", "oedema", "malnutrition", "loose skin", "old man face"], { teach: "In severe malnutrition the usual signs of fluid loss read falsely, and both the assessment and the correction differ from a well-nourished child." }),
    yn("red_flag", "persistent_duration", "Loose stools lasting more than two weeks", "Have the loose stools continued for more than fourteen days?", ["fourteen days", "two weeks", "more than two weeks", "persistent", "continuing", "weeks", "on and off"], { teach: "Diarrhoea past fourteen days is a different problem from an acute episode, with its own causes in nutrition, infection and the gut lining." }),
    yn("red_flag", "convulsion", "Seizure", "Any fit or abnormal jerking?", ["fit", "seizure", "convulsion", "jerking", "twitching", "stiffening"], { teach: "A seizure alongside fluid loss raises a shifted sodium or a low sugar, either of which is corrected differently from plain dehydration." }),
    yn("exposure", "water_food_source", "Drinking water and food", "What is the source of drinking water, is it boiled or treated, and has there been outside food or a feeding bottle?", ["water source", "borewell", "hand pump", "tap", "boiled", "not boiled", "outside food", "bottle", "stored water", "well"]),
    yn("exposure", "similar_cases", "Others with the same illness", "Is anyone else at home or in the neighbourhood having loose stools?", ["others", "family", "sibling", "neighbourhood", "same", "outbreak", "several"]),
    yn("exposure", "recent_antibiotics", "Recent antibiotics or medicines", "Has the child had antibiotics or any other medicine in the past weeks?", ["antibiotics", "medicine", "syrup", "recently", "course", "local doctor", "given outside"], { tier: "detailed" }),
    yn("exposure", "sanitation_hygiene", "Sanitation and hand washing", "Is there a toilet at home, and is hand washing with soap usual before feeds?", ["toilet", "open defecation", "hand washing", "soap", "sanitation", "hygiene"], { tier: "detailed" }),
  ],
  differentials: [
    { id: "acute_watery", name: "Acute watery diarrhoea", pointers: ["stool_character", "vomiting", "similar_cases"], discriminators: ["stool_character", "blood_in_stool", "fever", "stool_frequency", "persistent_duration"] },
    { id: "dysentery", name: "Dysentery", pointers: ["blood_in_stool", "fever", "abdominal_pain_distension"], discriminators: ["blood_in_stool", "fever", "stool_character", "abdominal_pain_distension", "water_food_source"] },
    { id: "cholera", name: "Cholera", pointers: ["stool_character", "stool_frequency", "similar_cases", "water_food_source"], discriminators: ["stool_character", "stool_frequency", "similar_cases", "sunken_eyes_no_urine", "fever"] },
    { id: "persistent", name: "Persistent diarrhoea", pointers: ["persistent_duration", "severe_malnutrition", "growth"], discriminators: ["persistent_duration", "growth", "severe_malnutrition", "feeding_nutrition", "stool_character"] },
    { id: "secondary_to_infection", name: "Diarrhoea accompanying another infection", pointers: ["fever", "cough_breathing", "rash_other"], discriminators: ["fever", "cough_breathing", "rash_other", "stool_frequency", "stool_character"] },
    { id: "antibiotic_associated", name: "Antibiotic-associated diarrhoea", pointers: ["recent_antibiotics"], discriminators: ["recent_antibiotics", "stool_character", "fever", "blood_in_stool"] },
    { id: "lactose_intolerance", name: "Post-infective lactose intolerance", pointers: ["persistent_duration", "stool_character", "feeding_nutrition"], discriminators: ["persistent_duration", "stool_character", "feeding_nutrition", "abdominal_pain_distension"] },
    { id: "surgical", name: "Surgical cause presenting as loose stools", pointers: ["bilious_vomiting_distension", "blood_in_stool", "abdominal_pain_distension"], discriminators: ["bilious_vomiting_distension", "blood_in_stool", "abdominal_pain_distension", "stool_character", "vomiting"] },
  ],
  output: {
    durationSlot: "duration",
    hpiOrder: ["onset", "duration", "stool_frequency", "stool_character", "vomiting", "fluid_given", "urine_output_nappies", "activity_alertness", "feeding_nutrition", "progression", "prior_treatment", "prior_investigations"],
  },
};
