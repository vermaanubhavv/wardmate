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
 * Both ways of getting it in are offered side by side, because which one fits depends on what
 * the resident has in hand right now:
 *   - the paper sheet is written → photograph or dictate it, and the cards compile from that;
 *   - nothing is written yet, or they would rather clerk in the app → build it card by card.
 * Neither is nested behind the other. "Not clerked yet" is a real state, so skipping is one tap.
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

        {/* Route 1 — the sheet is already written. */}
        <div className="ios-group mt-5">
          <div className="px-4 pt-4">
            <p className="text-[15px] font-semibold">From the written sheet</p>
            <p className="mt-1 text-[13px] leading-relaxed text-muted">
              Photograph, upload, or dictate it. The cards below are filled in for you to check.
            </p>
          </div>
          <CaseHistoryCapture
            patientId={id}
            defaultOpen
            savedHref={`/patients/${id}/case-history`}
          />
        </div>

        {/* Route 2 — clerk it in the app, card by card. */}
        <Link
          href={`/patients/${id}/case-history`}
          className="ios-group mt-4 block px-4 py-4 active:bg-chip"
        >
          <p className="text-[15px] font-semibold text-accent">Build it card by card</p>
          <p className="mt-1 text-[13px] leading-relaxed text-muted">
            Walk through complaints, history and examination one card at a time. Dictate or type
            each card. Best when nothing is written yet.
          </p>
        </Link>

        {/* Route 3 — dictate the whole thing, sorted into cards live. */}
        {process.env.NEXT_PUBLIC_LIVE_DICTATION === "1" && (
          <Link
            href={`/patients/${id}/case-history?dictate=1`}
            className="ios-group mt-4 block px-4 py-4 active:bg-chip"
          >
            <p className="text-[15px] font-semibold text-accent">Dictate the whole clerking</p>
            <p className="mt-1 text-[13px] leading-relaxed text-muted">
              Speak it in any order — complaints, examination, past history — and each part is
              transcribed and sorted into its card as you go.
            </p>
          </Link>
        )}

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
