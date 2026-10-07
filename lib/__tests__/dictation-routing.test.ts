import { describe, expect, it } from "vitest";
import { keepOffered } from "@/lib/dictation-routing";

describe("keepOffered", () => {
  const sections = [
    { key: "complaints", label: "Complaints" },
    { key: "vital:BP", label: "BP" },
  ];
  it("keeps only offered sections with text", () => {
    expect(
      keepOffered(
        {
          lines: [
            { section: "complaints", text: " no fresh complaints " },
            { section: "vital:BP", text: "120/80" },
            { section: "diagnosis", text: "appendicitis" },
            { section: "complaints", text: "  " },
          ],
        },
        sections
      )
    ).toEqual([
      { section: "complaints", text: "no fresh complaints" },
      { section: "vital:BP", text: "120/80" },
    ]);
  });
  it("survives junk", () => {
    expect(keepOffered(null, sections)).toEqual([]);
    expect(keepOffered({ lines: "x" }, sections)).toEqual([]);
  });
});
