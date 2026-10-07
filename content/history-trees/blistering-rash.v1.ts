import type { HistoryTree } from "@/lib/history-check/types";
import { commonHpi, HUTCHISONS, IADVL, IMMUNOCOMPROMISE, MACLEODS, val, yn } from "@/content/history-trees/_helpers";

/**
 * BLISTERS ON THE SKIN — v1.0.0. CLINICAL CONTENT: REVIEWED (Dr Anubhav Verma).
 * Dermatology ward and OPD, north India. The history exists first to find the drug reaction
 * that is about to peel (a new medicine in the last eight weeks, sore mouth and eyes, skin
 * slipping off), then to separate the blister that is fragile and breaks (pemphigus) from the
 * tense itchy one (pemphigoid), and the infective or contact blister from the immune one.
 * Differentials: SJS/TEN and other severe drug reactions, fixed drug eruption, pemphigus
 * vulgaris, bullous pemphigoid, bullous impetigo, varicella or herpes zoster, herpes simplex,
 * dermatitis herpetiformis, insect bite or contact dermatitis, burns, porphyria.
 */
export const blisteringRashV1: HistoryTree = {
  id: "blistering_rash",
  version: "1.1.0",
  complaint: "Blisters on the skin",
  triggers: ["blister", "blistering", "bullae", "bulla", "bullous", "vesicles", "fluid filled lesions", "water filled boils", "chhale", "phaphole", "skin coming off", "sjs", "stevens johnson", "pemphigus", "pemphigoid", "shingles", "herpes zoster", "fixed drug eruption"],
  setting: "Dermatology ward and OPD, north India",
  reviewStatus: "pending_clinician_review",
  reviewedBy: null,
  references: [IADVL, MACLEODS, HUTCHISONS],
  slots: [
    ...commonHpi("blisters"),
    val("hpi", "blister_site_start", "Where the blisters started and spread", "Where on the body did the blisters start, and where have they spread since?", ["started on", "mouth", "lips", "face", "trunk", "back", "arms", "legs", "flexures", "groin", "hands", "feet", "genitals", "whole body", "spread"]),
    val("hpi", "blister_type", "What the blisters are like", "Are the blisters tense and hard to break, or thin and bursting easily into raw areas, and is the fluid clear, bloody or pus filled?", ["tense", "flaccid", "thin walled", "burst easily", "break easily", "raw areas", "clear fluid", "watery", "bloody", "pus", "yellow crust", "honey coloured", "grouped", "small", "large"]),
    yn("hpi", "blister_itch_pain", "Itch or pain in the blisters", "Are the blisters itchy, or painful and burning?", ["itching", "itchy", "severe itch", "painful", "burning", "tender", "sore", "no itch", "not painful"]),
    yn("hpi", "dermatomal_band", "Band on one side with pain before", "Are the blisters in a band on one side of the body, and was there pain or tingling at that spot before they came?", ["one side", "band", "belt", "stripe", "pain before", "tingling before", "burning before", "along the ribs", "forehead", "dermatome"], { teach: "Grouped blisters in a one-sided band after a few days of local pain are asked about because the nerve involved decides which complications to look for." }),
    yn("hpi", "recurrence_same_site", "Recurring at the same spot", "Has a blister or dark patch come back at exactly the same spot before, either after a particular tablet or on the lips or genitals?", ["same spot", "same place", "comes back", "recurrent", "after tablet", "every time", "dark patch", "lips", "genitals", "cold sore"], { teach: "A lesion that returns at the same spot each time a tablet is taken, or at the same lip or genital site, is asked because the pattern of return is the clue the history gives." }),
    yn("hpi", "sun_fragility", "Blisters after sun / fragile skin / dark urine", "Have blisters come on the backs of the hands or face after sun exposure, with fragile skin, extra facial hair, or reddish-brown urine?", ["sun", "sun exposed", "back of hands", "fragile skin", "scars", "milia", "facial hair", "dark urine", "reddish urine", "alcohol"], { tier: "detailed" }),
    yn("hpi", "previous_episodes", "Similar episodes before", "Has there been a similar blistering episode before, and what was it put down to?", ["before", "previous episode", "earlier", "similar episode", "relapse", "first time", "recurred", "old records"], { tier: "detailed" }),
    yn("associated", "new_drug_8wk", "New medicine in the last eight weeks", "Was any new medicine started in the last eight weeks — for fits, gout, infection or pain, a sulfa drug, or an ayurvedic or homeopathic remedy?", ["new medicine", "new tablet", "fits medicine", "anticonvulsant", "phenytoin", "carbamazepine", "lamotrigine", "sulfa", "sulpha", "allopurinol", "gout medicine", "painkiller", "nsaid", "antibiotic", "ayurvedic", "homeopathic", "desi dawa", "injection"], { teach: "Almost every severe blistering drug reaction traces to a medicine started in the preceding weeks, and only the history can name it and its start date." }),
    yn("associated", "prodrome_fever", "Fever, sore throat or burning eyes before the skin", "Were there fever, sore throat, body ache or burning eyes for a few days before the skin lesions appeared?", ["fever", "sore throat", "body ache", "burning eyes", "before the rash", "flu like", "malaise", "days before"]),
    yn("associated", "honey_crust_contacts", "Yellow crusts / children or contacts affected", "Are there yellow honey-coloured crusts, and does a child or anyone else at home have similar sores?", ["honey coloured", "yellow crust", "crusts", "child", "children", "school", "siblings", "same sores", "contacts", "pus"]),
    yn("associated", "chickenpox_contact", "Chickenpox contact / previous chickenpox", "Has there been contact with chickenpox, and has the patient had chickenpox or its vaccine before?", ["chickenpox", "chicken pox", "choti mata", "mata", "contact", "exposed", "had chickenpox", "vaccine", "never had"]),
    yn("associated", "gut_itchy_elbows", "Loose stools / itchy blisters on elbows and knees", "Are there intensely itchy small blisters on the elbows, knees or buttocks, with loose stools, bloating or trouble with wheat?", ["elbows", "knees", "buttocks", "very itchy", "scratched", "loose stools", "bloating", "wheat", "gluten", "chapati"], { tier: "detailed" }),
    yn("exposure", "insect_plant_contact", "Insect bite / plant / new cream contact", "Was there an insect bite, a burning insect crushed on the skin, contact with a plant, or a new cream, dye or chemical applied just before the blisters?", ["insect bite", "bite", "insect", "crushed", "beetle", "night light", "plant", "leaves", "new cream", "hair dye", "chemical", "applied", "linear", "streak"]),
    yn("exposure", "heat_chemical", "Heat, hot liquid or chemical contact", "Was there contact with fire, hot liquid, a hot object, acid, or a caustic chemical at that site?", ["fire", "hot water", "hot liquid", "tea", "scald", "hot object", "silencer", "acid", "chemical", "caustic", "heat"]),
    // Red flags
    yn("red_flag", "mucosal_sites", "Sores in the mouth, eyes or genitals", "Are there sores or raw areas in the mouth, lips, eyes or genitals?", ["mouth ulcers", "mouth sores", "lips", "crusted lips", "bleeding lips", "genital", "raw", "cannot eat", "eyes", "mucosa"], { teach: "Raw areas at two or more mucosal sites alongside blisters raise a severe drug reaction or pemphigus rather than a local blistering cause." }),
    yn("red_flag", "skin_detachment", "Skin peeling in sheets", "Is the skin peeling off in sheets or slipping when rubbed, and roughly how much of the body is raw?", ["peeling", "sheets", "slipping", "skin comes off", "denuded", "raw", "large areas", "burn like", "percent", "wet sheets"], { teach: "Skin that detaches in sheets behaves like a burn, with the same losses of fluid, heat and protein, so the extent is asked early." }),
    yn("red_flag", "eye_symptoms", "Red painful eyes / cannot open eyes", "Are the eyes red, painful, sticky, sensitive to light, or stuck shut, or are there blisters on the tip of the nose?", ["red eyes", "painful eyes", "sticky eyes", "discharge", "light", "photophobia", "cannot open", "stuck", "tip of nose", "blurred vision"], { teach: "Eye involvement with blistering is asked about directly because scarring of the eye surface can follow within days and is often not volunteered." }),
    yn("red_flag", "swallow_fluid_loss", "Cannot eat or drink / less urine", "Is the patient unable to eat or drink because of mouth sores, and has the urine reduced?", ["cannot eat", "cannot drink", "not eating", "not drinking", "painful swallowing", "less urine", "reduced urine", "thirsty", "dry mouth", "giddy"], { teach: "Mouth sores and weeping skin together can drain fluid faster than intake replaces it, so intake and urine are asked early." }),
    yn("red_flag", "fever_toxicity", "High fever / drowsiness / rigors", "Is there high fever, rigors, drowsiness or confusion since the blisters appeared?", ["high fever", "rigors", "chills", "drowsy", "confused", "altered", "very unwell", "lethargic", "not responding"], { teach: "Fever with rigors or drowsiness on open blistered skin raises infection spreading into the blood, which the skin findings alone do not show." }),
    IMMUNOCOMPROMISE,
  ],
  differentials: [
    { id: "sjs_ten", name: "SJS / TEN or other severe drug reaction", pointers: ["new_drug_8wk", "mucosal_sites", "skin_detachment", "prodrome_fever"], discriminators: ["new_drug_8wk", "mucosal_sites", "skin_detachment", "prodrome_fever", "eye_symptoms", "onset_mode"] },
    { id: "fixed_drug_eruption", name: "Fixed drug eruption", pointers: ["recurrence_same_site", "new_drug_8wk"], discriminators: ["recurrence_same_site", "new_drug_8wk", "blister_site_start", "previous_episodes", "blister_itch_pain"] },
    { id: "pemphigus_vulgaris", name: "Pemphigus vulgaris", pointers: ["mucosal_sites", "blister_type"], discriminators: ["blister_type", "mucosal_sites", "duration", "blister_site_start", "previous_episodes", "new_drug_8wk"] },
    { id: "bullous_pemphigoid", name: "Bullous pemphigoid", pointers: ["blister_type", "blister_itch_pain"], discriminators: ["blister_type", "blister_itch_pain", "mucosal_sites", "blister_site_start", "duration"] },
    { id: "bullous_impetigo", name: "Bullous impetigo", pointers: ["honey_crust_contacts"], discriminators: ["honey_crust_contacts", "blister_type", "blister_site_start", "fever_toxicity"] },
    { id: "varicella_zoster", name: "Varicella or herpes zoster", pointers: ["dermatomal_band", "chickenpox_contact", "prodrome_fever"], discriminators: ["dermatomal_band", "chickenpox_contact", "prodrome_fever", "blister_site_start", "eye_symptoms", "immunocompromise"] },
    { id: "herpes_simplex", name: "Herpes simplex", pointers: ["recurrence_same_site", "blister_itch_pain"], discriminators: ["recurrence_same_site", "blister_site_start", "blister_type", "previous_episodes", "immunocompromise"] },
    { id: "dermatitis_herpetiformis", name: "Dermatitis herpetiformis", pointers: ["gut_itchy_elbows", "blister_itch_pain"], discriminators: ["gut_itchy_elbows", "blister_itch_pain", "blister_site_start", "duration"] },
    { id: "insect_contact", name: "Insect bite or contact dermatitis", pointers: ["insect_plant_contact"], discriminators: ["insect_plant_contact", "blister_site_start", "blister_itch_pain", "onset_mode"] },
    { id: "burns", name: "Thermal or chemical burn", pointers: ["heat_chemical"], discriminators: ["heat_chemical", "onset_mode", "blister_site_start", "skin_detachment"] },
    { id: "porphyria", name: "Porphyria or pseudoporphyria", pointers: ["sun_fragility"], discriminators: ["sun_fragility", "blister_site_start", "new_drug_8wk", "previous_episodes"] },
  ],
  output: {
    durationSlot: "duration",
    hpiOrder: ["onset", "duration", "onset_mode", "blister_site_start", "blister_type", "blister_itch_pain", "progression", "new_drug_8wk", "prior_treatment", "prior_investigations"],
  },
};
