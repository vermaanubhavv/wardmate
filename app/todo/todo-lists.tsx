"use client";

/**
 * The body of /todo, in either of two groupings of the same jobs — chosen with a toggle
 * rather than a second screen, since it's the same list either way.
 *
 * "By urgency" (the default) is the original grouping: Now/Soon/Not graded/Has time,
 * red -> yellow -> green, the calendar-aware colour lib/urgency.ts computes. "By type"
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
  { key: "red", title: "Now", note: "Within hours, or today — including anything that has come due" },
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
        <div className="inline-flex self-start rounded-full bg-card p-0.5 text-[14px] font-medium">
          <button
            onClick={() => setView("urgency")}
            className={"rounded-full px-3 py-1 " + (view === "urgency" ? "bg-chip" : "text-muted")}
          >
            By urgency
          </button>
          <button
            onClick={() => setView("type")}
            className={"rounded-full px-3 py-1 " + (view === "type" ? "bg-accent text-accent-ink" : "text-muted")}
          >
            By type
          </button>
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
  return (
    <>
      {scoringTasks.length > 0 && (
        <div>
          <div className="mb-2 flex items-baseline gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-warn-dot" aria-hidden />
            <p className="text-[17px] font-medium">Score inputs · {scoringTasks.length}</p>
          </div>
          <p className="mb-2 text-[13px] text-muted">Needed to complete a clinical score</p>
          <ul className="divide-y divide-line rounded-[10px] border border-line bg-card">
            {scoringTasks.map((t) => (
              <ScoringRow key={t.id} t={t} />
            ))}
          </ul>
        </div>
      )}
      {tasks.length === 0 ? (
        nothingOutstanding && (
          <p className="ios-group p-6 text-[15px] text-muted">Every job on the unit is ticked off.</p>
        )
      ) : (
        GROUPS.map(({ key, title, note }) => {
          const group = tasks.filter((t) => t.effective === key);
          if (group.length === 0) return null;
          const meta = key ? URGENCY_META[key] : null;

          return (
            <div key={title}>
              <div className="mb-2 flex items-baseline gap-2">
                <span
                  className={
                    "h-2.5 w-2.5 rounded-full " + (meta ? meta.dot : "border-2 border-dashed border-muted/60")
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
                  "rounded-[10px] border bg-card divide-y divide-line " + (meta ? meta.border : "border-line")
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
    </>
  );
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
    return <p className="ios-group p-6 text-[15px] text-muted">Every job on the unit is ticked off.</p>;
  }

  return (
    <>
      {sections.map(({ category, wardTasks, scoringTasks: sTasks }) => (
        <div key={category}>
          <p className="mb-2 text-[17px] font-medium">
            {CATEGORY_LABELS[category]} · {wardTasks.length + sTasks.length}
          </p>
          <ul className="divide-y divide-line rounded-[10px] border border-line bg-card">
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
            <span className="ml-2 whitespace-nowrap text-xs text-critical-fg">— {task.note}</span>
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
          {stripPatientHonorific(task.patient.display_name)}
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
