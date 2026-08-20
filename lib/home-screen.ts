import { createClient } from "@/lib/supabase/server";

export type DoctorProfile = {
  display_name: string | null;
  designation: string | null;
  department: string | null;
};

export type HomeScreen = {
  doctor: DoctorProfile;
  ward: { id: string; name: string } | null;
  counts: { ward: number; icu: number; emergency: number; total: number };
  /** True when the patch has not been run and the screen is standing on defaults. */
  unavailable: boolean;
};

const EMPTY: HomeScreen = {
  doctor: { display_name: null, designation: null, department: null },
  ward: null,
  counts: { ward: 0, icu: 0, emergency: 0, total: 0 },
  unavailable: true,
};

/**
 * The landing screen in one round trip.
 *
 * Same reasoning as lib/ward-screen.ts: from this server every query costs about the same
 * whatever it asks for, so the number of trips IS the loading time. Asked separately this would
 * be four — the profile, the ward, and a count for each location.
 *
 * Returns empty and says so rather than throwing when the function is missing, so a unit that
 * has not run patch 0023 gets a landing page with zeroes and a note, not a broken app. The ward
 * list behind it works either way.
 */
export async function getHomeScreen(): Promise<HomeScreen> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("home_screen");
    if (error || !data) return EMPTY;

    const payload = data as Partial<HomeScreen>;
    return {
      doctor: payload.doctor ?? EMPTY.doctor,
      ward: payload.ward ?? null,
      counts: payload.counts ?? EMPTY.counts,
      unavailable: false,
    };
  } catch {
    return EMPTY;
  }
}
