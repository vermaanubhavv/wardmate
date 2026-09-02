import type { Metadata } from "next";
import Mark from "@/app/mark";
import WaitlistForm from "./waitlist-form";

/**
 * The public waitlist, linked from the Instagram bio. Middleware lets `/waitlist` and
 * `/api/waitlist` through without a session.
 *
 * This wrapper is a server component so the page carries real metadata for the link preview
 * card; the form itself is the client component next door.
 */

const DESCRIPTION =
  "WardMate turns a spoken ward round into the unit's paperwork — the jobs list, the handover, the discharge summaries. Built for residents in India.";

export const metadata: Metadata = {
  title: "Join the waitlist — WardMate",
  description: DESCRIPTION,
  alternates: { canonical: "https://wardmate.in/waitlist" },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    siteName: "WardMate",
    url: "https://wardmate.in/waitlist",
    title: "Join the WardMate waitlist",
    description: DESCRIPTION,
    images: [
      {
        url: "https://wardmate.in/icon-512.png",
        width: 512,
        height: 512,
        alt: "WardMate",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Join the WardMate waitlist",
    description: DESCRIPTION,
    images: ["https://wardmate.in/icon-512.png"],
  },
};

// Plain lines, straight from what the product does — no adjectives doing work the facts
// should do.
const WHAT_IT_DOES = [
  "Speak the round at the bedside. WardMate works out which patient is which.",
  "Jobs become a checklist for the whole unit, coloured by how soon they are due.",
  "The handover and the discharge summary write themselves, in the unit's own format.",
];

export default function WaitlistPage() {
  return (
    <main className="flex-1 w-full max-w-md mx-auto px-6 py-14 flex flex-col gap-10">
      <header className="flex flex-col items-center gap-3.5 text-center">
        <Mark className="h-12 w-12" />
        <h1 className="text-[27px] font-semibold tracking-tight">
          ward<span className="text-accent">mate</span>
        </h1>
        <p className="max-w-[19rem] text-[15px] leading-snug text-muted">
          The ward round, recorded by speaking — and turned into the unit&rsquo;s
          paperwork by itself.
        </p>
      </header>

      <section className="flex flex-col gap-2">
        <p className="ios-group-header px-1">What it does</p>
        <div className="ios-group">
          {WHAT_IT_DOES.map((line) => (
            <p
              key={line}
              className="ios-row px-4 py-3.5 text-[15px] leading-snug"
            >
              {line}
            </p>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <p className="ios-group-header px-1">Join the waitlist</p>
        <WaitlistForm />
      </section>

      <footer className="border-t border-line pt-6 text-center text-[13px] text-muted">
        WardMate — built for residents in India.
      </footer>
    </main>
  );
}
