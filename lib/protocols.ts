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
    .select("id, title, match_hint, company_protocol_items(prompt, kind, position)")
    .eq("status", "published")
    .order("title");

  return (data ?? []).map((p) => {
    // A publisher-written hint is preferred over guessing from title/lead-item wording — see
    // supabase/patches/0035_protocol_match_hints.sql. Falls back to the card's own lead items
    // for protocols nobody has written a hint for yet.
    if (p.match_hint) {
      return { id: p.id as string, title: p.title as string, summary: p.match_hint as string };
    }
    const items = (p.company_protocol_items as { prompt: string; kind: string; position: number }[]) ?? [];
    const lead = items
      .filter((i) => i.kind === "red_flag" || i.kind === "immediate_action")
      .sort((a, b) => a.position - b.position)
      .slice(0, 2)
      .map((i) => i.prompt);
    return { id: p.id as string, title: p.title as string, summary: lead.join("; ") };
  });
}
