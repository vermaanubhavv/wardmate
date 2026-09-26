import { NextRequest, NextResponse } from "next/server";
import { isValidUnsubscribeSignature } from "@/lib/feedback-email";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

async function unsubscribe(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("user");
  const token = request.nextUrl.searchParams.get("token");
  if (!userId || !token || !isValidUnsubscribeSignature(userId, token)) {
    return new NextResponse("Invalid unsubscribe link.", { status: 400 });
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("feedback_email_outreach").upsert(
    { user_id: userId, status: "unsubscribed", unsubscribed_at: new Date().toISOString() },
    { onConflict: "user_id" }
  );
  if (error) return new NextResponse("Could not update your email preference.", { status: 500 });

  if (request.method === "POST") return new NextResponse(null, { status: 204 });
  return new NextResponse(
    "<main><h1>You’re unsubscribed</h1><p>You won’t receive further Wardmate feedback emails.</p></main>",
    { headers: { "Content-Type": "text/html; charset=utf-8" } }
  );
}

export async function GET(request: NextRequest) {
  return unsubscribe(request);
}

export async function POST(request: NextRequest) {
  return unsubscribe(request);
}
