import Link from "next/link";
import CreateUnitForm from "./create-unit-form";
import JoinForm from "../unit/join-form";
import Wordmark from "../wordmark";
import { signOut } from "../actions";
import { createClient } from "@/lib/supabase/server";
import ProfessionalForm from "./professional-form";

/** The only first-run decision: join the team already working, or start a new one. */
export default async function OnboardingPage() {
  const supabase = await createClient();
  const { data: access } = await supabase.from("clinician_access").select("verification_status").maybeSingle();
  const hasProfessionalAccess = access?.verification_status === "self_attested" || access?.verification_status === "verified" || access?.verification_status === "legacy";
  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-line/60 px-4 py-2.5">
        <Wordmark />
        <form action={signOut}>
          <button className="text-[15px] text-accent">Sign out</button>
        </form>
      </header>

      <main className="flex-1 px-6 pb-10 pt-9">
        <p className="text-[15px] text-muted">Welcome to WardMate</p>
        <h1 className="ios-large-title mt-0.5">{hasProfessionalAccess ? "Choose your unit" : "Professional access"}</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-muted">{hasProfessionalAccess ? "Join the unit your team already uses, or create one for a new team." : "WardMate is for doctors and medical interns. Confirm your professional details before entering a unit."}</p>

        {!hasProfessionalAccess ? <ProfessionalForm /> : <>

        <section className="mt-8">
          <h2 className="mb-2 text-[17px] font-semibold">Join an existing unit</h2>
          <p className="mb-3 text-[13px] leading-relaxed text-muted">
            Ask a colleague for the eight-character unit code.
          </p>
          <JoinForm />
        </section>

        <div className="my-8 flex items-center gap-3 text-[13px] text-muted" aria-hidden>
          <span className="h-px flex-1 bg-line" />
          or
          <span className="h-px flex-1 bg-line" />
        </div>

        <section>
          <h2 className="mb-2 text-[17px] font-semibold">Create a new unit</h2>
          <p className="mb-3 text-[13px] leading-relaxed text-muted">
            You will be its owner and can share its code with your team.
          </p>
          <CreateUnitForm />
        </section>

        <p className="mt-8 text-center text-[13px] text-muted">
          Already belong to a unit? <Link href="/unit" className="text-accent">Manage units</Link>
        </p>
        </>}
      </main>
    </div>
  );
}
