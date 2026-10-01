"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { proofreadDischargeAction } from "./actions";

/**
 * Print, with Sonnet's proofread first (lib/final-check.ts): the Clinical Course is re-framed and
 * the rest tidied, the page refreshes with the corrected text, and only then does the browser's
 * print dialog open. If the check fails or times out, it prints what is there.
 */
export default function DischargePrintButton({ patientId }: { patientId: string }) {
  const router = useRouter();
  const [checking, setChecking] = useState(false);
  const [refreshing, startRefresh] = useTransition();
  const printWhenReady = useRef(false);

  // window.print() only once the refreshed sheet has rendered.
  useEffect(() => {
    if (printWhenReady.current && !refreshing) {
      printWhenReady.current = false;
      window.print();
    }
  }, [refreshing]);

  async function onPrint() {
    setChecking(true);
    const { changed } = await proofreadDischargeAction(patientId).catch(() => ({ changed: false }));
    setChecking(false);
    if (!changed) return window.print();
    printWhenReady.current = true;
    startRefresh(() => router.refresh());
  }

  const busy = checking || refreshing;
  return (
    <button
      type="button"
      onClick={() => void onPrint()}
      disabled={busy}
      className="w-full rounded-xl bg-card px-4 py-3 text-center text-body font-semibold text-accent active:opacity-70 disabled:opacity-60 print:hidden"
    >
      {busy ? "Checking the summary…" : "Print"}
    </button>
  );
}
