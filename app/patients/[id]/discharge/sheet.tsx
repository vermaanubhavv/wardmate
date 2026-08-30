import FormularyLink from "./formulary-link";
import {
  letterheadNamesUnit,
  procedureLines,
  medLine,
  BLANK,
  type DischargeDocument,
} from "@/lib/discharge-render";

/**
 * The discharge summary itself, in the protocol's section order (v1.0). One layout, rendered
 * both for a patient on the ward and for a one-off — see app/prepare-discharge. Generic
 * NABH/ABDM headings; a field the record never held prints a ruled blank, never a guess.
 */
export default function DischargeSheet({
  doc,
  wardId,
  patientId,
  formularyAvailable,
}: {
  doc: DischargeDocument;
  wardId: string;
  patientId: string;
  formularyAvailable: boolean;
}) {
  return (
    <section className="px-4 pb-4 print:px-0">
      <div className="ios-group px-5 py-5 text-[13px] leading-snug text-black print:rounded-none print:border-0 print:p-0 print:shadow-none">
        {/* Heading */}
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element -- ward-uploaded logo via a
              short-lived signed link, not a remote asset. */}
          {doc.logoUrl && <img src={doc.logoUrl} alt="" className="h-16 w-16 shrink-0 object-contain" />}
          <div className="flex-1 text-center">
            {doc.letterheadLines.map((line, i) => (
              <p key={i} className={i < 2 ? "text-[14px] font-bold" : "text-[13px]"}>
                {line}
              </p>
            ))}
            {doc.unitName && !letterheadNamesUnit(doc.letterheadLines, doc.unitName) && (
              <p className="mt-1 text-[13px] font-bold">UNIT – {doc.unitName}</p>
            )}
          </div>
          {doc.logoUrl && <div className="h-16 w-16 shrink-0" aria-hidden />}
        </div>

        <p className="mt-3 border border-black py-1 text-center text-[15px] font-bold uppercase">
          Discharge Summary
        </p>
        {doc.status !== "finalised" && (
          <p className="mt-1 text-center text-[11px] text-black print:hidden">Draft — not yet finalised</p>
        )}

        {/* 1. Patient Details */}
        <table className="mt-2 w-full border-collapse text-[12px]">
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

        {/* 2. Encounter Details */}
        <Heading>Encounter Details</Heading>
        <div className="grid grid-cols-2 gap-x-4 text-[12px]">
          {doc.encounter.map((row) => (
            <p key={row.label}>
              <span className="font-bold">{row.label}: </span>
              {row.value || BLANK}
            </p>
          ))}
        </div>

        {/* 3. Indication for Admission */}
        <Heading>Indication for Admission</Heading>
        <p className="text-[12px]">{doc.indication || BLANK}</p>

        {/* 4. Diagnoses */}
        <Heading>Diagnoses</Heading>
        <DxBlock title="Primary Diagnosis" items={doc.diagnoses.primary} blankIfEmpty />
        <DxBlock title="Secondary Diagnosis" items={doc.diagnoses.secondary} />
        <DxBlock title="Relevant Comorbidities" items={doc.diagnoses.comorbidities} />
        <DxBlock title="Complications" items={doc.diagnoses.complications} />

        {/* 5. Operation / Procedures */}
        {doc.procedures.length > 0 && (
          <>
            <Heading>Operation / Procedures</Heading>
            {doc.procedures.map((p) => (
              <div key={p.id} className="mb-1 text-[12px]">
                {procedureLines(p).map((l, i) => (
                  <p key={i} className={i === 0 ? "font-bold" : "pl-3"}>
                    {l}
                  </p>
                ))}
              </div>
            ))}
          </>
        )}

        {/* 6. Clinical Course */}
        <Heading>Clinical Course</Heading>
        <p className="whitespace-pre-wrap text-[12px] leading-relaxed">{doc.clinicalCourse || BLANK}</p>
        {doc.clinicalCourse && !doc.clinicalCourseApproved && (
          <p className="text-[11px] italic text-black print:hidden">Not yet approved by the resident.</p>
        )}

        {/* 7. Relevant Investigations */}
        {doc.investigations.length > 0 && (
          <>
            <Heading>Relevant Investigations and Results</Heading>
            {doc.investigations.map((i, k) => (
              <p key={k} className="text-[12px]">
                <span className="font-bold">{i.group}: </span>
                {i.text}
                {i.interpretation ? ` — ${i.interpretation}` : ""}
              </p>
            ))}
          </>
        )}

        {/* 8. Histopathology */}
        {doc.histopathology.length > 0 && (
          <>
            <Heading>Histopathology</Heading>
            {doc.histopathology.map((h) => (
              <div key={h.id} className="mb-1 text-[12px]">
                <p className="font-bold">Specimen: {h.specimen}</p>
                <p className="pl-3">Status: {h.status}</p>
                {h.result && <p className="pl-3">Result: {h.result}</p>}
                {h.reviewPlan && <p className="pl-3">Review plan: {h.reviewPlan}</p>}
              </div>
            ))}
          </>
        )}

        {/* 9. Medications on Discharge */}
        <Heading>Medications on Discharge</Heading>
        {doc.medications.length === 0 ? (
          <p className="text-[12px]">{BLANK}</p>
        ) : (
          <ol className="list-decimal pl-5 text-[12px]">
            {doc.medications.map((m) => (
              <li key={m.id} className="mb-0.5">
                {medLine(m)}
                {formularyAvailable && (
                  <span className="ml-2 text-[11px] text-muted">
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

        {/* 10. Condition at Discharge */}
        <Heading>Condition at Discharge</Heading>
        <p className="text-[12px]">{doc.condition || BLANK}</p>

        {/* 11. Primary Care Actions */}
        <Heading>Primary Care Actions</Heading>
        {doc.primaryCareActions.length === 0 ? (
          <p className="text-[12px]">None.</p>
        ) : (
          <ul className="list-disc pl-5 text-[12px]">
            {doc.primaryCareActions.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
        )}

        {/* 12. Patient Actions */}
        <Heading>Patient Actions</Heading>
        {doc.patientActions.length === 0 ? (
          <p className="text-[12px]">None.</p>
        ) : (
          <ul className="list-disc pl-5 text-[12px]">
            {doc.patientActions.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
        )}

        {/* 13. Advice */}
        {doc.advice && doc.advice.length > 0 && (
          <>
            <Heading>Advice</Heading>
            {doc.advice.map((a) => (
              <p key={a.id} className="text-[12px]">
                <span className="font-bold">{a.module}: </span>
                {a.text}
              </p>
            ))}
          </>
        )}

        {/* 14. Red Flags */}
        {doc.redFlags && doc.redFlags.length > 0 && (
          <>
            <Heading>When to Seek Medical Attention</Heading>
            <ul className="list-disc pl-5 text-[12px]">
              {doc.redFlags.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </>
        )}

        {/* 15. Authentication */}
        <Heading>Authentication</Heading>
        <div className="text-[12px]">
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

function Heading({ children }: { children: React.ReactNode }) {
  return <p className="mt-3 font-bold underline">{children}</p>;
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
      <p className="text-[12px]">
        <span className="font-bold">{title}: </span>
        {BLANK}
      </p>
    ) : null;
  }
  return (
    <div className="text-[12px]">
      <span className="font-bold">{title}:</span>
      <ul className="list-disc pl-5">
        {items.map((i, k) => (
          <li key={k}>{i}</li>
        ))}
      </ul>
    </div>
  );
}
