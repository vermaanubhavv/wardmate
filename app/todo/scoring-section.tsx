"use client";

/**
 * One scoring-engine suggestion — a score input or a recommended investigation, from a
 * matched clinical pathway. Rendered by both /todo views: the default "By urgency" view's
 * closing "Worth asking?" section (app/todo/todo-lists.tsx's ByUrgency) and the "By type" view's
 * per-category sections (ByType) — one row component, two groupings of the same jobs.
 */

import Link from "next/link";
import { useState, useTransition } from "react";
import type { ScoringTask } from "@/lib/scoring/read";
import { completeScoringTask, declineScoringTask } from "../patients/[id]/scoring/actions";

export type WardScoringTask = ScoringTask & { bed: string; name: string };

const PAST: Record<string, string> = { send: "sent", order: "ordered", arrange: "arranged", chart: "charted" };

/** A suggestion is asked, never told: "Send CBC and CRP" reads "Has CBC and CRP been sent
 *  for Ravi?". A multi-part or unfamiliar action is asked whole. The stored action is untouched. */
export function asQuestion(action: string, name: string): string {
  const who = name ? ` for ${name}` : "";
  const m = /^(Send|Order|Arrange|Chart)\s+(.+)$/.exec(action.trim());
  if (m && !m[2].includes(";")) return `Has ${m[2]} been ${PAST[m[1].toLowerCase()]}${who}?`;
  return `Has this been considered${who}: ${action.trim().replace(/[.?]$/, "")}?`;
}

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
        className="-my-2 grid h-11 w-11 shrink-0 place-items-center active:opacity-50"
      >
        <span className="block h-[22px] w-[22px] rounded-full border-2 border-line" />
      </button>
      <div className="min-w-0 flex-1">
        <p className="text-subhead">{asQuestion(t.action, t.name)}</p>
        <Link
          href={`/patients/${t.patientId}`}
          className="flex min-h-11 items-center gap-1.5 truncate text-footnote text-accent active:opacity-60"
        >
          <span className="rounded bg-chip px-1 font-mono tabular-nums text-muted">{t.bed}</span>
          {t.name}
        </Link>
        <p className="text-footnote text-muted">
          {t.pathwayTitle ? `Suggested by ${t.pathwayTitle}` : "Suggested"} · {t.reason}
        </p>
        {!declining ? (
          <button
            onClick={() => setDeclining(true)}
            className="flex min-h-11 items-center text-footnote text-muted underline underline-offset-4 active:opacity-60"
          >
            Not needed
          </button>
        ) : (
          <div className="mt-1.5 flex gap-1.5">
            <input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              aria-label="Reason it is not needed"
              placeholder="reason (required)"
              className="flex-1 rounded-[8px] border border-line px-2 py-1.5 text-footnote"
            />
            <button
              disabled={pending || !reason.trim()}
              onClick={() => start(async () => setErr((await declineScoringTask(t.patientId, t.id, reason)).error))}
              className="rounded-[8px] border border-line px-3 py-1.5 text-footnote font-semibold active:opacity-60"
            >
              Confirm
            </button>
          </div>
        )}
        {err && <p className="mt-1 text-footnote text-warn-fg">{err}</p>}
      </div>
    </li>
  );
}
