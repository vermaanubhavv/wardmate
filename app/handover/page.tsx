import Link from "next/link";
import ScreenHeader from "../screen-header";
import { getCurrentWard } from "@/lib/ward";
import { dayLabel, managementLabel, patientName } from "@/lib/patients";
import { getWardHandover, formatHandoverText, type HandoverPatient } from "@/lib/handover";
import type { SpecialtyPack } from "@/lib/specialty";
import { effectiveUrgency, istDate } from "@/lib/urgency";
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
  const watch = handover.patients.filter(needsWatch);
  const stable = handover.patients.filter((p) => !needsWatch(p));

  return (
    <div className="flex-1 flex flex-col max-w-md mx-auto w-full">
      <ScreenHeader
        back="/ward"
        title="Handover"
        subtitle={`${ward.name} · ${handover.patients.length} active ${handover.patients.length === 1 ? "patient" : "patients"}`}
      />

      {/* pb-40 keeps the last card clear of the fixed Copy bar. */}
      <section className="px-4 pb-40 flex flex-col gap-3">
        {handover.patients.length === 0 ? (
          <p className="ios-group p-6 text-subhead text-muted">
            No active patients on this ward.
          </p>
        ) : (
          <>
            <PatientGroup title="Watch tonight" patients={watch} pack={handover.pack} />
            <PatientGroup title="Stable" patients={stable} pack={handover.pack} />
          </>
        )}

        {/* The assembled message, editable, and the Copy bar pinned under the page — see
            app/handover/copy-button.tsx. Cards and WhatsApp text keep separate orders on
            purpose: the text stays in bed order, the way the consultant reads it. */}
        <CopyHandoverButton text={text} draftKey={`handover-draft:${ward.id}:${istDate(handover.generated_at)}`} />
      </section>
    </div>
  );
}

/**
 * Worth a look before the night: a job that is red as of today (graded Now, or a Soon that
 * has come due) or a value still waiting to be confirmed. Template gaps alone don't count —
 * nearly every patient has one, so ranking on them would sort nothing. Beds keep their order
 * within each group, since getWardHandover already returns them bed-sorted.
 */
function needsWatch(p: HandoverPatient): boolean {
  return p.state.pending.length > 0 || p.state.openTasks.some((t) => effectiveUrgency(t).urgency === "red");
}

function PatientGroup({ title, patients, pack }: { title: string; patients: HandoverPatient[]; pack: SpecialtyPack }) {
  if (patients.length === 0) return null;
  return (
    <>
      <h2 className="pt-2 text-footnote font-medium text-muted">
        {title} · {patients.length}
      </h2>
      {patients.map((p) => (
        <PatientSummary key={p.id} patient={p} pack={pack} />
      ))}
    </>
  );
}

function PatientSummary({ patient, pack }: { patient: HandoverPatient; pack: SpecialtyPack }) {
  const { openTasks, pending, missing } = patient.state;
  const clear = openTasks.length === 0 && pending.length === 0 && missing.length === 0;
  const management = managementLabel(patient, pack);

  return (
    // The Link stops short of the "not yet recorded" fold: a <details> inside an <a> would
    // open the patient instead of the list.
    <div className="ios-group">
      <Link href={`/patients/${patient.id}`} className="block p-4 active:opacity-70">
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
        ) : (openTasks.length > 0 || pending.length > 0) && (
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
          </ul>
        )}
      </Link>
      {/* Folded to a count on screen only — the WhatsApp text still lists every label. */}
      {missing.length > 0 && (
        <details className="-mt-2 px-4 pb-2 text-subhead text-muted">
          <summary className="flex min-h-11 cursor-pointer items-center">
            {missing.length} not yet recorded
          </summary>
          <p className="pb-2">{missing.map((m) => m.item.label).join(", ")}</p>
        </details>
      )}
    </div>
  );
}
