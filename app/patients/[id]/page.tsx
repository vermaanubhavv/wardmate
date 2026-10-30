import Link from "next/link";
import { cookies } from "next/headers";
import { ANTIBIOTIC_DAY_COOKIE, antibioticDay, antibioticKey, isAntibiotic, isCourse, readDayPosition, withDay } from "@/lib/antibiotics";
import { antibioticStarts } from "@/lib/antibiotic-starts";
import { istDate } from "@/lib/urgency";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
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
  isDayCountLabel,
  istDayKey,
  repeatedLines,
  type Observation,
  type PacVerdict,
} from "@/lib/patient-state";
import { compareBeds, displayCase, isIdentifierLabel, stripPatientHonorific, managementChoicesFor } from "@/lib/patients";
import { effectiveUrgency, jobTitle, postOpJob } from "@/lib/urgency";
import BedsideBar from "./bedside-bar";
import type { DictationCopy } from "./recorder";
import { progressNoteConfigFor } from "@/lib/progress-note-config";
import PatientTabs from "./patient-tabs";
import EditIdentity from "../edit-identity";
import UrgencyDot from "./urgency-dot";
import NoOperationQuestion from "./no-operation-question";
import { ChevronIcon } from "../../icons";
import {
  Check,
  ClipboardList,
  CircleAlert,
  ListChecks,
  MessageSquareText,
  Pill,
  Ruler,
  ShieldCheck,
  Stethoscope,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";
import { quoteAddsNothing } from "@/lib/dedupe-tasks";
import Tick from "./tick";
import SwipeDelete from "./swipe-delete";
import PacSelect from "./pac-select";
import EntryCard, { type EntryChange } from "./entry-card";
import CaseHistoryCapture from "./case-history-capture";
import { CaseHistoryCard, ObjectiveSummaryView } from "./case-history-card";
import RoutineRoundButton from "./routine-round";
import SoapRows from "./soap-rows";
import DischargeTab from "./discharge-tab";
import InvestigationsSection from "./investigations-section";
import ScoringTaskRows from "./scoring/task-rows";
import ScoreCards from "./scoring/score-card";
import { syncPatientPathways } from "@/lib/scoring/store";
import { getPatientScoringTasks, getScoreCards } from "@/lib/scoring/read";
import { diagnosisFromProcedure } from "@/lib/diagnosis-from-procedure";
import { reopenTask } from "./actions";
import ConfirmDictation from "./confirm-dictation";
import AddDrug from "./add-drug";
import BottomBar from "../../bottom-bar";
import { listedComorbidities } from "@/lib/comorbidities";
import { summariseObjective, type WardRanges } from "@/lib/exam-summary";
import { etiologyFromDiagnosis, type EtiologyKey } from "@/lib/imaging-summary";
import { classifyVital, matchVitalLabel } from "@/lib/vital-ranges";
import { getWardLabRanges } from "@/lib/ward-lab-ranges";
import { getSpecialtyPack } from "@/lib/specialty";
import { hasOperationClock } from "@/lib/specialty/intake";
import { usesBurnClock } from "@/lib/specialty/clocks";
import { getWardSpecialtyStored } from "@/lib/ward";
import { getUser } from "@/lib/auth";
import HistoryCheckCard from "./history-check-card";
import { loadHistoryCheckCard } from "@/lib/history-check/page-data";
import { getExamChecklist } from "@/lib/history-check/exams";
import { shortDate, dateTime } from "@/lib/format-date";

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

/** One line of the trail written by the observation_history trigger (patch 0111). */
type HistoryRow = {
  entry_id: string;
  action: string;
  changed_at: string;
  changed_by: string | null;
  old: { label: string; value_text: string | null };
  new: { label: string; value_text: string | null };
};

/**
 * Who changed what on each entry, newest first, as the entry card shows it. Only edits and
 * deletes: a confirm or a done-tick is visible on the value itself and would only be noise.
 */
async function entryChanges(
  supabase: Awaited<ReturnType<typeof createClient>>,
  patientId: string,
): Promise<Map<string, EntryChange[]>> {
  const { data } = await supabase
    .from("observation_history")
    .select("entry_id, action, changed_at, changed_by, old, new")
    .eq("patient_id", patientId)
    .in("action", ["edit", "delete"])
    .order("changed_at", { ascending: false })
    .limit(200);
  const rows = (data ?? []) as HistoryRow[];
  const who = Array.from(new Set(rows.map((r) => r.changed_by).filter((u): u is string => Boolean(u))));
  const names = new Map<string, string>();
  if (who.length > 0) {
    const { data: profiles } = await supabase.from("profiles").select("id, display_name").in("id", who);
    for (const p of profiles ?? []) if (p.display_name) names.set(p.id, p.display_name);
  }
  const byEntry = new Map<string, EntryChange[]>();
  for (const r of rows) {
    const list = byEntry.get(r.entry_id) ?? [];
    list.push({
      action: r.action === "delete" ? "deleted" : "edited",
      label: r.old.label,
      from: r.old.value_text,
      to: r.action === "delete" ? null : r.new.value_text,
      who: (r.changed_by && names.get(r.changed_by)) || null,
      when: dateTime(r.changed_at),
    });
    byEntry.set(r.entry_id, list);
  }
  return byEntry;
}

export default async function PatientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: patient } = await supabase
    .from("current_patients")
    .select(
      "id, ward_id, display_name, age_years, sex, bed, uhid_ip_no, mrd_no, primary_diagnosis, admitted_on, surgery_date, planned_surgery_date, post_op_day, admission_day, regimen, cycle_number, cycle_started_on, cycle_day, status, template_family, template_variant, procedure_text, management, location"
    )
    .eq("id", id)
    .maybeSingle();

  if (!patient) notFound();

  // Access log: who looked at this patient's record, and when — see
  // 0072_patient_access_log.sql. Fire-and-forget; a failed log write must never be the reason
  // a doctor can't see a patient.
  getUser().then((user) => {
    if (!user) return;
    void supabase
      .from("patient_access_log")
      .insert({ patient_id: patient.id, ward_id: patient.ward_id, actor_id: user.id });
  });

  // The unit's department, resolved once: it decides how this patient's day is counted, which
  // checklist rows the picker offers, and whether the edit dialog shows chemotherapy fields.
  // Started here and awaited inside the batch below, so the reads that do not need it are not
  // queueing behind it.
  const packP = getWardSpecialtyStored(patient.ward_id).then(getSpecialtyPack);

  // The burn columns (patch 0085) are read in a second, tiny query instead of being named in
  // the select above, and only for a burns unit. The select above runs for EVERY patient on
  // every ward: naming a column there that a not-yet-migrated database does not have would
  // reject the whole query and take every patient page down with it. A unit can only be a
  // burns unit if 0085 has run, so asking here is always safe. Same reasoning as includeChemo
  // in lib/ward.ts, arrived at the other way round — there the pack is known before the query,
  // here it is only known after it.
  const burnsP = packP.then(async (p) =>
    usesBurnClock(p)
      ? (
          await supabase
            .from("current_patients")
            .select("burn_date, burn_day")
            .eq("id", patient.id)
            .maybeSingle()
        ).data
      : null
  );

  // Made a real promise once: a Supabase query is a thenable that runs again each time it is
  // awaited, and this one is awaited twice below.
  const entriesP = Promise.resolve(
    supabase
      .from("entries")
      .select(
        "id, source, transcript, original_transcript, photo_path, recorded_at, extraction_error, accepted_at, edited_at, is_case_history, matched_protocol_ids, observations(id, kind, label, value_text, value_num, unit, source_quote, needs_confirmation, confirmed_at, conflict_note, done_at, urgency, graded_at, recorded_at, pac_verdict, task_open, ref_low, ref_high, ref_text)"
      )
      .eq("patient_id", id)
      .order("recorded_at", { ascending: false })
  );

  // Short-lived links for the stored photographs (private bucket, one-hour expiry, minted only
  // here for a doctor already confirmed on this patient's ward) and the titles of any matched
  // protocols. Both need only the entry list, so they start the moment it lands instead of
  // waiting for the rest of the batch and the scoring reads after it.
  const photosAndProtocolsP = entriesP.then(({ data }) => {
    const rows = (data ?? []) as unknown as Entry[];
    const photoPaths = rows.map((e) => e.photo_path).filter((p): p is string => Boolean(p));
    const matchedIds = Array.from(new Set(rows.flatMap((e) => e.matched_protocol_ids ?? [])));
    return Promise.all([
      photoPaths.length > 0
        ? supabase.storage.from("evidence").createSignedUrls(photoPaths, 3600)
        : Promise.resolve({ data: [] as { path?: string | null; signedUrl?: string | null }[] }),
      matchedIds.length > 0
        ? supabase.from("company_protocols").select("id, title").in("id", matchedIds)
        : Promise.resolve({ data: [] as { id: string; title: string }[] }),
    ]);
  });

  // History check (behind NEXT_PUBLIC_HISTORY_CHECK). Suggestions come from the chief
  // complaints of the case history as dictated (identifier labels dropped, exactly as
  // allEntries does below); the card itself is rendered from stored runs, never live. Needs
  // only the entries and the pack, so it starts as soon as both land; awaited further down.
  const historyCheckP = Promise.all([entriesP, packP]).then(([{ data }, p]) =>
    loadHistoryCheckCard(
      supabase,
      patient,
      ((data ?? []) as unknown as Entry[])
        .filter((e) => e.is_case_history)
        .flatMap((e) => e.observations)
        .filter((o) => !isIdentifierLabel(o.label))
        .filter((o) => /chief complaint|presenting complaint/i.test(o.label))
        .map((o) => o.value_text ?? o.label),
      p.historyTreeIds
    )
  );
  historyCheckP.catch(() => {});

  // Clinical scoring & auto-trigger engine: bring pathways in step with the latest observations,
  // then read the tasks and cards. A no-op unless NEXT_PUBLIC_SCORING_ENGINE=on and the ward has
  // opted in (lib/scoring/flag.ts). It IS on in production, and timed there in October 2026 it
  // was the slowest read on this page (~200 ms typical, 1.3 s seen) — each open pathway is
  // recomputed one query at a time. So it starts here and nothing above the scoring section
  // waits for it: ScoringTodo and ScoringCards stream in behind Suspense once it lands, still
  // reading a freshly recomputed set.
  const scoringP = syncPatientPathways(id).then(() =>
    Promise.all([getPatientScoringTasks(id), getScoreCards(id)])
  );
  // Read by the streamed sections later; this only stops Node calling a failure "unhandled" in
  // the meantime. They still await scoringP itself, so an error still reaches error.tsx.
  scoringP.catch(() => {});

  const [
    pack,
    burns,
    { data: wardBeds },
    { data: entriesData },
    procedures,
    templateChoices,
    template,
    { data: dischargeRow },
    wardRanges,
    { data: dischargeWork },
    changesByEntry,
  ] = await Promise.all([
      packP,
      burnsP,
      // The next bed in walking order, so finishing one patient and starting the next is one
      // tap rather than a trip back through the ward list. Only ids and beds: getActivePatients
      // also pulls every observation and entry on the ward for the list's badges, which this
      // screen never shows and which grew with the ward — it was most of this page's wait.
      supabase
        .from("current_patients")
        .select("id, bed")
        .eq("ward_id", patient.ward_id)
        .eq("status", "active"),
      entriesP,
      packP.then((p) => getProcedureLabels(p.key)),
      packP.then((p) => listTemplateChoices(p.key)),
      // Needs only fields already in hand from the patient row, so it was queueing behind the
      // batch for nothing.
      getTemplateForPatient(patient),
      // Just the status line for the discharge fold — the workspace itself fetches the rest.
      supabase.from("discharge_summaries").select("status").eq("patient_id", id).maybeSingle(),
      // This ward's own laboratory ranges, for results that arrived without a report to read.
      // Needs only patient.ward_id, so it belongs in the batch rather than a round trip of its
      // own after it.
      getWardLabRanges(patient.ward_id),
      // Whether anyone has worked on the draft (patch 0102's computed column), read on its own:
      // opening this tab pre-writes AI sections, so "a row exists" is not "someone started".
      // If this read fails the tab behaves exactly as before — the status above is untouched,
      // so it can never look empty and re-run the AI over a resident's edits.
      supabase.from("discharge_summaries").select("discharge_worked_on").eq("patient_id", id).maybeSingle(),
      // Who corrected or removed what, for the entry cards' (i) panel.
      entryChanges(supabase, id),
    ]);
  const patientWithBurn = { ...patient, ...(burns ?? {}) };
  const ward = (wardBeds ?? []).sort((a, b) => compareBeds(a.bed, b.bed));
  const dischargeStatus =
    dischargeRow?.status === "draft" &&
    (dischargeWork as { discharge_worked_on?: boolean } | null)?.discharge_worked_on === false
      ? "prepared"
      : ((dischargeRow?.status as "draft" | "finalised" | undefined) ?? null);
  const here = ward.findIndex((p) => p.id === patient.id);
  const next = here >= 0 ? ward[here + 1] : undefined;
  const prev = here > 0 ? ward[here - 1] : undefined;
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

  // Started off the entries, so usually in by now.
  const [signedRes, matchedProtocolsRes] = await photosAndProtocolsP;

  const photoUrls = new Map<string, string>();
  for (const s of signedRes.data ?? []) {
    if (s.path && s.signedUrl) photoUrls.set(s.path, s.signedUrl);
  }

  const protocolTitles = new Map<string, string>();
  for (const p of matchedProtocolsRes.data ?? []) protocolTitles.set(p.id, p.title);

  // The template decides both what to expect and what order to show it in, so the things that
  // matter for this operation lead the screen instead of whatever happened to be said first.
  // Entries already arrive newest first, so the flattened list is too — derivePatientState
  // relies on that order to pick the latest value for each thing. Drawn from allEntries, not
  // entries: the case history is excluded from the day-by-day record but not from what decides
  // the to-do list and "where things stand" — a plan is a plan whichever way it was captured.
  const allObservations = allEntries.flatMap((e) => e.observations);
  const day = pack.dayCount(patientWithBurn);
  const patientState = derivePatientState(
    allObservations,
    template,
    day.n,
    {
      surgeryDate: patient.surgery_date,
      admittedOn: patient.admitted_on,
      cycleDay: patient.cycle_day,
      onRegimen: Boolean(patient.regimen),
    }
  );
  const { matched, missing, extra, openTasks, doneTasks, pending, pac } = patientState;

  // Whether the one-tap "Routine round" has anything left to fill: a core checklist item with
  // a "normal" phrase that nothing fresh has been recorded against today.
  const routineFillable = matched.some(
    (m) => m.item.normal_phrase && (m.missing || m.pertinentNegative)
  );

  // Before surgery is exactly what the templates already mean by it — no date of operation on
  // record yet. The PAC section belongs to that stretch of the admission and nowhere else:
  // after the operation the question has been answered by events.
  const beforeSurgery = phaseFor(patient) === "before_surgery";

  // Every entry belongs to the dated record. There is no "latest progress" box above it any
  // more — Current progress is the standing answer to "how is this patient", rebuilt from
  // everything ever recorded, so a box repeating only the newest entry was a second, staler
  // answer to the same question. Dropping entries[0] here, as this used to, would now make
  // today's round vanish from the page altogether.
  const sittings = groupIntoSittings(entries);
  const days = groupByDay(sittings);
  const todayKey = istDayKey(new Date().toISOString());

  // Any vital in the latest reading that is out of range — temperature and RR included, though
  // the vitals box shows only BP, PR and SpO₂ — named in red beside the patient's name, with
  // the reading itself. A colour with the number, never a verdict.
  const flaggedVitals = latestVitalTiles(allObservations).filter((t) => t.flag && !t.takenAt);
  // Jobs a resident said — the scoring engine's suggestions are listed below but not counted.
  const openCount = openTasks.length;
  // A post-op job with no operation on record — asked as a question under the header.
  const postOpTask = hasOperationClock(pack) && beforeSurgery ? postOpJob(openTasks) : null;
  // Worded as the To-Do list words it: "tomorrow" said 17 days ago is a date, not "tomorrow".
  const orphanPostOpJob = postOpTask && jobTitle(postOpTask.value_text ?? postOpTask.label, postOpTask.recorded_at, undefined, pack.key);

  const procedure = procedureFor(patient, procedures);
  const caseHistoryDiagnosis = caseHistoryEntries
    .flatMap((entry) => entry.observations)
    .find((observation) => observation.kind === "diagnosis");
  const diagnosis = patient.primary_diagnosis ?? caseHistoryDiagnosis?.value_text ?? null;
  // When nobody has said what was being treated, the operation itself says it — see
  // lib/diagnosis-from-procedure.ts. Shown as derived, never stored, and never over a
  // diagnosis somebody recorded.
  const derivedDiagnosis = diagnosis
    ? null
    : diagnosisFromProcedure({
        primary_diagnosis: null,
        procedure_text: patient.procedure_text,
        template_family: patient.template_family,
        template_variant: patient.template_variant,
      });
  // The disease family behind this admission, read off whichever diagnosis we have — recorded,
  // or derived from the operation. It decides which lines of a radiology report and which
  // in-range bloods stay on the face of the record instead of behind a fold. Null is fine: it
  // just means the report is grouped but not trimmed. See lib/imaging-summary.ts.
  const etiology = etiologyFromDiagnosis(diagnosis ?? derivedDiagnosis?.text ?? null);
  // Background illness is cumulative, not a latest-wins vital: "K/C/O asthma" from the
  // admission sheet must remain visible when diabetes is mentioned on a later round. The
  // helper also recognises older entries captured before the extractor used this label.
  const comorbidities = listedComorbidities(allObservations);

  // History check: started off the entries and the pack (historyCheckP, above), so its reads overlapped the
  // batch rather than adding a round trip here.
  const historyCheck = await historyCheckP;
  // Antibiotics carry their course day, placed as chosen on the print page (Before / After / Off).
  const [abxStarts, abxDay] = await Promise.all([
    antibioticStarts(supabase, patient.id),
    cookies().then((c) => readDayPosition(c.get(ANTIBIOTIC_DAY_COOKIE)?.value)),
  ]);
  const drugLine = (text: string) => {
    const start = isCourse(text) ? abxStarts[antibioticKey(text)] : undefined;
    return start ? withDay(text, antibioticDay(start, istDate(new Date().toISOString())), abxDay) : text;
  };

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


  // The record, grouped along the lines a round already thinks in. Nothing is dropped and
  // nothing is reordered inside a group — see patient-tabs.tsx for why they are filed
  // rather than stacked.

  // Two blocks: the SOAP card carries S, O and A; Plan, Checks (consent, procedure, fitness —
  // part of the management itself) and the drug list share one "Plan & treatment" block.
  const groups = soapGroups(matched, extra, vitalSets(allObservations).sets.length > 0, medications.length > 0);
  const noteGroups = groups.filter((g) => g.section !== "plan" && g.section !== "checks");
  const planGroups = groups.filter((g) => g.section === "plan" || g.section === "checks");

  const todayPanel = (
    <>
      {/* Vitals first. The round asks how the patient is this morning before it asks anything
          else, and this is the only block on the page that answers it in one glance. */}
      <VitalsPanel observations={allObservations} />

      {/* The note builder was only reachable through the printable sheet, so it went unfound. */}
      <section className="px-4 pb-6">
        <Link
          href={`/patients/${patient.id}/note/build`}
          className="flex w-full items-center justify-center rounded-[10px] bg-accent px-4 py-3.5 text-body font-semibold text-accent-ink active:opacity-80"
        >
          Make Today&apos;s Note
        </Link>
      </section>

      {/* Then whatever the app heard but is not sure of. It sits above the work because a
          to-do built on a misheard number is worse than a to-do done late. */}
      {pending.length > 0 && (
        <section className="px-4 pb-6">
          <p className="ios-group-header mb-2 flex items-center gap-1.5 px-4 text-warn-fg">
            <CircleAlert className="h-3.5 w-3.5" strokeWidth={2.4} />
            Confirm dictation
          </p>
          <ConfirmDictation
            pending={pending}
            patientId={patient.id}
            wardId={patient.ward_id}
            computedDay={day.n}
            procedureChoices={templateChoices.map((c) => c.label)}
          />
        </section>
      )}

      {/* With no job a resident said, the section is left out and the scoring suggestions, if
          any, arrive in a section of their own — see ScoringTodo. */}
      {openTasks.length === 0 && doneTasks.length === 0 && (
        <Suspense fallback={null}>
          <ScoringTodo scoring={scoringP} patientId={patient.id} standalone />
        </Suspense>
      )}

      {(openTasks.length > 0 || doneTasks.length > 0) && (
        <section className="px-4 pb-6">
          <TodoHeader count={openTasks.length} />

          <div className="ios-group">
          {openTasks.length > 0 ? (
            <ul className="divide-y divide-line">
              {openTasks.map((o) => {
                // "Tomorrow" is only true on the day it was said. Rewritten fresh on every
                // read, the same way effectiveUrgency below re-reads the colour — neither is
                // stored, both are computed from the calendar as it stands right now. See
                // lib/urgency.ts jobTitle / describeWhen.
                const jobText = jobTitle(o.value_text ?? o.label, o.recorded_at, undefined, pack.key);
                return (
                <SwipeDelete
                  key={o.id}
                  ids={o.ids}
                  patientId={patient.id}
                  label={jobText}
                  className="flex items-start gap-3 py-3 pl-4 pr-4"
                >
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
                    <p className="text-subhead">
                      {jobText}
                      {/* Said again on a later round. The earlier ones are still on the record
                          below; the list just does not count one job twice. */}
                      {o.repeats > 0 && (
                        <span
                          className="ml-1.5 inline-block rounded-full bg-chip px-1.5 align-middle text-caption2 font-medium tabular-nums text-muted"
                          aria-label={`said ${o.repeats + 1} times`}
                        >
                          ×{o.repeats + 1}
                        </span>
                      )}
                    </p>
                    <CameDue observation={o} />
                    {/* The words it came from, so a job is never just the app's paraphrase —
                        shown only when they say more than the job itself does. */}
                    {!quoteAddsNothing(o.value_text ?? o.label, o.source_quote) && (
                      <p className="mt-0.5 truncate text-footnote italic text-muted">
                        “{o.source_quote}”
                      </p>
                    )}
                  </div>
                </SwipeDelete>
                );
              })}
            </ul>
          ) : (
            <p className="px-4 py-3 text-subhead text-muted">
              Nothing outstanding.
            </p>
          )}

          <Suspense fallback={null}>
            <ScoringTodo scoring={scoringP} patientId={patient.id} />
          </Suspense>

          {doneTasks.length > 0 && (
            <details className="border-t border-line px-4 py-3">
              <summary className="flex cursor-pointer items-center gap-1.5 text-footnote text-muted">
                <Check className="h-3.5 w-3.5" strokeWidth={3} />
                {doneTasks.length} done
              </summary>
              <ul className="mt-2 flex flex-col gap-1.5">
                {doneTasks.map((o) => (
                  <li key={o.id} className="flex items-baseline justify-between gap-3">
                    <span className="text-subhead text-muted line-through truncate">
                      {o.value_text ?? o.label}
                    </span>
                    <form action={reopenTask} className="shrink-0">
                      <input type="hidden" name="observation_id" value={o.id} />
                      <input type="hidden" name="patient_id" value={patient.id} />
                      <button className="tap text-footnote text-muted underline underline-offset-4">
                        Undo
                      </button>
                    </form>
                  </li>
                ))}
              </ul>
            </details>
          )}
          </div>
        </section>
      )}

      {(matched.length > 0 || extra.length > 0) && (
        <section className="px-4 pb-6">
          {/* Today: where the patient stands right now, with the note one tap away. The whole
              SOAP sits behind a single fold rather than four headed blocks running down the
              page — it is the longest thing here, and on a round the question is usually
              answered by the vitals above it. What is ACTIONABLE survives the fold: the count
              of things never recorded stays on the line above, in orange. */}
          <div className="mb-2 flex items-baseline gap-2 px-4">
            <span className="ios-group-header">Today</span>
            {missing.length > 0 && (
              <span className="shrink-0 text-footnote text-warn-fg tabular-nums">
                {missing.length} not recorded
              </span>
            )}
          </div>

          {template && routineFillable && <RoutineRoundButton patientId={patient.id} />}

          <details open className="ios-group [&[open]_.chev]:rotate-90">
            <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 active:bg-chip [&::-webkit-details-marker]:hidden">
              <ChevronIcon className="chev h-3.5 w-3.5 shrink-0 text-muted transition-transform" />
              <ClipboardList className="h-4 w-4 shrink-0 text-accent" strokeWidth={2.2} />
              <span className="text-subhead font-semibold">SOAP</span>
              {template && (
                <span className="ml-auto min-w-0 truncate text-footnote text-muted">
                  {template.name}
                </span>
              )}
            </summary>

            {/* Inside the Today card, so the SOAP sections are plain headed blocks rather than
                cards of their own — nesting one ios-group inside another draws white on white
                and reads as a box in a box. */}
            <div className="border-t border-line px-4 py-3">
            {noteGroups.length === 0 && (
              <p className="text-subhead text-muted">Nothing recorded yet.</p>
            )}
            {noteGroups.map(({ section, label, matchedItems, extraItems }) => {
              // A never-mentioned symptom is written into the note as a pertinent negative
              // ("no complaints of fever"), not shown as a blank row to chase.
              const negatives = matchedItems
                .filter((m) => m.pertinentNegative)
                .map((m) => m.item.label);
              const rows = matchedItems.filter((m) => !m.pertinentNegative);
              return (
              <div key={section} className="mb-3 last:mb-0">
                <SoapHeading section={section} label={label} />
                {section === "objective" ? (
                  <ObjectiveBlock
                    specialty={pack.key}
                    matchedItems={rows}
                    extraItems={extraItems}
                    negatives={negatives}
                    sex={patient.sex}
                    wardRanges={wardRanges}
                    etiology={etiology}
                  />
                ) : (
                <SoapRows
                  specialty={pack.key}
                  patientId={patient.id}
                  writeKind="note"
                  rows={matchedItems.map((m) => ({
                    id: m.item.id,
                    label: m.item.label,
                    value: m.value,
                    missing: m.missing,
                    pertinentNegative: m.pertinentNegative,
                  }))}
                  extras={extraItems.map((o) => ({ id: o.id, label: o.label, value: o.value_text }))}
                />
                )}
              </div>
              );
            })}
            </div>
          </details>
        </section>
      )}

      {/* What is being done for the patient, in one place: the drugs on record (each keeping
          the words it came from, so it is never only the app's paraphrase), then today's plan,
          then the checks (consent, procedure, fitness), which are part of the management too. */}
      {/* Always shown, even empty, so a drug can be added from here. */}
      <section className="px-4 pb-6">
          <p className="ios-group-header mb-2 flex items-center gap-1.5 px-4">
            <Pill className="h-3.5 w-3.5 text-accent" strokeWidth={2.4} />
            Plan &amp; treatment
          </p>
          <ul className="ios-group divide-y divide-line">
            {medications.map((m) => (
              <li key={m.id} className="px-4 py-2.5">
                <p className={"text-subhead" + (isAntibiotic(m.value_text ?? m.label) ? " font-semibold" : "")}>
                  {drugLine(m.value_text ?? m.label)}
                </p>
                {!quoteAddsNothing(m.value_text ?? m.label, m.source_quote) && (
                  <p className="mt-0.5 truncate text-footnote italic text-muted">
                    “{m.source_quote}”
                  </p>
                )}
              </li>
            ))}
            {planGroups.map(({ section, matchedItems, extraItems }) => (
              <li key={section} className="px-4 py-1.5">
                <SoapRows
                  specialty={pack.key}
                  patientId={patient.id}
                  writeKind={section === "plan" ? "plan" : "note"}
                  rows={matchedItems.map((m) => ({
                    id: m.item.id,
                    label: m.item.label,
                    value: m.value,
                    missing: m.missing,
                    pertinentNegative: m.pertinentNegative,
                  }))}
                  extras={extraItems.map((o) => ({ id: o.id, label: o.label, value: o.value_text }))}
                />
              </li>
            ))}
            <li>
              <AddDrug patientId={patient.id} wardId={patient.ward_id} current={medications.map((m) => m.value_text ?? m.label)} />
            </li>
          </ul>
        </section>

      <Suspense fallback={null}>
        <ScoringCards scoring={scoringP} />
      </Suspense>

      {/* Every surgical unit (any unit with an operation clock) always shows it, even empty —
          an unanswered PAC is the single thing most likely to stop a list. A unit with no
          operation clock (medicine, oncology…) shows it only before surgery once one is recorded. */}
      {/* Before surgery only: once operated, a PAC is history, and an amber "Not recorded" on a
          patient fifty days after the operation was a gap that was never going to be filled.
          Every surgical unit shows it then, even empty — an unanswered PAC is the single thing
          most likely to stop a list; other units show it once one is recorded. */}
      {beforeSurgery && (hasOperationClock(pack) || pac.length > 0) && (
        <PacSection pac={pac} patientId={patient.id} />
      )}
    </>
  );

  const historyPanel = (
    <>
      <CaseHistorySection
        specialty={pack.key}
        entries={caseHistoryEntries}
        patientId={patient.id}
        sex={patient.sex}
        wardRanges={wardRanges}
        etiology={etiology}
        photoUrls={photoUrls}
        protocolTitles={protocolTitles}
        changesByEntry={changesByEntry}
      />

      {historyCheck && (
        <HistoryCheckCard
          patientId={patient.id}
          trees={historyCheck.trees}
          runs={historyCheck.runs}
          hasSources={historyCheck.hasSources}
          exams={pack.examIds.flatMap((id) => {
            const c = getExamChecklist(id);
            return c ? [{ id: c.id, title: c.title }] : [];
          })}
        />
      )}

      {/* Bottom padding clears the fixed speak bar so the oldest entry stays reachable. */}
      <section className="px-4 pb-6">
        <p className="ios-group-header mb-2 px-4">Record by date</p>
        {entries.length === 0 ? (
          <p className="ios-group p-5 text-subhead text-muted">
            No earlier records yet.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {days.map((day, i) => {
              const count = day.sittings.reduce((n, s) => n + s.entries.length, 0);

              // That day's own observations, read as the SOAP written on that day rather than
              // as the standing answer for the patient. derivePatientState is deliberately NOT
              // used here: it picks the latest value for each thing across the whole admission,
              // which is the right answer for "Today" above and the wrong one for a dated page
              // in the record, where what was written on 24 Aug must keep saying what it said.
              const dayObservations = day.sittings.flatMap((s) =>
                s.entries.flatMap((e) => e.observations)
              );

              return (
                <li key={day.day}>
                  {/* Today open, the rest folded. A week-long admission is mostly history you
                      are not looking for, and the one day you are is nearly always this one. */}
                  <details open={i === 0} className="ios-group [&[open]_.chev]:rotate-90">
                    <summary className="flex cursor-pointer list-none items-baseline gap-2 px-4 py-3 active:bg-chip [&::-webkit-details-marker]:hidden">
                      <ChevronIcon className="chev h-3.5 w-3.5 shrink-0 text-muted transition-transform" />
                      <span className="text-subhead font-semibold">
                        {dayHeading(day.recorded_at, todayKey)}
                      </span>
                      <span className="ml-auto shrink-0 text-footnote text-muted tabular-nums">
                        {count}
                      </span>
                    </summary>

                    <div className="border-t border-line">
                      {/* The day read as a note. */}
                      <DaySoap
                        specialty={pack.key}
                        observations={dayObservations}
                        sex={patient.sex}
                        wardRanges={wardRanges}
                        etiology={etiology}
                      />

                      {/* And the day exactly as recorded, one tap further in. A tidier summary
                          must never cost the resident the transcript, the photograph, or the
                          ability to correct a mis-heard word. */}
                      <details className="border-t border-line [&[open]_.raw-chev]:rotate-90">
                        <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-2.5 text-footnote text-muted active:bg-chip [&::-webkit-details-marker]:hidden">
                          <ChevronIcon className="raw-chev h-3 w-3 shrink-0 transition-transform" />
                          As recorded &mdash; evidence and corrections
                        </summary>
                        <div className="flex flex-col gap-2 px-2 pb-2">
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
                                changes={changesByEntry.get(entry.id)}
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
                                  task_open: o.task_open,
                                }))}
                                matchedProtocols={(entry.matched_protocol_ids ?? [])
                                  .filter((id) => protocolTitles.has(id))
                                  .map((id) => ({ id, title: protocolTitles.get(id)! }))}
                              />
                            ))
                          )}
                        </div>
                      </details>
                    </div>
                  </details>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </>
  );

  const investigationsPanel = (
    <InvestigationsSection
      observations={allObservations}
      sex={patient.sex}
      wardRanges={wardRanges}
    />
  );

  const dischargePanel = (
    <DischargeTab
      patientId={patient.id}
      patientName={stripPatientHonorific(patient.display_name)}
      status={dischargeStatus}
    />
  );


  // A tab with nothing in it says so, rather than opening on empty space. History, Investigations
  // and Discharge each carry their own empty state, so only Today is decided here.
  const todayEmptyBesidesScoring =
    openTasks.length === 0 &&
    doneTasks.length === 0 &&
    pending.length === 0 &&
    matched.length === 0 &&
    extra.length === 0 &&
    medications.length === 0 &&
    !beforeSurgery &&
    !hasOperationClock(pack) &&
    !allObservations.some((o) => CHARTED_VITALS.has(matchVitalLabel(o.label) ?? "") && o.value_text);
  // Only a record with nothing else on Today waits for scoring — rare (a new patient, no round
  // yet, on a unit without an operation clock), and it has to know whether scoring is all there is.
  const todayEmpty =
    todayEmptyBesidesScoring &&
    (await scoringP).every((list) => list.length === 0);

  return (
    <div className="flex-1 flex flex-col max-w-md mx-auto w-full">
      {/* A real navigation bar: back on the left, where the eye and thumb both go for it, and
          the walk to the next bed on the right. Both at iOS's size. */}
      <div className="sticky top-0 z-10 flex items-center justify-between gap-2 border-b border-line/60 bg-background/80 px-2 pb-2.5 top-bar backdrop-blur-xl">
        <Link href="/ward" className="flex min-h-11 items-center text-body text-accent active:opacity-60">
          <ChevronIcon className="h-[18px] w-[18px] rotate-180" />
          Ward
        </Link>
        <div className="flex items-center gap-3 pr-2">
          {position && <span className="text-footnote text-muted tabular-nums">{position}</span>}
          {prev && (
            <Link
              href={`/patients/${prev.id}`}
              aria-label="Previous patient"
              className="flex min-h-11 items-center text-body font-medium text-accent active:opacity-60"
            >
              <ChevronIcon className="h-[18px] w-[18px] rotate-180" />
            </Link>
          )}
          {next && (
            <Link
              href={`/patients/${next.id}`}
              className="flex min-h-11 items-center text-body font-medium text-accent active:opacity-60"
            >
              Next
              <ChevronIcon className="h-[18px] w-[18px]" />
            </Link>
          )}
        </div>
      </div>

      {/* One clinical thought, then only what is outstanding. The bed leads, as it does on the
          ward list; the name carries age and sex; one line says the day, the operation and the
          diagnosis. The banner card and three count tiles this replaced put two boxes and a row
          of zeros between the name and the record. */}
      <header className="flex flex-col gap-2.5 px-4 pb-5 pt-4">
        <div className="flex items-center gap-3">
          <span className="grid h-[46px] min-w-[46px] shrink-0 place-items-center rounded-[11px] bg-chip px-1.5 font-mono text-title3 font-semibold tabular-nums">
            {patient.bed}
          </span>
          <h1 className="flex min-w-0 flex-1 items-baseline gap-2">
            <span className="min-w-0 truncate text-title1 font-bold tracking-tight">
              {displayCase(stripPatientHonorific(patient.display_name))}
            </span>
            <span className="shrink-0 whitespace-nowrap text-body text-muted">
              {[
                patient.age_years !== null ? patient.age_years : null,
                patient.sex === "other" ? "O" : patient.sex,
              ]
                .filter((value) => value !== null && value !== "")
                .join("/")}
            </span>
          </h1>
          <div className="-mr-2 shrink-0">
            <EditIdentity patient={patientWithBurn} templateChoices={templateChoices} specialty={pack.key} />
          </div>
        </div>

        {/* The headline leads with whichever fact matters most right now: once operated, the day
            and operation ("POD 0 · Lap chole") with the diagnosis after it; before that, the
            diagnosis itself with the phase of care. A derived diagnosis is a fixed mapping from
            the operation (lib/diagnosis-from-procedure.ts) and reads like a recorded one. */}
        <p className="text-body leading-snug">
          {day.clock !== "admission" ? (
            <>
              <span className="font-semibold tabular-nums">{day.text}</span>
              {day.clock === "cycle"
                ? patient.regimen && <span> · {patient.regimen}</span>
                : procedure && <span> · {procedure}</span>}
              {(diagnosis ?? derivedDiagnosis?.text) && (
                <span className="text-muted"> · {diagnosis ?? derivedDiagnosis?.text}</span>
              )}
            </>
          ) : (
            <>
              {diagnosis && <span className="font-semibold">{diagnosis}</span>}
              {(() => {
                const managementChoice = managementChoicesFor(pack.key, patient.management ?? "").find(
                  (c) => c.value === patient.management
                );
                return managementChoice ? <span className="text-muted"> · {managementChoice.label}</span> : null;
              })()}
            </>
          )}
        </p>
        {(comorbidities.length > 0 || patient.uhid_ip_no) && (
          <p className="-mt-1.5 text-footnote text-muted">
            {comorbidities.join(" · ")}
            {comorbidities.length > 0 && patient.uhid_ip_no && "  ·  "}
            {patient.uhid_ip_no && (
              <>
                IP no. <span className="font-mono text-foreground/80">{patient.uhid_ip_no}</span>
              </>
            )}
          </p>
        )}

        {/* Only what is outstanding, and only when it is: a zero is not shown at all. */}
        {(flaggedVitals.length > 0 || openCount > 0 || pending.length > 0 || missing.length > 0) && (
          <div className="flex flex-wrap gap-2">
            {flaggedVitals.map((t) => (
              <StatusPill key={t.id} icon={TriangleAlert} tone="critical">
                {t.label} {t.value}
              </StatusPill>
            ))}
            {openCount > 0 && (
              <StatusPill icon={ListChecks}>
                {openCount} To-Do
              </StatusPill>
            )}
            {pending.length > 0 && (
              <StatusPill icon={CircleAlert} tone="warn">
                {pending.length} to check
              </StatusPill>
            )}
            {missing.length > 0 && (
              <StatusPill tone="gap">{missing.length} not recorded</StatusPill>
            )}
          </div>
        )}
        {orphanPostOpJob && (
          <NoOperationQuestion
            job={orphanPostOpJob}
            patient={patientWithBurn}
            templateChoices={templateChoices}
            specialty={pack.key}
          />
        )}
      </header>

      <PatientTabs
        tabs={[
          {
            key: "today",
            label: "Today",
            empty: todayEmpty ? "Nothing recorded for today yet." : undefined,
            content: todayPanel,
          },
          { key: "history", label: "History", content: historyPanel },
          { key: "investigations", label: "Tests", content: investigationsPanel },
          { key: "discharge", label: "Discharge", content: dischargePanel },
        ]}
      />


      {/* Fixed, so the button is under your thumb no matter how long the record has grown. */}
      <BottomBar>
        <BedsideBar
          patientId={patient.id}
          who={{
            bed: patient.bed,
            name: displayCase(stripPatientHonorific(patient.display_name)),
            line:
              [day.clock !== "admission" ? day.text : null, day.clock === "cycle" ? patient.regimen : procedure ?? diagnosis]
                .filter(Boolean)
                .join(" · ") || undefined,
          }}
          missing={missing}
          copy={dictationCopy(pack.key)}
        />
      </BottomBar>
    </div>
  );
}

/**
 * The clerking note, folded. It sits low on the page on purpose — see the comment at its call
 * site — but nothing about it changed when it moved: the tidied summary, the raw entries behind
 * "As recorded", and the way to capture one if none exists are all still here.
 */
function CaseHistorySection({
  entries,
  patientId,
  sex,
  wardRanges,
  etiology,
  photoUrls,
  protocolTitles,
  changesByEntry,
  specialty,
}: {
  specialty: string;
  entries: Entry[];
  patientId: string;
  sex: string | null;
  wardRanges: WardRanges;
  etiology: EtiologyKey | null;
  photoUrls: Map<string, string>;
  protocolTitles: Map<string, string>;
  changesByEntry: Map<string, EntryChange[]>;
}) {
  return (
    <section className="px-4 pb-6">
      <details className="ios-group [&[open]_.case-history-chev]:rotate-90">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-subhead font-semibold active:bg-chip [&::-webkit-details-marker]:hidden">
          <span>Case history</span>
          <span className="flex items-center gap-2">
            <span className="text-caption font-normal text-muted">
              {entries.length > 0 ? "Recorded" : "Not recorded"}
            </span>
            <ChevronIcon className="case-history-chev h-4 w-4 text-muted transition-transform" />
          </span>
        </summary>

        <div className="border-t border-line">
          <Link
            href={`/patients/${patientId}/case-history`}
            className={
              // The Speak / Add photo row below draws its own top line; with nothing between
              // them, a line here too stacked into a double one.
              "flex items-center justify-between gap-3 px-4 py-3 text-subhead font-semibold text-accent active:bg-chip " +
              (entries.length > 0 ? "border-b border-line" : "")
            }
          >
            <span>{entries.length > 0 ? "Review case history" : "Build case history"}</span>
            <ChevronIcon className="h-4 w-4" />
          </Link>

          {entries.length > 0 && (
            <Link
              href={`/patients/${patientId}/case-history/print`}
              className="flex items-center justify-between gap-3 border-b border-line px-4 py-3 text-subhead font-medium text-accent active:bg-chip"
            >
              <span>Print / save as PDF</span>
              <ChevronIcon className="h-4 w-4" />
            </Link>
          )}

          {entries.length > 0 && (
            <CaseHistoryCard
              observations={entries.flatMap((e) => e.observations)}
              sex={sex}
              wardRanges={wardRanges}
              etiology={etiology}
              specialty={specialty}
            />
          )}

          {/* The note exactly as recorded, one tap away. A tidier summary above must not
              cost the resident the transcript, the photograph, or the ability to correct a
              mis-heard word — those all live on the entry card. */}
          {entries.length > 0 ? (
            <details className="border-t border-line [&[open]_.raw-chev]:rotate-90">
              <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-2.5 text-footnote text-muted active:bg-chip [&::-webkit-details-marker]:hidden">
                <ChevronIcon className="raw-chev h-3 w-3 shrink-0 transition-transform" />
                As recorded &mdash; evidence and corrections
              </summary>
              {entries.map((entry) => (
                <EntryCard
                  key={entry.id}
                  embedded
                  entryId={entry.id}
                  patientId={patientId}
                  time={shortDate(entry.recorded_at)}
                  transcript={entry.transcript}
                  heard={entry.original_transcript}
                  photoUrl={entry.photo_path ? (photoUrls.get(entry.photo_path) ?? null) : null}
                  accepted={Boolean(entry.accepted_at)}
                  edited={Boolean(entry.edited_at)}
                  changes={changesByEntry.get(entry.id)}
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
              ))}
            </details>
          ) : null}
          <CaseHistoryCapture patientId={patientId} />
        </div>
      </details>
    </section>
  );
}

/**
 * One day of the record, read as the note that day was. Built only from that day's own
 * observations — nothing is carried forward from a later round and nothing is filled in from
 * the template, so a day with only a drain reading says only that, rather than borrowing
 * today's answers to look complete.
 */
function DaySoap({
  observations,
  sex,
  wardRanges,
  etiology,
  specialty,
}: {
  specialty: string;
  observations: Observation[];
  sex: string | null;
  wardRanges: WardRanges;
  etiology: EtiologyKey | null;
}) {
  const groups = SOAP_ORDER.map((section) => ({
    section,
    label: SOAP_LABELS[section],
    // A stored day count is hidden here too — the page's computed day is the one to read.
    items: observations.filter((o) => kindToSoapSection(o.kind) === section && !isDayCountLabel(o.kind, o.label)),
  })).filter((g) => g.items.length > 0);

  if (groups.length === 0) {
    return <p className="px-4 py-3 text-subhead text-muted">Nothing structured from this day.</p>;
  }

  return (
    <div className="px-4 py-3">
      {groups.map(({ section, label, items }) => (
        <div key={section} className="mb-3 last:mb-0">
          <SoapHeading section={section} label={label} />
          {section === "objective" ? (
            <ObjectiveSummaryView
              specialty={specialty}
              summary={summariseObjective(
                items.map((o) => ({
                  id: o.id,
                  label: o.label,
                  value: o.value_text,
                  recordedAt: o.recorded_at,
                  refLow: o.ref_low,
                  refHigh: o.ref_high,
                  refText: o.ref_text,
                })),
                { sex, wardRanges, etiology }
              )}
            />
          ) : (
            items.map((o) => (
              <p key={o.id} className="text-subhead leading-relaxed">
                {o.value_text ?? o.label}
              </p>
            ))
          )}
        </div>
      ))}
    </div>
  );
}

const PAC_META: Record<
  NonNullable<PacVerdict>,
  { word: string; chip: string; dot: string }
> = {
  fit: {
    word: "Fit",
    chip: "bg-good-bg text-good-fg",
    dot: "bg-good-dot",
  },
  fit_with_conditions: {
    word: "Fit \u2014 conditions",
    chip: "bg-warn-bg text-warn-fg",
    dot: "bg-warn-dot",
  },
  unfit: {
    word: "Unfit",
    chip: "bg-critical-bg text-critical-fg",
    dot: "bg-critical-dot",
  },
  pending: {
    word: "Not done",
    chip: "bg-warn-bg text-warn-fg",
    dot: "bg-warn-dot",
  },
};

/**
 * Vitals as tiles with the latest reading and how it flags, plus every earlier reading folded
 * underneath — see lib/vital-ranges.ts for what "flags" means here and the one rule that
 * governs it: the number shown is exactly the number recorded, the range is printed beside any
 * flag rather than asserted, and nothing this file cannot confidently parse is guessed at.
 *
 * This exists for one reason worth being honest about: a rival app's screenshot showed a heart
 * rate of 10 read straight into an auto-generated "likely ACS, transfuse platelets" plan with
 * nothing pointing at the number itself. A tile that turns red the instant a value like that is
 * recorded, with nothing more claimed about it than "60–100 is where this normally sits", is
 * the difference between a doctor noticing a bad number in one glance and an app quietly
 * building a treatment plan on top of it.
 */
/**
 * The five a ward charts — BP, pulse, temperature, saturation, respiratory rate — in that
 * order, every time, so the eye learns where each one sits. One nobody took in the latest
 * reading gets an amber "Not recorded" tile rather than no tile: a missing tile was too easy
 * to not notice, and the words say plainly that there is no number rather than looking like one.
 */
const CHARTED_VITALS = new Set(["bp", "pr", "spo2", "temp", "rr"]);
const VITAL_ORDER: { key: string; label: string }[] = [
  { key: "bp", label: "BP" },
  { key: "pr", label: "PR" },
  { key: "temp", label: "Temp" },
  { key: "spo2", label: "SpO₂" },
  { key: "rr", label: "RR" },
];

type VitalTile = {
  id: string;
  key: string;
  label: string;
  value: string | null;
  flag: string | null;
  range: string;
  /** Set when this vital's latest reading is older than the latest set — its own time. */
  takenAt: string | null;
};

/** Readings grouped by the moment they were said, newest first, plus one tile per vital: its own
 *  latest reading, which need not be in the latest set ("RR 15" said an hour before the BP). */
function vitalSets(observations: Observation[]) {
  const readings = observations.filter(
    (o) => CHARTED_VITALS.has(matchVitalLabel(o.label) ?? "") && o.value_text
  );
  // Vitals said in the same breath share one recorded_at, because they come from a single
  // insert with no per-row timestamp — see app/api/entries/voice/route.ts. Grouping on it turns
  // "BP 90/50, PR 110, SpO2 91" back into the one reading it was, rather than three.
  const byTime = new Map<string, Observation[]>();
  for (const o of readings) byTime.set(o.recorded_at, [...(byTime.get(o.recorded_at) ?? []), o]);
  const sets = [...byTime.entries()].sort((a, b) => (a[0] < b[0] ? 1 : -1));
  const latest = sets[0];
  const tiles: VitalTile[] = latest
    ? VITAL_ORDER.map(({ key, label }) => {
        const found = sets
          .map(([time, obs]) => ({ time, o: obs.find((x) => matchVitalLabel(x.label) === key) }))
          .find((x) => x.o && classifyVital(x.o.label, x.o.value_text).length > 0);
        const o = found?.o;
        const parts = o ? classifyVital(o.label, o.value_text) : [];
        if (!o || parts.length === 0)
          return { id: key, key, label, value: null, flag: null, range: "", takenAt: null };
        // classifyVital splits a BP into systolic and diastolic so each can flag on its own
        // range; on the tile they read back as the one "127/81" that was said.
        const flagged = parts.find((p) => p.flag);
        return {
          id: `${o.id}-${key}`,
          key,
          label,
          value: parts.map((p) => p.value).join("/"),
          flag: flagged?.flag ?? null,
          range: flagged?.range ?? "",
          takenAt: found.time === latest[0] ? null : found.time,
        };
      })
    : [];
  return { sets, tiles };
}

function latestVitalTiles(observations: Observation[]) {
  return vitalSets(observations).tiles;
}

/** The vitals the box on the Today tab shows — BP, PR and SpO₂, nothing else. */
const BOX_VITALS = new Set(["bp", "pr", "spo2"]);

function VitalsPanel({ observations }: { observations: Observation[] }) {
  const { sets, tiles } = vitalSets(observations);
  if (sets.length === 0) return null;
  const [[latestTime], ...earlier] = sets;
  // Days between the latest reading and today, both as IST calendar days.
  const daysOld = Math.round(
    (Date.parse(istDayKey(new Date().toISOString())) - Date.parse(istDayKey(latestTime))) / 86_400_000
  );

  return (
    <section className="px-4 pb-6">
      <div className="mb-2 flex items-baseline gap-2 px-4">
        <p className="ios-group-header">Vitals</p>
        <p className="text-footnote text-muted">{vitalsWhen(latestTime)}</p>
        {/* Not this morning's numbers — said out loud, because the tiles look just as fresh. */}
        {daysOld > 0 && (
          <span className="rounded-full bg-warn-bg px-2 py-0.5 text-caption2 font-medium text-warn-fg">
            {daysOld === 1 ? "yesterday" : `${daysOld} days ago`}
          </span>
        )}
      </div>

      {/* Three vitals, one row: BP, PR and SpO₂. Temperature and RR stay in the record and in
          the earlier readings below; an out-of-range one is named beside the patient's name. A
          vital with no reading is a dash in amber — absence shown, never left blank. */}
      <div className="grid grid-cols-3 overflow-hidden rounded-[12px] bg-card">
        {tiles
          .filter((t) => BOX_VITALS.has(t.key))
          .map((t) => (
            <div
              key={t.id}
              className={
                "flex min-w-0 flex-col gap-0.5 border-l border-line/60 px-3 py-2.5 first:border-l-0 " +
                (t.flag ? "bg-critical-bg" : "")
              }
            >
              <span className="text-caption text-muted">{t.label}</span>
              {t.value === null ? (
                <span aria-label="Not recorded" className="text-title3 font-semibold text-warn-fg">
                  –
                </span>
              ) : (
                <span
                  className={
                    "truncate text-title3 font-semibold tabular-nums " + (t.flag ? "text-critical-fg" : "text-foreground")
                  }
                >
                  {t.value}
                </span>
              )}
              {/* The range rides along with the flag rather than the flag standing alone — a
                  colour with no stated reason is exactly the "trust me" this app refuses. */}
              {t.flag && <span className="text-caption2 font-medium text-critical-fg">({t.range})</span>}
              {t.takenAt && <span className="truncate text-caption2 text-muted">{vitalsWhen(t.takenAt)}</span>}
            </div>
          ))}
      </div>

      {earlier.length > 0 && (
        <details className="mt-2 [&[open]_.vitals-chev]:rotate-90">
          <summary className="flex cursor-pointer list-none items-center gap-2 px-1 text-footnote text-muted active:opacity-60 [&::-webkit-details-marker]:hidden">
            <ChevronIcon className="vitals-chev h-3 w-3 transition-transform" />
            {earlier.length} earlier {earlier.length === 1 ? "reading" : "readings"}
          </summary>
          <ul className="mt-1.5 ios-group divide-y divide-line">
            {earlier.map(([time, obs]) => (
              <li key={time} className="px-4 py-2.5 text-subhead">
                <span className="text-muted">{vitalsWhen(time)}</span>
                {"  ·  "}
                {obs.map((o) => `${o.label} ${o.value_text}`).join("  ·  ")}
              </li>
            ))}
          </ul>
        </details>
      )}
    </section>
  );
}

function vitalsWhen(iso: string): string {
  return dateTime(iso);
}

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
function PacSection({ pac, patientId }: { pac: Observation[]; patientId: string }) {
  const [latest, ...earlier] = pac;
  const meta = latest?.pac_verdict ? PAC_META[latest.pac_verdict] : null;

  return (
    <section className="px-4 pb-6">
      <div className="ios-group">
        <div className="flex items-center justify-between gap-3 px-4 py-2.5 text-subhead font-semibold">
          <span className="flex items-center gap-2">
            <Stethoscope className="h-4 w-4 text-accent" strokeWidth={2.2} />
            Pre-anaesthetic checkup
          </span>
          <PacSelect patientId={patientId} verdict={latest?.pac_verdict ?? null} />
        </div>

        {latest && meta && (
          <div className="border-t border-line px-4 py-3">
              {/* The dropdown above is the app's reading of the sentence. This is the sentence,
                  kept beside it and never replaced by it. */}
              <p className="text-subhead leading-snug">{latest.value_text ?? latest.label}</p>
              <p className="mt-0.5 text-footnote text-muted">{pacWhen(latest.recorded_at)}</p>

              {!quoteAddsNothing(latest.value_text ?? latest.label, latest.source_quote) && (
                <p className="mt-1 text-footnote italic text-muted">
                  &ldquo;{latest.source_quote}&rdquo;
                </p>
              )}

              {(latest.pac_verdict === "fit_with_conditions" ||
                latest.pac_verdict === "unfit") && (
                <p className="mt-2 text-footnote text-muted">
                  Anything the anaesthetist asked for is on the to-do list, one job at a time.
                </p>
              )}

              {/* "Unfit, sugars uncontrolled" followed a week later by "fit" is the story of
                  the admission. Deleting the first half of it would be a lie. */}
              {earlier.length > 0 && (
                <ul className="mt-3 border-t border-line pt-2">
                  {earlier.map((o) => (
                    <li key={o.id} className="mt-1.5 first:mt-0 text-footnote text-muted">
                      <span className="font-medium">
                        {o.pac_verdict ? PAC_META[o.pac_verdict].word : "Recorded"}
                      </span>
                      {" \u00b7 "}
                      {pacWhen(o.recorded_at)}
                      {" \u2014 "}
                      {o.value_text ?? o.label}
                    </li>
                  ))}
                </ul>
              )}
          </div>
        )}
      </div>
    </section>
  );
}

function pacWhen(iso: string): string {
  return shortDate(iso);
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
  negatives = [],
  sex,
  wardRanges,
  etiology,
  specialty,
}: {
  specialty: string;
  matchedItems: MatchedItem[];
  extraItems: Observation[];
  /** Symptom checklist items nobody mentioned — written as "no complaints of …". */
  negatives?: string[];
  sex: string | null;
  wardRanges: WardRanges;
  etiology: EtiologyKey | null;
}) {
  const summary = summariseObjective(
    [
      ...matchedItems.map((m) => ({
        id: m.item.id,
        label: m.item.label,
        value: m.value,
        recordedAt: m.recordedAt,
        refLow: m.refLow,
        refHigh: m.refHigh,
        refText: m.refText,
      })),
      ...extraItems.map((o) => ({
        id: o.id,
        label: o.label,
        value: o.value_text,
        recordedAt: o.recorded_at,
        refLow: o.ref_low,
        refHigh: o.ref_high,
        refText: o.ref_text,
      })),
    ],
    { sex, wardRanges, etiology }
  );
  // Objective checklist items with nothing recorded today. A core item carrying yesterday's
  // value is flagged stale by matchTemplate, but it is NOT missing — listing it here while the
  // summary above prints its value would have the same line saying both at once. Those with a
  // set "normal" phrase (0056) read as that phrase; the rest fall back to "— NAD".
  const undictated = matchedItems.filter((m) => m.missing && !m.value);
  const nadPhrases = undictated
    .map((m) => m.item.normal_phrase)
    .filter((p): p is string => Boolean(p));
  const outstanding = undictated.filter((m) => !m.item.normal_phrase).map((m) => m.item.label);

  // Not bordered: this now renders inside the Today card, which draws the only surface here.
  return (
    <ObjectiveSummaryView
      specialty={specialty}
      summary={summary}
      outstanding={outstanding}
      nadPhrases={nadPhrases}
      pertinentNegatives={negatives}
      emptyText="Nothing examined yet."
    />
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

const SOAP_LOOK: Record<(typeof SOAP_ORDER)[number], { icon: LucideIcon; chip: string }> = {
  subjective: { icon: MessageSquareText, chip: "bg-chip text-accent" },
  objective: { icon: Ruler, chip: "bg-good-bg text-good-fg" },
  assessment: { icon: Stethoscope, chip: "bg-warn-bg text-warn-fg" },
  plan: { icon: ListChecks, chip: "bg-chip text-accent" },
  checks: { icon: ShieldCheck, chip: "bg-chip text-muted" },
};

/** A SOAP section's heading: a small coloured icon chip beside the label, one line tall. */
function SoapHeading({ section, label }: { section: (typeof SOAP_ORDER)[number]; label: string }) {
  const { icon: Icon, chip } = SOAP_LOOK[section];
  return (
    <p className="mb-1 flex items-center gap-1.5 text-caption font-semibold uppercase tracking-wide text-muted">
      <span className={"grid h-[18px] w-[18px] place-items-center rounded-[5px] " + chip}>
        <Icon className="h-[11px] w-[11px]" strokeWidth={2.6} />
      </span>
      {label}
    </p>
  );
}

/**
 * "Current progress" grouped as Subjective / Objective / Assessment / Plan, with a fifth
 * bucket for the genuinely administrative checks (consent, fitness, fasting status) that do
 * not honestly belong in any SOAP section — see the conversation that decided this rather than
 * forcing them into Plan. A checklist item without a soap_section yet (not every procedure has
 * been migrated and backfilled) falls back the same way an "extra" observation does, so nothing
 * silently disappears — it just lands in Checks until it's classified.
 */
function soapGroups(
  matched: MatchedItem[],
  extra: Observation[],
  vitalsPanelShown: boolean,
  treatmentShown: boolean
) {
  // Display only — every line below is still in the record and the note. A stored day count
  // is hidden because the header's computed day is the true one; a vital because the Vitals
  // panel above already shows it; a drug because the Treatment list below already lists it,
  // with its quote (every drug used to appear twice on this tab); a repeat because the fuller
  // or later line says it all.
  const hide = (kind: string, label: string) =>
    isDayCountLabel(kind, label) ||
    (vitalsPanelShown && isVitalLine(label)) ||
    (treatmentShown && kind === "medication");
  return SOAP_ORDER.map((section) => {
    // A checklist row with no value is a gap to fill, and stays whatever its label.
    const m = matched.filter(
      (x) => (x.item.soap_section ?? "checks") === section && !(x.value && hide(x.item.kind, x.item.label))
    );
    const e = extra.filter((o) => kindToSoapSection(o.kind) === section && !hide(o.kind, o.label));
    const repeats = repeatedLines([
      ...m.map((x) => ({ label: x.item.label, value: x.pertinentNegative ? null : x.value, at: x.recordedAt })),
      ...e.map((o) => ({ label: o.label, value: o.value_text, at: o.recorded_at })),
    ]);
    return {
      section,
      label: SOAP_LABELS[section],
      matchedItems: m.filter((_, i) => !repeats.has(i)),
      extraItems: e.filter((_, i) => !repeats.has(m.length + i)),
    };
  }).filter((g) => g.matchedItems.length > 0 || g.extraItems.length > 0);
}

/** A charted vital, or a "vitals: 127/81" line that bundles several. */
function isVitalLine(label: string): boolean {
  return matchVitalLabel(label) !== null || /^vitals?\b/i.test(label.trim());
}

/**
 * A day's heading in the record. "Today" and "Yesterday" carry the date with them rather than
 * replacing it — on a ward round the relative word is what you scan for, but the date is what
 * gets written in the notes.
 */
function dayHeading(iso: string, todayKey: string): string {
  const date = shortDate(iso);

  const key = istDayKey(iso);
  if (key === todayKey) return `Today · ${date}`;

  const yesterday = new Date(`${todayKey}T00:00:00Z`);
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  if (key === yesterday.toISOString().slice(0, 10)) return `Yesterday · ${date}`;

  return date;
}

/**
 * "due today" or "due 3 Oct · 2 days overdue", shown only when the calendar has moved a job
 * rather than the resident. Said in words, so an escalation never looks like something they
 * graded — and on its own line, muted: the dot already carries the red.
 */
function CameDue({ observation }: { observation: Observation }) {
  const effective = effectiveUrgency(observation);
  if (!effective.note) return null;

  return <p className="mt-0.5 text-footnote text-muted">{effective.note}</p>;
}

/** One outstanding count beside the patient's name: jobs, values to check, gaps to fill. */
function StatusPill({
  icon: Icon,
  tone = "plain",
  children,
}: {
  icon?: LucideIcon;
  tone?: "plain" | "warn" | "gap" | "critical";
  children: React.ReactNode;
}) {
  return (
    <span
      className={
        "inline-flex h-8 items-center gap-1.5 rounded-full bg-card px-3 text-subhead font-medium " +
        (tone === "critical"
          ? "bg-critical-bg text-critical-fg"
          : tone === "warn"
            ? "text-warn-fg"
            : tone === "gap"
              ? "text-warn-fg ring-1 ring-inset ring-warn-bg"
              : "text-foreground")
      }
    >
      {Icon && <Icon className={"h-[15px] w-[15px] " + (tone === "plain" ? "text-accent" : "")} strokeWidth={2.4} />}
      {/* A gap is drawn as an empty ring, the same mark as "not graded" — something not yet said. */}
      {tone === "gap" && <span aria-hidden className="h-[7px] w-[7px] rounded-full border-[1.5px] border-warn-fg" />}
      {children}
    </span>
  );
}

/** The to-do section's header. The count is jobs a resident said, not scoring suggestions. */
function TodoHeader({ count }: { count: number }) {
  return (
    <p className="ios-group-header mb-2 flex items-center gap-1.5 px-4">
      <ListChecks className="h-3.5 w-3.5 text-accent" strokeWidth={2.4} />
      Advices, plans &amp; to do
      {count > 0 ? ` · ${count}` : ""}
    </p>
  );
}

type Scoring = Promise<[Awaited<ReturnType<typeof getPatientScoringTasks>>, Awaited<ReturnType<typeof getScoreCards>>]>;

/**
 * The scoring engine's suggested tasks, streamed in once the recompute lands (see scoringP).
 * Inside the to-do section when there is one; `standalone`, it brings the section's own header,
 * so suggestions on a patient with no spoken jobs are not left without a heading.
 */
async function ScoringTodo({
  scoring,
  patientId,
  standalone = false,
}: {
  scoring: Scoring;
  patientId: string;
  standalone?: boolean;
}) {
  const [tasks] = await scoring;
  if (tasks.length === 0) return null;
  const rows = <ScoringTaskRows patientId={patientId} tasks={tasks} />;
  if (!standalone) return rows;
  return (
    <section className="px-4 pb-6">
      <TodoHeader count={0} />
      <div className="ios-group">{rows}</div>
    </section>
  );
}

/** The scoring engine's score cards, streamed in the same way. */
async function ScoringCards({ scoring }: { scoring: Scoring }) {
  const [, cards] = await scoring;
  return <ScoreCards cards={cards} />;
}

/** The unit's dictation wording for the bedside bar, picked here so the client never loads the
 *  progress-note config table. */
function dictationCopy(specialty: string): DictationCopy {
  const config = progressNoteConfigFor(specialty);
  return {
    bedsideExample: config.bedsideExample,
    dictationExample: config.dictationExample,
  };
}
