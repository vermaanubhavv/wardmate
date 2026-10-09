"use client";

import { useCopy } from "../use-copy";

/** The unit's code, big enough to read aloud across a ward. */
export default function CodeBox({ code }: { code: string }) {
  const [state, copy] = useCopy();

  return (
    <button
      type="button"
      onClick={() => copy(code)}
      className="w-full ios-group px-4 py-4 text-center active:opacity-70"
    >
      <span className="block font-mono text-2xl tracking-[0.3em]">{code}</span>
      <span className="mt-1 block text-footnote text-muted">
        {state === "copied" ? "Copied" : "Tap to copy"}
      </span>
    </button>
  );
}
