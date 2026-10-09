"use client";

import { useCopy } from "../use-copy";

/**
 * The invite, as a message rather than a code to read aloud across a ward.
 *
 * Reading eight characters over the noise of a round is where joining actually fails, so the
 * code is wrapped in the sentence a colleague needs to act on it — unit name, code, where to
 * go. The share sheet is the phone's own, which puts WhatsApp first on every phone this runs
 * on; where there is no share sheet (desktop Chrome) it falls back to the clipboard, and if
 * even that is refused the code is still on screen above to type.
 *
 * The link is the plain site, deliberately not a code-carrying URL: signing in redirects, a
 * code in the address would be lost on the way through, and a link that silently fails to
 * prefill is worse than one that never promised to.
 */
export default function InviteShare({ unitName, code }: { unitName: string; code: string }) {
  const [state, copy] = useCopy(4000);

  const message =
    `Join ${unitName} on WardMate.\n\n` +
    `Open https://wardmate.in, sign in, and enter this unit code:\n${code}`;

  async function share() {
    if (navigator.share) {
      try {
        await navigator.share({ text: message });
        return;
      } catch {
        // Cancelled or unavailable — fall through to the clipboard rather than saying nothing.
      }
    }
    await copy(message);
  }

  return (
    <>
      <button
        type="button"
        onClick={share}
        className="mt-2 w-full rounded-[10px] bg-accent px-4 py-3 text-body font-semibold text-accent-ink active:opacity-70"
      >
        Send invite
      </button>
      {state !== "idle" && (
        <p className="mt-2 text-footnote text-muted">
          {state === "copied"
            ? "Invite copied — paste it into WhatsApp."
            : "Could not copy. Read the code out instead."}
        </p>
      )}
    </>
  );
}
