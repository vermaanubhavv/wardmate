import type { HistoryTree } from "@/lib/history-check/types";
import { commonHpi, HUTCHISONS, MACLEODS, val, yn } from "@/content/history-trees/_helpers";

/**
 * SCROTAL SWELLING OR PAIN — v1.0.0. CLINICAL CONTENT: PENDING CLINICIAN REVIEW.
 * Adult surgical / urology ward, north India. One question dominates: how suddenly did the pain
 * start, and in whom. Sudden severe pain in an adolescent or young adult is torsion until
 * excluded, and the testis is salvageable only for a few hours. Differentials: testicular
 * torsion, epididymo-orchitis, inguinoscrotal hernia, hydrocele, varicocele, testicular tumour,
 * trauma or haematocele, filarial swelling, torsion of a testicular appendage.
 */
export const scrotalSwellingV1: HistoryTree = {
  id: "scrotal_swelling",
  version: "1.0.0",
  complaint: "Scrotal swelling or pain",
  triggers: ["scrotal swelling", "scrotum swelling", "swelling of scrotum", "testicular pain", "testis pain", "pain in testis", "scrotal pain", "swollen testicle", "testicular swelling", "hydrocele", "varicocele"],
  setting: "Adult surgical / urology ward, north India",
  reviewStatus: "pending_clinician_review",
  reviewedBy: null,
  references: [MACLEODS, HUTCHISONS],
  slots: [
    ...commonHpi("scrotal swelling"),
    val("hpi", "side", "Which side", "Which side is affected — left, right, or both?", ["left", "right", "both", "one side", "bilateral", "unilateral"]),
    val("hpi", "pain_severity", "Pain and how it started", "Is there pain, how severe, and did it start suddenly or build up over days?", ["severe pain", "sudden", "suddenly", "gradual", "over days", "mild", "painless", "woke from sleep", "abrupt", "out of 10"], { numeric: true }),
    val("hpi", "swelling_character", "Nature of the swelling", "Is the swelling soft, tense, or hard, and can the top of it be felt above the swelling?", ["soft", "tense", "hard", "cystic", "firm", "can get above", "cannot get above", "bag of worms", "heavy", "irregular"]),
    yn("hpi", "size_variation", "Change in size", "Does the swelling change in size on standing, lying down, coughing, or straining?", ["standing", "lying down", "coughing", "straining", "reduces", "disappears", "increases", "end of day", "varies", "cough impulse"]),
    yn("hpi", "transillumination_history", "Whether it was ever described as fluid-filled", "Was the swelling ever described elsewhere as fluid-filled, or drained before?", ["fluid", "water", "drained", "tapped", "aspirated", "fluid filled", "previously"], { tier: "detailed" }),
    yn("associated", "fever", "Fever", "Any fever or chills?", ["fever", "chills", "rigors", "temperature", "febrile"]),
    yn("associated", "urinary_symptoms", "Burning urine / discharge / stream", "Any burning on passing urine, urethral discharge, or poor stream?", ["burning", "dysuria", "urethral discharge", "poor stream", "frequency", "urgency", "pus"]),
    yn("associated", "nausea_vomiting", "Nausea / vomiting", "Any nausea or vomiting with the pain?", ["nausea", "vomiting", "vomit", "retching"]),
    yn("associated", "abdominal_pain", "Abdominal or groin pain", "Any pain in the lower abdomen or groin, or pain radiating up from the scrotum?", ["lower abdomen", "groin", "radiating", "loin", "flank", "abdominal pain", "inguinal"]),
    yn("associated", "lump_in_testis", "A lump felt within the testis", "Is a distinct hard lump felt within the testis itself, rather than around it?", ["lump", "hard lump", "nodule", "within the testis", "on the testis", "irregular", "felt a lump"]),
    yn("associated", "weight_loss_cough", "Weight loss / cough / back pain / breast swelling", "Any weight loss, cough, back pain, or swelling and tenderness of the breasts?", ["weight loss", "cough", "back pain", "breast swelling", "gynaecomastia", "breast tenderness", "haemoptysis", "abdominal lump"]),
    yn("associated", "infertility_heaviness", "Dragging heaviness / difficulty fathering a child", "Any dragging heaviness in the scrotum, or difficulty in fathering a child?", ["dragging", "heaviness", "infertility", "no children", "dull ache", "end of day", "standing long"], { tier: "detailed" }),
    yn("associated", "limb_swelling", "Swelling of the leg or recurrent attacks of fever", "Any swelling of the leg, thickened skin, or recurrent attacks of fever with the swelling?", ["leg swelling", "thickened skin", "elephantiasis", "recurrent fever", "filaria", "lymphoedema", "attacks"], { tier: "detailed" }),
    // Red flags
    yn("red_flag", "sudden_severe_pain", "Sudden severe pain, especially waking from sleep", "Did severe pain begin abruptly, perhaps waking the patient from sleep, in an adolescent or young adult?", ["sudden", "abrupt", "severe pain", "woke from sleep", "within minutes", "young", "adolescent", "teenager", "excruciating"], { teach: "Abrupt severe testicular pain in a young patient marks torsion, where the testis survives only a few hours, so this question comes before every other one." }),
    yn("red_flag", "high_riding_horizontal", "Testis pulled up or lying differently", "Does the affected testis appear pulled up, lying higher, or sitting in a different position from the other side?", ["pulled up", "high riding", "higher", "horizontal", "different position", "retracted", "lying across"], { teach: "A testis that has ridden up or changed its lie is the bedside sign that accompanies a twisted cord." }),
    yn("red_flag", "previous_similar_episodes", "Previous similar attacks that settled", "Any previous episodes of similar severe pain that settled on their own?", ["previous episodes", "similar pain", "settled", "came and went", "before", "intermittent", "resolved on its own"], { teach: "Previous self-resolving attacks of severe pain describe intermittent twisting, and they raise rather than lower the concern." }),
    yn("red_flag", "trauma", "Injury to the scrotum", "Any injury, blow, or fall onto the scrotum?", ["injury", "trauma", "blow", "kick", "fall", "hit", "accident", "sports"], { teach: "An injury can rupture the testis or bleed into it, and it can also unmask a tumour that was already there." }),
    yn("red_flag", "hard_painless_mass", "Hard painless lump in the testis", "Is there a hard, painless lump in the testis that has grown over weeks?", ["hard", "painless", "lump", "grown", "over weeks", "increasing", "heavy", "irregular", "no pain"], { teach: "A hard painless testicular lump in a young man is a tumour until shown otherwise, and pain being absent is exactly what delays presentation." }),
    yn("red_flag", "skin_changes_sepsis", "Redness spreading / black skin / severe illness", "Any spreading redness, blackening of the scrotal skin, foul discharge, or severe illness with fever?", ["spreading redness", "blackening", "black", "necrosis", "foul discharge", "crepitus", "severe illness", "toxic", "gangrene", "diabetic"], { teach: "Blackening or rapidly spreading redness of scrotal skin marks a necrotising infection, where the delay is counted in hours." }),
    yn("red_flag", "irreducible_hernia", "A groin swelling now irreducible with vomiting", "Was there a groin swelling that used to go back and now will not, with pain and vomiting?", ["irreducible", "not going back", "used to reduce", "vomiting", "tense", "painful", "obstructed", "constipation"], { teach: "A previously reducible inguinoscrotal swelling that becomes irreducible and painful raises trapped bowel in the sac." }),
    yn("exposure", "sexual_exposure", "Sexual exposure", "Any recent unprotected sexual contact or a new partner?", ["unprotected", "new partner", "sexual contact", "sti", "multiple partners", "discharge"]),
    yn("exposure", "undescended_testis", "Undescended testis / previous scrotal surgery", "Was either testis ever undescended, or has there been previous surgery on the groin or scrotum?", ["undescended", "not descended", "orchidopexy", "previous surgery", "hernia repair", "childhood surgery", "empty scrotum"]),
    yn("exposure", "mumps_tb", "Mumps / tuberculosis", "Any recent mumps, parotid swelling, or past tuberculosis?", ["mumps", "parotid", "swelling of cheek", "tuberculosis", "tb", "koch", "att"], { tier: "detailed" }),
    yn("exposure", "filaria_endemic", "Living in a filaria-endemic area", "Does the patient live in or come from an area where filaria is common?", ["filaria", "endemic", "village", "area", "mosquito", "elephantiasis", "recurrent attacks"], { tier: "detailed" }),
  ],
  differentials: [
    { id: "torsion", name: "Testicular torsion", pointers: ["sudden_severe_pain", "high_riding_horizontal", "previous_similar_episodes", "nausea_vomiting"], discriminators: ["sudden_severe_pain", "high_riding_horizontal", "previous_similar_episodes", "nausea_vomiting", "fever", "urinary_symptoms", "pain_severity"] },
    { id: "epididymo_orchitis", name: "Epididymo-orchitis", pointers: ["fever", "urinary_symptoms", "sexual_exposure", "pain_severity"], discriminators: ["fever", "urinary_symptoms", "sexual_exposure", "pain_severity", "onset_mode", "sudden_severe_pain", "mumps_tb"] },
    { id: "hernia", name: "Inguinoscrotal hernia", pointers: ["size_variation", "irreducible_hernia", "swelling_character"], discriminators: ["size_variation", "irreducible_hernia", "swelling_character", "abdominal_pain", "undescended_testis"] },
    { id: "hydrocele", name: "Hydrocele", pointers: ["swelling_character", "transillumination_history"], discriminators: ["swelling_character", "transillumination_history", "pain_severity", "size_variation", "duration"] },
    { id: "varicocele", name: "Varicocele", pointers: ["swelling_character", "infertility_heaviness", "size_variation"], discriminators: ["swelling_character", "infertility_heaviness", "size_variation", "side", "pain_severity"] },
    { id: "tumour", name: "Testicular tumour", pointers: ["hard_painless_mass", "lump_in_testis", "weight_loss_cough", "undescended_testis"], discriminators: ["hard_painless_mass", "lump_in_testis", "weight_loss_cough", "undescended_testis", "swelling_character", "trauma"] },
    { id: "trauma_haematocele", name: "Trauma / haematocele", pointers: ["trauma", "pain_severity", "swelling_character"], discriminators: ["trauma", "pain_severity", "swelling_character", "onset_mode", "lump_in_testis"] },
    { id: "filarial", name: "Filarial scrotal swelling", pointers: ["limb_swelling", "filaria_endemic"], discriminators: ["limb_swelling", "filaria_endemic", "swelling_character", "duration", "fever"] },
    { id: "necrotising_infection", name: "Necrotising scrotal infection", pointers: ["skin_changes_sepsis", "fever"], discriminators: ["skin_changes_sepsis", "fever", "pain_severity", "onset_mode"] },
  ],
  output: {
    durationSlot: "duration",
    hpiOrder: ["onset", "duration", "onset_mode", "side", "pain_severity", "swelling_character", "size_variation", "progression", "prior_treatment", "prior_investigations"],
  },
};
