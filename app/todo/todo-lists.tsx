"use client";

/**
 * The body of /todo, in either of two groupings of the same jobs — chosen with a toggle
 * rather than a second screen, since it's the same list either way.
 *
 * "By urgency" (the default) is the original grouping: Overdue first, then Now/Soon/Not
 * graded/Has time, red -> yellow -> green, the calendar-aware colour lib/urgency.ts
 * computes; the scoring engine's suggestions close the list, folded, as "Worth asking?". "By type"
 * re-slices the same jobs into who actually walks them — Sampling/Radiology/Procedure/
 * Consents/Other (lib/task-category.ts) — with every job still carrying its urgency dot,
 * so switching views never loses that signal.
 */

import Link from "next/link";
import { useState } from "react";
import type { WardTask } from "@/lib/todo";
import { Row as ScoringRow, type WardScoringTask } from "./scoring-section";
import { URGENCY_META, urgencyRank, type Urgency } from "@/lib/urgency";
import UrgencyDot from "../patients/[id]/urgency-dot";
import Tick from "../patients/[id]/tick";
import { quoteAddsNothing } from "@/lib/dedupe-tasks";
import { stripPatientHonorific } from "@/lib/patients";
import {
  classifyTaskCategory,
  TASK_CATEGORY_META,
  TASK_CATEGORY_ORDER,
  type TaskCategory,
} from "@/lib/task-category";
import { scoringPriorityToUrgency } from "@/lib/ward-todo-preview";

/** The four groups, in the order they are worked through. */
const GROUPS: { key: Urgency; title: string; note: string }[] = [
  { key: "red", title: "Now", note: "Within hours, or come due" },
  { key: "yellow", title: "Soon", note: "Today or tomorrow" },
  { key: null, title: "Not graded", note: "No timeframe was said — tap a dot to grade" },
  { key: "green", title: "Has time", note: "No hurry" },
];

type View = "urgency" | "type";

export default function TodoLists({
  tasks,
  scoringTasks,
}: {
  tasks: WardTask[];
  scoringTasks: WardScoringTask[];
}) {
  const [view, setView] = useState<View>("urgency");
  const nothingOutstanding = tasks.length === 0 && scoringTasks.length === 0;

  return (
    <>
      {!nothingOutstanding && (
        <div className="flex rounded-[9px] bg-fill-tertiary p-0.5 text-footnote font-medium">
          {(["urgency", "type"] as const).map((v) => (
            <button
              key={v}
              type="button"
              aria-pressed={view === v}
              onClick={() => setView(v)}
              className={
                "min-h-10 flex-1 rounded-[7px] px-3 " +
                (view === v ? "bg-card font-semibold shadow-sm" : "text-foreground/80")
              }
            >
              {v === "urgency" ? "By urgency" : "By type"}
            </button>
          ))}
        </div>
      )}

      {view === "urgency" ? (
        <ByUrgency tasks={tasks} scoringTasks={scoringTasks} nothingOutstanding={nothingOutstanding} />
      ) : (
        <ByType tasks={tasks} scoringTasks={scoringTasks} />
      )}
    </>
  );
}

function ByUrgency({
  tasks,
  scoringTasks,
  nothingOutstanding,
}: {
  tasks: WardTask[];
  scoringTasks: WardScoringTask[];
  nothingOutstanding: boolean;
}) {
  const overdue = tasks.filter(isOverdue);
  const groups = [
    { key: "overdue", title: "Overdue", note: "Past the time it was given", dot: "bg-critical-dot", group: overdue },
    ...GROUPS.map(({ key, title, note }) => ({
      key: title,
      title,
      note,
      dot: key ? URGENCY_META[key].dot : "border-2 border-dashed border-muted/60",
      group: tasks.filter((t) => t.effective === key && !isOverdue(t)),
    })),
  ];

  // An urgent suggestion (LRINEC's "senior review NOW") is never folded away: it leads the list.
  const urgentScoring = scoringTasks.filter((t) => t.priority === "urgent");
  const foldedScoring = scoringTasks.filter((t) => t.priority !== "urgent");

  return (
    <>
      {urgentScoring.length > 0 && (
        <div>
          <div className="mb-2 flex items-baseline gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-critical-dot" aria-hidden />
            <p className="text-body font-medium text-critical-fg">Worth asking now · {urgentScoring.length}</p>
          </div>
          <p className="mb-2 text-footnote text-muted">Suggested by a clinical score as urgent — for you to judge</p>
          <ul className="ios-group divide-y divide-line">
            {urgentScoring.map((t) => (
              <ScoringRow key={t.id} t={t} />
            ))}
          </ul>
        </div>
      )}
      {tasks.length === 0 ? (
        nothingOutstanding && (
          <p className="ios-group p-6 text-subhead text-muted">Every job on the unit is ticked off.</p>
        )
      ) : (
        groups.map(({ key, title, note, dot, group }) => {
          if (group.length === 0) return null;

          return (
            <div key={key}>
              <div className="mb-2 flex items-baseline gap-2">
                <span className={"h-2.5 w-2.5 rounded-full " + dot} aria-hidden />
                <p className="text-body font-medium">
                  {title} · {group.length}
                </p>
              </div>
              <p className="mb-2 text-footnote text-muted">{note}</p>

              <ul className="ios-group divide-y divide-line">
                {group.map((t) => (
                  <TaskRow key={t.id} task={t} />
                ))}
              </ul>
            </div>
          );
        })
      )}
      {/* Machine suggestions, not jobs anyone said — last, and folded until wanted. */}
      {foldedScoring.length > 0 && (
        <details>
          <summary className="min-h-11 cursor-pointer py-2.5 text-body font-medium">
            <span className="mx-2 inline-block h-2.5 w-2.5 rounded-full bg-warn-dot" aria-hidden />
            Worth asking? · {foldedScoring.length}
          </summary>
          <p className="mb-2 text-footnote text-muted">Suggested by a clinical score — for you to judge</p>
          <ul className="ios-group divide-y divide-line">
            {foldedScoring.map((t) => (
              <ScoringRow key={t.id} t={t} />
            ))}
          </ul>
        </details>
      )}
    </>
  );
}

/** "2 days overdue" from lib/urgency.ts's effectiveUrgency; "due today" is not overdue yet. */
function isOverdue(t: WardTask): boolean {
  return t.note?.endsWith("overdue") ?? false;
}

const CATEGORY_LABELS: Record<TaskCategory | "other", string> = {
  ...Object.fromEntries(TASK_CATEGORY_ORDER.map((c) => [c, TASK_CATEGORY_META[c].label])),
  other: "Other",
} as Record<TaskCategory | "other", string>;

function ByType({ tasks, scoringTasks }: { tasks: WardTask[]; scoringTasks: WardScoringTask[] }) {
  const order: (TaskCategory | "other")[] = [...TASK_CATEGORY_ORDER, "other"];

  const wardByCategory = new Map<TaskCategory | "other", WardTask[]>();
  for (const t of tasks) {
    const category = classifyTaskCategory(t.value_text ?? t.label) ?? "other";
    const list = wardByCategory.get(category) ?? [];
    list.push(t);
    wardByCategory.set(category, list);
  }
  for (const list of wardByCategory.values()) {
    list.sort((a, b) => urgencyRank(a.effective) - urgencyRank(b.effective));
  }

  const scoringByCategory = new Map<TaskCategory | "other", WardScoringTask[]>();
  for (const t of scoringTasks) {
    const category = classifyTaskCategory(t.action) ?? "other";
    const list = scoringByCategory.get(category) ?? [];
    list.push(t);
    scoringByCategory.set(category, list);
  }
  for (const list of scoringByCategory.values()) {
    list.sort((a, b) => urgencyRank(scoringPriorityToUrgency(a.priority)) - urgencyRank(scoringPriorityToUrgency(b.priority)));
  }

  const sections = order
    .map((category) => ({
      category,
      wardTasks: wardByCategory.get(category) ?? [],
      scoringTasks: scoringByCategory.get(category) ?? [],
    }))
    .filter((s) => s.wardTasks.length > 0 || s.scoringTasks.length > 0);

  if (sections.length === 0) {
    return <p className="ios-group p-6 text-subhead text-muted">Every job on the unit is ticked off.</p>;
  }

  return (
    <>
      {sections.map(({ category, wardTasks, scoringTasks: sTasks }) => (
        <div key={category}>
          <p className="mb-2 text-body font-medium">
            {CATEGORY_LABELS[category]} · {wardTasks.length + sTasks.length}
          </p>
          <ul className="ios-group divide-y divide-line">
            {sTasks.map((t) => (
              <ScoringRow key={t.id} t={t} />
            ))}
            {wardTasks.map((t) => (
              <TaskRow key={t.id} task={t} />
            ))}
          </ul>
        </div>
      ))}
    </>
  );
}

function TaskRow({ task }: { task: WardTask }) {
  return (
    <li className={"flex items-start gap-3 border-l-[3px] py-3 pl-3 pr-4 " + (task.effective ? URGENCY_META[task.effective].edge : "border-l-transparent")}>
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
        <p className="text-subhead">
          {task.value_text ?? task.label}
          {/* Said in words, so a job that climbed with the calendar never looks like one
              somebody graded red. */}
          {task.note && (
            <span className="ml-2 whitespace-nowrap text-caption text-critical-fg">— {task.note}</span>
          )}
        </p>
        {/* Which bed to walk to — the thing that turns a list into a route. */}
        <Link
          href={`/patients/${task.patient_id}`}
          className="flex min-h-11 items-center gap-1.5 truncate text-footnote text-accent active:opacity-60"
        >
          <span className="rounded bg-chip px-1 font-mono tabular-nums text-muted">
            {task.patient.bed}
          </span>
          {stripPatientHonorific(task.patient.display_name)}
        </Link>
        {/* Only when it says something the job does not. */}
        {!quoteAddsNothing(task.value_text ?? task.label, task.source_quote) && (
          <p className="mt-0.5 truncate text-footnote italic text-muted">“{task.source_quote}”</p>
        )}
        {task.repeats > 0 && (
          <p className="mt-0.5 text-footnote text-muted">
            said {task.repeats + 1} times — showing the latest
          </p>
        )}
      </div>
    </li>
  );
}
