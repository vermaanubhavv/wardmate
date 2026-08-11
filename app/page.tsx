import Link from "next/link";
import { getCurrentWard, getActivePatients } from "@/lib/ward";
import { dayLabel, type WardPatient } from "@/lib/patients";
import { signOut } from "./actions";

export default async function Home() {
  const { ward, error: wardError } = await getCurrentWard();

  if (wardError || !ward) {
    return (
      <main className="flex-1 px-6 py-10 max-w-md mx-auto w-full">
        <h1 className="text-2xl font-semibold">CoreResident</h1>
        <p className="mt-4 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          {wardError ? `Could not read the database: ${wardError.message}` : "No ward found."}
        </p>
        <form action={signOut} className="mt-6">
          <button className="text-sm text-muted underline underline-offset-4">Sign out</button>
        </form>
      </main>
    );
  }

  const { patients } = await getActivePatients(ward.id);

  return (
    <div className="flex-1 flex flex-col max-w-md mx-auto w-full">
      <header className="px-6 pt-10 pb-4 flex items-baseline justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{ward.name}</h1>
          <p className="text-muted text-sm mt-0.5">
            {patients.length} {patients.length === 1 ? "patient" : "patients"}
          </p>
        </div>
        <form action={signOut}>
          <button className="text-xs text-muted underline underline-offset-4">Sign out</button>
        </form>
      </header>

      {/* Bottom padding clears the fixed Add patient button so the last card is reachable. */}
      <ul className="flex-1 px-6 pb-32 flex flex-col gap-3">
        {patients.length === 0 ? (
          <li className="rounded-xl border border-line bg-card p-6 text-sm text-muted">
            No patients on this ward yet. Add the first one below.
          </li>
        ) : (
          patients.map((p) => (
            <li key={p.id}>
              <PatientCard patient={p} />
            </li>
          ))
        )}
      </ul>

      <div className="fixed bottom-0 inset-x-0 bg-gradient-to-t from-background via-background to-transparent pt-8 pb-8 px-6">
        <Link
          href="/patients/new"
          className="mx-auto block max-w-md rounded-xl bg-accent px-4 py-4 text-center text-base font-semibold text-slate-900"
        >
          Add patient
        </Link>
      </div>
    </div>
  );
}

function PatientCard({ patient }: { patient: WardPatient }) {
  return (
    <div className="rounded-xl border border-line bg-card p-4 flex gap-4 items-start">
      {/* Bed leads the card: on rounds you are looking for a bed, not a name. */}
      <span className="shrink-0 rounded-lg bg-slate-800 px-2.5 py-1.5 font-mono text-sm tabular-nums">
        {patient.bed}
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <span className="truncate text-base font-medium">{patient.display_name}</span>
          <span className="shrink-0 text-sm text-muted tabular-nums">{dayLabel(patient)}</span>
        </div>
        <p className="mt-0.5 truncate text-sm text-muted">
          {patient.primary_diagnosis || "No diagnosis recorded"}
        </p>

        {patient.unconfirmed_count > 0 && (
          <p className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-amber-400/15 px-2 py-1 text-xs text-amber-200">
            <span aria-hidden>●</span>
            {patient.unconfirmed_count} to confirm
          </p>
        )}
      </div>
    </div>
  );
}
