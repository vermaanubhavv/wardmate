import type { ExtractedObservation } from "@/lib/extract";
import type { ReadLabValue } from "@/lib/read-lab-photo";
import type { RegisterRow } from "@/lib/read-register";
import { askJev, chosenProbability, type JevAnswers } from "@/lib/jev";
import { log } from "@/lib/observability";
import { isActionableTask } from "@/lib/task-classification";
import type { TaskCategory } from "@/lib/task-category";

/**
 * Jev's second look at what extraction produced, before anything is stored. One request per
 * dictation, three kinds of question:
 *
 *   supported_i  Does the quote actually SAY this value? lib/extract.ts already guarantees the
 *                quote is a real span of the transcript; nothing checked that the span means
 *                the value stored beside it. A "no" turns the row amber (needs_confirmation)
 *                for the resident — never deleted, never the other way: Jev can make a row
 *                amber, it cannot make an amber row green.
 *   open_i       Plans the keyword filter would HIDE only (lib/task-classification.ts): is this
 *                still a job? "Continue IV antibiotics, repeat CBC tomorrow" says "continue"
 *                and was vanishing from the to-do list. A yes rescues it; Jev is never asked
 *                about a plan the filter already shows, so it cannot hide one.
 *   category_i   Which /todo "By type" bucket a plan belongs to. Stored; the keyword match stays
 *                the fallback wherever this is null.
 *
 * No key, an error or a timeout: every observation goes through exactly as before.
 */

// Amber bar from scripts/eval-supported.ts (2026-10-02, jev-1.13.0, 3 runs, one row per
// request): every unsupported row (25/25, tuning and held-out) scored < 0.3, every supported
// row >= 0.55 but one plan ("drain can come out tomorrow" -> "remove drain", ~0.25, amber).
// A wrong value left green is the dangerous miss, so the bar sits well above the wrong rows.
const UNSUPPORTED_BELOW = 0.5;
// Rescue bar from scripts/eval-task-open.ts (2026-10-02, jev-1.13.0, 3 runs, ±0.03 run to run):
// every job scored >= 0.47 and every non-job <= 0.41 ("MRCP done") across the tuning and
// held-out sets. A missed job stays hidden while a wrong rescue is one extra line to tick, so
// the bar sits nearer the non-jobs: "MRCP done" is sometimes rescued, no job is ever missed.
const RESCUE_AT = 0.4;
// Category bar from scripts/eval-task-category.ts (2026-10-02, jev-1.13.0, 3 runs): 38/38 tuning
// and 25/25 held-out at 0.7-0.8, against 27/38 and 17/25 for the keywords alone. Its one
// confident mistake ("discuss goals of care" as consent) scored 0.61-0.68, so 0.8 keeps it out;
// below the bar the keywords decide, as before.
const CATEGORY_AT = 0.8;

export type TaskCategoryJudgment = TaskCategory | "other";

export const CATEGORY_CRITERIA: Record<TaskCategoryJudgment, string> = {
  sampling: "collecting a specimen or sending, repeating or chasing a lab test: blood, urine, body fluid, swab, culture, bedside glucose",
  radiology: "an imaging study to arrange, repeat or review: X-ray, ultrasound, CT, MRI, MRCP, Doppler, echo",
  procedure: "a hands-on task done to the patient: removing or inserting a drain, tube, catheter or sutures, a dressing, a tap, debridement, incision and drainage, shifting to OT",
  consent: "taking or completing a consent",
  other: "anything else: a review, a referral, a drug or diet change, discharge, counselling, charting or monitoring, mobilising",
};

/** The amber question, about the {label, value, quote} row at `row` in the state. Exported
 *  so scripts/eval-supported.ts scores exactly what production asks. */
export function supportedQuestion(row: string) {
  return {
    type: "noul",
    instructions: `\`${row}.quote\` is what a doctor dictated on a ward round; \`${row}.value\` is what was recorded from it as the \`${row}.label\`. Would a careful resident reading only the quote record that value?`,
    criteria: {
      true: "Yes: the quote says it, in the same words, shorthand or a paraphrase — including a stated absence when the value is a negative",
      false: "No: the quote denies it, names a different side or site, only suspects it (rule out, ?), says it of someone else, puts it at a different time (planned, earlier, not yet), adds a condition the value drops, or is about something else",
    },
  };
}

/** The "By type" question, about the plan text at `path`. Exported so
 *  scripts/eval-task-category.ts scores exactly what production asks. */
export function categoryQuestion(path: string) {
  return {
    type: "choice",
    instructions: `\`${path}\` is a job from a surgical ward-round plan. Which ward work-stream does the job itself belong to? Judge by the action to be done, not by a word mentioned in passing.`,
    criteria: CATEGORY_CRITERIA,
  };
}

/** The rescue question, about the plan text at `path` in the state. Exported so
 *  scripts/eval-task-open.ts scores exactly what production asks. */
export function openQuestion(path: string) {
  return {
    type: "noul",
    instructions: `A surgical resident dictated \`${path}\` as part of a ward-round plan. Does it leave anything for the ward team to do, check or follow up?`,
    criteria: {
      true: "Something is still to be done or watched: a test to send or repeat, a report awaited or to review, a tube, drain, catheter or sutures to remove, a diet to change, charting or monitoring to keep up, someone to inform on a condition, a shift to OT",
      false: "It only records what was given, done, started or simply goes on unchanged — a drug, fluid, transfusion or dressing — with nothing further for anyone to do or check",
    },
  };
}

/** Who the text is about, so their name and bed can be taken out before it goes to Jev. */
export type PatientIdentifiers = { name?: string | null; bed?: string | null };

/** redactIdentifiers for a patient who may be unknown — then the text goes as it is. */
export function redactFor(text: string, who?: PatientIdentifiers): string {
  return who ? redactIdentifiers(text, who.name ?? "", who.bed ?? "") : text;
}

export async function judgeObservations(observations: ExtractedObservation[], who?: PatientIdentifiers): Promise<void> {
  const questions: Record<string, unknown> = {};
  observations.forEach((o, i) => {
    if (!o.needs_confirmation) {
      questions[`supported_${i}`] = supportedQuestion(`observations[${i}]`);
    }
    if (o.kind !== "plan") return;
    if (!isActionableTask(o.value_text || o.label)) {
      questions[`open_${i}`] = openQuestion(`observations[${i}].value`);
    }
    questions[`category_${i}`] = categoryQuestion(`observations[${i}].value`);
  });

  const state = {
    // A resident may say the patient's name aloud; only the copy sent to Jev is redacted.
    observations: observations.map((o) => ({
      label: redactFor(o.label, who),
      value: redactFor(o.value_text, who),
      quote: redactFor(o.source_quote, who),
    })),
  };
  const jev = await askJev(state, questions);
  if ("fallback" in jev) {
    if (jev.fallback !== "no key") log.info("extract: Jev unavailable", { reason: jev.fallback });
    return;
  }
  applyJudgments(observations, jev.answers);
}

/** Pure: write Jev's answers onto the observations. Exported for the test. */
export function applyJudgments(observations: ExtractedObservation[], answers: JevAnswers): void {
  observations.forEach((o, i) => {
    const supported = answers[`supported_${i}`]?.noul;
    if (supported != null && supported < UNSUPPORTED_BELOW) o.needs_confirmation = true;
    if (o.kind !== "plan") return;
    const open = answers[`open_${i}`]?.noul;
    if (open != null && open >= RESCUE_AT) o.task_open = true;
    const category = answers[`category_${i}`];
    if (category?.choice && category.choice in CATEGORY_CRITERIA && chosenProbability(category) >= CATEGORY_AT) {
      o.task_category = category.choice as TaskCategoryJudgment;
    }
  });
}

/**
 * Takes a patient's own name and bed out of text before it is sent to Jev. TypeSafe keeps
 * nothing (zero data retention since 2026-10-08) but has no BAA, so identifiers do not go at
 * all; a finding needs neither to be judged. The whole name and each part of it of three
 * letters or more are replaced; a bed is replaced where it follows the word "bed", or anywhere
 * when it is a ward label like "SW-12" — a bare "4" elsewhere is a value, not a bed.
 */
export function redactIdentifiers(text: string, name: string, bed: string): string {
  const esc = (x: string) => x.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  let out = text;
  const parts = [name.trim(), ...name.trim().split(/\s+/)].filter((p) => p.replace(/[^a-z]/gi, "").length >= 3);
  for (const p of parts.sort((a, b) => b.length - a.length)) {
    out = out.replace(new RegExp(`(?<![a-z])${esc(p)}(?![a-z])`, "gi"), "[name]");
  }
  const b = bed.trim();
  if (b) {
    out = out.replace(new RegExp(`\\b(bed\\s*(?:no\\.?|number)?\\s*[:#-]?\\s*)${esc(b)}(?![\\w])`, "gi"), "$1[bed]");
    if (/[a-z]/i.test(b) && /\d/.test(b)) out = out.replace(new RegExp(`(?<![\\w-])${esc(b)}(?![\\w-])`, "gi"), "[bed]");
  }
  return out;
}

/** A read value in the shape judgeObservations asks about. needs_confirmation starts false so
 *  the "does the quote say it" question is asked; the caller reads the answer back. */
function asObservation(kind: ExtractedObservation["kind"], label: string, value: string, quote: string): ExtractedObservation {
  return {
    kind, label, value_text: value, value_num: null, unit: null, source_quote: quote,
    needs_confirmation: false, urgency: null, pac_verdict: null,
  };
}

/**
 * Lab photo (lib/read-lab-photo.ts): every value is amber already, so a value its own printed
 * line does not support — the neighbouring line's number, a range read as the result — is
 * marked `uncertain`, which every caller shows as "check against the photo" and which keeps a
 * misread range from teaching the ward its lab ranges. Checked on photo lines in
 * scripts/eval-supported.ts --lines: 8/8 misreads caught, 0/8 false, at the same bar.
 */
export async function judgeLabValues(values: ReadLabValue[]): Promise<void> {
  const obs = values.map((v) => asObservation(v.category === "vital" ? "vital" : "lab", v.label, v.value_text, v.source_quote));
  await judgeObservations(obs);
  obs.forEach((o, i) => {
    if (o.needs_confirmation) values[i].uncertain = true;
  });
}

/**
 * Register (lib/read-register.ts), one Jev request per row as dictation sends one note: a
 * finding or plan its own row does not say marks the row `uncertain` ("check against the
 * register photo"), and each plan gets the to-do rescue and "By type" bucket that dictated
 * plans get — register plans were the ones without them.
 */
export async function judgeRegisterRows(rows: RegisterRow[]): Promise<void> {
  await Promise.all(
    rows.map(async (row) => {
      // A register row is written as "Bed 4 <name> POD 2 …". Only the copy sent to Jev is
      // redacted; the stored quote stays exactly as written.
      const clean = (t: string) => redactIdentifiers(t, row.name, row.bed);
      const quote = clean(row.source_quote);
      const obs = [
        ...row.findings.map((f) => asObservation("note", clean(f.label), clean(f.value_text), quote)),
        ...row.plans.map((p) => asObservation("plan", "plan", clean(p), quote)),
      ];
      if (obs.length === 0) return;
      await judgeObservations(obs);
      if (obs.some((o) => o.needs_confirmation)) row.uncertain = true;
      row.plan_judgments = obs
        .slice(row.findings.length)
        .map((o) => ({ task_open: o.task_open ?? null, task_category: o.task_category ?? null }));
    })
  );
}
