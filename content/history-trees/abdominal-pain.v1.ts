import type { HistoryTree } from "@/lib/history-check/types";
import { commonHpi, IMMUNOCOMPROMISE, MACLEODS, PREGNANCY, rce, val, yn } from "@/content/history-trees/_helpers";

/**
 * ABDOMINAL PAIN — v1.0.0. CLINICAL CONTENT: PENDING CLINICIAN REVIEW.
 * Adult medicine / surgery ward, north India. Differentials: acute appendicitis, acute
 * cholecystitis / biliary colic, acute pancreatitis, peptic ulcer / perforation, intestinal
 * obstruction, renal colic / pyelonephritis, acute gastroenteritis, abdominal tuberculosis,
 * gynaecological (ectopic, torsion, PID), medical mimics (DKA, inferior MI, herpes zoster).
 */
export const abdominalPainV1: HistoryTree = {
  id: "abdominal_pain",
  version: "1.0.0",
  complaint: "Abdominal pain",
  triggers: ["abdominal pain", "pain abdomen", "pain in abdomen", "stomach pain", "pain in stomach", "epigastric pain", "acute abdomen", "abdomen pain"],
  setting: "Adult medicine / general surgery ward, north India",
  reviewStatus: "pending_clinician_review",
  reviewedBy: null,
  references: [
    rce("Does this patient have appendicitis?", 1996, "8918857"),
    rce("Does this patient have acute cholecystitis?", 2003, "12503981"),
    rce("Does this woman have an ectopic pregnancy? The Rational Clinical Examination systematic review", 2013, "23613077"),
    rce("Does this woman have an acute uncomplicated urinary tract infection?", 2002),
    { title: "Acute Pancreatitis", source: "StatPearls, NCBI Bookshelf", url: "https://www.ncbi.nlm.nih.gov/books/NBK482468/" },
    { title: "2017 IDSA Clinical Practice Guidelines for the Diagnosis and Management of Infectious Diarrhea", source: "Clinical Infectious Diseases", year: 2017, url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC5848254/" },
    MACLEODS,
  ],
  slots: [
    ...commonHpi("pain"),
    val("hpi", "site", "Site", "Where is the pain — which quadrant or region?", ["right iliac fossa", "rif", "right lower", "left lower", "epigastric", "epigastrium", "periumbilical", "umbilical", "right hypochondrium", "right upper", "left upper", "flank", "loin", "suprapubic", "lower abdomen", "upper abdomen", "generalised", "diffuse", "whole abdomen", "site"]),
    val("hpi", "migration", "Shift of pain", "Did the pain start somewhere else and shift (for example umbilicus to right iliac fossa)?", ["shifted", "shifting", "migrated", "migration", "started around the umbilicus", "moved to", "then localised", "localised to"]),
    val("hpi", "character", "Character", "Is the pain colicky (comes in waves), constant, burning, or dull?", ["colicky", "colic", "waves", "constant", "continuous", "burning", "dull", "aching", "sharp", "stabbing", "cramping", "gripping"]),
    val("hpi", "radiation", "Radiation", "Does the pain go to the back, shoulder, groin, or chest?", ["radiating", "radiates", "radiation", "to the back", "to back", "shoulder", "right shoulder", "scapula", "groin", "testis", "loin to groin", "chest", "band like"]),
    val("hpi", "severity", "Severity", "How severe is the pain?", ["severe", "mild", "moderate", "worst", "10/10", "out of 10", "severity", "excruciating", "unbearable"], { numeric: true }),
    val("hpi", "aggravating_relieving", "Aggravating / relieving factors", "What makes it worse or better — food, fasting, movement, lying still, passing stool or flatus, vomiting, antacids?", ["worse after food", "after food", "after meals", "on eating", "empty stomach", "fasting", "relieved by food", "movement", "lying still", "still", "passing stool", "passing flatus", "relieved by vomiting", "antacid", "relieved by", "aggravated by", "worse on", "better on"]),
    val("hpi", "relation_to_meals_bowel", "Relation to meals / bowel / urine", "Is the pain related to meals, to bowel movements, or to passing urine?", ["meals", "food", "fatty food", "oily food", "bowel", "defecation", "stool", "urination", "micturition", "passing urine"]),
    yn("associated", "nausea_vomiting", "Vomiting", "Any vomiting — and did it begin before or after the pain, and what did it contain (bilious, blood, faeculent)?", ["vomiting", "vomit", "vomited", "nausea", "bilious", "green", "blood in vomit", "faeculent", "feculent", "coffee ground", "vomitings"]),
    yn("associated", "bowel_change", "Bowel change", "Any diarrhoea, constipation, or complete inability to pass stool and flatus?", ["diarrhoea", "diarrhea", "loose stools", "loose motions", "constipation", "constipated", "not passing stool", "not passed stool", "not passing flatus", "obstipation", "absolute constipation", "bowels"]),
    yn("associated", "distension", "Abdominal distension", "Any abdominal distension?", ["distension", "distended", "bloating", "bloated", "abdominal distension", "swelling of abdomen", "fullness"]),
    yn("associated", "fever", "Fever", "Any fever, chills or rigors?", ["fever", "febrile", "temperature", "chills", "rigors"]),
    yn("associated", "jaundice", "Jaundice / dark urine / pale stools", "Any yellowing of the eyes, dark urine, or pale stools?", ["jaundice", "yellow", "yellowish", "icterus", "dark urine", "high coloured urine", "pale stools", "clay coloured"]),
    yn("associated", "urinary", "Urinary symptoms", "Any burning micturition, frequency, blood in urine, or loin pain?", ["burning micturition", "dysuria", "frequency", "urgency", "haematuria", "hematuria", "blood in urine", "loin pain", "flank pain", "burning urination"]),
    yn("associated", "appetite_weight", "Appetite / weight loss", "Any loss of appetite or weight loss?", ["loss of appetite", "appetite", "anorexia", "weight loss", "lost weight", "not eating"]),
    yn("associated", "gi_bleed", "Blood in vomit / black stools", "Any blood in vomit, or black tarry stools?", ["blood in vomit", "haematemesis", "hematemesis", "coffee ground", "black stools", "malena", "melena", "melaena", "tarry", "blood in stool"]),
    yn("associated", "menstrual", "Menstrual history", "When was the last menstrual period, and any missed period, bleeding per vaginum, or discharge?", ["lmp", "last menstrual period", "period", "periods", "missed period", "amenorrhoea", "amenorrhea", "bleeding per vaginum", "spotting", "vaginal discharge", "white discharge", "menstrual"]),
    yn("associated", "previous_episodes", "Previous similar episodes", "Any similar episodes before?", ["previous episode", "previous episodes", "similar episode", "similar episodes", "earlier", "before this", "first time", "first episode", "history of similar", "recurrent"]),
    yn("associated", "alcohol_gallstones", "Alcohol / known gallstones", "Any alcohol use or known gallstones (for pancreatitis or biliary disease)?", ["alcohol", "drinks", "drinker", "binge", "gallstones", "gall stones", "cholelithiasis", "stones in gallbladder"]),
    yn("associated", "nsaid_steroid", "NSAID / steroid / antiplatelet use", "Any painkiller, steroid or blood-thinner use?", ["nsaid", "painkiller", "painkillers", "diclofenac", "ibuprofen", "aspirin", "steroid", "steroids", "blood thinner", "anticoagulant", "clopidogrel"], { tier: "detailed" }),
    yn("associated", "previous_surgery", "Previous abdominal surgery", "Any previous abdominal surgery (adhesions) or known hernia?", ["previous surgery", "operated", "operation", "laparotomy", "scar", "hernia", "adhesions", "caesarean", "lscs"]),
    // Red flags
    yn("red_flag", "sudden_severe", "Sudden severe onset", "Did the pain begin suddenly and severely (as in perforation, rupture or ischaemia)?", ["sudden", "suddenly", "abrupt", "severe from the start", "thunderclap", "all of a sudden", "maximum at onset"], { teach: "Pain that reached its worst within minutes points to perforation, rupture, torsion or a vascular event, all of which are surgical or time-critical." }),
    yn("red_flag", "peritonism_symptoms", "Pain on movement / coughing", "Is the pain worse on movement, coughing, or bumps in the road (peritoneal irritation)?", ["worse on movement", "movement", "coughing", "jolt", "jerk", "bumps", "lying still", "cannot move", "guarding", "rigid"], { teach: "Pain worse with movement, coughing or the bed being jolted is what peritoneal irritation feels like; the abdomen may still be soft at the time of asking." }),
    yn("red_flag", "bilious_faeculent_vomiting", "Bilious / faeculent vomiting", "Is the vomiting green (bilious) or foul (faeculent)?", ["bilious", "green vomit", "green", "faeculent", "feculent", "foul smelling vomit"], { teach: "Green or foul vomiting points to intestinal obstruction, and its level, before the abdomen distends." }),
    yn("red_flag", "obstipation", "Absolute constipation", "Is the patient passing neither stool nor flatus?", ["not passing flatus", "not passed flatus", "no flatus", "obstipation", "absolute constipation", "not passing stool and flatus", "neither stool nor flatus"], { teach: "No stool and no flatus is the defining symptom of complete obstruction and is missed when only 'constipation' is asked." }),
    yn("red_flag", "syncope_giddiness", "Giddiness / fainting", "Any giddiness, fainting or cold sweats (bleeding or shock)?", ["giddiness", "giddy", "fainting", "fainted", "syncope", "collapse", "cold sweat", "sweating", "lightheaded"], { teach: "Fainting or giddiness with abdominal pain suggests internal bleeding: ruptured ectopic pregnancy, aneurysm, or a ruptured spleen." }),
    yn("red_flag", "cardiac_symptoms", "Chest symptoms with epigastric pain", "Any chest pain, breathlessness or sweating with the pain (inferior MI mimic)?", ["chest pain", "breathlessness", "breathless", "sweating", "palpitations", "exertion"], { teach: "Upper abdominal pain with sweating or breathlessness may be an inferior myocardial infarction; the ECG gets done only because the question was asked." }),
    yn("red_flag", "diabetic_symptoms", "Diabetes / polyuria / vomiting (DKA)", "Is the patient diabetic, with vomiting, thirst or excessive urination?", ["diabetic", "diabetes", "polyuria", "polydipsia", "thirst", "sugar", "insulin", "missed insulin"], { teach: "Abdominal pain with thirst, polyuria and vomiting in a diabetic may be ketoacidosis, which presents as an abdomen." }),
    yn("red_flag", "urine_output", "Reduced urine output", "Has the urine output reduced?", ["urine output", "decreased urine", "reduced urine", "less urine", "oliguria", "not passing urine"], { teach: "Reduced urine output points to dehydration, shock or obstruction of the urinary tract, each changing what happens next." }),
    PREGNANCY,
    IMMUNOCOMPROMISE,
    // Exposures
    yn("exposure", "water_food", "Outside food / unsafe water", "Any outside food, street food, or unsafe drinking water, or similar illness in contacts?", ["outside food", "street food", "unsafe water", "contaminated water", "hotel food", "similar complaints", "others at home", "food poisoning"]),
    yn("exposure", "tb_contact", "TB contact / past TB", "Any past tuberculosis or contact with a TB patient?", ["tb", "tuberculosis", "koch", "att", "akt", "dots", "tb contact", "past tb"], { tier: "detailed" }),
    yn("exposure", "rash", "Rash over the painful area", "Any vesicular rash in a band over the painful area?", ["rash", "vesicles", "blisters", "herpes", "zoster", "band"], { tier: "detailed" }),
  ],
  differentials: [
    { id: "appendicitis", name: "Acute appendicitis", pointers: ["migration", "site", "fever", "appetite_weight"], discriminators: ["migration", "site", "fever", "nausea_vomiting", "appetite_weight", "peritonism_symptoms", "menstrual"] },
    { id: "biliary", name: "Acute cholecystitis / biliary colic", pointers: ["site", "relation_to_meals_bowel", "alcohol_gallstones", "jaundice"], discriminators: ["site", "relation_to_meals_bowel", "radiation", "fever", "jaundice", "alcohol_gallstones", "previous_episodes"] },
    { id: "pancreatitis", name: "Acute pancreatitis", pointers: ["radiation", "alcohol_gallstones", "nausea_vomiting", "severity"], discriminators: ["radiation", "alcohol_gallstones", "nausea_vomiting", "aggravating_relieving", "severity", "distension", "urine_output"] },
    { id: "peptic", name: "Peptic ulcer / perforation", pointers: ["aggravating_relieving", "nsaid_steroid", "sudden_severe", "gi_bleed"], discriminators: ["aggravating_relieving", "nsaid_steroid", "sudden_severe", "peritonism_symptoms", "gi_bleed", "previous_episodes"] },
    { id: "obstruction", name: "Intestinal obstruction", pointers: ["bilious_faeculent_vomiting", "obstipation", "distension", "previous_surgery"], discriminators: ["character", "bilious_faeculent_vomiting", "obstipation", "distension", "previous_surgery", "bowel_change"] },
    { id: "renal", name: "Renal colic / pyelonephritis", pointers: ["urinary", "radiation", "character"], discriminators: ["urinary", "radiation", "character", "fever", "site"] },
    { id: "gastroenteritis", name: "Acute gastroenteritis", pointers: ["bowel_change", "water_food", "nausea_vomiting"], discriminators: ["bowel_change", "water_food", "nausea_vomiting", "fever", "urine_output"] },
    { id: "abdominal_tb", name: "Abdominal tuberculosis", pointers: ["tb_contact", "appetite_weight", "distension", "fever"], discriminators: ["tb_contact", "appetite_weight", "distension", "fever", "bowel_change", "duration"] },
    { id: "gynaecological", name: "Gynaecological (ectopic, torsion, PID)", pointers: ["menstrual", "pregnancy", "syncope_giddiness"], discriminators: ["menstrual", "pregnancy", "syncope_giddiness", "fever", "urinary"] },
    { id: "medical_mimic", name: "Medical mimic (DKA, inferior MI, zoster)", pointers: ["diabetic_symptoms", "cardiac_symptoms", "rash"], discriminators: ["diabetic_symptoms", "cardiac_symptoms", "rash", "site"] },
  ],
  output: {
    durationSlot: "duration",
    hpiOrder: ["onset", "duration", "onset_mode", "site", "migration", "character", "radiation", "severity", "aggravating_relieving", "relation_to_meals_bowel", "progression", "prior_treatment", "prior_investigations"],
  },
};
