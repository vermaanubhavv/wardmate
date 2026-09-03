import type { SupabaseClient } from "@supabase/supabase-js";
import type { DictationContext, NoteType, Specialty } from "./lexicon";
import { describeSelection, getDeepgramKeyterms } from "./selectMedicalKeyterms";

/**
 * Map WardMate's existing patient data onto the DictationContext the keyterm selector reads.
 *
 * No schema migration: everything here is derived from columns and observations that already
 * exist. `current_patients` carries the typed primary diagnosis, the operation and the post-op
 * day; the `observations` table carries every diagnosis, drug, drain and plan that has been
 * spoken since. The two together are enough to choose 20–50 keyterms for a patient.
 */

/** WardMate is a general-surgical ward product today. The field exists so a future pack can
 *  set something else through the same selector. */
export const DEFAULT_SPECIALTY: Specialty = "general-surgery";

type PatientRow = {
  primary_diagnosis?: string | null;
  procedure_text?: string | null;
  template_family?: string | null;
  template_variant?: string | null;
  surgery_date?: string | null;
  post_op_day?: number | null;
};

type ObservationRow = {
  kind: string;
  label: string | null;
  value_text: string | null;
};

const DEVICE_WORDS =
  /\b(ryle|nasogastric|ng tube|foley|catheter|drain|romovac|pigtail|icd|chest tube|central line|cvc|picc|stoma|ileostomy|colostomy|tracheostomy|et tube|endotracheal)\b/i;

/** The label a template family maps to, for a planned-but-not-done operation. */
function plannedProcedureFromTemplate(row: PatientRow): string | null {
  if (row.surgery_date || row.post_op_day != null) return null;
  if (row.procedure_text) return row.procedure_text;
  if (!row.template_family) return null;
  const variant = row.template_variant ? ` ${row.template_variant}` : "";
  return `${row.template_family}${variant}`.trim();
}

export function deriveDictationContext(input: {
  patientId?: string;
  patient: PatientRow;
  observations?: ObservationRow[];
  ward?: string;
  noteType?: NoteType;
  specialty?: Specialty;
  customTerms?: DictationContext["customTerms"];
}): DictationContext {
  const { patient, observations = [] } = input;
  const operated = Boolean(patient.surgery_date) || patient.post_op_day != null;

  const spokenDiagnoses = observations
    .filter((o) => o.kind === "diagnosis")
    .map((o) => o.value_text || o.label || "")
    .filter(Boolean);

  const diagnoses = dedupe(
    [patient.primary_diagnosis ?? "", ...spokenDiagnoses].map((s) => s.trim()).filter(Boolean)
  );

  const procedures = operated
    ? dedupe([patient.procedure_text ?? "", templateLabel(patient)].filter(Boolean))
    : [];

  const plannedProcedure = plannedProcedureFromTemplate(patient);
  const plannedProcedures = plannedProcedure ? [plannedProcedure] : [];

  const medications = dedupe(
    observations
      .filter((o) => o.kind === "medication")
      .map((o) => o.label || o.value_text || "")
      .map(cleanDrug)
      .filter(Boolean)
  );

  const drainRows = observations.filter((o) => o.kind === "drain");
  const drains = dedupe(drainRows.map((o) => o.label || "Drain").filter(Boolean));

  // Devices named inside any exam / plan / note observation ("Ryle's tube in situ").
  const devices = dedupe(
    observations
      .filter((o) => o.kind === "exam" || o.kind === "plan" || o.kind === "note")
      .map((o) => o.value_text || "")
      .filter((t) => DEVICE_WORDS.test(t))
      .map((t) => t.trim())
  );

  const investigations = dedupe(
    observations
      .filter((o) => o.kind === "lab")
      .map((o) => o.label || "")
      .filter(Boolean)
  );

  const plans = observations
    .filter((o) => o.kind === "plan")
    .map((o) => o.value_text || o.label || "")
    .filter(Boolean);

  return {
    patientId: input.patientId,
    specialty: input.specialty ?? DEFAULT_SPECIALTY,
    ward: input.ward,
    noteType: input.noteType ?? (operated ? "post-op" : "ward-round"),
    diagnoses,
    procedures,
    plannedProcedures,
    medications,
    devices,
    drains,
    investigations,
    postOpDay: patient.post_op_day ?? null,
    freeTextContext: plans.slice(0, 12),
    customTerms: input.customTerms,
  };
}

/**
 * One context for a whole-ward round dictation — the union of every active patient's diagnosis
 * and operation. Broader than a single-patient context by design: the resident is about to
 * dictate on all of them in one pass, so every ward's conditions should be boosted. The token
 * budget in the selector keeps the list from growing without bound on a large ward.
 */
export function deriveWardDictationContext(
  patients: PatientRow[],
  ward?: string
): DictationContext {
  const diagnoses: string[] = [];
  const procedures: string[] = [];
  const plannedProcedures: string[] = [];

  for (const p of patients) {
    if (p.primary_diagnosis) diagnoses.push(p.primary_diagnosis.trim());
    const operated = Boolean(p.surgery_date) || p.post_op_day != null;
    const label = p.procedure_text?.trim() || templateLabel(p);
    if (label) (operated ? procedures : plannedProcedures).push(label);
  }

  return {
    specialty: DEFAULT_SPECIALTY,
    ward,
    noteType: "ward-round",
    diagnoses: dedupe(diagnoses),
    procedures: dedupe(procedures),
    plannedProcedures: dedupe(plannedProcedures),
    postOpDay: null,
  };
}

function templateLabel(row: PatientRow): string {
  if (!row.template_family) return "";
  const variant = row.template_variant ? ` ${row.template_variant}` : "";
  return `${row.template_family}${variant}`.trim();
}

/** A drug label on the chart is often "Inj. Monocef 1g IV BD" — keep the name, drop the rest. */
function cleanDrug(s: string): string {
  return s
    .replace(/\b(inj|tab|cap|syp|iv|im|sc|po|od|bd|tds|qid|sos|stat|hs)\b/gi, " ")
    .replace(/\b\d+(\.\d+)?\s*(mg|g|ml|mcg|units?|iu)\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function dedupe(list: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const s of list) {
    const key = s.toLowerCase().trim();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(s.trim());
  }
  return out;
}

/**
 * The keyterms for one patient, ready for Deepgram — one query, no LLM.
 *
 * Returns `[]` on any failure (missing patient, table not there): the keyterm layer improves
 * transcription, it must never be able to block it. The caller then falls back to the static
 * ward keyterm list.
 *
 * Logs nothing containing a patient identifier or free text (STEP 12 / STEP 13).
 */
export async function getPatientDictationKeyterms(
  supabase: SupabaseClient,
  patientId: string,
  opts: { noteType?: NoteType; ward?: string } = {}
): Promise<string[]> {
  try {
    const { data: patient } = await supabase
      .from("current_patients")
      .select(
        "primary_diagnosis, procedure_text, template_family, template_variant, surgery_date, post_op_day"
      )
      .eq("id", patientId)
      .maybeSingle();

    if (!patient) return [];

    const { data: observations } = await supabase
      .from("observations")
      .select("kind, label, value_text")
      .eq("patient_id", patientId)
      .in("kind", ["diagnosis", "medication", "drain", "exam", "plan", "note", "lab"])
      .order("recorded_at", { ascending: false })
      .limit(200);

    const context = deriveDictationContext({
      patientId,
      patient: patient as PatientRow,
      observations: (observations ?? []) as ObservationRow[],
      noteType: opts.noteType,
      ward: opts.ward,
    });

    if (process.env.NODE_ENV === "development") {
      // PHI-safe: chosen terms and the reasons they were chosen, never a name / UHID / note.
      const d = describeSelection(context);
      console.log(
        `[keyterms] ${d.selectedCount} terms, ~${d.estimatedTokens} tokens | ${d.reasons.join("; ")}`
      );
    }

    return getDeepgramKeyterms(context);
  } catch {
    return [];
  }
}
