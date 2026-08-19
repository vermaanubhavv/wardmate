import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getActivePatients } from "@/lib/ward";
import {
  getTemplateForPatient,
  getProcedureLabels,
  listTemplateChoices,
  procedureFor,
} from "@/lib/templates";
import {
  derivePatientState,
  groupByDay,
  groupIntoSittings,
  istDayKey,
  type Observation,
} from "@/lib/patient-state";
import { dayLabel, isIdentifierLabel, managementLabel, patientName } from "@/lib/patients";
import { effectiveUrgency } from "@/lib/urgency";
import BedsideBar from "./bedside-bar";
import EditIdentity from "../edit-identity";
import UrgencyDot from "./urgency-dot";
import { ChevronIcon } from "../../icons";
import { quoteAddsNothing } from "@/lib/dedupe-tasks";
import Tick from "./tick";
import EntryCard from "./entry-card";
import DischargeSection from "./discharge-section";
import { buildDischargeBrief } from "@/lib/discharge";
import { confirmChecked, confirmAll, reopenTask } from "./actions";
import BottomBar from "../../bottom-bar";

type Entry = {
  id: string;
  source: "voice" | "photo" | "manual";
  transcript: string | null;
  photo_path: string | null;
  recorded_at: string;
  extraction_error: string | null;
  accepted_at: string | null;
  edited_at: string | null;
  observations: Observation[];
};

export default async function PatientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: patient } = await supabase
    .from("current_patients")
    .select(
      "id, ward_id, display_name, age_years, sex, bed, primary_diagnosis, admitted_on, surgery_date, planned_surgery_date, post_op_day, admission_day, status, template_family, template_variant, procedure_text, management"
    )
    .eq("id", id)
    .maybeSingle();

  if (!patient) notFound();

  // The next bed in walking order, so finishing one patient and starting the next is one tap
  // rather than a trip back through the ward list.
  const [
    { patients: ward },
    { data: entriesData },
    procedures,
    templateChoices,
    { data: wardRow },
    template,
  ] = await Promise.all([
      getActivePatients(patient.ward_id),
      supabase
        .from("entries")
        .select(
          "id, source, transcript, photo_path, recorded_at, extraction_error, accepted_at, edited_at, observations(id, kind, label, value_text, value_num, unit, source_quote, needs_confirmation, confirmed_at, conflict_note, done_at, urgency, graded_at, recorded_at)"
        )
        .eq("patient_id", id)
        .order("recorded_at", { ascending: false }),
      getProcedureLabels(),
      listTemplateChoices(),
      // Joins the batch rather than following it: two strings are not worth a round trip of
      // their own on the screen opened most.
      supabase.from("wards").select("name, letterhead").eq("id", patient.ward_id).maybeSingle(),
      // Needs only fields already in hand from the patient row, so it was queueing behind the
      // batch for nothing.
      getTemplateForPatient(patient),
    ]);
  const here = ward.findIndex((p) => p.id === patient.id);
  const next = here >= 0 ? ward[here + 1] : undefined;
  const position = here >= 0 ? `${here + 1} of ${ward.length}` : null;

  // Who and where the patient is, dropped once here rather than at each place that reads an
  // observation — so the record, the derived state and the discharge summary cannot disagree
  // about whether "bed number" is a clinical finding. Extraction stopped storing these, but
  // entries recorded before that filter existed still hold them.
  const entries = ((entriesData ?? []) as unknown as Entry[]).map((e) => ({
    ...e,
    observations: e.observations.filter((o) => !isIdentifierLabel(o.label)),
  }));

  // Short-lived links for the stored photographs. The bucket is private, so these are the
  // only way to see one, they expire in an hour, and they are only ever minted here — for a
  // doctor the database has already confirmed is a member of this patient's ward.
  const photoPaths = entries.map((e) => e.photo_path).filter((p): p is string => Boolean(p));
  const photoUrls = new Map<string, string>();
  if (photoPaths.length > 0) {
    const { data: signed } = await supabase.storage
      .from("evidence")
      .createSignedUrls(photoPaths, 3600);
    for (const s of signed ?? []) {
      if (s.path && s.signedUrl) photoUrls.set(s.path, s.signedUrl);
    }
  }

  // The template decides both what to expect and what order to show it in, so the things that
  // matter for this operation lead the screen instead of whatever happened to be said first.
  // Entries already arrive newest first, so the flattened list is too — derivePatientState
  // relies on that order to pick the latest value for each thing.
  const allObservations = entries.flatMap((e) => e.observations);
  const patientState = derivePatientState(allObservations, template);
  const { matched, missing, extra, openTasks, doneTasks, pending } = patientState;

  // One visit to the bedside reads as one block in the record, however many times you spoke
  // or photographed something while standing there. Those then gather into days, which is the
  // unit the record is actually asked about — "what happened yesterday", not "what happened
  // between 9.25 and 9.40".
  const sittings = groupIntoSittings(entries);
  const days = groupByDay(sittings);
  const todayKey = istDayKey(new Date().toISOString());

  const procedure = procedureFor(patient, procedures);
  const management = managementLabel(patient);

  // Latest of each drug recorded, for the discharge brief. Taken from the same observations
  // the rest of the screen uses, so it can hold nothing that was not said.
  const seenDrugs = new Set<string>();
  const medications = allObservations
    .filter((o) => o.kind === "medication")
    .filter((o) => {
      const key = o.label.toLowerCase().trim();
      if (seenDrugs.has(key)) return false;
      seenDrugs.add(key);
      return true;
    });

  const dischargeBrief = buildDischargeBrief(patient, patientState, medications, procedure, {
    letterhead: wardRow?.letterhead ?? null,
    wardName: wardRow?.name ?? null,
  });

  return (
    <div className="flex-1 flex flex-col max-w-md mx-auto w-full">
      {/* A real navigation bar: back on the left, where the eye and thumb both go for it, and
          the walk to the next bed on the right. Both at iOS's size. */}
      <div className="sticky top-0 z-10 flex items-center justify-between gap-2 border-b border-line/60 bg-background/80 px-2 py-2.5 backdrop-blur-xl">
        <Link href="/" className="flex items-center text-[17px] text-accent active:opacity-60">
          <ChevronIcon className="h-[18px] w-[18px] rotate-180" />
          Ward
        </Link>
        <div className="flex items-center gap-3 pr-2">
          {position && <span className="text-[13px] text-muted tabular-nums">{position}</span>}
          {next && (
            <Link
              href={`/patients/${next.id}`}
              className="flex items-center text-[17px] font-medium text-accent active:opacity-60"
            >
              Next
              <ChevronIcon className="h-[18px] w-[18px]" />
            </Link>
          )}
        </div>
      </div>

      <header className="px-4 pb-3 pt-4">
        <div className="flex items-start justify-between gap-2">
          <h1 className="ios-large-title min-w-0 flex-1">{patientName(patient)}</h1>
          <div className="shrink-0 pt-1">
            <EditIdentity patient={patient} templateChoices={templateChoices} />
          </div>
        </div>

        {/* One line, in the order a resident says it: which day, what was done, what for. */}
        <p className="mt-1 text-[15px] text-muted">
          <span className="text-foreground tabular-nums">{dayLabel(patient)}</span>
          {procedure && <span className="text-foreground"> {procedure}</span>}
          {" · "}
          {patient.primary_diagnosis || "No diagnosis recorded"}
        </p>
        <p className="mt-1.5 flex items-center gap-2 text-[13px] text-muted">
          <span className="rounded-md bg-chip px-1.5 py-0.5 tabular-nums">
            Bed <span className="font-mono">{patient.bed}</span>
          </span>
          {management && <span className="tracking-wide">{management}</span>}
        </p>
      </header>

      {(openTasks.length > 0 || doneTasks.length > 0) && (
        <section className="px-4 pb-6">
          <p className="ios-group-header mb-2 px-4">
            To do{openTasks.length > 0 ? ` · ${openTasks.length}` : ""}
          </p>

          {openTasks.length > 0 ? (
            <ul className="ios-group divide-y divide-line">
              {openTasks.map((o) => (
                <li key={o.id} className="flex items-start gap-3 px-4 py-3">
                  <Tick
                    observationId={o.id}
                    patientId={patient.id}
                    label={o.value_text ?? o.label}
                  />
                  <div className="pt-1">
                    <UrgencyDot
                      observationId={o.id}
                      patientId={patient.id}
                      urgency={o.urgency}
                      gradedAt={o.graded_at}
                      recordedAt={o.recorded_at}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[15px]">
                      {o.value_text ?? o.label}
                      <CameDue observation={o} />
                    </p>
                    {/* The words it came from, so a job is never just the app's paraphrase —
                        shown only when they say more than the job itself does. */}
                    {!quoteAddsNothing(o.value_text ?? o.label, o.source_quote) && (
                      <p className="mt-0.5 truncate text-[13px] italic text-muted">
                        “{o.source_quote}”
                      </p>
                    )}
                    {/* Said again on a later round. The earlier ones are still on the record
                        below; the list just does not count one job twice. */}
                    {o.repeats > 0 && (
                      <p className="mt-0.5 text-[13px] text-muted">
                        said {o.repeats + 1} times — showing the latest
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="ios-group px-4 py-3 text-[15px] text-muted">
              Nothing outstanding.
            </p>
          )}

          {doneTasks.length > 0 && (
            <details className="mt-2">
              <summary className="text-[13px] text-muted cursor-pointer">
                {doneTasks.length} done
              </summary>
              <ul className="mt-2 flex flex-col gap-1.5">
                {doneTasks.map((o) => (
                  <li key={o.id} className="flex items-baseline justify-between gap-3">
                    <span className="text-[15px] text-muted line-through truncate">
                      {o.value_text ?? o.label}
                    </span>
                    <form action={reopenTask} className="shrink-0">
                      <input type="hidden" name="observation_id" value={o.id} />
                      <input type="hidden" name="patient_id" value={patient.id} />
                      <button className="text-[13px] text-muted underline underline-offset-4">
                        undo
                      </button>
                    </form>
                  </li>
                ))}
              </ul>
            </details>
          )}
        </section>
      )}

      {pending.length > 0 && (
        <section className="px-4 pb-6">
          <p className="ios-group-header mb-2 px-4 text-orange-700">
            {pending.length} to confirm before handover
          </p>
          {/* One form around the whole list: the two buttons below are the same submit with
              different actions, so ticking and accepting is one gesture rather than one tap
              per value. */}
          <form action={confirmChecked}>
            <input type="hidden" name="patient_id" value={patient.id} />

            <ul className="flex flex-col gap-2">
              {pending.map((o) => (
                <li
                  key={o.id}
                  className="rounded-[10px] border border-orange-200 bg-orange-50 p-3"
                >
                  <label className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      name="observation_ids"
                      value={o.id}
                      // Unticked by default. Confirming is the resident vouching for a
                      // value, so it has to be something they did, not something they
                      // failed to undo.
                      className="mt-0.5 h-5 w-5 shrink-0 accent-accent"
                    />
                    <span className="min-w-0 flex-1 text-sm">
                      <span className="text-muted">{o.label}</span>{" "}
                      <span className="font-medium">{o.value_text}</span>
                    </span>
                  </label>
                  <p className="mt-1.5 pl-8 text-[13px] text-orange-700/70 italic">
                    “{o.source_quote}”
                  </p>
                  {o.conflict_note && (
                    <p className="mt-1 pl-8 text-xs text-orange-800">{o.conflict_note}</p>
                  )}
                </li>
              ))}
            </ul>

            <div className="mt-3 flex gap-3">
              <button
                type="submit"
                className="flex-1 rounded-[10px] border border-orange-300 px-4 py-3 text-[15px] font-semibold text-orange-700"
              >
                Accept ticked
              </button>
              {/* Same form, different action — this one ignores the ticks and takes
                  everything still outstanding. */}
              <button
                type="submit"
                formAction={confirmAll}
                className="flex-1 rounded-xl bg-orange-500 px-4 py-3 text-[15px] font-semibold text-accent-ink"
              >
                Accept all {pending.length}
              </button>
            </div>
          </form>
        </section>
      )}

      {(matched.length > 0 || extra.length > 0) && (
        <section className="px-4 pb-6">
          <div className="flex items-baseline justify-between gap-3 mb-2">
            <p className="ios-group-header">Where things stand</p>
            {template && <p className="text-[13px] text-muted truncate">{template.name}</p>}
          </div>

          <ul className="ios-group divide-y divide-line">
            {matched.map((m) => (
              <li
                key={m.item.id}
                className="flex items-baseline justify-between gap-3 px-4 py-2.5"
              >
                <span className="text-[15px] text-muted">{m.item.label}</span>
                {m.value ? (
                  <span className="text-sm text-right">{m.value}</span>
                ) : (
                  // Absent is shown as absent. Never a placeholder, never a guess.
                  <span
                    className={
                      "text-sm text-right " + (m.missing ? "text-orange-700" : "text-muted/50")
                    }
                  >
                    not recorded
                  </span>
                )}
              </li>
            ))}
            {extra.map((o) => (
              <li key={o.id} className="flex items-baseline justify-between gap-3 px-4 py-2.5">
                <span className="text-[15px] text-muted">{o.label}</span>
                <span className="text-sm text-right">{o.value_text}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Bottom padding clears the fixed speak bar so the oldest entry stays reachable. */}
      <section className="px-4 pb-6">
        <p className="ios-group-header mb-2 px-4">Record</p>
        {entries.length === 0 ? (
          <p className="ios-group p-5 text-[15px] text-muted">
            Nothing recorded yet. Hold the button above and say what has changed.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {days.map((day, i) => {
              const count = day.sittings.reduce((n, s) => n + s.entries.length, 0);

              return (
                <li key={day.day}>
                  {/* Today open, the rest folded. A week-long admission is mostly history you
                      are not looking for, and the one day you are is nearly always this one. */}
                  <details open={i === 0} className="[&[open]_.chev]:rotate-90">
                    <summary className="flex cursor-pointer list-none items-baseline gap-2 px-4 py-1.5 active:opacity-60 [&::-webkit-details-marker]:hidden">
                      <span className="chev shrink-0 text-[11px] text-muted transition-transform">
                        ▶
                      </span>
                      <span className="text-[15px] font-semibold">
                        {dayHeading(day.recorded_at, todayKey)}
                      </span>
                      <span className="text-[13px] text-muted tabular-nums">
                        {count} {count === 1 ? "record" : "records"}
                      </span>
                    </summary>

                    <div className="mt-1.5 flex flex-col gap-2">
                      {day.sittings.flatMap((sitting) =>
                        sitting.entries.map((entry) => (
                          <EntryCard
                            key={entry.id}
                            entryId={entry.id}
                            patientId={patient.id}
                            time={new Date(entry.recorded_at).toLocaleTimeString("en-IN", {
                              timeZone: "Asia/Kolkata",
                              hour: "numeric",
                              minute: "2-digit",
                            })}
                            transcript={entry.transcript}
                            photoUrl={
                              entry.photo_path ? (photoUrls.get(entry.photo_path) ?? null) : null
                            }
                            accepted={Boolean(entry.accepted_at)}
                            edited={Boolean(entry.edited_at)}
                            extractionError={entry.extraction_error}
                            values={entry.observations.map((o) => ({
                              id: o.id,
                              kind: o.kind,
                              label: o.label,
                              value_text: o.value_text,
                              value_num: o.value_num,
                              source_quote: o.source_quote,
                              needs_confirmation: o.needs_confirmation,
                              confirmed_at: o.confirmed_at,
                            }))}
                          />
                        ))
                      )}
                    </div>
                  </details>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Last on the page: the admission ending, after everything it is assembled from.
          Bottom padding clears the fixed speak bar so it stays openable. */}
      <section className="px-6 pb-72">
        <DischargeSection brief={dischargeBrief} patientName={patient.display_name} />
      </section>

      {/* Fixed, so the button is under your thumb no matter how long the record has grown. */}
      <BottomBar>
        {/* Visible while you hold the button, so you know what is left to cover without
              having to remember the set for this operation. */}
          {missing.length > 0 && (
            <p className="truncate text-[13px] text-muted">
              <span className="text-orange-700">Still to cover:</span>{" "}
              {missing
                .slice(0, 3)
                .map((m) => m.item.hint ?? m.item.label)
                .join(" · ")}
              {missing.length > 3 && ` · +${missing.length - 3} more`}
            </p>
          )}
          <BedsideBar patientId={patient.id} />
        </BottomBar>
    </div>
  );
}

/**
 * A day's heading in the record. "Today" and "Yesterday" carry the date with them rather than
 * replacing it — on a ward round the relative word is what you scan for, but the date is what
 * gets written in the notes.
 */
function dayHeading(iso: string, todayKey: string): string {
  const date = new Date(iso).toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "short",
  });

  const key = istDayKey(iso);
  if (key === todayKey) return `Today · ${date}`;

  const yesterday = new Date(`${todayKey}T00:00:00Z`);
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  if (key === yesterday.toISOString().slice(0, 10)) return `Yesterday · ${date}`;

  return date;
}

/**
 * "due today" or "2 days overdue", shown only when the calendar has moved a job rather than
 * the resident. Said in words, so an escalation never looks like something they graded.
 */
function CameDue({ observation }: { observation: Observation }) {
  const effective = effectiveUrgency(observation);
  if (!effective.note) return null;

  return <span className="ml-2 whitespace-nowrap text-xs text-red-600">— {effective.note}</span>;
}
