import type { HistoryTree } from "@/lib/history-check/types";
import { commonHpi, HUTCHISONS, IMMUNOCOMPROMISE, MACLEODS, PREGNANCY, val, yn } from "@/content/history-trees/_helpers";

/**
 * BURNING MICTURITION — v1.0.0. CLINICAL CONTENT: PENDING CLINICIAN REVIEW.
 * Adult medicine / surgical ward, north India. Separates a lower urinary tract infection from
 * an upper one and from an obstructive, sexually transmitted or non-infective cause.
 * Differentials: cystitis, pyelonephritis, prostatitis / epididymo-orchitis, urethritis (sexually
 * transmitted), stone, obstruction with infection, genitourinary tuberculosis, non-infective
 * (chemical, dehydration).
 */
export const burningMicturitionV1: HistoryTree = {
  id: "burning_micturition",
  version: "1.0.0",
  complaint: "Burning micturition",
  triggers: ["burning micturition", "burning urine", "dysuria", "painful urination", "pain on passing urine", "burning while passing urine", "frequency of urine", "urgency", "urinary frequency"],
  setting: "Adult medicine / surgical ward, north India",
  reviewStatus: "pending_clinician_review",
  reviewedBy: null,
  references: [MACLEODS, HUTCHISONS],
  slots: [
    ...commonHpi("burning micturition"),
    val("hpi", "timing", "When in the stream", "Is the burning at the start of passing urine, throughout, or at the end?", ["at the start", "throughout", "at the end", "terminal", "initial", "while passing", "after passing"]),
    yn("hpi", "frequency_urgency", "Frequency / urgency", "Any need to pass urine more often, or urgently, in small amounts?", ["frequency", "urgency", "small amounts", "passing more often", "getting up at night", "nocturia", "urgent"]),
    val("hpi", "urine_look", "Appearance of urine", "Is the urine cloudy, foul-smelling, or blood-stained?", ["cloudy", "foul smelling", "blood", "red", "haematuria", "dark", "turbid", "pus"]),
    yn("hpi", "hematuria", "Blood in urine", "Any blood in the urine, and at which point in the stream?", ["haematuria", "blood in urine", "red urine", "hematuria", "clots"]),
    yn("associated", "fever", "Fever / chills", "Any fever, chills, or rigors?", ["fever", "chills", "rigors", "shivering"]),
    yn("associated", "loin_pain", "Loin / suprapubic pain", "Any loin pain, suprapubic pain, or pain radiating to the groin?", ["loin pain", "flank pain", "suprapubic pain", "back pain", "colicky", "radiating to groin"]),
    yn("associated", "discharge", "Urethral or vaginal discharge", "Any discharge from the urethra or vagina, or itching?", ["discharge", "urethral discharge", "vaginal discharge", "itching", "pus", "smelly"]),
    yn("associated", "stream", "Poor stream / retention", "Any poor stream, straining, dribbling, or sense of a full bladder?", ["poor stream", "straining", "dribbling", "hesitancy", "retention", "incomplete", "full bladder"]),
    yn("associated", "nausea_vomiting", "Nausea / vomiting", "Any nausea or vomiting?", ["nausea", "vomiting", "vomit"]),
    yn("associated", "genital_lesions", "Genital sores / testicular pain", "Any genital sores, testicular pain, or swelling?", ["sores", "ulcer", "testicular pain", "swelling of scrotum", "genital", "epididymitis", "warts"], { tier: "detailed" }),
    yn("associated", "fluid_intake", "Fluid intake", "How much water is the patient drinking daily?", ["water", "fluid intake", "little water", "not drinking", "dehydrated", "litres"], { tier: "detailed" }),
    yn("associated", "recurrent", "Recurrent episodes", "Is this the first episode, or has it happened before?", ["recurrent", "recurring", "again", "previous episodes", "first episode", "several times", "repeat"], { tier: "detailed" }),
    // Red flags
    yn("red_flag", "systemic_upper", "High fever with loin pain / vomiting", "Any high fever with chills, loin pain, or vomiting?", ["high fever", "chills", "rigors", "loin pain", "vomiting", "flank pain"], { teach: "Fever, loin pain and vomiting with urinary symptoms asks whether the infection has climbed to the kidney." }),
    yn("red_flag", "obstruction_retention", "Unable to pass urine", "Has the patient been unable to pass urine, or passed only drops for hours?", ["unable to pass", "retention", "drops", "no urine", "anuria", "cannot pass"], { teach: "Infection with a blocked outflow is the combination where timing matters most." }),
    yn("red_flag", "sepsis_signs", "Giddiness / confusion / low BP", "Any giddiness, confusion, fainting, or low blood pressure with the fever?", ["giddiness", "confusion", "fainting", "low bp", "hypotension", "drowsy", "cold peripheries"], { teach: "Confusion or low pressure with a urinary infection is how sepsis first appears, especially in the elderly." }),
    yn("red_flag", "hematuria_persistent", "Blood in urine without infection features", "Is there blood in the urine without pain, especially with weight loss or in a smoker?", ["painless haematuria", "blood in urine", "smoker", "weight loss", "clots", "dark red"], { teach: "Painless blood in the urine asks about a bladder or kidney lesion rather than an infection." }),
    yn("red_flag", "diabetes_immuno", "Diabetes / catheter / immunosuppression", "Is the patient diabetic, catheterised, or immunosuppressed?", ["diabetes", "diabetic", "catheter", "immunosuppressed", "steroids", "hiv", "transplant"], { teach: "In diabetes or with a catheter, a urinary infection is more likely to spread and to be resistant." }),
    IMMUNOCOMPROMISE,
    PREGNANCY,
    yn("exposure", "sexual_exposure", "Recent unprotected sex / new partner", "Any recent unprotected sex or a new partner?", ["unprotected sex", "new partner", "sexual contact", "sti", "multiple partners"]),
    yn("exposure", "stones_prostate", "Previous stones / prostate / urological surgery", "Any previous kidney stones, prostate problems, or urological procedure?", ["stones", "calculi", "prostate", "bph", "cystoscopy", "catheter", "stricture"], { tier: "detailed" }),
    yn("exposure", "tb_contact", "TB contact / past TB", "Any past tuberculosis, or sterile pyuria that was never explained?", ["tb", "tuberculosis", "koch", "att", "pyuria", "tb contact"], { tier: "detailed" }),
  ],
  differentials: [
    { id: "cystitis", name: "Cystitis (lower UTI)", pointers: ["timing", "frequency_urgency", "urine_look"], discriminators: ["timing", "frequency_urgency", "urine_look", "fever", "loin_pain", "recurrent"] },
    { id: "pyelonephritis", name: "Pyelonephritis (upper UTI)", pointers: ["systemic_upper", "loin_pain", "fever", "nausea_vomiting"], discriminators: ["systemic_upper", "loin_pain", "fever", "nausea_vomiting", "sepsis_signs"] },
    { id: "prostatitis", name: "Prostatitis / epididymo-orchitis", pointers: ["stream", "genital_lesions", "fever"], discriminators: ["stream", "genital_lesions", "fever", "sexual_exposure", "loin_pain"] },
    { id: "urethritis_sti", name: "Urethritis (sexually transmitted)", pointers: ["discharge", "sexual_exposure", "genital_lesions"], discriminators: ["discharge", "sexual_exposure", "genital_lesions", "frequency_urgency", "fever"] },
    { id: "stone", name: "Urinary stone", pointers: ["loin_pain", "hematuria", "stones_prostate"], discriminators: ["loin_pain", "hematuria", "stones_prostate", "fluid_intake", "fever"] },
    { id: "obstruction_infection", name: "Obstruction with infection", pointers: ["stream", "obstruction_retention", "stones_prostate"], discriminators: ["stream", "obstruction_retention", "stones_prostate", "fever", "sepsis_signs"] },
    { id: "gu_tb", name: "Genitourinary tuberculosis", pointers: ["tb_contact", "hematuria"], discriminators: ["tb_contact", "hematuria", "fever", "recurrent"] },
    { id: "non_infective", name: "Non-infective (dehydration, chemical irritation)", pointers: ["fluid_intake"], discriminators: ["fluid_intake", "fever", "urine_look", "discharge"] },
  ],
  output: {
    durationSlot: "duration",
    hpiOrder: ["onset", "duration", "onset_mode", "timing", "frequency_urgency", "urine_look", "hematuria", "progression", "prior_treatment", "prior_investigations"],
  },
};
