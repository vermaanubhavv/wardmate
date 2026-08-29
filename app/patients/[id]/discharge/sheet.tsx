import FormularyLink from "./formulary-link";
import { letterheadNamesUnit, type DischargeNote } from "@/lib/discharge";

/**
 * The discharge summary itself, laid out the way the unit's own blank template is.
 *
 * Lives on its own because there are now two ways to reach one: a patient on the ward, and a
 * one-off for somebody who is not in WardMate at all (see app/prepare-discharge). Both print
 * the same document. Keeping the layout in one file is the same reason getDischargeContext
 * exists — a fix to a printed document must not have to be made twice and then found, months
 * later, to have been made once.
 *
 * formularySize of 0 turns off the formulary link under each drug, which is how the one-off
 * renders: there is no patient to hang a confirmed mapping on.
 */
export default function DischargeSheet({
  note,
  wardId,
  patientId,
  formularySize,
}: {
  note: DischargeNote;
  wardId: string;
  patientId: string;
  formularySize: number;
}) {
  const cell = "border border-black px-2 py-1 align-top";

  return (
      <section className="px-4 pb-4 print:px-0">
        <div className="ios-group px-5 py-5 text-[13px] leading-snug text-black print:rounded-none print:border-0 print:p-0 print:shadow-none">
          {/* Page 1 */}
          <div className="print:break-after-page">
            {/* eslint-disable-next-line @next/next/no-img-element -- a small static asset
                bundled with the app, not a remote or user-uploaded image. */}
            {/* The unit's OWN heading and logo, both set per ward — see /unit and /formats.
                Nothing is hardcoded to any one hospital: a unit that has set neither prints
                just its name, rather than another hospital's name and seal. */}
            <div className="flex items-center gap-3">
              {note.logoUrl && (
                <img src={note.logoUrl} alt="" className="h-16 w-16 shrink-0 object-contain" />
              )}
              <div className="flex-1 text-center">
                {note.letterheadLines.map((line, i) => (
                  <p key={i} className={i < 2 ? "text-[14px] font-bold" : "text-[13px]"}>
                    {line}
                  </p>
                ))}
                {/* Only when the heading has not already named the unit — see
                    letterheadNamesUnit. Printing both stacks the unit's name on itself. */}
                {!letterheadNamesUnit(note.letterheadLines, note.header.ward) && (
                  <p className="mt-1 text-[13px] font-bold">UNIT – {note.header.ward}</p>
                )}
              </div>
              {/* The heading is centred on the PAGE, not in what is left of it. Without a
                  spacer the width of the logo, a 16-unit seal on the left pushes the hospital's
                  name visibly right of centre — which is exactly the kind of thing that looks
                  wrong on a printed document without the reader being able to say why. */}
              {note.logoUrl && <div className="h-16 w-16 shrink-0" aria-hidden />}
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
                    <span className="font-bold">INS. NO./EMP ID –</span> {note.header.ipNo || ""}
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
            {/* The six columns the hospital's own prescribing screen asks for, in its order,
                so transcribing across is reading one row left to right rather than working
                out which part of a sentence belongs in which box. A field the resident never
                stated prints blank — see lib/medication-fields.ts, which fills nothing in. */}
            <table className="mt-1 w-full border-collapse text-[11px]">
              <thead>
                <tr>
                  <th className={cell + " w-5 text-left"}>#</th>
                  <th className={cell + " text-left"}>Medication</th>
                  <th className={cell + " text-left"}>Dose</th>
                  <th className={cell + " text-left"}>Frequency</th>
                  <th className={cell + " text-left"}>Duration</th>
                  <th className={cell + " text-left"}>Qty</th>
                  <th className={cell + " text-left"}>Route</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: Math.max(4, note.advice.rows.length) }, (_, i) => {
                  const row = note.advice.rows[i];
                  return (
                    <tr key={i}>
                      <td className={cell + " w-5 font-bold"}>{i + 1}</td>
                      <td className={cell}>
                        {row?.drug ?? ""}
                        {/* The hospital formulary's own wording for this drug, once a clinician
                            has said which entry it is — that is what gets typed into the
                            prescribing system, so it prints here beside the resident's own
                            words rather than replacing them. Only offered when this ward has
                            actually imported a formulary. */}
                        {row && formularySize > 0 && (
                          <span className="mt-0.5 block text-muted">
                            <FormularyLink
                              wardId={wardId}
                              patientId={patientId}
                              drugKey={row.drugKey}
                              drugLabel={row.drugName}
                              mapped={row.formularyName}
                            />
                          </span>
                        )}
                      </td>
                      <td className={cell}>{row?.esicDose ?? row?.dose ?? ""}</td>
                      <td className={cell}>{row?.esicFrequency ?? ""}</td>
                      <td className={cell}>{row?.esicDuration ?? row?.duration ?? ""}</td>
                      <td className={cell}>{row?.quantity ?? ""}</td>
                      <td className={cell}>{row?.esicRoute ?? ""}</td>
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
  );
}
