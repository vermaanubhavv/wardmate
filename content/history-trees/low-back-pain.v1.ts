import type { HistoryTree } from "@/lib/history-check/types";
import { commonHpi, ebem, HUTCHISONS, IMMUNOCOMPROMISE, MACLEODS, PREGNANCY, val, yn } from "@/content/history-trees/_helpers";

/**
 * LOW BACK PAIN — v1.0.0. CLINICAL CONTENT: PENDING CLINICIAN REVIEW.
 * Adult medicine / orthopaedic ward, north India. Most back pain is mechanical; the history
 * exists to find the minority that is not. Tuberculous spondylitis is a live differential here
 * in a way it is not in the Anglo-American textbooks. Differentials: mechanical or muscular,
 * disc prolapse with radiculopathy, cauda equina syndrome, vertebral fracture, spinal infection
 * including tuberculosis, malignancy or metastasis, inflammatory back pain, referred pain from
 * kidney, pancreas, aorta or pelvis.
 */
export const lowBackPainV1: HistoryTree = {
  id: "low_back_pain",
  version: "1.0.0",
  complaint: "Low back pain",
  triggers: ["low back pain", "back pain", "backache", "back ache", "lumbar pain", "pain in back", "kamar dard", "lumbago", "pain in lower back", "sciatica"],
  setting: "Adult medicine / orthopaedic ward, north India",
  reviewStatus: "pending_clinician_review",
  reviewedBy: null,
  references: [
    ebem("Clinical assessment of low back pain", 2006, "16498707"),
    MACLEODS,
    HUTCHISONS,
  ],
  slots: [
    ...commonHpi("back pain"),
    val("hpi", "site", "Site", "Where exactly is the pain — middle of the back, one side, or over the buttock?", ["lower back", "middle", "one side", "left", "right", "buttock", "sacroiliac", "lumbar", "thoracic", "site"]),
    val("hpi", "radiation", "Radiation", "Does the pain travel down the leg, and how far — buttock, thigh, below the knee, or to the foot?", ["radiates", "down the leg", "buttock", "thigh", "below the knee", "foot", "calf", "does not radiate", "shooting", "radiation"]),
    val("hpi", "character_severity", "Character and severity", "Is it a dull ache, a shooting pain, or a band-like pain, and how severe?", ["dull", "ache", "shooting", "electric", "band", "burning", "severe", "mild", "moderate", "out of 10"], { numeric: true }),
    val("hpi", "aggravating_relieving", "Aggravating and relieving factors", "What makes it worse or better — bending, lifting, sitting, standing, walking, coughing, or rest?", ["bending", "lifting", "sitting", "standing", "walking", "coughing", "straining", "rest", "lying down", "better on", "worse on"]),
    val("hpi", "timing", "Timing / night pain", "Is it worse at night, in the early morning, or towards the end of the day?", ["night", "at night", "early morning", "end of day", "evening", "wakes", "constant", "throughout"]),
    yn("hpi", "morning_stiffness", "Morning stiffness", "Is there back stiffness in the morning, and does it improve on moving about?", ["morning stiffness", "stiffness", "improves on moving", "better with exercise", "loosen", "an hour", "gelling"]),
    yn("associated", "leg_weakness_numbness", "Leg weakness / numbness", "Any weakness, numbness, or tingling in the legs or feet?", ["weakness", "numbness", "tingling", "foot drop", "dragging foot", "pins and needles", "loss of sensation", "giving way"]),
    yn("associated", "claudication", "Pain on walking a distance", "Does pain or heaviness in the legs come on after walking a certain distance and ease on sitting or bending forward?", ["after walking", "distance", "eases on sitting", "bending forward", "heaviness", "claudication", "stops to rest", "metres"]),
    yn("associated", "fever_weight", "Fever / weight loss / night sweats", "Any fever, weight loss, or night sweats?", ["fever", "weight loss", "night sweats", "evening rise", "loss of appetite", "lost weight"]),
    yn("associated", "abdominal_urinary", "Abdominal pain / burning urine / loin pain", "Any abdominal pain, burning urine, loin pain, or blood in the urine?", ["abdominal pain", "burning urine", "loin pain", "flank", "haematuria", "colicky", "renal colic"]),
    yn("associated", "deformity", "Change in the shape of the back", "Any visible bend, hump, or change in the shape of the back?", ["hump", "gibbus", "deformity", "bend", "curved", "kyphosis", "stoop", "shape"], { tier: "detailed" }),
    yn("associated", "eye_joint_gi", "Red eye / other joint pain / diarrhoea / psoriasis", "Any red eye, pain in other joints, diarrhoea, or psoriasis?", ["red eye", "uveitis", "other joints", "heel pain", "diarrhoea", "psoriasis", "skin patches"], { tier: "detailed" }),
    // Red flags
    yn("red_flag", "cauda_equina", "Bladder or bowel change / saddle numbness", "Any difficulty passing urine, incontinence, or numbness around the back passage and inner thighs?", ["retention", "incontinence", "cannot pass urine", "dribbling", "bowel incontinence", "saddle", "numbness around", "perineum", "back passage", "inner thigh"], { teach: "Bladder change with saddle numbness and back pain is the one presentation here where hours of delay cost permanent function." }),
    yn("red_flag", "progressive_weakness", "Progressive leg weakness / difficulty walking", "Is leg weakness getting worse, or is walking becoming difficult?", ["progressive", "getting worse", "difficulty walking", "cannot walk", "foot drop", "dragging", "weakness increasing", "unsteady"], { teach: "Weakness that is worsening, rather than static, marks a cord or root under ongoing pressure." }),
    yn("red_flag", "trauma_osteoporosis", "Injury / fall / steroids / osteoporosis", "Any fall or injury, long-term steroids, or known thin bones, especially in an older patient?", ["fall", "injury", "trauma", "steroid", "steroids", "osteoporosis", "thin bones", "elderly", "minor fall", "fracture"], { teach: "In an older patient or one on steroids, even a small fall can break a vertebra, and the history is what raises that possibility." }),
    yn("red_flag", "fever_infection", "Fever with back pain / recent infection / injection", "Any fever with the back pain, a recent infection, injection, or procedure on the spine?", ["fever", "infection", "injection", "epidural", "spinal procedure", "abscess", "boil", "intravenous drug", "chills"], { teach: "Fever with focal spinal pain raises infection in the disc or the space around the cord, which spreads during any period of watchful waiting." }),
    yn("red_flag", "cancer_history", "Known cancer / past malignancy", "Any known cancer, or previous treatment for a malignancy?", ["cancer", "malignancy", "tumour", "chemotherapy", "radiotherapy", "breast", "prostate", "lung", "metastasis", "known case"], { teach: "In someone with a past cancer, new back pain is treated as a deposit in the spine until shown otherwise." }),
    yn("red_flag", "night_pain_unrelieved", "Pain at rest, unrelieved by lying down", "Is the pain present at rest and unrelieved by lying down, or does it wake the patient from sleep?", ["at rest", "unrelieved", "lying down", "wakes from sleep", "night pain", "constant", "no relief", "worse at night"], { teach: "Mechanical pain eases with rest; pain that does not, and that wakes a patient, points away from a mechanical cause." }),
    yn("red_flag", "age_onset", "First episode under 20 or over 50", "Is this a first episode of back pain in someone under twenty or over fifty?", ["first episode", "under 20", "over 50", "elderly", "young", "new onset", "age", "never before"], { tier: "detailed", teach: "A first back pain at the extremes of age carries a higher chance of a cause other than a strained muscle." }),
    IMMUNOCOMPROMISE,
    PREGNANCY,
    yn("exposure", "tb_contact", "TB contact / past TB", "Any past tuberculosis or contact with tuberculosis?", ["tb", "tuberculosis", "koch", "att", "akt", "tb contact", "pott", "spine tb"]),
    yn("exposure", "occupation_lifting", "Occupation / lifting / posture", "What work does the patient do, and does it involve lifting, bending, or long hours of sitting or driving?", ["lifting", "bending", "farmer", "labourer", "driver", "sitting", "heavy weight", "construction", "occupation", "load"]),
    yn("exposure", "family_spondylitis", "Family history of back stiffness or psoriasis", "Any family history of back stiffness, ankylosing spondylitis, or psoriasis?", ["family history", "back stiffness", "ankylosing", "spondylitis", "psoriasis", "father", "brother"], { tier: "detailed" }),
  ],
  differentials: [
    { id: "mechanical", name: "Mechanical / muscular back pain", pointers: ["aggravating_relieving", "occupation_lifting"], discriminators: ["aggravating_relieving", "occupation_lifting", "timing", "radiation", "night_pain_unrelieved", "fever_weight"] },
    { id: "radiculopathy", name: "Disc prolapse with nerve-root compression", pointers: ["radiation", "leg_weakness_numbness", "aggravating_relieving"], discriminators: ["radiation", "leg_weakness_numbness", "aggravating_relieving", "character_severity", "progressive_weakness", "cauda_equina"] },
    { id: "cauda_equina", name: "Cauda equina syndrome", pointers: ["cauda_equina", "progressive_weakness"], discriminators: ["cauda_equina", "progressive_weakness", "leg_weakness_numbness", "radiation"] },
    { id: "fracture", name: "Vertebral fracture", pointers: ["trauma_osteoporosis", "age_onset", "deformity"], discriminators: ["trauma_osteoporosis", "age_onset", "deformity", "onset_mode", "character_severity"] },
    { id: "spinal_infection", name: "Spinal infection including tuberculosis", pointers: ["fever_infection", "tb_contact", "fever_weight", "deformity"], discriminators: ["fever_infection", "tb_contact", "fever_weight", "deformity", "night_pain_unrelieved", "immunocompromise", "progressive_weakness"] },
    { id: "malignancy", name: "Malignancy / spinal metastasis", pointers: ["cancer_history", "night_pain_unrelieved", "fever_weight", "age_onset"], discriminators: ["cancer_history", "night_pain_unrelieved", "fever_weight", "age_onset", "progressive_weakness"] },
    { id: "inflammatory", name: "Inflammatory back pain / spondyloarthritis", pointers: ["morning_stiffness", "eye_joint_gi", "family_spondylitis", "timing"], discriminators: ["morning_stiffness", "eye_joint_gi", "family_spondylitis", "timing", "aggravating_relieving", "age_onset"] },
    { id: "referred", name: "Referred pain from abdomen or pelvis", pointers: ["abdominal_urinary"], discriminators: ["abdominal_urinary", "aggravating_relieving", "site", "character_severity"] },
    { id: "spinal_stenosis", name: "Spinal canal stenosis", pointers: ["claudication", "radiation"], discriminators: ["claudication", "radiation", "aggravating_relieving", "age_onset", "leg_weakness_numbness"] },
  ],
  output: {
    durationSlot: "duration",
    hpiOrder: ["onset", "duration", "onset_mode", "site", "radiation", "character_severity", "aggravating_relieving", "timing", "morning_stiffness", "progression", "prior_treatment", "prior_investigations"],
  },
};
