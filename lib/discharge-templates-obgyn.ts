import type { AdviceItem } from "@/lib/discharge-entities";
import type { DischargeTemplate } from "@/lib/discharge-templates";

/**
 * OBSTETRICS & GYNAECOLOGY discharge templates.
 *
 * PHASE 0+1 ONLY — the generic template, same deliberate scope internal medicine shipped with
 * before its condition-specific set followed the unit's read-through (docs/specialty-packs.md
 * §8). `OBGYN_DISCHARGE_TEMPLATES` is `[]` on purpose: a condition-keyed set (normal delivery,
 * LSCS, pre-eclampsia/eclampsia, PPH, ectopic, MTP, hysterectomy) is real clinical content —
 * the exact drugs, doses and red flags for each — and is NOT written until a signed-off
 * departmental read-through, the same hold-back the medicine pack applied to its own condition
 * templates. Building it without that review would be exactly the "confident, plausible,
 * unreviewed" failure mode this app exists to avoid.
 *
 * `medications: []` for the same reason every other generic template carries it empty — a
 * prescription is patient-specific, never guessed.
 */

const adv = (items: { module: string; text: string }[]): AdviceItem[] =>
  items.map((it, i) => ({ id: `adv-${i}`, module: it.module, text: it.text }));

const STANDARD_RED_FLAGS = [
  "Fever, or foul-smelling vaginal discharge",
  "Heavy vaginal bleeding — soaking more than one pad an hour",
  "Severe headache, visual disturbance, or a fit",
  "Severe abdominal pain",
  "Wound (if operated) becoming red, swollen or discharging",
];

export const OBGYN_GENERIC_DISCHARGE_TEMPLATE: DischargeTemplate = {
  key: "obgyn_generic",
  label: "Obstetrics & Gynaecology — generic template",
  match: /.^/,
  scaffold: {
    indication:
      "Patient was admitted with [ presenting problem / for delivery ] for [ investigation / obstetric or gynaecological management ].",
    primaryDiagnosis: "",
    procedure: {
      name: "[ Delivery or procedure during this admission, if any — LSCS, normal delivery, D&C, laparoscopy, hysterectomy ]",
      anaesthesia: "",
      findings: "[ relevant findings — indication for the procedure, intra-operative findings ]",
      drains: "[ catheter / drain at discharge, if any ]",
      complications: "Nil",
      outcome: "[ Outcome — maternal and, where relevant, fetal/neonatal ]",
    },
    clinicalCourse:
      "Admitted on day [ … ] at [ POG / with presenting complaint ]. [ Course of labour or the gynaecological problem and how it was managed. ] [ Treatment given during the admission. ] The patient improved, was afebrile and haemodynamically stable, and was fit for discharge on [ date ] with the plan below.",
    medications: [],
    advice: adv([
      { module: "Medicines", text: "Take the medicines exactly as listed. Do not stop or change a dose without asking the doctor." },
      { module: "Wound / perineal care", text: "[ wound or episiotomy care instructions, if applicable ]" },
      { module: "Follow-up", text: "Attend the obstetrics & gynaecology OPD on [ … ] with all reports." },
    ]),
    redFlags: STANDARD_RED_FLAGS,
    patientActions: [
      "Attend the obstetrics & gynaecology OPD on [ … ].",
      "Get [ … ] repeated on [ … ] and bring the report to the next visit.",
      "Bring this summary and all reports to every visit.",
    ],
    primaryCareActions: [],
    conditionAllSatisfactory: true,
  },
  clerkingFocus:
    "Presenting complaint with onset, duration and course; LMP, EDD and period of gestation where relevant; gravida/para/living/abortion record; antenatal course and booking status; menstrual and obstetric history; past medical, surgical and drug history; examination including per-abdomen and per-vaginum findings; provisional diagnosis and the plan. Baseline: CBC, blood group and Rh, urine routine, and the condition-specific tests (USG, OGTT, coagulation profile).",
  progressNote:
    "Each day — symptoms; vitals including blood pressure trend; per-abdomen and lochia/bleeding findings; oral intake; the results back and the plan; for a delivered patient, involution and breastfeeding. For discharge — afebrile, stable, involuting/wound healthy, tolerating orals, oral medicines prescribed, and follow-up written down.",
};

/** Deliberately empty — see the file header. Grows once the unit's condition-specific
 *  discharge prescriptions are reviewed and signed off, the same way the medicine pack's did. */
export const OBGYN_DISCHARGE_TEMPLATES: DischargeTemplate[] = [];
