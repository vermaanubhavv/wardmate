import { createClient } from "@/lib/supabase/server";
import SetupCheck from "./setup-check";
import { signOut } from "./actions";

export default async function Home() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // No filter by user here on purpose: the database only returns wards this account belongs
  // to. If this query came back with someone else's ward, the access rules would be broken.
  const { data: wards, error } = await supabase
    .from("wards")
    .select("id, name, owner_id")
    .order("created_at");

  return (
    <main className="flex-1 px-6 py-10 flex flex-col gap-8 max-w-md mx-auto w-full">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">CoreResident</h1>
        <p className="text-muted mt-1">Signed in as {user?.email}</p>
      </header>

      <section className="rounded-xl border border-line bg-card p-5">
        <p className="text-sm text-muted">Your wards</p>
        {error ? (
          <p className="mt-3 text-sm text-amber-200">
            Could not read the database: {error.message}
          </p>
        ) : wards && wards.length > 0 ? (
          <ul className="mt-3 flex flex-col gap-2">
            {wards.map((w) => (
              <li key={w.id} className="flex items-baseline justify-between gap-3">
                <span className="text-base">{w.name}</span>
                {w.owner_id === user?.id && (
                  <span className="text-xs text-muted shrink-0">you own this</span>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-muted">
            No wards yet. One should have been created when you signed up — if this stays
            empty, the database setup did not run.
          </p>
        )}
      </section>

      <SetupCheck />

      <section className="text-sm text-muted leading-relaxed">
        <p className="font-medium text-foreground">No patients yet.</p>
        <p className="mt-1">The ward list and the record button come next.</p>
      </section>

      <form action={signOut} className="mt-auto pt-4">
        <button className="text-sm text-muted underline underline-offset-4">Sign out</button>
      </form>
    </main>
  );
}
