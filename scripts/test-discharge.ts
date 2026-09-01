/**
 * Pure-logic checks for the discharge protocol compiler and completeness engine — no database,
 * no model, no microphone. Run with:
 *
 *   node --import ./scripts/alias-register.mjs scripts/test-discharge.ts
 *
 * Covers the two things worth pinning: that compileDischargeDraft reuses what is on the record
 * (and invents nothing), and that runDischargeChecks blocks a summary that is not safe to
 * finalise and clears once it is.
 */
import { compileDischargeDraft } from "../lib/discharge-compile.ts";
import { runDischargeChecks } from "../lib/discharge-checks.ts";
import { matchDischargeTemplate, getDischargeTemplate, listDischargeTemplates } from "../lib/discharge-templates.ts";
import { CONDITION_VARIABLES } from "../lib/discharge-entities.ts";

let failures = 0;
function ok(name: string, cond: boolean, detail = "") {
  console.log(`${cond ? "  ok  " : "FAIL  "}${name}${cond || !detail ? "" : `  — ${detail}`}`);
  if (!cond) failures++;
}

const obs = (o: Record<string, unknown>) => ({
  id: o.id ?? Math.random().toString(36),
  kind: o.kind,
  label: o.label,
  value_text: o.value_text ?? null,
  value_num: null,
  unit: null,
  source_quote: o.value_text ?? o.label,
  needs_confirmation: false,
  confirmed_at: null,
  conflict_note: null,
  done_at: null,
  urgency: null,
  graded_at: null,
  recorded_at: (o.recorded_at as string) ?? "2026-08-28T04:00:00.000Z",
});

const observations = [
  obs({ id: "d1", kind: "diagnosis", label: "diagnosis", value_text: "Acute calculous cholecystitis" }),
  obs({ id: "m1", kind: "medication", label: "amoxicillin-clavulanate", value_text: "625 mg PO TDS for 5 days" }),
  obs({ id: "p1", kind: "plan", label: "plan", value_text: "attend surgery OPD after 7 days for wound review" }),
  obs({ id: "e1", kind: "exam", label: "wound", value_text: "healthy, dry" }),
  obs({ id: "dr1", kind: "drain", label: "drain output", value_text: "removed" }),
  obs({ id: "l1", kind: "lab", label: "TLC", value_text: "8900", recorded_at: "2026-08-29T04:00:00.000Z" }),
];

const context = {
  patient: {
    id: "pt1",
    ward_id: "w1",
    display_name: "Test Patient",
    age_years: 45,
    sex: "F",
    bed: "SW-3",
    mrd_no: null,
    uhid_ip_no: "IP123",
    primary_diagnosis: null,
    admitted_on: "2026-08-26",
    surgery_date: "2026-08-28",
    post_op_day: 2,
    admission_day: 4,
    management: null,
    template_family: "lap_chole",
    template_variant: null,
    procedure_text: "Laparoscopic cholecystectomy",
  },
  wardId: "w1",
  wardName: "Unit 1",
  letterhead: null,
  logoUrl: null,
  doctor: { display_name: "Dr Test", designation: "SR", department: "General Surgery" },
  observations,
  admissionObservations: [],
  patientState: { matched: [], missing: [], extra: [], latest: observations, openTasks: [observations[2]], doneTasks: [], pending: [], pac: [] },
  procedure: "Laparoscopic cholecystectomy",
  medications: [observations[1]],
  formularyMappings: new Map(),
  formularySize: 0,
  row: null,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as any;

const draft = compileDischargeDraft(context);

console.log("\ncompileDischargeDraft:");
ok("primary diagnosis compiled from the record", draft.diagnoses.some((d) => d.category === "primary" && d.text === "Acute calculous cholecystitis"));
ok("procedure compiled with its date", draft.procedures[0]?.name === "Laparoscopic cholecystectomy" && draft.procedures[0]?.date === "2026-08-28");
ok("medication carried through with duration", draft.medications[0]?.duration?.includes("5") ?? false, JSON.stringify(draft.medications[0]));
ok("patient action seeded from the follow-up plan", draft.patientActions.some((a) => /OPD/i.test(a)));
ok("clinical course starts empty (AI only)", draft.clinicalCourse.text === "");
ok("authentication pre-filled from the profile", draft.authentication.doctorName === "Dr Test");
ok("condition drain var read as removed", draft.conditionAtDischarge.vars.drain === true);

const checkCtx = { activeMedicationCount: 1, followUpInOpenTasks: true, drainInSituOnRecord: false };

console.log("\nrunDischargeChecks — fresh draft:");
const fresh = runDischargeChecks(draft, checkCtx);
ok("blocks: clinical course missing", fresh.blocking.some((c) => c.id === "course-missing"));
ok("blocks: condition incomplete", fresh.blocking.some((c) => c.id === "condition-incomplete"));
ok("does NOT block on primary diagnosis (it compiled one)", !fresh.blocking.some((c) => c.id === "primary-diagnosis-missing"));

console.log("\nrunDischargeChecks — completed draft:");
const done = structuredClone(draft);
done.clinicalCourse = { text: "The patient was admitted with acute calculous cholecystitis and underwent laparoscopic cholecystectomy on 28 August 2026. Recovery was uneventful.", source: "ai", approvedAt: "2026-08-30T00:00:00Z", approvedBy: "u1", uncertainPoints: [] };
done.conditionAtDischarge.vars = { haemodynamic: true, afebrile: true, ambulation: true, oralIntake: true, urine: true, bowel: true, pain: true, wound: true, drain: true };
const doneChecks = runDischargeChecks(done, checkCtx);
ok("no blocking checks once course approved + condition set", doneChecks.blocking.length === 0, JSON.stringify(doneChecks.blocking));

console.log("\nrunDischargeChecks — medication edge cases:");
const medDraft = structuredClone(done);
medDraft.medications = [{ id: "x", generic: "Enoxaparin", strength: null, dose: null, route: null, frequency: null, duration: null, indication: null, status: "temporary", reason: null, drugKey: "enoxaparin", source: "resident" }];
const medChecks = runDischargeChecks(medDraft, checkCtx);
ok("blocks: temporary medication with no duration", medChecks.blocking.some((c) => c.id.startsWith("med-duration")));
medDraft.medications[0].status = "stopped";
const stoppedChecks = runDischargeChecks(medDraft, checkCtx);
ok("warns: stopped medication still on the list", stoppedChecks.warnings.some((c) => c.id.startsWith("med-stopped-listed")));

console.log("\ndiagnosis templates (one-off flow):");
ok("'lap chole' shorthand matches the cholecystectomy template", matchDischargeTemplate({ procedureText: "lap chole" })?.key === "lap_chole");
ok("a typed 'acute appendicitis' matches the appendicectomy template", matchDischargeTemplate({ diagnosisText: "acute appendicitis" })?.key === "appendicectomy");
ok("'carcinoma rectum' matches colorectal, not anorectal", matchDischargeTemplate({ diagnosisText: "carcinoma rectum" })?.key === "colorectal_ca");
ok("'fistula in ano' matches the anorectal template", matchDischargeTemplate({ diagnosisText: "fistula in ano" })?.key === "perianal");
ok("'perforation peritonitis' matches the perforation template", matchDischargeTemplate({ diagnosisText: "perforation peritonitis" })?.key === "perforation");
ok("'MRM for carcinoma breast' matches the breast template", matchDischargeTemplate({ procedureText: "MRM", diagnosisText: "carcinoma breast" })?.key === "breast_ca");
ok("an unrecognised diagnosis matches nothing (caller falls back to generic)", matchDischargeTemplate({ diagnosisText: "thyroid nodule" }) === null);
ok("all ten templates plus generic are listed for the picker", listDischargeTemplates().length === 11);

const oneOffCtx = { ...context, patient: { ...context.patient, id: "", primary_diagnosis: null, procedure_text: "laparoscopic cholecystectomy", surgery_date: null, template_family: null }, observations: [], medications: [], patientState: { ...context.patientState, latest: [], openTasks: [] } };
const seeded = compileDischargeDraft(oneOffCtx, { template: getDischargeTemplate("lap_chole"), seedAll: true });
ok("template seeds an indication scaffold with a blank", /\[.+\]/.test(seeded.indicationForAdmission.text));
ok("template seeds the procedure skeleton", seeded.procedures[0]?.name === "Laparoscopic cholecystectomy" && seeded.procedures[0]?.anaesthesia === "General anaesthesia");
ok("template seeds a clinical-course skeleton (prints unless changed)", /laparoscopic cholecystectomy was performed/i.test(seeded.clinicalCourse.text));
ok("template seeds the standard discharge medications", seeded.medications.some((m) => /paracetamol/i.test(m.generic)) && seeded.medications.some((m) => /pantoprazole/i.test(m.generic)));
ok("template seeds red flags and turns the section on for a one-off", seeded.redFlags.included && seeded.redFlags.items.length > 0);
ok("template seeds standard patient actions", seeded.patientActions.some((a) => /OPD/i.test(a)));
ok("template seeds condition as all-satisfactory", CONDITION_VARIABLES.every((v) => seeded.conditionAtDischarge.vars[v.key] === true));

// A WARD patient (seedAll = false): the record still drives everything; the template only
// OFFERS its advice + red-flag cards, switched off.
const wardSeeded = compileDischargeDraft(context);
ok("ward patient: template offers advice, switched off", wardSeeded.advice.items.length > 0 && wardSeeded.advice.included === false);
ok("ward patient: template does NOT seed the clinical course", wardSeeded.clinicalCourse.text === "");
ok("ward patient: template does NOT overwrite compiled medications", wardSeeded.medications.length === 1 && /amoxicillin/i.test(wardSeeded.medications[0].generic));

console.log(`\n${failures === 0 ? "ALL PASS" : `${failures} FAILURE(S)`}\n`);
process.exit(failures === 0 ? 0 : 1);
