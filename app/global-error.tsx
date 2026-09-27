"use client";

// The last-resort screen: something threw while rendering the root layout itself, so the
// normal app chrome is gone and React has nothing left to show. Next.js swaps this in.
//
// It does two jobs: report the crash to Sentry (this is the only error boundary that catches
// a failure this high up), and give the resident a way back rather than a blank white page.
import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-[#f2f2f7]">
        <main className="mx-auto flex min-h-screen w-full max-w-md flex-col items-start justify-center px-6">
          <h1 className="text-[22px] font-semibold text-neutral-900">
            Something broke
          </h1>
          <p className="mt-2 text-subhead leading-relaxed text-muted">
            The app hit an error it could not recover from on this screen. Your
            saved work is safe — nothing you had already confirmed is affected.
          </p>
          <div className="mt-6 flex gap-3">
            <button
              onClick={() => reset()}
              className="btn btn-primary"
            >
              Try again
            </button>
            <a
              href="/ward"
              className="btn btn-secondary"
            >
              Back to ward
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}
