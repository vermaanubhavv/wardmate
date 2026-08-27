/**
 * Teach the glossary a correction — fire-and-forget, no UI needed to wait on it.
 *
 * Used to run only when the resident tapped a separate "the app misheard this word" button
 * after already fixing a value, which meant the one thing most likely to actually improve
 * future transcripts depended on an extra tap most residents mid-round would skip. Now it
 * fires automatically the moment a correction is saved (see entry-card.tsx and
 * confirm-dictation.tsx): saving a fix already teaches it, silently, in the background.
 * See supabase/patches/0022_glossary_terms.sql — a term only starts correcting future
 * transcripts once it has been seen three times, so one odd edit cannot mis-teach the glossary.
 */
export function flagMisheard(wrongTerm: string, correctTerm: string, category: string | null = null) {
  const wrong = wrongTerm.trim();
  const correct = correctTerm.trim();
  if (!wrong || !correct || wrong === correct) return;

  void fetch("/api/glossary/flag", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ wrongTerm: wrong, correctTerm: correct, category }),
  }).catch(() => {
    // Best-effort teaching, not a required step — a failed post here must never block or
    // surface an error for the correction itself, which has already been saved.
  });
}
