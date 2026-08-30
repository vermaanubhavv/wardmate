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
          Compiled from {patientName}&rsquo;s record. Check every section, generate and approve
          the Clinical Course and investigations, then finalise — the AI parts cannot be
          finalised without your approval.
        </p>

        <Link
          href={`/patients/${patientId}/prepare-discharge`}
          className="mt-3 flex w-full flex-col items-center rounded-[10px] border border-line px-4 py-3"
        >
          <span className="text-[15px] font-semibold">Prepare discharge</span>
          <span className="text-[13px] text-muted">Photograph the papers and read them in first</span>
        </Link>

        <Link
          href={`/patients/${patientId}/discharge`}
          className="mt-3 flex w-full items-center justify-center rounded-[10px] bg-accent px-4 py-3 text-[17px] font-semibold text-accent-ink"
        >
          {status ? "Open discharge summary" : "Start discharge summary"}
        </Link>

        {status === "finalised" && (
          <Link
            href={`/patients/${patientId}/discharge/print`}
            className="mt-3 flex w-full items-center justify-center rounded-[10px] border border-line px-4 py-3 text-[17px] font-semibold"
          >
            Print / download
          </Link>
        )}
      </div>
    </details>
  );
}
