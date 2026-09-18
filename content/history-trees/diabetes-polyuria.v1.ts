import type { HistoryTree } from "@/lib/history-check/types";
import { commonHpi, IMMUNOCOMPROMISE, MACLEODS, PREGNANCY, val, yn } from "@/content/history-trees/_helpers";

/**
 * POLYURIA / POLYDIPSIA / UNCONTROLLED DIABETES — v1.0.0. CLINICAL CONTENT: PENDING
 * CLINICIAN REVIEW. Differentials: newly diagnosed or uncontrolled diabetes, diabetic
 * ketoacidosis, hyperosmolar hyperglycaemic state, hypoglycaemia in a treated diabetic,
 * diabetic foot / infection precipitating decompensation, diabetes insipidus,
 * hypercalcaemia, chronic kidney disease, drug-induced (diuretics, steroids, lithium),
 * psychogenic polydipsia, urinary infection.
 */
export const diabetesPolyuriaV1: HistoryTree = {
  id: "diabetes_polyuria",
  version: "1.0.0",
  complaint: "Polyuria / uncontrolled diabetes",
  triggers: ["polyuria", "polydipsia", "excessive thirst", "increased thirst", "passing more urine", "frequent urination", "uncontrolled diabetes", "uncontrolled sugars", "high sugar", "high sugars", "hyperglycaemia", "hyperglycemia", "dka", "ketoacidosis", "diabetic", "sugar high", "newly detected diabetes"],
  setting: "Adult medicine ward, north India",
  reviewStatus: "pending_clinician_review",
  reviewedBy: null,
  references: [
    { title: "Hyperglycemic crises in adult patients with diabetes (ADA consensus)", source: "Diabetes Care", year: 2009, pmid: "19564476" },
    { title: "RSSDI clinical practice recommendations for the management of type 2 diabetes mellitus", source: "Int J Diabetes Dev Ctries", year: 2022 },
    { title: "ICMR guidelines for management of type 2 diabetes", source: "Indian Council of Medical Research", year: 2018 },
    { title: "Standards of care in diabetes (ADA)", source: "Diabetes Care", year: 2024 },
    MACLEODS,
  ],
  slots: [
    ...commonHpi("polyuria"),
    val("hpi", "urine_volume_pattern", "Urine volume and pattern", "How much urine is passed, how often by day and night, and is the volume large each time or small and frequent?", ["litres", "times a day", "times at night", "nocturia", "large volume", "large amounts", "small amounts", "frequent", "frequency", "volume", "every hour"], { numeric: true }),
    val("hpi", "thirst", "Thirst and fluid intake", "How much is the patient drinking, is the thirst constant, and does it wake the patient at night?", ["thirst", "thirsty", "drinking", "litres", "glasses", "constant", "at night", "wakes", "craving for water", "cold water"], { numeric: true }),
    yn("hpi", "known_diabetes", "Known diabetes", "Is the patient a known diabetic — since when, on what treatment, and what was the last sugar or HbA1c?", ["known diabetic", "diabetes since", "years", "on insulin", "on tablets", "metformin", "hba1c", "last sugar", "fasting", "controlled", "uncontrolled", "type 1", "type 2"]),
    val("hpi", "adherence", "Treatment adherence / recent changes", "Have doses been missed or stopped, has insulin run out or been stored badly, or has the treatment been changed recently?", ["missed", "stopped", "not taking", "ran out", "no insulin", "storage", "fridge", "changed", "switched", "self adjusted", "adherence", "compliance", "regularly"]),
    yn("hpi", "weight_change", "Weight change", "Has the weight fallen recently, and by how much?", ["weight loss", "lost weight", "weight", "kg", "thin", "clothes loose", "weight gain"]),
    yn("hpi", "appetite", "Appetite", "Is the appetite increased, normal, or reduced?", ["appetite", "hunger", "eating more", "polyphagia", "not eating", "anorexia", "reduced"]),
    yn("hpi", "vomiting_abdominal_pain", "Vomiting / abdominal pain", "Any vomiting or abdominal pain?", ["vomiting", "vomit", "nausea", "abdominal pain", "pain abdomen"]),
    yn("hpi", "breathing", "Fast or deep breathing", "Has anyone noticed fast or deep breathing, or a fruity smell on the breath?", ["fast breathing", "deep breathing", "breathless", "breathing heavily", "fruity", "smell", "acetone"]),
    yn("hpi", "sensorium", "Drowsiness / confusion", "Any drowsiness, confusion, or reduced responsiveness?", ["drowsy", "drowsiness", "confused", "confusion", "unresponsive", "altered sensorium", "unconscious"]),
    // Associated
    yn("associated", "infection_focus", "Fever / cough / burning urine / wound / boils", "Any fever, cough, burning urine, a non-healing wound, boils, or tooth or ear pain?", ["fever", "cough", "burning urine", "dysuria", "wound", "ulcer", "boils", "abscess", "tooth", "ear pain", "infection", "carbuncle", "cellulitis"]),
    yn("associated", "foot_symptoms", "Foot ulcer / numbness / burning feet", "Any foot ulcer, numbness, tingling, or burning of the feet, or a foot injury not noticed?", ["foot ulcer", "ulcer", "numbness", "tingling", "burning feet", "foot", "injury", "blister", "black toe", "gangrene"]),
    yn("associated", "visual_symptoms", "Blurring of vision", "Any blurring or change in vision?", ["blurring", "blurred", "vision", "eyesight", "spectacles changed", "floaters"]),
    yn("associated", "chest_pain_breathlessness", "Chest pain / breathlessness / palpitations", "Any chest pain, breathlessness on exertion, or palpitations?", ["chest pain", "breathlessness", "breathless", "palpitations", "angina", "sweating"]),
    yn("associated", "hypoglycaemia_episodes", "Low-sugar episodes", "Any episodes of sweating, tremor, hunger, confusion or blackouts relieved by sugar, especially at night?", ["hypoglycaemia", "hypoglycemia", "low sugar", "sweating", "tremor", "hunger", "confusion", "blackout", "relieved by sugar", "at night", "fainting"]),
    yn("associated", "genital_itching_thrush", "Genital itching / white discharge / recurrent thrush", "Any genital itching, white discharge, or recurrent fungal infections?", ["itching", "genital", "white discharge", "thrush", "candida", "balanitis", "fungal"], { tier: "detailed" }),
    yn("associated", "swelling_frothy_urine", "Swelling / frothy urine", "Any swelling of the face or legs, or frothy urine?", ["swelling", "oedema", "puffiness", "frothy urine", "froth"], { tier: "detailed" }),
    yn("associated", "postural_giddiness_erectile", "Giddiness on standing / erectile dysfunction / bloating", "Any giddiness on standing, bloating after meals, or erectile dysfunction (autonomic neuropathy)?", ["giddiness on standing", "postural", "bloating", "gastroparesis", "erectile", "impotence", "constipation alternating"], { tier: "detailed" }),
    yn("associated", "bone_pain_constipation", "Bone pain / constipation / kidney stones", "Any bone pain, constipation, kidney stones, or depression (hypercalcaemia)?", ["bone pain", "constipation", "kidney stones", "stones", "depression", "calcium"], { tier: "detailed" }),
    yn("associated", "headache_visual_field", "Headache / visual field loss / head injury", "Any headache, loss of side vision, or recent head injury or brain surgery (diabetes insipidus)?", ["headache", "side vision", "visual field", "head injury", "brain surgery", "pituitary"], { tier: "detailed" }),
    // Red flags
    yn("red_flag", "dka_features", "Vomiting, abdominal pain, fast breathing or drowsiness", "Are there any of vomiting, abdominal pain, fast or deep breathing, or drowsiness?", ["vomiting", "abdominal pain", "fast breathing", "deep breathing", "drowsy", "drowsiness", "confused", "fruity smell"], { teach: "These four symptoms in a diabetic are ketoacidosis or a hyperosmolar state until the ketones and the gas say otherwise; the fluids start on the history." }),
    yn("red_flag", "unable_to_drink", "Unable to keep fluids down", "Is the patient unable to drink or keep fluids down?", ["unable to drink", "not able to drink", "cannot keep down", "vomiting everything", "not taking orally"], { teach: "A polyuric patient who cannot drink dehydrates within hours; oral management is no longer an option." }),
    yn("red_flag", "infection_sepsis", "Fever with a focus, or a foot wound", "Is there fever with cough, burning urine, a wound, a foot ulcer, or an abscess?", ["fever", "cough", "burning urine", "wound", "foot ulcer", "abscess", "boil", "carbuncle", "cellulitis", "black toe"], { teach: "Infection is the commonest precipitant of decompensation and the commonest thing missed in the sugars; the foot needs to be looked at, not asked about." }),
    yn("red_flag", "insulin_stopped", "Insulin stopped or run out", "Has insulin been stopped, run out, or been unavailable in the past days?", ["stopped insulin", "ran out", "no insulin", "could not buy", "not available", "missed insulin", "stopped"], { teach: "Stopped insulin in a type 1 diabetic leads to ketoacidosis within a day or two; the reason it stopped (cost, supply, illness, misunderstanding) is what prevents the next admission." }),
    yn("red_flag", "chest_pain_or_stroke_symptoms", "Chest pain or stroke symptoms", "Any chest pain, sweating, breathlessness, weakness of a limb or slurred speech?", ["chest pain", "sweating", "breathlessness", "weakness", "slurred", "speech", "facial deviation"], { teach: "A vascular event precipitates and is precipitated by hyperglycaemia; a diabetic's heart attack is often painless and presents as the sugars going out of control." }),
    yn("red_flag", "hypoglycaemia_on_treatment", "Low-sugar episodes on sulfonylurea or insulin", "Is the patient on a sulfonylurea (glimepiride, gliclazide) or insulin with episodes of low sugar, especially with reduced intake or kidney disease?", ["glimepiride", "gliclazide", "glibenclamide", "sulfonylurea", "insulin", "low sugar", "hypoglycaemia", "not eating", "kidney disease", "elderly"], { teach: "Sulfonylurea hypoglycaemia in the elderly or in kidney disease recurs for days and kills; the drug name matters as much as the sugar reading." }),
    yn("red_flag", "steroid_use", "Steroid use", "Any steroids — tablets, injections for joint pain, inhalers, or from a chemist or traditional practitioner?", ["steroid", "steroids", "prednisolone", "dexa", "dexamethasone", "injection for joint", "inhaler", "chemist", "desi", "bhasma"], { teach: "Steroids from a chemist or healer are a common hidden cause of new or worsening hyperglycaemia on Indian wards." }),
    IMMUNOCOMPROMISE,
    PREGNANCY,
    // Exposures
    yn("exposure", "diet_activity", "Diet / physical activity", "What does the patient eat and drink in a day (sweets, sugary drinks, rice, fried food), and how active are they?", ["diet", "sweets", "sugar", "cold drinks", "juice", "rice", "fried", "activity", "walking", "sedentary", "exercise"]),
    yn("exposure", "family_history_diabetes", "Family history of diabetes", "Any diabetes in parents or siblings, and at what age?", ["family history", "mother", "father", "sibling", "diabetes in family", "age of onset"]),
    yn("exposure", "drugs_polyuria", "Drugs causing polyuria or hyperglycaemia", "Any diuretics, lithium, antipsychotics, thiazides, or new drugs?", ["diuretic", "lithium", "antipsychotic", "olanzapine", "thiazide", "new drug", "medicines"], { tier: "detailed" }),
    yn("exposure", "alcohol_tobacco", "Alcohol / tobacco", "Any alcohol or tobacco use?", ["alcohol", "drinks", "tobacco", "smoking", "beedi", "gutkha"], { tier: "detailed" }),
    yn("exposure", "kidney_disease_known", "Known kidney disease", "Any known kidney disease or dialysis?", ["kidney disease", "ckd", "dialysis", "creatinine", "nephropathy"], { tier: "detailed" }),
  ],
  differentials: [
    { id: "uncontrolled_dm", name: "Newly diagnosed or uncontrolled diabetes", pointers: ["urine_volume_pattern", "thirst", "weight_change", "known_diabetes", "family_history_diabetes"], discriminators: ["urine_volume_pattern", "thirst", "weight_change", "known_diabetes", "family_history_diabetes", "adherence", "genital_itching_thrush", "steroid_use", "diet_activity"] },
    { id: "dka", name: "Diabetic ketoacidosis", pointers: ["dka_features", "vomiting_abdominal_pain", "breathing", "insulin_stopped", "infection_sepsis"], discriminators: ["dka_features", "vomiting_abdominal_pain", "breathing", "insulin_stopped", "infection_sepsis", "known_diabetes", "sensorium", "unable_to_drink"] },
    { id: "hhs", name: "Hyperosmolar hyperglycaemic state", pointers: ["sensorium", "unable_to_drink", "infection_sepsis", "known_diabetes"], discriminators: ["sensorium", "unable_to_drink", "infection_sepsis", "known_diabetes", "breathing", "vomiting_abdominal_pain", "drugs_polyuria", "duration"] },
    { id: "hypoglycaemia", name: "Hypoglycaemia on treatment", pointers: ["hypoglycaemia_episodes", "hypoglycaemia_on_treatment", "appetite"], discriminators: ["hypoglycaemia_episodes", "hypoglycaemia_on_treatment", "appetite", "kidney_disease_known", "adherence", "alcohol_tobacco"] },
    { id: "infection_precipitated", name: "Infection precipitating decompensation (foot, urine, chest, skin)", pointers: ["infection_focus", "foot_symptoms", "infection_sepsis"], discriminators: ["infection_focus", "foot_symptoms", "infection_sepsis", "dka_features", "known_diabetes"] },
    { id: "vascular_event", name: "Cardiac or cerebrovascular event with hyperglycaemia", pointers: ["chest_pain_breathlessness", "chest_pain_or_stroke_symptoms"], discriminators: ["chest_pain_breathlessness", "chest_pain_or_stroke_symptoms", "known_diabetes", "alcohol_tobacco"] },
    { id: "diabetes_insipidus", name: "Diabetes insipidus", pointers: ["urine_volume_pattern", "thirst", "headache_visual_field", "drugs_polyuria"], discriminators: ["urine_volume_pattern", "thirst", "headache_visual_field", "drugs_polyuria", "known_diabetes", "weight_change"] },
    { id: "hypercalcaemia", name: "Hypercalcaemia", pointers: ["bone_pain_constipation", "urine_volume_pattern"], discriminators: ["bone_pain_constipation", "urine_volume_pattern", "weight_change", "sensorium", "known_diabetes"] },
    { id: "ckd", name: "Chronic kidney disease (polyuria phase / diabetic nephropathy)", pointers: ["swelling_frothy_urine", "kidney_disease_known", "urine_volume_pattern"], discriminators: ["swelling_frothy_urine", "kidney_disease_known", "urine_volume_pattern", "hypoglycaemia_episodes", "appetite"] },
    { id: "psychogenic", name: "Psychogenic polydipsia", pointers: ["thirst", "urine_volume_pattern"], discriminators: ["thirst", "urine_volume_pattern", "weight_change", "known_diabetes", "drugs_polyuria"] },
    { id: "uti", name: "Urinary infection (frequency mistaken for polyuria)", pointers: ["infection_focus", "urine_volume_pattern"], discriminators: ["infection_focus", "urine_volume_pattern", "thirst", "genital_itching_thrush"] },
  ],
  output: {
    durationSlot: "duration",
    hpiOrder: ["onset", "duration", "onset_mode", "urine_volume_pattern", "thirst", "known_diabetes", "adherence", "weight_change", "appetite", "vomiting_abdominal_pain", "breathing", "sensorium", "progression", "prior_treatment", "prior_investigations"],
  },
};
