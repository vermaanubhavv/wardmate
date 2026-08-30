import { NextResponse } from "next/server";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  AlignmentType,
  WidthType,
  PageBreak,
  BorderStyle,
  ImageRun,
  VerticalAlign,
} from "docx";
import { createClient } from "@/lib/supabase/server";
import { getDischargeContext } from "@/lib/discharge-data";
import { mergeDischargeDraft } from "@/lib/discharge-store";
import {
  buildDischargeDocument,
  letterheadNamesUnit,
  procedureLines,
  medLine,
  BLANK,
  type DischargeDocument,
} from "@/lib/discharge-render";

/**
 * The discharge summary as a Word file, in the protocol's section order (v1.0). Rendered from
 * the same DischargeDocument the printed page uses, so the two cannot drift. Plain Word text
 * and tables — every part editable the moment it opens.
 */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const context = await getDischargeContext(id);
  if (!context) return NextResponse.json({ error: "Patient not found." }, { status: 404 });

  const doc = buildDischargeDocument(mergeDischargeDraft(context), context);
  const logoBytes = await fetchLogo(doc.logoUrl);

  const file = new Document({ sections: [{ children: buildBody(doc, logoBytes) }] });
  const buffer = await Packer.toBuffer(file);
  const filename = `${doc.patient.name.replace(/[^A-Za-z0-9]+/g, "_")}_discharge_summary.docx`;

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

async function fetchLogo(url: string | null): Promise<Buffer | null> {
  if (!url) return null;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return Buffer.from(await res.arrayBuffer());
  } catch {
    return null;
  }
}

const bold = (text: string) => new TextRun({ text, bold: true });
const plain = (text: string) => new TextRun({ text });
const heading = (text: string) =>
  new Paragraph({ spacing: { before: 220, after: 60 }, children: [new TextRun({ text: text.toUpperCase(), bold: true, underline: {} })] });
const body = (text: string) => new Paragraph({ children: [plain(text)] });

const BORDER = {
  top: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
  bottom: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
  left: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
  right: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
};

function cell(children: Paragraph[], widthPct: number): TableCell {
  return new TableCell({
    width: { size: widthPct, type: WidthType.PERCENTAGE },
    borders: BORDER,
    verticalAlign: VerticalAlign.TOP,
    margins: { top: 60, bottom: 60, left: 80, right: 80 },
    children,
  });
}

function buildBody(doc: DischargeDocument, logoBytes: Buffer | null): (Paragraph | Table)[] {
  const out: (Paragraph | Table)[] = [];

  // Heading + logo
  out.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
        bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
        left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
        right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
        insideHorizontal: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
        insideVertical: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: logoBytes ? 15 : 1, type: WidthType.PERCENTAGE },
              verticalAlign: VerticalAlign.CENTER,
              children: [
                new Paragraph({
                  children: logoBytes
                    ? [new ImageRun({ data: logoBytes, transformation: { width: 70, height: 70 }, type: "png" })]
                    : [],
                }),
              ],
            }),
            new TableCell({
              width: { size: logoBytes ? 70 : 99, type: WidthType.PERCENTAGE },
              verticalAlign: VerticalAlign.CENTER,
              children: [
                ...doc.letterheadLines.map(
                  (line, i) =>
                    new Paragraph({
                      alignment: AlignmentType.CENTER,
                      children: [new TextRun({ text: line, bold: true, size: i < 2 ? 26 : 22 })],
                    })
                ),
                ...(doc.unitName && !letterheadNamesUnit(doc.letterheadLines, doc.unitName)
                  ? [
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [new TextRun({ text: `UNIT – ${doc.unitName}`, bold: true, size: 22 })],
                      }),
                    ]
                  : []),
              ],
            }),
            ...(logoBytes
              ? [
                  new TableCell({
                    width: { size: 15, type: WidthType.PERCENTAGE },
                    verticalAlign: VerticalAlign.CENTER,
                    children: [new Paragraph({ children: [] })],
                  }),
                ]
              : []),
          ],
        }),
      ],
    })
  );

  out.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 160, after: 160 },
      border: BORDER,
      children: [new TextRun({ text: "DISCHARGE SUMMARY", bold: true, size: 26 })],
    })
  );
  if (doc.status !== "finalised")
    out.push(new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Draft — not yet finalised", italics: true, size: 18 })] }));

  // 1. Patient Details
  out.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            cell([new Paragraph({ children: [bold("Name – "), plain(doc.patient.name)] })], 40),
            cell([new Paragraph({ children: [bold("Age – "), plain(doc.patient.age || BLANK)] })], 30),
            cell([new Paragraph({ children: [bold("Sex – "), plain(doc.patient.sex || BLANK)] })], 30),
          ],
        }),
        new TableRow({
          children: [
            cell([new Paragraph({ children: [bold("UHID – "), plain(doc.patient.uhid || BLANK)] })], 40),
            cell([new Paragraph({ children: [bold("ABHA – "), plain(doc.patient.abha || BLANK)] })], 30),
            cell([new Paragraph({ children: [bold("Contact – "), plain(doc.patient.contact || BLANK)] })], 30),
          ],
        }),
      ],
    })
  );

  // 2. Encounter Details
  out.push(heading("Encounter Details"));
  for (const row of doc.encounter) out.push(new Paragraph({ children: [bold(`${row.label}: `), plain(row.value || BLANK)] }));

  // 3. Indication for Admission
  out.push(heading("Indication for Admission"));
  out.push(body(doc.indication || BLANK));

  // 4. Diagnoses
  out.push(heading("Diagnoses"));
  const dxBlock = (title: string, items: string[], blankIfEmpty = false) => {
    if (items.length === 0) {
      if (blankIfEmpty) out.push(new Paragraph({ children: [bold(`${title}: `), plain(BLANK)] }));
      return;
    }
    out.push(new Paragraph({ children: [bold(`${title}:`)] }));
    for (const i of items) out.push(new Paragraph({ bullet: { level: 0 }, children: [plain(i)] }));
  };
  dxBlock("Primary Diagnosis", doc.diagnoses.primary, true);
  dxBlock("Secondary Diagnosis", doc.diagnoses.secondary);
  dxBlock("Relevant Comorbidities", doc.diagnoses.comorbidities);
  dxBlock("Complications", doc.diagnoses.complications);

  // 5. Operation / Procedures
  if (doc.procedures.length > 0) {
    out.push(heading("Operation / Procedures"));
    for (const p of doc.procedures) {
      procedureLines(p).forEach((l, i) =>
        out.push(new Paragraph({ indent: i === 0 ? undefined : { left: 300 }, children: [i === 0 ? bold(l) : plain(l)] }))
      );
    }
  }

  // 6. Clinical Course
  out.push(heading("Clinical Course"));
  out.push(body(doc.clinicalCourse || BLANK));
  if (doc.clinicalCourse && !doc.clinicalCourseApproved)
    out.push(new Paragraph({ children: [new TextRun({ text: "Not yet approved by the resident.", italics: true, size: 18 })] }));

  // 7. Relevant Investigations
  if (doc.investigations.length > 0) {
    out.push(heading("Relevant Investigations and Results"));
    for (const i of doc.investigations)
      out.push(new Paragraph({ children: [bold(`${i.group}: `), plain(`${i.text}${i.interpretation ? ` — ${i.interpretation}` : ""}`)] }));
  }

  // 8. Histopathology
  if (doc.histopathology.length > 0) {
    out.push(heading("Histopathology"));
    for (const h of doc.histopathology) {
      out.push(new Paragraph({ children: [bold(`Specimen: ${h.specimen}`)] }));
      out.push(new Paragraph({ indent: { left: 300 }, children: [plain(`Status: ${h.status}`)] }));
      if (h.result) out.push(new Paragraph({ indent: { left: 300 }, children: [plain(`Result: ${h.result}`)] }));
      if (h.reviewPlan) out.push(new Paragraph({ indent: { left: 300 }, children: [plain(`Review plan: ${h.reviewPlan}`)] }));
    }
  }

  // 9. Medications
  out.push(heading("Medications on Discharge"));
  if (doc.medications.length === 0) out.push(body(BLANK));
  doc.medications.forEach((m, i) => out.push(new Paragraph({ children: [plain(`${i + 1}. ${medLine(m)}`)] })));

  // 10. Condition at Discharge
  out.push(heading("Condition at Discharge"));
  out.push(body(doc.condition || BLANK));

  // 11. Primary Care Actions
  out.push(heading("Primary Care Actions"));
  if (doc.primaryCareActions.length === 0) out.push(body("None."));
  for (const a of doc.primaryCareActions) out.push(new Paragraph({ bullet: { level: 0 }, children: [plain(a)] }));

  // 12. Patient Actions
  out.push(heading("Patient Actions"));
  if (doc.patientActions.length === 0) out.push(body("None."));
  for (const a of doc.patientActions) out.push(new Paragraph({ bullet: { level: 0 }, children: [plain(a)] }));

  // 13. Advice
  if (doc.advice && doc.advice.length > 0) {
    out.push(heading("Advice"));
    for (const a of doc.advice) out.push(new Paragraph({ children: [bold(`${a.module}: `), plain(a.text)] }));
  }

  // 14. Red Flags
  if (doc.redFlags && doc.redFlags.length > 0) {
    out.push(heading("When to Seek Medical Attention"));
    for (const r of doc.redFlags) out.push(new Paragraph({ bullet: { level: 0 }, children: [plain(r)] }));
  }

  // 15. Authentication
  out.push(new Paragraph({ children: [new PageBreak()] }));
  out.push(heading("Authentication"));
  out.push(new Paragraph({ children: [bold(doc.authentication.name || BLANK)] }));
  if (doc.authentication.designation) out.push(body(doc.authentication.designation));
  if (doc.authentication.department) out.push(body(doc.authentication.department));
  out.push(body(`Discharge summary completed: ${doc.authentication.completedAt || BLANK}`));
  if (doc.authentication.seniorReviewer) out.push(body(`Senior reviewer: ${doc.authentication.seniorReviewer}`));

  return out;
}
