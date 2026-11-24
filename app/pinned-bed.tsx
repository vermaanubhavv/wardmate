"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

export type RoundBed = { bed: string; name: string; detail: string };

/**
 * "Now at" on the round recording sheet (behind NEXT_PUBLIC_PINNED_BED_ROUND). Tap the bed you
 * are standing at, or step with the arrows, and what you say next is filed to that bed without
 * saying its number. Nothing is pinned until a bed is tapped, so a resident who says the bed
 * numbers aloud is not changed at all.
 */
export default function PinnedBed({
  beds,
  pinned,
  onPin,
}: {
  beds: RoundBed[];
  pinned: number | null;
  onPin: (index: number) => void;
}) {
  if (beds.length === 0) return null;
  const now = pinned === null ? null : beds[pinned];

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-1.5 overflow-x-auto pb-1" role="listbox" aria-label="Bed you are at">
        {beds.map((b, i) => (
          <button
            key={`${b.bed}-${i}`}
            type="button"
            role="option"
            aria-selected={i === pinned}
            onClick={() => onPin(i)}
            className={
              "min-h-9 shrink-0 rounded-[8px] px-2.5 font-mono text-footnote " +
              (i === pinned ? "bg-accent text-accent-ink" : "bg-chip text-muted")
            }
          >
            {b.bed}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 rounded-[10px] border border-line px-2 py-2">
        <button
          type="button"
          aria-label="Previous bed"
          disabled={pinned === null || pinned === 0}
          onClick={() => pinned !== null && onPin(pinned - 1)}
          className="grid h-11 w-11 shrink-0 place-items-center text-accent disabled:opacity-30"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="min-w-0 flex-1 text-center" aria-live="polite">
          {now ? (
            <>
              <p className="text-caption text-accent">Now at bed {now.bed}</p>
              <p className="truncate text-body font-medium">{now.name}</p>
              {now.detail && <p className="text-caption text-muted">{now.detail}</p>}
            </>
          ) : (
            <p className="text-footnote text-muted">Tap the bed you are at, or say its number.</p>
          )}
        </div>
        <button
          type="button"
          aria-label="Next bed"
          disabled={pinned === beds.length - 1}
          onClick={() => onPin(pinned === null ? 0 : pinned + 1)}
          className="grid h-11 w-11 shrink-0 place-items-center text-accent disabled:opacity-30"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
