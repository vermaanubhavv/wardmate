"use client";

import { useState } from "react";

/** Puts the handover text on the clipboard so it can be pasted straight into the unit's
 *  WhatsApp handover message, which is how this actually gets used at end of round. */
export default function CopyHandoverButton({ text }: { text: string }) {
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
    <div>
      <button
        type="button"
        onClick={copy}
        className="w-full rounded-xl bg-accent px-4 py-4 text-center text-base font-semibold text-accent-ink active:opacity-70"
      >
        {state === "copied" ? "Copied" : "Copy for WhatsApp"}
      </button>
      {state === "failed" && (
        <p className="mt-2 text-center text-xs text-amber-700">
          Could not copy automatically — select the text above and copy it by hand.
        </p>
      )}
    </div>
  );
}
