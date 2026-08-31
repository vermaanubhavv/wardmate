import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { stripPatientHonorific } from "@/lib/patients";
import { getWardLabRanges } from "@/lib/ward-lab-ranges";
import type { Observation } from "@/lib/patient-state";
import CaseHistoryWorkspace, { type WorkspaceObs } from "./case-history-workspace";

/**
 * The case-history review workspace — the clerking note walked one card at a time, the same
 * card-stack the discharge summary uses (app/patients/[id]/discharge/discharge-workspace.tsx).
 *
 * Everything is compiled straight from what was photographed or dictated at clerking; edits go
 * back into the same observations, so the patient-page summary, the "as recorded" evidence and
 * this page never disagree.
 */
export default async function CaseHistoryWorkspacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: patient } = await supabase
    .from("current_patients")
    .select("id, ward_id, display_name, bed, sex, primary_diagnosis")
    .eq("id", id)
    .maybeSingle();
  if (!patient) notFound();

  const [{ data: entriesData }, wardRanges] = await Promise.all([
    supabase
      .from("entries")
      .select(
        "recorded_at, observations(id, kind, label, value_text, value_num, unit, source_quote, needs_confirmation, confirmed_at, conflict_note, done_at, urgency, graded_at, recorded_at, pac_verdict, ref_low, ref_high, ref_text)"
      )
      .eq("patient_id", id)
      .eq("is_case_history", true)
      .order("recorded_at", { ascending: true }),
    getWardLabRanges(patient.ward_id),
  ]);

  const fullObservations = ((entriesData ?? []) as unknown as { observations: Observation[] }[]).flatMap(
    (e) => e.observations
  );

  // A lean shape for the client — the workspace only edits label/value, and derives every
  // card's state from these.
  const observations: WorkspaceObs[] = fullObservations.map((o) => ({
    id: o.id,
    kind: o.kind,
    label: o.label,
    value: o.value_text,
  }));

  // The examination preview on the Review card is rendered by the same CaseHistoryCard the
  // patient page uses; it needs the ward's learned lab ranges as a plain array to survive the
  // server→client boundary.
  const rangeEntries = Array.from(wardRanges.entries());

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
      <header className="flex items-baseline justify-between gap-3 px-4 pb-3 pt-6">
        <Link href={`/patients/${id}`} className="text-[17px] text-accent">
          ‹ Patient
        </Link>
        <p className="truncate text-[13px] text-muted">
          Case history · {stripPatientHonorific(patient.display_name)}
          {patient.bed ? ` · bed ${patient.bed}` : ""}
        </p>
      </header>

      <CaseHistoryWorkspace
        patientId={id}
        sex={patient.sex}
        primaryDiagnosis={patient.primary_diagnosis}
        observations={observations}
        fullObservations={fullObservations}
        rangeEntries={rangeEntries}
      />
    </div>
  );
}
