import { NextRequest, NextResponse } from "next/server";
import { logEvent } from "@/lib/analytics";

/**
 * Client-side event sink. The browser posts `{ name, path?, ward_id?, props? }` here and it
 * lands in `app_events` as the signed-in doctor (see `lib/analytics.ts`).
 *
 * Never trusted for anything: a signed-out request just gets a 204 and writes nothing, and the
 * row-security policy on `app_events` only lets a row through when `actor_id = auth.uid()`.
 */
export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return new NextResponse(null, { status: 204 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name) return new NextResponse(null, { status: 204 });

  await logEvent(name, {
    path: typeof body.path === "string" ? body.path : undefined,
    wardId: typeof body.ward_id === "string" ? body.ward_id : null,
    props:
      body.props && typeof body.props === "object"
        ? (body.props as Record<string, unknown>)
        : undefined,
  });

  return new NextResponse(null, { status: 204 });
}
