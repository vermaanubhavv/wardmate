import type { HistoryTree } from "@/lib/history-check/types";
import { commonHpi, DUTTA_OBSTETRICS, HUTCHISONS, MACLEODS, val, yn } from "@/content/history-trees/_helpers";

/**
 * VOMITING IN PREGNANCY — v1.0.0. CLINICAL CONTENT: PENDING CLINICIAN REVIEW.
 * Obstetrics and gynaecology ward, north India. When in the pregnancy the vomiting began is
 * the first split: vomiting that starts in the first trimester and settles by mid-pregnancy
 * fits hyperemesis, while vomiting that starts later, or comes with fever, jaundice or pain,
 * asks for another cause. Differentials: hyperemesis gravidarum, urinary tract infection or
 * pyelonephritis, viral hepatitis, molar pregnancy, multiple pregnancy, a surgical abdomen
 * (appendicitis, obstruction, torsion), gastroenteritis, thyrotoxicosis, and pre-eclampsia or
 * acute fatty liver in late pregnancy.
 */
export const vomitingInPregnancyV1: HistoryTree = {
  id: "vomiting_in_pregnancy",
  version: "1.0.0",
  complaint: "Vomiting in pregnancy",
  triggers: ["vomiting in pregnancy", "hyperemesis", "hyperemesis gravidarum", "morning sickness", "nausea in pregnancy", "excessive vomiting in pregnancy", "pregnancy vomiting", "emesis gravidarum", "vomiting with amenorrhoea"],
  setting: "Obstetrics and gynaecology ward, north India",
  reviewStatus: "pending_clinician_review",
  reviewedBy: null,
  references: [DUTTA_OBSTETRICS, MACLEODS, HUTCHISONS],
  slots: [
    ...commonHpi("vomiting in pregnancy"),
    val("hpi", "gestational_age", "Period of gestation", "How many weeks pregnant is she, by the last menstrual period and by any scan?", ["weeks", "months", "pog", "lmp", "edd", "scan", "first trimester", "second trimester", "third trimester"], { numeric: true }),
    val("hpi", "vomiting_start_in_pregnancy", "When in pregnancy it began", "Did the vomiting begin in the first three months, or only later in the pregnancy?", ["first three months", "first trimester", "early pregnancy", "after missed period", "later", "third trimester", "recently started", "new"]),
    val("hpi", "vomit_frequency", "How often", "How many times a day is she vomiting?", ["times a day", "times", "per day", "every hour", "after every meal", "frequent", "continuous"], { numeric: true }),
    val("hpi", "keeps_down", "Keeping food and fluid down", "Is she able to keep any food or fluids down?", ["keep down", "cannot keep", "not able to eat", "nothing stays", "sips", "fluids", "eating", "drinking"]),
    val("hpi", "vomit_content", "What is vomited", "What does the vomit contain — food, clear fluid, bile, or blood?", ["food", "clear", "watery", "bile", "yellow", "green", "blood", "coffee ground", "undigested"]),
    val("hpi", "weight_change_vip", "Weight change", "Has she lost weight since the pregnancy began, and by how much?", ["weight loss", "lost weight", "kg", "thin", "weight"], { numeric: true }),
    yn("associated", "urine_output_vip", "Urine output", "Is she passing less urine, or dark urine?", ["less urine", "dark urine", "reduced urine", "concentrated", "not passing urine", "thirst", "dry mouth"]),
    yn("associated", "urinary_symptoms_vip", "Urinary symptoms", "Any burning while passing urine, frequency, or pain in the flanks or back?", ["burning", "burning micturition", "frequency", "flank pain", "loin pain", "back pain", "dysuria"]),
    yn("associated", "fever_vip", "Fever", "Any fever or chills?", ["fever", "chills", "rigors", "bukhar"]),
    yn("associated", "diarrhoea_vip", "Loose stools", "Any loose stools, and has anyone else who ate the same food been unwell?", ["loose stools", "loose motions", "diarrhoea", "outside food", "others unwell", "family also"]),
    yn("associated", "thyroid_symptoms_vip", "Palpitations or tremor", "Any palpitations, tremor, heat intolerance, or a neck swelling?", ["palpitations", "tremor", "shaking", "heat intolerance", "sweating", "neck swelling", "goitre", "thyroid"], { tier: "detailed" }),
    yn("associated", "headache_heartburn_vip", "Heartburn or headache", "Any heartburn, acidity, or headache?", ["heartburn", "acidity", "burning chest", "headache", "reflux"], { tier: "detailed" }),
    // Red flags
    yn("red_flag", "dehydration_collapse_vip", "Unable to keep anything down with giddiness", "Is she unable to keep anything down, with giddiness on standing, fainting, or very little urine?", ["unable to keep anything", "giddiness", "fainting", "fainted", "very little urine", "no urine", "weak", "cannot stand"], { teach: "Vomiting that keeps nothing down leads to dehydration, ketosis and low potassium, and the urine output is the simplest bedside measure of how far." }),
    yn("red_flag", "jaundice_vip", "Yellow eyes or pale stools", "Any yellowness of the eyes or skin, or pale stools?", ["yellow eyes", "yellowness", "jaundice", "icterus", "pale stools", "high coloured urine", "peeli aankh"], { teach: "Jaundice with vomiting in pregnancy raises viral hepatitis, and in late pregnancy acute fatty liver, both of which can worsen quickly." }),
    yn("red_flag", "abdominal_pain_vip", "Severe or localised abdominal pain", "Is there severe abdominal pain, pain settling in one place, abdominal distension, or no passage of stool or flatus?", ["severe pain", "right side pain", "one side", "distension", "no stool", "no flatus", "constipation", "colicky", "pain abdomen"], { teach: "The enlarged uterus shifts and masks abdominal organs, so appendicitis, obstruction or ovarian torsion can present late and look mild." }),
    yn("red_flag", "bleeding_vesicles_vip", "Bleeding or grape-like tissue", "Any bleeding per vaginum, or passage of grape-like tissue?", ["bleeding", "spotting", "grape like", "vesicles", "tissue", "bleeding pv"], { teach: "Bleeding or grape-like vesicles with severe vomiting in early pregnancy raises a molar pregnancy, where the pregnancy hormone level runs very high." }),
    yn("red_flag", "haematemesis_vip", "Blood in the vomit", "Is there any blood or coffee-ground material in the vomit?", ["blood", "coffee ground", "blood in vomit", "streaks", "khoon"], { teach: "Repeated forceful vomiting can tear the lining at the lower end of the gullet, and blood in the vomit is asked about rather than assumed absent." }),
    yn("red_flag", "confusion_vision_vip", "Confusion, unsteadiness or double vision", "Any confusion, unsteady walking, or double vision?", ["confusion", "confused", "unsteady", "cannot walk straight", "double vision", "diplopia", "drowsy"], { teach: "Weeks of vomiting can deplete thiamine, and confusion, unsteadiness or double vision are the early signs of Wernicke encephalopathy." }),
    yn("red_flag", "late_pregnancy_vip", "New vomiting in late pregnancy with headache", "Has vomiting begun newly in the second half of pregnancy, with headache, upper abdominal pain, or swelling?", ["late pregnancy", "third trimester", "headache", "epigastric", "upper abdominal pain", "swelling", "high bp", "blurred vision"], { teach: "Vomiting that begins after mid-pregnancy is not expected from hyperemesis, and pre-eclampsia, HELLP and acute fatty liver are asked about." }),
    yn("exposure", "usg_report_vip", "Scan report", "Has a scan been done in this pregnancy, and did it show one baby or more, and a normal pregnancy in the uterus?", ["usg", "scan", "ultrasound", "twins", "two babies", "multiple", "single", "intrauterine", "molar", "snowstorm", "not done"]),
    yn("exposure", "obstetric_history_vip", "Obstetric history", "What is the gravida and para, and was there severe vomiting in an earlier pregnancy?", ["gravida", "para", "g2p1", "previous pregnancy", "same last time", "hyperemesis before", "abortion", "living"]),
    yn("exposure", "medical_conditions_vip", "Known conditions", "Any known thyroid disease, diabetes, liver disease, migraine or stomach ulcer?", ["thyroid", "diabetes", "sugar", "liver disease", "hepatitis", "migraine", "ulcer", "acidity"], { tier: "detailed" }),
    yn("exposure", "tablets_taken_vip", "Tablets being taken", "What tablets is she taking, including the iron and folic acid from the antenatal clinic, and does the vomiting follow them?", ["iron", "folic acid", "ifa", "tablets", "calcium", "after tablets", "not taking"], { tier: "detailed" }),
  ],
  differentials: [
    { id: "hyperemesis", name: "Hyperemesis gravidarum", pointers: ["vomiting_start_in_pregnancy", "vomit_frequency", "keeps_down", "weight_change_vip"], discriminators: ["vomiting_start_in_pregnancy", "gestational_age", "keeps_down", "weight_change_vip", "urine_output_vip", "obstetric_history_vip", "fever_vip"] },
    { id: "uti_pyelo", name: "Urinary tract infection or pyelonephritis", pointers: ["urinary_symptoms_vip", "fever_vip"], discriminators: ["urinary_symptoms_vip", "fever_vip", "vomiting_start_in_pregnancy"] },
    { id: "hepatitis", name: "Viral hepatitis", pointers: ["jaundice_vip", "fever_vip"], discriminators: ["jaundice_vip", "fever_vip", "medical_conditions_vip", "vomiting_start_in_pregnancy"] },
    { id: "molar", name: "Molar pregnancy", pointers: ["bleeding_vesicles_vip", "vomit_frequency"], discriminators: ["bleeding_vesicles_vip", "usg_report_vip", "gestational_age", "thyroid_symptoms_vip"] },
    { id: "multiple", name: "Multiple pregnancy", pointers: ["usg_report_vip", "vomit_frequency"], discriminators: ["usg_report_vip", "gestational_age", "obstetric_history_vip"] },
    { id: "surgical_abdomen", name: "Surgical abdomen (appendicitis, obstruction, torsion)", pointers: ["abdominal_pain_vip", "vomit_content"], discriminators: ["abdominal_pain_vip", "vomit_content", "fever_vip", "vomiting_start_in_pregnancy"] },
    { id: "gastroenteritis", name: "Gastroenteritis", pointers: ["diarrhoea_vip", "fever_vip"], discriminators: ["diarrhoea_vip", "fever_vip", "vomiting_start_in_pregnancy"] },
    { id: "thyrotoxicosis", name: "Thyrotoxicosis", pointers: ["thyroid_symptoms_vip", "weight_change_vip"], discriminators: ["thyroid_symptoms_vip", "medical_conditions_vip", "weight_change_vip"] },
    { id: "late_pregnancy_liver", name: "Pre-eclampsia, HELLP or acute fatty liver of pregnancy", pointers: ["late_pregnancy_vip", "jaundice_vip"], discriminators: ["late_pregnancy_vip", "jaundice_vip", "gestational_age", "confusion_vision_vip"] },
  ],
  output: {
    durationSlot: "duration",
    hpiOrder: ["onset", "duration", "gestational_age", "vomiting_start_in_pregnancy", "vomit_frequency", "keeps_down", "vomit_content", "weight_change_vip", "progression", "prior_treatment", "prior_investigations"],
  },
};
