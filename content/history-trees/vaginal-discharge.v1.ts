import type { HistoryTree } from "@/lib/history-check/types";
import { commonHpi, ebem, HUTCHISONS, MACLEODS, PREGNANCY, val, yn } from "@/content/history-trees/_helpers";

/**
 * VAGINAL DISCHARGE — v1.0.0. CLINICAL CONTENT: REVIEWED.
 * Obstetrics and gynaecology ward, north India. The history separates a discharge arising in
 * the vagina from one arising above the cervix, because the second can scar the tubes.
 * Differentials: bacterial vaginosis, candidiasis, trichomoniasis, cervicitis (chlamydia or
 * gonorrhoea), pelvic inflammatory disease, physiological discharge, atrophic vaginitis,
 * a retained foreign body or device, and malignancy of the cervix or endometrium.
 */
export const vaginalDischargeV1: HistoryTree = {
  id: "vaginal_discharge",
  version: "1.0.0",
  complaint: "Vaginal discharge",
  triggers: ["vaginal discharge", "discharge per vaginum", "white discharge", "foul discharge", "leucorrhoea", "safed pani", "itching private parts", "vaginal itching", "smelly discharge"],
  setting: "Obstetrics and gynaecology ward, north India",
  reviewStatus: "reviewed",
  reviewedBy: "Dr. Anubhav, General Surgery — 2026-09-26",
  references: [
    ebem("Diagnostic utility of physical examination, history, and laboratory evaluation in emergency department patients with vaginal complaints", 2008, "18763318"),
    MACLEODS,
    HUTCHISONS,
  ],
  slots: [
    ...commonHpi("vaginal discharge"),
    val("hpi", "colour_consistency", "Colour and consistency", "What does the discharge look like — thin and grey, thick and curdy white, or frothy and greenish-yellow?", ["thin", "grey", "white", "curdy", "cottage cheese", "thick", "frothy", "green", "yellow", "watery", "blood stained", "brown"]),
    val("hpi", "smell", "Smell", "Is there a smell, and is it fishy, foul, or absent?", ["smell", "fishy", "foul", "offensive", "no smell", "odourless", "worse after intercourse", "after periods"]),
    val("hpi", "amount_pattern", "Amount and timing", "How much is there, does it stain or soak clothing, and does it change through the cycle?", ["amount", "stains", "soaks", "pads", "through the cycle", "before periods", "after periods", "constant", "varies"]),
    yn("hpi", "itching_soreness", "Itching or soreness", "Any itching, burning or soreness of the vulva?", ["itching", "burning", "soreness", "sore", "redness", "swelling", "scratching", "raw"]),
    yn("associated", "lower_abdominal_pain", "Lower abdominal pain", "Any lower abdominal pain, and is it on one or both sides?", ["lower abdominal pain", "pain", "one side", "both sides", "cramping", "constant", "dull"]),
    yn("associated", "deep_dyspareunia", "Pain during intercourse", "Any pain during intercourse, and is it felt deep inside or at the entrance?", ["pain during intercourse", "dyspareunia", "deep", "entrance", "superficial", "avoiding"]),
    yn("associated", "fever", "Fever", "Any fever or chills?", ["fever", "chills", "rigors", "temperature"]),
    yn("associated", "urinary_symptoms_pv", "Urinary symptoms", "Any burning on passing urine or passing urine more often?", ["burning", "dysuria", "frequency", "urgency", "passing urine often"]),
    yn("associated", "abnormal_bleeding", "Abnormal bleeding", "Any bleeding between periods, after intercourse, or after the menopause?", ["between periods", "after intercourse", "post coital", "after menopause", "spotting", "irregular"]),
    yn("associated", "partner_symptoms", "Partner symptoms", "Does the partner have any discharge, burning on passing urine, or sores?", ["partner", "husband", "discharge", "burning", "sores", "ulcer", "treated", "symptoms"]),
    yn("associated", "vulval_lesions", "Sores, ulcers or warts", "Any sores, ulcers, warts or lumps on the vulva?", ["sores", "ulcer", "warts", "lumps", "blisters", "growth"], { tier: "detailed" }),
    yn("associated", "systemic_features", "Weight loss or general symptoms", "Any weight loss, tiredness, or recurrent infections?", ["weight loss", "tiredness", "recurrent infections", "thrush", "repeated"], { tier: "detailed" }),
    // Red flags
    yn("red_flag", "pid_features", "Lower abdominal pain with fever and deep pain on intercourse", "Is there lower abdominal pain with fever, deep pain during intercourse, or abnormal bleeding?", ["lower abdominal pain", "fever", "deep pain", "intercourse", "abnormal bleeding", "tender", "both sides", "unwell"], { teach: "Discharge with lower abdominal pain, fever and deep pain on intercourse points above the cervix, where untreated infection scars the tubes and causes infertility." }),
    yn("red_flag", "pregnancy_or_postpartum", "Pregnant, recently delivered, or after a procedure", "Is she pregnant, recently delivered, recently aborted, or has a device been inserted recently?", ["pregnant", "delivered", "abortion", "mtp", "iucd", "copper t", "inserted", "procedure", "recently"], { teach: "The same discharge carries different consequences in pregnancy and after a uterine procedure, including preterm labour and uterine infection." }),
    yn("red_flag", "foul_blood_stained", "Foul, blood-stained or watery discharge", "Is the discharge foul-smelling, blood-stained, or persistently watery?", ["foul", "offensive", "blood stained", "brown", "watery", "persistent", "continuous", "flooding"], { teach: "A persistently foul or blood-stained discharge, especially past middle age, asks about a cervical or endometrial growth rather than an infection." }),
    yn("red_flag", "postmenopausal_discharge", "Discharge after the menopause", "Has the discharge started after the periods stopped?", ["after menopause", "postmenopausal", "periods stopped", "years ago", "new"], { teach: "New discharge after the menopause loses the common infective explanations of the reproductive years and is investigated rather than treated blind." }),
    yn("red_flag", "retained_object", "A forgotten tampon, pessary or device", "Could anything have been left inside — a tampon, cloth, pessary, or an intrauterine device inserted long ago?", ["tampon", "cloth", "pessary", "device", "iucd", "copper t", "forgotten", "left inside", "years ago", "string not felt"], { teach: "A retained object produces a foul discharge that no treatment clears until the object is found and removed." }),
    yn("red_flag", "sexual_violence", "Discharge after non-consensual or forced intercourse", "Did this follow any forced or non-consensual sexual contact?", ["forced", "non consensual", "assault", "against her will", "violence", "rape"], { teach: "Asking this directly and privately is part of the history, because it changes the examination, the tests offered, and the support and reporting the patient is entitled to." }),
    yn("red_flag", "immunosuppression_diabetes", "Diabetes or immunosuppression", "Is she diabetic, on steroids, immunosuppressed, or getting repeated infections?", ["diabetes", "diabetic", "sugar", "steroid", "immunosuppressed", "hiv", "repeated", "recurrent thrush"], { teach: "Repeated or stubborn discharge raises uncontrolled diabetes or immune suppression as the reason it keeps coming back." }),
    PREGNANCY,
    yn("exposure", "sexual_history", "Sexual history", "Is she sexually active, has there been a new partner, and is contraception used?", ["sexually active", "new partner", "multiple partners", "condom", "contraception", "not active", "married"]),
    yn("exposure", "recent_antibiotics_douching", "Antibiotics, douching or products used", "Any recent antibiotics, vaginal washes, douching, or products applied inside?", ["antibiotics", "douching", "washing", "soap", "dettol", "powder", "applied", "home remedy", "inserted"]),
    yn("exposure", "hygiene_practices", "Hygiene and clothing", "What is used during periods, and how often is it changed?", ["cloth", "pads", "changed", "reused", "hygiene", "washing", "dried inside", "tampon"], { tier: "detailed" }),
    yn("exposure", "previous_episodes_pv", "Previous episodes and treatment", "Has this happened before, what treatment was taken, and did it help?", ["before", "previous", "recurrent", "treatment", "tablets", "pessary", "helped", "came back"], { tier: "detailed" }),
  ],
  differentials: [
    { id: "bacterial_vaginosis", name: "Bacterial vaginosis", pointers: ["smell", "colour_consistency"], discriminators: ["smell", "colour_consistency", "itching_soreness", "lower_abdominal_pain", "recent_antibiotics_douching"] },
    { id: "candidiasis", name: "Candidiasis", pointers: ["itching_soreness", "colour_consistency", "immunosuppression_diabetes"], discriminators: ["itching_soreness", "colour_consistency", "smell", "immunosuppression_diabetes", "recent_antibiotics_douching"] },
    { id: "trichomoniasis", name: "Trichomoniasis", pointers: ["colour_consistency", "smell", "partner_symptoms", "itching_soreness"], discriminators: ["colour_consistency", "smell", "partner_symptoms", "itching_soreness", "sexual_history"] },
    { id: "cervicitis", name: "Cervicitis", pointers: ["partner_symptoms", "abnormal_bleeding", "sexual_history"], discriminators: ["partner_symptoms", "abnormal_bleeding", "sexual_history", "urinary_symptoms_pv", "deep_dyspareunia"] },
    { id: "pid", name: "Pelvic inflammatory disease", pointers: ["pid_features", "lower_abdominal_pain", "deep_dyspareunia", "fever"], discriminators: ["pid_features", "lower_abdominal_pain", "deep_dyspareunia", "fever", "abnormal_bleeding", "pregnancy_or_postpartum"] },
    { id: "physiological", name: "Physiological discharge", pointers: ["amount_pattern", "colour_consistency"], discriminators: ["amount_pattern", "colour_consistency", "smell", "itching_soreness", "lower_abdominal_pain"] },
    { id: "atrophic", name: "Atrophic vaginitis", pointers: ["postmenopausal_discharge", "itching_soreness"], discriminators: ["postmenopausal_discharge", "itching_soreness", "colour_consistency", "abnormal_bleeding"] },
    { id: "retained_foreign_body", name: "Retained foreign body or device", pointers: ["retained_object", "foul_blood_stained"], discriminators: ["retained_object", "foul_blood_stained", "smell", "duration", "previous_episodes_pv"] },
    { id: "malignancy_discharge", name: "Cervical or endometrial malignancy", pointers: ["foul_blood_stained", "postmenopausal_discharge", "abnormal_bleeding"], discriminators: ["foul_blood_stained", "postmenopausal_discharge", "abnormal_bleeding", "systemic_features", "duration"] },
  ],
  output: {
    durationSlot: "duration",
    hpiOrder: ["onset", "duration", "colour_consistency", "smell", "amount_pattern", "itching_soreness", "progression", "prior_treatment", "prior_investigations"],
  },
};
