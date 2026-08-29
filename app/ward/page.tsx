import Link from "next/link";
import { redirect } from "next/navigation";
import { getWardScreen } from "@/lib/ward-screen";
import { getDoctorName } from "@/lib/auth";
import { dayLabel, patientName, type WardPatient } from "@/lib/patients";
import { procedureFor } from "@/lib/templates";
import RegisterButton from "../register-button";
import {
  ChecklistIcon,
  ChevronIcon,
  ClipboardIcon,
  DocumentIcon,
  PlusIcon,
  TrayIcon,
} from "../icons";
import RoundRecorder from "../round-recorder";
import PatientMenu from "../patients/patient-menu";
import { signOut } from "../actions";
import BottomBar from "../bottom-bar";
import Wordmark from "../wordmark";
import Mark from "../mark";
import { createClient } from "@/lib/supabase/server";
import { getWardLabRanges } from "@/lib/ward-lab-ranges";
import { worstFlag, type WardFlag } from "@/lib/ward-flags";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ delete_failed?: string; filter?: string }>;
}) {
  const supabase = await createClient();
  // One round trip for the whole screen. See lib/ward-screen.ts — it was six. The greeting
  // rides alongside it: getDoctorName reads the session cookie rather than asking Supabase,
  // so it adds no round trip of its own.
  const [
    { ward, patients, procedures, templateChoices, removedCount, error: wardError },
    doctor,
    { data: profile },
  ] = await Promise.all([
    getWardScreen(),
    getDoctorName(),
    supabase.from("profiles").select("department, designation").maybeSingle(),
  ]);
  const params = await searchParams;
  const deleteFailed = params.delete_failed;
  const showCriticalOnly = params.filter === "critical";
  const department = profile?.department?.trim() || null;
  const designation = profile?.designation?.trim() || null;
  const departmentLabel = department === "General Surgery" ? "Gen. Surgery" : department;

  if (!wardError && !ward) redirect("/onboarding");

  // Only once the ward resolved: this is one more round trip, worth it only when there is a
  // ward to flag patients against.
  const wardRanges = ward ? await getWardLabRanges(ward.id) : new Map();
  const flags = new Map<string, WardFlag | null>(
    patients.map((p) => [p.id, worstFlag(p, wardRanges)])
  );
  const criticalCount = [...flags.values()].filter(Boolean).length;
  const visiblePatients = showCriticalOnly ? patients.filter((p) => flags.get(p.id)) : patients;

  if (wardError || !ward) {
    return (
      <main className="mx-auto w-full max-w-md flex-1 px-4 py-10">
        <h1 className="ios-large-title">WardMate</h1>
        <p className="ios-group mt-4 px-4 py-3 text-[15px] text-accent">
          {wardError ? `Could not read the database: ${wardError.message}` : "No ward found."}
        </p>
        <form action={signOut} className="mt-6">
          <button className="text-[17px] text-accent">Sign out</button>
        </form>
      </main>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
      {/* The navigation bar: brand on the left, the one destructive-ish action on the right,
          both at the size iOS puts them. Translucent, so the list passes under it. */}
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line/60 bg-background/80 px-4 pb-2.5 top-bar backdrop-blur-xl">
        <Wordmark />
        <form action={signOut}>
          <button className="text-[15px] text-accent">Sign out</button>
        </form>
      </div>

      <header className="px-4 pb-3 pt-4">
        {/* One quiet line, not two — this is the one thing on this screen that is not work,
            and reading your own name and role back to yourself does not need a heading's
            worth of space. Absent entirely when there is no real name to use — see
            getDoctorName. */}
        {(doctor || designation || departmentLabel) && (
          <p className="text-[14px] text-muted">
            {doctor && (
              <>
                Hello, Dr. <span className="text-foreground">{doctor}</span>
              </>
            )}
            {(designation || departmentLabel) && (
              <>
                {doctor ? " · " : ""}
                {[designation, departmentLabel].filter(Boolean).join(" · ")}
              </>
            )}
          </p>
        )}

        {/* The name of the actual working unit gets its own card, with the patient count as a
            real caption rather than a bare number jammed against the name — "Unit Alpha 8"
            read as one run-on word. Switching units is a chevron affordance on the same card,
            not a separate pill competing with it for attention. */}
        <Link
          href="/unit"
          className="mt-1 flex items-center justify-between gap-3 rounded-[12px] bg-card px-4 py-3 active:opacity-70"
        >
          <div className="min-w-0">
            <h1 className="ios-large-title truncate text-[22px]">{ward.name}</h1>
            <p className="mt-0.5 text-[13px] text-muted">
              {patients.length} {patients.length === 1 ? "patient" : "patients"}
            </p>
          </div>
          <span className="flex shrink-0 items-center gap-1 text-[14px] font-medium text-accent">
            Switch
            <ChevronIcon className="h-3.5 w-3.5 rotate-90" />
          </span>
        </Link>

        {/* A grid rather than a horizontal-scroll row: nothing here should be able to slide
            off the edge of the screen unseen, which is exactly what was happening to a
            capsule before. Formats and Protocols moved to the Unit page — unit-wide settings
            reached far less often than these two, not something to compete for space with on
            the page opened most. Wraps to a second row if there is ever a fourth tile. */}
        <div className="mt-3 grid grid-cols-3 gap-2">
          <NavTile href="/todo" icon={<ChecklistIcon className="h-[19px] w-[19px]" />}>
            To do
          </NavTile>
          <NavTile href="/handover" icon={<ClipboardIcon className="h-[19px] w-[19px]" />}>
            Ward round
          </NavTile>
          {/* Reached from here as well as from a patient, because a discharge is often decided
              before anybody opens that patient's record — and because it is the way in for a
              one-off summary, which has no patient to open. */}
          <NavTile href="/prepare-discharge" icon={<DocumentIcon className="h-[19px] w-[19px]" />}>
            Prepare discharge
          </NavTile>
          {/* Only once there is something to undo — an empty list is not worth a tile. */}
          {removedCount > 0 && (
            <NavTile href="/removed" icon={<TrayIcon className="h-[19px] w-[19px]" />}>
              Discharged · {removedCount}
            </NavTile>
          )}
        </div>
      </header>

      {/* Only shown once there is something to filter — an "All / Critical" toggle over one
          patient, none of them flagged, is a control with nothing to do. */}
      {criticalCount > 0 && (
        <div className="px-4 pb-2">
          <div className="inline-flex rounded-full bg-card p-0.5 text-[14px] font-medium">
            <Link
              href="/ward"
              className={
                "rounded-full px-3 py-1 " + (!showCriticalOnly ? "bg-chip" : "text-muted")
              }
            >
              All {patients.length}
            </Link>
            <Link
              href="/ward?filter=critical"
              className={
                "rounded-full px-3 py-1 " +
                (showCriticalOnly ? "bg-red-100 text-red-700" : "text-muted")
              }
            >
              Critical {criticalCount}
            </Link>
          </div>
        </div>
      )}

      {/* Bottom padding clears the floating bar so the last patient stays readable. The bar is
          a row of circles now rather than three stacked buttons, so this is much less. */}
      <div className="flex-1 px-4 pb-32">
        {deleteFailed && (
          <p className="ios-group mb-4 px-4 py-3 text-[15px] text-orange-700">
            {deleteFailed === "refused"
              ? "The database could not move this patient to Trash. Run patch 0029_patient_trash.sql in Supabase, then try again."
              : `Could not delete this patient: ${deleteFailed}`}
          </p>
        )}
        {patients.length === 0 ? (
          <div className="ios-group flex flex-col items-center gap-3 px-4 py-10 text-center">
            {/* The ring, faint — the same mark on the home screen, quiet here rather than
                an empty box with nothing to look at. */}
            <Mark className="h-10 w-10 opacity-30" />
            <p className="text-[17px] text-muted">
              No patients on this ward yet.
              <br />
              Add the first one below.
            </p>
          </div>
        ) : visiblePatients.length === 0 ? (
          <p className="ios-group px-4 py-6 text-center text-[15px] text-muted">
            Nothing currently flagged.
          </p>
        ) : (
          <ul className="ios-group">
            {visiblePatients.map((p) => (
              <PatientRow
                key={p.id}
                patient={p}
                flag={flags.get(p.id) ?? null}
                procedures={procedures}
                templateChoices={templateChoices}
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
            <span className="mt-1.5 text-[12px] text-muted">Add</span>
          </div>

          <RoundRecorder />
          <RegisterButton />
        </div>
      </BottomBar>
    </div>
  );
}


/** One tile in the header's nav grid — icon above label, sized to read at a glance without
 *  reading, the same reasoning the capsules' icons used before. */
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
      className="flex flex-col items-center gap-1.5 rounded-[10px] bg-card px-2 py-3 text-center text-accent active:opacity-70"
    >
      {icon}
      <span className="text-[12px] font-medium leading-tight">{children}</span>
    </Link>
  );
}

function PatientRow({
  patient,
  flag,
  procedures,
  templateChoices,
}: {
  patient: WardPatient;
  /** The single worst flagged vital or lab on this patient, if any — see lib/ward-flags.ts. */
  flag: WardFlag | null;
  procedures: Map<string, string>;
  templateChoices: { family: string; variant: string | null; label: string }[];
}) {
  // Named only for patients who have actually been operated on, and only from the operation
  // recorded against them. A patient still awaiting surgery counts from admission and has no
  // procedure to show — never one guessed from the diagnosis.
  const procedure = procedureFor(patient, procedures);

  return (
    // ios-row draws the hairline between rows. The ⋯ is a sibling of the link rather than
    // inside it, so opening the menu does not also walk into the patient.
    <li className="ios-row relative">
      <Link
        href={`/patients/${patient.id}`}
        className="flex items-start gap-3 py-2.5 pl-4 pr-16 active:bg-chip"
      >
        {/* Bed leads the row: on rounds you are looking for a bed, not a name. */}
        <span className="mt-0.5 min-w-[32px] shrink-0 rounded-md bg-chip px-1.5 py-0.5 text-center font-mono text-[13px] tabular-nums">
          {patient.bed}
        </span>

        <span className="min-w-0 flex-1">
          <span className="block truncate text-[17px] font-semibold">
            {patientName(patient)}
          </span>
          {/* The day count reads with the diagnosis, not apart from it: "POD 3 · lap chole"
              is one clinical thought, and the number means little without what it counts
              from. */}
          <span className="mt-0.5 block truncate text-[15px] text-muted">
            <span className="text-foreground tabular-nums">{dayLabel(patient)}</span>
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
            // A flagged vital or lab now leads this chain: on a round, a critical reading
            // outranks an unconfirmed transcription every time. It carries the actual value,
            // not a count, because "SpO2 77" tells a resident something a bare "1 critical"
            // does not — and it is exactly the reading recorded, never a diagnosis about it.
            const chip = flag
              ? { text: `${flag.label} ${flag.value}`, tone: "critical" as const }
              : patient.unconfirmed_count > 0
                ? { text: `${patient.unconfirmed_count} to confirm`, tone: "warn" as const }
                : patient.open_task_count > 0
                  ? { text: `${patient.open_task_count} to do`, tone: "plain" as const }
                  : null;

            return chip && (
              <span className="mt-1.5 block">
                <Badge tone={chip.tone}>{chip.text}</Badge>
              </span>
            );
          })()}
        </span>
      </Link>

      {/* Both sit outside the link, at the right, where iOS puts a row's accessories. */}
      <div className="absolute right-2 top-2 flex items-center gap-0.5">
        <PatientMenu patient={patient} templateChoices={templateChoices} />
        <ChevronIcon className="h-4 w-4 shrink-0 text-muted/60" />
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
        "inline-flex items-center rounded-md px-1.5 py-0.5 text-[12px] font-medium " +
        (tone === "critical"
          ? "bg-red-100 text-red-700"
          : tone === "warn"
            ? "bg-orange-100 text-orange-700"
            : "bg-chip text-muted")
      }
    >
      {children}
    </span>
  );
}
