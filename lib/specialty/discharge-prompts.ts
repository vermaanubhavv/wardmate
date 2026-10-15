import type { SpecialtyKey, SpecialtyPack } from "./types";
import { hasOperationClock } from "./intake";

/**
 * The discharge summary's AI prompts — one GENERIC prompt per section, and a per-department
 * plugin that fills its department-specific slots.
 *
 * The rules that keep a summary honest (nothing not in the digest, contradictions surfaced not
 * resolved, no invented dates, every investigation line grounded in an observation id) are the
 * same for every department and live only in the builders below. A department contributes just
 * its own words: what the summary is called, the examples that teach the model its vocabulary,
 * the order a course is told in, and any extra rules of its own.
 *
 * Adding a department: add an entry to BY_DEPARTMENT, spreading OPERATIVE or NON_OPERATIVE and
 * overriding only what differs. A department without an entry gets the generic base that fits
 * its clock (it operates, or it does not) — never another department's words.
 *
 * GENERAL_SURGERY reproduces the prompts this app has always sent, byte for byte; a test pins
 * that by hash.
 */
export type DischargePromptWords = {
  /** What the document is: "general-surgery discharge summary", "discharge summary". */
  summary: string;
  /** Rule 4's examples of a digest contradicting itself. */
  contradictionExamples: string;
  /** Rule 5's examples of an abbreviation to expand. */
  abbreviationExamples: string;
  /** Rule 6: what a course covers, in order. */
  courseOrder: string;
  /** Rule 6: an example presenting complaint led by its duration. */
  durationExample: string;
  /** The indication's "requiring [ … ]" options. */
  requiring: string;
  /** Investigations: a normal result that is itself meaningful. */
  normalRelevantExample: string;
  /** Rules of the department's own, added after the shared ones. */
  courseRules?: string[];
  indicationRules?: string[];
  investigationRules?: string[];
};

const GENERAL_SURGERY: DischargePromptWords = {
  summary: "general-surgery discharge summary",
  contradictionExamples:
    "a drain described as removed and also in situ; two different operation dates; a medication both stopped and continued",
  abbreviationExamples: `write "laparoscopic cholecystectomy", not "lap chole"; "nasogastric tube", not "RT"`,
  courseOrder:
    "initial presentation/diagnosis, important initial management, the major intervention or operation, significant post-operative or inpatient events, relevant recovery milestones, and the clinical condition immediately before discharge",
  durationExample: "a 3-day history of pain in the right iliac fossa",
  requiring: "inpatient management / investigation / intervention / surgery",
  normalRelevantExample: "bilirubin normal in a biliary case",
};

/** The generic base for a department that operates (orthopaedics, ENT, urology, …). */
export const OPERATIVE: DischargePromptWords = {
  summary: "discharge summary",
  contradictionExamples:
    "a drain or line described as removed and also in situ; two different operation dates; a medication both stopped and continued",
  abbreviationExamples: `write "nasogastric tube", not "RT"; "open reduction and internal fixation", not "ORIF"`,
  courseOrder:
    "initial presentation/diagnosis, important initial management, the major intervention or operation, significant post-operative or inpatient events, relevant recovery milestones, and the clinical condition immediately before discharge",
  durationExample: "a 3-day history of pain and swelling",
  requiring: "inpatient management / investigation / intervention / surgery",
  normalRelevantExample: "a normal post-operative haemoglobin after a bloody procedure",
};

/** The generic base for a department that does not operate (medicine, paediatrics, …). */
export const NON_OPERATIVE: DischargePromptWords = {
  summary: "discharge summary",
  contradictionExamples:
    "a line or catheter described as removed and also in situ; two different dates for the same event; a medication both stopped and continued",
  abbreviationExamples: `write "nasogastric tube", not "RT"; "chronic kidney disease", not "CKD"`,
  courseOrder:
    "initial presentation/diagnosis, important initial management, any major procedure, significant inpatient events and complications, the response to treatment, and the clinical condition immediately before discharge",
  durationExample: "a 5-day history of fever",
  requiring: "inpatient management / investigation / monitoring / intervention",
  normalRelevantExample: "a normal troponin in a patient admitted with chest pain",
};

/** Departments with words of their own. Everyone else: OPERATIVE or NON_OPERATIVE. */
const BY_DEPARTMENT: Partial<Record<SpecialtyKey, DischargePromptWords>> = {
  general_surgery: GENERAL_SURGERY,
  internal_medicine: {
    ...NON_OPERATIVE,
    summary: "internal-medicine discharge summary",
    abbreviationExamples: `write "community-acquired pneumonia", not "CAP"; "acute kidney injury", not "AKI"`,
    courseRules: [
      "Where the digest records how a deranged value or vital sign responded to treatment (a falling creatinine, settling fever), say so in one clause; do not list every reading.",
    ],
  },
};

export function dischargePromptWordsFor(pack: SpecialtyPack | null | undefined): DischargePromptWords {
  if (!pack) return GENERAL_SURGERY;
  return BY_DEPARTMENT[pack.key] ?? (hasOperationClock(pack) ? OPERATIVE : NON_OPERATIVE);
}

// --- The generic prompts ------------------------------------------------------------------

export const TEMPLATE_RULE = `If a template for the diagnosis is given, write along it: same order, same standard wording. But the template describes the USUAL case, not this patient — keep a template sentence only where the digest supports it, change it where the digest differs, and where the digest is silent on a patient-specific part (a date, a drain day, a finding) write a visible blank "[ … ]" instead of guessing. Never carry a template fact into the text that the digest does not contain.`;

/** A department's extra rules, numbered on from the shared ones. */
const more = (from: number, rules: string[] | undefined) =>
  (rules ?? []).map((r, i) => `\n${from + i}. ${r}`).join("");

export function courseSystem(w: DischargePromptWords): string {
  return `You write the CLINICAL COURSE section of a ${w.summary} for an Indian hospital, from a digest of what was recorded during the admission.

You are SYNTHESISING the admission the digest describes — not copying its lines, not completing it, and not adding to it.

Absolute rules:
1. Never state a diagnosis, investigation, procedure, medication or clinical event that is not in the digest. If the digest does not contain it, it did not happen.
2. Do not turn an uncertain or provisional diagnosis in the digest into a confirmed one.
3. Distinguish documented fact from your own inference. If you must infer to keep the narrative coherent, keep the inference cautious and put anything you are unsure about in uncertain_points instead of asserting it.
4. If the digest contradicts itself (${w.contradictionExamples}), do NOT pick one. State both in uncertain_points and leave the course itself non-committal on that point.
5. Expand no unexplained abbreviations — ${w.abbreviationExamples}. If you cannot expand one safely, keep the digest's exact wording.
6. Be concise and clinically meaningful. One paragraph, roughly 4–7 sentences. Do NOT reproduce every ward-round note. Cover, in order: ${w.courseOrder}. When you state the presenting complaint, lead with its duration ("${w.durationExample}"), using only a duration the digest gives. If the digest carries a "relevant negatives" line, add its main points to the presentation as a single short clause of pertinent negatives — one sentence at most, not a list.
7. Maintain chronological coherence. Use the dates in the digest; do not invent one.
8. Plain professional prose, third person, past tense ("The patient was admitted with…"). No bullet points, no headings.
9. The presentation comes from the "Clinical history" block; the course from the "Progress notes".
10. ${TEMPLATE_RULE}${more(11, w.courseRules)}

Return JSON: { "clinical_course": string, "uncertain_points": string[] }. uncertain_points is [] when the digest is internally consistent and complete enough.`;
}

export function indicationSystem(w: DischargePromptWords): string {
  return `You write the INDICATION FOR ADMISSION line of a ${w.summary}, from a digest of the admission.

It states briefly WHY inpatient admission was required. It must NOT simply repeat the final diagnosis.

Preferred form: "Patient admitted with a [duration] history of [presentation / clinical problem] requiring [${w.requiring}]."

Rules:
1. Use only what the digest contains — presenting complaints, the admission examination, the admitting diagnosis, the initial plan. Never invent a symptom, a sign or a duration.
2. When the digest gives a duration for the presenting complaint, lead with it ("a 3-day history of..."). Omit the duration only when the digest does not state one.
3. One or two sentences. No abbreviations that are not expanded.
4. If the digest holds nothing about the presentation (only a bare diagnosis), say so by returning an empty string rather than padding it.
5. ${TEMPLATE_RULE}${more(6, w.indicationRules)}

Return JSON: { "indication": string }.`;
}

export function investigationsSystem(w: DischargePromptWords): string {
  return `You select and summarise the CLINICALLY RELEVANT investigation results for a ${w.summary}, from a list of every investigation observation recorded during the admission.

The point of this section is to be SHORT and MEANINGFUL. Do not reproduce whole panels. Propose only results that matter to someone reading this summary after discharge:
- important diagnostic findings
- significant abnormalities, and significant trends (e.g. a falling white count, a resolving derangement)
- results that changed management
- relevant imaging and microbiology findings
- an important NORMAL result where its normality is itself clinically meaningful (e.g. ${w.normalRelevantExample})

Distinguish "abnormal" from "clinically relevant" — a single mildly abnormal value that led to nothing is not relevant and should be left out.

Absolute rules:
1. Every proposed line MUST be built only from the observations given. Put the id(s) of the observation(s) each line is based on in source_observation_ids. A line you cannot ground in a given observation must not be produced.
2. Never invent a value, a date or a trend. If two readings of the same test are given, you may describe the trend between them; if only one is given, you may not.
3. Do not expand unexplained abbreviations unsafely; keep the report's own wording where unsure.
4. interpretation is optional and cautious — a short reading of the result, not a diagnosis.${more(5, w.investigationRules)}

Return JSON: { "items": [ { "group": string, "text": string, "interpretation": string|null, "significance": string, "source_observation_ids": string[] } ] }.
group is the test family ("CBC", "LFT", "Ultrasound Abdomen", "Blood Culture"). significance is one of "diagnostic", "abnormal", "trend", "management", "normal-relevant".`;
}
