import { createClient } from "@/lib/supabase/server";
import { applyCorrections, type Correction } from "@/lib/corrections";

export type GlossaryTerm = {
  wrong_term: string;
  correct_term: string;
  category: string | null;
};

/**
 * The unit's learned corrections, most-seen first.
 *
 * Only 'confirmed' terms — three sightings, see the promotion rule in
 * supabase/patches/0022_glossary_terms.sql. One resident mistyping something once should not
 * start rewriting everybody's transcripts.
 *
 * Returns nothing rather than throwing if the table is not there yet: this layer improves
 * transcription, it is not required for it, and a unit that has not run the patch must still be
 * able to record a round.
 */
export async function getGlossary(limit = 80): Promise<GlossaryTerm[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("glossary_terms")
      .select("wrong_term, correct_term, category")
      .eq("confidence", "confirmed")
      .order("times_seen", { ascending: false })
      .limit(limit);

    if (error) return [];
    return (data ?? []) as GlossaryTerm[];
  } catch {
    return [];
  }
}

/**
 * The glossary as prompt text, grouped by category.
 *
 * NOT currently wired into anything. The corrections are applied to the transcript instead —
 * see correctTranscript below for why that had to be the mechanism — and this is kept because
 * it was asked for and because it is what the prompt-hint approach would need if the exact-match
 * substitution ever turns out to miss too many near-misses. Delete it if that day does not come.
 */
export async function getPromptGlossary(limit = 80): Promise<string> {
  const terms = await getGlossary(limit);
  if (terms.length === 0) return "";

  const byCategory = terms.reduce<Record<string, string[]>>((acc, t) => {
    (acc[t.category ?? "other"] ??= []).push(`"${t.wrong_term}" → "${t.correct_term}"`);
    return acc;
  }, {});

  return Object.entries(byCategory)
    .map(([category, entries]) => `${category}:\n${entries.join("\n")}`)
    .join("\n\n");
}

/** Regex-safe, and matched on whole words so "pac" cannot fire inside "packed". */
function termPattern(wrong: string): RegExp {
  const escaped = wrong.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`\\b${escaped}\\b`, "gi");
}

/**
 * A transcript with both correction layers applied: the reviewed list in code first, then the
 * unit's own learned glossary.
 *
 * WHY THE TRANSCRIPT AND NOT THE PROMPT. Asking the model to "correct it silently" while
 * structuring cannot work here, and would fail in the worst way — quietly. Every observation
 * has to carry a source_quote that appears VERBATIM in the transcript, and lib/extract.ts
 * enforces that in code, discarding anything that does not match. A value the model corrected
 * on its way out has a quote that is no longer in the transcript, so it would be thrown away:
 * not wrong data, MISSING data, with nothing said about it. Correcting the transcript first
 * keeps the quote check honest and every corrected value intact.
 *
 * The code list runs first so a reviewed rule always beats a crowd-sourced one, and so this
 * behaves identically to before on a database with an empty glossary.
 *
 * Nothing is lost: the caller keeps the raw hearing in entries.original_transcript, and the
 * patient record shows it behind the (i) whenever it differs.
 */
export async function correctTranscript(
  raw: string
): Promise<{ text: string; changes: Correction[] }> {
  const first = applyCorrections(raw);
  let text = first.text;
  const changes = [...first.changes];

  for (const term of await getGlossary()) {
    text = text.replace(termPattern(term.wrong_term), (heard) => {
      if (heard === term.correct_term) return heard;
      if (!changes.some((c) => c.from === heard && c.to === term.correct_term)) {
        changes.push({ from: heard, to: term.correct_term });
      }
      return term.correct_term;
    });
  }

  return { text, changes };
}
