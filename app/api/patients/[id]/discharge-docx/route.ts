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
import { letterheadNamesUnit } from "@/lib/discharge";
import type { DischargeNote } from "@/lib/discharge";

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

  const context = await getDischargeContext(id);
  if (!context) return NextResponse.json({ error: "Patient not found." }, { status: 404 });
  const note = context.note;

  // The ward's own uploaded logo, fetched through its short-lived signed link. Null when the
  // ward has not uploaded one — the heading then prints without a logo rather than with
  // another hospital's.
  const logoBytes = await fetchLogo(note.logoUrl);

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

async function fetchLogo(url: string | null): Promise<Buffer | null> {
  if (!url) return null;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return Buffer.from(await res.arrayBuffer());
  } catch {
    // A logo that will not load is not a reason to fail the whole document.
    return null;
  }
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

async function buildBody(note: DischargeNote, logoBytes: Buffer | null): Promise<(Paragraph | Table)[]> {
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
                ...note.letterheadLines.map(
                  (line, i) =>
                    new Paragraph({
                      alignment: AlignmentType.CENTER,
                      children: [new TextRun({ text: line, bold: true, size: i < 2 ? 26 : 22 })],
                    })
                ),
                // Skipped when the heading already names the unit, so the name is not stacked
                // on itself — same rule as the printed page, see letterheadNamesUnit.
                ...(letterheadNamesUnit(note.letterheadLines, note.header.ward)
                  ? []
                  : [
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [new TextRun({ text: `UNIT – ${note.header.ward}`, bold: true, size: 22 })],
                      }),
                    ]),
              ],
            }),
            // An empty cell the width of the logo's, so the centred heading sits on the middle
            // of the page rather than the middle of the space the logo left over.
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
            cell([new Paragraph({ children: [bold("INS. NO./EMP ID – "), plain(note.header.ipNo ?? "")] })], 40),
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

  // One bordered box, sectioned exactly as the printed page is — same five headings from the
  // unit's own blank form, same rule that an empty section still prints its heading. The two
  // surfaces render from note.sections so they cannot drift apart; a heading added to one and
  // forgotten in the other is the failure this shares a source with lib/discharge.ts to avoid.
  const boxParagraphs: Paragraph[] = [];

  const section = (title: string, lines: string[]) => {
    boxParagraphs.push(
      new Paragraph({ spacing: { before: 120 }, children: [bold(`${title} -`)] })
    );
    if (lines.length > 0) {
      for (const line of lines) {
        boxParagraphs.push(new Paragraph({ bullet: { level: 0 }, children: [plain(line)] }));
      }
    } else {
      // The blank line the resident writes on, as on the paper form.
      boxParagraphs.push(new Paragraph({ children: [plain("")] }));
    }
  };

  section("History on Admission", note.sections.historyOnAdmission);
  section("Course in Hospital", note.sections.courseInHospital);
  section("Procedures done", note.sections.proceduresDone);
  section("Operative Notes", note.sections.operativeNotes);
  section("Post Op", note.sections.postOp);

  boxParagraphs.push(
    new Paragraph({ spacing: { before: 120 }, children: [bold("PAST MEDICAL HISTORY – "), plain(note.pastMedicalHistory)] })
  );
  // "Satisfactory" is the unit's own form wording, reproduced like the letterhead.
  boxParagraphs.push(
    new Paragraph({ spacing: { before: 240 }, children: [bold("CONDITION AT DISCHARGE- Satisfactory")] })
  );
  boxParagraphs.push(
    new Paragraph({ children: [bold(note.conditionAtDischarge.vitals || "BP -             PR -")] })
  );
  boxParagraphs.push(
    new Paragraph({ children: [bold("EXAMINATION – "), plain(note.conditionAtDischarge.exam.join("; "))] })
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

/** The six columns the hospital's own prescribing screen asks for, in its order — so a
 *  resident transcribing into it reads one row left to right. Blank where nothing was said. */
function adviceTable(note: DischargeNote): Table {
  const widths = [5, 33, 12, 18, 12, 10, 10];
  const header = ["#", "Medication", "Dose", "Frequency", "Duration", "Qty", "Route"];

  const rows = [
    new TableRow({
      children: header.map((h, i) => cell([new Paragraph({ children: [bold(h)] })], widths[i])),
    }),
    ...Array.from({ length: Math.max(4, note.advice.rows.length) }, (_, i) => {
      const row = note.advice.rows[i];
      const values = [
        String(i + 1),
        // The formulary's own wording underneath, where a clinician confirmed which entry this
        // drug is — that is what gets typed into the prescribing system.
        row?.formularyName ? `${row.drug}\n${row.formularyName}` : (row?.drug ?? ""),
        row?.esicDose ?? row?.dose ?? "",
        row?.esicFrequency ?? "",
        row?.esicDuration ?? row?.duration ?? "",
        row?.quantity ?? "",
        row?.esicRoute ?? "",
      ];
      return new TableRow({
        children: values.map((v, c) =>
          cell([new Paragraph({ children: [c === 0 ? bold(v) : plain(v)] })], widths[c])
        ),
      });
    }),
  ];

  return new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows });
}
