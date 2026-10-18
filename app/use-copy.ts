"use client";

import { useState } from "react";

export type CopyState = "idle" | "copied" | "failed";

/** Copies text to the clipboard and reports how it went, falling back to "idle" after `ms`. */
export function useCopy(ms = 2000): [CopyState, (text: string) => Promise<void>] {
  const [state, setState] = useState<CopyState>("idle");
  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setState("copied");
    } catch {
      setState("failed");
    }
    setTimeout(() => setState("idle"), ms);
  }
  return [state, copy];
}
