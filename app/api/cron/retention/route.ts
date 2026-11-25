import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { retentionCutoffIso } from "@/lib/retention";

export const runtime = "nodejs";
export const maxDuration = 300;

const TRASH_HOURS = 48;
const BATCH = 200;

/**
 * Deletes what WardMate should no longer hold, once a day (vercel.json). Inaccessible without
 * CRON_SECRET, like the other crons; the service-role key is used here because this is a
 * background job (CONTEXT.md §3), and only for these deletes.
 *
 *  1. Patients discharged more than DISCHARGE_RETENTION_DAYS ago (lib/retention.ts).
 *  2. Patients in Trash past their 48 hours.
 *  3. Whole-round recordings and register photos older than the same retention window. They
 *     cover several patients at once, so they live under 'round/<ward>/' and
 *     'register/<ward>/' rather than under any one patient, and nothing else ever removed them.
 *     By then every segment has long been filed to (or discarded from) its patient.
 *
 * Files in the 'evidence' bucket are removed FIRST: once the row is gone, nothing can tell
 * which files were its (see 0071). The hourly SQL purge of Trash (0080) deletes the row but
 * cannot reach storage, so before this job a trashed patient whose Trash page nobody opened
 * left their files behind.
 */
export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || request.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const trashCutoff = new Date(Date.now() - TRASH_HOURS * 3_600_000).toISOString();

  const [{ data: discharged }, { data: trashed }] = await Promise.all([
    supabase.from("patients").select("id").eq("status", "discharged").lt("discharged_at", retentionCutoffIso()).limit(BATCH),
    supabase.from("patients").select("id").eq("status", "trashed").lt("trashed_at", trashCutoff).limit(BATCH),
  ]);

  const ids = [...(discharged ?? []), ...(trashed ?? [])].map((p) => p.id as string);
  let files = 0;
  const deleted: string[] = [];
  for (const id of ids) {
    const { data: listed, error: listError } = await supabase.storage.from("evidence").list(id);
    if (listError) continue; // keep the row, so its files can still be found tomorrow
    if (listed?.length) {
      const { error } = await supabase.storage.from("evidence").remove(listed.map((f) => `${id}/${f.name}`));
      if (error) continue;
      files += listed.length;
    }
    deleted.push(id);
  }

  if (deleted.length) {
    const { error } = await supabase.from("patients").delete().in("id", deleted);
    if (error) return NextResponse.json({ error: error.message, files }, { status: 500 });
  }

  const rounds = await purgeOld(supabase, "round_dictations", "audio_path");
  const registers = await purgeOld(supabase, "register_reads", "photo_path");

  // Counts only: no patient data in the response or the logs.
  return NextResponse.json({ patients: deleted.length, files: files + rounds.files + registers.files, rounds: rounds.rows, registers: registers.rows });
}

/** Rows of a ward-level capture table past retention, their stored file removed first. */
async function purgeOld(
  supabase: ReturnType<typeof createAdminClient>,
  table: "round_dictations" | "register_reads",
  pathColumn: "audio_path" | "photo_path",
): Promise<{ rows: number; files: number }> {
  const { data } = await supabase
    .from(table)
    .select(`id, ${pathColumn}`)
    .lt("created_at", retentionCutoffIso())
    .limit(BATCH);
  const rows = (data ?? []) as unknown as Record<string, string | null>[];
  if (rows.length === 0) return { rows: 0, files: 0 };

  const paths = rows.map((r) => r[pathColumn]).filter((p): p is string => Boolean(p));
  if (paths.length) {
    const { error } = await supabase.storage.from("evidence").remove(paths);
    if (error) return { rows: 0, files: 0 }; // keep the rows, so the files can still be found
  }
  const { error } = await supabase.from(table).delete().in("id", rows.map((r) => r.id as string));
  return error ? { rows: 0, files: paths.length } : { rows: rows.length, files: paths.length };
}
