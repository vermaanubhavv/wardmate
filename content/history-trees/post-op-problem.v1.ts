import type { HistoryTree } from "@/lib/history-check/types";
import { BAILEY_LOVE, commonHpi, IMMUNOCOMPROMISE, MACLEODS, SABISTON, SCHWARTZ, surgicalBackground, val, yn } from "@/content/history-trees/_helpers";

/**
 * PROBLEM AFTER AN OPERATION — v1.0.0. CLINICAL CONTENT: PENDING CLINICIAN REVIEW.
 * Adult surgical ward, north India. The one presentation where the post-operative day and the
 * operation itself are half the history: the same fever means different things on day two and
 * day seven. Differentials: surgical site infection, anastomotic leak, intra-abdominal
 * collection, ileus against mechanical obstruction, chest infection or collapse, urinary
 * infection, deep vein thrombosis or pulmonary embolism, post-operative bleeding, wound
 * dehiscence, and a reaction to a drug or to blood.
 *
 * `appliesWhen: "post_op"` is deliberately NOT set on any differential here: the whole tree is
 * already the post-operative context, and gating the list on a recorded surgery date would
 * empty it for a patient operated elsewhere.
 */
export const postOpProblemV1: HistoryTree = {
  id: "post_op_problem",
  version: "1.0.0",
  complaint: "Problem after an operation",
  triggers: ["post op", "post-op", "postoperative", "post operative", "after surgery", "after the operation", "after operation", "fever after surgery", "wound discharge", "wound gaping", "not passed flatus", "drain output", "operated on day"],
  setting: "Adult surgical ward, north India",
  reviewStatus: "pending_clinician_review",
  reviewedBy: null,
  references: [BAILEY_LOVE, SABISTON, SCHWARTZ, MACLEODS],
  slots: [
    ...commonHpi("problem"),
    val("hpi", "which_operation", "Which operation, and when", "What operation was done, on what date, and was it planned or an emergency?", ["operation", "operated on", "laparotomy", "laparoscopy", "appendicectomy", "hernia repair", "resection", "planned", "elective", "emergency", "post operative day", "pod"], { numeric: true }),
    val("hpi", "operative_course", "What happened during the operation", "What did the surgeon say about the operation — was anything unexpected found, and was there heavy blood loss or a difficult closure?", ["uneventful", "difficult", "adhesions", "blood loss", "transfused", "perforation found", "pus found", "resection done", "stoma made", "anastomosis", "spillage", "difficult closure"]),
    val("hpi", "day_of_onset", "Post-operative day the problem began", "On which day after the operation did this problem begin?", ["day one", "day two", "day three", "day four", "day five", "post operative day", "pod", "same evening", "next morning", "after discharge"], { numeric: true }),
    yn("hpi", "fever", "Fever", "Has there been fever, and does it come at a particular time of day or with chills?", ["fever", "temperature", "chills", "rigors", "spikes", "evening rise", "afebrile", "no fever"]),
    yn("hpi", "wound_problem", "The wound", "Is the wound painful, red, swollen, or discharging anything — and has the dressing needed changing more often?", ["wound", "stitch line", "red", "redness", "swollen", "discharge", "pus", "serous", "soaked", "dressing", "gaping", "stitches gave way", "wound clean"]),
    yn("hpi", "drain_change", "The drain", "Is there a drain, and has what comes out of it changed in amount, colour or smell?", ["drain", "drain output", "increased", "decreased", "bilious", "faeculent", "feculent", "blood", "turbid", "smell", "clear", "drain removed", "no drain"]),
    yn("hpi", "flatus_stool", "Flatus and stool", "Has the patient passed flatus and stool since the operation, and when was the last time?", ["passed flatus", "not passed flatus", "passed stool", "no motion", "gas passed", "bowels opened", "obstipation", "since the operation"]),
    yn("hpi", "oral_intake", "Tolerating food and fluid", "Is the patient keeping food and fluid down, and was oral intake stopped again after being started?", ["taking orally", "tolerating", "vomited after", "stopped orally", "nil orally", "ryles tube", "nasogastric", "not tolerating", "sips"]),
    yn("associated", "vomiting", "Vomiting", "Is there vomiting, and what does the vomit look like?", ["vomiting", "vomited", "bilious", "greenish", "faeculent", "feculent", "coffee ground", "large amount", "no vomiting"]),
    yn("associated", "abdominal_pain_distension", "Abdominal pain or distension", "Is the abdomen painful or distended, and is that different from the expected soreness of the wound?", ["abdominal pain", "distension", "distended", "tight", "bloated", "worse than before", "diffuse pain", "away from the wound", "soft abdomen"]),
    yn("associated", "breathing_cough", "Breathing and cough", "Any breathlessness, cough, or pain on taking a deep breath?", ["breathless", "breathlessness", "cough", "sputum", "pain on breathing", "chest pain", "unable to cough", "shallow breathing"]),
    yn("associated", "urine_catheter", "Urine and catheter", "Is the urine output adequate, is there burning or difficulty passing urine, and is a catheter in place?", ["urine output", "reduced urine", "burning", "difficulty passing urine", "retention", "catheter", "catheter removed", "cloudy urine", "passing well"]),
    yn("associated", "calf_leg", "Calf or leg symptoms", "Any pain, swelling or tenderness in the calf or leg?", ["calf pain", "leg swelling", "calf tenderness", "one leg", "swollen leg", "no leg symptoms"]),
    yn("associated", "mobilisation", "Getting out of bed", "Has the patient been getting out of bed and walking, and has that changed?", ["mobilised", "walking", "out of bed", "sitting up", "bed bound", "not moving", "stopped walking", "chest physiotherapy"], { tier: "detailed" }),
    yn("associated", "sugar_control", "Blood sugar since the operation", "For a patient with diabetes, have the sugars been running high or low since the operation?", ["sugars", "sugar high", "sugar low", "hyperglycaemia", "hypoglycaemia", "insulin", "readings", "uncontrolled", "controlled"], { tier: "detailed" }),
    // Red flags
    yn("red_flag", "wound_gaping_gush", "Wound gaping or a sudden gush from it", "Has the wound come apart, or was there a sudden gush of pink or watery fluid from it?", ["gaping", "burst", "came apart", "dehiscence", "gush", "sudden discharge", "pink fluid", "serosanguinous", "bowel visible", "stitches gave way"], { teach: "A sudden watery gush from a wound, or a wound that comes apart, is asked about because it changes what happens in the next hour rather than the next day." }),
    yn("red_flag", "bilious_faeculent_discharge", "Bowel content from the wound or drain", "Has anything looking like bile, bowel content or stool come out of the wound or the drain?", ["bilious", "bile", "faeculent", "feculent", "stool from the wound", "bowel content", "greenish from drain", "enteric content", "food particles"], { teach: "Bowel content appearing where it should not is the question that separates a slow recovery from a leak." }),
    yn("red_flag", "fever_with_rigors_late", "Fever with rigors after the third day", "Is there fever with shaking chills, especially after the third day?", ["rigors", "shaking chills", "high fever", "after third day", "day four", "day five", "spiking", "with chills"], { teach: "Fever appearing or worsening after the third day points the questions away from the chest and towards a collection or the wound." }),
    yn("red_flag", "sudden_breathlessness_chest_pain", "Sudden breathlessness or chest pain", "Did breathlessness or chest pain come on suddenly, and is the patient breathing faster than before?", ["sudden breathlessness", "sudden chest pain", "gasping", "breathing fast", "collapsed", "desaturation", "cannot complete a sentence"], { teach: "Breathlessness that arrives suddenly after an operation is asked first because it changes the order of everything else." }),
    yn("red_flag", "bleeding_soaked", "Bleeding or a soaked dressing", "Has the dressing soaked through with blood, or has blood come from the drain, the wound, or in the vomit or stool?", ["soaked", "blood in the drain", "bleeding", "fresh blood", "clots", "blood in vomit", "black stools", "dressing changed repeatedly"], { teach: "Ongoing blood loss after an operation is asked about early because the answer sets how urgently the patient is reassessed." }),
    yn("red_flag", "confusion_drowsiness", "Confusion or drowsiness", "Has the patient become confused, drowsy, or unusually restless?", ["confused", "confusion", "drowsy", "restless", "irrelevant talk", "not recognising", "disoriented", "sleepy", "alert"], { teach: "New confusion after an operation is asked about in its own right; in an older patient the family often notice it before anything else changes." }),
    yn("red_flag", "urine_output_fall", "Falling urine output", "Has the urine output dropped, or has the patient passed no urine for several hours?", ["reduced urine", "no urine", "oliguria", "catheter dry", "less than before", "not passed urine", "adequate urine"], { teach: "A falling urine output after an operation is worth asking about early, because the patient or the nurse has often noticed it before anyone looks for it." }),
    IMMUNOCOMPROMISE,
    // Background
    ...surgicalBackground({ acute: true }),
  ],
  differentials: [
    { id: "ssi", name: "Surgical site infection", pointers: ["wound_problem", "fever", "day_of_onset"], discriminators: ["wound_problem", "fever", "day_of_onset", "fever_with_rigors_late", "sugar_control", "wound_gaping_gush"] },
    { id: "anastomotic_leak", name: "Anastomotic leak", pointers: ["bilious_faeculent_discharge", "abdominal_pain_distension", "fever_with_rigors_late", "drain_change"], discriminators: ["bilious_faeculent_discharge", "abdominal_pain_distension", "drain_change", "day_of_onset", "operative_course", "oral_intake", "urine_output_fall"] },
    { id: "collection", name: "Intra-abdominal collection", pointers: ["fever_with_rigors_late", "abdominal_pain_distension", "operative_course"], discriminators: ["fever_with_rigors_late", "abdominal_pain_distension", "day_of_onset", "flatus_stool", "drain_change", "oral_intake"] },
    { id: "ileus_obstruction", name: "Ileus against mechanical obstruction", pointers: ["flatus_stool", "vomiting", "abdominal_pain_distension"], discriminators: ["flatus_stool", "vomiting", "abdominal_pain_distension", "day_of_onset", "oral_intake", "which_operation"] },
    { id: "chest", name: "Chest infection or collapse", pointers: ["breathing_cough", "fever", "mobilisation"], discriminators: ["breathing_cough", "fever", "mobilisation", "day_of_onset", "sudden_breathlessness_chest_pain"] },
    { id: "uti", name: "Urinary infection", pointers: ["urine_catheter", "fever"], discriminators: ["urine_catheter", "fever", "day_of_onset", "urine_output_fall"] },
    { id: "vte", name: "Deep vein thrombosis or pulmonary embolism", pointers: ["calf_leg", "sudden_breathlessness_chest_pain", "mobilisation"], discriminators: ["calf_leg", "sudden_breathlessness_chest_pain", "mobilisation", "day_of_onset", "breathing_cough"] },
    { id: "bleeding", name: "Post-operative bleeding", pointers: ["bleeding_soaked", "drain_change"], discriminators: ["bleeding_soaked", "drain_change", "day_of_onset", "operative_course", "surg_blood_thinners", "urine_output_fall"] },
    { id: "dehiscence", name: "Wound dehiscence", pointers: ["wound_gaping_gush", "wound_problem"], discriminators: ["wound_gaping_gush", "wound_problem", "day_of_onset", "sugar_control", "breathing_cough"] },
    { id: "drug_transfusion", name: "Reaction to a drug or to blood", pointers: ["fever", "surg_transfusion", "surg_allergy"], discriminators: ["fever", "surg_transfusion", "surg_allergy", "day_of_onset", "wound_problem"] },
  ],
  output: {
    durationSlot: "duration",
    hpiOrder: ["onset", "duration", "which_operation", "operative_course", "day_of_onset", "fever", "wound_problem", "drain_change", "flatus_stool", "oral_intake", "progression", "prior_treatment", "prior_investigations"],
  },
};
