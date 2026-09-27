import Link from "next/link";
import Mark from "./mark";

/** A wrong or stale link, in the app's own voice rather than the framework's. */
export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 px-4 py-16 text-center">
      <Mark className="h-10 w-10 opacity-30" />
      <h1 className="ios-large-title">Not here</h1>
      <p className="text-subhead text-muted">
        Nothing is at this address. The patient may have been discharged, moved to Trash, or the
        link was mistyped.
      </p>
      <Link href="/ward" className="btn btn-primary mt-2 w-full">
        Back to the ward
      </Link>
    </main>
  );
}
