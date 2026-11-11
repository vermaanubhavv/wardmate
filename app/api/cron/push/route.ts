import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendPushTo } from "@/lib/push";
import { handoverDigest } from "@/lib/push-digest";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * The handover-time reminder, once a day (vercel.json — 14:00 UTC is 19:30 IST), to every
 * member with notifications on: "Handover soon", with the count of red jobs handed to them.
 * Inaccessible without CRON_SECRET, like the other cron.
 */
export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || request.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const { data: subs } = await supabase.from("push_subscriptions").select("user_id");
  const users = Array.from(new Set((subs ?? []).map((s) => s.user_id as string)));
  if (users.length === 0) return NextResponse.json({ sent: 0 });

  // Every open job handed to any subscribed member, on a patient still on the ward.
  const { data: jobs } = await supabase
    .from("observations")
    .select("assigned_to, urgency, graded_at, recorded_at, patients!inner(status)")
    .in("assigned_to", users)
    .eq("kind", "plan")
    .is("done_at", null)
    .is("deleted_at", null)
    .eq("patients.status", "active");

  const byUser = new Map<string, { urgency: "red" | "yellow" | "green" | null; graded_at: string | null; recorded_at: string }[]>();
  for (const j of (jobs ?? []) as unknown as { assigned_to: string; urgency: "red" | "yellow" | "green" | null; graded_at: string | null; recorded_at: string }[]) {
    byUser.set(j.assigned_to, [...(byUser.get(j.assigned_to) ?? []), j]);
  }

  await Promise.all(users.map((u) => sendPushTo([u], handoverDigest(byUser.get(u) ?? []))));
  return NextResponse.json({ sent: users.length });
}
