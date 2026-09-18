import { describe, it, expect } from "vitest";
import { getTree, listTrees, suggestTrees } from "../trees";

describe("tree registry", () => {
  it("lists fever as the newest version and resolves it by id and version", () => {
    const trees = listTrees();
    expect(trees.map((t) => t.id)).toContain("fever");
    expect(getTree("fever")?.version).toBe("1.0.0");
    expect(getTree("fever", "1.0.0")?.id).toBe("fever");
    expect(getTree("fever", "9.9.9")).toBeNull();
    expect(getTree("abdominal_pain")).toBeNull();
  });
});

describe("suggestTrees", () => {
  it("suggests fever from a dictated chief complaint", () => {
    expect(suggestTrees(["fever since 5 days", "vomiting x 2 days"]).map((t) => t.id)).toEqual(["fever"]);
    expect(suggestTrees(["Febrile illness"]).map((t) => t.id)).toEqual(["fever"]);
  });

  it("does not suggest from a negated mention, an unrelated complaint, or nothing at all", () => {
    expect(suggestTrees(["no fever, pain abdomen x 3 days"])).toEqual([]);
    expect(suggestTrees(["afebrile, pain abdomen"])).toEqual([]);
    expect(suggestTrees(["pain abdomen x 3 days"])).toEqual([]);
    expect(suggestTrees([])).toEqual([]);
  });

  it("does not match inside another word", () => {
    expect(suggestTrees(["feverishness"])).toEqual([]);
  });
});
