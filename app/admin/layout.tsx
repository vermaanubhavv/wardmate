import Link from "next/link";
import { getUser } from "@/lib/auth";
import AdminNav from "./nav";

/**
 * The frame around every admin screen: a back link to the ward, the title, and the sub-nav.
 *
 * Nothing here gates access — the database does. Every RPC the child pages call (patch 0068)
 * returns an empty result unless `profiles.is_admin` is true, so a non-admin who reaches these
 * URLs sees a working page with nothing in it, indistinguishable from "no data yet". That is
 * the same choice `/admin/units` made and the same "degrade, don't crash" the app uses for a
 * missing patch.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser();

  return (
    <main className="flex-1 px-4 py-6 max-w-3xl mx-auto w-full pb-24">
      <div className="flex items-center gap-1 pb-1">
        <Link href="/ward" className="text-[15px] text-accent active:opacity-60">
          ‹ Ward
        </Link>
      </div>
      <h1 className="ios-large-title">Admin console</h1>
      <p className="mt-1 text-[13px] text-muted">
        {user ? "Cross-unit audit — adoption, activity, and friction." : "Sign in to view."}
      </p>

      {user && <AdminNav />}
      {user ? children : null}
    </main>
  );
}
