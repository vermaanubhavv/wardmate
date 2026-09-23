import type { HistoryTree } from "@/lib/history-check/types";
import { BAILEY_LOVE, commonHpi, HUTCHISONS, MACLEODS, PREGNANCY, val, yn } from "@/content/history-trees/_helpers";

/**
 * BURNS — v1.0.0. CLINICAL CONTENT: PENDING CLINICIAN REVIEW.
 * Burns and plastic surgery unit, north India, where kitchen flame burns, kerosene stoves and
 * electrical injuries dominate. The history is short and specific: what burned, for how long,
 * in what space, what was poured on it afterwards, and the exact time it happened — that time
 * anchors everything that follows. A burn in a closed space asks about the airway first.
 * The circumstances are recorded as given, without comment, because that record matters later.
 * Differentials: flame burn, scald, electrical injury, chemical burn, friction or contact burn,
 * inhalational injury accompanying any of them.
 */
export const burnsV1: HistoryTree = {
  id: "burns",
  version: "1.0.0",
  complaint: "Burns",
  triggers: ["burn", "burns", "burnt", "scald", "flame burn", "fire", "electric burn", "electrocution", "chemical burn", "acid", "jal gaya", "stove burst", "kerosene", "boiling water"],
  setting: "Burns and plastic surgery unit, north India",
  reviewStatus: "pending_clinician_review",
  reviewedBy: null,
  references: [BAILEY_LOVE, MACLEODS, HUTCHISONS],
  slots: [
    ...commonHpi("burn"),
    val("hpi", "time_of_injury", "Exact time of the burn", "At what time did the burn happen, and how many hours have passed since?", ["time", "hours ago", "this morning", "last night", "am", "pm", "since", "o'clock", "minutes ago"], { numeric: true, teach: "Every calculation that follows a burn is counted from the time of injury, not from the time of arrival." }),
    val("hpi", "agent", "What caused the burn", "What caused the burn — flame, hot liquid, electricity, a chemical, or a hot surface?", ["flame", "fire", "stove", "kerosene", "lpg", "hot water", "boiling", "oil", "scald", "electric", "current", "wire", "acid", "alkali", "chemical", "hot surface", "exhaust"]),
    val("hpi", "circumstances", "How it happened, as described", "How did it happen, in the words of the patient or the attendant, and who else was present?", ["cooking", "stove burst", "lamp", "cylinder", "clothes caught", "fell into", "poured", "quarrel", "alone", "who was present", "own words", "accidental"], { teach: "The circumstances are recorded as they are given, in the informant's words, because this account is read again long after the admission." }),
    val("hpi", "body_areas", "Which parts of the body are burnt", "Which parts of the body are burnt, and are the face, hands, feet or genitals involved?", ["face", "neck", "chest", "abdomen", "back", "arms", "hands", "legs", "feet", "genitals", "front", "back of", "circumferential", "both"]),
    yn("hpi", "closed_space", "Burnt in a closed room or vehicle", "Did the burn happen in a closed room, a vehicle, or anywhere with smoke that could not escape?", ["closed room", "locked", "vehicle", "smoke", "could not escape", "open place", "outdoors", "trapped", "door closed"], { teach: "A burn in an enclosed space raises injury to the airway from hot gases and smoke, which develops over hours after the skin injury is treated." }),
    val("hpi", "duration_contact", "How long the burning continued", "How long did the burning continue, and how were the flames put out or the clothes removed?", ["seconds", "minutes", "rolled", "water", "blanket", "clothes removed", "clothes stuck", "synthetic", "put out by", "kept burning"], { tier: "detailed" }),
    yn("hpi", "first_aid", "What was done immediately after", "What was applied or done immediately afterwards — cool running water, or something else put on the burn?", ["water", "running water", "cooled", "ice", "toothpaste", "oil", "ghee", "ink", "turmeric", "haldi", "cloth", "nothing", "bandaged"], { teach: "What was applied before arrival changes what is found on the surface, and household applications are given only if the question is asked without reproach." }),
    yn("associated", "pain_sensation", "Pain in the burnt areas", "Are the burnt areas painful, or is any part numb and painless?", ["painful", "severe pain", "burning pain", "numb", "painless", "no sensation", "less pain", "white areas"], { tier: "detailed", teach: "An area that is painless within a painful burn asks whether the burn has gone deeper than the skin's nerve endings." }),
    yn("associated", "other_injuries", "Fall, jump, blast or injury besides the burn", "Was there any fall, jump from a height, blast, or road accident along with the burn?", ["fall", "jumped", "height", "blast", "explosion", "road accident", "hit", "fracture", "head injury", "unconscious"]),
    yn("associated", "urine_output", "Passing urine since the burn", "Has urine been passed since the burn, how much, and what colour?", ["passed urine", "not passed", "how much", "less", "dark", "cola coloured", "red", "tea coloured", "clear"], { teach: "Dark or cola coloured urine after a burn, particularly an electrical one, asks about muscle breakdown reaching the kidneys." }),
    yn("associated", "comorbidity", "Diabetes, epilepsy, heart or lung disease", "Any diabetes, epilepsy, heart or lung disease, or long-term medicines?", ["diabetes", "epilepsy", "fits", "heart disease", "lung disease", "asthma", "copd", "long term", "elderly", "tablets"], { tier: "detailed" }),
    yn("exposure", "tetanus_status", "Tetanus immunisation", "When was the last tetanus immunisation, and is it known at all?", ["tetanus", "tt", "injection", "years ago", "not known", "recent", "childhood", "not taken"]),
    // Red flags
    yn("red_flag", "airway_symptoms", "Hoarse voice, cough with black sputum, singed face", "Any hoarseness, noisy breathing, cough with black spit, or singed hair on the face and inside the nose?", ["hoarse", "voice change", "noisy breathing", "stridor", "black sputum", "soot", "singed", "eyebrows", "nasal hair", "burnt face", "difficulty breathing"], { teach: "Hoarseness, soot in the spit and singed facial hair after a burn in a closed space raise an airway that will swell over the next hours." }),
    yn("red_flag", "breathing_difficulty", "Breathlessness or chest tightness", "Any breathlessness, chest tightness, or wheeze since the burn?", ["breathless", "difficulty breathing", "chest tightness", "wheeze", "fast breathing", "cannot lie flat", "cyanosis", "smoke"], { teach: "Breathlessness after smoke exposure can mean injury to the lung below the voice box even when the airway itself looks clear." }),
    yn("red_flag", "circumferential_burn", "Burn going right around a limb, the neck or the chest", "Does the burn go right around an arm, leg, the neck, or the chest?", ["circumferential", "all around", "whole limb", "around the arm", "around the leg", "neck", "chest wall", "tight", "swollen"], { teach: "A burn encircling a limb or the chest tightens as swelling develops, restricting blood flow or breathing without any new event." }),
    yn("red_flag", "electrical_high_voltage", "Electrical injury, entry and exit points", "Was this an electrical injury, from a high tension line or household supply, and where did the current enter and leave?", ["electric", "current", "high tension", "wire", "pole", "household", "entry", "exit", "thrown", "unconscious", "palpitations"], { teach: "An electrical burn destroys tissue along the path of the current, so the skin wounds understate the injury between the entry and exit points." }),
    yn("red_flag", "large_area_extremes_of_age", "Large area burnt / very young or very old", "Does the burn cover a large part of the body, and is the patient a young child or an elderly person?", ["large area", "most of body", "half", "extensive", "child", "infant", "elderly", "old", "years"], { teach: "The same area of burn is tolerated differently at the extremes of age, and the area is estimated rather than guessed at from the history alone." }),
    yn("red_flag", "chemical_ongoing", "Chemical still on the skin", "If a chemical caused the burn, what was it, and has it been washed off with running water?", ["acid", "alkali", "lime", "chuna", "cement", "detergent", "washed", "not washed", "still on skin", "clothes soaked", "burning continues"], { teach: "A chemical keeps burning until washed away, so the contact time matters more than the appearance of the skin." }),
    yn("red_flag", "inconsistent_account", "Account that does not fit the injury", "Does the account of how it happened fit the pattern of the burn, and has the account changed between informants?", ["does not fit", "changed", "different account", "delay in bringing", "child", "elderly", "unwitnessed", "consistent", "unclear"], { teach: "An account that changes between informants, or a delay in coming, is recorded as a fact of the history rather than an interpretation of it." }),
    PREGNANCY,
  ],
  differentials: [
    { id: "flame_burn", name: "Flame burn", pointers: ["agent", "closed_space", "body_areas"], discriminators: ["agent", "closed_space", "airway_symptoms", "duration_contact", "body_areas"] },
    { id: "scald", name: "Scald", pointers: ["agent", "duration_contact"], discriminators: ["agent", "duration_contact", "body_areas", "circumstances", "first_aid"] },
    { id: "electrical", name: "Electrical injury", pointers: ["electrical_high_voltage", "urine_output"], discriminators: ["electrical_high_voltage", "urine_output", "other_injuries", "body_areas", "pain_sensation"] },
    { id: "chemical", name: "Chemical burn", pointers: ["chemical_ongoing", "agent"], discriminators: ["chemical_ongoing", "agent", "first_aid", "body_areas", "time_of_injury"] },
    { id: "contact_friction", name: "Contact or friction burn", pointers: ["agent", "body_areas"], discriminators: ["agent", "body_areas", "duration_contact", "other_injuries", "circumstances"] },
    { id: "inhalational", name: "Inhalational injury", pointers: ["airway_symptoms", "closed_space", "breathing_difficulty"], discriminators: ["airway_symptoms", "closed_space", "breathing_difficulty", "agent", "time_of_injury"] },
  ],
  output: {
    durationSlot: "duration",
    hpiOrder: ["onset", "time_of_injury", "duration", "agent", "circumstances", "body_areas", "closed_space", "first_aid", "prior_treatment", "prior_investigations"],
  },
};
