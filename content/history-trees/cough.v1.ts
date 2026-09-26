import type { HistoryTree } from "@/lib/history-check/types";
import { commonHpi, IMMUNOCOMPROMISE, MACLEODS, rce, val, yn } from "@/content/history-trees/_helpers";

/**
 * COUGH / HAEMOPTYSIS — v1.0.0. CLINICAL CONTENT: REVIEWED.
 * Adult medicine ward, north India. Differentials: pulmonary tuberculosis, pneumonia,
 * COPD / asthma, bronchiectasis, lung malignancy, post-nasal drip / reflux / ACE-inhibitor
 * cough, heart failure, interstitial lung disease, pulmonary embolism (haemoptysis).
 */
export const coughV1: HistoryTree = {
  id: "cough",
  version: "1.0.0",
  complaint: "Cough",
  triggers: ["cough", "coughing", "expectoration", "haemoptysis", "hemoptysis", "blood in sputum"],
  setting: "Adult medicine ward, north India",
  reviewStatus: "reviewed",
  reviewedBy: "Dr. Anubhav, General Surgery — 2026-09-26",
  references: [
    { title: "National TB Elimination Programme: presumptive TB definition (cough > 2 weeks, fever, weight loss, night sweats, contact)", source: "NTEP, Government of India", url: "https://journals.lww.com/ascp/fulltext/2022/10020/national_tb_elimination_program__ntep___at_a.1.aspx" },
    rce("Does this patient have community-acquired pneumonia? Diagnosing pneumonia by history and physical examination", 1997),
    rce("Does this patient have pulmonary embolism?", 2003, "14657070"),
    rce("Does this dyspneic patient in the emergency department have congestive heart failure?", 2005, "16234501"),
    { title: "Hemoptysis: evaluation and management", source: "American Family Physician (PubMed)", pmid: "25955625" },
    MACLEODS,
  ],
  slots: [
    ...commonHpi("cough"),
    val("hpi", "dry_or_productive", "Dry or productive", "Is the cough dry or productive?", ["dry", "productive", "with sputum", "with expectoration", "non productive", "wet"]),
    val("hpi", "sputum", "Sputum character", "How much sputum, what colour, any smell, and any change over time?", ["sputum", "expectoration", "phlegm", "mucoid", "purulent", "yellow", "green", "white", "copious", "foul smelling", "cupful", "quantity", "colour", "rusty"]),
    val("hpi", "timing", "Timing / posture", "Is the cough worse at night, in the morning, on lying down, or with posture?", ["night", "morning", "on lying down", "lying down", "posture", "postural", "early morning", "nocturnal", "whole day"]),
    val("hpi", "haemoptysis_amount", "Haemoptysis: amount / character", "If blood, how much — streaks, teaspoons, cupfuls — and is it frothy or mixed with sputum?", ["streaks", "streaky", "teaspoon", "cupful", "cup", "ml", "frothy", "fresh blood", "clots", "mixed with sputum", "amount", "quantity"], { numeric: true }),
    yn("hpi", "haemoptysis", "Haemoptysis", "Any blood in the sputum?", ["haemoptysis", "hemoptysis", "blood in sputum", "coughing blood", "blood in cough", "blood streaked"]),
    yn("associated", "fever", "Fever / evening rise", "Any fever, and is there an evening rise?", ["fever", "febrile", "temperature", "evening rise", "chills", "rigors"]),
    yn("associated", "night_sweats", "Night sweats", "Any night sweats?", ["night sweats", "night sweat", "sweating at night"]),
    yn("associated", "weight_loss", "Weight loss", "Any weight loss?", ["weight loss", "lost weight", "losing weight"]),
    yn("associated", "appetite", "Loss of appetite", "Any loss of appetite?", ["loss of appetite", "appetite", "anorexia", "not eating"]),
    yn("associated", "breathlessness", "Breathlessness", "Any breathlessness, and on how much exertion?", ["breathlessness", "breathless", "shortness of breath", "dyspnoea", "dyspnea", "sob"]),
    yn("associated", "wheeze", "Wheeze", "Any wheeze?", ["wheeze", "wheezing", "whistling"]),
    yn("associated", "chest_pain", "Chest pain", "Any chest pain, especially on breathing?", ["chest pain", "pleuritic", "pain in chest", "chest discomfort"]),
    yn("associated", "nasal_symptoms", "Nasal / throat symptoms", "Any nasal discharge, post-nasal drip, sneezing, or throat clearing?", ["nasal discharge", "runny nose", "post nasal drip", "postnasal", "sneezing", "throat clearing", "sore throat", "sinus", "allergic rhinitis"], { tier: "detailed" }),
    yn("associated", "heartburn", "Heartburn / reflux", "Any heartburn or regurgitation, worse at night?", ["heartburn", "acidity", "reflux", "regurgitation", "gerd"], { tier: "detailed" }),
    yn("associated", "hoarseness", "Hoarseness of voice", "Any change in voice?", ["hoarseness", "hoarse", "voice change", "change in voice"], { tier: "detailed" }),
    yn("associated", "leg_swelling_orthopnoea", "Leg swelling / orthopnoea", "Any leg swelling or breathlessness on lying flat?", ["leg swelling", "pedal oedema", "pedal edema", "orthopnoea", "orthopnea", "pillows", "pnd"]),
    yn("associated", "previous_episodes", "Previous similar episodes", "Any similar episodes before, or a history of childhood chest infections?", ["previous episode", "previous episodes", "similar episodes", "recurrent", "since childhood", "childhood", "measles", "whooping cough", "earlier"], { tier: "detailed" }),
    // Red flags
    yn("red_flag", "massive_haemoptysis", "Large-volume haemoptysis", "Has there been a large volume of blood (cupfuls) or is bleeding continuing?", ["cupful", "cupfuls", "large amount", "massive", "profuse", "continuous bleeding", "more than", "ml"], { teach: "Coughing up more than a cupful of blood, or any amount with breathlessness, can obstruct the airway; the amount matters more than the cause." }),
    yn("red_flag", "cough_over_two_weeks", "Cough more than two weeks", "Has the cough lasted more than two weeks?", ["two weeks", "2 weeks", "more than 2 weeks", "three weeks", "3 weeks", "month", "months", "weeks"], { teach: "In India a cough lasting two weeks or more is a presumptive tuberculosis symptom by national programme definition and needs a sputum test." }),
    yn("red_flag", "rest_dyspnoea", "Breathless at rest", "Is the patient breathless at rest or unable to complete sentences?", ["at rest", "unable to speak", "cannot complete sentences", "gasping", "severe breathlessness"], { teach: "A cough with breathlessness at rest is no longer a cough question but a respiratory failure question." }),
    yn("red_flag", "altered_sensorium", "Drowsiness / confusion", "Any drowsiness or confusion?", ["drowsy", "drowsiness", "confused", "confusion", "altered sensorium", "disoriented"], { teach: "Confusion in a patient with cough is a marker of severe pneumonia, hypoxia or carbon dioxide retention." }),
    yn("red_flag", "tb_contact", "TB contact / past TB / treatment", "Any contact with a TB patient, past TB, or previous anti-tubercular treatment (completed or defaulted)?", ["tb", "tuberculosis", "koch", "att", "akt", "dots", "tb contact", "past tb", "defaulted", "incomplete treatment", "mdr"], { teach: "A household contact or past treatment shifts the probability towards tuberculosis, including drug-resistant disease." }),
    yn("red_flag", "smoking_pack_years", "Smoking history", "How much smoking, for how many years (pack-years or beedis per day)?", ["smoker", "smoking", "beedi", "cigarette", "pack years", "packs", "per day", "hookah", "chillum", "ex smoker"], { teach: "Pack-years quantify the risk of COPD and lung cancer; 'smokes' without the number cannot be acted on." }),
    yn("red_flag", "calf_pain_immobilisation", "Calf pain / immobilisation", "Any calf pain or swelling, recent surgery, or immobilisation (with haemoptysis)?", ["calf pain", "calf swelling", "immobilisation", "immobilization", "bed rest", "recent surgery", "long travel", "dvt"], { tier: "detailed", teach: "A painful calf or recent bed rest with a new cough and breathlessness points to pulmonary embolism, which is often mislabelled as infection." }),
    IMMUNOCOMPROMISE,
    // Exposures
    yn("exposure", "biomass_occupation", "Biomass smoke / occupational dust", "Any cooking with wood or cow-dung fuel, or occupational dust (stone, mining, cotton, construction)?", ["chulha", "wood fire", "biomass", "cow dung", "kitchen smoke", "dust", "stone", "mining", "quarry", "cotton", "silica", "construction", "occupation"]),
    yn("exposure", "ace_inhibitor", "ACE-inhibitor / other drugs", "Is the patient on an ACE inhibitor (enalapril, ramipril) or other drugs known to cause cough?", ["enalapril", "ramipril", "lisinopril", "ace inhibitor", "blood pressure tablet", "on medication", "drug history"], { tier: "detailed" }),
    yn("exposure", "bird_animal", "Birds / animals / pets", "Any exposure to birds, pigeons, or animals?", ["birds", "pigeons", "poultry", "animals", "pets", "dog", "cattle"], { tier: "detailed" }),
    yn("exposure", "hiv_risk", "HIV risk", "Any known HIV or risk exposure?", ["hiv", "retroviral", "art", "sexual exposure", "unprotected"], { tier: "detailed" }),
  ],
  differentials: [
    { id: "tb", name: "Pulmonary tuberculosis", pointers: ["cough_over_two_weeks", "fever", "night_sweats", "weight_loss", "tb_contact", "haemoptysis"], discriminators: ["cough_over_two_weeks", "fever", "night_sweats", "weight_loss", "appetite", "tb_contact", "haemoptysis", "immunocompromise"] },
    { id: "pneumonia", name: "Pneumonia", pointers: ["fever", "sputum", "chest_pain", "breathlessness"], discriminators: ["fever", "sputum", "chest_pain", "breathlessness", "onset_mode", "altered_sensorium"] },
    { id: "copd_asthma", name: "COPD / asthma", pointers: ["wheeze", "smoking_pack_years", "biomass_occupation", "timing"], discriminators: ["wheeze", "smoking_pack_years", "biomass_occupation", "timing", "breathlessness", "previous_episodes"] },
    { id: "bronchiectasis", name: "Bronchiectasis", pointers: ["sputum", "previous_episodes", "haemoptysis"], discriminators: ["sputum", "previous_episodes", "haemoptysis", "timing", "tb_contact"] },
    { id: "malignancy", name: "Lung malignancy", pointers: ["smoking_pack_years", "weight_loss", "haemoptysis", "hoarseness"], discriminators: ["smoking_pack_years", "weight_loss", "haemoptysis", "hoarseness", "chest_pain", "progression"] },
    { id: "upper_airway_reflux", name: "Post-nasal drip / reflux / drug cough", pointers: ["nasal_symptoms", "heartburn", "ace_inhibitor"], discriminators: ["nasal_symptoms", "heartburn", "ace_inhibitor", "timing", "dry_or_productive"] },
    { id: "heart_failure", name: "Heart failure", pointers: ["leg_swelling_orthopnoea", "breathlessness"], discriminators: ["leg_swelling_orthopnoea", "breathlessness", "sputum", "timing"] },
    { id: "ild", name: "Interstitial lung disease", pointers: ["biomass_occupation", "bird_animal", "dry_or_productive"], discriminators: ["biomass_occupation", "bird_animal", "dry_or_productive", "breathlessness", "progression"] },
    { id: "pe", name: "Pulmonary embolism", pointers: ["haemoptysis", "calf_pain_immobilisation", "chest_pain"], discriminators: ["haemoptysis", "calf_pain_immobilisation", "chest_pain", "breathlessness", "onset_mode"] },
  ],
  output: {
    durationSlot: "duration",
    hpiOrder: ["onset", "duration", "onset_mode", "dry_or_productive", "sputum", "timing", "haemoptysis", "haemoptysis_amount", "progression", "prior_treatment", "prior_investigations"],
  },
};
