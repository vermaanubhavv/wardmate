"use server";

import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth";
import { getCurrentWard } from "@/lib/ward";

/** The answer to "What made you reach for paper today?" — patch 0117. */
export async function recordPaperReason(text: string): Promise<void> {
  const trimmed = text.trim().slice(0, 500);
  const user = await getUser();
  if (!user || !trimmed) return;
  const { ward } = await getCurrentWard();
  const supabase = await createClient();
  await supabase.from("paper_reasons").insert({ user_id: user.id, ward_id: ward?.id ?? null, text: trimmed });
}
