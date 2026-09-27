import type { HistoryTree } from "@/lib/history-check/types";
import { ATLS, BAILEY_LOVE, commonHpi, GRABB_SMITH, HUTCHISONS, IMMUNOCOMPROMISE, MACLEODS, surgicalBackground, val, yn } from "@/content/history-trees/_helpers";

/**
 * HAND INJURY — v1.0.0. CLINICAL CONTENT: REVIEWED (Dr Anubhav Verma).
 * Burns and plastic surgery unit, north India, where fodder-cutting machines (chaff cutter,
 * toka machine), threshers, glass and knife cuts, door and crush injuries, and fist-to-mouth
 * wounds make up most hand trauma. Which hand, which hand writes, and what the patient does for
 * a living shape every decision that follows, so they are asked first, alongside the exact time
 * and what did the cutting. Differentials: flexor tendon injury, extensor tendon injury,
 * digital nerve injury, fracture or dislocation, fingertip injury or amputation, crush and
 * degloving injury, high-pressure injection injury, fight bite, machine injury, hand infection
 * (paronychia, pulp space infection, flexor sheath infection), compartment syndrome of the hand.
 */
export const handInjuryV1: HistoryTree = {
  id: "hand_injury",
  version: "1.0.0",
  complaint: "Hand injury",
  triggers: ["hand injury", "injury to hand", "finger injury", "cut finger", "finger cut", "cut on hand", "hand cut", "crush hand", "crushed finger", "finger amputation", "fingertip injury", "tendon injury", "tendon cut", "chaff cutter", "toka machine", "thresher injury", "machine injury hand", "degloving hand", "fight bite", "injection injury", "paronychia", "felon", "whitlow", "infected finger", "ungli kat gayi", "haath kat gaya", "ungli pak gayi"],
  setting: "Burns and plastic surgery unit, north India",
  reviewStatus: "reviewed",
  reviewedBy: "Dr Anubhav Verma",
  references: [GRABB_SMITH, BAILEY_LOVE, MACLEODS, HUTCHISONS, ATLS],
  slots: [
    ...commonHpi("hand injury"),
    val("hpi", "hand_dominance", "Which hand is dominant", "Which hand does the patient write and eat with, and is the injured hand the dominant one?", ["right handed", "left handed", "dominant", "non dominant", "writes with", "eats with", "ambidextrous"], { teach: "The dominant hand carries most of a person's work, so the same injury costs more there and the aims of repair are weighed differently." }),
    val("hpi", "occupation_hand_use", "Occupation and hand use", "What work does the patient do with the hands — farm, factory, driving, typing, a musical instrument, or fine work?", ["farmer", "labourer", "factory", "driver", "typing", "computer", "tailor", "carpenter", "mason", "musician", "student", "housewife", "fine work", "occupation"], { teach: "The work the hand must return to decides which movements matter most, and how long the patient can afford to be away from it." }),
    val("hpi", "time_of_injury_hand", "Exact time of the injury", "At what time did the injury happen, and how many hours have passed since?", ["time", "hours ago", "this morning", "last night", "o'clock", "minutes ago", "am", "pm"], { numeric: true, teach: "The hours since injury set the contamination risk of the wound and the window in which an amputated part can still be used." }),
    val("hpi", "mechanism_hand", "What caused the injury", "What caused the injury — glass, knife, a fodder-cutting or threshing machine, a door, a heavy object, a fall, a punch, or a bite?", ["glass", "knife", "blade", "sickle", "chaff cutter", "toka", "thresher", "machine", "door", "heavy object", "crush", "punch", "teeth", "bite", "fall", "saw", "grinder"]),
    val("hpi", "hand_position_at_injury", "Position of the hand at injury", "Was the fist clenched or the fingers straight when the injury happened?", ["clenched", "fist", "fingers straight", "gripping", "open hand", "fingers bent", "holding"], { tier: "detailed", teach: "A tendon cut with the fingers bent retracts away from the skin wound, so the cut in the tendon lies at a different level from the cut in the skin." }),
    val("hpi", "site_hand", "Which fingers and which surface", "Which fingers or which part of the hand are injured, and is it the palm side or the back?", ["thumb", "index", "middle", "ring", "little finger", "palm", "back of hand", "dorsum", "fingertip", "nail", "wrist", "web space", "knuckle"]),
    yn("hpi", "cannot_bend_finger", "Unable to bend a finger", "Is the patient unable to bend any finger or the thumb, fully or at one joint?", ["cannot bend", "unable to bend", "finger straight", "cannot make a fist", "cannot flex", "tip does not bend", "weak grip"], { teach: "A finger that lies straight while the others curl asks whether a flexor tendon has been divided, even when the skin wound looks small." }),
    yn("hpi", "cannot_straighten_finger", "Unable to straighten a finger", "Is the patient unable to straighten any finger or the thumb, or does a fingertip droop?", ["cannot straighten", "unable to straighten", "drooping", "tip droops", "mallet", "cannot extend", "finger stays bent"]),
    yn("hpi", "numb_finger", "Numbness of a finger", "Is any finger or side of a finger numb, or does it feel different from the others?", ["numb", "numbness", "no sensation", "cannot feel", "tingling", "feels different", "side of finger"], { teach: "Numbness along one side of a finger beyond a cut asks whether the digital nerve on that side has been divided with the skin." }),
    yn("hpi", "deformity_hand", "Deformity or rotation", "Does any finger look bent, crooked, shortened, or cross over another when the fist is made?", ["deformity", "crooked", "bent", "shortened", "scissoring", "crosses over", "rotated", "dislocated", "out of place", "swollen joint"]),
    yn("hpi", "tissue_loss_hand", "Part of a finger or skin lost", "Has any part of a finger, the fingertip, the nail, or a sheet of skin been cut off or torn away, and was the part brought along?", ["cut off", "amputated", "tip lost", "nail lost", "skin torn off", "degloved", "part brought", "in a bag", "on ice", "part lost", "hanging"], { teach: "Whether the amputated part was kept, and how, is asked at once because it decides whether the part can be used at all." }),
    yn("associated", "bleeding_hand", "Bleeding", "Was the bleeding spurting or steady, and how was it stopped?", ["spurting", "bleeding", "pulsatile", "steady", "soaked", "cloth tied", "tourniquet", "pressure", "stopped"]),
    yn("associated", "wound_contamination", "Dirt in the wound", "Was the wound contaminated with soil, dung, fodder, grease or machine oil?", ["soil", "mud", "dung", "gobar", "fodder", "grease", "oil", "dirty", "field", "contaminated", "clean cut"]),
    yn("associated", "infection_symptoms_hand", "Throbbing pain, swelling and pus", "Is there throbbing pain, swelling, redness or pus around a nail, in the pad of a finger, or along a finger?", ["throbbing", "swelling", "redness", "pus", "around the nail", "nail fold", "pulp", "pad of finger", "sleepless", "red streak", "fever"]),
    yn("associated", "foreign_body_hand", "Something left in the wound", "Could glass, a thorn, a splinter or a tooth fragment still be in the wound?", ["glass", "thorn", "splinter", "wood", "metal", "tooth", "something inside", "foreign body", "piece left"], { tier: "detailed" }),
    yn("associated", "previous_hand_problem", "Previous hand injury or stiffness", "Was there any previous injury, surgery, stiffness or deformity of this hand?", ["previous injury", "old injury", "operated", "stiffness", "deformity", "arthritis", "same hand"], { tier: "detailed" }),
    // Red flags
    yn("red_flag", "finger_colour_cold", "Pale, cold or blue finger", "Is any finger pale, cold, blue, or does it not pink up after pressing the nail?", ["pale", "white", "cold", "blue", "dusky", "no colour", "no blood flow", "does not pink up", "capillary refill"], { teach: "A finger that stays pale or cold beyond a cut asks whether both its arteries are divided, where the time to repair is short." }),
    yn("red_flag", "high_pressure_injection", "Injection from a spray gun or grease gun", "Was anything injected into the hand under pressure — a paint gun, grease gun, or hydraulic line?", ["paint gun", "grease gun", "spray gun", "hydraulic", "high pressure", "injected", "pin hole", "small hole", "oil injected"], { teach: "A high-pressure injection leaves a pinhole on the surface while the material tracks deep along the tendon sheaths, so a small wound understates the injury." }),
    yn("red_flag", "fight_bite", "Punch against teeth", "Did the wound over a knuckle come from punching someone in the mouth?", ["punch", "punched", "teeth", "tooth", "mouth", "knuckle", "fight", "human bite", "bite", "jhagda"], { teach: "A small wound over a knuckle from a punch to the mouth can carry mouth organisms into the joint, and the history is often not volunteered." }),
    yn("red_flag", "flexor_sheath_signs", "Swollen finger held bent, painful to straighten", "Is a whole finger swollen like a sausage, held slightly bent, and very painful to straighten?", ["whole finger swollen", "sausage", "held bent", "painful to straighten", "pain along finger", "tender along", "cannot straighten"], { teach: "A uniformly swollen finger held bent and painful on stretching raises infection inside the tendon sheath, which can destroy the tendon within days." }),
    yn("red_flag", "tense_hand_pain", "Tense hand with pain out of proportion", "Is the hand tense and swollen with pain far worse than the injury seems, and worse when the fingers are stretched?", ["tense", "tight", "very swollen", "out of proportion", "worse on stretching", "unbearable", "increasing pain", "crush"], { teach: "Pain out of proportion and worse on passive stretch after a crush asks whether pressure is building within the closed compartments of the hand." }),
    yn("red_flag", "machine_entrapment", "Hand caught in a machine", "Was the hand caught, pulled in, or trapped in a machine or roller, and for how long?", ["caught", "pulled in", "trapped", "roller", "chaff cutter", "toka", "thresher", "belt", "gear", "minutes", "freed"], { teach: "A hand pulled into rollers suffers crushing and stripping well beyond the visible wound, and the time trapped matters as much as the cut." }),
    IMMUNOCOMPROMISE,
    yn("exposure", "tetanus_status_hand", "Tetanus immunisation", "When was the last tetanus immunisation, and is it known at all?", ["tetanus", "tt", "injection", "years ago", "not known", "recent", "childhood", "not taken"]),
    yn("exposure", "smoking_hand", "Smoking", "Does the patient smoke or use tobacco, and how much?", ["smoking", "smoker", "bidi", "cigarette", "tobacco", "hookah", "non smoker"], { tier: "detailed" }),
    // A cut tendon, a lost fingertip or a machine injury usually goes to theatre the same day,
    // so the pre-operative background is asked acute.
    ...surgicalBackground({ acute: true }),
  ],
  differentials: [
    { id: "flexor_tendon", name: "Flexor tendon injury", pointers: ["cannot_bend_finger", "site_hand"], discriminators: ["cannot_bend_finger", "site_hand", "hand_position_at_injury", "mechanism_hand", "numb_finger"] },
    { id: "extensor_tendon", name: "Extensor tendon injury", pointers: ["cannot_straighten_finger"], discriminators: ["cannot_straighten_finger", "site_hand", "mechanism_hand", "deformity_hand", "fight_bite"] },
    { id: "digital_nerve", name: "Digital nerve injury", pointers: ["numb_finger"], discriminators: ["numb_finger", "site_hand", "mechanism_hand", "cannot_bend_finger", "finger_colour_cold"] },
    { id: "fracture_dislocation", name: "Fracture or dislocation", pointers: ["deformity_hand", "mechanism_hand"], discriminators: ["deformity_hand", "mechanism_hand", "site_hand", "tense_hand_pain", "previous_hand_problem"] },
    { id: "fingertip_amputation", name: "Fingertip injury or amputation", pointers: ["tissue_loss_hand"], discriminators: ["tissue_loss_hand", "site_hand", "time_of_injury_hand", "finger_colour_cold", "hand_dominance", "occupation_hand_use"] },
    { id: "crush_degloving", name: "Crush and degloving injury", pointers: ["machine_entrapment", "tissue_loss_hand", "tense_hand_pain"], discriminators: ["machine_entrapment", "tissue_loss_hand", "tense_hand_pain", "finger_colour_cold", "wound_contamination"] },
    { id: "high_pressure_injection", name: "High-pressure injection injury", pointers: ["high_pressure_injection"], discriminators: ["high_pressure_injection", "occupation_hand_use", "time_of_injury_hand", "tense_hand_pain", "site_hand"] },
    { id: "fight_bite", name: "Fight bite", pointers: ["fight_bite"], discriminators: ["fight_bite", "site_hand", "infection_symptoms_hand", "time_of_injury_hand", "cannot_straighten_finger"] },
    { id: "machine_injury", name: "Machine injury (chaff cutter, thresher)", pointers: ["machine_entrapment", "mechanism_hand"], discriminators: ["machine_entrapment", "mechanism_hand", "wound_contamination", "tissue_loss_hand", "finger_colour_cold", "tetanus_status_hand"] },
    { id: "hand_infection", name: "Hand infection (paronychia, pulp space, flexor sheath)", pointers: ["infection_symptoms_hand", "flexor_sheath_signs"], discriminators: ["infection_symptoms_hand", "flexor_sheath_signs", "foreign_body_hand", "fight_bite", "immunocompromise", "site_hand"] },
    { id: "compartment_syndrome_hand", name: "Compartment syndrome of the hand", pointers: ["tense_hand_pain", "machine_entrapment"], discriminators: ["tense_hand_pain", "machine_entrapment", "mechanism_hand", "high_pressure_injection", "finger_colour_cold"] },
  ],
  output: {
    durationSlot: "duration",
    hpiOrder: ["onset", "time_of_injury_hand", "duration", "hand_dominance", "occupation_hand_use", "mechanism_hand", "hand_position_at_injury", "site_hand", "cannot_bend_finger", "cannot_straighten_finger", "numb_finger", "tissue_loss_hand", "bleeding_hand", "prior_treatment", "prior_investigations"],
  },
};
