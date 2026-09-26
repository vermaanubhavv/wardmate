import type { HistoryTree } from "@/lib/history-check/types";
import { commonHpi, HUTCHISONS, MACLEODS, val, yn } from "@/content/history-trees/_helpers";

/**
 * LABOUR PAINS AND LEAKING PER VAGINUM — v1.0.0. CLINICAL CONTENT: REVIEWED (Dr Anubhav Verma).
 * Obstetrics ward, north India. One admission history covering the woman who arrives in
 * labour or with leaking, because the two arrive together and are assessed together. The
 * gestational age decides almost everything that follows. Differentials: term labour, preterm
 * labour, prelabour rupture of membranes, false labour, abruption, chorioamnionitis,
 * pre-eclampsia complicating labour, obstructed labour, and a non-obstetric cause of the pain.
 */
export const labourPainsV1: HistoryTree = {
  id: "labour_pains",
  version: "1.0.0",
  complaint: "Labour pains / leaking per vaginum",
  triggers: ["labour pains", "labor pains", "in labour", "leaking per vaginum", "leaking pv", "water broke", "membranes ruptured", "prom", "pains since", "dard", "full term pains", "contractions"],
  setting: "Obstetrics ward, north India",
  reviewStatus: "reviewed",
  reviewedBy: "Dr Anubhav Verma",
  references: [MACLEODS, HUTCHISONS],
  slots: [
    ...commonHpi("labour pains"),
    val("hpi", "gestational_age", "Period of gestation", "How many weeks pregnant is she, by the last menstrual period and by the earliest scan?", ["weeks", "months", "pog", "lmp", "edd", "scan", "dating", "term", "preterm", "full term", "overdue"], { numeric: true }),
    val("hpi", "contractions", "The pains", "When did the pains start, how often do they come, how long does each last, and are they getting stronger?", ["started", "how often", "minutes apart", "lasting", "seconds", "getting stronger", "regular", "irregular", "intervals", "back to front"]),
    val("hpi", "leaking", "Leaking", "Was there a gush or a trickle of fluid, when did it start, what colour was it, and is it continuing?", ["gush", "trickle", "fluid", "colour", "clear", "greenish", "meconium", "blood stained", "continuing", "soaked", "time"]),
    yn("hpi", "show", "Show", "Has there been a blood-stained mucus discharge?", ["show", "blood stained", "mucus", "plug", "slight bleeding", "streak"]),
    yn("hpi", "bearing_down", "Urge to bear down", "Is there an urge to push or bear down, or pressure in the back passage?", ["urge to push", "bearing down", "pressure", "back passage", "wants to push", "involuntary"]),
    yn("associated", "fetal_movements_labour", "Fetal movements", "Are the baby's movements felt as usual, and when were they last felt?", ["fetal movements", "moving", "reduced", "not felt", "last felt", "same as before", "less than usual"]),
    yn("associated", "bleeding_labour", "Bleeding", "Any bleeding, and how much?", ["bleeding", "heavy", "clots", "spotting", "fresh", "amount", "pads"]),
    yn("associated", "fever_labour", "Fever or foul discharge", "Any fever, chills, or foul-smelling discharge?", ["fever", "chills", "foul", "offensive", "smelly", "discharge"]),
    yn("associated", "headache_vision_swelling", "Headache, visual disturbance or swelling", "Any headache, blurring of vision, flashes, pain in the upper abdomen, or swelling of the face and hands?", ["headache", "blurring", "flashes", "spots", "upper abdominal pain", "epigastric", "swelling", "puffiness", "face", "hands"]),
    yn("associated", "reduced_urine_labour", "Urine output", "How much urine has been passed, and when last?", ["urine", "passed", "reduced", "less", "last passed", "hours"], { tier: "detailed" }),
    yn("associated", "vomiting_labour", "Vomiting", "Any vomiting or inability to keep fluids down?", ["vomiting", "cannot keep", "nausea", "repeated"], { tier: "detailed" }),
    // Red flags
    yn("red_flag", "preterm", "Pains before thirty-seven weeks", "Is she less than thirty-seven weeks pregnant with regular pains or leaking?", ["preterm", "before thirty seven", "thirty four", "early", "weeks", "not full term", "seven months", "eight months"], { teach: "Before thirty-seven weeks the whole plan changes, and the interval available to give the baby's lungs a chance is short." }),
    yn("red_flag", "meconium_stained", "Greenish fluid", "Is the leaking fluid green, brown, or thickly stained?", ["green", "greenish", "brown", "meconium", "thick", "stained", "dirty"], { teach: "Green or thickly stained liquor suggests the baby has passed meconium, which raises concern about how the baby is coping." }),
    yn("red_flag", "reduced_fetal_movements", "Reduced or absent fetal movements", "Have the baby's movements reduced or stopped, and for how long?", ["reduced", "stopped", "not felt", "since", "hours", "yesterday", "no movements", "less"], { teach: "A change in the pattern of movements, reported by the mother, is the single most available warning that the baby is not coping." }),
    yn("red_flag", "prolonged_rupture", "Leaking for more than eighteen hours", "Has the leaking been going on for more than eighteen hours, or since a previous day?", ["eighteen hours", "since yesterday", "more than a day", "long time", "hours", "two days"], { teach: "The longer the membranes have been open, the higher the chance of infection reaching the uterus and the baby." }),
    yn("red_flag", "antepartum_haemorrhage", "Bleeding with or without pain", "Is there bleeding, and is the abdomen tense and continuously painful between pains?", ["bleeding", "tense", "hard abdomen", "continuous pain", "between pains", "board like", "heavy", "clots"], { teach: "Bleeding with a continuously painful rigid abdomen points to abruption, where the blood loss is largely concealed." }),
    yn("red_flag", "preeclampsia_features", "Headache, visual disturbance or upper abdominal pain", "Any headache, blurred vision, flashes of light, or pain below the ribs on the right?", ["headache", "blurred vision", "flashes", "spots", "epigastric", "right upper", "below the ribs", "swelling", "high bp"], { teach: "Headache, visual symptoms and upper abdominal pain in pregnancy are the warning symptoms of pre-eclampsia, and they can precede a fit." }),
    yn("red_flag", "convulsion_pregnancy", "Any fit", "Has there been any fit or loss of consciousness?", ["fit", "seizure", "convulsion", "unconscious", "eclampsia", "jerking"], { teach: "A fit in pregnancy is treated as eclampsia until shown otherwise, and threatens both mother and baby." }),
    yn("red_flag", "obstructed_labour", "Long labour with exhaustion", "Has she been in strong pains for a very long time, at home or elsewhere, and is she exhausted or passing little urine?", ["long time", "since yesterday", "two days", "at home", "dai", "exhausted", "little urine", "not progressing", "pushing long"], { teach: "A long labour, often begun at home, raises obstruction, and the mother's exhaustion and urine output are the bedside markers of how long." }),
    yn("red_flag", "previous_caesarean", "Previous caesarean or uterine scar", "Has she had a previous caesarean section or any operation on the uterus?", ["previous caesarean", "lscs", "scar", "uterine surgery", "myomectomy", "previous section", "two sections"], { teach: "A scarred uterus in labour can give way, and continuous pain over the scar with a change in the baby's condition is how that presents." }),
    yn("red_flag", "cord_felt", "Something felt coming down", "Was anything felt coming down per vaginum after the water broke?", ["cord", "something coming", "felt", "prolapse", "loop", "hanging", "after water broke"], { teach: "A cord coming down ahead of the baby cuts off its blood supply, and the interval available is measured in minutes." }),
    yn("exposure", "obstetric_history_labour", "Obstetric history", "How many pregnancies and deliveries, how did each end, and were any babies small, stillborn or admitted?", ["gravida", "para", "deliveries", "caesarean", "normal", "stillbirth", "small baby", "nicu", "abortion", "living"]),
    yn("exposure", "antenatal_care", "Antenatal care", "How many antenatal visits, were tablets taken, was tetanus immunisation given, and were scans done?", ["antenatal", "visits", "checkups", "iron", "calcium", "tetanus", "tt", "scan", "ultrasound", "booked", "unbooked"]),
    yn("exposure", "medical_conditions_pregnancy", "Conditions in this pregnancy", "Any high blood pressure, diabetes, anaemia, thyroid problem or heart disease in this pregnancy?", ["high bp", "pih", "gestational diabetes", "gdm", "anaemia", "thyroid", "heart disease", "hypertension", "sugar"]),
    yn("exposure", "blood_group_rh", "Blood group", "What is the blood group, and is she rhesus negative?", ["blood group", "rh negative", "rh positive", "negative", "anti d", "o positive"], { tier: "detailed" }),
  ],
  differentials: [
    { id: "term_labour", name: "Labour at term", pointers: ["contractions", "show", "bearing_down", "gestational_age"], discriminators: ["contractions", "show", "gestational_age", "preterm", "leaking", "bearing_down"] },
    { id: "preterm_labour", name: "Preterm labour", pointers: ["preterm", "contractions", "gestational_age"], discriminators: ["preterm", "gestational_age", "contractions", "leaking", "fever_labour", "antenatal_care"] },
    { id: "prom", name: "Prelabour rupture of membranes", pointers: ["leaking", "prolonged_rupture"], discriminators: ["leaking", "prolonged_rupture", "contractions", "fever_labour", "meconium_stained", "gestational_age"] },
    { id: "false_labour", name: "False labour", pointers: ["contractions"], discriminators: ["contractions", "show", "leaking", "bearing_down", "gestational_age"] },
    { id: "abruption", name: "Abruption", pointers: ["antepartum_haemorrhage", "bleeding_labour", "reduced_fetal_movements"], discriminators: ["antepartum_haemorrhage", "bleeding_labour", "reduced_fetal_movements", "preeclampsia_features", "contractions"] },
    { id: "chorioamnionitis", name: "Chorioamnionitis", pointers: ["fever_labour", "prolonged_rupture", "leaking"], discriminators: ["fever_labour", "prolonged_rupture", "leaking", "meconium_stained", "reduced_fetal_movements"] },
    { id: "preeclampsia_labour", name: "Pre-eclampsia complicating labour", pointers: ["preeclampsia_features", "headache_vision_swelling", "convulsion_pregnancy"], discriminators: ["preeclampsia_features", "headache_vision_swelling", "convulsion_pregnancy", "reduced_urine_labour", "medical_conditions_pregnancy"] },
    { id: "obstructed", name: "Obstructed labour", pointers: ["obstructed_labour", "previous_caesarean", "bearing_down"], discriminators: ["obstructed_labour", "previous_caesarean", "bearing_down", "contractions", "reduced_urine_labour", "obstetric_history_labour"] },
    { id: "cord_prolapse", name: "Cord prolapse", pointers: ["cord_felt", "leaking", "reduced_fetal_movements"], discriminators: ["cord_felt", "leaking", "reduced_fetal_movements", "contractions"] },
  ],
  output: {
    durationSlot: "duration",
    hpiOrder: ["onset", "duration", "gestational_age", "contractions", "leaking", "show", "bearing_down", "progression", "prior_treatment", "prior_investigations"],
  },
};
