/**
 * The condition an operation was done for, when nobody recorded one.
 *
 * A patient reading "POD 6 LAPAROSCOPIC CHOLECYSTECTOMY (diagnosis not recorded)" is missing
 * something the ward already knows: a gall bladder is not removed at random. The operation
 * carries its indication, and a discharge summary whose FINAL DIAGNOSIS is blank while its
 * procedure line names a cholecystectomy is not being careful, it is being unhelpful.
 *
 * This is a fixed table, not a model call and not a guess. Each row is a mapping a surgical
 * unit would consider definitional, and nothing outside the table produces anything — an
 * operation this list has never heard of leaves the diagnosis exactly as blank as it was.
 * That is the difference between this and inventing a clinical value: there is no judgement
 * here to get wrong, and the reasoning is on the page for anyone to disagree with.
 *
 * It NEVER overrides a recorded diagnosis. A resident who said what they were treating has
 * said it; this only fills a silence, and every screen that shows it says where it came from.
 */
export type DerivedDiagnosis = { text: string; from: string };

const RULES: { match: RegExp; diagnosis: string }[] = [
  // Order matters where one operation's name contains another's.
  { match: /\blap(aroscopic)?\s*chol(e|y)cystectom/i, diagnosis: "Gall stone disease" },
  // "Lap chole" — the unit's own shorthand, and the label its template carries. Missed by the
  // full-word pattern above, which is how the most common wording on this ward would have been
  // the one case that did not work.
  { match: /\blap\s*chole\b/i, diagnosis: "Gall stone disease" },
  { match: /\bchol(e|y)cystectom/i, diagnosis: "Gall stone disease" },
  { match: /\binguinal\s+hernio(plasty|rrhaphy)|\bhernioplasty.*inguinal/i, diagnosis: "Inguinal hernia" },
  { match: /\bumbilical\s+hernio(plasty|rrhaphy)/i, diagnosis: "Umbilical hernia" },
  { match: /\bepigastric\s+hernio(plasty|rrhaphy)/i, diagnosis: "Epigastric hernia" },
  { match: /\bincisional\s+hernio(plasty|rrhaphy)/i, diagnosis: "Incisional hernia" },
  { match: /\bappendic(ectom|ectomy|ectomies)/i, diagnosis: "Acute appendicitis" },
  { match: /\bh(a)?emorrhoidectom/i, diagnosis: "Haemorrhoids" },
  { match: /\bfistulectom|\bfistulotom/i, diagnosis: "Fistula in ano" },
  { match: /\bsphincterotom/i, diagnosis: "Fissure in ano" },
];

/** The same mapping by template family, for a patient whose procedure text is empty but whose
 *  checklist was chosen at admission. Variant carries the detail for hernias and perianal. */
const BY_FAMILY: Record<string, Record<string, string> | string> = {
  lap_chole: "Gall stone disease",
  appendicectomy: { acute: "Acute appendicitis", interval: "Appendicitis" },
  hernia: {
    inguinal: "Inguinal hernia",
    umbilical: "Umbilical hernia",
    epigastric: "Epigastric hernia",
    incisional: "Incisional hernia",
  },
  perianal: {
    fissure: "Fissure in ano",
    fistula: "Fistula in ano",
    haemorrhoids: "Haemorrhoids",
  },
};

export function diagnosisFromProcedure(patient: {
  primary_diagnosis?: string | null;
  procedure_text?: string | null;
  template_family?: string | null;
  template_variant?: string | null;
}): DerivedDiagnosis | null {
  // A recorded diagnosis always wins. This fills silence; it does not correct anybody.
  if (patient.primary_diagnosis?.trim()) return null;

  const text = patient.procedure_text?.trim() ?? "";
  if (text) {
    const rule = RULES.find((r) => r.match.test(text));
    if (rule) return { text: rule.diagnosis, from: text };
  }

  const family = patient.template_family;
  if (family && BY_FAMILY[family]) {
    const entry = BY_FAMILY[family];
    if (typeof entry === "string") return { text: entry, from: family };
    const variant = patient.template_variant;
    if (variant && entry[variant]) return { text: entry[variant], from: `${family} · ${variant}` };
  }

  return null;
}
