import { redirect } from "next/navigation";

/**
 * The original admin dashboard lived here (patch 0065). It is now one tab of the wider console
 * — richer per-unit activity, not just head-count — so this URL just forwards there. Kept so
 * any existing bookmark still lands somewhere useful.
 */
export default function AdminUnitsPage() {
  redirect("/admin/wards");
}
