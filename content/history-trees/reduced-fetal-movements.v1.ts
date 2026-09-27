import type { HistoryTree } from "@/lib/history-check/types";
import { commonHpi, DUTTA_OBSTETRICS, HUTCHISONS, MACLEODS, val, yn } from "@/content/history-trees/_helpers";

/**
 * REDUCED FETAL MOVEMENTS — v1.0.0. CLINICAL CONTENT: REVIEWED (Dr Anubhav Verma).
 * Obstetrics and gynaecology ward, north India. The period of gestation and whether movements
 * have reduced or stopped altogether come first, then the ANC card and scan reports. Differentials:
 * fetal growth restriction or fetal compromise, intrauterine fetal death, abruption,
 * pre-eclampsia, oligohydramnios or leaking, cholestasis of pregnancy, poorly controlled
 * diabetes in pregnancy, maternal fever or infection, and a change in maternal perception
 * alone (anterior placenta, polyhydramnios, a busy day).
 */
export const reducedFetalMovementsV1: HistoryTree = {
  id: "reduced_fetal_movements",
  version: "1.0.0",
  complaint: "Reduced fetal movements",
  triggers: ["reduced fetal movements", "decreased fetal movements", "less fetal movements", "fetal movements not felt", "no fetal movements", "absent fetal movements", "reduced fm", "decreased fm", "baby not moving", "baby moving less", "bachcha nahi hil raha"],
  setting: "Obstetrics and gynaecology ward, north India",
  reviewStatus: "reviewed",
  reviewedBy: "Dr Anubhav Verma",
  references: [DUTTA_OBSTETRICS, MACLEODS, HUTCHISONS],
  slots: [
    ...commonHpi("reduced fetal movements"),
    val("hpi", "gestational_age", "Period of gestation", "How many weeks pregnant is she, by the last menstrual period and by the earliest scan?", ["weeks", "months", "pog", "lmp", "edd", "scan", "dating", "term", "preterm", "overdue"], { numeric: true }),
    val("hpi", "movement_change", "What has changed", "Have the movements become fewer, weaker, or stopped altogether, compared with her usual pattern?", ["fewer", "weaker", "stopped", "not felt", "usual pattern", "less than usual", "no movements", "slow", "changed"]),
    val("hpi", "last_felt", "Last felt", "When were the baby's movements last felt?", ["last felt", "since morning", "since yesterday", "since last night", "hours", "last moved"], { numeric: true }),
    val("hpi", "kick_count", "Kick count", "Has she counted the movements over a set time, and how many were felt?", ["kick count", "counted", "counts", "movements in", "times in", "daily fetal movement count", "dfmc"], { numeric: true }),
    yn("hpi", "previous_episodes_rfm", "Earlier episodes", "Have the movements reduced before in this pregnancy, and was anything found then?", ["before", "earlier", "previous episode", "again", "second time", "last week", "repeated"], { tier: "detailed" }),
    yn("associated", "abdominal_pain_rfm", "Abdominal pain or tightening", "Any abdominal pain, tightening pains, or a hard abdomen?", ["abdominal pain", "pain", "tightening", "contractions", "hard abdomen", "tense", "continuous pain"]),
    yn("associated", "leaking_rfm", "Leaking", "Any watery leaking per vaginum?", ["leaking", "watery", "water broke", "gush", "trickle", "wet"]),
    yn("associated", "abdomen_size_rfm", "Size of the abdomen", "Has the abdomen seemed smaller than expected, or grown unusually large and tight?", ["small for dates", "not growing", "smaller", "too big", "large", "tight", "growing fast", "twins"], { tier: "detailed" }),
    yn("associated", "itching_rfm", "Itching", "Any itching, especially of the palms and soles, without a rash?", ["itching", "palms", "soles", "itchy", "khujli", "no rash"], { tier: "detailed" }),
    yn("associated", "fever_rfm", "Fever or burning urine", "Any fever, chills, or burning while passing urine?", ["fever", "chills", "burning urine", "burning micturition", "rigors", "bukhar"]),
    // Red flags
    yn("red_flag", "no_movements", "No movements at all", "Have the movements stopped completely rather than just reduced?", ["no movements", "stopped completely", "not felt at all", "absent", "not moving at all", "since yesterday"], { teach: "Movements that have stopped altogether are assessed urgently, and the time since the last movement shapes how quickly." }),
    yn("red_flag", "bleeding_with_pain_rfm", "Bleeding with pain", "Is there any bleeding per vaginum, and is the abdomen tense or continuously painful?", ["bleeding", "blood", "tense", "hard abdomen", "continuous pain", "clots", "spotting"], { teach: "Bleeding with a tense painful abdomen and reduced movements raises abruption, where much of the blood loss can be concealed." }),
    yn("red_flag", "preeclampsia_rfm", "Headache, visual disturbance or upper abdominal pain", "Any headache, blurred vision, flashes of light, upper abdominal pain, or swelling of the face and hands?", ["headache", "blurred vision", "flashes", "epigastric", "upper abdominal pain", "swelling", "puffiness", "high bp"], { teach: "Pre-eclampsia affects the placenta as well as the mother, and a baby whose supply is failing may first show it as fewer movements." }),
    yn("red_flag", "previous_stillbirth", "Previous stillbirth or small baby", "Has she had a stillbirth, a baby that died soon after birth, or a very small baby before?", ["stillbirth", "still born", "died after birth", "neonatal death", "small baby", "low birth weight", "iugr", "iud"], { teach: "A previous stillbirth or growth-restricted baby raises the chance of the same problem, so reduced movements carry more weight." }),
    yn("red_flag", "trauma_fall_rfm", "Fall or blow to the abdomen", "Has there been a fall, a blow to the abdomen, or a road accident?", ["fall", "fell", "blow", "hit", "trauma", "accident", "injury", "assault"], { teach: "A blow to the abdomen can separate the placenta hours later, sometimes with little or no bleeding showing." }),
    yn("exposure", "anc_card", "ANC card and scans", "How many antenatal visits, is the ANC card available, and what did the scans show about growth, liquor and the placenta?", ["anc card", "antenatal", "visits", "booked", "unbooked", "usg", "scan", "growth scan", "liquor", "afi", "placenta", "anterior placenta", "doppler"]),
    yn("exposure", "obstetric_history_rfm", "Obstetric history", "What is the gravida and para, and how did each earlier pregnancy end?", ["gravida", "para", "g2p1", "deliveries", "caesarean", "lscs", "abortion", "living", "previous"]),
    yn("exposure", "medical_conditions_rfm", "Conditions in this pregnancy", "Any high blood pressure, diabetes, anaemia or thyroid problem in this pregnancy?", ["high bp", "pih", "hypertension", "gestational diabetes", "gdm", "sugar", "anaemia", "thyroid"]),
    yn("exposure", "ifa_tablets_rfm", "Iron and folic acid tablets", "Has she been taking the iron and folic acid tablets from the antenatal clinic?", ["iron", "folic acid", "ifa", "red tablets", "calcium", "taking tablets", "not taking"], { tier: "detailed" }),
    yn("exposure", "tobacco_rfm", "Tobacco", "Does she smoke or chew tobacco, or is there smoke from a chulha in the home?", ["smoke", "smoking", "tobacco", "gutka", "khaini", "bidi", "chulha", "wood fire"], { tier: "detailed" }),
  ],
  differentials: [
    { id: "fgr_compromise", name: "Fetal growth restriction or fetal compromise", pointers: ["movement_change", "abdomen_size_rfm", "previous_stillbirth"], discriminators: ["movement_change", "kick_count", "abdomen_size_rfm", "anc_card", "previous_stillbirth", "tobacco_rfm", "medical_conditions_rfm"] },
    { id: "iufd", name: "Intrauterine fetal death", pointers: ["no_movements", "last_felt"], discriminators: ["no_movements", "last_felt", "bleeding_with_pain_rfm", "previous_stillbirth", "medical_conditions_rfm"] },
    { id: "abruption_rfm", name: "Abruption", pointers: ["bleeding_with_pain_rfm", "abdominal_pain_rfm", "trauma_fall_rfm"], discriminators: ["bleeding_with_pain_rfm", "abdominal_pain_rfm", "trauma_fall_rfm", "preeclampsia_rfm"] },
    { id: "preeclampsia", name: "Pre-eclampsia", pointers: ["preeclampsia_rfm"], discriminators: ["preeclampsia_rfm", "medical_conditions_rfm", "abdomen_size_rfm", "anc_card"] },
    { id: "oligohydramnios", name: "Oligohydramnios or leaking membranes", pointers: ["leaking_rfm", "abdomen_size_rfm"], discriminators: ["leaking_rfm", "abdomen_size_rfm", "anc_card", "gestational_age"] },
    { id: "cholestasis", name: "Cholestasis of pregnancy", pointers: ["itching_rfm"], discriminators: ["itching_rfm", "gestational_age", "previous_stillbirth"] },
    { id: "diabetes_pregnancy", name: "Diabetes in pregnancy", pointers: ["medical_conditions_rfm", "abdomen_size_rfm"], discriminators: ["medical_conditions_rfm", "abdomen_size_rfm", "anc_card", "previous_stillbirth"] },
    { id: "maternal_infection", name: "Maternal fever or infection", pointers: ["fever_rfm"], discriminators: ["fever_rfm", "leaking_rfm", "abdominal_pain_rfm"] },
    { id: "perception_only", name: "Change in maternal perception alone", pointers: ["kick_count"], discriminators: ["kick_count", "movement_change", "anc_card", "previous_episodes_rfm", "gestational_age"] },
  ],
  output: {
    durationSlot: "duration",
    hpiOrder: ["onset", "duration", "gestational_age", "movement_change", "last_felt", "kick_count", "previous_episodes_rfm", "progression", "prior_treatment", "prior_investigations"],
  },
};
