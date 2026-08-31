"use client";

/**
 * The BISAP card on the patient's page. Auto-computed from recorded values; the two criteria
 * that need a clinician's eye — mental status and pleural effusion — are one tap each. Compact
 * by design: a score, five lines, a source.
 */

import { useState, useTransition } from "react";
import type { BisapCardView } from "@/lib/scoring/read";
import type { ComponentResult } from "@/lib/scoring/types";
import { setBisapFinding } from "./actions";

const AMBER = "#a8560b";
const ORDER = ["bisap.bun", "bisap.mental_status", "bisap.sirs", "bisap.age", "bisap.pleural_effusion"];

export default function BisapCard({ view }: { view: BisapCardView }) {
  const [showCite, setShowCite] = useState(false);
  const r = view.result;
  const components = [...r.components].sort((a, b) => ORDER.indexOf(a.componentId) - ORDER.indexOf(b.componentId));
  const complete = r.missingRequiredCount === 0 && r.total != null;
  const high = r.total != null && r.total >= 3;

  return (
    <section className="px-4 pb-6">
      <p className="ios-group-header mb-2 px-4">BISAP score</p>
      <div className="ios-group">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 px-4 py-3">
          <div>
            <p className="text-[22px] font-bold tabular-nums">
              {r.total ?? "–"}
              <span className="text-[15px] font-normal text-muted"> / 5</span>
              {!complete && <span className="ml-2 text-[13px] font-normal" style={{ color: AMBER }}>so far</span>}
            </p>
            {r.interpretation && (
              <p
                className="mt-0.5 text-[13px] leading-snug"
                style={{ color: high ? AMBER : "var(--muted)" }}
              >
                {r.interpretation.text}
              </p>
            )}
          </div>
        </div>

        {/* Criteria */}
        <ul className="divide-y divide-line border-t border-line">
          {components.map((c) => (
            <CriterionRow key={c.componentId} patientId={view.patientId} c={c} />
          ))}
        </ul>

        {/* Source */}
        <button
          onClick={() => setShowCite((s) => !s)}
          className="w-full border-t border-line px-4 py-2.5 text-left text-[12px] text-accent active:opacity-60"
        >
          {showCite ? "Hide source" : "Source & interpretation"}
        </button>
        {showCite && (
          <p className="border-t border-line px-4 py-3 text-[12px] leading-relaxed text-muted">
            {view.citation}
          </p>
        )}
      </div>
    </section>
  );
}

function dot(status: ComponentResult["status"]) {
  if (status === "satisfied") return <span className="text-[15px] leading-none">●</span>;
  if (status === "not_satisfied") return <span className="text-[15px] leading-none text-muted">○</span>;
  return <span className="text-[15px] font-bold leading-none" style={{ color: AMBER }}>?</span>;
}

function CriterionRow({ patientId, c }: { patientId: string; c: ComponentResult }) {
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const set = (field: "mental_status" | "pleural_effusion", value: "alert" | "impaired" | "present" | "absent") =>
    start(async () => setErr((await setBisapFinding(patientId, field, value)).error));

  const isMental = c.componentId === "bisap.mental_status";
  const isEffusion = c.componentId === "bisap.pleural_effusion";
  const editable = isMental || isEffusion;

  return (
    <li className="px-4 py-2.5">
      <div className="flex items-start gap-2.5">
        <span className="mt-0.5 w-4 shrink-0 text-center">{dot(c.status)}</span>
        <div className="min-w-0 flex-1">
          <p className="text-[14px]">{c.label}</p>
          <p className="text-[12px] text-muted">
            {c.status === "unknown"
              ? editable
                ? "not recorded"
                : `not recorded${c.missingReason ? ` — ${c.missingReason.replace(/_/g, " ")}` : ""}`
              : c.rawValue
                ? `${c.rawValue}${c.sourceAt ? ` · ${fmt(c.sourceAt)}` : ""}`
                : c.status === "satisfied"
                  ? "met"
                  : "not met"}
            {c.points > 0 ? "  · +1" : ""}
          </p>

          {editable && (
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {isMental &&
                (["alert", "impaired"] as const).map((v) => (
                  <button
                    key={v}
                    disabled={pending}
                    onClick={() => set("mental_status", v)}
                    className="rounded-[8px] border border-line px-2.5 py-1 text-[12px] active:opacity-60"
                  >
                    {v === "alert" ? "Alert / oriented" : "Impaired"}
                  </button>
                ))}
              {isEffusion &&
                (["absent", "present"] as const).map((v) => (
                  <button
                    key={v}
                    disabled={pending}
                    onClick={() => set("pleural_effusion", v)}
                    className="rounded-[8px] border border-line px-2.5 py-1 text-[12px] active:opacity-60"
                  >
                    {v === "present" ? "Present on imaging" : "None on imaging"}
                  </button>
                ))}
            </div>
          )}
          {err && <p className="mt-1 text-[12px]" style={{ color: AMBER }}>{err}</p>}
        </div>
      </div>
    </li>
  );
}

function fmt(iso: string) {
  try {
    return new Date(iso).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
  } catch {
    return iso;
  }
}
