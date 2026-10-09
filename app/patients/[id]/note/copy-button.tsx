"use client";

import { useCopy } from "../../../use-copy";

/** Puts the note on the clipboard as plain text, for pasting into WhatsApp or an EMR field
 *  that only takes text — the print button covers the paper copy, this covers everywhere else. */
export default function CopyNoteButton({ text }: { text: string }) {
  const [state, copy] = useCopy();

  return (
    <div className="print:hidden">
      <button
        type="button"
        onClick={() => copy(text)}
        className="w-full rounded-xl bg-accent px-4 py-3 text-center text-body font-semibold text-accent-ink active:opacity-70"
      >
        {state === "copied" ? "Copied" : "Copy as text"}
      </button>
      {state === "failed" && (
        <p className="mt-2 text-center text-footnote text-warn-fg">
          Could not copy automatically — select the text and copy it by hand.
        </p>
      )}
    </div>
  );
}
