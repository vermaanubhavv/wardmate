import type { FormZone, FormZoneRole } from "@/lib/read-form-layout";
import type { ProgressNote } from "@/lib/progress-note";
import { renderNoteLine } from "./note-line";

/** The two roles whose content is a list of lines, not one piece of text — everything else in
 *  contentByRole is a single value (a name, a date) and renders as plain text in one box. */
const MULTI_LINE_ROLES = new Set<FormZoneRole>(["observation", "plan"]);

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
            fontSize: "0.68rem",
            lineHeight: `${bannerHeightPx}px`,
            WebkitTextSizeAdjust: "100%",
          }}
        >
          {note.caseSeenBy}
        </p>
      )}

      {[...byRole.entries()].map(([role, z]) => {
        const isMultiLine = MULTI_LINE_ROLES.has(role);
        const text = content[role];
        const lines = role === "observation" ? note.observation : role === "plan" ? note.plan : null;
        if (isMultiLine ? !lines || lines.length === 0 : !text) return null;

        // Body zones give up their top strip to the banner above, so their own content starts
        // that much further down — everything else (name, uhid, the header fields) is
        // unaffected, since the banner never reaches up that far.
        const pushedDown = banner && (BODY_ROLES as readonly string[]).includes(role);
        // Date & Time sits in the narrowest column on the form (it wraps to 2-3 short lines:
        // "25/08/26", "02:03", "am") — mobile browsers auto-boost font size in narrow, tall
        // columns like that one more aggressively than in the wide header row, which is why it
        // was printing noticeably larger than Name/UHID next to it even though both used the
        // same fontSize here. WebkitTextSizeAdjust below stops that auto-boost; this explicit
        // smaller size on top of it brings Date & Time in line with the rest rather than just
        // matching them by accident.
        const fontSize = isMultiLine ? "0.58rem" : role === "date_time" ? "0.68rem" : "0.78rem";
        return (
          <div
            key={role}
            className="absolute overflow-visible text-black"
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
              fontSize,
              lineHeight: isMultiLine ? 1.3 : 1.35,
              // Stops mobile Safari/Chrome from silently inflating text past the size set above
              // when a box is narrow relative to the viewport — without this, the same fontSize
              // renders at different visual sizes depending on how wide the zone happens to be.
              WebkitTextSizeAdjust: "100%",
            }}
          >
            {/* Observation and Plan render as real stacked lines now, not one joined string —
                that is what lets a heading bold only itself rather than the whole block. This
                box does not grow: it is the size read-form-layout.ts measured off the actual
                photo, so packing genuine per-line spacing into it (rather than one dense block
                of text) risks running past the bottom of that box on a long day's note. Left
                overflow-visible on purpose — spilling past the edge, visibly, is the honest
                failure here, not text silently clipped out of view. */}
            {isMultiLine ? (
              <div className="whitespace-normal">
                {lines!.map((line, i) => renderNoteLine(line, i, { compact: true }))}
              </div>
            ) : (
              <span className="whitespace-pre-line">{text}</span>
            )}
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
    // observation and plan are read straight from note.observation/note.plan in the render
    // loop above, line by line, rather than joined here — that per-line structure is what lets
    // a heading bold only itself. diagnosis is deliberately not mapped at all: it is now the
    // second of the two fixed opening lines inside "observation" itself (see
    // lib/progress-note.ts), so a form with its own separate diagnosis box would otherwise
    // print it twice.
    //
    // Deliberately no signature text — that box exists so a human signs it, and printing
    // anything into it would defeat the one thing the disclaimer insists on.
  };
}
