/**
 * The investigations, gathered back into the reports they were sent as.
 *
 * A photographed liver function test comes into the record as seven separate observations, a
 * blood count as three, a USG abdomen as a dozen. Listed one per row they are twenty-odd lines
 * of a patient's page, in the order the extraction happened to emit them, with no way to see at
 * a glance what was actually sent and when. A resident does not think in analytes. They think
 * "we sent an LFT on Tuesday" — so that is the unit this file rebuilds: one line per report,
 * named and dated, with its values underneath.
 *
 * WHAT IT DOES NOT DO: it does not interpret, re-range, reword or hide a result. Grouping is
 * the whole job. Every value that went in comes out, inside exactly one report, and a value
 * whose analyte this file does not recognise lands under "Other investigations" rather than
 * being dropped — the same direction lib/exam-summary.ts leans, where a line wrongly shown
 * costs nothing and a line wrongly hidden costs a diagnosis.
 */

import { canonicalLabName } from "@/lib/lab-ranges";
import { RADIOLOGY_LABEL } from "@/lib/radiology-flags";
import { istDayKey, type Observation } from "@/lib/patient-state";

/**
 * Which panel an analyte is sent as part of.
 *
 * Keyed on lib/lab-ranges.ts's own canonical label, so "SGPT", "ALT" and "alanine transaminase"
 * all arrive here as one name and land in one panel. A lab this app does not know at all never
 * reaches this map — it goes to "Other investigations" instead of being forced into a panel it
 * might not belong to.
 */
const PANEL_OF: Record<string, string> = {
  Hb: "CBC",
  TLC: "CBC",
  Platelets: "CBC",

  "T. bilirubin": "LFT",
  "D. bilirubin": "LFT",
  SGOT: "LFT",
  SGPT: "LFT",
  ALP: "LFT",
  Albumin: "LFT",
  "Total protein": "LFT",

  Urea: "RFT",
  Creatinine: "RFT",
  Na: "RFT",
  K: "RFT",
  Cl: "RFT",

  INR: "Coagulation",
  PT: "Coagulation",

  Amylase: "Pancreatic enzymes",
  Lipase: "Pancreatic enzymes",

  CRP: "CRP",

  pH: "ABG",
  "HCO₃": "ABG",
  "pCO₂": "ABG",
  Lactate: "ABG",
};

/** The unit's name for a modality, from the word the report used for itself. */
const MODALITIES: { test: RegExp; name: string }[] = [
  { test: /\b(usg|ultrasound|ultrasonography|sonography)\b/i, name: "USG" },
  { test: /\b(hrct|cect|ct scan|ct)\b/i, name: "CT" },
  { test: /\bmri\b/i, name: "MRI" },
  { test: /\bx-?ray\b/i, name: "X-ray" },
  { test: /\bdoppler\b/i, name: "Doppler" },
  { test: /\b(echo|echocardiography)\b/i, name: "Echo" },
  { test: /\bangiography\b/i, name: "Angiography" },
  { test: /\bmammograph\w*\b/i, name: "Mammogram" },
  { test: /\bbarium\b/i, name: "Barium study" },
];

const OTHER = "Other investigations";

/** Every kind an investigation result is stored under — see app/api/entries/photo/route.ts. */
const INVESTIGATION_KINDS = new Set(["lab", "lab_report", "investigation"]);

export type InvestigationReport = {
  /** Stable across renders: panel and day are what identify a report. */
  id: string;
  /** "CBC", "LFT", "USG" — what a resident would call it. */
  panel: string;
  /** IST calendar day the values were recorded on, as YYYY-MM-DD. */
  day: string;
  /** "3 Sep" — the date as it prints beside the panel name. */
  dayLabel: string;
  /** The most recent recorded_at inside this report, for ordering. */
  recordedAt: string;
  values: Observation[];
  /** True when any value in the report was read off a photograph and not yet confirmed. */
  needsConfirmation: boolean;
};

/**
 * The modality a label names, if it names one.
 *
 * Checked ahead of lib/radiology-flags.ts's own regex rather than behind it: that regex has a
 * different job (deciding whether a report is worth flagging) and does not carry every way a
 * study is written down — "CECT abdomen" is a CT to any surgeon and matches nothing there.
 */
function modalityOf(label: string): string | null {
  return MODALITIES.find((m) => m.test.test(label))?.name ?? null;
}

function isImaging(observation: Observation): boolean {
  return modalityOf(observation.label) !== null || RADIOLOGY_LABEL.test(observation.label);
}

export function isInvestigation(observation: Observation): boolean {
  return INVESTIGATION_KINDS.has(observation.kind) || isImaging(observation);
}

/** The report an observation belongs to: a modality for imaging, a panel for a blood test. */
export function panelOf(observation: Observation): string {
  if (isImaging(observation)) {
    return modalityOf(observation.label) ?? modalityOf(observation.value_text ?? "") ?? "Imaging";
  }
  return PANEL_OF[canonicalLabName(observation.label)] ?? OTHER;
}

const dayLabel = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "short",
  });

/**
 * Group a patient's investigation results into one line per report, newest first.
 *
 * Two things make a report: what was sent and the day it was recorded. An LFT on Tuesday and an
 * LFT on Friday are two lines, which is the point — a rising bilirubin is only visible if the
 * two reports stay apart. Values inside a report keep the order they were recorded in.
 *
 * `observations` may arrive in any order; the result is sorted here.
 */
export function groupInvestigations(observations: Observation[]): InvestigationReport[] {
  const reports = new Map<string, InvestigationReport>();

  for (const obs of observations) {
    if (!isInvestigation(obs)) continue;

    const panel = panelOf(obs);
    const day = istDayKey(obs.recorded_at);
    const id = `${panel}:${day}`;

    const existing = reports.get(id);
    if (existing) {
      existing.values.push(obs);
      if (obs.recorded_at > existing.recordedAt) existing.recordedAt = obs.recorded_at;
      existing.needsConfirmation ||= obs.needs_confirmation && !obs.confirmed_at;
      continue;
    }

    reports.set(id, {
      id,
      panel,
      day,
      dayLabel: dayLabel(obs.recorded_at),
      recordedAt: obs.recorded_at,
      values: [obs],
      needsConfirmation: obs.needs_confirmation && !obs.confirmed_at,
    });
  }

  for (const report of reports.values()) {
    report.values.sort((a, b) => (a.recorded_at < b.recorded_at ? -1 : 1));
  }

  // Newest report first. A tie inside one day is broken on the panel name so the order does not
  // shuffle between renders.
  return [...reports.values()].sort((a, b) =>
    a.recordedAt === b.recordedAt
      ? a.panel.localeCompare(b.panel)
      : a.recordedAt < b.recordedAt
        ? 1
        : -1
  );
}
