import { createClient } from "@/lib/supabase/server";

export type ProtocolContext = {
  id: string;
  title: string;
  /** A couple of lines of the protocol's own content, so matching isn't title-wording alone. */
  summary: string;
};

/**
 * The published protocols, in the shape the extraction prompt hands to the model: enough to
 * judge relevance without pasting the whole library into every call. Grows with the library, so
 * this stays to a title plus a couple of lines rather than the full card.
 */
export async function getPublishedProtocolContext(): Promise<ProtocolContext[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("company_protocols")
    .select("id, title, company_protocol_items(prompt, kind, position)")
    .eq("status", "published")
    .order("title");

  return (data ?? []).map((p) => {
    const items = (p.company_protocol_items as { prompt: string; kind: string; position: number }[]) ?? [];
    const lead = items
      .filter((i) => i.kind === "red_flag" || i.kind === "immediate_action")
      .sort((a, b) => a.position - b.position)
      .slice(0, 2)
      .map((i) => i.prompt);
    return { id: p.id as string, title: p.title as string, summary: lead.join("; ") };
  });
}
