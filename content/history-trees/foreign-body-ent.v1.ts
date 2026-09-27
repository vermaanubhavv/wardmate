import type { HistoryTree } from "@/lib/history-check/types";
import { commonHpi, DHINGRA, HUTCHISONS, MACLEODS, val, yn } from "@/content/history-trees/_helpers";

/**
 * FOREIGN BODY IN EAR, NOSE OR THROAT — v1.0.0. CLINICAL CONTENT: PENDING CLINICIAN REVIEW.
 * ENT ward and casualty, north India. Most are beads, seeds, insects and fish bones that can wait
 * for a calm removal; the history exists to find the few that cannot — the button battery that
 * burns through tissue in hours, the object that has gone into the airway, the sharp bone or coin
 * sitting in the gullet, and the unwitnessed event in a small child presenting only as a smelly
 * one-sided discharge or a cough that will not clear.
 * Differentials: ear foreign body (inanimate or live insect), nasal foreign body (including
 * button battery), pharyngeal foreign body such as a fish bone, oesophageal foreign body such as
 * a coin or bone, airway foreign body / aspiration.
 */
export const foreignBodyEntV1: HistoryTree = {
  id: "foreign_body_ent",
  version: "1.0.0",
  complaint: "Foreign body in ear, nose or throat",
  triggers: ["foreign body", "foreign body ear", "foreign body nose", "foreign body throat", "something in ear", "something in nose", "insect in ear", "keeda in ear", "kaan me keeda", "fish bone", "bone stuck", "stuck in throat", "swallowed coin", "coin swallowed", "button battery", "swallowed battery", "bead in nose", "seed in nose", "swallowed something", "aspiration"],
  setting: "ENT ward and casualty, north India",
  reviewStatus: "pending_clinician_review",
  reviewedBy: null,
  references: [DHINGRA, MACLEODS, HUTCHISONS],
  slots: [
    ...commonHpi("foreign body"),
    val("hpi", "site", "Where the object went", "Did the object go into the ear, the nose, or was it swallowed or breathed in?", ["ear", "nose", "nostril", "swallowed", "throat", "gullet", "breathed in", "inhaled", "went down"]),
    val("hpi", "object_nature", "What the object was", "What was the object — a bead, seed, grain, toy part, coin, battery, fish or chicken bone, pin, or a live insect?", ["bead", "seed", "grain", "chana", "peanut", "toy", "coin", "battery", "button battery", "magnet", "fish bone", "chicken bone", "pin", "insect", "cockroach", "cotton", "stone", "paper"]),
    yn("hpi", "witnessed", "Was it seen happening", "Did anyone see the object go in, or is it only suspected from the symptoms?", ["saw", "seen", "witnessed", "told us", "suspected", "not sure", "found playing", "unwitnessed"], { teach: "Many objects in small children are never witnessed and come to light only as a smell, a discharge or a cough." }),
    yn("hpi", "removal_attempts", "Attempts at removal", "Has anyone tried to remove it — with a pin, stick, oil, finger, or by eating a ball of rice or bread?", ["tried to remove", "pin", "stick", "hairpin", "oil", "finger", "rice ball", "banana", "bread", "vomiting induced", "pushed in"]),
    yn("associated", "ear_symptoms", "Ear pain / buzzing / blocked ear", "Is there ear pain, a buzzing or moving sensation, a blocked ear, or discharge or bleeding from the ear?", ["ear pain", "buzzing", "moving", "crawling", "blocked ear", "hearing", "ear discharge", "bleeding from ear"]),
    yn("associated", "nasal_symptoms", "One-sided nasal discharge / smell", "Is there a one-sided nasal discharge, a foul smell from the nose or breath, or bleeding from one nostril?", ["one sided discharge", "unilateral discharge", "foul smell", "bad smell", "smelly", "nasal bleeding", "blocked nostril", "sneezing"], { teach: "A foul one-sided nasal discharge in a young child is a classic way an unnoticed nasal object presents." }),
    yn("associated", "swallow_pain_point", "Pain on swallowing / pricking sensation", "Is there pain or a pricking feeling on swallowing, and can the patient point to where it is stuck?", ["pain on swallowing", "odynophagia", "pricking", "pointing", "stuck here", "sensation", "scratching", "sharp pain"]),
    yn("associated", "drooling_cannot_swallow", "Drooling / unable to swallow saliva", "Is the patient drooling, spitting out saliva, or unable to swallow even liquids?", ["drooling", "salivation", "spitting saliva", "cannot swallow liquids", "cannot swallow saliva", "regurgitation", "not taking feeds"], { teach: "Being unable to swallow saliva suggests the gullet is completely blocked." }),
    yn("associated", "choking_episode", "Choking at the time", "Was there a sudden bout of choking, gagging or coughing while eating or playing?", ["choking", "gagging", "sudden cough", "coughing fit", "while eating", "while playing", "turned blue", "went blue"], { teach: "A choking episode at the time of the event is the strongest clue that an object entered the airway, even when the child seems well afterwards." }),
    yn("associated", "persistent_cough_wheeze", "Persistent cough / wheeze / recurrent chest infection", "Since the event, has there been a cough, wheeze, or a chest infection that keeps returning on one side?", ["persistent cough", "cough", "wheeze", "whistling", "recurrent pneumonia", "chest infection", "not settling", "one side chest"]),
    // Red flags
    yn("red_flag", "breathing_difficulty", "Difficulty breathing / noisy breathing / blue colour", "Is there difficulty breathing, noisy breathing, change in voice or cry, or any blue colour of the lips?", ["difficulty breathing", "breathless", "stridor", "noisy breathing", "hoarse", "change in voice", "weak cry", "cyanosis", "blue lips", "gasping"], { teach: "Breathing difficulty, stridor or a changed voice raises an object in or pressing on the airway, where minutes matter." }),
    yn("red_flag", "button_battery_magnet", "Button battery or magnets", "Could the object be a button battery, or more than one magnet?", ["button battery", "battery", "cell", "watch battery", "remote battery", "magnet", "magnets", "toy battery"], { teach: "Button batteries burn through the lining of the nose or gullet within hours, and swallowed magnets can pinch bowel between them, so the timing matters more than the size." }),
    yn("red_flag", "sharp_object", "Sharp object", "Was the object sharp — a bone, pin, needle, blade, or a piece of glass?", ["sharp", "bone", "fish bone", "chicken bone", "pin", "needle", "safety pin", "blade", "glass", "nail"], { teach: "Sharp objects can pierce the gullet, and neck or chest pain after one raises a perforation." }),
    yn("red_flag", "neck_chest_pain_fever", "Neck or chest pain / fever / neck swelling", "Since the event, is there pain in the neck, chest or back, fever, swelling of the neck, or a crackling feeling under the skin?", ["neck pain", "chest pain", "back pain", "fever", "neck swelling", "crackling", "crepitus", "surgical emphysema", "stiff neck"], { teach: "Neck or chest pain with fever after a swallowed object raises a tear in the gullet with infection spreading into the neck or chest." }),
    yn("red_flag", "blood_vomit_saliva", "Blood in saliva or vomit", "Is there blood in the saliva, vomit or sputum since the event?", ["blood in saliva", "blood in vomit", "vomiting blood", "haematemesis", "blood in sputum", "bloody spit", "black stools"]),
  ],
  differentials: [
    { id: "ear_fb", name: "Ear foreign body (inanimate or live insect)", pointers: ["ear_symptoms", "site"], discriminators: ["ear_symptoms", "object_nature", "removal_attempts", "witnessed", "onset"] },
    { id: "nasal_fb", name: "Nasal foreign body (including button battery)", pointers: ["nasal_symptoms", "button_battery_magnet"], discriminators: ["nasal_symptoms", "object_nature", "button_battery_magnet", "witnessed", "duration"] },
    { id: "pharyngeal_fb", name: "Pharyngeal foreign body (fish bone)", pointers: ["swallow_pain_point", "sharp_object"], discriminators: ["swallow_pain_point", "sharp_object", "object_nature", "drooling_cannot_swallow", "removal_attempts"] },
    { id: "oesophageal_fb", name: "Oesophageal foreign body (coin, bone, battery)", pointers: ["drooling_cannot_swallow", "swallow_pain_point", "button_battery_magnet"], discriminators: ["drooling_cannot_swallow", "button_battery_magnet", "neck_chest_pain_fever", "blood_vomit_saliva", "object_nature"] },
    { id: "airway_fb", name: "Airway foreign body / aspiration", pointers: ["choking_episode", "persistent_cough_wheeze", "breathing_difficulty"], discriminators: ["choking_episode", "persistent_cough_wheeze", "breathing_difficulty", "witnessed", "object_nature"] },
  ],
  output: {
    durationSlot: "duration",
    hpiOrder: ["onset", "duration", "site", "object_nature", "witnessed", "removal_attempts", "onset_mode", "progression", "prior_treatment", "prior_investigations"],
  },
};
