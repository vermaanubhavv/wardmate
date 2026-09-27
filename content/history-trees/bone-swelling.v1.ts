import type { HistoryTree } from "@/lib/history-check/types";
import { APLEY, BAILEY_LOVE, commonHpi, HUTCHISONS, IMMUNOCOMPROMISE, MACLEODS, surgicalBackground, val, yn } from "@/content/history-trees/_helpers";

/**
 * SWELLING OR PAIN IN A BONE — v1.0.0. CLINICAL CONTENT: REVIEWED (Dr Anubhav Verma).
 * Orthopaedics ward and casualty, north India. The history separates infection from tumour
 * from injury: how fast it grew, whether it hurts at night, whether there was fever or pus,
 * and whether there is a cancer elsewhere. Chronic osteomyelitis with a discharging sinus and
 * tuberculosis of bone are common here. Differentials: acute osteomyelitis, chronic
 * osteomyelitis with sinus, Brodie's abscess, tuberculosis of bone, osteosarcoma, Ewing's
 * sarcoma, giant cell tumour, osteochondroma or exostosis, metastatic deposit, myeloma,
 * fracture or callus, fibrous dysplasia, bone cyst.
 */
export const boneSwellingV1: HistoryTree = {
  id: "bone_swelling",
  version: "1.0.0",
  complaint: "Swelling or pain in a bone",
  triggers: ["bone swelling", "swelling in bone", "swelling of bone", "bony swelling", "bony lump", "bone pain", "pain in bone", "bone tumour", "bone tumor", "osteomyelitis", "discharging sinus", "pus from bone", "exostosis", "haddi me sujan", "haddi me dard"],
  setting: "Orthopaedics ward and casualty, north India",
  reviewStatus: "reviewed",
  reviewedBy: "Dr Anubhav Verma",
  references: [APLEY, BAILEY_LOVE, MACLEODS, HUTCHISONS],
  slots: [
    ...commonHpi("bone swelling"),
    val("hpi", "bone_site", "Site", "Which bone is involved, and is the swelling near the end of the bone by a joint or in the middle of the shaft?", ["femur", "thigh", "tibia", "shin", "humerus", "arm", "forearm", "pelvis", "rib", "skull", "spine", "near the knee", "near the shoulder", "near a joint", "middle of the bone", "site"], { teach: "Each bone tumour and infection has favourite sites, so the bone and the part of it narrow the list before any film is taken." }),
    val("hpi", "growth_rate", "Rate of growth", "Has the swelling grown, and how fast — over days, weeks, months or years?", ["grown", "increasing", "rapid", "slow", "static", "same size", "days", "weeks", "months", "years"], { numeric: true }),
    val("hpi", "bone_pain", "Pain", "Is the swelling painful — a constant ache, pain on use, or painless?", ["pain", "painful", "ache", "constant", "on use", "painless", "throbbing", "tender", "dull"]),
    yn("hpi", "noticed_after_injury", "Noticed after an injury", "Was the swelling first noticed after a knock or injury?", ["after injury", "after a fall", "knock", "hit", "trauma", "noticed after", "sports"], { teach: "A minor knock often only draws attention to a swelling that was already there, so the injury should not close the question." }),
    val("hpi", "joint_function", "Effect on the nearby joint", "Is movement of the nearby joint restricted, or is there difficulty walking or using the limb?", ["cannot bend", "restricted", "stiff", "limping", "cannot walk", "cannot lift", "using the limb", "joint movement"]),
    yn("hpi", "other_bone_swellings", "Swellings in other bones", "Are there similar bony swellings elsewhere in the body?", ["other swellings", "multiple", "elsewhere", "both knees", "many lumps", "other bones", "similar swelling"], { tier: "detailed" }),
    yn("associated", "local_heat_fever", "Fever / redness / warmth over the swelling", "Any fever, or is the skin over the swelling red, warm or tender?", ["fever", "red", "redness", "warm", "hot", "tender", "chills", "rigors"]),
    yn("associated", "sinus_discharge", "Discharging sinus / pieces of bone coming out", "Is there a wound or opening over the bone that discharges pus, or have pieces of bone come out?", ["discharge", "pus", "sinus", "opening", "wound", "bone pieces", "sequestrum", "draining", "healed and reopened"], { teach: "A sinus that heals and reopens over a bone, especially with fragments of bone, points to chronic bone infection with dead bone inside." }),
    yn("associated", "bone_constitutional", "Weight loss / appetite / night sweats", "Any weight loss, loss of appetite or night sweats?", ["weight loss", "lost weight", "loss of appetite", "night sweats", "evening fever"]),
    yn("associated", "skin_over_swelling", "Change in the skin over the swelling", "Is the skin over the swelling shiny, stretched, or showing prominent veins?", ["shiny", "stretched", "veins", "dilated veins", "skin changes", "discoloured", "tense"], { tier: "detailed" }),
    yn("associated", "anaemia_kidney", "Tiredness / pallor / repeated infections / frothy urine", "Any tiredness, pallor, repeated infections, frothy urine, or pains in several bones?", ["tiredness", "pallor", "anaemia", "repeated infections", "frothy urine", "kidney", "several bones", "back pain", "thirst"], { tier: "detailed", teach: "Anaemia, kidney trouble and pain in several bones together raise a marrow disease rather than a single bone lesion." }),
    yn("associated", "skin_patches_puberty", "Skin patches / early puberty", "Any large light-brown patches on the skin, or unusually early puberty?", ["brown patches", "cafe au lait", "skin patches", "early puberty", "early periods", "birthmark"], { tier: "detailed" }),
    // Red flags
    yn("red_flag", "rapid_growth_night_pain", "Rapid growth / pain at night", "Is the swelling growing quickly, or is the pain worse at night or at rest?", ["rapid", "growing quickly", "night pain", "wakes at night", "at rest", "constant", "worse at night", "not relieved"], { teach: "A bone swelling that grows over weeks and hurts at night needs a tumour kept in mind until imaging and biopsy say otherwise, and a biopsy done elsewhere can spoil later surgery." }),
    yn("red_flag", "pathological_fracture", "Bone broke with little force", "Did the bone break after very little force, or was there pain in the bone before it broke?", ["broke", "fracture", "little force", "trivial", "minor fall", "pain before", "snapped", "weak bone"], { teach: "A break through a bone that was already painful or swollen raises a lesion weakening the bone rather than a simple injury." }),
    yn("red_flag", "acute_bone_fever", "Sudden severe bone pain with fever / not using the limb", "Is there sudden severe pain in the bone with high fever, or refusal to use or move the limb?", ["high fever", "severe pain", "sudden", "refuses to move", "not using limb", "cannot touch", "rigors", "cries on moving"], { teach: "Acute bone infection in the first days may show only fever and a limb that is not used, and delay in recognition shapes whether the bone survives." }),
    yn("red_flag", "known_cancer", "Known cancer elsewhere", "Any known cancer, or a lump in the breast, thyroid, kidney or prostate trouble?", ["cancer", "malignancy", "breast lump", "thyroid", "kidney", "prostate", "lung", "chemotherapy", "radiotherapy", "known case"], { teach: "Most destructive bone lesions after middle age are deposits from a cancer elsewhere, so the primary is asked about before the bone." }),
    yn("red_flag", "chest_symptoms", "Cough / breathlessness / blood in sputum", "Any cough, breathlessness or blood in the sputum?", ["cough", "breathlessness", "breathless", "blood in sputum", "haemoptysis", "chest pain"], { tier: "detailed", teach: "Bone sarcomas spread to the lungs first, and a lung cancer can present with a bone deposit." }),
    yn("red_flag", "limb_neuro_deficit", "Numbness / weakness beyond the swelling", "Any numbness, tingling or weakness beyond the swelling, or leg weakness and bladder change with a spinal swelling?", ["numbness", "tingling", "weakness", "foot drop", "cannot move", "bladder", "retention", "legs weak"], { teach: "A swelling pressing on a nerve or the cord changes the urgency of everything that follows." }),
    IMMUNOCOMPROMISE,
    yn("exposure", "tb_contact", "TB contact / past TB", "Any past tuberculosis or contact with tuberculosis?", ["tb", "tuberculosis", "koch", "att", "akt", "tb contact", "cough in family"]),
    yn("exposure", "previous_injury_site", "Previous fracture, wound or surgery at the site", "Any previous fracture, open wound, surgery, implant or traditional bone-setting at the same site?", ["previous fracture", "open wound", "surgery", "operated", "plate", "nail", "implant", "bone setter", "massage", "same site", "old injury"], { teach: "Infection months or years after an open fracture or an implant is a common cause of chronic bone infection." }),
    yn("exposure", "sickle_cell", "Sickle cell disease", "Any sickle cell disease or recurrent painful crises in the patient or family?", ["sickle cell", "sickle", "hbss", "painful crises", "crisis", "family"], { tier: "detailed" }),
    yn("exposure", "family_bone_swellings", "Family history of bony swellings", "Any similar bony swellings in parents or siblings?", ["family history", "father", "mother", "brother", "sister", "similar swelling", "runs in family"], { tier: "detailed" }),
    ...surgicalBackground(),
  ],
  differentials: [
    { id: "acute_osteomyelitis", name: "Acute osteomyelitis", pointers: ["acute_bone_fever", "local_heat_fever"], discriminators: ["acute_bone_fever", "local_heat_fever", "onset_mode", "sickle_cell", "immunocompromise", "joint_function"] },
    { id: "chronic_osteomyelitis", name: "Chronic osteomyelitis with discharging sinus", pointers: ["sinus_discharge", "previous_injury_site"], discriminators: ["sinus_discharge", "previous_injury_site", "local_heat_fever", "growth_rate", "sickle_cell"] },
    { id: "brodie", name: "Brodie's abscess", pointers: ["rapid_growth_night_pain", "bone_pain"], discriminators: ["bone_pain", "rapid_growth_night_pain", "local_heat_fever", "bone_site", "growth_rate"] },
    { id: "tb_bone", name: "Tuberculosis of bone", pointers: ["tb_contact", "bone_constitutional", "sinus_discharge"], discriminators: ["tb_contact", "bone_constitutional", "sinus_discharge", "growth_rate", "immunocompromise"] },
    { id: "osteosarcoma", name: "Osteosarcoma", pointers: ["rapid_growth_night_pain", "bone_site", "skin_over_swelling"], discriminators: ["rapid_growth_night_pain", "bone_site", "skin_over_swelling", "chest_symptoms", "pathological_fracture", "noticed_after_injury"] },
    { id: "ewing", name: "Ewing's sarcoma", pointers: ["rapid_growth_night_pain", "local_heat_fever", "bone_constitutional"], discriminators: ["rapid_growth_night_pain", "local_heat_fever", "bone_constitutional", "bone_site", "chest_symptoms"] },
    { id: "gct", name: "Giant cell tumour", pointers: ["bone_site", "joint_function"], discriminators: ["bone_site", "joint_function", "growth_rate", "pathological_fracture", "bone_pain"] },
    { id: "osteochondroma", name: "Osteochondroma or exostosis", pointers: ["other_bone_swellings", "family_bone_swellings"], discriminators: ["other_bone_swellings", "family_bone_swellings", "growth_rate", "bone_pain", "bone_site"] },
    { id: "metastasis", name: "Metastatic deposit", pointers: ["known_cancer", "pathological_fracture", "bone_constitutional"], discriminators: ["known_cancer", "pathological_fracture", "bone_constitutional", "chest_symptoms", "limb_neuro_deficit"] },
    { id: "myeloma", name: "Multiple myeloma", pointers: ["anaemia_kidney", "pathological_fracture"], discriminators: ["anaemia_kidney", "pathological_fracture", "other_bone_swellings", "bone_constitutional", "limb_neuro_deficit"] },
    { id: "fracture_callus", name: "Fracture or healing callus", pointers: ["noticed_after_injury", "previous_injury_site"], discriminators: ["noticed_after_injury", "previous_injury_site", "growth_rate", "pathological_fracture", "bone_pain"] },
    { id: "fibrous_dysplasia", name: "Fibrous dysplasia", pointers: ["skin_patches_puberty", "other_bone_swellings"], discriminators: ["skin_patches_puberty", "other_bone_swellings", "pathological_fracture", "growth_rate"] },
    { id: "bone_cyst", name: "Simple or aneurysmal bone cyst", pointers: ["pathological_fracture", "bone_site"], discriminators: ["pathological_fracture", "bone_site", "growth_rate", "bone_pain"] },
  ],
  output: {
    durationSlot: "duration",
    hpiOrder: ["onset", "duration", "onset_mode", "bone_site", "growth_rate", "bone_pain", "noticed_after_injury", "joint_function", "other_bone_swellings", "progression", "prior_treatment", "prior_investigations"],
  },
};
