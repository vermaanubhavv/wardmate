import ScreenHeader from "../screen-header";
import { getCurrentWard } from "@/lib/ward";
import { getWardPendingConfirmations } from "@/lib/confirm-queue";
import ConfirmQueue from "./confirm-queue";

/**
 * The end-of-round pass over real conflicts, across the whole unit — two recordings that
 * actually disagree about the same value, cleared from one screen instead of opening each
 * patient in turn. Same confirm / edit / discard as the patient page's own "Confirm
 * dictation" card, which still shows the broader "might be misheard" set this screen no
 * longer does — see lib/confirm-queue.ts.
 */
export default async function ConfirmPage() {
  const { ward, error } = await getCurrentWard();

  if (error || !ward) {
    return (
      <main className="mx-auto w-full max-w-md flex-1">
        <ScreenHeader title="Confirm" />
        <p role="alert" className="mx-4 ios-group px-4 py-3 text-subhead text-warn-fg">
          {error ? "The queue could not be loaded. Check the connection and try again." : "No ward found."}
        </p>
      </main>
    );
  }

  const items = await getWardPendingConfirmations(ward.id);

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
      <ScreenHeader
        title="Confirm"
        subtitle={
          items.length > 0
            ? `${items.length} conflict${items.length === 1 ? "" : "s"} across the unit — two recordings disagree. Confirm each, or open one to correct it.`
            : "Two recordings disagreeing about the same value, from every patient at once."
        }
      />

      <ConfirmQueue items={items} />
    </div>
  );
}
