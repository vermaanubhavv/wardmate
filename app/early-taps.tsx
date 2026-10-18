"use client";

import { useEffect } from "react";

/**
 * A tap that lands before the page's JavaScript has run is otherwise lost: the server-rendered
 * button is on screen, but nothing is listening yet. On a slow phone at 7am that window is
 * seconds long, and the resident taps "Type" or a tick and nothing happens.
 *
 * EARLY_TAPS_SCRIPT (./early-taps-script.ts) runs inline as the HTML parses. It holds the latest tap on a button React
 * will own, and <EarlyTapsReplay/> replays it once that button is actually hydrated. Links,
 * form submits, <summary> and native inputs already work without JavaScript, so they are left
 * alone.
 */
type EarlyWindow = Window & { __wmTap?: { el: HTMLElement; at: number } | null; __wmReady?: boolean };

export default function EarlyTapsReplay() {
  useEffect(() => {
    const w = window as EarlyWindow;
    w.__wmReady = true;
    const tap = w.__wmTap;
    w.__wmTap = null;
    // A tap older than this was probably given up on; replaying it would surprise the resident.
    if (!tap || Date.now() - tap.at > 8000) return;
    let tries = 0;
    const replay = () => {
      if (!tap.el.isConnected) return;
      // React marks a hydrated node with its props; a button inside a still-streaming boundary
      // has none yet, so wait for it rather than clicking a dead element.
      if (Object.keys(tap.el).some((k) => k.startsWith("__reactProps$"))) tap.el.click();
      else if (++tries < 100) setTimeout(replay, 50);
    };
    replay();
  }, []);
  return null;
}
