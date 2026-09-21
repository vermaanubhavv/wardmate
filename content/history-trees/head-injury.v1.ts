import type { HistoryTree } from "@/lib/history-check/types";
import { commonHpi, HUTCHISONS, MACLEODS, PREGNANCY, rce, val, yn } from "@/content/history-trees/_helpers";

/**
 * HEAD INJURY — v1.0.0. CLINICAL CONTENT: PENDING CLINICIAN REVIEW.
 * Emergency / neurosurgical setting, north India. The history decides who needs imaging, and
 * the published decision rules are built almost entirely from history items: age, mechanism,
 * vomiting, amnesia, and any fall in conscious level. Road traffic injury and falls from
 * height dominate the local casemix. Differentials: extradural haematoma, acute subdural
 * haematoma, chronic subdural haematoma, contusion or diffuse axonal injury, skull fracture,
 * concussion without structural injury, and a collapse from another cause that caused the fall.
 */
export const headInjuryV1: HistoryTree = {
  id: "head_injury",
  version: "1.0.0",
  complaint: "Head injury",
  triggers: ["head injury", "head trauma", "fall from height", "road traffic accident", "rta", "hit on head", "blow to head", "injury to head", "assault", "sar me chot", "trauma head"],
  setting: "Emergency / neurosurgical unit, north India",
  reviewStatus: "pending_clinician_review",
  reviewedBy: null,
  references: [
    rce("Will neuroimaging reveal a severe intracranial injury in this adult with minor head trauma? The Rational Clinical Examination systematic review", 2015, "26717031"),
    rce("Is this patient having a stroke?", 2005, "15900010"),
    MACLEODS,
    HUTCHISONS,
  ],
  slots: [
    ...commonHpi("head injury"),
    val("informant", "witness_account", "Witness account", "Who witnessed the injury, and what exactly did they see happen?", ["witnessed", "saw", "bystander", "family", "police", "no one saw", "found", "unwitnessed", "brought by"]),
    val("hpi", "mechanism", "Mechanism", "How did the injury happen — a fall, a road traffic collision, an assault, or something striking the head?", ["fall", "height", "stairs", "road traffic", "motorcycle", "car", "pedestrian", "struck by vehicle", "assault", "hit", "stick", "fell from", "slipped"]),
    val("hpi", "height_speed", "Height of fall or speed of impact", "How far was the fall, or how fast was the vehicle, and was the patient thrown or ejected?", ["metres", "feet", "storey", "roof", "speed", "thrown", "ejected", "helmet", "seat belt", "pillion", "run over"], { numeric: true }),
    val("hpi", "impact_site", "Site of impact", "Which part of the head took the impact, and did the patient land on anything hard?", ["front", "back", "occiput", "temple", "side", "vertex", "face", "hard surface", "road", "stone", "floor"]),
    yn("hpi", "loss_of_consciousness", "Loss of consciousness", "Was consciousness lost, and for how long?", ["loss of consciousness", "unconscious", "blacked out", "knocked out", "minutes", "seconds", "did not lose", "conscious throughout"]),
    yn("hpi", "amnesia", "Amnesia", "Is there any gap in memory, and does the patient remember the event itself and what happened just before and after?", ["amnesia", "does not remember", "memory gap", "before the injury", "after the injury", "retrograde", "repeats questions", "keeps asking"]),
    val("hpi", "conscious_trend", "Trend in conscious level since", "Since the injury, has the patient become more alert, stayed the same, or become drowsier?", ["more alert", "same", "drowsier", "deteriorating", "improving", "lucid interval", "was talking then", "became unresponsive", "fluctuating"]),
    yn("associated", "vomiting", "Vomiting", "Has there been any vomiting, and how many separate episodes?", ["vomiting", "vomited", "episodes", "times", "projectile", "once", "twice", "repeated"]),
    yn("associated", "headache", "Headache", "Any headache, and is it getting worse?", ["headache", "severe", "worsening", "getting worse", "increasing", "throbbing"]),
    yn("associated", "seizure", "Seizure", "Any seizure or fit since the injury?", ["seizure", "fit", "fits", "convulsion", "jerking", "twitching"]),
    yn("associated", "bleeding_ent", "Bleeding or fluid from the nose or ear", "Any bleeding, or clear watery fluid, coming from the nose or the ear?", ["bleeding from ear", "bleeding from nose", "clear fluid", "watery", "csf", "otorrhoea", "rhinorrhoea", "discharge from ear"]),
    yn("associated", "visual_symptoms", "Visual disturbance", "Any double vision, blurring, or difficulty seeing since the injury?", ["double vision", "diplopia", "blurring", "cannot see", "visual disturbance", "squint"]),
    yn("associated", "limb_weakness", "Limb weakness or numbness", "Any weakness, numbness, or difficulty moving a limb?", ["weakness", "numbness", "cannot move", "one side", "hemiparesis", "tingling", "paralysis"]),
    yn("associated", "neck_back_pain", "Neck or back pain", "Any neck or back pain, or was the neck immobilised at the scene?", ["neck pain", "back pain", "spine", "collar", "immobilised", "cannot move neck", "tingling in limbs"]),
    yn("associated", "behaviour_change", "Change in behaviour or speech", "Any confusion, irritability, irrelevant talk, or slurred speech?", ["confusion", "irritable", "irrelevant talk", "slurred", "behaviour change", "agitated", "not recognising", "abnormal behaviour"]),
    yn("associated", "other_injuries", "Injuries elsewhere", "Any injury to the chest, abdomen, pelvis or limbs?", ["chest", "abdomen", "pelvis", "limb", "fracture", "bleeding", "deformity", "other injuries"]),
    // Red flags
    yn("red_flag", "declining_consciousness", "Falling conscious level or a lucid interval", "Has the patient become drowsier since the injury, or was there a period of being fully awake before deteriorating?", ["drowsier", "deteriorating", "lucid interval", "was talking", "then became", "less responsive", "declining", "falling gcs", "worsening"], { teach: "A patient who talks and then deteriorates describes the lucid interval of an expanding extradural bleed, and the time available is measured in hours." }),
    yn("red_flag", "repeated_vomiting", "Two or more episodes of vomiting", "Have there been two or more separate episodes of vomiting since the injury?", ["two episodes", "twice", "repeated vomiting", "more than once", "several times", "projectile"], { teach: "Two or more vomits after head trauma is one of the history items that carries most weight in the published imaging rules." }),
    yn("red_flag", "skull_fracture_signs", "Signs of a skull base fracture", "Any bruising behind the ear or around both eyes, bleeding or clear fluid from the ear or nose, or a boggy scalp swelling?", ["bruising behind ear", "battle", "raccoon", "both eyes", "panda", "clear fluid", "csf", "boggy", "depressed", "step", "open wound"], { teach: "Bruising behind the ear or around both eyes, or clear fluid from the nose or ear, points to a fracture of the skull base and carries a high likelihood of injury inside." }),
    yn("red_flag", "anticoagulants_bleeding", "Blood thinners or a bleeding disorder", "Is the patient on blood thinners or aspirin, or known to have a bleeding disorder or liver disease?", ["blood thinner", "warfarin", "aspirin", "clopidogrel", "anticoagulant", "bleeding disorder", "liver disease", "platelets", "alcohol"], { teach: "On blood thinners, a bleed can enlarge after a trivial blow and after an apparently normal first assessment." }),
    yn("red_flag", "dangerous_mechanism", "High-energy mechanism", "Was the patient a pedestrian struck by a vehicle, ejected from a vehicle, or did they fall more than about a metre or down five stairs?", ["pedestrian", "struck by vehicle", "ejected", "thrown", "fall from height", "more than a metre", "stairs", "roof", "high speed", "no helmet"], { teach: "Being struck as a pedestrian, ejected from a vehicle, or falling from a height each raise the chance of serious injury enough to change the imaging decision on their own." }),
    yn("red_flag", "age_over_65", "Age over sixty-five", "Is the patient over sixty-five?", ["over 65", "elderly", "age", "old", "sixty five", "seventy", "eighty"], { teach: "After sixty-five the brain shrinks away from the skull and bridging veins tear easily, so an apparently minor blow carries a higher risk." }),
    yn("red_flag", "focal_deficit_pupil", "Weakness on one side or an unequal pupil", "Any weakness of one side, an unequal pupil, or a pupil not reacting to light?", ["one side weakness", "hemiparesis", "unequal pupil", "dilated pupil", "not reacting", "fixed", "pupil", "facial deviation"], { teach: "An unequal pupil with one-sided weakness after head injury marks pressure on the brainstem and is the point at which delay becomes irreversible." }),
    yn("red_flag", "alcohol_intoxication", "Alcohol or drug intoxication", "Was the patient intoxicated with alcohol or any drug at the time?", ["alcohol", "drunk", "intoxicated", "drugs", "smell of alcohol", "under influence"], { teach: "Intoxication masks the signs of an injury and makes the conscious level unreliable, so it lowers rather than raises the threshold to look." }),
    yn("red_flag", "cervical_spine_concern", "Possible neck injury", "Any midline neck tenderness, inability to turn the head, or tingling and weakness in the limbs?", ["neck tenderness", "midline", "cannot turn", "tingling", "limb weakness", "spine", "collar", "numbness"], { tier: "detailed", teach: "A significant head injury and a neck injury travel together often enough that the neck is assumed injured until it has been cleared." }),
    PREGNANCY,
    yn("exposure", "cause_of_fall", "Why the fall happened", "Was there giddiness, chest pain, palpitations, a seizure, or blackout that caused the fall in the first place?", ["giddiness", "chest pain", "palpitations", "seizure", "blackout", "fainted", "slipped", "tripped", "sugar", "collapsed first"]),
    yn("exposure", "previous_head_injury", "Previous head injury or brain surgery", "Any previous head injury, brain surgery, or a shunt in place?", ["previous head injury", "brain surgery", "shunt", "craniotomy", "operated", "old injury"], { tier: "detailed" }),
    yn("exposure", "helmet_seatbelt", "Helmet or seat belt", "Was a helmet or seat belt being worn, and was the helmet damaged?", ["helmet", "seat belt", "no helmet", "not wearing", "damaged", "cracked", "strap"], { tier: "detailed" }),
  ],
  differentials: [
    { id: "extradural", name: "Extradural haematoma", pointers: ["declining_consciousness", "loss_of_consciousness", "skull_fracture_signs", "focal_deficit_pupil"], discriminators: ["declining_consciousness", "conscious_trend", "skull_fracture_signs", "focal_deficit_pupil", "impact_site", "loss_of_consciousness"] },
    { id: "acute_subdural", name: "Acute subdural haematoma", pointers: ["dangerous_mechanism", "focal_deficit_pupil", "anticoagulants_bleeding", "age_over_65"], discriminators: ["dangerous_mechanism", "focal_deficit_pupil", "anticoagulants_bleeding", "age_over_65", "conscious_trend", "mechanism"] },
    { id: "chronic_subdural", name: "Chronic subdural haematoma", pointers: ["age_over_65", "anticoagulants_bleeding", "behaviour_change", "previous_head_injury"], discriminators: ["age_over_65", "anticoagulants_bleeding", "behaviour_change", "duration", "headache", "limb_weakness"] },
    { id: "contusion_dai", name: "Contusion or diffuse axonal injury", pointers: ["dangerous_mechanism", "loss_of_consciousness", "seizure", "behaviour_change"], discriminators: ["dangerous_mechanism", "loss_of_consciousness", "conscious_trend", "seizure", "amnesia", "height_speed"] },
    { id: "skull_fracture", name: "Skull fracture", pointers: ["skull_fracture_signs", "bleeding_ent", "impact_site"], discriminators: ["skull_fracture_signs", "bleeding_ent", "impact_site", "mechanism", "visual_symptoms"] },
    { id: "concussion", name: "Concussion without structural injury", pointers: ["amnesia", "headache", "loss_of_consciousness"], discriminators: ["amnesia", "headache", "conscious_trend", "repeated_vomiting", "declining_consciousness", "dangerous_mechanism"] },
    { id: "collapse_cause", name: "Collapse from another cause, with the head injury secondary", pointers: ["cause_of_fall", "seizure"], discriminators: ["cause_of_fall", "seizure", "witness_account", "mechanism", "loss_of_consciousness"] },
    { id: "cervical_injury", name: "Associated cervical spine injury", pointers: ["cervical_spine_concern", "neck_back_pain", "dangerous_mechanism"], discriminators: ["cervical_spine_concern", "neck_back_pain", "dangerous_mechanism", "limb_weakness"] },
  ],
  output: {
    durationSlot: "duration",
    hpiOrder: ["onset", "duration", "mechanism", "height_speed", "impact_site", "loss_of_consciousness", "amnesia", "conscious_trend", "progression", "prior_treatment", "prior_investigations"],
  },
};
