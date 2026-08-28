/**
 * The hospital prescribing system's own vocabularies, captured from its Prescriptions page.
 *
 * Three things live here and nowhere else: the exact TEXT each dropdown shows, the option
 * VALUE behind it, and the mapping from WardMate's own neutral codes to both. Kept apart from
 * lib/medication-fields.ts on purpose — that file reads a dictation into neutral codes ("IV",
 * "TDS") and knows nothing about any hospital; this file is one hospital's dialect. A second
 * hospital means a second file like this, not a rewrite of the parser.
 *
 * WHY THE VALUE AND NOT JUST THE TEXT. The formulary taught this lesson expensively: its rows
 * repeat, so text is not an identity. These dropdowns repeat too — the route list holds "Oral"
 * (1), "ORAL / BY MOUTH" (26), "Intravenus" (2), "INTRA-VENOUS" (40) and "Intravenous route"
 * (8) as five separate entries. Anything that later fills this form must select by value; the
 * text is for a human to read on a printed summary.
 *
 * Captured 28 Aug 2026 from ClientSide_Prescriptions.aspx: 109 frequencies, 140 routes, 154
 * dose units. The subset below is what a general-surgery discharge actually uses.
 */

export type EsicOption = { text: string; value: string };

/**
 * ddlFrequency. The option value encodes the schedule as `id:perDay:durationUnit` — "120:3:3"
 * is TDS, three times, per day (3 = Days in ddlDuration). Stored whole, exactly as the page
 * has it, rather than rebuilt from parts.
 */
export const ESIC_FREQUENCY: Record<string, EsicOption> = {
  OD: { text: "OD - Once a Day", value: "53:1:3" },
  BD: { text: "BD - 2 times a day", value: "43:2:3" },
  TDS: { text: "TDS - 3 times a day", value: "120:3:3" },
  QID: { text: "QID - 4 times a day", value: "107:4:3" },
  HS: { text: "HS - Once at night", value: "128:1:3" },
  SOS: { text: "SOS - As and when necessary", value: "118:0:0" },
  STAT: { text: "Stat - Now", value: "119:1:3" },
  Q4H: { text: "Q4H - Every 4 hours", value: "84:6:3" },
  Q6H: { text: "Q6H - Every 6 hours", value: "94:4:3" },
  Q8H: { text: "Q8H - Every 8 hours", value: "99:3:3" },
  Q12H: { text: "Q12H - Every 12 hours", value: "60:2:3" },
};

/**
 * ddlAdminRoute. Where the list holds several spellings of one route, the ALL-CAPS entry is
 * chosen — that is what the unit's own filled prescriptions show ("ORAL / BY MOUTH",
 * "OPHTHALMIC / EYE"), so it matches what a pharmacist there is used to reading.
 */
export const ESIC_ROUTE: Record<string, EsicOption> = {
  PO: { text: "ORAL / BY MOUTH", value: "26" },
  IV: { text: "INTRA-VENOUS", value: "40" },
  IM: { text: "INTRA-MUSCULAR", value: "43" },
  SC: { text: "SUBCUTANEOUS", value: "41" },
  EYE: { text: "OPHTHALMIC / EYE", value: "35" },
  EAR: { text: "AURICULAR (OTIC) / EAR", value: "50" },
  NASAL: { text: "NASAL", value: "37" },
  PR: { text: "RECTAL", value: "38" },
  SL: { text: "SUBLINGUAL", value: "57" },
  INH: { text: "INHALATION / PULMONARY", value: "34" },
  TOP: { text: "TOPICAL", value: "48" },
};

/**
 * ddlDrugDose / ddlQuantityUOM — one list serving both.
 *
 * "puff" is deliberately absent: the list has no Puff(s), and Dose(s), Spray and Aerosol(s)
 * are each a different thing an inhaler could mean. An inhaler dose therefore prints its unit
 * blank on the ESIC column for a human to choose, rather than this file picking one.
 */
export const ESIC_DOSE_UNIT: Record<string, EsicOption> = {
  tablet: { text: "Tablet(s)", value: "213" },
  capsule: { text: "Capsule(s)", value: "183" },
  drop: { text: "Drop(s)", value: "496" },
  vial: { text: "Vial(s)", value: "540" },
  ampoule: { text: "Ampoule(s)", value: "484" },
  spray: { text: "Spray", value: "591" },
  dose: { text: "Dose(s)", value: "494" },
  unit: { text: "Unit", value: "168" },
  dram: { text: "Dram", value: "563" },
  teaspoon: { text: "Teaspoon", value: "594" },
  sachet: { text: "Sachet(s)", value: "528" },
  mg: { text: "mg", value: "92" },
  mcg: { text: "mcg (microgram)", value: "403" },
  g: { text: "gm", value: "390" },
  ml: { text: "ml", value: "120" },
  iu: { text: "IU", value: "404" },
};

/** ddlDuration — the unit beside the number, not the number itself. */
export const ESIC_DURATION_UNIT: Record<string, EsicOption> = {
  day: { text: "Days", value: "3" },
  week: { text: "Weeks", value: "7" },
  month: { text: "Months", value: "2" },
  year: { text: "Years", value: "1" },
};

/** The dropdown element ids on the page, for whatever later fills them. */
export const ESIC_FIELD_IDS = {
  medicationsTable: "gdvMedications",
  addMedication: "btnADDM",
  dose: "ddlDrugDose",
  duration: "ddlDuration",
  frequency: "ddlFrequency",
  quantityUom: "ddlQuantityUOM",
  route: "ddlAdminRoute",
} as const;

export const esicFrequency = (code: string | null) => (code ? (ESIC_FREQUENCY[code] ?? null) : null);
export const esicRoute = (code: string | null) => (code ? (ESIC_ROUTE[code] ?? null) : null);
export const esicDoseUnit = (code: string | null) => (code ? (ESIC_DOSE_UNIT[code] ?? null) : null);
export const esicDurationUnit = (code: string | null) =>
  code ? (ESIC_DURATION_UNIT[code] ?? null) : null;
