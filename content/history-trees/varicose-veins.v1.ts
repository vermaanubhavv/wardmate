import type { HistoryTree } from "@/lib/history-check/types";
import { BAILEY_LOVE, BROWSE, commonHpi, DAS_CLINICAL_SURGERY, HAMILTON_BAILEY, SABISTON_VENOUS, surgicalBackground, val, yn } from "@/content/history-trees/_helpers";

/**
 * VARICOSE VEINS / PROMINENT LEG VEINS — v1.0.0. CLINICAL CONTENT: PENDING REVIEW.
 * Adult surgical ward and OPD, north India. Built from Sabiston (20th ed.) ch. 64 "Venous
 * Disease": the symptom pattern of venous pooling (dull ache and heaviness, absent on waking,
 * worse by evening and after standing, relieved by raising the leg), the risk factors it lists
 * (age, female sex, pregnancies, family history, injury to the limb, obesity), the split into
 * congenital, primary and secondary (post-thrombotic) disease, and the indications for
 * treatment it names — bleeding, recurrent thrombophlebitis, ulceration. docs/surgical-history.md §9.
 *
 * The ulcer itself belongs to `leg_ulcer`; this tree is the leg with veins and no ulcer yet,
 * and asks about an ulcer only as a red flag. Differentials: primary varicose veins,
 * post-thrombotic (secondary) venous disease, chronic venous insufficiency with skin change,
 * superficial thrombophlebitis, deep vein thrombosis, pelvic venous congestion, congenital
 * venous malformation, and arterial disease in the same leg.
 */
export const varicoseVeinsV1: HistoryTree = {
  id: "varicose_veins",
  version: "1.0.0",
  complaint: "Varicose veins / prominent leg veins",
  triggers: ["varicose veins", "varicose vein", "varicosity", "varicosities", "prominent veins", "dilated veins", "swollen veins", "veins on leg", "veins in leg", "tortuous veins", "spider veins", "heaviness of legs", "heaviness in legs"],
  setting: "Adult surgical ward and OPD, north India",
  reviewStatus: "pending_clinician_review",
  reviewedBy: null,
  references: [DAS_CLINICAL_SURGERY, HAMILTON_BAILEY, SABISTON_VENOUS, BROWSE, BAILEY_LOVE],
  slots: [
    ...commonHpi("prominent veins"),
    val("hpi", "side_extent", "Which leg, and where", "Which leg or legs, and where are the veins — inner thigh, calf, behind the knee, or around the ankle?", ["right leg", "left leg", "both legs", "bilateral", "thigh", "inner thigh", "calf", "behind the knee", "ankle", "whole leg"]),
    yn("hpi", "aching_heaviness", "Aching or heaviness", "Is there a dull ache, heaviness or tiredness in the leg?", ["aching", "ache", "heaviness", "heavy", "tired legs", "fatigue", "dull pain", "discomfort", "no pain", "painless"]),
    yn("hpi", "worse_standing_evening", "Worse by evening, better with the leg raised", "Is the discomfort absent on waking, worse by evening or after long standing, and better on lying down or raising the leg?", ["worse in the evening", "evening", "after standing", "long standing", "better on lying", "relieved by raising", "raising the leg", "elevation", "absent in the morning", "better in the morning"], { teach: "Sabiston describes this daily pattern as the signature of venous pooling; pain that does not follow it sends the questions elsewhere." }),
    yn("associated", "swelling_ankle", "Ankle swelling", "Does the ankle or lower leg swell, and does the swelling go down overnight?", ["swelling", "swollen ankle", "ankle swelling", "pedal oedema", "puffy", "goes down overnight", "persists", "no swelling"]),
    yn("associated", "skin_change", "Itching or skin change near the ankle", "Is there itching, darkening, thickening, or an eczema-like rash on the skin above the ankle?", ["itching", "itchy", "darkening", "pigmentation", "black skin", "thickened skin", "hard skin", "eczema", "rash", "no skin change"], { teach: "Skin change above the ankle marks venous disease that has gone on long enough to injure the skin, which Sabiston grades separately from veins alone." }),
    yn("associated", "burning", "Burning in the leg", "Is there a burning feeling in the skin of the leg?", ["burning", "burns", "tingling", "pins and needles"], { tier: "detailed" }),
    yn("associated", "venous_claudication", "Bursting pain on walking", "Does walking bring on a bursting or cramping pain in the leg that eases with rest and raising the leg?", ["bursting pain", "pain on walking", "cramping", "eases with rest", "relieved by raising", "tight on walking"], { teach: "Sabiston calls this venous claudication and ties it to obstruction from a past deep vein clot, and so asked apart from the ordinary ache." }),
    yn("associated", "arterial_symptoms", "Calf pain on walking relieved by standing still, or cold feet", "Is there cramping calf pain after walking a set distance that goes on standing still, or are the feet cold or numb?", ["calf pain on walking", "claudication", "stops walking", "relieved by standing", "cold feet", "cold foot", "numb foot", "pain at rest", "no claudication"], { teach: "Sabiston cautions that compression for veins can harm a leg whose arteries are also narrowed, so arterial symptoms are asked in every venous history." }),
    yn("associated", "pelvic_symptoms", "Pelvic dragging pain", "In a woman, is there dragging pelvic pain, pain during intercourse, or a feeling of bladder fullness on standing?", ["pelvic pain", "dragging pain", "lower abdominal pain", "pain during intercourse", "dyspareunia", "bladder fullness", "vulval veins", "no pelvic pain"], { tier: "detailed", teach: "Sabiston describes this cluster in women who have had several pregnancies; veins in the leg can be fed from the pelvis." }),
    yn("hpi", "since_childhood", "Present since childhood", "Have the veins been present since childhood, with a birthmark, or with one leg longer or bigger than the other?", ["since childhood", "since birth", "birthmark", "port wine", "longer leg", "bigger leg", "congenital"], { tier: "detailed" }),
    yn("hpi", "previous_vein_treatment", "Previous treatment for the veins", "Have the veins been operated on, injected, or treated with laser before, and did they come back?", ["operated", "stripping", "injection", "sclerotherapy", "laser", "evla", "rfa", "came back", "recurred", "stockings", "no previous treatment"]),

    // Red flags
    yn("red_flag", "variceal_bleed", "Bleeding from a vein", "Has a vein ever burst or bled, even after a small knock or scratch?", ["bled", "bleeding from vein", "vein burst", "burst", "blood spurted", "bleeding from leg", "no bleeding"], { teach: "A vein that has bled can bleed again, and heavily; Sabiston lists bleeding among the reasons to treat rather than observe." }),
    yn("red_flag", "venous_ulcer", "Ulcer or broken skin", "Is there, or has there ever been, an ulcer or a raw area of broken skin near the ankle?", ["ulcer", "wound", "raw area", "broken skin", "sore", "weeping", "healed ulcer", "no ulcer"], { teach: "An ulcer, open or healed, moves the history into the leg-ulcer questions and is one of Sabiston's indications for treatment." }),
    yn("red_flag", "tender_cord", "Painful hard red cord along a vein", "Has a vein become hard, red, hot and painful along its length?", ["hard vein", "red vein", "painful vein", "tender cord", "thrombophlebitis", "phlebitis", "lump along the vein", "hot vein"], { teach: "A hot, hard, tender vein is asked about early because inflammation in a surface vein can sit close to the deep veins, and repeated episodes are an indication for treatment." }),
    yn("red_flag", "sudden_leg_swelling", "Sudden painful swelling of the whole leg", "Has the whole leg or calf become swollen and painful over a day or two?", ["sudden swelling", "whole leg swollen", "calf swollen", "painful swelling", "tight calf", "leg became swollen", "one leg swollen"], { teach: "New swelling of the whole leg over hours to days is a different question from slow ankle swelling, and is asked apart from it for that reason." }),

    // Background that causes or worsens it (Sabiston's risk factors)
    val("exposure", "occupation_standing", "Standing at work", "What work does the patient do, and how many hours a day are spent standing?", ["standing", "stands all day", "shopkeeper", "teacher", "traffic police", "security guard", "cook", "labourer", "sits", "hours"], { numeric: true }),
    val("exposure", "pregnancies", "Pregnancies", "In a woman, how many pregnancies, and did the veins appear or worsen during one?", ["pregnancy", "pregnancies", "deliveries", "children", "gravida", "para", "appeared in pregnancy", "worse in pregnancy"]),
    yn("exposure", "family_history", "Varicose veins in the family", "Does anyone in the family have varicose veins?", ["mother", "father", "family history", "family", "runs in the family", "sibling", "no family history"]),
    yn("exposure", "previous_dvt_injury", "Previous clot, fracture or long spell in bed", "Has the patient ever had a clot in this leg, a fracture or major injury of it, or a long spell in bed or in plaster?", ["dvt", "clot in leg", "fracture", "plaster", "injury to leg", "bedridden", "immobilised", "after delivery", "after surgery", "no clot"], { teach: "A past deep clot or injury to the limb is what separates secondary from primary venous disease in Sabiston's classification, and it changes what treatment is safe." }),

    // S. Das, A Manual on Clinical Surgery, 13th ed. (docs/surgical-history.md §10)
    yn("red_flag", "breathless_chest_pain", "Sudden breathlessness, chest pain or blood in the sputum", "Has there been sudden breathlessness, chest pain on breathing, or blood in the sputum?", ["sudden breathlessness", "breathless", "chest pain", "pain on breathing", "coughing blood", "blood in sputum", "haemoptysis", "no breathlessness"], { teach: "Das asks this in any leg with a suspected deep clot, because a piece travelling to the lungs is what makes the swollen leg urgent." }),
    yn("associated", "night_cramps", "Cramps at night", "Does the patient get cramps in the leg at night?", ["night cramps", "cramps at night", "cramp in calf", "wakes with cramp", "muscle cramps", "no cramps"], { tier: "detailed", teach: "Das lists night cramps among the usual complaints of varicose veins, separate from the evening ache." }),
    yn("associated", "abdominal_swelling", "Swelling or lump in the abdomen", "Is there any swelling or lump in the abdomen?", ["abdominal swelling", "lump in abdomen", "distension", "fibroid", "ovarian cyst", "fluid in abdomen", "no abdominal swelling"], { teach: "Das asks this because anything in the abdomen that blocks the return of blood can make the leg veins swell, and the patient may not think to mention it." }),
    yn("associated", "constipation", "Constipation", "Is the patient constipated, straining at stool?", ["constipation", "constipated", "hard stools", "straining", "no constipation", "bowels regular"], { tier: "detailed", teach: "Das lists a loaded bowel and straining among the things that raise pressure in the leg veins, so the bowel habit is asked in the varicose history." }),
    yn("exposure", "white_leg_pregnancy", "Swollen white leg in a past pregnancy", "In a woman, did a leg become swollen, pale and painful during or after a previous pregnancy?", ["white leg", "leg swollen after delivery", "swollen leg in pregnancy", "pale swollen leg", "leg swelling after childbirth", "no leg swelling in pregnancy"], { tier: "detailed", teach: "Das asks this because a swollen white leg around childbirth often marks an unrecognised deep clot, which turns later varicose veins into the secondary kind." }),
    // Hamilton Bailey's Demonstrations of Physical Signs, 19th ed. (docs/surgical-history.md §11)
    val("exposure", "smoking", "Smoking", "Does the patient smoke or use tobacco, how much, and for how long?", ["smoker", "smokes", "bidi", "tobacco", "cigarettes", "non smoker", "never smoked"], { teach: "Hamilton Bailey lists smoking among the risk factors for chronic venous disease, and it also bears on arterial disease in the same leg." }),
    yn("exposure", "family_clot_young", "Clots in young relatives", "Has any blood relative had a clot in a leg vein or in the lungs, especially before the age of fifty?", ["family clot", "relative had dvt", "clot in lungs in family", "young relative", "no family clot"], { tier: "detailed", teach: "Hamilton Bailey advises asking for a family history of deep vein thrombosis, particularly in relatives under fifty, as a pointer to an inherited clotting tendency." }),
    yn("exposure", "cancer_history", "Cancer or cancer treatment", "Has the patient ever been diagnosed with or treated for a cancer?", ["cancer", "malignancy", "tumour", "chemotherapy", "radiotherapy", "no cancer"], { teach: "Hamilton Bailey lists malignancy with older age, previous clot, immobility and hormones as major risk factors for clot in the veins." }),
    ...surgicalBackground({ omit: ["surg_family_illness", "surg_menstrual_obstetric", "surg_occupation_residence"] }),
  ],
  differentials: [
    { id: "primary", name: "Primary varicose veins", pointers: ["aching_heaviness", "worse_standing_evening", "family_history"], discriminators: ["worse_standing_evening", "side_extent", "occupation_standing", "pregnancies", "family_history", "previous_dvt_injury", "since_childhood", "night_cramps", "constipation", "smoking"] },
    { id: "post_thrombotic", name: "Post-thrombotic (secondary) venous disease", pointers: ["previous_dvt_injury", "venous_claudication"], discriminators: ["previous_dvt_injury", "venous_claudication", "swelling_ankle", "skin_change", "side_extent", "abdominal_swelling", "white_leg_pregnancy", "family_clot_young"] },
    { id: "cvi_skin", name: "Chronic venous insufficiency with skin change", pointers: ["skin_change", "venous_ulcer"], discriminators: ["skin_change", "venous_ulcer", "swelling_ankle", "duration", "burning"] },
    { id: "thrombophlebitis", name: "Superficial thrombophlebitis", pointers: ["tender_cord"], discriminators: ["tender_cord", "sudden_leg_swelling", "previous_dvt_injury", "side_extent"] },
    { id: "dvt", name: "Deep vein thrombosis", pointers: ["sudden_leg_swelling"], discriminators: ["sudden_leg_swelling", "onset_mode", "tender_cord", "previous_dvt_injury", "surg_regular_drugs", "pregnancies", "breathless_chest_pain", "white_leg_pregnancy", "family_clot_young", "cancer_history"] },
    { id: "pelvic", name: "Pelvic venous congestion", pointers: ["pelvic_symptoms"], discriminators: ["pelvic_symptoms", "pregnancies", "side_extent"] },
    { id: "congenital", name: "Congenital venous malformation", pointers: ["since_childhood"], discriminators: ["since_childhood", "side_extent", "onset"] },
    { id: "arterial", name: "Arterial disease in the same leg", pointers: ["arterial_symptoms"], discriminators: ["arterial_symptoms", "venous_ulcer", "venous_claudication", "skin_change", "smoking"] },
  ],
  output: {
    durationSlot: "duration",
    hpiOrder: ["onset", "duration", "side_extent", "aching_heaviness", "worse_standing_evening", "progression", "since_childhood", "previous_vein_treatment", "prior_treatment", "prior_investigations"],
  },
};
