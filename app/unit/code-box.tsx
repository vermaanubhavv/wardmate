"use client";

import { useState } from "react";

/** The unit's code, big enough to read aloud across a ward. */
export default function CodeBox({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="w-full rounded-xl border border-line bg-card px-4 py-4 text-center active:opacity-70"
    >
      <span className="block font-mono text-2xl tracking-[0.3em]">{code}</span>
      <span className="mt-1 block text-xs text-muted">
        {copied ? "Copied" : "Tap to copy"}
      </span>
    </button>
  );
}
