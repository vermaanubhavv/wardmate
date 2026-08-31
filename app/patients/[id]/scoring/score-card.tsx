"use client";

/**
 * A clinical score on the patient page. One line when there's nothing to do; a provisional
 * number + one-tap "confirm normal" when only the clinical-eye criteria are pending; the full
 * breakdown behind a tap. Same shape for every pathway.
 */

import { useState, useTransition } from "react";
import type { ScoreCardView } from "@/lib/scoring/read";
import type { ComponentResult } from "@/lib/scoring/types";
import { confirmScoreNormal, setScoreFinding } from "./actions";

const AMBER = "#a8560b";

export default function ScoreCards({ cards }: { cards: ScoreCardView[] }) {
  if (cards.length === 0) return null;
  return (
    <section className="px-4 pb-6">
      <p className="ios-group-header mb-2 px-4">{cards.length === 1 ? "Clinical score" : "Clinical scores"}</p>
      <div className="space-y-3">
        {cards.map((c) => (
          <Card key={`${c.instanceId}:${c.cardId}`} v={c} />
        ))}
      </div>
    </section>
  );
}

function Card({ v }: { v: ScoreCardView }) {
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [showCite, setShowCite] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const r = v.result;

  const provisional = r.provisionalTotal != null && r.assumedComponentIds.length > 0;
  const shownTotal = r.total ?? r.provisionalTotal;
  const isClass = r.classification != null;
  const complete = r.missingRequiredCount === 0;
  const attention = r.interpretation?.tone === "attention";
  const run = (fn: () => Promise<{ error: string | null }>) => start(async () => setErr((await fn()).error));

  const assumedLabels = r.assumedComponentIds
    .map((id) => r.components.find((c) => c.componentId === id)?.label ?? id)
    .map(short);

  return (
    <div className="ios-group overflow-hidden">
      {/* Header line */}
      <div className="flex items-start justify-between gap-3 px-4 py-3">
        <div className="min-w-0">
          <p className="text-[13px] text-muted">{v.pathwayTitle}</p>
          <p className="text-[20px] font-bold leading-tight">
            {v.shortName}{" "}
            {isClass ? (
              <span className="text-[16px]">{r.classification!.replace(/_/g, " ")}</span>
            ) : (
              <>
                {shownTotal ?? "–"}
                {v.maxPoints != null && <span className="text-[14px] font-normal text-muted"> / {v.maxPoints}</span>}
              </>
            )}
            {(provisional || (!complete && !isClass)) && (
              <span className="ml-2 text-[12px] font-medium" style={{ color: AMBER }}>
                {provisional ? "provisional" : "so far"}
              </span>
            )}
          </p>
          {r.interpretation && (
            <p className="mt-0.5 text-[12px] leading-snug" style={{ color: attention ? AMBER : "var(--muted)" }}>
              {r.interpretation.text}
            </p>
          )}
        </div>
      </div>

      {/* Provisional: one-tap confirm normal */}
      {provisional && !reviewing && (
        <div className="border-t border-line px-4 py-3">
          <p className="text-[12px] text-muted">Assuming normal: {assumedLabels.join(", ")}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              disabled={pending}
              onClick={() => run(() => confirmScoreNormal(v.patientId, v.instanceId, v.cardId))}
              className="rounded-[8px] bg-accent px-3 py-1.5 text-[13px] font-semibold text-accent-ink active:opacity-70"
            >
              Confirm — all normal
            </button>
            <button onClick={() => setReviewing(true)} className="text-[13px] text-accent active:opacity-60">
              review each ›
            </button>
          </div>
        </div>
      )}

      {/* Per-criterion assessment */}
      {(reviewing || (!provisional && v.assessable.length > 0)) &&
        v.assessable.map((a) => (
          <div key={a.componentId} className="border-t border-line px-4 py-2.5">
            <p className="text-[13px]">{a.question}</p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {a.options.map((opt, i) => (
                <button
                  key={i}
                  disabled={pending}
                  onClick={() => run(() => setScoreFinding(v.patientId, v.instanceId, a.componentId, i))}
                  className="rounded-[8px] border border-line px-2.5 py-1 text-[12px] active:opacity-60"
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        ))}

      {/* Full breakdown */}
      <button
        onClick={() => setShowAll((s) => !s)}
        className="w-full border-t border-line px-4 py-2 text-left text-[12px] text-accent active:opacity-60"
      >
        {showAll ? "Hide breakdown" : "Breakdown"}
      </button>
      {showAll && (
        <ul className="divide-y divide-line border-t border-line">
          {r.components.map((c) => (
            <li key={c.componentId} className="px-4 py-2 text-[12px]">
              <div className="flex items-baseline justify-between gap-2">
                <span>
                  {mark(c)} {c.label}
                </span>
                <span className="shrink-0 text-muted">
                  {c.status === "unknown" ? "not recorded" : c.rawValue ?? (c.status === "satisfied" ? "met" : "not met")}
                  {c.points > 0 ? ` · +${c.points}` : ""}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Source */}
      {v.citation && (
        <>
          <button
            onClick={() => setShowCite((s) => !s)}
            className="w-full border-t border-line px-4 py-2 text-left text-[12px] text-accent active:opacity-60"
          >
            {showCite ? "Hide source" : "Source & interpretation"}
          </button>
          {showCite && (
            <p className="border-t border-line px-4 py-3 text-[12px] leading-relaxed text-muted">{v.citation}</p>
          )}
        </>
      )}
      {err && <p className="px-4 pb-2 text-[12px]" style={{ color: AMBER }}>{err}</p>}
    </div>
  );
}

function mark(c: ComponentResult) {
  if (c.status === "satisfied") return "●";
  if (c.status === "not_satisfied") return "○";
  return "?";
}
function short(label: string) {
  return label.replace(/\s*\(.*\)\s*/g, "").replace(/^(Impaired|Documented)\s+/i, "").toLowerCase().trim();
}
