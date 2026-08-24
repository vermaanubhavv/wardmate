import { stripPatientHonorific } from "@/lib/patients";
import { classifyVital } from "@/lib/vital-ranges";
import { classifyLab, canonicalLabName, type SuppliedRange } from "@/lib/lab-ranges";
import { flagRadiology } from "@/lib/radiology-flags";
import type { WardRanges } from "@/lib/exam-summary";
import type { Observation } from "@/lib/patient-state";

/** What the app cannot know and must not invent: a label and a blank to write on — the same
 *  convention lib/discharge.ts uses, so a printed page never looks like it is missing a field
 *  by accident. */
const BLANK = "________________";

export type ProgressNotePatient = {
  display_name: string;
  age_years: number | null;
  sex: string | null;
  bed: string;
  uhid_ip_no: string | null;
  mrd_no: string | null;
  admitted_on: string;
};

export type ProgressNote = {
  header: {
    name: string;
    ageSex: string;
    /** Split out from ageSex, for a form whose "Age" and "Sex" are separate boxes. */
    age: string;
    sex: string;
    uhid: string | null;
    doa: string;
    unit: string | null;
    bed: string;
    ipd: string | null;
  };
  /** "Case seen by {department} {unit} team" — the note's own heading, spanning the full page
   *  above the Observation/Investigation split rather than sitting inside either column. */
  caseSeenBy: string;
  dateTime: string;
  diagnosis: string | null;
  /** The Observation column — items 1 through 8 of the fixed structure below. */
  observation: string[];
  /** The Investigation/Treatment/Management column — items 9 and 10. */
  plan: string[];
};

const istDay = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });

const norm = (s: string) => s.toLowerCase().replace(/\s+/g, " ").trim();

function findLabel(observations: Observation[], aliases: string[]): Observation | undefined {
  return observations.find((o) => aliases.includes(norm(o.label)));
}

const CNS_ALIASES = ["cns", "central nervous system", "neurological examination", "neuro", "sensorium"];
const CONSCIOUS_PATTERN = /conscious|oriented|drowsy|confused|altered sensorium|unresponsive|gcs/i;
const BP_ALIASES = ["bp", "blood pressure"];
const PR_ALIASES = ["pr", "pulse", "pulse rate", "heart rate", "hr"];
const ABDOMEN_ALIASES = ["abdomen", "per abdomen", "p/a", "pa", "abdominal examination"];
const CHEST_ALIASES = ["chest", "respiratory system", "rs", "lungs", "air entry"];
const FLATUS_ALIASES = ["flatus", "passed flatus", "wind"];
const STOOL_ALIASES = ["stool", "motion", "bowels", "bowel movement", "passed stool"];
const ASSESSMENT_ALIASES = ["assessment"];
const ASSESSMENT_PATTERN =
  /\b(satisfactory|stable|unstable|improving|improved|better|worsening|worsened|worse|deteriorat|same as|unchanged|no change)\b/i;

/**
 * The morning progress sheet, in a fixed 11-line structure — non-negotiable, the resident's own
 * words. EVERY line prints its heading whether or not there is anything recorded against it:
 * a heading with a blank after it is filled by hand; a heading is never omitted because nobody
 * has spoken yet this morning. That is the one rule this file exists to keep — see the blank
 * lines below rather than a shorter list whenever something was not said.
 *
 * The exceptions to "today only": caseSeenBy (who is rounding — now the note's own heading, not
 * a numbered line, see ProgressNote.caseSeenBy), the standing diagnosis/day/operation line, and
 * current medications are standing facts about the admission, not something dictated fresh each
 * round — medications especially, since a photographed drug chart taken once at clerking should
 * keep appearing every day until the resident records a change, not vanish the day after it was
 * photographed.
 */
export function buildProgressNote(
  patient: ProgressNotePatient,
  allObservations: Observation[],
  todaysObservations: Observation[],
  diagnosis: string | null,
  options?: {
    wardName?: string | null;
    /** The signed-in doctor's own department, for line 1. Blank, never guessed, when nobody
     *  has set one on their profile. */
    department?: string | null;
    /** "POD 3" / "Day 2" — computed by the caller via lib/patients.ts dayLabel(), so this file
     *  never re-derives a rule that already exists once, app-wide. */
    dayLabel?: string | null;
    /** The recorded operation, via lib/templates.ts procedureFor() — same reasoning. */
    procedure?: string | null;
    /** This ward's own accumulated lab ranges — see lib/lab-ranges.ts. Absent falls back to the
     *  built-in table for anything without a report range of its own. */
    wardRanges?: WardRanges;
  }
): ProgressNote {
  const now = new Date();

  // Case seen by (department)(unit) team — the note's own heading, not a line inside it. It
  // names who is rounding, which applies to everything below it rather than to any one column,
  // so it sits above the Observation/Investigation split as a full-width banner rather than
  // being confined to whichever column it happened to be written in. See note.caseSeenBy below.
  const caseSeenBy = `Case seen by ${options?.department || BLANK} ${options?.wardName || BLANK} team`;

  // 1. Diagnosis and/or post-operative day, and the operation.
  const line2 = [diagnosis || BLANK, options?.dayLabel, options?.procedure ? `- ${options.procedure}` : null]
    .filter(Boolean)
    .join(" ");

  // 3. Complaints — whatever was said fresh today, verbatim. Excludes labels that have their
  // own line elsewhere on the sheet (comorbidities and assessment belong to the admission
  // clerking note or the assessment line, and CNS/sensorium is On Examination's) — a finding
  // occasionally extracted with kind "note" instead of "exam" must not print twice just
  // because it matches two lines' filters at once.
  const complaintLines = todaysObservations
    .filter(
      (o) =>
        o.kind === "note" &&
        !/comorbid|assessment/i.test(o.label) &&
        !CNS_ALIASES.includes(norm(o.label))
    )
    .map((o) => o.value_text ?? o.label);
  const line3 = `Complaints - ${complaintLines.join("; ") || BLANK}`;
  // One ruled line under Complaints, reserved for the relevant-negative-symptoms checklist
  // this feature is drafting separately for clinical sign-off before it prints anything — see
  // the conversation this shipped from. Blank room, not a guess, until that draft is approved.
  const line3b = "";

  // 4. On examination — consciousness/sensorium. "Conscious Oriented" prints as the DEFAULT
  // starting value when nothing was said today — the one deliberate exception to this file's
  // usual "never invent" rule, and only because the resident explicitly asked for it as an
  // editable starting point on a form they review and correct before signing, not a value
  // written into the patient's record. Whatever was actually said today, if anything,
  // overrides the default rather than sitting alongside it.
  const cns =
    findLabel(todaysObservations, CNS_ALIASES) ??
    todaysObservations.find((o) => CONSCIOUS_PATTERN.test(o.value_text ?? ""));
  const line4 = `On Examination - ${cns ? (cns.value_text ?? cns.label) : "Conscious Oriented"}`;

  // 5. Vitals — BP and PR, bare. No "Vitals -" label and no underscore placeholder when
  // unrecorded: a blank after two short abbreviations already reads as "not yet taken" without
  // a run of dashes to make the point. Still flagged when deranged, the same classifyVital
  // every other vitals display in the app uses.
  const bpObs = findLabel(todaysObservations, BP_ALIASES);
  const prObs = findLabel(todaysObservations, PR_ALIASES);
  const bpText = bpObs ? renderVital(classifyVital(bpObs.label, bpObs.value_text)) : "";
  const prText = prObs ? renderVital(classifyVital(prObs.label, prObs.value_text)) : "";
  const line5 = `BP: ${bpText}   PR: ${prText}`;

  // 6. P/Abdomen, said today — printed exactly as recorded, never normalised to "NAD" wording
  // that was not actually said. No trailing BLANK when empty: unlike a single-word field (a
  // name, a date), an exam finding is written as a sentence, and a row of underscores after
  // the heading reads as clutter rather than an invitation to fill it in. Always followed by
  // one ruled line of extra room, whether or not something was said — the same "floor, not a
  // ceiling" reasoning Issues already uses.
  const abdomen = findLabel(todaysObservations, ABDOMEN_ALIASES);
  const line6 = `P/Abdomen -${abdomen ? ` ${abdomen.value_text ?? abdomen.label}` : ""}`;
  const line6b = "";

  // 7. Chest, said today. Same reasoning as P/Abdomen above, including the extra ruled line.
  const chest = findLabel(todaysObservations, CHEST_ALIASES);
  const line7 = `Chest -${chest ? ` ${chest.value_text ?? chest.label}` : ""}`;
  const line7b = "";

  // 7b. Flatus / Stool, said today — a tick-or-write line either way. If today's round already
  // said whether flatus or stool passed, that wording prints; where it did not, the heading
  // alone is a bare checklist the resident ticks or fills by hand on the printed sheet, the
  // same as any other empty heading on this file, not the app deciding either happened.
  const flatusObs = findLabel(todaysObservations, FLATUS_ALIASES);
  const stoolObs = findLabel(todaysObservations, STOOL_ALIASES);
  const flatusText = flatusObs ? (flatusObs.value_text ?? flatusObs.label) : "";
  const stoolText = stoolObs ? (stoolObs.value_text ?? stoolObs.label) : "";
  const line7c = `Flatus / Stool -${flatusText || stoolText ? ` Flatus: ${flatusText || "—"}   Stool: ${stoolText || "—"}` : ""}`;

  // 9. Assessment — only the resident's own stated judgement (labelled "assessment", or a
  // sentence using a plain stable/worse/same word). Never computed by the app: there is no
  // formula here that decides "satisfactory" from a set of vitals, because that is exactly the
  // kind of invented clinical judgement this app has refused to make everywhere else. Bare
  // heading when empty, same reasoning as P/Abdomen and Chest findings above — one line of
  // room to write, not a row of underscores.
  const assessmentObs =
    findLabel(todaysObservations, ASSESSMENT_ALIASES) ??
    todaysObservations.find((o) => o.kind === "note" && ASSESSMENT_PATTERN.test(o.value_text ?? ""));
  const line8 = `Assessment -${assessmentObs ? ` ${assessmentObs.value_text ?? assessmentObs.label}` : ""}`;

  // 10. Issues — deranged blood investigations and flagged radiology, said today. Two different
  // kinds of "deranged" and neither is invented here:
  //
  // Bloods are judged against a range — the report's own printed one, then this ward's learned
  // one, then a built-in fallback — exactly as lib/lab-ranges.ts does everywhere else in the
  // app. A number is either outside that range or it is not; that is a fact, not a judgement.
  //
  // Radiology has no such number to check, so lib/radiology-flags.ts only surfaces a report
  // when the resident's OWN word for it says abnormal ("USG deranged", "CT abnormal"). A report
  // that only describes what was seen, however concerning it might read, stays out of this line
  // — reading clinical significance into a description is exactly the judgement this app has
  // refused to make anywhere else, and Issues is not the place to start.
  const derangedLabs = todaysObservations
    .filter((o) => o.kind === "lab")
    .map((o) => {
      const supplied: SuppliedRange | null =
        o.ref_low != null || o.ref_high != null
          ? { low: o.ref_low ?? null, high: o.ref_high ?? null, text: o.ref_text, source: "report" }
          : (() => {
              const w = options?.wardRanges?.get(canonicalLabName(o.label));
              return w && (w.low !== null || w.high !== null) ? { ...w, source: "ward" as const } : null;
            })();
      return classifyLab(o.label, o.value_text, patient.sex, supplied);
    })
    .filter((r): r is NonNullable<typeof r> => Boolean(r?.flag))
    .map((r) => `${r.label} ${r.value}${r.range ? ` (${r.range})` : ""}`);

  const radiologyIssues = todaysObservations
    .map((o) => flagRadiology(o.label, o.value_text))
    .filter((r): r is NonNullable<typeof r> => r !== null)
    .map((r) => `${r.label}: ${r.value}`);

  const issues = [...derangedLabs, ...radiologyIssues];
  const line9 = `Issues -${issues.length > 0 ? ` ${issues.join("; ")}` : ""}`;

  // Genuinely last: Assessment and Issues are the wrap-up of the round, and everything else on
  // the sheet is written before the resident gets to them, never after. Issues gets more room
  // than a single line on purpose — an app that only ever surfaces exactly what it found would
  // read as complete when it is a floor, not a ceiling, so blank ruled space follows for the
  // resident to add to it by hand. Up to three lines of issues, total: however many this file
  // found, topped up with blank room rather than trimmed down to fit.
  const ISSUE_ROOM = 3;
  const issueBlankLines = Array.from({ length: Math.max(0, ISSUE_ROOM - issues.length) }, () => "");

  const observation = [
    line2, line3, line3b, line4, line5, line6, line6b, line7, line7b, line7c,
    line8,
    line9, ...issueBlankLines,
  ];

  // 11. Advice and medications — the CURRENT list, not just today's. A drug chart photographed
  // once at clerking is still the patient's medications a week later; scoping this to today
  // would make it vanish the day after it was recorded. Newest first in, so the first sighting
  // of each drug name kept here is the latest one.
  const seenDrugs = new Set<string>();
  const currentMeds = allObservations.filter((o) => {
    if (o.kind !== "medication") return false;
    const key = norm(o.label);
    if (seenDrugs.has(key)) return false;
    seenDrugs.add(key);
    return true;
  });
  const medLines = currentMeds.map((m) => m.value_text ?? m.label);

  // 12. Plan — today's jobs and orders, one each. Investigations to send, medication changes,
  // and an interdepartmental referral are all just "plan" observations the same way any other
  // job is; a referral is flagged distinctly below (see referralHint) so it does not slip past
  // as an ordinary line item, without this file generating a second document for it.
  const planLines = todaysObservations.filter((o) => o.kind === "plan").map((o) => o.value_text ?? o.label);

  const plan: string[] = [];
  plan.push("Advice and medications:");
  plan.push(...(medLines.length > 0 ? medLines : [BLANK]));
  plan.push("");
  plan.push("Plan:");
  plan.push(...(planLines.length > 0 ? planLines : [BLANK]));

  return {
    header: {
      name: stripPatientHonorific(patient.display_name).toUpperCase(),
      ageSex:
        [patient.age_years !== null ? `${patient.age_years}` : null, sexWord(patient.sex)]
          .filter(Boolean)
          .join(" / ") || "",
      age: patient.age_years !== null ? `${patient.age_years}` : "",
      sex: sexWord(patient.sex),
      uhid: patient.uhid_ip_no,
      doa: istDay(patient.admitted_on),
      unit: options?.wardName ?? null,
      bed: patient.bed,
      ipd: patient.mrd_no,
    },
    caseSeenBy,
    dateTime: now.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }),
    diagnosis,
    observation,
    plan,
  };
}

function renderVital(components: ReturnType<typeof classifyVital>): string {
  if (components.length === 0) return "";
  return components
    .map((c) => `${c.value}${c.flag === "high" ? " ↑" : c.flag === "low" ? " ↓" : ""}`)
    .join("/");
}

function sexWord(sex: string | null): string {
  if (!sex) return "";
  const s = sex.toLowerCase();
  return s === "male" || s === "m" ? "M" : s === "female" || s === "f" ? "F" : sex;
}

/** The plain-text version, for pasting into WhatsApp or an EMR field that only takes text. */
export function formatProgressNoteText(note: ProgressNote): string {
  const out: string[] = [];
  out.push(`${note.header.name}  ${note.header.ageSex}${note.header.bed ? `  Bed ${note.header.bed}` : ""}`);
  if (note.header.uhid) out.push(`UHID: ${note.header.uhid}`);
  // Plain text has no bold or underline, so it gets the closest a monospace medium has: its
  // own line, in caps, set off by blank lines either side — still unmistakably the heading.
  out.push("");
  out.push(note.caseSeenBy.toUpperCase());
  out.push("");
  out.push(`${note.dateTime}`);
  out.push("");
  out.push(...note.observation);
  out.push("");
  out.push(...note.plan);
  out.push("");
  out.push("Signature: " + BLANK);
  out.push("");
  out.push(
    "* This note is generated from what was recorded in WardMate. It is not valid until signed by the treating doctor."
  );
  return out.join("\n");
}

export { BLANK };
