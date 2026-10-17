"use client";

import { useEffect, useState } from "react";

/**
 * "Bed or name" — filters the server-rendered rows of the list with this id in place, by the
 * `data-search` each row carries. Nothing is fetched; the list is already all here. Rows a
 * later server refresh puts in the list are filtered too, so a search in progress never shows
 * a patient it should be hiding.
 */
export default function WardSearch({ listId }: { listId: string }) {
  const [query, setQuery] = useState("");
  const [shown, setShown] = useState<number | null>(null);

  useEffect(() => {
    const list = document.getElementById(listId);
    if (!list) return;
    const apply = () => {
      const q = query.trim().toLowerCase();
      let count = 0;
      list.querySelectorAll<HTMLElement>(":scope > li").forEach((li) => {
        const match = !q || (li.dataset.search ?? "").includes(q);
        li.hidden = !match;
        if (match) count++;
      });
      setShown(q ? count : null);
    };
    apply();
    const observer = new MutationObserver(apply);
    observer.observe(list, { childList: true });
    return () => observer.disconnect();
  }, [listId, query]);

  return (
    <>
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Bed or name"
        aria-label="Search by bed or name"
        className="mb-2 h-11 w-full rounded-[10px] border border-line bg-card px-3 text-subhead outline-none focus:border-accent"
      />
      {shown === 0 && (
        <p className="ios-group mb-2 px-4 py-6 text-center text-subhead text-muted">
          No bed or name matches &ldquo;{query.trim()}&rdquo;.
        </p>
      )}
    </>
  );
}
