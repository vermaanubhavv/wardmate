import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentWard } from "@/lib/ward";
import { compareBeds, patientName } from "@/lib/patients";
import { restorePatient } from "../../patients/actions";
import { DISCHARGE_UNDO_WINDOW_HOURS, getFinalisedDischargeMap, visibleDischargedFilter } from "@/lib/discharged";

type DischargedPatient = {
  id: string;
  display_name: string;
  age_years: number | null;
  sex: string | null;
  bed: string;
  primary_diagnosis: string | null;
  discharged_at: string | null;
  entry_count: number;
};

/**
 * Two different lists, not one growing one.
 *
 * "Saved" is permanent — a discharge summary was deliberately finalised for that patient
 * (discharge_summaries.status = "finalised"), so it stays here indefinitely, exactly like
 * the old /removed page's cards.
 *
 * "Recently discharged" is the actual home of the undo safety net: a patient discharged
 * within the last 48 hours whose summary was never finalised. Past that window with
 * nothing saved, a patient simply stops appearing here — computed fresh on every read from
 * `discharged_at`, no cron job, no status flip, no new column. Nothing is deleted: their
 * entries and observations stay exactly as untouched as any other patient's (see the
 * no-delete comment on dischargePatient, app/patients/actions.ts) — they are just no longer
 * reachable from any list, the same way a truly private conversation is still on the
 * server without being in anyone's inbox.
 */
export default async function DischargedPage() {
  const { ward, error } = await getCurrentWard();

  if (error || !ward) {
    return (
      <main className="flex-1 px-6 py-10 max-w-md mx-auto w-full">
        <h1 className="ios-large-title">Discharged</h1>
        <p className="mt-4 ios-group px-4 py-3 text-[15px] text-orange-700">
          {error ? `Could not read the database: ${error.message}` : "No ward found."}
        </p>
      </main>
    );
  }

  const supabase = await createClient();

  const finalisedAt = await getFinalisedDischargeMap(supabase, ward.id);

  // Either saved for good, or still inside the undo window — anyone outside both simply
  // isn't asked for, rather than fetched and thrown away here.
  const { data } = await supabase
    .from("patients")
    .select("id, display_name, age_years, sex, bed, primary_diagnosis, discharged_at, entries(count)")
    .eq("ward_id", ward.id)
    .eq("status", "discharged")
    .or(visibleDischargedFilter([...finalisedAt.keys()]))
    .order("discharged_at", { ascending: false });

  const patients: DischargedPatient[] = ((data ?? []) as unknown as (Omit<
    DischargedPatient,
    "entry_count"
  > & { entries: { count: number }[] })[])
    .map((p) => ({ ...p, entry_count: p.entries?.[0]?.count ?? 0 }))
    .sort((a, b) => compareBeds(a.bed, b.bed));

  const saved = patients.filter((p) => finalisedAt.has(p.id));
  const recent = patients.filter((p) => !finalisedAt.has(p.id));

  return (
    <div className="flex-1 flex flex-col max-w-md mx-auto w-full">
      <header className="px-6 pt-8 pb-4">
        <Link href="/unit" className="text-[17px] text-accent">
          ‹ Unit
        </Link>
        <h1 className="mt-3 ios-large-title">Discharged</h1>
        <p className="mt-0.5 text-[15px] text-muted">
          A recent discharge can still be undone; once a summary is saved it stays here for
          good. Nothing recorded about a patient is ever deleted.
        </p>
      </header>

      <section className="px-6 pb-16 flex flex-col gap-6">
        {patients.length === 0 ? (
          <p className="ios-group p-6 text-[15px] text-muted">
            Nobody discharged recently, and nothing saved yet.
          </p>
        ) : (
          <>
            {recent.length > 0 && (
              <div>
                <p className="mb-2 text-[13px] font-semibold uppercase tracking-wide text-muted">
                  Recently discharged · within {DISCHARGE_UNDO_WINDOW_HOURS} hours
                </p>
                <div className="flex flex-col gap-3">
                  {recent.map((p) => (
                    <DischargedCard key={p.id} patient={p} />
                  ))}
                </div>
              </div>
            )}
            {saved.length > 0 && (
              <div>
                <p className="mb-2 text-[13px] font-semibold uppercase tracking-wide text-muted">
                  Saved
                </p>
                <div className="flex flex-col gap-3">
                  {saved.map((p) => (
                    <DischargedCard key={p.id} patient={p} finalisedAt={finalisedAt.get(p.id) ?? null} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}

function hoursLeft(dischargedAt: string | null): number {
  if (!dischargedAt) return DISCHARGE_UNDO_WINDOW_HOURS;
  const elapsedMs = Date.now() - new Date(dischargedAt).getTime();
  const remaining = DISCHARGE_UNDO_WINDOW_HOURS - elapsedMs / 3_600_000;
  return Math.max(0, Math.ceil(remaining));
}

function DischargedCard({
  patient,
  finalisedAt,
}: {
  patient: DischargedPatient;
  /** Set only for a saved (finalised) summary — the recently-discharged group has none. */
  finalisedAt?: string | null;
}) {
  const saved = finalisedAt !== undefined;

  return (
    <div className="ios-group p-4">
      <div className="flex items-baseline gap-2">
        <span className="shrink-0 rounded-md bg-chip px-2 py-1 font-mono text-[13px]">
          {patient.bed}
        </span>
        <span className="truncate text-[17px] font-medium">{patientName(patient)}</span>
      </div>
      <p className="mt-0.5 truncate text-[15px] text-muted">
        {patient.primary_diagnosis || "No diagnosis recorded"}
      </p>
      <p className="mt-1 text-[13px] text-muted">
        {patient.entry_count === 0
          ? "Nothing was ever recorded on this patient."
          : `${patient.entry_count} ${patient.entry_count === 1 ? "entry" : "entries"} on their record.`}
        {patient.discharged_at &&
          ` Discharged ${new Date(patient.discharged_at).toLocaleString("en-IN", {
            timeZone: "Asia/Kolkata",
            day: "numeric",
            month: "short",
            hour: "numeric",
            minute: "2-digit",
          })}.`}
      </p>

      {saved ? (
        <p className="mt-1 text-[13px] text-good-fg">
          Summary saved{finalisedAt ? ` ${new Date(finalisedAt).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short" })}` : ""} — kept here indefinitely.
        </p>
      ) : (
        <p className="mt-1 text-[13px] text-warn-fg">
          {hoursLeft(patient.discharged_at) === 0
            ? "Leaves this list very soon if nothing is saved."
            : `${hoursLeft(patient.discharged_at)}h left to undo, unless a summary is saved first.`}
        </p>
      )}

      <div className="mt-3 flex gap-3">
        <form action={restorePatient} className="flex-1">
          <input type="hidden" name="patient_id" value={patient.id} />
          <button className="w-full rounded-[10px] bg-accent px-4 py-3 text-[17px] font-semibold text-accent-ink">
            Put back on the ward
          </button>
        </form>
      </div>
    </div>
  );
}
