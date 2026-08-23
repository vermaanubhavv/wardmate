"use client";

import { useState } from "react";

/** Puts the note on the clipboard as plain text, for pasting into WhatsApp or an EMR field
 *  that only takes text — the print button covers the paper copy, this covers everywhere else. */
export default function CopyNoteButton({ text }: { text: string }) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setState("copied");
    } catch {
      setState("failed");
    }
    setTimeout(() => setState("idle"), 2000);
  }

  return (
    <div className="print:hidden">
      <button
        type="button"
        onClick={copy}
        className="w-full rounded-xl bg-card px-4 py-3 text-center text-[17px] font-semibold text-accent active:opacity-70"
      >
        {state === "copied" ? "Copied" : "Copy as text"}
      </button>
      {state === "failed" && (
        <p className="mt-2 text-center text-[13px] text-orange-700">
          Could not copy automatically — select the text and copy it by hand.
        </p>
      )}
    </div>
  );
}
