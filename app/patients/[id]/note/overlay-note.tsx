import type { FormZone, FormZoneRole } from "@/lib/read-form-layout";
import type { ProgressNote } from "@/lib/progress-note";

/**
 * The generated note printed onto a photograph of the unit's own form, in the boxes
 * lib/read-form-layout.ts found on it. Best-effort by nature — see that file's own comment
 * about why a tilted phone photo cannot give pixel-perfect boxes, and lib/formats.ts, where a
 * straighter photo replaces this one with no code change needed.
 *
 * Positioning is percentage-based against the image's own box, not the print page's, so it
 * holds together at any paper size or zoom level — the numbers from read-form-layout.ts are
 * themselves fractions of the image for exactly this reason.
 */
export default function OverlayNote({
  note,
  formatUrl,
  zones,
}: {
  note: ProgressNote;
  formatUrl: string;
  zones: FormZone[];
}) {
  const byRole = new Map<FormZoneRole, FormZone>(zones.map((z) => [z.role, z]));
  const content = contentByRole(note);

  // Who is rounding applies to the whole sheet below it, not to whichever column it happened to
  // land in — so it is not one of the detected boxes at all. It sits directly above wherever
  // the table body (Date & Time / Observation / Investigation) actually starts on THIS form,
  // running the full width and crossing column boundaries on purpose. Anchored to the topmost
  // of the three body zones, whichever the layout actually found.
  const bodyTop = Math.min(
    ...(["date_time", "observation", "plan"] as const)
      .map((r) => byRole.get(r)?.y)
      .filter((y): y is number => y !== undefined)
  );

  return (
    <div className="relative w-full">
      {/* eslint-disable-next-line @next/next/no-img-element -- a private, ward-scoped signed
          URL; next/image's remote-pattern config has no reason to know about it. */}
      <img src={formatUrl} alt="Unit's progress note form" className="block w-full" />

      {Number.isFinite(bodyTop) && (
        <p
          className="absolute left-0 w-full -translate-y-full whitespace-pre-line border-b-2 border-black pb-0.5 text-center font-bold text-black underline"
          style={{ top: `${bodyTop * 100}%`, fontSize: "0.72rem" }}
        >
          {note.caseSeenBy}
        </p>
      )}

      {[...byRole.entries()].map(([role, z]) => {
        const text = content[role];
        if (!text) return null;
        return (
          <div
            key={role}
            className="absolute overflow-visible whitespace-pre-line text-black"
            style={{
              // A small inset rather than the box's own edge — insurance against a box that
              // starts a hair early and lands the first character on the printed label. Costs
              // a little writable width; worth it, since text touching a label is illegible
              // and a slightly narrower line wrapping is not.
              left: `calc(${z.x * 100}% + 2px)`,
              top: `calc(${z.y * 100}% + 1px)`,
              width: `calc(${z.width * 100}% - 4px)`,
              height: `${z.height * 100}%`,
              fontSize: role === "observation" || role === "plan" ? "0.62rem" : "0.7rem",
              lineHeight: 1.25,
            }}
          >
            {text}
          </div>
        );
      })}
    </div>
  );
}

function contentByRole(note: ProgressNote): Partial<Record<FormZoneRole, string>> {
  return {
    name: note.header.name,
    uhid: note.header.uhid ?? undefined,
    age: note.header.age || undefined,
    sex: note.header.sex || undefined,
    doa: note.header.doa,
    unit: note.header.unit ?? undefined,
    bed: note.header.bed,
    ipd: note.header.ipd ?? undefined,
    date_time: note.dateTime,
    // Deliberately not mapped: diagnosis is now the second of the two fixed opening lines
    // inside "observation" itself (see lib/progress-note.ts), so a form with its own separate
    // diagnosis box would otherwise print it twice.
    observation: note.observation.length > 0 ? note.observation.join("\n") : undefined,
    plan: note.plan.length > 0 ? note.plan.join("\n") : undefined,
    // Deliberately no signature text — that box exists so a human signs it, and printing
    // anything into it would defeat the one thing the disclaimer insists on.
  };
}
