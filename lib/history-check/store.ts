import { createHash } from "node:crypto";
import type { createClient } from "@/lib/supabase/server";
import { log } from "@/lib/observability";
import { historyCheckEnabled } from "@/lib/history-check/flag";
import { getTree } from "@/lib/history-check/trees";
import { buildSources, type CheckResult, type HistorySource, type SlotResult } from "@/lib/history-check/sources";
import { estimateCostUsd, extractHistoryCheck, PROMPT_VERSION, type ExtractionUsage, type PatientLine } from "@/lib/history-check/extract";
import { validateExtraction } from "@/lib/history-check/validate";
import { AI_MODEL } from "@/lib/model";
import type { SlotState } from "@/lib/history-check/types";

type Supa = Awaited<ReturnType<typeof createClient>>;

/** One stored run — the row shape of history_checks (0078). */
export type HistoryCheckRun = {
  id: string;
  patient_id: string;
  tree_id: string;
  tree_version: string;
  prompt_version: string;
  model: string;
  input_hash: string;
  source_entry_ids: string[];
  status: "ok" | "error";
  result: CheckResult | null;
  usage: ExtractionUsage | null;
  cost_usd: number | null;
  error: string | null;
  resolutions: Resolutions;
  created_at: string;
};

/** A resident's explicit answers to flagged items, written by tap (Stage 3). */
export type Resolutions = {
  [slotId: string]: { state: SlotState; at: string; by: string } | { dismissed: boolean; at: string; by: string } | undefined;
} & {
  wrong_patient?: { dismissed: boolean; at: string; by: string };
};

/** Runs per user per hour before the route refuses. Idempotent re-runs do not count: they
 *  never reach the insert. */
export const HOURLY_CAP = 30;

const RUN_COLUMNS =
  "id, patient_id, tree_id, tree_version, prompt_version, model, input_hash, source_entry_ids, status, result, usage, cost_usd, error, resolutions, created_at";

/**
 * The idempotency key. Anything that could change the answer is in it: which tree version,
 * which prompt, which model, and the exact text of every source in order (with the entry id,
 * so the same words dictated as a new entry are a new run — the record changed).
 */
export function inputHash(
  treeId: string,
  treeVersion: string,
  model: string,
  sources: HistorySource[]
): string {
  const h = createHash("sha256");
  h.update(JSON.stringify([treeId, treeVersion, PROMPT_VERSION, model, sources.map((s) => [s.entryId, s.text])]));
  return h.digest("hex");
}

/** The case-history entries as sources, oldest first. */
export async function loadSources(supabase: Supa, patientId: string): Promise<HistorySource[]> {
  const { data } = await supabase
    .from("entries")
    .select("id, source, transcript, recorded_at, observations(label, value_text)")
    .eq("patient_id", patientId)
    .eq("is_case_history", true)
    .order("recorded_at", { ascending: true });
  return buildSources(
    ((data ?? []) as unknown as {
      id: string;
      source: string;
      transcript: string | null;
      recorded_at: string;
      observations: { label: string; value_text: string | null }[];
    }[])
  );
}

/** The newest run of a tree for a patient, if any. Null when the flag is off. */
export async function latestRun(supabase: Supa, patientId: string, treeId: string): Promise<HistoryCheckRun | null> {
  if (!historyCheckEnabled()) return null;
  const { data } = await supabase
    .from("history_checks")
    .select(RUN_COLUMNS)
    .eq("patient_id", patientId)
    .eq("tree_id", treeId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data as HistoryCheckRun | null) ?? null;
}

export type RunOutcome =
  | { ok: true; run: HistoryCheckRun; reused: boolean }
  | { ok: false; status: 404 | 409 | 422 | 429 | 502; error: string };

/**
 * Run (or reuse) a history check. The whole server-side flow:
 *
 *   flag → tree → sources → hash → existing row? return it → hourly cap → model → validate
 *   → insert (ok or error) → return
 *
 * Every model failure is still recorded as an error run, so a broken key or a spent account
 * does not become a retry storm: the cap counts error runs too.
 */
export async function runHistoryCheck(args: {
  supabase: Supa;
  userId: string;
  patientId: string;
  treeId: string;
  model?: string;
}): Promise<RunOutcome> {
  const { supabase, userId, patientId, treeId } = args;
  if (!historyCheckEnabled()) return { ok: false, status: 404, error: "History check is not enabled." };

  const tree = getTree(treeId);
  if (!tree) return { ok: false, status: 404, error: "Unknown complaint." };

  const { data: patient } = await supabase
    .from("current_patients")
    .select("id, ward_id, bed, age_years, sex, surgery_date")
    .eq("id", patientId)
    .maybeSingle();
  if (!patient) return { ok: false, status: 404, error: "Patient not found." };

  const sources = await loadSources(supabase, patientId);
  if (sources.length === 0) {
    return { ok: false, status: 422, error: "Nothing in the case history yet — record or build it first." };
  }

  const model = args.model ?? AI_MODEL;
  const hash = inputHash(tree.id, tree.version, model, sources);

  const { data: existing } = await supabase
    .from("history_checks")
    .select(RUN_COLUMNS)
    .eq("patient_id", patientId)
    .eq("input_hash", hash)
    .maybeSingle();
  if (existing && (existing as HistoryCheckRun).status === "ok") {
    return { ok: true, run: existing as HistoryCheckRun, reused: true };
  }

  const since = new Date(Date.now() - 3600_000).toISOString();
  const { count } = await supabase
    .from("history_checks")
    .select("id", { count: "exact", head: true })
    .eq("created_by", userId)
    .gte("created_at", since);
  if ((count ?? 0) >= HOURLY_CAP) {
    return { ok: false, status: 429, error: "Too many history checks in the last hour. Try again later." };
  }

  const patientLine: PatientLine = { bed: patient.bed, age_years: patient.age_years, sex: patient.sex };
  const base = {
    patient_id: patientId,
    ward_id: patient.ward_id,
    created_by: userId,
    tree_id: tree.id,
    tree_version: tree.version,
    prompt_version: PROMPT_VERSION,
    model,
    source_entry_ids: sources.map((s) => s.entryId),
    input_hash: hash,
  };

  let extracted;
  try {
    extracted = await extractHistoryCheck(tree, sources, patientLine, { model });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    // An error run with the same hash as a previous error run would violate the unique key;
    // that is fine — the first failure is already on record.
    await supabase.from("history_checks").insert({ ...base, status: "error", error: message.slice(0, 2000) });
    log.warn("history check failed", { "tree.id": tree.id, model, "sources.count": sources.length });
    return { ok: false, status: 502, error: message };
  }

  const result = validateExtraction(tree, extracted.raw, sources);
  const cost = estimateCostUsd(extracted.model, extracted.usage);

  // Upsert on the unique key: a previous ERROR run with this hash is replaced by the good one.
  const { data: inserted, error: insErr } = await supabase
    .from("history_checks")
    .upsert(
      {
        ...base,
        model: extracted.model,
        status: "ok",
        result: result as never,
        rejections: result.rejections as never,
        usage: extracted.usage as never,
        cost_usd: cost,
        error: null,
      },
      { onConflict: "patient_id,input_hash" }
    )
    .select(RUN_COLUMNS)
    .single();

  log.info("history check run", {
    "tree.id": tree.id,
    "tree.version": tree.version,
    model: extracted.model,
    "sources.count": sources.length,
    "slots.positive": result.slots.filter((s) => s.state === "positive").length,
    "slots.negative": result.slots.filter((s) => s.state === "negative").length,
    "slots.unasked": result.slots.filter((s) => s.state === "unasked").length,
    "rejections.count": result.rejections.length,
    "usage.input_tokens": extracted.usage.input_tokens,
    "usage.output_tokens": extracted.usage.output_tokens,
    "usage.cache_read_input_tokens": extracted.usage.cache_read_input_tokens,
    cost_usd: cost ?? undefined,
  });

  if (insErr || !inserted) {
    return { ok: false, status: 502, error: `Ran the check but could not save it: ${insErr?.message ?? "unknown error"}` };
  }
  return { ok: true, run: inserted as HistoryCheckRun, reused: false };
}

/**
 * Overlay a resident's explicit resolutions on the validated slots. A resolution is the
 * resident's own statement, made by tap, so it may set any of the three states; it carries no
 * quote, and `resolved` marks it so the card can say "you resolved this" rather than show a
 * source. A resolved slot has no open conflict.
 */
export function applyResolutions(
  slots: SlotResult[],
  resolutions: Resolutions | null | undefined
): (SlotResult & { resolved?: boolean })[] {
  if (!resolutions) return slots;
  return slots.map((s) => {
    const r = resolutions[s.id];
    if (!r || !("state" in r)) return s;
    return { ...s, state: r.state, evidence: null, value: r.state === "positive" ? s.value : null, conflict: null, resolved: true };
  });
}
