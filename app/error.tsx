"use client";

import Link from "next/link";

/**
 * Something on this screen threw. Nothing here names a stack trace or a patch file: the
 * resident gets a way back and a retry; the details go to Sentry.
 */
export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 px-4 py-16 text-center">
      <h1 className="ios-large-title">Something went wrong</h1>
      <p className="text-subhead text-muted">
        This screen could not be shown. Nothing you recorded has been lost.
      </p>
      <button type="button" onClick={reset} className="btn btn-primary mt-2 w-full">
        Try again
      </button>
      <Link href="/ward" className="btn btn-secondary w-full">
        Back to the ward
      </Link>
    </main>
  );
}
