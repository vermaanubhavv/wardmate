import type { HistoryTree } from "@/lib/history-check/types";
import { commonHpi, HUTCHISONS, MACLEODS, PREGNANCY, rce, val, yn } from "@/content/history-trees/_helpers";

/**
 * GIDDINESS — v1.0.0. CLINICAL CONTENT: REVIEWED.
 * Adult medicine ward, north India. Giddiness means different things to different patients;
 * the first job is to separate a spinning sensation, a feeling of about to faint, and
 * unsteadiness. Differentials: benign positional vertigo, vestibular neuritis, posterior
 * circulation stroke, orthostatic hypotension, arrhythmia, anaemia, hypoglycaemia, drugs.
 */
export const giddinessV1: HistoryTree = {
  id: "giddiness",
  version: "1.0.0",
  complaint: "Giddiness",
  triggers: ["giddiness", "dizziness", "vertigo", "light headed", "lightheaded", "spinning", "presyncope", "syncope", "fainting", "blackout"],
  setting: "Adult medicine ward, north India",
  reviewStatus: "reviewed",
  reviewedBy: "Dr. Anubhav, General Surgery — 2026-09-26",
  references: [
    rce("The rational clinical examination. Is this patient having a stroke?", 2005, "15900010"),
    MACLEODS,
    HUTCHISONS,
  ],
  slots: [
    ...commonHpi("giddiness"),
    val("hpi", "quality", "What giddiness means", "Is it a spinning of the room, a feeling of about to faint, or unsteadiness on walking?", ["spinning", "room spinning", "about to faint", "faint", "lightheaded", "light headed", "unsteady", "swaying", "imbalance", "black out"]),
    val("hpi", "pattern", "Constant or in attacks", "Is it constant, or in episodes — and how long does each last (seconds, minutes, hours)?", ["constant", "episodes", "attacks", "seconds", "minutes", "hours", "continuous", "comes and goes"]),
    val("hpi", "trigger", "Trigger", "What brings it on — turning in bed, standing up, head movement, exertion, or nothing?", ["turning in bed", "standing up", "on standing", "head movement", "looking up", "exertion", "no trigger", "rolling over", "bending"]),
    yn("hpi", "loss_of_consciousness", "Loss of consciousness", "Did the patient actually lose consciousness, and for how long?", ["loss of consciousness", "fainted", "blackout", "collapsed", "passed out", "syncope", "fell unconscious"]),
    yn("associated", "nausea_vomiting", "Nausea / vomiting", "Any nausea or vomiting with it?", ["nausea", "vomiting", "vomit"]),
    yn("associated", "hearing", "Hearing loss / tinnitus / ear fullness", "Any hearing loss, ringing in the ear, or a blocked feeling?", ["hearing loss", "tinnitus", "ringing", "ear fullness", "deaf", "blocked ear", "ear discharge"]),
    yn("associated", "palpitations", "Palpitations / chest pain", "Any palpitations, chest pain or breathlessness with the episodes?", ["palpitations", "chest pain", "breathlessness", "racing heart", "irregular heartbeat"]),
    yn("associated", "headache", "Headache", "Any headache with it?", ["headache", "head ache", "neck pain"]),
    yn("associated", "vision", "Visual symptoms", "Any double vision, blurring, or darkening of vision?", ["double vision", "diplopia", "blurring", "darkening", "tunnel vision", "blurred vision"]),
    yn("associated", "fluid_loss", "Fluid loss / poor intake", "Any recent vomiting, loose stools, or poor oral intake?", ["vomiting", "loose stools", "diarrhoea", "poor intake", "not eating", "dehydration", "sweating"]),
    yn("associated", "recent_illness", "Recent cold / ear infection", "Any recent viral illness, cold, or ear infection?", ["cold", "viral", "ear infection", "recent illness", "fever"], { tier: "detailed" }),
    yn("associated", "anxiety", "Anxiety / hyperventilation", "Any anxiety, tingling around the mouth, or fast breathing during the episodes?", ["anxiety", "panic", "tingling", "fast breathing", "hyperventilation", "stress"], { tier: "detailed" }),
    // Red flags
    yn("red_flag", "central_features", "Weakness / speech / double vision / facial change", "Any limb weakness, slurred speech, double vision, facial numbness or difficulty swallowing?", ["weakness", "slurred speech", "slurring", "double vision", "diplopia", "facial numbness", "difficulty swallowing", "dysphagia", "hoarseness"], { teach: "Giddiness with any of these can be the only early sign of a stroke in the back of the brain, and easily dismissed as an ear problem." }),
    yn("red_flag", "sudden_severe_headache", "Sudden severe headache or neck pain", "Did a sudden severe headache or neck pain come with it?", ["sudden headache", "severe headache", "neck pain", "thunderclap", "worst headache"], { teach: "A sudden headache or neck pain with giddiness prompts a question about bleeding or a torn vessel." }),
    yn("red_flag", "cardiac_syncope", "Syncope on exertion / palpitations / chest pain", "Did the patient faint on exertion, lying down, or with palpitations or chest pain?", ["on exertion", "while lying", "palpitations", "chest pain", "syncope", "faint on exertion", "faint while walking"], { teach: "Fainting during exertion, or with palpitations, is asked about because a rhythm or valve problem can stop the blood flowing to the brain." }),
    yn("red_flag", "bleeding_anaemia", "Blood loss / black stools", "Any black stools, blood in stool, vomiting blood, or heavy periods?", ["black stools", "melaena", "blood in stool", "vomiting blood", "heavy periods", "bleeding"], { teach: "Blood loss lowers blood pressure on standing and is a frequent, treatable cause of giddiness." }),
    yn("red_flag", "hypoglycaemia", "Diabetic on treatment / sweating / tremor", "Is the patient diabetic on treatment, with sweating, tremor or hunger during the episodes?", ["diabetic", "insulin", "sweating", "tremor", "hunger", "hypoglycaemia", "sugar low"], { teach: "In a treated diabetic, giddiness with sweating and tremor asks about low sugar before anything else." }),
    yn("red_flag", "new_drug", "New or changed drugs", "Any new or changed antihypertensives, sedatives, antiepileptics, or other regular medicines?", ["antihypertensive", "bp tablets", "sedative", "sleeping pills", "antiepileptic", "new medicine", "dose changed", "diuretic", "amlodipine", "beta blocker"], { teach: "Drug changes are a common and reversible cause, so the medicine list matters more than any test here." }),
    yn("red_flag", "head_injury", "Recent head injury", "Any recent head injury or fall?", ["head injury", "fall", "trauma", "hit head"], { tier: "detailed", teach: "A blow to the head in the past weeks raises a slow bleed inside the skull." }),
    PREGNANCY,
    yn("exposure", "vascular_risk", "Vascular risk factors", "Is the patient hypertensive, diabetic, a smoker, or has atrial fibrillation?", ["hypertension", "diabetes", "smoker", "atrial fibrillation", "af", "high cholesterol", "prior stroke"]),
    yn("exposure", "ear_drugs", "Ototoxic drugs", "Any recent gentamicin, streptomycin, or other injections that can affect hearing?", ["gentamicin", "streptomycin", "aminoglycoside", "injections", "ototoxic"], { tier: "detailed" }),
  ],
  differentials: [
    { id: "bppv", name: "Benign positional vertigo", pointers: ["quality", "trigger", "pattern"], discriminators: ["quality", "trigger", "pattern", "hearing", "nausea_vomiting"] },
    { id: "vestibular_neuritis", name: "Vestibular neuritis / labyrinthitis", pointers: ["quality", "recent_illness", "hearing"], discriminators: ["quality", "pattern", "recent_illness", "hearing", "central_features"] },
    { id: "posterior_stroke", name: "Posterior circulation stroke", pointers: ["central_features", "vascular_risk", "vision"], discriminators: ["central_features", "vascular_risk", "vision", "sudden_severe_headache", "onset_mode"] },
    { id: "orthostatic", name: "Orthostatic hypotension / volume loss", pointers: ["trigger", "fluid_loss", "bleeding_anaemia", "new_drug"], discriminators: ["trigger", "fluid_loss", "bleeding_anaemia", "new_drug", "quality"] },
    { id: "arrhythmia", name: "Arrhythmia / cardiac syncope", pointers: ["cardiac_syncope", "palpitations", "loss_of_consciousness"], discriminators: ["cardiac_syncope", "palpitations", "loss_of_consciousness", "trigger"] },
    { id: "hypoglycaemia", name: "Hypoglycaemia", pointers: ["hypoglycaemia"], discriminators: ["hypoglycaemia", "pattern", "prior_treatment"] },
    { id: "anxiety", name: "Anxiety / hyperventilation", pointers: ["anxiety"], discriminators: ["anxiety", "trigger", "pattern"] },
  ],
  output: {
    durationSlot: "duration",
    hpiOrder: ["onset", "duration", "onset_mode", "quality", "pattern", "trigger", "loss_of_consciousness", "progression", "prior_treatment", "prior_investigations"],
  },
};
