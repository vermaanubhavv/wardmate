import type { DischargeContext } from "@/lib/discharge-data";
import type { DischargeDraft, DischargeSectionId } from "@/lib/discharge-entities";
import { CONDITION_VARIABLES } from "@/lib/discharge-entities";

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
};

export function buildCheckContext(context: DischargeContext): DischargeCheckContext {
  const FOLLOW_UP_MENTION = /\b(opd|follow[\s-]?up|review|clinic|come back|revisit)\b/i;
  const DRAIN_REMOVED = /\b(removed|out|taken out|de-?roof)\b/i;
  return {
    activeMedicationCount: context.medications.length,
    followUpInOpenTasks: context.patientState.openTasks.some((t) =>
      FOLLOW_UP_MENTION.test(t.value_text ?? t.label)
    ),
    drainInSituOnRecord: context.observations.some(
      (o) =>
        (o.kind === "drain" || /drain/i.test(o.label)) &&
        !DRAIN_REMOVED.test(`${o.label} ${o.value_text ?? ""}`)
    ),
  };
}

const FOLLOW_UP_MENTION = /\b(opd|follow[\s-]?up|review|clinic|come back|revisit)\b/i;
const DRAIN_MENTION = /\bdrain\b/i;
const DRAIN_REMOVED_IN_TEXT = /\bdrain\b[^.]*\b(removed|out|taken out)\b|\b(removed|took out)\b[^.]*\bdrain\b/i;

function conditionComplete(draft: DischargeDraft): boolean {
  const set = CONDITION_VARIABLES.filter((v) => {
    const val = draft.conditionAtDischarge.vars[v.key];
    return val === true || (typeof val === "string" && val.trim().length > 0);
  }).length;
  return set >= 5 || !!draft.conditionAtDischarge.freeText?.trim();
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
  if (!conditionComplete(draft)) {
    block(
      "condition-incomplete",
      "conditionAtDischarge",
      "Condition at Discharge is incomplete — set at least five of the variables, or add free text."
    );
  }

  // --- Authentication -------------------------------------------------------------
  if (!draft.authentication.doctorName?.trim()) {
    block("auth-no-name", "authentication", "The discharging doctor's name is missing.");
  }

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
