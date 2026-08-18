import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Runs before every page. Two jobs:
 *  1. keep the sign-in session fresh, so the app does not log you out mid-round
 *  2. bounce anyone who is not signed in to /login
 *
 * This is the outer gate. The database rules are the inner one: even if this were bypassed,
 * an unauthenticated request still sees nothing.
 *
 * THE COST THIS EXISTS TO AVOID. getUser() is not a cookie read — it asks Supabase to verify
 * the token, over the network. Measured from production, that call was taking about two
 * seconds, on every request, including static pages and every tap inside the app. A static
 * page routed through here took ~2000ms; the same server's icon, which this file's matcher
 * skips, took 2ms. It was the whole of the app's slowness, dwarfing the database work
 * entirely.
 *
 * So the token's expiry is now read locally — it is a JWT, the expiry is in it, and reading it
 * costs nothing. The network call happens only when it is actually needed: no session, a
 * session about to expire, or a cookie this cannot parse.
 *
 * Why that is safe. This was never the security boundary and its own comment said so. A forged
 * or stale cookie waved through here still meets two real checks: every page calls getUser()
 * itself, which verifies against Supabase, and every query is judged by row security in the
 * database, which trusts nothing this file decides. What is skipped is a redirect decision,
 * not an authorisation.
 */

/** Rebuild the session cookie from however many chunks Supabase split it into. */
function readAuthCookie(request: NextRequest): string | null {
  const parts = request.cookies
    .getAll()
    .filter((c) => /^sb-.*-auth-token(\.\d+)?$/.test(c.name))
    .sort((a, b) => a.name.localeCompare(b.name));

  if (parts.length === 0) return null;
  return parts.map((c) => c.value).join("");
}

/**
 * Seconds until the access token expires, read out of the JWT without asking anybody.
 *
 * Returns null when the cookie cannot be understood — a Supabase format change, a truncated
 * chunk, anything unexpected — and every caller treats null as "ask the server properly". A
 * parser that guessed here would be a parser that could silently keep somebody signed in.
 */
function secondsUntilExpiry(cookie: string): number | null {
  try {
    const raw = cookie.startsWith("base64-")
      ? atob(cookie.slice("base64-".length))
      : decodeURIComponent(cookie);

    const session = JSON.parse(raw);
    const token: string | undefined = session?.access_token ?? session?.[0];
    if (!token) return null;

    const payload = JSON.parse(atob(token.split(".")[1]));
    if (typeof payload?.exp !== "number") return null;

    return payload.exp - Math.floor(Date.now() / 1000);
  } catch {
    return null;
  }
}

/** Refresh this far ahead of expiry, so a round is never interrupted by a token running out. */
const REFRESH_WINDOW_SECONDS = 10 * 60;

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Where Google returns the doctor with a one-time code, before any session exists. Bouncing
  // it to /login would turn a successful sign-in into a loop back to the sign-in screen.
  if (path.startsWith("/auth/callback")) return NextResponse.next({ request });

  const isLoginPage = path.startsWith("/login");
  const cookie = readAuthCookie(request);

  // No session at all. Nothing to refresh and nothing to verify — decided without a network
  // call, which is most of what a signed-out visitor ever does.
  if (!cookie) {
    if (isLoginPage) return NextResponse.next({ request });
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  const remaining = secondsUntilExpiry(cookie);

  // A session with time left on it. Let it through and leave the verifying to the page and to
  // row security, both of which do it anyway.
  if (remaining !== null && remaining > REFRESH_WINDOW_SECONDS) {
    if (isLoginPage) {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
    return NextResponse.next({ request });
  }

  // Expiring, expired, or unreadable: do the real thing. getUser() verifies and, in doing so,
  // refreshes the cookies through setAll below.
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && !isLoginPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user && isLoginPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    // Everything except Next.js internals, the PWA files, and images.
    "/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|sw.js|.*\\.png$).*)",
  ],
};
