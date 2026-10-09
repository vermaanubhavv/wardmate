import { describe, it, expect, vi } from "vitest";

vi.mock("@anthropic-ai/sdk", () => ({ default: vi.fn() }));
import { linesFromJev } from "@/lib/dictation-routing";
import type { JevAnswers } from "@/lib/jev";

const sure = (choice: string) => ({ choice, probabilities: { [choice]: 0.95 } });
const clean = { noul: 0.05 };
const sections = [
  { key: "complaints", label: "Complaints" },
  { key: "abdomen", label: "P/A" },
  { key: "vital:BP", label: "BP", hint: "blood pressure — the value only" },
];

describe("linesFromJev", () => {
  it("files each sentence verbatim and drops filler", () => {
    const r = linesFromJev(
      ["Pain is less today.", "Okay.", "Abdomen soft, non-tender."],
      {
        section_0: sure("complaints"), mixed_0: clean,
        section_1: sure("__none"), mixed_1: clean,
        section_2: sure("abdomen"), mixed_2: clean,
      },
      sections
    );
    expect(r).toEqual({
      lines: [
        { section: "complaints", text: "Pain is less today." },
        { section: "abdomen", text: "Abdomen soft, non-tender." },
      ],
    });
  });

  it("hands the fragment to Haiku when unsure, mixed, value-only, or off the form", () => {
    const cases: JevAnswers[] = [
      { section_0: { choice: "abdomen", probabilities: { abdomen: 0.5 } }, mixed_0: clean },
      { section_0: sure("abdomen"), mixed_0: { noul: 0.8 } },
      { section_0: sure("vital:BP"), mixed_0: clean },
      { section_0: sure("chest"), mixed_0: clean },
      {},
    ];
    for (const answers of cases) expect("fallback" in linesFromJev(["BP is 120 by 80."], answers, sections)).toBe(true);
  });
});
