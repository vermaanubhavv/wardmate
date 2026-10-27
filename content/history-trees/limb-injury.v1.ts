import type { HistoryTree } from "@/lib/history-check/types";
import { ATLS, BAILEY_LOVE, commonHpi, HUTCHISONS, MACLEODS, rce, surgicalBackground, TRAUMA_BG, val, yn } from "@/content/history-trees/_helpers";

/**
 * LIMB INJURY — v1.0.0. CLINICAL CONTENT: AWAITING RE-REVIEW after the negation-term rewording (docs/history-check.md). Previously REVIEWED (Dr Anubhav Verma, 2026-10-18, after the Bailey & Love 28e review, docs/surgical-history.md §13).
 * Orthopaedic / emergency ward, north India. The mechanism predicts the injury, and the
 * questions that matter most afterwards are about the circulation, the nerves and the skin
 * over the fracture. Differentials: fracture, dislocation, ligament or tendon injury, soft
 * tissue contusion, open fracture, compartment syndrome, neurovascular injury, pathological
 * fracture, and a fall caused by something else.
 */
export const limbInjuryV1: HistoryTree = {
  id: "limb_injury",
  version: "1.3.0",
  complaint: "Limb injury",
  triggers: ["limb injury", "fracture", "broken bone", "injury to leg", "injury to arm", "dislocation", "twisted ankle", "fall on hand", "hadi toot", "deformity after fall", "cannot bear weight"],
  setting: "Orthopaedic / emergency ward, north India",
  reviewStatus: "pending_clinician_review",
  reviewedBy: null,
  references: [
    rce("Does this patient with shoulder pain have rotator cuff disease? The Rational Clinical Examination systematic review", 2013, "23982370"),
    MACLEODS,
    HUTCHISONS,
    BAILEY_LOVE,
    ATLS,
  ],
  slots: [
    ...commonHpi("injury"),
    val("hpi", "mechanism_injury", "How it happened", "Exactly how did the injury happen — a fall, a twist, a direct blow, a road traffic collision, or machinery?", ["fall", "twist", "direct blow", "road traffic", "motorcycle", "machinery", "crush", "height", "slipped", "sports", "assault", "fall on outstretched hand", "foosh", "electric shock", "electrocution"]),
    val("hpi", "energy_position", "Force and position", "How far was the fall or how fast the impact, and what position was the limb in when it happened?", ["height", "metres", "speed", "outstretched hand", "twisted", "inverted", "direct", "landed on", "trapped"], { numeric: true }),
    val("hpi", "site_pain", "Where it hurts", "Where exactly is the pain, and is there more than one painful area?", ["site", "wrist", "elbow", "shoulder", "hip", "knee", "ankle", "foot", "thigh", "more than one", "also"]),
    yn("hpi", "deformity_swelling", "Deformity or swelling", "Is the limb visibly deformed, shortened, rotated, or rapidly swelling?", ["deformity", "shortened", "rotated", "bent", "angulated", "swelling", "rapid", "bruising"]),
    yn("hpi", "weight_bearing_use", "Able to use the limb", "Could the patient walk or use the limb immediately after, and can they now?", ["could walk", "cannot walk", "bear weight", "four steps", "immediately after", "cannot use", "cannot lift", "cannot grip"]),
    yn("hpi", "heard_sound", "A sound at the time", "Was any snap, crack or pop heard or felt at the moment of injury?", ["snap", "crack", "pop", "heard", "felt", "giving way", "tearing"]),
    yn("associated", "open_wound", "Break in the skin", "Is there any wound, graze or bleeding over the injured area, and was bone visible?", ["wound", "cut", "graze", "bleeding", "bone visible", "open", "exposed", "dirty", "contaminated"]),
    yn("associated", "numbness_tingling_limb", "Numbness or tingling", "Any numbness, tingling, or loss of feeling beyond the injury?", ["numbness", "tingling", "loss of feeling", "pins and needles", "cannot feel", "fingers", "toes"]),
    yn("associated", "other_injuries_limb", "Injuries elsewhere", "Any injury to the head, chest, abdomen, spine or another limb?", ["head", "chest", "abdomen", "spine", "another limb", "multiple", "other injuries"]),
    yn("associated", "previous_problem_limb", "Previous problem with that limb", "Any previous injury, surgery, or long-standing pain in the same limb?", ["previous injury", "surgery", "implant", "plate", "long standing pain", "same limb", "operated"], { tier: "detailed" }),
    // Red flags
    yn("red_flag", "open_fracture", "Wound over a suspected fracture", "Is there a wound, however small, over the site of a suspected fracture, and how long ago and how dirty was it?", ["wound over", "open fracture", "bone visible", "bleeding", "small puncture", "dirty", "soil", "hours ago", "field"], { teach: "Any wound over a fracture makes it an open injury, and the time since and the contamination drive how urgently it must reach theatre." }),
    yn("red_flag", "neurovascular_compromise", "Cold, pale or pulseless limb", "Is the limb beyond the injury cold, pale, blue, numb, or without a pulse?", ["cold", "pale", "blue", "numb", "pulseless", "cannot move", "white", "dusky"], { teach: "A limb without circulation tolerates only a few hours, so this question is asked before imaging and repeated after any manipulation." }),
    yn("red_flag", "compartment_features", "Pain far out of proportion, worse on stretching", "Is the pain far greater than the injury suggests, increasing, tight, and much worse when the fingers or toes are stretched?", ["out of proportion", "increasing", "tight", "tense", "on stretching", "unbearable", "unrelieved", "swollen hard", "pins and needles"], { teach: "Pain out of proportion that worsens on passive stretching is the earliest sign of a compartment under pressure, and it appears long before the pulse disappears." }),
    yn("red_flag", "deformity_dislocation", "Obvious deformity or a joint locked out of position", "Is the limb obviously deformed, shortened or rotated, or is a joint fixed and unable to move?", ["deformity", "shortened", "rotated", "locked", "fixed", "cannot move joint", "out of position", "dislocated"], { teach: "A dislocated joint left in position damages the cartilage and the vessels around it, so recognising it early matters as much as the fracture." }),
    yn("red_flag", "hip_fracture_elderly", "Elderly patient unable to bear weight after a fall", "Is an older patient unable to stand or bear weight after a fall, with the leg short or turned outwards?", ["elderly", "older", "cannot stand", "cannot bear weight", "after a fall", "short", "turned out", "externally rotated", "groin pain"], { teach: "In an older person a hip fracture may follow a trivial fall, and the delay to surgery is a strong determinant of the outcome." }),
    yn("red_flag", "pathological_fracture", "Fracture after a trivial injury", "Did the bone break after very little force, or was there pain in that bone before the injury?", ["trivial", "little force", "minor fall", "pain before", "night pain", "cancer", "known malignancy", "weak bone", "steroid"], { teach: "A break after minimal force, or bone pain preceding it, raises a lesion weakening the bone rather than a simple injury." }),
    yn("red_flag", "cause_of_fall_limb", "Why the fall happened", "Was there giddiness, chest pain, palpitations, a blackout or a seizure that caused the fall?", ["giddiness", "chest pain", "palpitations", "blackout", "fainted", "seizure", "collapsed", "sugar"], { teach: "The fracture is sometimes the least important part of the episode, and a collapse that caused the fall needs its own history." }),
    yn("red_flag", "spine_injury_limb", "Neck or back pain, or weakness", "Any neck or back pain, or weakness, numbness or bladder change since the injury?", ["neck pain", "back pain", "spine", "weakness", "numbness", "bladder", "cannot move legs", "tingling"], { tier: "detailed", teach: "A high-energy limb injury travels with spinal injury often enough that the spine is asked about before the patient is moved." }),
    yn("exposure", "tetanus_status", "Tetanus immunisation", "Has the patient had a full course of tetanus immunisation, and when was the last dose?", ["tetanus", "tt", "immunisation", "booster", "last", "years ago", "not taken", "unknown", "full course", "three doses"], { teach: "Schwartz decides tetanus cover by the course and its timing together: fewer than three doses, more than five years since the last, or not known." }),
    yn("exposure", "comorbidity_limb", "Diabetes, steroids or bone disease", "Any diabetes, long-term steroids, thin bones, or known bone disease?", ["diabetes", "steroid", "steroids", "osteoporosis", "thin bones", "bone disease", "previous fractures"]),
    yn("exposure", "anticoagulant_limb", "Blood thinners", "Is the patient on blood thinners or aspirin?", ["blood thinner", "warfarin", "aspirin", "clopidogrel", "anticoagulant", "blood thinners", "acitrom", "ecosprin", "antiplatelet", "rivaroxaban", "apixaban"]),
    yn("exposure", "first_aid_given", "First aid before arrival", "What was done before arrival — a splint, a bandage, traditional bone-setting, or manipulation?", ["splint", "bandage", "plaster", "bone setter", "traditional", "massage", "manipulated", "tied", "outside", "pehelwan", "pahalwan", "tight bandage", "tight plaster", "antibiotic"], { tier: "detailed", teach: "Bailey & Love lists a tight cast or dressing among the causes of a compartment under pressure, so a bandage, plaster or bone-setter's binding applied before arrival is recorded with its time." }),
    // Bailey & Love, 28th ed. (docs/surgical-history.md §13)
    val("hpi", "hand_dominance_limb", "Which hand is dominant", "For an arm injury, which hand does the patient write and eat with?", ["right handed", "left handed", "dominant", "non dominant", "writes with", "eats with", "ambidextrous"], { tier: "detailed", teach: "Bailey & Love records hand dominance with occupation in the musculoskeletal history, because the same arm injury costs more on the dominant side and weighs the choice of treatment." }),
    val("exposure", "pre_injury_mobility", "Walking and independence before the injury", "Before the injury, did the patient walk without help, with a stick or a walker, and manage at home without help?", ["walked without help", "independent", "stick", "walker", "walking aid", "needed help", "bedridden", "housebound", "lives alone"], { tier: "detailed", teach: "Bailey & Love asks about walking aids, home help and accommodation in every musculoskeletal history; in an older patient with a fracture they set the aim of treatment and the plan for discharge." }),
    ...surgicalBackground({ acute: true, omit: [...TRAUMA_BG.omit, "surg_blood_thinners", "surg_steroid_past_year"], detailed: TRAUMA_BG.detailed }),
  ],
  differentials: [
    { id: "fracture", name: "Fracture", pointers: ["deformity_swelling", "weight_bearing_use", "heard_sound", "mechanism_injury"], discriminators: ["deformity_swelling", "weight_bearing_use", "heard_sound", "mechanism_injury", "energy_position", "site_pain", "hip_fracture_elderly", "hand_dominance_limb", "pre_injury_mobility"] },
    { id: "dislocation", name: "Dislocation", pointers: ["deformity_dislocation", "heard_sound"], discriminators: ["deformity_dislocation", "heard_sound", "weight_bearing_use", "site_pain", "neurovascular_compromise"] },
    { id: "ligament_tendon", name: "Ligament or tendon injury", pointers: ["heard_sound", "mechanism_injury", "weight_bearing_use"], discriminators: ["heard_sound", "mechanism_injury", "weight_bearing_use", "deformity_swelling", "site_pain"] },
    { id: "contusion", name: "Soft tissue contusion", pointers: ["mechanism_injury", "deformity_swelling"], discriminators: ["mechanism_injury", "deformity_swelling", "weight_bearing_use", "heard_sound", "compartment_features"] },
    { id: "open_fracture_d", name: "Open fracture", pointers: ["open_fracture", "open_wound"], discriminators: ["open_fracture", "open_wound", "tetanus_status", "mechanism_injury", "first_aid_given"] },
    { id: "compartment_syndrome", name: "Compartment syndrome", pointers: ["compartment_features", "numbness_tingling_limb"], discriminators: ["compartment_features", "numbness_tingling_limb", "first_aid_given", "energy_position"] },
    { id: "neurovascular_injury", name: "Neurovascular injury", pointers: ["neurovascular_compromise", "numbness_tingling_limb"], discriminators: ["neurovascular_compromise", "numbness_tingling_limb", "deformity_dislocation", "first_aid_given"] },
    { id: "pathological", name: "Pathological fracture", pointers: ["pathological_fracture", "previous_problem_limb", "comorbidity_limb"], discriminators: ["pathological_fracture", "previous_problem_limb", "comorbidity_limb", "energy_position", "mechanism_injury"] },
    { id: "collapse_then_fall", name: "Collapse that caused the fall", pointers: ["cause_of_fall_limb"], discriminators: ["cause_of_fall_limb", "mechanism_injury", "other_injuries_limb", "hip_fracture_elderly", "pre_injury_mobility"] },
  ],
  output: {
    durationSlot: "duration",
    hpiOrder: ["onset", "duration", "mechanism_injury", "energy_position", "site_pain", "deformity_swelling", "weight_bearing_use", "heard_sound", "progression", "prior_treatment", "prior_investigations"],
  },
};
