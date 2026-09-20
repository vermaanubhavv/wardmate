import type { HistoryTree } from "@/lib/history-check/types";
import { commonHpi, ebem, HUTCHISONS, IMMUNOCOMPROMISE, MACLEODS, val, yn } from "@/content/history-trees/_helpers";

/**
 * LEG ULCER / NON-HEALING WOUND — v1.0.0. CLINICAL CONTENT: PENDING CLINICIAN REVIEW.
 * Adult surgical ward, north India. Site, pain and the state of the circulation separate most of
 * this list: an ulcer above the medial malleolus in a heavy aching leg is venous, a painful
 * punched-out ulcer on the toes with rest pain is arterial, and a painless ulcer under the
 * metatarsal head in a diabetic is neuropathic. Differentials: venous ulcer, arterial ulcer,
 * diabetic neuropathic ulcer and diabetic foot infection, pressure ulcer, tuberculous ulcer,
 * malignant ulcer including change in a long-standing scar, vasculitic ulcer, traumatic ulcer.
 */
export const legUlcerV1: HistoryTree = {
  id: "leg_ulcer",
  version: "1.0.0",
  complaint: "Leg ulcer / non-healing wound",
  triggers: ["leg ulcer", "ulcer", "non healing wound", "wound not healing", "foot ulcer", "diabetic foot", "sore on leg", "wound on foot", "chronic ulcer", "ghaav", "gangrene", "blackening of toes"],
  setting: "Adult surgical ward, north India",
  reviewStatus: "pending_clinician_review",
  reviewedBy: null,
  references: [
    ebem("Does the clinical examination predict lower extremity peripheral arterial disease?", 2009, "19185391"),
    ebem("The evidence-based diagnosis of deep venous thrombosis", 2009, "19135283"),
    MACLEODS,
    HUTCHISONS,
  ],
  slots: [
    ...commonHpi("ulcer"),
    val("hpi", "site", "Site", "Where exactly is the ulcer — above the inner ankle, on the toes or heel, under the sole, or over a bony point?", ["inner ankle", "medial malleolus", "above the ankle", "toes", "heel", "sole", "under the foot", "metatarsal", "shin", "over the bone", "pressure point", "buttock", "sacrum"]),
    val("hpi", "how_it_started", "How it began", "Did it start after an injury, a blister, a boil, or did it appear on its own?", ["injury", "trauma", "blister", "boil", "thorn", "burn", "footwear", "on its own", "spontaneous", "insect bite", "scratched"]),
    val("hpi", "size_progression", "Size and whether it is growing", "How big is it, and is it getting bigger, staying the same, or slowly healing?", ["size", "getting bigger", "increasing", "same", "healing", "deeper", "spreading", "cm", "inch"], { numeric: true }),
    val("hpi", "pain_character", "Pain", "Is the ulcer painful, and is the pain worse on walking, on lying down, or on raising the leg?", ["painful", "painless", "no pain", "on walking", "on lying down", "at night", "on raising", "relieved by hanging", "severe", "burning"]),
    val("hpi", "discharge_smell", "Discharge and smell", "What comes out of it — clear fluid, pus, or blood, and is there a foul smell?", ["clear", "serous", "pus", "purulent", "blood", "foul", "smell", "offensive", "copious", "scanty", "soaking"]),
    val("hpi", "edge_floor", "Appearance of the ulcer", "What do the edges and the base look like — sloping, punched out, rolled or everted, and is bone or tendon visible?", ["sloping", "punched out", "rolled", "everted", "undermined", "base", "slough", "granulation", "black", "bone visible", "tendon"]),
    yn("associated", "claudication_rest_pain", "Calf pain on walking / pain at rest", "Any cramping pain in the calf after walking a set distance, or pain in the foot at rest, especially at night?", ["calf pain", "cramping", "after walking", "distance", "metres", "rest pain", "at night", "hangs the leg down", "stops to rest", "claudication"]),
    yn("associated", "leg_swelling_varicose", "Leg swelling / varicose veins / skin darkening", "Any swelling of the leg, prominent veins, itching, or darkening and thickening of the skin around the ankle?", ["swelling", "varicose veins", "prominent veins", "itching", "darkening", "pigmentation", "thickened", "eczema", "heaviness", "end of day"]),
    yn("associated", "numbness_burning", "Numbness or burning of the feet", "Any numbness, tingling, or burning of the feet, or loss of feeling so that injuries go unnoticed?", ["numbness", "tingling", "burning", "loss of sensation", "did not feel", "unnoticed", "neuropathy", "pins and needles"]),
    yn("associated", "fever_spreading", "Fever / spreading redness", "Any fever, or spreading redness and swelling around the ulcer?", ["fever", "spreading", "redness", "swelling", "warm", "cellulitis", "chills", "red streaks"]),
    yn("associated", "colour_change_toes", "Colour change or blackening of the toes", "Any blackening, blue discolouration, or coldness of the toes or foot?", ["blackening", "black", "blue", "discolouration", "cold", "gangrene", "dusky", "pale", "dry"]),
    yn("associated", "weight_loss_cough", "Weight loss / cough / night sweats", "Any weight loss, cough, or night sweats?", ["weight loss", "cough", "night sweats", "loss of appetite", "evening rise", "lost weight"], { tier: "detailed" }),
    yn("associated", "immobility", "Immobility / being bed-bound", "Is the patient bed-bound, wheelchair-bound, or unable to change position without help?", ["bed bound", "bedridden", "wheelchair", "immobile", "cannot turn", "paralysed", "needs help", "lying long"], { tier: "detailed" }),
    yn("associated", "joint_skin_disease", "Joint pain / rash / other ulcers", "Any joint pains, rash, mouth ulcers, or ulcers elsewhere on the body?", ["joint pain", "rash", "mouth ulcers", "other ulcers", "vasculitis", "arthritis", "photosensitivity"], { tier: "detailed" }),
    // Red flags
    yn("red_flag", "spreading_infection_sepsis", "Spreading redness with fever / crackling / foul discharge", "Any rapidly spreading redness, crackling under the skin, foul discharge, blackening, or severe illness with fever?", ["rapidly spreading", "crackling", "crepitus", "foul", "blackening", "severe illness", "toxic", "high fever", "necrosis", "gas"], { teach: "Rapid spread with crackling under the skin or foul discharge marks a deep infection destroying tissue, where the delay changes how much limb is lost." }),
    yn("red_flag", "critical_ischaemia", "Pain in the foot at rest, relieved by hanging the leg down", "Is there pain in the foot at rest, worse in bed at night and relieved by hanging the leg over the edge?", ["rest pain", "at night", "in bed", "hanging", "over the edge", "sits up", "relieved by dependency", "cannot sleep", "severe"], { teach: "Foot pain at rest that eases when the leg hangs down marks a circulation that can no longer supply the foot even at rest." }),
    yn("red_flag", "probing_to_bone", "Ulcer deep enough to see or feel bone", "Is the ulcer deep enough that bone or tendon can be seen or felt at its base?", ["bone visible", "bone", "tendon", "deep", "probe", "touches bone", "exposed", "cavity"], { teach: "An ulcer that reaches bone strongly suggests the bone itself is infected, which changes both the treatment duration and the surgery." }),
    yn("red_flag", "diabetes", "Diabetes", "Is the patient diabetic, for how many years, and how well controlled?", ["diabetes", "diabetic", "sugar", "years", "controlled", "uncontrolled", "insulin", "hba1c"], { teach: "In diabetes an ulcer can be painless, deep and infected while looking unremarkable, so the usual warning signs arrive late or not at all." }),
    yn("red_flag", "sudden_cold_painful_limb", "Suddenly cold, pale, painful limb", "Did the limb suddenly become cold, pale, numb and painful?", ["suddenly", "cold", "pale", "numb", "painful", "cannot move", "no pulse", "white", "acute"], { teach: "A suddenly cold pale painful limb marks an arterial blockage, where the tissue tolerates only a few hours." }),
    yn("red_flag", "chronic_ulcer_change", "Long-standing ulcer or scar that has changed", "Has an ulcer or scar present for years recently changed — growing, bleeding, or developing raised rolled edges?", ["years", "long standing", "scar", "changed", "growing", "bleeding", "rolled", "everted", "raised", "burn scar", "marjolin"], { teach: "A long-standing ulcer or burn scar that starts to grow or bleed raises a cancer arising within it, which the chronicity itself disguises." }),
    yn("red_flag", "painless_deep_ulcer", "Painless ulcer in a numb foot", "Is the ulcer painless, in a foot where sensation is reduced, and did the patient not notice the injury?", ["painless", "no pain", "numb", "did not notice", "reduced sensation", "found later", "walking on it"], { teach: "A painless ulcer in an insensate foot keeps being walked on, which is why it deepens rather than heals." }),
    IMMUNOCOMPROMISE,
    yn("exposure", "smoking", "Smoking", "Any smoking or tobacco use, and for how many years?", ["smoking", "smoker", "tobacco", "bidi", "cigarettes", "years", "packs", "chewing"]),
    yn("exposure", "vascular_risk", "Diabetes, hypertension, heart or kidney disease", "Any hypertension, heart disease, previous stroke, kidney disease, or high cholesterol?", ["hypertension", "heart disease", "stroke", "kidney disease", "cholesterol", "bypass", "angioplasty", "dialysis"]),
    yn("exposure", "dvt_history", "Previous clot in the leg / prolonged immobility", "Any previous clot in the leg, prolonged bed rest, long journey, or plaster cast?", ["dvt", "clot", "thrombosis", "bed rest", "long journey", "plaster", "immobilised", "swelling after"]),
    yn("exposure", "footwear_occupation", "Footwear and work", "What footwear is worn, and does the work involve walking barefoot, standing for long, or exposure to water?", ["footwear", "barefoot", "chappal", "slippers", "standing", "walking", "water", "field", "farmer", "ill fitting"]),
    yn("exposure", "tb_contact", "TB contact / past TB", "Any past tuberculosis or contact with tuberculosis?", ["tb", "tuberculosis", "koch", "att", "akt", "tb contact"], { tier: "detailed" }),
    yn("exposure", "leprosy_contact", "Loss of sensation elsewhere / patches on skin", "Any pale or numb patches on the skin, thickened nerves, or deformity of the hands?", ["pale patch", "numb patch", "hypopigmented", "thickened nerve", "claw hand", "leprosy", "deformity", "loss of sensation"], { tier: "detailed" }),
  ],
  differentials: [
    { id: "venous", name: "Venous ulcer", pointers: ["site", "leg_swelling_varicose", "pain_character", "dvt_history"], discriminators: ["site", "leg_swelling_varicose", "pain_character", "dvt_history", "edge_floor", "claudication_rest_pain", "discharge_smell"] },
    { id: "arterial", name: "Arterial ulcer", pointers: ["claudication_rest_pain", "critical_ischaemia", "colour_change_toes", "smoking"], discriminators: ["claudication_rest_pain", "critical_ischaemia", "colour_change_toes", "smoking", "site", "edge_floor", "pain_character", "vascular_risk"] },
    { id: "neuropathic", name: "Diabetic neuropathic ulcer", pointers: ["diabetes", "numbness_burning", "painless_deep_ulcer", "site"], discriminators: ["diabetes", "numbness_burning", "painless_deep_ulcer", "site", "footwear_occupation", "pain_character", "probing_to_bone"] },
    { id: "diabetic_foot_infection", name: "Diabetic foot infection / osteomyelitis", pointers: ["diabetes", "probing_to_bone", "spreading_infection_sepsis", "fever_spreading"], discriminators: ["diabetes", "probing_to_bone", "spreading_infection_sepsis", "fever_spreading", "discharge_smell", "colour_change_toes"] },
    { id: "pressure", name: "Pressure ulcer", pointers: ["immobility", "site"], discriminators: ["immobility", "site", "how_it_started", "edge_floor", "numbness_burning"] },
    { id: "tuberculous", name: "Tuberculous ulcer", pointers: ["tb_contact", "weight_loss_cough", "edge_floor"], discriminators: ["tb_contact", "weight_loss_cough", "edge_floor", "discharge_smell", "duration", "pain_character"] },
    { id: "malignant", name: "Malignant ulcer", pointers: ["chronic_ulcer_change", "edge_floor", "size_progression"], discriminators: ["chronic_ulcer_change", "edge_floor", "size_progression", "duration", "discharge_smell", "weight_loss_cough"] },
    { id: "vasculitic", name: "Vasculitic ulcer", pointers: ["joint_skin_disease", "pain_character"], discriminators: ["joint_skin_disease", "pain_character", "site", "edge_floor", "size_progression"] },
    { id: "acute_ischaemia", name: "Acute limb ischaemia", pointers: ["sudden_cold_painful_limb", "colour_change_toes"], discriminators: ["sudden_cold_painful_limb", "colour_change_toes", "onset_mode", "claudication_rest_pain", "vascular_risk"] },
    { id: "traumatic", name: "Traumatic ulcer", pointers: ["how_it_started", "footwear_occupation"], discriminators: ["how_it_started", "footwear_occupation", "size_progression", "numbness_burning", "diabetes"] },
  ],
  output: {
    durationSlot: "duration",
    hpiOrder: ["onset", "duration", "how_it_started", "site", "size_progression", "pain_character", "discharge_smell", "edge_floor", "progression", "prior_treatment", "prior_investigations"],
  },
};
