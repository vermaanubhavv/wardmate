import { describe, it, expect } from "vitest";
import { segmentsFromJev, splitSentences } from "@/lib/case-history-routing";
import { sectionsForSpecialty } from "@/lib/case-history-sections";

const allowed = sectionsForSpecialty(null);
const sure = (choice: string) => ({ choice, probabilities: { [choice]: 0.95 } });
const clean = { noul: 0.05 };

describe("splitSentences", () => {
  it("splits punctuated dictation into whole sentences", () => {
    expect(splitSentences("Diabetic for ten years. Abdomen soft, non-tender.")).toEqual([
      "Diabetic for ten years.",
      "Abdomen soft, non-tender.",
    ]);
  });
});

describe("segmentsFromJev", () => {
  const sentences = ["Diabetic for ten years.", "Okay.", "Pain started after food."];

  it("files each sentence verbatim, drops filler, attaches HOPI to a known complaint", () => {
    const r = segmentsFromJev(
      sentences,
      {
        section_0: sure("past"), mixed_0: clean,
        section_1: sure("none"), mixed_1: clean,
        section_2: sure("hopi"), mixed_2: clean, complaint_2: sure("c0"),
      },
      ["pain abdomen for two days"],
      allowed
    );
    expect(r).toEqual({
      segments: [
        { section: "past", text: "Diabetic for ten years." },
        { section: "hopi", complaint: "pain abdomen for two days", text: "Pain started after food." },
      ],
    });
  });

  it("hands the whole fragment to Haiku when Jev is unsure, a sentence is mixed, or HOPI has no known complaint", () => {
    const base = { section_1: sure("none"), mixed_1: clean, section_2: sure("past"), mixed_2: clean };
    const unsure = { ...base, section_0: { choice: "past", probabilities: { past: 0.5 } }, mixed_0: clean };
    const mixed = { ...base, section_0: sure("past"), mixed_0: { noul: 0.8 } };
    const hopi = { ...base, section_0: sure("hopi"), mixed_0: clean };
    for (const answers of [unsure, mixed, hopi]) {
      expect("fallback" in segmentsFromJev(sentences, answers, [], allowed)).toBe(true);
    }
  });

  it("never files into a section this unit does not have", () => {
    const r = segmentsFromJev(["ECOG 2."], { section_0: sure("performance"), mixed_0: clean }, [], allowed);
    expect(r).toEqual({ fallback: "section not on this unit" });
  });
});
