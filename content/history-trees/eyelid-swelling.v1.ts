import type { HistoryTree } from "@/lib/history-check/types";
import { commonHpi, HUTCHISONS, IMMUNOCOMPROMISE, MACLEODS, PARSONS_EYE, val, yn } from "@/content/history-trees/_helpers";

/**
 * SWELLING OF THE EYELID — v1.0.0. CLINICAL CONTENT: REVIEWED (Dr Anubhav Verma).
 * Eye ward and casualty, north India. Most lid swellings are a stye, a chalazion or an allergy;
 * the history exists to find the few that have gone behind the septum into the orbit, and the
 * diabetic with black crusts in the nose. Vision, eye movement and fever separate them.
 * Differentials: stye (hordeolum), chalazion, allergic swelling or angioedema, insect bite
 * reaction, preseptal cellulitis, orbital cellulitis, acute dacryocystitis, lid haematoma
 * after injury, thyroid eye disease, nephrotic or other systemic oedema, eyelid tumour,
 * rhino-orbital mucormycosis.
 */
export const eyelidSwellingV1: HistoryTree = {
  id: "eyelid_swelling",
  version: "1.0.0",
  complaint: "Swelling of the eyelid / around the eye",
  triggers: ["eyelid swelling", "swelling of eyelid", "swollen eyelid", "lid swelling", "swelling around eye", "periorbital swelling", "puffy eyes", "stye", "chalazion", "gudheri", "anjani", "aankh sooj gayi", "aankh me sujan"],
  setting: "Eye ward and casualty, north India",
  reviewStatus: "reviewed",
  reviewedBy: "Dr Anubhav Verma",
  references: [PARSONS_EYE, MACLEODS, HUTCHISONS],
  slots: [
    ...commonHpi("swelling of the eyelid"),
    val("hpi", "side", "Which eye and which lid", "Which eye, upper or lower lid, and is one side or both affected?", ["right eye", "left eye", "both eyes", "upper lid", "lower lid", "one side", "both sides", "bilateral", "inner corner"]),
    val("hpi", "lump_or_diffuse", "Lump or whole-lid swelling", "Is there a small lump at the lid margin or within the lid, or is the whole lid puffy?", ["lump", "boil", "pimple", "at the margin", "near lashes", "inside the lid", "whole lid", "puffy", "diffuse", "pea sized"], { teach: "A tender lump at the lash line and a painless lump within the lid are different problems, and a diffusely swollen lid is a third." }),
    yn("hpi", "pain_tenderness", "Pain / tenderness", "Is the swelling painful or tender to touch?", ["pain", "painful", "tender", "throbbing", "painless", "no pain", "sore"]),
    yn("associated", "itching_new_exposure", "Itching / new cream, kajal, dye, food or medicine", "Is the swelling itchy, and did it follow a new cream, kajal, hair dye, food or medicine?", ["itching", "itchy", "kajal", "surma", "cream", "hair dye", "mehndi", "new medicine", "food", "allergy", "cosmetic"], { teach: "Itching with a new exposure points to an allergic swelling, which comes and goes quickly and is usually painless." }),
    yn("associated", "inner_corner_discharge", "Swelling at inner corner / watering / pus", "Is the swelling at the inner corner near the nose, with watering and pus coming out on pressing?", ["inner corner", "near the nose", "watering", "pus", "discharge on pressing", "sticky", "tear sac", "long standing watering"]),
    yn("associated", "bite_or_injury", "Insect bite, sting or injury", "Was there an insect bite, a sting, or a blow or injury to the eye or face?", ["insect bite", "mosquito", "bee", "wasp", "sting", "injury", "blow", "hit", "fall", "fist", "trauma"]),
    yn("associated", "sinus_tooth_symptoms", "Cold, sinus pain or toothache", "Any recent cold, blocked nose, sinus pain, or toothache on the same side?", ["cold", "blocked nose", "sinus", "sinusitis", "nasal discharge", "toothache", "dental", "headache over cheek"], { teach: "Infection often reaches the orbit from the sinuses or teeth, so the source matters as much as the swelling." }),
    yn("associated", "systemic_oedema", "Morning puffiness in both eyes / frothy urine / swollen feet", "Is the puffiness worse on waking in both eyes, with frothy urine, less urine, or swelling of the feet?", ["morning", "on waking", "both eyes", "frothy urine", "less urine", "swelling of feet", "pedal", "face puffy", "kidney"], { teach: "Painless puffiness of both lids on waking often comes from the kidneys or heart rather than the eye." }),
    yn("associated", "thyroid_symptoms", "Bulging eyes / thyroid symptoms", "Any bulging or staring eyes, heat intolerance, weight loss, palpitations, or known thyroid disease?", ["bulging", "staring", "prominent eyes", "thyroid", "heat intolerance", "weight loss", "palpitations", "goitre", "tremor"], { tier: "detailed" }),
    yn("associated", "slow_growing_lump", "Slowly growing or recurring lump", "Is there a slowly growing painless lump, or one that keeps returning at the same place, with loss of lashes, bleeding or ulceration?", ["slowly growing", "increasing", "recurring", "same place", "keeps coming back", "loss of lashes", "bleeding", "ulcer", "crusting", "hard lump"], { tier: "detailed", teach: "A lid lump that keeps returning at the same site, or loses lashes, is worth a closer look for a growth rather than another chalazion." }),
    // Red flags
    yn("red_flag", "vision_movement_proptosis", "Vision drop / eye pushed forward / painful or restricted movement", "Has vision dropped, is the eye pushed forward, or is moving the eye painful or restricted, with double vision?", ["vision dropped", "blurred", "cannot see", "pushed forward", "proptosis", "bulging", "pain on moving", "cannot move eye", "double vision", "restricted"], { teach: "Reduced vision, restricted movement or a protruding eye marks spread behind the septum into the orbit, not just the lid." }),
    yn("red_flag", "fever_unwell", "Fever / drowsiness / vomiting", "Is there fever, and is the patient drowsy, confused, vomiting or unusually unwell?", ["fever", "chills", "drowsy", "confused", "vomiting", "unwell", "headache", "neck stiffness", "lethargic"], { teach: "Fever with drowsiness in a patient with a swollen eye raises spread of infection into the veins behind the eye or the brain." }),
    yn("red_flag", "black_nasal_crusts", "Black crusts in nose or palate / facial numbness", "Any black crusts in the nose or on the palate, blood-stained nasal discharge, facial pain, or numbness of the cheek?", ["black crust", "black discharge", "black patch", "palate", "blood stained nasal discharge", "facial pain", "facial numbness", "cheek numb", "tooth loosening", "nose blocked"], { teach: "A diabetic or recently steroid-treated patient with black nasal crusts and a swollen eye raises an invasive fungal infection that spreads by the hour." }),
    yn("red_flag", "airway_swelling", "Lip or tongue swelling / breathing difficulty", "Any swelling of the lips or tongue, difficulty breathing, hoarse voice, or rash spreading over the body?", ["lip swelling", "tongue swelling", "difficulty breathing", "breathless", "hoarse", "wheeze", "hives", "rash", "throat tight"], { teach: "Lid swelling that spreads to the lips, tongue or throat can threaten the airway within minutes." }),
    IMMUNOCOMPROMISE,
  ],
  differentials: [
    { id: "stye", name: "Stye (hordeolum)", pointers: ["lump_or_diffuse", "pain_tenderness"], discriminators: ["lump_or_diffuse", "pain_tenderness", "onset_mode", "slow_growing_lump"] },
    { id: "chalazion", name: "Chalazion", pointers: ["lump_or_diffuse", "slow_growing_lump"], discriminators: ["lump_or_diffuse", "pain_tenderness", "slow_growing_lump", "progression"] },
    { id: "allergic_angioedema", name: "Allergic swelling or angioedema", pointers: ["itching_new_exposure", "airway_swelling"], discriminators: ["itching_new_exposure", "airway_swelling", "pain_tenderness", "onset_mode", "side"] },
    { id: "insect_bite", name: "Insect bite reaction", pointers: ["bite_or_injury", "itching_new_exposure"], discriminators: ["bite_or_injury", "itching_new_exposure", "fever_unwell", "pain_tenderness"] },
    { id: "preseptal_cellulitis", name: "Preseptal cellulitis", pointers: ["pain_tenderness", "sinus_tooth_symptoms", "bite_or_injury"], discriminators: ["vision_movement_proptosis", "fever_unwell", "pain_tenderness", "sinus_tooth_symptoms", "side"] },
    { id: "orbital_cellulitis", name: "Orbital cellulitis", pointers: ["vision_movement_proptosis", "fever_unwell", "sinus_tooth_symptoms"], discriminators: ["vision_movement_proptosis", "fever_unwell", "sinus_tooth_symptoms", "immunocompromise", "progression"] },
    { id: "dacryocystitis", name: "Acute dacryocystitis", pointers: ["inner_corner_discharge"], discriminators: ["inner_corner_discharge", "side", "pain_tenderness", "fever_unwell"] },
    { id: "lid_haematoma", name: "Lid haematoma after injury", pointers: ["bite_or_injury"], discriminators: ["bite_or_injury", "vision_movement_proptosis", "onset", "pain_tenderness"] },
    { id: "thyroid_eye_disease", name: "Thyroid eye disease", pointers: ["thyroid_symptoms", "vision_movement_proptosis"], discriminators: ["thyroid_symptoms", "side", "progression", "systemic_oedema"] },
    { id: "systemic_oedema", name: "Nephrotic or other systemic oedema", pointers: ["systemic_oedema"], discriminators: ["systemic_oedema", "side", "pain_tenderness", "itching_new_exposure"] },
    { id: "lid_tumour", name: "Eyelid tumour", pointers: ["slow_growing_lump"], discriminators: ["slow_growing_lump", "lump_or_diffuse", "progression", "pain_tenderness"] },
    { id: "mucormycosis", name: "Rhino-orbital mucormycosis", pointers: ["black_nasal_crusts", "immunocompromise"], discriminators: ["black_nasal_crusts", "immunocompromise", "vision_movement_proptosis", "sinus_tooth_symptoms", "fever_unwell"] },
  ],
  output: {
    durationSlot: "duration",
    hpiOrder: ["onset", "duration", "side", "lump_or_diffuse", "pain_tenderness", "onset_mode", "progression", "prior_treatment", "prior_investigations"],
  },
};
