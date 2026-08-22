import { historyReadsNormal } from "@/lib/case-history";

type ComorbiditySource = {
  label: string;
  value_text: string | null;
  source_quote: string;
};

/**
 * Read explicitly stated background illness from observations, including entries captured
 * before the extractor learned the `comorbidities` label. This is intentionally narrow: a
 * current diagnosis or symptom is not turned into a co-morbidity merely because it happens to
 * be in the case sheet.
 */
export function listedComorbidities(observations: ComorbiditySource[]): string[] {
  const found: string[] = [];

  for (const observation of observations) {
    const text = [observation.value_text ?? "", observation.source_quote]
      .filter(Boolean)
      .join(" ");
    const isLabeled = /co[- ]?morbid/i.test(observation.label);
    const hasHistoryMarker = /\b(?:k\s*\/?\s*c\s*\/?\s*o|known case of|known to have|past h\/?o)\b/i.test(text);
    // "H/O" alone can describe a presenting complaint rather than a background illness, so
    // use it only alongside a common chronic-condition term. The extraction model remains the
    // general path for every other explicitly documented co-morbidity.
    const isHistoryOfCommonCondition =
      /\bh\s*\/\s*o\b/i.test(text) && COMMON_COMORBIDITY.test(text);
    const isKnownCase = hasHistoryMarker || isHistoryOfCommonCondition;
    const isPreviousTb = /\b(?:previous|past)\s+(?:h\/?o\s+)?(?:pulmonary\s+)?tb\b/i.test(text);

    if (!isLabeled && !isKnownCase && !isPreviousTb) continue;

    // The structured value normally holds just the illness. Older entries may hold the whole
    // phrase ("K/C/O asthma"), in which case remove only the declaration, never the condition.
    const value = cleanComorbidity(observation.value_text || observation.source_quote);
    // A denial recorded under the "comorbidities" label — "no h/o DM | HTN | anaemia |
    // seizure" — is not itself a co-morbidity. Nothing upstream filters this: the extractor
    // stores whatever was said under that label whether the sentence affirms or denies, so the
    // same "plain denied list, nothing more" check the case history card uses applies here too.
    if (value && !historyReadsNormal(value)) found.push(value);
  }

  const seen = new Set<string>();
  return found.filter((value) => {
    const key = value.toLowerCase().replace(/\s+/g, " ").trim();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

const COMMON_COMORBIDITY = /\b(?:htn|hypertension|dm|diabetes|asthma|copd|bronchiectasis|osa|obstructive sleep apno?ea|ihd|cad|coronary artery disease|ischaemic heart disease|mi|myocardial infarction|heart failure|af|atrial fibrillation|ckd|esrd|dialysis|cld|cirrhosis|hepatitis\s*[bc]|hep\s*[bc]|hiv|hypo\s*thyroid|hyper\s*thyroid|epilepsy|seizure disorder|cva|stroke|tia|parkinson(?:'s)?|dementia|rheumatoid arthritis|ankylosing spondylitis|sle|lupus|connective tissue disease|malignan(?:cy|t)|cancer|transplant|immunosuppressed?)\b/i;

function cleanComorbidity(value: string): string {
  return value
    .replace(/^\s*(?:k\s*\/?\s*c\s*\/?\s*o|known case of|known to have|past h\/?o)\s*[:\-–]?\s*/i, "")
    .replace(/^\s*(?:co[- ]?morbidities?|comorbidities)\s*[:\-–]?\s*/i, "")
    .trim();
}
