import type { HistoryTree } from "@/lib/history-check/types";
import { BAILEY_LOVE, CAMPBELL_UROLOGY, commonHpi, HUTCHISONS, IMMUNOCOMPROMISE, MACLEODS, val, yn } from "@/content/history-trees/_helpers";

/**
 * PAIN IN THE LOIN / RENAL COLIC — v1.0.0. CLINICAL CONTENT: PENDING CLINICIAN REVIEW.
 * Urology ward and casualty, north India. The history reads the pain first (colicky and
 * restless, or constant and still), then asks the two questions that change the timing: is
 * there fever with the pain, and is there only one working kidney. The mimics that kill are
 * asked for every time. Differentials: ureteric or renal stone, pyelonephritis, obstructed
 * infected kidney (pyonephrosis), pelvi-ureteric junction obstruction, renal cell carcinoma,
 * renal tuberculosis, papillary necrosis, renal infarct; mimics — aortic aneurysm, biliary
 * colic, appendicitis, ectopic pregnancy, musculoskeletal pain, herpes zoster.
 */
export const loinPainV1: HistoryTree = {
  id: "loin_pain",
  version: "1.0.0",
  complaint: "Pain in the loin / renal colic",
  triggers: ["loin pain", "pain in loin", "pain in the loin", "flank pain", "pain in flank", "renal colic", "ureteric colic", "kidney pain", "pain in kidney", "stone pain", "kidney stone pain", "pain in the side", "gurde me dard", "pathri ka dard"],
  setting: "Urology ward and casualty, north India",
  reviewStatus: "pending_clinician_review",
  reviewedBy: null,
  references: [CAMPBELL_UROLOGY, BAILEY_LOVE, MACLEODS, HUTCHISONS],
  slots: [
    ...commonHpi("loin pain"),
    val("hpi", "side_site", "Side and site", "Which side is the pain on, and where exactly — loin, side of the abdomen, back or groin?", ["right", "left", "both sides", "loin", "flank", "side", "back", "groin", "renal angle"]),
    val("hpi", "radiation", "Radiation", "Does the pain travel — to the groin, testis or labia, the tip of the penis, the shoulder, or around to the front?", ["radiates", "groin", "testis", "labia", "tip of penis", "shoulder", "front", "goes down", "loin to groin"]),
    val("hpi", "character", "Character", "Is the pain colicky, coming in waves, or constant and dull?", ["colicky", "waves", "comes and goes", "constant", "dull ache", "sharp", "stabbing", "burning", "tearing"]),
    val("hpi", "restlessness", "Restless or lying still", "Is the patient rolling about unable to settle, or lying still because moving hurts?", ["rolling", "restless", "cannot settle", "lying still", "movement hurts", "writhing"], { teach: "Colic makes patients restless while inflamed peritoneum keeps them still, which separates two quite different groups of causes." }),
    val("hpi", "severity", "Severity", "How severe is the pain, on a scale of ten, and has it woken the patient?", ["out of ten", "severe", "moderate", "mild", "worst", "woke from sleep"], { numeric: true }),
    val("hpi", "previous_episodes", "Previous similar episodes", "Has the same pain happened before, and what was found then?", ["before", "previous episode", "same pain", "recurrent", "earlier", "first time"]),
    // Associated
    yn("associated", "nausea_vomiting", "Nausea / vomiting", "Any nausea or vomiting with the pain?", ["nausea", "vomiting", "vomited", "retching", "ulti"]),
    yn("associated", "haematuria_loin", "Blood in the urine", "Has the urine been red, smoky or blood-stained?", ["blood in urine", "red urine", "smoky", "haematuria", "hematuria", "clots"]),
    yn("associated", "lower_urinary", "Burning / frequency / urge to pass urine", "Any burning, passing urine often, or a constant urge to pass it?", ["burning", "dysuria", "frequency", "urgency", "strangury", "constant urge"]),
    yn("associated", "stone_or_tissue_passed", "Stone or tissue passed", "Has any stone, gravel or piece of tissue been passed in the urine?", ["stone passed", "gravel", "grit", "tissue", "piece passed", "sand"]),
    yn("associated", "pain_after_fluids", "Pain after drinking a lot", "Does the pain come on after drinking a large amount of fluid, tea or beer?", ["after drinking", "large amount of water", "beer", "tea", "fluid load"], { tier: "detailed", teach: "Pain brought on by a fluid load asks about a narrow outlet from the kidney that fills faster than it drains." }),
    yn("associated", "loin_lump", "Lump in the loin / weight loss", "Is there a lump in the loin, weight loss, or loss of appetite?", ["lump", "mass", "swelling in loin", "weight loss", "loss of appetite", "lost weight"]),
    yn("associated", "tb_symptoms", "Tuberculosis symptoms", "Any evening fever, night sweats, cough, or past tuberculosis in the patient or the household?", ["evening fever", "night sweats", "cough", "tuberculosis", "tb", "att", "household contact"], { tier: "detailed" }),
    yn("associated", "gut_relation", "Relation to meals / bowels", "Is the pain linked to meals, fatty food, or bowel movements, and is there any loose stool?", ["after meals", "fatty food", "oily food", "bowel", "loose stools", "jaundice", "indigestion"]),
    yn("associated", "movement_rash", "Pain on movement / rash", "Is the pain worse on bending or twisting, or is there a burning band of pain or a blistering rash on the skin?", ["bending", "twisting", "movement", "lifting", "muscle", "rash", "blisters", "band like", "skin burning"]),
    // Red flags
    yn("red_flag", "fever_with_colic", "Fever or rigors with the pain", "Is there fever, rigors or chills along with the loin pain?", ["fever", "rigors", "chills", "shivering", "temperature"], { teach: "Fever in a kidney that may be blocked asks whether infected urine is trapped above an obstruction, which cannot wait." }),
    yn("red_flag", "single_kidney_anuria", "Single kidney / no urine", "Does the patient have only one working kidney, or has almost no urine been passed?", ["single kidney", "one kidney", "kidney removed", "transplant", "no urine", "anuria", "not passed urine"], { teach: "Obstruction of a solitary kidney, or of both sides, stops all urine and makes the pain an emergency." }),
    yn("red_flag", "aneurysm_features", "Sudden severe back pain with collapse", "Did the pain come suddenly, tearing into the back, with fainting or collapse, especially in an older patient or a smoker?", ["sudden", "tearing", "fainted", "collapse", "pulsatile", "aneurysm", "smoker", "older"], { teach: "A leaking aortic aneurysm can be mistaken for left-sided colic in an older patient, and that error is often fatal." }),
    yn("red_flag", "missed_period_bleeding", "Missed period / vaginal bleeding", "In a woman, is a period late or missed, or is there vaginal bleeding or fainting?", ["missed period", "late period", "lmp", "pregnant", "vaginal bleeding", "spotting", "fainting"], { teach: "A ruptured ectopic pregnancy can present as one-sided lower loin pain, so the menstrual history is asked in every woman of reproductive age." }),
    yn("red_flag", "shock_symptoms", "Giddiness / cold sweat", "Any giddiness on standing, cold sweat, or confusion?", ["giddiness", "cold sweat", "clammy", "confusion", "low bp", "drowsy"], { teach: "Signs of shock turn a painful complaint into a haemodynamic one and change what is asked next." }),
    yn("red_flag", "embolic_source", "Irregular heartbeat / recent heart attack", "Any irregular heartbeat, a recent heart attack, or a clot elsewhere in the body?", ["irregular heartbeat", "palpitations", "af", "heart attack", "clot", "stroke", "blood thinner"], { tier: "detailed", teach: "Loin pain with an embolic source asks about a blocked renal artery, which is easily taken for a stone." }),
    IMMUNOCOMPROMISE,
    // Exposure / background
    yn("exposure", "stone_history", "Past stones / family history", "Has the patient or a family member had kidney stones, or had any stone operation?", ["stones before", "kidney stone", "pathri", "family history", "lithotripsy", "pcnl", "urs", "stone operation"]),
    val("exposure", "fluid_intake_work", "Fluid intake and work", "How much water does the patient drink in a day, and is the work outdoors or in the heat?", ["litres", "glasses", "drinks little", "outdoor work", "heat", "sun", "sweating", "field"], { tier: "detailed" }),
    yn("exposure", "analgesic_diabetes", "Long-term painkillers / diabetes", "Has the patient taken painkillers regularly for a long time, or is there diabetes or sickle cell disease?", ["painkillers", "long term painkillers", "nsaid", "diabetes", "diabetic", "sickle cell"], { tier: "detailed", teach: "Long-term painkillers, diabetes and sickle cell disease are the settings where tissue from the kidney itself can slough and block the ureter." }),
    yn("exposure", "previous_uti_surgery", "Past urinary infection or urological surgery", "Any past urinary infections, or earlier kidney or ureteric operations?", ["urinary infection", "uti", "kidney operation", "stent", "dj stent", "pyeloplasty", "nephrostomy"]),
  ],
  differentials: [
    { id: "stone", name: "Ureteric or renal stone", pointers: ["character", "restlessness", "radiation", "haematuria_loin", "stone_history"], discriminators: ["character", "restlessness", "radiation", "stone_or_tissue_passed", "haematuria_loin", "fever_with_colic"] },
    { id: "pyelonephritis", name: "Pyelonephritis", pointers: ["fever_with_colic", "lower_urinary"], discriminators: ["fever_with_colic", "lower_urinary", "character", "immunocompromise", "previous_uti_surgery"] },
    { id: "pyonephrosis", name: "Obstructed infected kidney (pyonephrosis)", pointers: ["fever_with_colic", "stone_history", "shock_symptoms"], discriminators: ["fever_with_colic", "shock_symptoms", "single_kidney_anuria", "character", "immunocompromise"] },
    { id: "puj", name: "Pelvi-ureteric junction obstruction", pointers: ["pain_after_fluids", "previous_episodes"], discriminators: ["pain_after_fluids", "previous_episodes", "loin_lump", "character"] },
    { id: "rcc", name: "Renal cell carcinoma", pointers: ["loin_lump", "haematuria_loin"], discriminators: ["loin_lump", "haematuria_loin", "character", "progression"] },
    { id: "renal_tb", name: "Renal tuberculosis", pointers: ["tb_symptoms", "lower_urinary"], discriminators: ["tb_symptoms", "lower_urinary", "haematuria_loin", "duration"] },
    { id: "papillary_necrosis", name: "Papillary necrosis", pointers: ["analgesic_diabetes", "stone_or_tissue_passed"], discriminators: ["analgesic_diabetes", "stone_or_tissue_passed", "fever_with_colic", "haematuria_loin"] },
    { id: "renal_infarct", name: "Renal infarct", pointers: ["embolic_source"], discriminators: ["embolic_source", "character", "haematuria_loin", "onset_mode"] },
    { id: "aaa", name: "Leaking abdominal aortic aneurysm", pointers: ["aneurysm_features", "shock_symptoms"], discriminators: ["aneurysm_features", "shock_symptoms", "onset_mode", "radiation"] },
    { id: "biliary", name: "Biliary colic / cholecystitis", pointers: ["gut_relation"], discriminators: ["gut_relation", "side_site", "radiation", "haematuria_loin"] },
    { id: "appendicitis", name: "Appendicitis (retrocaecal)", pointers: ["gut_relation", "restlessness"], discriminators: ["gut_relation", "restlessness", "side_site", "nausea_vomiting"] },
    { id: "ectopic", name: "Ectopic pregnancy", pointers: ["missed_period_bleeding", "shock_symptoms"], discriminators: ["missed_period_bleeding", "shock_symptoms", "side_site", "radiation"] },
    { id: "musculoskeletal", name: "Musculoskeletal loin pain", pointers: ["movement_rash"], discriminators: ["movement_rash", "character", "haematuria_loin", "restlessness"] },
    { id: "zoster", name: "Herpes zoster", pointers: ["movement_rash"], discriminators: ["movement_rash", "character", "immunocompromise", "side_site"] },
  ],
  output: {
    durationSlot: "duration",
    hpiOrder: ["onset", "duration", "onset_mode", "side_site", "radiation", "character", "restlessness", "severity", "previous_episodes", "progression", "prior_treatment", "prior_investigations"],
  },
};
