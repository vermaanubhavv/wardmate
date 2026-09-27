import type { HistoryTree } from "@/lib/history-check/types";
import { commonHpi, HUTCHISONS, MACLEODS, PARSONS_EYE, val, yn } from "@/content/history-trees/_helpers";

/**
 * WATERING OF THE EYE — v1.0.0. CLINICAL CONTENT: REVIEWED (Dr Anubhav Verma).
 * Eye ward and OPD, north India. The first split is overflow against overproduction: tears that
 * roll down the cheek because the drain is blocked or the lid does not pump them, or an
 * irritated eye making more tears than any drain could carry. Age, a swelling at the inner
 * corner and pus on pressure sort the drainage causes; grit, lashes and itching sort the
 * irritant ones. The large cloudy eye in a baby and the hot swelling at the inner corner are
 * the ones that cannot wait.
 * Differentials: congenital nasolacrimal duct obstruction, acquired nasolacrimal duct
 * obstruction, chronic dacryocystitis / mucocele, acute dacryocystitis, punctal stenosis /
 * ectropion / lid laxity, trichiasis / entropion, foreign body, dry eye with reflex watering,
 * allergic conjunctivitis, facial palsy, canalicular injury, congenital glaucoma, lacrimal sac
 * growth, keratitis or uveitis.
 */
export const wateringEyeV1: HistoryTree = {
  id: "watering_eye",
  version: "1.0.0",
  complaint: "Watering of the eye",
  triggers: ["watering eye", "watering of eye", "watering of the eye", "watering from eye", "watering eyes", "epiphora", "excessive tearing", "tears rolling", "blocked tear duct", "nasolacrimal duct", "dacryocystitis", "aankh se paani", "aankh se aansu", "aansu aate", "aankh me paani"],
  setting: "Eye ward and OPD, north India",
  reviewStatus: "reviewed",
  reviewedBy: "Dr Anubhav Verma",
  references: [PARSONS_EYE, MACLEODS, HUTCHISONS],
  slots: [
    ...commonHpi("watering of the eye"),
    val("hpi", "side", "Which eye", "Is the watering in one eye or both?", ["right eye", "left eye", "one eye", "both eyes", "bilateral", "unilateral"], { teach: "Watering in one eye leans towards a local block or irritant; both eyes together lean towards allergy, dry eye or a lid problem on both sides." }),
    val("hpi", "pattern", "Constant or triggered", "Is the watering constant, or only in wind, cold, smoke, bright light or while reading?", ["constant", "all the time", "wind", "cold", "smoke", "dust", "sunlight", "bright light", "reading", "outdoors", "on and off"]),
    yn("hpi", "overflow_cheek", "Tears spilling onto the cheek", "Are tears spilling over the lid onto the cheek, so the patient keeps wiping them?", ["spill", "overflow", "rolling down", "on the cheek", "wiping", "handkerchief", "wet cheek", "tears flow"], { teach: "Tears running down the cheek suggest the drain cannot carry them away; a wet but not spilling eye suggests the eye is making too many." }),
    yn("hpi", "since_birth_sticky", "Since birth or early infancy, with sticky lashes", "In a baby, has the watering been there since birth or the first weeks of life, with sticky lashes on waking?", ["since birth", "from birth", "newborn", "first weeks", "infant", "baby", "sticky lashes", "crusting", "matting"], { teach: "Watering with sticky lashes from the first weeks of life fits a tear duct that has not yet opened into the nose, which often opens on its own in the first year." }),
    yn("hpi", "sticky_discharge", "Sticky discharge / crusting", "Is there sticky discharge or crusting of the lashes, especially on waking?", ["sticky", "discharge", "pus", "crusting", "crusts", "lashes stuck", "matting", "mucus", "gheed", "keechad"]),
    yn("hpi", "regurgitation_on_pressure", "Pus or mucus on pressing the inner corner", "Does pressing at the inner corner, beside the nose, bring pus or mucus back into the eye?", ["pressing", "pressure", "inner corner", "pus comes out", "mucus comes out", "regurgitation", "discharge on pressing", "squeeze"], { teach: "Pus returning on pressure at the inner corner means the tear sac is collecting fluid above a block lower down." }),
    yn("hpi", "inner_corner_swelling", "Swelling at the inner corner", "Is there a swelling at the inner corner, just below the inner end of the lid?", ["swelling", "inner corner", "near the nose", "lump", "bump", "sac swelling", "mucocele", "puffy near nose"]),
    yn("hpi", "gritty_burning", "Gritty / burning eye", "Does the eye feel gritty, sandy or burning, worse later in the day, with screens, a fan or air conditioning?", ["gritty", "sandy", "burning", "foreign body sensation", "dry", "dryness", "screen", "mobile", "computer", "fan", "cooler", "ac", "evening"], { teach: "A dry, irritated surface can make the eye water a lot, so watering does not always mean the drain is blocked." }),
    yn("hpi", "lashes_rubbing", "Lashes rubbing / lid turning in", "Are the lashes rubbing on the eye, or is the lid turning inwards?", ["lashes rubbing", "lashes touching", "ingrowing lashes", "trichiasis", "entropion", "lid turned in", "parwal", "baal chubhna", "plucking lashes"], { teach: "Lashes rubbing on the cornea cause constant reflex watering and can scar the cornea if missed." }),
    yn("hpi", "lid_sagging", "Lower lid sagging or turned out", "Is the lower lid loose, sagging away from the eye or turned outwards?", ["sagging", "loose lid", "lid turned out", "ectropion", "drooping lower lid", "lid falls away", "red inner lid showing"], { teach: "A lower lid that falls away from the eye lifts the tear opening off the tear lake, so tears spill even with an open drain." }),
    yn("hpi", "foreign_body", "Something went into the eye", "Did the watering start suddenly after something went into the eye?", ["something went in", "foreign body", "dust particle", "insect", "chip", "iron particle", "grinding", "kuch gira", "sudden watering"]),
    yn("associated", "itching_seasonal", "Itching / seasonal / sneezing", "Is the eye itchy, worse in a particular season, with sneezing, a runny nose or known allergy?", ["itching", "itchy", "khujli", "rubbing", "seasonal", "spring", "summer", "sneezing", "runny nose", "allergy", "asthma"], { teach: "Itching is the symptom that most reliably separates an allergic eye from the other causes of watering." }),
    yn("associated", "facial_weakness", "Weakness of the face on the same side", "Is there weakness of the face on the same side — the eye not closing fully, or the mouth pulled to one side?", ["facial weakness", "face deviated", "mouth deviated", "cannot close eye", "eye does not close", "facial palsy", "bell's palsy", "lakwa", "face paralysis"], { teach: "When the lid muscle is weak the blink no longer pumps tears into the drain, and an eye that does not close is also at risk of drying." }),
    yn("associated", "inner_corner_injury", "Injury or cut near the inner corner", "Was there an injury, cut or dog bite near the inner corner of the lids?", ["cut", "laceration", "injury", "dog bite", "torn lid", "inner corner injury", "stitched", "sutured", "trauma"], { teach: "A cut near the inner corner can divide the tear drainage channel, and watering may be the only sign left after the skin has healed." }),
    yn("associated", "nose_sinus", "Nose or sinus trouble on the same side", "Any blocked nose, sinus disease, nasal injury or nose surgery on the same side?", ["blocked nose", "sinus", "sinusitis", "polyp", "nasal injury", "broken nose", "nose surgery", "deviated septum", "nasal discharge"], { tier: "detailed", teach: "The tear duct opens into the nose, so disease or injury there can block it from below." }),
    yn("associated", "long_term_drops_trachoma", "Long-term eye drops / past trachoma", "Has the patient used eye drops for years, or had trachoma or repeated eye infections in the past?", ["eye drops", "glaucoma drops", "long term drops", "years of drops", "trachoma", "kukre", "repeated infections", "scarring"], { tier: "detailed", teach: "Years of eye drops and old trachoma can scar and narrow the tiny tear openings in the lid." }),
    // Red flags
    yn("red_flag", "hot_swelling_fever", "Painful red swelling at the inner corner / fever", "Is there a painful, red, hot swelling at the inner corner, with fever or spreading lid swelling?", ["painful swelling", "red swelling", "hot", "tender", "fever", "spreading", "lid swollen", "abscess", "boil near nose"], { teach: "A hot swelling of the tear sac can spread into the lids and the orbit, and needs to be seen the same day." }),
    yn("red_flag", "vision_movement_proptosis", "Vision drop / eye pushed forward / painful movement", "Has vision dropped, is the eye pushed forward, or is moving the eye painful or restricted?", ["vision dropped", "cannot see", "blurred", "pushed forward", "proptosis", "bulging", "pain on moving", "restricted movement", "double vision"], { teach: "Reduced vision or restricted movement marks spread of infection behind the lids into the orbit." }),
    yn("red_flag", "infant_large_cloudy_eye", "Baby with a large or cloudy eye / fear of light", "In a baby, does one eye look larger or cloudy, with fear of light and squeezing the lids shut?", ["large eye", "big eye", "cloudy", "hazy cornea", "white cornea", "fear of light", "photophobia", "squeezing", "keeps eyes shut", "rubbing eyes"], { teach: "Raised pressure in a baby's eye also causes watering, and a large or cloudy cornea with fear of light points there rather than to a blocked duct." }),
    yn("red_flag", "blood_tears_hard_mass", "Blood-stained tears / hard swelling above the inner corner", "Are the tears blood-stained, or is there a hard swelling above the inner corner, or nosebleeds on the same side?", ["blood in tears", "blood stained tears", "bloody tears", "hard swelling", "above the inner corner", "nosebleed", "epistaxis", "growing lump"], { teach: "Bloody tears or a hard swelling reaching above the inner corner raise a growth in the tear sac rather than a simple block." }),
    yn("red_flag", "red_painful_eye", "Red, painful eye with blurred vision or fear of light", "Is the eye red and painful, with blurred vision or fear of light?", ["red eye", "painful eye", "pain", "blurred vision", "fear of light", "photophobia", "white spot", "ulcer", "halo"], { teach: "Watering with pain, redness and blurred vision raises an ulcer on the cornea or inflammation inside the eye, which threaten sight within days." }),
  ],
  differentials: [
    { id: "congenital_nldo", name: "Congenital nasolacrimal duct obstruction", pointers: ["since_birth_sticky", "sticky_discharge"], discriminators: ["since_birth_sticky", "sticky_discharge", "regurgitation_on_pressure", "infant_large_cloudy_eye", "side"] },
    { id: "acquired_nldo", name: "Acquired nasolacrimal duct obstruction", pointers: ["overflow_cheek", "pattern"], discriminators: ["overflow_cheek", "regurgitation_on_pressure", "nose_sinus", "gritty_burning", "lid_sagging", "side"] },
    { id: "chronic_dacryocystitis", name: "Chronic dacryocystitis / mucocele", pointers: ["regurgitation_on_pressure", "inner_corner_swelling", "sticky_discharge"], discriminators: ["regurgitation_on_pressure", "inner_corner_swelling", "sticky_discharge", "hot_swelling_fever", "blood_tears_hard_mass"] },
    { id: "acute_dacryocystitis", name: "Acute dacryocystitis", pointers: ["hot_swelling_fever", "inner_corner_swelling"], discriminators: ["hot_swelling_fever", "inner_corner_swelling", "vision_movement_proptosis", "regurgitation_on_pressure", "onset_mode"] },
    { id: "punctal_lid_malposition", name: "Punctal stenosis / ectropion / lid laxity", pointers: ["lid_sagging", "long_term_drops_trachoma"], discriminators: ["lid_sagging", "long_term_drops_trachoma", "overflow_cheek", "regurgitation_on_pressure", "facial_weakness"] },
    { id: "trichiasis_entropion", name: "Trichiasis / entropion", pointers: ["lashes_rubbing", "long_term_drops_trachoma"], discriminators: ["lashes_rubbing", "gritty_burning", "long_term_drops_trachoma", "red_painful_eye"] },
    { id: "foreign_body", name: "Foreign body on the eye or under the lid", pointers: ["foreign_body"], discriminators: ["foreign_body", "onset_mode", "red_painful_eye", "side"] },
    { id: "dry_eye_reflex", name: "Dry eye with reflex watering", pointers: ["gritty_burning", "pattern"], discriminators: ["gritty_burning", "pattern", "overflow_cheek", "itching_seasonal", "side"] },
    { id: "allergic_conjunctivitis", name: "Allergic conjunctivitis", pointers: ["itching_seasonal"], discriminators: ["itching_seasonal", "side", "sticky_discharge", "gritty_burning"] },
    { id: "facial_palsy", name: "Facial palsy with lid pump failure or exposure", pointers: ["facial_weakness"], discriminators: ["facial_weakness", "lid_sagging", "gritty_burning", "onset_mode"] },
    { id: "canalicular_injury", name: "Canalicular injury", pointers: ["inner_corner_injury"], discriminators: ["inner_corner_injury", "overflow_cheek", "onset"] },
    { id: "congenital_glaucoma", name: "Congenital glaucoma", pointers: ["infant_large_cloudy_eye"], discriminators: ["infant_large_cloudy_eye", "since_birth_sticky", "sticky_discharge", "side"] },
    { id: "lacrimal_sac_growth", name: "Lacrimal sac growth", pointers: ["blood_tears_hard_mass"], discriminators: ["blood_tears_hard_mass", "inner_corner_swelling", "regurgitation_on_pressure", "nose_sinus", "progression"] },
    { id: "keratitis_uveitis", name: "Keratitis or uveitis", pointers: ["red_painful_eye"], discriminators: ["red_painful_eye", "foreign_body", "lashes_rubbing", "onset_mode"] },
  ],
  output: {
    durationSlot: "duration",
    hpiOrder: ["onset", "duration", "onset_mode", "side", "pattern", "overflow_cheek", "since_birth_sticky", "sticky_discharge", "regurgitation_on_pressure", "inner_corner_swelling", "gritty_burning", "lashes_rubbing", "lid_sagging", "foreign_body", "progression", "prior_treatment", "prior_investigations"],
  },
};
