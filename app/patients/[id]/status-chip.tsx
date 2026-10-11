/**
 * The small rounded status chip. Deliberately NOT a client module: server components (the Learn
 * history and examination pages) call it directly, and a function exported from a "use client"
 * file cannot be called on the server — that crashed every Learn page once card-kit became a
 * client module. card-kit re-exports it for client callers.
 */
/** The small grey/teal/amber status pill shown beside a section title. */
export function statusChip(text: string, tone: "ok" | "warn" | "muted") {
  return (
    <span
      className={
        "shrink-0 rounded-full px-2 py-0.5 text-caption2 font-medium " +
        (tone === "ok"
          ? "bg-accent/10 text-accent"
          : tone === "warn"
            ? "bg-warn-bg text-warn-fg"
            : "bg-chip text-muted")
      }
    >
      {text}
    </span>
  );
}
