import type { HistoryTree } from "@/lib/history-check/types";
import { BAILEY_LOVE, commonHpi, DAS_CLINICAL_SURGERY, GRABB_SMITH, HAMILTON_BAILEY, HUTCHISONS, IMMUNOCOMPROMISE, MACLEODS, surgicalBackground, val, yn } from "@/content/history-trees/_helpers";

/**
 * BED SORE / PRESSURE SORE — v1.0.0. CLINICAL CONTENT: PENDING REVIEW (Sabiston background added, docs/surgical-history.md §9).
 * Burns and plastic surgery unit, north India, where most sores arrive from home after a spinal
 * injury, a stroke or a long illness, cared for by family with no air mattress and little help
 * with turning. The sore is the end of a story about immobility, lost sensation, wet skin and
 * poor food, so the history asks about each of those and about who does the care at home,
 * because the same conditions will be waiting after discharge. Differentials: pressure injury
 * by depth (skin intact to bone exposed), infected sore with cellulitis, underlying
 * osteomyelitis, Marjolin's ulcer in a long-standing sore, malnutrition delaying healing,
 * spinal cord injury or paraplegia as the cause, incontinence-associated dermatitis.
 */
export const pressureSoreV1: HistoryTree = {
  id: "pressure_sore",
  version: "1.1.0",
  complaint: "Bed sore / pressure sore",
  triggers: ["bed sore", "bedsore", "bed sores", "pressure sore", "pressure ulcer", "pressure injury", "decubitus", "sacral sore", "sore on back", "sore on buttock", "heel sore", "sore over hip", "trochanteric sore", "ischial sore", "kamar par ghaav", "lete lete ghaav"],
  setting: "Burns and plastic surgery unit, north India",
  reviewStatus: "pending_clinician_review",
  reviewedBy: null,
  references: [DAS_CLINICAL_SURGERY, HAMILTON_BAILEY, GRABB_SMITH, BAILEY_LOVE, MACLEODS, HUTCHISONS],
  slots: [
    ...commonHpi("sore"),
    val("hpi", "sore_sites", "Where the sores are", "Where are the sores — over the tailbone, the hips, the buttocks, the heels, the back of the head, or elsewhere — and how many are there?", ["sacrum", "tailbone", "lower back", "hip", "trochanter", "buttock", "ischium", "sitting bone", "heel", "ankle", "back of head", "occiput", "shoulder blade", "elbow", "multiple", "one"]),
    val("hpi", "cause_of_immobility", "Why the patient is immobile", "What has kept the patient in bed or in a chair — a spinal injury, a stroke, a fracture, old age, a long illness, or unconsciousness?", ["spinal injury", "paraplegia", "paralysed", "stroke", "fracture", "hip fracture", "old age", "long illness", "unconscious", "coma", "icu stay", "bedridden since"], { teach: "The reason for the immobility decides whether it will recover, and so whether the pressure that made the sore will continue." }),
    val("hpi", "how_sore_began", "How the sore began", "Did it start as a red patch that did not fade, a blister, or a dark patch, and during a hospital stay or at home?", ["red patch", "redness", "did not fade", "blister", "dark patch", "black patch", "skin broke", "in hospital", "at home", "after admission"], { tier: "detailed" }),
    val("hpi", "sore_depth_appearance", "Depth and appearance", "How deep is the sore — red skin only, a shallow break, a deep crater, or bone or tendon visible — and is there black or yellow dead tissue?", ["red skin", "shallow", "blister", "deep", "crater", "cavity", "bone visible", "tendon", "black", "eschar", "yellow", "slough", "tunnel", "pocket", "undermined"], { teach: "The depth of the sore, and whether bone can be seen, changes what the sore is expected to need and how long it will take." }),
    val("hpi", "discharge_smell_sore", "Discharge and smell", "What comes out of it — clear fluid, pus, or blood — and is there a foul smell?", ["clear", "watery", "pus", "blood", "foul", "smell", "badboo", "soaking", "scanty", "copious"]),
    val("hpi", "turning_positioning", "Turning and positioning", "How often is the patient turned or repositioned, by whom, and on what kind of mattress or bed?", ["turned", "turning", "every two hours", "not turned", "position change", "air mattress", "water bed", "foam", "ordinary mattress", "cot", "charpai", "wheelchair", "sits all day"], { teach: "How often the patient is turned, and on what surface, is the history of the pressure that made the sore." }),
    yn("hpi", "sensation_loss", "Loss of feeling over the area", "Can the patient feel the area of the sore and the skin around it, or is the lower body numb?", ["no feeling", "numb", "cannot feel", "loss of sensation", "lower body numb", "feels pain", "painful", "painless"], { teach: "A patient who cannot feel the area does not shift away from the pressure, so the sore gives no warning as it forms." }),
    val("hpi", "continence", "Control of urine and stool", "Is the patient able to control urine and stool, and is there a catheter, diaper or pad in use?", ["incontinent", "urine leak", "wet", "soiled", "stool", "catheter", "diaper", "pad", "continent", "bowel control", "bladder control"], { teach: "Skin kept wet by urine or stool breaks down faster and is contaminated repeatedly, particularly over the sacrum." }),
    val("hpi", "nutrition_intake", "Eating and weight", "What is the patient eating each day, has there been weight loss, and is feeding by mouth or by tube?", ["eating", "appetite", "poor intake", "weight loss", "thin", "wasting", "ryles tube", "feeding tube", "peg", "liquid diet", "one meal", "protein", "dal", "egg"], { teach: "A sore does not close in a patient who is losing weight, so intake is asked as carefully as the wound itself." }),
    val("hpi", "home_care", "Who cares for the patient at home", "Who looks after the patient at home, can they turn and clean the patient, and have they been shown how?", ["wife", "husband", "son", "daughter in law", "family", "attendant", "nurse at home", "alone", "no one", "shown how", "trained", "cannot lift", "tired"], { teach: "The conditions at home will be the conditions after discharge, so the carer's ability is part of the history of the sore." }),
    yn("hpi", "dressing_history", "Dressings and procedures so far", "How has the sore been dressed so far, how often, and has anything been cut away or operated on before?", ["dressing", "daily dressing", "ointment", "powder", "home remedy", "debridement", "cleaned", "operated", "flap", "previous surgery on sore"], { tier: "detailed" }),
    yn("associated", "spasms_contractures", "Spasms or stiff bent joints", "Does the patient have leg spasms or stiff bent joints that make positioning hard?", ["spasms", "jerks", "stiff", "contracture", "bent knees", "bent hips", "cannot straighten", "tight legs"], { tier: "detailed" }),
    yn("associated", "urinary_symptoms_sore", "Fever from urine or chest", "Any burning or cloudy urine, cough, or chest infection alongside the sore?", ["cloudy urine", "burning urine", "urine infection", "cough", "chest infection", "phlegm", "catheter blocked"], { tier: "detailed" }),
    yn("associated", "skin_around_wet", "Raw, red, wet skin around the buttocks", "Is the skin around the buttocks and groin raw, red, peeling or wet, beyond the edges of the sore itself?", ["raw", "red skin", "peeling", "wet", "moist", "rash", "groin", "between buttocks", "diaper rash", "burning skin"], { tier: "detailed", teach: "Broad shallow rawness where urine or stool sits, without a bony point beneath, asks whether moisture rather than pressure is the main cause." }),
    // Red flags
    yn("red_flag", "fever_spreading_sore", "Fever with spreading redness", "Any fever, chills, or redness and swelling spreading into the skin around the sore?", ["fever", "chills", "rigors", "spreading", "redness", "swelling", "warm", "hot", "cellulitis"], { teach: "Fever with spreading redness asks whether infection has spread beyond the sore into the surrounding tissue or the blood." }),
    yn("associated", "bone_exposed_sore", "Bone felt or seen in the sore", "Can bone be seen or felt at the base of the sore, or does it keep discharging from a deep track?", ["bone visible", "bone", "felt bone", "deep track", "sinus", "keeps discharging", "cavity", "hip joint"], { teach: "A sore reaching bone, or one that keeps discharging from a track, asks whether the bone beneath is infected." }),
    yn("red_flag", "long_standing_sore_change", "Long-standing sore that has changed", "Has a sore present for years recently begun to grow, bleed easily, smell differently, or develop heaped-up edges?", ["years", "long standing", "growing", "bleeds easily", "heaped", "raised edges", "cauliflower", "changed", "marjolin"], { teach: "A sore present for years that starts to grow or bleed raises a cancer arising within it, which the chronicity itself disguises." }),
    yn("red_flag", "drowsy_unwell", "Drowsy, confused or very unwell", "Is the patient drowsier, more confused, breathing fast, or passing less urine than usual?", ["drowsy", "confused", "not responding", "fast breathing", "low urine", "less urine", "cold peripheries", "very unwell", "low bp"], { teach: "New drowsiness or reduced urine in a patient with a sore asks whether infection has spread into the bloodstream." }),
    yn("red_flag", "autonomic_dysreflexia", "Pounding headache, sweating, flushing with spinal injury", "In a patient with a high spinal injury, any sudden pounding headache, sweating or flushing above the injury, or blocked nose?", ["pounding headache", "sudden headache", "sweating", "flushing", "blocked nose", "high bp", "goose bumps", "high spinal injury", "neck injury"], { teach: "In an injury above the mid-chest, a pounding headache with flushing can be the body's response to an unfelt trigger such as a sore or a full bladder." }),
    IMMUNOCOMPROMISE,
    yn("exposure", "smoking_sore", "Smoking", "Does the patient smoke or use tobacco?", ["smoking", "smoker", "bidi", "cigarette", "tobacco", "non smoker"], { tier: "detailed" }),
    // S. Das, A Manual on Clinical Surgery, 13th ed. (docs/surgical-history.md §10)
    yn("exposure", "kidney_disease_sore", "Kidney disease", "Has the patient been told of any kidney disease?", ["kidney disease", "kidney failure", "weak kidneys", "nephritis", "dialysis", "creatinine high", "no kidney disease"], { tier: "detailed", teach: "Das names nephritis alongside diabetes and tuberculosis as general diseases behind an ulcer that will not heal." }),
    // Hamilton Bailey's Demonstrations of Physical Signs, 19th ed. (docs/surgical-history.md §11)
    yn("hpi", "device_pressure", "Plaster, splint or bandage pressing on the skin", "Was a plaster, splint or tight bandage pressing on the skin where the sore formed?", ["plaster", "cast", "splint", "bandage", "tight bandage", "brace", "pressed on", "no plaster or splint"], { tier: "detailed", teach: "Hamilton Bailey notes that a bandage over a tendon at the ankle can cut off skin blood flow as surely as lying in bed, so a sore under a cast, splint or bandage is traced to it rather than to position alone." }),
    // Schwartz's Principles of Surgery, 11th ed. (docs/surgical-history.md §12)
    yn("hpi", "shear_friction", "Dragged up the bed or sliding down", "Is the patient dragged rather than lifted when moved, or kept propped up so that they slide down the bed?", ["dragged", "pulled up", "slides down", "sliding down", "propped up", "head end raised", "lifted with sheet"], { tier: "detailed", teach: "Schwartz notes that friction, shear and moisture speed the formation of a pressure ulcer, so how the patient is moved is part of the history." }),
    ...surgicalBackground({ omit: ["surg_weight_loss", "surg_exercise_tolerance"] }),
  ],
  differentials: [
    { id: "pressure_injury_stage", name: "Pressure injury (graded by depth)", pointers: ["sore_sites", "turning_positioning", "sensation_loss"], discriminators: ["sore_depth_appearance", "sore_sites", "how_sore_began", "turning_positioning", "sensation_loss", "bone_exposed_sore", "device_pressure", "shear_friction"] },
    { id: "infected_sore", name: "Infected sore with cellulitis", pointers: ["fever_spreading_sore", "discharge_smell_sore", "drowsy_unwell"], discriminators: ["fever_spreading_sore", "discharge_smell_sore", "drowsy_unwell", "sore_depth_appearance", "surg_other_illnesses", "immunocompromise"] },
    { id: "osteomyelitis", name: "Osteomyelitis beneath the sore", pointers: ["bone_exposed_sore"], discriminators: ["bone_exposed_sore", "sore_depth_appearance", "discharge_smell_sore", "duration", "dressing_history"] },
    { id: "marjolin_ulcer", name: "Marjolin's ulcer in a long-standing sore", pointers: ["long_standing_sore_change"], discriminators: ["long_standing_sore_change", "duration", "discharge_smell_sore", "nutrition_intake", "sore_depth_appearance"] },
    { id: "malnutrition", name: "Malnutrition delaying healing", pointers: ["nutrition_intake"], discriminators: ["nutrition_intake", "home_care", "cause_of_immobility", "progression", "kidney_disease_sore"] },
    { id: "spinal_cord_injury", name: "Spinal cord injury / paraplegia", pointers: ["cause_of_immobility", "sensation_loss", "autonomic_dysreflexia"], discriminators: ["cause_of_immobility", "sensation_loss", "continence", "spasms_contractures", "autonomic_dysreflexia", "urinary_symptoms_sore"] },
    { id: "incontinence_dermatitis", name: "Incontinence-associated dermatitis", pointers: ["skin_around_wet", "continence"], discriminators: ["skin_around_wet", "continence", "sore_sites", "sore_depth_appearance", "how_sore_began"] },
  ],
  output: {
    durationSlot: "duration",
    hpiOrder: ["onset", "duration", "cause_of_immobility", "how_sore_began", "sore_sites", "sore_depth_appearance", "discharge_smell_sore", "progression", "turning_positioning", "sensation_loss", "continence", "nutrition_intake", "home_care", "dressing_history", "prior_treatment", "prior_investigations"],
  },
};
