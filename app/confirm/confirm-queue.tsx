"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { flagMisheard } from "../patients/[id]/flag-misheard";
import { confirmMany, confirmAllPending, editAndConfirm, discardPending } from "./actions";
import type { PendingConfirm } from "@/lib/confirm-queue";
import { ActionSheet } from "../action-sheet";
import BottomBar from "../bottom-bar";

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
  // Which destructive thing the sheet is asking about: everything at once, or one row.
  const [ask, setAsk] = useState<{ kind: "all" } | { kind: "discard"; id: string } | null>(null);

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
      <p className="mx-4 ios-group px-4 py-3 text-subhead text-muted">
        {done > 0
          ? `All ${done} confirmed. Nothing left waiting on the unit.`
          : "Nothing waiting to be confirmed. Everything dictated on the unit has been checked."}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4 px-4 pb-[var(--bar-height)]">
      {done > 0 && (
        <div>
          <p className="mb-1 text-footnote font-medium text-muted tabular-nums">
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
          <p className="border-b border-line bg-chip px-4 py-2 text-footnote font-semibold">
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
                onDiscard={() => setAsk({ kind: "discard", id: o.id })}
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

      {message && <p role="alert" className="text-footnote text-warn-fg">{message}</p>}

      {/* Quiet on purpose. Every row above has its own Confirm; taking the whole unit's
          numbers on one tap is the exception, so it asks first and is not the filled button. */}
      <BottomBar>
        <button
          type="button"
          disabled={pending}
          onClick={() => setAsk({ kind: "all" })}
          className="btn btn-secondary"
        >
          Confirm all {items.length} without checking
        </button>
      </BottomBar>

      <ActionSheet
        open={ask !== null}
        title={
          ask?.kind === "all"
            ? `Confirm all ${items.length} values as heard?`
            : "Discard this value?"
        }
        message={
          ask?.kind === "all"
            ? "Every number, drug and dose still waiting on the unit will be marked confirmed without being looked at."
            : "It is removed from the record. The recording it came from is kept."
        }
        action={ask?.kind === "all" ? `Confirm all ${items.length}` : "Discard"}
        onCancel={() => setAsk(null)}
        onConfirm={() => {
          const a = ask;
          setAsk(null);
          if (!a) return;
          if (a.kind === "all") run(() => confirmAllPending(patientIds));
          else run(() => discardPending(a.id), () => setEditingId(null));
        }}
      />
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
      <div className="pointer-events-none absolute inset-0 flex items-center justify-between px-5 text-footnote font-semibold">
        <span className={dx > 24 ? "text-good-fg" : "text-transparent"}>✓ Confirm</span>
        <span className={dx < -24 ? "text-critical-fg" : "text-transparent"}>Discard ✕</span>
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
          <span className="min-w-0 flex-1 text-subhead">
            <span className="text-muted">{o.label}</span>{" "}
            <span className="font-medium">{o.value_text}</span>
          </span>
          {!swiping && (
            <span className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={editing ? onCancelEdit : onOpenEdit}
                className="tap min-h-11 px-2 text-footnote font-medium text-accent"
              >
                {editing ? "Cancel" : "Edit"}
              </button>
              {!editing && (
                <button
                  type="button"
                  disabled={disabled}
                  onClick={onConfirm}
                  className="min-h-11 rounded-full bg-good-bg px-3 text-footnote font-semibold text-good-fg"
                >
                  Confirm
                </button>
              )}
            </span>
          )}
        </div>
        <p className="mt-1.5 text-footnote italic text-muted">“{o.source_quote}”</p>
        {o.conflict_note && !editing && (
          <p className="mt-1 text-caption text-warn-fg">{o.conflict_note}</p>
        )}

        {editing && (
          <div className="mt-2 flex items-center gap-2">
            <input
              value={draft}
              onChange={(e) => onDraft(e.target.value)}
              autoFocus
              inputMode={NUMERIC_KINDS.has(o.kind) ? "decimal" : "text"}
              className="field min-w-0 flex-1"
            />
            <button type="button" disabled={disabled} onClick={onSave} className="tap shrink-0 min-h-11 px-1 text-subhead font-semibold text-accent">
              Save
            </button>
            <button type="button" disabled={disabled} onClick={onDiscard} className="tap shrink-0 min-h-11 px-1 text-footnote text-critical-fg">
              Discard
            </button>
          </div>
        )}

        {!editing && (
          <p className="mt-1 text-caption2 text-muted">Swipe right to confirm · left to discard</p>
        )}
      </div>
    </li>
  );
}
