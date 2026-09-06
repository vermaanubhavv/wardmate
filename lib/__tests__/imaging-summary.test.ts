import { describe, expect, it } from "vitest";
import {
  etiologyFromDiagnosis,
  summariseImaging,
  type ImagingRow,
} from "@/lib/imaging-summary";

/** The USG abdomen from the screenshot, exploded into rows the way extraction stores it. */
const USG_ROWS: ImagingRow[] = [
  { id: "m", label: "USG abdomen", value: "USG whole abdomen" },
  { id: "1", label: "Liver span (mid-clavicular line)", value: "17.6 cm (enlarged)" },
  { id: "2", label: "Liver echotexture / fatty liver grade", value: "Grade II fatty liver" },
  { id: "3", label: "IHBRD / SOL", value: "No IHBRDs / SOL" },
  { id: "4", label: "Gall bladder", value: "Distended, w.t. (N)" },
  { id: "5", label: "Gall bladder calculus size", value: "17 mm seen in G.B lumen" },
  { id: "6", label: "P.V / CBD", value: "(N) in calibre" },
  { id: "7", label: "Pancreas", value: "(N) size/echotexture" },
  { id: "8", label: "Spleen", value: "Normal in size" },
  { id: "9", label: "Both kidneys", value: "Normal cortical thickness" },
  { id: "10", label: "Impression", value: "Cholelithiasis with Grade II fatty liver" },
];

describe("etiologyFromDiagnosis", () => {
  it("maps gallstone wordings to biliary", () => {
    expect(etiologyFromDiagnosis("Cholelithiasis")).toBe("biliary");
    expect(etiologyFromDiagnosis("gall stone disease")).toBe("biliary");
    expect(etiologyFromDiagnosis("Ac. calculous cholecystitis")).toBe("biliary");
  });

  it("is null for anything it does not key on", () => {
    expect(etiologyFromDiagnosis("inguinal hernia")).toBeNull();
    expect(etiologyFromDiagnosis(null)).toBeNull();
  });
});

describe("summariseImaging", () => {
  it("returns null when the rows hold no report", () => {
    const rows: ImagingRow[] = [
      { id: "a", label: "abdomen", value: "soft, non tender" },
      { id: "b", label: "chest", value: "b/l clear" },
    ];
    expect(summariseImaging(rows, "biliary")).toBeNull();
  });

  it("for a biliary patient, surfaces GB / CBD / liver / pancreas and folds the rest", () => {
    const out = summariseImaging(USG_ROWS, "biliary")!;
    expect(out).not.toBeNull();
    expect(out.impression?.id).toBe("10");

    const keyIds = out.key.map((r) => r.id);
    expect(keyIds).toEqual(expect.arrayContaining(["4", "5", "6", "1", "2", "7"]));
    // Spleen and kidneys are not part of a biliary read — behind the fold.
    expect(out.hidden.map((r) => r.id)).toEqual(expect.arrayContaining(["8", "9"]));
    expect(keyIds).not.toContain("8");
    expect(keyIds).not.toContain("9");

    // Nothing is lost: the fold carries the whole study.
    const allIds = out.all.map((r) => r.id).sort();
    expect(allIds).toEqual(
      ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "m"].sort()
    );
  });

  it("hides nothing when the diagnosis is not one it trims for", () => {
    const out = summariseImaging(USG_ROWS, null)!;
    expect(out).not.toBeNull();
    expect(out.hidden).toHaveLength(0);
  });

  it("groups a report even with no modality line, given enough report fields", () => {
    const out = summariseImaging(USG_ROWS.slice(1), "biliary")!;
    expect(out).not.toBeNull();
    expect(out.impression?.id).toBe("10");
  });
});
