import { labTrends, sparklinePath, type LabTrend } from "@/lib/lab-trends";
import { canonicalLabName, classifyLab } from "@/lib/lab-ranges";
import type { Observation } from "@/lib/patient-state";
import type { WardRanges } from "@/lib/exam-summary";
import { shortDate } from "@/lib/format-date";
import { labReading } from "./investigations-section";

const W = 72;
const H = 22;

/**
 * The key labs across the admission, one row each: the latest value large, its flag in the
 * usual colour, and the line of every reading before it. Nothing is interpolated or
 * smoothed — the dots are the readings, the line only joins them. A lab read once shows its
 * one value and no line: a trend needs two points, and this draws none it does not have.
 */
export default function LabTrends({
  observations,
  sex,
  wardRanges,
}: {
  observations: Observation[];
  sex: string | null;
  wardRanges: WardRanges;
}) {
  const trends = labTrends(observations);
  if (trends.length === 0) return null;

  return (
    <div className="ios-group mb-3 divide-y divide-line">
      {trends.map((t) => (
        <TrendRow key={t.label} trend={t} sex={sex} wardRanges={wardRanges} observations={observations} />
      ))}
    </div>
  );
}

function TrendRow({ trend, sex, wardRanges, observations }: { trend: LabTrend; sex: string | null; wardRanges: WardRanges; observations: Observation[] }) {
  const last = trend.points[trend.points.length - 1];
  // Judged the way the report line is judged: the printed range first, then the ward's.
  const source = observations.find((o) => o.kind === "lab" && o.recorded_at === last.at && canonicalLabName(o.label) === trend.label) ?? null;
  const reading = source ? labReading(source, sex, wardRanges) : classifyLab(trend.label, last.text, sex);
  const flag = reading?.flag ?? null;
  const tone = flag ? "text-critical-fg" : "text-foreground";
  const path = sparklinePath(trend.points, W, H);
  const first = trend.points[0];

  return (
    <div className="flex items-center gap-3 px-4 py-2">
      <span className="w-20 shrink-0 text-subhead text-muted">{trend.label}</span>
      {path ? (
        <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="shrink-0" aria-label={`${trend.label}: ${trend.points.map((p) => p.text).join(", ")}`}>
          <polyline points={path} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" className="text-muted" />
          {trend.points.map((p, i) => {
            const [x, y] = path.split(" ")[i].split(",");
            return <circle key={i} cx={x} cy={y} r={i === trend.points.length - 1 ? 2.4 : 1.6} className={i === trend.points.length - 1 ? tone : "text-muted"} fill="currentColor" />;
          })}
        </svg>
      ) : (
        <span className="w-[72px] shrink-0 text-caption2 text-muted">once</span>
      )}
      <span className="min-w-0 flex-1 text-right">
        <span className={"text-body font-semibold tabular-nums " + tone}>{reading?.value ?? last.text}</span>
        {last.unit && <span className="ml-1 text-footnote text-muted">{last.unit}</span>}
        {flag && <span className="ml-1.5 text-caption font-semibold uppercase text-critical-fg">{flag}</span>}
        <span className="block text-caption2 text-muted">
          {trend.points.length > 1 ? `${first.text} on ${shortDate(first.at)} → ${shortDate(last.at)}` : shortDate(last.at)}
        </span>
      </span>
    </div>
  );
}
