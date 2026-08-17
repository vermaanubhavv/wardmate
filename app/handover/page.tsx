import Link from "next/link";
import { getCurrentWard } from "@/lib/ward";
import { dayLabel, managementLabel, patientName } from "@/lib/patients";
import { getWardHandover, formatHandoverText, type HandoverPatient } from "@/lib/handover";
import CopyHandoverButton from "./copy-button";
import BottomBar from "../bottom-bar";

export default async function HandoverPage() {
  const { ward, error: wardError } = await getCurrentWard();

  if (wardError || !ward) {
    return (
      <main className="flex-1 px-6 py-10 max-w-md mx-auto w-full">
        <h1 className="text-2xl font-semibold">Ward round</h1>
        <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          {wardError ? `Could not read the database: ${wardError.message}` : "No ward found."}
        </p>
      </main>
    );
  }

  const handover = await getWardHandover(ward);
  const text = formatHandoverText(handover);

  return (
    <div className="flex-1 flex flex-col max-w-md mx-auto w-full">
      <header className="px-6 pt-8 pb-4">
        <Link href="/" className="text-sm text-muted underline underline-offset-4">
          ← Ward
        </Link>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight">{ward.name} — ward round</h1>
        <p className="text-muted text-sm mt-0.5">
          {handover.patients.length} active {handover.patients.length === 1 ? "patient" : "patients"}
        </p>
      </header>

      <section className="px-6 pb-48 flex flex-col gap-3">
        {handover.patients.length === 0 ? (
          <p className="rounded-xl border border-line bg-card p-6 text-sm text-muted">
            No active patients on this ward.
          </p>
        ) : (
          handover.patients.map((p) => <PatientSummary key={p.id} patient={p} />)
        )}
      </section>

      <BottomBar>
        
          <CopyHandoverButton text={text} />
        </BottomBar>
    </div>
  );
}

function PatientSummary({ patient }: { patient: HandoverPatient }) {
  const { openTasks, pending, missing } = patient.state;
  const clear = openTasks.length === 0 && pending.length === 0 && missing.length === 0;
  const management = managementLabel(patient);

  return (
    <Link href={`/patients/${patient.id}`} className="block active:opacity-70">
      <div className="rounded-xl border border-line bg-card p-4">
        <div className="flex items-baseline gap-2 min-w-0">
          <span className="shrink-0 rounded-lg bg-chip px-2 py-1 font-mono text-xs tabular-nums">
            {patient.bed}
          </span>
          <span className="truncate text-base font-medium">{patientName(patient)}</span>
          {management && (
            <span className="ml-auto shrink-0 rounded-md border border-line px-2 py-0.5 text-xs tracking-wide text-muted">
              {management}
            </span>
          )}
        </div>
        {/* Same pairing as the ward list, so the two screens read identically. */}
        <p className="mt-0.5 text-sm text-muted truncate">
          <span className="text-foreground tabular-nums">{dayLabel(patient)}</span>
          {patient.procedure && <span className="text-foreground"> {patient.procedure}</span>}
          {" · "}
          {patient.primary_diagnosis || "No diagnosis recorded"}
        </p>

        {clear ? (
          <p className="mt-2 text-sm text-muted/70">Nothing outstanding.</p>
        ) : (
          <ul className="mt-2 flex flex-col gap-1">
            {openTasks.map((t) => (
              <li key={t.id} className="text-sm">
                <span className="text-muted">To do:</span> {t.value_text ?? t.label}
              </li>
            ))}
            {pending.map((o) => (
              <li key={o.id} className="text-sm text-amber-700">
                <span aria-hidden>●</span> Confirm {o.label}
                {o.value_text ? ` — ${o.value_text}` : ""}
              </li>
            ))}
            {missing.length > 0 && (
              <li className="text-sm text-amber-700">
                Not yet recorded: {missing.map((m) => m.item.label).join(", ")}
              </li>
            )}
          </ul>
        )}
      </div>
    </Link>
  );
}
