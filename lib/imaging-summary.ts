/**
 * Folding a radiology report down to the lines that matter for THIS patient's problem.
 *
 * A USG abdomen dictated off a printed report comes back through extraction as a dozen separate
 * observations — "Liver span 17.6 cm", "Gall bladder calculus size 17 mm", "IHBRD / SOL — none",
 * "Pancreas — normal size/echotexture", and so on down the page. Every one of them is real, and
 * on the record screen they stack up under OBJECTIVE and bury the two lines a surgeon rounding
 * on a gallstone patient actually wants: what the impression was, and what the biliary tree
 * looked like.
 *
 * So this groups those lines back into the one report they came from and decides, from the
 * patient's own diagnosis, which organs are worth showing on the face of the card. The rest is
 * never deleted — it moves behind a "full report" fold, verbatim, the same way the raw
 * transcript always stays one tap away. The safety direction is the same one lib/lab-ranges.ts
 * and lib/exam-summary.ts lean: a line wrongly tucked into the fold costs a tap to find; a line
 * wrongly shown costs nothing. When in doubt this shows more, not less — and when the diagnosis
 * is not one it recognises, it hides nothing at all and only does the grouping.
 *
 * WHAT IT DOES NOT DO: it does not read the findings and decide they "sound abnormal", it does
 * not write an impression the report did not carry, and it does not reorder or reword a single
 * value. Picking which of the report's own lines to surface first is a layout decision, not a
 * clinical one.
 */

import { RADIOLOGY_LABEL } from "@/lib/radiology-flags";

/** A finding row as lib/exam-summary.ts holds it — label and value exactly as recorded. */
export type ImagingRow = { id: string; label: string; value: string };

export type ImagingSummary = {
  /** "USG abdomen", "CECT abdomen" — the report's own name for itself, when one was recorded. */
  modality: string | null;
  /** The impression / conclusion line, when the report carried one that reads as such. */
  impression: ImagingRow | null;
  /** The organ lines worth showing on the face of the card, in the order the etiology wants
   *  them. Equal to every non-impression line when the diagnosis is not one we key on. */
  key: ImagingRow[];
  /** Lines held behind the "full report" fold. Empty when nothing is being hidden. */
  hidden: ImagingRow[];
  /** Every line of the report, impression first, in a stable order — what the fold shows so a
   *  tidier face never costs the reader the whole study. */
  all: ImagingRow[];
};

/**
 * The disease families this module knows how to trim a report for. Anything not on this list
 * gets the grouping but no trimming — see summariseImaging.
 */
export type EtiologyKey =
  | "biliary"
  | "pancreatitis"
  | "renal"
  | "appendicitis"
  | "bowel-obstruction"
  | "hepatic";

/** How a stated diagnosis maps to one of the families above. First match wins, so the more
 *  specific patterns come first. */
const ETIOLOGY_PATTERNS: { key: EtiologyKey; re: RegExp }[] = [
  {
    key: "biliary",
    re: /cholelith|gall\s*stone|gall\s*bladder calcul|\bgb calcul|cholecystitis|cholangitis|choledocholith|\bcbd (stone|calcul)|mirizzi|biliary colic|obstructive jaundice|\bcbd\b/i,
  },
  { key: "pancreatitis", re: /pancreatit/i },
  {
    key: "renal",
    re: /renal (colic|calcul)|ureteric calcul|nephrolith|urolith|hydronephro|pyelonephrit|kidney stone|staghorn|\bpuj\b obstruction/i,
  },
  { key: "appendicitis", re: /appendic/i },
  {
    key: "bowel-obstruction",
    re: /intestinal obstruction|bowel obstruction|\bsbo\b|\blbo\b|\baio\b|volvulus|intussuscept|obstructed hernia|adhesive obstruction/i,
  },
  { key: "hepatic", re: /liver abscess|hepatic abscess|\bhcc\b|hepatocellular|liver\s*sol|hydatid|cirrhosis|portal hypertension/i },
];

/**
 * Which of the report's organ lines a given etiology wants on the face of the card, in the
 * order it wants to read them. Each regex is tested against "label value" lowercased. Broad on
 * purpose — a false positive here just shows one extra line.
 */
const ETIOLOGY_ORGANS: Record<EtiologyKey, RegExp[]> = {
  biliary: [
    /gall\s*bladder|\bgb\b|cholecyst|pericholecystic|biliary sludge|\bsludge\b/i,
    /\bcbd\b|common bile duct|\bihbrd?\b|intrahepatic (biliary|duct)|biliary radicle|\bpv\b|portal vein/i,
    /\bliver\b|hepat|fatty liver/i,
    /pancrea/i,
  ],
  pancreatitis: [
    /pancrea/i,
    /peripancreatic|acute (peripancreatic|necrotic)|collection|\bwon\b|pseudocyst|necros|fat strand/i,
    /\bcbd\b|common bile duct|biliary/i,
    /gall\s*bladder|\bgb\b|cholecyst/i,
    /free fluid|ascites|pleural (effusion|fluid)/i,
  ],
  renal: [
    /kidney|renal (cortex|calcul|pelvi|parenchyma)|\brk\b|\blk\b|nephro/i,
    /\bureter|\bpuj\b|\bvuj\b|hydroureter/i,
    /hydronephro|pelvicalyceal|\bpcs\b/i,
    /urinary bladder|\bub\b|bladder/i,
    /prostate/i,
  ],
  appendicitis: [
    /appendix|appendic|appendicolith/i,
    /ileocaec|ileo-caec|right iliac fossa|\brif\b|caecum|terminal ileum/i,
    /collection|abscess|phlegmon/i,
    /free fluid|ascites/i,
    /lymph node|mesenteric aden/i,
  ],
  "bowel-obstruction": [
    /bowel loop|small bowel|large bowel|dilated (bowel|loop|small|large)|jejun|ileal|ileum|colon/i,
    /transition (point|zone)|collapsed (distal|bowel|loop)|calibre change/i,
    /free fluid|ascites/i,
    /hernia/i,
    /\bappendix\b|closed loop|pneumatosis|ischaem|ischem/i,
  ],
  hepatic: [
    /\bliver\b|hepat|liver span/i,
    /\bsol\b|lesion|abscess|\bmass\b|\bcyst\b|hydatid|collection/i,
    /portal vein|\bpv\b|\bcbd\b|\bihbrd?\b/i,
    /spleen|splen/i,
    /free fluid|ascites/i,
  ],
};

/**
 * Report field names that mark a line as part of a radiology study rather than a bedside
 * finding. A ward examination does not produce "liver span", "echotexture" or "IHBRD / SOL" as
 * separate rows; a printed USG report does. Used only to gather a report's lines together —
 * never to judge them.
 */
const IMAGING_FIELD =
  /gall\s*bladder|\bgb\b|cholecyst|pericholecystic|biliary sludge|liver span|hepatomegaly|echotext|fatty liver|steatos|\bihbrd?\b|intrahepatic|biliary radicle|\bcbd\b|common bile duct|portal vein|\bp\.?v\b|pancrea|\bsol\b|calculus|calcul[iu]|\bkidney|renal (cortex|calcul|pelvi|parenchyma|size)|cortico-?medullary|\bureter|urinary bladder|hydronephro|pelvicalyceal|prostate|spleen|splenomegal|ascites|free fluid|peripancreatic|wall (thickness|thickened)|mural|sludge|appendix|probe tender|collection|lymph node|distended|\bw\.?t\.?\b/i;

/** A line whose own wording says it is the conclusion of the study. */
const IMPRESSION_LABEL = /impression|conclusion|opinion|comment|summary|\bs\/o\b|advice/i;
const IMPRESSION_VALUE =
  /^(s\/o\b|suggestive of|impression\b|features? (of|suggestive)|consistent with|likely\b|picture of|\?)/i;

const norm = (r: ImagingRow) => `${r.label} ${r.value}`.toLowerCase();

/** Does this line name the study itself — "USG abdomen and pelvis", "CECT abdomen"? */
function isModalityLine(r: ImagingRow): boolean {
  return RADIOLOGY_LABEL.test(r.label) || RADIOLOGY_LABEL.test(r.value);
}

/**
 * The disease family a free-text diagnosis belongs to, or null when it is not one this module
 * trims for. Null is a perfectly good answer — it just means "group the report, hide nothing".
 */
export function etiologyFromDiagnosis(diagnosis: string | null | undefined): EtiologyKey | null {
  if (!diagnosis) return null;
  for (const { key, re } of ETIOLOGY_PATTERNS) {
    if (re.test(diagnosis)) return key;
  }
  return null;
}

/**
 * Group the imaging lines out of a set of finding rows and decide which to surface.
 *
 * Returns null — meaning "change nothing" — unless the rows clearly contain a radiology report:
 * either a line that names the study, or a cluster of at least three report-field lines, which
 * no bedside examination produces.
 *
 * `rows` is the finding list as lib/exam-summary.ts built it. The caller removes every row in
 * the returned `all` from its own findings and renders the summary in their place.
 */
export function summariseImaging(
  rows: ImagingRow[],
  etiology: EtiologyKey | null
): ImagingSummary | null {
  const imaging = rows.filter(
    (r) => isModalityLine(r) || IMAGING_FIELD.test(norm(r))
  );

  const hasModalityLine = imaging.some(isModalityLine);
  if (!hasModalityLine && imaging.length < 3) return null;

  // The line the report itself calls its impression. Label wording is the stronger signal;
  // a value that opens with "s/o …" is the fallback. A bare modality line ("USG abdomen") is
  // never the impression even if nothing else qualifies.
  const impression =
    imaging.find((r) => IMPRESSION_LABEL.test(r.label) && !isModalityLine(r)) ??
    imaging.find((r) => IMPRESSION_VALUE.test(r.value.trim())) ??
    null;

  const modalityRow = imaging.find(isModalityLine) ?? null;
  const modality = modalityRow
    ? modalityRow.value.trim() || modalityRow.label.trim()
    : null;

  // Lines that are neither the impression nor the bare study name — the body of the report.
  const body = imaging.filter(
    (r) => r.id !== impression?.id && !(r === modalityRow && !IMAGING_FIELD.test(norm(r)))
  );

  let key: ImagingRow[];
  let hidden: ImagingRow[];

  const organs = etiology ? ETIOLOGY_ORGANS[etiology] : null;
  if (!organs) {
    // Diagnosis not one we trim for: keep every line on the face, just grouped. Nothing hidden.
    key = body;
    hidden = [];
  } else {
    const picked = new Set<string>();
    key = [];
    for (const re of organs) {
      for (const r of body) {
        if (!picked.has(r.id) && re.test(norm(r))) {
          picked.add(r.id);
          key.push(r);
        }
      }
    }
    hidden = body.filter((r) => !picked.has(r.id));
  }

  const all = [
    ...(impression ? [impression] : []),
    ...(modalityRow && modalityRow.id !== impression?.id && !body.includes(modalityRow)
      ? [modalityRow]
      : []),
    ...body,
  ];

  return { modality, impression, key, hidden, all };
}

/**
 * Blood results that stay on the face of the card even when they are in range, because the
 * patient's problem is one where the trend in that specific analyte is the thing being watched.
 * Keyed by canonicalLabName (see lib/lab-ranges.ts), so the built-in analyte names are what
 * appear here.
 */
export const ETIOLOGY_KEY_LABS: Record<EtiologyKey, string[]> = {
  biliary: ["ALP", "T. bilirubin", "D. bilirubin", "SGOT", "SGPT"],
  pancreatitis: ["Amylase", "Lipase", "Calcium", "ALP", "T. bilirubin"],
  renal: ["Creatinine", "Urea", "Uric acid"],
  appendicitis: ["TLC", "CRP", "Neutrophils"],
  "bowel-obstruction": ["Lactate", "Potassium", "Creatinine"],
  hepatic: ["ALP", "T. bilirubin", "SGOT", "SGPT", "Albumin", "INR"],
};
