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

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
      <header className="px-4 pb-3 pt-6">
        <Link href={`/patients/${id}`} className="text-[17px] text-accent">
          ‹ Patient
        </Link>
        <h1 className="mt-3 ios-large-title">Discharge summary</h1>
        <p className="mt-1 text-[15px] text-muted">
          {stripPatientHonorific(context.patient.display_name)}
          {context.patient.bed ? ` · bed ${context.patient.bed}` : ""}. Compiled from the record —
          one card per section: confirm or edit, then Next. Approve the AI parts, then finalise.
        </p>
      </header>

      <DischargeWorkspace
        patientId={id}
        initialDraft={draft}
        checkContext={checkContext}
        wardId={context.wardId}
        formularyAvailable={context.formularySize > 0}
      />
    </div>
  );
}
