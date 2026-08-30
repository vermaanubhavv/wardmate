import Link from "next/link";
import { notFound } from "next/navigation";
import { getDischargeContext } from "@/lib/discharge-data";
import { mergeDischargeDraft } from "@/lib/discharge-store";
import { buildDischargeDocument, formatDischargePlainText } from "@/lib/discharge-render";
import { buildEsicPayload } from "@/lib/esic-payload";
import { stripPatientHonorific } from "@/lib/patients";
import PrintButton from "../../note/print-button";
import CopyNoteButton from "../../note/copy-button";
import DownloadWordButton from "../download-word-button";
import CopyForEsic from "../copy-for-esic";
import DischargeSheet from "../sheet";

/**
 * The printable discharge summary, in the protocol's section order and generic NABH/ABDM
 * terminology — built from the same structured draft the workspace edits, so the paper and the
 * screen can never disagree. A draft prints too (with an "unapproved" marker on the AI
 * sections); a finalised one prints clean.
 */
export default async function DischargePrintPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const context = await getDischargeContext(id);
  if (!context) notFound();

  const draft = mergeDischargeDraft(context);
  const doc = buildDischargeDocument(draft, context);
  const plainText = formatDischargePlainText(doc);
  const esicPayload = buildEsicPayload(
    draft.medications,
    stripPatientHonorific(context.patient.display_name),
    context.patient.uhid_ip_no,
    context.formularyMappings
  );

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col bg-background print:max-w-none print:bg-white">
      <header className="px-4 pb-3 pt-6 print:hidden">
        <Link href={`/patients/${id}/discharge`} className="text-[17px] text-accent">
          ‹ Discharge workspace
        </Link>
        <h1 className="mt-3 ios-large-title">Discharge summary</h1>
        <p className="mt-1 text-[15px] text-muted">
          {doc.status === "finalised"
            ? "Finalised."
            : "Draft — the AI sections are marked where they have not been approved."}
        </p>
      </header>

      <DischargeSheet doc={doc} wardId={context.wardId} patientId={id} formularyAvailable={context.formularySize > 0} />

      <section className="flex flex-col gap-2 px-4 pb-10 print:hidden">
        <PrintButton />
        <DownloadWordButton patientId={id} />
        {context.formularySize > 0 && <CopyForEsic payload={esicPayload} />}
        <CopyNoteButton text={plainText} />
      </section>
    </div>
  );
}
