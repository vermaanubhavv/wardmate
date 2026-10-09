import { describe, expect, it } from "vitest";
import { wordsToDigits } from "@/lib/corrections";

// The expression app/patients/[id]/entry-card.tsx uses to read the figure out of a spoken day
// ("post-op day four" -> 4) when extraction stored no value_num.
const readNumber = (text: string) => {
  const digits = wordsToDigits(text.replace(/[^\w\s-]/g, " ")).match(/\d+/);
  return digits ? Number(digits[0]) : null;
};

describe("reading the day out of a spoken day", () => {
  it.each([
    ["post-op day four", 4],
    ["Post-op day Four.", 4],
    ["day twenty one", 21],
    ["day twenty-one, stable", 21],
    ["POD 3", 3],
    ["day 12 of admission", 12],
    ["day zero", 0],
    ["day thirty", 30],
    ["post op day eleven", 11],
  ])("%s -> %s", (text, n) => expect(readNumber(text)).toBe(n));

  it("is null when no figure was said — never a guess", () => {
    expect(readNumber("post-op day")).toBeNull();
    expect(readNumber("")).toBeNull();
  });
});
