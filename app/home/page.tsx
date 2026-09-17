import type { Metadata } from "next";
import Mark from "@/app/mark";
import WaitlistForm from "@/app/waitlist/waitlist-form";

/**
 * The full marketing page — About, the academic pitch, the founder, real product screens —
 * as opposed to /waitlist, which is the short three-bullet version linked from the Instagram
 * bio. This one is the thing to send someone who wants the whole story before they sign up.
 *
 * Styled with the app's own tokens (ios-group, the teal accent, the system font) rather than
 * a separate visual language, so a resident clicking through from here into the product isn't
 * met with a different-looking app.
 */

const DESCRIPTION =
  "WardMate turns a spoken ward round into the unit's paperwork — the jobs list, the handover, the discharge summaries. Built by a resident, for residents in India.";

export const metadata: Metadata = {
  title: "WardMate — Your AI residency companion",
  description: DESCRIPTION,
  alternates: { canonical: "https://wardmate.in/home" },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    siteName: "WardMate",
    url: "https://wardmate.in/home",
    title: "WardMate — Your AI residency companion",
    description: DESCRIPTION,
    images: [{ url: "https://wardmate.in/icon-512.png", width: 512, height: 512, alt: "WardMate" }],
  },
  twitter: {
    card: "summary",
    title: "WardMate — Your AI residency companion",
    description: DESCRIPTION,
    images: ["https://wardmate.in/icon-512.png"],
  },
};

function Divider() {
  return <div className="border-t border-line" />;
}

function SectionLabel({ children }: { children: string }) {
  return <p className="ios-group-header">{children}</p>;
}

const FRAGMENTS = [
  ["The file", "updated when someone remembers to"],
  ["The round register", "a line per patient, rarely complete"],
  ["Random pieces of paper", "the sticky note, the back of a lab slip"],
  ["WhatsApp", "where the real handover actually happens"],
  ["The resident's memory", "the part nobody wrote down"],
] as const;

const FLOW = [
  ["5:30 AM", "Pre-round", "Overnight events, vitals, and pending results land in your list before your feet hit the floor."],
  ["7:00 AM", "Ward rounds", "One-liners and active issues ready to go, no scrolling the chart mid-sentence in front of the consultant."],
  ["End of shift", "Handover", "A structured note goes to whoever's on next, to-dos and code status included."],
] as const;

const ROUND_LINES = [
  ["7", "Shikha, 25/F — Day 5, acute pancreatitis, conservative", "Temp 102°F — fever unresolving. Reassess now, repeat lactate and CRP, consider escalation.", true],
  ["1", "Shyamlal, 21/M — POD 0, Lap chole", "Hourly vitals, sips of water, mobilise if stable. Not yet recorded: pain score, drain output.", false],
  ["3", "Doodie, 23/M — Day 2, acute appendicitis, Ochsner-Sherren", "4-hourly pulse, temperature, abdominal girth.", false],
] as const;

const GUIDELINES = [
  ["BISAP", "Surgery · Pancreatitis, day 2", "Send CBC, LFT, KFT, electrolytes, calcium, LDH — inputs to BISAP and Ranson's criteria for severity."],
  ["ATLS", "Emergency · Polytrauma, post-RTA", "Airway, breathing, circulation, disability, exposure — the primary survey, before anything else."],
  ["HF", "Medicine · Acute decompensated heart failure", "Send BNP, echocardiogram — confirms severity before starting guideline-directed therapy: ACEi/ARNI, beta-blocker, MRA, SGLT2i."],
] as const;

const SCREENS = [
  ["/home/phone-ward-list.png", "Ward list", "Wardmate ward list screen for Unit Alpha, with each patient's diagnosis and outstanding to-dos"],
  ["/home/phone-ward-round.png", "Ward round, triaged", "Wardmate ward round screen, triaged most urgent first, with a critical fever flagged ahead of routine patients"],
  ["/home/phone-todo.png", "To-do, triaged", "Wardmate to-do screen, a critical fever flagged under Needs attention now, ahead of routine tasks"],
  ["/home/phone-patient-chart.png", "Patient chart", "Wardmate patient chart screen with vitals, a to-do checklist, Tap to speak and Photograph a report"],
] as const;

export default function HomePage() {
  return (
    <main className="flex-1 w-full">
      {/* ---- header ---- */}
      <header className="sticky top-0 z-10 top-bar border-b border-line bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
          <span className="flex items-center gap-2">
            <Mark className="h-7 w-7" />
            <span className="text-[17px] font-semibold tracking-tight">
              ward<span className="text-accent">mate</span>
            </span>
          </span>
          <a
            href="#waitlist"
            className="rounded-[10px] bg-accent px-4 py-2 text-[14px] font-semibold text-accent-ink"
          >
            Join the waitlist
          </a>
        </div>
      </header>

      {/* ---- hero ---- */}
      <section className="mx-auto max-w-3xl px-6 pt-14 pb-12">
        <p className="text-[15px] text-muted">Your AI residency companion</p>
        <h1 className="ios-large-title mt-3 max-w-[14ch]">Less clerical. More clinical.</h1>
        <p className="mt-4 max-w-[52ch] text-[16px] leading-snug text-muted">
          WardMate&rsquo;s AI drafts the ward list and the round from what&rsquo;s already in
          front of you, and flags what the guidelines say you shouldn&rsquo;t miss — so
          training time goes to the patient, not the paperwork. Built by a resident who&rsquo;s
          done the on-call nights, not just studied them.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <a href="#waitlist" className="rounded-[10px] bg-accent px-5 py-3 text-[15px] font-semibold text-accent-ink">
            Join the waitlist
          </a>
          <a href="#contact" className="rounded-[10px] border border-line px-5 py-3 text-[15px] font-semibold">
            Contact us
          </a>
        </div>
      </section>

      <Divider />

      {/* ---- fragmentation ---- */}
      <section className="mx-auto max-w-3xl px-6 py-12">
        <h2 className="text-[24px] font-semibold tracking-tight">Built between call shifts</h2>
        <p className="mt-4 max-w-[62ch] text-[16px] leading-snug text-muted">
          A patient&rsquo;s information gets fragmented fast — investigations ordered and lost
          track of, reports that never make it back to the file. Updates to the consultant end
          up incomplete, because nobody has the full picture in one place. And somewhere in
          between chasing all of it down, the actual care waits. Right now, that story is split
          across:
        </p>
        <div className="ios-group mt-5 max-w-[62ch]">
          {FRAGMENTS.map(([label, desc]) => (
            <p key={label} className="ios-row px-4 py-3.5 text-[15px] leading-snug">
              <span className="font-semibold">{label}</span>{" "}
              <span className="text-muted">— {desc}</span>
            </p>
          ))}
        </div>
        <p className="mt-5 max-w-[62ch] text-[18px] font-semibold text-accent">
          We&rsquo;re unifying all of it into one place. Running the ward has never been
          easier.
        </p>
        <p className="mt-6 max-w-[62ch] text-[16px] leading-snug text-muted">
          Two things carry most of that weight. The <span className="font-semibold text-foreground">to-do list</span> is
          triaged, most urgent first — a fever that&rsquo;s not settling sits above routine
          bloodwork, not buried in it. The <span className="font-semibold text-foreground">handover</span> is a
          ward-round summary, ready to copy across on WhatsApp instead of a photo of a paper
          list. Around those two: <span className="font-semibold text-foreground">rounds</span>, where
          one-liners and active issues are pulled together before the consultant&rsquo;s rounds
          instead of assembled mid-presentation; and <span className="font-semibold text-foreground">guideline
          prompts</span>, pulled from standard references, so a missing lab or a forgotten
          criterion doesn&rsquo;t slip through.
        </p>
      </section>

      <Divider />

      {/* ---- shift flow ---- */}
      <section className="mx-auto max-w-3xl px-6 py-12">
        <h2 className="text-[24px] font-semibold tracking-tight">How the shift actually flows</h2>
        <div className="ios-group mt-5 max-w-[62ch]">
          {FLOW.map(([time, title, body]) => (
            <div key={time} className="ios-row px-4 py-3.5">
              <p className="font-mono text-[13px] font-medium text-muted">{time}</p>
              <p className="mt-0.5 text-[15px] leading-snug">
                <span className="font-semibold">{title}</span>{" "}
                <span className="text-muted">— {body}</span>
              </p>
            </div>
          ))}
        </div>
      </section>

      <Divider />

      {/* ---- ward round, triaged ---- */}
      <section className="mx-auto max-w-3xl px-6 py-12">
        <h2 className="text-[24px] font-semibold tracking-tight">Triaged, most urgent first</h2>
        <p className="mt-2 max-w-[60ch] text-[15px] text-muted">
          Unit Alpha, this round — the same list you&rsquo;d see in the app.
        </p>
        <div className="mt-5 flex max-w-[62ch] flex-col gap-3">
          {ROUND_LINES.map(([bed, who, body, critical]) => (
            <div
              key={bed}
              className={critical ? "rounded-[10px] px-4 py-3.5" : "ios-group rounded-[10px] px-4 py-3.5"}
              style={critical ? { background: "#fdf6f5", boxShadow: "inset 0 0 0 1px #e3b3ac" } : undefined}
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-[14.5px] font-semibold">{who}</p>
                {critical && (
                  <span
                    className="rounded-[5px] px-2 py-0.5 text-[10.5px] font-bold text-white"
                    style={{ background: "#b23b2e" }}
                  >
                    CRITICAL
                  </span>
                )}
              </div>
              <p
                className="mt-1 text-[13.5px] leading-snug"
                style={critical ? { color: "#b23b2e", fontWeight: 500 } : undefined}
              >
                {!critical && <span className="text-muted">{body}</span>}
                {critical && body}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-3 max-w-[62ch] text-[13px] text-muted">Handed over · ready to copy for WhatsApp</p>
      </section>

      <Divider />

      {/* ---- guideline prompts ---- */}
      <section className="mx-auto max-w-3xl px-6 py-12">
        <h2 className="text-[24px] font-semibold tracking-tight">Learns the guidelines with you</h2>
        <p className="mt-2 max-w-[62ch] text-[16px] leading-snug text-muted">
          Every prompt says why — pulled from the standard texts and scoring systems your
          consultant already expects you to know, attached to the patient in front of you. One
          department&rsquo;s ward, or a dozen — the guideline comes with the patient.
        </p>
        <div className="ios-group mt-5 max-w-[62ch]">
          {GUIDELINES.map(([badge, context, body]) => (
            <div key={badge} className="ios-row flex gap-3 px-4 py-3.5">
              <span className="mt-0.5 h-fit shrink-0 rounded-[5px] bg-[color-mix(in_srgb,var(--accent)_14%,transparent)] px-2 py-0.5 font-mono text-[11px] font-semibold text-accent">
                {badge}
              </span>
              <p className="text-[14.5px] leading-snug">
                <span className="font-semibold">{context}</span>{" "}
                <span className="text-muted">— {body}</span>
              </p>
            </div>
          ))}
        </div>
        <p className="mt-3 max-w-[62ch] text-[13px] text-muted">3 prompts, 3 departments · pulled from standard references, not memory</p>
      </section>

      <Divider />

      {/* ---- phone screens ---- */}
      <section className="mx-auto max-w-5xl px-6 py-12">
        <h2 className="text-[24px] font-semibold tracking-tight">On your phone, between patients</h2>
        <p className="mt-2 max-w-[62ch] text-[16px] leading-snug text-muted">
          The to-do list and the round are the two you&rsquo;ll live in — both triaged, most
          urgent first, so the patient who needs you now doesn&rsquo;t wait behind routine
          bloodwork.
        </p>
        <div className="mt-6 grid grid-cols-2 gap-5 sm:grid-cols-4">
          {SCREENS.map(([src, caption, alt]) => (
            <figure key={src} className="m-0">
              {/* eslint-disable-next-line @next/next/no-img-element -- fixed marketing asset, not responsive-served */}
              <img src={src} alt={alt} loading="lazy" className="w-full rounded-[10px]" />
              <figcaption className="mt-2 text-center text-[13px] text-muted">{caption}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      <Divider />

      {/* ---- founder ---- */}
      <section className="mx-auto max-w-3xl px-6 py-12">
        <h2 className="text-[24px] font-semibold tracking-tight">The person behind it</h2>
        <div className="mt-5 flex max-w-[62ch] items-start gap-5">
          <span className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--accent)_14%,transparent)] font-semibold text-[24px] text-accent">
            AV
          </span>
          <div>
            <p className="text-[17px] font-semibold">Dr. Anubhav Verma</p>
            <p className="font-mono text-[12px] text-accent">JR-2 · General Surgery</p>
            <p className="mt-2.5 text-[15px] leading-snug text-muted">
              I&rsquo;m the one who built WardMate — still a second-year resident, still on
              call. Every screen here started as something I needed on my own ward: a list
              that didn&rsquo;t start from zero every morning, a round I could actually hand
              off, guidelines that showed up before the consultant asked for them. I&rsquo;m
              building this the way I practice — one ward round at a time.
            </p>
            <p className="mt-2.5 text-[13.5px] text-muted">
              — Anubhav ·{" "}
              <a href="mailto:anubhav@wardmate.in" className="text-foreground underline underline-offset-2">
                anubhav@wardmate.in
              </a>
            </p>
          </div>
        </div>
      </section>

      <Divider />

      {/* ---- waitlist ---- */}
      <section id="waitlist" className="mx-auto max-w-md px-6 py-14">
        <SectionLabel>Get early access</SectionLabel>
        <h2 className="mt-1 text-[24px] font-semibold tracking-tight">Join the waitlist</h2>
        <p className="mt-2 text-[15px] text-muted">
          We&rsquo;re onboarding residency programs in small cohorts as we build.
        </p>
        <div className="mt-5">
          <WaitlistForm />
        </div>
      </section>

      <Divider />

      {/* ---- contact ---- */}
      <section id="contact" className="mx-auto max-w-3xl px-6 py-12">
        <h2 className="text-[24px] font-semibold tracking-tight">Contact us</h2>
        <p className="mt-2 text-[15px] text-muted">
          Tell us about your program, or what&rsquo;s missing from how your team hands over.
        </p>
        <a
          href="mailto:anubhav@wardmate.in"
          className="mt-4 inline-block rounded-[10px] border border-line px-5 py-3 text-[15px] font-semibold"
        >
          Write to anubhav@wardmate.in
        </a>
      </section>

      <footer className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 border-t border-line px-6 py-8 bottom-bar text-[13px] text-muted">
        <span>© 2026 WardMate</span>
        <span>Built for the ones still running on chai and pattern recognition.</span>
      </footer>
    </main>
  );
}
