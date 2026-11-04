import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

/** What every caller reads of the signed-in doctor: id always, email and metadata sometimes. */
export type SignedIn = { id: string; email?: string; user_metadata: Record<string, unknown> };

/**
 * The signed-in doctor, verified once per request however many times it is asked for.
 *
 * This used to be supabase.auth.getUser(): a network round trip to Supabase on every page and
 * every server action, sequenced before the profile read that needs the id — about 220 ms at
 * the front of nearly every request. getClaims() verifies the token's signature and expiry
 * here instead, against the project's public signing key (fetched once per server instance
 * and cached; the project is on asymmetric ES256 keys, which is what makes this local). The
 * check is the same one Postgres makes before any row security rule runs, so nothing this
 * trusts is anything the database would not.
 *
 * What is given up: a session revoked elsewhere (sign-out on another phone, a banned account)
 * is honoured when its token expires rather than at once. The middleware already lets such a
 * token through, and row security judges every query regardless.
 *
 * React's cache() collapses the many calls in one render to one.
 */
export const getUser = cache(async (): Promise<SignedIn | null> => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims?.sub) return null;
  return {
    id: claims.sub,
    email: typeof claims.email === "string" ? claims.email : undefined,
    user_metadata: (claims.user_metadata as Record<string, unknown> | undefined) ?? {},
  };
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
