import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Where Google sends the doctor back to.
 *
 * Signing in with a provider is a round trip: the app hands off to Google, Google returns a
 * one-time code on this URL, and that code is exchanged here for the session cookies the rest
 * of the app reads. The exchange has to happen on the server because the cookies are written
 * server-side, the same way every other page in this app reads them.
 *
 * This route is reached WITHOUT a session — that is its whole purpose — so the middleware has
 * to let it through. It is listed there beside /login for that reason.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  // Google's own refusal — the doctor closed the sheet, or declined. Not an error worth a
  // stack trace; they simply did not sign in.
  const denied = searchParams.get("error");
  if (denied) {
    return NextResponse.redirect(`${origin}/login?failed=cancelled`);
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}/`);
  }

  // Anything else: back to sign-in, saying so rather than looping silently.
  return NextResponse.redirect(`${origin}/login?failed=google`);
}
