"use client";

import { useState } from "react";
import Link from "next/link";

/**
 * The discharge brief, folded away until it is wanted.
 *
 * Closed by default because it is the last thing on a screen used many times a day for
 * something else, and it should not push the record further from the thumb on every round.
 */
export default function DischargeSection({
  brief,
  patientName,
  patientId,
}: {
  brief: string;
  patientName: string;
  patientId: string;
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
    <details className="ios-group">
      <summary className="cursor-pointer px-4 py-3 text-[17px] font-medium">Discharge</summary>

      <div className="border-t border-line px-4 py-4">
        <p className="text-[13px] text-muted">
          Assembled from what is on {patientName}&rsquo;s record — nothing here is written by
          the app. Anything never recorded says so, rather than being filled in.
        </p>

        <pre className="mt-3 overflow-x-auto whitespace-pre-wrap rounded-lg bg-background p-3 text-xs leading-relaxed">
          {brief}
        </pre>

        <Link
          href={`/patients/${patientId}/discharge`}
          className="mt-3 flex w-full items-center justify-center rounded-[10px] border border-line px-4 py-3 text-[17px] font-semibold text-foreground"
        >
          Print discharge summary
        </Link>

        <button
          type="button"
          onClick={copy}
          className="mt-3 w-full rounded-[10px] bg-accent px-4 py-3 text-[17px] font-semibold text-accent-ink"
        >
          {copied ? "Copied" : "Copy discharge brief"}
        </button>

        <p className="mt-2 text-center text-[13px] text-muted">
          A starting point to correct — not a signed summary.
        </p>
      </div>
    </details>
  );
}
