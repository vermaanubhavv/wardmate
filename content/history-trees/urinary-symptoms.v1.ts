import type { HistoryTree } from "@/lib/history-check/types";
import { commonHpi, IMMUNOCOMPROMISE, MACLEODS, PREGNANCY, rce, val, yn } from "@/content/history-trees/_helpers";

/**
 * URINARY SYMPTOMS (dysuria, frequency, haematuria, reduced output) — v1.0.0.
 * CLINICAL CONTENT: PENDING CLINICIAN REVIEW.
 * Differentials: cystitis, pyelonephritis, urinary stone, prostatic obstruction / retention,
 * acute kidney injury, glomerulonephritis, urinary tuberculosis, bladder or kidney tumour,
 * urethritis / STI, uncontrolled diabetes.
 */
export const urinarySymptomsV1: HistoryTree = {
  id: "urinary_symptoms",
  version: "1.0.0",
  complaint: "Urinary symptoms",
  triggers: ["burning micturition", "burning urination", "dysuria", "frequency of urine", "urinary frequency", "blood in urine", "haematuria", "hematuria", "reduced urine", "decreased urine output", "not passing urine", "retention of urine", "urinary retention", "urinary symptoms", "uti", "urine infection", "flank pain", "loin pain"],
  setting: "Adult medicine ward, north India",
  reviewStatus: "pending_clinician_review",
  reviewedBy: null,
  references: [
    rce("Does this woman have an acute uncomplicated urinary tract infection?", 2002, "12020306"),
    { title: "KDIGO clinical practice guideline for acute kidney injury", source: "Kidney Int Suppl", year: 2012 },
    { title: "Index-TB guidelines: extrapulmonary tuberculosis (genitourinary TB)", source: "Ministry of Health and Family Welfare, India", year: 2016 },
    { title: "EAU guidelines on urolithiasis", source: "European Association of Urology", year: 2023 },
    MACLEODS,
  ],
  slots: [
    ...commonHpi("urinary symptoms"),
    yn("hpi", "dysuria", "Burning / pain on passing urine", "Is there burning or pain on passing urine, and at the start, throughout, or at the end?", ["burning", "dysuria", "pain on passing", "painful urination", "at the start", "at the end", "throughout"]),
    val("hpi", "frequency_urgency", "Frequency / urgency / night-time urination", "How often is urine passed by day and by night, and is there urgency?", ["frequency", "frequently", "times a day", "times at night", "nocturia", "urgency", "urgent", "cannot hold", "small amounts", "every"], { numeric: true }),
    val("hpi", "output", "Urine output", "Has the amount of urine changed — reduced, increased, or none at all, and since when?", ["reduced", "decreased", "less urine", "no urine", "not passed", "anuria", "oliguria", "increased", "more urine", "polyuria", "output", "amount"]),
    yn("hpi", "haematuria", "Blood in urine", "Is there visible blood in the urine, at the start, throughout, or at the end, and any clots?", ["blood in urine", "haematuria", "hematuria", "red urine", "cola coloured", "clots", "at the start", "at the end", "throughout", "smoky"]),
    val("hpi", "colour_froth", "Colour and froth", "What colour is the urine, and is it frothy or cloudy?", ["colour", "dark", "yellow", "red", "cola", "tea coloured", "frothy", "froth", "cloudy", "turbid", "milky", "clear"]),
    val("hpi", "stream", "Stream / hesitancy / dribbling", "Is there hesitancy, a weak or interrupted stream, straining, dribbling, or a feeling of incomplete emptying?", ["hesitancy", "weak stream", "poor stream", "interrupted", "straining", "dribbling", "incomplete", "not emptied", "stream", "flow"]),
    yn("hpi", "retention", "Inability to pass urine", "Has the patient been unable to pass urine despite the urge, with lower abdominal pain or swelling?", ["unable to pass", "retention", "cannot pass urine", "lower abdominal swelling", "bladder full", "catheter", "catheterised"]),
    val("hpi", "pain_site", "Pain site and radiation", "Any pain in the loin, flank, lower abdomen or groin, and does it move from loin to groin?", ["loin", "flank", "back pain", "lower abdomen", "suprapubic", "groin", "loin to groin", "radiating", "colicky", "colic", "pain"]),
    yn("hpi", "stone_passed", "Passed a stone / gravel", "Has the patient ever passed a stone or gravel in the urine?", ["stone", "gravel", "passed a stone", "calculus", "kidney stone"], { tier: "detailed" }),
    // Associated
    yn("associated", "fever_rigors", "Fever with rigors", "Any fever with chills or rigors?", ["fever", "febrile", "chills", "rigors", "shivering", "temperature"]),
    yn("associated", "vomiting", "Nausea / vomiting", "Any nausea or vomiting?", ["nausea", "vomiting", "vomit"]),
    yn("associated", "swelling", "Swelling of face or legs", "Any puffiness of the face on waking, or swelling of the legs?", ["swelling", "puffiness", "puffy face", "oedema", "leg swelling", "pedal oedema"]),
    yn("associated", "breathlessness", "Breathlessness", "Any breathlessness, especially on lying flat?", ["breathlessness", "breathless", "dyspnoea", "orthopnoea", "lying flat"], { tier: "detailed" }),
    yn("associated", "discharge_genital", "Genital discharge / ulcer", "Any urethral or vaginal discharge, or a genital ulcer?", ["discharge", "urethral", "vaginal", "white discharge", "ulcer", "genital", "itching"], { tier: "detailed" }),
    yn("associated", "thirst_polyuria", "Thirst / excessive urination / weight loss", "Any excessive thirst, large volumes of urine, or weight loss (diabetes)?", ["thirst", "thirsty", "polyuria", "large volumes", "weight loss", "sugar", "diabetes"], { tier: "detailed" }),
    yn("associated", "sore_throat_skin_infection_before", "Sore throat or skin infection before", "Any sore throat or skin infection in the two to three weeks before (glomerulonephritis)?", ["sore throat", "throat infection", "skin infection", "boils", "impetigo", "scabies", "weeks before"], { tier: "detailed" }),
    yn("associated", "joint_rash", "Joint pain / rash", "Any joint pain, rash, or mouth ulcers (lupus nephritis, vasculitis)?", ["joint pain", "rash", "mouth ulcers", "purpura", "lupus"], { tier: "detailed" }),
    yn("associated", "weight_loss_night_sweats", "Weight loss / evening fever / night sweats", "Any weight loss, evening fever or night sweats (urinary tuberculosis, tumour)?", ["weight loss", "evening fever", "night sweats", "evening rise", "chronic"], { tier: "detailed" }),
    yn("associated", "previous_utis", "Previous urinary infections", "Any previous urine infections, and how many in the past year?", ["previous", "recurrent", "before", "uti", "urine infection", "times a year", "earlier"], { tier: "detailed" }),
    // Red flags
    yn("red_flag", "anuria_oliguria", "Very little or no urine", "Has the patient passed very little or no urine in the past 12 to 24 hours?", ["no urine", "not passed urine", "anuria", "very little", "oliguria", "hardly any", "24 hours", "since yesterday"], { teach: "Anuria has three causes that need separating within the hour: obstruction, shock, and kidney injury; the catheter and the ultrasound are the first tests." }),
    yn("red_flag", "fever_loin_pain", "Fever with loin pain or rigors", "Is there fever with loin pain or rigors?", ["fever", "loin pain", "flank pain", "rigors", "chills", "back pain with fever"], { teach: "Fever with loin pain is pyelonephritis until proven otherwise; with an obstructing stone it becomes an infected obstructed kidney, which is a surgical emergency." }),
    yn("red_flag", "sepsis_symptoms", "Sepsis symptoms", "Any drowsiness, confusion, fast breathing, or giddiness on standing?", ["drowsy", "drowsiness", "confused", "confusion", "fast breathing", "giddy", "giddiness", "cold hands", "collapse"], { teach: "Urinary sepsis in the elderly and the diabetic presents as confusion rather than burning; the urinary symptoms may be absent." }),
    yn("red_flag", "painless_haematuria_older", "Painless visible blood in urine", "Is there painless visible blood in the urine, especially in a smoker or a patient over 40?", ["painless", "blood in urine", "haematuria", "clots", "smoker", "over 40", "years old"], { teach: "Painless visible haematuria in an adult is a bladder or kidney tumour until the urinary tract has been looked at." }),
    yn("red_flag", "retention_with_neuro", "Retention with back pain or leg weakness", "Is there retention or incontinence along with back pain, leg weakness, or numbness around the perineum?", ["retention", "incontinence", "back pain", "leg weakness", "numbness", "perineum", "saddle", "cannot walk"], { teach: "Retention with back pain and leg symptoms is cord or cauda equina compression, and the hours matter." }),
    yn("red_flag", "diabetes_pregnancy_catheter_stone", "Diabetes / pregnancy / catheter / known stone / single kidney", "Is the patient diabetic, pregnant, catheterised, or known to have a stone, a single kidney, or kidney disease?", ["diabetes", "diabetic", "pregnant", "catheter", "stone", "single kidney", "kidney disease", "ckd", "transplant"], { teach: "These are what make a urinary infection 'complicated': the same symptoms need admission, cultures and a longer course." }),
    yn("red_flag", "nephrotoxic_drugs", "Painkillers / contrast / herbal medicines / new drugs", "Any painkillers, recent contrast scan, herbal or traditional medicines, or new drugs in the past weeks?", ["painkiller", "nsaid", "diclofenac", "ibuprofen", "contrast", "ct with contrast", "herbal", "ayurvedic", "desi", "bhasma", "new drug", "antibiotic", "started recently"], { teach: "Drugs and traditional preparations are the commonest avoidable cause of acute kidney injury on Indian wards, and the history is the only test for them." }),
    IMMUNOCOMPROMISE,
    PREGNANCY,
    // Exposures
    yn("exposure", "fluid_intake_heat", "Fluid intake / heat / diarrhoea", "How much water does the patient drink, any work in the heat, or recent diarrhoea or vomiting?", ["water", "fluid intake", "litres", "drinks little", "heat", "sun", "outdoors", "diarrhoea", "vomiting", "dehydrat"]),
    yn("exposure", "sexual_history", "Sexual history", "Any recent new or unprotected sexual contact?", ["sexual", "unprotected", "new partner", "sti", "partner"], { tier: "detailed" }),
    yn("exposure", "tb_contact", "TB contact / past TB", "Any past tuberculosis or contact?", ["tb", "tuberculosis", "koch", "att", "tb contact"], { tier: "detailed" }),
    yn("exposure", "occupation_dyes_smoking", "Smoking / dye or rubber industry", "Does the patient smoke, or work with dyes, rubber, or paints?", ["smoking", "smoker", "beedi", "dye", "rubber", "paint", "aniline", "occupation"], { tier: "detailed" }),
    yn("exposure", "family_history_kidney", "Family history of kidney disease / stones", "Any family history of kidney disease, dialysis, or stones?", ["family history", "kidney disease in family", "dialysis", "stones in family", "polycystic"], { tier: "detailed" }),
  ],
  differentials: [
    { id: "cystitis", name: "Cystitis (lower urinary tract infection)", pointers: ["dysuria", "frequency_urgency", "pain_site"], discriminators: ["dysuria", "frequency_urgency", "pain_site", "fever_rigors", "haematuria", "discharge_genital", "previous_utis"] },
    { id: "pyelonephritis", name: "Pyelonephritis", pointers: ["fever_loin_pain", "fever_rigors", "vomiting", "dysuria"], discriminators: ["fever_loin_pain", "fever_rigors", "vomiting", "dysuria", "sepsis_symptoms", "diabetes_pregnancy_catheter_stone", "pain_site"] },
    { id: "stone", name: "Urinary stone", pointers: ["pain_site", "haematuria", "stone_passed", "vomiting"], discriminators: ["pain_site", "haematuria", "stone_passed", "vomiting", "fever_loin_pain", "fluid_intake_heat", "family_history_kidney"] },
    { id: "obstruction_retention", name: "Prostatic obstruction / retention", pointers: ["stream", "retention", "frequency_urgency"], discriminators: ["stream", "retention", "frequency_urgency", "retention_with_neuro", "output", "anuria_oliguria"] },
    { id: "aki", name: "Acute kidney injury", pointers: ["anuria_oliguria", "output", "nephrotoxic_drugs", "fluid_intake_heat"], discriminators: ["anuria_oliguria", "output", "nephrotoxic_drugs", "fluid_intake_heat", "vomiting", "swelling", "breathlessness", "sepsis_symptoms"] },
    { id: "glomerulonephritis", name: "Glomerulonephritis / nephritic syndrome", pointers: ["colour_froth", "swelling", "sore_throat_skin_infection_before", "haematuria"], discriminators: ["colour_froth", "swelling", "sore_throat_skin_infection_before", "haematuria", "joint_rash", "output", "breathlessness"] },
    { id: "gu_tb", name: "Genitourinary tuberculosis", pointers: ["frequency_urgency", "weight_loss_night_sweats", "tb_contact", "previous_utis"], discriminators: ["frequency_urgency", "weight_loss_night_sweats", "tb_contact", "previous_utis", "haematuria", "duration"] },
    { id: "tumour", name: "Bladder or kidney tumour", pointers: ["painless_haematuria_older", "occupation_dyes_smoking", "weight_loss_night_sweats"], discriminators: ["painless_haematuria_older", "occupation_dyes_smoking", "weight_loss_night_sweats", "dysuria", "pain_site"] },
    { id: "urethritis_sti", name: "Urethritis / sexually transmitted infection", pointers: ["discharge_genital", "sexual_history", "dysuria"], discriminators: ["discharge_genital", "sexual_history", "dysuria", "fever_rigors", "frequency_urgency"] },
    { id: "diabetes", name: "Uncontrolled diabetes (polyuria)", pointers: ["thirst_polyuria", "output"], discriminators: ["thirst_polyuria", "output", "dysuria", "fever_rigors", "diabetes_pregnancy_catheter_stone"] },
  ],
  output: {
    durationSlot: "duration",
    hpiOrder: ["onset", "duration", "onset_mode", "dysuria", "frequency_urgency", "output", "haematuria", "colour_froth", "stream", "retention", "pain_site", "stone_passed", "progression", "prior_treatment", "prior_investigations"],
  },
};
