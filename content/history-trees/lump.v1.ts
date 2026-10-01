import type { HistoryTree } from "@/lib/history-check/types";
import { BROWSE, commonHpi, DAS_CLINICAL_SURGERY, HAMILTON_BAILEY, HUTCHISONS, MACLEODS, PREGNANCY, SABISTON, surgicalBackground, val, yn } from "@/content/history-trees/_helpers";

/**
 * LUMP / SWELLING (a localised lump) — v1.0.0. CLINICAL CONTENT: PENDING REVIEW (Sabiston background added, docs/surgical-history.md §9).
 * Adult surgical ward, north India. Generic lump history to be read alongside the site-specific
 * one (breast, neck, groin, abdominal wall). Differentials: lipoma or cyst, abscess, hernia,
 * lymph node (reactive, tuberculous, malignant), soft-tissue tumour, thyroid swelling, vascular.
 */
export const lumpV1: HistoryTree = {
  id: "lump",
  version: "1.2.0",
  complaint: "Lump",
  triggers: ["lump", "swelling in", "mass", "growth", "nodule", "lump in", "lump neck", "lump breast", "lump groin", "swelling neck", "inguinal swelling"],
  setting: "Adult surgical ward, north India",
  reviewStatus: "pending_clinician_review",
  reviewedBy: null,
  references: [DAS_CLINICAL_SURGERY, HAMILTON_BAILEY, MACLEODS, HUTCHISONS, BROWSE, SABISTON],
  slots: [
    ...commonHpi("lump"),
    val("hpi", "site", "Site", "Where exactly is the lump — which region of the body, and is it on one side?", ["neck", "breast", "groin", "axilla", "abdomen", "scalp", "back", "thigh", "arm", "left side", "right side", "one side", "site"]),
    val("hpi", "first_noticed", "How it was noticed", "How was the lump first noticed and what did it look like then?", ["noticed", "first noticed", "found accidentally", "size of", "pea", "marble", "lemon", "coin"]),
    val("hpi", "growth", "Growth", "Has it grown, and how fast — over weeks, months or years?", ["grown", "increasing", "size increased", "static", "same size", "rapid", "slow", "weeks", "months", "years"], { numeric: true }),
    yn("hpi", "pain", "Pain / tenderness", "Is it painful or tender?", ["pain", "painful", "tender", "painless", "ache"]),
    yn("hpi", "variation", "Variation in size", "Does it change in size — on standing, coughing, straining, lying down, or with periods?", ["standing", "coughing", "straining", "lying down", "reducible", "disappears", "periods", "cough impulse", "varies"]),
    val("hpi", "previous_aspiration", "Treated or aspirated before", "Has the lump ever been aspirated, drained or operated on before, and did it come back?", ["aspirated", "aspiration", "drained", "incised", "operated", "removed", "came back", "recurred", "never treated"]),
    val("hpi", "patient_concern", "What the patient thinks it is", "What does the patient think the lump is, and what are they most worried about?", ["worried", "afraid", "thinks", "cancer", "tumour", "gaanth", "someone said", "not worried"], { tier: "detailed" }),
    yn("associated", "skin_changes", "Skin change / discharge", "Any redness, warmth, skin change, ulceration, or discharge over it?", ["redness", "warmth", "ulceration", "discharge", "pus", "skin change", "inflamed"]),
    yn("associated", "fever", "Fever", "Any fever with it?", ["fever", "chills", "night sweats", "evening rise", "periodic fever"]),
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
    // S. Das, A Manual on Clinical Surgery, 13th ed. (docs/surgical-history.md §10)
    val("hpi", "pain_swelling_order", "Which came first, pain or swelling", "Which came first — the pain or the swelling — or has the lump always been painless?", ["pain first", "pain before", "swelling first", "swelling before", "pain came later", "pain started after", "always painless", "no pain"], { teach: "Das stresses the order: in inflammation the pain comes before the swelling, while in tumours the swelling is present long before any pain." }),
    yn("associated", "drainage_area_infection", "Cut, sore or infection in the area the lump drains", "Is there any cut, sore, boil, bad tooth or skin infection in the area the lump drains — the scalp, face, mouth, hand, foot, leg or genitals?", ["cut", "wound", "sore", "boil", "abrasion", "bad tooth", "tooth infection", "scalp infection", "foot infection", "genital sore", "no wound", "no infection nearby"], { teach: "Das asks for the primary focus whenever a node is enlarged, because an insignificant abrasion in the drainage area may be the whole cause." }),
    yn("hpi", "sudden_enlargement", "Sudden growth after years unchanged", "After staying the same size for a long time, has the lump suddenly started to grow?", ["suddenly grew", "suddenly increased", "started growing", "same for years", "static for years", "recently enlarging", "no recent change"], { teach: "Das reads a sudden increase after a long stationary period as possible change in a benign growth, which a single question about speed of growth can hide." }),
    yn("hpi", "arose_from_scar_or_mole", "Arose from a scar, mole or birthmark", "Did the lump grow out of an old scar, a mole, or a birthmark?", ["scar", "burn scar", "old scar", "ear piercing", "mole", "black mole", "birthmark", "naevus", "from a scar", "no mole", "normal skin"], { tier: "detailed", teach: "Das notes that a keloid may begin in a burn or ear-prick scar and a melanoma usually in a pre-existing naevus, so the ground the lump rose from narrows the list." }),
    yn("associated", "loss_of_movement", "Movement limited by the lump", "Does the lump limit movement of the nearby joint, limb or spine?", ["cannot move", "restricted movement", "stiff", "cannot bend", "limping", "back stiffness", "movement normal", "no restriction"], { tier: "detailed", teach: "Das lists impairment of function separately; a lump that limits a joint or the spine asks about a deep origin such as a bone tumour or a cold abscess from the spine." }),
    yn("associated", "swelling_with_meals", "Swelling under the jaw at meals", "For a swelling under the jaw, does it come up or hurt while eating?", ["swells while eating", "swells at meals", "pain while eating", "pain on eating", "swelling with food", "under the jaw", "no change with meals"], { tier: "detailed", teach: "Das points out that a submandibular swelling that comes up painfully during meals asks about a stone blocking the salivary duct." }),
    // Hamilton Bailey's Demonstrations of Physical Signs, 19th ed. (docs/surgical-history.md §11)
    yn("red_flag", "facial_weakness", "Facial weakness with the lump", "For a lump in front of the ear or at the angle of the jaw, has that side of the face become weak or drooping?", ["facial weakness", "face weak", "face drooping", "mouth deviated", "cannot close eye", "facial palsy", "no facial weakness"], { teach: "Hamilton Bailey lists facial nerve palsy, with pain and rapid growth, among the features of a parotid swelling that point towards a malignant tumour, so a weak face beside such a lump is asked for directly." }),
    val("associated", "lump_discharge_character", "Discharge from the lump", "If the lump has discharged, how much came out, and what was its colour, thickness and smell?", ["discharge", "pus", "thick", "watery", "cheesy", "blood stained", "foul smell", "yellow", "small amount", "a lot", "never discharged"], { tier: "detailed", teach: "Hamilton Bailey asks about the quantity, colour, consistency and smell of anything a lump has discharged, because cheesy, purulent, blood-stained and foul material each suggest a different kind of lump." }),
    yn("associated", "bleeding_itching", "Bleeding or itching of the lump", "Has the lump or mole started to itch or bleed?", ["itching", "itchy", "bleeding", "bleeds", "bleeds on touch", "crusting", "no bleeding", "no itching"], { tier: "detailed", teach: "Hamilton Bailey notes that itching and bleeding are unusual in a benign mole and common once a melanoma ulcerates, so this change in a skin lump is asked for." }),
    yn("associated", "recent_sore_throat", "Recent sore throat or cold", "For a lump in the neck, was there a sore throat, cold or tonsil infection shortly before it appeared?", ["sore throat", "throat pain", "cold", "tonsillitis", "tonsils", "throat infection", "no sore throat"], { tier: "detailed", teach: "Hamilton Bailey names upper respiratory infection, tonsillitis and glandular fever as frequent causes of enlarged neck nodes, so a recent throat infection changes how a new neck lump reads." }),
    ...surgicalBackground({ omit: ["surg_weight_loss", "surg_family_illness", "surg_patient_concern"] }),
  ],
  differentials: [
    { id: "cyst_lipoma", name: "Lipoma / cyst / soft-tissue benign lump", pointers: ["growth", "pain"], discriminators: ["growth", "pain", "first_noticed", "variation", "skin_changes", "pain_swelling_order", "arose_from_scar_or_mole", "lump_discharge_character"] },
    { id: "abscess", name: "Abscess / infective swelling", pointers: ["fever", "skin_changes", "pain", "trauma_injection"], discriminators: ["fever", "skin_changes", "pain", "trauma_injection", "onset_mode", "pain_swelling_order", "drainage_area_infection", "lump_discharge_character", "recent_sore_throat"] },
    { id: "hernia", name: "Hernia", pointers: ["variation", "irreducible_painful"], discriminators: ["variation", "irreducible_painful", "site", "compressive"] },
    { id: "lymph_node", name: "Lymph node enlargement (reactive / tuberculous / malignant)", pointers: ["other_lumps", "fever", "weight_loss", "tb_contact"], discriminators: ["other_lumps", "fever", "weight_loss", "tb_contact", "growth", "radiation_hiv", "drainage_area_infection", "lump_discharge_character", "recent_sore_throat"] },
    { id: "malignant", name: "Malignant lump", pointers: ["rapid_growth_hard", "weight_loss", "family_cancer"], discriminators: ["rapid_growth_hard", "weight_loss", "family_cancer", "tobacco_alcohol", "growth", "nipple_skin_change", "pain_swelling_order", "sudden_enlargement", "arose_from_scar_or_mole", "loss_of_movement", "facial_weakness", "bleeding_itching"] },
    { id: "thyroid", name: "Thyroid swelling", pointers: ["compressive", "site"], discriminators: ["compressive", "site", "variation", "growth"] },
  ],
  output: {
    durationSlot: "duration",
    hpiOrder: ["onset", "duration", "site", "first_noticed", "growth", "pain", "variation", "progression", "prior_treatment", "prior_investigations"],
  },
};
