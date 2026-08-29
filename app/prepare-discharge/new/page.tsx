import Link from "next/link";
import OneOff from "./one-off";

export default function OneOffPage() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-6 pb-16 pt-8 print:max-w-none print:px-0">
      <div className="print:hidden">
        <Link href="/prepare-discharge" className="text-[17px] text-accent">
          ‹ Prepare discharge
        </Link>
        <h1 className="mt-3 ios-large-title text-[28px] leading-tight">One-off summary</h1>
        <p className="mt-1 text-[15px] leading-relaxed text-muted">
          For somebody who is not in WardMate. Nothing is stored — this makes a document and
          keeps no record of it.
        </p>
      </div>

      <div className="mt-6">
        <OneOff />
      </div>
    </div>
  );
}
