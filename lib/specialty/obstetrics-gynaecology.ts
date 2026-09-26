import {
  OBGYN_DISCHARGE_TEMPLATES,
  OBGYN_GENERIC_DISCHARGE_TEMPLATE,
} from "@/lib/discharge-templates-obgyn";
import type { FormatKind } from "@/lib/formats";
import type { SpecialtyPack } from "./types";

/**
 * The obstetrics & gynaecology pack.
 *
 * WHAT MAKES AN O&G WARD DIFFERENT, and what each difference here is for:
 *
 * 1. AN OPERATION IS COMMON BUT NOT THE ONLY REASON FOR THE COUNTER. A delivered patient — by
 *    LSCS or normally — is usually counted "day n post-delivery" or "POD n" (for a caesarean),
 *    the same shape general surgery already handles: operated patients count from the
 *    operation, everyone else (an antenatal admission, a gynaecology workup) counts from
 *    admission. `dayCount` below is therefore general surgery's exact logic, not medicine's
 *    admission-only one — an O&G ward genuinely does operate, unlike a medicine ward.
 *
 * 2. THE ADMISSION IS OFTEN A PREGNANCY, NOT A DIAGNOSIS. `admissionNoun` is "case" — the
 *    ward's own word for it ("an antenatal case", "a gynaecology case") — and the extraction
 *    guidance below teaches the model the gravida/para notation and the LMP/EDD/POG vocabulary
 *    a surgical or medicine prompt has no reason to know.
 *
 * 3. THE ONE TIME-CRITICAL RULE HERE IS A HYPERTENSIVE OR HAEMORRHAGIC EMERGENCY, NOT A
 *    FEVER. PIH/pre-eclampsia/eclampsia and PPH/APH are the obstetric emergencies this ward is
 *    built around — captured as clinical vocabulary in the extraction guidance and the lexicon,
 *    same as medicine's fever-before-antibiotics rule was, but with NO checklist protocol
 *    seeded yet (see "What is deliberately not shipped" below).
 *
 * PHASE 0+1 ONLY, following the exact rollout discipline internal medicine and oncology used
 * (docs/specialty-packs.md §7–§8): the seam, day numbering, extraction prompt, lexicon and
 * quick-tap chips are built and safe to ship. Checklists, scores and condition-specific
 * discharge templates are real clinical content that need the unit's own sign-off before they
 * exist — the same reason `OBGYN_DISCHARGE_TEMPLATES` is `[]` and `scoringKeys` is empty here,
 * not a placeholder. Behind `SPECIALTY_PACKS`, unreachable until switched on for a pilot unit.
 *
 * What is deliberately NOT shipped in this pack, and why:
 * - No checklist protocols (a PPH drill checklist, a pre-eclampsia checklist, a post-LSCS
 *   checklist are exactly the shape patches 0061/0064/0067 seeded for oncology and medicine —
 *   clinical content, not yet written or reviewed here).
 * - No condition-specific discharge templates (see lib/discharge-templates-obgyn.ts header).
 * - No scoring pathways (`scoringKeys: []` — a modified early-warning score for obstetrics is a
 *   plausible future addition, not one made without sign-off).
 * - No new patient columns for LMP/EDD/gravida/para. That information is captured as clerking
 *   text under "menstrual and obstetric history" (a section every specialty already has — see
 *   lib/case-history-sections.ts — not something new this pack had to add), the same way it is
 *   written on a paper case sheet today. Turning it into structured, queryable fields (so a
 *   ward list could show "G2P1, 32+4 weeks" the way it shows "POD 2") is a bigger schema change
 *   than a seam patch, deliberately left for a later, explicitly scoped piece of work.
 *
 * CLINICIAN SIGNED OFF FOR PILOT USE 2026-09-26 (Dr. Anubhav), product owner and general-surgery
 * resident, on his own direction. It covers what this pack HAS — the day counter, the extraction
 * guidance, the lexicon and the history-tree order. It cannot cover the checklists, scores and
 * condition discharge templates listed above, because those do not exist yet; the empty lists
 * stay empty until they are written.
 */
export const obstetricsGynaecologyPack: SpecialtyPack = {
  key: "obstetrics_gynaecology",
  label: "Obstetrics & Gynaecology",
  blurb: "Counts post-operative or post-delivery days. Pregnancy-aware clerking and dictation.",

  terminology: {
    dayLabel: "POD",
    admissionNoun: "case",
  },

  admissionPhrase: "an obstetrics and gynaecology admission",

  // Same logic as general surgery's dayCount, moved here rather than shared, so a future change
  // to one unit's counting can never silently change the other's. A delivered or operated
  // patient counts from the operation/delivery; everyone else (antenatal, gynaecology workup)
  // counts from admission — and the label always says which.
  dayCount: (p) => {
    if (p.post_op_day !== null) {
      return { clock: "post_op", n: p.post_op_day, text: `POD ${p.post_op_day}` };
    }
    return { clock: "admission", n: p.admission_day, text: `Day ${p.admission_day}` };
  },

  extractRoleLine:
    "You convert an obstetrics and gynaecology resident's spoken ward-round note into structured observations.",

  extractGuidance: `
Obstetrics and gynaecology ward — what the words mean here:

- GRAVIDA/PARA is spoken as a run of letters and numbers — "G2P1L1A0", "primigravida", "second gravida" — record kind "note", label "obstetric history", with the whole notation exactly as said. Never expand or recompute it; a resident correcting an old record's gravida/para is restating a fact, not something you infer from the current admission.
- LMP, EDD AND PERIOD OF GESTATION are dates and durations spoken about the current pregnancy — "LMP 14th of March", "EDD 20th of December", "32 weeks by dates", "34 plus 2 by scan". Record kind "note", label "obstetric history", exactly as said. A discrepancy between "by dates" and "by scan" is a real clinical fact — keep both if both were said, never resolve which is right yourself.
- A DELIVERY OR AN OPERATION ALREADY DONE — "underwent emergency LSCS", "delivered vaginally", "TAH done", "laparoscopic tubal ligation done" — is procedure_done, exactly as any other ward's completed operation, and needs_confirmation stays true without exception (the same post-op-flip risk general surgery's prompt already documents). A PLANNED delivery or operation — "posted for elective LSCS", "planned for TAH" — is planned_procedure, never procedure_done.
- PIH, PRE-ECLAMPSIA AND ECLAMPSIA are graded by what was actually said, never inferred from a blood pressure alone — "BP 150/100, proteinuria 2+, PIH" is two observations (the BP as vital, the diagnosis as said); a raised BP with no diagnosis spoken is a vital only. Do not decide PIH versus pre-eclampsia versus eclampsia yourself.
- PPH AND APH are bleeding events, not routine findings — "PPH, uterus massaged, oxytocin given" is a diagnosis/note plus a medication; record the blood loss only as a number if a number was actually stated ("estimated blood loss 800 ml").
- FETAL WELLBEING TERMS — "FHS present", "NST reactive", "CTG category I", "liquor adequate" — are exam findings on the mother's chart, kind "exam", exactly as said. Never infer fetal wellbeing from the mother's vitals alone.
- Abbreviations to leave EXPANDED-AS-SAID and never resolve yourself: "PIH"/"PE"/"eclampsia" (never decide which the transcript meant), "APH"/"PPH", "IUGR", "PROM"/"PPROM", "MTP". Store the letters that were said.
`.trim(),

  // No delivery/operation to hang an admission-anchored trigger off differently from surgery's
  // own model — an O&G ward's post-op checklist would anchor on post_op the same way surgery's
  // does. No checklist protocols are seeded yet (see the file header), so this is unreachable
  // in practice until one is written, but it is set to the clinically correct value now rather
  // than left wrong for a future author to discover.
  checklistAnchor: "post_op",

  dischargeTemplates: OBGYN_DISCHARGE_TEMPLATES,
  genericDischargeTemplate: OBGYN_GENERIC_DISCHARGE_TEMPLATE,

  // Deliberately empty — see the file header. No surgical or medicine pathway can trigger here
  // either way, because only listed pathwayIds are ever offered to a unit.
  scoringKeys: [],

  // An O&G unit operates (LSCS, laparoscopy, hysterectomy), unlike internal medicine — keep the
  // OT notes slot, unlike that pack.
  formatKinds: [
    "investigation",
    "interdepartmental",
    "discharge",
    "notes",
    "ot_notes",
    "logo",
  ] as FormatKind[],

  pickerPhase: "after_surgery",

  // Empty, deliberately, like scoringKeys above — and no longer the unclaimed (surgical) list:
  // an O&G unit's operations are LSCS, hysterectomy and laparoscopy, none of which are in
  // general surgery's library, so offering that library offered the wrong department's work.
  // A PPH / pre-eclampsia / post-LSCS checklist replaces this the day it is written.
  checklistFamilies: [],

  lexiconSpecialty: "obstetrics-gynaecology",

  // Obstetric complaints first, then the gynaecological ones.
  historyTreeIds: ["labour_pains", "bleeding_pv", "vaginal_discharge", "abdominal_pain", "burning_micturition", "oedema", "fever", "breast_lump"],
};
