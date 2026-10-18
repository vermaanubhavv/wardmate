"use client";

import { useEffect, useOptimistic, useRef, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { Check } from "lucide-react";
import { setUrgency } from "./actions";
import { effectiveUrgency, URGENCY_META, type Urgency } from "@/lib/urgency";

/**
 * The colour of a job, and the one control that sets it, the same everywhere a job is shown.
 *
 * A tap opens three named choices — Now, Soon, Has time — rather than cycling colours: a
 * cycle meant tapping past the colour you wanted to get back to it, and nothing on screen said
 * what a colour meant. Ungraded is an empty dashed ring, because "nobody has decided how
 * urgent this is" must not look like a decision; it is the state a job lands in whenever the
 * resident gave no timeframe. "Not graded" is offered once a job has a grade, so a mistaken
 * one can be taken back.
 *
 * The dot changes the instant a choice is tapped, before the server has heard about it. If the
 * write fails, the refresh puts the old colour back.
 */
const CHOICES: Exclude<Urgency, null>[] = ["red", "yellow", "green"];

export default function UrgencyDot({
  observationId,
  patientId,
  urgency,
  gradedAt,
  recordedAt,
}: {
  observationId: string;
  patientId: string;
  urgency: Urgency;
  gradedAt: string | null;
  recordedAt: string;
}) {
  // What the colour means today. A "tomorrow" job read the next morning shows red, without
  // anything having been written back to it.
  const effective = effectiveUrgency({ urgency, graded_at: gradedAt, recorded_at: recordedAt });

  const [shown, setShown] = useOptimistic<Urgency>(effective.urgency);
  const [, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [at, setAt] = useState<{ top: number; left: number } | null>(null);
  const button = useRef<HTMLButtonElement | null>(null);
  const meta = shown ? URGENCY_META[shown] : null;
  // The escalation note ("2 days overdue") only makes sense until the resident re-grades it.
  const note = shown === effective.urgency ? effective.note : null;

  // Placed by hand on <body>: rows sit in rounded groups that clip anything hanging out of
  // them. Any scroll or resize closes it rather than leaving it stranded.
  useEffect(() => {
    if (!open) return;
    const r = button.current?.getBoundingClientRect();
    if (r) setAt({ top: r.bottom + 4, left: Math.max(8, Math.min(r.left - 8, window.innerWidth - 228)) });
    const close = () => setOpen(false);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [open]);

  function choose(value: Urgency) {
    setOpen(false);
    if (value === shown) return;
    startTransition(async () => {
      setShown(value);
      await setUrgency(observationId, patientId, value);
    });
  }

  return (
    <>
      <button
        ref={button}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={
          meta ? `Urgency: ${meta.label}${note ? `, ${note}` : ""}. Change.` : "Not graded. Set urgency."
        }
        // Padding rather than a bigger dot: a 44pt target without the colour shouting louder
        // than the job it belongs to.
        className="-m-3 grid h-11 w-11 shrink-0 place-items-center active:opacity-60"
      >
        {meta ? (
          <span className={"block h-3 w-3 rounded-full " + meta.dot} />
        ) : (
          <span className="block h-3 w-3 rounded-full border-[1.5px] border-dashed border-muted" />
        )}
      </button>

      {open &&
        at &&
        createPortal(
          <>
            {/* A tap anywhere else closes it. */}
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-hidden />
            <div
              role="menu"
              aria-label="Urgency"
              className="fixed z-50 w-[220px] overflow-hidden rounded-[12px] bg-card shadow-xl ring-1 ring-black/5"
              style={{ top: at.top, left: at.left }}
            >
              {CHOICES.map((u) => (
                <button
                  key={u}
                  type="button"
                  role="menuitemradio"
                  aria-checked={shown === u}
                  onClick={() => choose(u)}
                  className="flex min-h-11 w-full items-center gap-3 border-b border-line/60 px-3.5 text-left active:bg-chip"
                >
                  <span className={"h-3 w-3 shrink-0 rounded-full " + URGENCY_META[u].dot} />
                  <span className="flex-1">
                    <span className="block text-body">{URGENCY_META[u].label}</span>
                    <span className="block text-caption text-muted">{URGENCY_META[u].meaning}</span>
                  </span>
                  {shown === u && <Check className="h-4 w-4 text-accent" strokeWidth={2.6} />}
                </button>
              ))}
              {shown !== null && (
                <button
                  type="button"
                  role="menuitemradio"
                  aria-checked={false}
                  onClick={() => choose(null)}
                  className="flex min-h-11 w-full items-center gap-3 px-3.5 text-left text-subhead text-muted active:bg-chip"
                >
                  <span className="h-3 w-3 shrink-0 rounded-full border-[1.5px] border-dashed border-muted" />
                  Not graded
                </button>
              )}
            </div>
          </>,
          document.body
        )}
    </>
  );
}
