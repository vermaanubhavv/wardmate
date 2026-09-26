import type { HistoryTree } from "@/lib/history-check/types";
import { commonHpi, HUTCHISONS, MACLEODS, PARSONS_EYE, val, yn } from "@/content/history-trees/_helpers";

/**
 * LOSS OF VISION — v1.0.0. CLINICAL CONTENT: PENDING CLINICIAN REVIEW.
 * Eye ward / casualty, north India. Three questions carry most of this history: one eye or
 * both, sudden or gradual, painful or painless. The gradual painless losses are common and
 * treatable late; the sudden ones are counted in hours.
 * Differentials: cataract, refractive error, diabetic retinopathy, chronic glaucoma,
 * retinal detachment, vitreous haemorrhage, central retinal artery or vein occlusion,
 * optic neuritis, giant cell arteritis, stroke affecting the visual pathway, acute angle
 * closure, endophthalmitis after surgery.
 */
export const visionLossV1: HistoryTree = {
  id: "vision_loss",
  version: "1.0.0",
  complaint: "Loss of vision",
  triggers: ["loss of vision", "vision loss", "cannot see", "blurred vision", "blurring of vision", "decreased vision", "dimness of vision", "blindness", "sudden loss of vision", "black out", "floaters", "dikhai nahi deta", "curtain over eye"],
  setting: "Eye ward and casualty, north India",
  reviewStatus: "pending_clinician_review",
  reviewedBy: null,
  references: [PARSONS_EYE, MACLEODS, HUTCHISONS],
  slots: [
    ...commonHpi("loss of vision"),
    val("hpi", "side", "Which eye", "Which eye is affected, or are both, and was each eye checked separately by covering the other?", ["right eye", "left eye", "both eyes", "one eye", "checked separately", "covered", "not checked", "unilateral", "bilateral"]),
    val("hpi", "severity", "How much vision is left", "How much vision remains — reading, recognising faces, counting fingers, or only light?", ["reading", "faces", "counting fingers", "hand movements", "only light", "no light", "near normal", "cannot read"]),
    val("hpi", "field_pattern", "Which part of the vision is lost", "Which part of the vision has gone — the centre, one side, a curtain from above or below, or all of it?", ["centre", "central", "one side", "half", "curtain", "from above", "from below", "whole", "patchy", "peripheral"], { teach: "Which part of the field is lost points to how far back along the visual pathway the problem sits." }),
    yn("hpi", "pain", "Pain with the loss", "Is the loss painful, and is there pain on moving the eye?", ["painful", "painless", "pain on moving", "deep ache", "no pain", "headache", "eye pain"]),
    yn("hpi", "transient_episodes", "Earlier brief episodes", "Were there earlier episodes where vision went and came back within minutes?", ["transient", "came back", "few minutes", "brief", "curtain", "amaurosis", "episodes", "recovered", "first episode"], { teach: "Brief episodes of vision going and returning before a lasting loss raise emboli travelling to the eye." }),
    yn("associated", "floaters_flashes", "Floaters / flashes / curtain", "Any new floaters, black spots, flashes of light, or a curtain coming across?", ["floaters", "black spots", "cobwebs", "flashes", "lightning", "curtain", "shadow", "sudden increase"], { teach: "A shower of new floaters or flashes with a curtain raises the retina separating rather than a lens problem." }),
    yn("associated", "glare_haloes_night", "Glare / haloes / poor night vision", "Any glare in sunlight, haloes around lights, or difficulty seeing at night?", ["glare", "haloes", "night vision", "at night", "sunlight", "headlights", "second image", "gradual"], { tier: "detailed" }),
    yn("associated", "diabetes_hypertension", "Diabetes / high blood pressure and their control", "Is the patient diabetic or hypertensive, for how many years, and when was the last eye check?", ["diabetes", "diabetic", "sugar", "hypertension", "blood pressure", "years", "eye check", "fundus", "laser", "uncontrolled", "irregular"]),
    yn("associated", "eye_surgery_injury", "Past eye surgery or injury", "Any past eye surgery, laser, or injury to the eye, and how recently?", ["cataract surgery", "operated", "laser", "injection in eye", "injury", "trauma", "recent surgery", "days after surgery"], { teach: "Vision falling with pain and redness in the days after eye surgery raises infection inside the eye." }),
    yn("associated", "neuro_symptoms", "Weakness / speech difficulty / double vision", "Any weakness of a limb, difficulty speaking, double vision, or numbness of the face?", ["weakness", "limb", "speech", "slurring", "double vision", "numbness", "face", "one side", "giddiness"], { teach: "Vision lost with limb or speech symptoms points behind the eye, along the pathway to the brain." }),
    yn("associated", "headache_jaw_scalp", "Headache with scalp tenderness or jaw pain on chewing", "In an older patient, any temple headache, tenderness of the scalp, or jaw pain while chewing?", ["temple", "scalp tenderness", "combing hair", "jaw pain", "chewing", "headache", "elderly", "weight loss", "shoulder stiffness"], { teach: "Temple headache with scalp tenderness and jaw pain on chewing in an older patient raises an arteritis that can take the second eye within days." }),
    // Red flags
    yn("red_flag", "sudden_painless_loss", "Sudden painless loss of vision", "Did vision go suddenly and painlessly, over seconds or minutes, and exactly when?", ["sudden", "seconds", "minutes", "painless", "on waking", "instantly", "time", "today", "hours ago"], { teach: "Sudden painless loss counts the time from onset, because the retina tolerates loss of its blood supply only briefly." }),
    yn("red_flag", "curtain_shadow", "Curtain or shadow across the vision", "Is there a shadow or curtain across part of the vision that is spreading?", ["curtain", "shadow", "spreading", "from above", "from below", "half", "growing", "covering"], { teach: "A spreading curtain raises a detaching retina, where the centre of vision is lost once the curtain reaches it." }),
    yn("red_flag", "red_painful_eye", "Painful red eye with the loss", "Is the eye red and painful with the loss of vision, with vomiting or haloes?", ["red eye", "painful", "vomiting", "haloes", "headache", "hard eye", "photophobia", "discharge"], { teach: "A red painful eye losing vision raises raised pressure or infection inside the eye rather than a retinal cause." }),
    yn("red_flag", "pain_on_eye_movement_young", "Pain on moving the eye with dulled colours", "Any pain on moving the eye, with colours looking washed out on that side?", ["pain on moving", "eye movement", "colours", "washed out", "faded", "young", "few days", "worsening"], { teach: "Pain on eye movement with dulled colour vision in a young adult raises inflammation of the optic nerve." }),
    yn("red_flag", "recent_eye_procedure_infection", "Pain and redness days after an eye procedure", "Any eye surgery or injection in the past few weeks, with pain, redness and falling vision since?", ["recent surgery", "injection in eye", "few weeks", "days after", "pain", "redness", "falling vision", "discharge", "swollen lids"], { teach: "Falling vision with pain in the weeks after an eye procedure raises infection inside the eye, which is counted in hours." }),
  ],
  differentials: [
    { id: "cataract", name: "Cataract", pointers: ["glare_haloes_night", "duration", "severity"], discriminators: ["glare_haloes_night", "duration", "severity", "pain", "sudden_painless_loss"] },
    { id: "diabetic_retinopathy", name: "Diabetic retinopathy or vitreous haemorrhage", pointers: ["diabetes_hypertension", "floaters_flashes"], discriminators: ["diabetes_hypertension", "floaters_flashes", "onset_mode", "field_pattern", "severity"] },
    { id: "chronic_glaucoma", name: "Chronic glaucoma", pointers: ["field_pattern", "duration"], discriminators: ["field_pattern", "duration", "glare_haloes_night", "pain", "eye_surgery_injury"] },
    { id: "retinal_detachment", name: "Retinal detachment", pointers: ["curtain_shadow", "floaters_flashes"], discriminators: ["curtain_shadow", "floaters_flashes", "field_pattern", "pain", "onset_mode"] },
    { id: "vascular_occlusion", name: "Retinal artery or vein occlusion", pointers: ["sudden_painless_loss", "transient_episodes", "diabetes_hypertension"], discriminators: ["sudden_painless_loss", "transient_episodes", "diabetes_hypertension", "field_pattern", "severity"] },
    { id: "optic_neuritis", name: "Optic neuritis", pointers: ["pain_on_eye_movement_young", "neuro_symptoms"], discriminators: ["pain_on_eye_movement_young", "neuro_symptoms", "field_pattern", "duration", "side"] },
    { id: "giant_cell_arteritis", name: "Giant cell arteritis", pointers: ["headache_jaw_scalp", "sudden_painless_loss"], discriminators: ["headache_jaw_scalp", "sudden_painless_loss", "transient_episodes", "severity", "side"] },
    { id: "cortical_visual_loss", name: "Stroke affecting the visual pathway", pointers: ["neuro_symptoms", "field_pattern"], discriminators: ["neuro_symptoms", "field_pattern", "side", "onset_mode", "pain"] },
    { id: "angle_closure_acute", name: "Acute angle closure glaucoma", pointers: ["red_painful_eye", "glare_haloes_night"], discriminators: ["red_painful_eye", "glare_haloes_night", "pain", "onset_mode", "severity"] },
    { id: "endophthalmitis", name: "Endophthalmitis after a procedure", pointers: ["recent_eye_procedure_infection", "eye_surgery_injury"], discriminators: ["recent_eye_procedure_infection", "eye_surgery_injury", "red_painful_eye", "severity", "duration"] },
  ],
  output: {
    durationSlot: "duration",
    hpiOrder: ["onset", "duration", "side", "onset_mode", "severity", "field_pattern", "pain", "progression", "prior_treatment", "prior_investigations"],
  },
};
