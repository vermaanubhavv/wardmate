import type { HistoryTree } from "@/lib/history-check/types";
import { BAILEY_LOVE, CAMPBELL_UROLOGY, commonHpi, HUTCHISONS, MACLEODS, val, yn } from "@/content/history-trees/_helpers";

/**
 * DIFFICULTY PASSING URINE / RETENTION — v1.0.0. CLINICAL CONTENT: REVIEWED (Dr Anubhav Verma).
 * Urology ward and casualty, north India. The history first separates complete retention from
 * a poor stream, then walks the IPSS storage and voiding items one by one, then asks what set
 * the episode off (a drug, an operation, constipation, a clot). Differentials: benign
 * prostatic enlargement, urethral stricture (instrumentation, gonococcal, trauma), bladder
 * neck or meatal stenosis, prostate cancer, bladder or urethral stone, neurogenic bladder
 * (diabetes, spinal cord disease, cauda equina), drug-induced retention, clot retention,
 * constipation, phimosis, and retention after an operation.
 */
export const difficultyPassingUrineV1: HistoryTree = {
  id: "difficulty_passing_urine",
  version: "1.0.0",
  complaint: "Difficulty passing urine / retention",
  triggers: ["difficulty passing urine", "difficulty in passing urine", "urinary retention", "retention of urine", "acute retention", "unable to pass urine", "cannot pass urine", "poor urinary stream", "weak urinary stream", "straining to pass urine", "hesitancy of urine", "luts", "lower urinary tract symptoms", "enlarged prostate", "prostate enlargement", "bph", "peshab ruk gaya", "peshab nahi utarta", "peshab ruk ruk ke"],
  setting: "Urology ward and casualty, north India",
  reviewStatus: "reviewed",
  reviewedBy: "Dr Anubhav Verma",
  references: [CAMPBELL_UROLOGY, BAILEY_LOVE, MACLEODS, HUTCHISONS],
  slots: [
    ...commonHpi("difficulty passing urine"),
    val("hpi", "retention_state", "Complete retention or poor flow", "Is the patient unable to pass any urine now, or passing it with difficulty, and since when was urine last passed?", ["unable to pass", "not passed since", "complete retention", "passing with difficulty", "passing drops", "last passed", "poor flow", "hours"]),
    val("hpi", "catheter_now", "Catheter already passed", "Has a catheter been passed for this episode — was it difficult, and how much urine drained?", ["catheter", "catheterised", "foley", "drained", "difficult catheterisation", "could not pass catheter", "suprapubic", "ml", "litre"], { numeric: true }),
    val("hpi", "precipitant", "What set it off", "Did anything come just before it — a cold remedy or new medicine, alcohol, an operation, constipation, a long journey, or holding urine for long?", ["cold medicine", "new medicine", "alcohol", "after surgery", "constipation", "journey", "held urine", "cold weather", "after spinal"]),
    // IPSS items: voiding
    yn("hpi", "weak_stream", "Weak stream", "Is the urine stream weaker or slower than before?", ["weak stream", "poor stream", "slow stream", "thin stream", "poor flow", "dhaar kam"]),
    yn("hpi", "straining_hesitancy", "Hesitancy / straining", "Is there a delay before urine starts, or a need to push or strain to pass it?", ["hesitancy", "delay in starting", "straining", "push", "strain", "takes time to start"]),
    yn("hpi", "intermittency", "Intermittency", "Does the stream stop and start several times while passing urine?", ["intermittency", "stops and starts", "interrupted stream", "ruk ruk ke", "breaks"]),
    yn("hpi", "incomplete_emptying", "Incomplete emptying", "Is there a feeling that the bladder has not emptied fully after passing urine?", ["incomplete emptying", "not emptied", "feeling of residual", "unsatisfied", "urine left behind"]),
    yn("hpi", "terminal_dribble", "Dribbling at the end", "Does urine keep dribbling at the end of passing it or after dressing?", ["terminal dribbling", "post void dribbling", "dribbling after", "dribbles at the end", "wets clothes after"], { tier: "detailed" }),
    yn("hpi", "spraying_stream", "Thin, spraying or forked stream", "Is the stream thin, spraying, forked or twisted?", ["spraying", "forked", "split stream", "twisted", "very thin", "thread like"], { teach: "A thin or spraying stream in a younger man points the history towards the urethra itself rather than the prostate." }),
    // IPSS items: storage
    yn("hpi", "frequency_day", "Daytime frequency", "Is urine being passed more often than every two hours by day?", ["frequency", "frequent", "every hour", "every two hours", "often", "baar baar"]),
    yn("hpi", "urgency_storage", "Urgency", "Is there a sudden strong need to pass urine that is hard to put off?", ["urgency", "urgent", "cannot hold", "rush", "sudden need", "leaks before reaching"]),
    val("hpi", "nocturia_count", "Nocturia", "How many times does the patient get up at night to pass urine?", ["nocturia", "at night", "times at night", "wakes up", "night"], { numeric: true }),
    // Associated
    yn("associated", "dysuria_uti", "Burning / cloudy urine", "Any burning, cloudy or foul-smelling urine?", ["burning", "dysuria", "cloudy", "foul smelling", "pus", "smelly urine"]),
    yn("associated", "haematuria_luts", "Blood in the urine", "Has any blood or clots been seen in the urine?", ["blood", "red urine", "clots", "haematuria", "hematuria"]),
    yn("associated", "stone_symptoms", "Stream stopping suddenly / stone passed", "Does the stream stop suddenly mid-flow with pain at the tip of the penis, or has a stone ever been passed?", ["stops suddenly", "pain at tip", "stone passed", "gravel", "stone", "pathri"]),
    yn("associated", "constipation_luts", "Constipation", "Is the patient constipated, and when were the bowels last opened?", ["constipation", "constipated", "hard stools", "bowels not opened", "last stool", "no motion"]),
    yn("associated", "foreskin_meatus", "Tight foreskin / narrow opening", "Can the foreskin be pulled back, and is there any ballooning, scarring or narrowing at the tip of the penis?", ["phimosis", "tight foreskin", "cannot retract", "ballooning", "narrow opening", "meatal", "white patch", "scarring"]),
    // Red flags
    yn("red_flag", "painful_distended_bladder", "Painful swollen lower abdomen", "Is there a painful, swollen lower abdomen with no urine passed?", ["painful lower abdomen", "swollen lower abdomen", "bladder full", "distended", "suprapubic pain", "cannot pass"], { teach: "A painful full bladder needs relief before the cause is worked out, so this question sets the pace of the whole history." }),
    yn("red_flag", "cauda_equina", "Back pain with saddle numbness or leg weakness", "Any back pain with numbness around the buttocks or genitals, leg weakness, or loss of bowel control?", ["saddle", "numbness", "perineal numbness", "leg weakness", "loss of bowel control", "back pain", "sciatica both legs"], { teach: "Painless retention with saddle numbness can be the only sign of cauda equina compression, where hours matter for recovery." }),
    yn("red_flag", "fever_rigors_luts", "Fever with rigors or confusion", "Any fever with rigors, confusion, or giddiness on standing?", ["fever", "rigors", "chills", "confusion", "giddiness", "low bp"], { teach: "An infected obstructed urinary tract can progress to sepsis quickly, and rigors are often the first clue." }),
    yn("red_flag", "chronic_retention_uraemia", "Constant dribbling with drowsiness or vomiting", "Is there constant dribbling or bedwetting along with drowsiness, vomiting, loss of appetite or swelling?", ["constant dribbling", "bedwetting", "overflow", "drowsy", "vomiting", "loss of appetite", "swelling", "itching"], { teach: "Painless overflow with these symptoms asks whether long-standing back pressure has already affected the kidneys." }),
    yn("red_flag", "bone_pain_weight_loss", "Bone pain / weight loss", "Any back or bone pain, weight loss, or loss of appetite over recent months?", ["bone pain", "back pain", "weight loss", "lost weight", "loss of appetite", "hip pain"], { teach: "Bone pain and weight loss alongside outflow symptoms raise the question of prostate cancer that has spread." }),
    yn("red_flag", "clot_retention", "Retention with clots", "Did the retention come with blood clots in the urine?", ["clots", "clot retention", "blood clots", "blocked with clots"], { teach: "Clots that block the outflow mean the bleeding source needs attention as well as the retention." }),
    // Exposure / background
    yn("exposure", "previous_instrumentation", "Previous catheter, scope or urethral injury", "Has the patient had a catheter, cystoscopy, prostate or urethral operation, a fall astride something, or a pelvic fracture before?", ["previous catheter", "cystoscopy", "turp", "prostate operation", "urethral injury", "fall astride", "straddle", "pelvic fracture", "urethroplasty", "dilatation"], { teach: "Most urethral strictures follow an earlier instrument or injury, which the patient may not connect to today's symptoms." }),
    yn("exposure", "urethral_discharge_history", "Past urethral discharge / sexually transmitted infection", "Has there ever been a discharge from the penis or a sexually transmitted infection?", ["urethral discharge", "discharge from penis", "gonorrhoea", "sti", "std", "sexually transmitted", "pus from urethra"], { tier: "detailed" }),
    val("exposure", "retention_drugs", "Medicines that cause retention", "What medicines are being taken — cold or allergy remedies, painkillers such as opioids, medicines for bladder, mood, sleep or stomach cramps?", ["cold medicine", "antihistamine", "cough syrup", "opioid", "tramadol", "morphine", "antidepressant", "amitriptyline", "antispasmodic", "anticholinergic", "sleeping pill", "no medicines"]),
    yn("exposure", "neuro_diabetes", "Diabetes / spinal or nerve disease", "Is there diabetes, a spinal injury or disc problem, stroke, Parkinson's disease or multiple sclerosis?", ["diabetes", "diabetic", "sugar", "spinal injury", "disc", "stroke", "paralysis", "parkinson", "multiple sclerosis"]),
    yn("exposure", "recent_operation", "Recent operation or spinal anaesthesia", "Has the patient had an operation or a spinal anaesthetic in the last few days?", ["operation", "surgery", "spinal anaesthesia", "spinal anesthesia", "hernia repair", "piles operation", "post op"]),
    yn("exposure", "previous_retention", "Previous retention episodes", "Has the patient had retention or needed a catheter before?", ["previous retention", "catheter before", "same problem before", "recurrent", "earlier episode"], { tier: "detailed" }),
  ],
  differentials: [
    { id: "bph", name: "Benign prostatic enlargement", pointers: ["weak_stream", "straining_hesitancy", "nocturia_count", "incomplete_emptying", "frequency_day"], discriminators: ["weak_stream", "nocturia_count", "incomplete_emptying", "urgency_storage", "previous_retention", "bone_pain_weight_loss"] },
    { id: "stricture", name: "Urethral stricture (instrumentation, gonococcal, trauma)", pointers: ["spraying_stream", "previous_instrumentation", "urethral_discharge_history"], discriminators: ["spraying_stream", "previous_instrumentation", "urethral_discharge_history", "catheter_now", "onset_mode"] },
    { id: "bladder_neck_meatal", name: "Bladder neck or meatal stenosis", pointers: ["previous_instrumentation", "foreskin_meatus"], discriminators: ["previous_instrumentation", "foreskin_meatus", "spraying_stream", "catheter_now"] },
    { id: "ca_prostate", name: "Prostate cancer", pointers: ["bone_pain_weight_loss", "haematuria_luts"], discriminators: ["bone_pain_weight_loss", "haematuria_luts", "progression", "cauda_equina", "prior_investigations"] },
    { id: "stone", name: "Bladder or urethral stone", pointers: ["stone_symptoms", "haematuria_luts"], discriminators: ["stone_symptoms", "haematuria_luts", "dysuria_uti", "intermittency"] },
    { id: "neurogenic", name: "Neurogenic bladder (diabetes, spinal cord disease, cauda equina)", pointers: ["neuro_diabetes", "cauda_equina", "chronic_retention_uraemia"], discriminators: ["neuro_diabetes", "cauda_equina", "painful_distended_bladder", "constipation_luts", "urgency_storage"] },
    { id: "drug_induced", name: "Drug-induced retention", pointers: ["retention_drugs", "precipitant"], discriminators: ["retention_drugs", "precipitant", "onset_mode", "previous_retention"] },
    { id: "clot_retention", name: "Clot retention", pointers: ["clot_retention", "haematuria_luts"], discriminators: ["clot_retention", "haematuria_luts", "previous_instrumentation", "bone_pain_weight_loss"] },
    { id: "constipation", name: "Retention from constipation", pointers: ["constipation_luts"], discriminators: ["constipation_luts", "retention_drugs", "precipitant"] },
    { id: "phimosis", name: "Phimosis", pointers: ["foreskin_meatus"], discriminators: ["foreskin_meatus", "neuro_diabetes", "dysuria_uti"] },
    { id: "post_op_retention", name: "Post-operative retention", pointers: ["recent_operation"], discriminators: ["recent_operation", "retention_drugs", "constipation_luts", "weak_stream"], appliesWhen: "post_op" },
    { id: "infection", name: "Urinary infection or prostatitis with retention", pointers: ["dysuria_uti", "fever_rigors_luts"], discriminators: ["dysuria_uti", "fever_rigors_luts", "urethral_discharge_history", "onset_mode"] },
  ],
  output: {
    durationSlot: "duration",
    hpiOrder: ["onset", "duration", "onset_mode", "retention_state", "precipitant", "weak_stream", "straining_hesitancy", "intermittency", "incomplete_emptying", "terminal_dribble", "spraying_stream", "frequency_day", "urgency_storage", "nocturia_count", "progression", "catheter_now", "prior_treatment", "prior_investigations"],
  },
};
