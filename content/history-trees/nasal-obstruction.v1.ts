import type { HistoryTree } from "@/lib/history-check/types";
import { commonHpi, DHINGRA, HUTCHISONS, IMMUNOCOMPROMISE, MACLEODS, val, yn } from "@/content/history-trees/_helpers";

/**
 * NASAL OBSTRUCTION — v1.0.0. CLINICAL CONTENT: REVIEWED (Dr Anubhav Verma).
 * ENT ward and casualty, north India. Most blocked noses are allergic, septal or infective; the
 * history exists to find the one-sided block that is a growth, the child with a forgotten object
 * in the nose, and the diabetic or immunosuppressed patient whose black crusts and facial pain
 * mean invasive fungal disease that spreads to the eye and brain within days.
 * Differentials: allergic rhinitis, deviated nasal septum, acute or chronic rhinosinusitis,
 * nasal polyps, adenoid hypertrophy in children, nasal foreign body, invasive fungal sinusitis
 * (including mucormycosis), sinonasal or nasopharyngeal malignancy, juvenile nasopharyngeal
 * angiofibroma in adolescent males.
 */
export const nasalObstructionV1: HistoryTree = {
  id: "nasal_obstruction",
  version: "1.1.0",
  complaint: "Nasal obstruction",
  triggers: ["nasal obstruction", "blocked nose", "nose block", "nasal blockage", "stuffy nose", "cannot breathe through nose", "naak band", "naak bandh", "nose blocked", "sinusitis", "nasal polyp", "running nose", "sneezing"],
  setting: "ENT ward and casualty, north India",
  reviewStatus: "pending_clinician_review",
  reviewedBy: null,
  references: [DHINGRA, MACLEODS, HUTCHISONS],
  slots: [
    ...commonHpi("nasal obstruction"),
    val("hpi", "side", "Which side", "Is the block on one side, both sides, or does it alternate between sides?", ["one side", "right side", "left side", "both sides", "bilateral", "unilateral", "alternating", "shifts sides"], { teach: "A block that stays on one side points to a structural cause or a growth, while an alternating block fits mucosal swelling." }),
    val("hpi", "pattern", "Pattern", "Is the block constant, or does it come and go with season, dust, time of day or lying down?", ["constant", "intermittent", "seasonal", "morning", "night", "lying down", "dust", "winter", "comes and goes", "perennial"]),
    yn("hpi", "nasal_discharge", "Nasal discharge", "Is there any discharge from the nose — watery, thick, coloured, foul smelling, or blood stained?", ["discharge", "watery", "running nose", "thick", "yellow", "green", "purulent", "foul smelling", "postnasal drip", "mucus"]),
    yn("associated", "sneezing_itch", "Sneezing / itching", "Are there bouts of sneezing with itching of the nose, eyes or palate?", ["sneezing", "itching", "itchy nose", "itchy eyes", "watery eyes", "allergy", "bouts of sneezing"]),
    yn("associated", "allergy_triggers", "Allergic triggers / asthma", "Does dust, pollen, cold air or smoke bring it on, and is there asthma, eczema or allergy in the patient or family?", ["dust", "pollen", "cold air", "smoke", "asthma", "wheeze", "eczema", "allergy in family", "atopy"], { tier: "detailed" }),
    yn("associated", "smell_loss", "Reduced smell", "Has the sense of smell been reduced or lost?", ["smell", "loss of smell", "anosmia", "hyposmia", "reduced smell", "cannot smell"]),
    yn("associated", "facial_pain_headache", "Facial pain / headache", "Any pain or heaviness over the cheeks, forehead or between the eyes, worse on bending forward?", ["facial pain", "cheek pain", "heaviness", "forehead", "headache", "bending forward", "pressure", "sinus pain"]),
    yn("associated", "nose_injury", "Previous nose injury", "Has there been any injury to the nose, or previous nose surgery?", ["injury", "trauma", "fall", "blow", "fracture", "broken nose", "nose surgery", "operated", "crooked nose"]),
    yn("associated", "snoring_mouth_breathing", "Snoring / mouth breathing", "Does the patient snore, breathe through the mouth, or have disturbed sleep — and in a child, any ear blockage or hearing trouble?", ["snoring", "mouth breathing", "open mouth", "disturbed sleep", "restless sleep", "ear blocked", "hearing", "child"], { teach: "In a child, snoring, mouth breathing and ear trouble together point to enlarged tissue at the back of the nose." }),
    yn("associated", "decongestant_spray_use", "Long-term nasal spray use", "Has any nasal decongestant spray or drop been used for a long time, and does the block worsen without it?", ["nasal spray", "nasal drops", "decongestant", "spray", "drops", "otrivin", "cannot stop", "rebound"], { tier: "detailed" }),
    val("exposure", "occupation_smoking", "Occupation / smoking", "Any work with wood dust, chemicals or smoke, and any smoking or tobacco use?", ["wood dust", "carpenter", "furniture", "chemicals", "smoke", "chulha", "smoking", "bidi", "tobacco", "factory"], { tier: "detailed" }),
    // Red flags
    yn("red_flag", "unilateral_blood_foul", "One-sided block with bleeding or foul discharge", "Is the block on one side with blood stained or foul smelling discharge?", ["one side", "blood stained", "bleeding", "foul smelling", "offensive", "unilateral", "bloody discharge"], { teach: "A one-sided block with blood stained or foul discharge asks about a foreign body in a child and a growth in an adult." }),
    yn("red_flag", "eye_symptoms", "Eye swelling / double vision / vision loss", "Any swelling around the eye, protrusion of the eye, double vision, drooping lid or loss of vision?", ["eye swelling", "periorbital", "proptosis", "eye protrusion", "double vision", "diplopia", "ptosis", "vision loss", "cannot see"], { teach: "Eye signs with a blocked nose raise spread from the sinuses into the orbit, which can threaten sight within hours." }),
    yn("red_flag", "black_crust_numbness", "Black crusts / facial numbness / palate discolouration", "Any black discharge or crusts in the nose, numbness or blackening of the face, or a dark patch on the palate?", ["black discharge", "black crust", "blackish", "facial numbness", "numb cheek", "palate", "dark patch", "mucor", "fungus", "black fungus"], { teach: "Black crusts, facial numbness or a dark palate in a diabetic or immunosuppressed patient raise invasive fungal infection, which spreads quickly." }),
    yn("red_flag", "headache_drowsy", "Severe headache / drowsiness / fits", "Any severe headache, vomiting, drowsiness, confusion or fits?", ["severe headache", "vomiting", "drowsy", "confused", "altered", "seizure", "fits", "neck stiffness"], { teach: "Severe headache or altered sensorium with sinus symptoms raises spread of infection inside the skull." }),
    yn("red_flag", "young_male_bleeds", "Young male with one-sided block and heavy nose bleeds", "In an adolescent male, is there a one-sided block with repeated heavy nose bleeds?", ["adolescent", "teenager", "young male", "nose bleed", "heavy bleeding", "repeated bleeding", "one sided block"], { teach: "Repeated heavy bleeds with a one-sided block in an adolescent male raise a vascular growth, and blind biopsy can provoke severe bleeding." }),
    yn("red_flag", "neck_lump_ear_weight", "Neck lump / blocked ear / weight loss", "Any lump in the neck, one-sided ear blockage, loosening of teeth, or loss of weight?", ["neck lump", "neck swelling", "ear blocked", "one ear", "loose teeth", "weight loss", "cheek swelling"], { teach: "A neck lump or a one-sided blocked ear with nasal obstruction in an adult asks about a growth in the nasopharynx." }),
    IMMUNOCOMPROMISE,
  ],
  differentials: [
    { id: "allergic_rhinitis", name: "Allergic rhinitis", pointers: ["sneezing_itch", "allergy_triggers", "pattern"], discriminators: ["sneezing_itch", "allergy_triggers", "pattern", "side", "nasal_discharge"] },
    { id: "deviated_septum", name: "Deviated nasal septum", pointers: ["nose_injury", "side"], discriminators: ["nose_injury", "side", "pattern", "duration", "sneezing_itch"] },
    { id: "rhinosinusitis", name: "Acute or chronic rhinosinusitis", pointers: ["facial_pain_headache", "nasal_discharge", "smell_loss"], discriminators: ["facial_pain_headache", "nasal_discharge", "smell_loss", "duration", "eye_symptoms"] },
    { id: "nasal_polyps", name: "Nasal polyps", pointers: ["smell_loss", "allergy_triggers"], discriminators: ["smell_loss", "allergy_triggers", "side", "progression", "unilateral_blood_foul"] },
    { id: "adenoid_hypertrophy", name: "Adenoid hypertrophy (child)", pointers: ["snoring_mouth_breathing"], discriminators: ["snoring_mouth_breathing", "side", "nasal_discharge", "pattern", "duration"] },
    { id: "nasal_foreign_body", name: "Nasal foreign body", pointers: ["unilateral_blood_foul", "side"], discriminators: ["unilateral_blood_foul", "side", "onset", "nasal_discharge", "informant"] },
    { id: "invasive_fungal", name: "Invasive fungal sinusitis (including mucormycosis)", pointers: ["black_crust_numbness", "immunocompromise", "eye_symptoms"], discriminators: ["black_crust_numbness", "immunocompromise", "eye_symptoms", "headache_drowsy", "facial_pain_headache"] },
    { id: "sinonasal_malignancy", name: "Sinonasal or nasopharyngeal malignancy", pointers: ["unilateral_blood_foul", "neck_lump_ear_weight"], discriminators: ["unilateral_blood_foul", "neck_lump_ear_weight", "eye_symptoms", "occupation_smoking", "progression"] },
    { id: "angiofibroma", name: "Juvenile nasopharyngeal angiofibroma", pointers: ["young_male_bleeds"], discriminators: ["young_male_bleeds", "side", "progression", "eye_symptoms", "unilateral_blood_foul"] },
  ],
  output: {
    durationSlot: "duration",
    hpiOrder: ["onset", "duration", "side", "pattern", "nasal_discharge", "onset_mode", "progression", "prior_treatment", "prior_investigations"],
  },
};
