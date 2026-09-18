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

/** The commonest background red flags that change the reading of any presentation. */
export const IMMUNOCOMPROMISE = yn("red_flag", "immunocompromise", "Immunocompromise", "Is the patient immunocompromised — HIV, steroids, chemotherapy, uncontrolled diabetes, transplant?", ["hiv", "immunocompromised", "immunosuppressed", "steroid", "steroids", "chemotherapy", "chemo", "transplant", "diabetic", "diabetes", "uncontrolled sugars", "cancer", "malignancy"], { teach: "Immunosuppression widens every differential (fungal, opportunistic and atypical infections) and blunts the signs; fever may be the only finding." });

export const PREGNANCY = yn("red_flag", "pregnancy", "Pregnancy / recent delivery", "Is the patient pregnant, or recently delivered or aborted?", ["pregnant", "pregnancy", "lmp", "amenorrhoea", "amenorrhea", "postpartum", "post partum", "delivered", "delivery", "abortion", "miscarriage"], { teach: "Pregnancy and the weeks after delivery add causes (pre-eclampsia, HELLP, sepsis, venous thrombosis) and change which tests and drugs are safe." });

export const rce = (title: string, year: number, pmid?: string): Reference => ({
  title,
  source: "JAMA (Rational Clinical Examination)",
  year,
  ...(pmid ? { pmid } : {}),
});

export const MACLEODS: Reference = { title: "Macleod's Clinical Examination — history taking and the presenting complaint", source: "Elsevier (textbook)" };
export const HUTCHISONS: Reference = { title: "Hutchison's Clinical Methods — the history and general examination", source: "Elsevier (textbook)" };
