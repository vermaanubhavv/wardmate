import { describe, it, expect } from "vitest";
import { getTree, listTrees, suggestTrees } from "../trees";

describe("tree registry", () => {
  it("lists every shipped complaint once and resolves by id and version", () => {
    const trees = listTrees();
    const ids = trees.map((t) => t.id);
    for (const want of ["fever", "chest_pain", "breathlessness", "abdominal_pain", "jaundice", "cough", "oedema", "headache", "altered_sensorium", "limb_weakness", "diarrhoea", "generalised_weakness", "giddiness", "decreased_urine_output", "constipation", "abdominal_distension", "lump", "bleeding_per_rectum", "burning_micturition", "loss_of_weight_appetite", "palpitations", "joint_pain", "haematemesis", "polyuria", "low_back_pain", "sore_throat", "fever_with_rash", "poisoning_snakebite", "dysphagia", "groin_swelling", "breast_lump", "anorectal_pain", "leg_ulcer", "scrotal_swelling"]) {
      expect(ids).toContain(want);
    }
    expect(new Set(ids).size).toBe(ids.length);
    expect(getTree("fever")?.version).toBe("1.0.0");
    expect(getTree("fever", "1.0.0")?.id).toBe("fever");
    expect(getTree("fever", "9.9.9")).toBeNull();
    expect(getTree("no_such_complaint")).toBeNull();
  });

  it("every tree is pending clinician review with at least one reference", () => {
    for (const t of listTrees()) {
      expect(t.reviewStatus).toBe("pending_clinician_review");
      expect(t.references.length).toBeGreaterThan(0);
    }
  });
});

describe("suggestTrees", () => {
  it("suggests every complaint mentioned, in tree order", () => {
    expect(suggestTrees(["fever since 5 days", "vomiting x 2 days"]).map((t) => t.id)).toEqual(["fever", "diarrhoea"]);
    expect(suggestTrees(["Febrile illness"]).map((t) => t.id)).toEqual(["fever"]);
    expect(suggestTrees(["pain abdomen x 3 days"]).map((t) => t.id)).toEqual(["abdominal_pain"]);
    expect(suggestTrees(["unable to walk since morning"]).map((t) => t.id)).toEqual(["limb_weakness"]);
  });

  it("does not suggest from a negated mention, an unrelated complaint, or nothing at all", () => {
    expect(suggestTrees(["no fever, pain abdomen x 3 days"]).map((t) => t.id)).toEqual(["abdominal_pain"]);
    expect(suggestTrees(["afebrile, pain abdomen"]).map((t) => t.id)).toEqual(["abdominal_pain"]);
    expect(suggestTrees(["itching all over"])).toEqual([]);
    expect(suggestTrees([])).toEqual([]);
  });

  it("does not match inside another word", () => {
    expect(suggestTrees(["feverishness"])).toEqual([]);
  });
});
