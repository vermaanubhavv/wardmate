"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { proofreadDischargeAction } from "./actions";

/**
 * Print, with Sonnet's proofread (lib/final-check.ts) started the moment the sheet opens, so it
 * runs while the resident reads rather than after they press Print. Its fixes refresh into the
 * sheet when they land; Print waits only for whatever is left of it. If the check fails or times
 * out, it prints what is there.
 */
export default function DischargePrintButton({ patientId }: { patientId: string }) {
  const router = useRouter();
  const started = useRef(false);
  const [checking, setChecking] = useState(true);
  const [refreshing, startRefresh] = useTransition();
  const printWhenReady = useRef(false);
  const [waiting, setWaiting] = useState(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    proofreadDischargeAction(patientId)
      .catch(() => ({ changed: false }))
      .then(({ changed }) => {
        setChecking(false);
        if (changed) startRefresh(() => router.refresh());
      });
  }, [patientId, router]);

  // window.print() only once the proofread sheet has rendered.
  useEffect(() => {
    if (printWhenReady.current && !checking && !refreshing) {
      printWhenReady.current = false;
      window.print();
    }
  }, [checking, refreshing]);

  function onPrint() {
    if (!checking && !refreshing) return window.print();
    printWhenReady.current = true;
    setWaiting(true);
  }

  const busy = waiting && (checking || refreshing);
  return (
    <button
      type="button"
      onClick={onPrint}
      disabled={busy}
      className="w-full rounded-xl bg-card px-4 py-3 text-center text-body font-semibold text-accent active:opacity-70 disabled:opacity-60 print:hidden"
    >
      {busy ? "Checking the summary…" : "Print"}
    </button>
  );
}
