import { createClient } from "@/lib/supabase/server";

export type TemplateItem = {
  id: string;
  label: string;
  aliases: string[];
  kind: string;
  importance: "core" | "optional";
  position: number;
  hint: string | null;
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

export async function getTemplateForPatient(patient: {
  template_family: string | null;
  template_variant: string | null;
  surgery_date: string | null;
}): Promise<CareTemplate | null> {
  if (!patient.template_family) return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from("care_templates")
    .select(
      "id, name, family, variant, phase, ward_id, care_template_items(id, label, aliases, kind, importance, position, hint)"
    )
    .eq("family", patient.template_family)
    .eq("phase", phaseFor(patient));

  if (!data || data.length === 0) return null;

  const wanted = data.filter((t) => (t.variant ?? null) === (patient.template_variant ?? null));
  if (wanted.length === 0) return null;

  // A ward's own corrected copy wins over the shared starter library.
  const chosen = wanted.find((t) => t.ward_id !== null) ?? wanted[0];
  const items = ((chosen.care_template_items ?? []) as TemplateItem[])
    .slice()
    .sort((a, b) => a.position - b.position);

  return {
    id: chosen.id,
    name: chosen.name,
    family: chosen.family,
    variant: chosen.variant,
    phase: chosen.phase,
    items,
  };
}

/** Everything a patient can be assigned to, for the add-patient screen. */
export async function listTemplateChoices(): Promise<TemplateChoice[]> {
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
}

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

export type MatchedItem = {
  item: TemplateItem;
  value: string | null;
  recordedAt: string | null;
  /** Core item with nothing to show — the thing worth surfacing as a gap. */
  missing: boolean;
};

const norm = (s: string) => s.toLowerCase().replace(/\s+/g, " ").trim();

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
  observations: { label: string; value_text: string | null; recorded_at: string }[]
): MatchedItem[] {
  const byLabel = new Map<string, { value_text: string | null; recorded_at: string }>();
  for (const obs of observations) {
    const key = norm(obs.label);
    const existing = byLabel.get(key);
    if (!existing || obs.recorded_at > existing.recorded_at) byLabel.set(key, obs);
  }

  const today = istDate(new Date().toISOString());
  const needsToday = template.phase === "after_surgery";

  return template.items.map((item) => {
    const keys = [norm(item.label), ...(item.aliases ?? []).map(norm)];
    let hit: { value_text: string | null; recorded_at: string } | undefined;
    for (const k of keys) {
      const found = byLabel.get(k);
      if (found && (!hit || found.recorded_at > hit.recorded_at)) hit = found;
    }

    const fresh = hit ? !needsToday || istDate(hit.recorded_at) === today : false;

    return {
      item,
      value: hit?.value_text ?? null,
      recordedAt: hit?.recorded_at ?? null,
      missing: item.importance === "core" && !fresh,
    };
  });
}

/** Calendar date in Indian time — the same reason day numbers are counted in IST. */
function istDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
}
