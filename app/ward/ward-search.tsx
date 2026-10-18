"use client";

import { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";

/**
 * The ward's navigation bar, with "Bed or name" folded into it: the brand and a search icon
 * until the icon is tapped, then a search field across the bar with Cancel, the way iOS does
 * it. The search box used to sit above the list on every visit, taking a full row from the
 * patients to serve the few times someone searches.
 *
 * The field filters the server-rendered rows of the list with this id in place, by the
 * `data-search` each row carries. Nothing is fetched; the list is already all here. Rows a
 * later server refresh puts in the list are filtered too, so a search in progress never shows
 * a patient it should be hiding.
 */
export default function WardSearch({
  listId,
  brand,
  trailing,
}: {
  listId: string;
  brand: React.ReactNode;
  trailing: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [shown, setShown] = useState<number | null>(null);
  const input = useRef<HTMLInputElement | null>(null);

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

  useEffect(() => {
    if (open) input.current?.focus();
  }, [open]);

  if (!open) {
    return (
      <>
        {brand}
        <div className="-mr-2.5 flex items-center">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Search by bed or name"
            className="grid h-11 w-11 place-items-center text-accent active:opacity-60"
          >
            <Search className="h-[21px] w-[21px]" strokeWidth={2.1} />
          </button>
          {trailing}
        </div>
      </>
    );
  }

  return (
    <div className="flex w-full flex-col gap-1 py-1">
      <div className="flex items-center gap-2">
        <input
          ref={input}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Bed or name"
          aria-label="Search by bed or name"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          className="h-9 min-w-0 flex-1 rounded-[10px] bg-fill-tertiary px-3 text-body outline-none"
        />
        <button
          type="button"
          onClick={() => {
            setQuery("");
            setOpen(false);
          }}
          className="tap shrink-0 text-body text-accent"
        >
          Cancel
        </button>
      </div>
      {shown === 0 && (
        <p className="px-1 text-footnote text-muted">No bed or name matches &ldquo;{query.trim()}&rdquo;.</p>
      )}
    </div>
  );
}
