import type { HistoryTree } from "@/lib/history-check/types";
import { commonHpi, GHAI_PAEDIATRICS, HUTCHISONS, IMNCI, MACLEODS, paedBackground, val, yn } from "@/content/history-trees/_helpers";

/**
 * ABDOMINAL PAIN IN A CHILD — v1.0.0. CLINICAL CONTENT: PENDING CLINICIAN REVIEW.
 * Paediatric ward, north India. Most abdominal pain in children is functional, constipation or
 * a passing infection; the history exists to find the few who need a surgeon or a drip today.
 * Where the pain started and where it is now, green vomiting, red-currant stool, a swollen
 * testis and deep breathing with thirst carry most of that. A younger child cannot point, so
 * the mother's account of crying, drawing up the legs and refusing to walk stands in for it.
 * Differentials: functional abdominal pain, constipation, gastroenteritis, worm infestation,
 * urinary tract infection, mesenteric adenitis, appendicitis, intussusception, lower-lobe
 * pneumonia, diabetic ketoacidosis, Henoch-Schönlein purpura, and testicular torsion.
 */
export const paediatricAbdominalPainV1: HistoryTree = {
  id: "paediatric_abdominal_pain",
  version: "1.0.0",
  complaint: "Abdominal pain in a child",
  triggers: ["abdominal pain in child", "child abdominal pain", "paediatric abdominal pain", "pain abdomen child", "child stomach pain", "tummy pain", "tummy ache", "pet dard", "pet me dard", "recurrent abdominal pain", "colic child"],
  setting: "Paediatric ward, north India",
  reviewStatus: "pending_clinician_review",
  reviewedBy: null,
  references: [GHAI_PAEDIATRICS, IMNCI, MACLEODS, HUTCHISONS],
  slots: [
    ...commonHpi("abdominal pain"),
    ...paedBackground(),
    val("hpi", "pain_site", "Where the pain is", "Where is the pain — around the navel, low on the right, upper abdomen, or all over — and has it moved since it began?", ["around the navel", "periumbilical", "right side", "lower right", "right iliac fossa", "upper abdomen", "all over", "moved", "shifted", "points to", "everywhere"]),
    val("hpi", "pain_character", "Character of the pain", "Does the pain come in bouts with pain-free gaps, or is it constant, and does the child cry, draw up the legs or lie still?", ["colicky", "comes and goes", "bouts", "episodes", "constant", "continuous", "crying", "drawing up legs", "lies still", "doubles up", "pain free between"]),
    val("hpi", "pain_pattern", "Pattern over time", "Is this a first episode, or have there been bouts over weeks or months, and are they linked to meals, school days or the toilet?", ["first time", "first episode", "recurrent", "on and off", "months", "before school", "school days", "after meals", "before passing stool", "weekends", "holidays"]),
    val("hpi", "bowel_habit", "Stools", "When did the child last pass stool, are the stools hard or painful to pass, and how often does the child go?", ["last passed stool", "hard stools", "pellets", "painful to pass", "straining", "once in", "days", "constipation", "soiling", "withholding"]),
    yn("associated", "vomiting", "Vomiting", "Is there vomiting, did it start before or after the pain, and what does it look like?", ["vomiting", "vomits", "before the pain", "after the pain", "food", "milky", "ulti"]),
    yn("associated", "fever", "Fever", "Any fever with the pain, and did it come before the pain or after?", ["fever", "temperature", "bukhar", "before the pain", "after the pain", "low grade", "high grade"]),
    yn("associated", "loose_stools", "Loose stools", "Any loose stools, how many, and is anyone else at home unwell with the same?", ["loose stools", "diarrhoea", "loose motions", "watery", "others at home", "family also"]),
    yn("associated", "urinary_symptoms", "Urinary symptoms", "Any burning or crying on passing urine, passing urine often, or new bed-wetting?", ["burning", "crying on passing urine", "frequency", "passing urine often", "bed wetting", "foul smelling urine", "red urine"]),
    yn("associated", "cough_breathing", "Cough or fast breathing", "Any cough, fast breathing, or pain that catches on breathing in?", ["cough", "fast breathing", "breathless", "catches on breathing", "chest pain", "grunting"]),
    yn("associated", "sore_throat_cold", "Recent sore throat or cold", "Has there been a sore throat, cold or viral illness in the days before the pain?", ["sore throat", "cold", "running nose", "viral", "throat infection", "tonsils", "last week"], { tier: "detailed" }),
    yn("associated", "worms_passed", "Worms", "Have worms been seen in the stool or vomit, or is there itching around the anus at night?", ["worms", "keede", "passed worm", "roundworm", "itching at anus", "night itching", "deworming"]),
    yn("associated", "rash_joints", "Rash or joint pain", "Is there a raised purple or red rash on the legs or buttocks, or swollen, painful ankles or knees?", ["rash", "purple spots", "red spots", "legs", "buttocks", "joint pain", "swollen ankles", "swollen knees", "purpura"]),
    // Red flags
    yn("red_flag", "bilious_vomiting", "Green vomiting", "Is the vomit green or yellow-green?", ["green vomit", "bilious", "yellow green vomit", "green", "bile"], { teach: "Green vomiting in a child raises bowel obstruction or twisting of the gut, and is treated as a surgical question until shown otherwise." }),
    yn("red_flag", "red_currant_stool", "Blood or jelly in the stool", "Has the child passed blood, or dark red jelly-like stool?", ["blood in stool", "jelly", "red currant", "red jelly", "blood and mucus", "bloody stool", "dark red"], { teach: "Bouts of screaming with pallor and a jelly-like bloody stool in an infant or toddler raise intussusception, where delay costs bowel." }),
    yn("red_flag", "constant_pain_movement", "Constant pain worse on moving or coughing", "Is the pain constant and made worse by moving, coughing, walking or going over bumps?", ["worse on moving", "worse on coughing", "cannot walk", "limping", "walks bent", "bumps", "lies still", "does not want to move", "jumping hurts"], { teach: "Pain worse on movement suggests the lining of the abdomen is inflamed, which raises appendicitis and peritonitis over the benign causes." }),
    yn("red_flag", "testicular_pain", "Pain or swelling in the testis", "In a boy, is there pain, swelling or redness of the testis or scrotum?", ["testis", "testicle", "scrotum", "scrotal pain", "swollen testis", "balls", "groin pain", "andkosh"], { teach: "Testicular torsion often presents as lower abdominal pain in a boy who is shy to mention the scrotum, and the testis has only hours." }),
    yn("red_flag", "thirst_deep_breathing", "Thirst, weight loss or deep breathing", "Has the child been very thirsty, passing a lot of urine, losing weight, or breathing deeply and fast?", ["very thirsty", "drinks a lot", "passing a lot of urine", "bed wetting", "weight loss", "deep breathing", "sighing breathing", "fruity smell", "sugar"], { teach: "Abdominal pain with vomiting, thirst and deep breathing is a common first presentation of diabetic ketoacidosis in a child." }),
    yn("red_flag", "distension_no_stool", "Swollen abdomen and no stool or wind", "Is the abdomen swollen or tight, with no stool or wind passed?", ["distended", "swollen abdomen", "tight abdomen", "not passing stool", "no wind", "no flatus", "pet phula"], { teach: "A distended abdomen with nothing passed raises obstruction, which is a surgical question rather than constipation." }),
    yn("red_flag", "drowsy_pale", "Drowsy, pale or floppy", "Is the child unusually drowsy, pale, floppy, or not responding normally?", ["drowsy", "lethargic", "pale", "floppy", "not responding", "limp", "sleepy between bouts"], { teach: "Drowsiness and pallor with abdominal pain are IMNCI danger signs and raise shock, intussusception and ketoacidosis." }),
    yn("red_flag", "organic_features", "Pain that wakes, or weight loss", "Does the pain wake the child from sleep, or is there weight loss, poor growth, or blood in the stool with recurrent pain?", ["wakes from sleep", "wakes at night", "weight loss", "poor growth", "not growing", "blood in stool"], { tier: "detailed", teach: "In recurrent pain, waking from sleep, weight loss or bleeding lowers the likelihood of a functional cause and widens the search." }),
    yn("red_flag", "abdominal_injury", "Injury to the abdomen", "Has there been a fall, a blow, or a bicycle handlebar injury to the abdomen?", ["fall", "injury", "blow", "hit", "handlebar", "cycle", "trauma", "chot"], { teach: "A handlebar or fall injury may be forgotten by the time the pain comes, and bleeding inside the abdomen can be slow to show." }),
    // Background and exposures
    yn("exposure", "previous_episodes_surgery", "Previous episodes or abdominal surgery", "Has the child had similar pain before that needed admission, or any operation on the abdomen?", ["previous episode", "admitted before", "operation", "surgery", "operated", "same pain before"], { tier: "detailed" }),
    yn("exposure", "school_stress", "School and home stress", "Is the child going to school regularly, and is there any worry at school or at home?", ["school", "missing school", "exams", "bullying", "teacher", "stress", "worry", "fights at home", "new sibling"], { tier: "detailed" }),
    yn("exposure", "family_history", "Family history", "Does anyone in the family have diabetes, migraine, or recurrent abdominal pain?", ["diabetes", "sugar", "migraine", "family history", "mother also", "father also", "runs in family"], { tier: "detailed" }),
  ],
  differentials: [
    { id: "functional", name: "Functional abdominal pain", pointers: ["pain_pattern", "school_stress"], discriminators: ["pain_pattern", "organic_features", "school_stress", "pain_site", "family_history"] },
    { id: "constipation", name: "Constipation", pointers: ["bowel_habit", "pain_pattern"], discriminators: ["bowel_habit", "pain_pattern", "feeding_nutrition", "distension_no_stool"] },
    { id: "gastroenteritis", name: "Gastroenteritis", pointers: ["loose_stools", "vomiting", "fever"], discriminators: ["loose_stools", "vomiting", "fever", "constant_pain_movement", "bilious_vomiting"] },
    { id: "worms", name: "Worm infestation", pointers: ["worms_passed"], discriminators: ["worms_passed", "pain_pattern", "growth", "distension_no_stool"] },
    { id: "uti", name: "Urinary tract infection", pointers: ["urinary_symptoms", "fever"], discriminators: ["urinary_symptoms", "fever", "pain_site", "vomiting"] },
    { id: "mesenteric_adenitis", name: "Mesenteric adenitis", pointers: ["sore_throat_cold", "fever"], discriminators: ["sore_throat_cold", "fever", "pain_site", "constant_pain_movement"] },
    { id: "appendicitis", name: "Appendicitis", pointers: ["pain_site", "constant_pain_movement", "vomiting"], discriminators: ["pain_site", "constant_pain_movement", "vomiting", "fever", "onset_mode"] },
    { id: "intussusception", name: "Intussusception", pointers: ["red_currant_stool", "pain_character", "drowsy_pale"], discriminators: ["pain_character", "red_currant_stool", "bilious_vomiting", "drowsy_pale", "distension_no_stool"] },
    { id: "pneumonia", name: "Lower-lobe pneumonia", pointers: ["cough_breathing", "fever"], discriminators: ["cough_breathing", "fever", "pain_site", "constant_pain_movement"] },
    { id: "dka", name: "Diabetic ketoacidosis", pointers: ["thirst_deep_breathing", "vomiting"], discriminators: ["thirst_deep_breathing", "family_history", "drowsy_pale", "vomiting"] },
    { id: "hsp", name: "Henoch-Schönlein purpura", pointers: ["rash_joints", "red_currant_stool"], discriminators: ["rash_joints", "pain_character", "red_currant_stool", "urinary_symptoms"] },
    { id: "torsion", name: "Testicular torsion", pointers: ["testicular_pain"], discriminators: ["testicular_pain", "onset_mode", "vomiting", "pain_site"] },
  ],
  output: {
    durationSlot: "duration",
    hpiOrder: ["onset", "duration", "onset_mode", "pain_site", "pain_character", "pain_pattern", "vomiting", "bowel_habit", "fever", "progression", "prior_treatment", "prior_investigations"],
  },
};
