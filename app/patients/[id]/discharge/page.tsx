import Link from "next/link";
import { notFound } from "next/navigation";
import { getDischargeNote } from "@/lib/discharge-data";
import { formatDischargeText } from "@/lib/discharge";
import PrintButton from "../note/print-button";
import CopyNoteButton from "../note/copy-button";
import DownloadWordButton from "./download-word-button";

/**
 * The discharge summary, laid out the way the unit's own examples are — two pages: identity
 * through condition-at-discharge on the first, investigations through the signature on the
 * second. See lib/discharge.ts for what is assembled from the record versus the two editable
 * defaults (no-comorbidities, standard advice) the resident asked for explicitly.
 */
export default async function DischargeSummaryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const note = await getDischargeNote(id);
  if (!note) notFound();

  const noteText = formatDischargeText(note);

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col bg-background print:max-w-none print:bg-white">
      <header className="px-4 pb-3 pt-6 print:hidden">
        <Link href={`/patients/${id}`} className="text-[17px] text-accent">
          ‹ Patient
        </Link>
        <h1 className="mt-3 ios-large-title">Discharge summary</h1>
        <p className="mt-1 text-[15px] text-muted">
          Two pages, matching the unit&rsquo;s own layout. The comorbidities line and the
          discharge medications are editable defaults where nothing was actually recorded —
          check both before signing.
        </p>
      </header>

      <section className="px-4 pb-4 print:px-0">
        <div className="ios-group px-5 py-5 text-[15px] leading-relaxed text-black print:rounded-none print:border-0 print:p-0 print:shadow-none">
          {/* Page 1 */}
          <div className="print:break-after-page">
            {note.letterhead && (
              <p className="whitespace-pre-wrap text-center text-[13px] font-semibold">
                {note.letterhead}
              </p>
            )}
            <p className="mt-2 text-center text-[16px] font-bold uppercase underline">
              Discharge summary
            </p>

            <div className="mt-3 space-y-0.5">
              <p>
                <span className="font-semibold">Name –</span> {note.header.name}
              </p>
              <p>
                <span className="font-semibold">Age –</span> {note.header.age || "________"}
                <span className="ml-4 font-semibold">Sex –</span> {note.header.sex || "____"}
              </p>
              <p>
                <span className="font-semibold">MRD No.</span> {note.header.mrdNo || "________________"}
              </p>
              <p>
                <span className="font-semibold">Ward –</span> {note.header.ward}
              </p>
              <p>
                <span className="font-semibold">D.O.A –</span> {note.header.doa}
                <span className="ml-4 font-semibold">D.O.D –</span> {note.header.dod}
              </p>
            </div>

            <p className="mt-3">
              <span className="font-bold underline">Final diagnosis:</span>{" "}
              {(note.finalDiagnosis || "________________").toUpperCase()}
            </p>
            {note.procedure && (
              <p>
                <span className="font-bold underline">Procedure:</span> {note.procedure}
              </p>
            )}

            <p className="mt-3 font-bold underline">History and course in hospital</p>
            {note.history.length > 0 ? (
              <ul className="mt-1 list-disc pl-5">
                {note.history.map((line, i) => (
                  <li key={i}>{line}</li>
                ))}
              </ul>
            ) : (
              <div className="mt-1 h-16" />
            )}

            <p className="mt-3 font-bold underline">Past medical history</p>
            <p className="mt-1">{note.pastMedicalHistory}</p>

            <p className="mt-3 font-bold underline">Condition at discharge</p>
            <p className="mt-1">{note.conditionAtDischarge.vitals || "BP – ________   PR – ________"}</p>
            {note.conditionAtDischarge.exam.length > 0 ? (
              note.conditionAtDischarge.exam.map((line, i) => <p key={i}>{line}</p>)
            ) : (
              <div className="h-6" />
            )}
          </div>

          {/* Page 2 */}
          <div>
            <p className="font-bold underline">Investigations done during stay</p>
            <table className="mt-1 w-full border-collapse text-[14px]">
              <tbody>
                {note.investigations.map((row) => (
                  <tr key={row.label} className="border-b border-line">
                    <td className="py-1 pr-2 font-medium">{row.label}</td>
                    <td className="py-1">{row.value || ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <p className="mt-3 font-semibold">Radiology</p>
            {note.radiology.length > 0 ? (
              note.radiology.map((line, i) => <p key={i}>{line}</p>)
            ) : (
              <div className="h-10" />
            )}

            <p className="mt-3 font-semibold">Pathology / HPE</p>
            {note.pathology.length > 0 ? (
              note.pathology.map((line, i) => <p key={i}>{line}</p>)
            ) : (
              <div className="h-10" />
            )}

            <p className="mt-3 font-bold underline">Advice on discharge</p>
            {note.advice.lines.map((line, i) => (
              <p key={i}>{line}</p>
            ))}

            {note.followUp.length > 0 && (
              <>
                <p className="mt-3 font-semibold">Follow up — still outstanding on the round</p>
                <ul className="list-disc pl-5">
                  {note.followUp.map((line, i) => (
                    <li key={i}>{line}</li>
                  ))}
                </ul>
              </>
            )}

            <p className="mt-3">
              <span className="font-semibold">Review in OPD on</span> ________________
            </p>

            {(note.pendingCount > 0 || note.missingLabels.length > 0) && (
              <div className="mt-3 rounded-md bg-orange-50 p-2 text-[12px] text-orange-800 print:hidden">
                {note.pendingCount > 0 && <p>{note.pendingCount} value(s) never confirmed — check first.</p>}
                {note.missingLabels.length > 0 && <p>Never recorded: {note.missingLabels.join(", ")}</p>}
              </div>
            )}

            <div className="mt-8 flex items-end justify-end">
              <div className="w-48 border-b border-line pb-1 text-right text-[13px] text-muted">
                Name and signature of doctor
              </div>
            </div>

            <p className="mt-3 text-[11px] leading-snug text-muted">* {note.assembledNote}</p>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-2 px-4 pb-10 print:hidden">
        <PrintButton />
        <DownloadWordButton patientId={id} />
        <CopyNoteButton text={noteText} />
      </section>
    </div>
  );
}
