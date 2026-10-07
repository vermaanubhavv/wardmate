import type { DischargeContext } from "@/lib/discharge-data";
import type { DischargeDraft, DischargeSectionId } from "@/lib/discharge-entities";
import { ALL_CONDITION_VARIABLES } from "@/lib/discharge-entities";
import { dischargeProfileFor } from "@/lib/specialty/discharge";
import { dateAnchors, structuredDateQuestions } from "@/lib/date-check";

/**
 * The completeness and consistency checks the protocol (section 16) requires before a discharge
 * summary can be finalised.
 *
 * `blocking` checks stop finalisation — the high-priority list. `warnings` are shown but do not
 * block: the resident may have a reason the check cannot see.
 *
 * Pure, and deliberately conservative — every check is something a reader of the finished
 * summary could point at and say "this is missing" or "these two lines disagree". No allergy
 * checks in v1 (protocol section 16).
 *
 * The check needs a few facts from the record beyond the draft itself; `DischargeCheckContext`
 * is exactly those, so the check can also run in the browser as the resident edits — see
 * buildCheckContext().
 */

export type DischargeCheck = {
  id: string;
  severity: "blocking" | "warning";
  section: DischargeSectionId;
  message: string;
};

export type DischargeCheckResult = {
  blocking: DischargeCheck[];
  warnings: DischargeCheck[];
};

export type DischargeCheckContext = {
  /** Distinct medications recorded on the round — a discharge list of zero against this being
   *  non-zero is a blocking gap. */
  activeMedicationCount: number;
  /** A follow-up is mentioned in an open job on the record. */
  followUpInOpenTasks: boolean;
  /** Drain observations still reading as in situ (not removed). */
  drainInSituOnRecord: boolean;
  /** Condition-at-Discharge variables that must be set, per the unit (lib/specialty/discharge.ts).
   *  Absent = 5, the surgical rule. */
  conditionMinimum?: number;
};

export function buildCheckContext(context: DischargeContext): DischargeCheckContext {
  const FOLLOW_UP_MENTION = /\b(opd|follow[\s-]?up|review|clinic|come back|revisit)\b/i;
  return {
    activeMedicationCount: context.medications.length,
    followUpInOpenTasks: context.patientState.openTasks.some((t) =>
      FOLLOW_UP_MENTION.test(t.value_text ?? t.label)
    ),
    drainInSituOnRecord: drainStillIn(context.observations),
    conditionMinimum: dischargeProfileFor(context.pack).conditionMinimum,
  };
}

/**
 * Whether the record shows a drain still in, judged on the latest drain observation only:
 * POD 1's "drain serous" is superseded by POD 3's "drain removed", and "No drain" / "nil" never
 * meant one was in.
 * ponytail: latest drain line wins; two drains with one removed reads as removed — add per-drain
 * tracking if units document drains separately.
 */
export function drainStillIn(observations: { kind: string; label: string; value_text: string | null; recorded_at: string }[]): boolean {
  const DRAIN_REMOVED = /\b(removed|out|taken out|de-?roof|no drain|nil)\b/i;
  const latest = observations
    .filter((o) => o.kind === "drain" || /drain/i.test(o.label))
    .sort((a, b) => b.recorded_at.localeCompare(a.recorded_at))[0];
  return !!latest && !DRAIN_REMOVED.test(`${latest.label} ${latest.value_text ?? ""}`);
}

/** A template blank — `[ … ]` — still in the text. Defaults print as written, so a blank left
 *  prints visibly unfinished; this names the sections that still carry one. */
export function sectionsWithBlanks(texts: [DischargeSectionId, string][]): DischargeSectionId[] {
  const BLANK = /\[[^\]]*\]/;
  return [...new Set(texts.filter(([, t]) => BLANK.test(t)).map(([id]) => id))];
}

const NSAID = /\b(diclofenac|ibuprofen|aceclofenac|naproxen|ketorolac|etoricoxib|piroxicam|mefenamic|indomethacin|nimesulide)\b/i;
const THINNER = /\b(enoxaparin|heparin|warfarin|acitrom|acenocoumarol|apixaban|rivaroxaban|dabigatran|clopidogrel|aspirin)\b/i;
const GI_RISK = /perforat|peptic|\bulcer\b|ha?ematemesis|mela?ena|gi bleed|varic/i;

/** An NSAID on the discharge list beside a blood thinner, or after a peptic ulcer, a perforation
 *  or a GI bleed (Schwartz 11e ch. 26). Warnings only — the resident may have a reason. */
export function nsaidConcerns(
  medications: { generic: string; status: string }[],
  diagnoses: { text: string }[]
): string[] {
  const live = medications.filter((m) => m.status !== "stopped");
  const nsaid = live.find((m) => NSAID.test(m.generic));
  if (!nsaid) return [];
  const out: string[] = [];
  if (live.some((m) => m !== nsaid && THINNER.test(m.generic))) {
    out.push(`${nsaid.generic} is listed with a blood thinner — check the bleeding risk.`);
  }
  if (diagnoses.some((d) => GI_RISK.test(d.text))) {
    out.push(`${nsaid.generic} is listed after a peptic ulcer, perforation or GI bleed — check it is intended.`);
  }
  return out;
}

const FOLLOW_UP_MENTION = /\b(opd|follow[\s-]?up|review|clinic|come back|revisit)\b/i;
const DRAIN_MENTION = /\bdrain\b/i;
const DRAIN_REMOVED_IN_TEXT = /\bdrain\b[^.]*\b(removed|out|taken out)\b|\b(removed|took out)\b[^.]*\bdrain\b/i;

function conditionComplete(draft: DischargeDraft, minimum: number): boolean {
  const set = ALL_CONDITION_VARIABLES.filter((v) => {
    const val = draft.conditionAtDischarge.vars[v.key];
    return val === true || (typeof val === "string" && val.trim().length > 0);
  }).length;
  return set >= minimum || !!draft.conditionAtDischarge.freeText?.trim();
}

export function runDischargeChecks(
  draft: DischargeDraft,
  checkContext: DischargeCheckContext
): DischargeCheckResult {
  const blocking: DischargeCheck[] = [];
  const warnings: DischargeCheck[] = [];
  const block = (id: string, section: DischargeSectionId, message: string) =>
    blocking.push({ id, severity: "blocking", section, message });
  const warn = (id: string, section: DischargeSectionId, message: string) =>
    warnings.push({ id, severity: "warning", section, message });

  // --- Clinical Course -----------------------------------------------------------------
  const course = draft.clinicalCourse;
  if (!course.text.trim()) {
    block("course-missing", "clinicalCourse", "Clinical Course is empty. It is mandatory.");
  } else if (!course.approvedAt) {
    block("course-unapproved", "clinicalCourse", "Clinical Course has not been approved. Review it and approve before finalising.");
  }
  if (course.uncertainPoints.length > 0) {
    warn(
      "course-uncertain",
      "clinicalCourse",
      `The AI flagged ${course.uncertainPoints.length} point(s) it could not resolve — check the Clinical Course against the record.`
    );
  }

  // --- Diagnosis ----------------------------------------------------------------------
  if (!draft.diagnoses.some((d) => d.category === "primary" && d.text.trim())) {
    block("primary-diagnosis-missing", "diagnoses", "No primary diagnosis is recorded.");
  }

  // --- Relevant Investigations (AI section) -------------------------------------------
  if (draft.relevantInvestigations.items.length > 0 && !draft.relevantInvestigations.approvedAt) {
    warn("investigations-unapproved", "relevantInvestigations", "Relevant Investigations have not been approved.");
  }

  // --- Medication -------------------------------------------------------------------
  if (draft.medications.length === 0 && checkContext.activeMedicationCount > 0) {
    block(
      "medications-missing",
      "medications",
      `${checkContext.activeMedicationCount} medication(s) are on the record but none are on the discharge list.`
    );
  }
  for (const m of draft.medications) {
    if (m.status === "temporary" && !m.duration?.trim()) {
      block(`med-duration-${m.id}`, "medications", `${m.generic || "A temporary medication"} is marked temporary but has no duration.`);
    }
    if ((m.status === "changed" || m.status === "stopped") && !m.reason?.trim()) {
      warn(`med-reason-${m.id}`, "medications", `${m.generic || "A medication"} is marked ${m.status} without a reason.`);
    }
    if (m.status === "stopped") {
      warn(
        `med-stopped-listed-${m.id}`,
        "medications",
        `${m.generic || "A medication"} is marked stopped but still appears on the discharge prescription.`
      );
    }
  }

  // --- Histopathology ----------------------------------------------------------------
  for (const h of draft.histopathology) {
    if (h.status === "pending" && !h.reviewPlan?.trim()) {
      block(`hpe-review-${h.id}`, "histopathology", `${h.specimen || "A specimen"} histopathology is pending with no review plan.`);
    }
  }

  // --- Follow-up -------------------------------------------------------------------
  const followUpMentioned =
    FOLLOW_UP_MENTION.test(course.text) ||
    draft.advice.items.some((a) => FOLLOW_UP_MENTION.test(a.text)) ||
    draft.primaryCareActions.some((a) => FOLLOW_UP_MENTION.test(a)) ||
    checkContext.followUpInOpenTasks;
  if (followUpMentioned && draft.patientActions.length === 0) {
    warn("followup-no-patient-action", "patientActions", "A follow-up is mentioned elsewhere but there is no Patient Action for it.");
  }

  // --- Drain ---------------------------------------------------------------------
  const drainVar = draft.conditionAtDischarge.vars.drain;
  const drainInSituNow =
    (typeof drainVar === "string" && /in situ|in-situ|retained/i.test(drainVar)) ||
    (drainVar !== true && checkContext.drainInSituOnRecord);
  const drainPlan =
    draft.patientActions.some((a) => DRAIN_MENTION.test(a)) ||
    draft.primaryCareActions.some((a) => DRAIN_MENTION.test(a)) ||
    draft.advice.items.some((a) => DRAIN_MENTION.test(a.text)) ||
    DRAIN_MENTION.test(course.text);
  if (drainInSituNow && !drainPlan) {
    warn("drain-no-plan", "conditionAtDischarge", "A drain appears to still be in situ, with no management or follow-up plan documented.");
  }

  // --- Condition at Discharge --------------------------------------------------------
  const conditionMinimum = checkContext.conditionMinimum ?? 5;
  if (!conditionComplete(draft, conditionMinimum)) {
    block(
      "condition-incomplete",
      "conditionAtDischarge",
      `Condition at Discharge is incomplete — set at least ${conditionMinimum === 5 ? "five" : conditionMinimum} of the variables, or add free text.`
    );
  }

  // --- Template blanks and medication safety -------------------------------------------
  const blankSections = sectionsWithBlanks([
    ["indication", draft.indicationForAdmission.text],
    ["diagnoses", draft.diagnoses.map((d) => d.text).join(" ")],
    ["procedures", draft.procedures.map((p) => [p.name, p.anaesthesia, p.findings, p.drains, p.complications, p.outcome].join(" ")).join(" ")],
    ["clinicalCourse", course.text],
    ["medications", draft.medications.map((m) => [m.generic, m.strength, m.dose, m.duration, m.indication].join(" ")).join(" ")],
    ["patientActions", draft.patientActions.join(" ")],
    ["primaryCareActions", draft.primaryCareActions.join(" ")],
    ["advice", draft.advice.included ? draft.advice.items.map((a) => a.text).join(" ") : ""],
  ]);
  for (const section of blankSections) {
    warn(`blank-${section}`, section, "A template blank [ … ] is still in this section — fill it in or delete it; it prints as written.");
  }
  nsaidConcerns(draft.medications, draft.diagnoses).forEach((message, i) => warn(`nsaid-${i}`, "medications", message));

  // --- Authentication -------------------------------------------------------------
  if (!draft.authentication.doctorName?.trim()) {
    block("auth-no-name", "authentication", "The discharging doctor's name is missing.");
  }

  // --- Dates -------------------------------------------------------------------
  // An operation dated in the future, before admission or after discharge. Code only, so it runs
  // as the resident edits; the dates inside the free text are read by Haiku on Print
  // (lib/date-check-ai.ts) and come back as questions on the summary.
  structuredDateQuestions(dateAnchors(draft)).forEach((q, i) => warn(`date-${i}`, "procedures", q));

  // --- Internal inconsistencies -----------------------------------------------------
  if (
    DRAIN_REMOVED_IN_TEXT.test(course.text) &&
    typeof drainVar === "string" &&
    /in situ|in-situ|retained/i.test(drainVar)
  ) {
    warn(
      "inconsistency-drain",
      "clinicalCourse",
      "The Clinical Course says the drain was removed, but Condition at Discharge says it is still in situ."
    );
  }
  for (const p of draft.procedures) {
    if (!p.date || !course.text) continue;
    const iso = p.date;
    const long = new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
    const dayMonth = new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long" });
    const mentionsADate = /\b\d{1,2}\s+(january|february|march|april|may|june|july|august|september|october|november|december)\b/i.test(course.text);
    if (mentionsADate && !course.text.includes(long) && !course.text.includes(dayMonth)) {
      warn(
        `inconsistency-proc-date-${p.id}`,
        "clinicalCourse",
        `The operation date in the Clinical Course does not match the operation record (${long}).`
      );
    }
  }

  return { blocking, warnings };
}
