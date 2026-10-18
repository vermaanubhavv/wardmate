import ScreenHeader from "../screen-header";
import { getCurrentWard } from "@/lib/ward";
import { getWardPendingConfirmations } from "@/lib/confirm-queue";
import { createClient } from "@/lib/supabase/server";
import ConfirmQueue from "./confirm-queue";

/**
 * "To check": every value on the unit still waiting to be checked, cleared from one screen
 * instead of opening each patient in turn. Grouped by patient, with the photo a value was
 * read off shown beside it, so the check is made against the source rather than from memory.
 * See lib/confirm-queue.ts for exactly what is listed.
 */
export default async function ConfirmPage() {
  const { ward, error } = await getCurrentWard();

  if (error || !ward) {
    return (
      <main className="mx-auto w-full max-w-md flex-1">
        <ScreenHeader title="To check" />
        <p role="alert" className="mx-4 ios-group px-4 py-3 text-subhead text-warn-fg">
          {error ? "The list could not be loaded. Check the connection and try again." : "No ward found."}
        </p>
      </main>
    );
  }

  const items = await getWardPendingConfirmations(ward.id);

  // The photos, signed for an hour — the same storage and lifetime the patient page uses.
  const paths = [...new Set(items.map((i) => i.photo_path).filter((p): p is string => Boolean(p)))];
  const photos: Record<string, string> = {};
  if (paths.length > 0) {
    const supabase = await createClient();
    const { data } = await supabase.storage.from("evidence").createSignedUrls(paths, 3600);
    for (const d of data ?? []) if (d.path && d.signedUrl) photos[d.path] = d.signedUrl;
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
      <ScreenHeader
        title={items.length > 0 ? `To check · ${items.length}` : "To check"}
        subtitle={
          items.length > 0
            ? "Read each value against where it came from, then confirm it. Swipe right to confirm, left to discard."
            : "Numbers, drugs and doses waiting to be checked, from every patient at once."
        }
      />

      <ConfirmQueue items={items} photos={photos} />
    </div>
  );
}
