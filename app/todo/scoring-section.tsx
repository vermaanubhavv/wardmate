"use client";

/**
 * One scoring-engine suggestion — a score input or a recommended investigation, from a
 * matched clinical pathway. Rendered by both /todo views: the default "By urgency" view's
 * "Recommended" section (app/todo/todo-lists.tsx's ByUrgency) and the "By type" view's
 * per-category sections (ByType) — one row component, two groupings of the same jobs.
 */

import Link from "next/link";
import { useState, useTransition } from "react";
import type { ScoringTask } from "@/lib/scoring/read";
import { completeScoringTask, declineScoringTask } from "../patients/[id]/scoring/actions";

export type WardScoringTask = ScoringTask & { bed: string; name: string };

export function Row({ t }: { t: WardScoringTask }) {
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
        <p className="mt-0.5 text-[13px] text-muted">
          {t.pathwayTitle ? `Suggested by ${t.pathwayTitle}` : "Suggested"} · {t.reason}
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
              onClick={() => start(async () => setErr((await declineScoringTask(t.patientId, t.id, reason)).error))}
              className="rounded-[8px] border border-line px-3 py-1.5 text-[13px] font-semibold active:opacity-60"
            >
              Confirm
            </button>
          </div>
        )}
        {err && <p className="mt-1 text-[13px] text-warn-fg">{err}</p>}
      </div>
    </li>
  );
}
