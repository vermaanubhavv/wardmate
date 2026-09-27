import type { HistoryTree } from "@/lib/history-check/types";
import { commonHpi, HUTCHISONS, IADVL, IMMUNOCOMPROMISE, MACLEODS, val, yn } from "@/content/history-trees/_helpers";

/**
 * REDNESS AND SCALING OF THE WHOLE BODY — v1.0.0. CLINICAL CONTENT: PENDING CLINICIAN REVIEW.
 * Dermatology ward and OPD, north India. Once the whole skin is red the rash no longer shows its
 * cause, so the history carries the diagnosis: what skin disease was there before, what was
 * stopped (steroid tablets, injections or creams), what was started (a new medicine), and what
 * the patient was exposed to (parthenium weed in summer). The skin is also an organ that has
 * failed — heat, fluid and protein are being lost — and the red flags ask about that.
 * Differentials: psoriasis flare including after steroid withdrawal, eczema or atopic
 * dermatitis, airborne contact dermatitis (parthenium), drug-induced erythroderma or DRESS,
 * pityriasis rubra pilaris, cutaneous T-cell lymphoma / Sézary syndrome, crusted scabies,
 * idiopathic erythroderma.
 */
export const erythrodermaV1: HistoryTree = {
  id: "erythroderma",
  version: "1.0.0",
  complaint: "Redness and scaling of the whole body",
  triggers: ["erythroderma", "exfoliative dermatitis", "exfoliation", "red all over", "whole body red", "redness of whole body", "redness all over", "scaling all over", "skin shedding", "scales falling", "flakes falling", "poore sharir pe laali", "chamdi utar rahi"],
  setting: "Dermatology ward and OPD, north India",
  reviewStatus: "pending_clinician_review",
  reviewedBy: null,
  references: [IADVL, MACLEODS, HUTCHISONS],
  slots: [
    ...commonHpi("redness and scaling"),
    val("hpi", "preexisting_skin_disease", "Skin disease before the redness spread", "Was there any skin disease before the whole body turned red — scaly plaques, eczema, or a rash that was being treated?", ["psoriasis", "plaques", "scaly patches", "eczema", "dermatitis", "old rash", "known case", "since years", "chambal", "no previous skin disease"], { teach: "Most whole-body redness grows out of a skin disease that was there before, so the earlier disease is the most useful single fact the history gives." }),
    val("hpi", "evolution_pattern", "How the redness spread", "Did the redness grow out of existing patches that joined up, or appear over the whole body at once?", ["joined", "merged", "spread from patches", "whole body at once", "suddenly all over", "over days", "over weeks", "over months", "started on face", "started on legs"]),
    yn("hpi", "itch_severity", "Itch and how bad it is", "How itchy is the skin, and does the itch disturb sleep?", ["itching", "severe itch", "cannot sleep", "scratching", "night", "mild itch", "no itch", "burning"]),
    val("hpi", "scale_shedding", "Scale type and amount shed", "Are the scales fine and powdery or large flakes, and how much is shed on the bed each day?", ["fine scales", "powdery", "large flakes", "sheets", "bedsheet", "handful", "shedding", "scales everywhere", "dry"], { tier: "detailed" }),
    yn("hpi", "steroid_withdrawal", "Steroid tablets, injections or strong creams stopped", "Were steroid tablets, injections or strong creams being used and then stopped or run out shortly before the flare?", ["steroid", "steroids", "stopped", "ran out", "injection", "tablets stopped", "strong cream", "betnovate", "clobetasol", "quack", "flared after stopping"], { teach: "A flare weeks after steroid tablets, injections or strong creams are stopped is asked about because outside prescriptions are rarely volunteered and the timing is the clue." }),
    yn("hpi", "palms_soles_islands", "Thick orange palms and soles / islands of normal skin", "Are the palms and soles thick and orange-yellow, with small islands of normal skin left within the redness?", ["orange palms", "yellow palms", "thick palms", "thick soles", "islands", "normal skin patches", "spared areas", "follicular", "rough bumps"], { tier: "detailed" }),
    yn("hpi", "nail_joint", "Nail pitting / joint pain", "Are there pits or thickening in the nails, scaling of the scalp, or joint pains?", ["nails", "pitting", "thick nails", "nail changes", "scalp", "dandruff", "joint pain", "swollen joints", "back pain"]),
    yn("associated", "new_drug_8wk", "New medicine in the last eight weeks", "Was any new medicine started in the last eight weeks — for fits, gout, infection or pain, a sulfa drug, or an ayurvedic or homeopathic remedy?", ["new medicine", "new tablet", "fits medicine", "anticonvulsant", "phenytoin", "carbamazepine", "sulfa", "sulpha", "dapsone", "allopurinol", "painkiller", "nsaid", "antibiotic", "ayurvedic", "homeopathic", "desi dawa"], { teach: "Redness that spreads within weeks of a new medicine asks which medicine and when, since stopping the culprit depends on naming it." }),
    yn("associated", "facial_swelling_fever", "Facial swelling / fever / swollen glands", "Is there swelling of the face, fever, or swollen glands in the neck, armpits or groin since the redness began?", ["facial swelling", "puffy face", "swollen face", "fever", "glands", "lymph nodes", "neck swelling", "armpit", "groin"], { teach: "Facial swelling, fever and swollen glands with a spreading red rash raise a drug reaction that also involves internal organs." }),
    yn("associated", "nodes_weight_loss", "Long-standing lumps / weight loss / night sweats", "Has there been weight loss, night sweats, or lumps in the neck, armpit or groin for months, with itch that preceded the redness?", ["weight loss", "night sweats", "lumps", "glands", "months", "long standing", "itch for years", "thickened skin"], { tier: "detailed" }),
    yn("associated", "household_itch_crusts", "Family itch / thick crusts on hands", "Does anyone at home have itching, and are there thick crusts on the hands, feet or under the nails?", ["family", "household", "others itching", "crusts", "thick crusts", "hands", "under nails", "bedridden", "hostel", "old age home"], { teach: "Thick crusts with itch in the household are asked about because heavily infested skin spreads to carers and staff until the cause is recognised." }),
    yn("associated", "atopy_history", "Asthma / allergic rhinitis / childhood eczema", "Is there asthma, morning sneezing, or eczema since childhood, in the patient or the family?", ["asthma", "sneezing", "allergic rhinitis", "eczema", "childhood", "family", "atopy", "dust allergy"], { tier: "detailed" }),
    yn("exposure", "sun_plant_exposure", "Worse on exposed parts / weed exposure / summer", "Is the redness worse on the face, neck and forearms, worse in summer, or after working near congress grass or other weeds?", ["sun", "sun exposed", "face", "neck", "forearms", "summer", "congress grass", "gajar ghas", "parthenium", "weeds", "fields", "farming", "outdoor"], { teach: "Redness that began on exposed skin and worsens each summer asks about airborne plant contact, which carries on while the exposure continues." }),
    // Red flags
    yn("red_flag", "chills_temperature", "Feeling cold / shivering / high fever", "Is the patient feeling cold, shivering, or running a high fever?", ["feeling cold", "shivering", "chills", "cold", "blanket", "high fever", "rigors", "low temperature"], { teach: "Red skin loses heat continuously, so shivering or a high fever is asked about because temperature control may be failing." }),
    yn("red_flag", "leg_swelling_breathless", "Swelling of feet / breathlessness", "Is there swelling of the feet or face, breathlessness on lying flat, or palpitations?", ["swelling of feet", "pedal oedema", "puffy", "breathless", "breathlessness", "cannot lie flat", "palpitations", "heart racing"], { teach: "Widespread red skin draws blood to the surface and leaks protein, which can strain the heart and cause swelling." }),
    yn("red_flag", "fluid_loss", "Thirst / reduced urine / giddiness", "Is the patient very thirsty, passing less urine, or giddy on standing?", ["thirsty", "less urine", "reduced urine", "giddy", "dizziness", "dry mouth", "not drinking", "weak"], { teach: "Fluid lost through inflamed skin is invisible, so thirst, urine and giddiness are asked about early." }),
    yn("red_flag", "jaundice_organ", "Yellow eyes / dark urine / reduced urine", "Are the eyes yellow, the urine dark, or is there pain in the upper abdomen?", ["yellow eyes", "jaundice", "dark urine", "abdominal pain", "right side pain", "vomiting", "liver"], { tier: "detailed", teach: "Yellow eyes or dark urine with a drug-associated rash raise involvement of the liver, which changes how closely the patient is watched." }),
    yn("red_flag", "infection_sepsis", "Pus / foul smell / rigors", "Are there pus-filled areas, foul-smelling weeping skin, or fever with rigors?", ["pus", "pustules", "foul smell", "weeping", "oozing", "rigors", "boils", "infected"], { teach: "Weeping, broken skin over the whole body is an open door for infection, and rigors raise spread into the blood." }),
    IMMUNOCOMPROMISE,
  ],
  differentials: [
    { id: "psoriasis_flare", name: "Psoriasis flare, including after steroid withdrawal", pointers: ["preexisting_skin_disease", "steroid_withdrawal", "nail_joint"], discriminators: ["preexisting_skin_disease", "steroid_withdrawal", "nail_joint", "evolution_pattern", "scale_shedding"] },
    { id: "eczema_atopic", name: "Eczema or atopic dermatitis", pointers: ["atopy_history", "itch_severity", "preexisting_skin_disease"], discriminators: ["atopy_history", "itch_severity", "preexisting_skin_disease", "evolution_pattern", "sun_plant_exposure"] },
    { id: "airborne_contact_dermatitis", name: "Airborne contact dermatitis (parthenium)", pointers: ["sun_plant_exposure", "itch_severity"], discriminators: ["sun_plant_exposure", "evolution_pattern", "itch_severity", "preexisting_skin_disease", "duration"] },
    { id: "drug_erythroderma_dress", name: "Drug-induced erythroderma or DRESS", pointers: ["new_drug_8wk", "facial_swelling_fever", "jaundice_organ"], discriminators: ["new_drug_8wk", "facial_swelling_fever", "jaundice_organ", "evolution_pattern", "onset_mode"] },
    { id: "pityriasis_rubra_pilaris", name: "Pityriasis rubra pilaris", pointers: ["palms_soles_islands"], discriminators: ["palms_soles_islands", "evolution_pattern", "preexisting_skin_disease", "nail_joint"] },
    { id: "ctcl_sezary", name: "Cutaneous T-cell lymphoma / Sézary syndrome", pointers: ["nodes_weight_loss", "itch_severity"], discriminators: ["nodes_weight_loss", "itch_severity", "duration", "preexisting_skin_disease", "progression"] },
    { id: "crusted_scabies", name: "Crusted scabies", pointers: ["household_itch_crusts", "immunocompromise"], discriminators: ["household_itch_crusts", "immunocompromise", "itch_severity", "scale_shedding"] },
    { id: "idiopathic", name: "Idiopathic erythroderma", pointers: [], discriminators: ["preexisting_skin_disease", "new_drug_8wk", "nodes_weight_loss", "steroid_withdrawal", "duration"] },
  ],
  output: {
    durationSlot: "duration",
    hpiOrder: ["onset", "duration", "preexisting_skin_disease", "evolution_pattern", "onset_mode", "progression", "itch_severity", "steroid_withdrawal", "new_drug_8wk", "prior_treatment", "prior_investigations"],
  },
};
