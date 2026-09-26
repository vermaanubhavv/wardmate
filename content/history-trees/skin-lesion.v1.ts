import type { HistoryTree } from "@/lib/history-check/types";
import { commonHpi, HUTCHISONS, IADVL, IMMUNOCOMPROMISE, MACLEODS, val, yn } from "@/content/history-trees/_helpers";

/**
 * SKIN RASH / ITCHING — v1.0.0. CLINICAL CONTENT: PENDING CLINICIAN REVIEW.
 * Skin ward and OPD, north India. Separate from the fever-with-rash tree: this is the rash
 * brought for its own sake. The history exists to find scabies (which the whole family has),
 * the drug reaction that is about to peel, and the patch that has lost sensation.
 * Differentials: scabies, fungal infection, eczema or contact dermatitis, urticaria, psoriasis,
 * drug eruption including severe blistering reactions, leprosy, secondary syphilis or HIV
 * related dermatosis, pemphigus, systemic itch from liver, kidney or thyroid disease.
 */
export const skinLesionV1: HistoryTree = {
  id: "skin_lesion",
  version: "1.0.0",
  complaint: "Skin rash / itching",
  triggers: ["rash", "skin rash", "itching", "itchy", "pruritus", "skin lesion", "skin patch", "eruption", "boils", "blisters", "scaling", "khujli", "daad", "white patch", "red patches", "dry skin"],
  setting: "Skin ward and outpatient, north India",
  reviewStatus: "pending_clinician_review",
  reviewedBy: null,
  references: [IADVL, MACLEODS, HUTCHISONS],
  slots: [
    ...commonHpi("rash"),
    val("hpi", "site_started", "Where it started and where it spread", "Where on the body did it start, and where has it spread since?", ["started on", "hands", "feet", "face", "trunk", "back", "groin", "between fingers", "scalp", "spread", "legs", "whole body"]),
    val("hpi", "lesion_character", "What the lesions look like", "What do the lesions look like — flat patches, raised bumps, fluid filled blisters, pus filled, or scaly plaques?", ["flat", "macule", "raised", "papule", "blister", "vesicle", "bulla", "pustule", "scaly", "plaque", "ring", "wheal", "nodule", "ulcer"]),
    yn("hpi", "itch", "Itching and when it is worst", "Is it itchy, and is the itch worse at night or after a bath?", ["itching", "severe itch", "at night", "night time", "after bath", "sweating", "no itch", "burning", "cannot sleep"]),
    yn("hpi", "pain_burning", "Pain or burning in the lesions", "Are the lesions painful, burning, or tender to touch?", ["painful", "burning", "tender", "sore", "not painful", "stinging"], { tier: "detailed" }),
    yn("associated", "family_contacts", "Same complaint in family or hostel", "Does anyone else at home, in the hostel, or sharing the bed have the same itch or rash?", ["family", "children", "husband", "wife", "hostel", "same complaint", "same itch", "nobody else", "sharing bed", "contacts"], { teach: "An itch that several people in one house share, worst at night, is asked about because treating one person alone leaves the household reinfecting itself." }),
    yn("associated", "new_drugs", "New medicines before the rash", "Were any new medicines, injections, or traditional remedies taken in the weeks before the rash?", ["new medicine", "tablets", "injection", "antibiotic", "painkiller", "ayurvedic", "homeopathic", "started before", "weeks before", "fits medicine", "sulpha"], { teach: "A rash beginning days to weeks after a new medicine asks which medicine and when, since the timing is the only clue the history gives." }),
    yn("associated", "sensation_loss", "Numbness in the patch", "Is there any numbness, loss of sensation, or reduced sweating over the patch?", ["numbness", "no sensation", "loss of sensation", "cannot feel", "reduced sweating", "no sweating", "burns unnoticed", "tingling"], { teach: "A skin patch that has lost sensation is asked about everywhere leprosy remains present, and the patch is missed unless the question is put directly." }),
    yn("associated", "joint_nail_scalp", "Nail and scalp changes / joint pain", "Any pitting or thickening of the nails, scaling of the scalp, or joint pains?", ["nails", "pitting", "thick nails", "scalp", "dandruff", "scaling", "joint pain", "swollen joints", "back pain"], { tier: "detailed" }),
    yn("associated", "systemic_itch_causes", "Jaundice / kidney disease / thyroid / weight change", "Any yellowing of the eyes, kidney disease, thyroid problem, or unexplained weight change?", ["jaundice", "yellow eyes", "kidney", "dialysis", "thyroid", "weight loss", "weight gain", "dry skin", "night sweats"], { tier: "detailed" }),
    yn("associated", "atopy_history", "Asthma / allergic rhinitis / childhood eczema", "Any asthma, sneezing in the morning, or eczema since childhood, in the patient or the family?", ["asthma", "sneezing", "allergic rhinitis", "eczema", "childhood", "family", "atopy", "dust allergy"], { tier: "detailed" }),
    yn("exposure", "occupational_contact", "Work or household contact with irritants", "Any contact at work or at home with detergents, cement, chemicals, plants, or new cosmetics or jewellery?", ["detergent", "soap", "cement", "chemicals", "plants", "cosmetics", "hair dye", "jewellery", "nickel", "gloves", "washing", "work"]),
    yn("exposure", "sun_exposure", "Worse in sun exposed areas", "Is the rash worse on the face, neck and forearms, or after being in the sun?", ["sun", "sun exposed", "face", "neck", "forearms", "outdoor", "worse in sun", "covered areas spared"], { tier: "detailed" }),
    // Red flags
    yn("red_flag", "mucosal_involvement", "Sores in the mouth, eyes or genitals", "Any sores or raw areas in the mouth, eyes, or genitals?", ["mouth ulcers", "sores", "lips", "eyes", "red eyes", "genital", "raw", "cannot eat", "crusting lips"], { teach: "A rash with raw areas at two or more mucosal sites raises a severe drug reaction rather than a simple eruption." }),
    yn("red_flag", "skin_peeling", "Skin peeling or slipping off", "Is the skin peeling, blistering in sheets, or slipping off when rubbed?", ["peeling", "sheets", "slipping", "denuded", "blistering", "raw", "burn like", "large areas", "tender skin"], { teach: "Skin that slips or peels in sheets marks a reaction that behaves like a burn, with the same losses of fluid and heat." }),
    yn("red_flag", "fever_systemic", "Fever, facial swelling or feeling very unwell with the rash", "Any fever, swelling of the face, or feeling very unwell since the rash began?", ["fever", "facial swelling", "puffy face", "unwell", "lethargic", "joint pains", "lymph nodes", "breathless"], { teach: "Fever and facial swelling with a widespread rash raise a drug reaction involving organs beyond the skin." }),
    yn("red_flag", "rapid_spread_pain", "Rapidly spreading painful red area", "Is there a red area spreading rapidly with severe pain, or a black or foul smelling patch?", ["spreading", "rapidly", "hours", "severe pain", "out of proportion", "black", "foul smell", "crepitus", "swollen limb", "fever"], { teach: "Pain out of proportion over a rapidly spreading red area raises infection deep to the skin rather than in it." }),
    yn("red_flag", "non_healing_changing_lesion", "A lesion that is not healing or is changing", "Is there any single lesion that has not healed for weeks, or that has changed in size, colour or bleeding?", ["not healing", "weeks", "months", "changing", "growing", "colour change", "bleeding", "ulcer", "irregular", "raised edge"], { tier: "detailed", teach: "A single lesion that will not heal or is changing asks about a growth, which is missed while the surrounding rash is treated." }),
    IMMUNOCOMPROMISE,
  ],
  differentials: [
    { id: "scabies", name: "Scabies", pointers: ["itch", "family_contacts", "site_started"], discriminators: ["itch", "family_contacts", "site_started", "lesion_character", "duration"] },
    { id: "fungal", name: "Fungal infection", pointers: ["lesion_character", "site_started", "itch"], discriminators: ["lesion_character", "site_started", "itch", "occupational_contact", "prior_treatment"] },
    { id: "eczema_contact", name: "Eczema or contact dermatitis", pointers: ["occupational_contact", "atopy_history", "itch"], discriminators: ["occupational_contact", "atopy_history", "itch", "site_started", "lesion_character"] },
    { id: "urticaria", name: "Urticaria", pointers: ["lesion_character", "new_drugs"], discriminators: ["lesion_character", "duration", "new_drugs", "fever_systemic", "itch"] },
    { id: "psoriasis", name: "Psoriasis", pointers: ["joint_nail_scalp", "lesion_character"], discriminators: ["joint_nail_scalp", "lesion_character", "site_started", "duration", "itch"] },
    { id: "drug_eruption", name: "Drug eruption", pointers: ["new_drugs", "fever_systemic", "mucosal_involvement"], discriminators: ["new_drugs", "fever_systemic", "mucosal_involvement", "skin_peeling", "onset"] },
    { id: "leprosy", name: "Leprosy", pointers: ["sensation_loss", "lesion_character"], discriminators: ["sensation_loss", "lesion_character", "duration", "itch", "family_contacts"] },
    { id: "infective_systemic", name: "Syphilis or HIV related dermatosis", pointers: ["immunocompromise", "lesion_character", "site_started"], discriminators: ["immunocompromise", "lesion_character", "site_started", "mucosal_involvement", "duration"] },
    { id: "pemphigus", name: "Pemphigus or other blistering disease", pointers: ["skin_peeling", "mucosal_involvement"], discriminators: ["skin_peeling", "mucosal_involvement", "lesion_character", "duration", "new_drugs"] },
    { id: "systemic_pruritus", name: "Itch from liver, kidney or thyroid disease", pointers: ["systemic_itch_causes", "itch"], discriminators: ["systemic_itch_causes", "itch", "lesion_character", "duration", "family_contacts"] },
    { id: "cellulitis_deep", name: "Cellulitis or deeper soft tissue infection", pointers: ["rapid_spread_pain", "fever_systemic"], discriminators: ["rapid_spread_pain", "fever_systemic", "pain_burning", "onset_mode", "immunocompromise"] },
  ],
  output: {
    durationSlot: "duration",
    hpiOrder: ["onset", "duration", "site_started", "lesion_character", "itch", "onset_mode", "progression", "new_drugs", "prior_treatment", "prior_investigations"],
  },
};
