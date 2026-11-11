import { canonicalLabName, firstNumber } from "@/lib/lab-ranges";

/** The labs a round watches across an admission, in the order they are shown. */
export const TREND_LABS = ["Hb", "TLC", "Platelets", "Creatinine", "Urea", "Na", "K", "T. bilirubin"] as const;

export type TrendPoint = { at: string; value: number; text: string; unit: string | null };
export type LabTrend = { label: string; points: TrendPoint[] };

type Row = { kind: string; label: string; value_text: string | null; value_num: number | null; unit: string | null; recorded_at: string };

/**
 * One series per key lab, oldest first, from every lab value on the record — the numbers as
 * recorded, nothing interpolated and nothing judged here (the flag is the caller's, from the
 * same classifyLab everything else uses). A value with no readable number is left out of the
 * series rather than plotted as zero. Only labs with at least one reading are returned; the
 * caller decides what one point looks like.
 */
export function labTrends(observations: Row[]): LabTrend[] {
  const byLab = new Map<string, TrendPoint[]>();
  for (const o of observations) {
    if (o.kind !== "lab") continue;
    const name = canonicalLabName(o.label);
    if (!(TREND_LABS as readonly string[]).includes(name)) continue;
    const n = o.value_num ?? firstNumber(o.value_text);
    if (n === null) continue;
    byLab.set(name, [...(byLab.get(name) ?? []), { at: o.recorded_at, value: n, text: o.value_text ?? String(n), unit: o.unit }]);
  }
  return TREND_LABS.filter((l) => byLab.has(l)).map((label) => ({
    label,
    points: byLab.get(label)!.sort((a, b) => a.at.localeCompare(b.at)),
  }));
}

/** The polyline for a sparkline box of w×h: x by order, y by value, with a little headroom. */
export function sparklinePath(points: TrendPoint[], w: number, h: number): string {
  if (points.length < 2) return "";
  const values = points.map((p) => p.value);
  const lo = Math.min(...values);
  const hi = Math.max(...values);
  const span = hi - lo || 1;
  const pad = 2;
  return points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * (w - 2 * pad) + pad;
      const y = h - pad - ((p.value - lo) / span) * (h - 2 * pad);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}
