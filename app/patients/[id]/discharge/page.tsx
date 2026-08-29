import Link from "next/link";
import { notFound } from "next/navigation";
import { getDischargeContext } from "@/lib/discharge-data";
import { formatDischargeText, letterheadNamesUnit } from "@/lib/discharge";
import PrintButton from "../note/print-button";
import CopyNoteButton from "../note/copy-button";
import DownloadWordButton from "./download-word-button";
import DischargeSheet from "./sheet";
import CopyForEsic from "./copy-for-esic";
import { buildEsicPayload } from "@/lib/esic-payload";

/**
 * The discharge summary, laid out exactly the way the unit's own blank template is — logo, the
 * 3x3 identity table, one bordered box carrying diagnosis/history/condition at discharge
 * together, then page 2's investigation and advice tables. No doctor roster or OPD/OT schedule
 * — that varies ward to ward, so it is left off rather than guessed at or hardcoded to one
 * ward's own doctors. See lib/discharge.ts for what is assembled from the record versus the
 * two editable defaults (no-comorbidities, standard advice) the resident asked for explicitly.
 */
export default async function DischargeSummaryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const context = await getDischargeContext(id);
  if (!context) notFound();
  const { note, wardId, formularySize } = context;

  const noteText = formatDischargeText(note);
  const esicPayload = buildEsicPayload(note);

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col bg-background print:max-w-none print:bg-white">
      <header className="px-4 pb-3 pt-6 print:hidden">
        <Link href={`/patients/${id}`} className="text-[17px] text-accent">
          ‹ Patient
        </Link>
        <h1 className="mt-3 ios-large-title">Discharge summary</h1>
        <p className="mt-1 text-[15px] text-muted">
          Matches the unit&rsquo;s own template. The comorbidities line and the discharge
          medications are editable defaults where nothing was actually recorded — check both
          before signing.
        </p>
      </header>

      <DischargeSheet note={note} wardId={wardId} patientId={id} formularySize={formularySize} />

      <section className="flex flex-col gap-2 px-4 pb-10 print:hidden">
        <PrintButton />
        <DownloadWordButton patientId={id} />
        {formularySize > 0 && <CopyForEsic payload={esicPayload} />}
        <CopyNoteButton text={noteText} />
      </section>
    </div>
  );
}
