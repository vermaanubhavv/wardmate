import "server-only";
import { createClient } from "@/lib/supabase/server";

/**
 * Write one row to `app_events` (patch 0068) as the signed-in doctor.
 *
 * This is a courtesy log for the admin console, never a clinical record. It must never carry a
 * patient value, a transcript, or a name — `props` is for small, app-controlled labels
 * ("provider": "deepgram", "seconds": 42) and nothing else. It is fire-and-forget: a failed
 * insert is swallowed, because a round must never break to record that a round happened.
 *
 * Call it from a Server Action or Route Handler. Client code uses `track()` in `lib/track.ts`,
 * which posts to `/api/track` and ends up here.
 */
export async function logEvent(
  name: string,
  opts: { path?: string; wardId?: string | null; props?: Record<string, unknown> } = {}
): Promise<void> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("app_events").insert({
      actor_id: user.id,
      name: name.slice(0, 80),
      path: opts.path ? opts.path.slice(0, 200) : null,
      ward_id: opts.wardId ?? null,
      props: sanitiseProps(opts.props),
    });
  } catch {
    // Deliberately silent — see the note above.
  }
}

/** Keep `props` small and scalar. Anything unexpected is dropped rather than stored. */
function sanitiseProps(props: Record<string, unknown> | undefined): Record<string, unknown> {
  if (!props || typeof props !== "object") return {};
  const out: Record<string, unknown> = {};
  let n = 0;
  for (const [k, v] of Object.entries(props)) {
    if (n >= 12) break;
    if (typeof v === "string") out[k] = v.slice(0, 120);
    else if (typeof v === "number" || typeof v === "boolean" || v === null) out[k] = v;
    else continue;
    n += 1;
  }
  return out;
}
