import Link from "next/link";
import { getCurrentWard, getWardSpecialtyStored } from "@/lib/ward";
import { FORMAT_KINDS, getWardFormats } from "@/lib/formats";
import FormatSlot from "./format-slot";
import { getSpecialtyPack } from "@/lib/specialty";

/**
 * The unit's own paperwork.
 *
 * Held against the ward rather than the doctor, for the same reason patients are: a resident
 * rotating out should not take the unit's formats with them.
 */
export default async function FormatsPage() {
  const { ward, error } = await getCurrentWard();

  if (error || !ward) {
    return (
      <main className="flex-1 px-6 py-10 max-w-md mx-auto w-full">
        <h1 className="ios-large-title">Formats</h1>
        <p className="mt-4 ios-group px-4 py-3 text-[15px] text-orange-700">
          {error ? `Could not read the database: ${error.message}` : "No ward found."}
        </p>
      </main>
    );
  }

  const [held, specialty] = await Promise.all([
    getWardFormats(ward.id),
    getWardSpecialtyStored(ward.id),
  ]);
  // An oncology unit has no operating theatre, so it is never shown an "OT notes" slot — an
  // empty slot is a statement that the app has not been told something, and that one would be
  // a statement about a document this unit will never have.
  const pack = getSpecialtyPack(specialty);
  const kinds = FORMAT_KINDS.filter((k) => pack.formatKinds.includes(k.kind));

  return (
    <div className="flex-1 flex flex-col max-w-md mx-auto w-full">
      <header className="px-6 pt-8 pb-4">
        <Link href="/ward" className="text-[17px] text-accent">
          ‹ Ward
        </Link>
        <h1 className="mt-3 ios-large-title">Formats</h1>
        <p className="mt-0.5 text-[15px] text-muted">
          How {ward.name} writes its paperwork. Photograph a blank form or upload a file —
          images and PDFs.
        </p>
      </header>

      <section className="px-6 pb-16 flex flex-col gap-3">
        {/* Every slot this unit can have is shown whether filled or not: an empty slot says
            the app has not been told how this unit writes that document, which is worth
            seeing. Which slots those are is the specialty's call — see lib/specialty/. */}
        {kinds.map((k) => (
          <FormatSlot
            key={k.kind}
            wardId={ward.id}
            kind={k.kind}
            label={k.label}
            hint={k.hint}
            current={held.get(k.kind) ?? null}
          />
        ))}

        <p className="mt-2 text-[13px] leading-relaxed text-muted">
          The discharge summary now follows this unit&rsquo;s own layout. Its heading is set on
          the <span className="text-foreground">Unit</span> screen. The other four are stored
          for the unit to refer to — nothing the app writes follows them yet.
        </p>
      </section>
    </div>
  );
}
