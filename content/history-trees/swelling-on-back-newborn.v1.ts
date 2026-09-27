import type { HistoryTree } from "@/lib/history-check/types";
import { BAILEY_LOVE, commonHpi, GHAI_PAEDIATRICS, HUTCHISONS, MACLEODS, paedBackground, val, yn, YOUMANS } from "@/content/history-trees/_helpers";

/**
 * SWELLING ON THE BACK OR HEAD OF A BABY — v1.0.0. CLINICAL CONTENT: REVIEWED (Dr Anubhav Verma).
 * Neurosurgery ward and casualty, north India. The baby is usually brought within days of
 * birth, often after a home or small-centre delivery with no anomaly scan, and the mother or a
 * grandmother is the informant. The history asks what covers the swelling, whether it leaks,
 * whether the legs move and the bladder and bowel work, and whether the head is growing.
 * Differentials: myelomeningocele, meningocele, lipomeningocele / lipomyelomeningocele,
 * encephalocele, dermal sinus, sacrococcygeal teratoma, associated hydrocephalus / Chiari II,
 * neurogenic bladder, and a skin-covered lump unrelated to the spinal canal.
 */
export const neuralTubeSwellingV1: HistoryTree = {
  id: "neural_tube_swelling",
  version: "1.0.0",
  complaint: "Swelling on the back or head of a baby",
  triggers: ["swelling on back", "swelling on the back", "swelling on back of baby", "swelling on head of baby", "sac on back", "meningocele", "myelomeningocele", "meningomyelocele", "lipomeningocele", "encephalocele", "spina bifida", "neural tube defect", "peeth par gaanth", "peeth par sujan", "sir par thaili"],
  setting: "Neurosurgery ward and casualty, north India",
  reviewStatus: "reviewed",
  reviewedBy: "Dr Anubhav Verma",
  references: [GHAI_PAEDIATRICS, YOUMANS, BAILEY_LOVE, MACLEODS, HUTCHISONS],
  slots: [
    ...commonHpi("swelling"),
    ...paedBackground(),
    val("hpi", "swelling_site", "Site of the swelling", "Where exactly is the swelling — back of the head, forehead or root of the nose, neck, middle of the back, lower back, or below the tailbone?", ["back of head", "occiput", "forehead", "root of nose", "neck", "upper back", "lower back", "lumbar", "sacrum", "tailbone", "buttock", "midline"]),
    yn("hpi", "present_at_birth", "Present at birth", "Was the swelling there at birth, or noticed later?", ["at birth", "since birth", "from birth", "noticed later", "appeared after", "janam se"]),
    val("hpi", "swelling_covering", "What covers the swelling", "What covers the swelling — normal skin, a thin see-through membrane, raw red tissue — and is there a tuft of hair, a dimple, a birthmark or a hole nearby?", ["skin covered", "normal skin", "thin membrane", "transparent", "raw", "red", "open", "tuft of hair", "hair", "dimple", "birthmark", "hole", "pit"], { teach: "An open or thin-walled sac and a fully skin-covered swelling carry very different risks of infection and of cord involvement." }),
    val("hpi", "size_change", "Change in size", "Has the swelling changed in size since birth, and does it become tense or bigger when the baby cries?", ["bigger", "growing", "same size", "smaller", "tense on crying", "bigger on crying", "cough impulse", "shrunk"]),
    yn("hpi", "solid_or_bleeding_mass", "Large, firm or bleeding mass below the tailbone", "Is the swelling large and firm, lying below the tailbone or pushing the anus forward, or has it bled?", ["large mass", "firm", "hard", "below tailbone", "buttock mass", "bled", "bleeding", "anus pushed", "lobulated"]),
    yn("hpi", "sinus_discharge", "Pit or opening with discharge", "Is there a small pit or opening in the midline that discharges, or has there been an infection there?", ["pit", "hole", "opening", "discharge", "pus", "infection", "sinus", "dimple leaking"]),
    val("hpi", "leg_movement", "Leg movement", "Does the baby kick and move both legs, and has that changed since birth?", ["kicks", "moves both legs", "moves legs", "legs not moving", "legs floppy", "one leg", "less movement", "no movement", "pair nahi hila raha"]),
    yn("hpi", "feet_deformity", "Feet or leg deformity", "Are the feet turned in, or the hips or knees stiff or deformed?", ["club foot", "club feet", "feet turned in", "clubfoot", "ctev", "stiff knees", "stiff hips", "deformed legs", "tedhe pair"]),
    val("hpi", "urine_pattern", "Passing urine", "How does the baby pass urine — a good stream, a constant dribble with the nappy always wet, or very little?", ["good stream", "dribbling", "always wet", "constant dribble", "not passing urine", "less urine", "nappy wet", "peshab"]),
    val("hpi", "stool_pattern", "Passing stool", "Did the baby pass meconium, and are stools passed normally or is there constant soiling?", ["meconium", "passed stool", "not passed stool", "constant soiling", "soiling", "normal stools", "potty"]),
    yn("associated", "head_growth", "Head growing", "Is the head large or growing, the soft spot full, or the scalp veins prominent?", ["big head", "head growing", "large head", "full fontanelle", "bulging fontanelle", "soft spot", "scalp veins", "sir bada"], { teach: "Most babies with an open spinal sac develop fluid build-up in the brain, sometimes only after the back is closed." }),
    yn("associated", "baby_feeding_trouble", "Feeding difficulty", "Is the baby sucking well, or choking, coughing or tiring during feeds?", ["sucking well", "not sucking", "choking", "coughing on feeds", "tires on feeds", "milk from nose", "poor feeding"]),
    val("associated", "antenatal_scan", "Antenatal scan", "Was an anomaly scan done in pregnancy, at what stage, and what did it show?", ["scan", "anomaly scan", "ultrasound", "usg", "level two", "no scan", "not done", "normal scan", "weeks", "told about"], { numeric: true }),
    yn("associated", "folic_acid", "Folic acid in early pregnancy", "Was folic acid taken before conception or in the first weeks of pregnancy?", ["folic acid", "folate", "iron folic", "not taken", "started late", "from third month", "before pregnancy"], { teach: "Whether folic acid was taken early matters for counselling about the next pregnancy." }),
    yn("associated", "maternal_risks", "Maternal illness or medicines in pregnancy", "Did the mother have diabetes, high fever in early pregnancy, or take medicine for fits during pregnancy?", ["diabetes", "sugar", "fever in pregnancy", "fits medicine", "epilepsy", "valproate", "anti epileptic", "no illness"]),
    // Red flags
    yn("red_flag", "sac_leak", "Leaking or ruptured sac", "Is the sac leaking clear fluid, broken open, or has its covering become raw or discoloured?", ["leaking", "clear fluid", "ruptured", "burst", "broken", "raw", "discoloured", "wet dressing", "paani nikal raha"], { teach: "A leaking or ruptured sac is an open route into the nervous system, and the time since rupture is part of the history." }),
    yn("red_flag", "sepsis_signs", "Fever, lethargy or fits", "Any fever, cold body, lethargy, poor cry, fits or refusal of feeds?", ["fever", "cold", "lethargic", "sleepy", "poor cry", "weak cry", "fits", "jerking", "refusing feeds", "sust"], { teach: "In a baby with an open or leaking sac, fever, lethargy or fits raise concern for meningitis or ventriculitis." }),
    yn("red_flag", "raised_pressure", "Signs of raised pressure", "Is the soft spot tense, the eyes turned down, or is there repeated vomiting or irritability?", ["tense fontanelle", "bulging", "eyes down", "sunsetting", "vomiting", "irritable", "high pitched cry"], { teach: "A tense soft spot with eyes turned down and vomiting marks rising pressure from fluid build-up in the brain." }),
    yn("red_flag", "brainstem_signs", "Noisy breathing, pauses or weak cry", "Any noisy breathing, pauses in breathing, blue spells, choking on feeds, or a weak or hoarse cry?", ["noisy breathing", "stridor", "pauses", "apnoea", "blue spells", "choking", "weak cry", "hoarse cry", "stops breathing"], { teach: "Noisy breathing, apnoea and choking in these babies can come from pressure on the lower brainstem and can be life-threatening." }),
    yn("red_flag", "no_urine", "No urine passed", "Has the baby not passed urine for many hours, or is the lower abdomen full and tense?", ["no urine", "not passed urine", "dry nappy", "lower abdomen full", "bladder full", "tense belly"]),
    yn("exposure", "family_ntd", "Similar problem in the family", "Has a previous baby or a relative had a swelling on the back or head, a baby without a skull, or a lost pregnancy with such a problem?", ["previous baby", "sibling", "same problem", "relative", "anencephaly", "lost pregnancy", "abnormal baby", "termination"], { tier: "detailed" }),
  ],
  differentials: [
    { id: "myelomeningocele", name: "Myelomeningocele (open spina bifida)", pointers: ["sac_leak", "feet_deformity", "head_growth"], discriminators: ["swelling_covering", "leg_movement", "feet_deformity", "urine_pattern", "stool_pattern", "head_growth", "sac_leak"] },
    { id: "meningocele", name: "Meningocele", pointers: ["size_change", "present_at_birth"], discriminators: ["swelling_covering", "size_change", "leg_movement", "urine_pattern", "feet_deformity"] },
    { id: "lipomeningocele", name: "Lipomeningocele or lipomyelomeningocele", pointers: ["swelling_covering"], discriminators: ["swelling_covering", "swelling_site", "feet_deformity", "urine_pattern", "leg_movement"] },
    { id: "encephalocele", name: "Encephalocele", pointers: ["swelling_site", "brainstem_signs"], discriminators: ["swelling_site", "swelling_covering", "size_change", "baby_feeding_trouble", "sepsis_signs"] },
    { id: "dermal_sinus", name: "Dermal sinus", pointers: ["sinus_discharge", "sepsis_signs"], discriminators: ["sinus_discharge", "swelling_covering", "sepsis_signs", "leg_movement"] },
    { id: "sacrococcygeal_teratoma", name: "Sacrococcygeal teratoma", pointers: ["solid_or_bleeding_mass"], discriminators: ["solid_or_bleeding_mass", "swelling_site", "stool_pattern", "urine_pattern", "antenatal_scan"] },
    { id: "hydrocephalus_chiari", name: "Associated hydrocephalus or Chiari II malformation", pointers: ["head_growth", "raised_pressure", "brainstem_signs"], discriminators: ["head_growth", "raised_pressure", "brainstem_signs", "baby_feeding_trouble"] },
    { id: "neurogenic_bladder", name: "Neurogenic bladder and bowel", pointers: ["no_urine", "urine_pattern"], discriminators: ["urine_pattern", "stool_pattern", "no_urine", "leg_movement"] },
    { id: "superficial_lump", name: "Skin-covered lump unrelated to the spinal canal (haemangioma, simple lipoma)", pointers: ["size_change"], discriminators: ["swelling_site", "swelling_covering", "size_change", "leg_movement", "urine_pattern"] },
  ],
  output: {
    durationSlot: "duration",
    hpiOrder: ["onset", "duration", "present_at_birth", "swelling_site", "swelling_covering", "size_change", "leg_movement", "feet_deformity", "urine_pattern", "stool_pattern", "antenatal_scan", "folic_acid", "progression", "prior_treatment", "prior_investigations"],
  },
};
