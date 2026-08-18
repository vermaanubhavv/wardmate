import { createClient } from "@/lib/supabase/server";
import { compareBeds, type WardPatient } from "@/lib/patients";
import { getCurrentWard, getActivePatients, getRemovedCount } from "@/lib/ward";
import { getProcedureLabels, listTemplateChoices, type TemplateChoice } from "@/lib/templates";

export type Ward = {
  id: string;
  name: string;
  owner_id: string;
  join_code: string;
  letterhead: string | null;
};

export type WardScreen = {
  ward: Ward | null;
  patients: WardPatient[];
  removedCount: number;
  templateChoices: TemplateChoice[];
  procedures: Map<string, string>;
  /** True when this came from the six separate queries rather than the one. */
  fellBack: boolean;
  error: { message: string } | null;
};

type RpcShape = {
  ward: Ward | null;
  patients: (WardPatient & Record<string, unknown>)[];
  removed_count: number;
  procedures: { family: string; variant: string | null; name: string }[];
};

/** "Lap chole — after surgery" is the template's name; the choice is the operation itself. */
function toChoices(rows: RpcShape["procedures"]): TemplateChoice[] {
  const seen = new Set<string>();
  const out: TemplateChoice[] = [];
  for (const t of rows ?? []) {
    const key = `${t.family}|${t.variant ?? ""}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({
      family: t.family,
      variant: t.variant,
      label: t.name.replace(/\s+—\s+after surgery$/i, ""),
    });
  }
  return out;
}

/**
 * Everything the ward list needs, in one round trip.
 *
 * It was six: verify the user, read their profile, read the ward, read the patients, read the
 * observations, read the entries, read the templates. Each costs about 220ms from the server
 * regardless of what it asks, so the count of trips WAS the loading time.
 *
 * The database also does the counting now. The old path fetched every observation and every
 * entry belonging to the ward across the wire, to count them in JavaScript — a payload that
 * grows with every round ever recorded. Two integers per patient come back instead.
 *
 * Falls back to the old queries if the function is missing or errors, and says so. A speed
 * change is not worth a screen that cannot load: a unit whose database has not been migrated
 * yet gets the slow version rather than nothing, and the flag makes that visible rather than
 * leaving a mystery where the fast path should be.
 */
export async function getWardScreen(): Promise<WardScreen> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("ward_screen");

  if (!error && data) {
    const payload = data as RpcShape;
    const choices = toChoices(payload.procedures ?? []);

    return {
      ward: payload.ward,
      // Sorted here, not in SQL: beds run SW-2, SW-10, and Postgres would order them as text.
      patients: (payload.patients ?? []).slice().sort((a, b) => compareBeds(a.bed, b.bed)),
      removedCount: payload.removed_count ?? 0,
      templateChoices: choices,
      procedures: new Map(choices.map((c) => [`${c.family}|${c.variant ?? ""}`, c.label])),
      fellBack: false,
      error: null,
    };
  }

  // The old road, still paved.
  const { ward, error: wardError } = await getCurrentWard();
  if (wardError || !ward) {
    return {
      ward: null,
      patients: [],
      removedCount: 0,
      templateChoices: [],
      procedures: new Map(),
      fellBack: true,
      error: wardError ?? error ?? null,
    };
  }

  const [{ patients }, procedures, templateChoices, removedCount] = await Promise.all([
    getActivePatients(ward.id),
    getProcedureLabels(),
    listTemplateChoices(),
    getRemovedCount(ward.id),
  ]);

  return {
    ward: ward as Ward,
    patients,
    removedCount,
    templateChoices,
    procedures,
    fellBack: true,
    error: null,
  };
}
