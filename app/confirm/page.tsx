import Link from "next/link";
import { getCurrentWard } from "@/lib/ward";
import { getWardPendingConfirmations } from "@/lib/confirm-queue";
import ConfirmQueue from "./confirm-queue";

/**
 * The end-of-round pass: every dictated value still waiting to be checked, across the whole
 * unit, cleared from one screen instead of opening each patient in turn. Same confirm / edit /
 * discard as the patient page's own "Confirm dictation" card.
 */
export default async function ConfirmPage() {
  const { ward, error } = await getCurrentWard();

  if (error || !ward) {
    return (
      <main className="mx-auto w-full max-w-md flex-1 px-6 py-10">
        <h1 className="ios-large-title">Confirm</h1>
        <p className="mt-4 ios-group px-4 py-3 text-[15px] text-orange-700">
          {error ? `Could not read the database: ${error.message}` : "No ward found."}
        </p>
      </main>
    );
  }

  const items = await getWardPendingConfirmations(ward.id);

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
      <header className="px-6 pb-4 pt-8">
        <Link href="/ward" className="text-[17px] text-accent">
          ‹ Ward
        </Link>
        <h1 className="mt-3 ios-large-title">Confirm dictations</h1>
        <p className="mt-1 text-[15px] text-muted">
          {items.length > 0
            ? `${items.length} value${items.length === 1 ? "" : "s"} across the unit. Tick and accept, or open one to correct it.`
            : "The values a mis-hearing could get wrong — numbers, drugs, beds — from every patient at once."}
        </p>
      </header>

      <ConfirmQueue items={items} />
    </div>
  );
}
