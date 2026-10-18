import Link from "next/link";
import { redirect } from "next/navigation";
import { getWardScreen } from "@/lib/ward-screen";
import { getDoctorName, getUser } from "@/lib/auth";
import { dayLabel, patientName, stripPatientHonorific, type WardPatient } from "@/lib/patients";
import type { SpecialtyPack } from "@/lib/specialty";
import { shortLabel } from "@/lib/specialty/labels";
import { procedureFor } from "@/lib/templates";
import RegisterButton from "../register-button";
import { ChevronIcon, PlusIcon } from "../icons";
import RoundRecorder from "../round-recorder";
import PatientMenu from "../patients/patient-menu";
import { restorePatient } from "../patients/actions";
import { signOut } from "../actions";
import BottomBar from "../bottom-bar";
import Wordmark from "../wordmark";
import Mark from "../mark";
import { createClient } from "@/lib/supabase/server";
import { countWardPendingConfirmations } from "@/lib/confirm-queue";
import { criticalFlags, isDischargeable, type WardFlag } from "@/lib/ward-flags";
import { getWardTasks } from "@/lib/todo";
import { TriangleAlert, CircleCheckBig, Settings } from "lucide-react";
import { getMyWards } from "@/lib/ward";
import WardSearch from "./ward-search";
import UnitSwitcher from "./unit-switcher";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ delete_failed?: string; filter?: string; discharged?: string }>;
}) {
  const supabase = await createClient();
  // One round trip for the whole screen. See lib/ward-screen.ts — it was six. The greeting
  // rides alongside it: getDoctorName reads the session cookie rather than asking Supabase,
  // so it adds no round trip of its own.
  const [
    { ward, pack, patients: screenPatients, procedures, templateChoices, error: wardError },
    doctor,
    { data: profile },
    myWards,
  ] = await Promise.all([
    getWardScreen(),
    getDoctorName(),
    // Pinned by id: profiles_ward_read (0018) exposes co-members' profiles, so an unfiltered
    // .maybeSingle() throws on any shared unit. getUser() is request-cached.
    getUser().then((u) =>
      supabase.from("profiles").select("designation").eq("id", u?.id ?? "").maybeSingle()
    ),
    getMyWards(),
  ]);
  const params = await searchParams;
  const deleteFailed = params.delete_failed;
  const filter = params.filter;
  const dischargedId = params.discharged;
  const designation = profile?.designation?.trim() || null;
  // The unit's department, not the resident's profile one — a surgeon covering a medicine
  // unit is on a medicine ward.
  const departmentLabel = shortLabel(pack);

  if (!wardError && !ward) redirect("/onboarding");

  // Everything the header needs beyond the patient list itself, fetched together once the
  // ward id is known — the same "one wave of parallel fetches" the screen's own patients
  // query follows, just a beat later because the ward id isn't known until then.
  const [pendingConfirmCount, tasks, dischargedPatient, waitingRounds] = ward
    ? await Promise.all([
        countWardPendingConfirmations(ward.id),
        getWardTasks(ward.id),
        // Only looked up for the one-time "discharged · Undo" banner — the patient is no
        // longer in `patients` (the active list) by the time this renders.
        dischargedId
          ? supabase.from("patients").select("display_name").eq("id", dischargedId).maybeSingle()
          : Promise.resolve({ data: null }),
        // Round dictations recorded but never saved or discarded. Nothing else leads back to
        // the review screen once someone navigates away, so without this they were lost.
        supabase
          .from("round_dictations")
          .select("id")
          .eq("ward_id", ward.id)
          .eq("status", "draft")
          .order("created_at", { ascending: false })
          .limit(20),
      ])
    : [0, [], { data: null }, { data: null }];
  const waitingRoundIds = (waitingRounds.data ?? []).map((r) => r.id);

  // "N to do" counts the jobs a resident said, folded the way /todo and the patient page fold
  // them — not every raw plan row (a job said twice counted twice) and not the scoring engine's
  // suggestions, which are not on this screen yet.
  const jobCounts = new Map<string, number>();
  // Jobs past the day they were due, per patient — the one thing on a row that is red without
  // being a critical reading. Read off the same calendar-aware note /todo groups by.
  const overdueCounts = new Map<string, number>();
  for (const t of tasks) {
    jobCounts.set(t.patient_id, (jobCounts.get(t.patient_id) ?? 0) + 1);
    if (t.note?.endsWith("overdue")) overdueCounts.set(t.patient_id, (overdueCounts.get(t.patient_id) ?? 0) + 1);
  }
  const patients = screenPatients.map((p) => ({ ...p, open_task_count: jobCounts.get(p.id) ?? 0 }));
  const totalOverdue = [...overdueCounts.values()].reduce((a, b) => a + b, 0);

  // Two patients given the same bed is almost always a typing slip, and on a round it sends
  // someone to the wrong patient. Said on both rows, naming the other — never silently fixed.
  const byBed = new Map<string, string[]>();
  for (const p of patients) {
    const key = p.bed.trim().toLowerCase();
    if (key) byBed.set(key, [...(byBed.get(key) ?? []), p.id]);
  }
  const sharesBedWith = (p: WardPatient) =>
    (byBed.get(p.bed.trim().toLowerCase()) ?? [])
      .filter((id) => id !== p.id)
      .map((id) => stripPatientHonorific(patients.find((q) => q.id === id)?.display_name ?? ""));

  // Every hit, worst first: the chip shows the first and counts the rest ("K⁺ 6.4 +1").
  const allFlags = new Map(patients.map((p) => [p.id, criticalFlags(p, pack.key)]));
  const flags = new Map<string, WardFlag | null>(
    [...allFlags].map(([id, f]) => [id, f[0] ?? null])
  );
  const criticalCount = [...flags.values()].filter(Boolean).length;
  const visiblePatients = (
    filter === "critical"
      ? patients.filter((p) => flags.get(p.id))
      : filter === "dischargeable"
        ? patients.filter((p) => isDischargeable(p, flags.get(p.id) ?? null))
        : patients
  )
    // Critical beds first, then walking order. A stable sort keeps bed order inside each half,
    // so a flagged BP in bed 24 is seen before the round reaches it rather than found by
    // scanning twenty rows.
    .slice()
    .sort((a, b) => Number(Boolean(flags.get(b.id))) - Number(Boolean(flags.get(a.id))));

  const totalOutstanding = tasks.length;

  if (wardError || !ward) {
    return (
      <main className="mx-auto w-full max-w-md flex-1 px-4 py-10">
        <h1 className="ios-large-title">WardMate</h1>
        <p role="alert" className="ios-group mt-4 px-4 py-3 text-subhead text-warn-fg">
          {wardError ? "The ward could not be loaded. Check the connection and try again." : "No ward found."}
        </p>
        <form action={signOut} className="mt-6">
          <button className="btn btn-secondary w-full">Sign out</button>
        </form>
      </main>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
      {/* The navigation bar: brand on the left, the way into the unit's settings where iOS
          puts the trailing action — the one settings entry on this screen. Translucent, so the
          list passes under it. Sign out lives on /unit — it was one un-confirmed tap away on
          the screen used most. */}
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line/60 bg-background/80 px-4 pb-1 top-bar backdrop-blur-xl">
        <WardSearch
          listId="ward-list"
          brand={<Wordmark />}
          trailing={
            <Link
              href="/unit"
              aria-label="Unit settings"
              className="grid h-11 w-11 place-items-center text-accent active:opacity-60"
            >
              <Settings className="h-[22px] w-[22px]" strokeWidth={2} />
            </Link>
          }
        />
      </div>

      {/* Everything above the list is kept to a few short rows: the list is what this screen
          is for. The unit's name is the title and also where you change unit. */}
      <header className="px-4 pb-3 pt-3">
        <UnitSwitcher current={{ id: ward.id, name: ward.name }} units={myWards} />
        {/* The greeting rides on the title's caption rather than taking a line of its own. */}
        <p className="mt-0.5 truncate text-footnote text-muted">
          {[
            `${patients.length} ${patients.length === 1 ? "patient" : "patients"}`,
            doctor ? `Dr. ${doctor}` : null,
            designation,
            departmentLabel,
          ]
            .filter(Boolean)
            .join(" · ")}
        </p>

        {/* One summary row instead of chips, tiles and a search box: what is outstanding, what
            needs checking, and the handover. Each cell is a way in, and only a number that needs
            action is coloured. */}
        <nav aria-label="Unit summary" className="mt-3 grid grid-cols-3 overflow-hidden rounded-[12px] bg-card">
          <SummaryCell href="/todo" label="To do" value={totalOutstanding}>
            {totalOverdue > 0 ? (
              <span className="flex items-center gap-1 text-critical-fg">
                <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-critical-dot" />
                {totalOverdue} overdue
              </span>
            ) : (
              "None overdue"
            )}
          </SummaryCell>
          <SummaryCell href="/confirm" label="To check" value={pendingConfirmCount} warn={pendingConfirmCount > 0}>
            {pendingConfirmCount > 0 ? "Values waiting" : "All checked"}
          </SummaryCell>
          <SummaryCell href="/handover" label="Handover" value="Open">
            For the next shift
          </SummaryCell>
        </nav>

        {/* The Critical filter appears only when something is critical: a chip reading
            "Critical 0" on every visit was noise in the one colour that must never be. */}
        {(criticalCount > 0 || filter) && (
          <div className="mt-2 flex gap-2">
            <FilterChip href="/ward" label="All" value={patients.length} active={!filter} />
            {criticalCount > 0 && (
              <FilterChip
                href="/ward?filter=critical"
                label="Critical"
                value={criticalCount}
                dot="bg-critical-dot"
                active={filter === "critical"}
              />
            )}
          </div>
        )}

        {waitingRoundIds.length > 0 && (
          <Link
            href={`/round/${waitingRoundIds[0]}`}
            className="mt-2 flex min-h-11 items-center gap-2 rounded-[10px] border-l-[3px] border-warn-fg bg-card px-3 py-2 active:opacity-70"
          >
            <TriangleAlert className="h-4 w-4 shrink-0 text-warn-fg" strokeWidth={2.2} />
            <p className="flex-1 text-footnote">
              {waitingRoundIds.length === 1
                ? "A round dictation is waiting to be checked and saved"
                : `${waitingRoundIds.length} round dictations are waiting to be checked and saved`}
            </p>
            <ChevronIcon className="h-4 w-4 shrink-0 text-muted" />
          </Link>
        )}

        {/* One-time confirmation right after discharging a patient — instant feedback only.
            It carries no state of its own (just the id in the URL) and is gone the moment
            this page is reloaded or left. The real 48-hour undo window lives on
            /unit → Discharged, which survives navigation — see app/patients/actions.ts. */}
        {dischargedId && (
          <div className="mt-2 flex min-h-11 items-center gap-2 rounded-[10px] border-l-[3px] border-accent bg-card px-3 py-1.5">
            <CircleCheckBig className="h-4 w-4 shrink-0 text-accent" strokeWidth={2.2} />
            <p className="flex-1 text-footnote">
              {dischargedPatient.data
                ? stripPatientHonorific(dischargedPatient.data.display_name)
                : "Patient"}{" "}
              discharged
            </p>
            <form action={restorePatient}>
              <input type="hidden" name="patient_id" value={dischargedId} />
              <button className="tap shrink-0 text-subhead font-semibold text-accent">Undo</button>
            </form>
          </div>
        )}
      </header>

      {/* Bottom padding clears the floating bar so the last patient stays readable. The bar is
          a row of circles now rather than three stacked buttons, so this is much less. */}
      <div className="flex-1 px-4 pb-[var(--bar-height)]">
        {deleteFailed && (
          <p role="alert" className="ios-group mb-4 px-4 py-3 text-subhead text-warn-fg">
            {deleteFailed === "refused"
              ? "This patient could not be moved to Trash. Ask whoever set up WardMate to finish the database update, then try again."
              : `Could not delete this patient: ${deleteFailed}`}
          </p>
        )}
        {patients.length === 0 ? (
          <div className="ios-group flex flex-col items-center gap-3 px-4 py-10 text-center">
            {/* The ring, faint — the same mark on the home screen, quiet here rather than
                an empty box with nothing to look at. */}
            <Mark className="h-10 w-10 opacity-30" />
            <p className="text-body text-muted">No patients on this ward yet.</p>
            {/* Most new units stalled here: people opened Add patient once and left. Say how
                little it asks for, and offer it as a real button, not only the + in the bar. */}
            <p className="text-subhead text-muted">
              Adding one takes a bed and a name. Say it out loud, photograph the admission
              paper, or type it.
            </p>
            <Link
              href="/patients/new"
              className="tap mt-1 rounded-[10px] bg-accent px-5 py-3 text-body font-semibold text-accent-ink active:opacity-80"
            >
              Add your first patient
            </Link>
          </div>
        ) : visiblePatients.length === 0 ? (
          <p className="ios-group px-4 py-6 text-center text-subhead text-muted">
            {filter === "critical" ? "Nobody is flagged critical." : "Every patient has something pending."}
          </p>
        ) : (
          <ul id="ward-list" className="ios-group">
            {visiblePatients.map((p) => (
              <PatientRow
                key={p.id}
                patient={p}
                flag={flags.get(p.id) ?? null}
                moreFlags={Math.max(0, (allFlags.get(p.id)?.length ?? 0) - 1)}
                overdue={overdueCounts.get(p.id) ?? 0}
                sharesBedWith={sharesBedWith(p)}
                procedures={procedures}
                templateChoices={templateChoices}
                pack={pack}
              />
            ))}
          </ul>
        )}
      </div>

      <BottomBar>
        {/* Three circles rather than three stacked bars: the old row of full-width buttons ate
            a third of the screen on a phone, and the ward list is the thing worth the room.
            Dictating is the app's whole point, so it is the filled one, and it sits in the
            middle where a thumb reaches without stretching. */}
        <div className="flex items-start justify-center gap-10">
          <div className="flex flex-col items-center">
            <Link
              href="/patients/new"
              aria-label="Add patient"
              className="grid h-14 w-14 place-items-center rounded-full bg-card text-accent active:opacity-80"
            >
              <PlusIcon className="h-6 w-6" />
            </Link>
            <span className="mt-1.5 text-caption text-muted">Add</span>
          </div>

          <RoundRecorder unitName={ward.name} />
          <RegisterButton />
        </div>
      </BottomBar>
    </div>
  );
}

/** One of the All / Critical / Nothing pending chips — the count and the filter in one. */
function FilterChip({
  href,
  label,
  value,
  dot,
  active,
}: {
  href: string;
  label: string;
  value: number;
  dot?: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={
        "flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3 text-subhead active:opacity-70 " +
        (active ? "bg-accent text-accent-ink" : "bg-card text-foreground")
      }
    >
      {dot && <span aria-hidden className={"h-2 w-2 rounded-full " + dot} />}
      {label}
      <span className="font-semibold tabular-nums">{value}</span>
    </Link>
  );
}

/** One cell of the summary row: a label, a number, and a line that says what the number means. */
function SummaryCell({
  href,
  label,
  value,
  warn = false,
  children,
}: {
  href: string;
  label: string;
  value: number | string;
  warn?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex min-w-0 flex-col gap-0.5 border-l border-line/60 px-3 py-2.5 first:border-l-0 active:bg-chip"
    >
      <span className="text-footnote text-muted">{label}</span>
      <span
        className={
          "text-title3 font-semibold tabular-nums " +
          (typeof value === "string" ? "text-accent" : warn ? "text-warn-fg" : "text-foreground")
        }
      >
        {value}
      </span>
      <span className="truncate text-caption text-muted">{children}</span>
    </Link>
  );
}

function PatientRow({
  patient,
  flag,
  moreFlags,
  overdue,
  sharesBedWith,
  procedures,
  templateChoices,
  pack,
}: {
  patient: WardPatient;
  /** The one genuinely critical vital or blood result on this patient, if any — see lib/ward-flags.ts. */
  flag: WardFlag | null;
  /** How many further critical findings sit behind `flag` — shown as "+N". */
  moreFlags: number;
  /** Jobs past the day they were due. */
  overdue: number;
  /** Other patients given this same bed number, by name. */
  sharesBedWith: string[];
  procedures: Map<string, string>;
  templateChoices: { family: string; variant: string | null; label: string }[];
  /** The unit's specialty pack — it decides whether the day reads "POD 3" or "C2 D3". */
  pack: SpecialtyPack;
}) {
  // Named only for patients who have actually been operated on, and only from the operation
  // recorded against them. A patient still awaiting surgery counts from admission and has no
  // procedure to show — never one guessed from the diagnosis.
  const procedure = procedureFor(patient, procedures);

  // Quiet by default, loud by exception. A patient with nothing outstanding shows nothing at
  // the right — the green "Nothing pending" pill and rail it used to carry made the calm rows
  // the loudest thing on screen, and green belongs to job urgency. Only the most pressing
  // status shows: a critical reading (its actual value, never a diagnosis about it), then
  // values to check, then jobs.
  const status = flag
    ? {
        text: [flag.label, flag.value, moreFlags > 0 && `+${moreFlags}`].filter(Boolean).join(" "),
        tone: "critical" as const,
      }
    : patient.unconfirmed_count > 0
      ? { text: `${patient.unconfirmed_count} to check`, tone: "warn" as const }
      : patient.open_task_count > 0
        ? { text: `${patient.open_task_count} ${patient.open_task_count === 1 ? "job" : "jobs"}`, tone: "plain" as const }
        : null;
  const sharedBed = sharesBedWith.length > 0;

  return (
    // ios-row draws the hairline between rows. The ⋯ is a sibling of the link rather than
    // inside it, so opening the menu does not also walk into the patient. Only a critical
    // reading colours the row's edge.
    <li
      data-search={`${patient.bed} ${patientName(patient)}`.toLowerCase()}
      className={"ios-row relative border-l-[3px] " + (flag ? "border-l-critical-dot" : "border-l-transparent")}
    >
      <Link
        href={`/patients/${patient.id}`}
        className="flex min-h-11 items-center gap-3 py-2.5 pl-3 pr-11 active:bg-chip"
      >
        {/* Bed leads the row and is the largest thing in it: on rounds you are looking for a
            bed, not a name. Amber when another patient has been given the same bed. */}
        <span
          className={
            "grid h-10 min-w-10 shrink-0 place-items-center rounded-[9px] px-1.5 font-mono text-body font-semibold tabular-nums " +
            (sharedBed ? "bg-warn-bg text-warn-fg" : "bg-chip")
          }
        >
          {patient.bed}
        </span>

        <span className="min-w-0 flex-1">
          <span className="block truncate text-body font-semibold">{patientName(patient)}</span>
          {/* The day count reads with the diagnosis, not apart from it: "POD 3 · lap chole"
              is one clinical thought, and the number means little without what it counts
              from. */}
          <span className="mt-0.5 block truncate text-subhead text-muted">
            <span className="tabular-nums">{dayLabel(patient, pack)}</span>
            {procedure && <span> · {procedure}</span>}
            {" · "}
            {patient.primary_diagnosis || "No diagnosis recorded"}
          </span>
          {sharedBed && (
            <span className="mt-0.5 block truncate text-footnote text-warn-fg">
              Bed {patient.bed} is also given to {sharesBedWith.join(", ")}
            </span>
          )}
        </span>

        {(status || overdue > 0) && (
          <span className="flex shrink-0 flex-col items-end gap-1">
            {status && <Badge tone={status.tone}>{status.text}</Badge>}
            {overdue > 0 && (
              <span className="flex items-center gap-1 text-caption text-critical-fg">
                <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-critical-dot" />
                {overdue} overdue
              </span>
            )}
          </span>
        )}
      </Link>

      {/* The row opens the patient; the ⋯ beside it holds edit, move and discharge. Muted, so
          it reads as an accessory rather than a second thing to press on every row. */}
      <div className="absolute inset-y-0 right-1 flex items-center text-muted">
        <PatientMenu patient={patient} templateChoices={templateChoices} specialty={pack.key} />
      </div>
    </li>
  );
}

function Badge({
  children,
  tone = "plain",
}: {
  children: React.ReactNode;
  tone?: "plain" | "warn" | "critical";
}) {
  return (
    <span
      className={
        "inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-footnote font-semibold " +
        (tone === "critical"
          ? "bg-critical-bg text-critical-fg"
          : tone === "warn"
            ? "bg-warn-bg text-warn-fg"
            : "bg-chip text-foreground/80")
      }
    >
      {tone === "critical" && <TriangleAlert className="h-3 w-3" strokeWidth={2.6} />}
      {children}
    </span>
  );
}
