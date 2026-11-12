"use client";

import { useEffect, type RefObject } from "react";

/**
 * Opens and closes a `<dialog>` as a modal to follow `open`. The dialog itself takes focus —
 * the browser would otherwise focus its first button, drawing a ring as if it were chosen.
 * `mounted` re-runs the effect once a portalled dialog has actually been attached.
 */
export function useModal(ref: RefObject<HTMLDialogElement | null>, open: boolean, mounted = true) {
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      d.showModal();
      d.focus();
    }
    if (!open && d.open) d.close();
  }, [ref, open, mounted]);
}
