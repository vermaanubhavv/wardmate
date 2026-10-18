"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Check, ChevronDown } from "lucide-react";
import { switchWard } from "../unit/actions";

/**
 * The unit's name as the screen's title, and the way to change unit from it.
 *
 * Residents rotate between units; switching used to mean opening settings and scrolling to a
 * list at the bottom. The title is where you look to see which unit you are on, so it is also
 * where you change it. With one unit there is nothing to switch to, and the title is plain.
 */
export default function UnitSwitcher({
  current,
  units,
}: {
  current: { id: string; name: string };
  units: { id: string; name: string }[];
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDialogElement | null>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      d.showModal();
      // The browser focuses the first button when a dialog opens, which draws a ring around
      // the first unit as if it were already chosen. The sheet itself takes focus instead.
      d.focus();
    }
    if (!open && d.open) d.close();
  }, [open]);

  const title = <h1 className="ios-large-title truncate text-title1">{current.name}</h1>;
  if (units.length < 2) return title;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-label={`${current.name}. Switch unit`}
        className="-ml-0.5 flex max-w-full items-center gap-1 rounded-md text-left active:opacity-60"
      >
        {title}
        <ChevronDown className="mt-1 h-5 w-5 shrink-0 text-accent" strokeWidth={2.6} aria-hidden />
      </button>

      {typeof document !== "undefined" &&
        createPortal(
          <dialog
            ref={ref}
            onClose={() => setOpen(false)}
            onClick={(e) => {
              // A tap on the dimmed page behind the sheet closes it.
              if (e.target === ref.current) setOpen(false);
            }}
            aria-label="Your units"
            tabIndex={-1}
            // The sheet takes focus only so no button does; it is not a control and gets no ring.
            // Inline, because the app's one focus ring is unlayered and outranks a utility class.
            style={{ outline: "none" }}
            className="bottom-bar fixed inset-x-0 bottom-0 top-auto m-0 mx-auto w-full max-w-md bg-transparent p-2 backdrop:bg-black/40 open:flex open:flex-col open:gap-2"
          >
            <div className="ios-group">
              <p className="px-4 pb-2 pt-3 text-center text-footnote font-semibold text-muted">
                Your units
              </p>
              <ul>
                {units.map((u) => (
                  <li key={u.id} className="border-t border-line/60">
                    <form action={switchWard}>
                      <input type="hidden" name="ward_id" value={u.id} />
                      <button
                        className="flex min-h-12 w-full items-center gap-3 px-4 text-left text-body active:bg-chip"
                        aria-current={u.id === current.id ? "true" : undefined}
                      >
                        <span className="flex-1 truncate">{u.name}</span>
                        {u.id === current.id && <Check className="h-5 w-5 text-accent" strokeWidth={2.6} aria-hidden />}
                      </button>
                    </form>
                  </li>
                ))}
              </ul>
              <Link
                href="/unit"
                className="flex min-h-12 items-center border-t border-line/60 px-4 text-body text-accent active:bg-chip"
              >
                Unit settings
              </Link>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="ios-group min-h-12 w-full text-body font-semibold text-accent active:opacity-70"
            >
              Cancel
            </button>
          </dialog>,
          document.body
        )}
    </>
  );
}
