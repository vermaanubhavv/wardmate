import type { HistoryTree } from "@/lib/history-check/types";
import { ATLS, BAILEY_LOVE, commonHpi, MACLEODS, PREGNANCY, SABISTON, surgicalBackground, val, yn } from "@/content/history-trees/_helpers";

/**
 * BURNS — v1.0.0. CLINICAL CONTENT: REVIEWED (Dr Anubhav Verma).
 * Burns / emergency ward, north India. What happened, in what space, and how long ago decides
 * almost everything that follows, so the mechanism questions come before the burn itself. The
 * differentials here are not diseases but the things the history separates: an airway that will
 * swell, a burn deeper than it looks, deep damage under intact skin after an electrical injury,
 * a chemical still in contact, an injury that came with the burn, a burn that was not an
 * accident, and a late presentation that has become infected.
 *
 * How the burn happened is asked neutrally and recorded in the informant's own words. A
 * deliberate burn is a question, never an inference from the injury.
 */
export const burnsV1: HistoryTree = {
  id: "burns",
  version: "1.0.0",
  complaint: "Burns",
  triggers: ["burn", "burns", "burnt", "scald", "scalded", "flame burn", "electric burn", "electrical burn", "chemical burn", "jal gaya", "jal gayi", "stove burst", "hot water fell"],
  setting: "Burns / emergency ward, north India",
  reviewStatus: "reviewed",
  reviewedBy: "Dr Anubhav Verma",
  references: [ATLS, BAILEY_LOVE, SABISTON, MACLEODS],
  slots: [
    ...commonHpi("burn"),
    val("hpi", "time_since_injury", "Time since the burn", "At what time did the burn happen, and how long ago was that?", ["hours ago", "hour ago", "this morning", "last night", "yesterday", "days ago", "at about", "time of injury", "brought immediately"], { numeric: true }),
    val("hpi", "mechanism", "How the burn happened", "How did the burn happen — flame, hot liquid, a hot object, electricity, a chemical, or a blast?", ["flame", "fire", "stove", "kerosene", "lpg", "cylinder", "hot water", "scald", "hot oil", "hot object", "electric", "electricity", "current", "chemical", "acid", "alkali", "blast", "cracker"]),
    val("hpi", "where_it_happened", "Where it happened", "Where did it happen — inside a closed room, in the open, or at work?", ["closed room", "inside the house", "kitchen", "in the open", "outdoors", "at work", "factory", "field", "vehicle", "locked", "door closed"]),
    yn("hpi", "clothes_caught_fire", "Clothes caught fire", "Did the clothes catch fire, and how were the flames put out?", ["clothes caught fire", "saree caught", "dupatta", "synthetic", "rolled on the ground", "water poured", "blanket", "clothes removed", "clothes stuck"]),
    val("hpi", "area_involved", "Which parts of the body", "Which parts of the body are burnt — face, neck, chest, back, arms, legs, hands, feet, or the genital area?", ["face", "neck", "chest", "back", "abdomen", "arms", "hands", "legs", "feet", "genital", "perineum", "both", "one side", "whole body"]),
    yn("hpi", "circumferential", "Burn going all the way round", "Does the burn go all the way around a limb, the chest or the neck, and does the skin feel tight there?", ["all the way round", "circumferential", "whole arm", "whole leg", "around the chest", "around the neck", "tight", "constricting", "swelling of the hand"]),
    yn("hpi", "blisters_sensation", "Blisters and sensation", "Are there blisters, and is the burnt skin painful to touch or has it gone numb?", ["blisters", "blister", "peeling", "raw", "painful to touch", "very painful", "numb", "no sensation", "white", "charred", "leathery", "dry"]),
    val("hpi", "first_aid", "What was done first", "What was put on the burn or done for it before reaching hospital?", ["cold water", "running water", "ice", "toothpaste", "haldi", "turmeric", "oil", "ghee", "ointment", "cloth", "nothing applied", "local doctor", "dressing done", "fluids given"]),
    yn("associated", "smoke_exposure", "Smoke in a closed space", "Was the patient in smoke or in a closed space with the fire, and for how long?", ["smoke", "closed space", "trapped", "could not get out", "locked room", "thick smoke", "inhaled smoke", "unconscious at the scene", "got out immediately"]),
    yn("associated", "fall_blast_jump", "A fall, blast or jump with the burn", "Did the patient also fall, jump from a height, or get thrown by a blast?", ["fell", "fall", "jumped", "from a height", "blast", "thrown", "hit by", "road accident", "no fall"]),
    yn("associated", "urine_colour", "Colour of the urine", "Has the patient passed urine since the burn, and what colour was it?", ["passed urine", "not passed urine", "dark urine", "cola coloured", "red urine", "brown urine", "normal colour", "very little"]),
    yn("associated", "thirst_vomiting", "Thirst, vomiting or restlessness", "Is the patient very thirsty, vomiting, or restless?", ["very thirsty", "thirst", "asking for water", "vomiting", "restless", "agitated", "irritable", "calm"], { tier: "detailed" }),
    val("exposure", "tetanus_status", "Tetanus cover", "When was the last tetanus injection, and is anything known about it?", ["tetanus", "tt", "injection taken", "last taken", "years ago", "not taken", "not known", "immunised"], { tier: "detailed" }),
    yn("exposure", "electrical_details", "Details of an electrical injury", "For an electrical injury: was it a household or a high-tension line, was the patient thrown or held on, and where did the current go in and come out?", ["household", "high tension", "ht line", "eleven kv", "thrown", "held on", "could not let go", "entry", "exit", "hand", "foot", "wet"]),
    yn("exposure", "chemical_details", "Details of a chemical burn", "For a chemical burn: what was the substance, how long was it in contact, and was it washed off?", ["acid", "alkali", "lime", "cement", "cleaning agent", "battery", "thrown on", "splashed", "washed off", "how long in contact", "still on the skin"]),
    // Red flags
    yn("red_flag", "airway_features", "Voice, breathing, soot and singed hair", "Is the voice hoarse, is the breathing noisy or difficult, or is there soot in the mouth or nose, singed nasal hair, or burns around the mouth?", ["hoarse", "voice change", "noisy breathing", "stridor", "difficulty breathing", "soot", "black sputum", "singed", "nasal hair", "burns around the mouth", "swollen lips", "coughing black"], { teach: "The questions about voice, soot and singed hair are asked first in any burn because an airway that is going to swell gives its warning in the history before it does on examination." }),
    yn("red_flag", "closed_space_unconscious", "Closed space or loss of consciousness", "Was the patient trapped in a closed space, or unconscious at any point at the scene?", ["trapped", "closed space", "locked", "unconscious", "found unconscious", "confused at the scene", "could not get out", "pulled out"], { teach: "Being trapped in smoke, or any loss of consciousness at the scene, changes what the burn alone would suggest." }),
    yn("red_flag", "breathing_difficulty_now", "Difficulty breathing now", "Is there any difficulty breathing, wheeze or cough at present?", ["difficulty breathing", "breathless", "wheeze", "cough", "chest tightness", "breathing fast", "comfortable"], { teach: "Breathing difficulty at any point after a burn is asked about separately from the airway questions, because it can begin hours after the injury." }),
    yn("red_flag", "dark_urine_high_voltage", "Dark urine after an electrical or deep burn", "Has the urine been dark, red or brown since the burn?", ["dark urine", "red urine", "brown urine", "cola coloured", "tea coloured", "blood in urine", "clear urine"], { teach: "Dark urine after a deep or electrical burn is asked about because what colours it comes from muscle, not from the kidney." }),
    yn("red_flag", "reduced_urine", "Little or no urine", "Has the patient passed very little urine, or none, since the burn?", ["not passed urine", "very little", "reduced urine", "no urine", "once only", "passing well"], { teach: "How much urine has been passed since the burn is the simplest question the history can ask about how the circulation has coped." }),
    yn("red_flag", "deliberate_or_assault", "Whether the burn was deliberate", "Does the patient or the attendant give any account of the burn being self-inflicted or caused by someone else, and does the account of how it happened stay the same?", ["deliberate", "self inflicted", "poured on herself", "poured on himself", "set fire", "someone poured", "quarrel", "dowry", "assault", "accidental", "account changed", "different account"], { teach: "How the burn happened is asked of the patient and the attendant separately and recorded in their own words; a burn that was not an accident changes who else needs to be involved, and nothing else in the record captures how the burn happened." }),
    yn("red_flag", "late_presentation_infection", "Late presentation with fever or smell", "For a burn that is several days old: is there fever, a smell from the wound, or a change in its colour?", ["days old", "several days", "fever", "smell", "foul smell", "discharge", "colour change", "green", "black", "dressing outside", "not healing"], { teach: "A burn brought in days later asks a different set of questions from one brought in within the hour." }),
    PREGNANCY,
    ...surgicalBackground({ acute: true }),
  ],
  differentials: [
    { id: "inhalation", name: "Inhalation injury / threatened airway", pointers: ["airway_features", "closed_space_unconscious", "smoke_exposure", "breathing_difficulty_now"], discriminators: ["airway_features", "closed_space_unconscious", "smoke_exposure", "breathing_difficulty_now", "where_it_happened", "mechanism"] },
    { id: "deep_burn", name: "Burn deeper than it first appears", pointers: ["blisters_sensation", "mechanism", "clothes_caught_fire"], discriminators: ["blisters_sensation", "mechanism", "clothes_caught_fire", "time_since_injury", "first_aid", "area_involved"] },
    { id: "circumferential_burn", name: "Circumferential burn with a tightening effect", pointers: ["circumferential", "area_involved"], discriminators: ["circumferential", "area_involved", "blisters_sensation", "breathing_difficulty_now"] },
    { id: "electrical", name: "Electrical injury with deep tissue damage", pointers: ["electrical_details", "dark_urine_high_voltage", "fall_blast_jump"], discriminators: ["electrical_details", "dark_urine_high_voltage", "fall_blast_jump", "urine_colour", "blisters_sensation", "reduced_urine"] },
    { id: "chemical", name: "Chemical burn still in contact", pointers: ["chemical_details", "first_aid"], discriminators: ["chemical_details", "first_aid", "blisters_sensation", "time_since_injury", "area_involved"] },
    { id: "associated_trauma", name: "Injury sustained along with the burn", pointers: ["fall_blast_jump", "closed_space_unconscious"], discriminators: ["fall_blast_jump", "closed_space_unconscious", "mechanism", "where_it_happened"] },
    { id: "non_accidental", name: "A burn that was not an accident", pointers: ["deliberate_or_assault"], discriminators: ["deliberate_or_assault", "mechanism", "where_it_happened", "clothes_caught_fire", "informant"] },
    { id: "late_infected", name: "Late presentation, wound infected", pointers: ["late_presentation_infection", "time_since_injury"], discriminators: ["late_presentation_infection", "time_since_injury", "first_aid", "blisters_sensation", "area_involved"] },
    { id: "hypovolaemia", name: "Circulation not keeping up with the burn", pointers: ["reduced_urine", "thirst_vomiting", "area_involved"], discriminators: ["reduced_urine", "thirst_vomiting", "area_involved", "urine_colour", "time_since_injury", "first_aid"] },
  ],
  output: {
    durationSlot: "duration",
    hpiOrder: ["onset", "duration", "time_since_injury", "mechanism", "where_it_happened", "clothes_caught_fire", "area_involved", "circumferential", "blisters_sensation", "first_aid", "progression", "prior_treatment", "prior_investigations"],
  },
};
