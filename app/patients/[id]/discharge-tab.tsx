"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

/**
 * The discharge tab: one button, and the summary being written before it is pressed.
 *
 * Everything a discharge summary can be assembled from is already in the record, and the
 * deterministic half — diagnoses, procedures, medications, condition at discharge — has always
 * compiled itself the moment the workspace opened (lib/discharge-store.ts). The three sections
 * that need the model, though, were generated on arrival, which meant a resident who tapped
 * through to discharge a patient sat and watched three spinners before they had anything to
 * read.
 *
 * So the work starts here instead, when the tab is opened — the earliest honest signal that
 * this patient is going home. By the time the button is pressed the cards are usually filled,
 * and the workspace, which only generates a section that is both empty and never generated,
 * finds them already written and opens straight onto them.
 *
 * Two things this deliberately does NOT do. It does not run on the patient page itself — only
 * on a tab someone chose to open, because starting a model on every glance at a patient would
 * bill a ward round for discharges nobody is writing. And it does not approve anything: every
 * section it fills lands unapproved, and the completeness checks still refuse to finalise a
 * summary until a resident has read each one (lib/discharge-checks.ts). Written early is not
 * the same as agreed to.
 */
export default function DischargeTab({
  patientId,
  patientName,
  status,
}: {
  patientId: string;
  patientName: string;
  status: "draft" | "finalised" | null;
}) {
  // Only a summary nobody has begun is worth warming: once a row exists, the sections are
  // either written or deliberately left alone, and re-running the model over a resident's own
  // edits is the one thing this must never do.
  const shouldWarm = status === null;
  const [warming, setWarming] = useState(shouldWarm);
  const [ready, setReady] = useState(false);
  const started = useRef(false);

  useEffect(() => {
    if (!shouldWarm || started.current) return;
    started.current = true;

    const cancelled = { current: false };
    (async () => {
      try {
        const res = await fetch(`/api/patients/${patientId}/discharge/generate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ section: "all" }),
        });
        if (!cancelled.current) setReady(res.ok);
      } catch {
        // A failed warm-up is not an error worth showing: the workspace generates on arrival
        // exactly as it did before, so the only thing lost is the head start.
      } finally {
        if (!cancelled.current) setWarming(false);
      }
    })();

    return () => {
      cancelled.current = true;
    };
  }, [patientId, shouldWarm]);

  const label =
    status === "finalised"
      ? "Open discharge summary"
      : status === "draft"
        ? "Continue discharge"
        : "Start discharge";

  return (
    <section className="px-4 pb-6">
      <p className="ios-group-header mb-2 px-4">Discharge</p>
      <div className="ios-group px-4 py-4">
        <p className="text-[15px] leading-snug">
          Compiled from {patientName}&rsquo;s record. The cards arrive filled — diagnoses,
          procedures, medications and condition at discharge from what was recorded, and the
          clinical course drafted for you to read.
        </p>
        <p className="mt-2 text-[13px] text-muted">
          Nothing is approved until you approve it, section by section, and reading in the paper
          file is a step inside the summary.
        </p>

        <Link
          href={`/patients/${patientId}/discharge`}
          className="mt-4 flex w-full items-center justify-center rounded-[10px] bg-accent px-4 py-3 text-[17px] font-semibold text-accent-ink active:opacity-80"
        >
          {label}
        </Link>

        {/* Said plainly, because a resident who taps straight through deserves to know whether
            they are about to wait. Silent once there is nothing left to say. */}
        {warming && (
          <p className="mt-2 text-center text-[13px] text-muted">Writing the first draft…</p>
        )}
        {!warming && ready && (
          <p className="mt-2 text-center text-[13px] text-muted">
            First draft ready — nothing approved yet.
          </p>
        )}
      </div>
    </section>
  );
}
