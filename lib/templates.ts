import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { istDate } from "@/lib/urgency";
import {
  coerceTrigger,
  evaluateTrigger,
  normAnalyte,
  type ItemTrigger,
  type TriggerContext,
} from "@/lib/checklist-triggers";

export type TemplateItem = {
  id: string;
  label: string;
  aliases: string[];
  kind: string;
  importance: "core" | "optional";
  position: number;
  hint: string | null;
  /** Which part of "Current progress" this belongs under — null for anything not yet
   *  classified (care_templates items, and any protocol item filed before this existed). */
  soap_section: "subjective" | "objective" | "assessment" | "plan" | "checks" | null;
  /** What this line reads as on a routine round with nothing abnormal — "Afebrile",
   *  "Tolerating orally". Null for items with no sensible "normal" (day number, plan, a
   *  diagnosis). See supabase/patches/0056_normal_phrase.sql. */
  normal_phrase: string | null;
  /** An auto-trigger rule (schema: lib/checklist-triggers.ts). When set, the item is hidden
   *  until its conditions are met — history / entry based, time based, or both. Null = always
   *  shown. See supabase/patches/0058_checklist_item_trigger.sql. */
  trigger: ItemTrigger | null;
};

export type CareTemplate = {
  id: string;
  name: string;
  family: string;
  variant: string | null;
  phase: "before_surgery" | "after_surgery";
  items: TemplateItem[];
};

export type TemplateChoice = { family: string; variant: string | null; label: string };

/** A patient is before surgery until a date of operation exists for them. */
export function phaseFor(patient: { surgery_date: string | null }) {
  return patient.surgery_date ? "after_surgery" : "before_surgery";
}

export const getTemplateForPatient = cache(async function getTemplateForPatient(patient: {
  template_family: string | null;
  template_variant: string | null;
  surgery_date: string | null;
}): Promise<CareTemplate | null> {
  if (!patient.template_family) return null;

  const supabase = await createClient();
  const phase = phaseFor(patient);

  // A published protocol scoped to this procedure and phase takes over from the old
  // care_templates row — see supabase/patches/0037_lap_chole_checklist_protocol_seed.sql. This
  // is checked first so publishing a checklist protocol is the only step needed to switch a
  // procedure over; nothing else about how a patient page reads its template changes.
  //
  // `trigger` (0058) is asked for optionally: until that patch is run PostgREST rejects the
  // whole select for naming an unknown column, so on that error the query is retried without
  // it and every item just carries no auto-trigger.
  const protocolCols = (withTrigger: boolean) =>
    `id, title, template_family, template_variant, phase, company_protocol_items(id, kind, prompt, importance, aliases, position, soap_section, normal_phrase${withTrigger ? ", trigger" : ""})`;
  let protocolRes = await supabase
    .from("company_protocols")
    .select(protocolCols(true))
    .eq("template_family", patient.template_family)
    .eq("phase", phase)
    .eq("status", "published");
  if (protocolRes.error) {
    protocolRes = await supabase
      .from("company_protocols")
      .select(protocolCols(false))
      .eq("template_family", patient.template_family)
      .eq("phase", phase)
      .eq("status", "published");
  }
  const protocolRows = protocolRes.data as unknown as
    | {
        id: string;
        title: string;
        template_family: string;
        template_variant: string | null;
        phase: string;
        company_protocol_items: unknown;
      }[]
    | null;

  const protocolMatch = (protocolRows ?? []).find(
    (p) => (p.template_variant ?? null) === (patient.template_variant ?? null)
  );

  if (protocolMatch) {
    const items = (
      (protocolMatch.company_protocol_items as {
        id: string;
        kind: string;
        prompt: string;
        importance: "core" | "optional";
        aliases: string[];
        position: number;
        soap_section: TemplateItem["soap_section"];
        normal_phrase: string | null;
        trigger: unknown;
      }[]) ?? []
    )
      .slice()
      .sort((a, b) => a.position - b.position)
      .map((i) => ({
        id: i.id,
        label: i.prompt,
        aliases: i.aliases ?? [],
        kind: i.kind,
        importance: i.importance,
        position: i.position,
        hint: null,
        soap_section: i.soap_section,
        normal_phrase: i.normal_phrase ?? null,
        trigger: coerceTrigger(i.trigger),
      }));

    return {
      id: protocolMatch.id,
      name: protocolMatch.title,
      family: protocolMatch.template_family as string,
      variant: protocolMatch.template_variant,
      phase: protocolMatch.phase as "before_surgery" | "after_surgery",
      items,
    };
  }

  const careCols = (withTrigger: boolean) =>
    `id, name, family, variant, phase, ward_id, care_template_items(id, label, aliases, kind, importance, position, hint, normal_phrase${withTrigger ? ", trigger" : ""})`;
  let careRes = await supabase
    .from("care_templates")
    .select(careCols(true))
    .eq("family", patient.template_family)
    .eq("phase", phase);
  if (careRes.error) {
    careRes = await supabase
      .from("care_templates")
      .select(careCols(false))
      .eq("family", patient.template_family)
      .eq("phase", phase);
  }
  const data = careRes.data as unknown as
    | {
        id: string;
        name: string;
        family: string;
        variant: string | null;
        phase: "before_surgery" | "after_surgery";
        ward_id: string | null;
        care_template_items: unknown;
      }[]
    | null;

  if (!data || data.length === 0) return null;

  const wanted = data.filter((t) => (t.variant ?? null) === (patient.template_variant ?? null));
  if (wanted.length === 0) return null;

  // A ward's own corrected copy wins over the shared starter library.
  const chosen = wanted.find((t) => t.ward_id !== null) ?? wanted[0];
  const items = ((chosen.care_template_items ?? []) as (TemplateItem & { trigger: unknown })[])
    .slice()
    .sort((a, b) => a.position - b.position)
    .map((i) => ({ ...i, trigger: coerceTrigger(i.trigger) }));

  return {
    id: chosen.id,
    name: chosen.name,
    family: chosen.family,
    variant: chosen.variant,
    phase: chosen.phase,
    items,
  };
})

/** Everything a patient can be assigned to, for the add-patient screen. */
export const listTemplateChoices = cache(async function listTemplateChoices(): Promise<TemplateChoice[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("care_templates")
    .select("family, variant, name")
    .eq("phase", "after_surgery")
    .order("family");

  const seen = new Set<string>();
  const out: TemplateChoice[] = [];
  for (const t of data ?? []) {
    const key = `${t.family}|${t.variant ?? ""}`;
    if (seen.has(key)) continue;
    seen.add(key);
    // "Lap chole — after surgery" is the template's name; the choice is the operation itself.
    out.push({
      family: t.family,
      variant: t.variant,
      label: t.name.replace(/\s+—\s+after surgery$/i, ""),
    });
  }
  return out;
})

/** The key a patient's operation is looked up under. Kept in one place so the ward list and
 *  the patient screen cannot disagree about how family and variant combine. */
export function procedureKey(p: {
  template_family: string | null;
  template_variant: string | null;
}): string | null {
  return p.template_family ? `${p.template_family}|${p.template_variant ?? ""}` : null;
}

/**
 * Every operation the app knows a name for, as one lookup, so a ward list of thirty patients
 * costs one query rather than thirty. The name shown is the one the resident chose from the
 * Operation picker — never anything inferred from the diagnosis.
 */
export async function getProcedureLabels(): Promise<Map<string, string>> {
  const choices = await listTemplateChoices();
  return new Map(choices.map((c) => [`${c.family}|${c.variant ?? ""}`, c.label]));
}

/**
 * What the card should call this patient's operation.
 *
 * A typed name wins over the template's name, because a unit that writes "Lap chole +
 * IOC" means that, not the library's wording. Shown only for patients who have actually
 * been operated on — never a name attached to someone still awaiting surgery.
 */
export function procedureFor(
  patient: {
    post_op_day: number | null;
    procedure_text: string | null;
    template_family: string | null;
    template_variant: string | null;
  },
  labels: Map<string, string>
): string | null {
  if (patient.post_op_day === null) return null;
  if (patient.procedure_text) return patient.procedure_text;

  const key = procedureKey(patient);
  return key ? (labels.get(key) ?? null) : null;
}

/**
 * Turn a freely typed operation into what gets stored.
 *
 * Typing a name the library knows links its template too, so the checklist follows the
 * operation without a second field to keep in step. Typing anything else keeps the name and
 * leaves the patient with no template — correct, because nobody has told the app what to
 * expect for that operation, and a checklist invented for it would be a fabrication.
 */
export function resolveProcedure(
  typed: string,
  choices: TemplateChoice[]
): { procedure_text: string | null; template_family: string | null; template_variant: string | null } {
  const text = typed.trim();
  if (!text) return { procedure_text: null, template_family: null, template_variant: null };

  const match = choices.find((c) => c.label.toLowerCase() === text.toLowerCase());
  return {
    procedure_text: text,
    template_family: match?.family ?? null,
    template_variant: match?.variant ?? null,
  };
}

export type MatchedItem = {
  item: TemplateItem;
  value: string | null;
  recordedAt: string | null;
  /** Core item with nothing to show — the thing worth surfacing as a gap. */
  missing: boolean;
  /** A patient-reported symptom (fever, pain, vomiting …) that nobody selected or dictated
   *  today. On a round, an unmentioned symptom is a pertinent negative — "no complaints of
   *  fever" — not a hole in the record, so it is written into the note rather than flagged. */
  pertinentNegative: boolean;
  /** The reference range printed beside this result on the report it came from, when it came
   *  from one — see supabase/patches/0043_lab_reference_ranges.sql. */
  refLow: number | null;
  refHigh: number | null;
  refText: string | null;
};

/** Only the fields matchTemplate reads. Widened so a matched lab keeps the range that was
 *  printed next to it, which is the most authoritative one there is. */
type MatchableObservation = {
  label: string;
  value_text: string | null;
  recorded_at: string;
  ref_low?: number | null;
  ref_high?: number | null;
  ref_text?: string | null;
};

const norm = (s: string) =>
  s.toLowerCase().replace(/[-‐-―]/g, " ").replace(/\s+/g, " ").trim();

/** Checklist labels that name a symptom the patient either has or does not — the ones where
 *  "not selected" honestly means "no complaint", not "not asked". Deliberately narrow: only
 *  clear patient-reported complaints, never a sign someone has to look for (bleeding, a
 *  wound, retention), which is why those are absent here. Compared after norm(). */
const SYMPTOM_LABELS = new Set([
  "fever",
  "pain",
  "abdominal pain",
  "shoulder tip pain",
  "chest pain",
  "vomiting",
  "nausea",
  "cough",
  "breathlessness",
  "shortness of breath",
  "constipation",
  "diarrhoea",
  "diarrhea",
  "dysuria",
  "headache",
  "dizziness",
  "palpitations",
]);

/** First number in a string, or null — for turning "Hb 8.2 g/dL" into 8.2. */
function firstNumber(s: string | null): number | null {
  if (!s) return null;
  const m = s.match(/-?\d+(\.\d+)?/);
  return m ? Number(m[0]) : null;
}

/**
 * Line up what was actually said against what the template expects.
 *
 * Freshness is judged differently by phase, which is a clinical guess worth stating: after
 * surgery, findings go stale overnight, so an item counts as missing unless it was recorded
 * today. Before surgery, most items are one-time checks — consent does not need retaking
 * every morning — so anything ever recorded counts as done.
 */
export function matchTemplate(
  template: CareTemplate,
  observations: MatchableObservation[],
  opts: {
    /** The post-op (or admission) day the app already computes from the recorded dates. When
     *  this is known, the "post-operative day" checklist item is never a gap — the number is
     *  on the page whether or not anyone said it aloud. */
    knownDay?: number | null;
    /** Date of operation (YYYY-MM-DD), when there is one. Drives the post-op-day and
     *  hours-since-surgery trigger conditions. */
    surgeryDate?: string | null;
    /** Admission timestamp, for hours-since-admission trigger conditions. */
    admittedOn?: string | null;
    /** Overridable clock, for tests. */
    now?: string;
  } = {}
): MatchedItem[] {
  const byLabel = new Map<string, MatchableObservation>();
  for (const obs of observations) {
    const key = norm(obs.label);
    const existing = byLabel.get(key);
    if (!existing || obs.recorded_at > existing.recorded_at) byLabel.set(key, obs);
  }

  const today = istDate(new Date().toISOString());
  const needsToday = template.phase === "after_surgery";

  // The resident said, in so many words, that there is nothing new — "no fresh complaints",
  // "systemically well", "uneventful night". That is a positive statement about every symptom
  // at once, so an unmentioned symptom then reads as a confirmed negative rather than a
  // yesterday value nobody refreshed.
  const blanketNegative = observations.some((o) =>
    /\b(no (fresh|new|acute|active)?\s*(complaints?|issues?|events?|concerns?)|systemically well|nil complaints?|asymptomatic|uneventful (night|day))\b/i.test(
      `${o.label} ${o.value_text ?? ""}`
    )
  );

  // The context every item's auto-trigger (0058) is evaluated against. Values only — not the
  // template's own category labels — so "history of jaundice: none" can't trigger on the word
  // in its own heading.
  const nowIso = opts.now ?? new Date().toISOString();
  const hoursSince = (from: string | null | undefined) =>
    from ? (Date.parse(nowIso) - Date.parse(from.length <= 10 ? `${from}T00:00:00+05:30` : from)) / 3_600_000 : null;
  const triggerCtx: TriggerContext = {
    values: observations
      .map((o) => o.value_text ?? "")
      .filter(Boolean)
      .join(" — "),
    postOpDay: opts.surgeryDate ? (opts.knownDay ?? null) : null,
    hoursSinceSurgery: hoursSince(opts.surgeryDate),
    hoursSinceAdmission: hoursSince(opts.admittedOn),
    hasValue: (labelOrAlias) => {
      const o = byLabel.get(norm(labelOrAlias));
      return Boolean(o && (o.value_text ?? "").trim());
    },
    labs: observations
      .map((o) => ({ name: normAnalyte(o.label), value: firstNumber(o.value_text) }))
      .filter((l): l is { name: string; value: number } => l.value !== null),
  };

  const forceCore = new Set<string>();

  return template.items
    .filter((item) => {
      const { active, forceCore: fc } = evaluateTrigger(item.trigger, triggerCtx);
      if (active && fc) forceCore.add(item.id);
      return active;
    })
    .map((item) => {
    const keys = [norm(item.label), ...(item.aliases ?? []).map(norm)];
    let hit: MatchableObservation | undefined;
    for (const k of keys) {
      const found = byLabel.get(k);
      if (found && (!hit || found.recorded_at > hit.recorded_at)) hit = found;
    }

    const fresh = hit ? !needsToday || istDate(hit.recorded_at) === today : false;

    // A day-number item is answered the moment the app can compute the day itself.
    const daySatisfied =
      item.kind === "day_number" && (opts.knownDay ?? null) !== null;

    // A trigger with effect "core" promotes an otherwise-optional item to a gap the moment it
    // fires (e.g. "assess for drain removal" the moment POD reaches 2).
    const isCore = item.importance === "core" || forceCore.has(item.id);

    const unrecordedCore = isCore && !fresh && !daySatisfied;
    const isSymptom = SYMPTOM_LABELS.has(norm(item.label));

    // A symptom counts as denied when it was never raised at all, or when the round carries a
    // blanket "no fresh complaints" that speaks for all of them. Either way it leaves "missing"
    // and is written into the note as a pertinent negative.
    const symptomDenied =
      isCore &&
      isSymptom &&
      !fresh &&
      !daySatisfied &&
      (!hit || blanketNegative);

    return {
      item,
      value: hit?.value_text ?? null,
      recordedAt: hit?.recorded_at ?? null,
      missing: unrecordedCore && !symptomDenied,
      pertinentNegative: symptomDenied,
      refLow: hit?.ref_low ?? null,
      refHigh: hit?.ref_high ?? null,
      refText: hit?.ref_text ?? null,
    };
  });
}

