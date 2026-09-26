import type { HistoryTree } from "@/lib/history-check/types";
import { commonHpi, IMMUNOCOMPROMISE, MACLEODS, PREGNANCY, rce, val, yn } from "@/content/history-trees/_helpers";

/**
 * HEADACHE — v1.0.0. CLINICAL CONTENT: REVIEWED.
 * Adult medicine ward, north India. Differentials: migraine, tension-type headache,
 * meningitis / encephalitis (including tuberculous), subarachnoid haemorrhage, raised
 * intracranial pressure (mass, hydrocephalus, venous sinus thrombosis), hypertensive
 * emergency, sinusitis, temporal arteritis, medication-overuse, cluster headache.
 */
export const headacheV1: HistoryTree = {
  id: "headache",
  version: "1.0.0",
  complaint: "Headache",
  triggers: ["headache", "head ache", "head pain", "pain in head", "migraine"],
  setting: "Adult medicine ward, north India",
  reviewStatus: "reviewed",
  reviewedBy: "Dr. Anubhav, General Surgery — 2026-09-26",
  references: [
    rce("Does this patient with headache have a migraine or need neuroimaging?", 2006, "16968852"),
    rce("The rational clinical examination. Does this adult patient have acute meningitis?", 1999, "10411200"),
    rce("Is this patient having a stroke?", 2005, "15900010"),
    rce("Does this patient have a hemorrhagic stroke? Clinical findings distinguishing hemorrhagic stroke from ischemic stroke", 2010),
    MACLEODS,
  ],
  slots: [
    ...commonHpi("headache"),
    val("hpi", "site", "Site", "Where is the headache — one side, both sides, frontal, occipital, whole head?", ["one side", "unilateral", "both sides", "bilateral", "frontal", "forehead", "occipital", "back of head", "temporal", "whole head", "vertex", "band like", "site"]),
    val("hpi", "character", "Character", "Is it throbbing, pressing, stabbing, or dull?", ["throbbing", "pulsating", "pressing", "tight", "band", "stabbing", "dull", "aching", "bursting", "heaviness"]),
    val("hpi", "severity", "Severity", "How severe is it, and is this the worst headache ever?", ["severe", "mild", "moderate", "worst", "worst ever", "worst headache", "10/10", "out of 10", "severity"], { numeric: true }),
    val("hpi", "time_to_peak", "Time to peak", "How quickly did it reach maximum — seconds, minutes, or hours?", ["seconds", "within a minute", "minutes", "hours", "peak", "maximum", "instantly", "thunderclap", "sudden", "gradual"]),
    val("hpi", "pattern", "Pattern / frequency", "Is it continuous or in attacks — how often and how long does each last?", ["attacks", "episodes", "episodic", "continuous", "daily", "frequency", "lasting", "lasts", "hours", "days", "times a month", "times a week"]),
    val("hpi", "timing", "Timing / posture", "Is it worse in the early morning, on lying down, on waking, or on standing?", ["morning", "early morning", "on waking", "lying down", "on standing", "standing", "night", "wakes from sleep", "posture", "postural"]),
    val("hpi", "aggravating", "Aggravating factors", "Is it worse on coughing, straining, bending, exertion, light or noise?", ["coughing", "straining", "bending", "exertion", "light", "noise", "photophobia", "phonophobia", "movement", "valsalva", "stress", "fasting", "sleep"]),
    val("hpi", "relieving", "Relieving factors", "What relieves it — sleep, dark room, painkillers, vomiting?", ["sleep", "dark room", "rest", "painkillers", "relieved by", "after vomiting", "pressure", "relief"]),
    yn("hpi", "aura", "Aura", "Any visual disturbance, flashing lights, zigzag lines, or numbness before the headache?", ["aura", "flashing lights", "zigzag", "visual disturbance", "scotoma", "numbness before", "tingling before", "blurring before"]),
    yn("associated", "nausea_vomiting", "Nausea / vomiting", "Any nausea or vomiting, and is the vomiting projectile or early-morning?", ["nausea", "vomiting", "vomit", "vomited", "projectile", "early morning vomiting"]),
    yn("associated", "photophobia", "Photophobia / phonophobia", "Any intolerance of light or sound?", ["photophobia", "phonophobia", "light", "sound", "noise", "bright light"]),
    yn("associated", "fever", "Fever", "Any fever?", ["fever", "febrile", "temperature", "chills", "rigors"]),
    yn("associated", "visual_symptoms", "Visual symptoms", "Any blurring, double vision, transient loss of vision, or field loss?", ["blurring", "blurred vision", "double vision", "diplopia", "loss of vision", "vision loss", "transient visual", "field", "dimness"]),
    yn("associated", "nasal_symptoms", "Nasal / facial symptoms", "Any nasal discharge, nasal block, facial pain or tooth pain?", ["nasal discharge", "nasal block", "blocked nose", "facial pain", "sinus", "tooth pain", "cheek pain"], { tier: "detailed" }),
    yn("associated", "eye_symptoms", "Eye redness / watering / eye pain", "Any red, watering eye or eye pain with the headache?", ["red eye", "watering", "eye pain", "lacrimation", "ptosis", "drooping"], { tier: "detailed" }),
    yn("associated", "jaw_claudication_scalp", "Jaw claudication / scalp tenderness", "Any jaw pain on chewing or scalp tenderness (in the elderly)?", ["jaw claudication", "jaw pain on chewing", "chewing", "scalp tenderness", "temporal tenderness"], { tier: "detailed" }),
    yn("associated", "analgesic_overuse", "Analgesic use", "How often are painkillers being taken (more than 10 to 15 days a month)?", ["painkillers", "analgesics", "daily painkillers", "paracetamol", "every day", "days a month", "overuse"], { tier: "detailed" }),
    yn("associated", "family_history", "Family history of headache", "Any family history of migraine?", ["family history", "mother", "father", "migraine in family", "sibling"], { tier: "detailed" }),
    yn("associated", "sleep_stress", "Sleep / stress / screen", "Any recent sleep disturbance, stress, or prolonged screen use?", ["sleep", "stress", "screen", "mobile", "tension", "anxiety", "workload"], { tier: "detailed" }),
    // Red flags
    yn("red_flag", "thunderclap", "Thunderclap onset", "Did it reach maximum within seconds to a minute (thunderclap)?", ["thunderclap", "within seconds", "seconds", "instantly", "sudden severe", "like a blow", "worst headache", "hit on the head"], { teach: "A headache that peaked within a minute is subarachnoid haemorrhage until proven otherwise; the time to peak is the single most useful question." }),
    yn("red_flag", "neck_stiffness", "Neck stiffness", "Any neck stiffness or pain on bending the neck?", ["neck stiffness", "stiff neck", "neck rigidity", "neck pain", "cannot bend neck"], { teach: "Neck stiffness with headache points to meningitis or blood in the subarachnoid space." }),
    yn("red_flag", "altered_sensorium", "Altered sensorium / behaviour change", "Any drowsiness, confusion, irritability or behaviour change?", ["drowsy", "drowsiness", "confused", "confusion", "altered sensorium", "irritable", "behaviour change", "irrelevant talk", "disoriented", "unconscious"], { teach: "Drowsiness or confusion with headache means the brain is involved, not just the head." }),
    yn("red_flag", "seizure", "Seizure", "Any seizure or fit?", ["seizure", "seizures", "fit", "fits", "convulsion", "convulsions"], { teach: "A seizure with headache points to a structural or infective cause rather than migraine." }),
    yn("red_flag", "focal_deficit", "Focal weakness / speech / gait", "Any weakness of a limb, facial deviation, slurred speech, or unsteadiness?", ["weakness", "paralysis", "hemiparesis", "facial deviation", "slurred speech", "slurring", "unsteady", "imbalance", "ataxia", "numbness", "difficulty walking"], { teach: "Weakness, speech disturbance or unsteadiness with headache points to a stroke, a mass or venous sinus thrombosis." }),
    yn("red_flag", "new_or_changed", "New pattern / changed headache", "Is this a new type of headache, or a change from the usual pattern?", ["new", "first time", "never before", "different from usual", "changed", "change in pattern", "new headache"], { teach: "A new type of headache, or a change in a familiar pattern, is what separates the chronic headache patient who needs imaging from the one who does not." }),
    yn("red_flag", "positional_pressure", "Postural / raised-pressure features", "Is it worse lying down, on coughing or straining, or does it wake the patient from sleep?", ["worse lying down", "lying down", "coughing", "straining", "wakes from sleep", "wakes up", "early morning", "projectile"], { teach: "Worse lying down, on coughing or straining, or waking the patient from sleep are the features of raised intracranial pressure." }),
    yn("red_flag", "head_injury", "Recent head injury / anticoagulants", "Any head injury recently, or is the patient on blood thinners?", ["head injury", "trauma", "fall", "hit", "blood thinner", "anticoagulant", "warfarin", "aspirin", "clopidogrel"], { teach: "A fall or blow in the past weeks, especially on blood thinners, raises a subdural haematoma." }),
    yn("red_flag", "hypertension", "Hypertension", "Is the patient hypertensive, and was a high reading recorded?", ["hypertension", "hypertensive", "blood pressure", "bp", "high bp", "raised bp"], { teach: "A very high blood pressure with headache and visual symptoms is hypertensive emergency territory." }),
    yn("red_flag", "age_over_50_new", "Age over 50 with new headache", "Is the patient over 50 with a new headache?", ["over 50", "elderly", "age", "50 years", "60 years", "new onset"], { tier: "detailed", teach: "A new headache after fifty raises temporal arteritis and a space-occupying lesion, neither of which is common in the young." }),
    PREGNANCY,
    IMMUNOCOMPROMISE,
    // Exposures
    yn("exposure", "tb_contact", "TB contact / past TB", "Any past tuberculosis or contact (tuberculous meningitis)?", ["tb", "tuberculosis", "koch", "att", "akt", "tb contact", "past tb"]),
    yn("exposure", "ear_sinus_infection", "Ear / sinus / dental infection", "Any recent ear discharge, sinusitis or dental infection?", ["ear discharge", "ear infection", "otitis", "sinusitis", "dental", "tooth abscess"], { tier: "detailed" }),
    yn("exposure", "oral_contraceptives", "Oral contraceptives / postpartum", "Any oral contraceptive use, recent delivery, or dehydration (venous sinus thrombosis)?", ["oral contraceptive", "ocp", "contraceptive pills", "postpartum", "recently delivered", "dehydration"], { tier: "detailed" }),
  ],
  differentials: [
    { id: "migraine", name: "Migraine", pointers: ["character", "photophobia", "nausea_vomiting", "aura", "family_history"], discriminators: ["site", "character", "pattern", "photophobia", "nausea_vomiting", "aura", "relieving", "family_history", "analgesic_overuse"] },
    { id: "tension", name: "Tension-type headache", pointers: ["character", "sleep_stress"], discriminators: ["character", "site", "sleep_stress", "photophobia", "analgesic_overuse"] },
    { id: "meningitis", name: "Meningitis / encephalitis", pointers: ["fever", "neck_stiffness", "altered_sensorium", "seizure"], discriminators: ["fever", "neck_stiffness", "altered_sensorium", "seizure", "photophobia", "tb_contact", "ear_sinus_infection", "immunocompromise"] },
    { id: "sah", name: "Subarachnoid haemorrhage", pointers: ["thunderclap", "time_to_peak", "neck_stiffness"], discriminators: ["thunderclap", "time_to_peak", "neck_stiffness", "altered_sensorium", "severity", "head_injury"] },
    { id: "raised_icp", name: "Raised intracranial pressure (mass / hydrocephalus / venous thrombosis)", pointers: ["positional_pressure", "timing", "visual_symptoms", "focal_deficit"], discriminators: ["positional_pressure", "timing", "visual_symptoms", "focal_deficit", "nausea_vomiting", "progression", "oral_contraceptives", "new_or_changed"] },
    { id: "hypertensive", name: "Hypertensive emergency", pointers: ["hypertension", "visual_symptoms"], discriminators: ["hypertension", "visual_symptoms", "altered_sensorium", "seizure", "pregnancy"] },
    { id: "sinusitis", name: "Sinusitis", pointers: ["nasal_symptoms", "fever"], discriminators: ["nasal_symptoms", "fever", "site", "aggravating"] },
    { id: "temporal_arteritis", name: "Temporal arteritis", pointers: ["jaw_claudication_scalp", "age_over_50_new", "visual_symptoms"], discriminators: ["jaw_claudication_scalp", "age_over_50_new", "visual_symptoms", "site"] },
    { id: "medication_overuse", name: "Medication-overuse headache", pointers: ["analgesic_overuse", "pattern"], discriminators: ["analgesic_overuse", "pattern", "timing"] },
    { id: "cluster", name: "Cluster headache", pointers: ["eye_symptoms", "site", "pattern"], discriminators: ["eye_symptoms", "site", "pattern", "timing"] },
  ],
  output: {
    durationSlot: "duration",
    hpiOrder: ["onset", "duration", "onset_mode", "site", "character", "severity", "time_to_peak", "pattern", "timing", "aggravating", "relieving", "aura", "progression", "prior_treatment", "prior_investigations"],
  },
};
