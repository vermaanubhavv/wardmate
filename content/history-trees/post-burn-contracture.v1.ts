import type { HistoryTree } from "@/lib/history-check/types";
import { BAILEY_LOVE, commonHpi, DAS_CLINICAL_SURGERY, GRABB_SMITH, HAMILTON_BAILEY, HUTCHISONS, MACLEODS, surgicalBackground, val, yn } from "@/content/history-trees/_helpers";

/**
 * SCAR TIGHTENING AFTER A BURN — v1.0.0. CLINICAL CONTENT: PENDING REVIEW (Sabiston background added, docs/surgical-history.md §9).
 * Burns and plastic surgery unit, north India, where many burns heal at home without grafting or
 * splinting and arrive months or years later as tight bands across the neck, armpit, elbow,
 * hand or face. The history is about the old burn, what the tightness now stops the patient
 * doing, and — in a child — whether the scar is holding back growth. A long-standing scar that
 * has begun to break down is asked about in every mode. Differentials: post-burn contracture by
 * site (neck, axilla, elbow, hand, eyelid, perioral), hypertrophic scar, keloid, Marjolin's
 * ulcer in an old burn scar, functional and growth effects in a child, psychosocial impact.
 */
export const postBurnContractureV1: HistoryTree = {
  id: "post_burn_contracture",
  version: "1.1.0",
  complaint: "Scar tightening after a burn",
  triggers: ["post burn contracture", "burn contracture", "contracture", "burn scar", "old burn", "scar tightening", "tight scar", "scar pulling", "hypertrophic scar", "keloid", "raised scar", "neck contracture", "cannot raise arm after burn", "cannot open mouth after burn", "jale ka nishan", "khinchav"],
  setting: "Burns and plastic surgery unit, north India",
  reviewStatus: "pending_clinician_review",
  reviewedBy: null,
  references: [DAS_CLINICAL_SURGERY, HAMILTON_BAILEY, GRABB_SMITH, BAILEY_LOVE, MACLEODS, HUTCHISONS],
  slots: [
    ...commonHpi("scar tightening").filter((s) => !["onset_mode", "progression"].includes(s.id)),
    val("hpi", "original_burn", "The original burn", "How long ago was the burn, what caused it, and how much of the body was involved?", ["years ago", "months ago", "in childhood", "flame", "kerosene", "stove", "scald", "hot water", "electric", "acid", "chemical", "large area", "small area"]),
    val("hpi", "original_burn_care", "How the burn was treated then", "Where was the burn treated, how long did it take to heal, and was skin grafting, splinting or pressure garment used?", ["at home", "local doctor", "hospital", "months to heal", "weeks to heal", "healed on its own", "skin graft", "grafting", "splint", "pressure garment", "physiotherapy", "exercises", "no treatment"], { teach: "A burn that took weeks to heal on its own, without grafting or splinting, is the usual history behind a tight scar." }),
    val("hpi", "contracture_sites", "Which parts are tight", "Which parts are tight — the neck, armpit, elbow, hand or fingers, eyelids, mouth, knee, ankle or groin?", ["neck", "chin stuck", "armpit", "axilla", "elbow", "wrist", "hand", "fingers", "web space", "eyelid", "mouth", "lip", "knee", "ankle", "toes", "groin", "perineum"]),
    val("hpi", "movement_lost", "Movement lost", "What movement is lost — raising the head, lifting the arm, straightening the elbow, opening the hand, closing the eyes, or opening the mouth?", ["cannot raise head", "cannot look up", "cannot lift arm", "cannot raise arm", "cannot straighten", "cannot bend", "hand stays closed", "cannot open hand", "cannot close eyes", "cannot open mouth", "cannot straighten knee"]),
    val("hpi", "function_daily", "What the tightness stops the patient doing", "What can the patient no longer do because of the tightness — eating, dressing, combing, washing, writing, walking, or work?", ["eating", "dressing", "combing hair", "bathing", "washing", "toilet", "writing", "walking", "work", "school", "farming", "cooking", "cannot do", "needs help"], { teach: "What the patient can no longer do is the measure of the contracture that matters to them, and it sets the aim of any release." }),
    val("hpi", "scar_character", "What the scar looks and feels like", "Is the scar raised, red, thick, hard, shiny, or stretched thin, and is it confined to the burn or spreading beyond it?", ["raised", "red", "thick", "hard", "shiny", "thin", "flat", "cord", "band", "web", "spreading beyond", "within the burn", "lumpy"], { tier: "detailed", teach: "A raised scar that stays within the old burn and a scar that grows out beyond it behave differently over time." }),
    yn("hpi", "itch_pain_scar", "Itching or pain in the scar", "Does the scar itch, burn, or hurt, and does that disturb sleep?", ["itching", "itchy", "khujli", "burning", "painful", "tender", "sleep disturbed", "scratches"], { tier: "detailed" }),
    yn("hpi", "scar_growing", "Scar still getting bigger", "Is the scar still getting bigger, thicker or tighter, or has it stayed the same for months?", ["getting bigger", "growing", "thicker", "tighter", "increasing", "same for months", "stable", "softening", "flattening"]),
    yn("hpi", "blisters_breakdown", "Blisters or cracks in the scar", "Does the scar blister, crack, or break open with movement or in summer?", ["blisters", "cracks", "breaks open", "raw", "splits", "summer", "rubs"], { tier: "detailed" }),
    yn("hpi", "previous_release", "Previous release operations", "Has the scar been operated on or released before, how many times, and did it tighten again?", ["released", "operated", "surgery", "graft", "flap", "z plasty", "tightened again", "recurred", "first time", "twice"], { teach: "A contracture that has tightened again after release asks what happened after the last operation — splinting, garments, exercises — as much as about the scar." }),
    yn("hpi", "family_keloid", "Similar scars elsewhere or in the family", "Does the patient get raised scars from small cuts, ear piercing or vaccination, and does anyone in the family?", ["ear piercing", "vaccination scar", "small cut", "raised scars", "family", "mother", "father", "sibling", "runs in family"], { tier: "detailed", teach: "Raised scars after trivial injuries, or in relatives, raise a tendency that behaves differently from a scar confined to a burn." }),
    // Children
    yn("associated", "child_growth_effect", "In a child: growth and development", "In a child, is the tight part growing less than the other side, is a joint or the jaw being pulled out of shape, or is schooling affected?", ["child", "shorter", "smaller", "growing less", "pulled", "jaw", "teeth", "spine bent", "school", "missed school", "not growing"], { teach: "A tight scar in a growing child pulls on the bone and joint beneath it, so the deformity can worsen with growth even when the scar itself does not change." }),
    yn("associated", "psychosocial_impact", "Effect on confidence, school, work or marriage", "Has the scar affected the patient's confidence, schooling, work, marriage prospects, or how they go out in public?", ["confidence", "shy", "ashamed", "hides", "covers", "teased", "school", "job", "marriage", "rishta", "does not go out", "sad", "low mood"], { teach: "The effect on schooling, work and marriage is often the reason for coming now, and is rarely volunteered unless asked." }),
    // Red flags
    yn("red_flag", "scar_ulcer_change", "Non-healing ulcer or change in an old scar", "Is there an ulcer in the old scar that has not healed for weeks, or a part that has grown, bled easily, or developed heaped-up edges?", ["ulcer", "not healing", "non healing", "wound in scar", "growing", "bleeds", "heaped", "raised edges", "cauliflower", "smell", "marjolin"], { teach: "An ulcer that will not heal in an old burn scar raises a cancer arising in the scar, which can appear decades after the burn." }),
    yn("red_flag", "lymph_node_lump", "Lump in the armpit or groin", "Is there any new lump in the armpit, groin or neck on the side of the scar?", ["lump", "gland", "armpit lump", "groin lump", "neck lump", "swelling", "node"], { teach: "A new lump in the draining glands alongside a changing scar asks whether a scar ulcer has spread." }),
    yn("red_flag", "eye_exposure", "Eye cannot close", "Does the eyelid fail to close fully, with a red, watering or painful eye?", ["cannot close eye", "eye stays open", "eyelid pulled", "ectropion", "red eye", "watering", "painful eye", "blurred vision", "sleeps with eye open"], { teach: "An eyelid pulled open by scar leaves the eye exposed, and the surface of the eye can be damaged before the scar itself is addressed." }),
    yn("red_flag", "mouth_airway_restriction", "Mouth or neck so tight it limits eating or breathing", "Is the mouth opening or neck so tight that eating, brushing, or lying flat is difficult, or has an anaesthetist mentioned difficulty with the airway?", ["cannot open mouth", "small mouth", "microstomia", "chin stuck to chest", "cannot lie flat", "difficult to eat", "difficult intubation", "airway", "drooling"], { teach: "A tight neck or small mouth decides how the airway can be secured for any operation, so the restriction is asked about well before the day of surgery." }),
    yn("associated", "hand_numb_cold", "Numb, cold or pale fingers", "Are any fingers numb, cold or pale, particularly beyond a tight web or wrist?", ["numb fingers", "cold fingers", "pale", "blue", "tingling", "loss of feeling", "reduced sensation"], { teach: "Numbness or coldness beyond a long-standing band asks whether the nerves and vessels have shortened with the scar, which limits how far it can be straightened." }),
    yn("exposure", "nutrition_contracture", "Eating and weight", "Is the patient eating well and keeping weight, or has there been weight loss?", ["eating well", "poor appetite", "weight loss", "thin", "malnourished", "gaining weight"], { tier: "detailed" }),
    yn("exposure", "smoking_contracture", "Smoking", "Does the patient smoke or use tobacco?", ["smoking", "smoker", "bidi", "cigarette", "tobacco", "non smoker"], { tier: "detailed" }),
    // Release is a planned operation; the pre-operative background is asked in the long case.
    // Schwartz's Principles of Surgery, 11th ed. (docs/surgical-history.md §12)
    yn("associated", "joint_bony_swelling", "Hard swelling and pain over a joint", "Is there pain and a hard swelling over the elbow or another joint, with movement lost even where the skin is not tight?", ["hard swelling", "bony lump", "pain at elbow", "elbow stiff", "joint stiff", "skin not tight", "no joint swelling"], { tier: "detailed", teach: "Schwartz describes new bone forming around a joint after a large burn, especially of the arm or after a long ventilator stay, which stiffens the joint apart from the scar." }),
    yn("associated", "burn_nightmares", "Nightmares or flashbacks of the burn", "Does the patient have nightmares or flashbacks of the burn, or avoid things that bring it back?", ["nightmares", "flashbacks", "bad dreams", "afraid of fire", "avoids kitchen", "startles", "no nightmares"], { tier: "detailed", teach: "Schwartz notes depression and post-traumatic stress in a large share of burn survivors, lasting long after discharge and rarely volunteered." }),
    ...surgicalBackground({ omit: ["surg_weight_loss"] }),
  ],
  differentials: [
    { id: "neck_contracture", name: "Post-burn contracture of the neck", pointers: ["contracture_sites", "movement_lost"], discriminators: ["contracture_sites", "movement_lost", "mouth_airway_restriction", "child_growth_effect", "previous_release"] },
    { id: "axilla_elbow_contracture", name: "Post-burn contracture of the axilla or elbow", pointers: ["contracture_sites", "movement_lost"], discriminators: ["contracture_sites", "movement_lost", "function_daily", "original_burn_care", "blisters_breakdown", "joint_bony_swelling"] },
    { id: "hand_contracture", name: "Post-burn contracture of the hand", pointers: ["contracture_sites", "hand_numb_cold"], discriminators: ["contracture_sites", "movement_lost", "hand_numb_cold", "function_daily", "child_growth_effect"] },
    { id: "eyelid_perioral_contracture", name: "Post-burn contracture of the eyelid or mouth", pointers: ["eye_exposure", "mouth_airway_restriction"], discriminators: ["eye_exposure", "mouth_airway_restriction", "contracture_sites", "movement_lost", "function_daily"] },
    { id: "hypertrophic_scar", name: "Hypertrophic scar", pointers: ["scar_character", "itch_pain_scar", "scar_growing"], discriminators: ["scar_character", "scar_growing", "itch_pain_scar", "family_keloid", "original_burn_care"] },
    { id: "keloid", name: "Keloid", pointers: ["family_keloid", "scar_character"], discriminators: ["family_keloid", "scar_character", "scar_growing", "itch_pain_scar", "previous_release"] },
    { id: "marjolin_ulcer", name: "Marjolin's ulcer in an old burn scar", pointers: ["scar_ulcer_change", "lymph_node_lump"], discriminators: ["scar_ulcer_change", "lymph_node_lump", "blisters_breakdown", "original_burn", "nutrition_contracture"] },
    { id: "growth_effect_child", name: "Functional and growth effects in a child", pointers: ["child_growth_effect"], discriminators: ["child_growth_effect", "function_daily", "contracture_sites", "original_burn", "psychosocial_impact"] },
    { id: "psychosocial", name: "Psychosocial impact of the scar", pointers: ["psychosocial_impact", "burn_nightmares"], discriminators: ["psychosocial_impact", "contracture_sites", "function_daily", "scar_character", "burn_nightmares"] },
  ],
  output: {
    durationSlot: "duration",
    hpiOrder: ["original_burn", "original_burn_care", "onset", "duration", "contracture_sites", "movement_lost", "function_daily", "scar_character", "scar_growing", "previous_release", "prior_treatment", "prior_investigations"],
  },
};
