import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentWard, getMyWards } from "@/lib/ward";
import CodeBox from "./code-box";
import JoinForm from "./join-form";
import { switchWard, leaveWard, renameWard, saveLetterhead, saveProfile, removeExpectedMember } from "./actions";
import FormularyImport from "./formulary-import";
import InviteShare from "./invite-share";
import AddExpected from "./add-expected";
import ClaimName from "./claim-name";
import { getExpectedMembers } from "@/lib/expected-members";
import CreateUnitForm from "../onboarding/create-unit-form";
import { getFormularySize } from "@/lib/formulary";
import { DESIGNATION_CHOICES } from "@/lib/patients";
import { ChecklistIcon, DocumentIcon } from "../icons";

/**
 * The unit: who is on it, how to join it, and which one the app is showing.
 *
 * Sharing was designed for from the beginning — patients belong to a ward, membership is its
 * own table, and every policy asks about membership rather than authorship. This is the way
 * in that was missing.
 */
export default async function UnitPage() {
  const { ward, error } = await getCurrentWard();

  if (!error && !ward) redirect("/onboarding");

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

  const [{ data: members }, myWards, { data: me }, { count: trashCount }, { data: isProtocolPublisher }] =
    await Promise.all([
      supabase
        .from("ward_members")
        .select("user_id, role, added_at, profiles(display_name)")
        .eq("ward_id", ward.id)
        .order("added_at"),
      getMyWards(),
      // Row security restricts profiles to the caller's own row, so this needs no where clause.
      supabase.from("profiles").select("display_name, designation, department").maybeSingle(),
      supabase
        .from("patients")
        .select("id", { count: "exact", head: true })
        .eq("ward_id", ward.id)
        .eq("status", "trashed"),
      supabase.rpc("is_protocol_publisher"),
    ]);

  const formularySize = await getFormularySize(ward.id);
  const { rows: expected, missing: rosterMissing } = await getExpectedMembers(ward.id);

  const isOwner = ward.owner_id === user?.id;

  // Only the owner ever sees this, and only for their own team — see
  // supabase/patches/0031_clinician_access_owner_read.sql. Not a verification, still just
  // what each person typed and attested themselves; this only makes that visible to the one
  // person in a position to notice something wrong with somebody they actually know.
  const attestations = new Map<
    string,
    { registration_number: string; hospital_name: string; designation: string }
  >();
  if (isOwner && members && members.length > 0) {
    const { data: access } = await supabase
      .from("clinician_access")
      .select("user_id, registration_number, hospital_name, designation")
      .in(
        "user_id",
        members.map((m) => m.user_id)
      );
    for (const a of access ?? []) attestations.set(a.user_id, a);
  }

  const profile = (me ?? {}) as {
    display_name?: string | null;
    designation?: string | null;
    department?: string | null;
  };

  // Names nobody has taken yet — what a new joiner chooses from, and what tells the owner
  // who has still not signed in.
  const unclaimed = expected.filter((e) => !e.claimed_by);

  const roster = (members ?? []) as unknown as {
    user_id: string;
    role: string;
    added_at: string;
    profiles: { display_name: string | null } | null;
  }[];

  return (
    <div className="flex-1 flex flex-col max-w-md mx-auto w-full">
      <header className="px-6 pt-8 pb-4">
        <Link href="/ward" className="text-[17px] text-accent">
          ‹ Ward
        </Link>
        <h1 className="mt-3 ios-large-title break-words text-[28px] leading-tight">{ward.name}</h1>
        <p className="mt-0.5 text-[15px] text-muted">
          {roster.length} {roster.length === 1 ? "person" : "people"} on this unit
        </p>

      </header>

      {/* Formats and Protocols moved here from the ward header's nav row — they're
          unit-wide settings, not something reached for on every round, so they belong beside
          the rest of this screen's setup rather than competing for space with To do and Ward
          round on the page opened most. */}
      <section className="px-6 pb-6">
        <ul className="ios-group divide-y divide-line">
          <li>
            <Link href="/formats" className="flex items-center gap-3 px-4 py-3 active:bg-chip">
              <DocumentIcon className="h-4 w-4 shrink-0 text-accent" />
              <span className="flex-1 text-[15px]">Formats</span>
            </Link>
          </li>
          {isProtocolPublisher && (
            <li>
              <Link href="/protocols" className="flex items-center gap-3 px-4 py-3 active:bg-chip">
                <ChecklistIcon className="h-4 w-4 shrink-0 text-accent" />
                <span className="flex-1 text-[15px]">Protocols</span>
              </Link>
            </li>
          )}
        </ul>
      </section>

      {/* Ahead of everything, and only ever once: somebody who has just entered the unit code
          has no name on them yet, and every screen after this one shows them as "Doctor" until
          they set one. Picking it off the unit's own list is one tap instead of typing. It
          stops rendering the moment a name exists. */}
      {!profile.display_name && unclaimed.length > 0 && (
        <section className="px-6 pb-6">
          <p className="mb-2 text-[15px] text-muted">Which one are you?</p>
          <ClaimName options={unclaimed} />
          <p className="mt-2 text-[13px] leading-relaxed text-muted">
            Tap your name and the unit sees it against everything you record. Not on the list?
            Type your name below instead.
          </p>
        </section>
      )}

      {/* First, because it is the only section on this screen about the person reading it.
          What is set here is what the landing page greets you with. */}
      <section className="px-6 pb-6">
        <p className="mb-2 text-[15px] text-muted">You</p>
        <form action={saveProfile} className="ios-group flex flex-col gap-3 p-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] text-muted">Name</span>
            <input
              name="display_name"
              defaultValue={profile.display_name ?? ""}
              autoCapitalize="words"
              placeholder="As your unit says it"
              className="w-full rounded-[10px] border border-line bg-card px-3 py-2.5 text-[17px] outline-none focus:border-accent"
            />
          </label>

          <div className="flex gap-3">
            <label className="flex flex-1 flex-col gap-1.5">
              <span className="text-[13px] text-muted">Designation</span>
              <select
                name="designation"
                defaultValue={profile.designation ?? ""}
                className="h-12 w-full rounded-[10px] border border-line bg-card px-3 text-[17px] outline-none focus:border-accent"
              >
                <option value="">—</option>
                {DESIGNATION_CHOICES.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-[2] flex-col gap-1.5">
              <span className="text-[13px] text-muted">Department</span>
              <input
                name="department"
                defaultValue={profile.department ?? ""}
                placeholder="General Surgery"
                className="h-12 w-full rounded-[10px] border border-line bg-card px-3 text-[17px] outline-none focus:border-accent"
              />
            </label>
          </div>

          <button className="rounded-[10px] bg-accent px-4 py-2.5 text-[15px] font-semibold text-accent-ink">
            Save
          </button>
        </form>
      </section>

      <section className="px-6 pb-6">
        <p className="mb-2 text-[15px] text-muted">Code for this unit</p>
        <CodeBox code={ward.join_code} />
        <InviteShare unitName={ward.name} code={ward.join_code} />
        <p className="mt-2 text-[13px] text-muted leading-relaxed">
          Anyone entering this code joins this unit and sees the same patient list. Everything
          they record is theirs by name. Give it only to the team.
        </p>
      </section>

      <section className="px-6 pb-6">
        <p className="mb-2 text-[15px] text-muted">On this unit</p>
        <ul className="ios-group divide-y divide-line">
          {roster.map((m) => {
            const attested = attestations.get(m.user_id);
            return (
              <li key={m.user_id} className="px-4 py-3">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="truncate text-sm">
                    {m.profiles?.display_name || "Doctor"}
                    {m.user_id === user?.id && <span className="text-muted"> · you</span>}
                  </span>
                  <span className="shrink-0 text-[13px] text-muted">{m.role}</span>
                </div>
                {/* Owner-only, and self-attested rather than checked against anything — see
                    supabase/patches/0031_clinician_access_owner_read.sql. Shown as what it is:
                    what this person typed about themselves, not a credential this app confirmed. */}
                {attested && (
                  <p className="mt-0.5 truncate text-[13px] text-muted">
                    {attested.designation} · {attested.hospital_name} ·{" "}
                    <span className="font-mono">{attested.registration_number}</span>
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      {/* Who this unit expects, written before any of them has an account. The roster above is
          who has actually arrived; this is the list they arrive against. Owner only, because
          the table's policies allow nobody else to write it. */}
      {isOwner && (
        <section className="px-6 pb-6">
          <p className="mb-2 text-[15px] text-muted">Expected on this unit</p>
          {rosterMissing ? (
            <p className="ios-group px-4 py-3 text-[15px] leading-relaxed text-orange-700">
              Run patch 0048 in Supabase to use the unit roster.
            </p>
          ) : (
            <>
              {expected.length > 0 && (
                <ul className="ios-group mb-3 divide-y divide-line">
                  {expected.map((person) => (
                    <li key={person.id} className="flex items-baseline gap-3 px-4 py-3">
                      <span className="flex-1 truncate text-[15px]">
                        {person.full_name}
                        {person.designation && (
                          <span className="text-muted"> · {person.designation}</span>
                        )}
                      </span>
                      {person.claimed_by ? (
                        <span className="shrink-0 text-[13px] text-muted">joined</span>
                      ) : (
                        <form action={removeExpectedMember} className="shrink-0">
                          <input type="hidden" name="id" value={person.id} />
                          <button className="text-[13px] text-red-600">Remove</button>
                        </form>
                      )}
                    </li>
                  ))}
                </ul>
              )}
              <AddExpected wardId={ward.id} />
            </>
          )}
        </section>
      )}

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

      {/* The hospital's own drug list, so a discharge summary can print each medicine under the
          exact wording the prescribing system lists it as. Owner-only: importing replaces the
          whole list for everyone on the unit. */}
      {isOwner && (
        <section className="px-6 pb-6">
          <p className="mb-2 text-[15px] text-muted">Hospital formulary</p>
          <div className="ios-group p-4">
            <p className="text-[15px]">
              {formularySize > 0 ? (
                <>
                  <span className="font-semibold tabular-nums">{formularySize}</span> medicines
                  imported.
                </>
              ) : (
                "Not imported yet."
              )}
            </p>
            <p className="mt-2 text-[13px] leading-relaxed text-muted">
              Lets the discharge summary print each drug under the hospital system&rsquo;s own
              name for it, so it can be typed across exactly. Nothing is matched automatically —
              you confirm which entry each drug is, once, and it is remembered.
            </p>

            <details className="mt-3">
              <summary className="cursor-pointer text-[13px] text-accent">
                How to get the list
              </summary>
              <ol className="mt-2 list-decimal space-y-1 pl-5 text-[13px] leading-relaxed text-muted">
                <li>Open a patient&rsquo;s prescription page in the hospital system.</li>
                <li>Click <span className="font-medium">Add</span> under Medications so the drug list opens.</li>
                <li>In that window press <span className="font-mono">⌥⌘I</span>, open the Console tab.</li>
                <li>Type <span className="font-mono">allow pasting</span> and press Enter.</li>
                <li>Paste the snippet your WardMate contact gave you, press Enter.</li>
                <li>Upload the file it saves, below.</li>
              </ol>
            </details>

            <FormularyImport wardId={ward.id} formularySize={formularySize} />
            {formularySize > 0 && (
              <p className="mt-2 text-[13px] text-muted">
                Re-importing refreshes the drug list. Drugs you have already linked stay linked.
              </p>
            )}
          </div>
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
        <Link
          href="/protocols"
          className="flex items-center justify-between rounded-[10px] bg-card px-4 py-3 text-[15px]"
        >
          <span>Protocols</span>
          <span className="text-muted">Company guidance ›</span>
        </Link>
      </section>

      <section className="px-6 pb-6">
        <p className="mb-2 text-[15px] text-muted">Join another unit</p>
        <JoinForm />
      </section>

      {/* Creating a unit used to exist only on the first-run screen, which redirects away the
          moment you have one — so a doctor covering a second unit, or moving to one at the end
          of a rotation, had no way to start it. The database never restricted this to one; only
          the way in was missing. Creating switches you to the new unit, as it does at first run. */}
      <section className="px-6 pb-6">
        <p className="mb-2 text-[15px] text-muted">Create another unit</p>
        <CreateUnitForm />
        <p className="mt-2 text-[13px] text-muted leading-relaxed">
          A new unit starts empty, with its own code and its own patients. You will be its owner.
        </p>
      </section>

      {/* Shown even with one unit, now that a second can be made from this screen: the list is
          where you find out which unit you are looking at, and it appearing only after there
          are two hid the very thing the create box above changes. */}
      {myWards.length > 0 && (
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
        <section className="px-6 pb-6">
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

      {/* Kept at the end, away from routine profile and unit controls. It remains hidden when
          empty, so it never creates a destination without something recoverable in it. */}
      {Boolean(trashCount) && (
        <section className="px-6 pb-16">
          <Link
            href="/unit/trash"
            className="flex items-center justify-between rounded-[10px] bg-card px-4 py-3 text-[15px]"
          >
            <span>Trash</span>
            <span className="text-muted">
              {trashCount} {trashCount === 1 ? "patient" : "patients"} ›
            </span>
          </Link>
        </section>
      )}
    </div>
  );
}
