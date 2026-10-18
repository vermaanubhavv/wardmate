/**
 * How a scoring-engine suggestion reads on screen: short and pointed, "Consider …", never an
 * order. "Send CBC with differential and CRP" reads "Consider CBC with differential and CRP".
 * The patient's bed and name sit on the row beside it, so they are not repeated here. The
 * stored action is untouched.
 */
export function asSuggestion(action: string): string {
  const text = action.trim().replace(/[.?]$/, "");
  const rest = text.replace(/^(send|order|arrange|chart|do|get|check)\s+/i, "");
  // "Urgent review" → "urgent review"; an acronym ("CBC", "ECG") keeps its capitals.
  const first = /^[A-Z][a-z]/.test(rest) ? rest.charAt(0).toLowerCase() : rest.charAt(0);
  return `Consider ${first}${rest.slice(1)}`;
}
