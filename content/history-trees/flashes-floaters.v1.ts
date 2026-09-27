import type { HistoryTree } from "@/lib/history-check/types";
import { commonHpi, HUTCHISONS, MACLEODS, PARSONS_EYE, val, yn } from "@/content/history-trees/_helpers";

/**
 * FLASHES OF LIGHT / FLOATERS — v1.0.0. CLINICAL CONTENT: PENDING CLINICIAN REVIEW.
 * Eye ward and OPD, north India. Most new floaters come from the vitreous peeling away from
 * the retina with age; the history exists to find the few where it has torn the retina on
 * the way, and the retina is now separating. A sudden shower, a curtain, and myopia or past
 * eye surgery raise that; bilateral zig-zags with a headache point away from the eye.
 * Differentials: posterior vitreous detachment, retinal tear, rhegmatogenous retinal
 * detachment, vitreous haemorrhage (diabetic retinopathy, retinal vein occlusion, trauma),
 * posterior uveitis / vitritis, migraine aura.
 */
export const flashesFloatersV1: HistoryTree = {
  id: "flashes_floaters",
  version: "1.0.0",
  complaint: "Flashes of light / floaters",
  triggers: ["flashes", "flashes of light", "flashing lights", "photopsia", "sparks in eye", "floaters in eye", "cobwebs", "spots in vision", "black dots", "flies in front of eye", "chamak", "aankh me chamak", "aankh ke aage machhar", "aankh ke aage kale dhabbe"],
  setting: "Eye ward and OPD, north India",
  reviewStatus: "pending_clinician_review",
  reviewedBy: null,
  references: [PARSONS_EYE, MACLEODS, HUTCHISONS],
  slots: [
    ...commonHpi("flashes or floaters"),
    val("hpi", "side", "Which eye", "Which eye is affected, or are both, and was each eye checked separately by covering the other?", ["right eye", "left eye", "both eyes", "one eye", "checked separately", "covered", "unilateral", "bilateral"], { teach: "Flashes seen in one eye only point to the eye; the same flashes seen with either eye covered point behind it." }),
    val("hpi", "floater_description", "What the floaters look like", "What do the floaters look like — a single ring, cobwebs, dots, threads, or a red or smoky haze — and how many?", ["ring", "single", "cobweb", "cobwebs", "dots", "threads", "strands", "fly", "mosquito", "haze", "smoky", "red", "many", "few"], { teach: "A single ring or cobweb is typical of the vitreous peeling away; a haze or red tint raises blood in the vitreous." }),
    val("hpi", "flash_description", "What the flashes look like", "Where in the vision are the flashes, how long does each last, and are they brought on by moving the eye or seen in the dark?", ["corner of eye", "side of vision", "seconds", "brief", "on moving eye", "eye movement", "in the dark", "at night", "lightning", "arc", "streak"], { teach: "Brief arcs at the edge of vision, brought on by eye movement and seen in the dark, come from traction on the retina." }),
    yn("hpi", "zigzag_with_headache", "Zig-zag lights in both eyes with headache", "Are the lights a shimmering zig-zag seen in both eyes, spreading over 15 to 30 minutes, then followed by headache?", ["zig zag", "zigzag", "shimmering", "spreading", "both eyes", "headache after", "migraine", "twenty minutes", "half an hour", "fortification"], { teach: "A shimmering zig-zag that builds over minutes in both eyes and then clears, often before a headache, points to the brain rather than the retina." }),
    yn("hpi", "blurred_vision", "Blurring of vision", "Is the vision itself blurred or reduced, or only disturbed by the spots and lights?", ["blurred", "blurring", "hazy", "reduced vision", "cannot read", "clear vision", "vision normal", "misty"]),
    yn("hpi", "pain_redness", "Pain, redness or light sensitivity", "Is the eye painful, red or sensitive to light?", ["pain", "painful", "red", "redness", "photophobia", "light sensitivity", "watering", "painless", "white eye"], { teach: "Floaters with a painful red eye raise inflammation inside the eye rather than a mechanical cause." }),
    yn("associated", "myopia", "Short sight (minus glasses)", "Does the patient wear glasses for distance, and are they strong minus lenses?", ["short sight", "myopia", "myopic", "minus", "thick glasses", "high power", "spectacles", "glasses for distance", "contact lens"], { teach: "A highly short-sighted eye is longer and its retina thinner, so tears and detachment are commoner." }),
    yn("associated", "past_eye_surgery", "Previous cataract surgery, laser or other eye surgery", "Has the eye had cataract surgery, a laser after cataract surgery, or any other eye operation, and when?", ["cataract surgery", "operated", "lens implant", "iol", "yag", "laser", "capsulotomy", "retina surgery", "injection in eye", "years ago", "months ago"], { teach: "Cataract surgery, and the laser that sometimes follows it, raises the chance of the retina tearing in later years." }),
    yn("associated", "eye_trauma", "Injury to the eye or head", "Was there a recent blow to the eye or head, including a ball, a fist or a fall?", ["injury", "blow", "hit", "ball", "fist", "fall", "trauma", "cricket ball", "road traffic", "head injury"]),
    yn("associated", "diabetes_hypertension", "Diabetes / high blood pressure and their control", "Is the patient diabetic or hypertensive, for how many years, and when was the last retina check?", ["diabetes", "diabetic", "sugar", "hypertension", "high bp", "blood pressure", "uncontrolled", "insulin", "fundus", "retina check", "laser"], { teach: "Long-standing diabetes or high blood pressure raises bleeding into the vitreous from new or blocked retinal vessels." }),
    yn("associated", "inflammatory_infective_history", "TB, joint pain, skin rash or past eye inflammation", "Any history of tuberculosis, joint or back pain, skin rash, mouth ulcers, or past episodes of red painful eye?", ["tuberculosis", "tb", "joint pain", "back pain", "rash", "mouth ulcers", "uveitis", "previous red eye", "toxoplasma", "sarcoid"], { tier: "detailed", teach: "Floaters from inflammation inside the eye often come with a systemic disease that the eye history alone will not reveal." }),
    yn("associated", "family_history_detachment", "Detachment in the other eye or family", "Has the other eye, or a blood relative, had a retinal detachment?", ["other eye", "fellow eye", "family", "blood relative", "retinal detachment", "retina surgery", "brother", "sister", "parent"], { tier: "detailed" }),
    // Red flags
    yn("red_flag", "sudden_shower", "Sudden shower of new floaters", "Did a sudden shower of many new floaters or black dots appear at once?", ["sudden", "shower", "many", "hundreds", "burst", "suddenly", "new floaters", "pepper", "soot", "black dots"], { teach: "A sudden shower of dots, rather than one or two floaters, raises blood released from a torn retinal vessel." }),
    yn("red_flag", "shadow_spreading", "Shadow or veil spreading across the vision", "Is there a dark shadow or veil at the edge of the vision that is growing towards the centre?", ["shadow", "veil", "dark area", "growing", "spreading", "from above", "from below", "from the side", "blocked vision", "part missing"], { teach: "A shadow spreading from the edge raises the retina separating, and the centre of vision is lost once it arrives there." }),
    yn("red_flag", "central_vision_loss", "Loss of central or reading vision", "Has the centre of the vision become blurred or distorted, so that straight lines look wavy or reading is lost?", ["central vision", "centre", "reading", "cannot read", "distorted", "wavy lines", "straight lines bent", "faces", "sudden drop"], { teach: "Once central vision is involved the detachment may have reached the macula, and the time since then is worth recording." }),
    yn("red_flag", "severe_pain_after_surgery", "Painful red eye after recent eye surgery or injection", "In the weeks after eye surgery or an injection into the eye, has the eye become painful and red with falling vision?", ["after surgery", "after injection", "recent surgery", "painful", "red", "discharge", "sticky", "vision falling", "days after"], { teach: "Floaters with pain and falling vision soon after surgery or an injection raise infection inside the eye." }),
  ],
  differentials: [
    { id: "pvd", name: "Posterior vitreous detachment", pointers: ["floater_description", "flash_description"], discriminators: ["floater_description", "flash_description", "sudden_shower", "shadow_spreading", "myopia"] },
    { id: "retinal_tear", name: "Retinal tear", pointers: ["sudden_shower", "flash_description", "myopia", "past_eye_surgery"], discriminators: ["sudden_shower", "flash_description", "shadow_spreading", "myopia", "past_eye_surgery", "eye_trauma"] },
    { id: "retinal_detachment", name: "Rhegmatogenous retinal detachment", pointers: ["shadow_spreading", "central_vision_loss", "sudden_shower"], discriminators: ["shadow_spreading", "central_vision_loss", "sudden_shower", "myopia", "past_eye_surgery", "family_history_detachment"] },
    { id: "vitreous_haemorrhage", name: "Vitreous haemorrhage (diabetic retinopathy, retinal vein occlusion, trauma)", pointers: ["diabetes_hypertension", "floater_description", "eye_trauma"], discriminators: ["diabetes_hypertension", "floater_description", "blurred_vision", "eye_trauma", "flash_description"] },
    { id: "posterior_uveitis", name: "Posterior uveitis / vitritis", pointers: ["pain_redness", "inflammatory_infective_history"], discriminators: ["pain_redness", "inflammatory_infective_history", "side", "blurred_vision", "severe_pain_after_surgery"] },
    { id: "migraine_aura", name: "Migraine aura", pointers: ["zigzag_with_headache"], discriminators: ["zigzag_with_headache", "side", "flash_description", "floater_description"] },
  ],
  output: {
    durationSlot: "duration",
    hpiOrder: ["onset", "duration", "onset_mode", "side", "floater_description", "flash_description", "zigzag_with_headache", "blurred_vision", "pain_redness", "progression", "prior_treatment", "prior_investigations"],
  },
};
