/**
 * The pilot ward's own letterhead — hospital block, unit, and doctor roster — read straight off
 * the blank discharge template it uploaded (including the ESIC seal at public/discharge/esic-logo.png).
 *
 * Deliberately hardcoded rather than routed through the ward's free-text `letterhead` field
 * (supabase/patches/0019_letterhead.sql): that field holds one plain block of text, which
 * cannot represent a logo image or the two-column doctor-roster layout the real template uses.
 * Fine for a single pilot ward; a second hospital onboarding later would need this pulled out
 * into a per-ward structured record (image + rows), not just typed text.
 */
export const HOSPITAL_LINES = [
  "E.S.I.C. MEDICAL COLLEGE & HOSPITAL",
  "NH-3, N.I.T. FARIDABAD, HARYANA",
  "DEPARTMENT OF GENERAL SURGERY",
];

/** Paired left/right rows under the hospital block — left is the OPD/OT schedule, right is the
 *  doctor roster, matching the template's layout. The first doctor has no OPD/OT line beside
 *  them, same as the template. */
export const LETTERHEAD_ROWS: { left: string; right: string }[] = [
  { left: "", right: "DR. SHAJI THOMAS" },
  { left: "OPD: TUESDAY & 2ND AND 4TH FRIDAY", right: "DR. VIKAS TYAGI" },
  { left: "OT: THURSDAY & 2ND AND 4TH SATURDAY", right: "DR. VAIBHAV SHARMA" },
];

export const LOGO_PUBLIC_PATH = "/discharge/esic-logo.png";
