import type { HistoryTree } from "@/lib/history-check/types";
import { commonHpi, DHINGRA, HUTCHISONS, MACLEODS, val, yn } from "@/content/history-trees/_helpers";

/**
 * BLEEDING FROM THE NOSE — v1.0.0. CLINICAL CONTENT: REVIEWED (Dr Anubhav Verma).
 * ENT ward, north India. Most nose bleeds are anterior and local; the history exists to find
 * the posterior bleed that fills the throat, the bleeding disorder or anticoagulant behind a
 * trivial-looking bleed, and the young man whose recurrent bleeds come from a nasal mass.
 * Differentials: local trauma or dry mucosa, hypertensive posterior bleed, nasal or sinus
 * infection, bleeding disorder or anticoagulation, dengue and other febrile thrombocytopenia,
 * juvenile nasopharyngeal angiofibroma, nasal or sinus malignancy, hereditary telangiectasia.
 */
export const epistaxisV1: HistoryTree = {
  id: "epistaxis",
  version: "1.0.0",
  complaint: "Bleeding from the nose",
  triggers: ["epistaxis", "nose bleed", "nosebleed", "bleeding from nose", "blood from nose", "nakseer", "nasal bleeding", "bleeding per nose"],
  setting: "ENT ward, north India",
  reviewStatus: "reviewed",
  reviewedBy: "Dr Anubhav Verma",
  references: [DHINGRA, MACLEODS, HUTCHISONS],
  slots: [
    ...commonHpi("nose bleed"),
    val("hpi", "side", "Which nostril", "Which nostril did the blood come from, or was it both?", ["right nostril", "left nostril", "both nostrils", "one side", "bilateral", "unilateral", "could not tell"]),
    val("hpi", "amount", "How much blood", "How much blood came, and how was it measured — drops, a cloth soaked, a vessel filled?", ["drops", "few drops", "soaked", "cloth", "handkerchief", "vessel", "cup", "clots", "gushing", "trickle"], { numeric: true }),
    yn("hpi", "blood_in_throat", "Blood going down the throat", "Did blood trickle down the back of the throat, or was any blood swallowed or spat out?", ["down the throat", "back of throat", "swallowed", "spat", "spitting blood", "coughed", "vomited blood", "only from nostril"], { teach: "Blood running down the throat rather than out of the nostril points to a bleeding point further back, where pressure on the nose does nothing." }),
    yn("hpi", "recurrence", "Previous episodes", "Has this happened before, how many times, and did it stop on its own?", ["previous", "recurrent", "repeated", "first time", "many times", "stopped on its own", "needed packing", "every few days"]),
    yn("associated", "nose_picking_trauma", "Nose picking / injury / dryness", "Any nose picking, injury to the face or nose, or dryness and crusting inside the nose?", ["nose picking", "picking", "injury", "trauma", "fall", "blow", "dry", "crusting", "hot weather", "rubbing"]),
    yn("associated", "nasal_obstruction", "Blocked nose / discharge / reduced smell", "Any blocked nose, nasal discharge, or reduced sense of smell on that side?", ["blocked nose", "nasal obstruction", "one sided block", "discharge", "smell", "anosmia", "stuffy", "sneezing"]),
    yn("associated", "fever_rash_bleeding", "Fever with bleeding elsewhere", "Any fever, rash, or bleeding from the gums, in the urine, or under the skin?", ["fever", "rash", "gum bleeding", "bleeding gums", "petechiae", "bruises", "blood in urine", "black stools", "dengue", "platelets"], { teach: "Nose bleeding with fever and bleeding at other sites asks about a falling platelet count rather than a local cause." }),
    yn("associated", "hypertension_history", "High blood pressure", "Any known high blood pressure, and are the tablets being taken regularly?", ["hypertension", "high blood pressure", "bp", "irregular", "stopped tablets", "not checked", "blood pressure high"]),
    yn("associated", "anticoagulant_history", "Blood thinning treatment / liver disease", "Is the patient on any blood thinning treatment, or known to have liver or kidney disease?", ["blood thinner", "anticoagulant", "warfarin", "aspirin", "clopidogrel", "acitrom", "heart valve", "liver disease", "kidney disease", "dialysis"]),
    yn("associated", "family_bleeding", "Family history of bleeding", "Any bleeding problem in the family, or prolonged bleeding after a tooth extraction or surgery?", ["family", "brother", "father", "bleeding disorder", "haemophilia", "prolonged bleeding", "tooth extraction", "after surgery", "transfusion"], { tier: "detailed" }),
    // Red flags
    yn("red_flag", "ongoing_heavy_bleed", "Still bleeding / faintness / rapid pulse", "Is the bleeding still going on, and has there been faintness, sweating, or a racing pulse?", ["still bleeding", "not stopped", "continuous", "faint", "giddy on standing", "sweating", "racing pulse", "collapsed", "pallor"], { teach: "Continued bleeding with faintness or a racing pulse marks blood loss that matters rather than a nuisance bleed." }),
    yn("red_flag", "airway_compromise", "Choking / difficulty breathing with the blood", "Any choking, coughing, or difficulty breathing because of the blood?", ["choking", "coughing", "difficulty breathing", "cannot breathe", "gasping", "aspirated", "breathless"], { teach: "Blood entering the airway from a posterior bleed threatens breathing before it threatens the circulation." }),
    yn("red_flag", "young_male_recurrent", "Young male with recurrent heavy bleeds and one sided block", "In a young male, are the bleeds repeated and heavy with a blocked nose on the same side?", ["young", "teenager", "adolescent", "repeated", "heavy", "profuse", "one sided block", "mass", "swelling in nose"], { teach: "Repeated heavy bleeds with one sided nasal blockage in an adolescent male raise a vascular growth in the nasopharynx, and examining it blindly can provoke severe bleeding." }),
    yn("red_flag", "mass_facial_symptoms", "Facial swelling / numbness / eye symptoms / neck lump", "Any swelling or numbness of the face, double vision, protrusion of the eye, or a lump in the neck?", ["facial swelling", "numbness", "cheek", "double vision", "eye protrusion", "proptosis", "neck lump", "loose teeth", "weight loss"], { teach: "Nose bleeding with facial numbness, eye symptoms or a neck lump asks about a growth in the nose or sinuses." }),
    yn("red_flag", "head_injury_csf", "Bleeding after a head injury / clear fluid from the nose", "Did the bleeding follow a head or face injury, and has any clear watery fluid dripped from the nose?", ["head injury", "road traffic", "fall", "face injury", "clear fluid", "watery discharge", "salty taste", "dripping", "unconscious"], { teach: "Clear fluid dripping with blood after a head injury raises a breach between the nose and the space around the brain." }),
  ],
  differentials: [
    { id: "local_anterior", name: "Local anterior bleed (trauma or dry mucosa)", pointers: ["nose_picking_trauma", "side", "amount"], discriminators: ["nose_picking_trauma", "blood_in_throat", "amount", "recurrence", "side"] },
    { id: "posterior_hypertensive", name: "Posterior bleed with hypertension", pointers: ["blood_in_throat", "hypertension_history", "ongoing_heavy_bleed"], discriminators: ["blood_in_throat", "hypertension_history", "ongoing_heavy_bleed", "amount", "side"] },
    { id: "infective", name: "Nasal or sinus infection", pointers: ["nasal_obstruction", "nose_picking_trauma"], discriminators: ["nasal_obstruction", "nose_picking_trauma", "fever_rash_bleeding", "duration", "recurrence"] },
    { id: "coagulopathy", name: "Bleeding disorder or anticoagulation", pointers: ["anticoagulant_history", "family_bleeding", "fever_rash_bleeding"], discriminators: ["anticoagulant_history", "family_bleeding", "fever_rash_bleeding", "recurrence", "amount"] },
    { id: "febrile_thrombocytopenia", name: "Dengue or other febrile thrombocytopenia", pointers: ["fever_rash_bleeding"], discriminators: ["fever_rash_bleeding", "duration", "anticoagulant_history", "amount", "prior_investigations"] },
    { id: "angiofibroma", name: "Juvenile nasopharyngeal angiofibroma", pointers: ["young_male_recurrent", "nasal_obstruction"], discriminators: ["young_male_recurrent", "nasal_obstruction", "amount", "recurrence", "mass_facial_symptoms"] },
    { id: "sinonasal_malignancy", name: "Nasal or sinus malignancy", pointers: ["mass_facial_symptoms", "nasal_obstruction"], discriminators: ["mass_facial_symptoms", "nasal_obstruction", "duration", "side", "recurrence"] },
    { id: "post_traumatic", name: "Post-traumatic bleed with skull base injury", pointers: ["head_injury_csf"], discriminators: ["head_injury_csf", "onset", "amount", "airway_compromise", "side"] },
  ],
  output: {
    durationSlot: "duration",
    hpiOrder: ["onset", "duration", "side", "amount", "blood_in_throat", "recurrence", "onset_mode", "progression", "prior_treatment", "prior_investigations"],
  },
};
