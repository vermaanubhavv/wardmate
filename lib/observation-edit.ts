/**
 * What a hand-edit writes back besides the new words.
 *
 * A value that was ever flagged dangerous (a number, a drug, a dose), or that now contains a
 * figure, goes back to amber: the resident typed it, but typing has its own slips, and the
 * record's rule is that such values stay unconfirmed until confirmed in a separate act.
 * value_num follows the text only where the row was numeric to begin with — a figure is read
 * out of the new words, never guessed.
 */
export function editedObservationPatch(
  before: { needs_confirmation: boolean; value_num: number | null },
  value: string,
) {
  const dangerous = before.needs_confirmation || /\d/.test(value);
  return {
    needs_confirmation: dangerous,
    confirmed_at: null,
    confirmed_by: null,
    value_num: before.value_num === null ? null : firstNumber(value),
  };
}

function firstNumber(text: string): number | null {
  const m = text.match(/-?\d+(?:\.\d+)?/);
  return m ? Number(m[0]) : null;
}
