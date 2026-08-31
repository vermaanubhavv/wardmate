import Link from "next/link";

/**
 * The discharge, folded away until wanted — the last thing on a screen used many times a day
 * for something else. It no longer carries a pre-formatted brief: the discharge summary is a
 * structured record now (protocol v1.0), reviewed and approved in its own workspace.
 */
export default function DischargeSection({
  status,
  patientName,
  patientId,
}: {
  status: "draft" | "finalised" | null;
  patientName: string;
  patientId: string;
}) {
  const statusLabel =
    status === "finalised" ? "Finalised" : status === "draft" ? "Draft in progress" : "Not started";

  return (
    <details className="ios-group">
      <summary className="flex cursor-pointer items-center justify-between px-4 py-3 text-[17px] font-medium">
        <span>Discharge</span>
        <span className="text-[13px] font-normal text-muted">{statusLabel}</span>
      </summary>

      <div className="border-t border-line px-4 py-4">
        <p className="text-[13px] text-muted">
          Compiled from {patientName}&rsquo;s record. Walk the cards one section at a time,
          generate and approve the Clinical Course and investigations, then finalise. Reading
          in the paper file is a step inside the summary.
        </p>

        {/* One action. There is no separate "Prepare discharge" button here — a discharge is
            one thing, reached one way. */}
        <Link
          href={`/patients/${patientId}/discharge`}
          className="mt-3 flex w-full items-center justify-center rounded-[10px] bg-accent px-4 py-3 text-[17px] font-semibold text-accent-ink"
        >
          {status === "finalised"
            ? "Open discharge summary"
            : status === "draft"
              ? "Continue discharge summary"
              : "Start discharge summary"}
        </Link>
      </div>
    </details>
  );
}
