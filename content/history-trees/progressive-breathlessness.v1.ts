import type { HistoryTree } from "@/lib/history-check/types";
import { commonHpi, FISHMAN, HUTCHISONS, IMMUNOCOMPROMISE, MACLEODS, val, yn } from "@/content/history-trees/_helpers";

/**
 * BREATHLESSNESS AND DRY COUGH GETTING WORSE OVER MONTHS — v1.0.0. CLINICAL CONTENT: PENDING CLINICIAN REVIEW.
 * Pulmonary medicine ward, north India, where scarring of the lung is often traced to a job —
 * stone quarrying, sandblasting, slate-pencil work, construction — to pigeons on the roof or a
 * desert cooler at home, or to tuberculosis treated years ago. The occupational history is the
 * spine of this tree: every job, for how long, and how dusty.
 * Differentials: idiopathic pulmonary fibrosis, connective-tissue-disease ILD, hypersensitivity
 * pneumonitis, silicosis, other pneumoconiosis, drug-induced ILD, post-tubercular fibrosis,
 * sarcoidosis, lymphangitic carcinomatosis, pulmonary hypertension, heart failure.
 */
export const progressiveBreathlessnessV1: HistoryTree = {
  id: "progressive_breathlessness",
  version: "1.0.0",
  complaint: "Breathlessness and dry cough getting worse over months",
  triggers: ["progressive breathlessness", "gradually increasing breathlessness", "breathlessness for months", "dry cough for months", "ild", "interstitial lung disease", "pulmonary fibrosis", "lung fibrosis", "ipf", "silicosis", "pneumoconiosis", "hypersensitivity pneumonitis", "sarcoidosis", "fibrosis of lungs"],
  setting: "Pulmonary medicine ward, north India",
  reviewStatus: "pending_clinician_review",
  reviewedBy: null,
  references: [FISHMAN, MACLEODS, HUTCHISONS],
  slots: [
    ...commonHpi("breathlessness"),
    val("hpi", "exertion_then_now", "Exertion now and before", "How far can the patient walk or how many stairs climb now, and how much could he or she do six months and a year ago?", ["walk", "stairs", "flight", "steps", "metres", "at rest", "on exertion", "six months ago", "a year ago", "earlier could", "now cannot", "housework"], { numeric: true, teach: "Comparing what the patient can do now with a year ago gives the pace of the disease, which a single grade cannot." }),
    val("hpi", "cough_character", "Cough", "Is the cough dry or productive, how long has it been there, and is it troublesome at night?", ["dry cough", "cough", "productive", "sputum", "phlegm", "at night", "months", "irritating", "tickly"]),
    val("hpi", "pace_change", "Pace of worsening", "Has it worsened steadily, in steps, or much faster over the last few weeks?", ["steadily", "slowly", "in steps", "suddenly worse", "faster", "last few weeks", "recently worse", "rapidly"], { teach: "A steady decline over months and a sudden lurch in recent weeks are different stories, and the second has its own causes." }),
    // Associated
    yn("associated", "ctd_features", "Joint, skin, finger or muscle symptoms", "Any joint pain or swelling with morning stiffness, fingers turning white or blue in the cold, tightening of the skin, dry eyes or mouth, rash, cracked fingertips, or muscle weakness?", ["joint pain", "joint swelling", "morning stiffness", "fingers turn white", "fingers turn blue", "raynaud", "skin tightening", "tight skin", "dry eyes", "dry mouth", "rash", "cracked fingers", "muscle weakness", "difficulty getting up", "difficulty swallowing"], { teach: "Joint, skin, finger and muscle symptoms point to a connective tissue disease, which can scar the lung before or after the rest shows." }),
    yn("associated", "clubbing_noticed", "Change in finger ends", "Has anyone noticed the finger ends becoming broad or the nails curving?", ["clubbing", "broad fingertips", "curved nails", "drumstick", "finger ends"], { tier: "detailed" }),
    yn("associated", "constitutional", "Fever, night sweats, weight loss", "Any fever, night sweats, loss of appetite, or weight loss, and how much weight?", ["fever", "evening fever", "night sweats", "loss of appetite", "weight loss", "kg", "low grade", "no fever"]),
    yn("associated", "cardiac_symptoms", "Lying flat, night gasping, swollen feet", "Any breathlessness on lying flat, waking gasping at night, swelling of the feet, palpitations, or known heart disease?", ["lying flat", "pillows", "orthopnoea", "waking gasping", "swelling of feet", "palpitations", "heart disease", "valve", "heart attack"], { teach: "Breathlessness on lying flat and swollen feet raise the heart as the cause of a slow decline that looks like lung disease." }),
    yn("associated", "eye_skin_nodes", "Red eyes, shin lumps, neck lumps", "Any red or painful eyes, tender red lumps on the shins, skin patches, or lumps in the neck?", ["red eyes", "painful eyes", "uveitis", "shin lumps", "tender lumps", "erythema nodosum", "skin patches", "neck lumps", "lymph nodes", "glands"], { tier: "detailed", teach: "Eye, shin and gland involvement alongside the lung raises a granulomatous disease affecting several organs." }),
    yn("associated", "known_cancer", "Past or present cancer", "Any past or present cancer, or a lump in the breast, a stomach complaint, or weight loss that has not been explained?", ["cancer", "malignancy", "carcinoma", "breast lump", "stomach", "chemotherapy", "radiotherapy", "operated for cancer", "unexplained weight loss"], { teach: "Rapidly increasing breathlessness in someone with a known cancer raises spread of the cancer along the lung's lymph channels." }),
    yn("associated", "past_tb", "Past tuberculosis", "Any past tuberculosis, was the full course completed and when, and did the breathlessness begin after it?", ["past tb", "tuberculosis", "att", "completed", "left in between", "years ago", "repeated", "after tb"], { teach: "Breathlessness that began after treated tuberculosis raises scarring left behind, though active disease still has to be asked about." }),
    // Exposure
    val("exposure", "occupation_history", "Every job held", "What jobs has the patient done since youth, for how many years each — stone quarrying or crushing, sandblasting, slate-pencil work, construction, tunnelling, mining, glass, ceramics, foundry, cotton or textile mill?", ["job", "work", "occupation", "stone quarry", "stone crushing", "stone cutting", "sandblasting", "slate pencil", "construction", "tunnel", "mining", "mine", "glass", "ceramics", "pottery", "foundry", "cotton mill", "textile", "years", "farmer", "labourer"], { teach: "Scarring from dust may start years after the job ended, so every job since youth is asked, not only the present one." }),
    val("exposure", "dust_detail", "How dusty, and was a mask worn", "How dusty was the work, how many hours a day, was a mask worn, and have co-workers fallen ill or died of breathlessness?", ["dusty", "hours", "mask", "no mask", "wet drilling", "dry drilling", "co-workers", "coworkers", "fellow workers", "died", "same illness"], { tier: "detailed", teach: "Co-workers with the same illness are among the strongest clues that the job, not chance, is behind the scarring." }),
    yn("exposure", "birds_mould", "Pigeons, birds, feathers, cooler, damp", "Are there pigeons on the roof or window, birds kept at home, feather pillows or quilts, a desert cooler, or damp and mouldy walls, and is the patient better when away from home?", ["pigeon", "pigeons", "kabootar", "birds", "parrot", "poultry", "feathers", "feather pillow", "quilt", "cooler", "desert cooler", "damp", "mould", "mold", "better away from home"], { teach: "Symptoms that ease away from home and return on coming back raise an inhaled trigger there, most often birds or mould." }),
    yn("exposure", "drug_exposure", "Medicines or radiation that affect the lung", "Has the patient taken methotrexate, amiodarone, nitrofurantoin, cancer chemotherapy, or had radiation to the chest?", ["methotrexate", "amiodarone", "nitrofurantoin", "chemotherapy", "bleomycin", "radiation", "radiotherapy", "arthritis medicine", "heart rhythm medicine", "urine infection medicine"], { teach: "Several common medicines scar the lung, and the link is only made if the drug list is asked for by name." }),
    yn("exposure", "tobacco_biomass", "Smoking and cooking smoke", "Does the patient smoke bidi, cigarettes or hookah, and for how many years, and has he or she cooked over a chulha?", ["smoking", "bidi", "cigarette", "hookah", "years", "quit", "never smoked", "chulha", "wood", "dung cakes", "cooking smoke"]),
    yn("exposure", "family_lung_fibrosis", "Family history of lung scarring", "Has anyone in the family had lung scarring or breathlessness of the same kind?", ["family", "father", "mother", "brother", "sister", "same illness", "fibrosis in family"], { tier: "detailed" }),
    // Red flags
    yn("red_flag", "rest_hypoxia", "Breathless at rest, blue lips, oxygen at home", "Is the patient breathless at rest or while talking, blue at the lips, or already using oxygen at home?", ["at rest", "while talking", "blue lips", "cyanosis", "oxygen at home", "concentrator", "cylinder", "cannot lie", "gasping"], { teach: "Breathlessness at rest or blueness marks lungs that no longer carry enough oxygen, whatever the cause turns out to be." }),
    yn("red_flag", "rapid_worsening", "Sharply worse over days", "Has the breathlessness become sharply worse over the last days or few weeks, with or without fever?", ["sharply worse", "much worse", "last few days", "few weeks", "suddenly worse", "fever", "new cough"], { teach: "A sudden worsening on top of slow scarring raises infection, a clot or a flare of the scarring itself, and each moves fast." }),
    yn("red_flag", "exertional_syncope", "Fainting or chest pain on exertion", "Has the patient fainted, nearly fainted, or had chest pain while walking or climbing?", ["fainted", "blackout", "nearly fainted", "giddy on walking", "chest pain on exertion", "chest pain on walking", "collapse"], { teach: "Fainting or chest pain on exertion raises high pressure in the lung circulation, which the heart may not be able to keep up with." }),
    IMMUNOCOMPROMISE,
  ],
  differentials: [
    { id: "ipf", name: "Idiopathic pulmonary fibrosis", pointers: ["clubbing_noticed", "cough_character", "family_lung_fibrosis"], discriminators: ["clubbing_noticed", "ctd_features", "occupation_history", "birds_mould", "drug_exposure", "tobacco_biomass"] },
    { id: "ctd_ild", name: "Connective-tissue-disease ILD", pointers: ["ctd_features"], discriminators: ["ctd_features", "drug_exposure", "clubbing_noticed", "constitutional", "exertional_syncope"] },
    { id: "hypersensitivity_pneumonitis", name: "Hypersensitivity pneumonitis", pointers: ["birds_mould"], discriminators: ["birds_mould", "pace_change", "constitutional", "occupation_history", "tobacco_biomass"] },
    { id: "silicosis", name: "Silicosis", pointers: ["occupation_history", "dust_detail"], discriminators: ["occupation_history", "dust_detail", "past_tb", "constitutional", "duration"] },
    { id: "pneumoconiosis", name: "Other pneumoconiosis (coal, asbestos and other dusts)", pointers: ["occupation_history", "dust_detail"], discriminators: ["occupation_history", "dust_detail", "tobacco_biomass", "known_cancer", "duration"] },
    { id: "drug_ild", name: "Drug-induced ILD", pointers: ["drug_exposure"], discriminators: ["drug_exposure", "known_cancer", "ctd_features", "pace_change", "onset"] },
    { id: "post_tb_fibrosis", name: "Post-tubercular fibrosis", pointers: ["past_tb"], discriminators: ["past_tb", "constitutional", "cough_character", "occupation_history", "duration"] },
    { id: "sarcoidosis", name: "Sarcoidosis", pointers: ["eye_skin_nodes"], discriminators: ["eye_skin_nodes", "constitutional", "past_tb", "occupation_history", "birds_mould"] },
    { id: "lymphangitic_carcinomatosis", name: "Lymphangitic carcinomatosis", pointers: ["known_cancer", "rapid_worsening"], discriminators: ["known_cancer", "constitutional", "pace_change", "tobacco_biomass", "drug_exposure"] },
    { id: "pulmonary_hypertension", name: "Pulmonary hypertension", pointers: ["exertional_syncope"], discriminators: ["exertional_syncope", "cardiac_symptoms", "ctd_features", "rest_hypoxia", "exertion_then_now"] },
    { id: "heart_failure", name: "Heart failure mimicking lung disease", pointers: ["cardiac_symptoms"], discriminators: ["cardiac_symptoms", "cough_character", "exertional_syncope", "tobacco_biomass", "pace_change"] },
  ],
  output: {
    durationSlot: "duration",
    hpiOrder: ["onset", "duration", "onset_mode", "progression", "exertion_then_now", "pace_change", "cough_character", "prior_treatment", "prior_investigations"],
  },
};
