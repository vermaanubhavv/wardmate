import { createClient } from "@/lib/supabase/server";

export const FORMAT_KINDS = [
  {
    kind: "investigation",
    label: "Investigation form",
    hint: "The slip your unit sends investigations on",
  },
  {
    kind: "interdepartmental",
    label: "Interdepartmental call",
    hint: "How a referral to another department is written",
  },
  {
    kind: "discharge",
    label: "Discharge summary",
    hint: "Your unit's discharge layout",
  },
  {
    kind: "notes",
    label: "Daily notes",
    hint: "How progress notes are laid out",
  },
  {
    kind: "ot_notes",
    label: "OT notes",
    hint: "Your unit's operation note",
  },
  {
    kind: "logo",
    label: "Hospital logo",
    hint: "Printed at the top of your discharge summaries",
  },
] as const;

export type FormatKind = (typeof FORMAT_KINDS)[number]["kind"];

export type WardFormat = {
  kind: string;
  file_path: string;
  file_name: string | null;
  mime_type: string | null;
  uploaded_at: string;
  /** Short-lived link to view it. The bucket is private; this is the only way in. */
  url: string | null;
  /** Where the fields sit on this page — see lib/read-form-layout.ts. Null when detection was
   *  never attempted (a PDF format) or found nothing usable (layout_error explains which). */
  layout: import("@/lib/read-form-layout").FormZone[] | null;
  layout_error: string | null;
};

/**
 * The unit's uploaded formats, one per kind at most.
 *
 * Returns what exists; the screen shows all five slots regardless, because an empty slot is
 * a useful thing to see — it says the unit has not told the app how it writes that document.
 */
export async function getWardFormats(wardId: string): Promise<Map<string, WardFormat>> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("ward_formats")
    .select("kind, file_path, file_name, mime_type, uploaded_at, layout, layout_error")
    .eq("ward_id", wardId);

  const rows = data ?? [];
  if (rows.length === 0) return new Map();

  // Signed in one call rather than per row, and only ever here — for a doctor the database
  // has already confirmed is a member of this ward.
  const { data: signed } = await supabase.storage
    .from("evidence")
    .createSignedUrls(
      rows.map((r) => r.file_path),
      3600
    );

  const urls = new Map<string, string>();
  for (const s of signed ?? []) {
    if (s.path && s.signedUrl) urls.set(s.path, s.signedUrl);
  }

  return new Map(
    rows.map((r) => [r.kind, { ...r, url: urls.get(r.file_path) ?? null }])
  );
}
