import type { HistoryTree } from "@/lib/history-check/types";
import { commonHpi, MACLEODS, rce, val, yn } from "@/content/history-trees/_helpers";

/**
 * GIDDINESS / VERTIGO — v1.0.0. CLINICAL CONTENT: PENDING CLINICIAN REVIEW.
 * Differentials: benign paroxysmal positional vertigo, vestibular neuritis / labyrinthitis,
 * Meniere's disease, posterior circulation stroke / TIA, vestibular migraine, orthostatic
 * hypotension, cardiac presyncope, drug-induced, anaemia / hypoglycaemia, anxiety.
 */
export const vertigoV1: HistoryTree = {
  id: "vertigo",
  version: "1.0.0",
  complaint: "Giddiness / vertigo",
  triggers: ["giddiness", "giddy", "vertigo", "dizziness", "dizzy", "spinning", "chakkar", "imbalance", "unsteadiness", "light headedness", "lightheadedness", "reeling"],
  setting: "Adult medicine ward, north India",
  reviewStatus: "pending_clinician_review",
  reviewedBy: null,
  references: [
    rce("Does this dizzy patient have a serious form of vertigo?", 1994, "8309034"),
    { title: "HINTS to diagnose stroke in the acute vestibular syndrome", source: "Stroke", year: 2009, pmid: "19762709" },
    { title: "Clinical practice guideline: benign paroxysmal positional vertigo (update)", source: "Otolaryngol Head Neck Surg", year: 2017, pmid: "28248609" },
    MACLEODS,
  ],
  slots: [
    ...commonHpi("giddiness"),
    val("hpi", "quality", "What the patient means", "Is it a spinning of the surroundings, a feeling of about to faint, unsteadiness on walking, or a vague light-headedness?", ["spinning", "rotating", "surroundings moving", "vertigo", "about to faint", "faint", "black out", "unsteady", "unsteadiness", "imbalance", "light headed", "floating", "vague", "quality", "feels like"]),
    val("hpi", "timing", "Timing — episodic or continuous", "Is it continuous or in episodes, and how long does each episode last — seconds, minutes, hours, or days?", ["continuous", "constant", "episodes", "episodic", "seconds", "minutes", "hours", "days", "lasts", "lasting", "attacks"], { numeric: true }),
    val("hpi", "triggers", "Triggers", "What brings it on — turning in bed, looking up, standing up, head movement, loud sound, or nothing?", ["turning in bed", "rolling", "looking up", "bending", "standing up", "getting up", "head movement", "moving the head", "loud sound", "spontaneous", "nothing", "trigger", "brought on", "lying down"]),
    yn("hpi", "nausea_vomiting", "Nausea / vomiting", "Any nausea or vomiting with the episodes?", ["nausea", "vomiting", "vomit", "sick"]),
    val("hpi", "walking", "Ability to walk", "Can the patient walk unaided during an episode, or do they fall to one side?", ["walk", "walking", "unaided", "cannot walk", "falls", "fall to", "one side", "veers", "support", "bedbound"]),
    yn("hpi", "hearing_tinnitus", "Hearing loss / ringing / ear fullness", "Any hearing loss, ringing in the ear, or fullness of the ear, and on which side?", ["hearing loss", "deafness", "hearing", "ringing", "tinnitus", "fullness", "blocked ear", "ear", "one side"]),
    yn("hpi", "ear_discharge_pain", "Ear discharge / ear pain", "Any ear discharge or ear pain, now or in the past?", ["ear discharge", "discharge", "ear pain", "otitis", "pus from ear", "chronic ear"], { tier: "detailed" }),
    yn("hpi", "recent_infection", "Recent viral illness", "Any cold, sore throat, or fever in the days before it started?", ["cold", "sore throat", "fever", "viral", "flu", "days before", "upper respiratory"], { tier: "detailed" }),
    yn("hpi", "previous_episodes", "Previous episodes", "Has this happened before, and was a cause found?", ["previous", "before", "earlier", "recurrent", "episodes", "first time", "diagnosed"], { tier: "detailed" }),
    // Associated
    yn("associated", "headache", "Headache", "Any headache with the giddiness, especially new or at the back of the head?", ["headache", "head pain", "occipital", "back of the head", "migraine"]),
    yn("associated", "visual_symptoms", "Double vision / visual loss / light sensitivity", "Any double vision, loss of vision, or sensitivity to light and sound?", ["double vision", "diplopia", "loss of vision", "blurring", "photophobia", "phonophobia", "light", "sound"]),
    yn("associated", "palpitations_chest", "Palpitations / chest pain", "Any palpitations or chest pain with the episodes?", ["palpitations", "chest pain", "racing", "irregular"]),
    yn("associated", "postural", "Worse on standing", "Is it worse on standing up from lying or sitting?", ["standing", "getting up", "on standing", "postural", "orthostatic", "from bed"]),
    yn("associated", "anxiety_hyperventilation", "Anxiety / breathing fast / tingling", "Any anxiety, fast breathing, or tingling of the hands and lips with the episodes?", ["anxiety", "anxious", "panic", "fast breathing", "hyperventilat", "tingling", "fear"], { tier: "detailed" }),
    yn("associated", "pallor_blood_loss", "Pallor / blood loss / poor intake", "Any pallor, blood loss, poor intake, or recent diarrhoea and vomiting?", ["pallor", "pale", "anaemia", "blood loss", "bleeding", "poor intake", "diarrhoea", "dehydrat", "not eating"], { tier: "detailed" }),
    yn("associated", "diabetes_sugar", "Diabetes on treatment / sweating with hunger", "Is the patient a treated diabetic, and does the giddiness come with sweating and hunger?", ["diabetic", "diabetes", "insulin", "sweating", "hunger", "sugar low", "hypoglycaemia"], { tier: "detailed" }),
    // Red flags
    yn("red_flag", "focal_neuro", "Focal neurological symptoms", "Any weakness, numbness, slurred speech, difficulty swallowing, or clumsiness of a limb?", ["weakness", "numbness", "slurred", "slurring", "speech", "swallowing", "dysphagia", "clumsy", "clumsiness", "incoordination", "facial", "hiccups"], { teach: "Vertigo with any brainstem or cerebellar symptom is a posterior circulation stroke until imaged; the ear is the last thing to blame." }),
    yn("red_flag", "sudden_persistent_unable_to_walk", "Sudden, persistent, and unable to stand", "Did it start suddenly, persist for hours to days, and leave the patient unable to stand or walk unaided?", ["sudden", "suddenly", "persistent", "continuous", "hours", "days", "cannot stand", "cannot walk", "unable to walk", "falls"], { teach: "Inability to stand without support in a continuous vertigo points to the cerebellum rather than the labyrinth; peripheral vertigo lets the patient walk, however miserably." }),
    yn("red_flag", "new_headache_neck_pain", "New severe headache or neck pain", "Any new severe headache or neck pain with the giddiness?", ["severe headache", "new headache", "neck pain", "occipital", "worst headache", "thunderclap"], { teach: "Neck pain with vertigo raises vertebral artery dissection, especially in the young after neck manipulation or trauma." }),
    yn("red_flag", "vascular_risk", "Vascular risk factors", "Is the patient over 60, or hypertensive, diabetic, a smoker, or known to have heart disease or atrial fibrillation?", ["over 60", "elderly", "hypertension", "hypertensive", "diabetes", "diabetic", "smoker", "smoking", "heart disease", "atrial fibrillation", "af", "stroke before"], { teach: "In an older patient with vascular risk factors, an isolated vertigo is a stroke in a meaningful minority; the risk profile changes the threshold for imaging." }),
    yn("red_flag", "syncope_palpitations", "Fainting or palpitations", "Has the patient fainted, or had palpitations with the episodes?", ["fainted", "fainting", "syncope", "blackout", "palpitations", "collapse"], { teach: "Giddiness that ends in a faint or comes with palpitations belongs to the heart; the syncope tree applies." }),
    yn("red_flag", "hearing_loss_sudden", "Sudden hearing loss", "Has there been sudden hearing loss in one ear?", ["sudden hearing loss", "sudden deafness", "cannot hear", "hearing loss", "one ear"], { teach: "Sudden sensorineural hearing loss with vertigo is an emergency in its own right and also occurs with a labyrinthine stroke." }),
    yn("red_flag", "drugs_ototoxic", "Drugs", "Any antihypertensives, sedatives, anticonvulsants, aminoglycoside injections, or recent new drugs?", ["antihypertensive", "bp tablets", "sedative", "sleeping pills", "phenytoin", "carbamazepine", "gentamicin", "streptomycin", "amikacin", "injections", "new drug", "medication"], { teach: "Drug-induced giddiness is the commonest reversible cause in the elderly, and aminoglycoside injections given elsewhere destroy the vestibule silently." }),
    // Exposures
    yn("exposure", "head_injury_neck_manipulation", "Head injury / neck manipulation", "Any recent head injury, or neck manipulation, massage, or yoga?", ["head injury", "trauma", "fall", "neck manipulation", "massage", "chiropract", "yoga", "neck twist"], { tier: "detailed" }),
    yn("exposure", "alcohol", "Alcohol", "Any alcohol use, or recent binge?", ["alcohol", "drinks", "binge", "drunk", "liquor"], { tier: "detailed" }),
    yn("exposure", "migraine_history", "Migraine history / family history", "Any history of migraine in the patient or family?", ["migraine", "family history", "headaches since", "mother", "father"], { tier: "detailed" }),
  ],
  differentials: [
    { id: "bppv", name: "Benign paroxysmal positional vertigo", pointers: ["triggers", "timing", "quality"], discriminators: ["triggers", "timing", "quality", "hearing_tinnitus", "walking", "focal_neuro", "previous_episodes"] },
    { id: "vestibular_neuritis", name: "Vestibular neuritis / labyrinthitis", pointers: ["quality", "timing", "recent_infection", "nausea_vomiting"], discriminators: ["quality", "timing", "recent_infection", "nausea_vomiting", "hearing_tinnitus", "walking", "focal_neuro", "sudden_persistent_unable_to_walk"] },
    { id: "menieres", name: "Meniere's disease", pointers: ["hearing_tinnitus", "timing", "previous_episodes"], discriminators: ["hearing_tinnitus", "timing", "previous_episodes", "ear_discharge_pain", "nausea_vomiting", "quality"] },
    { id: "posterior_stroke", name: "Posterior circulation stroke / TIA", pointers: ["focal_neuro", "sudden_persistent_unable_to_walk", "vascular_risk", "new_headache_neck_pain"], discriminators: ["focal_neuro", "sudden_persistent_unable_to_walk", "vascular_risk", "new_headache_neck_pain", "hearing_loss_sudden", "visual_symptoms", "walking", "head_injury_neck_manipulation"] },
    { id: "vestibular_migraine", name: "Vestibular migraine", pointers: ["headache", "visual_symptoms", "migraine_history", "timing"], discriminators: ["headache", "visual_symptoms", "migraine_history", "timing", "hearing_tinnitus", "previous_episodes"] },
    { id: "orthostatic", name: "Orthostatic hypotension", pointers: ["postural", "quality", "drugs_ototoxic", "pallor_blood_loss"], discriminators: ["postural", "quality", "drugs_ototoxic", "pallor_blood_loss", "timing", "syncope_palpitations"] },
    { id: "cardiac", name: "Cardiac presyncope / arrhythmia", pointers: ["syncope_palpitations", "palpitations_chest", "quality"], discriminators: ["syncope_palpitations", "palpitations_chest", "quality", "vascular_risk", "postural", "triggers"] },
    { id: "drug_induced", name: "Drug-induced", pointers: ["drugs_ototoxic", "alcohol"], discriminators: ["drugs_ototoxic", "alcohol", "postural", "hearing_tinnitus", "timing"] },
    { id: "metabolic", name: "Anaemia / hypoglycaemia", pointers: ["pallor_blood_loss", "diabetes_sugar"], discriminators: ["pallor_blood_loss", "diabetes_sugar", "quality", "postural", "timing"] },
    { id: "anxiety", name: "Anxiety / hyperventilation", pointers: ["anxiety_hyperventilation", "quality"], discriminators: ["anxiety_hyperventilation", "quality", "timing", "triggers", "focal_neuro", "previous_episodes"] },
  ],
  output: {
    durationSlot: "duration",
    hpiOrder: ["onset", "duration", "onset_mode", "quality", "timing", "triggers", "nausea_vomiting", "walking", "hearing_tinnitus", "ear_discharge_pain", "recent_infection", "previous_episodes", "progression", "prior_treatment", "prior_investigations"],
  },
};
