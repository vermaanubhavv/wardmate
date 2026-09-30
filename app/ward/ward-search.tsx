"use client";

import { useState } from "react";

/**
 * "Bed or name" — filters the server-rendered rows of the list with this id in place, by the
 * `data-search` each row carries. Nothing is fetched; the list is already all here.
 */
export default function WardSearch({ listId }: { listId: string }) {
  const [query, setQuery] = useState("");
  const [shown, setShown] = useState<number | null>(null);

  function filter(value: string) {
    setQuery(value);
    const q = value.trim().toLowerCase();
    let count = 0;
    // ponytail: rows added by a later server refresh are not filtered until the next keystroke.
    document.querySelectorAll<HTMLElement>(`#${listId} > li`).forEach((li) => {
      const match = !q || (li.dataset.search ?? "").includes(q);
      li.hidden = !match;
      if (match) count++;
    });
    setShown(q ? count : null);
  }

  return (
    <>
      <input
        type="search"
        value={query}
        onChange={(e) => filter(e.target.value)}
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
