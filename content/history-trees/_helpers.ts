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
