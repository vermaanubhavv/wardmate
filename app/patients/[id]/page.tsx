import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getActivePatients } from "@/lib/ward";
import {
  getTemplateForPatient,
  getProcedureLabels,
  listTemplateChoices,
  procedureFor,
  phaseFor,
  type MatchedItem,
} from "@/lib/templates";
import {
  derivePatientState,
  groupByDay,
  groupIntoSittings,
  istDayKey,
  type Observation,
  type PacVerdict,
} from "@/lib/patient-state";
import { isIdentifierLabel, mergeLabelValue, stripPatientHonorific } from "@/lib/patients";
import { describeWhen, effectiveUrgency } from "@/lib/urgency";
import BedsideBar from "./bedside-bar";
import EditIdentity from "../edit-identity";
import UrgencyDot from "./urgency-dot";
import { ChevronIcon } from "../../icons";
import { quoteAddsNothing } from "@/lib/dedupe-tasks";
import Tick from "./tick";
import EntryCard from "./entry-card";
import CaseHistoryCapture from "./case-history-capture";
import DischargeSection from "./discharge-section";
import { buildDischargeBrief } from "@/lib/discharge";
import { confirmChecked, confirmAll, reopenTask } from "./actions";
import BottomBar from "../../bottom-bar";
import { listedComorbidities } from "@/lib/comorbidities";
import { summariseObjective } from "@/lib/exam-summary";

type Entry = {
  id: string;
  source: "voice" | "photo" | "manual";
  transcript: string | null;
  /** What was first heard, kept whenever the app or a resident changed the words. */
  original_transcript: string | null;
  photo_path: string | null;
  recorded_at: string;
  extraction_error: string | null;
  accepted_at: string | null;
  edited_at: string | null;
  /** The admission clerking note rather than a round entry — see CaseHistoryCapture. */
  is_case_history: boolean;
  /** Published protocols this entry's words looked related to — see lib/protocols.ts. */
  matched_protocol_ids: string[] | null;
  observations: Observation[];
};

export default async function PatientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: patient } = await supabase
    .from("current_patients")
    .select(
      "id, ward_id, display_name, age_years, sex, bed, uhid_ip_no, mrd_no, primary_diagnosis, admitted_on, surgery_date, planned_surgery_date, post_op_day, admission_day, status, template_family, template_variant, procedure_text, management, location"
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
          "id, source, transcript, original_transcript, photo_path, recorded_at, extraction_error, accepted_at, edited_at, is_case_history, matched_protocol_ids, observations(id, kind, label, value_text, value_num, unit, source_quote, needs_confirmation, confirmed_at, conflict_note, done_at, urgency, graded_at, recorded_at, pac_verdict)"
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
  const allEntries = ((entriesData ?? []) as unknown as Entry[]).map((e) => ({
    ...e,
    observations: e.observations.filter((o) => !isIdentifierLabel(o.label)),
  }));

  // Case history is pinned in its own section rather than folded into a dated day — see
  // CaseHistoryCapture. Split here, once, so nothing downstream has to keep checking the flag:
  // the day-by-day record only ever sees round entries, while allObservations (below) still
  // draws from both, because a plan stated in the case history belongs on the to-do list
  // exactly as a spoken one would.
  const caseHistoryEntries = allEntries.filter((e) => e.is_case_history);
  const entries = allEntries.filter((e) => !e.is_case_history);

  // Titles for whatever protocols got matched, fetched once for the whole page rather than
  // once per entry — the same batching reasoning as the photo URLs just above.
  const matchedIds = Array.from(
    new Set(allEntries.flatMap((e) => e.matched_protocol_ids ?? []))
  );
  const protocolTitles = new Map<string, string>();
  if (matchedIds.length > 0) {
    const { data: matchedProtocols } = await supabase
      .from("company_protocols")
      .select("id, title")
      .in("id", matchedIds);
    for (const p of matchedProtocols ?? []) protocolTitles.set(p.id, p.title);
  }

  // Short-lived links for the stored photographs. The bucket is private, so these are the
  // only way to see one, they expire in an hour, and they are only ever minted here — for a
  // doctor the database has already confirmed is a member of this patient's ward.
  const photoPaths = allEntries.map((e) => e.photo_path).filter((p): p is string => Boolean(p));
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
  // relies on that order to pick the latest value for each thing. Drawn from allEntries, not
  // entries: the case history is excluded from the day-by-day record but not from what decides
  // the to-do list and "where things stand" — a plan is a plan whichever way it was captured.
  const allObservations = allEntries.flatMap((e) => e.observations);
  const patientState = derivePatientState(allObservations, template);
  const { matched, missing, extra, openTasks, doneTasks, pending, pac } = patientState;

  // Before surgery is exactly what the templates already mean by it — no date of operation on
  // record yet. The PAC section belongs to that stretch of the admission and nowhere else:
  // after the operation the question has been answered by events.
  const beforeSurgery = phaseFor(patient) === "before_surgery";

  // Latest progress is its own summary above. The historical list therefore begins with the
  // entry before it rather than making the same update appear twice on one screen.
  const latestEntry = entries[0] ?? null;
  const previousEntries = entries.slice(1);
  const sittings = groupIntoSittings(previousEntries);
  const days = groupByDay(sittings);
  const todayKey = istDayKey(new Date().toISOString());

  const procedure = procedureFor(patient, procedures);
  const caseHistoryDiagnosis = caseHistoryEntries
    .flatMap((entry) => entry.observations)
    .find((observation) => observation.kind === "diagnosis");
  const diagnosis = patient.primary_diagnosis ?? caseHistoryDiagnosis?.value_text ?? null;
  // Background illness is cumulative, not a latest-wins vital: "K/C/O asthma" from the
  // admission sheet must remain visible when diabetes is mentioned on a later round. The
  // helper also recognises older entries captured before the extractor used this label.
  const comorbidities = listedComorbidities(allObservations);

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
        <Link href="/ward" className="flex items-center text-[17px] text-accent active:opacity-60">
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

      <header className="px-4 pb-6 pt-4">
        <div className="flex items-center gap-2.5">
          <div className="min-w-0 flex-1">
            <h1 className="flex min-w-0 items-baseline gap-2 text-[clamp(1.05rem,5vw,1.5rem)] tracking-tight">
              <span className="shrink-0 rounded-md bg-chip px-1.5 py-0.5 font-mono text-[0.72em] font-semibold text-accent">
                {patient.bed}
              </span>
              <span className="min-w-0 truncate font-bold">
                {stripPatientHonorific(patient.display_name)}
              </span>
              <span className="shrink-0 whitespace-nowrap text-[0.72em] font-medium tracking-normal text-muted">
                {[
                  patient.age_years !== null ? patient.age_years : null,
                  patient.sex === "other" ? "O" : patient.sex,
                ]
                  .filter((value) => value !== null && value !== "")
                  .join("/")}
              </span>
            </h1>
            {patient.uhid_ip_no && (
              <p className="mt-2 truncate pl-0.5 text-[12px] text-muted">
                <span className="uppercase tracking-wide">UHID / IP</span>
                <span className="mx-1.5">·</span>
                <span className="font-mono text-foreground/80">{patient.uhid_ip_no}</span>
              </p>
            )}
          </div>
          <div className="shrink-0">
            <EditIdentity patient={patient} templateChoices={templateChoices} />
          </div>
        </div>

        {/* Only the clinical facts needed to identify the admission live here. Bed and hospital
            number have moved into the header above; the rest of the record follows below. */}
        <dl className="ios-group mt-5 text-[15px]">
          <SummaryRow label="Diagnosis" value={diagnosis ?? "Not recorded"} />
          {patient.post_op_day !== null && (
            <SummaryRow
              label="Operation"
              value={`POD ${patient.post_op_day}${procedure ? ` (${procedure})` : ""}`}
            />
          )}
          <SummaryRow
            label="Co-morbidities"
            value={comorbidities.length > 0 ? comorbidities.join(" · ") : "Not recorded"}
          />
        </dl>
      </header>

      {/* Standing context, not a dated round — the clerking note the rest of the admission is
          read against. Pinned here, above even the latest progress, because a plan someone
          decides today is decided in light of this, not the other way round. */}
      <section className="px-4 pb-6">
        <details open className="ios-group [&[open]_.case-history-chev]:rotate-90">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-[15px] font-semibold active:bg-chip [&::-webkit-details-marker]:hidden">
            <span>Case history</span>
            <span className="flex items-center gap-2">
              <span className="text-[12px] font-normal text-muted">
                {caseHistoryEntries.length > 0 ? "Recorded" : "Not recorded"}
              </span>
              <span className="case-history-chev text-xl font-normal text-muted transition-transform">›</span>
            </span>
          </summary>

          <div className="border-t border-line">
            {caseHistoryEntries.length > 0 ? caseHistoryEntries.map((entry) => (
              <EntryCard
                key={entry.id}
                embedded
                entryId={entry.id}
                patientId={patient.id}
                time={new Date(entry.recorded_at).toLocaleDateString("en-IN", {
                  timeZone: "Asia/Kolkata",
                  day: "numeric",
                  month: "short",
                })}
                transcript={entry.transcript}
                heard={entry.original_transcript}
                photoUrl={entry.photo_path ? (photoUrls.get(entry.photo_path) ?? null) : null}
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
                matchedProtocols={(entry.matched_protocol_ids ?? [])
                  .filter((id) => protocolTitles.has(id))
                  .map((id) => ({ id, title: protocolTitles.get(id)! }))}
              />
            )) : (
              <p className="px-4 py-3 text-[14px] text-muted">No case history recorded yet.</p>
            )}
            <CaseHistoryCapture
              patientId={patient.id}
              hasExisting={caseHistoryEntries.length > 0}
            />
          </div>
        </details>
      </section>

      {/* Only before surgery, and shown even when empty — an unanswered PAC is the single
          thing most likely to stop a list, so "nobody has recorded one" has to be visible
          rather than inferred from a section that isn't there. */}
      {beforeSurgery && <PacSection pac={pac} />}

      <section className="px-4 pb-6">
        <p className="ios-group-header mb-2 px-4">Latest progress</p>
        {latestEntry ? (
          <LatestProgress entry={latestEntry} protocolTitles={protocolTitles} />
        ) : (
          <p className="ios-group px-4 py-3 text-[15px] text-muted">Nothing recorded yet.</p>
        )}
      </section>

      {(openTasks.length > 0 || doneTasks.length > 0) && (
        <section className="px-4 pb-6">
          <p className="ios-group-header mb-2 px-4">
            Advices, plans &amp; to do{openTasks.length > 0 ? ` · ${openTasks.length}` : ""}
          </p>

          {openTasks.length > 0 ? (
            <ul className="ios-group divide-y divide-line">
              {openTasks.map((o) => {
                // "Tomorrow" is only true on the day it was said. Rewritten fresh on every
                // read, the same way effectiveUrgency below re-reads the colour — neither is
                // stored, both are computed from the calendar as it stands right now. See
                // lib/urgency.ts describeWhen.
                const jobText = describeWhen(o.value_text ?? o.label, o.recorded_at);
                return (
                <li key={o.id} className="flex items-start gap-3 px-4 py-3">
                  <Tick
                    observationId={o.id}
                    patientId={patient.id}
                    label={jobText}
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
                      {jobText}
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
                );
              })}
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
          {/* Folded by default. This is the reference table — every value currently on record —
              and it is the longest block on the page, sitting between the jobs at the top and
              the round at the bottom, which are the two things a patient is actually opened
              for. What is ACTIONABLE about it survives the fold: the count of things never
              recorded stays on the summary line, in orange, so nothing is hidden that somebody
              needs to act on. */}
          <details className="[&[open]_.chev]:rotate-90">
            <summary className="mb-2 flex cursor-pointer list-none items-baseline gap-2 active:opacity-60 [&::-webkit-details-marker]:hidden">
              <span className="chev shrink-0 text-[11px] text-muted transition-transform">▶</span>
              <span className="ios-group-header">Current progress</span>
              {missing.length > 0 && (
                <span className="shrink-0 text-[13px] text-orange-700 tabular-nums">
                  {missing.length} not recorded
                </span>
              )}
              {template && (
                <span className="ml-auto min-w-0 truncate text-[13px] text-muted">
                  {template.name}
                </span>
              )}
            </summary>

            {soapGroups(matched, extra).map(({ section, label, matchedItems, extraItems }) => (
              <div key={section} className="mb-3 last:mb-0">
                <p className="mb-1 px-1 text-[12px] font-semibold uppercase tracking-wide text-muted">
                  {label}
                </p>
                {section === "objective" ? (
                  <ObjectiveBlock matchedItems={matchedItems} extraItems={extraItems} />
                ) : (
                <ul className="ios-group divide-y divide-line">
                  {matchedItems.map((m) => (
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
                            "text-sm text-right " +
                            (m.missing ? "text-orange-700" : "text-muted/50")
                          }
                        >
                          not recorded
                        </span>
                      )}
                    </li>
                  ))}
                  {extraItems.map((o) => (
                    <li key={o.id} className="flex items-baseline justify-between gap-3 px-4 py-2.5">
                      <span className="text-[15px] text-muted">{o.label}</span>
                      <span className="text-sm text-right">{o.value_text}</span>
                    </li>
                  ))}
                </ul>
                )}
              </div>
            ))}
          </details>
        </section>
      )}

      {/* Bottom padding clears the fixed speak bar so the oldest entry stays reachable. */}
      <section className="px-4 pb-6">
        <p className="ios-group-header mb-2 px-4">Previous records</p>
        {previousEntries.length === 0 ? (
          <p className="ios-group p-5 text-[15px] text-muted">
            No earlier records yet.
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
                            heard={entry.original_transcript}
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
                            matchedProtocols={(entry.matched_protocol_ids ?? [])
                              .filter((id) => protocolTitles.has(id))
                              .map((id) => ({ id, title: protocolTitles.get(id)! }))}
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
        <DischargeSection
          brief={dischargeBrief}
          patientName={stripPatientHonorific(patient.display_name)}
        />
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

const PAC_META: Record<
  NonNullable<PacVerdict>,
  { word: string; card: string; dot: string }
> = {
  fit: {
    word: "Fit for surgery",
    card: "border-emerald-300 bg-emerald-50 text-emerald-900",
    dot: "bg-emerald-500",
  },
  fit_with_conditions: {
    word: "Fit, with conditions",
    card: "border-amber-300 bg-amber-50 text-amber-900",
    dot: "bg-amber-500",
  },
  unfit: {
    word: "Unfit",
    card: "border-red-300 bg-red-50 text-red-900",
    dot: "bg-red-500",
  },
  pending: {
    word: "Awaited",
    card: "border-orange-300 bg-orange-50 text-orange-900",
    dot: "bg-orange-400",
  },
};

/**
 * Where the pre-anaesthetic checkup stands, for a patient who has not been operated on yet.
 *
 * It has a section of its own rather than a row in the checklist because it is not really a
 * value — it is a decision, it changes as the patient is optimised, and on the morning of a
 * list it is the thing most likely to stop everything. The latest verdict is the headline; the
 * earlier ones stay underneath, because "unfit, sugars uncontrolled" followed a week later by
 * "fit" is the story of the admission and deleting the first half of it would be a lie.
 *
 * Nothing here is worked out by the app. A verdict exists only because somebody said one, the
 * words are theirs, and the quote behind it is a real span of what they said. When no one has
 * said anything, this says exactly that instead of guessing from the fact that a patient is on
 * a list.
 */
function PacSection({ pac }: { pac: Observation[] }) {
  const [latest, ...earlier] = pac;
  const meta = latest?.pac_verdict ? PAC_META[latest.pac_verdict] : null;

  return (
    <section className="px-4 pb-6">
      <p className="ios-group-header mb-2 px-4">Pre-anaesthetic checkup</p>

      {!latest || !meta ? (
        <p className="ios-group px-4 py-3 text-[15px] text-orange-700">
          Not recorded. Nobody has said whether this patient is fit for surgery.
        </p>
      ) : (
        <>
          <div className={"rounded-[10px] border px-4 py-3 " + meta.card}>
            <div className="flex items-baseline gap-2">
              <span className={"h-2.5 w-2.5 shrink-0 rounded-full " + meta.dot} aria-hidden />
              <span className="text-[17px] font-semibold">{meta.word}</span>
              <span className="ml-auto shrink-0 text-[13px] opacity-70">
                {pacWhen(latest.recorded_at)}
              </span>
            </div>

            {/* The verdict word above is the app's reading of the sentence. This is the
                sentence — kept beside it, never replaced by it. */}
            <p className="mt-1.5 text-[15px] leading-snug">{latest.value_text ?? latest.label}</p>

            {!quoteAddsNothing(latest.value_text ?? latest.label, latest.source_quote) && (
              <p className="mt-1 text-[13px] italic opacity-70">“{latest.source_quote}”</p>
            )}
          </div>

          {(latest.pac_verdict === "fit_with_conditions" || latest.pac_verdict === "unfit") && (
            <p className="mt-1.5 px-1 text-[13px] text-muted">
              Anything the anaesthetist asked for is on the to-do list above, one job at a time.
            </p>
          )}

          {earlier.length > 0 && (
            <details className="mt-2 [&[open]_.chev]:rotate-90">
              <summary className="flex cursor-pointer list-none items-baseline gap-2 px-1 text-[13px] text-muted active:opacity-60 [&::-webkit-details-marker]:hidden">
                <span className="chev shrink-0 text-[11px] transition-transform">▶</span>
                {earlier.length} earlier {earlier.length === 1 ? "verdict" : "verdicts"}
              </summary>
              <ul className="mt-1.5 ios-group divide-y divide-line">
                {earlier.map((o) => (
                  <li key={o.id} className="px-4 py-2.5">
                    <div className="flex items-baseline gap-2">
                      <span className="text-[15px]">
                        {o.pac_verdict ? PAC_META[o.pac_verdict].word : "Recorded"}
                      </span>
                      <span className="ml-auto shrink-0 text-[13px] text-muted">
                        {pacWhen(o.recorded_at)}
                      </span>
                    </div>
                    <p className="mt-0.5 text-[13px] text-muted">{o.value_text ?? o.label}</p>
                  </li>
                ))}
              </ul>
            </details>
          )}
        </>
      )}
    </section>
  );
}

function pacWhen(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "short",
  });
}

/**
 * The objective examination as a chart line rather than a table — see lib/exam-summary.ts for
 * the reading of it, and for why nothing is folded away unless it plainly says so.
 *
 * Two absences are reported here, and they are different absences. The PICCLE line carries any
 * of the seven signs nobody examined, because printing the acronym over an incomplete
 * examination would assert findings that were never made. The orange line underneath carries
 * the checklist items still outstanding, which is the same thing the table used to say with a
 * row each.
 */
function ObjectiveBlock({
  matchedItems,
  extraItems,
}: {
  matchedItems: MatchedItem[];
  extraItems: Observation[];
}) {
  const summary = summariseObjective([
    ...matchedItems.map((m) => ({ id: m.item.id, label: m.item.label, value: m.value })),
    ...extraItems.map((o) => ({ id: o.id, label: o.label, value: o.value_text })),
  ]);
  const outstanding = matchedItems.filter((m) => m.missing).map((m) => m.item.label);

  const empty =
    summary.vitals.length === 0 &&
    !summary.piccle &&
    summary.findings.length === 0 &&
    summary.normalCount === 0;

  return (
    <div className="ios-group px-4 py-3 text-[15px] leading-relaxed">
      {summary.vitals.length > 0 && (
        <p className="tabular-nums">
          {summary.vitals.map((v) => `${v.label} ${v.value}`).join("  ·  ")}
        </p>
      )}

      {summary.piccle && (
        <p className={summary.vitals.length > 0 ? "mt-1" : ""}>
          {summary.piccle.text}
          {summary.piccle.notRecorded.length > 0 && (
            <span className="text-[13px] text-muted">
              {"  ·  "}
              {summary.piccle.notRecorded.join(", ").toLowerCase()} not recorded
            </span>
          )}
        </p>
      )}

      {/* The abnormalities, which are the reason anyone reads this section. */}
      {summary.findings.map((f) => (
        <p key={f.id} className="mt-1">
          <span className="text-muted">{f.label}</span> <span className="font-medium">{f.value}</span>
        </p>
      ))}

      {summary.normalCount > 0 && <p className="mt-1 text-muted">Rest — NAD</p>}

      {empty && <p className="text-muted">Nothing examined yet.</p>}

      {outstanding.length > 0 && (
        <p className="mt-2 text-[13px] text-orange-700">
          Not recorded: {outstanding.join(", ")}
        </p>
      )}
    </div>
  );
}

const SOAP_ORDER = ["subjective", "objective", "assessment", "plan", "checks"] as const;
const SOAP_LABELS: Record<(typeof SOAP_ORDER)[number], string> = {
  subjective: "Subjective",
  objective: "Objective",
  assessment: "Assessment",
  plan: "Plan",
  checks: "Checks",
};

/** Raw observation kinds, for the "extra" items a checklist never asked about — they carry a
 *  kind but no soap_section of their own, so this is the same default a checklist item without
 *  an explicit section would fall back to. */
function kindToSoapSection(kind: string): (typeof SOAP_ORDER)[number] {
  switch (kind) {
    case "day_number":
    case "vital":
    case "exam":
    case "drain":
    case "intake_output":
    case "lab":
      return "objective";
    case "medication":
    case "plan":
      return "plan";
    case "diagnosis":
      return "assessment";
    default:
      return "checks";
  }
}

/**
 * "Current progress" grouped as Subjective / Objective / Assessment / Plan, with a fifth
 * bucket for the genuinely administrative checks (consent, fitness, fasting status) that do
 * not honestly belong in any SOAP section — see the conversation that decided this rather than
 * forcing them into Plan. A checklist item without a soap_section yet (not every procedure has
 * been migrated and backfilled) falls back the same way an "extra" observation does, so nothing
 * silently disappears — it just lands in Checks until it's classified.
 */
function soapGroups(matched: MatchedItem[], extra: Observation[]) {
  return SOAP_ORDER.map((section) => ({
    section,
    label: SOAP_LABELS[section],
    matchedItems: matched.filter((m) => (m.item.soap_section ?? "checks") === section),
    extraItems: extra.filter((o) => kindToSoapSection(o.kind) === section),
  })).filter((g) => g.matchedItems.length > 0 || g.extraItems.length > 0);
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

/** A fact in the patient identity block. The long text gets room; the label stays scannable. */
function SummaryRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="ios-row px-4 py-3">
      <dt className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted">{label}</dt>
      <dd className="mt-0.5 text-[16px] leading-snug">{value}</dd>
    </div>
  );
}

/**
 * The most recent entry, shown without imposing SOAP labels. The extraction schema does not
 * reliably classify every spoken value as subjective, objective, or assessment, and the screen
 * must not make that clinical judgement on the resident's behalf.
 */
function LatestProgress({
  entry,
  protocolTitles,
}: {
  entry: Entry;
  protocolTitles: Map<string, string>;
}) {
  const values = entry.observations;
  const update = values.filter((o) => o.kind !== "plan" && !isIdentifierLabel(o.label));
  const plans = values.filter((o) => o.kind === "plan");
  const time = new Date(entry.recorded_at).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });

  const matched = (entry.matched_protocol_ids ?? [])
    .filter((id) => protocolTitles.has(id))
    .map((id) => ({ id, title: protocolTitles.get(id)! }));

  return (
    <div className="ios-group">
      <div className="border-b border-line px-4 py-2.5 text-[13px] text-muted">{time}</div>
      <ProgressGroup label="Latest update" values={update} />
      {plans.length > 0 && <ProgressGroup label="Advice / plan" values={plans} timeAware />}

      {matched.length > 0 && (
        <div className="ios-row flex flex-wrap gap-1.5 px-4 py-3">
          {matched.map((p) => (
            <Link
              key={p.id}
              href={`/protocols#${p.id}`}
              className="rounded-full border border-accent/40 bg-accent/10 px-2.5 py-1 text-[12px] font-medium text-accent"
            >
              Protocol: {p.title} ›
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function ProgressGroup({
  label,
  values,
  timeAware = false,
}: {
  label: string;
  values: Observation[];
  /** Plans read words like "tomorrow" that go stale the day after they are said — see
   *  lib/urgency.ts describeWhen. Findings ("abdomen soft") carry no such word, so this stays
   *  off for them rather than running a check that can never match anything. */
  timeAware?: boolean;
}) {
  return (
    <div className="ios-row px-4 py-3">
      <h2 className="text-[13px] font-medium text-muted">{label}</h2>
      {values.length > 0 ? (
        <ul className="mt-1 space-y-1 text-[15px]">
          {values.map((value) => {
            const text = timeAware
              ? describeWhen(mergeLabelValue(value.label, value.value_text), value.recorded_at)
              : mergeLabelValue(value.label, value.value_text);
            return <li key={value.id}>{text}</li>;
          })}
        </ul>
      ) : (
        <p className="mt-1 text-[15px] text-muted">Not recorded</p>
      )}
    </div>
  );
}
