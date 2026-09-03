import Link from "next/link";
import { notFound } from "next/navigation";
import { getDischargeContext } from "@/lib/discharge-data";
import { mergeDischargeDraft } from "@/lib/discharge-store";
import { buildCheckContext } from "@/lib/discharge-checks";
import { stripPatientHonorific } from "@/lib/patients";
import DischargeWorkspace from "./discharge-workspace";

/**
 * The discharge workspace — the resident's review-and-approve surface for the structured
 * discharge summary (protocol v1.0).
 *
 * Every section arrives COMPILED from the record (lib/discharge-compile.ts) unless the resident
 * has already saved an edited version. The two AI sections — Clinical Course and Relevant
 * Investigations — are generated on demand and must be approved before the summary can be
 * finalised. Nothing here is written by the app without the resident's sign-off.
 */
export default async function DischargeWorkspacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const context = await getDischargeContext(id);
  if (!context) notFound();

  const draft = mergeDischargeDraft(context);
  const checkContext = buildCheckContext(context);

  // Enough on the record for the AI to write something worth reviewing. Below this, the
  // workspace shows the manual "Generate" buttons instead of auto-compiling — a near-empty
  // record would only produce a near-empty draft, and the API call would be wasted.
  const aiReady = context.observations.length >= 4;

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
      {/* Deliberately slim: the workspace card leads with the current section as its own
          headline, so a big "Discharge summary" title here would just compete with it. */}
      <header className="flex items-baseline justify-between gap-3 px-4 pb-3 pt-6">
        <Link href={`/patients/${id}`} className="text-[17px] text-accent">
          ‹ Patient
        </Link>
        <p className="truncate text-[13px] text-muted">
          Discharge · {stripPatientHonorific(context.patient.display_name)}
          {context.patient.bed ? ` · bed ${context.patient.bed}` : ""}
        </p>
      </header>

      <DischargeWorkspace
        patientId={id}
        initialDraft={draft}
        checkContext={checkContext}
        wardId={context.wardId}
        formularyAvailable={context.formularySize > 0}
        aiReady={aiReady}
      />
    </div>
  );
}
