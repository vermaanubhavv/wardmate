import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * The connection used by code running on Vercel's servers, where the AI keys will also live.
 * It reads the signed-in doctor's session from the browser cookie, so every database query
 * made here is still made *as that doctor* and is still subject to the ward rules.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component, where cookies cannot be written. The
            // middleware refreshes the session instead, so this is safe to ignore.
          }
        },
      },
    }
  );
}
