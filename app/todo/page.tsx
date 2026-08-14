import Link from "next/link";
import { getCurrentWard } from "@/lib/ward";
import { getWardTasks, type WardTask } from "@/lib/todo";
import { URGENCY_META, type Urgency } from "@/lib/urgency";
import UrgencyDot from "../patients/[id]/urgency-dot";
import { completeTask } from "../patients/[id]/actions";

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
        <h1 className="text-2xl font-semibold">To do</h1>
        <p className="mt-4 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          {error ? `Could not read the database: ${error.message}` : "No ward found."}
        </p>
      </main>
    );
  }

  const tasks = await getWardTasks(ward.id);

  return (
    <div className="flex-1 flex flex-col max-w-md mx-auto w-full">
      <header className="px-6 pt-8 pb-4">
        <Link href="/" className="text-sm text-muted underline underline-offset-4">
          ← Ward
        </Link>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight">To do</h1>
        <p className="text-muted text-sm mt-0.5">
          {tasks.length === 0
            ? "Nothing outstanding on the unit"
            : `${tasks.length} outstanding across the unit`}
        </p>
      </header>

      <section className="px-6 pb-16 flex flex-col gap-6">
        {tasks.length === 0 ? (
          <p className="rounded-xl border border-line bg-card p-6 text-sm text-muted">
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
                  <p className="text-sm font-medium">
                    {title} · {group.length}
                  </p>
                </div>
                <p className="mb-2 text-xs text-muted">{note}</p>

                <ul
                  className={
                    "rounded-xl border bg-card divide-y divide-line " +
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
      <form action={completeTask} className="shrink-0 pt-0.5">
        <input type="hidden" name="observation_id" value={task.id} />
        <input type="hidden" name="patient_id" value={task.patient_id} />
        <button
          aria-label={`Mark done: ${task.value_text ?? task.label}`}
          className="h-6 w-6 rounded-md border border-muted/50 active:bg-accent active:border-accent"
        />
      </form>

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
        <p className="text-sm">
          {task.value_text ?? task.label}
          {/* Said in words, so a job that climbed with the calendar never looks like one
              somebody graded red. */}
          {task.note && (
            <span className="ml-2 whitespace-nowrap text-xs text-red-300">— {task.note}</span>
          )}
        </p>
        {/* Which bed to walk to — the thing that turns a list into a route. */}
        <Link
          href={`/patients/${task.patient_id}`}
          className="mt-0.5 block truncate text-xs text-muted underline underline-offset-4"
        >
          {task.patient.bed} · {task.patient.display_name}
        </Link>
        <p className="mt-0.5 truncate text-xs text-muted italic">“{task.source_quote}”</p>
        {task.repeats > 0 && (
          <p className="mt-0.5 text-xs text-muted">
            said {task.repeats + 1} times — showing the latest
          </p>
        )}
      </div>
    </li>
  );
}
