import type { HistoryTree } from "@/lib/history-check/types";
import { APLEY, ATLS, BAILEY_LOVE, commonHpi, HUTCHISONS, IMMUNOCOMPROMISE, MACLEODS, val, yn } from "@/content/history-trees/_helpers";

/**
 * NECK PAIN — v1.0.0. CLINICAL CONTENT: PENDING CLINICIAN REVIEW.
 * Orthopaedics ward and casualty, north India. Most neck pain is degenerative or postural; the
 * history exists to find the root, the cord, the fracture and the infection hiding among them.
 * Tuberculosis of the cervical spine is a live differential here. Differentials: cervical
 * spondylosis, cervical radiculopathy, cervical myelopathy, mechanical or postural strain,
 * whiplash or fracture after trauma, tuberculosis of the spine, metastasis or myeloma, pyogenic
 * infection or discitis, atlantoaxial instability in rheumatoid arthritis, referred cardiac
 * pain, meningitis or subarachnoid bleed presenting as neck pain.
 */
export const neckPainV1: HistoryTree = {
  id: "neck_pain",
  version: "1.0.0",
  complaint: "Neck pain",
  triggers: ["neck pain", "pain in neck", "pain in the neck", "neck ache", "cervical pain", "cervicalgia", "cervical spondylosis", "whiplash", "gardan dard", "gardan me dard", "pain radiating to arm"],
  setting: "Orthopaedics ward and casualty, north India",
  reviewStatus: "pending_clinician_review",
  reviewedBy: null,
  references: [APLEY, BAILEY_LOVE, MACLEODS, HUTCHISONS, ATLS],
  slots: [
    ...commonHpi("neck pain"),
    val("hpi", "neck_site", "Site", "Where is the pain — back of the neck, one side, high up under the skull, or down between the shoulder blades?", ["back of neck", "one side", "left side", "right side", "under the skull", "occiput", "between shoulder blades", "base of neck", "trapezius", "site"]),
    val("hpi", "arm_radiation", "Radiation to the arm", "Does the pain travel into the shoulder, arm or hand, and into which fingers?", ["radiates", "shoulder", "arm", "forearm", "hand", "thumb", "index finger", "middle finger", "little finger", "does not radiate", "shooting", "radiation"]),
    val("hpi", "neck_character", "Character and severity", "Is it a dull ache, a sharp or shooting pain, or a burning pain, and how severe?", ["dull", "ache", "sharp", "shooting", "electric", "burning", "severe", "mild", "moderate", "out of 10"], { numeric: true }),
    val("hpi", "neck_movement", "Effect of movement", "What makes it worse or better — turning, looking up, bending forward, lifting, coughing, or rest?", ["turning", "looking up", "bending forward", "lifting", "coughing", "sneezing", "rest", "worse on movement", "better with rest", "pillow"]),
    val("hpi", "neck_timing", "Timing and stiffness", "Is it worse in the morning with stiffness, at the end of the day, or at night?", ["morning", "stiffness", "end of day", "evening", "night", "wakes", "constant", "throughout", "stiff neck"]),
    val("hpi", "injury_mechanism", "How the injury happened", "If there was an injury, how did it happen — a fall, a road collision, a rear-end impact, a dive into shallow water, or a load falling on the head — and has the neck been moved since?", ["fall", "road traffic", "rear end", "jerk", "diving", "shallow water", "load on head", "hit on head", "motorcycle", "collar", "moved since"], { tier: "detailed" }),
    yn("associated", "arm_symptoms", "Arm numbness / tingling / weakness", "Any numbness, tingling or weakness in the arm or hand?", ["numbness", "tingling", "pins and needles", "weakness", "weak grip", "arm weakness", "hand weakness", "loss of sensation"]),
    yn("associated", "hand_clumsiness", "Clumsy hands", "Have the hands become clumsy — dropping things, difficulty with buttons, writing or picking up coins?", ["clumsy", "dropping things", "buttons", "writing", "picking up", "coins", "fine work", "hands not working", "clumsiness"], { teach: "Clumsiness of both hands without a clear root pattern is often the first sign of pressure on the cord in the neck, well before the legs are affected." }),
    yn("associated", "occipital_headache", "Headache from the back of the head", "Does a headache start at the back of the head and spread forwards?", ["headache", "back of head", "occipital", "spreads forward", "head pain", "temple"], { tier: "detailed" }),
    yn("associated", "dizziness_on_turning", "Dizziness or blackout on turning the neck", "Any dizziness, blurring or blackout when turning or extending the neck?", ["dizziness", "giddiness", "blackout", "blurring", "on turning", "looking up", "vertigo", "drop attack"], { tier: "detailed" }),
    yn("associated", "neck_constitutional", "Fever / weight loss / night sweats", "Any fever, weight loss, loss of appetite or night sweats?", ["fever", "weight loss", "lost weight", "loss of appetite", "night sweats", "evening rise"]),
    yn("associated", "throat_swallowing", "Swelling in the neck / difficulty swallowing", "Any swelling in the neck, or difficulty or pain on swallowing?", ["swelling", "neck lump", "difficulty swallowing", "pain on swallowing", "throat", "cold abscess", "glands"], { tier: "detailed", teach: "A cold abscess from the cervical spine can track forwards behind the throat and show up as trouble swallowing rather than as a lump." }),
    // Red flags
    yn("red_flag", "neck_trauma", "Injury to the head or neck", "Was there any fall, road accident, dive, or blow to the head before the pain started?", ["fall", "injury", "accident", "road traffic", "rta", "diving", "blow to head", "trauma", "whiplash", "fell from"], { teach: "After an injury a neck fracture can be present with only pain, and the history decides whether the neck is protected before anything else is done." }),
    yn("red_flag", "myelopathy_gait", "Unsteady walking / stiff or weak legs", "Is walking becoming unsteady, are the legs stiff or weak, or does the ground feel like cotton underfoot?", ["unsteady", "imbalance", "stiff legs", "weak legs", "walking on cotton", "falls", "difficulty walking", "legs giving way", "spastic"], { teach: "Leg stiffness or imbalance with neck pain marks pressure on the cord, where delay costs function that may not come back." }),
    yn("red_flag", "sphincter_change", "Bladder or bowel change", "Any difficulty passing urine, urgency, incontinence, or change in bowel control since the neck pain began?", ["retention", "urgency", "incontinence", "cannot pass urine", "hesitancy", "bowel control", "bladder", "dribbling"], { teach: "Bladder change alongside neck pain places the problem in the cord, not the nerve root." }),
    yn("red_flag", "all_four_limbs", "Symptoms in all four limbs / electric shocks on bending", "Any tingling in all four limbs, or electric shocks down the spine or limbs on bending the neck forward?", ["all four limbs", "both arms and legs", "electric shock", "on bending neck", "lhermitte", "tingling everywhere", "quadriparesis"], { teach: "Symptoms in all four limbs, or shocks on flexing the neck, point to the cord at the level of the neck rather than a single root." }),
    yn("red_flag", "neck_infection", "Fever with neck pain / recent infection or injection", "Any fever with the neck pain, a recent infection, boil, injection, or procedure?", ["fever", "infection", "boil", "injection", "procedure", "chills", "rigors", "abscess", "intravenous drug"], { teach: "Fever with focal spinal pain raises infection of the disc or the space around the cord, which progresses during any period of watchful waiting." }),
    yn("red_flag", "meningism", "Fever with headache / sudden severe headache", "Any fever with headache, vomiting, dislike of light or drowsiness, or a sudden severe headache at the onset?", ["headache", "vomiting", "photophobia", "dislike of light", "drowsy", "confused", "sudden severe headache", "worst headache", "thunderclap"], { teach: "A stiff painful neck with headache and fever or a sudden severe headache belongs to the brain and its coverings, and the orthopaedic label can delay that thought." }),
    yn("red_flag", "cancer_myeloma", "Known cancer / bone pains / anaemia", "Any known cancer, previous cancer treatment, pain in other bones, or unexplained anaemia or kidney trouble?", ["cancer", "malignancy", "tumour", "chemotherapy", "radiotherapy", "breast", "prostate", "lung", "myeloma", "bone pains", "anaemia", "kidney"], { teach: "In someone with a past cancer, or with pains in several bones, new neck pain raises a deposit in a vertebra." }),
    yn("red_flag", "rest_night_pain", "Pain at rest / waking from sleep", "Is the pain present at rest, unrelieved by lying down, or waking the patient from sleep?", ["at rest", "unrelieved", "lying down", "wakes from sleep", "night pain", "constant", "no relief", "worse at night"], { teach: "Mechanical pain eases with rest; pain that does not, and that wakes a patient, points away from a strained neck." }),
    yn("red_flag", "cardiac_features", "Pain with exertion / jaw or left arm / sweating", "Does the pain come on with exertion, spread to the jaw or left arm, or come with sweating or breathlessness?", ["exertion", "walking", "climbing stairs", "jaw", "left arm", "sweating", "breathless", "chest tightness", "heart"], { teach: "Heart pain can be felt mainly in the neck or jaw, and exertional timing is the question that separates it from a musculoskeletal ache." }),
    yn("red_flag", "ra_upper_neck", "Rheumatoid arthritis with pain high in the neck", "In a patient with rheumatoid arthritis, any pain high in the neck or at the back of the head, or new weakness or tingling?", ["rheumatoid", "ra", "pain at back of head", "high in neck", "occipital pain", "weakness", "tingling", "instability"], { teach: "Rheumatoid disease can loosen the joint between the first two vertebrae, and neck handling during anaesthesia or intubation becomes a hazard." }),
    IMMUNOCOMPROMISE,
    yn("exposure", "tb_contact", "TB contact / past TB", "Any past tuberculosis or contact with tuberculosis?", ["tb", "tuberculosis", "koch", "att", "akt", "tb contact", "spine tb", "pott"]),
    yn("exposure", "known_rheumatoid", "Known rheumatoid arthritis / joint disease", "Any known rheumatoid arthritis, or long-standing pain and swelling in the small joints of the hands?", ["rheumatoid", "ra", "joint pains", "small joints", "hands swollen", "arthritis", "deformed fingers"], { tier: "detailed" }),
    val("exposure", "occupation_posture", "Occupation / posture / carrying loads", "What work does the patient do — long hours at a screen, driving, carrying loads on the head, or heavy lifting?", ["computer", "screen", "mobile", "desk", "driver", "load on head", "carrying", "labourer", "tailor", "lifting", "occupation", "pillow"]),
    yn("exposure", "previous_neck_episodes", "Previous neck episodes or surgery", "Any earlier episodes of neck pain, previous neck surgery, or manipulation of the neck?", ["previous episode", "before", "recurrent", "neck surgery", "operated", "manipulation", "massage", "collar", "physiotherapy"], { tier: "detailed" }),
  ],
  differentials: [
    { id: "spondylosis", name: "Cervical spondylosis", pointers: ["neck_timing", "neck_movement", "occupation_posture", "previous_neck_episodes"], discriminators: ["neck_timing", "neck_movement", "arm_radiation", "occipital_headache", "dizziness_on_turning", "rest_night_pain"] },
    { id: "radiculopathy", name: "Cervical radiculopathy", pointers: ["arm_radiation", "arm_symptoms"], discriminators: ["arm_radiation", "arm_symptoms", "neck_movement", "neck_character", "hand_clumsiness", "myelopathy_gait"] },
    { id: "myelopathy", name: "Cervical myelopathy", pointers: ["hand_clumsiness", "myelopathy_gait", "sphincter_change", "all_four_limbs"], discriminators: ["hand_clumsiness", "myelopathy_gait", "sphincter_change", "all_four_limbs", "arm_symptoms", "progression"] },
    { id: "mechanical", name: "Mechanical or postural neck strain", pointers: ["occupation_posture", "neck_movement"], discriminators: ["occupation_posture", "neck_movement", "neck_timing", "rest_night_pain", "neck_constitutional", "arm_symptoms"] },
    { id: "trauma", name: "Whiplash or cervical fracture after injury", pointers: ["neck_trauma", "injury_mechanism"], discriminators: ["neck_trauma", "injury_mechanism", "arm_symptoms", "all_four_limbs", "onset_mode"] },
    { id: "tb_spine", name: "Tuberculosis of the cervical spine", pointers: ["tb_contact", "neck_constitutional", "throat_swallowing"], discriminators: ["tb_contact", "neck_constitutional", "throat_swallowing", "rest_night_pain", "myelopathy_gait", "immunocompromise"] },
    { id: "malignancy", name: "Metastasis or myeloma in the cervical spine", pointers: ["cancer_myeloma", "rest_night_pain", "neck_constitutional"], discriminators: ["cancer_myeloma", "rest_night_pain", "neck_constitutional", "all_four_limbs", "sphincter_change"] },
    { id: "pyogenic_infection", name: "Pyogenic infection or discitis", pointers: ["neck_infection", "immunocompromise"], discriminators: ["neck_infection", "immunocompromise", "neck_constitutional", "rest_night_pain", "onset_mode"] },
    { id: "atlantoaxial", name: "Atlantoaxial instability in rheumatoid arthritis", pointers: ["ra_upper_neck", "known_rheumatoid"], discriminators: ["ra_upper_neck", "known_rheumatoid", "all_four_limbs", "occipital_headache", "myelopathy_gait"] },
    { id: "cardiac", name: "Referred cardiac pain", pointers: ["cardiac_features"], discriminators: ["cardiac_features", "neck_movement", "neck_character", "onset_mode"] },
    { id: "meningeal", name: "Meningitis or subarachnoid bleed presenting as neck pain", pointers: ["meningism"], discriminators: ["meningism", "neck_infection", "onset_mode", "occipital_headache"] },
  ],
  output: {
    durationSlot: "duration",
    hpiOrder: ["onset", "duration", "onset_mode", "neck_site", "arm_radiation", "neck_character", "neck_movement", "neck_timing", "injury_mechanism", "progression", "prior_treatment", "prior_investigations"],
  },
};
