"use client";

/**
 * Score-input to-do items across the whole unit, shown at the top of /todo. These are things a
 * clinical score needs before it can be calculated — kept in the same list the round is worked
 * from, not a separate screen.
 */

import Link from "next/link";
import { useState, useTransition } from "react";
import type { ScoringTask } from "@/lib/scoring/read";
import { completeScoringTask, declineScoringTask } from "../patients/[id]/scoring/actions";

const AMBER = "#a8560b";

export type WardScoringTask = ScoringTask & { bed: string; name: string };

export default function ScoringSection({ tasks }: { tasks: WardScoringTask[] }) {
  if (tasks.length === 0) return null;
  return (
    <div>
      <div className="mb-2 flex items-baseline gap-2">
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: AMBER }} aria-hidden />
        <p className="text-[17px] font-medium">Score inputs · {tasks.length}</p>
      </div>
      <p className="mb-2 text-[13px] text-muted">Needed to complete a clinical score</p>
      <ul className="divide-y divide-line rounded-[10px] border border-line bg-card">
        {tasks.map((t) => (
          <Row key={t.id} t={t} />
        ))}
      </ul>
    </div>
  );
}

function Row({ t }: { t: WardScoringTask }) {
  const [pending, start] = useTransition();
  const [declining, setDeclining] = useState(false);
  const [reason, setReason] = useState("");
  const [err, setErr] = useState<string | null>(null);

  return (
    <li className="flex items-start gap-3 px-4 py-3">
      <button
        aria-label="Mark done"
        disabled={pending}
        onClick={() => start(async () => setErr((await completeScoringTask(t.patientId, t.id)).error))}
        className="mt-0.5 h-[22px] w-[22px] shrink-0 rounded-full border-2 border-line active:opacity-50"
      />
      <div className="min-w-0 flex-1">
        <p className="text-[15px]">{t.action}</p>
        <Link
          href={`/patients/${t.patientId}`}
          className="mt-0.5 flex items-center gap-1.5 truncate text-[13px] text-accent active:opacity-60"
        >
          <span className="rounded bg-chip px-1 font-mono tabular-nums text-muted">{t.bed}</span>
          {t.name}
        </Link>
        <p className="mt-0.5 text-[13px] text-muted">For the BISAP score · {t.reason}</p>
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
              onClick={() => start(async () => setErr((await declineScoringTask(t.patientId, t.id, reason)).error))}
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
