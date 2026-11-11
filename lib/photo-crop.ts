/** A box on a photograph: fractions of the full image, top-left origin — see patch 0116. */
export type PhotoRegion = { x: number; y: number; width: number; height: number };

/** Only a box that lies on the image with some size counts; anything else reads as "no region". */
export function asRegion(value: unknown): PhotoRegion | null {
  if (!value || typeof value !== "object") return null;
  const r = value as Record<string, unknown>;
  const n = (k: string) => (typeof r[k] === "number" && Number.isFinite(r[k]) ? (r[k] as number) : null);
  const x = n("x"), y = n("y"), width = n("width"), height = n("height");
  if (x === null || y === null || width === null || height === null) return null;
  if (width <= 0 || height <= 0 || x < 0 || y < 0 || x + width > 1.001 || y + height > 1.001) return null;
  return { x, y, width, height };
}

/**
 * Show just `region` of an image inside a box, with CSS alone: the image becomes the box's
 * background, scaled so the region fills it, positioned so the region's corner is the box's
 * corner. A little margin around the box is added so a tight box still shows the line's
 * neighbours — a value is checked by where it sits, not only by its own digits.
 */
export function cropStyle(src: string, region: PhotoRegion, margin = 0.15): React.CSSProperties {
  const padX = region.width * margin;
  const padY = region.height * margin;
  const x = Math.max(0, region.x - padX);
  const y = Math.max(0, region.y - padY);
  const w = Math.min(1 - x, region.width + 2 * padX);
  const h = Math.min(1 - y, region.height + 2 * padY);
  // background-position in % places the point x% across the image at x% across the box; the
  // conversion below is that identity solved for the region's top-left.
  const pos = (start: number, size: number) => (size >= 1 ? 0 : (start / (1 - size)) * 100);
  return {
    backgroundImage: `url("${src}")`,
    backgroundSize: `${(1 / w) * 100}% ${(1 / h) * 100}%`,
    backgroundPosition: `${pos(x, w)}% ${pos(y, h)}%`,
    backgroundRepeat: "no-repeat",
    aspectRatio: `${w} / ${h}`,
  };
}
