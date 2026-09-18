import type { HistoryTree } from "@/lib/history-check/types";
import { commonHpi, IMMUNOCOMPROMISE, MACLEODS, PREGNANCY, rce, val, yn } from "@/content/history-trees/_helpers";

/**
 * NECK SWELLING / LYMPHADENOPATHY — v1.0.0. CLINICAL CONTENT: PENDING CLINICIAN REVIEW.
 * Differentials: tuberculous lymphadenitis, reactive / infective lymphadenitis, lymphoma,
 * metastatic node, goitre (diffuse, nodular, thyroiditis, thyroid cancer), salivary gland
 * swelling, HIV-related lymphadenopathy, other causes (cysts, abscess).
 */
export const neckSwellingV1: HistoryTree = {
  id: "neck_swelling",
  version: "1.0.0",
  complaint: "Neck swelling / lymph node enlargement",
  triggers: ["neck swelling", "swelling in neck", "swelling in the neck", "lump in neck", "neck lump", "lymph node", "lymph nodes", "lymphadenopathy", "glands in neck", "goitre", "goiter", "thyroid swelling", "swelling of thyroid", "enlarged nodes", "cervical lymphadenopathy"],
  setting: "Adult medicine ward, north India",
  reviewStatus: "pending_clinician_review",
  reviewedBy: null,
  references: [
    rce("Does this patient have a goiter?", 1995, "7739082"),
    { title: "Index-TB guidelines: extrapulmonary tuberculosis (lymph node TB)", source: "Ministry of Health and Family Welfare, India", year: 2016 },
    { title: "Lymphadenopathy: differential diagnosis and evaluation", source: "Am Fam Physician", year: 1998, pmid: "9803196" },
    { title: "ATA management guidelines for adult patients with thyroid nodules and differentiated thyroid cancer", source: "Thyroid", year: 2016, pmid: "26462967" },
    MACLEODS,
  ],
  slots: [
    ...commonHpi("swelling"),
    val("hpi", "site", "Site", "Where exactly is the swelling — front of the neck, side, under the jaw, behind the ear, above the collarbone — and one side or both?", ["front", "midline", "side", "sides", "under the jaw", "submandibular", "behind the ear", "angle of jaw", "above the collarbone", "supraclavicular", "both sides", "one side", "site", "back of neck"]),
    val("hpi", "size_growth", "Size and rate of growth", "How big is it, and is it growing — over days, weeks, or months — or staying the same, or fluctuating?", ["size", "pea", "lemon", "marble", "egg", "cm", "growing", "increasing", "same size", "fluctuating", "days", "weeks", "months", "years", "rapidly", "slowly"], { numeric: true }),
    yn("hpi", "pain_tenderness", "Pain / tenderness", "Is the swelling painful or tender, and was it painful when it appeared?", ["painful", "pain", "tender", "tenderness", "painless", "no pain"]),
    yn("hpi", "moves_with_swallowing", "Moves with swallowing", "Does the swelling move up when the patient swallows, or on protruding the tongue?", ["moves with swallowing", "moves on swallowing", "swallowing", "protruding tongue", "moves up", "does not move"]),
    yn("hpi", "discharge_sinus", "Discharge / sinus / skin change", "Has it discharged, formed a sinus, or has the skin over it changed colour?", ["discharge", "discharging", "sinus", "pus", "burst", "skin over", "red", "purple", "scar"]),
    yn("hpi", "other_sites", "Swellings elsewhere", "Any swellings in the armpits, groin, or abdomen?", ["armpit", "axilla", "groin", "inguinal", "abdomen", "elsewhere", "other swellings", "generalised"]),
    yn("hpi", "pressure_symptoms", "Pressure symptoms", "Any difficulty swallowing or breathing, change in voice, or noisy breathing when lying flat?", ["difficulty swallowing", "dysphagia", "difficulty breathing", "stridor", "noisy breathing", "voice change", "hoarseness", "hoarse", "lying flat", "choking"]),
    // Associated
    yn("associated", "fever_night_sweats", "Fever / evening rise / night sweats", "Any fever, evening rise of temperature, or drenching night sweats?", ["fever", "evening rise", "night sweats", "sweating at night", "low grade", "chills"]),
    yn("associated", "weight_loss", "Weight loss / loss of appetite", "Any weight loss or loss of appetite?", ["weight loss", "lost weight", "loss of appetite", "anorexia", "wasting"]),
    yn("associated", "cough_chest", "Cough / chest symptoms", "Any cough, blood in sputum, or chest pain?", ["cough", "sputum", "haemoptysis", "blood in sputum", "chest pain"]),
    yn("associated", "sore_throat_ear_dental", "Sore throat / ear / dental / scalp infection", "Any recent sore throat, ear infection, tooth infection, or scalp sores?", ["sore throat", "throat infection", "tonsillitis", "ear infection", "ear discharge", "tooth", "dental", "scalp", "lice", "boils on scalp"]),
    yn("associated", "itching_alcohol_pain", "Itching / pain after alcohol", "Any generalised itching, or pain in the swelling after drinking alcohol?", ["itching", "pruritus", "pain after alcohol", "alcohol"], { tier: "detailed" }),
    yn("associated", "thyroid_excess", "Heat intolerance / palpitations / tremor / weight loss / prominent eyes", "Any heat intolerance, palpitations, tremor, sweating, loose motions, or prominent eyes?", ["heat intolerance", "palpitations", "tremor", "sweating", "loose motions", "diarrhoea", "prominent eyes", "staring", "irritability", "weight loss despite"], { tier: "detailed" }),
    yn("associated", "thyroid_deficiency", "Cold intolerance / weight gain / constipation / hoarse voice", "Any cold intolerance, weight gain, constipation, lethargy, dry skin, or hoarse voice?", ["cold intolerance", "weight gain", "constipation", "lethargy", "dry skin", "hoarse", "menstrual", "puffiness"], { tier: "detailed" }),
    yn("associated", "rash_joint", "Rash / joint pain", "Any rash, joint pains, or mouth ulcers?", ["rash", "joint pain", "mouth ulcers", "arthritis"], { tier: "detailed" }),
    yn("associated", "recurrent_infections_thrush", "Recurrent infections / oral thrush / chronic diarrhoea", "Any recurrent infections, white patches in the mouth, shingles, or diarrhoea for weeks?", ["recurrent infections", "thrush", "white patches", "shingles", "herpes zoster", "chronic diarrhoea", "weeks of diarrhoea"], { tier: "detailed" }),
    yn("associated", "animal_contact_scratch", "Cat scratch / animal contact / insect bite", "Any cat scratch, animal contact, or insect bite near the swelling?", ["cat", "scratch", "animal", "dog", "insect bite", "tick", "bite"], { tier: "detailed" }),
    // Red flags
    yn("red_flag", "supraclavicular_hard_fixed", "Above the collarbone, hard, or fixed", "Is the swelling above the collarbone, stony hard, or fixed to the skin or deeper structures?", ["supraclavicular", "above the collarbone", "hard", "stony", "fixed", "not moving", "attached", "immobile"], { teach: "A supraclavicular or hard fixed node is metastatic carcinoma until a needle says otherwise; the lung, stomach, breast and head-and-neck are the places to look." }),
    yn("red_flag", "rapid_growth", "Rapid growth", "Has the swelling grown quickly over days to a few weeks?", ["rapidly", "quickly", "grown fast", "days", "doubling", "increasing fast", "sudden increase"], { teach: "Rapid growth points to high-grade lymphoma, an abscess, or bleeding into a thyroid nodule, each needing a different next step within days." }),
    yn("red_flag", "b_symptoms", "Fever, night sweats and weight loss together", "Are fever, drenching night sweats and weight loss present together?", ["fever", "night sweats", "weight loss", "drenching", "b symptoms"], { teach: "The three together are the B symptoms of lymphoma and also the picture of disseminated tuberculosis; a node biopsy, not a needle, separates them." }),
    yn("red_flag", "airway_symptoms", "Difficulty breathing / stridor / cannot lie flat", "Is there difficulty breathing, noisy breathing, or inability to lie flat?", ["difficulty breathing", "stridor", "noisy breathing", "cannot lie flat", "choking", "breathless"], { teach: "A neck mass compressing the trachea is an airway emergency; the history of positional breathlessness comes before any imaging." }),
    yn("red_flag", "voice_change_dysphagia", "Voice change / progressive dysphagia", "Is there a persistent change in voice or progressive difficulty swallowing?", ["hoarseness", "hoarse", "voice change", "dysphagia", "difficulty swallowing", "progressive"], { teach: "Hoarseness with a thyroid or neck swelling means the recurrent laryngeal nerve is involved, which points to malignancy rather than a benign goitre." }),
    yn("red_flag", "tb_features", "Tuberculosis features", "Any cough over two weeks, evening fever, weight loss, or contact with tuberculosis?", ["two weeks", "2 weeks", "evening fever", "weight loss", "tb contact", "contact", "chronic cough", "koch"], { teach: "Tuberculous lymphadenitis is the commonest cause of a neck node on Indian wards; matting and a cold abscess are its signature, and the diagnosis needs tissue, not a trial of antibiotics." }),
    yn("red_flag", "hiv_risk", "HIV risk", "Any unprotected sex, multiple partners, injecting drug use, or a partner with HIV?", ["unprotected", "multiple partners", "injecting", "iv drug", "hiv", "partner", "transfusion"], { teach: "Generalised lymphadenopathy is often the first sign of HIV, and HIV changes the differential for every node found." }),
    IMMUNOCOMPROMISE,
    PREGNANCY,
    // Exposures
    yn("exposure", "tb_contact", "TB contact / past TB", "Any contact with tuberculosis or past treatment?", ["tb", "tuberculosis", "koch", "att", "tb contact", "past tb", "dots"]),
    yn("exposure", "tobacco_alcohol", "Tobacco / alcohol", "Any smoking, chewing tobacco, pan, gutkha, or alcohol?", ["smoking", "tobacco", "chewing", "pan", "gutkha", "khaini", "beedi", "alcohol"]),
    yn("exposure", "iodine_diet_area", "Iodine / diet / hilly area", "Does the family use iodised salt, is the patient from a hilly or goitre-endemic area, and are there others with goitre in the family?", ["iodised salt", "iodine", "hilly", "hills", "endemic", "family", "goitre in family", "cabbage", "cassava"], { tier: "detailed" }),
    yn("exposure", "radiation_family_thyroid", "Neck irradiation / family thyroid cancer", "Any radiation to the neck in childhood, or family history of thyroid cancer?", ["radiation", "irradiation", "radiotherapy", "family history", "thyroid cancer", "medullary"], { tier: "detailed" }),
    yn("exposure", "occupation", "Occupation", "What is the patient's occupation (dust, chemicals, animal handling)?", ["occupation", "work", "farmer", "animal", "butcher", "dust", "chemical", "factory"], { tier: "detailed" }),
  ],
  differentials: [
    { id: "tb_lymphadenitis", name: "Tuberculous lymphadenitis", pointers: ["tb_features", "fever_night_sweats", "discharge_sinus", "tb_contact", "size_growth"], discriminators: ["tb_features", "fever_night_sweats", "discharge_sinus", "tb_contact", "size_growth", "pain_tenderness", "other_sites", "weight_loss", "immunocompromise"] },
    { id: "reactive", name: "Reactive / infective lymphadenitis", pointers: ["sore_throat_ear_dental", "pain_tenderness", "animal_contact_scratch"], discriminators: ["sore_throat_ear_dental", "pain_tenderness", "animal_contact_scratch", "size_growth", "duration", "fever_night_sweats", "other_sites"] },
    { id: "lymphoma", name: "Lymphoma", pointers: ["b_symptoms", "other_sites", "itching_alcohol_pain", "rapid_growth"], discriminators: ["b_symptoms", "other_sites", "itching_alcohol_pain", "rapid_growth", "pain_tenderness", "discharge_sinus", "tb_features"] },
    { id: "metastatic", name: "Metastatic node", pointers: ["supraclavicular_hard_fixed", "tobacco_alcohol", "voice_change_dysphagia", "cough_chest"], discriminators: ["supraclavicular_hard_fixed", "tobacco_alcohol", "voice_change_dysphagia", "cough_chest", "weight_loss", "site", "pain_tenderness"] },
    { id: "goitre", name: "Goitre (diffuse or nodular)", pointers: ["moves_with_swallowing", "site", "iodine_diet_area", "thyroid_excess", "thyroid_deficiency"], discriminators: ["moves_with_swallowing", "site", "iodine_diet_area", "thyroid_excess", "thyroid_deficiency", "pressure_symptoms", "rapid_growth", "radiation_family_thyroid"] },
    { id: "thyroid_cancer", name: "Thyroid malignancy", pointers: ["moves_with_swallowing", "voice_change_dysphagia", "supraclavicular_hard_fixed", "radiation_family_thyroid"], discriminators: ["moves_with_swallowing", "voice_change_dysphagia", "supraclavicular_hard_fixed", "radiation_family_thyroid", "rapid_growth", "size_growth"] },
    { id: "thyroiditis", name: "Thyroiditis", pointers: ["pain_tenderness", "moves_with_swallowing", "thyroid_excess", "fever_night_sweats"], discriminators: ["pain_tenderness", "moves_with_swallowing", "thyroid_excess", "fever_night_sweats", "sore_throat_ear_dental", "duration"] },
    { id: "salivary", name: "Salivary gland swelling", pointers: ["site", "pain_tenderness"], discriminators: ["site", "pain_tenderness", "moves_with_swallowing", "fever_night_sweats", "tobacco_alcohol"] },
    { id: "hiv", name: "HIV-related lymphadenopathy", pointers: ["hiv_risk", "other_sites", "recurrent_infections_thrush"], discriminators: ["hiv_risk", "other_sites", "recurrent_infections_thrush", "weight_loss", "fever_night_sweats", "tb_features"] },
    { id: "ctd", name: "Connective tissue disease (lupus, Still's)", pointers: ["rash_joint", "fever_night_sweats", "other_sites"], discriminators: ["rash_joint", "fever_night_sweats", "other_sites", "pain_tenderness", "tb_features"] },
  ],
  output: {
    durationSlot: "duration",
    hpiOrder: ["onset", "duration", "onset_mode", "site", "size_growth", "pain_tenderness", "moves_with_swallowing", "discharge_sinus", "other_sites", "pressure_symptoms", "progression", "prior_treatment", "prior_investigations"],
  },
};
