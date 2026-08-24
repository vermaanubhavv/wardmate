/**
 * The diagnosis-driven "relevant negative symptoms" line under Complaints.
 *
 * Drafted with the resident, category by category, and NOT something this app decided alone —
 * see the conversation this shipped from for the reasoning behind each list. Matching a
 * diagnosis to a category is a lookup against known terms, not a judgement about what a
 * diagnosis "sounds like"; a diagnosis that matches nothing here prints nothing here.
 *
 * The printed default — "Pain / Vomiting / Fever - No episodes" — is the same deliberate
 * exception On Examination's "Conscious Oriented" default is: an editable starting point on a
 * form the resident reviews and corrects before signing, explicitly requested as a default,
 * never written into the patient's actual record. If today's round said anything about one of
 * the listed symptoms, that wording replaces "No episodes" wholesale rather than being merged
 * word by word — the same whole-line override On Examination already uses, for the same reason:
 * a partial edit invites the app to guess which half of a sentence to keep.
 */

export type SymptomCategory = {
  key: string;
  /** Matched against the diagnosis text, case-insensitively, as a substring. */
  diagnosisTerms: string[];
  /** Printed in this order — "Pain / Vomiting / Fever". */
  symptoms: string[];
  /** What in today's words counts as "something was actually said" about this category. */
  mentionPattern: RegExp;
};

export const SYMPTOM_CATEGORIES: SymptomCategory[] = [
  {
    key: "hepatobiliary",
    diagnosisTerms: [
      "cholelithiasis", "cholecystitis", "cbd stone", "choledocholithiasis",
      "pancreatitis", "gallstone", "gall stone", "biliary",
    ],
    symptoms: ["Pain", "Vomiting", "Fever", "Jaundice"],
    mentionPattern: /\b(pain|vomit|fever|febrile|jaundice|icterus)\b/i,
  },
  {
    key: "appendicular_bowel",
    diagnosisTerms: ["appendicitis", "appendicular", "obstruction", "perforation", "peritonitis"],
    symptoms: ["Pain", "Vomiting", "Distension", "Fever"],
    mentionPattern: /\b(pain|vomit|distension|distended|fever|febrile)\b/i,
  },
  {
    key: "wound_diabetic_foot",
    diagnosisTerms: [
      "fasciotomy", "wound", "diabetic foot", "cellulitis", "abscess", "necrotising fasciitis",
      "necrotizing fasciitis", "surgical site",
    ],
    symptoms: ["Pain", "Fever", "Discharge"],
    mentionPattern: /\b(pain|fever|febrile|discharge|pus|purulent)\b/i,
  },
  {
    key: "hernia",
    diagnosisTerms: ["hernia"],
    symptoms: ["Pain", "Swelling", "Vomiting"],
    mentionPattern: /\b(pain|swelling|swollen|vomit)\b/i,
  },
  {
    key: "anorectal",
    diagnosisTerms: ["fissure", "fistula", "haemorrhoid", "hemorrhoid", "perianal", "pilonidal"],
    symptoms: ["Pain", "Bleeding per rectum", "Discharge"],
    mentionPattern: /\b(pain|bleed|blood|discharge|pus)\b/i,
  },
];

const norm = (s: string) => s.toLowerCase().trim();

export function categoryForDiagnosis(diagnosis: string | null): SymptomCategory | null {
  if (!diagnosis) return null;
  const d = norm(diagnosis);
  return SYMPTOM_CATEGORIES.find((c) => c.diagnosisTerms.some((t) => d.includes(t))) ?? null;
}
