import type { createClient } from "@/lib/supabase/server";

type Supabase = Awaited<ReturnType<typeof createClient>>;

/** Photographs the AI may read per ward per day. Env-tunable; see patch 0079. */
export const PHOTO_READS_PER_WARD_DAY = Number(process.env.PHOTO_READS_PER_WARD_DAY) || 60;

/**
 * Counts one photograph against the ward's daily ceiling. Returns null when the read may go
 * ahead, or the message to show when the ward has used its day's reads.
 *
 * Fails OPEN when the counter cannot be reached (patch 0079 not run, database hiccup): the cap
 * is a guard against a runaway bill, and refusing a resident's photograph because a counter is
 * missing would cost more than it protects. The failure is logged so it is not silent.
 */
export async function claimPhotoRead(
  supabase: Supabase,
  wardId: string | null | undefined,
  cap = PHOTO_READS_PER_WARD_DAY
): Promise<string | null> {
  if (!wardId) return null;
  const { data, error } = await supabase.rpc("claim_photo_read", { _ward: wardId, _cap: cap });
  if (error) {
    console.warn(`[photo-cap] not enforced: ${error.message}`);
    return null;
  }
  return data === false
    ? `This ward has used its ${cap} photo reads for today. They reset tomorrow — speaking a note still works.`
    : null;
}
