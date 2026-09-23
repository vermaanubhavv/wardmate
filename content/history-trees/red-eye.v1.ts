import type { HistoryTree } from "@/lib/history-check/types";
import { commonHpi, HUTCHISONS, MACLEODS, PARSONS_EYE, val, yn } from "@/content/history-trees/_helpers";

/**
 * RED EYE — v1.0.0. CLINICAL CONTENT: PENDING CLINICIAN REVIEW.
 * Eye ward / casualty, north India. Most red eyes are conjunctivitis; the history exists to
 * pull out the four that threaten sight — angle closure, keratitis, uveitis and penetrating
 * injury — and the one question that separates them is whether vision has dropped.
 * Differentials: viral or bacterial conjunctivitis, allergic conjunctivitis, subconjunctival
 * haemorrhage, corneal ulcer or foreign body, acute angle closure glaucoma, anterior uveitis,
 * scleritis or episcleritis, penetrating injury or chemical burn, dry eye.
 */
export const redEyeV1: HistoryTree = {
  id: "red_eye",
  version: "1.0.0",
  complaint: "Red eye",
  triggers: ["red eye", "redness of eye", "eye redness", "conjunctivitis", "pink eye", "watering eye", "eye pain", "eye discharge", "aankh lal", "sore eye", "irritation in eye"],
  setting: "Eye ward and casualty, north India",
  reviewStatus: "pending_clinician_review",
  reviewedBy: null,
  references: [PARSONS_EYE, MACLEODS, HUTCHISONS],
  slots: [
    ...commonHpi("redness of the eye"),
    val("hpi", "side", "Which eye", "Which eye is red, or are both, and did the second eye follow the first?", ["right eye", "left eye", "both eyes", "one eye", "unilateral", "bilateral", "second eye later", "started in one"]),
    yn("hpi", "vision_change", "Change in vision", "Has vision in that eye changed — blurred, dimmed, or haloes around lights?", ["blurred", "blurring", "dim", "decreased vision", "vision normal", "haloes", "rainbow", "cannot see", "misty"], { teach: "A red eye with dropping vision separates the sight-threatening causes from the surface ones, and vision must be asked for each eye separately." }),
    yn("hpi", "pain", "Pain in the eye", "Is there pain in the eye itself, deep aching pain, or only grittiness and irritation?", ["pain", "deep pain", "aching", "severe pain", "gritty", "sandy", "irritation", "foreign body sensation", "no pain", "burning"]),
    val("hpi", "discharge_character", "Discharge and watering", "What comes out of the eye — watering, sticky yellow discharge, or lids stuck together on waking?", ["watering", "watery", "sticky", "yellow", "purulent", "mucus", "lids stuck", "on waking", "no discharge", "ropy"]),
    yn("associated", "photophobia", "Discomfort in light", "Is bright light uncomfortable, and does the eye water in sunlight?", ["photophobia", "light", "bright light", "sunlight", "cannot open in light", "watering in light", "closing eyes"]),
    yn("associated", "itching", "Itching", "Is the eye itchy, and does it come on in a particular season or dusty place?", ["itching", "itchy", "rubbing", "seasonal", "dust", "allergy", "spring", "summer"]),
    yn("associated", "contact_similar_illness", "Contact with a similar red eye", "Any contact with someone with a red eye at home, school or work?", ["contact", "family", "school", "office", "similar", "spreading", "epidemic"]),
    yn("associated", "trauma_foreign_body", "Injury / something entering the eye / chemical", "Any injury to the eye, dust, metal, vegetable matter, or chemical or lime entering it?", ["injury", "trauma", "dust", "metal", "grinding", "welding", "stick", "vegetable", "paddy", "chemical", "lime", "acid", "fell in eye"], { teach: "Vegetable matter and grinding injuries are the ones that seed a corneal ulcer, and a chemical splash starts damaging before anyone is asked." }),
    yn("associated", "contact_lens_eye_drops", "Contact lenses / eye drops used", "Are contact lenses worn, and have any eye drops been used for this, including from a shop?", ["contact lens", "lenses", "eye drops", "drops", "shop", "chemist", "steroid drops", "someone else drops", "home remedy", "breast milk"], { teach: "Contact lens wear and drops taken without a prescription change both the organism and the risk to the cornea." }),
    yn("associated", "joint_back_bowel_symptoms", "Joint pain / back pain / loose stools / skin patches", "Any joint pain, low back pain with morning stiffness, long-standing loose stools, or pale skin patches?", ["joint pain", "back pain", "morning stiffness", "loose stools", "diarrhoea", "skin patches", "psoriasis", "arthritis", "ulcers"], { tier: "detailed", teach: "Uveitis often travels with joint, bowel or skin disease, and the eye may be the first place it shows." }),
    yn("associated", "recurrence", "Previous episodes in the same eye", "Has the same eye been red like this before, and how often?", ["previous", "recurrent", "same eye", "repeated", "first time", "every few months", "before"], { tier: "detailed" }),
    // Red flags
    yn("red_flag", "severe_pain_vomiting_haloes", "Severe pain with vomiting and haloes", "Any severe eye pain with headache, vomiting, and coloured haloes around lights?", ["severe pain", "headache", "vomiting", "haloes", "rainbow", "coloured rings", "nausea", "hard eye", "sudden"], { teach: "Severe eye pain with vomiting and haloes raises a sudden rise in pressure inside the eye, where sight is lost in hours." }),
    yn("red_flag", "vision_drop", "Vision dropped in the red eye", "Has vision in the red eye dropped, and can the patient count fingers with the other eye closed?", ["vision dropped", "decreased vision", "cannot count fingers", "blurred badly", "only light", "vision lost", "worse than before"], { teach: "Vision dropping in a red eye moves it out of the conjunctivitis group entirely." }),
    yn("red_flag", "white_spot_cornea", "White spot on the black of the eye", "Is there a white or grey spot on the black part of the eye?", ["white spot", "grey spot", "opacity", "on the black", "cornea", "ulcer", "patch", "spreading"], { teach: "A white spot on the cornea marks an ulcer, which scars the visual axis when missed." }),
    yn("red_flag", "penetrating_injury", "Injury with something sharp / fluid coming out", "Was the eye struck by something sharp or fast moving, and did any fluid or dark tissue come out?", ["sharp", "nail", "knife", "wire", "high speed", "hammering", "fluid came out", "dark tissue", "pupil distorted", "soft eye"], { teach: "A sharp or high-speed injury with fluid escaping raises an open globe, where pressing on the eye causes further loss." }),
    yn("red_flag", "chemical_exposure", "Chemical or lime in the eye", "Did any chemical, lime, acid or alkali enter the eye, and was it washed with water?", ["chemical", "lime", "chuna", "acid", "alkali", "detergent", "washed", "not washed", "immediately", "burning"], { teach: "A chemical splash keeps damaging the surface until washed out, so the time of the splash matters more than any other history." }),
    yn("red_flag", "systemic_unwell_rash", "Fever, rash or facial blisters", "Any fever, rash, or painful blisters on the forehead, nose or around the eye?", ["fever", "rash", "blisters", "vesicles", "forehead", "tip of nose", "shingles", "herpes", "one side of face"], { teach: "Blisters on the forehead or the tip of the nose with a red eye raise involvement of the nerve that also supplies the cornea." }),
  ],
  differentials: [
    { id: "infective_conjunctivitis", name: "Viral or bacterial conjunctivitis", pointers: ["discharge_character", "contact_similar_illness", "side"], discriminators: ["discharge_character", "contact_similar_illness", "vision_change", "pain", "side"] },
    { id: "allergic_conjunctivitis", name: "Allergic conjunctivitis", pointers: ["itching", "recurrence"], discriminators: ["itching", "recurrence", "discharge_character", "vision_change", "contact_similar_illness"] },
    { id: "subconjunctival_haemorrhage", name: "Subconjunctival haemorrhage", pointers: ["onset_mode", "pain"], discriminators: ["onset_mode", "pain", "vision_change", "discharge_character", "trauma_foreign_body"] },
    { id: "keratitis", name: "Corneal ulcer or foreign body", pointers: ["white_spot_cornea", "trauma_foreign_body", "contact_lens_eye_drops"], discriminators: ["white_spot_cornea", "trauma_foreign_body", "contact_lens_eye_drops", "pain", "photophobia", "vision_drop"] },
    { id: "angle_closure", name: "Acute angle closure glaucoma", pointers: ["severe_pain_vomiting_haloes", "vision_change"], discriminators: ["severe_pain_vomiting_haloes", "vision_change", "onset_mode", "pain", "side"] },
    { id: "uveitis", name: "Anterior uveitis", pointers: ["photophobia", "joint_back_bowel_symptoms", "recurrence"], discriminators: ["photophobia", "joint_back_bowel_symptoms", "recurrence", "pain", "vision_drop", "discharge_character"] },
    { id: "scleritis", name: "Scleritis or episcleritis", pointers: ["pain", "joint_back_bowel_symptoms"], discriminators: ["pain", "joint_back_bowel_symptoms", "recurrence", "vision_change", "discharge_character"] },
    { id: "trauma_chemical", name: "Penetrating injury or chemical burn", pointers: ["penetrating_injury", "chemical_exposure", "trauma_foreign_body"], discriminators: ["penetrating_injury", "chemical_exposure", "trauma_foreign_body", "vision_drop", "onset"] },
    { id: "herpes_zoster", name: "Herpes zoster ophthalmicus", pointers: ["systemic_unwell_rash", "pain"], discriminators: ["systemic_unwell_rash", "pain", "side", "vision_change", "photophobia"] },
  ],
  output: {
    durationSlot: "duration",
    hpiOrder: ["onset", "duration", "side", "vision_change", "pain", "discharge_character", "onset_mode", "progression", "prior_treatment", "prior_investigations"],
  },
};
