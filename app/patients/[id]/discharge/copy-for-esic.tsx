"use client";

import { useState } from "react";
import type { EsicPayload } from "@/lib/esic-payload";

/**
 * Hands the discharge medications to the browser extension that fills the hospital's
 * prescribing form, by way of the clipboard.
 *
 * The clipboard rather than a direct connection on purpose: it needs no shared login between
 * WardMate and the hospital system, no key stored anywhere, and no server of ours ever talking
 * to theirs. The resident copies here and pastes there — the same two steps they would take
 * with any other text, and every one of them visible.
 */
export default function CopyForEsic({ payload }: { payload: EsicPayload }) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");

  const mapped = payload.medications.filter((m) => m.formulary).length;
  const total = payload.medications.length;

  async function copy() {
    try {
      await navigator.clipboard.writeText(JSON.stringify(payload));
      setState("copied");
    } catch {
      setState("failed");
    }
    setTimeout(() => setState("idle"), 2500);
  }

  return (
    <div className="print:hidden">
      <button
        type="button"
        onClick={copy}
        className="w-full rounded-xl bg-card px-4 py-3 text-center text-[17px] font-semibold text-accent active:opacity-70"
      >
        {state === "copied" ? "Copied" : "Copy for hospital system"}
      </button>

      {/* Said before it is pasted, not discovered afterwards: an unlinked drug cannot be filled
          automatically, and a shorter prescription arriving silently is the failure this
          whole feature has to avoid. */}
      {mapped < total && (
        <p className="mt-2 text-center text-[13px] text-orange-700">
          {total - mapped} of {total} not linked to the formulary — those stay for you to enter.
        </p>
      )}
      {state === "failed" && (
        <p className="mt-2 text-center text-[13px] text-orange-700">
          Could not copy automatically.
        </p>
      )}
    </div>
  );
}
