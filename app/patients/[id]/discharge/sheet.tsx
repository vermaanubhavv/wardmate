import Link from "next/link";
import FormularyLink from "./formulary-link";
import type { DischargeSectionId } from "@/lib/discharge-entities";
import {
  letterheadNamesUnit,
  procedureLines,
  medLine,
  adviceLines,
  BLANK,
  type DischargeDocument,
} from "@/lib/discharge-render";

/**
 * The discharge summary itself, in the protocol's section order (v1.0). One layout, rendered
 * both for a patient on the ward and for a one-off — see app/prepare-discharge. Generic
 * NABH/ABDM headings; a field the record never held prints a ruled blank, never a guess.
 *
 * When `editBase` is given (a real patient), each section heading is a link back to that card
 * in the workspace — tap the line you want to change. It reads as a plain heading on paper.
 */
function SectionHeading({
  editBase,
  section,
  children,
}: {
  editBase?: string;
  section: DischargeSectionId;
  children: React.ReactNode;
}) {
  if (!editBase) return <p className="mt-3 font-bold underline">{children}</p>;
  return (
    <Link
      href={`${editBase}?section=${section}`}
      className="mt-3 flex items-baseline justify-between font-bold underline decoration-dotted print:no-underline"
    >
      <span>{children}</span>
      <span className="ml-2 text-caption2 font-normal text-accent no-underline print:hidden">edit</span>
    </Link>
  );
}

export default function DischargeSheet({
  doc,
  wardId,
  patientId,
  formularyAvailable,
  editBase,
}: {
  doc: DischargeDocument;
  wardId: string;
  patientId: string;
  formularyAvailable: boolean;
  editBase?: string;
}) {
  return (
    <section className="px-4 pb-4 print:px-0">
      <div className="ios-group px-5 py-5 text-footnote leading-snug text-black print:rounded-none print:border-0 print:p-0 print:shadow-none">
        {/* Page 1 on paper: heading through the course and the condition at discharge. Held to at least one page
            tall, so investigations onward start page 2; a course that spills onto page 2 is
            followed straight on, never pushed to page 3. */}
        <div className="print:min-h-[100vh]">
        {/* Heading */}
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element -- ward-uploaded logo via a
              short-lived signed link, not a remote asset. */}
          {doc.logoUrl && <img src={doc.logoUrl} alt="" className="h-16 w-16 shrink-0 object-contain" />}
          <div className="flex-1 text-center">
            {doc.letterheadLines.map((line, i) => (
              <p key={i} className={i < 2 ? "text-subhead font-bold" : "text-footnote"}>
                {line}
              </p>
            ))}
            {doc.unitName && !letterheadNamesUnit(doc.letterheadLines, doc.unitName) && (
              <p className="mt-1 text-footnote font-bold">UNIT – {doc.unitName}</p>
            )}
          </div>
          {doc.logoUrl && <div className="h-16 w-16 shrink-0" aria-hidden />}
        </div>

        <p className="mt-3 border border-black py-1 text-center text-subhead font-bold uppercase">
          Discharge Summary
        </p>
        {doc.status !== "finalised" && (
          <p className="mt-1 text-center text-caption2 text-black print:hidden">Draft — not yet finalised</p>
        )}

        {/* 1. Patient Details */}
        <table className="mt-2 w-full border-collapse text-caption">
          <tbody>
            <tr>
              <Cell b="Name">{doc.patient.name}</Cell>
              <Cell b="Age">{doc.patient.age || BLANK}</Cell>
              <Cell b="Sex">{doc.patient.sex || BLANK}</Cell>
            </tr>
            <tr>
              <Cell b="UHID">{doc.patient.uhid || BLANK}</Cell>
              <Cell b="ABHA">{doc.patient.abha || BLANK}</Cell>
              <Cell b="Contact">{doc.patient.contact || BLANK}</Cell>
            </tr>
          </tbody>
        </table>

        <div data-print="admission">
        {/* 2. Admission Details */}
        <SectionHeading editBase={editBase} section="admission">Admission Details</SectionHeading>
        <div className="grid grid-cols-2 gap-x-4 text-caption">
          {doc.admission.map((row) => (
            <p key={row.label}>
              <span className="font-bold">{row.label}: </span>
              {row.value || BLANK}
            </p>
          ))}
        </div>
        </div>

        <div data-print="indication">
        {/* 3. Indication for Admission */}
        <SectionHeading editBase={editBase} section="indication">Indication for Admission</SectionHeading>
        <p className="text-caption">{doc.indication || BLANK}</p>
        </div>

        <div data-print="diagnoses">
        {/* 4. Diagnoses */}
        <SectionHeading editBase={editBase} section="diagnoses">Diagnoses</SectionHeading>
        <DxBlock title="Primary Diagnosis" items={doc.diagnoses.primary} blankIfEmpty />
        <DxBlock title="Secondary Diagnosis" items={doc.diagnoses.secondary} />
        <DxBlock title="Relevant Comorbidities" items={doc.diagnoses.comorbidities} />
        <DxBlock title="Complications" items={doc.diagnoses.complications} />
        </div>

        <div data-print="procedures">
        {/* 5. Operation / Procedures */}
        {doc.procedures.length > 0 && (
          <>
            <SectionHeading editBase={editBase} section="procedures">Operation / Procedures</SectionHeading>
            {doc.procedures.map((p) => (
              <div key={p.id} className="mb-1 text-caption">
                {procedureLines(p).map((l, i) => (
                  <p key={i} className={i === 0 ? "font-bold" : "pl-3"}>
                    {l}
                  </p>
                ))}
              </div>
            ))}
          </>
        )}
        </div>

        <div data-print="clinicalCourse">
        {/* 6. Clinical Course */}
        <SectionHeading editBase={editBase} section="clinicalCourse">Clinical Course</SectionHeading>
        <p className="whitespace-pre-wrap text-caption leading-relaxed">{doc.clinicalCourse || BLANK}</p>
        {doc.clinicalCourse && !doc.clinicalCourseApproved && (
          <p className="text-caption2 italic text-black print:hidden">Not yet approved by the resident.</p>
        )}
        </div>

        <div data-print="conditionAtDischarge">
        {/* Condition at Discharge — right after the course, so page 1 ends with how the patient left. */}
        <SectionHeading editBase={editBase} section="conditionAtDischarge">Condition at Discharge</SectionHeading>
        <p className="text-caption">{doc.condition || BLANK}</p>
        </div>

        </div>

        <div data-print="relevantInvestigations">
        {/* 7. Relevant Investigations */}
        {doc.investigations.length > 0 && (
          <>
            <SectionHeading editBase={editBase} section="relevantInvestigations">Relevant Investigations and Results</SectionHeading>
            {doc.investigations.map((i, k) => (
              <p key={k} className="text-caption">
                <span className="font-bold">{i.group}: </span>
                {i.text}
                {i.interpretation ? ` — ${i.interpretation}` : ""}
              </p>
            ))}
          </>
        )}
        </div>

        <div data-print="histopathology">
        {/* 8. Histopathology */}
        {doc.histopathology.length > 0 && (
          <>
            <SectionHeading editBase={editBase} section="histopathology">Histopathology</SectionHeading>
            {doc.histopathology.map((h) => (
              <div key={h.id} className="mb-1 text-caption">
                <p className="font-bold">Specimen: {h.specimen}</p>
                <p className="pl-3">Status: {h.status}</p>
                {h.result && <p className="pl-3">Result: {h.result}</p>}
                {h.reviewPlan && <p className="pl-3">Review plan: {h.reviewPlan}</p>}
              </div>
            ))}
          </>
        )}
        </div>

        <div data-print="medications">
        {/* 9. Medications on Discharge */}
        <SectionHeading editBase={editBase} section="medications">Medications on Discharge</SectionHeading>
        {doc.medications.length === 0 ? (
          <p className="text-caption">{BLANK}</p>
        ) : (
          <ol className="list-decimal pl-8 text-caption">
            {doc.medications.map((m) => (
              <li key={m.id} className="mb-0.5">
                {medLine(m)}
                {formularyAvailable && (
                  <span className="ml-2 text-caption2 text-muted">
                    <FormularyLink
                      wardId={wardId}
                      patientId={patientId}
                      drugKey={m.drugKey}
                      drugLabel={m.generic}
                      mapped={doc.medicationFormulary[m.drugKey] ?? null}
                    />
                  </span>
                )}
              </li>
            ))}
          </ol>
        )}
        </div>

        <div data-print="advice">
        {/* 11–14. Patient actions, advice, primary-care actions and red flags, squashed into one
            Advice list so page 2 stays short. Each still edits from its own card. */}
        <SectionHeading editBase={editBase} section="advice">Advice</SectionHeading>
        {adviceLines(doc).length === 0 ? (
          <p className="text-caption">None.</p>
        ) : (
          <ul className="list-disc pl-5 text-caption">
            {adviceLines(doc).map((l, i) => (
              <li key={i}>
                {l.label && <span className="font-bold">{l.label}: </span>}
                {l.text}
              </li>
            ))}
          </ul>
        )}
        </div>

        {/* 15. Authentication */}
        <SectionHeading editBase={editBase} section="authentication">Authentication</SectionHeading>
        <div className="text-caption">
          <p className="font-bold">{doc.authentication.name || BLANK}</p>
          {doc.authentication.designation && <p>{doc.authentication.designation}</p>}
          {doc.authentication.department && <p>{doc.authentication.department}</p>}
          <p>Discharge summary completed: {doc.authentication.completedAt || BLANK}</p>
          {doc.authentication.seniorReviewer && <p>Senior reviewer: {doc.authentication.seniorReviewer}</p>}
        </div>
      </div>
    </section>
  );
}

function Cell({ b, children }: { b: string; children: React.ReactNode }) {
  return (
    <td className="border border-black px-2 py-1 align-top">
      <span className="font-bold">{b} – </span>
      {children}
    </td>
  );
}

function DxBlock({
  title,
  items,
  blankIfEmpty,
}: {
  title: string;
  items: string[];
  blankIfEmpty?: boolean;
}) {
  if (items.length === 0) {
    return blankIfEmpty ? (
      <p className="text-caption">
        <span className="font-bold">{title}: </span>
        {BLANK}
      </p>
    ) : null;
  }
  return (
    <div className="text-caption">
      <span className="font-bold">{title}:</span>
      <ul className="list-disc pl-5">
        {items.map((i, k) => (
          <li key={k}>{i}</li>
        ))}
      </ul>
    </div>
  );
}
