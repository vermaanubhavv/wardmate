"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

/**
 * "warning: give a reason" or "critical: give a reason" — the line's own severity, read off its
 * front rather than asked for in a separate control. Defaults to 'urgent' when a line names no
 * severity or an unrecognised one, which is the spec's own middle ground: not so quiet it reads
 * as background information, not the "stop everything" weight of 'critical' either.
 */
function parseRedFlag(line: string): { text: string; severity: "warning" | "urgent" | "critical" } {
  const match = line.match(/^\s*(warning|urgent|critical)\s*:\s*(.+)$/i);
  if (match) {
    return { severity: match[1].toLowerCase() as "warning" | "urgent" | "critical", text: match[2].trim() };
  }
  return { severity: "urgent", text: line.trim() };
}

function lines(formData: FormData, field: string): string[] {
  return String(formData.get(field) ?? "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

export async function createProtocol(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const title = String(formData.get("title") ?? "").trim();
  const version = String(formData.get("version") ?? "").trim();
  const sourceName = String(formData.get("source_name") ?? "").trim();

  // One text box per Quick Mode section, each optional on its own — a protocol with no
  // investigations listed yet is still worth publishing with what it does have, rather than
  // blocked on a section nobody has written.
  const immediateActions = lines(formData, "immediate_actions");
  const redFlags = lines(formData, "red_flags").map(parseRedFlag);
  const investigations = lines(formData, "investigations");
  const pathwaySteps = lines(formData, "pathway_steps");

  if (!title || !version || !sourceName) return;
  if (immediateActions.length + redFlags.length + investigations.length + pathwaySteps.length === 0) {
    return;
  }

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

  // Position counts within its own kind, not across the whole protocol — see the index in
  // 0032. Each section reads top to bottom in the order it was typed.
  const rows = [
    ...immediateActions.map((text, i) => ({ kind: "immediate_action" as const, prompt: text, position: i + 1, severity: null })),
    ...redFlags.map((f, i) => ({ kind: "red_flag" as const, prompt: f.text, position: i + 1, severity: f.severity })),
    ...investigations.map((text, i) => ({ kind: "investigation" as const, prompt: text, position: i + 1, severity: null })),
    ...pathwaySteps.map((text, i) => ({ kind: "pathway_step" as const, prompt: text, position: i + 1, severity: null })),
  ].map((r) => ({ ...r, protocol_id: protocol.id }));

  await supabase.from("company_protocol_items").insert(rows);
  revalidatePath("/protocols");
}

/** Publish or retire an existing protocol — its items are untouched either way. */
export async function setProtocolStatus(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const id = String(formData.get("protocol_id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id || !["draft", "published", "retired"].includes(status)) return;

  await supabase
    .from("company_protocols")
    .update({
      status,
      published_at: status === "published" ? new Date().toISOString() : null,
      published_by: status === "published" ? user.id : null,
    })
    .eq("id", id);

  revalidatePath("/protocols");
}
