import Link from "next/link";
import ScreenHeader from "../screen-header";
import { getCurrentWard } from "@/lib/ward";
import { dayLabel, managementLabel, patientName } from "@/lib/patients";
import {
  checkSummary,
  formatHandoverText,
  getWardHandover,
  handoverGroups,
  type HandoverPatient,
} from "@/lib/handover";
import type { SpecialtyPack } from "@/lib/specialty";
import { effectiveUrgency, istDate, jobTitle, URGENCY_META } from "@/lib/urgency";
import CopyHandoverButton from "./copy-button";
import { displayValue } from "@/lib/display-value";

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
  const { watch, jobsOpen, clear } = handoverGroups(handover.patients);

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
            {watch.length > 0 && (
              <>
                <GroupHeading>Watch tonight · {watch.length}</GroupHeading>
                {watch.map((p) => (
                  <WatchCard key={p.id} patient={p} pack={handover.pack} />
                ))}
              </>
            )}

            {jobsOpen.length > 0 && (
              <>
                <GroupHeading>Jobs open, none due · {jobsOpen.length}</GroupHeading>
                <ul className="ios-group divide-y divide-line">
                  {jobsOpen.map((p) => (
                    <li key={p.id}>
                      <Link href={`/patients/${p.id}`} className="flex min-h-11 items-center gap-2 px-4 py-2 active:bg-chip">
                        <BedChip bed={p.bed} />
                        <span className="min-w-0 flex-1 truncate text-subhead">{patientName(p)}</span>
                        <span className="text-footnote text-muted">
                          {p.state.openTasks.length} {p.state.openTasks.length === 1 ? "job" : "jobs"}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            )}

            {clear.length > 0 && (
              <>
                <GroupHeading>Nothing outstanding · {clear.length}</GroupHeading>
                <p className="px-1 text-subhead leading-relaxed text-muted">
                  {clear.map((p, i) => (
                    <span key={p.id}>
                      {i > 0 && " · "}
                      <Link href={`/patients/${p.id}`} className="whitespace-nowrap active:opacity-60">
                        <span className="font-mono tabular-nums text-foreground/80">{p.bed}</span> {patientName(p)}
                      </Link>
                    </span>
                  ))}
                </p>
              </>
            )}
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

function GroupHeading({ children }: { children: React.ReactNode }) {
  return <h2 className="pt-2 text-footnote font-semibold uppercase tracking-wide text-muted">{children}</h2>;
}

function BedChip({ bed }: { bed: string }) {
  return (
    <span className="grid h-7 min-w-7 shrink-0 place-items-center rounded-[7px] bg-chip px-1 font-mono text-footnote font-semibold tabular-nums">
      {bed}
    </span>
  );
}

/**
 * One patient worth watching tonight: who, then the jobs (red ones first, said with when they
 * were due), then the values still to check in one line — only those the report itself
 * flagged are named; the full list opens on a tap.
 */
function WatchCard({ patient, pack }: { patient: HandoverPatient; pack: SpecialtyPack }) {
  const { openTasks, pending, missing } = patient.state;
  const management = managementLabel(patient, pack);
  const check = pending.length > 0 ? checkSummary(pending, patient.sex) : null;

  return (
    <div className="ios-group">
      <Link href={`/patients/${patient.id}`} className="flex flex-col gap-2 p-4 active:opacity-70">
        <div className="flex min-w-0 items-center gap-2">
          <BedChip bed={patient.bed} />
          <span className="truncate text-body font-semibold">{patientName(patient)}</span>
        </div>
        {/* Same pairing as the ward list, so the two screens read identically. */}
        <p className="-mt-1 text-subhead text-muted">
          <span className="text-foreground tabular-nums">{dayLabel(patient, pack)}</span>
          {patient.procedure && <span className="text-foreground"> {patient.procedure}</span>}
          {" · "}
          {patient.primary_diagnosis || "No diagnosis recorded"}
          {management && <> · {management}</>}
        </p>

        {patient.doneToday.length > 0 && (
          <ul className="flex flex-col gap-1">
            {patient.doneToday.map((d) => (
              <li key={d.id} className="text-subhead">
                <span className="text-muted">Today:</span> {d.text}
              </li>
            ))}
          </ul>
        )}

        {openTasks.length > 0 && (
          <ul className="flex flex-col gap-1">
            {openTasks.map((t) => {
              const effective = effectiveUrgency(t);
              return (
                <li key={t.id} className="flex items-baseline gap-2 text-subhead">
                  <span
                    aria-hidden
                    className={
                      "h-2 w-2 shrink-0 translate-y-[-1px] rounded-full " +
                      (effective.urgency
                        ? URGENCY_META[effective.urgency].dot
                        : "border-[1.5px] border-dashed border-muted")
                    }
                  />
                  <span>
                    {jobTitle(t.value_text ?? t.label, t.recorded_at)}
                    {effective.note && <span className="text-muted"> · {effective.note}</span>}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </Link>

      {/* The values to check, in one line; the full list folds open. Outside the link, since a
          <details> inside an <a> would open the patient instead of the list. */}
      {check && (
        <details className="mx-4 mb-3 rounded-[10px] bg-warn-bg/60 px-3 py-2">
          <summary className="cursor-pointer list-none text-subhead [&::-webkit-details-marker]:hidden">
            <span className="font-semibold text-warn-fg">
              {check.total} {check.total === 1 ? "value" : "values"} to check
            </span>
            {check.flagged.length > 0 && (
              <span className="mt-0.5 block text-footnote text-foreground/80">
                Flagged on the report: {check.flagged.join(" · ")}
              </span>
            )}
            {check.unreadable > 0 && (
              <span className="mt-0.5 block text-footnote text-warn-fg">{check.unreadable} unreadable on the source</span>
            )}
            <span className="mt-0.5 block text-footnote text-accent">Show all</span>
          </summary>
          <ul className="mt-2 flex flex-col gap-1 border-t border-warn-fg/15 pt-2">
            {pending.map((o) => (
              <li key={o.id} className="text-footnote">
                <span className="text-muted">{o.label}</span> {displayValue(o.value_text)}
              </li>
            ))}
          </ul>
        </details>
      )}

      {/* Folded to a count on screen only — the WhatsApp text still lists every label. */}
      {missing.length > 0 && (
        <details className="px-4 pb-2 text-subhead text-muted">
          <summary className="flex min-h-11 cursor-pointer items-center">
            {missing.length} not yet recorded
          </summary>
          <p className="pb-2">{missing.map((m) => m.item.label).join(", ")}</p>
        </details>
      )}
    </div>
  );
}
