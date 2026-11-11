import { describe, expect, it } from "vitest";
import { asRegion, cropStyle } from "@/lib/photo-crop";

describe("asRegion — a box is only a box when it lies on the image", () => {
  it("accepts a sane box and rejects a guess that runs off the page or has no size", () => {
    expect(asRegion({ x: 0.1, y: 0.2, width: 0.5, height: 0.05 })).toEqual({ x: 0.1, y: 0.2, width: 0.5, height: 0.05 });
    expect(asRegion({ x: 0.8, y: 0.2, width: 0.5, height: 0.05 })).toBeNull();
    expect(asRegion({ x: 0.1, y: 0.2, width: 0, height: 0.05 })).toBeNull();
    expect(asRegion(null)).toBeNull();
    expect(asRegion({ x: "0.1", y: 0.2, width: 0.5, height: 0.05 })).toBeNull();
  });
});

describe("cropStyle — the region fills the box", () => {
  it("scales the image by the inverse of the (padded) region and positions its corner", () => {
    const s = cropStyle("p.jpg", { x: 0.25, y: 0.5, width: 0.5, height: 0.1 }, 0);
    expect(s.backgroundSize).toBe("200% 1000%");
    // x: 0.25 / (1 - 0.5) = 50%; y: 0.5 / (1 - 0.1) ≈ 55.6%
    expect(s.backgroundPosition).toBe("50% 55.55555555555556%");
    expect(s.aspectRatio).toBe("0.5 / 0.1");
  });
  it("a region at the edge is padded only inwards, never past the image", () => {
    const s = cropStyle("p.jpg", { x: 0, y: 0, width: 0.5, height: 0.2 });
    expect(s.backgroundPosition).toBe("0% 0%");
  });
});
