"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

/** Approve or reject one suggested pair. The database does the admin check
 *  (admin_review_shorthand, patch 0109); a non-admin's call changes nothing. */
export async function reviewShorthand(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const verdict = String(formData.get("verdict") ?? "");
  if (!id || !["pending", "approved", "rejected"].includes(verdict)) return;
  const supabase = await createClient();
  await supabase.rpc("admin_review_shorthand", { suggestion_id: id, verdict });
  revalidatePath("/admin/shorthand");
}
