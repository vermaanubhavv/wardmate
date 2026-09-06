import type { createClient } from "@/lib/supabase/server";

type Supa = Awaited<ReturnType<typeof createClient>>;

/**
 * The de-duplication ledger for dictation uploads — see supabase/patches/0062_dictation_receipts.sql.
 *
 * A recording is saved to the phone before it uploads and deleted only once the server has it;
 * a kill in that gap, or a "Try now" tap over an attempt that was still running, sends the
 * same audio again. Every dictation route calls readReceipt() right after auth: a hit returns
 * the first attempt's exact response and the route does nothing else — no speech-to-text, no
 * extraction, no insert. saveReceipt() records the response once the real work has succeeded.
 *
 * Both calls are best-effort. If the table is missing (patch not yet applied) or the write
 * races another copy of the same upload, dictation still works — the app simply falls back to
 * the pre-0062 behaviour of occasionally processing a retry twice.
 */

export async function readReceipt(
  supabase: Supa,
  clientUuid: string | null,
  userId: string
): Promise<unknown | null> {
  if (!clientUuid) return null;
  try {
    const { data } = await supabase
      .from("dictation_receipts")
      .select("response")
      .eq("client_uuid", clientUuid)
      .eq("author_id", userId)
      .maybeSingle();
    return data?.response ?? null;
  } catch {
    return null;
  }
}

export async function saveReceipt(
  supabase: Supa,
  clientUuid: string | null,
  userId: string,
  route: "voice" | "round" | "case-history",
  response: unknown
): Promise<void> {
  if (!clientUuid) return;
  try {
    // Plain insert, not upsert: the first writer wins and a racing second copy's duplicate-key
    // error is exactly the outcome we want (it is about to read the receipt instead).
    await supabase
      .from("dictation_receipts")
      .insert({ client_uuid: clientUuid, author_id: userId, route, response: response as never });
  } catch {
    // Already recorded, or the table is not there yet. Neither should fail the upload.
  }
}
