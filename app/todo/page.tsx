import Link from "next/link";
import { getCurrentWard } from "@/lib/ward";
import { getWardTasks, type WardTask } from "@/lib/todo";
import { URGENCY_META, type Urgency } from "@/lib/urgency";
import UrgencyDot from "../patients/[id]/urgency-dot";
import Tick from "../patients/[id]/tick";
import { quoteAddsNothing } from "@/lib/dedupe-tasks";

/** The four groups, in the order they are worked through. */
const GROUPS: { key: Urgency; title: string; note: string }[] = [
  { key: "red", title: "Now", note: "Within hours, or today — including anything that has come due" },
  { key: "yellow", title: "Soon", note: "Today or tomorrow" },
  { key: null, title: "Not graded", note: "No timeframe was said — tap a dot to grade" },
  { key: "green", title: "Has time", note: "No hurry" },
];

export default async function TodoPage() {
  const { ward, error } = await getCurrentWard();

  if (error || !ward) {
    return (
      <main className="flex-1 px-6 py-10 max-w-md mx-auto w-full">
        <h1 className="ios-large-title">To do</h1>
        <p className="mt-4 ios-group px-4 py-3 text-[15px] text-orange-700">
          {error ? `Could not read the database: ${error.message}` : "No ward found."}
        </p>
      </main>
    );
  }

  const tasks = await getWardTasks(ward.id);

  return (
    <div className="flex-1 flex flex-col max-w-md mx-auto w-full">
      <header className="px-6 pt-8 pb-4">
        <Link href="/ward" className="text-[17px] text-accent">
          ‹ Ward
        </Link>
        <h1 className="mt-3 ios-large-title">To do</h1>
        <p className="mt-1 text-[15px] text-muted">
          {tasks.length === 0
            ? "Nothing outstanding on the unit"
            : `${tasks.length} outstanding across the unit`}
        </p>
      </header>

      <section className="px-6 pb-16 flex flex-col gap-6">
        {tasks.length === 0 ? (
          <p className="ios-group p-6 text-[15px] text-muted">
            Every job on the unit is ticked off.
          </p>
        ) : (
          GROUPS.map(({ key, title, note }) => {
            const group = tasks.filter((t) => t.effective === key);
            if (group.length === 0) return null;
            const meta = key ? URGENCY_META[key] : null;

            return (
              <div key={title ?? "ungraded"}>
                <div className="mb-2 flex items-baseline gap-2">
                  <span
                    className={
                      "h-2.5 w-2.5 rounded-full " +
                      (meta ? meta.dot : "border-2 border-dashed border-muted/60")
                    }
                    aria-hidden
                  />
                  <p className="text-[17px] font-medium">
                    {title} · {group.length}
                  </p>
                </div>
                <p className="mb-2 text-[13px] text-muted">{note}</p>

                <ul
                  className={
                    "rounded-[10px] border bg-card divide-y divide-line " +
                    (meta ? meta.border : "border-line")
                  }
                >
                  {group.map((t) => (
                    <TaskRow key={t.id} task={t} />
                  ))}
                </ul>
              </div>
            );
          })
        )}
      </section>
    </div>
  );
}

function TaskRow({ task }: { task: WardTask }) {
  return (
    <li className="flex items-start gap-3 px-4 py-3">
      <Tick
        observationId={task.id}
        patientId={task.patient_id}
        label={task.value_text ?? task.label}
      />

      <div className="pt-1">
        <UrgencyDot
          observationId={task.id}
          patientId={task.patient_id}
          urgency={task.urgency}
          gradedAt={task.graded_at}
          recordedAt={task.recorded_at}
        />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[15px]">
          {task.value_text ?? task.label}
          {/* Said in words, so a job that climbed with the calendar never looks like one
              somebody graded red. */}
          {task.note && (
            <span className="ml-2 whitespace-nowrap text-xs text-red-600">— {task.note}</span>
          )}
        </p>
        {/* Which bed to walk to — the thing that turns a list into a route. */}
        <Link
          href={`/patients/${task.patient_id}`}
          className="mt-0.5 flex items-center gap-1.5 truncate text-[13px] text-accent active:opacity-60"
        >
          <span className="rounded bg-chip px-1 font-mono tabular-nums text-muted">
            {task.patient.bed}
          </span>
          {task.patient.display_name}
        </Link>
        {/* Only when it says something the job does not. */}
        {!quoteAddsNothing(task.value_text ?? task.label, task.source_quote) && (
          <p className="mt-0.5 truncate text-[13px] italic text-muted">“{task.source_quote}”</p>
        )}
        {task.repeats > 0 && (
          <p className="mt-0.5 text-[13px] text-muted">
            said {task.repeats + 1} times — showing the latest
          </p>
        )}
      </div>
    </li>
  );
}
