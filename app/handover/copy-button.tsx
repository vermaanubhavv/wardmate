"use client";

import { useEffect, useRef, useState } from "react";
import BottomBar from "../bottom-bar";

/**
 * The generated update, editable before it goes anywhere — the original ask was for "an
 * editable form... that can be copied and sent," not a fixed message. `value` starts as
 * `text` (lib/handover.ts's formatHandoverText) and diverges the moment a resident types;
 * Copy always reads the current textarea contents, never the original generated string.
 * Nothing here is sent by the app itself — pasting into WhatsApp is still a manual step.
 *
 * Copy lives in a bar pinned to the bottom so it is one tap from anywhere in a 20-card list.
 * Edits are kept in sessionStorage under `draftKey` (ward + day), because every card above is
 * a link and checking a detail on a patient used to throw the edits away.
 */
export default function CopyHandoverButton({ text, draftKey }: { text: string; draftKey: string }) {
  const [value, setValue] = useState(text);
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  const textRef = useRef<HTMLTextAreaElement>(null);

  // Restored after mount: sessionStorage doesn't exist on the server render.
  useEffect(() => {
    try {
      const draft = sessionStorage.getItem(draftKey);
      // One read of an outside store on mount, not a render loop.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (draft !== null) setValue(draft);
    } catch {}
  }, [draftKey]);

  function edit(next: string) {
    setValue(next);
    try {
      if (next === text) sessionStorage.removeItem(draftKey);
      else sessionStorage.setItem(draftKey, next);
    } catch {}
  }

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
    <div className="pt-4">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-footnote font-medium text-muted">Ready to send</p>
        {value !== text && (
          <button
            type="button"
            onClick={() => edit(text)}
            className="min-h-11 px-2 text-footnote text-accent active:opacity-70"
          >
            Reset to generated
          </button>
        )}
      </div>
      <textarea
        ref={textRef}
        value={value}
        onChange={(e) => edit(e.target.value)}
        rows={14}
        className="w-full rounded-[10px] border border-line bg-card p-3 text-subhead leading-relaxed text-foreground"
      />

      <BottomBar>
        {state === "failed" && (
          <p className="text-center text-footnote text-warn-fg">
            Could not copy automatically — select the text in Preview and copy it by hand.
          </p>
        )}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => textRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })}
            className="rounded-xl bg-card px-5 py-4 text-body font-semibold text-accent active:opacity-70"
          >
            Preview
          </button>
          <button
            type="button"
            onClick={copy}
            className="flex-1 rounded-xl bg-accent px-4 py-4 text-center text-body font-semibold text-accent-ink active:opacity-70"
          >
            {state === "copied" ? "Copied" : "Copy for WhatsApp"}
          </button>
        </div>
      </BottomBar>
    </div>
  );
}
