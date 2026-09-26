import type { HistoryTree } from "@/lib/history-check/types";
import { commonHpi, HUTCHISONS, MACLEODS, PREGNANCY, val, WHO_SNAKEBITE, yn } from "@/content/history-trees/_helpers";

/**
 * POISONING AND SNAKE BITE — v1.0.0. CLINICAL CONTENT: REVIEWED.
 * Adult medicine / emergency ward, north India. An exposure-led history rather than a
 * symptom-led one: what, how much, when, and what has happened since. The north-Indian casemix
 * makes aluminium phosphide, organophosphate and snake envenomation the dominant three.
 * Time since exposure is the single most decision-changing number in the whole history.
 * Differentials: snake envenomation (neurotoxic or haemotoxic), organophosphate or carbamate,
 * aluminium phosphide, corrosive ingestion, sedative or opioid overdose, alcohol, paracetamol,
 * scorpion sting, plant or household poison, unknown compound.
 *
 * This tree records what was taken and what has happened since. It carries no antidote,
 * decontamination or dosing content of any kind — that belongs to the treating clinician.
 */
export const poisoningSnakebiteV1: HistoryTree = {
  id: "poisoning_snakebite",
  version: "1.0.0",
  complaint: "Poisoning / snake bite",
  triggers: ["poisoning", "poison", "consumed poison", "ingestion", "overdose", "snake bite", "snakebite", "bitten by snake", "scorpion sting", "sting", "insecticide", "pesticide", "celphos", "sulphas", "phosphide", "organophosphate", "self harm", "suicidal attempt", "zeher"],
  setting: "Adult medicine / emergency ward, north India",
  reviewStatus: "reviewed",
  reviewedBy: "Dr. Anubhav, General Surgery — 2026-09-26",
  references: [WHO_SNAKEBITE, MACLEODS, HUTCHISONS],
  slots: [
    ...commonHpi("exposure"),
    val("informant", "witness", "Who found the patient", "Who found the patient, and was the exposure witnessed or only discovered afterwards?", ["found", "witnessed", "saw", "discovered", "family", "neighbour", "unwitnessed", "alone", "brought by"]),
    val("hpi", "substance", "What was taken or what bit", "What exactly was taken or what bit the patient, and was the container, label, tablet strip or the animal brought along?", ["tablet", "liquid", "powder", "insecticide", "pesticide", "rat poison", "celphos", "phosphide", "organophosphate", "kerosene", "acid", "snake", "scorpion", "container", "label", "strip", "bottle", "unknown"]),
    val("hpi", "quantity", "How much", "How much was taken — how many tablets, how many mouthfuls, or what fraction of the container?", ["tablets", "mouthfuls", "sips", "half", "full", "quarter", "bottle", "packet", "how much", "amount", "spoon"], { numeric: true }),
    val("hpi", "time_since", "Time since exposure", "Exactly what time did it happen, and how many hours ago was that?", ["hours ago", "minutes ago", "this morning", "last night", "time", "o clock", "since", "how long ago"], { numeric: true }),
    val("hpi", "route", "Route", "Was it swallowed, inhaled, splashed on the skin or eyes, or injected?", ["swallowed", "ingested", "inhaled", "fumes", "skin", "splashed", "eyes", "injected", "bite", "sting"]),
    val("hpi", "bite_site", "Site of the bite or sting", "Where on the body is the bite or sting, and what has been done to that limb since?", ["foot", "leg", "hand", "finger", "arm", "toe", "site", "tourniquet", "tied", "cut", "incision", "washed", "bandage"]),
    val("hpi", "circumstance", "Circumstances", "What were the circumstances — accidental, occupational, or deliberate self-harm?", ["accidental", "occupational", "spraying", "deliberate", "self harm", "suicidal", "quarrel", "intentional", "mistake", "in the field", "while sleeping"]),
    yn("hpi", "vomiting_since", "Vomiting since", "Has there been any vomiting since, and was anything brought up?", ["vomiting", "vomited", "brought up", "retching", "nausea", "how many times"]),
    yn("hpi", "smell", "Smell noticed", "Was any distinctive smell noticed on the breath or the clothes — kerosene, garlic, or a pesticide smell?", ["smell", "odour", "kerosene", "garlic", "pesticide", "petrol", "alcohol", "no smell"], { tier: "detailed" }),
    // Toxidrome-oriented associated features
    yn("associated", "neuro_paralysis", "Drooping eyelids / double vision / difficulty swallowing", "Any drooping of the eyelids, double vision, difficulty swallowing, or a change in the voice?", ["drooping", "ptosis", "eyelids", "double vision", "diplopia", "difficulty swallowing", "dysphagia", "voice change", "nasal voice", "cannot open eyes", "neck drooping"]),
    yn("associated", "breathing_difficulty", "Difficulty breathing / shallow breathing", "Any difficulty breathing, shallow or laboured breathing, or a feeling of being unable to fill the chest?", ["difficulty breathing", "shallow", "laboured", "cannot breathe", "breathless", "chest tightness", "respiratory", "gasping"]),
    yn("associated", "secretions_miosis", "Excessive saliva / sweating / small pupils", "Any excessive saliva, frothing, sweating, watering eyes, or small pupils?", ["saliva", "frothing", "drooling", "sweating", "watering eyes", "lacrimation", "small pupils", "pinpoint", "miosis", "wet", "secretions"]),
    yn("associated", "bleeding_from_site", "Bleeding from the bite site or gums", "Any persistent bleeding from the bite site, gums, nose, or in the urine?", ["bleeding", "bite site", "oozing", "gums", "nose bleed", "urine", "haematuria", "not clotting", "bruising", "blood"]),
    yn("associated", "local_swelling_pain", "Swelling and pain around the bite", "Is there swelling, severe pain, blackening, or blistering spreading from the bite?", ["swelling", "spreading", "severe pain", "blackening", "blister", "discolouration", "tender", "whole limb", "necrosis"]),
    yn("associated", "abdominal_pain_burning", "Burning in the mouth, throat or abdomen", "Any burning in the mouth, throat, chest or abdomen, or pain on swallowing?", ["burning", "mouth", "throat", "chest", "abdomen", "pain on swallowing", "corrosive", "ulcers in mouth", "white patches"]),
    yn("associated", "altered_sensorium", "Drowsiness / confusion / unconsciousness", "Any drowsiness, confusion, agitation, or loss of consciousness?", ["drowsy", "drowsiness", "confusion", "agitated", "restless", "unconscious", "not responding", "altered sensorium", "sleepy"]),
    yn("associated", "seizure", "Seizure", "Any seizure, fit, or twitching of the limbs?", ["seizure", "fit", "fits", "convulsion", "twitching", "jerking", "fasciculation"]),
    yn("associated", "urine_output", "Urine passed since", "Has urine been passed since the exposure, and what colour was it?", ["urine", "passed urine", "not passed", "reduced", "colour", "dark", "red", "cola", "brown", "black"]),
    yn("associated", "palpitations_chest", "Palpitations / chest discomfort", "Any palpitations, chest discomfort, or giddiness since?", ["palpitations", "chest discomfort", "chest pain", "giddiness", "racing heart", "cold hands"], { tier: "detailed" }),
    // Red flags
    yn("red_flag", "respiratory_failure", "Difficulty breathing or drooping eyelids after a bite", "Any difficulty breathing, drooping eyelids, inability to lift the head, or difficulty swallowing?", ["difficulty breathing", "drooping", "ptosis", "cannot lift head", "neck flop", "difficulty swallowing", "shallow breathing", "gasping", "paralysis"], { teach: "Drooping eyelids or a head that cannot be lifted after a bite marks a paralysis that climbs towards the breathing muscles, and the interval available is short." }),
    yn("red_flag", "non_clotting_blood", "Bleeding that will not stop", "Is blood oozing continuously from the bite site, gums, or an injection site without clotting?", ["not clotting", "oozing", "continuous bleeding", "gums", "injection site", "bite site", "will not stop", "blood thin"], { teach: "Blood that will not clot after a bite marks a venom acting on clotting, which is recognised at the bedside before any report returns." }),
    yn("red_flag", "hypotension_shock", "Giddiness / cold clammy skin / collapse", "Any collapse, giddiness on sitting up, cold clammy skin, or vomiting with severe weakness?", ["collapse", "giddiness", "cold", "clammy", "hypotension", "low bp", "severe weakness", "fainting", "unrecordable", "shock"], { teach: "Circulatory collapse early after ingestion is the pattern of aluminium phosphide, where the fall can be rapid and the window narrow." }),
    yn("red_flag", "phosphide_exposure", "Grain preservative tablet / garlic smell", "Was a grain-preservative tablet taken, or was a garlic-like smell noticed on the breath?", ["celphos", "phosphide", "aluminium phosphide", "grain", "wheat pill", "sulphas", "garlic smell", "garlic", "quickphos", "rat poison tablet"], { teach: "A grain-preservative tablet with a garlic smell names one of the most lethal ingestions in north India, and naming it early changes where the patient is monitored." }),
    yn("red_flag", "cholinergic_crisis", "Frothing / pinpoint pupils / wet chest", "Any frothing at the mouth, pinpoint pupils, wet noisy breathing, or incontinence?", ["frothing", "pinpoint", "miosis", "wet", "noisy breathing", "incontinence", "excessive secretions", "salivation", "bradycardia", "slow pulse"], { teach: "Frothing with pinpoint pupils and a wet chest marks organophosphate or carbamate exposure, a pattern recognised from across the bed." }),
    yn("red_flag", "corrosive_airway", "Burns around the mouth / drooling / hoarse voice", "Any burns or white patches around the mouth, drooling, hoarse voice, or stridor?", ["burns", "white patches", "around the mouth", "drooling", "hoarse", "stridor", "noisy breathing", "swollen lips", "cannot swallow saliva"], { teach: "Burns at the lips with drooling after a corrosive raise swelling of the airway, and attempts to make the patient vomit cause a second injury." }),
    yn("red_flag", "time_critical_delay", "Many hours since exposure", "How many hours have passed since the exposure, and was there any delay in reaching hospital?", ["hours", "delay", "reached late", "overnight", "since morning", "yesterday", "local treatment first", "traditional healer", "jhaad phoonk"], { teach: "Time elapsed governs almost every decision here, and a delay spent with a traditional healer is a common and answerable part of the story." }),
    yn("red_flag", "self_harm_intent", "Ongoing intent to self-harm", "Was the act intended as self-harm, and does the patient still express that intent?", ["self harm", "suicidal", "intentional", "deliberate", "still wishes", "wants to die", "repeat", "quarrel", "stressor", "note"], { teach: "Intent that is still present changes supervision and follow-up as much as the poison itself, and asking it directly is part of the history." }),
    PREGNANCY,
    yn("exposure", "snake_description", "Description of the snake", "Was the snake seen, and what did it look like — colour, size, markings, or was it killed and brought?", ["snake seen", "colour", "black", "brown", "markings", "hood", "krait", "cobra", "viper", "russell", "size", "killed", "brought", "not seen"]),
    yn("exposure", "sleeping_on_floor", "Sleeping on the floor / working in fields at night", "Did the bite happen while sleeping on the floor, or while working or walking in fields at night?", ["sleeping", "on the floor", "at night", "fields", "walking", "barefoot", "grass", "harvest", "in bed", "woke up"], { tier: "detailed" }),
    yn("exposure", "occupational_pesticide", "Pesticide use at work", "Any spraying of pesticides, work in agriculture, or storage of chemicals at home?", ["spraying", "pesticide", "agriculture", "farmer", "insecticide", "stored at home", "occupational", "without mask"], { tier: "detailed" }),
    yn("exposure", "psychiatric_history", "Previous self-harm / psychiatric illness / recent stressor", "Any previous attempt at self-harm, psychiatric illness, or a recent major stressor?", ["previous attempt", "self harm", "psychiatric", "depression", "stressor", "quarrel", "debt", "exam", "marriage", "alcohol dependence"], { tier: "detailed" }),
    yn("exposure", "regular_medicines", "Regular medicines available at home", "What regular medicines are kept at home and were within reach?", ["medicines at home", "regular", "tablets", "available", "within reach", "grandmother", "sedative", "paracetamol", "antiepileptic"], { tier: "detailed" }),
    yn("exposure", "alcohol_co_ingestion", "Alcohol taken along with it", "Was alcohol taken along with the substance?", ["alcohol", "drinking", "along with", "drunk", "liquor", "co ingestion"], { tier: "detailed" }),
  ],
  differentials: [
    { id: "neurotoxic_envenomation", name: "Neurotoxic snake envenomation", pointers: ["neuro_paralysis", "respiratory_failure", "sleeping_on_floor", "snake_description"], discriminators: ["neuro_paralysis", "respiratory_failure", "sleeping_on_floor", "snake_description", "local_swelling_pain", "bite_site", "time_since"] },
    { id: "haemotoxic_envenomation", name: "Haemotoxic snake envenomation", pointers: ["bleeding_from_site", "non_clotting_blood", "local_swelling_pain", "urine_output"], discriminators: ["bleeding_from_site", "non_clotting_blood", "local_swelling_pain", "urine_output", "snake_description", "bite_site"] },
    { id: "organophosphate", name: "Organophosphate or carbamate", pointers: ["secretions_miosis", "cholinergic_crisis", "occupational_pesticide", "smell"], discriminators: ["secretions_miosis", "cholinergic_crisis", "occupational_pesticide", "smell", "seizure", "breathing_difficulty", "substance"] },
    { id: "aluminium_phosphide", name: "Aluminium phosphide", pointers: ["phosphide_exposure", "hypotension_shock", "vomiting_since", "smell"], discriminators: ["phosphide_exposure", "hypotension_shock", "vomiting_since", "smell", "substance", "time_since", "palpitations_chest"] },
    { id: "corrosive", name: "Corrosive ingestion", pointers: ["corrosive_airway", "abdominal_pain_burning", "route"], discriminators: ["corrosive_airway", "abdominal_pain_burning", "route", "substance", "vomiting_since"] },
    { id: "sedative_opioid", name: "Sedative or opioid overdose", pointers: ["altered_sensorium", "regular_medicines", "breathing_difficulty"], discriminators: ["altered_sensorium", "regular_medicines", "breathing_difficulty", "secretions_miosis", "substance", "quantity"] },
    { id: "paracetamol", name: "Paracetamol overdose", pointers: ["regular_medicines", "quantity", "vomiting_since"], discriminators: ["regular_medicines", "quantity", "vomiting_since", "time_since", "substance", "abdominal_pain_burning"] },
    { id: "alcohol", name: "Alcohol intoxication or withdrawal", pointers: ["alcohol_co_ingestion", "altered_sensorium", "seizure"], discriminators: ["alcohol_co_ingestion", "altered_sensorium", "seizure", "smell", "time_since"] },
    { id: "scorpion", name: "Scorpion sting", pointers: ["local_swelling_pain", "palpitations_chest", "bite_site"], discriminators: ["local_swelling_pain", "palpitations_chest", "bite_site", "secretions_miosis", "breathing_difficulty"] },
    { id: "unknown_compound", name: "Unknown compound", pointers: ["substance", "witness"], discriminators: ["substance", "witness", "circumstance", "smell", "quantity", "time_since"] },
  ],
  output: {
    durationSlot: "duration",
    hpiOrder: ["onset", "duration", "time_since", "substance", "quantity", "route", "circumstance", "bite_site", "vomiting_since", "smell", "progression", "prior_treatment", "prior_investigations"],
  },
};
