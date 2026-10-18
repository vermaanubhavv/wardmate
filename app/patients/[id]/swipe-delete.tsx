"use client";

import { useRef, useState, useTransition } from "react";
import { ActionSheet } from "../../action-sheet";
import { deleteTasks } from "./actions";

const SWIPE_COMMIT = 96; // px past which a release asks to delete — same as the confirm queue

/**
 * A to-do row that swipes right to delete. Deleting is not ticking off: the job leaves the
 * record (every saying of it, so a repeat does not resurface), which is why it asks first.
 */
export default function SwipeDelete({
  ids,
  patientId,
  label,
  className,
  children,
}: {
  ids: string[];
  patientId: string;
  label: string;
  className: string;
  children: React.ReactNode;
}) {
  const [dx, setDx] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [ask, setAsk] = useState(false);
  const [gone, setGone] = useState(false);
  const [, startTransition] = useTransition();
  const startX = useRef<number | null>(null);
  // A drag that ends over the tick must not also tick the job off.
  const dragged = useRef(false);

  function end() {
    if (startX.current === null) return;
    dragged.current = dx > 4;
    if (dx >= SWIPE_COMMIT) setAsk(true);
    startX.current = null;
    setDragging(false);
    setDx(0);
  }

  if (gone) return null;

  return (
    <li className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 flex items-center bg-critical-bg px-5 text-footnote font-semibold text-critical-fg">
        Delete
      </div>
      <div
        onPointerDown={(e) => {
          startX.current = e.clientX;
          setDragging(true);
        }}
        onPointerMove={(e) => {
          if (startX.current !== null) setDx(Math.max(0, e.clientX - startX.current));
        }}
        onPointerUp={end}
        onPointerCancel={end}
        onPointerLeave={end}
        onClickCapture={(e) => {
          if (dragged.current) {
            e.preventDefault();
            e.stopPropagation();
            dragged.current = false;
          }
        }}
        className={"relative bg-card touch-pan-y " + className}
        style={{ transform: `translateX(${dx}px)`, transition: dragging ? "none" : "transform 0.18s ease-out" }}
      >
        {children}
      </div>

      <ActionSheet
        open={ask}
        title="Delete this to-do?"
        message={`“${label}” is removed from the list and the record. The recording it came from is kept.`}
        action="Delete"
        onCancel={() => setAsk(false)}
        onConfirm={() => {
          setAsk(false);
          setGone(true);
          startTransition(() => deleteTasks(patientId, ids));
        }}
      />
    </li>
  );
}
