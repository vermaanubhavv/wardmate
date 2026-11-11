import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth";

/** Where a tapped invite keeps its code across the sign-in round trip. Ten minutes is long
 *  enough to receive an OTP; httpOnly so nothing on the page reads it. */
const COOKIE = "wm-join-code";
const CODE = /^[A-Z0-9]{8}$/;

/**
 * The invite link: https://wardmate.in/join?code=ABCD2345
 *
 * Signed in, it joins the unit at once and lands on the ward. Signed out, the code is kept in
 * a short-lived cookie and the resident goes to sign in; the front door (app/page.tsx) sends
 * them back here with no code in the address, the cookie is read once, and the join happens
 * then. This is what the earlier invite message deliberately avoided — a code in the URL was
 * lost on the way through sign-in — and the cookie is the fix, not a promise the address
 * cannot keep. A bad or expired code lands on the Unit screen's join box with the code typed in.
 */
export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;
  const fromUrl = (request.nextUrl.searchParams.get("code") ?? "").trim().toUpperCase();
  const fromCookie = (request.cookies.get(COOKIE)?.value ?? "").trim().toUpperCase();
  const code = CODE.test(fromUrl) ? fromUrl : CODE.test(fromCookie) ? fromCookie : null;
  if (!code) return NextResponse.redirect(`${origin}/unit`);

  const user = await getUser();
  if (!user) {
    const res = NextResponse.redirect(`${origin}/login`);
    res.cookies.set(COOKIE, code, { httpOnly: true, sameSite: "lax", secure: true, path: "/", maxAge: 600 });
    return res;
  }

  const supabase = await createClient();
  const { data } = await supabase.rpc("join_ward_by_code", { code });
  const res = NextResponse.redirect(data ? `${origin}/ward` : `${origin}/onboarding?code=${code}`);
  res.cookies.delete(COOKIE);
  return res;
}
