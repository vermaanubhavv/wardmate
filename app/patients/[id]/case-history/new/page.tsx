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
 * through the whole ward.
 *
 * Two ways in, side by side, neither nested behind the other:
 *   - Speak it — dictate the whole clerking against a visible format checklist, so nothing is
 *     missed; the parts are transcribed and sorted into cards to check.
 *   - Build it card by card — walk complaints, history and examination one card at a time.
 * "Not clerked yet" is a real state, so skipping is one tap.
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
          Do it now, while {name}&rsquo;s sheet is in hand — whichever way suits. You can also
          come back to it later from the patient&rsquo;s page.
        </p>

        {/* Route 1 — speak it against the visible format. */}
        <div className="mt-5">
          <p className="text-[15px] font-semibold">Speak it</p>
          <CaseHistoryCapture
            patientId={id}
            variant="speak"
            savedHref={`/patients/${id}/case-history`}
          />
        </div>

        {/* Route 2 — clerk it in the app, card by card. */}
        <Link
          href={`/patients/${id}/case-history`}
          className="ios-group mt-6 block px-4 py-4 active:bg-chip"
        >
          <p className="text-[15px] font-semibold text-accent">Build it card by card</p>
          <p className="mt-1 text-[13px] leading-relaxed text-muted">
            Walk through complaints, history and examination one card at a time. Dictate or type
            each card.
          </p>
        </Link>

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
