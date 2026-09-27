import type { HistoryTree } from "@/lib/history-check/types";
import { BAILEY_LOVE, CAMPBELL_UROLOGY, commonHpi, HUTCHISONS, MACLEODS, val, yn } from "@/content/history-trees/_helpers";

/**
 * LEAKING OF URINE — v1.0.0. CLINICAL CONTENT: PENDING CLINICIAN REVIEW.
 * Urology ward and casualty, north India. The history turns on when the urine leaks — with a
 * cough, with a rush of urgency, continuously day and night, or without the patient knowing —
 * and then on what came before: childbirth, a pelvic operation, a nerve or spinal illness.
 * Differentials: stress incontinence, urge incontinence / overactive bladder, mixed, overflow
 * from obstruction, neurogenic bladder, vesicovaginal fistula after obstructed labour or
 * hysterectomy, ureteric fistula, urinary infection, incontinence after prostatectomy, and
 * functional or cognitive incontinence.
 */
export const urinaryIncontinenceV1: HistoryTree = {
  id: "urinary_incontinence",
  version: "1.0.0",
  complaint: "Leaking of urine",
  triggers: ["urinary incontinence", "incontinence of urine", "leaking urine", "leaking of urine", "leakage of urine", "urine leakage", "involuntary passage of urine", "cannot control urine", "cannot hold urine", "wetting clothes", "urine leaks on coughing", "continuous dribbling of urine", "vesicovaginal fistula", "vvf", "peshab nikal jata hai", "peshab tapakta hai"],
  setting: "Urology ward and casualty, north India",
  reviewStatus: "pending_clinician_review",
  reviewedBy: null,
  references: [CAMPBELL_UROLOGY, BAILEY_LOVE, MACLEODS, HUTCHISONS],
  slots: [
    ...commonHpi("leaking of urine"),
    yn("hpi", "stress_leak", "Leak on coughing / sneezing / lifting", "Does urine leak on coughing, sneezing, laughing, lifting or standing up?", ["coughing", "sneezing", "laughing", "lifting", "standing up", "exertion", "stress"]),
    yn("hpi", "urge_leak", "Leak with urgency", "Does a sudden strong urge come, with leakage before reaching the toilet?", ["urgency", "urge", "cannot reach toilet", "before reaching", "sudden need", "rush"]),
    yn("hpi", "continuous_leak", "Continuous leak day and night", "Is the patient wet all the time, day and night, even without any urge or effort?", ["all the time", "continuous", "day and night", "always wet", "constant leak", "never dry"], { teach: "Wetness that never stops, day and night, asks whether urine is bypassing the sphincter through an abnormal opening." }),
    yn("hpi", "normal_voiding_too", "Also passes urine normally", "Along with the leak, does the patient still pass urine normally at times?", ["passes normally", "also voids", "normal urination", "still passes urine", "empties bladder"], { tier: "detailed", teach: "Normal voiding alongside a constant leak suggests one ureter is draining outside the bladder while the other still fills it." }),
    yn("hpi", "unaware_leak", "Leak without awareness", "Does urine leak without the patient being aware of it, or during sleep?", ["without knowing", "unaware", "not aware", "bedwetting", "during sleep", "wet bed"]),
    val("hpi", "leak_amount", "Amount and pads", "How much leaks — drops or a full wetting — and how many pads or cloths are changed in a day?", ["drops", "few drops", "soaked", "full wetting", "pads", "cloth", "per day", "diaper"], { numeric: true }),
    val("hpi", "frequency_nocturia_inc", "Frequency and night-time passing", "How often is urine passed by day, and how many times at night?", ["times a day", "every hour", "frequency", "at night", "nocturia", "times at night"], { numeric: true }),
    yn("hpi", "voiding_difficulty_inc", "Poor stream / incomplete emptying", "Is there a weak stream, straining, or a feeling that the bladder does not empty?", ["weak stream", "straining", "not emptying", "incomplete emptying", "hesitancy", "poor flow"], { teach: "Leaking with a poor stream asks whether the bladder is overfull and spilling over rather than failing to hold." }),
    val("hpi", "fluid_caffeine", "Fluid, tea and coffee intake", "How much fluid, tea, coffee or alcohol is taken in a day, and in the evening?", ["tea", "coffee", "chai", "alcohol", "litres", "glasses", "evening drinks", "fluid intake"], { tier: "detailed" }),
    // Associated
    yn("associated", "dysuria_inc", "Burning / cloudy urine", "Any burning, cloudy or foul-smelling urine, or fever?", ["burning", "dysuria", "cloudy", "foul smelling", "fever", "smelly urine"]),
    yn("associated", "prolapse_feel", "Something coming down", "In a woman, is there a feeling of something coming down in the vagina?", ["something coming down", "prolapse", "mass per vagina", "bulge", "dragging"]),
    yn("associated", "bowel_change_inc", "Constipation / leaking stool", "Is there constipation, or any leakage of stool or wind?", ["constipation", "leaking stool", "faecal incontinence", "fecal incontinence", "wind", "soiling"]),
    yn("associated", "mobility_cognition", "Mobility or memory trouble", "Does the patient have trouble walking to the toilet, or problems with memory or confusion?", ["cannot walk", "bedbound", "walker", "memory", "forgetful", "confusion", "dementia", "slow to reach"]),
    yn("associated", "thirst_polyuria", "Thirst / passing large amounts", "Is there excess thirst or large volumes of urine?", ["thirst", "large volumes", "polyuria", "drinking a lot", "sugar"], { tier: "detailed" }),
    // Red flags
    yn("red_flag", "saddle_numbness_inc", "Back pain with saddle numbness or leg weakness", "Any back pain with numbness around the buttocks or genitals, new leg weakness, or loss of bowel control?", ["saddle", "numbness", "perineal numbness", "leg weakness", "back pain", "loss of bowel control"], { teach: "New incontinence with saddle numbness can be the presenting sign of cauda equina compression, where hours matter." }),
    yn("red_flag", "leak_after_delivery_surgery", "Leak began after childbirth or an operation", "Did the leak start soon after a delivery, a prolonged labour, or a pelvic operation such as hysterectomy or caesarean?", ["after delivery", "after childbirth", "prolonged labour", "obstructed labour", "after hysterectomy", "after caesarean", "after operation", "after surgery"], { teach: "A leak that began days after a difficult labour or a pelvic operation asks about a fistula, which bladder medicines will not help." }),
    yn("red_flag", "haematuria_inc", "Blood in the urine", "Has any blood been seen in the urine?", ["blood", "red urine", "haematuria", "hematuria", "clots"], { teach: "Blood with new urgency, especially in a smoker, asks whether something within the bladder wall is irritating it." }),
    yn("red_flag", "overflow_uraemia_inc", "Dribbling with drowsiness or vomiting", "Is there constant dribbling together with a swollen lower abdomen, drowsiness, vomiting or swelling of the legs?", ["swollen lower abdomen", "distended", "drowsy", "vomiting", "leg swelling", "loss of appetite"], { teach: "Overflow from a chronically full bladder can back up to the kidneys without any pain, and these symptoms ask whether that has happened." }),
    yn("red_flag", "fever_loin_inc", "Fever with loin pain", "Any fever with rigors or pain in the loin?", ["fever", "rigors", "chills", "loin pain", "flank pain"], { teach: "Fever with loin pain asks whether infection has reached the kidney." }),
    // Exposure / background
    val("exposure", "obstetric_history", "Deliveries", "How many deliveries, were any prolonged, obstructed, at home, by forceps or caesarean, and was any baby stillborn?", ["deliveries", "children", "prolonged labour", "obstructed labour", "home delivery", "forceps", "caesarean", "lscs", "stillbirth", "big baby"]),
    yn("exposure", "pelvic_surgery_radiation", "Pelvic operation or radiotherapy", "Has the patient had a hysterectomy, prostate operation, rectal operation, or radiotherapy to the pelvis?", ["hysterectomy", "prostatectomy", "turp", "prostate operation", "rectal surgery", "radiotherapy", "radiation", "sikai"], { teach: "Pelvic operations and radiotherapy can injure the sphincter, the nerves or the bladder wall, each producing a different leak." }),
    yn("exposure", "neuro_background_inc", "Diabetes / stroke / spinal or nerve disease", "Is there diabetes, a stroke, spinal injury, Parkinson's disease or multiple sclerosis?", ["diabetes", "diabetic", "stroke", "paralysis", "spinal injury", "parkinson", "multiple sclerosis", "spina bifida"]),
    val("exposure", "drugs_inc", "Medicines", "What medicines are being taken — water tablets, sleeping or mood medicines, blood pressure or prostate medicines?", ["water tablet", "diuretic", "sleeping pill", "sedative", "antidepressant", "bp medicine", "prostate medicine", "no medicines"], { tier: "detailed" }),
    yn("exposure", "menopause_cough", "Menopause / chronic cough / constipation straining", "Is the patient past menopause, or is there a long-standing cough or heavy lifting at work?", ["menopause", "periods stopped", "chronic cough", "smoker", "heavy lifting", "straining"], { tier: "detailed" }),
  ],
  differentials: [
    { id: "stress", name: "Stress incontinence", pointers: ["stress_leak", "obstetric_history", "menopause_cough"], discriminators: ["stress_leak", "urge_leak", "obstetric_history", "prolapse_feel", "leak_amount"] },
    { id: "urge_oab", name: "Urge incontinence / overactive bladder", pointers: ["urge_leak", "frequency_nocturia_inc"], discriminators: ["urge_leak", "stress_leak", "frequency_nocturia_inc", "fluid_caffeine", "dysuria_inc", "haematuria_inc"] },
    { id: "mixed", name: "Mixed incontinence", pointers: ["stress_leak", "urge_leak"], discriminators: ["stress_leak", "urge_leak", "leak_amount", "obstetric_history"] },
    { id: "overflow", name: "Overflow from outflow obstruction", pointers: ["voiding_difficulty_inc", "overflow_uraemia_inc", "unaware_leak"], discriminators: ["voiding_difficulty_inc", "overflow_uraemia_inc", "drugs_inc", "bowel_change_inc"] },
    { id: "neurogenic", name: "Neurogenic bladder", pointers: ["neuro_background_inc", "saddle_numbness_inc", "unaware_leak"], discriminators: ["neuro_background_inc", "saddle_numbness_inc", "bowel_change_inc", "voiding_difficulty_inc"] },
    { id: "vvf", name: "Vesicovaginal fistula (obstructed labour, hysterectomy)", pointers: ["continuous_leak", "leak_after_delivery_surgery", "obstetric_history"], discriminators: ["continuous_leak", "leak_after_delivery_surgery", "obstetric_history", "pelvic_surgery_radiation", "normal_voiding_too"] },
    { id: "ureteric_fistula", name: "Ureteric fistula", pointers: ["continuous_leak", "normal_voiding_too", "pelvic_surgery_radiation"], discriminators: ["continuous_leak", "normal_voiding_too", "leak_after_delivery_surgery", "fever_loin_inc"] },
    { id: "uti", name: "Urinary tract infection", pointers: ["dysuria_inc", "fever_loin_inc"], discriminators: ["dysuria_inc", "fever_loin_inc", "onset_mode", "haematuria_inc"] },
    { id: "post_prostatectomy", name: "Incontinence after prostate surgery", pointers: ["pelvic_surgery_radiation", "stress_leak"], discriminators: ["pelvic_surgery_radiation", "stress_leak", "leak_amount", "voiding_difficulty_inc"] },
    { id: "functional", name: "Functional or cognitive incontinence", pointers: ["mobility_cognition"], discriminators: ["mobility_cognition", "drugs_inc", "thirst_polyuria", "unaware_leak"] },
  ],
  output: {
    durationSlot: "duration",
    hpiOrder: ["onset", "duration", "onset_mode", "stress_leak", "urge_leak", "continuous_leak", "normal_voiding_too", "unaware_leak", "leak_amount", "frequency_nocturia_inc", "voiding_difficulty_inc", "fluid_caffeine", "progression", "prior_treatment", "prior_investigations"],
  },
};
