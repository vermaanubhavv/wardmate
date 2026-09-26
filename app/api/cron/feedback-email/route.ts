import { NextRequest, NextResponse } from "next/server";
import { sendFeedbackEmail } from "@/lib/feedback-email";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const maxDuration = 60;

type Job = { user_id: string; email: string; display_name: string | null; delivery_id: string };

/** Runs hourly on Vercel. It is intentionally inaccessible without CRON_SECRET. */
export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || request.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Validate all external settings before claiming a job, so incomplete setup never makes a
    // user look as if they were contacted.
    const { feedbackEmailConfiguration } = await import("@/lib/feedback-email");
    feedbackEmailConfiguration();

    const supabase = createAdminClient();
    const { data, error } = await supabase.rpc("claim_feedback_email_jobs", { p_limit: 100 });
    if (error) throw new Error(error.message);

    const jobs = (data ?? []) as Job[];
    let sent = 0;
    let failed = 0;

    for (const job of jobs) {
      try {
        const providerId = await sendFeedbackEmail(
          { userId: job.user_id, email: job.email, name: job.display_name },
          job.delivery_id
        );
        const { error: updateError } = await supabase
          .from("feedback_email_outreach")
          .update({
            status: "sent",
            sent_at: new Date().toISOString(),
            provider_id: providerId,
            error: null,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", job.user_id);
        if (updateError) throw new Error(updateError.message);
        sent++;
      } catch (error) {
        failed++;
        await supabase
          .from("feedback_email_outreach")
          .update({
            status: "failed",
            error: error instanceof Error ? error.message.slice(0, 500) : "Unknown delivery error",
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", job.user_id);
      }
    }

    return NextResponse.json({ ok: true, claimed: jobs.length, sent, failed });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Feedback email job failed." },
      { status: 500 }
    );
  }
}
