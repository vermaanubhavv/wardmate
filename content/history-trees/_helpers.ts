import type { Reference, Slot, SlotGroup } from "@/lib/history-check/types";

/**
 * Small constructors so a tree file reads as a list of questions rather than a wall of
 * braces. They add nothing the validator does not check — a slot built here is the same
 * plain object as one written out by hand.
 */
type Extra = Partial<Pick<Slot, "numeric" | "tier" | "teach">>;

/** A present / explicitly-absent / not-mentioned item. */
export const yn = (
  group: SlotGroup,
  id: string,
  label: string,
  question: string,
  terms: string[],
  extra: Extra = {}
): Slot => ({ id, group, kind: "yes_no", label, question, terms, ...extra });

/** A slot that carries the resident's own phrase (onset, duration, character…). */
export const val = (
  group: SlotGroup,
  id: string,
  label: string,
  question: string,
  terms: string[],
  extra: Extra = {}
): Slot => ({ id, group, kind: "value", label, question, terms, ...extra });

/** The informant / HPI scaffolding every long case shares. Duration is always "duration". */
export function commonHpi(complaint: string): Slot[] {
  const c = complaint.toLowerCase();
  return [
    val("informant", "informant", "Informant", "Who gave the history — the patient or an attendant?", ["attendant", "informant", "history given by", "relative", "wife", "husband", "son", "daughter", "mother", "father", "patient himself", "patient herself", "bystander"]),
    val("informant", "reliability", "Reliability", "Is the history reliable?", ["reliable", "unreliable", "reliability"], { tier: "detailed" }),
    val("hpi", "onset", "Onset", `When did the ${c} start?`, ["since", "started", "onset", "ago", "from", "began"]),
    val("hpi", "duration", "Duration", `How long has the ${c} been present?`, ["days", "day", "weeks", "week", "months", "month", "hours", "hour", "years", "year", "since", "duration"], { numeric: true }),
    val("hpi", "onset_mode", "Mode of onset", "Was the onset sudden or gradual?", ["sudden", "gradual", "abrupt", "insidious", "acute onset", "over minutes", "over hours"]),
    val("hpi", "progression", "Progression", `Is the ${c} getting better, worse or staying the same?`, ["better", "worse", "same", "improving", "worsening", "increasing", "progressive", "decreasing", "persisting", "progression"]),
    val("hpi", "prior_treatment", "Treatment taken outside", "Was any treatment taken before admission, and did it help?", ["treatment", "took", "taken", "tablets", "injection", "injections", "local doctor", "outside", "medication", "medicines", "self medication", "relieved by"]),
    val("hpi", "prior_investigations", "Tests already done", "Were any tests done before admission, and are the reports available?", ["report", "reports", "test", "tests", "investigation", "investigations", "done outside", "x-ray", "ecg", "ultrasound", "usg", "ct", "cbc", "blood test"]),
  ];
}

/**
 * The background every paediatric history carries and no adult history does: how the child was
 * born, what they have been immunised against, whether they are developing and growing, and
 * what they are fed. All are "value" slots — they record the mother's own words rather than a
 * judgement. Age is deliberately NOT a slot: it comes from the patient record, and only name,
 * age, sex and bed identify a patient.
 */
export function paedBackground(): Slot[] {
  return [
    val("hpi", "birth_history", "Birth history", "Was the child born at term or early, what was the birth weight, was the delivery normal, and did the baby cry immediately?", ["term", "preterm", "premature", "birth weight", "kg", "normal delivery", "caesarean", "lscs", "cried immediately", "did not cry", "nicu", "admitted after birth", "home delivery"], { numeric: true }),
    val("hpi", "immunisation", "Immunisation", "Is immunisation up to date for the age, and is the card available to check?", ["immunisation", "immunization", "vaccination", "vaccinated", "up to date", "card", "bcg", "opv", "pentavalent", "measles", "not vaccinated", "incomplete", "due"]),
    val("hpi", "development", "Development", "Is the child doing the things expected for the age — sitting, walking, speaking, school — and has any skill been lost?", ["milestones", "development", "sitting", "walking", "speaking", "school", "delayed", "normal for age", "lost skills", "regression", "not achieved"]),
    val("hpi", "feeding_nutrition", "Feeding and nutrition", "What is the child eating and drinking, has that changed with this illness, and is breastfeeding still continuing?", ["breastfeeding", "breast milk", "top feed", "formula", "weaning", "eating", "refusing", "reduced feeds", "not feeding", "appetite", "diet"]),
    val("hpi", "growth", "Growth", "Has the child been gaining weight, and is there a growth chart or previous weight to compare with?", ["weight gain", "gaining", "not gaining", "losing weight", "growth chart", "previous weight", "kg", "faltering", "thin"], { numeric: true, tier: "detailed" }),
  ];
}

/** The commonest background red flags that change the reading of any presentation. */
export const IMMUNOCOMPROMISE = yn("red_flag", "immunocompromise", "Immunocompromise", "Is the patient immunocompromised — HIV, steroids, chemotherapy, uncontrolled diabetes, transplant?", ["hiv", "immunocompromised", "immunosuppressed", "steroid", "steroids", "chemotherapy", "chemo", "transplant", "diabetic", "diabetes", "uncontrolled sugars", "cancer", "malignancy"], { teach: "Immunosuppression widens every differential (fungal, opportunistic and atypical infections) and blunts the signs; fever may be the only finding." });

export const PREGNANCY = yn("red_flag", "pregnancy", "Pregnancy / recent delivery", "Is the patient pregnant, or recently delivered or aborted?", ["pregnant", "pregnancy", "lmp", "amenorrhoea", "amenorrhea", "postpartum", "post partum", "delivered", "delivery", "abortion", "miscarriage"], { teach: "Pregnancy and the weeks after delivery add causes (pre-eclampsia, HELLP, sepsis, venous thrombosis) and change which tests and drugs are safe." });

export const rce = (title: string, year: number, pmid?: string): Reference => ({
  title,
  source: "JAMA (Rational Clinical Examination)",
  year,
  ...(pmid ? { pmid } : {}),
});

/** The Annals of Emergency Medicine "Evidence-Based Emergency Medicine / Rational Clinical
 *  Examination abstract" series — a different journal from the JAMA series above, so it is
 *  labelled as its own source rather than folded into rce(). */
export const ebem = (title: string, year: number, pmid?: string): Reference => ({
  title,
  source: "Annals of Emergency Medicine (Evidence-Based EM / Rational Clinical Examination abstract)",
  year,
  ...(pmid ? { pmid } : {}),
});

/** WHO South-East Asia regional guidance. Snakebite is a north-Indian ward reality that the
 *  Anglo-American textbooks barely cover. No year or URL recorded — neither was verified. */
export const WHO_SNAKEBITE: Reference = {
  title: "Guidelines for the management of snakebites",
  source: "WHO Regional Office for South-East Asia (guideline)",
};

export const MACLEODS: Reference = { title: "Macleod's Clinical Examination — history taking and the presenting complaint", source: "Elsevier (textbook)" };
export const HUTCHISONS: Reference = { title: "Hutchison's Clinical Methods — the history and general examination", source: "Elsevier (textbook)" };

export const BATES: Reference = { title: "Bates' Guide to Physical Examination and History Taking", source: "Wolters Kluwer (textbook)" };

/** Specialty texts the ENT, eye, skin, psychiatry and dental trees are built from. No year or
 *  URL recorded — an edition number would date faster than the questions do. */
export const DHINGRA: Reference = { title: "Diseases of Ear, Nose and Throat & Head and Neck Surgery — history taking", source: "Dhingra, Elsevier (textbook)" };
export const PARSONS_EYE: Reference = { title: "Parsons' Diseases of the Eye — symptoms and clinical assessment", source: "Elsevier (textbook)" };
export const IADVL: Reference = { title: "IADVL Textbook of Dermatology — approach to the patient with a skin lesion", source: "Bhalani (textbook)" };
export const KAPLAN_SADOCK: Reference = { title: "Kaplan & Sadock's Synopsis of Psychiatry — the psychiatric interview and risk assessment", source: "Wolters Kluwer (textbook)" };
export const BAILEY_LOVE: Reference = { title: "Bailey & Love's Short Practice of Surgery — history and examination of the surgical patient", source: "CRC Press (textbook)" };

/**
 * The surgical texts. Cited as textbooks, with no PubMed id claimed for any of them —
 * docs/surgical-history.md §1 records what each one is used for.
 */
export const BROWSE: Reference = { title: "Browse's Introduction to the Symptoms and Signs of Surgical Disease", source: "CRC Press (textbook)" };
export const HAMILTON_BAILEY: Reference = { title: "Hamilton Bailey's Demonstrations of Physical Signs in Clinical Surgery", source: "CRC Press (textbook)" };
export const DAS_CLINICAL_SURGERY: Reference = { title: "A Manual on Clinical Surgery — the surgical long case", source: "S. Das (textbook)" };
export const SABISTON: Reference = { title: "Sabiston Textbook of Surgery — preoperative assessment", source: "Elsevier (textbook)" };
export const SCHWARTZ: Reference = { title: "Schwartz's Principles of Surgery — preoperative evaluation and risk", source: "McGraw Hill (textbook)" };
export const ATLS: Reference = { title: "Advanced Trauma Life Support — the AMPLE history", source: "American College of Surgeons (course manual)" };

/**
 * The background a surgical history carries and a medical one does not: what has already been
 * operated on, what happened when it was, and what would have to be known before anyone could
 * take this patient to theatre (docs/surgical-history.md §5).
 *
 * All `exposure` — this is background that changes how the presentation reads, not part of the
 * story of the complaint. Ids are prefixed `surg_` so a tree can carry both these and its own
 * site-specific "previous hernia surgery" question without a clash.
 *
 * `acute` marks the trees where a patient may go to theatre the same day: it promotes the
 * last-meal question from the long case to the ward round. Last meal is deliberately NOT a
 * red flag — a red-flag positive raises the safety level of the whole history, and a patient
 * who has eaten is not a danger signal, only a timing one.
 *
 * Smoking and alcohol are not here: most surgical trees already ask them in their own words,
 * and a second identical question would show up as its own gap.
 */
export function surgicalBackground({ acute = false }: { acute?: boolean } = {}): Slot[] {
  const whenEating: Extra = acute ? {} : { tier: "detailed" };
  return [
    val("exposure", "surg_previous_operations", "Previous operations", "What operations has the patient had before, when, and for what?", ["operation", "operated", "surgery", "laparotomy", "laparoscopy", "appendix removed", "gall bladder removed", "hernia repair", "caesarean", "lscs", "no previous surgery", "never operated"]),
    yn("exposure", "surg_operation_trouble", "Trouble with a previous operation", "Was there any problem during or after a previous operation — heavy bleeding, a second operation, a wound that did not heal, or a stay in intensive care?", ["heavy bleeding", "re operation", "reoperation", "second operation", "wound infection", "wound did not heal", "icu", "intensive care", "ventilator", "prolonged stay", "complication", "no complications"], { tier: "detailed" }),
    yn("exposure", "surg_anaesthetic_problem", "Trouble with anaesthesia", "Was there any trouble with a previous anaesthetic — slow waking, severe vomiting afterwards, or a difficulty the anaesthetist mentioned — or the same in a blood relative?", ["anaesthesia", "anaesthetic", "anesthesia", "did not wake", "delayed recovery", "difficult intubation", "vomiting after surgery", "family", "blood relative", "no problem with anaesthesia"], { teach: "Anaesthetic trouble in the patient or a blood relative changes what the anaesthetist needs to know before the patient goes to theatre." }),
    yn("exposure", "surg_transfusion", "Previous transfusion", "Has the patient ever been given blood, and was there any reaction to it?", ["transfusion", "blood transfusion", "blood given", "packed cells", "reaction", "chills after blood", "no transfusion", "never received blood"]),
    yn("exposure", "surg_blood_thinners", "Blood-thinning or platelet medicine", "Is the patient taking any blood-thinning or platelet medicine?", ["blood thinner", "blood thinners", "anticoagulant", "antiplatelet", "warfarin", "acitrom", "aspirin", "clopidogrel", "heparin", "not on blood thinners"], { teach: "Whether the blood is thinned is asked early because it changes the timing of anything invasive and the reading of any bleeding." }),
    val("exposure", "surg_regular_drugs", "Regular medicines", "What medicines are taken regularly — for sugar, blood pressure, heart, breathing, thyroid or hormones — and any traditional or herbal preparation?", ["regular medicines", "insulin", "metformin", "bp medicine", "blood pressure medicine", "heart medicine", "inhaler", "thyroid", "steroid", "steroids", "hormone", "contraceptive", "ayurvedic", "herbal", "homeopathic", "no regular medicines"]),
    yn("exposure", "surg_allergy", "Drug allergy", "Is the patient allergic to any medicine, and what happened with it?", ["allergy", "allergic", "rash after", "reaction to", "penicillin", "sulpha", "no allergy", "no known allergy"]),
    val("exposure", "surg_exercise_tolerance", "Exercise tolerance", "How much can the patient do without becoming breathless — how many stairs, how far on level ground — and has that changed recently?", ["stairs", "flights", "climbs", "walks", "breathless on walking", "housework", "field work", "reduced", "same as before", "bedbound", "no limitation"], { numeric: true }),
    yn("exposure", "surg_implants", "Implant or device", "Is there any implant or device in the body — a mesh, a joint replacement, a stent, a pacemaker, or metal from an earlier injury?", ["mesh", "implant", "joint replacement", "stent", "pacemaker", "plate", "screws", "metal", "prosthesis", "no implants"], { tier: "detailed" }),
    val("exposure", "surg_last_meal", "Last food and fluid", "When did the patient last eat, and last drink anything?", ["last meal", "last ate", "last food", "last drink", "nil orally", "npo", "empty stomach", "since morning", "hours ago", "nothing since"], { ...whenEating }),
  ];
}
