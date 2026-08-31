/**
 * Deciding which pathway a diagnosis should activate.
 *
 * Two ways in, in priority order (DOCX §1: "Use configured terminology codes plus normalized
 * text matching as a fallback"):
 *   1. a configured local diagnosis code exact-matches
 *   2. a configured text pattern appears in the diagnosis text, and no exclude pattern does
 *
 * Pure. No database. The caller passes the patient's diagnosis strings/codes and the set of
 * candidate definitions.
 */

import type { PathwayDefinition, TriggerSource } from "./types";

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();

export type TriggerMatch = {
  pathwayId: string;
  pathwayVersion: string;
  source: TriggerSource;
  matchedOn: string;
  diagnosisText: string;
};

export function detectTriggers(
  diagnosis: { text: string; codes?: string[] },
  definitions: PathwayDefinition[]
): TriggerMatch[] {
  const text = norm(diagnosis.text);
  const codes = (diagnosis.codes ?? []).map((c) => c.trim().toLowerCase());
  const matches: TriggerMatch[] = [];

  for (const def of definitions) {
    if (def.status !== "active") continue;
    const t = def.diagnosisTriggers;

    const codeHit = t.codes.find((c) => codes.includes(c.trim().toLowerCase()));
    if (codeHit) {
      matches.push({
        pathwayId: def.pathwayId,
        pathwayVersion: def.pathwayVersion,
        source: "diagnosis_code",
        matchedOn: codeHit,
        diagnosisText: diagnosis.text,
      });
      continue;
    }

    const excluded = t.excludePatterns.some((p) => text.includes(norm(p)));
    if (excluded) continue;

    const textHit = t.textPatterns.find((p) => text.includes(norm(p)));
    if (textHit) {
      matches.push({
        pathwayId: def.pathwayId,
        pathwayVersion: def.pathwayVersion,
        source: "diagnosis_text",
        matchedOn: textHit,
        diagnosisText: diagnosis.text,
      });
    }
  }

  return matches;
}

/**
 * Whether the triggering diagnosis is clinician-confirmed. A working / provisional diagnosis
 * activates the pathway only as `suggested` (DOCX: "initial state may be `suggested` if the
 * triggering diagnosis is not yet clinician-confirmed").
 */
export function isWorkingDiagnosis(text: string): boolean {
  return /\b(\?|query|susp(ected|icion)?|likely|probable|working|provisional|r\/o|rule out|to be confirmed|tbc)\b/i.test(
    text
  );
}
