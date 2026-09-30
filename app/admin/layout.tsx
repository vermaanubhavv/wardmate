import Link from "next/link";
import { getUser } from "@/lib/auth";
import { isCurrentUserAdmin } from "@/lib/admin";
import AdminNav from "./nav";

/**
 * The frame around every admin screen: a back link to the ward, the title, and the sub-nav.
 *
 * The database is the gate — every RPC the child pages call (patch 0068) returns nothing
 * unless `profiles.is_admin` is true. This layout asks the same question once so a non-admin
 * is told so plainly, rather than shown nine tabs of "nothing to show yet".
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const [user, isAdmin] = await Promise.all([getUser(), isCurrentUserAdmin()]);

  return (
    <main className="flex-1 px-4 py-6 max-w-3xl mx-auto w-full pb-24">
      <div className="flex items-center gap-1 pb-1">
        <Link href="/unit" className="tap flex min-h-11 items-center text-subhead text-accent active:opacity-60">
          ‹ Unit
        </Link>
      </div>
      <h1 className="ios-large-title">Admin console</h1>
      <p className="mt-1 text-footnote text-muted">
        {!user
          ? "Sign in to view."
          : !isAdmin
            ? "This sign-in is not an admin. Nothing here is available to it."
            : "How WardMate is being used, where people get stuck, and what to fix next."}
      </p>

      {user && isAdmin && <AdminNav />}
      {user && isAdmin ? children : null}
    </main>
  );
}
