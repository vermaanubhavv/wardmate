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
} from "docx";
import { createClient } from "@/lib/supabase/server";
import { getDischargeNote } from "@/lib/discharge-data";
import type { DischargeNote } from "@/lib/discharge";

/**
 * The discharge summary as an actual Word file — everything in it is plain, ordinary Word
 * text and table cells, never a locked field or a form control, so every bit of it is editable
 * the moment it opens. Deliberately not an attempt to reproduce a specific template's exact
 * fonts and spacing pixel-for-pixel — that is the fragile part of a Word export; getting the
 * content, order and labels right (the same structure lib/discharge.ts already builds for the
 * print page) is what actually makes this useful to open and finish by hand.
 */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const note = await getDischargeNote(id);
  if (!note) return NextResponse.json({ error: "Patient not found." }, { status: 404 });

  const doc = new Document({ sections: [{ children: buildBody(note) }] });
  const buffer = await Packer.toBuffer(doc);

  const filename = `${note.header.name.replace(/[^A-Za-z0-9]+/g, "_")}_discharge_summary.docx`;

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

const bold = (text: string) => new TextRun({ text, bold: true });
const plain = (text: string) => new TextRun({ text });
const label = (text: string) => new TextRun({ text, bold: true, underline: {} });

function heading(text: string): Paragraph {
  return new Paragraph({ spacing: { before: 200, after: 80 }, children: [label(text)] });
}

function bulletOrBlank(lines: string[]): Paragraph[] {
  if (lines.length === 0) return [new Paragraph({ children: [plain("")] })];
  return lines.map((line) => new Paragraph({ bullet: { level: 0 }, children: [plain(line)] }));
}

function buildBody(note: DischargeNote): Paragraph[] | (Paragraph | Table)[] {
  const body: (Paragraph | Table)[] = [];

  if (note.letterhead) {
    for (const line of note.letterhead.split("\n")) {
      body.push(
        new Paragraph({ alignment: AlignmentType.CENTER, children: [bold(line)] })
      );
    }
  }
  body.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 120, after: 200 },
      children: [new TextRun({ text: "DISCHARGE SUMMARY", bold: true, underline: {}, size: 28 })],
    })
  );

  body.push(new Paragraph({ children: [label("Name – "), plain(note.header.name)] }));
  body.push(
    new Paragraph({
      children: [
        label("Age – "),
        plain(note.header.age || "________"),
        plain("    "),
        label("Sex – "),
        plain(note.header.sex || "____"),
      ],
    })
  );
  body.push(new Paragraph({ children: [label("MRD No. "), plain(note.header.mrdNo || "")] }));
  body.push(new Paragraph({ children: [label("Ward – "), plain(note.header.ward)] }));
  body.push(
    new Paragraph({
      children: [
        label("D.O.A – "),
        plain(note.header.doa),
        plain("    "),
        label("D.O.D – "),
        plain(note.header.dod),
      ],
    })
  );

  body.push(
    new Paragraph({
      spacing: { before: 200 },
      children: [label("Final diagnosis: "), plain((note.finalDiagnosis || "").toUpperCase())],
    })
  );
  if (note.procedure) {
    body.push(new Paragraph({ children: [label("Procedure: "), plain(note.procedure)] }));
  }

  body.push(heading("History and course in hospital"));
  body.push(...bulletOrBlank(note.history));

  body.push(heading("Past medical history"));
  body.push(new Paragraph({ children: [plain(note.pastMedicalHistory)] }));

  body.push(heading("Condition at discharge"));
  body.push(new Paragraph({ children: [plain(note.conditionAtDischarge.vitals || "BP –    PR –")] }));
  for (const line of note.conditionAtDischarge.exam) {
    body.push(new Paragraph({ children: [plain(line)] }));
  }

  // Page 2, matching the print layout's own break.
  body.push(new Paragraph({ children: [new PageBreak()] }));

  body.push(heading("Investigations done during stay"));
  body.push(investigationsTable(note));

  body.push(heading("Radiology"));
  body.push(...(note.radiology.length > 0 ? note.radiology.map((l) => new Paragraph({ children: [plain(l)] })) : [new Paragraph({ children: [plain("")] })]));

  body.push(heading("Pathology / HPE"));
  body.push(...(note.pathology.length > 0 ? note.pathology.map((l) => new Paragraph({ children: [plain(l)] })) : [new Paragraph({ children: [plain("")] })]));

  body.push(heading("Advice on discharge"));
  for (const line of note.advice.lines) body.push(new Paragraph({ children: [plain(line)] }));

  if (note.followUp.length > 0) {
    body.push(heading("Follow up — still outstanding on the round"));
    body.push(...note.followUp.map((l) => new Paragraph({ bullet: { level: 0 }, children: [plain(l)] })));
  }

  body.push(
    new Paragraph({
      spacing: { before: 200 },
      children: [label("Review in OPD on "), plain("________________")],
    })
  );

  body.push(
    new Paragraph({
      spacing: { before: 400 },
      alignment: AlignmentType.RIGHT,
      children: [plain("Name and signature of doctor")],
    })
  );

  body.push(
    new Paragraph({
      spacing: { before: 200 },
      children: [new TextRun({ text: `* ${note.assembledNote}`, italics: true, size: 18 })],
    })
  );

  return body;
}

const NO_BORDER = {
  top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
};

function investigationsTable(note: DischargeNote): Table {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: note.investigations.map(
      (row) =>
        new TableRow({
          children: [
            new TableCell({
              width: { size: 35, type: WidthType.PERCENTAGE },
              borders: NO_BORDER,
              children: [new Paragraph({ children: [bold(row.label)] })],
            }),
            new TableCell({
              width: { size: 65, type: WidthType.PERCENTAGE },
              borders: NO_BORDER,
              children: [new Paragraph({ children: [plain(row.value)] })],
            }),
          ],
        })
    ),
  });
}
