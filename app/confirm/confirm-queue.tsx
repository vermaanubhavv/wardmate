"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { flagMisheard } from "../patients/[id]/flag-misheard";
import { confirmMany, editAndConfirm, discardPending } from "./actions";
import type { PendingConfirm } from "@/lib/confirm-queue";
import { ActionSheet } from "../action-sheet";
import BottomBar from "../bottom-bar";
import { displayLabel, displayValue, isUnreadable } from "@/lib/display-value";

/**
 * The whole unit's values waiting to be checked — grouped by bed, worked top to bottom, each
 * patient's report photo shown with their values so the check is made against the source.
 * Swipe a card right to confirm it, left to discard it; or use its buttons.
 *
 * "Confirm all" is visible, because on a busy round it is often the right call — but it takes
 * only values that can be read (an unreadable one cannot be confirmed as anything), and it
 * asks one short question first rather than opening a screen.
 */
const SWIPE_COMMIT = 96; // px past which a release fires the action
const NUMERIC_KINDS = new Set(["vital", "lab", "day_number", "drain", "intake_output"]);

export default function ConfirmQueue({
  items,
  photos,
}: {
  items: PendingConfirm[];
  /** Signed photo URLs by storage path. */
  photos: Record<string, string>;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [discardId, setDiscardId] = useState<string | null>(null);
  const [askAll, setAskAll] = useState(false);
  const [viewing, setViewing] = useState<string | null>(null);

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

  const readableIds = useMemo(() => items.filter((i) => !isUnreadable(i.value_text)).map((i) => i.id), [items]);
  const unreadable = items.length - readableIds.length;

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
          ? `All ${done} checked. Nothing left waiting on the unit.`
          : "Nothing waiting to be checked. Everything recorded on the unit has been confirmed."}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4 px-4 pb-[var(--bar-height)]">
      {done > 0 && (
        <div>
          <p className="mb-1 text-footnote font-medium text-muted tabular-nums">
            {done} of {startTotal} checked
          </p>
          <div className="h-1.5 overflow-hidden rounded-full bg-line">
            <div
              className="h-full rounded-full bg-accent transition-all"
              style={{ width: `${(done / startTotal) * 100}%` }}
            />
          </div>
        </div>
      )}

      {groups.map((rows) => {
        const photoPaths = [...new Set(rows.map((r) => r.photo_path).filter((p): p is string => Boolean(p)))];
        return (
          <section key={rows[0].patient_id} className="flex flex-col gap-2.5">
            <h2 className="flex items-center gap-2 text-subhead">
              <span className="grid h-7 min-w-7 place-items-center rounded-[7px] bg-chip px-1 font-mono text-footnote font-semibold tabular-nums">
                {rows[0].bed}
              </span>
              <span className="font-semibold">{rows[0].patient_name}</span>
              <span className="text-muted">
                · {rows.length} {rows.length === 1 ? "value" : "values"}
              </span>
            </h2>

            {/* The report as photographed, so each value below is read against it. */}
            {photoPaths.map((path) =>
              photos[path] ? (
                <button
                  key={path}
                  type="button"
                  onClick={() => setViewing(photos[path])}
                  className="overflow-hidden rounded-[12px] border border-line/70 bg-card text-left active:opacity-80"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- a signed, expiring storage URL */}
                  <img src={photos[path]} alt="The report as photographed" className="h-36 w-full object-cover object-top" />
                  <span className="flex justify-between px-3.5 py-2 text-footnote text-accent">
                    <span>Photo of the report</span>
                    <span>Tap to enlarge</span>
                  </span>
                </button>
              ) : null
            )}

            <ul className="flex flex-col gap-2.5">
              {rows.map((o) => (
                <SwipeCard
                  key={o.id}
                  o={o}
                  disabled={pending}
                  editing={editingId === o.id}
                  draft={draft}
                  onDraft={setDraft}
                  onOpenEdit={() => {
                    setEditingId(o.id);
                    setDraft(isUnreadable(o.value_text) ? "" : (o.value_text ?? ""));
                  }}
                  onCancelEdit={() => setEditingId(null)}
                  onConfirm={() => run(() => confirmMany([o.id]))}
                  onDiscard={() => setDiscardId(o.id)}
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
          </section>
        );
      })}

      {message && <p role="alert" className="text-footnote text-warn-fg">{message}</p>}

      {readableIds.length > 0 && (
        <BottomBar>
          <button
            type="button"
            disabled={pending}
            onClick={() => setAskAll(true)}
            className="min-h-[52px] w-full rounded-[12px] border-[1.5px] border-accent bg-card text-body font-semibold text-accent active:opacity-70 disabled:opacity-50"
          >
            Confirm all {readableIds.length}
          </button>
          {unreadable > 0 && (
            <p className="text-center text-caption text-muted">
              {unreadable === 1 ? "The unreadable value is" : `The ${unreadable} unreadable values are`} left out
              and {unreadable === 1 ? "stays" : "stay"} to check.
            </p>
          )}
        </BottomBar>
      )}

      <SmallAlert
        open={askAll}
        title="Checked against the source?"
        message={`${readableIds.length} ${readableIds.length === 1 ? "value" : "values"} will be marked as checked by you.`}
        cancel="Not yet"
        confirm="Yes, confirm"
        onCancel={() => setAskAll(false)}
        onConfirm={() => {
          setAskAll(false);
          run(() => confirmMany(readableIds));
        }}
      />

      <ActionSheet
        open={discardId !== null}
        title="Discard this value?"
        message="It is removed from the record. The recording or photo it came from is kept."
        action="Discard"
        onCancel={() => setDiscardId(null)}
        onConfirm={() => {
          const id = discardId;
          setDiscardId(null);
          if (id) run(() => discardPending(id), () => setEditingId(null));
        }}
      />

      {viewing && <PhotoViewer src={viewing} onClose={() => setViewing(null)} />}
    </div>
  );
}

function SwipeCard({
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
  const unreadable = isUnreadable(o.value_text);
  const shown = displayValue(o.value_text);
  // A number or short reading is the point of the card and is set large; a drug line or a
  // sentence reads better at body size.
  const short = shown.length <= 12;

  function onPointerDown(e: React.PointerEvent) {
    if (editing || disabled) return;
    // Buttons and the field keep their own taps; only the card body swipes.
    if ((e.target as HTMLElement).closest("button, input")) return;
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
    if (dx >= SWIPE_COMMIT && !unreadable) onConfirm();
    else if (dx <= -SWIPE_COMMIT) onDiscard();
    startX.current = null;
    setDragging(false);
    setDx(0);
  }

  return (
    <li className="relative overflow-hidden rounded-[12px]">
      {/* What the swipe will do, revealed under the moving card. */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-between rounded-[12px] bg-chip px-5 text-footnote font-semibold">
        <span className={dx > 24 && !unreadable ? "text-accent" : "text-transparent"}>✓ Confirm</span>
        <span className={dx < -24 ? "text-critical-fg" : "text-transparent"}>Discard ✕</span>
      </div>

      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className="relative flex flex-col gap-2 rounded-[12px] bg-card p-3.5 touch-pan-y"
        style={{
          transform: `translateX(${dx}px)`,
          transition: dragging ? "none" : "transform 0.18s ease-out",
        }}
      >
        {/* The reason sits beside the label when it is short and under it when it is not, so
            neither is ever cut short. */}
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
          <span className="min-w-0 text-subhead text-muted">{displayLabel(o.label)}</span>
          <span className="text-caption font-semibold text-warn-fg">
            {unreadable ? "Not a readable number" : o.reason}
          </span>
        </div>

        {unreadable ? (
          <p className="text-title3 font-semibold text-warn-fg">{shown === "Not reported" ? "Not reported" : "Unreadable on the source"}</p>
        ) : (
          <p className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span className={(short ? "text-title1" : "text-body") + " font-semibold tabular-nums"}>{shown}</span>
            {o.unit && <span className="text-subhead text-foreground/80">{o.unit}</span>}
            {o.flag && (
              <span className="rounded-[5px] bg-critical-bg px-1.5 py-0.5 text-caption font-bold uppercase text-critical-fg">
                {o.flag === "abnormal" ? "Abnormal" : o.flag}
              </span>
            )}
            {o.range && <span className="text-footnote text-muted">ref {o.range}</span>}
          </p>
        )}

        <p className="text-footnote italic text-muted">
          {o.source === "photo" ? "Printed" : o.source === "manual" ? "Typed" : "Said"}: “{o.source_quote}”
        </p>

        {editing ? (
          <div className="flex items-center gap-2">
            <input
              value={draft}
              onChange={(e) => onDraft(e.target.value)}
              autoFocus
              inputMode={NUMERIC_KINDS.has(o.kind) ? "decimal" : "text"}
              aria-label={`Correct value for ${o.label}`}
              className="field min-w-0 flex-1"
            />
            <button type="button" disabled={disabled} onClick={onSave} className="tap min-h-11 shrink-0 px-1 text-subhead font-semibold text-accent">
              Save
            </button>
            <button type="button" onClick={onCancelEdit} className="tap min-h-11 shrink-0 px-1 text-subhead text-muted">
              Cancel
            </button>
          </div>
        ) : unreadable ? (
          <div className="mt-1 flex gap-2.5">
            <button
              type="button"
              disabled={disabled}
              onClick={onDiscard}
              className="min-h-11 flex-1 rounded-[10px] border border-line text-subhead font-semibold text-foreground/80 active:opacity-70"
            >
              Leave out
            </button>
            <button
              type="button"
              disabled={disabled}
              onClick={onOpenEdit}
              className="min-h-11 flex-[1.4] rounded-[10px] bg-accent text-subhead font-semibold text-accent-ink active:opacity-80"
            >
              Type the value
            </button>
          </div>
        ) : (
          <div className="mt-1 flex gap-2.5">
            <button
              type="button"
              disabled={disabled}
              onClick={onOpenEdit}
              className="min-h-11 flex-1 rounded-[10px] border border-line text-subhead font-semibold text-accent active:opacity-70"
            >
              Correct it
            </button>
            <button
              type="button"
              disabled={disabled}
              onClick={onConfirm}
              className="min-h-11 flex-[1.4] rounded-[10px] bg-accent text-subhead font-semibold text-accent-ink active:opacity-80"
            >
              It matches · Confirm
            </button>
          </div>
        )}
      </div>
    </li>
  );
}

/** A small centred question, the iOS alert: one line of title, one of detail, two answers. */
function SmallAlert({
  open,
  title,
  message,
  cancel,
  confirm,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  title: string;
  message: string;
  cancel: string;
  confirm: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const ref = useRef<HTMLDialogElement | null>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      d.showModal();
      d.focus();
    }
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onCancel}
      aria-labelledby="alert-title"
      tabIndex={-1}
      style={{ outline: "none" }}
      className="m-auto w-[280px] overflow-hidden rounded-[14px] bg-card p-0 text-center shadow-xl backdrop:bg-black/30"
    >
      <div className="flex flex-col gap-1.5 px-4 pb-4 pt-5">
        <h2 id="alert-title" className="text-body font-semibold">{title}</h2>
        <p className="text-footnote text-foreground/80">{message}</p>
      </div>
      <div className="grid grid-cols-2 border-t border-line">
        <button type="button" onClick={onCancel} className="min-h-11 text-body text-accent active:bg-chip">
          {cancel}
        </button>
        <button type="button" onClick={onConfirm} className="min-h-11 border-l border-line text-body font-semibold text-accent active:bg-chip">
          {confirm}
        </button>
      </div>
    </dialog>
  );
}

/** The photo full-screen, in the page — the app has no back button to return from a new page.
 *  Pinch to zoom works because the page itself allows zoom. */
function PhotoViewer({ src, onClose }: { src: string; onClose: () => void }) {
  return (
    <div role="dialog" aria-label="Photo of the report" className="fixed inset-0 z-50 flex flex-col bg-black">
      <div className="flex justify-end px-2 pt-[calc(0.5rem+env(safe-area-inset-top))]">
        <button type="button" onClick={onClose} aria-label="Close photo" className="grid h-11 w-11 place-items-center text-white">
          <X className="h-6 w-6" strokeWidth={2.2} />
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-auto">
        {/* eslint-disable-next-line @next/next/no-img-element -- a signed, expiring storage URL */}
        <img src={src} alt="The report as photographed" className="mx-auto h-auto w-full max-w-none object-contain" />
      </div>
    </div>
  );
}
