import { createClient } from "@/lib/supabase/server";

export type ExpectedMember = {
  id: string;
  full_name: string;
  designation: string | null;
  claimed_by: string | null;
};

/**
 * The people this unit expects, whether or not they have signed in yet.
 *
 * Returns `missing` rather than throwing when patch 0048 has not been pasted into Supabase.
 * Every other optional feature here degrades the same way — the Unit page then says which
 * patch to run instead of showing a broken section, which is the difference between a
 * five-second fix and debugging a "bug". See CONTEXT.md §5.
 */
export async function getExpectedMembers(
  wardId: string
): Promise<{ rows: ExpectedMember[]; missing: boolean }> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("ward_expected_members")
    .select("id, full_name, designation, claimed_by")
    .eq("ward_id", wardId)
    .order("created_at");

  if (error) {
    if (/does not exist|schema cache/i.test(error.message)) return { rows: [], missing: true };
    return { rows: [], missing: false };
  }
  return { rows: (data ?? []) as ExpectedMember[], missing: false };
}
