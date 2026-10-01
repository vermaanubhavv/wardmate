import type { HistoryTree } from "@/lib/history-check/types";
import { BROWSE, commonHpi, DAS_CLINICAL_SURGERY, HAMILTON_BAILEY, HUTCHISONS, MACLEODS, PREGNANCY, rce, SABISTON, surgicalBackground, val, yn } from "@/content/history-trees/_helpers";

/**
 * BREAST LUMP OR BREAST COMPLAINT — v1.0.0. CLINICAL CONTENT: PENDING REVIEW (Sabiston background added, docs/surgical-history.md §9).
 * Adult surgical ward, north India. Age drives the differential more than any single feature:
 * a mobile rubbery lump in a woman of twenty and a hard fixed lump in a woman of fifty-five are
 * different problems from the first sentence. Differentials: fibroadenoma, fibrocystic change,
 * breast carcinoma, breast abscess or mastitis, simple cyst, fat necrosis, phyllodes tumour,
 * duct ectasia, tuberculous mastitis, gynaecomastia in a man.
 */
export const breastLumpV1: HistoryTree = {
  id: "breast_lump",
  version: "1.2.0",
  complaint: "Breast lump",
  triggers: ["breast lump", "lump in breast", "breast swelling", "breast mass", "nipple discharge", "breast pain", "mastalgia", "lump in the breast", "breast complaint", "gynaecomastia"],
  setting: "Adult surgical ward, north India",
  reviewStatus: "pending_clinician_review",
  reviewedBy: null,
  references: [
    DAS_CLINICAL_SURGERY,
    HAMILTON_BAILEY,
    BROWSE,
    SABISTON,
    rce("The rational clinical examination. Does this patient have breast cancer? The screening clinical breast examination: should it be done? How?", 1999, "10517431"),
    MACLEODS,
    HUTCHISONS,
  ],
  slots: [
    ...commonHpi("breast lump"),
    val("hpi", "side_site", "Side and site", "Which breast, and in which part — upper outer, behind the nipple, or elsewhere?", ["left", "right", "both", "upper outer", "upper inner", "lower", "behind the nipple", "retroareolar", "axillary tail", "quadrant"]),
    val("hpi", "how_found", "How it was found", "How was the lump found — noticed by chance, felt while bathing, or found on examination?", ["by chance", "while bathing", "self examination", "noticed", "found on examination", "someone else noticed", "screening"]),
    val("hpi", "size_change", "Size and change in size", "How big is it, and has it changed in size since it was first noticed?", ["size", "pea", "marble", "lemon", "grown", "increased", "same size", "static", "smaller", "rapid", "over months"], { numeric: true }),
    val("hpi", "consistency_mobility", "Feel and mobility", "Does it feel soft, rubbery or hard, and does it move freely under the fingers?", ["soft", "rubbery", "firm", "hard", "stony", "mobile", "moves freely", "slips away", "fixed", "does not move", "irregular", "smooth"]),
    yn("hpi", "pain", "Pain or tenderness", "Is the lump painful or tender?", ["pain", "painful", "tender", "painless", "ache", "sore"]),
    yn("hpi", "cyclical_variation", "Change with the menstrual cycle", "Does the lump or the pain change with the periods — worse before, better after?", ["cyclical", "before periods", "after periods", "with the cycle", "premenstrual", "no change", "varies with periods"]),
    val("hpi", "lactation_history", "Breastfeeding history", "Is the patient breastfeeding now, or when did breastfeeding last stop, and for how long did it go on?", ["breastfeeding", "lactating", "feeding the baby", "stopped feeding", "weaned", "months", "years", "never breastfed"], { numeric: true }),
    yn("associated", "nipple_discharge", "Nipple discharge", "Any discharge from the nipple, and what colour — milky, green, or blood-stained?", ["discharge", "milky", "green", "yellow", "blood stained", "bloody", "clear", "from one duct", "spontaneous", "on squeezing", "pus"]),
    yn("associated", "nipple_skin_change", "Nipple or skin change", "Any pulling in of the nipple, dimpling of the skin, orange-peel appearance, ulceration, or eczema of the nipple?", ["nipple retraction", "pulled in", "inversion", "dimpling", "puckering", "orange peel", "peau d orange", "ulceration", "eczema", "scaly nipple", "redness"]),
    yn("associated", "axillary_lump", "Lump in the armpit", "Any lump or swelling in the armpit or above the collar bone?", ["armpit", "axilla", "axillary", "lump in armpit", "collar bone", "supraclavicular", "gland"]),
    yn("associated", "arm_swelling", "Swelling of the arm", "Any swelling or heaviness of the arm on that side?", ["arm swelling", "heaviness", "swollen arm", "lymphoedema", "tight"], { tier: "detailed" }),
    yn("associated", "constitutional", "Weight loss / bone pain / cough / breathlessness", "Any weight loss, bone or back pain, cough, or breathlessness?", ["weight loss", "bone pain", "back pain", "cough", "breathlessness", "loss of appetite", "jaundice"]),
    yn("associated", "fever_lactation", "Fever / recent childbirth / breastfeeding", "Any fever, recent childbirth, or breastfeeding at present?", ["fever", "childbirth", "delivered", "breastfeeding", "lactating", "cracked nipple", "engorgement", "abscess"]),
    yn("associated", "trauma", "Injury to the breast", "Any injury or blow to the breast before the lump appeared?", ["injury", "trauma", "blow", "hit", "fall", "seat belt"], { tier: "detailed" }),
    // Red flags
    yn("red_flag", "hard_fixed_lump", "Hard, irregular or fixed lump", "Is the lump hard, irregular in outline, or fixed to the skin or to the chest wall?", ["hard", "stony hard", "irregular", "fixed", "does not move", "attached", "chest wall", "tethered", "craggy"], { teach: "A hard irregular lump fixed to skin or chest wall carries the highest pre-test probability of malignancy of any bedside finding here." }),
    yn("red_flag", "bloody_single_duct_discharge", "Blood-stained discharge from a single duct", "Is there blood-stained discharge, coming on its own from a single duct?", ["blood stained", "bloody", "single duct", "spontaneous", "one point", "stains clothes", "red discharge", "brown discharge"], { teach: "Spontaneous blood-stained discharge from one duct points to a lesion within that duct and needs looking into rather than reassurance." }),
    yn("red_flag", "skin_nipple_changes", "Skin dimpling / nipple retraction / orange-peel skin", "Any dimpling of the skin, recent pulling in of the nipple, or an orange-peel appearance?", ["dimpling", "puckering", "nipple retraction", "recently pulled in", "orange peel", "peau d orange", "thickened skin", "ulcer"], { teach: "Skin dimpling and a newly retracted nipple mark tethering by an underlying lesion, and they carry more weight than the size of the lump." }),
    yn("red_flag", "axillary_nodes", "Hard lumps in the armpit", "Are there hard or matted lumps in the armpit?", ["armpit", "axillary", "hard", "matted", "fixed", "multiple", "gland", "enlarged"], { teach: "Hard or matted axillary nodes alongside a breast lump change both staging and urgency." }),
    yn("red_flag", "age_new_lump", "New discrete lump over the age of thirty-five", "Is this a new discrete lump in a woman over thirty-five?", ["over 35", "over 40", "age", "new lump", "postmenopausal", "first time", "discrete"], { teach: "The same lump carries a very different probability at twenty and at fifty-five, so age is part of the finding, not background." }),
    yn("red_flag", "postmenopausal_bleeding_hrt", "Postmenopausal, or on hormone treatment", "Is the patient past the menopause, or taking hormone tablets?", ["postmenopausal", "menopause", "periods stopped", "hormone", "hrt", "oestrogen", "tablets"], { tier: "detailed", teach: "A new breast lump after the menopause loses the benign explanations that cyclical hormones provide before it." }),
    yn("red_flag", "family_history_cancer", "Family history of breast or ovarian cancer", "Any breast or ovarian cancer in the mother, sister, daughter, or on the father's side?", ["family history", "breast cancer", "ovarian cancer", "mother", "sister", "daughter", "aunt", "father side", "young age", "both breasts"], { teach: "A first-degree relative with breast or ovarian cancer, especially diagnosed young, shifts the whole assessment and may change screening for the family." }),
    yn("red_flag", "male_patient_lump", "Breast lump in a man", "In a male patient, is there a discrete hard lump rather than generalised breast enlargement?", ["male", "man", "discrete", "hard", "one side", "not generalised", "eccentric", "away from nipple"], { tier: "detailed", teach: "A discrete hard eccentric lump in a man is a different question from the soft symmetrical enlargement of gynaecomastia." }),
    PREGNANCY,
    yn("exposure", "reproductive_history", "Periods, pregnancy and breastfeeding history", "At what age did periods start, how many children, at what age was the first, and for how long was breastfeeding?", ["menarche", "periods started", "children", "first child", "age", "breastfed", "how long", "nulliparous", "no children"]),
    yn("exposure", "previous_breast_problem", "Previous breast lump, biopsy or surgery", "Any previous breast lump, biopsy, aspiration, or breast surgery?", ["previous lump", "biopsy", "fnac", "aspiration", "surgery", "excised", "removed", "same breast", "other breast"]),
    yn("exposure", "radiation_drugs", "Chest radiotherapy / hormone or other drugs", "Any radiotherapy to the chest, or long-term hormone, anti-ulcer or heart medicines?", ["radiotherapy", "radiation", "chest", "hormone", "spironolactone", "anti ulcer", "digoxin", "steroids", "long term"], { tier: "detailed" }),
    yn("exposure", "tb_contact", "TB contact / past TB", "Any past tuberculosis or contact with tuberculosis?", ["tb", "tuberculosis", "koch", "att", "akt", "tb contact", "discharging sinus"], { tier: "detailed" }),
    // S. Das, A Manual on Clinical Surgery, 13th ed. (docs/surgical-history.md §10)
    val("hpi", "nipple_retraction_since", "When the nipple turned in", "If the nipple is pulled in, has it been like that since puberty or only recently?", ["since puberty", "always been", "since childhood", "long time", "recently", "recent", "new", "last few months", "nipple normal"], { teach: "Das separates a nipple pulled in since puberty from one pulled in recently, because only the recent change points to a lesion pulling on it from beneath." }),
    yn("exposure", "previous_breast_abscess", "Previous breast abscess", "Has there been an abscess in either breast before that needed draining?", ["previous abscess", "abscess before", "pus drained", "incised", "drained", "recurrent abscess", "came back", "no previous abscess"], { tier: "detailed", teach: "Das notes that abscesses recur, particularly behind a nipple that has been turned in since birth and in tuberculosis of the breast." }),
    yn("hpi", "throbbing_pain", "Throbbing pain", "Is the pain throbbing, keeping the patient awake?", ["throbbing", "throbs", "pulsating pain", "keeps awake", "cannot sleep with pain", "dull pain", "not throbbing"], { tier: "detailed", teach: "Das describes a throbbing pain in a hot breast as the point at which pus has formed." }),
    // Hamilton Bailey's Demonstrations of Physical Signs, 19th ed. (docs/surgical-history.md §11)
    yn("associated", "discharge_spontaneous", "Discharge on its own or only on squeezing", "Does the nipple discharge come on its own, staining the bra or nightclothes, or only when the nipple is squeezed, and from one breast or both?", ["on its own", "stains bra", "stains clothes", "only on squeezing", "one breast", "both breasts", "no discharge"], { teach: "Hamilton Bailey asks whether discharge is spontaneous or elicited and whether one breast or both, because spontaneous discharge is more often linked to a disease process." }),
    yn("exposure", "personal_cancer_history", "Past cancer elsewhere or lymphoma treatment", "Has the patient had cancer before — of the other breast, the ovary or the womb — or radiation to the neck or chest for a lymphoma?", ["previous cancer", "other breast", "ovarian cancer", "uterine cancer", "lymphoma", "hodgkin", "radiation to neck", "no previous cancer"], { teach: "Hamilton Bailey notes that a previous cancer of the other breast, ovary or endometrium, and mantle irradiation for Hodgkin's disease, each raise breast-cancer risk." }),
    val("exposure", "smoking", "Smoking", "Does the patient smoke, how much, and for how long?", ["smoker", "smokes", "cigarettes", "bidi", "tobacco", "non smoker", "never smoked"], { teach: "Hamilton Bailey describes recurring subareolar abscess in smokers in their late twenties and early thirties, and lists smoking among breast-cancer risk factors." }),
    yn("associated", "male_gynaecomastia_causes", "In a man: testis, steroids, cannabis", "In a male patient, any lump or swelling in a testicle, use of body-building steroids, or cannabis use?", ["testicular lump", "testis swelling", "body building steroids", "anabolic steroids", "cannabis", "ganja", "no steroid use"], { tier: "detailed", teach: "Hamilton Bailey says the causes of male breast enlargement must be sought in a detailed history, naming testicular tumours, anabolic steroids, cannabis and liver or kidney failure." }),
    ...surgicalBackground({ omit: ["surg_weight_loss"] }),
  ],
  differentials: [
    { id: "fibroadenoma", name: "Fibroadenoma", pointers: ["consistency_mobility", "pain", "size_change"], discriminators: ["consistency_mobility", "pain", "size_change", "age_new_lump", "cyclical_variation", "hard_fixed_lump"] },
    { id: "fibrocystic", name: "Fibrocystic change", pointers: ["cyclical_variation", "pain", "side_site"], discriminators: ["cyclical_variation", "pain", "consistency_mobility", "nipple_discharge", "size_change", "discharge_spontaneous"] },
    { id: "carcinoma", name: "Breast carcinoma", pointers: ["hard_fixed_lump", "skin_nipple_changes", "axillary_nodes", "age_new_lump", "bloody_single_duct_discharge"], discriminators: ["hard_fixed_lump", "skin_nipple_changes", "axillary_nodes", "age_new_lump", "bloody_single_duct_discharge", "family_history_cancer", "constitutional", "consistency_mobility", "nipple_retraction_since", "discharge_spontaneous", "personal_cancer_history"] },
    { id: "abscess_mastitis", name: "Breast abscess or mastitis", pointers: ["fever_lactation", "pain"], discriminators: ["fever_lactation", "pain", "consistency_mobility", "onset_mode", "skin_nipple_changes", "previous_breast_abscess", "throbbing_pain", "smoking"] },
    { id: "cyst", name: "Simple breast cyst", pointers: ["consistency_mobility", "cyclical_variation", "onset_mode"], discriminators: ["consistency_mobility", "cyclical_variation", "onset_mode", "size_change", "pain"] },
    { id: "fat_necrosis", name: "Fat necrosis", pointers: ["trauma", "consistency_mobility"], discriminators: ["trauma", "consistency_mobility", "skin_nipple_changes", "size_change"] },
    { id: "phyllodes", name: "Phyllodes tumour", pointers: ["size_change", "consistency_mobility"], discriminators: ["size_change", "consistency_mobility", "age_new_lump", "previous_breast_problem", "axillary_nodes"] },
    { id: "duct_ectasia", name: "Duct ectasia", pointers: ["nipple_discharge", "side_site"], discriminators: ["nipple_discharge", "bloody_single_duct_discharge", "side_site", "skin_nipple_changes", "age_new_lump", "nipple_retraction_since", "previous_breast_abscess", "discharge_spontaneous", "smoking"] },
    { id: "tuberculous_mastitis", name: "Tuberculous mastitis", pointers: ["tb_contact", "constitutional"], discriminators: ["tb_contact", "constitutional", "fever_lactation", "consistency_mobility", "duration", "previous_breast_abscess"] },
    { id: "gynaecomastia", name: "Gynaecomastia", pointers: ["male_patient_lump", "radiation_drugs"], discriminators: ["male_patient_lump", "radiation_drugs", "consistency_mobility", "side_site", "hard_fixed_lump", "male_gynaecomastia_causes"] },
  ],
  output: {
    durationSlot: "duration",
    hpiOrder: ["onset", "duration", "how_found", "side_site", "size_change", "consistency_mobility", "pain", "cyclical_variation", "progression", "prior_treatment", "prior_investigations"],
  },
};
