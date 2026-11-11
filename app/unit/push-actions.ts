"use server";

import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth";

/** The browser's push subscription, as PushSubscription.toJSON() gives it. */
type SubscriptionJson = { endpoint: string; keys: { p256dh: string; auth: string } };

/** Turn notifications on for this phone: keep where it can be reached. */
export async function savePushSubscription(sub: SubscriptionJson): Promise<{ ok: boolean }> {
  const user = await getUser();
  if (!user || !sub?.endpoint || !sub.keys?.p256dh || !sub.keys?.auth) return { ok: false };
  const supabase = await createClient();
  const { error } = await supabase
    .from("push_subscriptions")
    .upsert({ endpoint: sub.endpoint, user_id: user.id, p256dh: sub.keys.p256dh, auth: sub.keys.auth });
  return { ok: !error };
}

/** Turn them off: the row is the switch, so deleting it is the whole act. */
export async function deletePushSubscription(endpoint: string): Promise<{ ok: boolean }> {
  const user = await getUser();
  if (!user || !endpoint) return { ok: false };
  const supabase = await createClient();
  const { error } = await supabase.from("push_subscriptions").delete().eq("endpoint", endpoint);
  return { ok: !error };
}
