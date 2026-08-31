"use client";

/**
 * The patient-page clinical-scoring panel. Renders the active/suggested pathways, their score
 * cards with component-level evidence, generated tasks (each with "why"), scheduled
 * checkpoints, and the source/version footer.
 *
 * Every component shows exactly one of: satisfied · not satisfied · unknown · not applicable ·
 * stale. `unknown` is amber and labelled — it is NEVER shown as normal or zero.
 */

import { useState, useTransition } from "react";
import type {
  PatientScoring,
  ScoringCardView,
  ScoringInstanceView,
  ScoringTaskView,
} from "@/lib/scoring/read";
import type { ComponentResult } from "@/lib/scoring/types";
import {
  activatePathway,
  completeTask,
  declineTask,
  dismissPathway,
  overrideComponent,
  setAtlantaInputs,
  setCtFindings,
  setRansonAetiology,
  verifyCard,
} from "./actions";

const AMBER = "#a8560b";

export default function ScoringPanel({
  patientId,
  scoring,
}: {
  patientId: string;
  scoring: PatientScoring;
}) {
  if (!scoring.enabled || scoring.instances.length === 0) return null;

  return (
    <section className="px-4 pb-6">
      <p className="ios-group-header mb-2 px-4">Clinical scoring</p>
      <div className="space-y-4">
        {scoring.instances.map((inst) => (
          <PathwayBlock key={inst.id} patientId={patientId} inst={inst} />
        ))}
      </div>
      <p className="mt-3 px-4 text-[12px] leading-snug text-muted">{scoring.disclaimer}</p>
    </section>
  );
}

function PathwayBlock({ patientId, inst }: { patientId: string; inst: ScoringInstanceView }) {
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const [dismissing, setDismissing] = useState(false);
  const [reason, setReason] = useState("");

  const run = (fn: () => Promise<{ error: string | null }>) =>
    start(async () => {
      setErr((await fn()).error);
    });

  return (
    <div className="ios-group overflow-hidden">
      {/* Banner */}
      <div className="border-b border-line px-4 py-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[16px] font-semibold">{inst.title}</p>
            <p className="mt-0.5 text-[12px] text-muted">
              {inst.status === "suggested" ? "Suggested pathway" : inst.status === "active" ? "Active pathway" : "Resolved"} ·
              v{inst.pathwayVersion} · triggered from “{truncate(inst.triggerDiagnosis, 40)}”
            </p>
          </div>
          <span
            className="shrink-0 rounded-md px-1.5 py-0.5 text-[11px] font-semibold"
            style={
              inst.status === "active"
                ? { background: "var(--chip)", color: "var(--accent)" }
                : { background: "#fff4e5", color: AMBER }
            }
          >
            {inst.status}
          </span>
        </div>

        {inst.status === "suggested" && (
          <div className="mt-2.5 flex gap-2">
            <button
              disabled={pending}
              onClick={() => run(() => activatePathway(patientId, inst.id))}
              className="rounded-[8px] bg-accent px-3 py-1.5 text-[13px] font-semibold text-accent-ink active:opacity-70"
            >
              Accept &amp; activate
            </button>
            <button
              disabled={pending}
              onClick={() => setDismissing((d) => !d)}
              className="rounded-[8px] border border-line px-3 py-1.5 text-[13px] active:opacity-60"
            >
              Dismiss
            </button>
          </div>
        )}
        {dismissing && (
          <div className="mt-2 flex gap-2">
            <input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Reason for dismissal"
              className="flex-1 rounded-[8px] border border-line px-2 py-1.5 text-[13px]"
            />
            <button
              disabled={pending || !reason.trim()}
              onClick={() => run(() => dismissPathway(patientId, inst.id, reason))}
              className="rounded-[8px] border border-line px-3 py-1.5 text-[13px] font-semibold active:opacity-60"
            >
              Confirm
            </button>
          </div>
        )}
        {inst.nextCheckpointAt && inst.status === "active" && (
          <p className="mt-2 text-[12px] text-muted">
            Next scheduled reassessment: {fmt(inst.nextCheckpointAt)}
          </p>
        )}
        {err && <p className="mt-2 text-[12px]" style={{ color: AMBER }}>{err}</p>}
      </div>

      {inst.status !== "suggested" && (
        <>
          <RansonAetiology patientId={patientId} inst={inst} />
          {inst.cards.map((card) => (
            <CardView key={card.id} patientId={patientId} inst={inst} card={card} />
          ))}
          <TaskList patientId={patientId} tasks={inst.tasks} />
          <CheckpointList inst={inst} />
          <Footer inst={inst} />
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------

function RansonAetiology({ patientId, inst }: { patientId: string; inst: ScoringInstanceView }) {
  const [pending, start] = useTransition();
  const hasRanson = inst.cards.some((c) => c.cardId.startsWith("ranson_"));
  if (!hasRanson && inst.ransonAetiology == null) return null;
  const choose = (v: "non_gallstone" | "gallstone" | "uncertain") =>
    start(() => setRansonAetiology(patientId, inst.id, v).then(() => {}));
  return (
    <div className="border-b border-line px-4 py-3">
      <p className="text-[13px] font-medium">Ranson aetiology</p>
      <p className="text-[12px] text-muted">
        The formula differs for gallstone vs non-gallstone pancreatitis. Wardmate will not choose
        for you — until you confirm, both admission variants are shown and the 48-hour stage stays
        locked.
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        {(["non_gallstone", "gallstone", "uncertain"] as const).map((v) => (
          <button
            key={v}
            disabled={pending}
            onClick={() => choose(v)}
            className="rounded-[8px] border px-3 py-1.5 text-[13px] active:opacity-60"
            style={
              inst.ransonAetiology === v
                ? { borderColor: "var(--accent)", color: "var(--accent)", fontWeight: 600 }
                : { borderColor: "var(--line)" }
            }
          >
            {v.replace("_", "-")}
          </button>
        ))}
      </div>
    </div>
  );
}

function CardView({
  patientId,
  inst,
  card,
}: {
  patientId: string;
  inst: ScoringInstanceView;
  card: ScoringCardView;
}) {
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const [openEvidence, setOpenEvidence] = useState(false);
  const r = card.result;

  const stateLabel: Record<string, string> = {
    not_started: "not started",
    incomplete: "incomplete",
    complete_unverified: "complete — unverified",
    verified: "verified",
    stale: "stale — data changed since verification",
    not_applicable: "not applicable",
  };

  return (
    <div className="border-b border-line px-4 py-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[14px] font-semibold">{r.title}</p>
          <p className="text-[12px] text-muted">{stateLabel[r.state] ?? r.state}</p>
        </div>
        <div className="text-right">
          {r.total != null ? (
            <p className="text-[20px] font-bold tabular-nums">{r.total}</p>
          ) : r.classification && r.classification !== "unknown" ? (
            <p className="text-[14px] font-semibold">{r.classification.replace(/_/g, " ")}</p>
          ) : (
            <p className="text-[13px] font-semibold" style={{ color: AMBER }}>
              incomplete
            </p>
          )}
          {r.missingRequiredCount > 0 && (
            <p className="text-[11px]" style={{ color: AMBER }}>
              {r.missingRequiredCount} unknown
            </p>
          )}
        </div>
      </div>

      {r.interpretation && (
        <p
          className="mt-1.5 text-[12px] leading-snug"
          style={{ color: r.interpretation.tone === "attention" ? AMBER : "var(--muted)" }}
        >
          {r.interpretation.text}
        </p>
      )}

      <button
        onClick={() => setOpenEvidence((o) => !o)}
        className="mt-2 text-[12px] font-medium text-accent active:opacity-60"
      >
        {openEvidence ? "Hide" : "Show"} components &amp; evidence
      </button>

      {openEvidence && (
        <ul className="mt-2 space-y-1.5">
          {r.components.map((c) => (
            <ComponentRow
              key={c.componentId}
              c={c}
              onOverride={(value, reason) =>
                start(async () => {
                  const res = await overrideComponent(patientId, inst.id, c.componentId, value, reason);
                  setErr(res.error);
                })
              }
            />
          ))}
        </ul>
      )}

      {r.cardId === "atlanta" && <AtlantaForm patientId={patientId} inst={inst} />}
      {r.cardId === "mctsi" && <CtForm patientId={patientId} inst={inst} />}

      {(r.state === "complete_unverified" || r.state === "stale") && (
        <button
          disabled={pending}
          onClick={() =>
            start(async () => setErr((await verifyCard(patientId, card.id)).error))
          }
          className="mt-2 rounded-[8px] bg-accent px-3 py-1.5 text-[13px] font-semibold text-accent-ink active:opacity-70"
        >
          {r.state === "stale" ? "Re-verify" : "Verify score"}
        </button>
      )}
      {r.state === "verified" && (
        <p className="mt-2 text-[12px] text-muted">
          Verified {card.verifiedAt ? fmt(card.verifiedAt) : ""}.
        </p>
      )}
      {err && <p className="mt-1.5 text-[12px]" style={{ color: AMBER }}>{err}</p>}
    </div>
  );
}

function ComponentRow({
  c,
  onOverride,
}: {
  c: ComponentResult;
  onOverride: (value: string, reason: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState("");
  const [reason, setReason] = useState("");

  const badge =
    c.status === "satisfied"
      ? { text: "satisfied", color: "var(--foreground)", weight: 600 }
      : c.status === "not_satisfied"
        ? { text: "not satisfied", color: "var(--muted)", weight: 400 }
        : c.status === "not_applicable"
          ? { text: "not applicable", color: "var(--muted)", weight: 400 }
          : c.status === "stale"
            ? { text: "stale", color: AMBER, weight: 600 }
            : { text: "unknown", color: AMBER, weight: 600 };

  return (
    <li className="text-[12px]" style={c.status === "unknown" ? { borderLeft: `2px solid ${AMBER}`, paddingLeft: 6 } : undefined}>
      <div className="flex items-baseline justify-between gap-2">
        <span>{c.label}</span>
        <span style={{ color: badge.color, fontWeight: badge.weight }}>
          {badge.text}
          {c.points > 0 ? ` · +${c.points}` : ""}
        </span>
      </div>
      <div className="text-muted">
        {c.rawValue ? (
          <>
            {c.rawValue}
            {c.sourceAt ? ` · ${fmt(c.sourceAt)}` : ""} · window: {c.window.label}
          </>
        ) : (
          <>
            no value in window: {c.window.label}
            {c.missingReason ? ` (${c.missingReason.replace(/_/g, " ")})` : ""}
          </>
        )}
      </div>
      {c.override && (
        <div className="text-muted">
          overridden → {c.override.value} · reason: {c.override.reason} · original kept:{" "}
          {c.override.original.rawValue ?? "unknown"}
        </div>
      )}
      {!editing ? (
        <button className="text-accent active:opacity-60" onClick={() => setEditing(true)}>
          Override
        </button>
      ) : (
        <div className="mt-1 flex flex-wrap gap-1.5">
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="corrected value"
            className="rounded-[6px] border border-line px-2 py-1"
          />
          <input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="reason"
            className="rounded-[6px] border border-line px-2 py-1"
          />
          <button
            disabled={!value.trim() || !reason.trim()}
            className="rounded-[6px] border border-line px-2 py-1 font-semibold active:opacity-60"
            onClick={() => {
              onOverride(value, reason);
              setEditing(false);
            }}
          >
            Save
          </button>
        </div>
      )}
    </li>
  );
}

function AtlantaForm({ patientId, inst }: { patientId: string; inst: ScoringInstanceView }) {
  const [pending, start] = useTransition();
  const set = (patch: Parameters<typeof setAtlantaInputs>[2]) =>
    start(() => setAtlantaInputs(patientId, inst.id, patch).then(() => {}));
  return (
    <div className="mt-2 rounded-[8px] bg-chip p-2 text-[12px]">
      <p className="font-medium">Clinician-confirmed classification inputs</p>
      <div className="mt-1 flex flex-wrap gap-1.5">
        <YesNo label="Local complications" onSet={(v) => set({ localComplications: v })} disabled={pending} />
        <YesNo label="Systemic complications" onSet={(v) => set({ systemicComplications: v })} disabled={pending} />
        <YesNo
          label="Organ failure resolved < 48 h (transient)"
          onSet={(v) => set({ organFailureResolved: v })}
          disabled={pending}
        />
      </div>
      <p className="mt-1 text-muted">
        Organ-failure persistence (≥ 48 h → severe) is resolved automatically at the 48-hour
        checkpoint from the Modified Marshall trend; it is never labelled persistent early.
      </p>
    </div>
  );
}

function CtForm({ patientId, inst }: { patientId: string; inst: ScoringInstanceView }) {
  const [pending, start] = useTransition();
  const [v, setV] = useState({ pancreatic_inflammation: "", pancreatic_necrosis: "", extrapancreatic: "" });
  return (
    <div className="mt-2 rounded-[8px] bg-chip p-2 text-[12px]">
      <p className="font-medium">Modified CTSI — from the signed CT report only</p>
      <p className="text-muted">
        Wardmate does not order a CT to complete this score. Enter what the radiologist reported;
        it is stored against the report and needs your verification.
      </p>
      <div className="mt-1 space-y-1">
        {(["pancreatic_inflammation", "pancreatic_necrosis", "extrapancreatic"] as const).map((k) => (
          <input
            key={k}
            placeholder={k.replace(/_/g, " ")}
            value={v[k]}
            onChange={(e) => setV({ ...v, [k]: e.target.value })}
            className="w-full rounded-[6px] border border-line px-2 py-1"
          />
        ))}
        <button
          disabled={pending}
          onClick={() => start(() => setCtFindings(patientId, inst.id, v).then(() => {}))}
          className="rounded-[6px] border border-line px-2 py-1 font-semibold active:opacity-60"
        >
          Save CT findings
        </button>
      </div>
    </div>
  );
}

function YesNo({
  label,
  onSet,
  disabled,
}: {
  label: string;
  onSet: (v: boolean) => void;
  disabled: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-1 rounded-[6px] border border-line px-1.5 py-1">
      {label}
      <button disabled={disabled} onClick={() => onSet(true)} className="font-semibold text-accent">
        yes
      </button>
      <button disabled={disabled} onClick={() => onSet(false)} className="text-muted">
        no
      </button>
    </span>
  );
}

function TaskList({ patientId, tasks }: { patientId: string; tasks: ScoringTaskView[] }) {
  const open = tasks.filter((t) => t.status === "suggested" || t.status === "linked" || t.status === "accepted");
  const other = tasks.filter((t) => !open.includes(t));
  if (tasks.length === 0) return null;
  return (
    <div className="border-b border-line px-4 py-3">
      <p className="text-[13px] font-medium">Suggested missing-data tasks</p>
      <ul className="mt-1.5 space-y-2">
        {open.map((t) => (
          <TaskRow key={t.id} patientId={patientId} t={t} />
        ))}
      </ul>
      {other.length > 0 && (
        <details className="mt-2">
          <summary className="text-[12px] text-muted">
            {other.length} linked / declined / completed
          </summary>
          <ul className="mt-1 space-y-1">
            {other.map((t) => (
              <li key={t.id} className="text-[12px] text-muted">
                {t.action} — {t.status}
                {t.declineReason ? ` (${t.declineReason})` : ""}
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}

function TaskRow({ patientId, t }: { patientId: string; t: ScoringTaskView }) {
  const [pending, start] = useTransition();
  const [declining, setDeclining] = useState(false);
  const [reason, setReason] = useState("");
  const [err, setErr] = useState<string | null>(null);
  return (
    <li className="text-[12px]">
      <div className="flex items-baseline justify-between gap-2">
        <span className="font-medium">{t.action}</span>
        <span className="shrink-0 text-muted">
          {t.priority} · {t.responsibleRole}
          {t.dueAt ? ` · due ${fmt(t.dueAt)}` : ""}
          {t.status === "linked" ? " · linked to existing" : ""}
        </span>
      </div>
      <p className="text-muted">Why: {t.reason}</p>
      <div className="mt-0.5 flex gap-2">
        <button
          disabled={pending}
          onClick={() => start(async () => setErr((await completeTask(patientId, t.id)).error))}
          className="text-accent active:opacity-60"
        >
          Mark done
        </button>
        <button onClick={() => setDeclining((d) => !d)} className="text-muted active:opacity-60">
          Decline
        </button>
      </div>
      {declining && (
        <div className="mt-1 flex gap-1.5">
          <input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="reason (required)"
            className="flex-1 rounded-[6px] border border-line px-2 py-1"
          />
          <button
            disabled={pending || !reason.trim()}
            onClick={() => start(async () => setErr((await declineTask(patientId, t.id, reason)).error))}
            className="rounded-[6px] border border-line px-2 py-1 font-semibold active:opacity-60"
          >
            Confirm
          </button>
        </div>
      )}
      {err && <p style={{ color: AMBER }}>{err}</p>}
    </li>
  );
}

function CheckpointList({ inst }: { inst: ScoringInstanceView }) {
  if (inst.checkpoints.length === 0) return null;
  return (
    <div className="border-b border-line px-4 py-3">
      <p className="text-[13px] font-medium">Scheduled reassessments</p>
      <ul className="mt-1 space-y-1">
        {inst.checkpoints.map((c) => (
          <li key={c.key} className="text-[12px] text-muted">
            {c.label} · {c.executedAt ? `done ${fmt(c.executedAt)}` : `due ${fmt(c.dueAt)}`}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Footer({ inst }: { inst: ScoringInstanceView }) {
  return (
    <div className="px-4 py-3 text-[11px] text-muted">
      <p>
        Source/version: {inst.title} v{inst.pathwayVersion} · clinical owner: {inst.clinicalOwner} ·
        review due {inst.reviewDueAt}
      </p>
      {inst.sourceReferences.length > 0 && (
        <p className="mt-0.5">
          References: {inst.sourceReferences.map((s) => `${s.label} (${s.citation})`).join("; ")}
        </p>
      )}
    </div>
  );
}

function truncate(s: string, n: number) {
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}
function fmt(iso: string) {
  try {
    return new Date(iso).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}
