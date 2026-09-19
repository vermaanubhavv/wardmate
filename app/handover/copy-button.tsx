"use client";

import { useState } from "react";

/**
 * The generated update, editable before it goes anywhere — the original ask was for "an
 * editable form... that can be copied and sent," not a fixed message. `value` starts as
 * `text` (lib/handover.ts's formatHandoverText) and diverges the moment a resident types;
 * Copy always reads the current textarea contents, never the original generated string.
 * Nothing here is sent by the app itself — pasting into WhatsApp is still a manual step.
 */
export default function CopyHandoverButton({ text }: { text: string }) {
  const [value, setValue] = useState(text);
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setState("copied");
    } catch {
      setState("failed");
    }
    setTimeout(() => setState("idle"), 2000);
  }

  return (
    <div>
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={14}
        className="w-full rounded-[10px] border border-line bg-card p-3 text-[14px] leading-relaxed text-foreground"
      />
      <button
        type="button"
        onClick={copy}
        className="mt-3 w-full rounded-xl bg-accent px-4 py-4 text-center text-[17px] font-semibold text-accent-ink active:opacity-70"
      >
        {state === "copied" ? "Copied" : "Copy for WhatsApp"}
      </button>
      {state === "failed" && (
        <p className="mt-2 text-center text-[13px] text-orange-700">
          Could not copy automatically — select the text above and copy it by hand.
        </p>
      )}
    </div>
  );
}
