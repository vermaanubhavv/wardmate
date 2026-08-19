import Link from "next/link";
import { getWardScreen } from "@/lib/ward-screen";
import { dayLabel, managementLabel, patientName, type WardPatient } from "@/lib/patients";
import { procedureFor } from "@/lib/templates";
import RegisterButton from "./register-button";
import {
  ChecklistIcon,
  ChevronIcon,
  ClipboardIcon,
  DocumentIcon,
  PlusIcon,
  TrayIcon,
  UsersIcon,
} from "./icons";
import RoundRecorder from "./round-recorder";
import PatientMenu from "./patients/patient-menu";
import { signOut } from "./actions";
import BottomBar from "./bottom-bar";
import Wordmark from "./wordmark";
import Mark from "./mark";

export default async function Home() {
  // One round trip for the whole screen. See lib/ward-screen.ts — it was six.
  const { ward, patients, procedures, templateChoices, removedCount, error: wardError } =
    await getWardScreen();

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
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line/60 bg-background/80 px-4 py-2.5 backdrop-blur-xl">
        <Wordmark />
        <form action={signOut}>
          <button className="text-[15px] text-accent">Sign out</button>
        </form>
      </div>

      <header className="px-4 pb-3 pt-4">
        {/* The unit switcher sits beside the name it switches away from, not buried among
            the capsules below — it acts on the title, so it reads as part of the title. */}
        <div className="flex items-center justify-between gap-3">
          <h1 className="ios-large-title truncate">{ward.name}</h1>
          <Link
            href="/unit"
            className="flex shrink-0 items-center gap-1.5 rounded-full bg-card px-3 py-1.5 text-[14px] font-medium text-accent active:opacity-70"
          >
            <UsersIcon className="h-3.5 w-3.5" />
            Unit
          </Link>
        </div>

        {/* Capsules rather than a row of underlined links: a bigger target, and the shape
            iOS has used for secondary navigation since 17. Each carries a small icon — not
            decoration, a faster-than-reading way to find "Ward round" among four capsules
            while walking. */}
        <div className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1">
          <Capsule href="/todo" icon={<ChecklistIcon className="h-3.5 w-3.5" />}>
            To do
          </Capsule>
          <Capsule href="/handover" icon={<ClipboardIcon className="h-3.5 w-3.5" />}>
            Ward round
          </Capsule>
          <Capsule href="/formats" icon={<DocumentIcon className="h-3.5 w-3.5" />}>
            Formats
          </Capsule>
          {/* Only once there is something to undo — an empty list is not worth a capsule. */}
          {removedCount > 0 && (
            <Capsule href="/removed" icon={<TrayIcon className="h-3.5 w-3.5" />}>
              Removed · {removedCount}
            </Capsule>
          )}
        </div>
      </header>

      {/* Bottom padding clears the floating bar so the last patient stays readable. The bar is
          a row of circles now rather than three stacked buttons, so this is much less. */}
      <div className="flex-1 px-4 pb-32">
        <p className="ios-group-header mb-2 px-4">
          Patients · {patients.length}
        </p>

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
        ) : (
          <ul className="ios-group">
            {patients.map((p) => (
              <PatientRow
                key={p.id}
                patient={p}
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

function Capsule({
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
      className="flex shrink-0 items-center gap-1.5 rounded-full bg-card px-3.5 py-1.5 text-[15px] font-medium text-accent active:opacity-70"
    >
      {icon}
      {children}
    </Link>
  );
}

function PatientRow({
  patient,
  procedures,
  templateChoices,
}: {
  patient: WardPatient;
  procedures: Map<string, string>;
  templateChoices: { family: string; variant: string | null; label: string }[];
}) {
  const management = managementLabel(patient);
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

          {(management || patient.unconfirmed_count > 0 || patient.open_task_count > 0) && (
            <span className="mt-1.5 flex flex-wrap gap-1.5">
              {management && <Badge>{management}</Badge>}
              {patient.open_task_count > 0 && (
                <Badge>{patient.open_task_count} to do</Badge>
              )}
              {patient.unconfirmed_count > 0 && (
                <Badge tone="warn">{patient.unconfirmed_count} to confirm</Badge>
              )}
            </span>
          )}
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
  tone?: "plain" | "warn";
}) {
  return (
    <span
      className={
        "inline-flex items-center rounded-md px-1.5 py-0.5 text-[12px] font-medium " +
        (tone === "warn" ? "bg-orange-100 text-orange-700" : "bg-chip text-muted")
      }
    >
      {children}
    </span>
  );
}
