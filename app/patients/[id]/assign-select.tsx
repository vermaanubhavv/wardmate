"use client";

import { useOptimistic, useTransition } from "react";
import { assignTask } from "./actions";

export type WardMember = { id: string; name: string };

/**
 * Whose job this is. A native <select>: on a phone that is the system picker, which is a
 * better thumb target than anything drawn here, and it needs no portal or outside-tap logic.
 * The name changes the moment a choice is made; a failed write puts the old one back on the
 * next render.
 */
export default function AssignSelect({
  observationId,
  patientId,
  assignedTo,
  members,
}: {
  observationId: string;
  patientId: string;
  assignedTo: string | null;
  members: WardMember[];
}) {
  const [, startTransition] = useTransition();
  const [value, setValue] = useOptimistic(assignedTo ?? "");
  const current = members.find((m) => m.id === value);
  return (
    <label className={"mt-0.5 inline-flex min-h-8 items-center gap-1 text-footnote " + (current ? "text-foreground" : "text-muted")}>
      <span aria-hidden>→</span>
      <select
        aria-label="Assign this job"
        value={value}
        onChange={(e) => {
          const next = e.target.value;
          startTransition(async () => {
            setValue(next);
            await assignTask(observationId, patientId, next || null);
          });
        }}
        className="max-w-[12rem] appearance-none truncate bg-transparent pr-1 outline-none"
      >
        <option value="">Anyone</option>
        {members.map((m) => (
          <option key={m.id} value={m.id}>
            {m.name}
          </option>
        ))}
      </select>
    </label>
  );
}
