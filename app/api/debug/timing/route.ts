import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Where the time actually goes on a signed-in request, measured on the server.
 *
 * Guessing from the outside had already been wrong once: the middleware turned out to be two
 * seconds while the queries were blamed. This times each step where it happens, so the next
 * decision is made on numbers rather than on a theory.
 *
 * Reads nothing it is not entitled to — every query here is one the ward list already makes,
 * under the same row security.
 */
export async function GET() {
  const marks: Record<string, number> = {};
  const time = async <T>(label: string, run: () => Promise<T>): Promise<T> => {
    const start = Date.now();
    const result = await run();
    marks[label] = Date.now() - start;
    return result;
  };

  const total = Date.now();

  const supabase = await time("createClient", async () => createClient());

  const user = await time("auth.getUser (network to Supabase auth)", async () => {
    const { data } = await (await supabase).auth.getUser();
    return data.user;
  });

  if (!user) return NextResponse.json({ error: "not signed in", marks });

  const client = await supabase;

  const profile = await time("profiles row", async () => {
    const { data } = await client
      .from("profiles")
      .select("current_ward_id")
      .eq("id", user.id)
      .maybeSingle();
    return data;
  });

  const ward = await time("wards row", async () => {
    const { data } = await client
      .from("wards")
      .select("id, name, owner_id, join_code, letterhead")
      .is("archived_at", null)
      .order("created_at")
      .limit(1)
      .maybeSingle();
    return data;
  });

  if (ward) {
    await time("patients", async () => {
      const { data } = await client
        .from("current_patients")
        .select("id, display_name, bed")
        .eq("ward_id", ward.id)
        .eq("status", "active");
      return data;
    });

    await time("observations (badge counts)", async () => {
      const { data } = await client
        .from("observations")
        .select("patient_id, kind, needs_confirmation, confirmed_at, done_at, patients!inner(ward_id, status)")
        .eq("patients.ward_id", ward.id)
        .eq("patients.status", "active");
      return data?.length ?? 0;
    });

    await time("entries (delete counts)", async () => {
      const { data } = await client
        .from("entries")
        .select("patient_id, patients!inner(ward_id, status)")
        .eq("patients.ward_id", ward.id)
        .eq("patients.status", "active");
      return data?.length ?? 0;
    });

    await time("care_templates", async () => {
      const { data } = await client
        .from("care_templates")
        .select("family, variant, name")
        .eq("phase", "after_surgery");
      return data?.length ?? 0;
    });
  }

  marks.TOTAL = Date.now() - total;
  return NextResponse.json({ marks, hasProfile: Boolean(profile) });
}
