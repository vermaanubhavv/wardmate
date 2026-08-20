/**
 * The bar of actions pinned to the bottom of a screen.
 *
 * Translucent with a blur behind it and a hairline on top, the way a tab bar or toolbar sits
 * on iOS: the list scrolls *under* it and stays faintly visible rather than being hidden by a
 * solid block. The hairline is what stops it reading as a floating slab.
 *
 * It was a gradient once, transparent across its upper half, and every one of these bars
 * carries a line of text — patient cards printed straight through the words. Blur solves the
 * same problem the solid fill did, without the dead grey band.
 *
 * Callers must still reserve room for it: this floats above the page, so whatever is last on
 * the page needs bottom padding at least as tall as the bar.
 */
export default function BottomBar({ children }: { children: React.ReactNode }) {
  return (
    // relative, so a button inside can hang its message above the bar rather than widening the
    // row it sits in — an error sentence is long and the buttons beside it are 56px wide.
    <div className="bottom-bar fixed inset-x-0 bottom-0 border-t border-line/60 bg-background/80 px-4 pt-3 backdrop-blur-xl">
      <div className="relative mx-auto flex max-w-md flex-col gap-2">{children}</div>
    </div>
  );
}
