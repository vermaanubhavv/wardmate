import type { Advice, Procedure } from "@/lib/discharge-entities";

/**
 * General-surgery discharge TEMPLATES, keyed by diagnosis / operation.
 *
 * WHY THIS EXISTS. A one-off discharge (app/prepare-discharge/new) has no WardMate record to
 * compile from — it is written for somebody who is not a patient here. Starting from a blank
 * summary every time means re-typing the same wound-care advice, the same red-flag list and the
 * same follow-up structure that a laparoscopic cholecystectomy discharge always carries. So the
 * resident picks the diagnosis, and the sections that are standard for it arrive pre-structured,
 * with `[ … ]` blanks for the parts only they can fill.
 *
 * This is the same kind of thing as the "standard discharge medication set" and the "no
 * comorbidities" line the app already offers: an EDITABLE STARTING POINT a doctor signs off,
 * not a clinical fact. It is never applied to a real patient's summary automatically — the
 * workspace compiles those from the record. It is offered, by name, in the one-off flow only.
 *
 * The matcher reuses the wording rules from lib/diagnosis-from-procedure.ts so the same
 * shorthand ("lap chole") selects the same template.
 */

export type DischargeTemplate = {
  key: string;
  /** Shown on the card the resident picks. */
  label: string;
  /** Matched against the typed procedure text and the typed diagnosis. */
  match: RegExp;
  /** care_templates families that also select this template. */
  families?: string[];
  scaffold: {
    /** A sentence with [ … ] blanks — never a repeat of the final diagnosis. */
    indication: string;
    primaryDiagnosis: string;
    procedure: Pick<Procedure, "name" | "anaesthesia" | "findings" | "drains" | "complications" | "outcome">;
    advice: Advice["items"];
    redFlags: string[];
    patientActions: string[];
    primaryCareActions: string[];
    /** Seed the nine Condition-at-Discharge variables as satisfactory, for the resident to
     *  strike through what is not true — the way the old paper form printed "Satisfactory". */
    conditionAllSatisfactory: boolean;
  };
};

const rowIds = (prefix: string, items: { module?: string; text: string }[]) =>
  items.map((it, i) => ({ id: `${prefix}-${i}`, module: it.module ?? "", text: it.text }));

const GENERIC_POST_OP_RED_FLAGS = [
  "Persistent or high fever",
  "Increasing redness, swelling or pain at the wound",
  "Pus or foul discharge from the wound",
  "Worsening abdominal pain",
  "Persistent vomiting or inability to keep food down",
  "Abdominal distension or not passing stool/flatus",
];

const FOLLOW_UP = "Attend the Surgery OPD after 7 days for a wound review.";
const ANTIBIOTICS = "Complete the full course of the prescribed antibiotics.";
const HPE_REVIEW = "Bring the histopathology report to the follow-up visit.";

export const DISCHARGE_TEMPLATES: DischargeTemplate[] = [
  {
    key: "lap_chole",
    label: "Laparoscopic cholecystectomy",
    match: /\bchol(e|y)cystectom|\blap\s*chole\b|\bgall\s*stone|\bcholelithiasis|\bcalculous cholecystitis\b/i,
    families: ["lap_chole"],
    scaffold: {
      indication: "Patient admitted with [right upper abdominal pain / biliary colic / fever] and [ultrasound evidence of gallstones / acute calculous cholecystitis] requiring inpatient management and laparoscopic cholecystectomy.",
      primaryDiagnosis: "Gall stone disease",
      procedure: {
        name: "Laparoscopic cholecystectomy",
        anaesthesia: "General anaesthesia",
        findings: "[ distended / thick-walled gall bladder, adhesions, calot's triangle anatomy … ]",
        drains: "[ subhepatic drain / nil ]",
        complications: "Nil",
        outcome: "Procedure completed successfully.",
      },
      advice: rowIds("adv", [
        { module: "Wound care", text: "Keep the port-site wounds clean and dry. Sponge bath only for the first 48 hours; the dressings may then be removed and the wounds washed gently." },
        { module: "Diet", text: "Resume a normal diet. A low-fat diet is advised for the first 2–4 weeks." },
        { module: "Activity restrictions", text: "Avoid heavy lifting and strenuous activity for 2 weeks. Light activity and walking are encouraged." },
        { module: "Drain care", text: "[ If a drain is in situ: keep the bag below the level of the wound, record the daily output, and attend for removal as advised. ]" },
      ]),
      redFlags: [...GENERIC_POST_OP_RED_FLAGS, "Yellowing of the eyes or skin (jaundice)", "Dark urine or pale stools"],
      patientActions: [FOLLOW_UP, "Attend for suture removal / clip removal on postoperative day 7.", ANTIBIOTICS, HPE_REVIEW],
      primaryCareActions: [],
      conditionAllSatisfactory: true,
    },
  },
  {
    key: "appendicectomy",
    label: "Appendicectomy",
    match: /\bappendic(ectom|ectomy|ectomies)|\bappendicitis\b/i,
    families: ["appendicectomy"],
    scaffold: {
      indication: "Patient admitted with [acute right iliac fossa pain, fever and vomiting] and clinical features of acute appendicitis requiring inpatient management and appendicectomy.",
      primaryDiagnosis: "Acute appendicitis",
      procedure: {
        name: "[ Laparoscopic / open ] appendicectomy",
        anaesthesia: "General anaesthesia",
        findings: "[ inflamed / perforated appendix, local collection, peritoneal contamination … ]",
        drains: "[ pelvic drain / nil ]",
        complications: "Nil",
        outcome: "Procedure completed successfully.",
      },
      advice: rowIds("adv", [
        { module: "Wound care", text: "Keep the wound clean and dry. Remove the dressing after 48 hours if the wound is dry." },
        { module: "Diet", text: "Resume a normal diet gradually as tolerated." },
        { module: "Activity restrictions", text: "Avoid heavy lifting and strenuous activity for 2–4 weeks." },
      ]),
      redFlags: [...GENERIC_POST_OP_RED_FLAGS, "Inability to tolerate any oral intake"],
      patientActions: [FOLLOW_UP, "Attend for suture removal on postoperative day 7–10.", ANTIBIOTICS, HPE_REVIEW],
      primaryCareActions: [],
      conditionAllSatisfactory: true,
    },
  },
  {
    key: "hernia",
    label: "Hernia repair (inguinal / umbilical / incisional)",
    match: /\bhernio(plasty|rrhaphy)|\bhernia\b|\bmesh repair\b/i,
    families: ["hernia"],
    scaffold: {
      indication: "Patient admitted with a [reducible / irreducible / obstructed] [inguinal / umbilical / incisional] hernia requiring inpatient management and repair.",
      primaryDiagnosis: "[ Inguinal / umbilical / incisional ] hernia",
      procedure: {
        name: "[ Site ] hernioplasty (mesh repair)",
        anaesthesia: "[ General / spinal ] anaesthesia",
        findings: "[ defect size, contents, viability of contents, mesh placed … ]",
        drains: "[ nil / suction drain ]",
        complications: "Nil",
        outcome: "Procedure completed successfully.",
      },
      advice: rowIds("adv", [
        { module: "Wound care", text: "Keep the wound clean and dry. Remove the dressing after 48 hours if dry." },
        { module: "Lifting restrictions", text: "Do not lift weights over 5 kg for 6 weeks." },
        { module: "Activity restrictions", text: "Avoid straining, coughing hard and strenuous activity for 6 weeks. Treat constipation and cough early." },
        { module: "Return-to-work advice", text: "Light / desk work may resume after 2 weeks; heavy manual work after 6 weeks." },
      ]),
      redFlags: [...GENERIC_POST_OP_RED_FLAGS, "A new or returning lump at the operation site", "Scrotal swelling or severe scrotal pain (inguinal repair)", "Inability to pass urine"],
      patientActions: [FOLLOW_UP, "Attend for suture removal on postoperative day 10.", "Use a scrotal support if advised (inguinal repair)."],
      primaryCareActions: [],
      conditionAllSatisfactory: true,
    },
  },
  {
    key: "perianal",
    label: "Perianal procedure (haemorrhoids / fistula / fissure)",
    match: /\bh(a)?emorrhoid|\bfistulectom|\bfistulotom|\bsphincterotom|\bfissure in ano|\bfistula in ano|\bpilonidal\b/i,
    families: ["perianal"],
    scaffold: {
      indication: "Patient admitted with [bleeding per rectum / perianal pain / perianal discharge] due to [haemorrhoids / fistula in ano / fissure in ano] requiring inpatient management and surgery.",
      primaryDiagnosis: "[ Haemorrhoids / fistula in ano / fissure in ano ]",
      procedure: {
        name: "[ Haemorrhoidectomy / fistulectomy / lateral internal sphincterotomy ]",
        anaesthesia: "[ Spinal / general ] anaesthesia",
        findings: "[ position and grade of haemorrhoids / tract of fistula and internal opening / sentinel pile … ]",
        drains: "Nil",
        complications: "Nil",
        outcome: "Procedure completed successfully.",
      },
      advice: rowIds("adv", [
        { module: "Wound care", text: "Warm sitz baths 2–3 times a day and after every bowel motion. Keep the area clean and dry between baths." },
        { module: "Diet", text: "High-fibre diet with plenty of fluids to keep the stool soft." },
        { module: "Medication instructions", text: "Take the prescribed stool softener / laxative regularly and the analgesia as directed." },
        { module: "Activity restrictions", text: "Avoid prolonged sitting and heavy lifting for 2 weeks." },
      ]),
      redFlags: [
        "Heavy or continuous bleeding per rectum",
        "Persistent or high fever",
        "Increasing perianal pain, swelling or discharge",
        "Inability to pass urine",
        "Inability to pass stool",
      ],
      patientActions: ["Attend the Surgery OPD after 1 week.", "Continue the sitz baths and stool softeners until reviewed.", HPE_REVIEW],
      primaryCareActions: [],
      conditionAllSatisfactory: true,
    },
  },
  {
    key: "laparotomy",
    label: "Exploratory laparotomy / major abdominal surgery",
    match: /\blaparotom|\blaparostom|\bresection anastomosis|\bbowel resection|\bperforation\b|\bobstruction\b|\bstoma\b|\bcolostomy\b|\bileostomy\b/i,
    scaffold: {
      indication: "Patient admitted with [ acute abdomen / peritonitis / intestinal obstruction / … ] requiring inpatient management and exploratory laparotomy.",
      primaryDiagnosis: "[ e.g. hollow viscus perforation with peritonitis ]",
      procedure: {
        name: "Exploratory laparotomy [ + specify: resection / anastomosis / stoma / peritoneal lavage ]",
        anaesthesia: "General anaesthesia",
        findings: "[ operative findings, contamination, viability, procedure performed … ]",
        drains: "[ number, site and type of drains ]",
        complications: "[ nil / specify ]",
        outcome: "[ completed as planned / staged / damage control ]",
      },
      advice: rowIds("adv", [
        { module: "Wound care", text: "Keep the laparotomy wound clean and dry. Attend for a dressing review as advised. Support the wound when coughing." },
        { module: "Diet", text: "Build up the diet gradually as tolerated; small frequent meals initially." },
        { module: "Mobilisation", text: "Mobilise a little more each day. Continue chest physiotherapy and leg exercises." },
        { module: "Lifting restrictions", text: "No lifting over 5 kg and no strenuous activity for 6–8 weeks (risk of incisional hernia)." },
        { module: "Stoma care", text: "[ If a stoma is present: continue the stoma-care routine taught on the ward; contact the stoma nurse for supplies and problems. ]" },
        { module: "Drain care", text: "[ If a drain is in situ: record the daily output and attend for removal as advised. ]" },
      ]),
      redFlags: [
        ...GENERIC_POST_OP_RED_FLAGS,
        "Wound edges separating or a sudden gush of fluid from the wound",
        "No stoma output for [ … ] hours, or a very high stoma output (stoma present)",
        "Breathlessness or chest pain",
      ],
      patientActions: [
        "Attend the Surgery OPD after 7 days for a wound review.",
        "Attend for suture / clip removal on postoperative day 10–14.",
        HPE_REVIEW,
      ],
      primaryCareActions: ["Check the wound and remove sutures / clips if not done at hospital OPD.", "Monitor for signs of wound infection or incisional hernia."],
      conditionAllSatisfactory: false,
    },
  },
];

/** Used when the typed diagnosis matches none of the above — still gives the resident a
 *  scaffold to fill rather than a blank page. */
export const GENERIC_DISCHARGE_TEMPLATE: DischargeTemplate = {
  key: "generic",
  label: "General surgery — generic template",
  match: /.^/,
  scaffold: {
    indication: "Patient admitted with [ presentation / clinical problem ] requiring [ inpatient management / investigation / intervention / surgery ].",
    primaryDiagnosis: "",
    procedure: {
      name: "[ Procedure name ]",
      anaesthesia: "[ General / spinal / local ]",
      findings: "[ significant operative findings ]",
      drains: "[ drains, if any ]",
      complications: "Nil",
      outcome: "Procedure completed successfully.",
    },
    advice: rowIds("adv", [
      { module: "Wound care", text: "Keep the wound clean and dry. Attend for a dressing review as advised." },
      { module: "Diet", text: "Resume a normal diet as tolerated." },
      { module: "Activity restrictions", text: "Avoid heavy lifting and strenuous activity for [ … ] weeks." },
    ]),
    redFlags: GENERIC_POST_OP_RED_FLAGS,
    patientActions: [FOLLOW_UP, "Attend for suture removal on postoperative day [ … ].", ANTIBIOTICS],
    primaryCareActions: [],
    conditionAllSatisfactory: true,
  },
};

/** The list for the picker card. */
export function listDischargeTemplates(): { key: string; label: string }[] {
  return [...DISCHARGE_TEMPLATES, GENERIC_DISCHARGE_TEMPLATE].map((t) => ({ key: t.key, label: t.label }));
}

export function getDischargeTemplate(key: string | null | undefined): DischargeTemplate | null {
  if (!key) return null;
  if (key === GENERIC_DISCHARGE_TEMPLATE.key) return GENERIC_DISCHARGE_TEMPLATE;
  return DISCHARGE_TEMPLATES.find((t) => t.key === key) ?? null;
}

/** The template the typed procedure / diagnosis / care-template family points at, or null. */
export function matchDischargeTemplate(input: {
  procedureText?: string | null;
  diagnosisText?: string | null;
  templateFamily?: string | null;
}): DischargeTemplate | null {
  const haystack = `${input.procedureText ?? ""} ${input.diagnosisText ?? ""}`.trim();
  if (input.templateFamily) {
    const byFamily = DISCHARGE_TEMPLATES.find((t) => t.families?.includes(input.templateFamily!));
    if (byFamily) return byFamily;
  }
  if (haystack) {
    const byText = DISCHARGE_TEMPLATES.find((t) => t.match.test(haystack));
    if (byText) return byText;
  }
  return null;
}
