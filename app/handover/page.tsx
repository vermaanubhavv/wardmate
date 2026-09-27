import Link from "next/link";
import ScreenHeader from "../screen-header";
import { getCurrentWard } from "@/lib/ward";
import { dayLabel, managementLabel, patientName } from "@/lib/patients";
import { getWardHandover, formatHandoverText, type HandoverPatient } from "@/lib/handover";
import type { SpecialtyPack } from "@/lib/specialty";
import CopyHandoverButton from "./copy-button";

export default async function HandoverPage() {
  const { ward, error: wardError } = await getCurrentWard();

  if (wardError || !ward) {
    return (
      <main className="flex-1 max-w-md mx-auto w-full">
        <ScreenHeader back="/ward" title="Handover" />
        <p role="alert" className="mx-4 ios-group px-4 py-3 text-subhead text-warn-fg">
          {wardError ? "The handover could not be loaded. Check the connection and try again." : "No ward found."}
        </p>
      </main>
    );
  }

  const handover = await getWardHandover(ward);
  const text = formatHandoverText(handover);

  return (
    <div className="flex-1 flex flex-col max-w-md mx-auto w-full">
      <ScreenHeader
        back="/ward"
        title="Handover"
        subtitle={`${ward.name} · ${handover.patients.length} active ${handover.patients.length === 1 ? "patient" : "patients"}`}
      />

      <section className="px-4 flex flex-col gap-3">
        {handover.patients.length === 0 ? (
          <p className="ios-group p-6 text-subhead text-muted">
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
      <section className="px-4 pt-6 pb-16">
        <p className="mb-2 text-footnote font-medium text-muted">Ready to send</p>
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
          <span className="shrink-0 rounded-md bg-chip px-1.5 py-0.5 font-mono text-footnote tabular-nums">
            {patient.bed}
          </span>
          <span className="truncate text-body font-semibold">{patientName(patient)}</span>
          {management && (
            <span className="ml-auto shrink-0 rounded-md border border-line px-2 py-0.5 text-footnote tracking-wide text-muted">
              {management}
            </span>
          )}
        </div>
        {/* Same pairing as the ward list, so the two screens read identically. */}
        <p className="mt-0.5 text-subhead text-muted truncate">
          <span className="text-foreground tabular-nums">{dayLabel(patient, pack)}</span>
          {patient.procedure && <span className="text-foreground"> {patient.procedure}</span>}
          {" · "}
          {patient.primary_diagnosis || "No diagnosis recorded"}
        </p>

        {patient.doneToday.length > 0 && (
          <ul className="mt-2 flex flex-col gap-1">
            {patient.doneToday.map((d) => (
              <li key={d.id} className="text-subhead">
                <span className="text-good-fg">Today:</span> {d.text}
              </li>
            ))}
          </ul>
        )}

        {clear ? (
          <p className="mt-2 text-subhead text-muted">Nothing outstanding.</p>
        ) : (
          <ul className="mt-2 flex flex-col gap-1">
            {openTasks.map((t) => (
              <li key={t.id} className="text-subhead">
                <span className="text-muted">To do:</span> {t.value_text ?? t.label}
              </li>
            ))}
            {pending.map((o) => (
              <li key={o.id} className="text-subhead text-warn-fg">
                <span aria-hidden>●</span> Confirm {o.label}
                {o.value_text ? ` — ${o.value_text}` : ""}
              </li>
            ))}
            {missing.length > 0 && (
              <li className="text-subhead text-warn-fg">
                Not yet recorded: {missing.map((m) => m.item.label).join(", ")}
              </li>
            )}
          </ul>
        )}
      </div>
    </Link>
  );
}
