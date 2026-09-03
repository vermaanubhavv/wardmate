import type { MedicalLexiconEntry } from "./types";
import { PRIORITY } from "./types";

/**
 * Drains, tubes, lines and stomas.
 *
 * Every entry carries `devices` tokens so that when a patient actually has the device charted
 * ("Abdominal drain", "Ryle's tube") it is boosted at exact-patient priority. The character /
 * output phrases that go with a device ("bilious aspirate", "high output stoma") are pulled in
 * by the same tokens, so they arrive only for patients who have that device.
 */
export const DEVICES: MedicalLexiconEntry[] = [
  device(
    "Ryle's tube",
    ["Ryles tube", "Ryle tube", "nasogastric tube", "NG tube", "Ryle's aspirate", "NG aspirate", "gastric aspirate", "RT aspirate"],
    ["ryle", "nasogastric", "ng tube"],
    "ryles-tube"
  ),
  device(
    "bilious aspirate",
    ["NG aspirate bilious", "bilious NG output", "gastric aspirate bilious"],
    ["ryle", "nasogastric", "aspirate"]
  ),
  device(
    "Foley's catheter",
    ["Foleys catheter", "Foley catheter", "urinary catheter", "per urethral catheter", "PUC", "Foley's"],
    ["foley", "catheter", "urinary catheter"],
    "foley"
  ),
  device(
    "Romovac drain",
    ["Romovac", "Romosac drain", "Romovac suction drain", "closed suction drain"],
    ["romovac", "suction drain"],
    "closed-suction-drain"
  ),
  device(
    "Jackson-Pratt drain",
    ["JP drain", "Jackson Pratt drain"],
    ["jackson-pratt", "jp drain"],
    "closed-suction-drain"
  ),
  device(
    "abdominal drain",
    ["intra-abdominal drain", "intraabdominal drain", "peritoneal drain", "drain in situ"],
    ["abdominal drain", "intra-abdominal drain", "drain"],
    "abdominal-drain"
  ),
  device("pelvic drain", ["pelvic drain in situ"], ["pelvic drain", "drain"], "abdominal-drain"),
  device("subhepatic drain", ["sub-hepatic drain", "subhepatic drain in situ", "Morrison's pouch drain"], ["subhepatic", "drain"], "abdominal-drain"),
  device(
    "pigtail catheter",
    ["pigtail", "pigtail drain", "percutaneous pigtail"],
    ["pigtail"],
    "pigtail"
  ),
  device(
    "intercostal drain",
    ["intercostal drainage", "ICD tube", "chest tube", "chest drain", "ICD in situ"],
    ["intercostal drain", "icd", "chest tube", "chest drain"],
    "chest-drain"
  ),
  device("drain output", ["drain output minimal", "drain output decreased", "drain output increased", "serosanguinous drain output", "drain removed"], ["drain"]),
  device(
    "central line",
    ["central venous catheter", "CVC", "central line in situ", "triple lumen catheter"],
    ["central line", "central venous", "cvc"],
    "central-line"
  ),
  device("PICC line", ["peripherally inserted central catheter", "PICC"], ["picc"], "central-line"),
  device("arterial line", ["A-line", "art line", "arterial cannula"], ["arterial line", "a-line"]),
  device(
    "endotracheal tube",
    ["ET tube", "ETT", "endotracheal tube in situ", "on ventilator"],
    ["endotracheal", "et tube", "intubated", "ventilator"],
    "airway"
  ),
  device("tracheostomy", ["tracheostomy tube", "trachy", "tracheostomy in situ"], ["tracheostomy", "trachy"], "airway"),
  device(
    "ileostomy",
    ["loop ileostomy", "end ileostomy", "ileostomy stoma"],
    ["ileostomy", "stoma"],
    "stoma"
  ),
  device(
    "colostomy",
    ["loop colostomy", "end colostomy", "colostomy stoma"],
    ["colostomy", "stoma"],
    "stoma"
  ),
  device(
    "stoma",
    ["stoma bag", "stoma appliance", "stoma functioning", "stoma healthy", "stoma pink", "stoma edematous", "stoma oedematous", "stoma output", "parastomal"],
    ["stoma", "ileostomy", "colostomy"]
  ),
  device("high output stoma", ["high-output stoma", "ileostomy high output", "high output ileostomy"], ["stoma", "ileostomy"]),
];

function device(
  term: string,
  aliases: string[],
  devices: string[],
  dedupeGroup?: string
): MedicalLexiconEntry {
  return {
    term,
    aliases,
    categories: ["device"],
    devices,
    priority: PRIORITY.RELATED,
    dedupeGroup,
  };
}
