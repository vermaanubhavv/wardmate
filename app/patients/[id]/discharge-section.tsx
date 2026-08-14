"use client";

import { useState } from "react";

/**
 * The discharge brief, folded away until it is wanted.
 *
 * Closed by default because it is the last thing on a screen used many times a day for
 * something else, and it should not push the record further from the thumb on every round.
 */
export default function DischargeSection({
  brief,
  patientName,
}: {
  brief: string;
  patientName: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(brief);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <details className="rounded-xl border border-line bg-card">
      <summary className="cursor-pointer px-4 py-3 text-sm font-medium">Discharge</summary>

      <div className="border-t border-line px-4 py-4">
        <p className="text-xs text-muted">
          Assembled from what is on {patientName}&rsquo;s record — nothing here is written by
          the app. Anything never recorded says so, rather than being filled in.
        </p>

        <pre className="mt-3 overflow-x-auto whitespace-pre-wrap rounded-lg bg-background p-3 text-xs leading-relaxed">
          {brief}
        </pre>

        <button
          type="button"
          onClick={copy}
          className="mt-3 w-full rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-slate-900"
        >
          {copied ? "Copied" : "Copy discharge brief"}
        </button>

        <p className="mt-2 text-center text-xs text-muted">
          A starting point to correct — not a signed summary.
        </p>
      </div>
    </details>
  );
}
