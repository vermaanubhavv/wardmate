import { ImageResponse } from "next/og";
import { MARK_BEAD, MARK_DOTS, MARK_RING } from "@/app/mark";

/** The card a link to /home unfurls into on WhatsApp, X and the rest. */
export const alt = "WardMate — Say the round once";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          background: "#0b7f79",
          color: "#ffffff",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 48 }}>
          <svg width="84" height="84" viewBox="0 0 100 100" fill="#ffffff">
            <path d={MARK_RING} />
            <circle {...MARK_BEAD} />
            {MARK_DOTS.map((cx) => (
              <circle key={cx} cx={cx} cy="50" r="5.5" />
            ))}
          </svg>
          wardmate
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 112, letterSpacing: -3, lineHeight: 1 }}>Say the round once.</div>
          <div style={{ fontSize: 36, opacity: 0.85 }}>
            A spoken ward round, turned into the unit&rsquo;s paperwork.
          </div>
        </div>
      </div>
    ),
    size,
  );
}
