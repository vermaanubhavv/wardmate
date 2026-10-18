"use client";

import { useCallback } from "react";

/**
 * A ref that publishes its element's real height as a CSS variable on the page root, for as
 * long as the element is on screen, and removes it (falling back to the stylesheet's default)
 * when it goes.
 *
 * For the bars that float over a page. A page reserves room for a floating bar with padding,
 * and a fixed guess at the bar's height was wrong the moment a bar grew a line: the patient
 * page's "Still to cover" line made its bar taller than the 7.5rem reserved, so the last card
 * on the page sat behind it, unreachable. Measured, the reservation is always the bar.
 *
 * `extra` is added to the height (breathing room above a bottom bar). `alsoSet` are fixed
 * variables set alongside it — pass a module constant, so the ref stays stable.
 */
export function usePublishedHeight(
  name: string,
  extra = 0,
  alsoSet: Record<string, string> = NONE
) {
  return useCallback(
    (el: HTMLElement | null) => {
      if (!el) return;
      const root = document.documentElement.style;
      const publish = () => root.setProperty(name, `${Math.ceil(el.offsetHeight) + extra}px`);
      publish();
      for (const [k, v] of Object.entries(alsoSet)) root.setProperty(k, v);
      const observer = new ResizeObserver(publish);
      observer.observe(el);
      return () => {
        observer.disconnect();
        root.removeProperty(name);
        for (const k of Object.keys(alsoSet)) root.removeProperty(k);
      };
    },
    [name, extra, alsoSet]
  );
}

const NONE: Record<string, string> = {};
