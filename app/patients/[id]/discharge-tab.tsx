"use client";

import Link from "next/link";

/**
 * The discharge tab: one button.
 *
 * The AI first draft is NOT started here. It used to warm up the moment this tab was opened,
 * which drafted the summary from whatever was on the record at that glance — often before the
 * clinical history was written — and then kept that draft. Now nothing is drafted until the
 * resident presses "Start discharge": the workspace then reads the whole stay — the clinical
 * history and every day's progress notes — and only then asks the model
 * (app/patients/[id]/discharge/discharge-workspace.tsx).
 */
export default function DischargeTab({
  patientId,
  patientName,
  status,
}: {
  patientId: string;
  patientName: string;
  /** "prepared": an AI first draft exists but no one has edited, approved or finalised
   *  anything — so it is not "Continue" yet. */
  status: "draft" | "finalised" | "prepared" | null;
}) {
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
        <p className="text-subhead leading-snug">
          Compiled from {patientName}&rsquo;s record. The cards arrive filled — diagnoses,
          procedures, medications and condition at discharge from what was recorded, and the
          clinical course drafted for you to read.
        </p>
        <p className="mt-2 text-footnote text-muted">
          Nothing is approved until you approve it, section by section, and reading in the paper
          file is a step inside the summary.
        </p>

        <Link
          href={`/patients/${patientId}/discharge`}
          className="mt-4 flex w-full items-center justify-center rounded-[10px] bg-accent px-4 py-3 text-body font-semibold text-accent-ink active:opacity-80"
        >
          {label}
        </Link>
      </div>
    </section>
  );
}
