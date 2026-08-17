import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentWard, getMyWards } from "@/lib/ward";
import CodeBox from "./code-box";
import JoinForm from "./join-form";
import { switchWard, leaveWard, renameWard, saveLetterhead } from "./actions";

/**
 * The unit: who is on it, how to join it, and which one the app is showing.
 *
 * Sharing was designed for from the beginning — patients belong to a ward, membership is its
 * own table, and every policy asks about membership rather than authorship. This is the way
 * in that was missing.
 */
export default async function UnitPage() {
  const { ward, error } = await getCurrentWard();

  if (error || !ward) {
    return (
      <main className="flex-1 px-6 py-10 max-w-md mx-auto w-full">
        <h1 className="ios-large-title">Unit</h1>
        <p className="mt-4 ios-group px-4 py-3 text-[15px] text-orange-700">
          {error ? `Could not read the database: ${error.message}` : "No ward found."}
        </p>
      </main>
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: members }, myWards] = await Promise.all([
    supabase
      .from("ward_members")
      .select("user_id, role, added_at, profiles(display_name)")
      .eq("ward_id", ward.id)
      .order("added_at"),
    getMyWards(),
  ]);

  const roster = (members ?? []) as unknown as {
    user_id: string;
    role: string;
    added_at: string;
    profiles: { display_name: string | null } | null;
  }[];

  const isOwner = ward.owner_id === user?.id;

  return (
    <div className="flex-1 flex flex-col max-w-md mx-auto w-full">
      <header className="px-6 pt-8 pb-4">
        <Link href="/" className="text-[17px] text-accent">
          ‹ Ward
        </Link>
        <h1 className="mt-3 ios-large-title">{ward.name}</h1>
        <p className="mt-0.5 text-[15px] text-muted">
          {roster.length} {roster.length === 1 ? "person" : "people"} on this unit
        </p>
      </header>

      <section className="px-6 pb-6">
        <p className="mb-2 text-[15px] text-muted">Code for this unit</p>
        <CodeBox code={ward.join_code} />
        <p className="mt-2 text-[13px] text-muted leading-relaxed">
          Anyone entering this code joins this unit and sees the same patient list. Everything
          they record is theirs by name. Give it only to the team.
        </p>
      </section>

      <section className="px-6 pb-6">
        <p className="mb-2 text-[15px] text-muted">On this unit</p>
        <ul className="ios-group divide-y divide-line">
          {roster.map((m) => (
            <li
              key={m.user_id}
              className="flex items-baseline justify-between gap-3 px-4 py-3"
            >
              <span className="truncate text-sm">
                {m.profiles?.display_name || "Doctor"}
                {m.user_id === user?.id && (
                  <span className="text-muted"> · you</span>
                )}
              </span>
              <span className="shrink-0 text-[13px] text-muted">{m.role}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Only the owner may rename — the policy on wards says so, and offering the box to
          everyone else would be a control that silently does nothing. */}
      {isOwner && (
        <section className="px-6 pb-6">
          <p className="mb-2 text-[15px] text-muted">Name of this unit</p>
          <form action={renameWard} className="flex gap-2">
            <input type="hidden" name="ward_id" value={ward.id} />
            <input
              name="name"
              defaultValue={ward.name}
              maxLength={60}
              autoCapitalize="words"
              className="min-w-0 flex-1 ios-group px-4 py-3 text-base outline-none focus:border-accent"
            />
            <button className="shrink-0 ios-group px-4 py-3 text-[17px] font-medium">
              Rename
            </button>
          </form>
          <p className="mt-2 text-[13px] text-muted">Everyone on the unit sees this name.</p>
        </section>
      )}

      {isOwner && (
        <section className="px-6 pb-6">
          <p className="mb-2 text-[15px] text-muted">Discharge summary heading</p>
          <form action={saveLetterhead}>
            <input type="hidden" name="ward_id" value={ward.id} />
            <textarea
              name="letterhead"
              rows={7}
              defaultValue={ward.letterhead ?? ""}
              placeholder={"E.S.I.C. MEDICAL COLLEGE & HOSPITAL\nNH-3, N.I.T. FARIDABAD, HARYANA\nDEPARTMENT OF GENERAL SURGERY\nUNIT-II"}
              className="w-full rounded-[10px] border border-line bg-card px-4 py-3 text-[15px] leading-relaxed outline-none focus:border-accent"
            />
            <button className="mt-2 w-full rounded-[10px] bg-card px-4 py-3 text-[17px] font-medium text-accent">
              Save heading
            </button>
          </form>
          <p className="mt-2 text-[13px] text-muted">
            Printed at the top of every discharge summary, exactly as typed.
          </p>
        </section>
      )}

      <section className="px-6 pb-6">
        <p className="mb-2 text-[15px] text-muted">Join another unit</p>
        <JoinForm />
      </section>

      {myWards.length > 1 && (
        <section className="px-6 pb-6">
          <p className="mb-2 text-[15px] text-muted">Your units</p>
          <ul className="flex flex-col gap-2">
            {myWards.map((w) => (
              <li key={w.id}>
                <form action={switchWard}>
                  <input type="hidden" name="ward_id" value={w.id} />
                  <button
                    className={
                      "w-full rounded-[10px] border px-4 py-3 text-left text-sm " +
                      (w.id === ward.id
                        ? "border-accent text-accent"
                        : "border-line text-foreground")
                    }
                  >
                    {w.name}
                    {w.id === ward.id && " · showing"}
                  </button>
                </form>
              </li>
            ))}
          </ul>
        </section>
      )}

      {!isOwner && (
        <section className="px-6 pb-16">
          <form action={leaveWard}>
            <input type="hidden" name="ward_id" value={ward.id} />
            <button className="w-full rounded-[10px] bg-card px-4 py-3 text-sm text-red-600">
              Leave this unit
            </button>
          </form>
          <p className="mt-2 text-[13px] text-muted">
            The patients stay. You simply stop seeing them.
          </p>
        </section>
      )}
    </div>
  );
}
