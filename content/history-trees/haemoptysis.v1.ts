import type { HistoryTree } from "@/lib/history-check/types";
import { commonHpi, IMMUNOCOMPROMISE, MACLEODS, PREGNANCY, val, yn } from "@/content/history-trees/_helpers";

/**
 * HAEMOPTYSIS — v1.0.0. CLINICAL CONTENT: PENDING CLINICIAN REVIEW.
 * Differentials: pulmonary tuberculosis (active or old cavity / aspergilloma),
 * bronchiectasis, lung cancer, pneumonia / lung abscess, pulmonary embolism, mitral
 * stenosis / pulmonary oedema, coagulopathy, vasculitis, pseudo-haemoptysis (nose, gums,
 * upper GI).
 */
export const haemoptysisV1: HistoryTree = {
  id: "haemoptysis",
  version: "1.0.0",
  complaint: "Coughing up blood",
  triggers: ["haemoptysis", "hemoptysis", "blood in sputum", "coughing blood", "coughing up blood", "coughed blood", "blood stained sputum", "blood tinged sputum", "blood with cough"],
  setting: "Adult medicine ward, north India",
  reviewStatus: "pending_clinician_review",
  reviewedBy: null,
  references: [
    { title: "Hemoptysis: evaluation and management", source: "Am Fam Physician", year: 2015, pmid: "26371732" },
    { title: "Technical and operational guidelines for TB control in India (NTEP)", source: "Central TB Division, Ministry of Health and Family Welfare", year: 2016 },
    { title: "British Thoracic Society guideline for bronchiectasis in adults", source: "Thorax", year: 2019, pmid: "30545985" },
    MACLEODS,
  ],
  slots: [
    ...commonHpi("blood in the sputum"),
    val("hpi", "amount", "Amount", "How much blood — streaks in sputum, a teaspoon, a cupful, or more, and how many times?", ["streak", "streaks", "teaspoon", "spoon", "cupful", "cup", "glass", "small", "large", "massive", "times", "episodes", "amount", "quantity"], { numeric: true }),
    val("hpi", "character", "Character", "Is it frothy and pink, bright red, dark with clots, or rusty sputum?", ["frothy", "pink", "bright red", "fresh", "dark", "clots", "rusty", "mixed with sputum", "pure blood", "character"]),
    val("hpi", "source_certainty", "Cough or vomit or nose", "Did the blood come with coughing, with vomiting, or from the nose or gums?", ["coughing", "coughed", "with cough", "vomiting", "vomited", "nose", "nasal", "gums", "spitting", "throat", "hawking"]),
    val("hpi", "pattern", "Pattern", "Is it a single episode, daily, or recurrent over months?", ["single", "once", "daily", "recurrent", "on and off", "months", "weeks", "pattern", "every"]),
    yn("hpi", "cough_sputum", "Cough and sputum", "Is there a chronic cough, and how much sputum is produced daily and of what colour?", ["cough", "sputum", "phlegm", "purulent", "yellow", "green", "foul", "copious", "cupful", "productive"]),
    yn("hpi", "chest_pain", "Chest pain", "Any chest pain, and is it pleuritic?", ["chest pain", "pleuritic", "pain on breathing", "pain on coughing", "chest discomfort"]),
    yn("hpi", "breathlessness", "Breathlessness", "Any breathlessness, and is it worse lying flat?", ["breathlessness", "breathless", "dyspnoea", "dyspnea", "orthopnoea", "lying flat", "shortness of breath"]),
    yn("associated", "fever_night_sweats", "Fever / evening rise / night sweats", "Any fever, evening rise of temperature, or night sweats?", ["fever", "evening rise", "night sweats", "sweating at night", "low grade fever", "chills"]),
    yn("associated", "weight_loss_appetite", "Weight loss / loss of appetite", "Any weight loss or loss of appetite over the past weeks?", ["weight loss", "lost weight", "losing weight", "anorexia", "loss of appetite", "not eating", "wasting"]),
    yn("associated", "hoarseness", "Hoarseness / voice change", "Any change in the voice?", ["hoarseness", "hoarse", "voice change", "voice"], { tier: "detailed" }),
    yn("associated", "calf_swelling", "Calf pain / swelling / immobilisation", "Any calf pain or swelling, recent surgery, bed rest, or a long journey?", ["calf", "leg swelling", "leg pain", "dvt", "bed rest", "immobil", "surgery", "long journey", "travel", "plaster"]),
    yn("associated", "palpitations_orthopnoea", "Palpitations / lying-flat breathlessness", "Any palpitations, breathlessness on lying flat, or waking at night breathless (mitral stenosis, pulmonary oedema)?", ["palpitations", "orthopnoea", "orthopnea", "pnd", "waking breathless", "rheumatic", "mitral", "valve"], { tier: "detailed" }),
    yn("associated", "bleeding_elsewhere", "Bleeding elsewhere", "Any bleeding from gums, nose, skin, or in urine?", ["gums", "gum bleeding", "nosebleed", "epistaxis", "bruising", "petechiae", "blood in urine", "haematuria"], { tier: "detailed" }),
    yn("associated", "joint_rash_sinus_kidney", "Joint pain / rash / sinusitis / blood in urine", "Any joint pains, rash, chronic sinus symptoms, or red urine (vasculitis)?", ["joint pain", "arthritis", "rash", "sinusitis", "nasal crusting", "red urine", "haematuria", "vasculitis"], { tier: "detailed" }),
    yn("associated", "previous_tb", "Past tuberculosis / treatment", "Any past tuberculosis, and was treatment completed?", ["tb", "tuberculosis", "koch", "att", "akt", "dots", "treatment completed", "incomplete", "defaulted", "old tb", "past tb"]),
    // Red flags
    yn("red_flag", "massive", "Massive haemoptysis", "Was the amount more than a cupful in a day, or any amount with breathlessness or giddiness?", ["cupful", "cup", "glass", "large", "massive", "profuse", "more than", "with breathlessness", "giddy", "faint"], { teach: "Death from haemoptysis is by asphyxiation, not blood loss; the amount and the breathlessness matter more than the cause." }),
    yn("red_flag", "breathless_hypoxic", "Breathlessness or blue lips", "Is the patient breathless at rest or noted to have blue lips?", ["breathless at rest", "breathlessness", "gasping", "blue lips", "cyanosis", "cannot speak"], { teach: "Breathlessness with haemoptysis means blood in the airways or a large embolism, and marks the patient who needs oxygen and monitoring now." }),
    yn("red_flag", "anticoagulants", "Blood thinners", "Is the patient on warfarin, newer anticoagulants, aspirin, clopidogrel or heparin?", ["warfarin", "acitrom", "anticoagulant", "blood thinner", "aspirin", "clopidogrel", "heparin", "rivaroxaban", "apixaban", "dabigatran"], { teach: "Anticoagulation turns a minor bleed into a major one and is the first thing to reverse or hold." }),
    yn("red_flag", "smoking_age", "Smoker over 40", "Is the patient a smoker over 40 with new or recurrent haemoptysis?", ["smoker", "smoking", "beedi", "cigarette", "pack years", "over 40", "years old", "hookah"], { teach: "A smoker over forty with haemoptysis needs the lung cancer question asked and answered, even when the chest film looks clear." }),
    yn("red_flag", "tb_symptoms", "Tuberculosis symptoms", "Any cough over two weeks, evening fever, night sweats, or weight loss?", ["two weeks", "2 weeks", "evening fever", "night sweats", "weight loss", "chronic cough", "tb symptoms"], { teach: "In India haemoptysis with any constitutional symptom is presumptive tuberculosis until the sputum says otherwise; the ward needs isolation from the first hour." }),
    yn("red_flag", "sudden_pleuritic_calf", "Sudden onset with pleuritic pain or calf symptoms", "Did it start suddenly with pleuritic chest pain, breathlessness, or a painful calf?", ["sudden", "suddenly", "pleuritic", "calf pain", "calf swelling", "leg swelling"], { teach: "Pulmonary embolism presents as haemoptysis in a minority and is missed when the story is read as infection." }),
    yn("red_flag", "known_lung_heart_disease", "Known lung or heart disease", "Any known bronchiectasis, old TB cavity, lung cancer, or rheumatic heart disease?", ["bronchiectasis", "cavity", "aspergilloma", "lung cancer", "rheumatic", "mitral stenosis", "copd", "known lung disease", "heart disease"], { teach: "An old cavity or bronchiectatic lung bleeds from hypertrophied bronchial arteries and can bleed massively without warning." }),
    IMMUNOCOMPROMISE,
    PREGNANCY,
    // Exposures
    yn("exposure", "tb_contact", "TB contact", "Any household contact with tuberculosis?", ["tb contact", "contact", "family member", "tuberculosis at home", "koch"]),
    yn("exposure", "occupation_dust", "Occupation / dust / biomass", "Any exposure to silica, stone cutting, mining, or biomass smoke?", ["silica", "stone", "mining", "quarry", "dust", "biomass", "chulha", "occupation"], { tier: "detailed" }),
  ],
  differentials: [
    { id: "tuberculosis", name: "Pulmonary tuberculosis (active or old cavity)", pointers: ["tb_symptoms", "fever_night_sweats", "weight_loss_appetite", "previous_tb", "tb_contact"], discriminators: ["tb_symptoms", "fever_night_sweats", "weight_loss_appetite", "previous_tb", "tb_contact", "immunocompromise", "pattern", "cough_sputum"] },
    { id: "bronchiectasis", name: "Bronchiectasis", pointers: ["cough_sputum", "pattern", "previous_tb", "known_lung_heart_disease"], discriminators: ["cough_sputum", "pattern", "previous_tb", "known_lung_heart_disease", "fever_night_sweats", "weight_loss_appetite"] },
    { id: "lung_cancer", name: "Lung cancer", pointers: ["smoking_age", "weight_loss_appetite", "hoarseness"], discriminators: ["smoking_age", "weight_loss_appetite", "hoarseness", "pattern", "chest_pain", "occupation_dust"] },
    { id: "pneumonia_abscess", name: "Pneumonia / lung abscess", pointers: ["fever_night_sweats", "cough_sputum", "chest_pain", "character"], discriminators: ["fever_night_sweats", "cough_sputum", "chest_pain", "character", "duration", "onset_mode"] },
    { id: "pulmonary_embolism", name: "Pulmonary embolism", pointers: ["sudden_pleuritic_calf", "calf_swelling", "breathlessness"], discriminators: ["sudden_pleuritic_calf", "calf_swelling", "breathlessness", "chest_pain", "fever_night_sweats", "cough_sputum", "pregnancy"] },
    { id: "cardiac", name: "Mitral stenosis / pulmonary oedema", pointers: ["palpitations_orthopnoea", "character", "known_lung_heart_disease"], discriminators: ["palpitations_orthopnoea", "character", "known_lung_heart_disease", "breathlessness", "fever_night_sweats"] },
    { id: "coagulopathy", name: "Coagulopathy / anticoagulant bleeding", pointers: ["anticoagulants", "bleeding_elsewhere"], discriminators: ["anticoagulants", "bleeding_elsewhere", "cough_sputum", "fever_night_sweats"] },
    { id: "vasculitis", name: "Pulmonary vasculitis / pulmonary-renal syndrome", pointers: ["joint_rash_sinus_kidney"], discriminators: ["joint_rash_sinus_kidney", "fever_night_sweats", "breathlessness", "bleeding_elsewhere"] },
    { id: "pseudo", name: "Pseudo-haemoptysis (nose, gums, upper GI)", pointers: ["source_certainty"], discriminators: ["source_certainty", "character", "cough_sputum", "bleeding_elsewhere"] },
  ],
  output: {
    durationSlot: "duration",
    hpiOrder: ["onset", "duration", "onset_mode", "amount", "character", "source_certainty", "pattern", "cough_sputum", "chest_pain", "breathlessness", "progression", "prior_treatment", "prior_investigations"],
  },
};
