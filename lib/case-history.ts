import { mergeLabelValue } from "@/lib/patients";

/**
 * The clerking note, ordered the way a case sheet is written rather than the order it happened
 * to be dictated in: complaints, then the story of them, then background, then family.
 *
 * Two conventions from the ward, and they are opposite conventions on purpose:
 *
 *   Past history is ALWAYS shown. Silence there is itself information — "NR" says nobody
 *   recorded it, "NAD" says somebody looked and there was nothing. Those are different facts
 *   and collapsing them would lose the one that matters before an anaesthetic.
 *
 *   Family history is shown ONLY when positive. A negative family history is the overwhelming
 *   default and printing it on every patient is noise nobody reads.
 *
 * Anything recorded that does not belong to one of the four sections is still returned, in
 * `other`, and the caller must show it. Nothing recorded is ever dropped just because this
 * file has no section for it.
 */

export type HistoryLine = { id: string; text: string };

export type HistorySection = {
  key: "chief" | "hopi" | "past" | "family";
  label: string;
  lines: HistoryLine[];
  /** Shown in place of lines when there are none. Null means show nothing at all. */
  note: "NR" | "NAD" | null;
  /** True when the section should not be rendered — family history with nothing positive. */
  hidden: boolean;
};

export type CaseHistoryView = { sections: HistorySection[]; other: HistoryLine[] };

const SECTIONS: {
  key: HistorySection["key"];
  label: string;
  aliases: string[];
  /** Absent means "NR" rather than the section disappearing. */
  alwaysShow: boolean;
}[] = [
  {
    key: "chief",
    label: "Chief complaints",
    aliases: [
      "chief complaints", "chief complaint", "presenting complaints", "presenting complaint",
      "complaints", "complaint", "c/o", "chief c/o", "presenting c/o",
    ],
    alwaysShow: true,
  },
  {
    key: "hopi",
    label: "History of presenting illness",
    aliases: [
      "history of presenting illness", "hopi", "history of present illness", "hpi",
      "history of presenting complaints", "history of present complaints",
      "presenting illness", "history of illness",
    ],
    alwaysShow: true,
  },
  {
    key: "past",
    label: "Past history",
    aliases: [
      "past history", "past medical history", "medical history", "comorbidities", "comorbidity",
      "co-morbidities", "co morbidities", "known case of", "k/c/o", "past illness",
      "previous illness", "past surgical history",
    ],
    alwaysShow: true,
  },
  {
    key: "family",
    label: "Family history",
    aliases: ["family history", "f/h", "fh", "familial history"],
    alwaysShow: false,
  },
];

const norm = (s: string) => s.toLowerCase().replace(/[.:]+\s*$/g, "").replace(/\s+/g, " ").trim();

/** What a denial is commonly written to lead with — stripped before reading the list behind it. */
const DENIAL_PREFIX =
  /^(no|not a|nil|denies|negative for|non)\s+(h\/o\s+|k\/c\/o\s+|history of\s+|known\s+)?/i;

/** Words that turn a bare condition name into something worth reading, so a token carrying one
 *  of these is never folded away even inside an otherwise-denied list. */
const CARRIES_INFORMATION =
  /\d|\b(but|however|except|since|for|ago|year|month|day|ongoing|started|starting|given|on\s|diagnosed|controlled|uncontrolled|currently|present|positive|elevated|raised)\b/i;

/**
 * Does this read as "looked, nothing there"?
 *
 * Two shapes count as normal, and both stop at the first sign of an actual clinical detail:
 *
 *   A short bare negation — "nil", "no significant past history".
 *
 *   A denial followed by a comma-separated list of condition names and nothing else — "no h/o
 *   DM, HTN, anemia, seizure" is exactly how a negative past history is written, and every
 *   entry in that list is still a plain absence. It stops being this shape the moment any
 *   token carries an actual detail: a duration, a treatment, a value, or a contradiction like
 *   "but" — "no diabetes, but hypertension since 2019" keeps its comma and stays shown, because
 *   the second half is a real finding, not part of the denial.
 *
 * Same one-way safety as the examination summary: the default is to show, and only these two
 * narrow, checked shapes are allowed to collapse to NAD.
 */
export function historyReadsNormal(value: string | null | undefined): boolean {
  if (!value) return false;
  const v = norm(value);
  if (!v) return false;

  if (!/[,;/]/.test(v)) {
    if (/ but | however | except /.test(v)) return false;
    return /^(nil|none|nad|nr|negative|unremarkable|insignificant|not significant|nothing significant|no|not known|(no|nil|not)\s[a-z\s-]{0,40})$/.test(
      v
    );
  }

  // A comma or slash is present, either of which is how a list of denied conditions is
  // written ("DM, HTN" or "DM/HTN/CAD"). Normal only if the whole thing is a denial prefix
  // followed by a plain list of short condition names, with no token adding a detail beyond
  // "this was asked about".
  const stripped = v.match(DENIAL_PREFIX);
  if (!stripped) return false;
  const list = v.slice(stripped[0].length);
  if (!list.trim()) return false;

  const tokens = list.split(/[,/&]|(?:\band\b)|(?:\bor\b)/).map((t) => t.trim()).filter(Boolean);
  if (tokens.length === 0) return false;

  return tokens.every((t) => t.split(/\s+/).length <= 4 && !CARRIES_INFORMATION.test(t));
}

function sectionFor(label: string): HistorySection["key"] | null {
  const l = norm(label);
  return SECTIONS.find((s) => s.aliases.some((a) => a === l))?.key ?? null;
}

export function summariseCaseHistory(
  observations: { id: string; kind: string; label: string; value_text: string | null }[]
): CaseHistoryView {
  const buckets = new Map<HistorySection["key"], { id: string; text: string; normal: boolean }[]>();
  const other: HistoryLine[] = [];

  for (const o of observations) {
    // Jobs stated in the clerking note live on the to-do list, which is where they get ticked
    // off. Repeating them here would be the same job in two places.
    if (o.kind === "plan") continue;

    const key = sectionFor(o.label);
    const text = (o.value_text ?? "").trim();
    if (!key) {
      const line = mergeLabelValue(o.label, o.value_text);
      if (line.trim()) other.push({ id: o.id, text: line });
      continue;
    }
    const list = buckets.get(key) ?? [];
    list.push({ id: o.id, text: text || o.label, normal: historyReadsNormal(text) });
    buckets.set(key, list);
  }

  const sections: HistorySection[] = SECTIONS.map((def) => {
    const hits = buckets.get(def.key) ?? [];
    const positives = hits.filter((h) => !h.normal);
    const lines = positives.map((h) => ({ id: h.id, text: h.text }));

    if (!def.alwaysShow) {
      // Family history: only when there is something positive to say.
      return { key: def.key, label: def.label, lines, note: null, hidden: lines.length === 0 };
    }

    // Nothing positive. "NAD" only if somebody actually recorded a negative; otherwise nobody
    // asked, and that is "NR".
    const note: HistorySection["note"] =
      lines.length > 0 ? null : hits.length > 0 ? "NAD" : "NR";

    return { key: def.key, label: def.label, lines, note, hidden: false };
  });

  return { sections, other };
}
