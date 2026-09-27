import type { HistoryTree } from "@/lib/history-check/types";
import { ATLS, commonHpi, HUTCHISONS, MACLEODS, PARSONS_EYE, val, yn } from "@/content/history-trees/_helpers";

/**
 * INJURY TO THE EYE — v1.0.0. CLINICAL CONTENT: PENDING CLINICIAN REVIEW.
 * Eye ward and casualty, north India. The mechanism carries most of this history: a cricket
 * ball or gulli-danda blow, a firecracker at Diwali, a grinding or hammering job without
 * goggles, or a lime or chemical splash. The open globe, the metal fragment inside the eye and
 * the alkali splash are the ones where minutes and a missed question cost the eye.
 * Differentials: hyphaema, orbital floor (blowout) fracture, commotio retinae or retinal
 * detachment, open globe injury, intraocular foreign body, chemical burn, corneal abrasion or
 * superficial foreign body, lid laceration including canalicular injury, retrobulbar
 * haemorrhage.
 */
export const eyeInjuryV1: HistoryTree = {
  id: "eye_injury",
  version: "1.0.0",
  complaint: "Injury to the eye",
  triggers: ["eye injury", "injury to eye", "injury to the eye", "eye trauma", "trauma to eye", "hit in the eye", "ball hit eye", "black eye", "foreign body in eye", "something in eye", "lime in eye", "chemical in eye", "cracker injury", "firecracker injury", "aankh me chot", "aankh me kuch gira"],
  setting: "Eye ward and casualty, north India",
  reviewStatus: "pending_clinician_review",
  reviewedBy: null,
  references: [PARSONS_EYE, ATLS, MACLEODS, HUTCHISONS],
  slots: [
    ...commonHpi("eye injury"),
    val("hpi", "side", "Which eye", "Which eye was injured, or were both, and what was the vision in each eye before the injury?", ["right eye", "left eye", "both eyes", "one eye", "vision before", "lazy eye", "glasses", "normal before"]),
    val("hpi", "mechanism", "How the injury happened", "How did the injury happen — a ball, fist or stick, something sharp, a firecracker, a splash, or something flying into the eye?", ["cricket ball", "ball", "fist", "stick", "gulli danda", "gilli danda", "firecracker", "cracker", "patakha", "knife", "glass", "wire", "nail", "thorn", "splash", "flew into", "fall", "road traffic"], { teach: "A blunt blow, a sharp or high-speed object and a splash injure the eye in different ways, and each opens a different set of questions." }),
    yn("hpi", "pain_foreign_body_sensation", "Pain / watering / something in the eye", "Is there pain, watering, discomfort in light, or a feeling that something is still in the eye?", ["pain", "watering", "light", "photophobia", "gritty", "something in eye", "foreign body sensation", "cannot open", "rubbing"]),
    yn("associated", "double_vision", "Double vision on looking up or down", "Any double vision since the injury, especially on looking up or down?", ["double vision", "diplopia", "looking up", "looking down", "two images", "cannot look up"], { teach: "Doubling on looking up or down after a blunt blow raises a muscle caught in a fracture of the orbital floor." }),
    yn("associated", "cheek_numbness", "Numb cheek or upper lip", "Any numbness of the cheek, side of the nose, upper lip or upper teeth on the injured side?", ["numb cheek", "numbness", "upper lip", "upper teeth", "side of nose", "tingling", "no sensation"], { tier: "detailed" }),
    yn("associated", "blood_in_eye", "Blood seen in the eye / reddish vision", "Was blood seen in front of the coloured part of the eye, or is the vision reddish or hazy?", ["blood in eye", "blood level", "red vision", "reddish", "hazy", "blood inside", "hyphaema", "bleeding"]),
    yn("associated", "floaters_curtain", "Floaters / flashes / curtain", "Any new floaters, flashes of light, or a curtain over part of the vision since the injury?", ["floaters", "flashes", "curtain", "shadow", "black spots", "cobwebs"], { tier: "detailed", teach: "A blunt blow can tear the retina, and the curtain or shower of floaters may come days to weeks after the injury." }),
    yn("associated", "lid_cut", "Cut on the eyelid", "Is there a cut on the eyelid, especially near the inner corner or through the lid margin?", ["cut", "laceration", "torn lid", "lid margin", "inner corner", "bleeding from lid", "stitches"], { teach: "A cut near the inner corner can divide the tear drainage channel, which is missed when only the skin is looked at." }),
    val("associated", "first_aid", "What was done immediately", "What was done straight after the injury — was the eye washed with water, rubbed, pressed, or had anything put in it?", ["washed", "water", "not washed", "rubbed", "pressed", "ghee", "surma", "kajal", "home remedy", "drops", "tried to remove", "nothing"]),
    val("exposure", "activity_protection", "Activity and eye protection", "What was the patient doing at the time — work, sport, festival or play — and were goggles or protective glasses worn?", ["work", "factory", "welding", "grinding", "construction", "cricket", "playing", "diwali", "festival", "goggles", "protective glasses", "no protection"]),
    yn("exposure", "tetanus_status", "Tetanus immunisation", "Is tetanus immunisation up to date?", ["tetanus", "tt", "injection", "immunised", "not immunised", "unknown", "up to date"], { tier: "detailed" }),
    // Red flags
    yn("red_flag", "vision_drop", "Vision dropped in the injured eye", "Has vision in the injured eye dropped, and can the patient see light, fingers or faces with the other eye covered?", ["vision dropped", "cannot see", "blurred", "only light", "no light", "counting fingers", "faces", "vision normal", "dark"], { teach: "The vision after the injury is the single strongest pointer to how badly the eye is hurt, and must be asked for each eye separately." }),
    yn("red_flag", "penetrating_features", "Sharp object / fluid or tissue came out / pupil changed", "Was the eye struck by something sharp or fast moving, and did fluid, jelly or dark tissue come out, or has the pupil changed shape?", ["sharp", "knife", "glass", "wire", "nail", "fluid came out", "jelly", "dark tissue", "pupil changed", "pear shaped", "soft eye"], { teach: "Fluid or dark tissue escaping after a sharp or high-speed injury raises an open globe, where any pressure on the eye causes further loss." }),
    yn("red_flag", "high_velocity_metal", "Hammering, grinding, drilling or explosion", "Was the patient hammering metal on metal, grinding, drilling, or near a blast or firecracker when something flew into the eye?", ["hammering", "metal on metal", "chisel", "grinding", "drilling", "blast", "explosion", "firecracker", "cracker", "flew into", "tiny wound"], { teach: "A fragment thrown off by hammering or a blast can enter the eye through a wound too small to notice." }),
    yn("red_flag", "chemical_splash", "Chemical, lime or cement in the eye", "Did any chemical, lime, cement, acid, battery fluid or cleaning liquid enter the eye, and how soon was it washed?", ["chemical", "lime", "chuna", "cement", "acid", "alkali", "battery", "toilet cleaner", "detergent", "splash", "washed", "not washed"], { teach: "An alkali such as lime or cement keeps penetrating until washed out, so the time to washing matters more than any other detail." }),
    yn("red_flag", "retrobulbar_pressure", "Tense bulging eye / severe pain / vomiting", "Since the injury, is the eye bulging and tense, with severe pain, vomiting, or vision fading?", ["bulging", "pushed forward", "tense", "hard eye", "cannot open lids", "severe pain", "vomiting", "vision fading", "getting worse"], { teach: "Blood building up behind the eye after a blow can compress the optic nerve within hours." }),
    yn("red_flag", "head_other_injury", "Head injury / loss of consciousness / other injuries", "Was there loss of consciousness, vomiting, a head injury, or injury elsewhere in the body?", ["loss of consciousness", "unconscious", "vomiting", "head injury", "other injuries", "road traffic", "fall", "bleeding from nose", "chest", "limb"], { teach: "An eye injury may be the most visible part of a larger trauma, and life-threatening injuries come before the eye." }),
  ],
  differentials: [
    { id: "hyphaema", name: "Hyphaema", pointers: ["blood_in_eye", "mechanism"], discriminators: ["blood_in_eye", "vision_drop", "retrobulbar_pressure", "mechanism", "pain_foreign_body_sensation"] },
    { id: "orbital_fracture", name: "Orbital floor (blowout) fracture", pointers: ["double_vision", "cheek_numbness"], discriminators: ["double_vision", "cheek_numbness", "mechanism", "head_other_injury", "vision_drop"] },
    { id: "posterior_segment", name: "Commotio retinae or retinal detachment", pointers: ["floaters_curtain", "vision_drop"], discriminators: ["floaters_curtain", "vision_drop", "mechanism", "blood_in_eye"] },
    { id: "open_globe", name: "Open globe injury", pointers: ["penetrating_features", "vision_drop"], discriminators: ["penetrating_features", "vision_drop", "mechanism", "high_velocity_metal", "first_aid"] },
    { id: "iofb", name: "Intraocular foreign body", pointers: ["high_velocity_metal", "activity_protection"], discriminators: ["high_velocity_metal", "activity_protection", "vision_drop", "penetrating_features", "pain_foreign_body_sensation"] },
    { id: "chemical_injury", name: "Chemical burn of the eye", pointers: ["chemical_splash", "first_aid"], discriminators: ["chemical_splash", "first_aid", "vision_drop", "pain_foreign_body_sensation", "side"] },
    { id: "abrasion_superficial_fb", name: "Corneal abrasion or superficial foreign body", pointers: ["pain_foreign_body_sensation", "mechanism"], discriminators: ["pain_foreign_body_sensation", "vision_drop", "high_velocity_metal", "first_aid", "activity_protection"] },
    { id: "lid_laceration", name: "Lid laceration, including canalicular injury", pointers: ["lid_cut"], discriminators: ["lid_cut", "mechanism", "penetrating_features", "tetanus_status"] },
    { id: "retrobulbar_haemorrhage", name: "Retrobulbar haemorrhage", pointers: ["retrobulbar_pressure"], discriminators: ["retrobulbar_pressure", "vision_drop", "mechanism", "double_vision"] },
  ],
  output: {
    durationSlot: "duration",
    hpiOrder: ["onset", "duration", "side", "mechanism", "activity_protection", "first_aid", "pain_foreign_body_sensation", "onset_mode", "progression", "prior_treatment", "prior_investigations"],
  },
};
