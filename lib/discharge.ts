import { dayLabel, managementLabel, stripPatientHonorific } from "@/lib/patients";
import { canonicalLabName } from "@/lib/lab-ranges";
import { RADIOLOGY_LABEL } from "@/lib/radiology-flags";
import { listedComorbidities } from "@/lib/comorbidities";
import { medicationFields, type MedicationFields } from "@/lib/medication-fields";
import { drugKey } from "@/lib/formulary";
import {
  esicFrequency,
  esicRoute,
  esicDoseUnit,
  esicDurationUnit,
} from "@/lib/esic-prescription-codes";
import type { Observation, PatientState } from "@/lib/patient-state";

export type DischargePatient = {
  display_name: string;
  age_years: number | null;
  sex: string | null;
  bed: string;
  mrd_no: string | null;
  primary_diagnosis: string | null;
  admitted_on: string;
  surgery_date: string | null;
  post_op_day: number | null;
  admission_day: number;
  management: string | null;
};

/** What the app cannot know and must not invent: a label and a blank to write on. */
const BLANK = "____________________";

/** The fixed panel the unit's own blank discharge template prints, in this order and with
 *  these units — "the box" on the real form, not an open-ended list of every lab ever sent.
 *  canonical is the name lib/lab-ranges.ts's canonicalLabName() resolves to, so "S. Creatinine"
 *  and "Creatinine" land in the same row regardless of how the resident said it. A test never
 *  recorded prints its row with a blank value rather than being dropped, so what still needs
 *  filling in by hand is visible rather than silently absent. */
const INVESTIGATION_PANEL: { label: string; canonical: string; unit: string }[] = [
  { label: "Hb", canonical: "Hb", unit: "g/dl" },
  { label: "TLC", canonical: "TLC", unit: "Ug/dl" },
  { label: "S. Creatinine", canonical: "Creatinine", unit: "mg/dl" },
  { label: "T. Bilirubin", canonical: "T. bilirubin", unit: "mg/dl" },
  { label: "Platelets", canonical: "Platelets", unit: "" },
];

/** The pathology/HPE report is never in the same "lab" shape a blood value is — it is prose,
 *  not a number — so it is matched by label the same way radiology is, rather than folded into
 *  the fixed panel above. */
const PATHOLOGY_LABEL = /\b(hpe|histopath\w*|biopsy)\b/i;

/** Guards "History and course in hospital" against a vital that landed under kind "note" —
 *  seen from a messy case-history extraction, a BP or PR reading printed as narrative rather
 *  than in Condition at discharge where it belongs. Genuine history prose never carries one of
 *  these labels on its own, so excluding the label is safe rather than guessing at content. */
const VITAL_LOOKING_LABEL = /^(bp|blood pressure|pr|pulse|pulse rate|heart rate|hr|spo2|rr|respiratory rate|temp|temperature)$/i;

/** The unit's own standard discharge set for an uncomplicated general-surgery stay, read off
 *  the actual examples this was built from — T. Pan, T. Emset, Syp Digene, T. Chymoral Forte,
 *  T. Voveran, each with the unit's own usual dose/frequency/duration. Prints ONLY when nothing
 *  was actually charted as a discharge medication, and — the same rule "Conscious Oriented"
 *  and every other default in this app follows — is replaced wholesale by the real list the
 *  moment one exists, never merged with it. An editable starting point on a form a doctor signs,
 *  not a value written into the record.
 *
 *  Written as the phrases a resident would actually say, then read apart by the same
 *  medicationFields() every recorded drug goes through — so the default and the real thing
 *  land in identical columns rather than one being hand-shaped to fit. */
const STANDARD_ADVICE: { name: string; phrase: string }[] = [
  { name: "T. Pan 40mg", phrase: "T. Pan 40mg 1 tablet OD PO for 7 days" },
  { name: "T. Emset 4mg", phrase: "T. Emset 4mg 1 tablet OD PO for 7 days" },
  { name: "Syp Digene", phrase: "Syp Digene 2 tsf TDS PO for 7 days" },
  { name: "T. Chymoral Forte", phrase: "T. Chymoral Forte 1 tablet TDS PO for 7 days" },
  { name: "T. Voveran 75mg", phrase: "T. Voveran 75mg SOS PO for 7 days" },
];

/** Same deliberate default: the exact wording the unit's own examples use for "nothing
 *  significant", printed only when no comorbidity was ever actually recorded for this patient,
 *  replaced wholesale the moment one is. */
/** The unit's standard discharge course. Every one of the nine real discharge summaries this
 *  was built from prescribes 7 days, so a drug dictated without a duration gets 7 rather than a
 *  blank column. A duration that WAS dictated always wins — see medicationFields. */
const DEFAULT_DISCHARGE_DAYS = 7;

const NO_COMORBIDITY_DEFAULT =
  "NO COMORBIDITIES PRESENT. AND NO SIGNIFICANT PAST HISTORY. NO PREVIOUS HISTORY OF TB/ CONTACT OF TB.";

const istDay = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });

export type DischargeNote = {
  /** The unit's own letterhead text, set once per ward in /unit — see
   *  supabase/patches/0019_letterhead.sql. Null when nobody has set one yet. */
  letterhead: string | null;
  header: {
    name: string;
    age: string;
    sex: string;
    /** Not tracked by this app — the template has boxes for them, so they print blank for the
     *  resident to fill by hand, same as the real form does for anyone whose insurance number
     *  or family/self status was never entered anywhere in WardMate. */
    insNo: string;
    ipFamily: string;
    mrdNo: string | null;
    ward: string;
    doa: string;
    dod: string;
  };
  finalDiagnosis: string | null;
  procedure: string | null;
  /** Recorded notes to be written up into prose by the doctor — never synthesised by this app.
   *  Empty means nothing was ever said on a round to build a history from. */
  history: string[];
  /** The editable "nothing significant" default, or the patient's own recorded comorbidities,
   *  whichever applies — see NO_COMORBIDITY_DEFAULT above. */
  pastMedicalHistory: string;
  conditionAtDischarge: { vitals: string; exam: string[] };
  /** Page 2's fixed panel, in INVESTIGATION_PANEL's order — value is "" when never recorded. */
  investigations: { label: string; unit: string; value: string }[];
  /** Na / K / Cl as one combined row, matching the template — each part blank independently
   *  rather than the whole row disappearing if only one of the three was recorded. */
  naKCl: { na: string; k: string; cl: string };
  /** Every radiology report on file, verbatim — not just the ones flagged abnormal, unlike
   *  lib/radiology-flags.ts's own use elsewhere. Empty means leave the space blank to write in. */
  radiology: string[];
  /** Every HPE/biopsy report on file, verbatim. Empty means leave the space blank. */
  pathology: string[];
  /** Discharge medications as the six fields a prescription actually needs — see
   *  lib/medication-fields.ts. Any field the resident never stated is null, printed blank.
   *  formularyName is the hospital's own catalogue wording where a clinician has confirmed
   *  which entry this drug is (see lib/formulary.ts), null until then — never guessed. */
  advice: {
    rows: (MedicationFields & {
      drugKey: string;
      /** The drug's own short name as extraction recorded it ("piperacillin"), separate from
       *  the full dictated phrase in `drug` ("4.5 grams IV TDS"). This is what a formulary
       *  search must start from — the phrase often contains no drug name at all. */
      drugName: string;
      formularyName: string | null;
      /** The hospital prescribing system's own wording, so the printed summary reads exactly
       *  as that screen does and can be copied across without translation. Null wherever the
       *  resident never said the thing, or the hospital's list has no equivalent for it. */
      esicFrequency: string | null;
      esicRoute: string | null;
      esicDose: string | null;
      esicDuration: string | null;
    })[];
    isDefault: boolean;
  };
  followUp: string[];
  pendingCount: number;
  missingLabels: string[];
  assembledNote: string;
};

/**
 * The discharge summary, in the unit's own layout, built to the unit's own examples.
 *
 * Two rules run through it, the same two the rest of the app follows.
 *
 * Nothing is invented, with two narrow, explicit exceptions the resident asked for: the
 * "no comorbidities" line and the standard discharge medication set, both editable starting
 * points that get replaced wholesale — never merged — the moment the real thing is recorded.
 * Everything else prints only what was said or photographed on a round; the narrative sections
 * of a real summary are the work of a doctor who saw the patient, so they print as recorded
 * notes to be written up, not synthesised prose.
 *
 * Nothing absent is hidden. A field with no value prints blank rather than silent, so what
 * still needs filling in is visible before signing rather than discovered by whoever reads it
 * next.
 */
export function buildDischargeNote(
  patient: DischargePatient,
  state: PatientState,
  medications: Observation[],
  procedure: string | null,
  options?: {
    wardName?: string | null;
    letterhead?: string | null;
    /** Confirmed drug-key -> formulary-entry mappings for this ward. Absent means the ward has
     *  not imported a formulary; every row simply carries no formulary name. */
    formularyMappings?: Map<string, string>;
  }
): DischargeNote {
  const today = new Date().toISOString();

  const notes = kinds(state, ["note", "diagnosis"]).filter((o) => !VITAL_LOOKING_LABEL.test(o.label.trim()));
  const history = notes.map((o) => o.value_text ?? o.label);

  const comorbidities = listedComorbidities(state.latest);
  const pastMedicalHistory =
    comorbidities.length > 0 ? comorbidities.join("; ").toUpperCase() : NO_COMORBIDITY_DEFAULT;

  const vitals = kinds(state, ["vital"]);
  const exam = kinds(state, ["exam", "drain", "intake_output"]);
  const conditionAtDischarge = {
    vitals: vitals.length > 0 ? vitals.map((o) => `${o.label.toUpperCase()} ${o.value_text}`).join("   ") : "",
    exam: exam.map((o) => `${o.label.toUpperCase()} – ${o.value_text}`),
  };

  // Page 2's fixed panel — matched by canonical name so "S. Creatinine" and "Creatinine" land
  // in the same row, the same matching lib/lab-ranges.ts uses everywhere else in the app.
  const labs = kinds(state, ["lab"]).filter((o) => !RADIOLOGY_LABEL.test(o.label) && !PATHOLOGY_LABEL.test(o.label));
  const byCanonicalName = new Map<string, Observation>();
  for (const o of labs) {
    const key = canonicalLabName(o.label);
    const existing = byCanonicalName.get(key);
    if (!existing || o.recorded_at > existing.recorded_at) byCanonicalName.set(key, o);
  }
  const investigations = INVESTIGATION_PANEL.map((row) => ({
    label: row.label,
    unit: row.unit,
    value: byCanonicalName.get(row.canonical)?.value_text ?? "",
  }));
  const naKCl = {
    na: byCanonicalName.get("Na")?.value_text ?? "",
    k: byCanonicalName.get("K")?.value_text ?? "",
    cl: byCanonicalName.get("Cl")?.value_text ?? "",
  };

  const radiology = kinds(state, ["lab"])
    .filter((o) => RADIOLOGY_LABEL.test(o.label) || RADIOLOGY_LABEL.test(o.value_text ?? ""))
    .map((o) => `${o.label.toUpperCase()}: ${o.value_text}`);

  const pathology = kinds(state, ["lab"])
    .filter((o) => PATHOLOGY_LABEL.test(o.label) || PATHOLOGY_LABEL.test(o.value_text ?? ""))
    .map((o) => `${o.label.toUpperCase()}: ${o.value_text}`);

  // The formulary name is attached where a clinician has confirmed one for this drug, and left
  // null otherwise. Nothing here searches or matches — see lib/formulary.ts.
  const withFormulary = (label: string, valueText: string | null) => {
    const key = drugKey(label);
    const fields = medicationFields(label, valueText, {
      defaultDurationDays: DEFAULT_DISCHARGE_DAYS,
    });
    const doseUnit = esicDoseUnit(fields.doseUnitCode);
    const durUnit = esicDurationUnit(fields.durationUnitCode);
    // The dose number is the resident's own; only the unit is translated into the hospital's
    // wording. A unit their list has no entry for (an inhaler puff) leaves this blank rather
    // than being mapped to something adjacent.
    const doseNumber = fields.dose?.match(/^[\d.]+/)?.[0] ?? null;
    return {
      ...fields,
      drugKey: key,
      drugName: label.trim(),
      formularyName: options?.formularyMappings?.get(key) ?? null,
      esicFrequency: esicFrequency(fields.frequencyCode)?.text ?? null,
      esicRoute: esicRoute(fields.routeCode)?.text ?? null,
      esicDose: doseNumber && doseUnit ? `${doseNumber} ${doseUnit.text}` : null,
      esicDuration:
        fields.durationValue !== null && durUnit ? `${fields.durationValue} ${durUnit.text}` : null,
    };
  };

  const advice =
    medications.length > 0
      ? { rows: medications.map((m) => withFormulary(m.label, m.value_text)), isDefault: false }
      : { rows: STANDARD_ADVICE.map((d) => withFormulary(d.name, d.phrase)), isDefault: true };

  const followUp = state.openTasks.map((t) => t.value_text ?? t.label);

  const management = managementLabel(patient);
  const assembledNote = `Assembled from what was recorded on the round (${dayLabel(patient)}${
    management ? `, ${management}` : ""
  }). Blanks are things the app was never told; the comorbidities line and the discharge medications are editable defaults, not what was necessarily said — check both before signing.`;

  return {
    letterhead: options?.letterhead?.trim() || null,
    header: {
      name: stripPatientHonorific(patient.display_name).toUpperCase(),
      age: patient.age_years !== null ? `${patient.age_years} YEARS` : "",
      sex: sexWord(patient.sex),
      insNo: "",
      ipFamily: "",
      mrdNo: patient.mrd_no,
      ward: (options?.wardName ?? "GENERAL SURGERY").toUpperCase(),
      doa: istDay(patient.admitted_on),
      dod: istDay(today),
    },
    finalDiagnosis: patient.primary_diagnosis,
    procedure: procedure
      ? `${procedure.toUpperCase()}${patient.surgery_date ? ` ON ${istDay(patient.surgery_date)}` : ""}`
      : null,
    history,
    pastMedicalHistory,
    conditionAtDischarge,
    investigations,
    naKCl,
    radiology,
    pathology,
    advice,
    followUp,
    pendingCount: state.pending.length,
    missingLabels: state.missing.map((m) => m.item.label),
    assembledNote,
  };
}

/** The plain-text version, for pasting into WhatsApp or an EMR field that only takes text —
 *  same content buildDischargeNote assembles, flattened into one copyable block. */
export function formatDischargeText(note: DischargeNote): string {
  const out: string[] = [];
  if (note.letterhead) out.push(note.letterhead, "");
  out.push("DISCHARGE SUMMARY", "");
  out.push(`NAME – ${note.header.name}`);
  out.push(`AGE – ${note.header.age || BLANK}`);
  out.push(`SEX – ${note.header.sex || BLANK}`);
  out.push(`INS. NO./EMP ID – ${note.header.insNo || BLANK}`);
  out.push(`MRD NO. ${note.header.mrdNo || BLANK}`);
  out.push(`IP/FAMILY – ${note.header.ipFamily || BLANK}`);
  out.push(`WARD – ${note.header.ward}`);
  out.push(`D.O.A – ${note.header.doa}`);
  out.push(`D.O.D – ${note.header.dod}`);
  out.push("");

  out.push(`FINAL DIAGNOSIS: ${(note.finalDiagnosis || BLANK).toUpperCase()}`);
  if (note.procedure) out.push(`PROCEDURE: ${note.procedure}`);
  out.push("");

  out.push("HISTORY AND COURSE IN HOSPITAL");
  if (note.history.length > 0) {
    out.push("  Recorded on the round — to be written up:");
    for (const line of note.history) out.push(`  · ${line}`);
  } else {
    out.push(`  ${BLANK}`);
  }
  out.push("");

  out.push("PAST MEDICAL HISTORY");
  out.push(`  ${note.pastMedicalHistory}`);
  out.push("");

  out.push("CONDITION AT DISCHARGE –");
  out.push(`  ${note.conditionAtDischarge.vitals || `BP – ${BLANK}   PR – ${BLANK}`}`);
  if (note.conditionAtDischarge.exam.length > 0) {
    for (const line of note.conditionAtDischarge.exam) out.push(`  ${line}`);
  } else {
    out.push(`  P/ABD – ${BLANK}`);
  }
  out.push("");

  out.push("INVESTIGATIONS DONE DURING STAY");
  for (const row of note.investigations) {
    out.push(`  ${row.label} – ${row.value || BLANK}${row.unit ? ` ${row.unit}` : ""}`);
  }
  out.push(`  Na/K/Cl – ${note.naKCl.na || BLANK} / ${note.naKCl.k || BLANK} / ${note.naKCl.cl || BLANK}`);
  out.push("");
  out.push("  RADIOLOGY:");
  if (note.radiology.length > 0) {
    for (const line of note.radiology) out.push(`    ${line}`);
  } else {
    out.push(`    ${BLANK}`);
  }
  out.push("  PATHOLOGY / HPE:");
  if (note.pathology.length > 0) {
    for (const line of note.pathology) out.push(`    ${line}`);
  } else {
    out.push(`    ${BLANK}`);
  }
  out.push("");

  out.push("ADVICE ON DISCHARGE");
  note.advice.rows.forEach((row, i) => {
    // Only the fields that were actually stated — a blank column is not written out as an
    // empty dash in a block somebody may paste into a prescription.
    const parts = [
      row.esicDose ?? row.dose,
      row.esicFrequency,
      row.esicDuration ?? row.duration,
      row.esicRoute,
      row.quantity ? `Qty ${row.quantity}` : null,
    ]
      .filter(Boolean)
      .join(" · ");
    out.push(`  ${i + 1}. ${row.drug}${parts ? ` — ${parts}` : ""}`);
  });
  out.push("");

  if (note.followUp.length > 0) {
    out.push("FOLLOW UP — still outstanding on the round:");
    for (const line of note.followUp) out.push(`  · ${line}`);
    out.push("");
  }
  out.push(`REVIEW IN OPD ON ${BLANK}`);
  out.push("");

  if (note.pendingCount > 0) out.push(`!! ${note.pendingCount} value(s) here were never confirmed — check first.`, "");
  if (note.missingLabels.length > 0) out.push(`!! Never recorded: ${note.missingLabels.join(", ")}`, "");

  out.push("NAME AND SIGNATURE OF DOCTOR", "");
  out.push(`— ${note.assembledNote}`);

  return out.join("\n");
}

function sexWord(sex: string | null): string {
  if (sex === "M") return "MALE";
  if (sex === "F") return "FEMALE";
  if (sex === "other") return "OTHER";
  return "";
}

/**
 * The newest value for each thing of the given kinds.
 *
 * From `latest` rather than `extra`: `extra` holds only what the operation's checklist did not
 * ask about, so building a summary from it would silently omit every value the template DOES
 * expect — the haemoglobin and the drain output, which is most of what a discharge needs.
 */
function kinds(state: PatientState, wanted: string[]): Observation[] {
  return state.latest.filter((o) => wanted.includes(o.kind));
}
