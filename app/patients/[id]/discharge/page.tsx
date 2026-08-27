import Link from "next/link";
import { notFound } from "next/navigation";
import { getDischargeNote } from "@/lib/discharge-data";
import { formatDischargeText } from "@/lib/discharge";
import { HOSPITAL_LINES, LOGO_PUBLIC_PATH } from "@/lib/discharge-letterhead";
import PrintButton from "../note/print-button";
import CopyNoteButton from "../note/copy-button";
import DownloadWordButton from "./download-word-button";

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
  const note = await getDischargeNote(id);
  if (!note) notFound();

  const noteText = formatDischargeText(note);
  const cell = "border border-black px-2 py-1 align-top";

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

      <section className="px-4 pb-4 print:px-0">
        <div className="ios-group px-5 py-5 text-[13px] leading-snug text-black print:rounded-none print:border-0 print:p-0 print:shadow-none">
          {/* Page 1 */}
          <div className="print:break-after-page">
            {/* eslint-disable-next-line @next/next/no-img-element -- a small static asset
                bundled with the app, not a remote or user-uploaded image. */}
            <div className="flex items-start gap-3">
              <img src={LOGO_PUBLIC_PATH} alt="" className="h-16 w-16 shrink-0" />
              <div className="flex-1 text-center">
                {HOSPITAL_LINES.map((line, i) => (
                  <p key={i} className={i < 2 ? "text-[14px] font-bold" : "text-[13px]"}>
                    {line}
                  </p>
                ))}
                <p className="mt-1 text-[13px] font-bold">UNIT – {note.header.ward}</p>
              </div>
            </div>

            <p className="mt-3 border border-black py-1 text-center text-[15px] font-bold uppercase">
              Discharge summary
            </p>

            <table className="mt-2 w-full border-collapse text-[12px]">
              <tbody>
                <tr>
                  <td className={cell}>
                    <span className="font-bold">NAME –</span> {note.header.name}
                  </td>
                  <td className={cell}>
                    <span className="font-bold">AGE-</span> {note.header.age}
                  </td>
                  <td className={cell}>
                    <span className="font-bold">SEX-</span> {note.header.sex}
                  </td>
                </tr>
                <tr>
                  <td className={cell}>
                    <span className="font-bold">INS. NO./EMP ID –</span> {note.header.insNo}
                  </td>
                  <td className={cell}>
                    <span className="font-bold">MRD NO.</span> {note.header.mrdNo || ""}
                  </td>
                  <td className={cell}>
                    <span className="font-bold">IP/FAMILY-</span> {note.header.ipFamily}
                  </td>
                </tr>
                <tr>
                  <td className={cell}>
                    <span className="font-bold">WARD -</span> {note.header.ward}
                  </td>
                  <td className={cell}>
                    <span className="font-bold">D.O.A –</span> {note.header.doa}
                  </td>
                  <td className={cell}>
                    <span className="font-bold">D.O.D-</span> {note.header.dod}
                  </td>
                </tr>
              </tbody>
            </table>

            <p className="mt-3 font-bold">
              FINAL DIAGNOSIS: {(note.finalDiagnosis || "").toUpperCase()}
              {note.procedure ? ` — ${note.procedure}` : ""}
            </p>

            {/* One bordered box for everything the doctor reviews and signs off on together —
                diagnosis detail, the round's own notes to write up, past medical history, then
                Condition at discharge at the bottom of the same box — matching the template's
                single tall rectangle rather than separate headed sections. */}
            <div className="mt-1 min-h-[280px] border border-black p-2 print:min-h-[560px]">
              {note.history.length > 0 ? (
                <ul className="list-disc pl-4">
                  {note.history.map((line, i) => (
                    <li key={i}>{line}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted">&nbsp;</p>
              )}
              <p className="mt-2">
                <span className="font-bold">PAST MEDICAL HISTORY –</span> {note.pastMedicalHistory}
              </p>

              <p className="mt-4 font-bold">CONDITION AT DISCHARGE-</p>
              {/* Printed exactly as recorded rather than parsed apart to fit "BP- __ mm of
                  Hg PR- __ bpm" — splitting a vital string the app did not measure the shape
                  of is exactly the kind of guessing this app avoids everywhere else. */}
              <p>{note.conditionAtDischarge.vitals || "BP-    mm of Hg   PR-    bpm"}</p>
              <p>Examination - {note.conditionAtDischarge.exam.join("; ")}</p>
            </div>
          </div>

          {/* Page 2 */}
          <div>
            <p className="font-bold underline">INVESTIGATIONS DONE DURING STAY</p>
            <table className="mt-1 w-full border-collapse text-[12px]">
              <tbody>
                <tr>
                  <td className={cell + " font-bold"}>DATE</td>
                  <td className={cell}></td>
                  <td className={cell}></td>
                </tr>
                {note.investigations.map((row, i) => (
                  <tr key={row.label}>
                    <td className={cell + " font-bold"}>
                      {i + 1}. {row.label}
                    </td>
                    <td className={cell}>{row.unit}</td>
                    <td className={cell}>{row.value}</td>
                  </tr>
                ))}
                <tr>
                  <td className={cell + " font-bold"}>{note.investigations.length + 1}. Na/K/Cl</td>
                  <td className={cell}></td>
                  <td className={cell}>
                    {note.naKCl.na || note.naKCl.k || note.naKCl.cl
                      ? `${note.naKCl.na || "—"} / ${note.naKCl.k || "—"} / ${note.naKCl.cl || "—"}`
                      : ""}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Radiology and pathology continue the same numbering, outside the bordered
                table — matching the template's own "7. USG W/ABD – Date -" line, which sits
                below the table rather than inside it. Every report on file prints, not just
                the first — the template shows one line because a blank form only needs one. */}
            <div className="mt-1 text-[12px]">
              {note.radiology.length === 0 && note.pathology.length === 0 ? (
                <p>{note.investigations.length + 2}. USG W/ABD – Date -</p>
              ) : (
                [...note.radiology, ...note.pathology].map((line, i) => (
                  <p key={i}>
                    {note.investigations.length + 2 + i}. {line}
                  </p>
                ))
              )}
            </div>

            <p className="mt-4 font-bold underline">ADVICE ON DISCHARGE</p>
            <table className="mt-1 w-full border-collapse text-[12px]">
              <tbody>
                {Array.from({ length: Math.max(4, note.advice.lines.length) }, (_, i) => {
                  const line = note.advice.lines[i] ?? "";
                  const parts = line.split("—").map((p) => p.trim());
                  return (
                    <tr key={i}>
                      <td className={cell + " w-6 font-bold"}>{i + 1}</td>
                      <td className={cell}>{parts[0] ?? ""}</td>
                      <td className={cell}>{parts[1] ?? ""}</td>
                      <td className={cell}>{parts[2] ?? ""}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {note.followUp.length > 0 && (
              <>
                <p className="mt-3 font-semibold">Follow up — still outstanding on the round</p>
                <ul className="list-disc pl-5 text-[12px]">
                  {note.followUp.map((line, i) => (
                    <li key={i}>{line}</li>
                  ))}
                </ul>
              </>
            )}

            <p className="mt-3 text-[12px]">
              <span className="font-semibold">Review in OPD on</span> ________________
            </p>

            {(note.pendingCount > 0 || note.missingLabels.length > 0) && (
              <div className="mt-3 rounded-md bg-orange-50 p-2 text-[12px] text-orange-800 print:hidden">
                {note.pendingCount > 0 && <p>{note.pendingCount} value(s) never confirmed — check first.</p>}
                {note.missingLabels.length > 0 && <p>Never recorded: {note.missingLabels.join(", ")}</p>}
              </div>
            )}

            <p className="mt-10 text-right text-[13px] font-bold">NAME AND SIGNATURE OF DOCTOR</p>

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
