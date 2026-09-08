import "server-only";
import { createClient } from "@/lib/supabase/server";

/**
 * Typed reads for the admin console. Every function here calls one SECURITY DEFINER RPC from
 * patch 0068, each of which returns nothing at all unless the caller's `profiles.is_admin` is
 * true. So "not an admin" and "no data yet" look identical on screen — deliberately, the same
 * as the older `/admin/units` page: the console never reveals whether admin access exists.
 *
 * Each helper returns `{ rows, error }`. `error` is a plain string or null; the pages render it
 * in an amber box rather than throwing, matching the rest of the app.
 */

type Result<T> = { rows: T[]; error: string | null };
type Row<T> = { row: T | null; error: string | null };

async function callRows<T>(fn: string, args?: Record<string, unknown>): Promise<Result<T>> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc(fn, args);
  if (error) return { rows: [], error: error.message };
  return { rows: (data ?? []) as T[], error: null };
}

/** Whether the signed-in doctor is an admin. Used only to decide whether to show the link. */
export async function isCurrentUserAdmin(): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase.rpc("admin_check");
  return data === true;
}

export type Overview = {
  users: number;
  admins: number;
  wards_active: number;
  wards_archived: number;
  patients_active: number;
  patients_total: number;
  entries_total: number;
  voice_entries: number;
  photo_entries: number;
  round_dictations: number;
  discharges_draft: number;
  discharges_finalised: number;
  signups_7d: number;
  signups_30d: number;
  active_users_7d: number;
  active_wards_7d: number;
  events_7d: number;
};

export async function getOverview(): Promise<Row<Overview>> {
  const { rows, error } = await callRows<Overview>("admin_overview");
  return { row: rows[0] ?? null, error };
}

export type SignupWeek = { week: string; signups: number };
export const getSignupsWeekly = () => callRows<SignupWeek>("admin_signups_weekly");

export type AdminUser = {
  user_id: string;
  name: string | null;
  email: string | null;
  is_admin: boolean;
  joined_at: string;
  wards: number;
  patients_added: number;
  entries: number;
  voice_entries: number;
  round_dictations: number;
  discharges: number;
  last_active: string | null;
  days_since_active: number | null;
  days_since_signup: number | null;
};
export const getUsers = () => callRows<AdminUser>("admin_users");

export type WardActivity = {
  ward_id: string;
  ward_name: string;
  join_code: string;
  specialty: string | null;
  archived: boolean;
  members: number;
  active_patients: number;
  total_patients: number;
  entries_7d: number;
  entries_30d: number;
  round_dictations_30d: number;
  round_discarded_30d: number;
  discharges_finalised: number;
  last_activity: string | null;
  days_since_activity: number | null;
};
export const getWardActivity = () => callRows<WardActivity>("admin_ward_activity");

export type FeatureUsage = { feature: string; metric: string; count: number };
export const getFeatureUsage = () => callRows<FeatureUsage>("admin_feature_usage");

export type SttRow = { provider: string; model: string; entries: number; errors: number };
export const getSttBreakdown = () => callRows<SttRow>("admin_stt_breakdown");

export type Friction = {
  category: string;
  severity: "high" | "medium" | "low";
  subject: string;
  detail: string;
  since: string | null;
};
export const getFriction = () => callRows<Friction>("admin_friction");

export type ActivityRow = {
  at: string;
  actor: string;
  kind: string;
  summary: string;
  ward: string | null;
};
export const getActivityLog = (limit = 150) =>
  callRows<ActivityRow>("admin_activity_log", { p_limit: limit });

export type EventSummary = {
  name: string;
  events: number;
  actors: number;
  events_7d: number;
  first_seen: string;
  last_seen: string;
};
export const getEventSummary = () => callRows<EventSummary>("admin_event_summary");
