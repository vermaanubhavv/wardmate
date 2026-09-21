import type { ProgressNote } from "@/lib/progress-note";
import { renderNoteLine } from "./note-line";

/** One gray-barred section, exactly the shape the SOAP template prints it: a label bar, then a
 *  bordered box of content below. */
function Section({
  label,
  lines,
  minHeight,
}: {
  label: string;
  lines: string[];
  minHeight: string;
}) {
  const content = lines.filter((l) => l.trim() !== "");
  return (
    <div className="border-b border-black">
      <p className="border-b border-black bg-[#eef1f4] px-3 py-1.5 text-[13px] font-bold print:bg-[#eef1f4]">
        {label}
      </p>
      <div className={`px-3 py-3 text-[14px] leading-relaxed ${minHeight}`}>
        {content.length > 0 ? (
          content.map((line, i) => renderNoteLine(line, i, { compact: true }))
        ) : (
          <p className="text-muted">Nothing recorded yet today.</p>
        )}
      </div>
    </div>
  );
}

/**
 * The generic SOAP-format printable — for every ward that is not the ESIC Medical College
 * Faridabad pilot (see lib/ward.ts getWardIsEsicFaridabad and patch 0078). Same underlying round
 * data as the ESIC sheet in page.tsx, regrouped into Subjective / Objective / Assessment / Plan
 * instead of that sheet's own fixed 11-line column — see ProgressNote.subjective/objective/
 * assessment in lib/progress-note.ts for exactly how the split is made.
 */
export default function SoapNote({ note }: { note: ProgressNote }) {
  return (
    <div className="border border-black text-black">
      <p className="border-b border-black py-3 text-center text-[20px] font-bold">
        SOAP Progress Notes
      </p>

      <div className="border-b border-black">
        <p className="border-b border-black bg-[#eef1f4] px-3 py-1.5 text-[13px] font-bold">
          Patient information
        </p>
        <div className="border-b border-black px-3 py-2 text-[14px]">
          <span className="font-semibold">Name:</span> {note.header.name}
          {note.header.uhid && <span className="ml-3 text-muted">IP No: {note.header.uhid}</span>}
          {note.header.bed && <span className="ml-3 text-muted">Bed {note.header.bed}</span>}
        </div>
        <div className="px-3 py-2 text-[14px]">
          <span className="font-semibold">Age:</span> {note.header.age || "________"}
          <span className="ml-6 font-semibold">Gender:</span> {note.header.sex || "________"}
          <span className="ml-6 font-semibold">Date of birth:</span> {note.header.dob}
        </div>
      </div>

      <Section label="Subjective" lines={note.subjective} minHeight="min-h-[110px]" />
      <Section label="Objective" lines={note.objective} minHeight="min-h-[140px]" />
      <Section label="Assessment" lines={note.assessment} minHeight="min-h-[110px]" />
      <Section label="Plan" lines={note.plan} minHeight="min-h-[110px]" />

      <div className="px-3 py-2 text-[14px]">
        <span className="font-semibold">Practitioner&rsquo;s name:</span>{" "}
        {note.practitionerName ?? "________________"}
      </div>
      <div className="border-t border-black px-3 py-2 text-[14px]">
        <span className="font-semibold">Practitioner&rsquo;s signature:</span>
      </div>
    </div>
  );
}
