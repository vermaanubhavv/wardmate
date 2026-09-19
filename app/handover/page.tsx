import Link from "next/link";
import { getCurrentWard } from "@/lib/ward";
import { dayLabel, managementLabel, patientName } from "@/lib/patients";
import { getWardHandover, formatHandoverText, type HandoverPatient } from "@/lib/handover";
import type { SpecialtyPack } from "@/lib/specialty";
import CopyHandoverButton from "./copy-button";

export default async function HandoverPage() {
  const { ward, error: wardError } = await getCurrentWard();

  if (wardError || !ward) {
    return (
      <main className="flex-1 px-6 py-10 max-w-md mx-auto w-full">
        <h1 className="ios-large-title">Update</h1>
        <p className="mt-4 ios-group px-4 py-3 text-[15px] text-orange-700">
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
        <Link href="/ward" className="text-[17px] text-accent">
          ‹ Ward
        </Link>
        <h1 className="mt-3 ios-large-title">{ward.name} — update</h1>
        <p className="mt-1 text-[15px] text-muted">
          {handover.patients.length} active {handover.patients.length === 1 ? "patient" : "patients"}
        </p>
      </header>

      <section className="px-6 flex flex-col gap-3">
        {handover.patients.length === 0 ? (
          <p className="ios-group p-6 text-[15px] text-muted">
            No active patients on this ward.
          </p>
        ) : (
          handover.patients.map((p) => (
            <PatientSummary key={p.id} patient={p} pack={handover.pack} />
          ))
        )}
      </section>

      {/* The assembled message, ready to edit before it goes to the consultant's WhatsApp
          group — see app/handover/copy-button.tsx. Sits at the end of the page rather than
          a floating bar: there's a full textarea to read and adjust here, not a single tap. */}
      <section className="px-6 pt-6 pb-16">
        <p className="mb-2 text-[13px] font-medium text-muted">Ready to send</p>
        <CopyHandoverButton text={text} />
      </section>
    </div>
  );
}

function PatientSummary({ patient, pack }: { patient: HandoverPatient; pack: SpecialtyPack }) {
  const { openTasks, pending, missing } = patient.state;
  const clear = openTasks.length === 0 && pending.length === 0 && missing.length === 0;
  const management = managementLabel(patient);

  return (
    <Link href={`/patients/${patient.id}`} className="block active:opacity-70">
      <div className="ios-group p-4">
        <div className="flex items-baseline gap-2 min-w-0">
          <span className="shrink-0 rounded-md bg-chip px-2 py-1 font-mono text-[13px] tabular-nums">
            {patient.bed}
          </span>
          <span className="truncate text-[17px] font-medium">{patientName(patient)}</span>
          {management && (
            <span className="ml-auto shrink-0 rounded-md border border-line px-2 py-0.5 text-[13px] tracking-wide text-muted">
              {management}
            </span>
          )}
        </div>
        {/* Same pairing as the ward list, so the two screens read identically. */}
        <p className="mt-0.5 text-[15px] text-muted truncate">
          <span className="text-foreground tabular-nums">{dayLabel(patient, pack)}</span>
          {patient.procedure && <span className="text-foreground"> {patient.procedure}</span>}
          {" · "}
          {patient.primary_diagnosis || "No diagnosis recorded"}
        </p>

        {patient.doneToday.length > 0 && (
          <ul className="mt-2 flex flex-col gap-1">
            {patient.doneToday.map((d) => (
              <li key={d.id} className="text-[15px]">
                <span className="text-good-fg">Today:</span> {d.text}
              </li>
            ))}
          </ul>
        )}

        {clear ? (
          <p className="mt-2 text-[15px] text-muted/70">Nothing outstanding.</p>
        ) : (
          <ul className="mt-2 flex flex-col gap-1">
            {openTasks.map((t) => (
              <li key={t.id} className="text-[15px]">
                <span className="text-muted">To do:</span> {t.value_text ?? t.label}
              </li>
            ))}
            {pending.map((o) => (
              <li key={o.id} className="text-[15px] text-orange-700">
                <span aria-hidden>●</span> Confirm {o.label}
                {o.value_text ? ` — ${o.value_text}` : ""}
              </li>
            ))}
            {missing.length > 0 && (
              <li className="text-[15px] text-orange-700">
                Not yet recorded: {missing.map((m) => m.item.label).join(", ")}
              </li>
            )}
          </ul>
        )}
      </div>
    </Link>
  );
}
