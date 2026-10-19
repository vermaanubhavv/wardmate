import { describe, expect, it } from "vitest";
import { tidyIsFaithful } from "@/lib/chart-shorthand";

describe("tidyIsFaithful", () => {
  it("accepts chart shorthand built from what was said", () => {
    expect(tidyIsFaithful("RUQ tenderness", "upper abdomen is tender in the right upper abdomen")).toBe(true);
    expect(tidyIsFaithful("right liver lobe abscess", "right upper right liver lobe abscess")).toBe(true);
    expect(tidyIsFaithful("voluntary guarding", "voluntary guarding present")).toBe(true);
  });
  it("refuses a side, a negation, a number or a word nobody said", () => {
    expect(tidyIsFaithful("LUQ tenderness", "tender in the right upper abdomen")).toBe(false);
    expect(tidyIsFaithful("no guarding", "voluntary guarding present")).toBe(false);
    expect(tidyIsFaithful("guarding", "no guarding")).toBe(false);
    expect(tidyIsFaithful("abscess 5 cm", "right liver lobe abscess")).toBe(false);
    expect(tidyIsFaithful("amoebic liver abscess", "right liver lobe abscess")).toBe(false);
  });
});

describe("tidyIsFaithful sites", () => {
  it("never supplies a site", () => {
    expect(tidyIsFaithful("epigastric tenderness", "abdomen tender")).toBe(false);
    expect(tidyIsFaithful("RIF tenderness", "tender on the right side")).toBe(false);
    expect(tidyIsFaithful("epigastric tenderness", "tender in the epigastrium")).toBe(true);
  });
});
