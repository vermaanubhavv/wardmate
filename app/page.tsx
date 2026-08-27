import Link from "next/link";
import { redirect } from "next/navigation";
import { getHomeScreen } from "@/lib/home-screen";
import { getCurrentWard } from "@/lib/ward";
import { getDoctorName } from "@/lib/auth";
import { signOut } from "./actions";
import Wordmark from "./wordmark";
import { ChevronIcon } from "./icons";

/**
 * The front door: who you are, which unit you are on, and where your patients are.
 *
 * Deliberately the whole screen and not a strip above the ward list. It is read once when the
 * app is opened and then not again, so it costs one tap on the way to a round rather than a
 * permanent band of chrome above every patient — which is the trade the ward list was just
 * cleared of.
 *
 * Every number here is a count of real rows. A location a patient has not been given is 'ward',
 * because that is the default they were created with, not because the app worked it out from
 * their bed label.
 */
export default async function Home() {
  // The greeting name is a local cookie read; the rest is one round trip. See lib/home-screen.
  const [home, googleName, { ward: currentWard, error: wardError }] = await Promise.all([
    getHomeScreen(),
    getDoctorName(),
    getCurrentWard(),
  ]);

  if (!wardError && !currentWard) redirect("/onboarding");

  // The profile is the doctor's own to set and wins when they have set it. Google's name is
  // the fallback, and neither is invented — see getDoctorName.
  const name = home.doctor.display_name?.trim() || googleName;

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line/60 bg-background/80 px-4 pb-2.5 top-bar backdrop-blur-xl">
        <Wordmark />
        <form action={signOut}>
          <button className="text-[15px] text-accent">Sign out</button>
        </form>
      </div>

      <main className="flex-1 px-4 pb-10 pt-8">
        <p className="text-[15px] text-muted">Hello</p>
        <h1 className="ios-large-title mt-0.5">
          {name ? `Dr. ${name}` : "Doctor"}
        </h1>

        {/* Designation, department and unit read as one identity, so they sit together rather
            than as three labelled rows. Anything not set is simply absent. */}
        <div className="ios-group mt-5">
          <Row label="Designation" value={home.doctor.designation} />
          <Row label="Department" value={home.doctor.department} />
          <Row label="Unit" value={home.ward?.name ?? null} />
        </div>

        <p className="ios-group-header mb-2 mt-7 px-4">Patients</p>
        <div className="ios-group">
          <CountRow label="Ward" count={home.counts.ward} />
          <CountRow label="ICU" count={home.counts.icu} />
          <CountRow label="Emergency" count={home.counts.emergency} />
        </div>

        <Link
          href="/ward"
          className="mt-6 flex items-center justify-center gap-1.5 rounded-[10px] bg-accent px-4 py-3.5 text-[17px] font-semibold text-accent-ink active:opacity-80"
        >
          {home.counts.total === 1 ? "Open the ward · 1 patient" : `Open the ward · ${home.counts.total} patients`}
          <ChevronIcon className="h-[18px] w-[18px]" />
        </Link>

        {home.unavailable ? (
          <p className="ios-group mt-6 px-4 py-3 text-[13px] leading-relaxed text-orange-800">
            These counts are not live yet — run patch{" "}
            <span className="font-mono">0023_home_screen.sql</span> in Supabase. The ward itself
            works normally in the meantime.
          </p>
        ) : (
          !home.doctor.designation && (
            <p className="mt-4 px-4 text-[13px] text-muted">
              <Link href="/unit" className="text-accent">
                Set your designation and department
              </Link>{" "}
              so this page knows who you are.
            </p>
          )
        )}
      </main>
    </div>
  );
}

/** Absent is shown as absent, never filled with a placeholder. */
function Row({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="ios-row flex items-baseline justify-between gap-3 px-4 py-2.5">
      <span className="text-[15px] text-muted">{label}</span>
      <span className={"text-[17px] " + (value ? "" : "text-muted/50")}>
        {value || "not set"}
      </span>
    </div>
  );
}

function CountRow({ label, count }: { label: string; count: number }) {
  return (
    <div className="ios-row flex items-baseline justify-between gap-3 px-4 py-2.5">
      <span className="text-[17px]">{label}</span>
      <span className="text-[17px] font-semibold tabular-nums">{count}</span>
    </div>
  );
}
