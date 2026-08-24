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
  // land in — so it is not one of the detected boxes at all. On the printed form the table's
  // own header row ("Date & Time / Observation / Investigation…") sits immediately above where
  // the writable body zones start, with no blank margin between them — so this cannot float
  // ABOVE the body without landing on top of that printed row, which is exactly the bug this
  // replaced. Instead it takes a fixed strip out of the TOP of the writable body itself,
  // spanning every body zone's combined width, and the body content below is pushed down by
  // that same strip's height so nothing overlaps.
  const BODY_ROLES = ["date_time", "observation", "plan"] as const;
  const bodyZones = BODY_ROLES.map((r) => byRole.get(r)).filter((z): z is FormZone => Boolean(z));
  const bannerHeightPx = 15;

  // The banner's vertical position follows Date & Time specifically, not the topmost of the
  // three — observation and plan sometimes get detected a hair higher than the row they are
  // actually in, which pulled the banner up past the row it belongs on. Falls back to the
  // topmost of whatever body zones exist when a form has no separate date_time box of its own
  // (a single-column form, or detection that missed it).
  const bannerTop = byRole.get("date_time")?.y ?? Math.min(...bodyZones.map((z) => z.y));

  const banner =
    bodyZones.length > 0
      ? {
          top: bannerTop,
          left: Math.min(...bodyZones.map((z) => z.x)),
          right: Math.max(...bodyZones.map((z) => z.x + z.width)),
        }
      : null;

  return (
    <div className="relative w-full">
      {/* eslint-disable-next-line @next/next/no-img-element -- a private, ward-scoped signed
          URL; next/image's remote-pattern config has no reason to know about it. */}
      <img src={formatUrl} alt="Unit's progress note form" className="block w-full" />

      {banner && (
        <p
          className="absolute overflow-visible whitespace-nowrap border-b border-black text-center font-bold text-black underline"
          style={{
            top: `${banner.top * 100}%`,
            left: `${banner.left * 100}%`,
            width: `${(banner.right - banner.left) * 100}%`,
            height: `${bannerHeightPx}px`,
            fontSize: "0.62rem",
            lineHeight: `${bannerHeightPx}px`,
          }}
        >
          {note.caseSeenBy}
        </p>
      )}

      {[...byRole.entries()].map(([role, z]) => {
        const text = content[role];
        if (!text) return null;
        // Body zones give up their top strip to the banner above, so their own content starts
        // that much further down — everything else (name, uhid, the header fields) is
        // unaffected, since the banner never reaches up that far.
        const pushedDown = banner && (BODY_ROLES as readonly string[]).includes(role);
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
              // Never above the banner's own bottom edge, regardless of this zone's raw y —
              // observation/plan sometimes detect a hair higher than date_time, and content
              // pushed down from ITS OWN top rather than the banner's bottom could still land
              // under the banner instead of below it.
              top: pushedDown
                ? `calc(${Math.max(z.y, banner!.top) * 100}% + ${bannerHeightPx + 2}px)`
                : `calc(${z.y * 100}% + 1px)`,
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
