"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createProtocol(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const title = String(formData.get("title") ?? "").trim();
  const version = String(formData.get("version") ?? "").trim();
  const sourceName = String(formData.get("source_name") ?? "").trim();
  const prompts = String(formData.get("prompts") ?? "").split("\n").map((p) => p.trim()).filter(Boolean);
  if (!title || !version || !sourceName || prompts.length === 0) return;

  const status = String(formData.get("status") ?? "draft") === "published" ? "published" : "draft";
  const { data: protocol } = await supabase.from("company_protocols").insert({
    title, version, source_name: sourceName,
    source_url: String(formData.get("source_url") ?? "").trim() || null,
    template_family: String(formData.get("template_family") ?? "").trim() || null,
    phase: String(formData.get("phase") ?? "any"), status, created_by: user.id,
    published_at: status === "published" ? new Date().toISOString() : null,
    published_by: status === "published" ? user.id : null,
  }).select("id").single();
  if (!protocol) return;
  await supabase.from("company_protocol_items").insert(prompts.map((prompt, i) => ({ protocol_id: protocol.id, prompt, position: i + 1 })));
  revalidatePath("/protocols");
}
