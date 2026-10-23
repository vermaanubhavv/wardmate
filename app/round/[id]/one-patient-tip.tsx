"use client";

import { useEffect, useSyncExternalStore } from "react";
import Link from "next/link";
import { track } from "@/lib/track";

const KEY = "wm.onePatientTip";
const SHOW_FOR = 3;

/**
 * One grey line under a single-patient round card: the mic on the patient's own page saves
 * straight to them, with no review step. Most real round dictations were one patient in a
 * dozen words, which the round button can only treat as "which bed was that?".
 *
 * Deliberately quiet — no colour, icon or button — because this screen's one job is the
 * patient choice above it. Shown on the first three such dictations per phone, then never
 * again; a reload of one it was already shown on still shows it. Browser storage is fine for
 * this: losing it only means the tip shows again.
 */
export default function OnePatientTip({ dictationId, patientId }: { dictationId: string; patientId: string }) {
  // Read at render (nothing on the server, so no hydration mismatch); recorded in the effect.
  const show = useSyncExternalStore(noSubscribe, () => shouldShow(dictationId), () => false);

  useEffect(() => {
    if (!show) return;
    try {
      const seen = readSeen();
      if (!seen.includes(dictationId)) localStorage.setItem(KEY, JSON.stringify([...seen, dictationId]));
    } catch {
      // Storage blocked (private mode): the tip simply shows again next time.
    }
  }, [show, dictationId]);

  if (!show) return null;
  return (
    <p className="mt-3 text-footnote text-muted">
      Only one patient? The mic on{" "}
      <Link
        href={`/patients/${patientId}`}
        onClick={() => track("round_one_patient_tip_opened")}
        className="underline decoration-line underline-offset-2"
      >
        their page
      </Link>{" "}
      saves straight to them.
    </p>
  );
}

const noSubscribe = () => () => {};

function readSeen(): string[] {
  const v: unknown = JSON.parse(localStorage.getItem(KEY) ?? "[]");
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
}

function shouldShow(dictationId: string): boolean {
  try {
    const seen = readSeen();
    return seen.includes(dictationId) || seen.length < SHOW_FOR;
  } catch {
    return false;
  }
}
