import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentWard } from "@/lib/ward";
import { compareBeds, patientName } from "@/lib/patients";
import { restorePatient, deletePatientForever } from "../patients/actions";

type RemovedPatient = {
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
 * Everyone taken off the ward list, and the way back.
 *
 * This is the undo. Removing a patient is one tap on a small target beside a card, so it has
 * to be a decision that can be reversed — and a patient created by a misheard bed number is
 * exactly the kind of mistake that is noticed a screen later, not at the moment it is made.
 */
export default async function RemovedPage() {
  const { ward, error } = await getCurrentWard();

  if (error || !ward) {
    return (
      <main className="flex-1 px-6 py-10 max-w-md mx-auto w-full">
        <h1 className="text-2xl font-semibold">Removed</h1>
        <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          {error ? `Could not read the database: ${error.message}` : "No ward found."}
        </p>
      </main>
    );
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("patients")
    .select(
      "id, display_name, age_years, sex, bed, primary_diagnosis, discharged_at, entries(count)"
    )
    .eq("ward_id", ward.id)
    .eq("status", "discharged")
    .order("discharged_at", { ascending: false });

  const patients: RemovedPatient[] = ((data ?? []) as unknown as (Omit<
    RemovedPatient,
    "entry_count"
  > & { entries: { count: number }[] })[]).map((p) => ({
    ...p,
    entry_count: p.entries?.[0]?.count ?? 0,
  }));

  return (
    <div className="flex-1 flex flex-col max-w-md mx-auto w-full">
      <header className="px-6 pt-8 pb-4">
        <Link href="/" className="text-sm text-muted underline underline-offset-4">
          ← Ward
        </Link>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight">Removed</h1>
        <p className="mt-0.5 text-sm text-muted">
          Taken off the ward list. Nothing recorded about them has been deleted.
        </p>
      </header>

      <section className="px-6 pb-16 flex flex-col gap-3">
        {patients.length === 0 ? (
          <p className="rounded-xl border border-line bg-card p-6 text-sm text-muted">
            Nobody has been removed from this ward.
          </p>
        ) : (
          patients
            .slice()
            .sort((a, b) => compareBeds(a.bed, b.bed))
            .map((p) => <RemovedCard key={p.id} patient={p} />)
        )}
      </section>
    </div>
  );
}

function RemovedCard({ patient }: { patient: RemovedPatient }) {
  return (
    <div className="rounded-xl border border-line bg-card p-4">
      <div className="flex items-baseline gap-2">
        <span className="shrink-0 rounded-lg bg-chip px-2 py-1 font-mono text-xs">
          {patient.bed}
        </span>
        <span className="truncate text-base font-medium">{patientName(patient)}</span>
      </div>
      <p className="mt-0.5 truncate text-sm text-muted">
        {patient.primary_diagnosis || "No diagnosis recorded"}
      </p>
      <p className="mt-1 text-xs text-muted">
        {patient.entry_count === 0
          ? "Nothing was ever recorded on this patient."
          : `${patient.entry_count} ${patient.entry_count === 1 ? "entry" : "entries"} on their record.`}
        {patient.discharged_at &&
          ` Removed ${new Date(patient.discharged_at).toLocaleString("en-IN", {
            timeZone: "Asia/Kolkata",
            day: "numeric",
            month: "short",
            hour: "numeric",
            minute: "2-digit",
          })}.`}
      </p>

      <div className="mt-3 flex gap-3">
        <form action={restorePatient} className="flex-1">
          <input type="hidden" name="patient_id" value={patient.id} />
          <button className="w-full rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-accent-ink">
            Put back on the ward
          </button>
        </form>

        <form action={deletePatientForever}>
          <input type="hidden" name="patient_id" value={patient.id} />
          <button
            // The only irreversible action in the app, so it says exactly what goes and
            // names what is being destroyed rather than asking "are you sure?".
            onClick={(e) => {
              const what =
                patient.entry_count === 0
                  ? "Nothing was ever recorded on them."
                  : `Their ${patient.entry_count} ${patient.entry_count === 1 ? "entry" : "entries"} and everything recorded in ${patient.entry_count === 1 ? "it" : "them"} will be destroyed.`;
              if (
                !confirm(
                  `Delete ${patient.display_name} permanently?\n\n${what}\n\nThis cannot be undone.`
                )
              ) {
                e.preventDefault();
              }
            }}
            className="rounded-xl border border-red-300 px-4 py-3 text-sm font-semibold text-red-600"
          >
            Delete
          </button>
        </form>
      </div>
    </div>
  );
}
