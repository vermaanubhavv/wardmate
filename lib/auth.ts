import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

/**
 * The signed-in doctor, fetched once per request however many times it is asked for.
 *
 * getUser() is not a local cookie read — it is a network call to Supabase to verify the
 * token, which is the point of using it rather than trusting the cookie. But a single ward
 * render was making that call two or three times over, and on a phone in a hospital each one
 * is a real fraction of a second. React's cache() collapses them to one for the duration of
 * the request, without weakening the check.
 */
export const getUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

/**
 * The doctor's own name, for a greeting — nothing else.
 *
 * Read from the session cookie rather than by asking Supabase, deliberately. getUser() above is
 * a network round trip, and the ward list was cut to a single one on purpose; spending another
 * on a line of hello would undo that. getSession() reads the token already in the request.
 *
 * That token is not trustworthy for an authorisation decision, and this is not one. Nothing is
 * granted or shown based on this name — the middleware and row security decide what a doctor
 * may see, and neither consults it. The worst a tampered cookie achieves here is greeting
 * somebody by the wrong name on their own phone.
 *
 * Null when there is no name to use. Sign-in by emailed code carries no name at all, and an
 * address is not one: "anubhavsinhmar@gmail.com" does not make a Dr. Anubhavsinhmar. Nothing
 * is guessed from it — the greeting simply goes without.
 */
export const getDoctorName = cache(async (): Promise<string | null> => {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const meta = session?.user?.user_metadata as Record<string, unknown> | undefined;
  const full =
    pickString(meta?.given_name) ?? pickString(meta?.full_name) ?? pickString(meta?.name);
  if (!full) return null;

  // First name only. "Dr Anubhav" is how a ward actually addresses somebody, and it stays one
  // short line beside a large title rather than wrapping under it.
  return full.trim().split(/\s+/)[0] ?? null;
});

function pickString(v: unknown): string | null {
  return typeof v === "string" && v.trim() ? v.trim() : null;
}
