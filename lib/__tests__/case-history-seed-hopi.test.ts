import { describe, expect, it } from "vitest";
import { seedHopi } from "../case-history";

describe("seedHopi", () => {
  it("keeps every stored row on a visible page", () => {
    const { text, dur } = seedHopi(
      [
        "Pain abdomen: (3 days) colicky, periumbilical",
        "pain abdomen: shifted to right iliac fossa",
        "Vomiting: 2 episodes, non-bilious",
        "Presenting illness: fever since yesterday",
        "Patient was well until three days ago",
        "Fever: (1 day)",
      ],
      ["Pain abdomen", "Fever"]
    );
    expect(text["Pain abdomen"]).toBe(
      "colicky, periumbilical; shifted to right iliac fossa; Vomiting: 2 episodes, non-bilious; Presenting illness: fever since yesterday; Patient was well until three days ago"
    );
    expect(dur).toEqual({ "Pain abdomen": "3 days", Fever: "1 day" });
  });
});
