import { createClient } from "@/lib/supabase/server";
import { compareBeds, type WardPatient } from "@/lib/patients";
import { getCurrentWard, getActivePatients, getWardSpecialtyStored } from "@/lib/ward";
import { getProcedureLabels, listTemplateChoices, toTemplateChoices, type TemplateChoice } from "@/lib/templates";
import { getSpecialtyPack, type SpecialtyPack } from "@/lib/specialty";
import { readsChemoColumns, usesBurnClock } from "@/lib/specialty/clocks";

export type Ward = {
  id: string;
  name: string;
  owner_id: string;
  join_code: string;
  letterhead: string | null;
  /** Which department this unit is — see lib/specialty/. Optional because patch 0060 may not
   *  have run yet; getSpecialtyPack() reads undefined as general surgery. */
  specialty?: string | null;
};

export type WardScreen = {
  ward: Ward | null;
  /** The unit's specialty pack, resolved once here so every screen reads the same one. */
  pack: SpecialtyPack;
  patients: WardPatient[];
  templateChoices: TemplateChoice[];
  procedures: Map<string, string>;
  error: { message: string } | null;
};

type RpcShape = {
  ward: Ward | null;
  patients: (WardPatient & Record<string, unknown>)[];
  procedures: { family: string; variant: string | null; name: string; phase?: string }[];
};

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
 * Falls back to the old queries if the function is missing or errors. A speed change is not
 * worth a screen that cannot load: a unit whose database has not been migrated yet gets the
 * slow version rather than nothing.
 */
export async function getWardScreen(): Promise<WardScreen> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("ward_screen");

  if (!error && data) {
    const payload = data as RpcShape;
    const pack = getSpecialtyPack(payload.ward?.specialty);
    const choices = toTemplateChoices(payload.procedures ?? [], pack);

    return {
      ward: payload.ward,
      pack,
      // Sorted here, not in SQL: beds run SW-2, SW-10, and Postgres would order them as text.
      patients: (payload.patients ?? []).slice().sort((a, b) => compareBeds(a.bed, b.bed)),
      templateChoices: choices,
      procedures: new Map(choices.map((c) => [`${c.family}|${c.variant ?? ""}`, c.label])),
      error: null,
    };
  }

  // The old road, still paved.
  const { ward, error: wardError } = await getCurrentWard();
  if (wardError || !ward) {
    return {
      ward: null,
      pack: getSpecialtyPack(null),
      patients: [],
      templateChoices: [],
      procedures: new Map(),
      error: wardError ?? error ?? null,
    };
  }

  // The specialty is read separately, and guarded: naming a column PostgREST does not know
  // about rejects the WHOLE select, so a unit whose database has not had patch 0060 would
  // lose its patient list rather than just its specialty. See getWardConsultantStored.
  const specialty = await getWardSpecialtyStored(ward.id);
  const pack = getSpecialtyPack(specialty);

  const [{ patients }, procedures, templateChoices] = await Promise.all([
    getActivePatients(ward.id, readsChemoColumns(pack), usesBurnClock(pack)),
    getProcedureLabels(pack.key),
    listTemplateChoices(pack.key),
  ]);

  return {
    ward: { ...(ward as Ward), specialty },
    pack,
    patients,
    templateChoices,
    procedures,
    error: null,
  };
}
