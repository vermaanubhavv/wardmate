/**
 * A stored clinical value, written the way a clinician would write it — for display only.
 *
 * Values are stored exactly as they were said or printed (`value_text`), and that never changes:
 * the source quote under a value is still the lab report's own line. But the report's printing
 * is a machine's — "15640.00", "9.80" — and it reached the ward list, the handover and the
 * discharge summary as-is. A malformed one (".2.14") read like a number that it is not, which
 * is worse than noise: on a handover it looks like a platelet count.
 *
 * So, and only so:
 * - A plain number loses trailing zeros after the point and gains Indian digit grouping:
 *   "15640.00" → "15,640", "9.80" → "9.8", "0.50" → "0.5". The value is not changed, only
 *   written shorter; no rounding ever happens.
 * - Something shaped like a number that is not one (".2.14", "1..2") is "Unreadable".
 * - A printed blank ("--", "—", "NA" on its own) is "Not reported".
 * - Anything else — "120/80", "A febrile", "Passed", "2+" — is returned untouched.
 */
export function displayValue(raw: string | null | undefined): string {
  const text = (raw ?? "").trim();
  if (text === "" || /^[-–—.]+$/.test(text) || /^n\/?a$/i.test(text)) return "Not reported";

  const bare = text.replace(/,/g, "");
  if (/^[-+]?(\d+(\.\d*)?|\.\d+)$/.test(bare)) return formatNumber(bare);

  // Digits and dots only, but not one number: two points, a stray leading point and so on.
  if (/^[-+]?[\d.]+$/.test(bare) && /\d/.test(bare)) return "Unreadable";

  return text;
}

/** True when displayValue() could not show the value as written — for styling it as a gap. */
export function isUnreadable(raw: string | null | undefined): boolean {
  const shown = displayValue(raw);
  return shown === "Unreadable" || shown === "Not reported";
}

function formatNumber(bare: string): string {
  const negative = bare.startsWith("-");
  const unsigned = bare.replace(/^[-+]/, "");
  const [whole, fraction = ""] = unsigned.split(".");
  const trimmed = fraction.replace(/0+$/, "");
  // Grouping is done on the digits, never through Number(): a long value must not pick up
  // floating-point error on its way to the screen.
  const grouped = groupIndian(whole === "" ? "0" : whole.replace(/^0+(?=\d)/, ""));
  return (negative ? "-" : "") + grouped + (trimmed ? `.${trimmed}` : "");
}

/** 1,23,45,678 — the last three digits, then pairs. Four-digit values stay ungrouped (1500),
 *  as they are written on Indian lab reports. */
function groupIndian(digits: string): string {
  if (digits.length <= 4) return digits;
  const last3 = digits.slice(-3);
  const rest = digits.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ",");
  return `${rest},${last3}`;
}

/**
 * A field label in one style: sentence case. Labels come from two places — the checklist
 * templates ("P/A", "Chest") and the extractor, which writes them in lower case ("drain",
 * "oral intake") — and the patient page showed both side by side. A label that already carries
 * a capital (an abbreviation, "P/A", "CVS", "PAC") is the author's and is left alone.
 */
export function displayLabel(label: string): string {
  const t = label.trim();
  if (/[A-Z]/.test(t)) return t;
  return t.charAt(0).toUpperCase() + t.slice(1);
}
