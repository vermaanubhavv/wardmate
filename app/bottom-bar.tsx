/**
 * The bar of actions pinned to the bottom of a screen.
 *
 * Solid rather than a gradient, with a short separate fade above it. The gradient version was
 * transparent across its upper half, and every one of these bars carries a line of text — a
 * hint, a count, "Type instead" — which sat in that transparent part. On a real ward list the
 * result was patient cards printing through the words on top of them.
 *
 * Callers must still reserve room for it in the scrolling content: this floats above the
 * page, so whatever is last on the page needs bottom padding at least as tall as the bar, or
 * the last patient cannot be read.
 */
export default function BottomBar({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed bottom-0 inset-x-0 bg-background px-4 pb-6 pt-3">
      {/* The fade, in its own strip above the solid part, so nothing can show through the
          bar itself. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-full h-8 bg-gradient-to-t from-background to-transparent"
      />
      <div className="mx-auto flex max-w-md flex-col gap-2">{children}</div>
    </div>
  );
}
