/**
 * The pilot ward's own letterhead — hospital block, unit, and logo — read straight off the
 * blank discharge template it uploaded (the ESIC seal at public/discharge/esic-logo.png).
 *
 * No doctor roster or OPD/OT schedule here on purpose: that varies ward to ward, and this file
 * is shared across every ward, so it can only safely hold what's actually the same for all of
 * them — the hospital's own name and address. A per-ward roster would need to come from a real
 * per-ward setting (like the free-text `letterhead` field already does elsewhere), not this
 * shared file.
 *
 * Deliberately hardcoded rather than routed through the ward's free-text `letterhead` field
 * (supabase/patches/0019_letterhead.sql): that field holds one plain block of text, which
 * cannot represent a logo image. Fine for a single pilot ward; a second hospital onboarding
 * later would need this pulled out into a per-ward structured record, not just typed text.
 */
export const HOSPITAL_LINES = [
  "E.S.I.C. MEDICAL COLLEGE & HOSPITAL",
  "NH-3, N.I.T. FARIDABAD, HARYANA",
  "DEPARTMENT OF GENERAL SURGERY",
];

export const LOGO_PUBLIC_PATH = "/discharge/esic-logo.png";
