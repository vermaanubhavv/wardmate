import "server-only";
import webpush from "web-push";
import { createAdminClient } from "@/lib/supabase/admin";
import type { PushPayload } from "@/lib/push-digest";

/**
 * Send one message to every phone a member has turned notifications on for.
 *
 * Service role, because a job is handed over by someone else and the digest runs from a cron:
 * neither request is the recipient's own, so their subscriptions are not readable through RLS.
 * Quiet when the VAPID keys are not configured — the app works without notifications, and a
 * missing key must not make assigning a job fail. A subscription the push service says is
 * gone (404/410) is deleted, so a reinstalled app does not keep a dead row.
 */
export async function sendPushTo(userIds: string[], payload: PushPayload): Promise<void> {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (!publicKey || !privateKey || !process.env.SUPABASE_SERVICE_ROLE_KEY || userIds.length === 0) return;
  webpush.setVapidDetails(process.env.VAPID_SUBJECT ?? "mailto:hello@wardmate.in", publicKey, privateKey);

  const supabase = createAdminClient();
  const { data } = await supabase.from("push_subscriptions").select("endpoint, p256dh, auth").in("user_id", userIds);
  const body = JSON.stringify(payload);

  await Promise.all(
    (data ?? []).map(async (s) => {
      try {
        await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, body, { TTL: 60 * 60 });
      } catch (e) {
        const status = (e as { statusCode?: number }).statusCode;
        if (status === 404 || status === 410) await supabase.from("push_subscriptions").delete().eq("endpoint", s.endpoint);
      }
    })
  );
}
