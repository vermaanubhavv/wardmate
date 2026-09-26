"use server";

import { randomUUID } from "node:crypto";
import { isCurrentUserAdmin } from "@/lib/admin";
import { sendFeedbackEmail } from "@/lib/feedback-email";
import { createClient } from "@/lib/supabase/server";

/**
 * Sends the real feedback email to the signed-in admin only, so the copy, links and delivery can
 * be checked without running the daily job (which emails every eligible user). Nothing is written
 * to the outreach ledger.
 */
export async function sendTestFeedbackEmail(): Promise<{ sentTo?: string; error?: string }> {
  if (!(await isCurrentUserAdmin())) return { error: "Admins only." };
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user?.email) return { error: "No email on this account." };
  try {
    await sendFeedbackEmail({ userId: user.id, email: user.email, name: null }, `test-${randomUUID()}`);
    return { sentTo: user.email };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Send failed." };
  }
}
