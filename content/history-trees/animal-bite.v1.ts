import type { HistoryTree } from "@/lib/history-check/types";
import { commonHpi, HUTCHISONS, IMMUNOCOMPROMISE, MACLEODS, NRCP_RABIES, TINTINALLI, val, yn } from "@/content/history-trees/_helpers";

/**
 * ANIMAL BITE (DOG, CAT, MONKEY) — v1.0.0. CLINICAL CONTENT: REVIEWED (Dr Anubhav Verma).
 * Emergency department, north India. Stray dogs, pet dogs and cats, and urban monkeys account
 * for most bites; children are bitten on the face and head more often than adults. The history
 * decides the rabies exposure category under the national guidelines (I: touching or feeding,
 * licks on intact skin; II: nibbling, minor scratches without bleeding; III: bites or scratches
 * that break the skin, licks on broken skin or mucosa, any bat contact), and separately the
 * wound itself — depth, site, contamination and what was done to it. Everything about vaccine
 * or immunoglobulin is asked as a question of what has already happened; the tree carries no
 * schedule or dose. Differentials: category I, II and III exposure, bat exposure, wound
 * infection, deep or crush injury including the hand, facial or head injury, tetanus-prone
 * wound, and established rabies after an earlier exposure. Snake bite is a separate tree.
 */
export const animalBiteV1: HistoryTree = {
  id: "animal_bite",
  version: "1.0.0",
  complaint: "Animal bite (dog, cat, monkey)",
  triggers: ["animal bite", "dog bite", "dog bitten", "bitten by dog", "stray dog bite", "cat bite", "cat scratch", "bitten by cat", "monkey bite", "bitten by monkey", "monkey scratch", "bat bite", "rabies exposure", "anti rabies", "kutte ne kata", "kutta kaat liya", "bandar ne kata", "billi ne kata"],
  setting: "Emergency department, north India",
  reviewStatus: "reviewed",
  reviewedBy: "Dr Anubhav Verma",
  references: [NRCP_RABIES, TINTINALLI, MACLEODS, HUTCHISONS],
  slots: [
    ...commonHpi("bite"),
    val("informant", "bite_witness", "Who saw the bite", "Who saw the bite happen, and for a child, has the child been checked all over for other bites or scratches?", ["saw", "witnessed", "parent", "mother", "father", "neighbour", "no one saw", "child says", "found crying", "checked all over"]),
    // HPI
    val("hpi", "animal_type", "Which animal", "Which animal was it — dog, cat, monkey, bat, or another animal such as a mongoose, jackal or livestock?", ["dog", "puppy", "cat", "kitten", "monkey", "bandar", "bat", "mongoose", "jackal", "fox", "cow", "buffalo", "horse", "donkey", "pig", "rat", "squirrel"]),
    val("hpi", "time_since_bite", "Time since the bite", "When did the bite happen, and how many hours or days ago was that?", ["hours ago", "days ago", "yesterday", "this morning", "last night", "week ago", "time of bite"], { numeric: true }),
    val("hpi", "bite_location", "Site of the bite", "Where on the body is the bite or scratch?", ["face", "head", "neck", "lip", "ear", "hand", "finger", "palm", "arm", "leg", "calf", "thigh", "foot", "buttock", "trunk"]),
    val("hpi", "contact_type", "Type of contact", "Was it a lick on intact skin, a nibble, a scratch without bleeding, a scratch that bled, a bite through the skin, or a lick on broken skin, the lips, mouth or eyes?", ["lick", "licked", "intact skin", "nibble", "nibbled", "scratch", "scratched", "bleeding", "bled", "bite", "teeth marks", "puncture", "broken skin", "mucosa", "lips", "eyes", "saliva"]),
    val("hpi", "wound_count_depth", "Number and depth of wounds", "How many wounds are there, and are they superficial, deep punctures, or tears with loss of tissue?", ["single", "multiple", "wounds", "superficial", "deep", "puncture", "tear", "lacerated", "flap", "tissue loss", "avulsion"], { numeric: true }),
    val("hpi", "wound_washing", "What was done to the wound", "Was the wound washed with soap and running water, for how long and how soon, and was anything applied — chilli, turmeric, lime, oil, ash or a tight dressing?", ["washed", "soap", "running water", "minutes", "not washed", "chilli", "mirchi", "turmeric", "haldi", "lime", "chuna", "oil", "ash", "dressing", "stitched"]),
    val("hpi", "provocation", "Provoked or unprovoked", "Was the bite provoked — teasing, feeding, handling, separating a fight — or did the animal attack without reason?", ["provoked", "unprovoked", "teasing", "feeding", "handling", "petting", "stepped on", "fight", "attacked without reason", "chased", "sudden attack"]),
    val("hpi", "animal_ownership", "Owned or stray", "Is the animal a pet, a community or stray animal, or a wild one?", ["pet", "own dog", "neighbour's dog", "stray", "street dog", "community dog", "wild", "unknown animal", "owned"]),
    yn("hpi", "animal_vaccinated", "Animal vaccinated", "Is the animal known to be vaccinated against rabies, and is there a record of it?", ["vaccinated", "not vaccinated", "vaccination record", "certificate", "unknown", "vet", "rabies vaccine for dog"]),
    val("hpi", "animal_observable", "Can the animal be watched", "Is the animal alive and available to be observed over the next ten days, or has it been killed, died, or gone missing?", ["alive", "observed", "ten days", "10 days", "under observation", "killed", "died", "dead", "missing", "ran away", "cannot be traced", "healthy"]),
    val("hpi", "prophylaxis_since_bite", "Vaccine or immunoglobulin since this bite", "Has any rabies vaccine or immunoglobulin already been given for this bite — where, when, and is the card available?", ["vaccine given", "injection given", "anti rabies", "arv", "immunoglobulin", "rig", "card", "first dose", "district hospital", "phc", "not given", "nothing given"]),
    // Associated
    yn("associated", "wound_pain_redness", "Increasing pain, redness or swelling", "Is the wound becoming more painful, red, swollen or discharging?", ["increasing pain", "redness", "red", "swelling", "swollen", "pus", "discharge", "warm", "throbbing"]),
    yn("associated", "fever_after_bite", "Fever", "Any fever since the bite?", ["fever", "bukhar", "temperature", "chills"]),
    yn("associated", "hand_function", "Difficulty moving a finger or joint", "If the hand was bitten, is there difficulty bending or straightening a finger, numbness, or a wound over a knuckle or joint?", ["cannot bend", "cannot straighten", "finger", "knuckle", "joint", "numbness", "tendon", "stiff finger"]),
    yn("associated", "ongoing_bleeding", "Bleeding from the wound", "Is the wound still bleeding, and how heavily did it bleed?", ["bleeding", "still bleeding", "oozing", "profuse", "soaked", "stopped bleeding"]),
    // Red flags
    yn("red_flag", "category_three_contact", "Skin broken or mucosa exposed", "Did any bite or scratch break the skin and draw blood, or did saliva touch broken skin, the lips, mouth or eyes?", ["broke the skin", "drew blood", "bleeding", "transdermal", "teeth marks", "saliva on wound", "lick on wound", "mucosa", "lips", "in the eye", "in the mouth"], { teach: "Broken skin or saliva on a mucous membrane places the contact in the highest rabies exposure category, where both wound care and full prophylaxis come into question." }),
    yn("red_flag", "head_face_hand_site", "Bite on the head, face, neck or hand", "Is any bite on the head, face, neck, hands or fingers, or are there many bites?", ["head", "face", "neck", "scalp", "lip", "hand", "finger", "multiple bites", "many bites"], { teach: "The head, face, neck and hands are richly supplied with nerves, and bites there are linked with a shorter interval before rabies can appear." }),
    yn("red_flag", "deep_crush_wound", "Deep, crushing or tearing wound", "Is the wound deep, crushed, torn with loss of tissue, or over a joint or tendon?", ["deep", "crushed", "crush", "torn", "tissue loss", "avulsion", "over joint", "tendon", "bone visible", "large wound"], { teach: "A deep, crushed or torn wound carries more infection risk and may involve tendon, joint or bone, especially on the hand." }),
    yn("red_flag", "bat_contact", "Contact with a bat", "Was there any contact with a bat, including one found in the room where someone was sleeping?", ["bat", "chamgadar", "bat in room", "woke with bat", "touched a bat"], { teach: "A bat bite can be too small to see, so any direct bat contact is taken as a serious exposure under the national guidelines." }),
    yn("red_flag", "animal_abnormal_or_died", "Animal ill, abnormal or died", "Was the animal behaving abnormally — aggressive, biting objects, drooling, unable to swallow, paralysed — or has it since died or disappeared?", ["abnormal behaviour", "aggressive", "biting objects", "drooling", "frothing", "paralysed", "died", "dead", "disappeared", "mad dog", "pagal kutta", "bit others"], { teach: "An animal that behaves abnormally, dies or cannot be traced cannot provide the reassurance of observation, which changes how the exposure is judged." }),
    yn("red_flag", "rabies_like_symptoms", "Fear of water, tingling at the bite site", "Any fear of water or of air blowing on the face, difficulty swallowing, agitation, or tingling or pain at an old bite site?", ["fear of water", "hydrophobia", "fear of air", "aerophobia", "cannot drink", "difficulty swallowing", "agitation", "tingling at bite", "pain at old bite", "spasms", "excessive saliva"], { teach: "Fear of water or of a breeze, and tingling at a healed bite site, are the earliest recognised features of clinical rabies and change everything that follows." }),
    yn("red_flag", "spreading_infection", "Spreading infection", "Is redness spreading up the limb, are there red streaks or painful lumps in the armpit or groin, or is a joint near the bite swollen?", ["spreading redness", "red streaks", "lymphangitis", "lumps in armpit", "lumps in groin", "swollen joint", "abscess", "pus"], { teach: "Spreading redness, red streaks or a swollen joint after a bite, particularly a cat bite to the hand, can progress within hours." }),
    yn("red_flag", "late_presentation", "Delay before first care", "How many days passed between the bite and the first visit to any health facility?", ["days later", "delay", "came late", "did not come", "first visit", "traditional healer", "jhaad phoonk", "local treatment"], { teach: "A delay before care is common, and the interval since the bite matters both for the wound and for how prophylaxis is approached." }),
    IMMUNOCOMPROMISE,
    // Background
    yn("exposure", "previous_rabies_vaccination", "Previous rabies vaccination", "Has the patient ever had a course of rabies vaccine before, for an earlier bite or before exposure at work, and is the record available?", ["previous vaccination", "vaccinated before", "earlier bite", "full course", "incomplete course", "pre exposure", "record", "card", "never vaccinated"], { teach: "Whether an earlier course was completed, and when, is asked because the guidelines treat a previously vaccinated person differently." }),
    yn("exposure", "previous_immunoglobulin", "Previous rabies immunoglobulin", "Has the patient ever received rabies immunoglobulin before, and was there any reaction?", ["immunoglobulin", "rig", "erig", "hrig", "serum", "reaction", "never received"], { tier: "detailed" }),
    yn("exposure", "tetanus_immunisation", "Tetanus immunisation", "When was the last tetanus immunisation, and is it known at all?", ["tetanus", "tt", "tetanus injection", "last tetanus", "not known", "never"]),
    yn("exposure", "others_bitten", "Others bitten by the same animal", "Were other people or animals bitten by the same animal?", ["others bitten", "bit others", "other children", "bit other dogs", "many people", "same dog"], { tier: "detailed" }),
    yn("exposure", "animal_work", "Work with animals", "Does the patient work with animals — veterinary work, animal shelters, dog catching, or handling monkeys or bats?", ["veterinary", "vet", "shelter", "dog catcher", "animal handler", "zoo", "lab animals", "caves"], { tier: "detailed" }),
  ],
  differentials: [
    { id: "category_one", name: "Category I exposure (touching, feeding, lick on intact skin)", pointers: ["contact_type"], discriminators: ["contact_type", "category_three_contact", "bite_location", "bite_witness"] },
    { id: "category_two", name: "Category II exposure (nibble, minor scratch without bleeding)", pointers: ["contact_type", "animal_ownership"], discriminators: ["contact_type", "category_three_contact", "animal_observable", "animal_vaccinated", "previous_rabies_vaccination"] },
    { id: "category_three", name: "Category III exposure (skin broken, saliva on mucosa or broken skin)", pointers: ["category_three_contact", "head_face_hand_site", "animal_abnormal_or_died"], discriminators: ["category_three_contact", "head_face_hand_site", "animal_abnormal_or_died", "animal_observable", "provocation", "prophylaxis_since_bite", "previous_rabies_vaccination"] },
    { id: "bat_exposure", name: "Bat exposure", pointers: ["bat_contact"], discriminators: ["bat_contact", "animal_type", "animal_work", "bite_witness"] },
    { id: "wound_infection", name: "Wound infection (cellulitis, abscess, septic joint)", pointers: ["wound_pain_redness", "spreading_infection", "fever_after_bite"], discriminators: ["wound_pain_redness", "spreading_infection", "fever_after_bite", "animal_type", "wound_washing", "time_since_bite", "immunocompromise"] },
    { id: "deep_hand_injury", name: "Deep or crush injury, including tendon or joint of the hand", pointers: ["deep_crush_wound", "hand_function"], discriminators: ["deep_crush_wound", "hand_function", "wound_count_depth", "bite_location", "ongoing_bleeding"] },
    { id: "face_head_injury", name: "Facial or scalp injury", pointers: ["head_face_hand_site", "ongoing_bleeding"], discriminators: ["head_face_hand_site", "wound_count_depth", "ongoing_bleeding", "bite_witness"] },
    { id: "tetanus_prone", name: "Tetanus-prone wound", pointers: ["deep_crush_wound", "late_presentation"], discriminators: ["tetanus_immunisation", "deep_crush_wound", "late_presentation", "wound_washing"] },
    { id: "clinical_rabies", name: "Clinical rabies after an earlier exposure", pointers: ["rabies_like_symptoms"], discriminators: ["rabies_like_symptoms", "previous_rabies_vaccination", "prophylaxis_since_bite", "time_since_bite", "animal_abnormal_or_died"] },
  ],
  output: {
    durationSlot: "duration",
    hpiOrder: ["time_since_bite", "animal_type", "bite_location", "contact_type", "wound_count_depth", "provocation", "animal_ownership", "animal_vaccinated", "animal_observable", "wound_washing", "prophylaxis_since_bite", "prior_treatment", "prior_investigations"],
  },
};
