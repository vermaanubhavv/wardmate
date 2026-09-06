"use client";

import { useEffect, useState } from "react";
import { ShareIcon, AddToHomeIcon } from "./icons";
import Mark from "./mark";

/**
 * Told, on the sign-in screen, to install before signing in.
 *
 * The order matters and it is not cosmetic. Safari and the home-screen app keep separate
 * cookies, so a doctor who signs in inside the browser tab and *then* adds the app to their
 * home screen opens it to the sign-in screen again — the same screen they thought they had
 * finished with. Half of them conclude it is broken. Installing first means the one sign-in
 * they do is the one the app keeps.
 *
 * Three numbered steps with the real icons beside them, rather than a paragraph: this is read
 * once, on a phone, by somebody who has not decided yet whether this app is worth the trouble.
 * The Share glyph is drawn to match the one in Safari's toolbar so the instruction can be
 * followed by shape rather than by name.
 *
 * Shown only in a browser tab: once the app is running from the home screen, standalone is
 * true and this disappears on its own.
 */
export default function InstallHint() {
  const [show, setShow] = useState(false);
  const [ios, setIos] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      // iOS's own flag, which predates the standard one and is still what older iPhones set.
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;

    setIos(/iphone|ipad|ipod/i.test(window.navigator.userAgent));
    setShow(!standalone);
  }, []);

  if (!show) return null;

  return (
    <section className="ios-group p-5">
      <p className="text-[17px] font-semibold">Put WardMate on your home screen</p>
      <p className="mt-1 text-[15px] text-muted leading-snug">
        Takes ten seconds, and it works better than the browser. Do this before you sign in.
      </p>

      <ol className="mt-4 flex flex-col gap-4">
        <Step
          n={1}
          icon={<ShareIcon className="h-[18px] w-[18px]" />}
          text={
            ios ? (
              <>
                Tap <span className="font-medium text-foreground">Share</span> — this button, at
                the bottom of the screen.
              </>
            ) : (
              <>
                Open your browser&rsquo;s <span className="font-medium text-foreground">menu</span>{" "}
                — the three dots in the corner.
              </>
            )
          }
        />
        <Step
          n={2}
          icon={<AddToHomeIcon className="h-[18px] w-[18px]" />}
          text={
            ios ? (
              <>
                Scroll down the list and choose{" "}
                <span className="font-medium text-foreground">Add to Home Screen</span>, then{" "}
                <span className="font-medium text-foreground">Add</span>.
              </>
            ) : (
              <>
                Choose <span className="font-medium text-foreground">Install app</span>, or{" "}
                <span className="font-medium text-foreground">Add to Home screen</span>.
              </>
            )
          }
        />
        <Step
          n={3}
          icon={<Mark className="h-[18px] w-[18px]" />}
          text={
            <>
              Open WardMate from the new icon, and sign in{" "}
              <span className="font-medium text-foreground">there</span>.
            </>
          }
        />
      </ol>

      <p className="mt-4 text-[13px] text-muted leading-snug">
        Signing in on this screen only signs you in inside the browser — the home-screen app
        would still ask again.
      </p>
    </section>
  );
}

/** A numbered row: the step's count, the icon it refers to, and the sentence. */
function Step({ n, icon, text }: { n: number; icon: React.ReactNode; text: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-px grid h-6 w-6 shrink-0 place-items-center rounded-full bg-chip text-[13px] font-semibold tabular-nums">
        {n}
      </span>
      <span className="mt-0.5 shrink-0 text-accent">{icon}</span>
      <span className="text-[15px] text-muted leading-snug">{text}</span>
    </li>
  );
}
