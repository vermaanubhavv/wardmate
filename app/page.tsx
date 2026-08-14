import Link from "next/link";
import { getCurrentWard, getActivePatients, getRemovedCount } from "@/lib/ward";
import { dayLabel, managementLabel, patientName, type WardPatient } from "@/lib/patients";
import { getProcedureLabels, listTemplateChoices, procedureFor } from "@/lib/templates";
import RegisterButton from "./register-button";
import RoundRecorder from "./round-recorder";
import PatientMenu from "./patients/patient-menu";
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
  // One lookup for the whole list, so naming the operation on each card costs no extra query.
  const [procedures, templateChoices, removedCount] = await Promise.all([
    getProcedureLabels(),
    listTemplateChoices(),
    getRemovedCount(ward.id),
  ]);

  return (
    <div className="flex-1 flex flex-col max-w-md mx-auto w-full">
      <header className="px-6 pt-10 pb-4 flex items-baseline justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{ward.name}</h1>
          <p className="text-muted text-sm mt-0.5">
            {patients.length} {patients.length === 1 ? "patient" : "patients"}
          </p>
        </div>
        <div className="flex items-baseline gap-4">
          {/* Only once there is something to undo — the way back has to be visible from the
              screen the removal happened on, but an empty list is not worth a link. */}
          {removedCount > 0 && (
            <Link href="/removed" className="text-xs text-muted underline underline-offset-4">
              Removed · {removedCount}
            </Link>
          )}
          <Link href="/todo" className="text-xs text-accent underline underline-offset-4">
            To do
          </Link>
          <Link href="/handover" className="text-xs text-accent underline underline-offset-4">
            Ward round
          </Link>
          <form action={signOut}>
            <button className="text-xs text-muted underline underline-offset-4">Sign out</button>
          </form>
        </div>
      </header>

      {/* Bottom padding clears the fixed Add patient button so the last card is reachable. */}
      <ul className="flex-1 px-6 pb-44 flex flex-col gap-3">
        {patients.length === 0 ? (
          <li className="rounded-xl border border-line bg-card p-6 text-sm text-muted">
            No patients on this ward yet. Add the first one below.
          </li>
        ) : (
          patients.map((p) => (
            <li key={p.id}>
              <PatientCard
                patient={p}
                procedures={procedures}
                templateChoices={templateChoices}
              />
            </li>
          ))
        )}
      </ul>

      <div className="fixed bottom-0 inset-x-0 bg-gradient-to-t from-background via-background to-transparent pt-8 pb-8 px-6">
        <div className="mx-auto max-w-md flex flex-col gap-3">
          <RoundRecorder />
          <RegisterButton />
          <Link
            href="/patients/new"
            className="block rounded-xl bg-accent px-4 py-4 text-center text-base font-semibold text-slate-900"
          >
            Add patient
          </Link>
        </div>
      </div>
    </div>
  );
}

function PatientCard({
  patient,
  procedures,
  templateChoices,
}: {
  patient: WardPatient;
  procedures: Map<string, string>;
  templateChoices: { family: string; variant: string | null; label: string }[];
}) {
  const management = managementLabel(patient);
  // Named only for patients who have actually been operated on, and only from the operation
  // recorded against them. A patient still awaiting surgery counts from admission and has no
  // procedure to show — never one guessed from the diagnosis.
  const procedure = procedureFor(patient, procedures);

  return (
    // The card is a link to the patient, but the pen inside it is not — so the two are
    // siblings here rather than the pen sitting inside the link.
    <div className="relative rounded-xl border border-line bg-card">
      <Link
        href={`/patients/${patient.id}`}
        className="flex gap-4 items-start p-4 active:opacity-70"
      >
        {/* Bed leads the card: on rounds you are looking for a bed, not a name. */}
        <span className="shrink-0 rounded-lg bg-slate-800 px-2.5 py-1.5 font-mono text-sm tabular-nums">
          {patient.bed}
        </span>

        <div className="min-w-0 flex-1">
          {/* Padding keeps a long name clear of the pen sitting in the corner. */}
          <p className="truncate pr-9 text-base font-medium">{patientName(patient)}</p>
          {/* The day count reads with the diagnosis, not apart from it: "POD 3 · lap chole"
              is one clinical thought, and the number means little without what it counts
              from. */}
          <p className="mt-0.5 truncate text-sm text-muted">
            <span className="text-foreground tabular-nums">{dayLabel(patient)}</span>
            {/* The operation sits immediately after the day it is counted from, so "POD 2"
                says what it is two days after. */}
            {procedure && <span className="text-foreground"> {procedure}</span>}
            {" · "}
            {patient.primary_diagnosis || "No diagnosis recorded"}
          </p>

          {(management || patient.unconfirmed_count > 0 || patient.open_task_count > 0) && (
            <div className="mt-2 flex flex-wrap gap-2">
              {/* Leads the badges: which kind of patient this is frames everything after it. */}
              {management && (
                <p className="inline-flex items-center rounded-md border border-line px-2 py-1 text-xs tracking-wide text-muted">
                  {management}
                </p>
              )}
              {patient.open_task_count > 0 && (
                <p className="inline-flex items-center gap-1.5 rounded-md bg-slate-700/60 px-2 py-1 text-xs text-foreground">
                  {patient.open_task_count} to do
                </p>
              )}
              {patient.unconfirmed_count > 0 && (
                <p className="inline-flex items-center gap-1.5 rounded-md bg-amber-400/15 px-2 py-1 text-xs text-amber-200">
                  <span aria-hidden>●</span>
                  {patient.unconfirmed_count} to confirm
                </p>
              )}
            </div>
          )}
        </div>
      </Link>

      <div className="absolute right-2 top-2">
        <PatientMenu patient={patient} templateChoices={templateChoices} />
      </div>
    </div>
  );
}
