import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isIdentifierLabel, stripPatientHonorific } from "@/lib/patients";
import { getWardLabRanges } from "@/lib/ward-lab-ranges";
import { getWardSpecialtyStored } from "@/lib/ward";
import { getSpecialtyPack } from "@/lib/specialty";
import { getWardFormats } from "@/lib/formats";
import { caseHistorySectionOf, summariseCaseHistory, type HistorySection } from "@/lib/case-history";
import { leadsFor, splitFields, type Lead } from "@/lib/case-history-departments";
import { summariseObjective } from "@/lib/exam-summary";
import { groupInvestigations, isImaging, type InvestigationReport } from "@/lib/investigations";
import type { Observation } from "@/lib/patient-state";
import { labReading } from "../../investigations-section";
import PrintButton from "../../note/print-button";
import FitPage from "./fit-page";
import { ExamDiagrams, hasExamDiagram } from "./diagrams";

/**
 * The printable patient history sheet — one A4 sheet, front and back, for every patient.
 *
 *   Front  logo, demographics and hospital identifiers, the department's lead cards in large
 *          boxed blocks (lib/case-history-departments.ts — the same order and questions the
 *          workspace asks), then every other history card
 *   Back   general examination, the other examination cards, the latest investigations in
 *          date order, a summary, management and treatment, and the doctor's sign and stamp
 *
 * Each side is held to one page by FitPage, which scales it down only when it would spill.
 *
 * Every card prints even when empty, as "NR" (nobody recorded it) or "NAD" (a negative was
 * recorded) — the same two states the patient page uses, never collapsed into each other.
 * Nothing here is composed: every line is a stored value, printed as stored. Browser print →
 * "Save as PDF" produces the file; same pattern as the discharge summary's print page.
 */

const SELECT =
  "recorded_at, is_case_history, observations(id, kind, label, value_text, value_num, unit, source_quote, needs_confirmation, confirmed_at, conflict_note, done_at, urgency, graded_at, recorded_at, pac_verdict, ref_low, ref_high, ref_text)";

/** The history cards every department walks, in the workspace's order. */
const BASE_HISTORY: HistorySection["key"][] = [
  "chief", "hopi", "past", "personal", "family", "medication", "surgical", "dietary", "environmental",
];
const ONCO_HISTORY: HistorySection["key"][] = ["onco_disease", "onco_treatment", "onco_cycle", "onco_toxicity"];

/** The examination cards after general examination and vitals — label as stored, heading as printed. */
const BASE_EXAM = [
  { label: "per abdomen", heading: "Per abdomen" },
  { label: "chest", heading: "Chest" },
  { label: "local examination", heading: "Local examination" },
];
const ONCO_EXAM = [
  { label: "lymph node survey", heading: "Lymph node survey" },
  { label: "mucosa, skin and vascular access", heading: "Mucosa, skin & line" },
];

/** How many reports of each kind the back has room for — capped separately, so a run of daily
 *  bloods can never push the one CT off the sheet. Older ones stay on WardMate and the sheet
 *  says so. */
const MAX_BLOOD = 8;
const MAX_IMAGING = 4;

const norm = (s: string) => s.toLowerCase().trim();
const unconfirmed = (o: Observation) => o.needs_confirmation && !o.confirmed_at;
const cell = "border border-black/60 px-1 py-px";

/** Section heading as a light band — how a printed case sheet separates its sections. */
const band = "bg-black/[0.07] px-1 py-[1px] text-[9.5px] font-bold uppercase tracking-wide";
const body = "text-[11px] leading-[1.35]";

function Block({ heading, children, className = "" }: { heading: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={"mt-1.5 break-inside-avoid " + className}>
      <p className={band}>{heading}</p>
      <div className={"mt-0.5 px-1 " + body}>{children}</div>
    </div>
  );
}

/** Ruled lines to write on, filling whatever height the page leaves it (never less than `min`).
 *  Real bordered rows rather than a background gradient: a hairline gradient drops out
 *  unpredictably when a printer rasterises it. Rows past the available height are clipped. */
function Ruled({ min = 14, className = "" }: { min?: number; className?: string }) {
  return (
    <div className={"min-h-0 flex-1 overflow-hidden " + className} style={{ minHeight: `${min}mm` }}>
      {Array.from({ length: 40 }).map((_, i) => (
        <div key={i} className="h-[7mm] border-b border-black/35" />
      ))}
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <p>
      <span className="font-semibold">{label}: </span>
      {children}
    </p>
  );
}

const NR = () => <span className="text-black/60">NR</span>;

function SectionLines({ section }: { section: HistorySection }) {
  return section.lines.length > 0 ? section.lines.map((l) => <p key={l.id}>{l.text}</p>) : <p>{section.note}</p>;
}

/** A department's lead card: boxed, the recorded lines first, then its prompts — answered ones
 *  filled from the record, the rest blank — and a table to complete by hand. */
function LeadBlock({ section, table }: { section: HistorySection; table: Lead["table"] }) {
  const fields = table?.fields ?? [];
  const { answers, rest } = splitFields(section.lines.map((l) => l.text), fields);
  // One operation / condition / drug per row, however it was separated when recorded.
  const inRows = table?.columns && table.recordedInRows ? rest.flatMap((t) => t.split(/\s*;\s*/)).filter(Boolean) : [];
  const above = inRows.length > 0 ? [] : rest;
  const blankRows = table?.columns ? Math.max((table.rows ?? 1) - inRows.length, 1) : 0;
  return (
    <div className="mt-2 break-inside-avoid border border-black">
      <p className={band + " border-b border-black text-[10.5px]"}>{section.label}</p>
      <div className={"px-1.5 py-1 " + body}>
        {above.length > 0
          ? above.map((t, i) => <p key={i}>{t}</p>)
          : inRows.length === 0 && Object.keys(answers).length === 0 && <p>{section.note ?? "NR"}</p>}
        {fields.length > 0 && (
          <div className="mt-1 grid grid-cols-2 gap-x-4 gap-y-1">
            {fields.map((f) => (
              <p key={f} className="flex items-end gap-1.5">
                <span className="shrink-0 font-semibold">{f}:</span>
                {answers[f] ? (
                  <span className="flex-1 border-b border-dotted border-black/50">{answers[f]}</span>
                ) : (
                  <span className="h-3.5 flex-1 border-b border-dotted border-black/50" />
                )}
              </p>
            ))}
          </div>
        )}
        {table?.columns && (
          <table className="mt-1 w-full border-collapse text-[10px]">
            <thead>
              <tr>
                {table.columns.map((c) => (
                  <th key={c} className={cell + " text-left font-semibold"}>
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {inRows.map((t, i) => (
                <tr key={`r${i}`}>
                  <td className={cell}>{t}</td>
                  {table.columns!.slice(1).map((c) => (
                    <td key={c} className={cell} />
                  ))}
                </tr>
              ))}
              {Array.from({ length: blankRows }).map((_, i) => (
                <tr key={i} className="h-5">
                  {table.columns!.map((c) => (
                    <td key={c} className={cell} />
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!table && <Ruled min={14} className="h-[14mm] flex-none" />}
      </div>
    </div>
  );
}

function ReportLine({
  report,
  sex,
  wardRanges,
}: {
  report: InvestigationReport;
  sex: string | null;
  wardRanges: Awaited<ReturnType<typeof getWardLabRanges>>;
}) {
  return (
    <p>
      <span className="font-semibold">
        {report.panel} ({report.dayLabel}):
      </span>{" "}
      {report.values.map((v, i) => {
        const reading = labReading(v, sex, wardRanges);
        return (
          <span key={v.id}>
            {i > 0 && " · "}
            {reading?.label ?? v.label} <span className="tabular-nums">{v.value_text ?? "—"}</span>
            {v.unit ? ` ${v.unit}` : ""}
            {reading?.flag === "high" && " ↑"}
            {reading?.flag === "low" && " ↓"}
            {reading?.flag === "abnormal" && " *"}
          </span>
        );
      })}
      {report.needsConfirmation && <span className="italic"> (unconfirmed)</span>}
    </p>
  );
}

export default async function CaseHistoryPrintPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: patient } = await supabase
    .from("current_patients")
    .select(
      "id, ward_id, display_name, bed, sex, age_years, admitted_on, uhid_ip_no, mrd_no, primary_diagnosis"
    )
    .eq("id", id)
    .maybeSingle();
  if (!patient) notFound();

  const [{ data: entriesData }, wardRanges, { data: ward }, specialty, formats] = await Promise.all([
    supabase.from("entries").select(SELECT).eq("patient_id", id).order("recorded_at", { ascending: true }),
    getWardLabRanges(patient.ward_id),
    supabase.from("wards").select("name").eq("id", patient.ward_id).maybeSingle(),
    getWardSpecialtyStored(patient.ward_id),
    getWardFormats(patient.ward_id),
  ]);
  const logoUrl = formats.get("logo")?.url ?? null;
  const pack = getSpecialtyPack(specialty);
  const oncology = pack.key === "medical_oncology";
  const female = !!patient.sex && /^f/i.test(patient.sex);

  const entries = (entriesData ?? []) as unknown as { is_case_history: boolean; observations: Observation[] }[];
  const allObservations = entries.flatMap((e) => e.observations).filter((o) => !isIdentifierLabel(o.label));
  const caseHistory = entries
    .filter((e) => e.is_case_history)
    .flatMap((e) => e.observations)
    .filter((o) => !isIdentifierLabel(o.label));

  // ---- Front: the history cards ----------------------------------------------------------
  const { sections, other } = summariseCaseHistory(caseHistory, { showAll: true });
  const byKey = new Map(sections.map((s) => [s.key, s]));
  // A card outside this unit's stack still prints when something was filed into it — nothing
  // recorded is dropped because the department would not normally ask it.
  const wanted = (keys: HistorySection["key"][], offered: boolean) =>
    keys.map((k) => byKey.get(k)!).filter((s) => offered || s.lines.length > 0);
  const cards = [
    ...wanted(BASE_HISTORY, true),
    ...wanted(["obstetric"], female || pack.key === "obstetrics_gynaecology"),
    ...wanted(ONCO_HISTORY, oncology),
  ];
  const lead = new Map(
    leadsFor(pack.key)
      .filter((l) => !l.ifRecorded || byKey.get(l.key)!.lines.length > 0)
      .map((l) => [l.key, l])
  );
  // Complaints and their story first, then the department's lead cards, then the rest — the
  // rest two to a row, since most are a line or an "NR".
  const [opening, remainder] = [cards.slice(0, 2), cards.slice(2)];
  // A lead that is one of the opening cards (the presenting illness) stays in its place and is
  // simply drawn as a lead block there.
  const leadCards = [...lead.keys()]
    .filter((k) => !opening.some((c) => c.key === k))
    .map((k) => cards.find((c) => c.key === k))
    .filter((c) => !!c);
  const restCards = remainder.filter((c) => !lead.has(c.key));

  // ---- Back: examination -----------------------------------------------------------------
  const examCards = [
    ...BASE_EXAM,
    ...(oncology || other.some((o) => ONCO_EXAM.some((c) => c.label === norm(o.label))) ? ONCO_EXAM : []),
  ];
  const cardLabels = new Set([...BASE_EXAM, ...ONCO_EXAM].map((c) => c.label));
  const performance = byKey.get("performance")!;
  const isInv = (o: Observation) => isImaging(o) || ["lab", "lab_report", "investigation"].includes(o.kind);

  // Vitals, PICCLE and any finding with no card of its own go through the same summary the
  // patient page uses; investigations are left to their own block below.
  const exam = summariseObjective(
    other
      .filter((o) => !cardLabels.has(norm(o.label)) && !isInv(o))
      .map((o) => ({
        id: o.id,
        label: o.label,
        value: o.value_text,
        recordedAt: o.recorded_at,
        refLow: o.ref_low,
        refHigh: o.ref_high,
        refText: o.ref_text,
      })),
    { sex: patient.sex, wardRanges }
  );

  // ---- Back: investigations, oldest first -----------------------------------------------
  const allReports = groupInvestigations(allObservations);
  const allImaging = allReports.filter((r) => isImaging(r.values[0]));
  const allBlood = allReports.filter((r) => !isImaging(r.values[0]));
  const blood = allBlood.slice(0, MAX_BLOOD).reverse();
  const imaging = allImaging.slice(0, MAX_IMAGING).reverse();
  const hiddenReports = allReports.length - blood.length - imaging.length;

  // ---- Back: summary and management ------------------------------------------------------
  const differential =
    caseHistory
      .find((o) => norm(o.label) === "differential diagnosis")
      ?.value_text?.split(/\s*;\s*|\s*\|\s*/)
      .map((s) => s.trim())
      .filter(Boolean) ?? [];
  const planItems = caseHistory
    .filter((o) => o.kind === "plan")
    .map((o) => (o.value_text ?? "").trim())
    .filter(Boolean);
  // The current drug list from the progress note — medication *history* is a history card.
  const currentMeds = allObservations.filter(
    (o) => o.kind === "medication" && !caseHistorySectionOf(o.label) && (o.value_text ?? "").trim()
  );

  const name = stripPatientHonorific(patient.display_name);
  const chief = byKey.get("chief")!;
  const past = byKey.get("past")!;
  const sub = "text-[9.5px] font-semibold uppercase";
  const ageSex = `${patient.age_years != null ? `${patient.age_years} yrs` : "NR"} / ${patient.sex ?? "NR"}`;

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col bg-background print:max-w-none print:bg-white">
      {/* A4, with a wider gutter on the binding edge for a hospital file — the left of the
          front, the right of the back, so a two-sided print punches cleanly. FitPage's page
          size is these margins subtracted from A4; change one, change the other. */}
      <style>{`
        @page { size: A4 portrait; margin: 12mm; }
        @page :right { margin-left: 20mm; }
        @page :left { margin-right: 20mm; }
        @media print { html, body { width: 210mm; background: #fff; -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
      `}</style>
      <header className="px-4 pb-3 pt-6 print:hidden">
        <Link href={`/patients/${id}/case-history`} className="text-[17px] text-accent">
          ‹ Case history
        </Link>
        <h1 className="mt-3 ios-large-title">Patient history sheet</h1>
        <p className="mt-1 text-[15px] text-muted">
          One A4 sheet: history on the front, examination to sign-off on the back. Choose
          two-sided in your browser&rsquo;s print dialog, or save as PDF.
        </p>
      </header>

      {/* Shown at its printed size, so scroll sideways on a phone. */}
      <section className="overflow-x-auto pb-6 print:overflow-visible print:pb-0">
        <div className="flex w-max flex-col gap-[30mm] px-[16mm] py-[14mm] text-black print:w-auto print:gap-0 print:p-0">
          {/* ---- Front ---- */}
          <FitPage breakAfter>
            {/* The unit's uploaded logo (the same one its discharge summary uses); an empty box
                marks the spot until one is uploaded on the unit's formats page. */}
            <div className="flex items-center gap-3 border-b-2 border-black pb-1.5">
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- ward-uploaded logo via a short-lived signed link.
                <img src={logoUrl} alt="" className="h-[17mm] w-[17mm] shrink-0 object-contain" />
              ) : (
                <div className="flex h-[17mm] w-[17mm] shrink-0 items-center justify-center border border-dashed border-black/50 text-center text-[8px] leading-tight text-black/50">
                  Hospital logo
                </div>
              )}
              <div className="flex-1 text-center">
                {ward?.name && <p className="text-[14px] font-bold">{ward.name}</p>}
                <p className="text-[10px] uppercase tracking-wide">Department of {pack.label}</p>
                <p className="mt-1 text-[15px] font-bold uppercase tracking-[0.12em]">Patient history sheet</p>
              </div>
              <div className="h-[17mm] w-[17mm] shrink-0" aria-hidden />
            </div>

            {/* Identifiers as a ruled grid, the way a hospital sheet prints them. */}
            <div className={"mt-1.5 grid grid-cols-4 border-l border-t border-black/60 " + body}>
              {[
                ["Name", name],
                ["Age / Sex", ageSex],
                ["Bed", patient.bed],
                ["Date of admission", patient.admitted_on?.slice(0, 10)],
                ["UHID / IP No", patient.uhid_ip_no],
                ["MRD No", patient.mrd_no],
                ["Department", pack.label],
                ["Unit", ward?.name],
              ].map(([k, v]) => (
                <div key={k} className="border-b border-r border-black/60 px-1 py-0.5">
                  <p className="text-[8.5px] uppercase text-black/70">{k}</p>
                  <p className="min-h-[1.35em] font-semibold">{v ?? <NR />}</p>
                </div>
              ))}
            </div>

            {opening.map((s) =>
              lead.has(s.key) ? (
                <LeadBlock key={s.key} section={s} table={lead.get(s.key)!.table} />
              ) : (
                <Block key={s.key} heading={s.label}>
                  <SectionLines section={s} />
                </Block>
              )
            )}

            {leadCards.map((s) => (
              <LeadBlock key={s.key} section={s} table={lead.get(s.key)!.table} />
            ))}

            <div className="grid grid-cols-2 gap-x-4">
              {restCards.map((s) => (
                <Block key={s.key} heading={s.label}>
                  <SectionLines section={s} />
                </Block>
              ))}
            </div>

            {/* Whatever the page has left, to write the history not yet recorded. */}
            <div className="mt-1.5 flex min-h-0 flex-1 flex-col">
              <p className={band}>Additional history</p>
              <Ruled min={14} />
            </div>
          </FitPage>

          {/* ---- Back ---- */}
          <FitPage>
            {/* The back is a separate side of paper: it carries who it belongs to. */}
            <div className="flex items-baseline justify-between border-b-2 border-black pb-1 text-[10.5px]">
              <p className="font-bold uppercase tracking-wide">Patient history sheet — examination &amp; management</p>
              <p>
                <span className="font-semibold">{name}</span> · {ageSex}
                {patient.uhid_ip_no && ` · ${patient.uhid_ip_no}`}
                {patient.bed && ` · Bed ${patient.bed}`}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-x-4">
              <Block heading="Examination — general physical">
                <Row label="Vitals">
                  {exam.vitals.length > 0 ? exam.vitals.map((v) => `${v.label} ${v.value}`).join(" · ") : <NR />}
                </Row>
                <Row label="General">
                  {exam.piccle ? (
                    <>
                      {exam.piccle.text}
                      {exam.piccle.notRecorded.length > 0 &&
                        ` · ${exam.piccle.notRecorded.join(", ").toLowerCase()} not recorded`}
                    </>
                  ) : (
                    <NR />
                  )}
                </Row>
                {(oncology || performance.lines.length > 0) && (
                  <Row label="Performance status">
                    {performance.lines.length > 0 ? performance.lines.map((l) => l.text).join("; ") : <NR />}
                  </Row>
                )}
              </Block>

              <Block heading="Examination — systemic & local">
                {examCards.map((c) => {
                  const values = other
                    .filter((o) => norm(o.label) === c.label)
                    .map((o) => (o.value_text ?? "").trim())
                    .filter(Boolean);
                  return (
                    <Row key={c.label} label={c.heading}>
                      {values.length > 0 ? values.join("; ") : <NR />}
                    </Row>
                  );
                })}
                {exam.findings.map((f) => (
                  <Row key={f.id} label={f.label}>
                    {f.value}
                  </Row>
                ))}
                {exam.normalCount > 0 && <p>Rest — NAD</p>}
              </Block>
            </div>

            {hasExamDiagram(pack.key) && (
              <div className="mt-1.5 break-inside-avoid border border-black/60">
                <p className={band + " border-b border-black/60"}>Diagram — mark findings</p>
                <div className="px-1 py-1">
                  <ExamDiagrams specialty={pack.key} />
                </div>
              </div>
            )}

            <Block heading="Latest investigations">
              {allReports.length === 0 ? (
                <p>None recorded.</p>
              ) : (
                <>
                  {blood.length > 0 && (
                    <>
                      <p className={sub}>Blood</p>
                      {blood.map((r) => (
                        <ReportLine key={r.id} report={r} sex={patient.sex} wardRanges={wardRanges} />
                      ))}
                    </>
                  )}
                  {imaging.length > 0 && (
                    <>
                      <p className={sub + (blood.length > 0 ? " mt-1" : "")}>Radiology</p>
                      {imaging.map((r) => (
                        <ReportLine key={r.id} report={r} sex={patient.sex} wardRanges={wardRanges} />
                      ))}
                    </>
                  )}
                  {hiddenReports > 0 && (
                    <p className="text-[9px] italic">
                      {hiddenReports} earlier report(s) not shown — see WardMate.
                    </p>
                  )}
                </>
              )}
            </Block>

            <Block heading="Summary">
              <Row label="Presenting with">
                {chief.lines.length > 0 ? chief.lines.map((l) => l.text).join("; ") : <NR />}
              </Row>
              <Row label="Past history">{past.lines.length > 0 ? past.lines.map((l) => l.text).join("; ") : past.note}</Row>
              <Row label="Provisional diagnosis">{patient.primary_diagnosis ?? <NR />}</Row>
              {differential.length > 0 && <Row label="Differential diagnosis">{differential.join("; ")}</Row>}
            </Block>

            {/* Management takes the rest of the page: what is recorded, then lines for orders. */}
            <div className="mt-1.5 flex min-h-0 flex-1 flex-col">
              <p className={band}>Management &amp; treatment</p>
              <div className={"mt-0.5 grid grid-cols-2 gap-x-4 px-1 " + body}>
                <div>
                  <p className={sub}>Plan</p>
                  {planItems.length > 0 ? planItems.map((p, i) => <p key={i}>• {p}</p>) : <NR />}
                </div>
                <div>
                  <p className={sub}>Current treatment</p>
                  {currentMeds.length > 0 ? (
                    currentMeds.map((m) => (
                      <p key={m.id}>
                        • {m.value_text}
                        {unconfirmed(m) && <span className="italic"> (unconfirmed)</span>}
                      </p>
                    ))
                  ) : (
                    <NR />
                  )}
                </div>
              </div>
              <Ruled min={21} />
            </div>

            <div className={"mt-2 flex break-inside-avoid gap-4 border-t-2 border-black pt-2 " + body}>
              <div className="grid flex-1 grid-cols-2 gap-x-4 gap-y-3.5">
                {["Doctor's name", "Designation", "Signature", "Date & time"].map((l) => (
                  <p key={l} className="flex items-end gap-1.5">
                    <span className="shrink-0 font-semibold">{l}:</span>
                    <span className="h-4 flex-1 border-b border-black/60" />
                  </p>
                ))}
              </div>
              <div className="flex h-[22mm] w-[38mm] items-start justify-center border border-black/60 pt-0.5 text-[9px] text-black/60">
                Stamp
              </div>
            </div>
          </FitPage>
        </div>
      </section>

      <section className="flex flex-col gap-2 px-4 pb-10 print:hidden">
        <PrintButton />
      </section>
    </div>
  );
}
