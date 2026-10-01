import { describe, expect, it } from "vitest";
import { DISCHARGE_TEMPLATES } from "@/lib/discharge-templates";

/** The general-surgery template a typed procedure / diagnosis lands on — first match wins. */
const pick = (text: string) => DISCHARGE_TEMPLATES.find((t) => t.match.test(text))?.key ?? null;

describe("general-surgery discharge template matching", () => {
  it.each([
    ["Fibroadenoma right breast — excision", "benign_breast"],
    ["breast lump excision", "benign_breast"],
    ["Ca breast, MRM", "breast_ca"],
    ["Carcinoma right breast, excision of breast lump", "breast_ca"],
    ["Gynaecomastia — subcutaneous mastectomy", null],
    ["Total thyroidectomy for MNG", "thyroidectomy"],
    ["Amoebic liver abscess, USG-guided aspiration", "liver_abscess"],
    ["Choledocholithiasis — ERCP and CBD clearance", "cbd_stones"],
    ["Blunt trauma abdomen, grade III splenic injury", "abdominal_trauma"],
    ["Perforated appendix — appendicectomy", "appendicectomy"],
    ["Appendicular lump managed conservatively", "appendicectomy"],
    ["Gall bladder perforation", "acute_cholecystitis"],
    ["Duodenal ulcer perforation — Graham patch", "perforation"],
    ["Gallstone ileus", "obstruction"],
    ["Hiatus hernia", null],
    ["Right inguinal hernia — Lichtenstein mesh repair", "hernia"],
    ["Chronic pancreatitis", null],
    ["Acute gallstone pancreatitis", "pancreatitis"],
    ["Right hemicolectomy for ileocaecal TB", null],
    ["Right hemicolectomy for carcinoma caecum", "colorectal_ca"],
    ["Corrosive gastric outlet obstruction — gastrojejunostomy", null],
    ["Carcinoma stomach — gastrojejunostomy", "gastric_ca"],
    ["Fissure in ano — lateral internal sphincterotomy", "perianal"],
    ["Perianal abscess — incision and drainage", "abscess_drainage"],
    ["Right diabetic foot, wet gangrene — ray amputation", "diabetic_foot"],
    ["Varicose veins left leg — EVLA", "varicose_veins"],
    ["Lipoma back — excision", "lump_excision"],
  ])("%s → %s", (text, key) => {
    expect(pick(text)).toBe(key);
  });

  it("prints no conditional drug as a plain prescription", () => {
    // A drug given only in some patients must carry its condition inside the [ … ] name, so an
    // unedited row prints as visibly unfinished — never as something every patient received.
    for (const t of DISCHARGE_TEMPLATES) {
      for (const m of t.scaffold.medications) {
        if (m.indication && /^(if |only )/i.test(m.indication)) {
          expect(m.generic.startsWith("["), `${t.key}: ${m.generic} — "${m.indication}"`).toBe(true);
        }
        expect(m.indication ?? "", `${t.key}: second drug hidden in an indication`).not.toMatch(/±|\be\.g\. \+|\bor [A-Z][a-z]+ \d/);
      }
    }
  });
});
