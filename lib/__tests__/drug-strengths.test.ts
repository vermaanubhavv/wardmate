import { describe, it, expect } from "vitest";
import { drugStrengths, strengthsFromFormulary, canonicalDrug } from "@/lib/drug-strengths";

describe("drugStrengths", () => {
  it("finds a drug by alias and form", () => {
    expect(drugStrengths("T. Pan", "Tab")).toEqual(["40 mg"]);
    expect(drugStrengths("PCM", "Inj")).toEqual(["1 g"]);
  });
  it("offers every strength when no form is set, nothing for an unknown drug", () => {
    expect(drugStrengths("ondansetron", "")).toEqual(["4 mg", "8 mg"]);
    expect(drugStrengths("unlisted drug", "Tab")).toEqual([]);
  });
});

describe("strengthsFromFormulary", () => {
  const items = [
    "Pantoprazole Caps/Tab. 40mg.",
    "Pantoprazole Inj. 40mg.",
    "Domperidone 30mg., Pantoprazole 40mg.",
    "Ceftriaxone Inj. 1gm",
    "Ceftriaxone Inj. 500mg",
  ];
  it("skips combination products and reads the form from the text", () => {
    expect(strengthsFromFormulary(items.slice(0, 3), "Tab")).toEqual(["40 mg"]);
    expect(strengthsFromFormulary(items.slice(3), "Inj")).toEqual(["500 mg", "1 g"]);
    expect(strengthsFromFormulary(items.slice(3), "Tab")).toEqual([]);
  });
  it("resolves short names for the search", () => {
    expect(canonicalDrug("pan")).toBe("Pantoprazole");
    expect(canonicalDrug("Newdrug")).toBe("Newdrug");
  });
});
