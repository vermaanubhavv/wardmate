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
