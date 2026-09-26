import type { HistoryTree } from "@/lib/history-check/types";
import { commonHpi, ebem, HUTCHISONS, IMMUNOCOMPROMISE, MACLEODS, PREGNANCY, rce, val, yn } from "@/content/history-trees/_helpers";

/**
 * JOINT PAIN — v1.0.0. CLINICAL CONTENT: REVIEWED (Dr Anubhav Verma).
 * Adult medicine / orthopaedic ward, north India. The three questions that organise the whole
 * history: how many joints, which joints, and how long. A single hot joint is a different
 * problem from a symmetrical small-joint polyarthritis. Differentials: septic arthritis,
 * crystal arthritis (gout, pseudogout), rheumatoid arthritis, spondyloarthritis and reactive
 * arthritis, osteoarthritis, connective-tissue disease, viral arthritis (chikungunya, dengue),
 * tuberculous arthritis, trauma.
 */
export const jointPainV1: HistoryTree = {
  id: "joint_pain",
  version: "1.0.0",
  complaint: "Joint pain",
  triggers: ["joint pain", "joint pains", "arthritis", "arthralgia", "pain in joints", "swollen joint", "joint swelling", "knee pain", "painful joints", "polyarthritis", "jodon me dard"],
  setting: "Adult medicine / orthopaedic ward, north India",
  reviewStatus: "reviewed",
  reviewedBy: "Dr Anubhav Verma",
  references: [
    ebem("Septic arthritis in emergency department patients with joint pain: searching for the optimal diagnostic tool", 2008, "18294730"),
    rce("Does this patient with shoulder pain have rotator cuff disease? The Rational Clinical Examination systematic review", 2013, "23982370"),
    MACLEODS,
    HUTCHISONS,
  ],
  slots: [
    ...commonHpi("joint pain"),
    val("hpi", "number_of_joints", "How many joints", "How many joints are involved — one, a few, or many?", ["one joint", "single", "monoarthritis", "two", "three", "few joints", "oligo", "many joints", "polyarthritis", "all joints", "number of joints"]),
    val("hpi", "which_joints", "Which joints", "Which joints are involved — small joints of hands and feet, large joints, or the spine?", ["small joints", "hands", "fingers", "wrist", "feet", "toes", "knee", "ankle", "hip", "shoulder", "elbow", "spine", "lower back", "big toe", "which joints"]),
    val("hpi", "symmetry", "Symmetry", "Are the same joints involved on both sides, or only one side?", ["both sides", "symmetrical", "one side", "asymmetrical", "left", "right", "bilateral", "unilateral"]),
    val("hpi", "pattern_migration", "Pattern over time", "Does the pain stay in the same joints, or move from joint to joint?", ["same joints", "moves", "migrating", "flitting", "shifting", "additive", "comes and goes", "one after another"]),
    yn("hpi", "swelling_warmth", "Swelling / warmth / redness", "Is the joint visibly swollen, warm, or red?", ["swelling", "swollen", "warm", "hot", "red", "redness", "puffy", "inflamed"]),
    val("hpi", "morning_stiffness", "Morning stiffness", "Is there stiffness in the morning, and how long does it take to loosen?", ["morning stiffness", "stiffness", "loosen", "minutes", "hours", "after getting up", "gelling", "an hour"], { numeric: true }),
    val("hpi", "effect_of_activity", "Effect of rest and activity", "Is the pain worse with activity and better with rest, or worse after rest and better on moving?", ["worse on activity", "better on rest", "worse after rest", "better on moving", "end of day", "use", "walking", "climbing stairs"]),
    val("hpi", "function", "Effect on function", "What can the patient no longer do — grip, walk, climb stairs, squat, or self-care?", ["grip", "cannot walk", "climb stairs", "squat", "self care", "buttons", "comb hair", "daily activities", "bedridden"]),
    yn("associated", "fever", "Fever", "Any fever with the joint pain?", ["fever", "febrile", "chills", "rigors", "temperature"]),
    yn("associated", "rash", "Rash / skin lesions", "Any rash, scaly patches, nodules, or sores over the skin?", ["rash", "psoriasis", "scaly", "nodules", "sores", "skin lesion", "butterfly", "photosensitivity", "erythema"]),
    yn("associated", "eye_symptoms", "Red eye / eye pain", "Any red, painful eye, or blurring of vision?", ["red eye", "eye pain", "blurring", "uveitis", "conjunctivitis", "dry eyes", "photophobia"]),
    yn("associated", "gi_gu_symptoms", "Diarrhoea / urethral discharge before the pain", "Any diarrhoea, dysentery, or urethral discharge in the weeks before the joints started?", ["diarrhoea", "dysentery", "loose stools", "urethral discharge", "burning urine", "before the joints", "few weeks before"]),
    yn("associated", "back_pain_inflammatory", "Low back pain / buttock pain", "Any low back or buttock pain that is worse at rest and better on moving?", ["low back pain", "buttock pain", "back pain", "worse at rest", "better on moving", "night pain", "alternating buttock"]),
    yn("associated", "oral_ulcers_dryness", "Mouth ulcers / dry mouth / hair loss", "Any mouth ulcers, dry mouth or eyes, or hair loss?", ["mouth ulcers", "oral ulcers", "dry mouth", "dry eyes", "hair loss", "alopecia", "sicca"], { tier: "detailed" }),
    yn("associated", "raynaud", "Colour change of fingers in cold", "Any colour change of the fingers in cold weather, turning white, blue and then red?", ["white", "blue", "colour change", "raynaud", "cold", "fingers change colour", "numb fingers"], { tier: "detailed" }),
    yn("associated", "weight_appetite", "Weight loss / appetite", "Any weight loss or loss of appetite?", ["weight loss", "lost weight", "appetite", "loss of appetite"], { tier: "detailed" }),
    // Red flags
    yn("red_flag", "single_hot_joint_fever", "Single hot swollen joint with fever", "Is a single joint hot, swollen and very painful, with fever, and too painful to move at all?", ["single joint", "one joint", "hot", "swollen", "fever", "cannot move", "exquisitely tender", "refuses to move", "severe pain"], { teach: "A single hot swollen joint with fever needs to be treated as infection until the joint fluid says otherwise, because a septic joint destroys cartilage within days." }),
    yn("red_flag", "skin_break_injection", "Skin break / injection / procedure near the joint", "Any wound, boil, injection, or procedure near that joint recently?", ["wound", "boil", "cut", "injection", "procedure", "aspiration", "abscess", "skin infection", "cellulitis"], { teach: "A break in the skin or a needle near a joint gives organisms a route in, and the history is the only place that route shows up." }),
    yn("red_flag", "prosthetic_joint", "Artificial joint / previous joint surgery", "Any artificial joint or previous surgery on that joint?", ["artificial joint", "prosthesis", "replacement", "joint surgery", "implant", "plate", "screw"], { teach: "An artificial joint becomes infected with fewer signs and at lower fever than a natural one, so the threshold to ask stays low." }),
    yn("red_flag", "trauma", "Injury", "Any injury, fall, or twist of the joint before the pain?", ["injury", "trauma", "fall", "twist", "sprain", "accident", "hit", "sports"], { teach: "An injury before the pain changes the question from inflammation to fracture, ligament or bleeding into the joint." }),
    yn("red_flag", "neuro_deficit", "Weakness / numbness / bladder change", "Any limb weakness, numbness, or change in passing urine with back or neck pain?", ["weakness", "numbness", "tingling", "bladder", "bowel", "retention", "saddle", "cannot walk"], { teach: "Weakness or bladder change with spinal pain moves this from a joint question to a cord or nerve-root one." }),
    yn("red_flag", "night_pain_weight_loss", "Night pain with weight loss", "Is the pain worse at night and waking the patient, with weight loss?", ["night pain", "wakes at night", "weight loss", "constant pain", "not relieved by rest", "worse at night"], { teach: "Bone pain that wakes a patient, together with weight loss, raises infection or a deposit in the bone rather than a joint problem." }),
    yn("red_flag", "bleeding_disorder", "Bleeding tendency / blood thinners", "Any bleeding disorder, haemophilia, or blood thinners?", ["haemophilia", "bleeding disorder", "blood thinner", "warfarin", "anticoagulant", "easy bruising", "factor"], { tier: "detailed", teach: "A joint that fills with blood rather than inflammatory fluid is managed differently from the start." }),
    IMMUNOCOMPROMISE,
    PREGNANCY,
    yn("exposure", "tb_contact", "TB contact / past TB", "Any past tuberculosis or contact with tuberculosis?", ["tb", "tuberculosis", "koch", "att", "akt", "tb contact", "spine tb", "pott"]),
    yn("exposure", "mosquito_illness", "Recent dengue / chikungunya in the area", "Any recent fever with rash in the patient or the neighbourhood, or known dengue or chikungunya?", ["dengue", "chikungunya", "mosquito", "fever with rash", "outbreak", "neighbourhood", "viral fever"]),
    yn("exposure", "alcohol_diet_drugs", "Alcohol / red meat / diuretics", "Any alcohol, red meat or organ meat, or water tablets?", ["alcohol", "red meat", "organ meat", "diuretic", "water tablet", "thiazide", "beer"], { tier: "detailed" }),
    yn("exposure", "family_arthritis", "Family history of arthritis or psoriasis", "Any family history of arthritis, psoriasis, or back stiffness?", ["family history", "arthritis", "psoriasis", "back stiffness", "father", "mother", "sibling"], { tier: "detailed" }),
  ],
  differentials: [
    { id: "septic", name: "Septic arthritis", pointers: ["single_hot_joint_fever", "skin_break_injection", "prosthetic_joint", "fever"], discriminators: ["single_hot_joint_fever", "skin_break_injection", "prosthetic_joint", "fever", "number_of_joints", "onset_mode", "immunocompromise"] },
    { id: "crystal", name: "Crystal arthritis (gout / pseudogout)", pointers: ["which_joints", "alcohol_diet_drugs", "swelling_warmth", "onset_mode"], discriminators: ["which_joints", "alcohol_diet_drugs", "onset_mode", "swelling_warmth", "number_of_joints", "pattern_migration"] },
    { id: "rheumatoid", name: "Rheumatoid arthritis", pointers: ["symmetry", "morning_stiffness", "which_joints"], discriminators: ["symmetry", "morning_stiffness", "which_joints", "number_of_joints", "function", "family_arthritis"] },
    { id: "spondyloarthritis", name: "Spondyloarthritis / reactive arthritis", pointers: ["back_pain_inflammatory", "gi_gu_symptoms", "eye_symptoms", "rash"], discriminators: ["back_pain_inflammatory", "gi_gu_symptoms", "eye_symptoms", "rash", "symmetry", "family_arthritis"] },
    { id: "osteoarthritis", name: "Osteoarthritis", pointers: ["effect_of_activity", "which_joints", "morning_stiffness"], discriminators: ["effect_of_activity", "morning_stiffness", "which_joints", "duration", "swelling_warmth"] },
    { id: "connective_tissue", name: "Connective-tissue disease", pointers: ["rash", "oral_ulcers_dryness", "raynaud"], discriminators: ["rash", "oral_ulcers_dryness", "raynaud", "symmetry", "weight_appetite", "eye_symptoms"] },
    { id: "viral", name: "Viral arthritis (chikungunya / dengue)", pointers: ["mosquito_illness", "fever", "symmetry"], discriminators: ["mosquito_illness", "fever", "duration", "symmetry", "rash", "number_of_joints"] },
    { id: "tubercular", name: "Tuberculous arthritis / spondylitis", pointers: ["tb_contact", "night_pain_weight_loss", "back_pain_inflammatory"], discriminators: ["tb_contact", "night_pain_weight_loss", "number_of_joints", "duration", "neuro_deficit", "weight_appetite"] },
    { id: "trauma_haemarthrosis", name: "Trauma / bleeding into the joint", pointers: ["trauma", "bleeding_disorder", "swelling_warmth"], discriminators: ["trauma", "bleeding_disorder", "onset_mode", "number_of_joints"] },
  ],
  output: {
    durationSlot: "duration",
    hpiOrder: ["onset", "duration", "onset_mode", "number_of_joints", "which_joints", "symmetry", "pattern_migration", "swelling_warmth", "morning_stiffness", "effect_of_activity", "function", "progression", "prior_treatment", "prior_investigations"],
  },
};
