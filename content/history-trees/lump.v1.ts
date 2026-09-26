import type { HistoryTree } from "@/lib/history-check/types";
import { commonHpi, HUTCHISONS, MACLEODS, PREGNANCY, val, yn } from "@/content/history-trees/_helpers";

/**
 * LUMP / SWELLING (a localised lump) — v1.0.0. CLINICAL CONTENT: PENDING CLINICIAN REVIEW.
 * Adult surgical ward, north India. Generic lump history to be read alongside the site-specific
 * one (breast, neck, groin, abdominal wall). Differentials: lipoma or cyst, abscess, hernia,
 * lymph node (reactive, tuberculous, malignant), soft-tissue tumour, thyroid swelling, vascular.
 */
export const lumpV1: HistoryTree = {
  id: "lump",
  version: "1.0.0",
  complaint: "Lump",
  triggers: ["lump", "swelling in", "mass", "growth", "nodule", "lump in", "lump neck", "lump breast", "lump groin", "swelling neck", "inguinal swelling"],
  setting: "Adult surgical ward, north India",
  reviewStatus: "pending_clinician_review",
  reviewedBy: null,
  references: [MACLEODS, HUTCHISONS],
  slots: [
    ...commonHpi("lump"),
    val("hpi", "site", "Site", "Where exactly is the lump — which region of the body, and is it on one side?", ["neck", "breast", "groin", "axilla", "abdomen", "scalp", "back", "thigh", "arm", "left side", "right side", "one side", "site"]),
    val("hpi", "first_noticed", "How it was noticed", "How was the lump first noticed and what did it look like then?", ["noticed", "first noticed", "found accidentally", "size of", "pea", "marble", "lemon", "coin"]),
    val("hpi", "growth", "Growth", "Has it grown, and how fast — over weeks, months or years?", ["grown", "increasing", "size increased", "static", "same size", "rapid", "slow", "weeks", "months", "years"], { numeric: true }),
    yn("hpi", "pain", "Pain / tenderness", "Is it painful or tender?", ["pain", "painful", "tender", "painless", "ache"]),
    yn("hpi", "variation", "Variation in size", "Does it change in size — on standing, coughing, straining, lying down, or with periods?", ["standing", "coughing", "straining", "lying down", "reducible", "disappears", "periods", "cough impulse", "varies"]),
    yn("associated", "skin_changes", "Skin change / discharge", "Any redness, warmth, skin change, ulceration, or discharge over it?", ["redness", "warmth", "ulceration", "discharge", "pus", "skin change", "inflamed"]),
    yn("associated", "fever", "Fever", "Any fever with it?", ["fever", "chills", "night sweats"]),
    yn("associated", "other_lumps", "Other lumps elsewhere", "Any other lumps in the neck, armpit, groin or elsewhere?", ["other lumps", "multiple", "neck", "axilla", "groin", "lymph nodes", "swellings"]),
    yn("associated", "compressive", "Pressure symptoms", "Any difficulty swallowing, breathing, hoarseness, or swelling of the limb?", ["difficulty swallowing", "difficulty breathing", "hoarseness", "hoarse voice", "limb swelling", "compression", "dysphagia"], { tier: "detailed" }),
    yn("associated", "trauma_injection", "Preceding trauma / injection / insect bite", "Any injury, injection, or insect bite in that area before it appeared?", ["injury", "trauma", "injection", "insect bite", "bite", "blow", "cut", "wound"], { tier: "detailed" }),
    // Red flags
    yn("red_flag", "rapid_growth_hard", "Rapid growth / hard / fixed", "Has it grown quickly, or feels hard and fixed to the tissue below?", ["rapid growth", "rapidly increasing", "hard", "fixed", "stony hard", "irregular", "enlarging fast"], { teach: "A lump that is growing fast, hard and fixed is asked about first because it changes the urgency of assessment." }),
    yn("red_flag", "weight_loss", "Weight loss / night sweats / appetite", "Any unintentional weight loss, night sweats, or loss of appetite?", ["weight loss", "night sweats", "loss of appetite", "lost weight", "anorexia"], { teach: "General symptoms with a lump raise the question of a systemic cause rather than a purely local one." }),
    yn("red_flag", "irreducible_painful", "Painful, tense, irreducible swelling with vomiting", "Is a groin or abdominal lump suddenly painful, tense, and no longer going back, with vomiting?", ["irreducible", "tense", "painful", "vomiting", "not going back", "sudden pain", "obstructed", "strangulated"], { teach: "A swelling that used to reduce and no longer does, with pain and vomiting, asks about a trapped bowel loop." }),
    yn("red_flag", "family_cancer", "Family history of cancer", "Any family history of breast, ovarian, bowel or thyroid cancer?", ["family history", "breast cancer", "ovarian cancer", "bowel cancer", "thyroid cancer", "cancer in family", "mother", "sister"], { teach: "A family history of related cancers raises the pre-test question for a malignant lump." }),
    yn("red_flag", "nipple_skin_change", "Nipple / skin change (breast lump)", "For a breast lump: any nipple discharge, inversion, or skin puckering?", ["nipple discharge", "nipple inversion", "puckering", "dimpling", "peau d orange", "bloody discharge", "retraction"], { tier: "detailed", teach: "These are the questions that separate a benign breast lump from one needing rapid assessment." }),
    yn("red_flag", "radiation_hiv", "Previous radiation / immunosuppression", "Any previous radiotherapy, HIV, or long-term immunosuppression?", ["radiotherapy", "radiation", "hiv", "immunosuppression", "steroids", "cancer treatment"], { tier: "detailed", teach: "Past radiation or immune suppression changes what a new lump can be." }),
    PREGNANCY,
    yn("exposure", "tb_contact", "TB contact / past TB", "Any past tuberculosis or contact with tuberculosis?", ["tb", "tuberculosis", "koch", "att", "akt", "tb contact"]),
    yn("exposure", "tobacco_alcohol", "Tobacco / gutka / alcohol", "Any smoking, tobacco or gutka chewing, or alcohol use?", ["smoking", "tobacco", "gutka", "paan", "alcohol", "chewing"], { tier: "detailed" }),
    yn("exposure", "animals_travel", "Animal contact / travel", "Any animal contact (cat scratch, cattle), unpasteurised milk, or travel?", ["cat scratch", "cattle", "unpasteurised milk", "travel", "animals", "dogs"], { tier: "detailed" }),
  ],
  differentials: [
    { id: "cyst_lipoma", name: "Lipoma / cyst / soft-tissue benign lump", pointers: ["growth", "pain"], discriminators: ["growth", "pain", "first_noticed", "variation", "skin_changes"] },
    { id: "abscess", name: "Abscess / infective swelling", pointers: ["fever", "skin_changes", "pain", "trauma_injection"], discriminators: ["fever", "skin_changes", "pain", "trauma_injection", "onset_mode"] },
    { id: "hernia", name: "Hernia", pointers: ["variation", "irreducible_painful"], discriminators: ["variation", "irreducible_painful", "site", "compressive"] },
    { id: "lymph_node", name: "Lymph node enlargement (reactive / tuberculous / malignant)", pointers: ["other_lumps", "fever", "weight_loss", "tb_contact"], discriminators: ["other_lumps", "fever", "weight_loss", "tb_contact", "growth", "radiation_hiv"] },
    { id: "malignant", name: "Malignant lump", pointers: ["rapid_growth_hard", "weight_loss", "family_cancer"], discriminators: ["rapid_growth_hard", "weight_loss", "family_cancer", "tobacco_alcohol", "growth", "nipple_skin_change"] },
    { id: "thyroid", name: "Thyroid swelling", pointers: ["compressive", "site"], discriminators: ["compressive", "site", "variation", "growth"] },
  ],
  output: {
    durationSlot: "duration",
    hpiOrder: ["onset", "duration", "site", "first_noticed", "growth", "pain", "variation", "progression", "prior_treatment", "prior_investigations"],
  },
};
