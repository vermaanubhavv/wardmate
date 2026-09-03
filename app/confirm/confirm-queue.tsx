"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { flagMisheard } from "../patients/[id]/flag-misheard";
import { confirmMany, confirmAllPending, editAndConfirm, discardPending } from "./actions";
import type { PendingConfirm } from "@/lib/confirm-queue";

/**
 * The whole unit's outstanding confirmations on one screen — grouped by bed, worked top to
 * bottom. Swipe a row right to accept it, left to discard it; tap Edit to correct the value
 * (which accepts it in the same act). A running count sits at the top so a long queue still
 * feels like it's shrinking.
 */
const SWIPE_COMMIT = 96; // px past which a release fires the action
const NUMERIC_KINDS = new Set(["vital", "lab", "day_number", "drain", "intake_output"]);

export default function ConfirmQueue({ items }: { items: PendingConfirm[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  // The queue only ever shrinks within a sitting (a refresh drops what was just cleared), so
  // the high-water mark is the honest denominator for "3 of 11". Adjusting state during render
  // when a prop grows is React's sanctioned pattern for "remember the peak".
  const [startTotal, setStartTotal] = useState(items.length);
  if (items.length > startTotal) setStartTotal(items.length);
  const done = Math.max(0, startTotal - items.length);

  const groups = useMemo(() => {
    const byPatient = new Map<string, PendingConfirm[]>();
    for (const it of items) {
      const list = byPatient.get(it.patient_id) ?? [];
      list.push(it);
      byPatient.set(it.patient_id, list);
    }
    return [...byPatient.values()];
  }, [items]);

  const patientIds = useMemo(() => [...new Set(items.map((i) => i.patient_id))], [items]);

  function run(fn: () => Promise<{ ok: boolean; error?: string }>, after?: () => void) {
    setMessage(null);
    startTransition(async () => {
      const res = await fn();
      if (!res.ok) return setMessage(res.error ?? "Could not save.");
      after?.();
      router.refresh();
    });
  }

  if (items.length === 0) {
    return (
      <p className="mx-4 ios-group px-4 py-3 text-[15px] text-muted">
        {done > 0
          ? `All ${done} confirmed. Nothing left waiting on the unit.`
          : "Nothing waiting to be confirmed. Everything dictated on the unit has been checked."}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4 px-4 pb-40">
      {done > 0 && (
        <div>
          <p className="mb-1 text-[13px] font-medium text-muted tabular-nums">
            {done} of {startTotal} confirmed
          </p>
          <div className="h-1.5 overflow-hidden rounded-full bg-line">
            <div
              className="h-full rounded-full bg-accent transition-all"
              style={{ width: `${(done / startTotal) * 100}%` }}
            />
          </div>
        </div>
      )}

      {groups.map((rows) => (
        <div key={rows[0].patient_id} className="ios-group overflow-hidden">
          <p className="border-b border-line bg-chip px-4 py-2 text-[13px] font-semibold">
            Bed {rows[0].bed} · {rows[0].patient_name}
          </p>
          <ul className="divide-y divide-line">
            {rows.map((o) => (
              <SwipeRow
                key={o.id}
                o={o}
                disabled={pending}
                editing={editingId === o.id}
                draft={draft}
                onDraft={setDraft}
                onOpenEdit={() => {
                  setEditingId(o.id);
                  setDraft(o.value_text ?? "");
                }}
                onCancelEdit={() => setEditingId(null)}
                onConfirm={() => run(() => confirmMany([o.id]))}
                onDiscard={() => run(() => discardPending(o.id), () => setEditingId(null))}
                onSave={() =>
                  run(
                    () => editAndConfirm(o.id, draft),
                    () => {
                      const next = draft.trim();
                      if (next && next !== (o.value_text ?? "")) {
                        flagMisheard(o.value_text ?? "", next, o.kind === "medication" ? "drug" : null);
                      }
                      setEditingId(null);
                    }
                  )
                }
              />
            ))}
          </ul>
        </div>
      ))}

      {message && <p className="text-[13px] text-orange-700">{message}</p>}

      <div className="fixed inset-x-0 bottom-0 z-10 mx-auto flex max-w-md gap-3 border-t border-line bg-background/90 px-4 py-3 backdrop-blur-xl">
        <button
          type="button"
          disabled={pending}
          onClick={() => run(() => confirmAllPending(patientIds))}
          className="flex-1 rounded-[12px] bg-accent px-4 py-3 text-[15px] font-semibold text-accent-ink disabled:opacity-50"
        >
          Confirm all {items.length}
        </button>
      </div>
    </div>
  );
}

function SwipeRow({
  o,
  disabled,
  editing,
  draft,
  onDraft,
  onOpenEdit,
  onCancelEdit,
  onConfirm,
  onDiscard,
  onSave,
}: {
  o: PendingConfirm;
  disabled: boolean;
  editing: boolean;
  draft: string;
  onDraft: (v: string) => void;
  onOpenEdit: () => void;
  onCancelEdit: () => void;
  onConfirm: () => void;
  onDiscard: () => void;
  onSave: () => void;
}) {
  const [dx, setDx] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startX = useRef<number | null>(null);
  const swiping = Math.abs(dx) > 4;

  function onPointerDown(e: React.PointerEvent) {
    if (editing || disabled) return;
    startX.current = e.clientX;
    setDragging(true);
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  }
  function onPointerMove(e: React.PointerEvent) {
    if (startX.current === null) return;
    setDx(e.clientX - startX.current);
  }
  function onPointerUp() {
    if (startX.current === null) return;
    if (dx >= SWIPE_COMMIT) onConfirm();
    else if (dx <= -SWIPE_COMMIT) onDiscard();
    startX.current = null;
    setDragging(false);
    setDx(0);
  }

  return (
    <li className="relative overflow-hidden">
      {/* What the swipe will do, revealed under the moving row. */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-between px-5 text-[13px] font-semibold">
        <span className={dx > 24 ? "text-emerald-700" : "text-transparent"}>✓ Confirm</span>
        <span className={dx < -24 ? "text-rose-700" : "text-transparent"}>Discard ✕</span>
      </div>

      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className="relative bg-card px-3 py-3 touch-pan-y"
        style={{
          transform: `translateX(${dx}px)`,
          transition: dragging ? "none" : "transform 0.18s ease-out",
        }}
      >
        <div className="flex items-start gap-3">
          <span className="min-w-0 flex-1 text-sm">
            <span className="text-muted">{o.label}</span>{" "}
            <span className="font-medium">{o.value_text}</span>
          </span>
          {!swiping && (
            <button
              type="button"
              onClick={editing ? onCancelEdit : onOpenEdit}
              className="shrink-0 text-[13px] font-medium text-accent underline underline-offset-4"
            >
              {editing ? "Cancel" : "Edit"}
            </button>
          )}
        </div>
        <p className="mt-1.5 text-[13px] italic text-muted">“{o.source_quote}”</p>
        {o.conflict_note && !editing && (
          <p className="mt-1 text-xs text-orange-800">{o.conflict_note}</p>
        )}

        {editing && (
          <div className="mt-2 flex items-center gap-2">
            <input
              value={draft}
              onChange={(e) => onDraft(e.target.value)}
              autoFocus
              inputMode={NUMERIC_KINDS.has(o.kind) ? "decimal" : "text"}
              className="min-w-0 flex-1 rounded-md border border-line bg-card px-2 py-1 text-[15px] outline-none focus:border-accent"
            />
            <button type="button" disabled={disabled} onClick={onSave} className="shrink-0 text-[14px] font-semibold text-accent">
              Save
            </button>
            <button type="button" disabled={disabled} onClick={onDiscard} className="shrink-0 text-[13px] text-muted">
              Discard
            </button>
          </div>
        )}

        {!editing && (
          <p className="mt-1 text-[11px] text-muted/70">Swipe right to confirm · left to discard</p>
        )}
      </div>
    </li>
  );
}
