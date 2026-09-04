import { summariseCaseHistory } from "@/lib/case-history";

/** "a" · "a and b" · "a, b and c" — a plain-English list for a sentence, no Oxford comma. */
export function formatList(items: string[]): string {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}
import { summariseObjective, type WardRanges } from "@/lib/exam-summary";
import type { EtiologyKey, ImagingSummary } from "@/lib/imaging-summary";
import type { Observation } from "@/lib/patient-state";

/**
 * The clerking note, ordered the way a case sheet is written — see lib/case-history.ts for the
 * conventions it follows (past history always shown because silence there is itself
 * information; family history only when positive).
 *
 * Shared between the patient page and the case-history review workspace so the "as it will
 * read" preview and the filed summary are the same component, never two renderings that drift.
 */
export function CaseHistoryCard({
  observations,
  sex,
  wardRanges,
  etiology = null,
}: {
  observations: Observation[];
  sex: string | null;
  wardRanges: WardRanges;
  etiology?: EtiologyKey | null;
}) {
  const { sections, other } = summariseCaseHistory(observations);

  // Everything the note carries that isn't one of the history sections is the admission
  // examination — read the same way "Current progress" reads one, so the same vitals, PICCLE,
  // findings and lab-derangement rules apply regardless of which day an exam was written on.
  const exam = summariseObjective(
    other.map((o) => ({
      id: o.id,
      label: o.label,
      value: o.value_text,
      recordedAt: o.recorded_at,
      refLow: o.ref_low,
      refHigh: o.ref_high,
      refText: o.ref_text,
    })),
    { sex, wardRanges, etiology }
  );

  return (
    <div className="px-4 py-3 text-[15px] leading-relaxed">
      {sections
        .filter((section) => !section.hidden)
        .map((section) => (
          <div key={section.key} className="mb-2.5 last:mb-0">
            <p className="text-[12px] font-semibold uppercase tracking-wide text-muted">
              {section.label}
            </p>
            {section.lines.length > 0 ? (
              section.lines.map((line) => (
                <p key={line.id} className="mt-0.5">
                  {line.text}
                </p>
              ))
            ) : (
              // NR and NAD are different facts: nobody asked, versus somebody looked and there
              // was nothing. Only the first is a gap, so only the first is coloured as one.
              <p
                className={
                  "mt-0.5 " + (section.note === "NR" ? "text-orange-700" : "text-muted")
                }
              >
                {section.note}
              </p>
            )}
          </div>
        ))}

      {other.length > 0 && (
        <div className="mt-3 border-t border-line pt-2.5">
          <p className="mb-0.5 text-[12px] font-semibold uppercase tracking-wide text-muted">
            Examination
          </p>
          <ObjectiveSummaryView summary={exam} />
        </div>
      )}
    </div>
  );
}

/**
 * The rendering half of an objective examination — shared so "Current progress" and the case
 * history's examination read as the same document structured the same way, regardless of which
 * day the exam was recorded on.
 */
export function ObjectiveSummaryView({
  summary,
  outstanding = [],
  nadPhrases = [],
  pertinentNegatives = [],
  emptyText,
}: {
  summary: ReturnType<typeof summariseObjective>;
  /** Objective checklist items nobody dictated that have no "normal" phrase of their own —
   *  shown as "Drain, oral intake — NAD". */
  outstanding?: string[];
  /** The "normal" wording for objective items nobody dictated — "Afebrile", "Wound healthy,
   *  dry" (0056_normal_phrase). Printed as the note sentence itself, no "— NAD". */
  nadPhrases?: string[];
  /** Symptom checklist items nobody selected or dictated. On a round this reads as a
   *  pertinent negative — "no complaints of fever" — rather than a gap to chase. */
  pertinentNegatives?: string[];
  /** Shown when there is genuinely nothing to report. Omit to render nothing in that case. */
  emptyText?: string;
}) {
  const empty =
    summary.vitals.length === 0 &&
    !summary.piccle &&
    summary.findings.length === 0 &&
    summary.labs.length === 0 &&
    summary.keyLabs.length === 0 &&
    summary.mutedLabs.length === 0 &&
    !summary.imaging &&
    summary.normalLabCount === 0 &&
    summary.normalCount === 0;

  return (
    <div className="text-[15px] leading-relaxed">
      {summary.vitals.length > 0 && (
        <p className="tabular-nums">
          {summary.vitals.map((v) => `${v.label} ${v.value}`).join("  ·  ")}
        </p>
      )}

      {summary.piccle && (
        <p className={summary.vitals.length > 0 ? "mt-1" : ""}>
          {summary.piccle.text}
          {summary.piccle.notRecorded.length > 0 && (
            <span className="text-[13px] text-muted">
              {"  ·  "}
              {summary.piccle.notRecorded.join(", ").toLowerCase()} not recorded
            </span>
          )}
        </p>
      )}

      {/* The abnormalities, which are the reason anyone reads this section. */}
      {summary.findings.map((f) => (
        <p key={f.id} className="mt-1">
          <span className="text-muted">{f.label}</span> <span className="font-medium">{f.value}</span>
        </p>
      ))}

      {/* Deranged bloods, each with the range it was judged against so the judgement is
          checkable at a glance rather than taken on trust — see lib/lab-ranges.ts. */}
      {summary.labs.map((l) => (
        <p key={l.id} className="mt-1">
          <span className="text-muted">{l.label}</span>{" "}
          <span className="font-medium tabular-nums">{l.value}</span>
          {l.flag === "high" && <span className="ml-0.5 font-medium text-red-700">↑</span>}
          {l.flag === "low" && <span className="ml-0.5 font-medium text-red-700">↓</span>}
          {l.range && (
            <span className="ml-1 text-[13px] text-muted">
              ({l.range}
              {l.source === "builtin" ? " typical" : ""})
            </span>
          )}
          {l.when && <span className="ml-1 text-[13px] text-muted">· {l.when}</span>}
        </p>
      ))}

      {/* In-range bloods on the watch-list for this patient's problem — folded by default. The
          abnormal ones above are the reason anyone reads this card; a whole in-range panel
          (LFTs, lipids…) here just to watch one trend was burying them. The full picture, every
          report, is always in Investigations — this fold is a shortcut, not the only way in. */}
      {summary.keyLabs.length > 0 && (
        <details className="mt-1 [&[open]_.watch-chev]:rotate-90">
          <summary className="flex cursor-pointer list-none items-center gap-1.5 text-[13px] text-muted active:opacity-60 [&::-webkit-details-marker]:hidden">
            <span className="watch-chev text-[10px] transition-transform">▶</span>
            {summary.keyLabs.length} in-range result{summary.keyLabs.length === 1 ? "" : "s"} on the watch-list
          </summary>
          {summary.keyLabs.map((l) => (
            <p key={l.id} className="mt-1">
              <span className="text-muted">{l.label}</span>{" "}
              <span className="font-medium tabular-nums">{l.value}</span>
              {l.range && (
                <span className="ml-1 text-[13px] text-muted">
                  ({l.range}
                  {l.source === "builtin" ? " typical" : ""})
                </span>
              )}
              {l.when && <span className="ml-1 text-[13px] text-muted">· {l.when}</span>}
            </p>
          ))}
        </details>
      )}

      {summary.imaging && <ImagingReport imaging={summary.imaging} />}

      {summary.mutedLabs.length > 0 && <MutedLabs labs={summary.mutedLabs} />}

      {summary.normalLabCount > 0 && (
        <p className="mt-1 text-[13px] text-muted">
          {summary.normalLabCount} other blood{" "}
          {summary.normalLabCount === 1 ? "result" : "results"} within range
        </p>
      )}

      {summary.normalCount > 0 && <p className="mt-1 text-muted">Rest — NAD</p>}

      {empty && emptyText && <p className="text-muted">{emptyText}</p>}

      {pertinentNegatives.length > 0 && (
        <p className="mt-1.5 text-[13px] text-muted">
          No complaints of {formatList(pertinentNegatives)}.
        </p>
      )}

      {/* Objective checklist items nobody dictated. On a round the resident examines and
          speaks only what is abnormal, so an unmentioned item reads as its "normal" wording
          ("Afebrile", "Wound healthy") — or, for an item with no set phrase, "— NAD". Both
          only once something else in this section was recorded, so a bedside nobody has
          examined yet still says so. */}
      {nadPhrases.length > 0 && !empty && (
        <p className="mt-1.5 text-[13px] text-muted">
          {nadPhrases.join(". ").replace(/^./, (c) => c.toUpperCase())}.
        </p>
      )}
      {outstanding.length > 0 && !empty && (
        <p className="mt-1.5 text-[13px] text-muted">
          {outstanding.join(", ").replace(/^./, (c) => c.toUpperCase())} — NAD
        </p>
      )}
    </div>
  );
}

/**
 * The blood results deliberately kept off the face of the card — red-cell indices, an
 * eosinophil count, the liver panel on a gallstone patient. One tap shows every one of them,
 * with its value and range but no flag; the summary line says how many are outside range so
 * nothing is hidden without a count.
 */
function MutedLabs({
  labs,
}: {
  labs: ReturnType<typeof summariseObjective>["mutedLabs"];
}) {
  const out = labs.filter((l) => l.outOfRange).length;
  return (
    <details className="mt-1 [&[open]_.lab-chev]:rotate-90">
      <summary className="flex cursor-pointer list-none items-center gap-1.5 text-[13px] text-muted active:opacity-60 [&::-webkit-details-marker]:hidden">
        <span className="lab-chev text-[10px] transition-transform">▶</span>
        {labs.length} other blood {labs.length === 1 ? "result" : "results"}
        {out > 0 && ` · ${out} outside range`}
      </summary>
      <div className="mt-0.5">
        {labs.map((l) => (
          <p key={l.id} className="mt-1 text-[13px] text-muted">
            {l.label} <span className="tabular-nums">{l.value}</span>
            {l.range && ` (${l.range}${l.source === "builtin" ? " typical" : ""})`}
            {l.when && ` · ${l.when}`}
          </p>
        ))}
      </div>
    </details>
  );
}

/**
 * A radiology report shown the way it gets read on a round: the impression, then the organs
 * that bear on this patient's problem, then a fold that carries the whole study verbatim. The
 * fold is always there when anything was tucked into it — a shorter face never costs the reader
 * a line of the report, the same rule the raw transcript is kept under.
 */
function ImagingReport({ imaging }: { imaging: ImagingSummary }) {
  const line = (r: { id: string; label: string; value: string }) => (
    <p key={r.id} className="mt-1">
      <span className="text-muted">{r.label}</span>{" "}
      <span className="font-medium">{r.value}</span>
    </p>
  );

  return (
    <div className="mt-1.5">
      {imaging.impression ? (
        <p className="mt-1">
          <span className="text-muted">
            {imaging.modality ?? "Imaging"} — impression
          </span>{" "}
          <span className="font-medium">{imaging.impression.value}</span>
        </p>
      ) : (
        imaging.modality && (
          <p className="mt-1 text-[13px] text-muted">{imaging.modality}</p>
        )
      )}

      {imaging.key.map(line)}

      {imaging.hidden.length > 0 && (
        <details className="mt-1 [&[open]_.rep-chev]:rotate-90">
          <summary className="flex cursor-pointer list-none items-center gap-1.5 text-[13px] text-muted active:opacity-60 [&::-webkit-details-marker]:hidden">
            <span className="rep-chev text-[10px] transition-transform">▶</span>
            Full {imaging.modality ?? "report"} · {imaging.hidden.length} more{" "}
            {imaging.hidden.length === 1 ? "line" : "lines"}
          </summary>
          <div className="mt-0.5">{imaging.all.map(line)}</div>
        </details>
      )}
    </div>
  );
}
