/**
 * Synthetic plans with a known answer, for scripts/eval-task-open.ts — tuning Jev's rescue of
 * plans the keyword filter hides (lib/jev-observations.ts, `open_i`).
 *
 * EVERY LINE HERE IS INVENTED. No patient, no record, nothing copied from a real note.
 *
 * Every case trips the keyword filter (lib/task-classification.ts UPDATE) — those are the only
 * plans Jev is asked about, so they are the only ones worth scoring. The script refuses a case
 * that does not.
 *
 * `job: true`  — something is left for someone to do or check: a test to send or chase, a
 *                report awaited, a tube to remove on a condition, charting with a trigger.
 * `job: false` — only a record of what was given, done, started or simply goes on unchanged.
 *
 * Left out on purpose: lines a senior would argue about ("continue chest physio twice daily").
 * A tuning set is for the cases with an answer.
 */
export type TaskOpenCase = { text: string; job: boolean };

export const TASK_OPEN_CASES: TaskOpenCase[] = [
  // Jobs — the filter hides these today.
  { text: "continue drain output charting", job: true },
  { text: "continue strict intake output charting", job: true },
  { text: "Continue IV antibiotics, repeat CBC tomorrow", job: true },
  { text: "dressing done, remove sutures on day 10", job: true },
  { text: "CECT abdomen done, report awaited", job: true },
  { text: "blood culture done, follow up the report", job: true },
  { text: "continue NBM, start oral sips tomorrow if flatus passed", job: true },
  { text: "maintain hourly urine output, inform if below 30 ml", job: true },
  { text: "continue Ryle's tube aspiration, remove when aspirate is below 200 ml", job: true },
  { text: "started on oral liquids, upgrade to soft diet tomorrow", job: true },
  { text: "USG abdomen done, review with the report", job: true },
  { text: "consent done, shift to OT at 8 am", job: true },
  { text: "continue same treatment, repeat serum potassium in the evening", job: true },
  { text: "blood transfusion completed, check post-transfusion Hb tomorrow", job: true },
  { text: "PAC done, anaesthesia review of the ECG pending", job: true },
  { text: "ongoing IV fluids, stop once taking orally", job: true },

  // Not jobs — the filter is right to hide these.
  { text: "continue IV antibiotics", job: false },
  { text: "continue same treatment", job: false },
  { text: "IV fluids given", job: false },
  { text: "Inj ceftriaxone 1 g IV BD started", job: false },
  { text: "dressing done", job: false },
  { text: "blood transfusion completed", job: false },
  { text: "continue analgesics", job: false },
  { text: "on treatment for UTI", job: false },
  { text: "ongoing IV fluids", job: false },
  { text: "maintained on oral diet", job: false },
  { text: "one unit PRBC administered", job: false },
  { text: "CST", job: false },
  { text: "continue tab metformin 500 mg BD", job: false },
  { text: "started on oral sips", job: false },
  { text: "Foley catheter removal done", job: false },
  { text: "sutures removed, wound healed, dressing done", job: false },
];

/**
 * Held out: written AFTER the wording was chosen on the set above, in different phrasing, and
 * never used to pick it. Run with --held-out. If the chosen wording only works on its own
 * training lines, this is where it shows.
 */
export const TASK_OPEN_HELD_OUT: TaskOpenCase[] = [
  { text: "continue chest drain, get a check X-ray before removal", job: true },
  { text: "biopsy done, histopathology report pending", job: true },
  { text: "continue spirometry, mobilise out of bed tomorrow", job: true },
  { text: "Hb 7.2, one unit PRBC given, repeat Hb in 6 hours", job: true },
  { text: "maintain NBM till the surgery decision", job: true },
  { text: "abdominal girth charting to continue every 6 hours", job: true },
  { text: "stoma care done, watch for stoma retraction", job: true },
  { text: "continue IV pantoprazole, switch to oral once on diet", job: true },
  { text: "MRCP done, discuss the report with the consultant", job: true },
  { text: "insulin sliding scale started, check GRBS 6 hourly", job: true },

  { text: "IV paracetamol given at 6 pm", job: false },
  { text: "continue oral antibiotics", job: false },
  { text: "stoma care done", job: false },
  { text: "chest physiotherapy done", job: false },
  { text: "patient maintained on room air", job: false },
  { text: "Inj enoxaparin 40 mg SC OD started", job: false },
  { text: "MRCP done", job: false },
  { text: "ongoing oral feeds", job: false },
  { text: "drain removed, dressing done", job: false },
  { text: "continue same diet", job: false },
];
