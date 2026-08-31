import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { stripPatientHonorific } from "@/lib/patients";
import CaseHistoryCapture from "../../case-history-capture";

/**
 * The clerking screen a just-admitted patient lands on.
 *
 * Adding a patient drops the resident straight here rather than on the patient page, because
 * the clerking note is written right after admitting somebody — not after a later trip back
 * through the whole ward. The capture control is the whole page and starts expanded; once
 * something is saved it carries on to the patient. "Not clerked yet" is a real state, so
 * skipping is one tap.
 *
 * Reached again later (a patient already has a case history) there is nothing to start, so it
 * redirects to the review workspace instead.
 */
export default async function NewCaseHistoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: patient }, { count: existing }] = await Promise.all([
    supabase
      .from("current_patients")
      .select("id, display_name, bed")
      .eq("id", id)
      .maybeSingle(),
    supabase
      .from("entries")
      .select("id", { count: "exact", head: true })
      .eq("patient_id", id)
      .eq("is_case_history", true),
  ]);

  if (!patient) notFound();
  if (existing && existing > 0) redirect(`/patients/${id}/case-history`);

  const name = stripPatientHonorific(patient.display_name);

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
      <header className="flex items-baseline justify-between gap-3 px-4 pb-3 pt-6">
        <Link href="/ward" className="text-[17px] text-accent">
          ‹ Ward
        </Link>
        <p className="truncate text-[13px] text-muted">
          {name}
          {patient.bed ? ` · bed ${patient.bed}` : ""}
        </p>
      </header>

      <main className="flex-1 px-4 pb-10 pt-2">
        <h1 className="ios-large-title">Case history</h1>
        <p className="mt-2 text-[15px] leading-relaxed text-muted">
          Photograph, upload, or dictate {name}&rsquo;s clerking sheet now, while it is in hand.
          You can also do this later from the patient&rsquo;s page.
        </p>

        <div className="ios-group mt-5">
          <CaseHistoryCapture patientId={id} defaultOpen savedHref={`/patients/${id}`} />
        </div>

        <Link
          href={`/patients/${id}`}
          className="mt-5 block rounded-[10px] border border-line px-4 py-3 text-center text-[15px] text-muted"
        >
          Skip for now — go to patient
        </Link>
      </main>
    </div>
  );
}
