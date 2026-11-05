"use client";

import { usePathname } from "next/navigation";
import { Chip } from "@/app/admin/ui";

/**
 * The sub-nav across the top of every admin screen. A plain scrollable row of links — the
 * console has more tabs than fit on a phone, so it scrolls sideways rather than wrapping.
 */
const TABS: { href: string; label: string }[] = [
  { href: "/admin", label: "Insights" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/wards", label: "Units" },
  { href: "/admin/waitlist", label: "Waitlist" },
  { href: "/admin/usage", label: "Feature usage" },
  { href: "/admin/friction", label: "Friction" },
  { href: "/admin/activity", label: "Activity log" },
  { href: "/admin/events", label: "Events" },
  { href: "/admin/feedback", label: "Feedback" },
  { href: "/admin/shorthand", label: "Shorthand" },
];

export default function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="-mx-4 mt-3 overflow-x-auto px-4">
      <div className="flex gap-1.5 whitespace-nowrap pb-1">
        {TABS.map((t) => {
          const active = t.href === "/admin" ? pathname === "/admin" : pathname.startsWith(t.href);
          return (
            <Chip key={t.href} href={t.href} active={active}>
              {t.label}
            </Chip>
          );
        })}
      </div>
    </nav>
  );
}
