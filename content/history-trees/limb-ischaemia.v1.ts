import type { HistoryTree } from "@/lib/history-check/types";
import { BAILEY_LOVE, commonHpi, HUTCHISONS, MACLEODS, val, yn } from "@/content/history-trees/_helpers";

/**
 * LEG PAIN ON WALKING / COLD PAINFUL LIMB — v1.0.0. CLINICAL CONTENT: REVIEWED (Dr Anubhav Verma).
 * Vascular surgery, north India, where tobacco use starts young and Buerger's disease is not
 * rare. One question splits this history in two: did the pain come on over seconds and minutes,
 * or over months of walking. The acute limb is counted in hours; the chronic one is counted in
 * how far the patient can walk before stopping.
 * Differentials: acute arterial embolus or thrombosis, chronic peripheral arterial disease,
 * thromboangiitis obliterans, diabetic foot with neuropathy, deep vein thrombosis,
 * venous claudication, spinal claudication from canal stenosis, compartment syndrome after
 * injury or reperfusion.
 */
export const limbIschaemiaV1: HistoryTree = {
  id: "limb_ischaemia",
  version: "1.0.0",
  complaint: "Leg pain on walking / cold painful limb",
  triggers: ["claudication", "pain on walking", "calf pain", "leg pain while walking", "cold limb", "cold leg", "cold foot", "pale limb", "blue toes", "gangrene", "blackening of toes", "no pulse", "rest pain", "limb pain at night", "non healing ulcer foot", "numb foot"],
  setting: "Vascular surgery, north India",
  reviewStatus: "reviewed",
  reviewedBy: "Dr Anubhav Verma",
  references: [BAILEY_LOVE, MACLEODS, HUTCHISONS],
  slots: [
    ...commonHpi("limb pain"),
    val("hpi", "side_site", "Which limb and where the pain sits", "Which limb is affected, and where is the pain — buttock, thigh, calf, or foot?", ["right leg", "left leg", "both legs", "buttock", "thigh", "calf", "foot", "toes", "arm", "one side"]),
    val("hpi", "walking_distance", "How far before stopping", "How far can the patient walk before the pain makes them stop, and how long until it eases on standing still?", ["metres", "steps", "one block", "kilometre", "few minutes", "eases on standing", "stops", "less than before", "unchanged", "stairs"], { numeric: true, teach: "The distance before stopping, and whether it has shortened, is how this history measures itself over time." }),
    yn("hpi", "rest_pain", "Pain at rest, worse at night", "Is there pain in the foot at rest, worse lying flat at night, eased by hanging the leg down?", ["rest pain", "at night", "lying flat", "hanging leg", "dangling", "sleeps in chair", "wakes with pain", "no rest pain"], { teach: "Pain in the forefoot at night that eases when the leg hangs down marks a limb whose blood supply is barely meeting its resting needs." }),
    yn("hpi", "colour_temperature", "Colour and temperature of the limb", "Has the limb changed colour or become cold — pale, blue, mottled, or blackened at the toes?", ["pale", "white", "blue", "mottled", "dusky", "black", "cold", "colder than other", "warm", "normal colour"]),
    yn("hpi", "numbness_weakness", "Numbness or weakness of the limb", "Any numbness, pins and needles, or weakness in moving the foot or toes?", ["numbness", "pins and needles", "tingling", "weakness", "cannot move", "foot drop", "heavy", "sensation normal"], { teach: "Numbness and weakness in a painful cold limb mark nerve and muscle that have already lost their supply, which changes how much time is left." }),
    yn("associated", "ulcer_gangrene", "Ulcer or blackening that will not heal", "Any ulcer, wound or blackened area on the foot or toes that is not healing, and for how long?", ["ulcer", "wound", "not healing", "black", "gangrene", "toe", "heel", "between toes", "discharge", "smell", "weeks", "months"]),
    yn("associated", "swelling_calf", "Swelling of the limb", "Is the limb swollen, and did the swelling come before or after the pain?", ["swelling", "swollen", "calf", "whole leg", "after the pain", "before", "tight", "not swollen", "pitting"], { teach: "A swollen tender calf with pain that is not brought on by walking asks about the veins rather than the arteries." }),
    yn("associated", "back_pain_posture", "Back pain / relief on bending forward", "Any low back pain, and does the leg pain ease on sitting or bending forward rather than on standing still?", ["back pain", "bending forward", "sitting", "cycling", "downhill", "uphill", "eases on sitting", "standing still", "radiating"], { tier: "detailed", teach: "Leg pain on walking that eases only on bending forward rather than on standing still asks about the spinal canal instead of the arteries." }),
    yn("associated", "cardiac_history", "Irregular heartbeat, heart attack, or stroke", "Any irregular heartbeat, past heart attack, heart valve disease, or stroke?", ["irregular", "palpitations", "atrial fibrillation", "heart attack", "valve", "stroke", "paralysis", "bypass", "stent", "angina"], { teach: "An irregular pulse or a recent heart attack raises a clot travelling to the limb rather than a narrowing that grew slowly." }),
    yn("associated", "diabetes_risk_factors", "Diabetes, high blood pressure, cholesterol, kidney disease", "Any diabetes, high blood pressure, high cholesterol, or kidney disease, and for how many years?", ["diabetes", "sugar", "hypertension", "blood pressure", "cholesterol", "lipids", "kidney", "dialysis", "years", "uncontrolled"]),
    yn("associated", "prior_vascular_intervention", "Past angioplasty, bypass or amputation", "Any previous angioplasty, bypass surgery, or amputation of a toe or limb?", ["angioplasty", "stent", "bypass", "graft", "amputation", "toe removed", "previous surgery", "same leg", "other leg"], { tier: "detailed" }),
    yn("associated", "immobility_travel_surgery", "Recent immobility, long travel, surgery or plaster", "Any recent long journey, bed rest, surgery, plaster cast, or a period of immobility?", ["long journey", "bus", "train", "bed rest", "immobile", "surgery", "plaster", "cast", "fracture", "weeks"], { tier: "detailed" }),
    yn("exposure", "tobacco_use", "Tobacco, and how much and for how long", "Any smoking, bidi, or chewing tobacco, how much a day, and for how many years?", ["smoking", "bidi", "cigarette", "tobacco", "chewing", "gutka", "years", "packs", "daily", "quit", "still smoking"], { teach: "Tobacco is the exposure that most changes the course of every arterial disease in this group, and the amount and duration are asked because the answer guides nothing else in the history." }),
    yn("exposure", "family_clot_history", "Clots in the family / previous clot", "Any previous clot in a leg or lung, or a clotting problem in the family?", ["previous clot", "dvt", "lung clot", "pulmonary embolism", "family", "clotting disorder", "recurrent", "miscarriages"], { tier: "detailed" }),
    // Red flags
    yn("red_flag", "sudden_onset_cold_limb", "Sudden cold, pale, painful limb", "Did the limb become cold, pale and painful suddenly, and at what exact time?", ["sudden", "suddenly", "minutes", "exact time", "cold", "pale", "severe pain", "hours ago", "gradual"], { teach: "A limb that turns cold and painful over minutes is counted in hours from that moment, because muscle and nerve do not tolerate the loss for long." }),
    yn("red_flag", "paralysis_anaesthesia", "Cannot move or feel the limb", "Can the patient move the toes and feel touch on the foot, or has movement or sensation gone?", ["cannot move", "paralysed", "no movement", "no sensation", "numb", "cannot feel", "toes", "moving normally", "feels touch"], { teach: "Loss of movement and sensation in an acutely cold limb marks tissue that has already been without supply for some time." }),
    yn("red_flag", "muscle_tenderness_tense", "Tense, tender calf with pain on stretching", "Is the calf or forearm tense and hard, with severe pain on stretching the toes or fingers?", ["tense", "hard", "woody", "tender", "severe pain", "on stretching", "out of proportion", "swollen", "shiny skin"], { teach: "A tense tender muscle compartment with pain on passive stretch raises pressure inside the compartment cutting off its own supply." }),
    yn("red_flag", "spreading_infection_fever", "Spreading redness, fever, or foul smelling wound", "Any fever, spreading redness up the limb, pus, or a foul smelling wound?", ["fever", "spreading", "redness", "up the leg", "pus", "foul smell", "crepitus", "black discharge", "rapidly", "unwell"], { teach: "Fever with a spreading foul wound in a poorly supplied foot raises infection tracking beyond the skin, which moves faster in diabetes." }),
    yn("red_flag", "swollen_tender_leg_breathless", "Swollen tender leg with chest pain or breathlessness", "Any breathlessness or chest pain along with a swollen tender leg?", ["breathless", "chest pain", "swollen leg", "tender calf", "cough", "blood in spit", "fast breathing", "collapse"], { teach: "Breathlessness with a swollen tender leg raises a clot that has travelled from the leg to the lungs." }),
    yn("red_flag", "young_smoker_digital", "Young tobacco user with painful fingers or toes", "In a young tobacco user, are the fingers or toes painful, blue, or ulcerating, and does cold make it worse?", ["young", "tobacco", "fingers", "toes", "blue", "ulcer", "cold makes worse", "colour changes", "both hands", "migratory"], { teach: "Painful ulcerating digits in a young tobacco user raise an arteritis of the small vessels, which follows a different course from atherosclerosis." }),
  ],
  differentials: [
    { id: "acute_limb_ischaemia", name: "Acute arterial embolus or thrombosis", pointers: ["sudden_onset_cold_limb", "paralysis_anaesthesia", "cardiac_history"], discriminators: ["sudden_onset_cold_limb", "paralysis_anaesthesia", "cardiac_history", "colour_temperature", "onset_mode"] },
    { id: "chronic_pad", name: "Chronic peripheral arterial disease", pointers: ["walking_distance", "rest_pain", "diabetes_risk_factors"], discriminators: ["walking_distance", "rest_pain", "diabetes_risk_factors", "tobacco_use", "ulcer_gangrene"] },
    { id: "buergers", name: "Thromboangiitis obliterans", pointers: ["young_smoker_digital", "tobacco_use"], discriminators: ["young_smoker_digital", "tobacco_use", "ulcer_gangrene", "side_site", "diabetes_risk_factors"] },
    { id: "diabetic_foot", name: "Diabetic foot with neuropathy", pointers: ["diabetes_risk_factors", "ulcer_gangrene", "numbness_weakness"], discriminators: ["diabetes_risk_factors", "ulcer_gangrene", "numbness_weakness", "spreading_infection_fever", "rest_pain"] },
    { id: "dvt", name: "Deep vein thrombosis", pointers: ["swelling_calf", "immobility_travel_surgery", "family_clot_history"], discriminators: ["swelling_calf", "immobility_travel_surgery", "family_clot_history", "colour_temperature", "swollen_tender_leg_breathless"] },
    { id: "venous_claudication", name: "Venous claudication", pointers: ["swelling_calf", "walking_distance"], discriminators: ["swelling_calf", "walking_distance", "rest_pain", "family_clot_history", "colour_temperature"] },
    { id: "spinal_claudication", name: "Spinal canal stenosis", pointers: ["back_pain_posture", "walking_distance"], discriminators: ["back_pain_posture", "walking_distance", "rest_pain", "colour_temperature", "numbness_weakness"] },
    { id: "compartment_syndrome", name: "Compartment syndrome", pointers: ["muscle_tenderness_tense"], discriminators: ["muscle_tenderness_tense", "onset_mode", "numbness_weakness", "swelling_calf", "paralysis_anaesthesia"] },
  ],
  output: {
    durationSlot: "duration",
    hpiOrder: ["onset", "duration", "onset_mode", "side_site", "walking_distance", "rest_pain", "colour_temperature", "numbness_weakness", "progression", "prior_treatment", "prior_investigations"],
  },
};
