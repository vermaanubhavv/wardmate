"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteEntry } from "./actions";

/** How long after a dictation lands the Undo is offered. Long enough to read what was filed,
 *  short enough that it is still "that one" and not a decision about the record. */
export const UNDO_SECONDS = 20;

/**
 * "Recorded · Undo", for a short while after a dictation lands. Undo removes the entries the
 * dictation produced — a soft delete (patch 0111), so nothing is lost, only taken off the
 * record — with no confirm step: within the window the resident has just watched it land and
 * knows exactly what they are undoing. After the window the entry card's Delete, which does
 * ask, is the way.
 */
export default function UndoDictation({
  entryIds,
  patientId,
  since,
  onUndone,
}: {
  entryIds: string[];
  patientId: string;
  /** When the last of them landed (ms since epoch); the window counts from here. */
  since: number;
  onUndone?: () => void;
}) {
  const router = useRouter();
  const [, start] = useTransition();
  const [left, setLeft] = useState(() => Math.max(0, UNDO_SECONDS - Math.round((Date.now() - since) / 1000)));
  const [undone, setUndone] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setLeft(Math.max(0, UNDO_SECONDS - Math.round((Date.now() - since) / 1000))), 1000);
    return () => clearInterval(t);
  }, [since]);

  if (entryIds.length === 0 || (left === 0 && !undone)) return null;

  if (undone) {
    return (
      <p role="status" className="rounded-[10px] bg-chip px-3 py-2 text-footnote text-muted">
        Undone. Nothing from that dictation is on the record.
      </p>
    );
  }

  return (
    <div role="status" className="flex items-center gap-3 rounded-[10px] bg-accent/10 px-3 py-2 text-footnote">
      <span className="flex-1">
        Recorded{entryIds.length > 1 ? ` (${entryIds.length} entries)` : ""}. <span className="text-muted tabular-nums">{left}s</span>
      </span>
      <button
        type="button"
        onClick={() =>
          start(async () => {
            for (const id of entryIds) {
              const form = new FormData();
              form.set("entry_id", id);
              form.set("patient_id", patientId);
              await deleteEntry(form);
            }
            setUndone(true);
            onUndone?.();
            router.refresh();
          })
        }
        className="min-h-9 rounded-full bg-card px-3 font-semibold text-accent active:opacity-70"
      >
        Undo
      </button>
    </div>
  );
}
