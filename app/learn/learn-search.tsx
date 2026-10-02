"use client";

import { useState } from "react";

/**
 * Filters the server-rendered shelf in place by each row's `data-search`. While a query is
 * typed every <details> department opens and any group left empty hides; clearing it puts the
 * folds back as they were. Nothing is fetched — the whole shelf is already on the page.
 */
export default function LearnSearch({ rootId }: { rootId: string }) {
  const [query, setQuery] = useState("");
  const [shown, setShown] = useState<number | null>(null);

  function filter(value: string) {
    setQuery(value);
    const q = value.trim().toLowerCase();
    const root = document.getElementById(rootId);
    if (!root) return;
    let count = 0;
    root.querySelectorAll<HTMLElement>("li[data-search]").forEach((li) => {
      const match = !q || (li.dataset.search ?? "").includes(q);
      li.hidden = !match;
      if (match) count++;
    });
    root.querySelectorAll<HTMLElement>("[data-learn-group]").forEach((g) => {
      g.hidden = Boolean(q) && !g.querySelector("li[data-search]:not([hidden])");
      if (g instanceof HTMLDetailsElement) {
        if (g.dataset.wasOpen === undefined) g.dataset.wasOpen = String(g.open);
        g.open = q ? true : g.dataset.wasOpen === "true";
        if (!q) delete g.dataset.wasOpen;
      }
    });
    setShown(q ? count : null);
  }

  return (
    <>
      <input
        type="search"
        value={query}
        onChange={(e) => filter(e.target.value)}
        placeholder="Search complaints, examinations, fluids"
        aria-label="Search the Learn shelf"
        className="mb-2 h-11 w-full rounded-[10px] border border-line bg-card px-3 text-subhead outline-none focus:border-accent"
      />
      {shown === 0 && (
        <p className="ios-group mb-2 px-4 py-6 text-center text-subhead text-muted">
          Nothing matches &ldquo;{query.trim()}&rdquo;.
        </p>
      )}
    </>
  );
}
