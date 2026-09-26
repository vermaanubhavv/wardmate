import type { HistoryTree } from "@/lib/history-check/types";
import { commonHpi, HUTCHISONS, MACLEODS, rce, val, yn } from "@/content/history-trees/_helpers";

/**
 * LIMB INJURY — v1.0.0. CLINICAL CONTENT: REVIEWED (Dr Anubhav Verma).
 * Orthopaedic / emergency ward, north India. The mechanism predicts the injury, and the
 * questions that matter most afterwards are about the circulation, the nerves and the skin
 * over the fracture. Differentials: fracture, dislocation, ligament or tendon injury, soft
 * tissue contusion, open fracture, compartment syndrome, neurovascular injury, pathological
 * fracture, and a fall caused by something else.
 */
export const limbInjuryV1: HistoryTree = {
  id: "limb_injury",
  version: "1.0.0",
  complaint: "Limb injury",
  triggers: ["limb injury", "fracture", "broken bone", "injury to leg", "injury to arm", "dislocation", "twisted ankle", "fall on hand", "hadi toot", "deformity after fall", "cannot bear weight"],
  setting: "Orthopaedic / emergency ward, north India",
  reviewStatus: "reviewed",
  reviewedBy: "Dr Anubhav Verma",
  references: [
    rce("Does this patient with shoulder pain have rotator cuff disease? The Rational Clinical Examination systematic review", 2013, "23982370"),
    MACLEODS,
    HUTCHISONS,
  ],
  slots: [
    ...commonHpi("injury"),
    val("hpi", "mechanism_injury", "How it happened", "Exactly how did the injury happen — a fall, a twist, a direct blow, a road traffic collision, or machinery?", ["fall", "twist", "direct blow", "road traffic", "motorcycle", "machinery", "crush", "height", "slipped", "sports", "assault"]),
    val("hpi", "energy_position", "Force and position", "How far was the fall or how fast the impact, and what position was the limb in when it happened?", ["height", "metres", "speed", "outstretched hand", "twisted", "inverted", "direct", "landed on", "trapped"], { numeric: true }),
    val("hpi", "site_pain", "Where it hurts", "Where exactly is the pain, and is there more than one painful area?", ["site", "wrist", "elbow", "shoulder", "hip", "knee", "ankle", "foot", "thigh", "more than one", "also"]),
    yn("hpi", "deformity_swelling", "Deformity or swelling", "Is the limb visibly deformed, shortened, rotated, or rapidly swelling?", ["deformity", "shortened", "rotated", "bent", "angulated", "swelling", "rapid", "bruising"]),
    yn("hpi", "weight_bearing_use", "Able to use the limb", "Could the patient walk or use the limb immediately after, and can they now?", ["could walk", "cannot walk", "bear weight", "four steps", "immediately after", "cannot use", "cannot lift", "cannot grip"]),
    yn("hpi", "heard_sound", "A sound at the time", "Was any snap, crack or pop heard or felt at the moment of injury?", ["snap", "crack", "pop", "heard", "felt", "giving way", "tearing"]),
    yn("associated", "open_wound", "Break in the skin", "Is there any wound, graze or bleeding over the injured area, and was bone visible?", ["wound", "cut", "graze", "bleeding", "bone visible", "open", "exposed", "dirty", "contaminated"]),
    yn("associated", "numbness_tingling_limb", "Numbness or tingling", "Any numbness, tingling, or loss of feeling beyond the injury?", ["numbness", "tingling", "loss of feeling", "pins and needles", "cannot feel", "fingers", "toes"]),
    yn("associated", "coldness_colour", "Colour or temperature of the limb", "Are the fingers or toes beyond the injury cold, pale, blue, or is the pulse absent?", ["cold", "pale", "blue", "dusky", "white", "no pulse", "cannot feel pulse", "colour change"]),
    yn("associated", "pain_severity_progression", "Pain out of proportion", "Is the pain far worse than expected, increasing despite rest, or worse on stretching the fingers or toes?", ["worse than expected", "out of proportion", "increasing", "severe", "on stretching", "unbearable", "not relieved", "tight"]),
    yn("associated", "other_injuries_limb", "Injuries elsewhere", "Any injury to the head, chest, abdomen, spine or another limb?", ["head", "chest", "abdomen", "spine", "another limb", "multiple", "other injuries"]),
    yn("associated", "previous_problem_limb", "Previous problem with that limb", "Any previous injury, surgery, or long-standing pain in the same limb?", ["previous injury", "surgery", "implant", "plate", "long standing pain", "same limb", "operated"], { tier: "detailed" }),
    // Red flags
    yn("red_flag", "open_fracture", "Wound over a suspected fracture", "Is there a wound, however small, over the site of a suspected fracture, and how long ago and how dirty was it?", ["wound over", "open fracture", "bone visible", "bleeding", "small puncture", "dirty", "soil", "hours ago", "field"], { teach: "Any wound over a fracture makes it an open injury, and the time since and the contamination drive how urgently it must reach theatre." }),
    yn("red_flag", "neurovascular_compromise", "Cold, pale or pulseless limb", "Is the limb beyond the injury cold, pale, blue, numb, or without a pulse?", ["cold", "pale", "blue", "numb", "no pulse", "pulseless", "cannot move", "white", "dusky"], { teach: "A limb without circulation tolerates only a few hours, so this question is asked before imaging and repeated after any manipulation." }),
    yn("red_flag", "compartment_features", "Pain far out of proportion, worse on stretching", "Is the pain far greater than the injury suggests, increasing, tight, and much worse when the fingers or toes are stretched?", ["out of proportion", "increasing", "tight", "tense", "on stretching", "unbearable", "not relieved", "swollen hard", "pins and needles"], { teach: "Pain out of proportion that worsens on passive stretching is the earliest sign of a compartment under pressure, and it appears long before the pulse disappears." }),
    yn("red_flag", "deformity_dislocation", "Obvious deformity or a joint locked out of position", "Is the limb obviously deformed, shortened or rotated, or is a joint fixed and unable to move?", ["deformity", "shortened", "rotated", "locked", "fixed", "cannot move joint", "out of position", "dislocated"], { teach: "A dislocated joint left in position damages the cartilage and the vessels around it, so recognising it early matters as much as the fracture." }),
    yn("red_flag", "hip_fracture_elderly", "Elderly patient unable to bear weight after a fall", "Is an older patient unable to stand or bear weight after a fall, with the leg short or turned outwards?", ["elderly", "older", "cannot stand", "cannot bear weight", "after a fall", "short", "turned out", "externally rotated", "groin pain"], { teach: "In an older person a hip fracture may follow a trivial fall, and the delay to surgery is a strong determinant of the outcome." }),
    yn("red_flag", "pathological_fracture", "Fracture after a trivial injury", "Did the bone break after very little force, or was there pain in that bone before the injury?", ["trivial", "little force", "minor fall", "pain before", "night pain", "cancer", "known malignancy", "weak bone", "steroid"], { teach: "A break after minimal force, or bone pain preceding it, raises a lesion weakening the bone rather than a simple injury." }),
    yn("red_flag", "cause_of_fall_limb", "Why the fall happened", "Was there giddiness, chest pain, palpitations, a blackout or a seizure that caused the fall?", ["giddiness", "chest pain", "palpitations", "blackout", "fainted", "seizure", "collapsed", "slipped", "tripped", "sugar"], { teach: "The fracture is sometimes the least important part of the episode, and a collapse that caused the fall needs its own history." }),
    yn("red_flag", "spine_injury_limb", "Neck or back pain, or weakness", "Any neck or back pain, or weakness, numbness or bladder change since the injury?", ["neck pain", "back pain", "spine", "weakness", "numbness", "bladder", "cannot move legs", "tingling"], { tier: "detailed", teach: "A high-energy limb injury travels with spinal injury often enough that the spine is asked about before the patient is moved." }),
    yn("exposure", "tetanus_status", "Tetanus immunisation", "When was the last tetanus immunisation?", ["tetanus", "tt", "immunisation", "booster", "last", "years ago", "not taken", "unknown"]),
    yn("exposure", "comorbidity_limb", "Diabetes, steroids or bone disease", "Any diabetes, long-term steroids, thin bones, or known bone disease?", ["diabetes", "steroid", "steroids", "osteoporosis", "thin bones", "bone disease", "previous fractures"]),
    yn("exposure", "anticoagulant_limb", "Blood thinners", "Is the patient on blood thinners or aspirin?", ["blood thinner", "warfarin", "aspirin", "clopidogrel", "anticoagulant"]),
    yn("exposure", "first_aid_given", "First aid before arrival", "What was done before arrival — a splint, a bandage, traditional bone-setting, or manipulation?", ["splint", "bandage", "plaster", "bone setter", "traditional", "massage", "manipulated", "tied", "outside"], { tier: "detailed" }),
  ],
  differentials: [
    { id: "fracture", name: "Fracture", pointers: ["deformity_swelling", "weight_bearing_use", "heard_sound", "mechanism_injury"], discriminators: ["deformity_swelling", "weight_bearing_use", "heard_sound", "mechanism_injury", "energy_position", "site_pain", "hip_fracture_elderly"] },
    { id: "dislocation", name: "Dislocation", pointers: ["deformity_dislocation", "heard_sound"], discriminators: ["deformity_dislocation", "heard_sound", "weight_bearing_use", "site_pain", "neurovascular_compromise"] },
    { id: "ligament_tendon", name: "Ligament or tendon injury", pointers: ["heard_sound", "mechanism_injury", "weight_bearing_use"], discriminators: ["heard_sound", "mechanism_injury", "weight_bearing_use", "deformity_swelling", "site_pain"] },
    { id: "contusion", name: "Soft tissue contusion", pointers: ["mechanism_injury", "deformity_swelling"], discriminators: ["mechanism_injury", "deformity_swelling", "weight_bearing_use", "heard_sound", "pain_severity_progression"] },
    { id: "open_fracture_d", name: "Open fracture", pointers: ["open_fracture", "open_wound"], discriminators: ["open_fracture", "open_wound", "tetanus_status", "mechanism_injury", "first_aid_given"] },
    { id: "compartment_syndrome", name: "Compartment syndrome", pointers: ["compartment_features", "pain_severity_progression", "numbness_tingling_limb"], discriminators: ["compartment_features", "pain_severity_progression", "numbness_tingling_limb", "first_aid_given", "energy_position"] },
    { id: "neurovascular_injury", name: "Neurovascular injury", pointers: ["neurovascular_compromise", "coldness_colour", "numbness_tingling_limb"], discriminators: ["neurovascular_compromise", "coldness_colour", "numbness_tingling_limb", "deformity_dislocation", "first_aid_given"] },
    { id: "pathological", name: "Pathological fracture", pointers: ["pathological_fracture", "previous_problem_limb", "comorbidity_limb"], discriminators: ["pathological_fracture", "previous_problem_limb", "comorbidity_limb", "energy_position", "mechanism_injury"] },
    { id: "collapse_then_fall", name: "Collapse that caused the fall", pointers: ["cause_of_fall_limb"], discriminators: ["cause_of_fall_limb", "mechanism_injury", "other_injuries_limb", "hip_fracture_elderly"] },
  ],
  output: {
    durationSlot: "duration",
    hpiOrder: ["onset", "duration", "mechanism_injury", "energy_position", "site_pain", "deformity_swelling", "weight_bearing_use", "heard_sound", "progression", "prior_treatment", "prior_investigations"],
  },
};
