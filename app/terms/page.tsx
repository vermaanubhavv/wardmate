import Link from "next/link";

/**
 * The Clinician Data Agreement — what a doctor accepts on the onboarding screen (see
 * app/onboarding/professional-form.tsx, TERMS_VERSION in app/onboarding/actions.ts).
 *
 * UNREVIEWED DRAFT. Written to close a real gap — nothing previously asked a doctor to agree
 * to anything before their patient data was processed — not by a lawyer. Get counsel familiar
 * with the DPDP Act, 2023 and Indian medical-council rules to review and revise this before
 * TERMS_VERSION moves past "draft-1", or before relying on it for anything.
 */
export default function TermsPage() {
  return (
    <main className="flex-1 px-6 py-10 max-w-md mx-auto w-full pb-24">
      <Link href="/onboarding" className="text-[17px] text-accent">
        ‹ Back
      </Link>

      <div className="mt-4 ios-group px-4 py-3 text-[13px] leading-relaxed text-orange-700">
        <b>Unreviewed draft (version: draft-1).</b> Not yet checked by a lawyer. Treat this as a
        starting point, not a finished agreement.
      </div>

      <h1 className="mt-4 ios-large-title">Clinician Data Agreement</h1>
      <p className="mt-1 text-[15px] text-muted">
        WardMate is adopted unit by unit, resident by resident — not procured by a hospital&rsquo;s
        IT department first. So this agreement is written for the relationship that actually
        exists today: between WardMate and the doctor creating an account, not a hospital that
        may not yet know the app is in use.
      </p>

      <div className="mt-8 flex flex-col gap-6">
        <Clause n={1} title="Who this is between">
          This agreement is between WardMate (&ldquo;we&rdquo;) and you, the doctor or resident
          creating an account (&ldquo;you&rdquo;). It is not, on its own, an agreement with any
          hospital — if your hospital later adopts WardMate formally, a separate institutional
          agreement should govern that relationship instead, for anything it covers.
        </Clause>

        <Clause n={2} title="What each of us is, under the DPDP Act">
          For the patient data you enter, <b>you are the Data Fiduciary</b> — the one with the
          clinical relationship to the patient, and the one responsible for a lawful basis to
          hold their data. <b>WardMate is your Data Processor</b>: we process that data only to
          provide the features you use, only on the instructions this agreement represents, and
          never for a purpose of our own.
        </Clause>

        <Clause n={3} title="What we actually do with it">
          A photo or spoken note you capture is sent to the AI services listed in our
          sub-processor register to be turned into structured fields, which you review before
          anything is saved. Nothing is auto-confirmed. We will not sell patient data or use it
          to train a model we own, will not keep a deleted patient&rsquo;s data, and will tell
          you promptly if we confirm a breach affecting your ward.
        </Clause>

        <Clause n={4} title="What we're asking of you">
          Enter only patients under your own care, on the unit you belong to. Keep your sign-in
          and your unit&rsquo;s join code to yourself. Tell us and your hospital promptly if you
          believe an account or code has been compromised. Keep following your hospital&rsquo;s
          own policies on records and consent — this sits alongside those, not in place of them.
        </Clause>

        <Clause n={5} title="Your rights, and a patient's">
          You can see, correct, or remove any patient record on your unit at any time through
          the app. If a patient asks you for a copy of their data, or to have it erased, you can
          act on that directly — WardMate does not stand between you and that request.
        </Clause>

        <Clause n={6} title="How long data is kept">
          An active patient stays on the record for as long as you keep them there. Removing a
          patient moves them to Trash for 48 hours — recoverable the whole time — after which the
          record and any photo or audio evidence tied to it is permanently deleted.
        </Clause>

        <Clause n={7} title="No warranty on the clinical content">
          WardMate helps you document faster; it does not practice medicine and does not
          replace your judgment. Every AI-suggested field is a suggestion, shown beside the
          transcript or photo it came from, for you to accept, edit, or discard. You remain
          solely responsible for the accuracy of your patients&rsquo; record.
        </Clause>

        <Clause n={8} title="Ending this">
          You may leave your unit or delete your account at any time from Settings. Your
          patients&rsquo; records stay with the unit — they belong to the clinical team, not to
          any one doctor who rotates off it.
        </Clause>

        <Clause n={9} title="Changes to this agreement">
          A change that affects what we&rsquo;re allowed to do with your patients&rsquo; data
          will be shown to you again before it takes effect, under a new version number.
        </Clause>
      </div>

      <p className="mt-8 text-[13px] text-muted">
        Questions, a data request, or a suspected breach: contact your unit&rsquo;s founder
        directly until a support address is published here.
      </p>
    </main>
  );
}

function Clause({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-[17px] font-semibold">
        <span className="text-muted mr-1.5">{n}.</span>
        {title}
      </h2>
      <p className="mt-1 text-[15px] leading-relaxed text-foreground">{children}</p>
    </section>
  );
}
