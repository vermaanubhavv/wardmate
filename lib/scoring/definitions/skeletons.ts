/**
 * Configuration skeletons for the DOCX top-20 pathways not yet implemented.
 *
 * Each is marked `status: "unavailable"` — the engine will NOT activate it, the trigger
 * detector ignores non-`active` pathways, and the UI does not show it to ordinary users
 * (DOCX "Remaining pathways": "Mark a pathway unavailable rather than implementing a
 * formula from memory").
 *
 * The skeleton records the *product* decision — preferred scoring system(s), trigger
 * concepts, timing, card type — so a clinical author has a starting point. It deliberately
 * carries NO thresholds. Proprietary content (AJCC, AIS/ISS, BI-RADS, TI-RADS) is additionally
 * flagged for content-governance / licensing review.
 */

import type { PathwayDefinition } from "../types";

export type PathwaySkeleton = {
  pathwayId: string;
  title: string;
  status: "unavailable";
  mvpRelease: "MVP1" | "MVP2" | "MVP3";
  preferredSystems: string[];
  triggerConcepts: string[];
  timing: string;
  cardTypes: Array<"calculator" | "structured_classification" | "documentation_only">;
  licensingReview: boolean;
  notes: string;
};

export const PATHWAY_SKELETONS: PathwaySkeleton[] = [
  {
    pathwayId: "adhesive_sbo",
    title: "Adhesive small-bowel obstruction",
    status: "unavailable",
    mvpRelease: "MVP1",
    preferredSystems: ["Bologna/WSES red-flag pathway", "24-hour water-soluble contrast checkpoint"],
    triggerConcepts: ["small bowel obstruction", "adhesive obstruction", "SAIO", "sub-acute intestinal obstruction"],
    timing: "Admission checklist; 24-h contrast radiograph checkpoint; hard reassessment by 72 h",
    cardTypes: ["structured_classification"],
    licensingReview: false,
    notes: "DOCX: 'Do not invent a score' — timed checklist with red flags, not a number. Peritonitis / strangulation / ischaemia contraindicate non-operative management.",
  },
  {
    pathwayId: "perforation_peritonitis",
    title: "Perforation peritonitis / secondary peritonitis",
    status: "unavailable",
    mvpRelease: "MVP1",
    preferredSystems: ["Mannheim Peritonitis Index", "SOFA (ongoing organ dysfunction)"],
    triggerConcepts: ["perforation peritonitis", "hollow viscus perforation", "secondary peritonitis", "pneumoperitoneum"],
    timing: "MPI partly intra-operative — must not delay source control; SOFA repeated with change",
    cardTypes: ["calculator"],
    licensingReview: false,
    notes: "Display institution-selected MPI threshold; never treat as a surgical-indication score.",
  },
  {
    pathwayId: "acute_diverticulitis",
    title: "Acute diverticulitis",
    status: "unavailable",
    mvpRelease: "MVP3",
    preferredSystems: ["WSES CT classification", "modified Hinchey (academic familiarity)"],
    triggerConcepts: ["acute diverticulitis", "sigmoid diverticulitis", "complicated diverticulitis"],
    timing: "CT-based staging when clinically appropriate; reassess on peritonitis / organ dysfunction",
    cardTypes: ["structured_classification"],
    licensingReview: false,
    notes: "Avoid auto-generating colonoscopy during the acute episode.",
  },
  {
    pathwayId: "diabetic_foot",
    title: "Diabetic foot ulcer / infection",
    status: "unavailable",
    mvpRelease: "MVP2",
    preferredSystems: ["IWGDF/IDSA infection severity", "SVS WIfI", "Wagner (secondary academic descriptor)"],
    triggerConcepts: ["diabetic foot", "diabetic foot infection", "diabetic foot ulcer", "DFU", "DFI"],
    timing: "Infection severity + WIfI at presentation; serial reassessment",
    cardTypes: ["structured_classification"],
    licensingReview: false,
    notes: "WIfI ischaemia: prefer toe pressure / TcPO₂ in diabetes (ABI may be falsely high).",
  },
  {
    pathwayId: "nsti",
    title: "Necrotising soft-tissue infection / Fournier gangrene",
    status: "unavailable",
    mvpRelease: "MVP2",
    preferredSystems: ["Clinical emergency pathway (primary)", "LRINEC (adjunct only)", "SOFA", "FGSI (optional, Fournier)"],
    triggerConcepts: ["necrotising fasciitis", "NSTI", "Fournier gangrene", "necrotising soft tissue infection"],
    timing: "Immediate senior review timer; scoring/imaging must not delay exploration",
    cardTypes: ["calculator"],
    licensingReview: false,
    notes: "SAFETY: a low LRINEC must NEVER produce an 'NSTI excluded' or reassuring green state. Sensitivity ~68% at ≥6, ~41% at ≥8.",
  },
  {
    pathwayId: "hernia",
    title: "Groin and ventral/incisional hernia",
    status: "unavailable",
    mvpRelease: "MVP3",
    preferredSystems: ["European Hernia Society (EHS) classification"],
    triggerConcepts: ["inguinal hernia", "incisional hernia", "ventral hernia", "femoral hernia", "paraumbilical hernia"],
    timing: "Structured documentation card — not an emergency risk calculator",
    cardTypes: ["structured_classification"],
    licensingReview: false,
    notes: "Incarceration/obstruction/strangulation → launch the acute-abdomen / bowel-obstruction workflow instead.",
  },
  {
    pathwayId: "haemorrhoids",
    title: "Haemorrhoidal disease",
    status: "unavailable",
    mvpRelease: "MVP3",
    preferredSystems: ["Goligher grade I–IV", "symptom/complication descriptors", "ACRSI 2016 suffix (optional local extension)"],
    triggerConcepts: ["haemorrhoids", "piles", "prolapsing haemorrhoids", "thrombosed pile"],
    timing: "Examination documentation and procedure selection",
    cardTypes: ["structured_classification"],
    licensingReview: false,
    notes: "Do not attribute rectal bleeding to haemorrhoids without age/risk-appropriate evaluation.",
  },
  {
    pathwayId: "fistula_in_ano",
    title: "Fistula-in-ano",
    status: "unavailable",
    mvpRelease: "MVP3",
    preferredSystems: ["Parks classification", "St James University Hospital MRI grade", "Garg (optional, complex)"],
    triggerConcepts: ["fistula in ano", "anal fistula", "perianal fistula", "recurrent anal fistula"],
    timing: "Structured descriptors; MRI for recurrent/complex disease when clinically selected",
    cardTypes: ["structured_classification"],
    licensingReview: false,
    notes: "Do not let Goodsall's rule auto-assign the internal opening.",
  },
  {
    pathwayId: "breast_cancer",
    title: "Breast lesion / breast cancer",
    status: "unavailable",
    mvpRelease: "MVP3",
    preferredSystems: ["ACR BI-RADS", "Nottingham histologic grade", "current AJCC TNM / prognostic stage"],
    triggerConcepts: ["breast lump", "breast cancer", "carcinoma breast", "BIRADS 4", "BIRADS 5"],
    timing: "Imaging assessment → tissue diagnosis → verified oncology staging field",
    cardTypes: ["documentation_only", "structured_classification"],
    licensingReview: true,
    notes: "LICENSING: BI-RADS content and AJCC staging tables need a commercial content agreement. Final stage group assigned by the managing physician, not the app.",
  },
  {
    pathwayId: "thyroid_nodule",
    title: "Thyroid nodule / thyroid cancer",
    status: "unavailable",
    mvpRelease: "MVP3",
    preferredSystems: ["ACR TI-RADS", "Bethesda System 2023", "current AJCC TNM"],
    triggerConcepts: ["thyroid nodule", "thyroid cancer", "TIRADS 4", "TIRADS 5", "Bethesda"],
    timing: "US risk + size thresholds → FNA decision → verified staging for confirmed cancer",
    cardTypes: ["documentation_only", "structured_classification"],
    licensingReview: true,
    notes: "LICENSING: TI-RADS and AJCC content need content-governance/licensing review. Discordance triggers senior review, not an automatic operation.",
  },
  {
    pathwayId: "colorectal_cancer",
    title: "Colorectal cancer",
    status: "unavailable",
    mvpRelease: "MVP3",
    preferredSystems: ["current AJCC TNM", "CAP-style synoptic elements"],
    triggerConcepts: ["colon cancer", "rectal cancer", "colorectal carcinoma", "CRC"],
    timing: "Primarily extraction, completeness checking and longitudinal tracking",
    cardTypes: ["documentation_only"],
    licensingReview: true,
    notes: "LICENSING: do not reproduce licensed AJCC tables without a commercial content agreement. Do not compute a final stage group from incomplete pathology/imaging.",
  },
  {
    pathwayId: "major_trauma",
    title: "Major trauma / polytrauma",
    status: "unavailable",
    mvpRelease: "MVP2",
    preferredSystems: ["GCS + Shock Index (immediate)", "Revised Trauma Score (first pre-intervention obs)", "ISS after AIS coding"],
    triggerConcepts: ["polytrauma", "major trauma", "RTA polytrauma", "blunt trauma"],
    timing: "GCS + SI immediately; RTS from first valid pre-intervention observations; ISS after definitive AIS coding",
    cardTypes: ["calculator", "documentation_only"],
    licensingReview: true,
    notes: "LICENSING: AIS/ISS is a licensed standard — do not generate AIS codes from casual text. RTS: preserve first pre-intervention values; flag intubation/sedation limits.",
  },
  {
    pathwayId: "solid_organ_trauma",
    title: "Blunt solid-organ abdominal trauma",
    status: "unavailable",
    mvpRelease: "MVP2",
    preferredSystems: ["AAST Organ Injury Scale (as reported)", "WSES class (anatomy + haemodynamics)"],
    triggerConcepts: ["liver laceration", "splenic injury", "blunt abdominal trauma", "AAST grade"],
    timing: "AAST-OIS grade from radiology/operation; WSES class combines with haemodynamic status",
    cardTypes: ["documentation_only", "structured_classification"],
    licensingReview: true,
    notes: "SAFETY: haemodynamic instability overrides a low anatomic grade. LICENSING: AAST-OIS is official/licensed grading content.",
  },
  {
    pathwayId: "blunt_chest_trauma",
    title: "Blunt chest trauma",
    status: "unavailable",
    mvpRelease: "MVP2",
    preferredSystems: ["Thoracic Trauma Severity Score (TTSS)", "RibScore (optional, CT fracture pattern)"],
    triggerConcepts: ["blunt chest trauma", "rib fractures", "flail chest", "pulmonary contusion", "haemothorax"],
    timing: "Monitoring/escalation aid — not a substitute for immediate treatment of tension pneumothorax or respiratory failure",
    cardTypes: ["calculator"],
    licensingReview: false,
    notes: "TTSS 13–25 predicts high ARDS risk.",
  },
  {
    pathwayId: "major_burns",
    title: "Major burns",
    status: "unavailable",
    mvpRelease: "MVP2",
    preferredSystems: ["TBSA + burn depth (core record)", "revised Baux (adult mortality risk)", "ABSI (optional)"],
    triggerConcepts: ["burns", "flame burn", "scald", "electrical burn", "inhalation injury"],
    timing: "TBSA/depth at presentation; serial evolution; Baux is prognostic, not treatment-withholding",
    cardTypes: ["calculator", "documentation_only"],
    licensingReview: false,
    notes: "FLUIDS: do not hard-code one Parkland order. Make the formula institution-configurable, show time since burn, subtract fluid already given, require clinician confirmation.",
  },
];

/** Skeletons rendered as minimal (invalid-for-activation) PathwayDefinition stubs. */
export function skeletonAsDefinition(s: PathwaySkeleton): Pick<
  PathwayDefinition,
  "pathwayId" | "pathwayVersion" | "title" | "status" | "clinicalOwner" | "reviewDueAt"
> {
  return {
    pathwayId: s.pathwayId,
    pathwayVersion: "0.0.0",
    title: s.title,
    status: "unavailable",
    clinicalOwner: "PENDING",
    reviewDueAt: "PENDING",
  };
}
