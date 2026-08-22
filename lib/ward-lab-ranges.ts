import { createClient } from "@/lib/supabase/server";
import { canonicalLabName } from "@/lib/lab-ranges";
import type { WardRanges } from "@/lib/exam-summary";

/**
 * This ward's own reference ranges, as learned from the reports it has photographed.
 *
 * Used for results that arrive without a report to read — dictated on a round, or typed. A
 * result that came off a photograph carries the range printed beside it and never needs this.
 *
 * Where the same analyte has been seen with more than one range, the most-seen wins. That is
 * the whole reason seen_count exists: one misread photograph should not be able to displace a
 * range that fifty clean reports agree on. Rows arrive ordered so the first of each analyte is
 * the winner.
 */
export async function getWardLabRanges(wardId: string): Promise<WardRanges> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("lab_reference_ranges")
    .select("analyte, ref_low, ref_high, ref_text, seen_count")
    .eq("ward_id", wardId)
    .order("seen_count", { ascending: false });

  const out: WardRanges = new Map();
  for (const r of data ?? []) {
    // Keyed through the same function the lookup uses, so however the name was cased when it
    // was stored cannot cause a miss later.
    const key = canonicalLabName(r.analyte);
    if (out.has(key)) continue; // already have the most-seen range for this analyte
    out.set(key, {
      low: r.ref_low === null ? null : Number(r.ref_low),
      high: r.ref_high === null ? null : Number(r.ref_high),
      text: r.ref_text ?? null,
    });
  }
  return out;
}
