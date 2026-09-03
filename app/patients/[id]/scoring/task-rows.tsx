"use client";

/**
 * Scoring-engine to-do items, rendered inline in the patient's normal "Advices, plans & to do"
 * list — not a separate section. Each is something a score needs in order to be calculated;
 * ticking it done removes it. Declining needs a reason (DOCX safety rule).
 */

import { useState, useTransition } from "react";
import type { ScoringTask } from "@/lib/scoring/read";
import { completeScoringTask, declineScoringTask } from "./actions";

const AMBER = "#a8560b";

export default function ScoringTaskRows({
  patientId,
  tasks,
}: {
  patientId: string;
  tasks: ScoringTask[];
}) {
  if (tasks.length === 0) return null;
  return (
    <ul className="divide-y divide-line border-t border-line">
      {tasks.map((t) => (
        <Row key={t.id} patientId={patientId} t={t} />
      ))}
    </ul>
  );
}

function Row({ patientId, t }: { patientId: string; t: ScoringTask }) {
  const [pending, start] = useTransition();
  const [declining, setDeclining] = useState(false);
  const [reason, setReason] = useState("");
  const [err, setErr] = useState<string | null>(null);

  return (
    <li className="flex items-start gap-3 px-4 py-3">
      <button
        aria-label="Mark done"
        disabled={pending}
        onClick={() => start(async () => setErr((await completeScoringTask(patientId, t.id)).error))}
        className="mt-0.5 h-[22px] w-[22px] shrink-0 rounded-full border-2 border-line active:opacity-50"
      />
      <div className="min-w-0 flex-1">
        <p className="text-[15px]">
          {t.action}
          {t.status === "linked" && (
            <span className="ml-1.5 text-[13px] text-muted">· result already on file</span>
          )}
        </p>
        <p className="mt-0.5 text-[13px] text-muted">
          For the BISAP score · {t.reason}
        </p>
        {!declining ? (
          <button
            onClick={() => setDeclining(true)}
            className="mt-1 text-[13px] text-muted underline underline-offset-4 active:opacity-60"
          >
            Not needed
          </button>
        ) : (
          <div className="mt-1.5 flex gap-1.5">
            <input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="reason (required)"
              className="flex-1 rounded-[8px] border border-line px-2 py-1.5 text-[13px]"
            />
            <button
              disabled={pending || !reason.trim()}
              onClick={() =>
                start(async () => setErr((await declineScoringTask(patientId, t.id, reason)).error))
              }
              className="rounded-[8px] border border-line px-3 py-1.5 text-[13px] font-semibold active:opacity-60"
            >
              Confirm
            </button>
          </div>
        )}
        {err && <p className="mt-1 text-[13px]" style={{ color: AMBER }}>{err}</p>}
      </div>
    </li>
  );
}
