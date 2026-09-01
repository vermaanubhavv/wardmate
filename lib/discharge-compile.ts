import type { DischargeContext } from "@/lib/discharge-data";
import type { Observation } from "@/lib/patient-state";
import { listedComorbidities } from "@/lib/comorbidities";
import { diagnosisFromProcedure } from "@/lib/diagnosis-from-procedure";
import { medicationFields } from "@/lib/medication-fields";
import { drugKey } from "@/lib/drug-key";
import {
  CONDITION_VARIABLES,
  compiledRowId,
  type ConditionAtDischarge,
  type ConditionVariableKey,
  type ConditionVariableValue,
  type Diagnosis,
  type DischargeDraft,
  type DischargeMedication,
  type HistopathologySpecimen,
  type Procedure,
} from "@/lib/discharge-entities";
import { matchDischargeTemplate, type DischargeTemplate } from "@/lib/discharge-templates";

/**
 * Compile a PROPOSED discharge draft from what is already on the record.
 *
 * This is the reuse the protocol asks for: information entered once during the admission —
 * spoken on rounds, photographed off the papers — becomes the first draft of every section it
 * can honestly fill. The resident then verifies and edits rather than re-typing.
 *
 * The two rules the whole app follows still hold here:
 *   - Nothing is invented. A section the record cannot fill is returned empty, not guessed.
 *     The two AI sections (Clinical Course, Relevant Investigations) are ALWAYS returned empty —
 *     they are generated on demand by lib/discharge-ai.ts, never compiled.
 *   - Absence is shown. An empty section still appears in the workspace and on the printed
 *     summary, with a blank to fill, so what is missing is visible before the summary is signed.
 *
 * Pure: same context in, same draft out. The saved-over-compiled merge is lib/discharge-store.ts.
 */

// Matched on the LABEL the extractor gave an observation — for a photographed OT note that
// comes from the headings on the page itself (see the OPERATION_SECTIONS list in the
// prepare-discharge store route).
export const OPERATIVE_LABEL = /\b(operative|operation|finding|procedure|intra[- ]?op)\b/i;
export const POST_OP_LABEL = /\bpost[- ]?op(erative)?\b/i;
export const ANAESTHESIA_LABEL = /\b(an(a)?esthesia|an(a)?esthetic|\bga\b|spinal|epidural|\bla\b|local)\b/i;
/** The pathology / HPE report is prose, not a number, so it is matched by label like radiology. */
export const PATHOLOGY_LABEL = /\b(hpe|histopath\w*|biopsy|specimen)\b/i;
/** A complication the resident named as one — not a judgement this file makes from wording. */
export const COMPLICATION_LABEL =
  /\b(complication|ssi|surgical site infection|wound infection|dehiscence|burst abdomen|anastomotic leak|\bleak\b|collection|abscess|atelectasis|pneumonia|\bdvt\b|pulmonary embolism|\bpe\b|ileus|re-?exploration|re-?laparotomy|sepsis|bile leak|haematoma|hemorrhage|haemorrhage|re-?admission)\b/i;
/** A job that the patient themselves has to do — an OPD visit, a suture removal. */
export const PATIENT_ACTION_LABEL =
  /\b(opd|follow[\s-]?up|review in|suture removal|staple removal|stitch removal|remove sutures|remove staples|dressing|come back|revisit|report to|attend)\b/i;

const istDay = (iso: string | null): string | null =>
  iso
    ? new Date(iso).toLocaleDateString("en-GB", {
        timeZone: "Asia/Kolkata",
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : null;

/** yyyy-mm-dd from an ISO instant or date, for a date input. */
const isoDate = (v: string | null): string | null => (v ? v.slice(0, 10) : null);

function latestByKinds(observations: Observation[], kinds: string[]): Observation[] {
  const seen = new Set<string>();
  const out: Observation[] = [];
  for (const o of observations) {
    if (!kinds.includes(o.kind)) continue;
    const key = `${o.kind}:${o.label.toLowerCase().trim()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(o);
  }
  return out;
}

/** The concise Condition-at-Discharge prose the protocol allows the app to assemble from the
 *  variables the resident has marked satisfactory. Deterministic, never AI. */
export function buildConditionProse(vars: Record<ConditionVariableKey, ConditionVariableValue>): string {
  const phrases: string[] = [];
  for (const v of CONDITION_VARIABLES) {
    const value = vars[v.key];
    if (value === true) phrases.push(v.satisfactory);
    else if (typeof value === "string" && value.trim()) phrases.push(value.trim());
  }
  if (phrases.length === 0) return "";
  const joined =
    phrases.length === 1
      ? phrases[0]
      : `${phrases.slice(0, -1).join(", ")} and ${phrases[phrases.length - 1]}`;
  return `Patient is ${joined}.`;
}

function compileDiagnoses(context: DischargeContext): Diagnosis[] {
  const { patient, observations } = context;
  const out: Diagnosis[] = [];

  const recorded =
    patient.primary_diagnosis?.trim() ||
    observations.find((o) => o.kind === "diagnosis")?.value_text?.trim() ||
    null;
  const derived = recorded ? null : diagnosisFromProcedure(patient);

  if (recorded) {
    out.push({ id: "dx-primary", category: "primary", text: recorded, source: "compiled" });
  } else if (derived) {
    out.push({
      id: "dx-primary",
      category: "primary",
      text: derived.text,
      source: "compiled",
      derivedFrom: derived.from,
    });
  }

  listedComorbidities(observations).forEach((text, i) =>
    out.push({ id: compiledRowId("dx-comorbidity", i), category: "comorbidity", text, source: "compiled" })
  );

  const comorbiditySet = new Set(out.filter((d) => d.category === "comorbidity").map((d) => d.text.toLowerCase()));
  const seenComplication = new Set<string>();
  for (const o of observations) {
    const text = `${o.label} ${o.value_text ?? ""}`;
    if (!COMPLICATION_LABEL.test(text)) continue;
    const value = (o.value_text ?? o.label).trim();
    const key = value.toLowerCase();
    if (!value || comorbiditySet.has(key) || seenComplication.has(key)) continue;
    seenComplication.add(key);
    out.push({ id: compiledRowId("dx-complication", seenComplication.size), category: "complication", text: value, source: "compiled" });
  }

  return out;
}

function compileProcedures(context: DischargeContext): Procedure[] {
  const { patient, observations, procedure } = context;

  const operativeNotes = observations
    .filter((o) => o.kind === "note" && OPERATIVE_LABEL.test(o.label) && !POST_OP_LABEL.test(o.label))
    .map((o) => (o.value_text ?? o.label).trim())
    .filter(Boolean);
  const postOpNotes = observations
    .filter((o) => o.kind === "note" && POST_OP_LABEL.test(o.label))
    .map((o) => (o.value_text ?? o.label).trim())
    .filter(Boolean);
  const anaesthesia = observations
    .filter((o) => ANAESTHESIA_LABEL.test(`${o.label} ${o.value_text ?? ""}`))
    .map((o) => (o.value_text ?? o.label).trim())[0] ?? null;
  const drainObs = observations
    .filter((o) => o.kind === "drain" || /drain/i.test(o.label))
    .map((o) => (o.value_text ? `${o.label}: ${o.value_text}` : o.label).trim());
  const procedureDone = observations.find((o) => o.kind === "procedure_done")?.value_text?.trim() ?? null;

  const name = procedure ?? procedureDone ?? "";
  const hasAny = name || patient.surgery_date || operativeNotes.length > 0;
  if (!hasAny) return [];

  const primaryDiagnosis = compileDiagnoses(context).find((d) => d.category === "primary")?.text ?? null;
  const complications = postOpNotes.filter((n) => COMPLICATION_LABEL.test(n));

  return [
    {
      id: "proc-0",
      name,
      date: isoDate(patient.surgery_date),
      indication: primaryDiagnosis,
      anaesthesia,
      findings: operativeNotes.join("; ") || null,
      drains: drainObs.join("; ") || null,
      complications: complications.join("; ") || null,
      outcome: null,
      source: "compiled",
    },
  ];
}

function compileHistopathology(context: DischargeContext): HistopathologySpecimen[] {
  const out: HistopathologySpecimen[] = [];
  let i = 0;
  for (const o of context.observations) {
    if (!PATHOLOGY_LABEL.test(`${o.label} ${o.value_text ?? ""}`)) continue;
    const result = (o.value_text ?? "").trim() || null;
    // A line that reads like an actual histopathology report is "final"; a bare "HPE sent" is
    // "pending". The resident sets the truth — this is only the starting point.
    const looksReported = !!result && result.length > 25 && !/awaited|pending|sent|await/i.test(result);
    out.push({
      id: compiledRowId("hpe", i++),
      specimen: o.label.replace(PATHOLOGY_LABEL, "").replace(/[:\-–]/g, "").trim() || o.label.trim(),
      dateSent: isoDate(o.recorded_at),
      status: looksReported ? "final" : "pending",
      result: looksReported ? result : null,
      reviewPlan: null,
      source: "compiled",
    });
  }
  return out;
}

function compileMedications(context: DischargeContext): DischargeMedication[] {
  return context.medications.map((m, i) => {
    const fields = medicationFields(m.label, m.value_text);
    const strengthMatch = `${m.label} ${m.value_text ?? ""}`.match(/(\d+(?:\.\d+)?)\s*(mg|mcg|µg|g|gm|ml|iu|units?)\b/i);
    return {
      id: compiledRowId("med", i),
      generic: fields.drug,
      strength: strengthMatch ? `${strengthMatch[1]} ${strengthMatch[2].toLowerCase()}` : null,
      dose: fields.dose,
      route: fields.route,
      frequency: fields.frequency,
      duration: fields.duration,
      indication: null,
      status: "new",
      reason: null,
      drugKey: drugKey(m.label),
      source: "compiled",
    };
  });
}

function compileCondition(context: DischargeContext): ConditionAtDischarge {
  const relevant = latestByKinds(context.observations, ["vital", "exam", "drain", "intake_output"]);
  const vars = Object.fromEntries(CONDITION_VARIABLES.map((v) => [v.key, null])) as Record<
    ConditionVariableKey,
    ConditionVariableValue
  >;

  const find = (re: RegExp) =>
    relevant.find((o) => re.test(`${o.label} ${o.value_text ?? ""}`)) ?? null;

  const stable = find(/h(a)?emodynamic|vitals?\s+(stable|normal)/i);
  if (stable) vars.haemodynamic = /stable|normal|maintained/i.test(stable.value_text ?? "") ? true : (stable.value_text ?? stable.label);

  const temp = find(/\b(afebrile|febrile|temperature|temp)\b/i);
  if (temp) {
    const t = (temp.value_text ?? "").toLowerCase();
    vars.afebrile = /afebrile|normal|98|99/.test(t) && !/febrile\b(?!.*a)/.test(t) ? true : (temp.value_text ?? temp.label);
  }

  const amb = find(/ambulat|mobilis|mobiliz|walking|out of bed/i);
  if (amb) vars.ambulation = amb.value_text ?? amb.label;

  const oral = find(/oral|orally|per oral|diet|feeds?|tolerating/i);
  if (oral) vars.oralIntake = /tolerating|accepting|well/i.test(oral.value_text ?? "") ? true : (oral.value_text ?? oral.label);

  const urine = find(/urine|urin|micturition|catheter|foley|uop/i);
  if (urine) vars.urine = urine.value_text ?? urine.label;

  const bowel = find(/bowel|flatus|stool|motion|passed/i);
  if (bowel) vars.bowel = bowel.value_text ?? bowel.label;

  const pain = find(/\bpain\b/i);
  if (pain) vars.pain = /controlled|adequate|minimal|nil|no /i.test(pain.value_text ?? "") ? true : (pain.value_text ?? pain.label);

  const wound = find(/wound|incision|suture line|dressing|site healthy/i);
  if (wound) vars.wound = /healthy|clean|dry|healing/i.test(wound.value_text ?? "") ? true : (wound.value_text ?? wound.label);

  const drain = find(/drain/i);
  if (drain) {
    const d = (drain.value_text ?? "").toLowerCase();
    vars.drain = /removed|out|taken out|deroof/i.test(d) ? true : `drain in situ${drain.value_text ? ` — ${drain.value_text}` : ""}`;
  }

  const prose = buildConditionProse(vars);
  return { vars, prose, proseEdited: false, freeText: null };
}

function compilePatientActions(context: DischargeContext): string[] {
  const candidates = [
    ...context.patientState.openTasks.map((t) => (t.value_text ?? t.label).trim()),
  ];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const c of candidates) {
    if (!c || !PATIENT_ACTION_LABEL.test(c)) continue;
    const key = c.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(c);
  }
  return out;
}

/**
 * Fold a diagnosis TEMPLATE (lib/discharge-templates.ts) into a compiled draft.
 *
 * Only ever for the one-off flow, and only into sections the record left empty. This is the
 * same class of thing as the standard-medication default: an editable scaffold a doctor signs
 * off, carrying `[ … ]` blanks for the parts only they can fill — never a clinical fact.
 * `seedAll` is true for the one-off (no record at all); a real patient's workspace would only
 * ever take the advice / red-flag lists, and even those stay switched off until the resident
 * opts in.
 */
export function applyDischargeTemplate(
  draft: DischargeDraft,
  template: DischargeTemplate,
  seedAll: boolean
): DischargeDraft {
  const s = template.scaffold;
  const next: DischargeDraft = { ...draft };

  if (draft.advice.items.length === 0) {
    next.advice = { items: s.advice.map((a) => ({ ...a })), included: seedAll };
  }
  if (draft.redFlags.items.length === 0) {
    next.redFlags = { items: [...s.redFlags], included: seedAll };
  }

  // A ward patient stops here: the record compiles their diagnosis, operation, course and
  // medications — the template only OFFERS the advice and red-flag cards above (switched off).
  if (!seedAll) return next;

  if (!draft.indicationForAdmission.text.trim()) {
    next.indicationForAdmission = { text: s.indication, source: "resident" };
  }
  if (!draft.clinicalCourse.text.trim() && s.clinicalCourse) {
    next.clinicalCourse = { text: s.clinicalCourse, source: "resident", uncertainPoints: [] };
  }
  if (draft.medications.length === 0 && s.medications.length > 0) {
    next.medications = s.medications.map((m, i) => ({
      id: compiledRowId("med", i),
      generic: m.generic,
      strength: m.strength ?? null,
      dose: m.dose ?? null,
      route: m.route ?? null,
      frequency: m.frequency ?? null,
      duration: m.duration ?? null,
      indication: m.indication ?? null,
      status: m.status,
      reason: null,
      drugKey: drugKey(m.generic),
      source: "resident" as const,
    }));
  }
  if (!draft.diagnoses.some((d) => d.category === "primary") && s.primaryDiagnosis) {
    next.diagnoses = [
      { id: "dx-primary", category: "primary", text: s.primaryDiagnosis, source: "resident" },
      ...draft.diagnoses,
    ];
  }
  const primaryDx = next.diagnoses.find((d) => d.category === "primary")?.text ?? null;
  if (draft.procedures.length === 0) {
    next.procedures = [
      {
        id: "proc-0",
        name: s.procedure.name,
        date: null,
        indication: primaryDx,
        anaesthesia: s.procedure.anaesthesia,
        findings: s.procedure.findings,
        drains: s.procedure.drains,
        complications: s.procedure.complications,
        outcome: s.procedure.outcome,
        source: "resident",
      },
    ];
  } else if (draft.procedures.length === 1) {
    // The record already named the operation (the resident typed it). Keep that; fill only the
    // fields the template knows a standard value / prompt for and the record left blank.
    const p = draft.procedures[0];
    next.procedures = [
      {
        ...p,
        name: p.name || s.procedure.name,
        indication: p.indication || primaryDx,
        anaesthesia: p.anaesthesia || s.procedure.anaesthesia,
        findings: p.findings || s.procedure.findings,
        drains: p.drains || s.procedure.drains,
        complications: p.complications || s.procedure.complications,
        outcome: p.outcome || s.procedure.outcome,
      },
    ];
  }
  if (draft.patientActions.length === 0) next.patientActions = [...s.patientActions];
  if (draft.primaryCareActions.length === 0) next.primaryCareActions = [...s.primaryCareActions];

  const noVarSet = CONDITION_VARIABLES.every((v) => draft.conditionAtDischarge.vars[v.key] === null);
  if (s.conditionAllSatisfactory && noVarSet) {
    const vars = Object.fromEntries(CONDITION_VARIABLES.map((v) => [v.key, true])) as Record<
      ConditionVariableKey,
      ConditionVariableValue
    >;
    next.conditionAtDischarge = { vars, prose: buildConditionProse(vars), proseEdited: false, freeText: null };
  }

  return next;
}

export function compileDischargeDraft(
  context: DischargeContext,
  options?: { template?: DischargeTemplate | null; seedAll?: boolean }
): DischargeDraft {
  const { patient, doctor, wardName, wardConsultant } = context;

  const base: DischargeDraft = {
    patientId: patient.id,
    wardId: context.wardId,
    status: "draft",
    finalisedAt: null,

    indicationForAdmission: { text: "", source: "compiled" },
    encounter: {
      admittedAt: patient.admitted_on,
      dischargedAt: null,
      department: doctor?.department ?? null,
      specialty: null,
      ward: null,
      bed: patient.bed || null,
      consultant: wardConsultant ?? null,
      unit: wardName ?? null,
      admissionType: null,
    },
    diagnoses: compileDiagnoses(context),
    procedures: compileProcedures(context),
    clinicalCourse: { text: "", source: "compiled", uncertainPoints: [] },
    relevantInvestigations: { items: [], approvedAt: null, approvedBy: null },
    histopathology: compileHistopathology(context),
    medications: compileMedications(context),
    conditionAtDischarge: compileCondition(context),
    primaryCareActions: [],
    patientActions: compilePatientActions(context),
    advice: { items: [], included: false },
    redFlags: { items: [], included: false },
    authentication: {
      doctorName: doctor?.display_name ?? null,
      designation: doctor?.designation ?? null,
      department: doctor?.department ?? null,
      completedAt: null,
      seniorReviewer: null,
    },
  };

  // The one-off flow passes an explicit template + seedAll. A ward patient gets the template
  // its diagnosis / operation points at, applied with seedAll=false — so only the advice and
  // red-flag cards are offered (switched off), and everything else stays compiled from the
  // record.
  const template =
    options?.template ??
    matchDischargeTemplate({
      procedureText: context.procedure ?? patient.procedure_text,
      diagnosisText: base.diagnoses.find((d) => d.category === "primary")?.text,
      templateFamily: patient.template_family,
    });

  return template ? applyDischargeTemplate(base, template, options?.seedAll ?? false) : base;
}

/** For the console-test script and the compile digest — the human-readable admission date. */
export { istDay as dischargeIstDay };
