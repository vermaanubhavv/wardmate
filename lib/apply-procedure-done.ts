import { createClient } from "@/lib/supabase/server";
import { istDate } from "@/lib/urgency";
import { resolveProcedure, listTemplateChoices } from "@/lib/templates";
import type { ExtractedObservation } from "@/lib/extract";

export type PatientForProcedureDone = {
  surgery_date: string | null;
  template_family: string | null;
  template_variant: string | null;
  procedure_text: string | null;
};

/**
 * When today's round states an operation has actually been carried out — kind "procedure_done",
 * see lib/extract.ts — the patient flips to post-operative immediately, with no separate
 * confirmation step. This is the one write that does it: surgery_date is the single fact that
 * already drives the post-op day count (the current_patients view), the discharge summary's
 * operative date, the progress note's status line, and — via lib/templates.ts phaseFor() and
 * getTemplateForPatient() — which checklist and which published protocol apply. Setting it here
 * is the one place all of that switches at once; nothing downstream needs to know this ran.
 *
 * Only fires once: a patient whose surgery_date is already set is left untouched, so a later,
 * unrelated mention of the same operation (someone describing it as history on a subsequent
 * round) can never re-trigger or overwrite it. If the round names more than one completed
 * procedure, the first one found wins — a patient has one operation that flips this, not several.
 */
export async function applyProcedureDone(
  supabase: Awaited<ReturnType<typeof createClient>>,
  patientId: string,
  patient: PatientForProcedureDone,
  observations: ExtractedObservation[]
): Promise<void> {
  if (patient.surgery_date) return;

  const done = observations.find((o) => o.kind === "procedure_done");
  if (!done) return;

  // Typed once at admission, this is the same lookup updatePatientIdentity() uses when a
  // resident manually marks someone post-op — matching a name the library knows brings its
  // checklist/protocol along; anything else is kept as the unit's own wording, with no
  // template applied rather than one invented for an operation nobody described.
  const resolved = resolveProcedure(done.value_text, await listTemplateChoices());

  await supabase
    .from("patients")
    .update({
      surgery_date: istDate(new Date().toISOString()),
      planned_surgery_date: null,
      procedure_text: patient.procedure_text ?? resolved.procedure_text,
      // Never overwrite a template already assigned at admission — only fill it in when the
      // patient did not have one yet.
      template_family: patient.template_family ?? resolved.template_family,
      template_variant: patient.template_family ? patient.template_variant : resolved.template_variant,
    })
    .eq("id", patientId);
}
