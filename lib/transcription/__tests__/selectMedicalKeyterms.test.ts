import { describe, expect, it } from "vitest";
import {
  selectMedicalKeyterms,
  getDeepgramKeyterms,
  estimateTotalTokens,
} from "../selectMedicalKeyterms";
import { buildDeepgramUrl, buildDeepgramParams } from "../buildDeepgramUrl";
import type { DictationContext } from "../lexicon";

const terms = (ctx: DictationContext) =>
  getDeepgramKeyterms(ctx).map((t) => t.toLowerCase());

const hasSome = (list: string[], wanted: string[]) =>
  wanted.filter((w) => list.some((t) => t.includes(w.toLowerCase())));

describe("selectMedicalKeyterms", () => {
  it("Test 1 — acute pancreatitis pulls in its scores, markers and imaging, not hernia terms", () => {
    const list = terms({ diagnoses: ["Acute pancreatitis"] });

    const wanted = [
      "acute pancreatitis",
      "ranson's criteria",
      "bisap",
      "revised atlanta classification",
      "modified ct severity index",
      "serum lipase",
      "cect abdomen",
      "walled-off necrosis",
    ];
    // At least most of the pancreatitis vocabulary should be present.
    expect(hasSome(list, wanted).length).toBeGreaterThanOrEqual(6);

    for (const forbidden of ["lichtenstein hernioplasty", "wagner classification", "fistulotomy"]) {
      expect(list).not.toContain(forbidden);
    }
  });

  it("Test 2 — inguinal hernia pulls in the wall anatomy and the planned repair", () => {
    const list = terms({
      diagnoses: ["Right inguinal hernia"],
      plannedProcedures: ["Lichtenstein hernioplasty"],
    });

    const wanted = [
      "inguinal hernia",
      "lichtenstein hernioplasty",
      "hesselbach's triangle",
      "deep inguinal ring",
      "spermatic cord",
    ];
    expect(hasSome(list, wanted).length).toBeGreaterThanOrEqual(4);

    for (const forbidden of ["ranson's criteria", "bisap score", "modified ct severity index"]) {
      expect(list).not.toContain(forbidden);
    }
  });

  it("Test 3 — diabetic foot ulcer pulls in Wagner, debridement and the wound-bed words", () => {
    const list = terms({ diagnoses: ["Diabetic foot ulcer"] });

    const wanted = [
      "diabetic foot",
      "diabetic foot ulcer",
      "wagner classification",
      "debridement",
      "slough",
      "granulation tissue",
    ];
    expect(hasSome(list, wanted).length).toBeGreaterThanOrEqual(4);
    expect(list).not.toContain("ranson's criteria");
  });

  it("Test 4 — a POD-2 lap chole with a drain gets the operation, the anatomy and the drain terms", () => {
    const list = terms({
      procedures: ["Laparoscopic cholecystectomy"],
      postOpDay: 2,
      devices: ["Abdominal drain"],
    });

    for (const wanted of [
      "laparoscopic cholecystectomy",
      "post operative day",
      "abdominal drain",
      "drain output",
    ]) {
      expect(list.some((t) => t.includes(wanted))).toBe(true);
    }
    expect(hasSome(list, ["calot's triangle", "common bile duct"]).length).toBeGreaterThanOrEqual(1);
  });

  it("Test 5 — an exact charted medication is selected with a top score", () => {
    const selected = selectMedicalKeyterms({ medications: ["Piperacillin Tazobactam"] });
    const pip = selected.find((s) => s.term.toLowerCase() === "piperacillin tazobactam");
    expect(pip).toBeDefined();
    expect(pip!.score).toBeGreaterThanOrEqual(90);
    // it should be at or near the very top of the list
    expect(selected.slice(0, 5).map((s) => s.term.toLowerCase())).toContain(
      "piperacillin tazobactam"
    );
  });

  it("Test 6 — a huge context stays within the 80-term and 400-token ceilings", () => {
    const huge: DictationContext = {
      specialty: "general-surgery",
      diagnoses: [
        "Acute pancreatitis",
        "Acute cholangitis",
        "Choledocholithiasis",
        "Acute appendicitis",
        "Perforation peritonitis",
        "Small bowel obstruction",
        "Right inguinal hernia",
        "Incisional hernia",
        "Fistula in ano",
        "Diabetic foot ulcer",
        "Necrotizing fasciitis",
        "Acute limb ischemia",
        "Carcinoma rectum",
        "Blunt trauma abdomen",
        "Septic shock",
      ],
      procedures: [
        "Exploratory laparotomy",
        "Laparoscopic cholecystectomy",
        "Loop ileostomy",
        "Lichtenstein hernioplasty",
      ],
      plannedProcedures: ["Low anterior resection", "Wound debridement"],
      medications: [
        "Piperacillin tazobactam",
        "Meropenem",
        "Metronidazole",
        "Pantoprazole",
        "Noradrenaline",
        "Enoxaparin",
      ],
      devices: ["Ryle's tube", "Foley's catheter", "Central line"],
      drains: ["Abdominal drain", "Pelvic drain"],
      postOpDay: 3,
    };

    const list = getDeepgramKeyterms(huge);
    expect(list.length).toBeLessThanOrEqual(80);
    expect(estimateTotalTokens(list)).toBeLessThanOrEqual(400);
    // no exact string duplicates
    expect(new Set(list.map((t) => t.toLowerCase())).size).toBe(list.length);
  });

  it("Test 7 — synonymous device spellings collapse to one preferred keyterm", () => {
    const list = getDeepgramKeyterms({
      devices: ["Ryle's tube", "Ryles tube", "NG tube", "nasogastric tube"],
    });
    const ryle = list.filter((t) => /ryle|nasogastric|ng tube/i.test(t));
    expect(ryle.length).toBe(1);
  });

  it("Test 8 — the Deepgram query repeats the keyterm parameter, never comma-joins it", () => {
    const chosen = getDeepgramKeyterms({ diagnoses: ["Acute pancreatitis"] });
    const params = buildDeepgramParams(chosen);

    expect(params.get("model")).toBe("nova-3-medical");
    expect(params.get("language")).toBe("en-IN");
    expect(params.getAll("keyterm").length).toBe(chosen.length);
    expect(params.getAll("keyterm")).toEqual(chosen);

    const url = buildDeepgramUrl(["Ryle's tube", "Ranson's criteria", "CECT abdomen"]);
    expect(url).toContain("keyterm=Ryle");
    expect(url).toContain("keyterm=Ranson");
    expect(url).toContain("keyterm=CECT");
    // no weights, no comma-joined list
    expect(url).not.toMatch(/keyterm=[^&]*%3A\d/); // no ":2" style weight
    expect(url).not.toMatch(/keyterm=[^&]*%2C[^&]*%2C/); // no "a,b,c" joined list
  });

  it("is deterministic — same context, same ordered list", () => {
    const ctx: DictationContext = {
      diagnoses: ["Acute pancreatitis"],
      procedures: ["Laparoscopic cholecystectomy"],
      devices: ["Ryle's tube"],
    };
    expect(getDeepgramKeyterms(ctx)).toEqual(getDeepgramKeyterms(ctx));
  });

  it("a typical single-patient context lands in the 20–50 range", () => {
    const list = getDeepgramKeyterms({
      specialty: "general-surgery",
      diagnoses: ["Acute pancreatitis"],
      procedures: ["Laparoscopic cholecystectomy"],
      devices: ["Ryle's tube", "Abdominal drain"],
      medications: ["Piperacillin tazobactam", "Pantoprazole"],
      postOpDay: 2,
    });
    expect(list.length).toBeGreaterThanOrEqual(20);
    expect(list.length).toBeLessThanOrEqual(50);
  });

  it("patient-specific facts outrank generic vocabulary", () => {
    const selected = selectMedicalKeyterms({
      diagnoses: ["Acute pancreatitis"],
      procedures: ["Laparoscopic cholecystectomy"],
      devices: ["Ryle's tube"],
      medications: ["Piperacillin tazobactam"],
    });
    const top = selected.slice(0, 6).map((s) => s.term.toLowerCase());
    expect(top).toContain("acute pancreatitis");
    expect(top).toContain("laparoscopic cholecystectomy");
    expect(top.some((t) => /ryle/.test(t))).toBe(true);
    expect(top).toContain("piperacillin tazobactam");
  });

  it("an empty context still returns the small universal ward core", () => {
    const list = getDeepgramKeyterms({});
    expect(list.length).toBeGreaterThan(0);
    expect(list.length).toBeLessThanOrEqual(12);
    expect(list.map((t) => t.toLowerCase())).toContain("per abdomen");
  });

  it("custom hospital terms merge through the same selector", () => {
    const list = getDeepgramKeyterms({
      diagnoses: ["Acute pancreatitis"],
      customTerms: [
        {
          term: "ESIC Basaidarapur",
          categories: ["india-ward"],
          triggers: ["pancreatitis"],
          priority: 90,
        },
      ],
    });
    expect(list).toContain("ESIC Basaidarapur");
  });
});
