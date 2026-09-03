"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { markRoutineRound } from "./actions";

/**
 * One tap that fills every un-covered core checklist item with its normal wording — for the
 * stable patient who needs a note but no changes. What it wrote is shown immediately in the
 * SOAP below and on the printable sheet; nothing is hidden, and anything already recorded
 * today is left alone.
 */
export default function RoutineRoundButton({ patientId }: { patientId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  function run() {
    setMessage(null);
    startTransition(async () => {
      const res = await markRoutineRound(patientId);
      if (!res.ok) {
        setMessage(res.error ?? "Could not fill the round.");
        return;
      }
      setMessage(
        res.filled === 0
          ? "Everything was already recorded today."
          : `Filled ${res.filled} routine ${res.filled === 1 ? "line" : "lines"} — check the SOAP below.`
      );
      router.refresh();
    });
  }

  return (
    <div className="mb-2 px-4">
      <button
        type="button"
        onClick={run}
        disabled={pending}
        className="rounded-[10px] border border-line bg-card px-3 py-1.5 text-[13px] font-semibold text-accent active:opacity-60 disabled:opacity-50"
      >
        {pending ? "Filling…" : "Routine round — fill normals"}
      </button>
      {message && <p className="mt-1 text-[13px] text-muted">{message}</p>}
    </div>
  );
}
