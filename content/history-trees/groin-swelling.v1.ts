import type { HistoryTree } from "@/lib/history-check/types";
import { commonHpi, HUTCHISONS, MACLEODS, val, yn } from "@/content/history-trees/_helpers";

/**
 * GROIN SWELLING — v1.0.0. CLINICAL CONTENT: PENDING CLINICIAN REVIEW.
 * Adult surgical ward, north India. The history separates a hernia from everything else that
 * sits in the groin, and then asks the only question that changes the timing: does it still go
 * back. Differentials: inguinal hernia, femoral hernia, inguinal lymphadenopathy (reactive,
 * tuberculous, malignant), saphena varix, hydrocele of the cord or canal of Nuck, undescended
 * or ectopic testis, lipoma, psoas abscess, femoral aneurysm.
 */
export const groinSwellingV1: HistoryTree = {
  id: "groin_swelling",
  version: "1.0.0",
  complaint: "Groin swelling",
  triggers: ["groin swelling", "swelling in groin", "inguinal swelling", "inguinal hernia", "hernia", "lump in groin", "groin lump", "swelling in the groin", "bulge in groin", "femoral swelling"],
  setting: "Adult surgical ward, north India",
  reviewStatus: "pending_clinician_review",
  reviewedBy: null,
  references: [MACLEODS, HUTCHISONS],
  slots: [
    ...commonHpi("groin swelling"),
    val("hpi", "side", "Which side", "Which side — left, right, or both?", ["left", "right", "both", "one side", "bilateral"]),
    val("hpi", "position", "Exact position", "Is the swelling above the groin crease, below it, or does it extend into the scrotum or labium?", ["above", "below", "groin crease", "inguinal", "femoral", "scrotum", "labium", "extends", "medial", "lateral", "thigh"]),
    val("hpi", "size_and_growth", "Size and change over time", "How big is it, and has it grown since it was first noticed?", ["size", "small", "large", "grown", "increased", "same", "lemon", "orange", "gradually", "over years"], { numeric: true }),
    yn("hpi", "reducibility", "Whether it goes back", "Does the swelling go back on lying down or on pushing it, and has that changed recently?", ["goes back", "reduces", "disappears", "on lying down", "on pushing", "no longer goes back", "irreducible", "stays out", "changed recently"]),
    yn("hpi", "cough_impulse_strain", "Appears on coughing or straining", "Does it appear or get bigger on coughing, straining, lifting, or standing for long?", ["coughing", "straining", "lifting", "standing", "gets bigger", "appears", "bearing down", "at work", "end of day"]),
    yn("hpi", "pain_dragging", "Pain or dragging sensation", "Is there pain or a dragging sensation, and when is it worst?", ["pain", "dragging", "heaviness", "ache", "end of day", "on lifting", "painless", "discomfort", "on walking"]),
    yn("associated", "bowel_symptoms", "Constipation / vomiting / distension", "Any constipation, vomiting, abdominal distension, or failure to pass flatus?", ["constipation", "vomiting", "distension", "flatus", "not passing", "colicky", "obstipation", "abdominal pain"]),
    yn("associated", "fever_skin_change", "Fever / redness over the swelling", "Any fever, redness, warmth, or discharge over the swelling?", ["fever", "redness", "warm", "hot", "discharge", "pus", "sinus", "inflamed", "tender"]),
    yn("associated", "urinary_or_genital", "Urinary symptoms / genital sores or infection", "Any straining to pass urine, poor stream, or sores or infection on the genitals, leg or foot?", ["straining", "poor stream", "prostate", "genital sores", "ulcer", "infection", "foot", "leg", "wound", "boil"]),
    yn("associated", "weight_loss_fever", "Weight loss / night sweats", "Any weight loss, night sweats, or lumps elsewhere in the body?", ["weight loss", "night sweats", "lumps elsewhere", "neck", "axilla", "loss of appetite", "evening rise"]),
    yn("associated", "back_pain", "Back pain or a hump in the back", "Any back pain, or a visible hump or bend in the spine?", ["back pain", "hump", "gibbus", "spine", "deformity", "difficulty walking"], { tier: "detailed" }),
    yn("associated", "varicose_veins", "Varicose veins in the leg", "Any visible varicose veins in the leg on that side?", ["varicose veins", "veins", "prominent", "leg", "swelling of leg", "ulcer near ankle"], { tier: "detailed" }),
    yn("associated", "pulsatile", "Whether the swelling pulsates", "Does the swelling pulsate or throb under the fingers?", ["pulsates", "pulsatile", "throbbing", "beats", "expansile"], { tier: "detailed" }),
    // Red flags
    yn("red_flag", "irreducible_painful", "No longer reducible, painful and tense", "Has a swelling that used to go back become painful, tense, and impossible to push back?", ["no longer goes back", "irreducible", "cannot push back", "painful", "tense", "hard", "suddenly", "stuck"], { teach: "A hernia that used to reduce and now will not, with pain, marks trapped contents, and the blood supply is the thing at risk." }),
    yn("red_flag", "obstruction_features", "Vomiting with absolute constipation and distension", "Along with the swelling, has the patient stopped passing stool and flatus, with vomiting and a distended abdomen?", ["vomiting", "no stool", "no flatus", "absolute constipation", "distension", "obstipation", "colicky pain", "bilious"], { teach: "A groin swelling with vomiting and no stool or flatus describes bowel obstructed inside the sac, which is a theatre problem rather than a clinic one." }),
    yn("red_flag", "skin_changes_over_swelling", "Redness, warmth or blackening over the swelling", "Any redness, warmth, blackening, or severe tenderness of the skin over the swelling?", ["redness", "warm", "blackening", "black", "severe tenderness", "discolouration", "necrosis", "shiny"], { teach: "Skin changes over an irreducible groin swelling suggest the contents have been compromised for some time." }),
    yn("red_flag", "femoral_position", "Swelling below the groin crease in a woman", "Is the swelling below and lateral to the pubic tubercle, particularly in a woman?", ["below", "lateral", "pubic tubercle", "femoral", "woman", "female", "small", "thigh", "below the crease"], { teach: "A femoral hernia sits below the groin crease, is commoner in women, and strangulates far more readily than an inguinal one." }),
    yn("red_flag", "sudden_appearance_pain", "Sudden appearance with severe pain", "Did the swelling appear suddenly, with severe pain, during lifting or straining?", ["sudden", "suddenly", "severe pain", "while lifting", "straining", "appeared", "abrupt", "cried out"], { teach: "A swelling that appears suddenly and painfully during a strain is more likely to have caught its contents from the outset." }),
    yn("red_flag", "hard_matted_nodes", "Hard or matted lumps with weight loss", "Are the lumps hard, matted or fixed, with weight loss or lumps elsewhere?", ["hard", "matted", "fixed", "multiple", "weight loss", "lumps elsewhere", "rubbery", "not tender"], { teach: "Hard or matted groin nodes with weight loss raise tuberculosis or a malignant deposit rather than a simple reactive gland." }),
    yn("red_flag", "cold_abscess_features", "Painless fluctuant swelling with back pain", "Is the swelling soft and painless without redness, alongside back pain or night sweats?", ["painless", "fluctuant", "soft", "no redness", "back pain", "night sweats", "cold abscess", "psoas"], { tier: "detailed", teach: "A painless fluctuant groin swelling without redness, with back pain, raises pus tracking down from a tuberculous spine." }),
    yn("exposure", "occupation_straining", "Heavy work / chronic cough / straining", "Any heavy lifting at work, chronic cough, constipation, or straining to pass urine?", ["heavy lifting", "labourer", "farmer", "chronic cough", "constipation", "straining", "prostate", "weight lifting", "load"]),
    yn("exposure", "previous_hernia_surgery", "Previous hernia or groin surgery", "Any previous hernia repair or other surgery in the groin or lower abdomen?", ["previous hernia", "repair", "mesh", "surgery", "operation", "appendicectomy", "recurrence", "same side"]),
    yn("exposure", "tb_contact", "TB contact / past TB", "Any past tuberculosis or contact with tuberculosis?", ["tb", "tuberculosis", "koch", "att", "akt", "tb contact"]),
    yn("exposure", "sexual_exposure", "Sexual exposure / genital ulcer", "Any recent unprotected sexual contact, genital ulcer, or urethral discharge?", ["unprotected", "sexual contact", "genital ulcer", "urethral discharge", "sti", "new partner"], { tier: "detailed" }),
  ],
  differentials: [
    { id: "inguinal_hernia", name: "Inguinal hernia", pointers: ["reducibility", "cough_impulse_strain", "position", "occupation_straining"], discriminators: ["reducibility", "cough_impulse_strain", "position", "femoral_position", "pain_dragging", "irreducible_painful", "previous_hernia_surgery"] },
    { id: "femoral_hernia", name: "Femoral hernia", pointers: ["femoral_position", "position", "irreducible_painful"], discriminators: ["femoral_position", "position", "reducibility", "irreducible_painful", "obstruction_features", "size_and_growth"] },
    { id: "lymphadenopathy", name: "Inguinal lymphadenopathy", pointers: ["urinary_or_genital", "hard_matted_nodes", "weight_loss_fever", "fever_skin_change"], discriminators: ["urinary_or_genital", "hard_matted_nodes", "weight_loss_fever", "reducibility", "cough_impulse_strain", "sexual_exposure", "tb_contact"] },
    { id: "saphena_varix", name: "Saphena varix", pointers: ["varicose_veins", "reducibility", "cough_impulse_strain"], discriminators: ["varicose_veins", "reducibility", "position", "pain_dragging", "size_and_growth"] },
    { id: "cord_hydrocele", name: "Hydrocele of the cord or canal of Nuck", pointers: ["position", "size_and_growth"], discriminators: ["position", "reducibility", "cough_impulse_strain", "pain_dragging", "size_and_growth"] },
    { id: "undescended_testis", name: "Undescended or ectopic testis", pointers: ["position", "size_and_growth"], discriminators: ["position", "reducibility", "size_and_growth", "pain_dragging"] },
    { id: "lipoma", name: "Lipoma", pointers: ["size_and_growth", "pain_dragging"], discriminators: ["size_and_growth", "reducibility", "cough_impulse_strain", "pain_dragging", "position"] },
    { id: "psoas_abscess", name: "Psoas abscess", pointers: ["cold_abscess_features", "back_pain", "tb_contact"], discriminators: ["cold_abscess_features", "back_pain", "tb_contact", "weight_loss_fever", "fever_skin_change"] },
    { id: "femoral_aneurysm", name: "Femoral aneurysm", pointers: ["pulsatile"], discriminators: ["pulsatile", "position", "reducibility", "size_and_growth"] },
  ],
  output: {
    durationSlot: "duration",
    hpiOrder: ["onset", "duration", "onset_mode", "side", "position", "size_and_growth", "reducibility", "cough_impulse_strain", "pain_dragging", "progression", "prior_treatment", "prior_investigations"],
  },
};
