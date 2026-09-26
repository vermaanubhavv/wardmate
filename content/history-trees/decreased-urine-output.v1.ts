import type { HistoryTree } from "@/lib/history-check/types";
import { commonHpi, HUTCHISONS, MACLEODS, PREGNANCY, val, yn } from "@/content/history-trees/_helpers";

/**
 * DECREASED URINE OUTPUT — v1.0.0. CLINICAL CONTENT: REVIEWED (Dr Anubhav Verma).
 * Adult medicine ward, north India. Organised as pre-renal (fluid loss, low pressure), renal
 * (sepsis, drugs, glomerular, pigment) and post-renal (obstruction). Differentials: pre-renal
 * injury, acute tubular injury, glomerulonephritis, obstructive uropathy, hepatorenal, chronic
 * kidney disease with decompensation.
 */
export const decreasedUrineOutputV1: HistoryTree = {
  id: "decreased_urine_output",
  version: "1.0.0",
  complaint: "Decreased urine output",
  triggers: ["decreased urine output", "reduced urine output", "decreased urine", "less urine", "oliguria", "anuria", "not passing urine", "no urine", "urine output decreased"],
  setting: "Adult medicine ward, north India",
  reviewStatus: "reviewed",
  reviewedBy: "Dr Anubhav Verma",
  references: [MACLEODS, HUTCHISONS],
  slots: [
    ...commonHpi("reduction in urine"),
    val("hpi", "amount", "How much urine", "How much urine is being passed in a day — none, a few times, small amounts each time?", ["no urine", "not passing", "small amounts", "few times", "drops", "litres", "glasses", "per day", "times a day", "anuria", "oliguria"]),
    val("hpi", "urine_colour", "Colour of urine", "What colour is the urine — dark, tea-coloured, red, or cloudy?", ["dark", "tea coloured", "cola", "red", "cloudy", "smoky", "yellow", "clear", "colour"]),
    val("hpi", "intake", "Fluid intake", "How much is the patient drinking and eating?", ["drinking", "fluid intake", "poor intake", "not drinking", "eating", "intake", "thirsty"]),
    yn("hpi", "stream", "Poor stream / straining / retention", "Any poor stream, straining, dribbling, or a feeling of a full bladder that will not empty?", ["poor stream", "straining", "dribbling", "hesitancy", "retention", "full bladder", "cannot pass", "weak stream"]),
    yn("associated", "fluid_loss", "Vomiting / loose stools / bleeding", "Any recent vomiting, loose stools, or blood loss?", ["vomiting", "loose stools", "diarrhoea", "bleeding", "blood loss", "sweating"]),
    yn("associated", "swelling", "Swelling", "Any swelling of the face or legs?", ["swelling", "puffiness", "oedema", "edema", "facial puffiness", "pedal oedema", "anasarca"]),
    yn("associated", "breathlessness", "Breathlessness", "Any breathlessness or cough, especially lying flat?", ["breathlessness", "breathless", "orthopnoea", "lying flat", "cough", "pnd"]),
    yn("associated", "fever_dysuria", "Fever / burning urine", "Any fever, burning urine, or loin pain?", ["fever", "burning", "dysuria", "loin pain", "flank pain", "chills"]),
    yn("associated", "nausea_itching", "Nausea / hiccups / itching", "Any nausea, hiccups, itching, or metallic taste?", ["nausea", "hiccups", "itching", "pruritus", "metallic taste", "loss of appetite"]),
    yn("associated", "confusion", "Drowsiness / confusion", "Any drowsiness or confusion?", ["drowsy", "confused", "confusion", "sleepy", "altered"]),
    yn("associated", "rash_joint", "Rash / joint pain", "Any rash, joint pain, or mouth ulcers?", ["rash", "joint pain", "mouth ulcers", "photosensitivity", "arthralgia"], { tier: "detailed" }),
    yn("associated", "sore_throat_skin", "Recent sore throat or skin infection", "Any sore throat or skin infection in the past few weeks?", ["sore throat", "tonsillitis", "skin infection", "pyoderma", "impetigo", "scabies"], { tier: "detailed" }),
    // Red flags
    yn("red_flag", "anuria", "Almost no urine for many hours", "Has the patient passed almost no urine for the past twelve hours or more?", ["no urine", "not passed urine", "anuria", "since yesterday", "twelve hours", "hours"], { teach: "Almost no urine for many hours needs a quick look for a blocked outflow, since that is the most fixable cause." }),
    yn("red_flag", "nsaid_or_drugs", "NSAIDs / nephrotoxic drugs", "Any painkillers, herbal medicines, aminoglycosides, or contrast in recent days?", ["nsaid", "painkillers", "diclofenac", "ibuprofen", "herbal", "ayurvedic", "gentamicin", "contrast", "aminoglycoside", "ace inhibitor", "diuretic"], { teach: "Many kidney injuries begin with a drug the patient took for something else, so the medicine list is part of the history." }),
    yn("red_flag", "sepsis_hypotension", "Fever with giddiness / low BP", "Any fever with giddiness, fainting or a recorded low blood pressure?", ["fever", "giddiness", "fainting", "low bp", "hypotension", "shock", "cold peripheries"], { teach: "Infection with low pressure reduces kidney blood flow and is the commonest hospital cause of falling urine output." }),
    yn("red_flag", "hyperkalaemia_symptoms", "Palpitations / muscle weakness", "Any palpitations or new muscle weakness?", ["palpitations", "muscle weakness", "weakness", "irregular heartbeat", "slow heartbeat"], { teach: "When the kidneys fail, potassium can climb silently, and palpitations or weakness are the only warning." }),
    yn("red_flag", "pulmonary_oedema", "Breathless lying flat / frothy sputum", "Any breathlessness lying flat, or frothy or pink sputum?", ["orthopnoea", "lying flat", "frothy", "pink sputum", "breathless at rest", "pnd"], { teach: "Fluid overload in kidney failure can flood the lungs, and this history tells how urgent the question is." }),
    yn("red_flag", "bloody_urine_hypertension", "Blood in urine / headache / high BP", "Any red or cola-coloured urine, headache, or high blood pressure readings?", ["red urine", "cola", "blood in urine", "haematuria", "headache", "high bp", "hypertension"], { teach: "Red urine with swelling and a raised pressure asks about inflammation of the kidney filters." }),
    PREGNANCY,
    yn("exposure", "known_ckd", "Known kidney disease / diabetes / hypertension", "Is there known kidney disease, diabetes, or hypertension?", ["ckd", "kidney disease", "diabetes", "diabetic", "hypertension", "creatinine", "dialysis", "renal"]),
    yn("exposure", "stone_prostate", "Stones / prostate / previous catheter", "Any history of kidney stones, prostate trouble, or urinary catheter?", ["stones", "calculi", "prostate", "bph", "catheter", "renal colic", "stricture"]),
    yn("exposure", "envenomation_exertion", "Snake bite / heavy exertion / muscle injury", "Any snake bite, heavy exertion, crush injury, or prolonged fall on the floor?", ["snake bite", "envenomation", "exertion", "crush", "muscle injury", "lay on floor", "rhabdomyolysis"], { tier: "detailed" }),
  ],
  differentials: [
    { id: "prerenal", name: "Pre-renal (volume depletion / low pressure)", pointers: ["fluid_loss", "intake", "sepsis_hypotension"], discriminators: ["fluid_loss", "intake", "sepsis_hypotension", "nsaid_or_drugs", "swelling"] },
    { id: "atn", name: "Acute tubular injury (sepsis / drugs / pigment)", pointers: ["sepsis_hypotension", "nsaid_or_drugs", "envenomation_exertion"], discriminators: ["sepsis_hypotension", "nsaid_or_drugs", "envenomation_exertion", "urine_colour", "fluid_loss"] },
    { id: "gn", name: "Glomerulonephritis", pointers: ["bloody_urine_hypertension", "sore_throat_skin", "swelling", "urine_colour"], discriminators: ["bloody_urine_hypertension", "sore_throat_skin", "swelling", "urine_colour", "rash_joint"] },
    { id: "obstruction", name: "Obstructive uropathy", pointers: ["stream", "stone_prostate", "anuria"], discriminators: ["stream", "stone_prostate", "anuria", "fever_dysuria", "amount"] },
    { id: "hepatorenal", name: "Hepatorenal / cirrhosis-related", pointers: ["swelling", "fluid_loss"], discriminators: ["swelling", "fluid_loss", "known_ckd", "confusion"] },
    { id: "ckd", name: "Chronic kidney disease, decompensated", pointers: ["known_ckd", "nausea_itching", "swelling"], discriminators: ["known_ckd", "nausea_itching", "swelling", "onset_mode", "duration"] },
  ],
  output: {
    durationSlot: "duration",
    hpiOrder: ["onset", "duration", "onset_mode", "amount", "urine_colour", "intake", "stream", "progression", "prior_treatment", "prior_investigations"],
  },
};
