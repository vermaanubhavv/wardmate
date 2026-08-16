import Link from "next/link";
import { getCurrentWard } from "@/lib/ward";
import { FORMAT_KINDS, getWardFormats } from "@/lib/formats";
import FormatSlot from "./format-slot";

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
        <h1 className="text-2xl font-semibold">Formats</h1>
        <p className="mt-4 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          {error ? `Could not read the database: ${error.message}` : "No ward found."}
        </p>
      </main>
    );
  }

  const held = await getWardFormats(ward.id);

  return (
    <div className="flex-1 flex flex-col max-w-md mx-auto w-full">
      <header className="px-6 pt-8 pb-4">
        <Link href="/" className="text-sm text-muted underline underline-offset-4">
          ← Ward
        </Link>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight">Formats</h1>
        <p className="mt-0.5 text-sm text-muted">
          How {ward.name} writes its paperwork. Photograph a blank form or upload a file —
          images and PDFs.
        </p>
      </header>

      <section className="px-6 pb-16 flex flex-col gap-3">
        {/* All five shown whether filled or not: an empty slot says the app has not been told
            how this unit writes that document, which is worth seeing. */}
        {FORMAT_KINDS.map((k) => (
          <FormatSlot
            key={k.kind}
            wardId={ward.id}
            kind={k.kind}
            label={k.label}
            hint={k.hint}
            current={held.get(k.kind) ?? null}
          />
        ))}

        <p className="mt-2 text-xs text-muted leading-relaxed">
          These are stored for the unit to refer to. Nothing the app writes follows them yet —
          the discharge brief is still assembled in its own layout.
        </p>
      </section>
    </div>
  );
}
