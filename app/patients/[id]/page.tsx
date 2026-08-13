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
import { derivePatientState, groupIntoSittings, type Observation } from "@/lib/patient-state";
import { dayLabel, managementLabel, patientName } from "@/lib/patients";
import { effectiveUrgency } from "@/lib/urgency";
import BedsideBar from "./bedside-bar";
import EditIdentity from "../edit-identity";
import UrgencyDot from "./urgency-dot";
import { confirmChecked, confirmAll, completeTask, reopenTask } from "./actions";

type Entry = {
  id: string;
  source: "voice" | "photo" | "manual";
  transcript: string | null;
  photo_path: string | null;
  recorded_at: string;
  extraction_error: string | null;
  observations: Observation[];
};

export default async function PatientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: patient } = await supabase
    .from("current_patients")
    .select(
      "id, ward_id, display_name, age_years, sex, bed, primary_diagnosis, admitted_on, surgery_date, post_op_day, admission_day, status, template_family, template_variant, procedure_text, management"
    )
    .eq("id", id)
    .maybeSingle();

  if (!patient) notFound();

  // The next bed in walking order, so finishing one patient and starting the next is one tap
  // rather than a trip back through the ward list.
  const { patients: ward } = await getActivePatients(patient.ward_id);
  const here = ward.findIndex((p) => p.id === patient.id);
  const next = here >= 0 ? ward[here + 1] : undefined;
  const position = here >= 0 ? `${here + 1} of ${ward.length}` : null;

  const { data: entriesData } = await supabase
    .from("entries")
    .select(
      "id, source, transcript, photo_path, recorded_at, extraction_error, observations(id, kind, label, value_text, unit, source_quote, needs_confirmation, confirmed_at, conflict_note, done_at, urgency, graded_at, recorded_at)"
    )
    .eq("patient_id", id)
    .order("recorded_at", { ascending: false });

  const entries = (entriesData ?? []) as unknown as Entry[];

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
  const template = await getTemplateForPatient(patient);
  const allObservations = entries.flatMap((e) => e.observations);
  const { matched, missing, extra, openTasks, doneTasks, pending } = derivePatientState(
    allObservations,
    template
  );

  // One visit to the bedside reads as one block in the record, however many times you spoke
  // or photographed something while standing there.
  const sittings = groupIntoSittings(entries);

  const [procedures, templateChoices] = await Promise.all([
    getProcedureLabels(),
    listTemplateChoices(),
  ]);
  const procedure = procedureFor(patient, procedures);
  const management = managementLabel(patient);

  return (
    <div className="flex-1 flex flex-col max-w-md mx-auto w-full">
      <header className="px-6 pt-8 pb-4">
        <div className="flex items-center justify-between gap-3">
          <Link href="/" className="text-sm text-muted underline underline-offset-4">
            ← Ward
          </Link>
          <div className="flex items-center gap-3">
            {position && <span className="text-xs text-muted tabular-nums">{position}</span>}
            {/* Moved up here so the bottom of the screen stays two controls. */}
            {next && (
              <Link
                href={`/patients/${next.id}`}
                className="text-sm text-accent underline underline-offset-4"
              >
                Next →
              </Link>
            )}
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between gap-2">
          <h1 className="min-w-0 flex-1 truncate text-2xl font-semibold tracking-tight">
            {patientName(patient)}
          </h1>
          <EditIdentity patient={patient} templateChoices={templateChoices} />
          <span className="shrink-0 text-sm text-muted tabular-nums">
            {dayLabel(patient)}
          </span>
        </div>
        <p className="text-muted text-sm mt-0.5">
          Bed {patient.bed}
          {procedure && ` · ${procedure}`} ·{" "}
          {patient.primary_diagnosis || "No diagnosis recorded"}
        </p>
        {management && (
          <p className="mt-2 inline-flex items-center rounded-md border border-line px-2 py-1 text-xs tracking-wide text-muted">
            {management}
          </p>
        )}
      </header>

      {(openTasks.length > 0 || doneTasks.length > 0) && (
        <section className="px-6 pb-6">
          <p className="text-sm text-muted mb-2">
            To do{openTasks.length > 0 ? ` · ${openTasks.length}` : ""}
          </p>

          {openTasks.length > 0 ? (
            <ul className="rounded-xl border border-line bg-card divide-y divide-line">
              {openTasks.map((o) => (
                <li key={o.id} className="flex items-start gap-3 px-4 py-3">
                  <form action={completeTask} className="shrink-0 pt-0.5">
                    <input type="hidden" name="observation_id" value={o.id} />
                    <input type="hidden" name="patient_id" value={patient.id} />
                    <button
                      aria-label={`Mark done: ${o.value_text ?? o.label}`}
                      className="h-6 w-6 rounded-md border border-muted/50 active:bg-accent active:border-accent"
                    />
                  </form>
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
                    <p className="text-sm">
                      {o.value_text ?? o.label}
                      <CameDue observation={o} />
                    </p>
                    {/* The words it came from, so a job is never just the app's paraphrase. */}
                    <p className="mt-0.5 text-xs text-muted italic truncate">
                      “{o.source_quote}”
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="rounded-xl border border-line bg-card px-4 py-3 text-sm text-muted">
              Nothing outstanding.
            </p>
          )}

          {doneTasks.length > 0 && (
            <details className="mt-2">
              <summary className="text-xs text-muted cursor-pointer">
                {doneTasks.length} done
              </summary>
              <ul className="mt-2 flex flex-col gap-1.5">
                {doneTasks.map((o) => (
                  <li key={o.id} className="flex items-baseline justify-between gap-3">
                    <span className="text-sm text-muted line-through truncate">
                      {o.value_text ?? o.label}
                    </span>
                    <form action={reopenTask} className="shrink-0">
                      <input type="hidden" name="observation_id" value={o.id} />
                      <input type="hidden" name="patient_id" value={patient.id} />
                      <button className="text-xs text-muted underline underline-offset-4">
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
        <section className="px-6 pb-6">
          <p className="text-sm text-amber-200 mb-2">
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
                  className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-3"
                >
                  <label className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      name="observation_ids"
                      value={o.id}
                      // Unticked by default. Confirming is the resident vouching for a
                      // value, so it has to be something they did, not something they
                      // failed to undo.
                      className="mt-0.5 h-5 w-5 shrink-0 accent-amber-400"
                    />
                    <span className="min-w-0 flex-1 text-sm">
                      <span className="text-muted">{o.label}</span>{" "}
                      <span className="font-medium">{o.value_text}</span>
                    </span>
                  </label>
                  <p className="mt-1.5 pl-8 text-xs text-amber-200/70 italic">
                    “{o.source_quote}”
                  </p>
                  {o.conflict_note && (
                    <p className="mt-1 pl-8 text-xs text-amber-100">{o.conflict_note}</p>
                  )}
                </li>
              ))}
            </ul>

            <div className="mt-3 flex gap-3">
              <button
                type="submit"
                className="flex-1 rounded-xl border border-amber-400/50 px-4 py-3 text-sm font-semibold text-amber-200"
              >
                Accept ticked
              </button>
              {/* Same form, different action — this one ignores the ticks and takes
                  everything still outstanding. */}
              <button
                type="submit"
                formAction={confirmAll}
                className="flex-1 rounded-xl bg-amber-400 px-4 py-3 text-sm font-semibold text-slate-900"
              >
                Accept all {pending.length}
              </button>
            </div>
          </form>
        </section>
      )}

      {(matched.length > 0 || extra.length > 0) && (
        <section className="px-6 pb-6">
          <div className="flex items-baseline justify-between gap-3 mb-2">
            <p className="text-sm text-muted">Where things stand</p>
            {template && <p className="text-xs text-muted truncate">{template.name}</p>}
          </div>

          <ul className="rounded-xl border border-line bg-card divide-y divide-line">
            {matched.map((m) => (
              <li
                key={m.item.id}
                className="flex items-baseline justify-between gap-3 px-4 py-2.5"
              >
                <span className="text-sm text-muted">{m.item.label}</span>
                {m.value ? (
                  <span className="text-sm text-right">{m.value}</span>
                ) : (
                  // Absent is shown as absent. Never a placeholder, never a guess.
                  <span
                    className={
                      "text-sm text-right " + (m.missing ? "text-amber-300" : "text-muted/50")
                    }
                  >
                    not recorded
                  </span>
                )}
              </li>
            ))}
            {extra.map((o) => (
              <li key={o.id} className="flex items-baseline justify-between gap-3 px-4 py-2.5">
                <span className="text-sm text-muted">{o.label}</span>
                <span className="text-sm text-right">{o.value_text}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Bottom padding clears the fixed speak bar so the oldest entry stays reachable. */}
      <section className="px-6 pb-56">
        <p className="text-sm text-muted mb-2">Record</p>
        {entries.length === 0 ? (
          <p className="rounded-xl border border-line bg-card p-5 text-sm text-muted">
            Nothing recorded yet. Hold the button above and say what has changed.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {sittings.map((sitting) => (
              <li
                key={sitting.entries[0].id}
                className="rounded-xl border border-line bg-card p-4"
              >
                <p className="text-xs text-muted">
                  {new Date(sitting.recorded_at).toLocaleString("en-IN", {
                    day: "numeric",
                    month: "short",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </p>

                <div className="mt-2 flex flex-col gap-3">
                  {sitting.entries.map((entry) => (
                    <div key={entry.id}>
                      {entry.observations.length > 0 && (
                        <ul className="flex flex-col gap-1.5">
                          {entry.observations.map((o) => (
                            <li key={o.id} className="text-sm">
                              <span className="text-muted">{o.label}:</span> {o.value_text}
                            </li>
                          ))}
                        </ul>
                      )}

                      {entry.extraction_error && (
                        <p className="mt-2 text-xs text-amber-200">
                          Could not be structured — the words below are what was heard.
                        </p>
                      )}

                      {/* The evidence, one tap away, for anything on screen. For a
                          photographed report this is the only check there is — nothing can
                          re-read it server side — so the image itself sits right beside the
                          values it produced. */}
                      {entry.photo_path && photoUrls.get(entry.photo_path) && (
                        <a
                          href={photoUrls.get(entry.photo_path)}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-2 block"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={photoUrls.get(entry.photo_path)}
                            alt="Photographed lab report"
                            className="w-full rounded-lg border border-line"
                          />
                          <span className="mt-1 block text-xs text-muted">
                            Tap to open the report full size
                          </span>
                        </a>
                      )}

                      {entry.transcript && (
                        <details className="mt-2">
                          <summary className="text-xs text-muted cursor-pointer">
                            What you said
                          </summary>
                          <p className="mt-1.5 text-xs text-muted italic leading-relaxed">
                            {entry.transcript}
                          </p>
                        </details>
                      )}
                    </div>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Fixed, so the button is under your thumb no matter how long the record has grown. */}
      <div className="fixed bottom-0 inset-x-0 bg-gradient-to-t from-background via-background to-transparent pt-10 pb-8 px-6">
        <div className="mx-auto max-w-md flex flex-col gap-3">
          {/* Visible while you hold the button, so you know what is left to cover without
              having to remember the set for this operation. */}
          {missing.length > 0 && (
            <p className="text-xs text-muted leading-relaxed">
              <span className="text-amber-300">Still to cover:</span>{" "}
              {missing.map((m) => m.item.hint ?? m.item.label).join(" · ")}
            </p>
          )}
          <BedsideBar patientId={patient.id} />
        </div>
      </div>
    </div>
  );
}

/**
 * "due today" or "2 days overdue", shown only when the calendar has moved a job rather than
 * the resident. Said in words, so an escalation never looks like something they graded.
 */
function CameDue({ observation }: { observation: Observation }) {
  const effective = effectiveUrgency(observation);
  if (!effective.note) return null;

  return <span className="ml-2 whitespace-nowrap text-xs text-red-300">— {effective.note}</span>;
}
