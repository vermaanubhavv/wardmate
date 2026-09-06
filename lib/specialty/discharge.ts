import type { DischargeTemplate } from "@/lib/discharge-templates";
import type { SpecialtyPack } from "./types";

/**
 * Template selection, per specialty.
 *
 * These are the pack-aware versions of listDischargeTemplates / getDischargeTemplate /
 * matchDischargeTemplate in lib/discharge-templates.ts. They live here rather than there so
 * lib/discharge-templates.ts never has to import lib/specialty — the packs import the
 * templates, and the dependency runs one way only.
 */

export function listDischargeTemplatesFor(pack: SpecialtyPack): { key: string; label: string }[] {
  return [...pack.dischargeTemplates, pack.genericDischargeTemplate].map((t) => ({
    key: t.key,
    label: t.label,
  }));
}

export function getDischargeTemplateFor(
  pack: SpecialtyPack,
  key: string | null | undefined
): DischargeTemplate | null {
  if (!key) return null;
  if (key === pack.genericDischargeTemplate.key) return pack.genericDischargeTemplate;
  return pack.dischargeTemplates.find((t) => t.key === key) ?? null;
}

/**
 * The template the typed procedure / diagnosis / care-template family points at, or null.
 *
 * Same rule as the surgical version it generalises: the diagnosis wording is the most specific
 * signal and is tried first; the care-template family is only a fallback. First match wins, so
 * each pack's array is ordered specific-before-general.
 */
export function matchDischargeTemplateFor(
  pack: SpecialtyPack,
  input: {
    procedureText?: string | null;
    diagnosisText?: string | null;
    templateFamily?: string | null;
  }
): DischargeTemplate | null {
  const haystack = `${input.procedureText ?? ""} ${input.diagnosisText ?? ""}`.trim();
  if (haystack) {
    const byText = pack.dischargeTemplates.find((t) => t.match.test(haystack));
    if (byText) return byText;
  }
  if (input.templateFamily) {
    const byFamily = pack.dischargeTemplates.find((t) =>
      t.families?.includes(input.templateFamily!)
    );
    if (byFamily) return byFamily;
  }
  return null;
}
