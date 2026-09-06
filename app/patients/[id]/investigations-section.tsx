import { classifyLab, canonicalLabName, type SuppliedRange } from "@/lib/lab-ranges";
import { groupInvestigations } from "@/lib/investigations";
import type { Observation } from "@/lib/patient-state";
import type { WardRanges } from "@/lib/exam-summary";

/**
 * Everything ever sent on this patient, one line per report.
 *
 * The record holds analytes; a resident holds reports. "CBC · 3 Sep" closed, and the counts
 * underneath when opened — so a week's investigations are eight lines instead of eighty, and
 * two CBCs three days apart sit as two lines, which is the only way a falling haemoglobin is
 * visible at all.
 *
 * A deranged result is marked here exactly as it is marked everywhere else in the app: judged
 * against the range printed on its own report first, then this ward's learned range, then the
 * built-in table — and never against nothing. A result with no range to judge it by is shown
 * plain rather than given a colour it has not earned. See lib/lab-ranges.ts.
 */
export default function InvestigationsSection({
  observations,
  sex,
  wardRanges,
}: {
  observations: Observation[];
  sex: string | null;
  wardRanges: WardRanges;
}) {
  const reports = groupInvestigations(observations);

  if (reports.length === 0) {
    return (
      <section className="px-4 pb-6">
        <p className="ios-group p-5 text-[15px] text-muted">
          Nothing sent yet. Photograph a report or say the results and they will be filed here.
        </p>
      </section>
    );
  }

  return (
    <section className="px-4 pb-6">
      <p className="ios-group-header mb-2 px-4">Investigations · {reports.length}</p>
      <ul className="flex flex-col gap-2">
        {reports.map((report) => (
          <li key={report.id}>
            <details className="ios-group [&[open]_.inv-chev]:rotate-90">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-[15px] active:bg-chip [&::-webkit-details-marker]:hidden">
                <span className="min-w-0 truncate">
                  <span className="font-semibold">{report.panel}</span>
                  <span className="ml-1.5 text-muted">({report.dayLabel})</span>
                </span>
                <span className="flex shrink-0 items-center gap-2">
                  {/* A photographed value nobody has checked against the photograph yet says so
                      on the closed line, because that is the state in which it would otherwise
                      be read as confirmed fact. */}
                  {report.needsConfirmation && (
                    <span className="rounded-full border border-orange-300 bg-orange-50 px-2 py-0.5 text-[12px] font-semibold text-orange-800">
                      To confirm
                    </span>
                  )}
                  <span className="text-[13px] text-muted tabular-nums">
                    {report.values.length}
                  </span>
                  <span className="inv-chev text-xl font-normal text-muted transition-transform">
                    &#8250;
                  </span>
                </span>
              </summary>

              <ul className="divide-y divide-line border-t border-line">
                {report.values.map((value) => {
                  // The range printed on this very report, then this ward's own learned range.
                  // Neither invented: with no range from either, classifyLab falls back to its
                  // built-in table, and where it has none it returns null and the value prints
                  // plain.
                  let supplied: SuppliedRange | null = null;
                  if (value.ref_low != null || value.ref_high != null) {
                    supplied = {
                      low: value.ref_low ?? null,
                      high: value.ref_high ?? null,
                      text: value.ref_text ?? null,
                      source: "report",
                    };
                  } else {
                    const ward = wardRanges.get(canonicalLabName(value.label));
                    if (ward) supplied = { ...ward, source: "ward" };
                  }

                  const reading = classifyLab(value.label, value.value_text, sex, supplied);

                  return (
                    <li key={value.id} className="flex items-baseline gap-3 px-4 py-2.5">
                      <span className="min-w-0 flex-1 text-[15px]">
                        {reading?.label ?? value.label}
                      </span>
                      <span
                        className={
                          "shrink-0 text-[15px] tabular-nums " +
                          (reading?.flag ? "font-semibold text-red-600" : "")
                        }
                      >
                        {value.value_text ?? "—"}
                        {value.unit ? ` ${value.unit}` : ""}
                      </span>
                      {/* The colour shows its work, the same way the vitals tiles do — a flag
                          with no stated range is the "trust me" this app refuses. */}
                      {reading?.flag && reading.range && (
                        <span className="shrink-0 text-[12px] font-medium text-red-600">
                          ({reading.range})
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </details>
          </li>
        ))}
      </ul>
    </section>
  );
}
