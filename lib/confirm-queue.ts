import { createClient } from "@/lib/supabase/server";
import { compareBeds, stripPatientHonorific } from "@/lib/patients";
import { classifyLab, type LabFlag, type SuppliedRange } from "@/lib/lab-ranges";
import { displayValue } from "@/lib/display-value";

/**
 * Everything on the unit still waiting to be checked: every value marked `needs_confirmation`
 * and not yet confirmed — a number, drug or dose heard on a round, a value read off a photo,
 * two recordings that disagree.
 *
 * It was conflicts only for a while, while the ward tile and each patient's row counted
 * different things under the same word: "Confirm · 8" on the unit, "21 to confirm" on one
 * patient. One count now, the same set everywhere it is shown, and each card says why it is
 * waiting (its own `reason`) instead of the whole screen claiming "two recordings disagree".
 */
export type PendingConfirm = {
  id: string;
  patient_id: string;
  patient_name: string;
  bed: string;
  kind: string;
  label: string;
  value_text: string | null;
  source_quote: string;
  conflict_note: string | null;
  recorded_at: string;
  unit: string | null;
  /** Where the value came from: said on a round, read off a photo, or typed. */
  source: "voice" | "photo" | "manual";
  /** The photo it was read off, for showing beside it. Null for a spoken or typed value. */
  photo_path: string | null;
  /** Why it is waiting, in one short phrase for the card. */
  reason: string;
  /** Low/high against the printed range (or the built-in one), shown with that range. */
  flag: LabFlag | null;
  range: string | null;
};

/** Why a value is waiting, short enough to sit beside the label. A conflict note says it best
 *  when there is one; the photo reader's long "Printing was unclear — check against the photo."
 *  is said in two words, since the photo is right above the card. */
export function reasonFor(r: { conflict_note: string | null; kind: string; source: string }): string {
  if (r.conflict_note) return /print(ing|ed)?\b.*unclear/i.test(r.conflict_note) ? "Printing unclear" : r.conflict_note;
  if (r.source === "photo") return "Read off a photo";
  if (r.kind === "medication") return "Drug or dose";
  if (r.source === "manual") return "Typed in";
  return "Heard on the round";
}

/** The printed range written the way the value is: "40.00 - 80.0" as "40–80". */
function rangeText(low: number | null, high: number | null, printed: string | null): string | null {
  if (low != null && high != null) return `${displayValue(String(low))}–${displayValue(String(high))}`;
  if (low != null) return `≥ ${displayValue(String(low))}`;
  if (high != null) return `≤ ${displayValue(String(high))}`;
  return printed;
}

export async function getWardPendingConfirmations(wardId: string): Promise<PendingConfirm[]> {
  const supabase = await createClient();

  const { data: patients } = await supabase
    .from("patients")
    .select("id, display_name, bed, sex")
    .eq("ward_id", wardId)
    .eq("status", "active");
  if (!patients || patients.length === 0) return [];

  const byId = new Map(patients.map((p) => [p.id, p]));

  const { data: rows } = await supabase
    .from("observations")
    .select(
      "id, patient_id, kind, label, value_text, unit, source_quote, conflict_note, recorded_at, ref_low, ref_high, ref_text, entries(source, photo_path)"
    )
    .in(
      "patient_id",
      patients.map((p) => p.id)
    )
    .eq("needs_confirmation", true)
    .is("confirmed_at", null)
    .order("recorded_at", { ascending: false });

  return (rows ?? [])
    .filter((r) => byId.has(r.patient_id))
    .map((r) => {
      const p = byId.get(r.patient_id)!;
      const entry = (Array.isArray(r.entries) ? r.entries[0] : r.entries) as
        | { source: "voice" | "photo" | "manual"; photo_path: string | null }
        | null;
      const source = entry?.source ?? "voice";
      // The range printed on the report when there is one, otherwise the built-in table; with
      // neither, no flag — the value is never judged against nothing.
      const supplied: SuppliedRange | null =
        r.ref_low != null || r.ref_high != null
          ? { low: r.ref_low, high: r.ref_high, text: r.ref_text, source: "report" }
          : null;
      const reading = r.kind === "lab" ? classifyLab(r.label, r.value_text, p.sex ?? null, supplied) : null;
      return {
        id: r.id as string,
        patient_id: r.patient_id as string,
        patient_name: stripPatientHonorific(p.display_name),
        bed: p.bed ?? "—",
        kind: r.kind as string,
        label: r.label as string,
        value_text: r.value_text as string | null,
        source_quote: r.source_quote as string,
        conflict_note: r.conflict_note as string | null,
        recorded_at: r.recorded_at as string,
        unit: (r.unit as string | null) ?? null,
        source,
        photo_path: entry?.photo_path ?? null,
        reason: reasonFor({ conflict_note: r.conflict_note, kind: r.kind, source }),
        flag: reading?.flag ?? null,
        range: reading?.flag ? (supplied ? rangeText(r.ref_low, r.ref_high, reading.range) : reading.range) : null,
      };
    })
    .sort((a, b) => compareBeds(a.bed, b.bed) || a.recorded_at.localeCompare(b.recorded_at));
}

/** Just the count, for the ward screen's "To check" cell — the same set
 *  getWardPendingConfirmations lists above, so the number and the screen always agree. */
export async function countWardPendingConfirmations(wardId: string): Promise<number> {
  const supabase = await createClient();
  // One round trip: the ward's active patients are joined through rather than listed first.
  const { count } = await supabase
    .from("observations")
    .select("id, patients!inner(ward_id, status)", { count: "exact", head: true })
    .eq("patients.ward_id", wardId)
    .eq("patients.status", "active")
    .eq("needs_confirmation", true)
    .is("confirmed_at", null);

  return count ?? 0;
}
