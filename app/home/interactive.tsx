"use client";

/**
 * The hands-on pieces of /home. Each one lets a visitor do the thing the section is about,
 * instead of reading about it: triage a round, flip through the app. (The scattered sources
 * merging into one is pure CSS, scrubbed by scroll, in landing.css.)
 *
 * Movement uses the browser's own View Transitions (elements with the same
 * view-transition-name morph between states). Browsers without it, and anyone who has asked
 * for reduced motion, just get the new state instantly.
 */

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { flushSync } from "react-dom";

function transition(update: () => void) {
  const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown };
  if (!doc.startViewTransition || matchMedia("(prefers-reduced-motion: reduce)").matches) {
    update();
    return;
  }
  doc.startViewTransition(() => flushSync(update));
}

const vt = (name: string, extra: CSSProperties = {}) => ({ viewTransitionName: name, ...extra }) as CSSProperties;

function Segmented({
  options,
  value,
  onChange,
  label,
}: {
  options: readonly string[];
  value: number;
  onChange: (i: number) => void;
  label: string;
}) {
  return (
    <div role="tablist" aria-label={label} className="inline-flex rounded-[12px] border border-line bg-card p-1 shadow-sm">
      {options.map((o, i) => (
        <button
          key={o}
          type="button"
          role="tab"
          aria-selected={value === i}
          onClick={() => value !== i && onChange(i)}
          className={`rounded-[9px] px-4 py-2 text-[14px] font-semibold transition-colors ${
            value === i ? "bg-accent text-accent-ink shadow-[0_6px_16px_-8px_var(--accent)]" : "text-muted hover:text-foreground"
          }`}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

/* ---------------- a round, re-sorted by urgency ---------------- */

type Line = readonly [bed: string, who: string, body: string, critical: boolean];

export function TriageDemo({ lines }: { lines: readonly Line[] }) {
  const [triaged, setTriaged] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Show the re-sort once, by itself, the first time the list is properly on screen — so a
  // visitor who never taps anything still sees the point. The button replays it.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let timer: ReturnType<typeof setTimeout>;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        timer = setTimeout(() => transition(() => setTriaged(true)), 900);
      },
      { threshold: 0.7 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      clearTimeout(timer);
    };
  }, []);

  const shown = triaged ? lines : [...lines].sort((a, b) => Number(a[0]) - Number(b[0]));

  return (
    <div ref={ref}>
      <Segmented
        label="Sort the round"
        options={["Bed order", "Triaged"]}
        value={triaged ? 1 : 0}
        onChange={(i) => transition(() => setTriaged(i === 1))}
      />
      <div className="mt-4 flex flex-col gap-3">
        {shown.map(([bed, who, body, critical]) => (
          <div
            key={bed}
            className={`wm-card flex gap-3 rounded-[14px] px-4 py-4 ${critical ? "bg-critical-bg" : "ios-group"}`}
            style={vt(`bed-${bed}`, critical ? { boxShadow: "inset 0 0 0 1px var(--critical-fg)" } : {})}
          >
            <span
              className={`grid h-8 w-8 shrink-0 place-items-center rounded-[9px] font-mono text-[13px] font-semibold ${
                critical ? "bg-critical-fg text-white" : "bg-chip text-muted"
              }`}
            >
              {bed}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[14.5px] font-semibold">{who}</p>
                {critical && (
                  <span className="shrink-0 rounded-[5px] bg-critical-fg px-2 py-0.5 text-[10.5px] font-bold text-white">
                    CRITICAL
                  </span>
                )}
              </div>
              <p className={`mt-1 text-[13.5px] leading-snug ${critical ? "font-medium text-critical-fg" : "text-muted"}`}>{body}</p>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-3 text-[13px] text-muted" aria-live="polite">
        {triaged
          ? "Most urgent first: the unsettled fever goes to the top. Ready to copy for WhatsApp."
          : "In bed order, the fever sits at the bottom of the list."}
      </p>
    </div>
  );
}

/* ---------------- a tour of the app, one screen at a time ---------------- */

type Screen = readonly [src: string, title: string, alt: string, blurb: string];

export function ScreenTour({ screens }: { screens: readonly Screen[] }) {
  const [active, setActive] = useState(0);

  return (
    <div className="grid items-center gap-8 lg:grid-cols-[1fr_auto] lg:gap-14">
      <div>
        <div role="tablist" aria-label="App screens" className="grid grid-cols-3 gap-2 lg:grid-cols-1 lg:gap-3">
          {screens.map(([src, title, , blurb], i) => (
            <button
              key={src}
              type="button"
              role="tab"
              aria-selected={active === i}
              onClick={() => setActive(i)}
              onMouseEnter={() => setActive(i)}
              className={`rounded-[14px] border px-3 py-3 text-left transition-all lg:px-5 lg:py-4 ${
                active === i
                  ? "border-accent bg-card shadow-[0_16px_36px_-22px_var(--accent)]"
                  : "border-line bg-card/50 hover:bg-card"
              }`}
            >
              <span className="flex items-center gap-2">
                <span
                  className={`hidden h-6 w-6 shrink-0 place-items-center rounded-full font-mono text-[12px] font-semibold lg:grid ${
                    active === i ? "bg-accent text-accent-ink" : "bg-chip text-muted"
                  }`}
                >
                  {i + 1}
                </span>
                <span className={`text-[13.5px] font-semibold lg:text-[16px] ${active === i ? "text-accent" : ""}`}>{title}</span>
              </span>
              <span className="mt-1.5 hidden text-[14px] leading-snug text-muted lg:block">{blurb}</span>
            </button>
          ))}
        </div>
        <p className="mt-3 min-h-[3em] text-[14.5px] leading-snug text-muted lg:hidden">{screens[active][3]}</p>
      </div>

      {/* All three stacked in one grid cell and cross-faded, so switching is instant. */}
      <div className="mx-auto grid w-full max-w-[280px] lg:max-w-[300px]">
        {screens.map(([src, , alt], i) => (
          // eslint-disable-next-line @next/next/no-img-element -- fixed marketing asset
          <img
            key={src}
            src={src}
            alt={alt}
            aria-hidden={active !== i}
            className={`w-full rounded-[20px] ring-1 ring-black/5 shadow-[0_30px_60px_-26px_rgba(0,0,0,0.4)] transition-all duration-500 [grid-area:1/1] ${
              active === i ? "opacity-100 scale-100" : "pointer-events-none opacity-0 scale-[0.97]"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
