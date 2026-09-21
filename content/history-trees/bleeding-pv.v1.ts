import type { HistoryTree } from "@/lib/history-check/types";
import { commonHpi, ebem, HUTCHISONS, MACLEODS, rce, val, yn } from "@/content/history-trees/_helpers";

/**
 * BLEEDING PER VAGINUM — v1.0.0. CLINICAL CONTENT: PENDING CLINICIAN REVIEW.
 * Obstetrics and gynaecology ward, north India. The first question is always whether the
 * patient could be pregnant, because that single fact splits the differential in two and puts
 * a ruptured ectopic at the top of one half. Differentials: ectopic pregnancy, miscarriage,
 * antepartum haemorrhage (placenta praevia, abruption), postpartum haemorrhage, abnormal
 * uterine bleeding, fibroid, cervical or endometrial malignancy, cervical polyp or infection,
 * and bleeding from a clotting disorder or anticoagulation.
 */
export const bleedingPvV1: HistoryTree = {
  id: "bleeding_pv",
  version: "1.0.0",
  complaint: "Bleeding per vaginum",
  triggers: ["bleeding per vaginum", "bleeding pv", "vaginal bleeding", "per vaginal bleeding", "spotting", "heavy periods", "menorrhagia", "postmenopausal bleeding", "bleeding after delivery", "postpartum haemorrhage", "khoon aana"],
  setting: "Obstetrics and gynaecology ward, north India",
  reviewStatus: "pending_clinician_review",
  reviewedBy: null,
  references: [
    rce("Does this woman have an ectopic pregnancy? The Rational Clinical Examination systematic review", 2013, "23613077"),
    rce("The rational clinical examination. Is this patient hypovolemic?", 1999, "10086438"),
    MACLEODS,
    HUTCHISONS,
  ],
  slots: [
    ...commonHpi("bleeding per vaginum"),
    val("hpi", "pregnancy_status", "Could she be pregnant", "When was the last menstrual period, is she pregnant, and if so how many weeks, or has she delivered or aborted recently?", ["lmp", "last menstrual period", "missed period", "pregnant", "weeks", "months", "pog", "delivered", "abortion", "not pregnant", "test positive", "urine test"]),
    val("hpi", "amount", "How much bleeding", "How much blood — spotting, how many pads a day, are they soaked, and are there clots?", ["spotting", "pads", "per day", "soaked", "clots", "flooding", "heavy", "light", "how many"], { numeric: true }),
    val("hpi", "pattern_timing", "Pattern", "Is the bleeding continuous or intermittent, related to periods, between periods, after intercourse, or after the menopause?", ["continuous", "intermittent", "with periods", "between periods", "after intercourse", "post coital", "after menopause", "irregular", "cyclical"]),
    val("hpi", "colour_tissue", "Colour and anything passed", "Is the blood fresh or dark, and has any tissue or fleshy material been passed?", ["fresh", "bright red", "dark", "brown", "clots", "tissue", "fleshy", "products", "grape like", "watery"]),
    yn("hpi", "pain", "Pain", "Is there pain, where is it, and did it come before or after the bleeding?", ["pain", "abdominal pain", "lower abdomen", "one side", "cramping", "before the bleeding", "after", "severe", "painless", "back pain"]),
    yn("associated", "giddiness_fainting", "Giddiness or fainting", "Any giddiness, fainting, or sweating, especially on standing?", ["giddiness", "fainting", "fainted", "sweating", "on standing", "collapsed", "weakness", "palpitations"]),
    yn("associated", "shoulder_tip_pain", "Shoulder tip pain or pain on passing stool", "Any pain at the tip of the shoulder, or pain and pressure on passing stool?", ["shoulder tip", "shoulder pain", "pain passing stool", "pressure", "rectal pressure", "urge to defaecate"]),
    yn("associated", "discharge_fever", "Discharge or fever", "Any foul-smelling discharge, fever, or chills?", ["discharge", "foul", "smelly", "fever", "chills", "offensive", "pus"]),
    yn("associated", "fetal_movements", "Fetal movements", "In a pregnancy beyond twenty weeks, are the baby's movements felt as usual?", ["fetal movements", "baby moving", "reduced", "not felt", "less", "same as before", "quickening"]),
    yn("associated", "contractions_leaking", "Pains or leaking", "Any tightening pains coming and going, or watery leaking per vaginum?", ["pains", "tightening", "contractions", "leaking", "watery", "water broke", "gush", "intervals"]),
    yn("associated", "bladder_bowel_pressure", "Pressure symptoms", "Any increasing abdominal swelling, pressure on the bladder, or difficulty passing urine?", ["swelling", "mass", "pressure", "bladder", "frequency", "difficulty passing urine", "constipation", "heaviness"], { tier: "detailed" }),
    yn("associated", "weight_loss_appetite", "Weight loss or appetite", "Any weight loss or loss of appetite?", ["weight loss", "lost weight", "appetite", "loss of appetite"], { tier: "detailed" }),
    // Red flags
    yn("red_flag", "shock_features_pv", "Giddiness, collapse or cold clammy skin", "Any collapse, severe giddiness on sitting up, cold clammy skin, or a recorded low blood pressure?", ["collapse", "severe giddiness", "cold", "clammy", "low bp", "hypotension", "unrecordable", "fainted", "pulse fast"], { teach: "Blood lost per vaginum is easily underestimated, and postural giddiness marks the volume lost better than the pad count does." }),
    yn("red_flag", "missed_period_with_pain", "Missed period with one-sided pain", "Has a period been missed, with pain on one side of the lower abdomen?", ["missed period", "amenorrhoea", "one side", "lower abdomen", "pain", "six weeks", "positive test", "spotting"], { teach: "A missed period with one-sided pain and bleeding is a ruptured ectopic pregnancy until excluded, and it can bleed heavily with very little showing outside." }),
    yn("red_flag", "heavy_bleeding_pregnancy", "Heavy bleeding in a known pregnancy", "In a known pregnancy, is the bleeding heavy, with or without abdominal pain?", ["known pregnancy", "heavy", "soaking", "clots", "with pain", "painless", "continuous", "weeks pregnant"], { teach: "Bleeding in the second half of pregnancy separates into a painless bleed and a painful rigid abdomen, and the two are managed very differently." }),
    yn("red_flag", "postpartum_bleeding", "Heavy bleeding after delivery", "Has she delivered recently, and is the bleeding heavy or continuing?", ["delivered", "after delivery", "postpartum", "heavy", "continuing", "soaking", "clots", "placenta", "hours after"], { teach: "Bleeding after delivery can become life-threatening within minutes, and the time since delivery and the placenta's delivery are the first two questions." }),
    yn("red_flag", "postmenopausal_bleeding", "Any bleeding after the menopause", "Has there been any bleeding at all since the periods stopped?", ["postmenopausal", "after menopause", "periods stopped", "years ago", "any bleeding", "spotting", "once"], { teach: "Any bleeding after the menopause, however slight and however brief, is investigated for an endometrial cause rather than observed." }),
    yn("red_flag", "post_coital_bleeding", "Bleeding after intercourse", "Any bleeding after intercourse, or a blood-stained discharge between periods?", ["after intercourse", "post coital", "blood stained discharge", "between periods", "foul", "watery"], { teach: "Bleeding after intercourse points to the cervix, and a cervix is looked at rather than assumed normal." }),
    yn("red_flag", "fever_with_bleeding", "Fever with foul discharge after a pregnancy event", "Any fever with foul-smelling discharge following a delivery, abortion or procedure?", ["fever", "foul", "offensive", "after abortion", "after delivery", "procedure", "chills", "unsafe", "outside"], { teach: "Fever with offensive discharge after a pregnancy event raises infection of the uterus, which in an unsafe abortion can progress very quickly." }),
    yn("red_flag", "bleeding_disorder_pv", "Bleeding elsewhere or blood thinners", "Any bruising, bleeding gums, nose bleeds, or blood thinners?", ["bruising", "gums", "nose bleed", "blood thinner", "warfarin", "aspirin", "platelets", "bleeding disorder"], { tier: "detailed", teach: "Heavy periods can be the first presentation of a clotting disorder, particularly when bleeding has been heavy since the very first period." }),
    yn("exposure", "obstetric_history", "Obstetric history", "How many pregnancies and deliveries, any caesarean sections, and any previous miscarriage or ectopic?", ["gravida", "para", "deliveries", "caesarean", "lscs", "miscarriage", "abortion", "ectopic", "previous", "g2p1"]),
    yn("exposure", "contraception_hormones", "Contraception and hormones", "What contraception is being used, including an intrauterine device, pills or injections?", ["contraception", "iucd", "copper t", "pills", "ocp", "injection", "implant", "sterilisation", "none"]),
    yn("exposure", "recent_procedure_pv", "Recent procedure", "Any recent dilatation and curettage, insertion of a device, or termination of pregnancy?", ["d and c", "curettage", "insertion", "copper t", "termination", "mtp", "procedure", "recently"]),
    yn("exposure", "cervical_screening", "Cervical screening", "Has a cervical smear ever been done, and what did it show?", ["smear", "pap", "screening", "hpv", "never done", "normal", "abnormal"], { tier: "detailed" }),
  ],
  differentials: [
    { id: "ectopic", name: "Ectopic pregnancy", pointers: ["missed_period_with_pain", "pain", "shoulder_tip_pain", "shock_features_pv"], discriminators: ["missed_period_with_pain", "pregnancy_status", "pain", "shoulder_tip_pain", "shock_features_pv", "obstetric_history", "contraception_hormones"] },
    { id: "miscarriage", name: "Miscarriage", pointers: ["pregnancy_status", "colour_tissue", "pain"], discriminators: ["pregnancy_status", "colour_tissue", "pain", "amount", "fever_with_bleeding"] },
    { id: "aph", name: "Antepartum haemorrhage", pointers: ["heavy_bleeding_pregnancy", "fetal_movements", "contractions_leaking"], discriminators: ["heavy_bleeding_pregnancy", "pain", "fetal_movements", "contractions_leaking", "pregnancy_status", "obstetric_history"] },
    { id: "pph", name: "Postpartum haemorrhage", pointers: ["postpartum_bleeding", "shock_features_pv"], discriminators: ["postpartum_bleeding", "amount", "shock_features_pv", "fever_with_bleeding", "obstetric_history"] },
    { id: "aub", name: "Abnormal uterine bleeding", pointers: ["pattern_timing", "amount"], discriminators: ["pattern_timing", "amount", "pregnancy_status", "contraception_hormones", "bleeding_disorder_pv", "postmenopausal_bleeding"] },
    { id: "fibroid", name: "Fibroid uterus", pointers: ["amount", "bladder_bowel_pressure", "pattern_timing"], discriminators: ["amount", "bladder_bowel_pressure", "pattern_timing", "pain", "obstetric_history"] },
    { id: "malignancy_pv", name: "Cervical or endometrial malignancy", pointers: ["postmenopausal_bleeding", "post_coital_bleeding", "weight_loss_appetite"], discriminators: ["postmenopausal_bleeding", "post_coital_bleeding", "weight_loss_appetite", "discharge_fever", "cervical_screening", "pattern_timing"] },
    { id: "infection_polyp", name: "Cervical polyp or infection", pointers: ["post_coital_bleeding", "discharge_fever"], discriminators: ["post_coital_bleeding", "discharge_fever", "pattern_timing", "amount", "cervical_screening"] },
    { id: "coagulopathy_pv", name: "Bleeding disorder or anticoagulation", pointers: ["bleeding_disorder_pv", "amount"], discriminators: ["bleeding_disorder_pv", "amount", "pattern_timing", "obstetric_history"] },
  ],
  output: {
    durationSlot: "duration",
    hpiOrder: ["onset", "duration", "pregnancy_status", "amount", "pattern_timing", "colour_tissue", "pain", "progression", "prior_treatment", "prior_investigations"],
  },
};
