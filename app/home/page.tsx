import type { Metadata } from "next";
import Image from "next/image";
import Mark from "@/app/mark";
import WaitlistForm from "@/app/waitlist/waitlist-form";
import ContactForm from "@/app/home/contact-form";
import styles from "./home.module.css";

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

function Divider() {
  return <div className="border-t border-line" />;
}

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
  ["/home/phone-ward-list.png", "Ward list", "Wardmate ward list screen for Unit Alpha, with each patient's diagnosis and outstanding to-dos"],
  ["/home/phone-todo.png", "To-do, triaged", "Wardmate to-do screen, a critical fever flagged under Needs attention now, ahead of routine tasks"],
  ["/home/phone-patient-chart.png", "Patient chart", "Wardmate patient chart screen with vitals, a to-do checklist, Tap to speak and Photograph a report"],
] as const;

export default function HomePage() {
  return (
    <main id="top" className="flex-1 w-full">
      {/* ---- header ---- */}
      <header className="sticky top-0 z-10 top-bar border-b border-line bg-background/95 backdrop-blur">
        <div className={styles.headerInner}>
          <span className="flex items-center gap-2">
            <Mark className="h-7 w-7" />
            <span className="text-[17px] font-semibold tracking-tight">
              ward<span className="text-accent">mate</span>
            </span>
          </span>
          <nav className={styles.primaryNav} aria-label="Main navigation">
            <a href="#top" aria-current="page">Home</a>
            <a href="#about">About</a>
            <a href="#contact">Contact</a>
            <a href="/login">Login</a>
          </nav>
          <a
            href="#waitlist"
            className="rounded-[10px] bg-accent px-4 py-2 text-[14px] font-semibold text-accent-ink"
          >
            Join the waitlist
          </a>
        </div>
      </header>

      {/* ---- hero: text + a real, featured screenshot ---- */}
      <section className="mx-auto max-w-6xl px-6 pt-14 pb-14">
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="text-[15px] text-muted">Your AI residency companion</p>
            <h1 className="ios-large-title mt-3 text-[40px] leading-[1.05] sm:text-[46px] max-w-[13ch]">
              Less clerical. More clinical.
            </h1>
            <p className="mt-5 max-w-[50ch] text-[17px] leading-snug text-muted">
              WardMate&rsquo;s AI drafts the ward list and the round from what&rsquo;s already
              in front of you, and flags what the guidelines say you shouldn&rsquo;t miss — so
              training time goes to the patient, not the paperwork. Built by a resident
              who&rsquo;s done the on-call nights, not just studied them.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a href="#waitlist" className="rounded-[10px] bg-accent px-5 py-3 text-[15px] font-semibold text-accent-ink">
                Join the waitlist
              </a>
              <a href="#contact" className="rounded-[10px] border border-line px-5 py-3 text-[15px] font-semibold">
                Contact us
              </a>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-[300px] lg:max-w-none">
            <div
              className="pointer-events-none absolute -inset-x-6 -inset-y-8 -z-10 rounded-[40px] opacity-70 lg:-inset-x-10"
              style={{ background: "radial-gradient(60% 60% at 50% 40%, color-mix(in srgb, var(--accent) 16%, transparent), transparent)" }}
            />
            {/* eslint-disable-next-line @next/next/no-img-element -- fixed marketing asset */}
            <img
              src="/home/phone-ward-round.png"
              alt="Wardmate ward round screen, triaged most urgent first, with a critical fever flagged ahead of routine patients"
              className="mx-auto w-full max-w-[280px] rounded-[18px] shadow-[0_24px_60px_-20px_rgba(0,0,0,0.35)] lg:max-w-[320px]"
            />
          </div>
        </div>
      </section>

      <Divider />

      {/* ---- fragmentation ---- */}
      <section id="about" className="mx-auto max-w-3xl px-6 py-14">
        <Eyebrow>The problem</Eyebrow>
        <h2 className="mt-1 text-[26px] font-semibold tracking-tight">Built between call shifts</h2>
        <p className="mt-4 max-w-[62ch] text-[16px] leading-snug text-muted">
          A patient&rsquo;s information gets fragmented fast — investigations ordered and lost
          track of, reports that never make it back to the file. Updates to the consultant end
          up incomplete, because nobody has the full picture in one place. And somewhere in
          between chasing all of it down, the actual care waits. Right now, that story is split
          across:
        </p>
        <div className="ios-group mt-5 max-w-[62ch]">
          {FRAGMENTS.map(([icon, label, desc]) => (
            <div key={label} className="ios-row flex items-start gap-3 px-4 py-3.5">
              <Svg className="mt-0.5 shrink-0 text-accent">{Icon[icon as keyof typeof Icon]}</Svg>
              <p className="text-[15px] leading-snug">
                <span className="font-semibold">{label}</span>{" "}
                <span className="text-muted">— {desc}</span>
              </p>
            </div>
          ))}
        </div>
        <p className="mt-5 max-w-[62ch] text-[19px] font-semibold text-accent">
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

      {/* ---- shift flow + triaged round, paired side by side on desktop ---- */}
      <section className="bg-card py-14">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 lg:grid-cols-2">
          <div>
            <Eyebrow>A day on service</Eyebrow>
            <h2 className="mt-1 text-[26px] font-semibold tracking-tight">How the shift actually flows</h2>
            <div className="mt-5 flex flex-col gap-0">
              {FLOW.map(([icon, time, title, body]) => (
                <div key={time} className="flex gap-3 border-t border-line py-4 first:border-t-0 first:pt-1">
                  <Svg className="mt-0.5 shrink-0 text-muted">{Icon[icon as keyof typeof Icon]}</Svg>
                  <div>
                    <p className="font-mono text-[12.5px] font-medium text-muted">{time}</p>
                    <p className="mt-0.5 text-[15px] leading-snug">
                      <span className="font-semibold">{title}</span>{" "}
                      <span className="text-muted">— {body}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Eyebrow>Triaged, most urgent first</Eyebrow>
            <h2 className="mt-1 text-[26px] font-semibold tracking-tight">Unit Alpha, this round</h2>
            <p className="mt-2 max-w-[46ch] text-[14.5px] text-muted">The same list you&rsquo;d see in the app.</p>
            <div className="mt-5 flex flex-col gap-3">
              {ROUND_LINES.map(([bed, who, body, critical]) => (
                <div
                  key={bed}
                  className={critical ? "rounded-[10px] px-4 py-3.5" : "ios-group rounded-[10px] px-4 py-3.5"}
                  style={critical ? { background: "#fdf6f5", boxShadow: "inset 0 0 0 1px #e3b3ac" } : undefined}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[14.5px] font-semibold">{who}</p>
                    {critical && (
                      <span className="rounded-[5px] px-2 py-0.5 text-[10.5px] font-bold text-white" style={{ background: "#b23b2e" }}>
                        CRITICAL
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-[13.5px] leading-snug" style={critical ? { color: "#b23b2e", fontWeight: 500 } : undefined}>
                    {!critical && <span className="text-muted">{body}</span>}
                    {critical && body}
                  </p>
                </div>
              ))}
            </div>
            <p className="mt-3 text-[13px] text-muted">Handed over · ready to copy for WhatsApp</p>
          </div>
        </div>
      </section>

      <Divider />

      {/* ---- guideline prompts — a 3-up grid, not a stacked list ---- */}
      <section className="mx-auto max-w-6xl px-6 py-14">
        <Eyebrow>The academic half</Eyebrow>
        <h2 className="mt-1 text-[26px] font-semibold tracking-tight">Learns the guidelines with you</h2>
        <p className="mt-3 max-w-[70ch] text-[16px] leading-snug text-muted">
          Every prompt says why — pulled from the standard texts and scoring systems your
          consultant already expects you to know, attached to the patient in front of you. One
          department&rsquo;s ward, or a dozen — the guideline comes with the patient.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {GUIDELINES.map(([badge, dept, context, body]) => (
            <div key={badge} className="ios-group flex flex-col gap-2.5 px-5 py-5">
              <div className="flex items-center justify-between">
                <span className="rounded-[5px] bg-[color-mix(in_srgb,var(--accent)_14%,transparent)] px-2 py-0.5 font-mono text-[11px] font-semibold text-accent">
                  {badge}
                </span>
                <span className="text-[11px] font-medium uppercase tracking-wide text-muted">{dept}</span>
              </div>
              <p className="text-[14.5px] font-semibold leading-snug">{context}</p>
              <p className="text-[13.5px] leading-snug text-muted">{body}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-[13px] text-muted">3 prompts, 3 departments · pulled from standard references, not memory</p>
      </section>

      <Divider />

      {/* ---- phone screens ---- */}
      <section className="bg-card py-14">
        <div className="mx-auto max-w-6xl px-6">
          <Eyebrow>The product</Eyebrow>
          <h2 className="mt-1 text-[26px] font-semibold tracking-tight">On your phone, between patients</h2>
          <p className="mt-3 max-w-[62ch] text-[16px] leading-snug text-muted">
            The to-do list and the round are the two you&rsquo;ll live in — both triaged, most
            urgent first, so the patient who needs you now doesn&rsquo;t wait behind routine
            bloodwork.
          </p>
          <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-3">
            {SCREENS.map(([src, caption, alt]) => (
              <figure key={src} className="m-0">
                {/* eslint-disable-next-line @next/next/no-img-element -- fixed marketing asset */}
                <img
                  src={src}
                  alt={alt}
                  loading="lazy"
                  className="w-full max-w-[260px] mx-auto rounded-[14px] shadow-[0_16px_40px_-16px_rgba(0,0,0,0.3)]"
                />
                <figcaption className="mt-3 text-center text-[13.5px] font-medium text-muted">{caption}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <Divider />

      {/* ---- founder ---- */}
      <section id="founder" className={styles.founder}>
        <div className={styles.founderIntro}>
          <Eyebrow>Why WardMate exists</Eyebrow>
          <h2>Made on the ward, for the ward.</h2>
        </div>
        <div className={styles.founderStory}>
          <p className={styles.founderLead}>
            WardMate started with a familiar problem: the ward list was already out of date
            by the time rounds began.
          </p>
          <p className={styles.founderBody}>
            I&rsquo;m a second-year general surgery resident. I built the first version for my
            own unit—to keep patient updates, jobs and handovers in one place, and to stop
            rebuilding the same picture from scraps every morning. The product still grows
            the same way: one real shift, one useful improvement at a time.
          </p>
          <div className={styles.founderByline}>
            <Image
              src="/home/anubhav-verma.jpg"
              width={150}
              height={150}
              alt="Dr. Anubhav Verma"
              className={styles.founderPhoto}
            />
            <span>
              <strong>Dr. Anubhav Verma</strong>
              <small>JR-2 · General Surgery</small>
            </span>
            <a href="mailto:anubhav@wardmate.in">anubhav@wardmate.in</a>
          </div>
        </div>
      </section>

      <Divider />

      {/* ---- waitlist + contact, side by side on desktop ---- */}
      <section className={styles.connect}>
        <div className={styles.connectGrid}>
          <div id="waitlist" className={`${styles.formCard} ${styles.waitlistCard}`}>
            <Eyebrow>Get early access</Eyebrow>
            <h2 className="mt-1 text-[22px] font-semibold tracking-tight">Join the waitlist</h2>
            <p className="mt-2 text-[14.5px] text-muted">
              We&rsquo;re onboarding residency programs in small cohorts as we build.
            </p>
            <div className="mt-5">
              <WaitlistForm autoFocusFirstField={false} />
            </div>
          </div>

          <div id="contact" className={styles.formCard}>
            <Eyebrow>Get in touch</Eyebrow>
            <h2 className="mt-1 text-[22px] font-semibold tracking-tight">Contact us</h2>
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

      <footer className="mx-auto w-full max-w-6xl border-t border-line px-6 py-8 bottom-bar text-[13px] text-muted">
        <span>© 2026 WardMate</span>
      </footer>
    </main>
  );
}
