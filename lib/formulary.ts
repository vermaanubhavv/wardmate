import { createClient } from "@/lib/supabase/server";

/**
 * The ward's hospital formulary, and what each drug WardMate records corresponds to in it.
 *
 * The whole point of this file is that it does not match anything. Tested against a real
 * 1,557-row formulary, nearest-text matching sent six of ten common drugs to a combination
 * product or the wrong route — "pantoprazole" landed on "Domperidone 30mg., Pantoprazole 40mg."
 * before it reached plain "Pantoprazole Caps/Tab. 40mg.". So the only mappings that exist are
 * ones a clinician looked at and chose; searchFormulary below offers candidates to a human and
 * nothing here ever picks between them.
 *
 * See supabase/patches/0047_ward_formulary.sql.
 */

/** The lookup key for a drug: short, lowercased, punctuation-free, so "T. Pan" and "pan" and
 *  "Pan." all reach the same confirmed mapping. Deliberately built from extraction's own drug
 *  LABEL rather than the whole dictated phrase, which carries dose and route too. */
export function drugKey(label: string): string {
  return label
    .toLowerCase()
    .replace(/\b(tab|tabs|t|cap|caps|c|syp|syrup|inj|injection|mdi|oint|ointment)\b\.?/g, " ")
    .replace(/[^a-z0-9 ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export type FormularyMapping = { drugKey: string; itemText: string };

/** Every confirmed mapping for this ward, as a lookup from drug key to formulary entry. */
export async function getFormularyMappings(wardId: string): Promise<Map<string, string>> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("medication_formulary_map")
    .select("drug_key, item_text")
    .eq("ward_id", wardId);

  return new Map((data ?? []).map((r) => [r.drug_key as string, r.item_text as string]));
}

/** How many formulary entries this ward has imported — 0 means the feature is not set up yet,
 *  which every screen should treat as "say nothing" rather than "nothing matched". */
export async function getFormularySize(wardId: string): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("ward_formulary_items")
    .select("id", { count: "exact", head: true })
    .eq("ward_id", wardId);
  return count ?? 0;
}

/**
 * Formulary entries whose text contains every word of the query, for a human to choose from.
 *
 * Every word rather than the whole string, so "pantoprazole 40" finds "Pantoprazole Caps/Tab.
 * 40mg." — a resident should not have to guess the hospital's punctuation. Ordered shortest
 * first, which puts the plain single-agent entry above the combination products that merely
 * mention the same drug; that is a display order to read, never a selection.
 */
export async function searchFormulary(wardId: string, query: string, limit = 25): Promise<string[]> {
  const words = query.toLowerCase().split(/\s+/).filter((w) => w.length > 1);
  if (words.length === 0) return [];

  const supabase = await createClient();
  let q = supabase.from("ward_formulary_items").select("item_text").eq("ward_id", wardId);
  for (const w of words) q = q.ilike("item_text", `%${w}%`);

  const { data } = await q.limit(200);
  return (data ?? [])
    .map((r) => r.item_text as string)
    .sort((a, b) => a.length - b.length || a.localeCompare(b))
    .slice(0, limit);
}
