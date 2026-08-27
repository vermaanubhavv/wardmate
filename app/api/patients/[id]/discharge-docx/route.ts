import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
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
import { getDischargeNote } from "@/lib/discharge-data";
import type { DischargeNote } from "@/lib/discharge";
import { HOSPITAL_LINES, LETTERHEAD_ROWS } from "@/lib/discharge-letterhead";

/**
 * The discharge summary as an actual Word file, matching the unit's own blank template —
 * logo, doctor roster, the 3x3 identity table, the single bordered box carrying diagnosis
 * through condition at discharge, then the investigation and advice tables on page 2.
 * Everything in it is plain, ordinary Word text and table cells — no locked field, no form
 * control — so all of it is editable the moment it opens.
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

  const logoBytes = await readFile(path.join(process.cwd(), "public", "discharge", "esic-logo.png"));

  const doc = new Document({ sections: [{ children: await buildBody(note, logoBytes) }] });
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
const boldUnderline = (text: string) => new TextRun({ text, bold: true, underline: {} });

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

async function buildBody(note: DischargeNote, logoBytes: Buffer): Promise<(Paragraph | Table)[]> {
  const body: (Paragraph | Table)[] = [];

  // Logo + hospital block, side by side — a borderless 2-column table, since Word has no plain
  // "float an image beside centered text" primitive outside a table.
  body.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: { top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" }, bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" }, left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" }, right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" }, insideHorizontal: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" }, insideVertical: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" } },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 15, type: WidthType.PERCENTAGE },
              verticalAlign: VerticalAlign.CENTER,
              children: [
                new Paragraph({
                  children: [
                    new ImageRun({ data: logoBytes, transformation: { width: 70, height: 70 }, type: "png" }),
                  ],
                }),
              ],
            }),
            new TableCell({
              width: { size: 85, type: WidthType.PERCENTAGE },
              verticalAlign: VerticalAlign.CENTER,
              children: [
                ...HOSPITAL_LINES.map(
                  (line, i) =>
                    new Paragraph({
                      alignment: AlignmentType.CENTER,
                      children: [new TextRun({ text: line, bold: true, size: i < 2 ? 26 : 22 })],
                    })
                ),
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: `UNIT – ${note.header.ward}`, bold: true, size: 22 })],
                }),
              ],
            }),
          ],
        }),
      ],
    })
  );

  // Doctor roster / OPD-OT rows — same borderless-table trick for the two-column layout.
  body.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: { top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" }, bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" }, left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" }, right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" }, insideHorizontal: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" }, insideVertical: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" } },
      rows: LETTERHEAD_ROWS.map(
        (row) =>
          new TableRow({
            children: [
              new TableCell({
                width: { size: 50, type: WidthType.PERCENTAGE },
                children: [new Paragraph({ children: [bold(row.left)] })],
              }),
              new TableCell({
                width: { size: 50, type: WidthType.PERCENTAGE },
                children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [bold(row.right)] })],
              }),
            ],
          })
      ),
    })
  );

  body.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 160, after: 160 },
      border: { top: { style: BorderStyle.SINGLE, size: 4, color: "000000" }, bottom: { style: BorderStyle.SINGLE, size: 4, color: "000000" }, left: { style: BorderStyle.SINGLE, size: 4, color: "000000" }, right: { style: BorderStyle.SINGLE, size: 4, color: "000000" } },
      children: [new TextRun({ text: "DISCHARGE SUMMARY", bold: true, size: 26 })],
    })
  );

  // Identity — the same 3x3 table the template uses.
  body.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            cell([new Paragraph({ children: [bold("NAME – "), plain(note.header.name)] })], 40),
            cell([new Paragraph({ children: [bold("AGE- "), plain(note.header.age)] })], 30),
            cell([new Paragraph({ children: [bold("SEX- "), plain(note.header.sex)] })], 30),
          ],
        }),
        new TableRow({
          children: [
            cell([new Paragraph({ children: [bold("INS. NO./EMP ID – "), plain(note.header.insNo)] })], 40),
            cell([new Paragraph({ children: [bold("MRD NO. "), plain(note.header.mrdNo ?? "")] })], 30),
            cell([new Paragraph({ children: [bold("IP/FAMILY- "), plain(note.header.ipFamily)] })], 30),
          ],
        }),
        new TableRow({
          children: [
            cell([new Paragraph({ children: [bold("WARD - "), plain(note.header.ward)] })], 40),
            cell([new Paragraph({ children: [bold("D.O.A – "), plain(note.header.doa)] })], 30),
            cell([new Paragraph({ children: [bold("D.O.D- "), plain(note.header.dod)] })], 30),
          ],
        }),
      ],
    })
  );

  body.push(
    new Paragraph({
      spacing: { before: 200 },
      children: [
        bold(`FINAL DIAGNOSIS: ${(note.finalDiagnosis || "").toUpperCase()}`),
        ...(note.procedure ? [plain(` — ${note.procedure}`)] : []),
      ],
    })
  );

  // One bordered box for diagnosis detail / history / past medical history / condition at
  // discharge together — a single-cell table draws the border, matching the template's own
  // tall rectangle rather than separate headed sections.
  const boxParagraphs: Paragraph[] =
    note.history.length > 0
      ? note.history.map((line) => new Paragraph({ bullet: { level: 0 }, children: [plain(line)] }))
      : [new Paragraph({ children: [plain("")] })];
  boxParagraphs.push(
    new Paragraph({ spacing: { before: 120 }, children: [bold("PAST MEDICAL HISTORY – "), plain(note.pastMedicalHistory)] })
  );
  boxParagraphs.push(new Paragraph({ spacing: { before: 240 }, children: [bold("CONDITION AT DISCHARGE-")] }));
  boxParagraphs.push(
    new Paragraph({ children: [plain(note.conditionAtDischarge.vitals || "BP-    mm of Hg   PR-    bpm")] })
  );
  boxParagraphs.push(
    new Paragraph({ children: [plain(`Examination - ${note.conditionAtDischarge.exam.join("; ")}`)] })
  );

  body.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [new TableRow({ children: [cell(boxParagraphs, 100)] })],
    })
  );

  // Page 2, matching the print layout's own break.
  body.push(new Paragraph({ children: [new PageBreak()] }));

  body.push(new Paragraph({ children: [boldUnderline("INVESTIGATIONS DONE DURING STAY")] }));
  body.push(investigationsTable(note));

  const extras = [...note.radiology, ...note.pathology];
  const nextNum = note.investigations.length + 2;
  body.push(
    ...(extras.length > 0
      ? extras.map((line, i) => new Paragraph({ children: [plain(`${nextNum + i}. ${line}`)] }))
      : [new Paragraph({ children: [plain(`${nextNum}. USG W/ABD – Date -`)] })])
  );

  body.push(new Paragraph({ spacing: { before: 240 }, children: [boldUnderline("ADVICE ON DISCHARGE")] }));
  body.push(adviceTable(note));

  if (note.followUp.length > 0) {
    body.push(
      new Paragraph({ spacing: { before: 200 }, children: [bold("Follow up — still outstanding on the round")] })
    );
    for (const line of note.followUp) {
      body.push(new Paragraph({ bullet: { level: 0 }, children: [plain(line)] }));
    }
  }

  body.push(
    new Paragraph({
      spacing: { before: 200 },
      children: [bold("Review in OPD on "), plain("________________")],
    })
  );

  body.push(
    new Paragraph({
      spacing: { before: 400 },
      alignment: AlignmentType.RIGHT,
      children: [bold("NAME AND SIGNATURE OF DOCTOR")],
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

function investigationsTable(note: DischargeNote): Table {
  const rows = [
    new TableRow({
      children: [
        cell([new Paragraph({ children: [bold("DATE")] })], 60),
        cell([new Paragraph({ children: [plain("")] })], 20),
        cell([new Paragraph({ children: [plain("")] })], 20),
      ],
    }),
    ...note.investigations.map(
      (row, i) =>
        new TableRow({
          children: [
            cell([new Paragraph({ children: [bold(`${i + 1}. ${row.label}`)] })], 60),
            cell([new Paragraph({ children: [plain(row.unit)] })], 20),
            cell([new Paragraph({ children: [plain(row.value)] })], 20),
          ],
        })
    ),
    new TableRow({
      children: [
        cell([new Paragraph({ children: [bold(`${note.investigations.length + 1}. Na/K/Cl`)] })], 60),
        cell([new Paragraph({ children: [plain("")] })], 20),
        cell(
          [
            new Paragraph({
              children: [
                plain(
                  note.naKCl.na || note.naKCl.k || note.naKCl.cl
                    ? `${note.naKCl.na || "—"} / ${note.naKCl.k || "—"} / ${note.naKCl.cl || "—"}`
                    : ""
                ),
              ],
            }),
          ],
          20
        ),
      ],
    }),
  ];
  return new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows });
}

function adviceTable(note: DischargeNote): Table {
  const rowCount = Math.max(4, note.advice.lines.length);
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: Array.from({ length: rowCount }, (_, i) => {
      const line = note.advice.lines[i] ?? "";
      const parts = line.split("—").map((p) => p.trim());
      return new TableRow({
        children: [
          cell([new Paragraph({ children: [bold(String(i + 1))] })], 8),
          cell([new Paragraph({ children: [plain(parts[0] ?? "")] })], 34),
          cell([new Paragraph({ children: [plain(parts[1] ?? "")] })], 29),
          cell([new Paragraph({ children: [plain(parts[2] ?? "")] })], 29),
        ],
      });
    }),
  });
}
