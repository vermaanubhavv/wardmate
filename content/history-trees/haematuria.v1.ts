import type { HistoryTree } from "@/lib/history-check/types";
import { commonHpi, HUTCHISONS, MACLEODS, PREGNANCY, val, yn } from "@/content/history-trees/_helpers";

/**
 * BLOOD IN THE URINE — v1.0.0. CLINICAL CONTENT: REVIEWED.
 * Urology ward, north India. Painless visible haematuria is a urothelial cancer until proven
 * otherwise, and that single rule organises the history. Where in the stream the blood appears
 * localises the source. Differentials: urinary tract infection, stone, bladder or renal
 * malignancy, prostatic bleeding, glomerulonephritis, tuberculosis of the urinary tract,
 * trauma, bleeding disorder or anticoagulation, and a harmless colour change mistaken for blood.
 */
export const haematuriaV1: HistoryTree = {
  id: "haematuria",
  version: "1.0.0",
  complaint: "Blood in the urine",
  triggers: ["haematuria", "hematuria", "blood in urine", "red urine", "bloody urine", "passing blood in urine", "clots in urine", "cola coloured urine", "peshab me khoon"],
  setting: "Urology ward, north India",
  reviewStatus: "reviewed",
  reviewedBy: "Dr. Anubhav, General Surgery — 2026-09-26",
  references: [MACLEODS, HUTCHISONS],
  slots: [
    ...commonHpi("blood in the urine"),
    val("hpi", "stream_timing", "Where in the stream", "Does the blood appear at the start of passing urine, at the end, or throughout?", ["at the start", "initial", "at the end", "terminal", "throughout", "whole stream", "total", "only at the end"]),
    val("hpi", "colour_clots", "Colour and clots", "What colour is the urine — bright red, dark, smoky or cola-coloured — and are there clots?", ["bright red", "dark", "smoky", "cola", "brown", "tea", "clots", "worm like", "no clots"]),
    val("hpi", "amount_frequency", "How often and how much", "Has it happened once or several times, and is it every time urine is passed?", ["once", "several times", "every time", "intermittent", "on and off", "episodes", "continuous"]),
    yn("hpi", "pain", "Pain", "Is passing urine painful, and is there loin or lower abdominal pain?", ["painful", "burning", "painless", "no pain", "loin pain", "flank", "lower abdomen", "colicky", "radiating to groin"]),
    yn("hpi", "clot_retention", "Difficulty passing urine because of clots", "Has passing urine become difficult or impossible because of clots?", ["clots", "difficulty", "cannot pass", "retention", "blocked", "straining", "dribbling"]),
    yn("associated", "fever_chills", "Fever", "Any fever, chills, or rigors?", ["fever", "chills", "rigors", "temperature", "night sweats"]),
    yn("associated", "lower_urinary_symptoms", "Stream, frequency and urgency", "Any poor stream, straining, dribbling, passing urine often, or urgency?", ["poor stream", "straining", "dribbling", "hesitancy", "frequency", "urgency", "nocturia", "incomplete"]),
    yn("associated", "swelling_hypertension", "Swelling or high blood pressure", "Any swelling of the face or legs, frothy urine, or a raised blood pressure?", ["swelling", "puffiness", "face", "legs", "frothy", "protein", "high bp", "hypertension"]),
    yn("associated", "weight_loss_haem", "Weight loss or appetite", "Any weight loss, loss of appetite, or tiredness?", ["weight loss", "lost weight", "appetite", "tiredness", "fatigue"]),
    yn("associated", "bleeding_elsewhere_haem", "Bleeding elsewhere", "Any bleeding from the gums or nose, bruising, or blood in the stool?", ["gums", "nose bleed", "bruising", "blood in stool", "bleeding elsewhere", "petechiae"]),
    yn("associated", "sore_throat_skin_haem", "Recent sore throat or skin infection", "Any sore throat or skin infection in the past few weeks?", ["sore throat", "tonsillitis", "skin infection", "pyoderma", "impetigo", "few weeks"], { tier: "detailed" }),
    yn("associated", "trauma_exercise", "Injury or heavy exertion", "Any injury to the loin or abdomen, or unusually heavy exercise before it started?", ["injury", "trauma", "fall", "blow", "loin", "exercise", "running", "marathon", "exertion"], { tier: "detailed" }),
    // Red flags
    yn("red_flag", "painless_visible_haematuria", "Visible blood without pain", "Is there visible blood in the urine with no pain at all on passing it?", ["painless", "no pain", "visible", "frank", "bright red", "without burning", "no discomfort"], { teach: "Painless visible blood in the urine is a urothelial cancer until proven otherwise, and the absence of pain is exactly what makes it easy to dismiss." }),
    yn("red_flag", "age_smoking", "Age over forty, or a tobacco user", "Is the patient over forty, or a smoker or tobacco user, and for how many years?", ["over forty", "over fifty", "age", "smoker", "tobacco", "bidi", "years", "chewing"], { teach: "Age and tobacco are the strongest risks for bladder cancer, and together with painless bleeding they set the pre-test question." }),
    yn("red_flag", "clot_retention_red", "Unable to pass urine because of clots", "Is the patient unable to pass urine, with a painful full lower abdomen?", ["cannot pass", "retention", "clots", "full bladder", "painful", "lower abdomen", "blocked"], { teach: "Clots that block the outflow turn bleeding into retention, which needs relieving before anything else is considered." }),
    yn("red_flag", "ongoing_heavy_bleeding", "Heavy or continuing bleeding", "Is the urine heavily blood-stained every time, with giddiness, breathlessness or tiredness?", ["heavy", "every time", "continuous", "giddiness", "breathless", "tiredness", "pale", "clots"], { teach: "Continuous heavy urinary bleeding can drop the haemoglobin substantially, and the systemic symptoms tell how much has been lost." }),
    yn("red_flag", "flank_mass_pain", "A lump in the loin", "Is there a lump felt in the loin, or persistent loin pain?", ["lump", "mass", "loin", "flank", "felt", "persistent pain", "dull ache"], { teach: "A loin lump with blood in the urine raises a renal tumour, a combination that presents late because each part alone is easy to explain away." }),
    yn("red_flag", "glomerular_features", "Cola-coloured urine with swelling and raised pressure", "Is the urine cola or smoky coloured, with swelling of the face and a high blood pressure?", ["cola", "smoky", "brown", "swelling", "face", "puffiness", "high bp", "reduced urine", "frothy"], { teach: "Cola-coloured urine with facial swelling and a raised pressure points to the kidney filters rather than to bleeding into the urinary tract." }),
    yn("red_flag", "anticoagulant_haem", "Blood thinners", "Is the patient on blood thinners or aspirin, or known to have a bleeding disorder?", ["blood thinner", "warfarin", "aspirin", "clopidogrel", "anticoagulant", "bleeding disorder", "platelets"], { teach: "Blood thinners do not explain haematuria away: bleeding on a thinner still needs the urinary tract looked at, because it often unmasks a lesion." }),
    yn("red_flag", "sterile_pyuria_tb", "Past tuberculosis or unexplained pus in the urine", "Any past tuberculosis, contact with tuberculosis, or pus cells in the urine that were never explained?", ["tb", "tuberculosis", "koch", "att", "contact", "pus cells", "sterile pyuria", "unexplained", "recurrent"], { teach: "Urinary tuberculosis presents with pus cells that grow nothing on ordinary culture, and goes unrecognised unless specifically considered." }),
    PREGNANCY,
    yn("exposure", "occupational_exposure", "Work with dyes, rubber or chemicals", "Has the patient worked with dyes, paints, rubber, leather or industrial chemicals?", ["dye", "paint", "rubber", "leather", "chemicals", "factory", "industrial", "aniline", "occupation", "years"]),
    yn("exposure", "stones_procedures", "Stones, catheters or urological procedures", "Any previous kidney stones, catheter, cystoscopy or urological operation?", ["stones", "calculi", "catheter", "cystoscopy", "operation", "urological", "lithotripsy", "previous"]),
    yn("exposure", "drugs_food_colour", "Drugs or foods that colour the urine", "Any beetroot, or medicines such as rifampicin that turn the urine red or orange?", ["beetroot", "rifampicin", "medicine", "colour", "orange", "red", "supplement", "dye in food"]),
    yn("exposure", "family_kidney_disease", "Family history of kidney disease", "Any family history of kidney disease, blood in the urine, deafness, or cysts in the kidney?", ["family history", "kidney disease", "blood in urine", "deafness", "cysts", "polycystic", "father", "mother"], { tier: "detailed" }),
  ],
  differentials: [
    { id: "uti_haem", name: "Urinary tract infection", pointers: ["fever_chills", "pain", "lower_urinary_symptoms"], discriminators: ["fever_chills", "pain", "lower_urinary_symptoms", "painless_visible_haematuria", "colour_clots", "stones_procedures"] },
    { id: "stone_haem", name: "Urinary stone", pointers: ["pain", "stones_procedures", "colour_clots"], discriminators: ["pain", "stones_procedures", "stream_timing", "fever_chills", "painless_visible_haematuria"] },
    { id: "urothelial_cancer", name: "Bladder or upper tract malignancy", pointers: ["painless_visible_haematuria", "age_smoking", "occupational_exposure", "weight_loss_haem"], discriminators: ["painless_visible_haematuria", "age_smoking", "occupational_exposure", "weight_loss_haem", "stream_timing", "colour_clots", "clot_retention"] },
    { id: "renal_tumour", name: "Renal tumour", pointers: ["flank_mass_pain", "weight_loss_haem", "painless_visible_haematuria"], discriminators: ["flank_mass_pain", "weight_loss_haem", "painless_visible_haematuria", "age_smoking", "family_kidney_disease"] },
    { id: "prostatic", name: "Prostatic bleeding", pointers: ["lower_urinary_symptoms", "stream_timing", "age_smoking"], discriminators: ["lower_urinary_symptoms", "stream_timing", "age_smoking", "pain", "clot_retention"] },
    { id: "glomerulonephritis_haem", name: "Glomerulonephritis", pointers: ["glomerular_features", "swelling_hypertension", "sore_throat_skin_haem"], discriminators: ["glomerular_features", "swelling_hypertension", "sore_throat_skin_haem", "colour_clots", "pain", "family_kidney_disease"] },
    { id: "gu_tb_haem", name: "Genitourinary tuberculosis", pointers: ["sterile_pyuria_tb", "lower_urinary_symptoms"], discriminators: ["sterile_pyuria_tb", "lower_urinary_symptoms", "fever_chills", "weight_loss_haem", "duration"] },
    { id: "trauma_haem", name: "Trauma or exertional haematuria", pointers: ["trauma_exercise"], discriminators: ["trauma_exercise", "pain", "colour_clots", "amount_frequency"] },
    { id: "coagulopathy_haem", name: "Bleeding disorder or anticoagulation", pointers: ["anticoagulant_haem", "bleeding_elsewhere_haem"], discriminators: ["anticoagulant_haem", "bleeding_elsewhere_haem", "painless_visible_haematuria", "stones_procedures"] },
    { id: "pseudohaematuria", name: "Colour change that is not blood", pointers: ["drugs_food_colour"], discriminators: ["drugs_food_colour", "colour_clots", "stream_timing", "pain"] },
  ],
  output: {
    durationSlot: "duration",
    hpiOrder: ["onset", "duration", "stream_timing", "colour_clots", "amount_frequency", "pain", "clot_retention", "progression", "prior_treatment", "prior_investigations"],
  },
};
