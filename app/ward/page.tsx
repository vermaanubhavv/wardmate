import Link from "next/link";
import { redirect } from "next/navigation";
import { getWardScreen } from "@/lib/ward-screen";
import { getDoctorName, getUser } from "@/lib/auth";
import { dayLabel, patientName, stripPatientHonorific, type WardPatient } from "@/lib/patients";
import type { SpecialtyPack } from "@/lib/specialty";
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
import { criticalFlag, isDischargeable, type WardFlag } from "@/lib/ward-flags";
import { getWardTasks } from "@/lib/todo";
import { getWardScoringTasks } from "@/lib/scoring/read";
import { buildWardTodoPreview, countWardOutstanding } from "@/lib/ward-todo-preview";
import { TriangleAlert, CircleCheckBig, ListChecks, SquarePen, CircleAlert, Settings } from "lucide-react";
import WardSearch from "./ward-search";

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
    { ward, pack, patients, procedures, templateChoices, error: wardError },
    doctor,
    { data: profile },
  ] = await Promise.all([
    getWardScreen(),
    getDoctorName(),
    // Pinned by id: profiles_ward_read (0018) exposes co-members' profiles, so an unfiltered
    // .maybeSingle() throws on any shared unit. getUser() is request-cached.
    getUser().then((u) =>
      supabase.from("profiles").select("department, designation").eq("id", u?.id ?? "").maybeSingle()
    ),
  ]);
  const params = await searchParams;
  const deleteFailed = params.delete_failed;
  const filter = params.filter;
  const dischargedId = params.discharged;
  const department = profile?.department?.trim() || null;
  const designation = profile?.designation?.trim() || null;
  const departmentLabel = department === "General Surgery" ? "Gen. Surgery" : department;

  if (!wardError && !ward) redirect("/onboarding");

  // Everything the header needs beyond the patient list itself, fetched together once the
  // ward id is known — the same "one wave of parallel fetches" the screen's own patients
  // query follows, just a beat later because the ward id isn't known until then.
  const [pendingConfirmCount, tasks, scoringByPatient, dischargedPatient, waitingRounds] = ward
    ? await Promise.all([
        countWardPendingConfirmations(ward.id),
        getWardTasks(ward.id),
        getWardScoringTasks(ward.id),
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
    : [0, [], new Map(), { data: null }, { data: null }];
  const waitingRoundIds = (waitingRounds.data ?? []).map((r) => r.id);

  const flags = new Map<string, WardFlag | null>(
    patients.map((p) => [p.id, criticalFlag(p)])
  );
  const criticalCount = [...flags.values()].filter(Boolean).length;
  const dischargeableCount = patients.filter((p) => isDischargeable(p, flags.get(p.id) ?? null)).length;
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

  const todoPreview = buildWardTodoPreview(tasks, scoringByPatient, patients, 3);
  const totalOutstanding = countWardOutstanding(tasks, scoringByPatient);

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
        <Wordmark />
        <Link
          href="/unit"
          aria-label="Unit settings"
          className="-mr-2.5 grid h-11 w-11 place-items-center text-accent active:opacity-60"
        >
          <Settings className="h-[22px] w-[22px]" strokeWidth={2} />
        </Link>
      </div>

      {/* Everything above the list is kept to a few short rows: the list is what this screen
          is for, and the old cards and tall tiles left room for three patients on a phone. */}
      <header className="px-4 pb-3 pt-3">
        <h1 className="ios-large-title truncate text-title2">{ward.name}</h1>
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

        {/* All / Critical / Nothing pending — each chip is the count and the filter in one,
            the same "?filter=" the tiles used. "Nothing pending" is a heuristic (nothing
            critical, nothing outstanding), not a clinical sign-off — see isDischargeable(). */}
        <div className="mt-3 flex gap-2">
          <FilterChip href="/ward" label="All" value={patients.length} active={!filter} />
          <FilterChip
            href="/ward?filter=critical"
            label="Critical"
            value={criticalCount}
            dot="bg-critical-dot"
            active={filter === "critical"}
          />
          <FilterChip
            href="/ward?filter=dischargeable"
            label="Nothing pending"
            value={dischargeableCount}
            dot="bg-good-dot"
            active={filter === "dischargeable"}
          />
        </div>

        {/* To do, Handover and Confirm share one row. To do keeps its count and names the most
            urgent job (red first, then yellow — see lib/ward-todo-preview.ts), so a red item is
            still seen without opening /todo. */}
        <div className="mt-2 flex gap-2">
          <Link
            href="/todo"
            className="flex min-h-11 min-w-0 flex-1 items-center gap-2 rounded-[12px] bg-card px-3 py-2 active:opacity-70"
          >
            <ListChecks className="h-4 w-4 shrink-0 text-accent" strokeWidth={2.2} />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-subhead font-semibold">
                To do{totalOutstanding > 0 ? ` · ${totalOutstanding}` : ""}
              </span>
              {todoPreview[0] && (
                <span className="mt-0.5 flex items-center gap-1.5 text-caption text-muted">
                  <span
                    className={
                      "h-2 w-2 shrink-0 rounded-full " +
                      (todoPreview[0].urgency === "red"
                        ? "bg-critical-dot"
                        : todoPreview[0].urgency === "yellow"
                          ? "bg-warn-dot"
                          : "bg-good-dot")
                    }
                    aria-hidden
                  />
                  <span className="truncate">
                    {todoPreview[0].bed} · {todoPreview[0].text}
                  </span>
                </span>
              )}
            </span>
          </Link>
          <NavTile href="/handover" icon={<SquarePen className="h-[18px] w-[18px]" strokeWidth={2.2} />}>
            Handover
          </NavTile>
          {pendingConfirmCount > 0 && (
            <NavTile href="/confirm" icon={<CircleAlert className="h-[18px] w-[18px]" strokeWidth={2.2} />}>
              Confirm · {pendingConfirmCount}
            </NavTile>
          )}
        </div>

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
          <>
          <WardSearch listId="ward-list" />
          <ul id="ward-list" className="ios-group">
            {visiblePatients.map((p) => (
              <PatientRow
                key={p.id}
                patient={p}
                flag={flags.get(p.id) ?? null}
                dischargeable={isDischargeable(p, flags.get(p.id) ?? null)}
                procedures={procedures}
                templateChoices={templateChoices}
                pack={pack}
              />
            ))}
          </ul>
          </>
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

          <RoundRecorder />
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

/** A shortcut beside the To do row — icon above a short label, narrow enough that three fit. */
function NavTile({
  href,
  icon,
  children,
}: {
  href: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex min-h-11 shrink-0 flex-col items-center justify-center gap-0.5 rounded-[12px] bg-card px-3 py-1.5 text-center text-accent active:opacity-70"
    >
      {icon}
      <span className="whitespace-nowrap text-caption font-medium leading-tight">{children}</span>
    </Link>
  );
}

function PatientRow({
  patient,
  flag,
  dischargeable,
  procedures,
  templateChoices,
  pack,
}: {
  patient: WardPatient;
  /** The one genuinely critical vital or blood result on this patient, if any — see lib/ward-flags.ts. */
  flag: WardFlag | null;
  /** Nothing critical, nothing outstanding — see isDischargeable() above. */
  dischargeable: boolean;
  procedures: Map<string, string>;
  templateChoices: { family: string; variant: string | null; label: string }[];
  /** The unit's specialty pack — it decides whether the day reads "POD 3" or "C2 D3". */
  pack: SpecialtyPack;
}) {
  // Named only for patients who have actually been operated on, and only from the operation
  // recorded against them. A patient still awaiting surgery counts from admission and has no
  // procedure to show — never one guessed from the diagnosis.
  const procedure = procedureFor(patient, procedures);

  return (
    // ios-row draws the hairline between rows. The ⋯ is a sibling of the link rather than
    // inside it, so opening the menu does not also walk into the patient. The left edge
    // carries the same critical/dischargeable colour as the stat row above, so a row reads
    // at a glance on a long list without adding a second badge.
    <li
      data-search={`${patient.bed} ${patientName(patient)}`.toLowerCase()}
      className={
        "ios-row relative border-l-[3px] " +
        (flag ? "border-l-critical-dot" : dischargeable ? "border-l-good-dot" : "border-l-transparent")
      }
    >
      <Link
        href={`/patients/${patient.id}`}
        className="flex min-h-11 items-start gap-3 py-2.5 pl-3 pr-16 active:bg-chip"
      >
        {/* Bed leads the row: on rounds you are looking for a bed, not a name. */}
        <span className="mt-0.5 min-w-[32px] shrink-0 rounded-md bg-chip px-1.5 py-0.5 text-center font-mono text-footnote tabular-nums">
          {patient.bed}
        </span>

        <span className="min-w-0 flex-1">
          <span className="block truncate text-body font-semibold">
            {patientName(patient)}
          </span>
          {/* The day count reads with the diagnosis, not apart from it: "POD 3 · lap chole"
              is one clinical thought, and the number means little without what it counts
              from. */}
          <span className="mt-0.5 block truncate text-subhead text-muted">
            <span className="text-foreground tabular-nums">{dayLabel(patient, pack)}</span>
            {procedure && <span className="text-foreground"> {procedure}</span>}
            {" · "}
            {patient.primary_diagnosis || "No diagnosis recorded"}
          </span>

          {/* ONE chip, not three. Twenty patients carrying "PREOP", "3 to do" and "2 to confirm"
              put eighty chips on one screen, and a row that shouts three things shouts none of
              them. Only the most pressing shows: something unchecked outranks something still
              to do, which outranks a management label that is not going to change today. The
              other two are on the patient's own page, one tap away. */}
          {(() => {
            // Management is deliberately NOT here. "POST OP" only repeats the POD count already
            // on the line above, and a management label is a standing fact about the patient
            // rather than something the ward list needs to shout — it lives on their own page.
            // A critical reading leads this chain: on a round it outranks an unconfirmed
            // transcription every time. It carries the actual value, not a count, because
            // "BP 84/50" tells a resident something a bare "1 critical" does not — and it is
            // exactly the reading recorded, never a diagnosis about it. See lib/ward-flags.ts
            // for exactly what counts as critical (it is a short, fixed list).
            const chip = flag
              ? { text: [flag.label, flag.value].filter(Boolean).join(" "), tone: "critical" as const }
              : patient.unconfirmed_count > 0
                ? { text: `${patient.unconfirmed_count} to confirm`, tone: "warn" as const }
                : patient.open_task_count > 0
                  ? { text: `${patient.open_task_count} to do`, tone: "plain" as const }
                  : dischargeable
                    ? { text: "Nothing pending", tone: "good" as const }
                    : null;

            return chip && (
              <span className="mt-1.5 block">
                <Badge tone={chip.tone}>{chip.text}</Badge>
              </span>
            );
          })()}
        </span>
      </Link>

      {/* Both sit outside the link, at the right, where iOS puts a row's accessories. Taps
          fall through to the link everywhere but the ⋯ itself, so the whole row opens the
          patient. */}
      <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center gap-0.5">
        <div className="pointer-events-auto">
          <PatientMenu patient={patient} templateChoices={templateChoices} specialty={pack.key} />
        </div>
        <ChevronIcon className="h-4 w-4 shrink-0 text-muted" aria-hidden />
      </div>
    </li>
  );
}

function Badge({
  children,
  tone = "plain",
}: {
  children: React.ReactNode;
  tone?: "plain" | "warn" | "critical" | "good";
}) {
  return (
    <span
      className={
        "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-caption font-medium " +
        (tone === "critical"
          ? "bg-critical-bg text-critical-fg"
          : tone === "warn"
            ? "bg-warn-bg text-warn-fg"
            : tone === "good"
              ? "bg-good-bg text-good-fg"
              : "bg-chip text-muted")
      }
    >
      {tone === "critical" && <TriangleAlert className="h-3 w-3" strokeWidth={2.6} />}
      {children}
    </span>
  );
}
