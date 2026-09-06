import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { stripPatientHonorific } from "@/lib/patients";
import { getWardLabRanges } from "@/lib/ward-lab-ranges";
import { summariseCaseHistory } from "@/lib/case-history";
import { summariseObjective } from "@/lib/exam-summary";
import type { Observation } from "@/lib/patient-state";
import { ObjectiveSummaryView } from "../../case-history-card";
import PrintButton from "../../note/print-button";

/**
 * The printable clerking sheet: complaints and history on the first side, examination /
 * provisional diagnosis / differential / plan / treatment on the second, with a forced page
 * break between them.
 *
 * Built from the same observations the workspace edits and rendered through the same
 * summariseCaseHistory / summariseObjective the patient page uses, so paper and screen can
 * never disagree. Browser print → "Save as PDF" produces the file; same pattern as the
 * discharge summary's print page.
 */
function Section({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <div className="mt-3 first:mt-0">
      <p className="text-[12px] font-bold uppercase tracking-wide">{heading}</p>
      <div className="mt-0.5 text-[13px] leading-snug">{children}</div>
    </div>
  );
}

export default async function CaseHistoryPrintPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: patient } = await supabase
    .from("current_patients")
    .select(
      "id, ward_id, display_name, bed, sex, age_years, admitted_on, uhid_ip_no, mrd_no, primary_diagnosis"
    )
    .eq("id", id)
    .maybeSingle();
  if (!patient) notFound();

  const [{ data: entriesData }, wardRanges, { data: ward }] = await Promise.all([
    supabase
      .from("entries")
      .select(
        "recorded_at, observations(id, kind, label, value_text, value_num, unit, source_quote, needs_confirmation, confirmed_at, conflict_note, done_at, urgency, graded_at, recorded_at, pac_verdict, ref_low, ref_high, ref_text)"
      )
      .eq("patient_id", id)
      .eq("is_case_history", true)
      .order("recorded_at", { ascending: true }),
    getWardLabRanges(patient.ward_id),
    supabase.from("wards").select("name").eq("id", patient.ward_id).maybeSingle(),
  ]);

  const fullObservations = ((entriesData ?? []) as unknown as { observations: Observation[] }[]).flatMap(
    (e) => e.observations
  );

  const { sections, other } = summariseCaseHistory(fullObservations);
  const historySections = sections.filter((s) => !s.hidden);

  const exam = summariseObjective(
    other.map((o) => ({
      id: o.id,
      label: o.label,
      value: o.value_text,
      recordedAt: o.recorded_at,
      refLow: o.ref_low,
      refHigh: o.ref_high,
      refText: o.ref_text,
    })),
    { sex: patient.sex, wardRanges }
  );
  const examEmpty =
    exam.vitals.length === 0 &&
    !exam.piccle &&
    exam.findings.length === 0 &&
    exam.labs.length === 0 &&
    exam.keyLabs.length === 0 &&
    !exam.imaging &&
    exam.normalLabCount === 0 &&
    exam.normalCount === 0;

  const differential =
    fullObservations
      .find((o) => o.label.toLowerCase().trim() === "differential diagnosis")
      ?.value_text?.split(/\s*;\s*|\s*\|\s*/)
      .map((s) => s.trim())
      .filter(Boolean) ?? [];

  const planItems = fullObservations
    .filter((o) => o.kind === "plan")
    .map((o) => (o.value_text ?? "").trim())
    .filter(Boolean);

  const name = stripPatientHonorific(patient.display_name);
  const idLine = [
    patient.age_years != null ? `${patient.age_years} yrs` : null,
    patient.sex,
    patient.bed ? `Bed ${patient.bed}` : null,
    patient.uhid_ip_no ? `UHID/IP ${patient.uhid_ip_no}` : patient.mrd_no ? `MRD ${patient.mrd_no}` : null,
    patient.admitted_on ? `Admitted ${patient.admitted_on.slice(0, 10)}` : null,
  ]
    .filter(Boolean)
    .join("  ·  ");

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col bg-background print:max-w-none print:bg-white">
      <header className="px-4 pb-3 pt-6 print:hidden">
        <Link href={`/patients/${id}/case-history`} className="text-[17px] text-accent">
          ‹ Case history
        </Link>
        <h1 className="mt-3 ios-large-title">Case history sheet</h1>
        <p className="mt-1 text-[15px] text-muted">
          Complaints and history print on the first page, examination and plan on the second.
          Use your browser&rsquo;s print dialog to print or save as PDF.
        </p>
      </header>

      <section className="px-4 pb-4 print:px-0">
        <div className="ios-group px-5 py-5 text-black print:rounded-none print:border-0 print:p-0 print:shadow-none">
          {/* ---- Side 1 : complaints + history ---- */}
          <div style={{ breakAfter: "page" }}>
            <div className="text-center">
              {ward?.name && <p className="text-[14px] font-bold">{ward.name}</p>}
              <p className="mt-1 border border-black py-1 text-[15px] font-bold uppercase">
                Case history
              </p>
            </div>
            <div className="mt-2 border-b border-black pb-2 text-[13px]">
              <p className="text-[15px] font-bold">{name}</p>
              {idLine && <p className="mt-0.5">{idLine}</p>}
            </div>

            {historySections.map((s) => (
              <Section key={s.key} heading={s.label}>
                {s.lines.length > 0 ? (
                  s.lines.map((line) => <p key={line.id}>{line.text}</p>)
                ) : (
                  <p>{s.note}</p>
                )}
              </Section>
            ))}
          </div>

          {/* ---- Side 2 : examination + diagnosis + plan + treatment ---- */}
          <div>
            <p className="text-[12px] font-bold uppercase tracking-wide">Examination</p>
            <div className="mt-0.5 text-[13px] leading-snug">
              {examEmpty ? (
                <p className="text-muted">Not recorded.</p>
              ) : (
                <ObjectiveSummaryView summary={exam} />
              )}
            </div>

            <Section heading="Provisional diagnosis">
              {patient.primary_diagnosis ? <p>{patient.primary_diagnosis}</p> : <p className="text-muted">—</p>}
            </Section>

            {differential.length > 0 && (
              <Section heading="Differential diagnosis">
                {differential.map((d, i) => (
                  <p key={i}>{d}</p>
                ))}
              </Section>
            )}

            <Section heading="Plan">
              {planItems.length > 0 ? (
                planItems.map((p, i) => <p key={i}>• {p}</p>)
              ) : (
                <p className="text-muted">—</p>
              )}
            </Section>

            <div className="mt-3">
              <p className="text-[12px] font-bold uppercase tracking-wide">Treatment / orders</p>
              <div className="mt-1">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="h-6 border-b border-dotted border-black/50" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-2 px-4 pb-10 print:hidden">
        <PrintButton />
      </section>
    </div>
  );
}
