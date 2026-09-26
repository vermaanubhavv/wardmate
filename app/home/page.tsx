import type { Metadata } from "next";
import Mark from "@/app/mark";
import WaitlistForm from "@/app/waitlist/waitlist-form";
import ContactForm from "@/app/home/contact-form";
import { FragmentMerge, ScreenTour, TriageDemo } from "@/app/home/interactive";
import "./landing.css";

/**
 * The full marketing page — About, the academic pitch, the founder, real product screens —
 * as opposed to /waitlist, which is the short three-bullet version linked from the Instagram
 * bio. This one is the thing to send someone who wants the whole story before they sign up.
 *
 * Styled with the app's own tokens (ios-group, the teal accent, the system font) rather than
 * a separate visual language, so a resident clicking through from here into the product isn't
 * met with a different-looking app. Visual rhythm comes from varying each section's shape
 * (a paired screenshot here, a 3-up grid there) rather than repeating one block six times.
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

function Eyebrow({ children }: { children: string }) {
  return <p className="ios-group-header text-accent">{children}</p>;
}

/* ---- small monoline icons — one stroke width, currentColor, no library ---- */
const Icon = {
  file: (
    <path d="M6 3h8l4 4v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z M14 3v4h4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
  ),
  register: (
    <path d="M5 4h13a1 1 0 0 1 1 1v15l-3-2-3 2-3-2-3 2-3-2-2 2V5a1 1 0 0 1 1-1z M8 9h9M8 13h9" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
  ),
  paper: (
    <path d="M6 3h9l4 4v13.5a1 1 0 0 1-1.4.9L15 20l-2.5 1.5L10 20l-2.5 1.5L5 20V4a1 1 0 0 1 1-1z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
  ),
  chat: (
    <path d="M4 5h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H9l-4.5 3.5A0.6 0.6 0 0 1 3.5 20V6a1 1 0 0 1 .5-1z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
  ),
  memory: (
    <>
      <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="1.6" strokeDasharray="3 3.2" />
      <circle cx="12" cy="12" r="1.6" fill="currentColor" />
    </>
  ),
  moon: (
    <path d="M17 12.5A7 7 0 1 1 10.5 3a5.6 5.6 0 1 0 6.5 9.5z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="3.6" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <g stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
        <line x1="12" y1="2.5" x2="12" y2="5.5" />
        <line x1="12" y1="18.5" x2="12" y2="21.5" />
        <line x1="2.5" y1="12" x2="5.5" y2="12" />
        <line x1="18.5" y1="12" x2="21.5" y2="12" />
        <line x1="5.3" y1="5.3" x2="7.4" y2="7.4" />
        <line x1="16.6" y1="16.6" x2="18.7" y2="18.7" />
        <line x1="5.3" y1="18.7" x2="7.4" y2="16.6" />
        <line x1="16.6" y1="7.4" x2="18.7" y2="5.3" />
      </g>
    </>
  ),
  check: (
    <path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
  ),
  handoff: (
    <path d="M7 6l5 6-5 6M13 6l5 6-5 6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  ),
} as const;

function Svg({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" className={className} aria-hidden>
      {children}
    </svg>
  );
}

const FRAGMENTS = [
  ["file", "The file", "updated when someone remembers to"],
  ["register", "The round register", "a line per patient, rarely complete"],
  ["paper", "Random pieces of paper", "the sticky note, the back of a lab slip"],
  ["chat", "WhatsApp", "where the real handover actually happens"],
  ["memory", "The resident's memory", "the part nobody wrote down"],
] as const;

const FLOW = [
  ["moon", "5:30 AM", "Pre-round", "Overnight events, vitals, and pending results land in your list before your feet hit the floor."],
  ["sun", "7:00 AM", "Ward rounds", "One-liners and active issues ready to go, no scrolling the chart mid-sentence in front of the consultant."],
  ["handoff", "End of shift", "Handover", "A structured note goes to whoever's on next, to-dos and code status included."],
] as const;

const ROUND_LINES = [
  ["7", "Shikha, 25/F — Day 5, acute pancreatitis, conservative", "Temp 102°F — fever unresolving. Reassess now, repeat lactate and CRP, consider escalation.", true],
  ["1", "Shyamlal, 21/M — POD 0, Lap chole", "Hourly vitals, sips of water, mobilise if stable. Not yet recorded: pain score, drain output.", false],
  ["3", "Doodie, 23/M — Day 2, acute appendicitis, Ochsner-Sherren", "4-hourly pulse, temperature, abdominal girth.", false],
] as const;

const GUIDELINES = [
  ["BISAP", "Surgery", "Pancreatitis, day 2", "Send CBC, LFT, KFT, electrolytes, calcium, LDH — inputs to BISAP and Ranson's criteria for severity."],
  ["ATLS", "Emergency", "Polytrauma, post-RTA", "Airway, breathing, circulation, disability, exposure — the primary survey, before anything else."],
  ["HF", "Medicine", "Acute decompensated heart failure", "Send BNP, echocardiogram — confirms severity before starting guideline-directed therapy: ACEi/ARNI, beta-blocker, MRA, SGLT2i."],
] as const;

const SCREENS = [
  ["/home/phone-ward-list.png", "Ward list", "Wardmate ward list screen for Unit Alpha, with each patient's diagnosis and outstanding to-dos", "Every patient on the unit, with the diagnosis and what's still outstanding, at a glance."],
  ["/home/phone-todo.png", "To-do", "Wardmate to-do screen, a critical fever flagged under Needs attention now, ahead of routine tasks", "Needs attention now sits above routine work: a 102°F fever before a pre-op panel."],
  ["/home/phone-patient-chart.png", "Chart", "Wardmate patient chart screen with vitals, a to-do checklist, Tap to speak and Photograph a report", "Vitals and a checklist per patient. Tap to speak, or photograph a report, instead of typing."],
] as const;

const NAV = [
  ["#about", "Why"],
  ["#round", "Triage"],
  ["#guidelines", "Guidelines"],
  ["#product", "App"],
  ["#contact", "Contact"],
] as const;

/** Staggered entrance delay, for the wm-in keyframe. */
const d = (ms: number) => ({ "--d": `${ms}ms` }) as React.CSSProperties;

export default function HomePage() {
  return (
    <main className="flex-1 w-full">
      {/* ---- header ---- */}
      <header className="sticky top-0 z-20 top-bar border-b border-line bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <a href="#" className="flex items-center gap-2">
            <Mark className="h-7 w-7" />
            <span className="text-[17px] font-semibold tracking-tight">
              ward<span className="text-accent">mate</span>
            </span>
          </a>
          <nav aria-label="Sections" className="hidden items-center gap-1 md:flex">
            {NAV.map(([href, label]) => (
              <a
                key={href}
                href={href}
                className="rounded-[9px] px-3 py-1.5 text-[14px] font-medium text-muted transition-colors hover:bg-accent/10 hover:text-accent"
              >
                {label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-1 sm:gap-2">
            <a href="/login" className="whitespace-nowrap rounded-[10px] px-2 py-2 text-[14px] font-semibold text-muted hover:text-foreground sm:px-3">
              Log in
            </a>
            <a
              href="#waitlist"
              className="whitespace-nowrap rounded-[10px] bg-accent px-3 py-2 text-[14px] font-semibold text-accent-ink shadow-[0_8px_20px_-10px_var(--accent)] sm:px-4"
            >
              Join the waitlist
            </a>
          </div>
        </div>
        <div className="wm-progress" aria-hidden />
      </header>

      {/* ---- hero: text + one real, featured screenshot and a single callout ---- */}
      <section className="wm-hero">
        <div className="mx-auto grid max-w-6xl items-center gap-14 px-6 pt-20 pb-24 lg:grid-cols-[1.05fr_0.95fr] lg:pt-28">
          <div>
            <span className="wm-pill wm-in">
              <span className="wm-live-dot" aria-hidden />
              Your AI residency companion
            </span>
            <h1 className="wm-in mt-5 max-w-[13ch] text-[44px] font-bold leading-[1.02] tracking-[-0.03em] sm:text-[60px]" style={d(120)}>
              Less clerical.{" "}
              <span className="wm-accent-text">More clinical.</span>
            </h1>
            <p className="wm-in mt-6 max-w-[50ch] text-[17.5px] leading-snug text-muted" style={d(240)}>
              WardMate&rsquo;s AI drafts the ward list and the round from what&rsquo;s already
              in front of you, and flags what the guidelines say you shouldn&rsquo;t miss — so
              training time goes to the patient, not the paperwork. Built by a resident
              who&rsquo;s done the on-call nights, not just studied them.
            </p>
            <div className="wm-in mt-8 flex flex-wrap gap-3" style={d(360)}>
              <a
                href="#waitlist"
                className="wm-card rounded-[12px] bg-accent px-6 py-3.5 text-[15px] font-semibold text-accent-ink shadow-[0_14px_30px_-14px_var(--accent)]"
              >
                Join the waitlist →
              </a>
              <a href="#about" className="wm-card rounded-[12px] border border-line bg-card/70 px-6 py-3.5 text-[15px] font-semibold backdrop-blur">
                See how it works
              </a>
            </div>
          </div>

          <div className="wm-in relative mx-auto w-full max-w-[300px] lg:max-w-[340px]" style={d(200)}>
            <div
              className="pointer-events-none absolute -inset-10 -z-10 rounded-full"
              style={{ background: "radial-gradient(55% 55% at 50% 45%, color-mix(in srgb, var(--accent) 26%, transparent), transparent)" }}
            />
            <div>
              {/* eslint-disable-next-line @next/next/no-img-element -- fixed marketing asset */}
              <img
                src="/home/phone-ward-round.png"
                alt="Wardmate ward round screen, triaged most urgent first, with a critical fever flagged ahead of routine patients"
                className="mx-auto w-full rounded-[22px] ring-1 ring-black/5 shadow-[0_40px_80px_-30px_rgba(0,0,0,0.45)]"
              />
            </div>
            <div className="wm-chip wm-chip-a">
              <span className="h-2.5 w-2.5 rounded-full bg-critical-dot" />
              <span>
                <span className="block font-semibold text-critical-fg">Needs attention now</span>
                <span className="text-muted">Bed 7 · Temp 102°F</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ---- fragmentation → one place ---- */}
      <section id="about" className="mx-auto max-w-6xl scroll-mt-16 px-6 py-20">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div className="wm-reveal">
            <Eyebrow>The problem</Eyebrow>
            <h2 className="mt-1 text-[30px] font-semibold leading-tight tracking-tight sm:text-[34px]">Built between call shifts</h2>
            <p className="mt-4 max-w-[56ch] text-[16px] leading-snug text-muted">
              A patient&rsquo;s information gets fragmented fast — investigations ordered and lost
              track of, reports that never make it back to the file. Updates to the consultant end
              up incomplete, because nobody has the full picture in one place. And somewhere in
              between chasing all of it down, the actual care waits.
            </p>
            <p className="mt-5 max-w-[56ch] text-[16px] leading-snug text-muted">
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
          </div>

          <div className="wm-reveal">
            <p className="ios-group-header">Right now, that story is split across</p>
            <div className="mt-2">
              <FragmentMerge
                logo={<Mark className="h-10 w-10 shrink-0" />}
                items={FRAGMENTS.map(([icon, label, desc]) => ({
                  icon: <Svg>{Icon[icon as keyof typeof Icon]}</Svg>,
                  label,
                  desc,
                }))}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ---- shift flow + triaged round, paired side by side on desktop ---- */}
      <section id="round" className="scroll-mt-16 border-y border-line bg-card py-20">
        <div className="mx-auto grid max-w-6xl gap-14 px-6 lg:grid-cols-2">
          <div>
            <div className="wm-reveal">
              <Eyebrow>A day on service</Eyebrow>
              <h2 className="mt-1 text-[30px] font-semibold tracking-tight">How the shift actually flows</h2>
            </div>
            <div className="wm-timeline mt-7 flex flex-col gap-7">
              <div className="wm-timeline-fill" />
              {FLOW.map(([icon, time, title, body]) => (
                <div key={time} className="wm-reveal flex gap-4">
                  <span className="wm-node">
                    <Svg>{Icon[icon as keyof typeof Icon]}</Svg>
                  </span>
                  <div className="pt-1">
                    <p className="font-mono text-[12.5px] font-medium text-accent">{time}</p>
                    <p className="mt-0.5 text-[16px] font-semibold">{title}</p>
                    <p className="mt-1 max-w-[46ch] text-[14.5px] leading-snug text-muted">{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="wm-reveal">
              <Eyebrow>Triaged, most urgent first</Eyebrow>
              <h2 className="mt-1 text-[30px] font-semibold tracking-tight">Unit Alpha, this round</h2>
              <p className="mt-2 max-w-[46ch] text-[14.5px] text-muted">The same list you&rsquo;d see in the app. Flip it between bed order and triaged.</p>
            </div>
            <div className="wm-reveal mt-6">
              <TriageDemo lines={ROUND_LINES} />
            </div>
          </div>
        </div>
      </section>

      {/* ---- guideline prompts ---- */}
      <section id="guidelines" className="scroll-mt-16 mx-auto max-w-6xl px-6 py-20">
        <div className="wm-reveal text-center">
          <Eyebrow>The academic half</Eyebrow>
          <h2 className="mt-1 text-[30px] font-semibold tracking-tight sm:text-[34px]">Learns the guidelines with you</h2>
          <p className="mx-auto mt-3 max-w-[62ch] text-[16px] leading-snug text-muted">
            Every prompt says why — pulled from the standard texts and scoring systems your
            consultant already expects you to know, attached to the patient in front of you. One
            department&rsquo;s ward, or a dozen — the guideline comes with the patient.
          </p>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          {GUIDELINES.map(([badge, dept, context, body]) => (
            <div key={badge} className="wm-glow-border wm-card wm-reveal flex flex-col gap-3 px-6 py-6">
              <div className="flex items-center justify-between">
                <span className="rounded-[6px] bg-accent/10 px-2.5 py-1 font-mono text-[12px] font-semibold text-accent">
                  {badge}
                </span>
                <span className="text-[11px] font-medium uppercase tracking-wide text-muted">{dept}</span>
              </div>
              <p className="text-[16px] font-semibold leading-snug">{context}</p>
              <p className="text-[14px] leading-snug text-muted">{body}</p>
            </div>
          ))}
        </div>
        <p className="mt-5 text-center text-[13px] text-muted">3 prompts, 3 departments · pulled from standard references, not memory</p>
      </section>

      {/* ---- phone screens ---- */}
      <section id="product" className="scroll-mt-16 border-y border-line bg-card py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="wm-reveal text-center">
            <Eyebrow>The product</Eyebrow>
            <h2 className="mt-1 text-[30px] font-semibold tracking-tight sm:text-[34px]">On your phone, between patients</h2>
            <p className="mx-auto mt-3 max-w-[58ch] text-[16px] leading-snug text-muted">
              The to-do list and the round are the two you&rsquo;ll live in — both triaged, most
              urgent first, so the patient who needs you now doesn&rsquo;t wait behind routine
              bloodwork.
            </p>
          </div>
          <div className="wm-reveal mt-12">
            <ScreenTour screens={SCREENS} />
          </div>
        </div>
      </section>

      {/* ---- founder ---- */}
      <section id="founder" className="mx-auto max-w-3xl px-6 py-20">
        <div className="wm-glow-border wm-reveal px-6 py-7 sm:px-8">
          <Eyebrow>The person behind it</Eyebrow>
          <h2 className="mt-1 text-[26px] font-semibold tracking-tight">Built by the resident who needed it</h2>
          <div className="mt-5 flex items-start gap-5">
            <span className="grid h-[72px] w-[72px] shrink-0 place-items-center rounded-full bg-accent text-[24px] font-semibold text-white shadow-[0_12px_28px_-12px_var(--accent)]">
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
        </div>
      </section>

      {/* ---- waitlist + contact ---- */}
      <section className="wm-closing border-t border-line py-20">
        <div className="mx-auto grid max-w-4xl gap-10 px-6 sm:grid-cols-2">
          <div id="waitlist" className="wm-reveal min-w-0 scroll-mt-20">
            <Eyebrow>Get early access</Eyebrow>
            <h2 className="mt-1 text-[24px] font-semibold tracking-tight">Join the waitlist</h2>
            <p className="mt-2 text-[14.5px] text-muted">
              We&rsquo;re onboarding residency programs in small cohorts as we build.
            </p>
            <div className="mt-5">
              <WaitlistForm autoFocusFirstField={false} />
            </div>
          </div>

          <div id="contact" className="wm-reveal min-w-0 scroll-mt-20">
            <Eyebrow>Get in touch</Eyebrow>
            <h2 className="mt-1 text-[24px] font-semibold tracking-tight">Contact us</h2>
            <p className="mt-2 text-[14.5px] text-muted">
              Tell us about your program, or what&rsquo;s missing from how your team hands
              over.
            </p>
            <div className="mt-5">
              <ContactForm />
            </div>
            <p className="mt-4 text-[13px] text-muted">
              Prefer email? Write to{" "}
              <a href="mailto:anubhav@wardmate.in" className="text-foreground underline underline-offset-2">
                anubhav@wardmate.in
              </a>
            </p>
          </div>
        </div>
      </section>

      <footer className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 border-t border-line px-6 py-8 bottom-bar text-[13px] text-muted">
        <span className="flex items-center gap-2">
          <Mark className="h-5 w-5" /> © 2026 WardMate
        </span>
        <span>Built by a resident, for residents.</span>
      </footer>
    </main>
  );
}
