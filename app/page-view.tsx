"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { track } from "@/lib/track";

/**
 * One `page_view` event per screen the signed-in doctor opens. Mounted once in the root
 * layout. This is what lets the admin console see which screens get used and where a flow is
 * abandoned (e.g. `/patients/x/discharge` opened but no discharge ever finalised).
 *
 * Public screens are skipped — a signed-out visitor on /login or /waitlist has no session, so
 * the event would be dropped server-side anyway; not sending it keeps their page quiet.
 */
const SKIP = ["/login", "/waitlist", "/auth", "/register", "/api"];

export default function PageView() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || SKIP.some((p) => pathname.startsWith(p))) return;
    // Collapse the many uuid-bearing routes so the summary stays readable.
    const normalised = pathname.replace(
      /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi,
      ":id"
    );
    track("page_view", { screen: normalised }, { path: pathname });
  }, [pathname]);

  return null;
}
