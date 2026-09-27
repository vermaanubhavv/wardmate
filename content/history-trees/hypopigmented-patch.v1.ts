import type { HistoryTree } from "@/lib/history-check/types";
import { commonHpi, HUTCHISONS, IADVL, MACLEODS, NLEP, val, yn } from "@/content/history-trees/_helpers";

/**
 * LIGHT OR WHITE PATCH ON THE SKIN — v1.0.0. CLINICAL CONTENT: PENDING CLINICIAN REVIEW.
 * Dermatology ward and OPD, north India. Leprosy is still found here, and a light patch is how
 * it is found: every patch is asked about sensation, sweating and the nerves, whatever else it
 * looks like. The rest of the history separates the milky white patch that spreads (vitiligo)
 * from the fawn, scaly, summer patch (pityriasis versicolor), the dry patch on a child's cheek
 * (pityriasis alba), and the patch that followed a rash or was there from birth.
 * Differentials: leprosy including reactions and neuritis, vitiligo, pityriasis versicolor,
 * pityriasis alba, post-inflammatory hypopigmentation, nevus depigmentosus, idiopathic guttate
 * hypomelanosis, tinea (including steroid-modified).
 */
export const hypopigmentedPatchV1: HistoryTree = {
  id: "hypopigmented_patch",
  version: "1.0.0",
  complaint: "Light or white patch on the skin",
  triggers: ["hypopigmented patch", "hypopigmentation", "light patch", "light coloured patch", "depigmented patch", "depigmentation", "white spots", "safed daag", "safed dag", "leucoderma", "leukoderma", "vitiligo", "phulbehri", "leprosy", "kusht", "kushth rog", "numb patch", "loss of sensation over patch"],
  setting: "Dermatology ward and OPD, north India",
  reviewStatus: "pending_clinician_review",
  reviewedBy: null,
  references: [IADVL, NLEP, MACLEODS, HUTCHISONS],
  slots: [
    ...commonHpi("patch"),
    val("hpi", "patch_number_site", "Number and site of patches", "How many patches are there, and where — face, cheeks, trunk, around the mouth or fingertips, genitals, or shins and forearms?", ["single", "one patch", "few", "many", "multiple", "face", "cheeks", "trunk", "back", "chest", "around mouth", "fingertips", "lips", "genitals", "shins", "forearms", "hands", "feet"]),
    val("hpi", "patch_colour", "Colour of the patch and its hair", "Is the patch chalk or milk white, or only lighter than the surrounding skin, and are the hairs in it white?", ["milky white", "chalk white", "paper white", "lighter", "off white", "light brown", "fawn", "pink", "white hair", "grey hair", "hair normal"]),
    val("hpi", "patch_surface", "Surface of the patch", "Is the surface of the patch dry, finely scaly, rough, raised at the edge, or smooth like normal skin?", ["dry", "scaly", "fine scale", "powdery", "rough", "raised edge", "ring", "smooth", "shiny", "normal surface"]),
    yn("hpi", "patch_itch", "Itching over the patch", "Is the patch itchy, especially with sweating?", ["itching", "itchy", "sweating", "mild itch", "no itch", "not itchy"]),
    yn("hpi", "patch_since_birth", "Present since birth or early childhood", "Has the patch been there since birth or early childhood, keeping its shape and growing only with the child?", ["since birth", "birth mark", "since childhood", "always there", "same shape", "unchanged", "grew with the child"], { tier: "detailed" }),
    yn("hpi", "prior_inflammation", "Rash, injury or burn at the site before", "Was there a rash, eczema, blister, burn, injury or cream application at that site before the patch appeared?", ["rash before", "eczema", "blister", "burn", "injury", "wound", "scar", "after rash", "healed", "cream applied"]),
    yn("hpi", "seasonal_sweat", "Worse in summer / comes back every year", "Have the patches appeared or worsened in summer or with sweating, and come back every year?", ["summer", "sweating", "hot weather", "humid", "every year", "comes back", "recurs", "gym"]),
    yn("hpi", "small_drop_patches", "Small drop-like patches on shins and forearms", "Are there many small, sharply marked white spots on the shins or forearms that have slowly increased over years?", ["small spots", "drop like", "tiny white spots", "shins", "forearms", "over years", "sun exposed", "confetti"], { tier: "detailed" }),
    yn("hpi", "patch_spreading", "New patches / enlarging / after injury", "Are new patches appearing or old ones enlarging, and have patches come up at sites of cuts or friction?", ["new patches", "spreading", "enlarging", "increasing", "stable", "not changing", "at injury site", "cut", "friction", "koebner"]),
    yn("associated", "patch_sensation_loss", "Numbness over the patch", "Is there any numbness, loss of touch, or loss of feeling of heat or pain over the patch?", ["numbness", "numb", "no sensation", "loss of sensation", "cannot feel", "sunn", "heat not felt", "prick not felt", "sensation normal"], { teach: "Loss of feeling in a light patch is the single history finding that points toward leprosy, and that loss is found only if the question is put directly." }),
    yn("associated", "sweating_hair_loss", "Dry patch / no sweating / hair loss over patch", "Is the patch dry with no sweating, or has the hair over it thinned or fallen out?", ["no sweating", "dry patch", "reduced sweating", "hair loss", "no hair", "hairless", "thinned hair"], { tier: "detailed" }),
    yn("associated", "family_vitiligo_autoimmune", "Family white patches / thyroid / diabetes", "Does anyone in the family have white patches, or does the patient or family have thyroid disease, diabetes, or early greying of hair?", ["family", "mother", "father", "sibling", "white patches in family", "thyroid", "diabetes", "early greying", "grey hair", "alopecia"], { tier: "detailed" }),
    yn("associated", "atopy_dry_skin", "Dry skin / eczema / child's face", "Is the skin generally dry, is there eczema, asthma or sneezing, and are the patches on a child's face?", ["dry skin", "eczema", "asthma", "sneezing", "atopy", "child", "cheeks", "face", "soap", "winter"], { tier: "detailed" }),
    yn("associated", "cream_application", "Mixed creams / steroid creams / ringworm contacts", "Has any mixed or steroid cream been applied to the patch, and does anyone at home have itchy ring-shaped patches?", ["cream", "steroid cream", "mixed cream", "quadriderm", "panderm", "betnovate", "ring", "ringworm", "daad", "family itching", "keeps coming back"]),
    yn("exposure", "leprosy_contact", "Contact with leprosy", "Has anyone at home or among close contacts had leprosy, or been on long treatment for a skin or nerve disease?", ["leprosy", "kusht", "family member", "contact", "household", "neighbour", "mdt", "long treatment", "blister pack"], { teach: "Household contact with leprosy is asked about because the risk sits in the people who share the home, and contacts may need to be examined too." }),
    // Red flags
    yn("red_flag", "limb_numbness_weakness", "Numb hands or feet / weakness / slipping slippers", "Is there numbness or tingling in the hands or feet, weakness of grip, bending of fingers, or slippers slipping off the feet unnoticed?", ["numbness", "tingling", "hands", "feet", "weak grip", "cannot hold", "clawing", "bent fingers", "foot drop", "slippers slip", "chappal", "dragging foot"], { teach: "Numbness or weakness in the hands and feet with a patch raises nerve damage, which does not recover once established and so is asked about at the first visit." }),
    yn("red_flag", "painless_injury_ulcer", "Painless burns, cuts or ulcers", "Have there been burns, cuts or ulcers on the hands or feet that were not felt when they happened?", ["painless", "not felt", "burn", "cut", "ulcer", "sole ulcer", "wound", "blister on sole", "did not notice"], { teach: "Injuries that were not felt mean protective sensation is already lost, which changes how the hands and feet must be looked after." }),
    yn("red_flag", "nerve_pain", "Pain or tenderness along nerves", "Is there pain, tenderness or swelling along a nerve at the elbow, wrist, knee, ankle or side of the neck?", ["nerve pain", "elbow pain", "tender elbow", "knee", "ankle", "neck", "shooting pain", "tender nerve", "thick nerve", "swelling"], { teach: "A painful, tender nerve with a patch raises acute neuritis, where function can be lost within days." }),
    yn("red_flag", "lepra_reaction", "Patches turning red and swollen / new tender lumps with fever", "Have existing patches become red, swollen or painful, or have tender red lumps appeared with fever or joint pains?", ["red patches", "swollen patches", "painful patches", "tender lumps", "red lumps", "nodules", "fever", "joint pain", "reaction", "sudden change"], { teach: "Patches that suddenly redden or tender lumps with fever raise an immune reaction, which threatens the nerves and needs urgent assessment." }),
    yn("red_flag", "eye_closure", "Cannot close the eye / red eye", "Is there difficulty closing an eye fully, dryness, redness or pain in the eye?", ["cannot close eye", "eye not closing", "watering", "dry eye", "red eye", "eye pain", "blurred vision", "blink"], { tier: "detailed", teach: "An eye that will not close fully is exposed to injury, and weakness of eye closure can follow nerve involvement of the face." }),
  ],
  differentials: [
    { id: "leprosy", name: "Leprosy (including reactions and neuritis)", pointers: ["patch_sensation_loss", "sweating_hair_loss", "limb_numbness_weakness", "leprosy_contact"], discriminators: ["patch_sensation_loss", "sweating_hair_loss", "limb_numbness_weakness", "nerve_pain", "lepra_reaction", "leprosy_contact", "patch_colour"] },
    { id: "vitiligo", name: "Vitiligo", pointers: ["patch_colour", "patch_spreading", "family_vitiligo_autoimmune"], discriminators: ["patch_colour", "patch_spreading", "family_vitiligo_autoimmune", "patch_number_site", "patch_sensation_loss"] },
    { id: "pityriasis_versicolor", name: "Pityriasis versicolor", pointers: ["seasonal_sweat", "patch_surface"], discriminators: ["seasonal_sweat", "patch_surface", "patch_number_site", "patch_itch", "patch_colour"] },
    { id: "pityriasis_alba", name: "Pityriasis alba", pointers: ["atopy_dry_skin", "patch_surface"], discriminators: ["atopy_dry_skin", "patch_number_site", "patch_surface", "patch_colour", "seasonal_sweat"] },
    { id: "post_inflammatory", name: "Post-inflammatory hypopigmentation", pointers: ["prior_inflammation"], discriminators: ["prior_inflammation", "patch_number_site", "patch_sensation_loss", "progression"] },
    { id: "nevus_depigmentosus", name: "Nevus depigmentosus", pointers: ["patch_since_birth"], discriminators: ["patch_since_birth", "patch_spreading", "patch_colour", "patch_sensation_loss"] },
    { id: "idiopathic_guttate_hypomelanosis", name: "Idiopathic guttate hypomelanosis", pointers: ["small_drop_patches"], discriminators: ["small_drop_patches", "patch_number_site", "patch_colour", "duration"] },
    { id: "tinea", name: "Tinea, including steroid-modified", pointers: ["cream_application", "patch_itch"], discriminators: ["cream_application", "patch_itch", "patch_surface", "patch_number_site", "seasonal_sweat"] },
  ],
  output: {
    durationSlot: "duration",
    hpiOrder: ["onset", "duration", "patch_number_site", "patch_colour", "patch_surface", "patch_sensation_loss", "patch_itch", "onset_mode", "progression", "patch_spreading", "prior_treatment", "prior_investigations"],
  },
};
