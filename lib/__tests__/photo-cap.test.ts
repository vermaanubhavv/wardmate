import { describe, expect, it, vi } from "vitest";
import { claimPhotoRead } from "../photo-cap";

const fake = (result: { data: unknown; error: { message: string } | null }) =>
  ({ rpc: vi.fn().mockResolvedValue(result) }) as never;

describe("claimPhotoRead", () => {
  it("lets a read through while under the cap", async () => {
    expect(await claimPhotoRead(fake({ data: true, error: null }), "w1", 5)).toBeNull();
  });
  it("refuses, naming the cap, once the ward is at it", async () => {
    expect(await claimPhotoRead(fake({ data: false, error: null }), "w1", 5)).toMatch(/5 photo reads/);
  });
  it("fails open when the counter is unreachable", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(await claimPhotoRead(fake({ data: null, error: { message: "no function" } }), "w1")).toBeNull();
  });
  it("does nothing without a ward", async () => {
    expect(await claimPhotoRead(fake({ data: false, error: null }), null)).toBeNull();
  });
});
