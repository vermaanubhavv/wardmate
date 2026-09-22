import { describe, it, expect } from "vitest";
import { getTree, listTrees, suggestTrees } from "../trees";

describe("tree registry", () => {
  it("lists every shipped complaint once and resolves by id and version", () => {
    const trees = listTrees();
    const ids = trees.map((t) => t.id);
    for (const want of ["fever", "chest_pain", "breathlessness", "abdominal_pain", "jaundice", "cough", "oedema", "headache", "altered_sensorium", "limb_weakness", "diarrhoea", "generalised_weakness", "giddiness", "decreased_urine_output", "constipation", "abdominal_distension", "lump", "bleeding_per_rectum", "burning_micturition", "loss_of_weight_appetite", "palpitations", "joint_pain", "haematemesis", "polyuria", "low_back_pain", "sore_throat", "fever_with_rash", "poisoning_snakebite", "dysphagia", "groin_swelling", "breast_lump", "anorectal_pain", "leg_ulcer", "scrotal_swelling", "head_injury", "shock", "paediatric_fever", "paediatric_diarrhoea", "paediatric_breathing", "paediatric_seizure", "bleeding_pv", "vaginal_discharge", "labour_pains", "febrile_neutropenia", "haematuria", "limb_injury"]) {
      expect(ids).toContain(want);
    }
    expect(new Set(ids).size).toBe(ids.length);
    expect(getTree("fever")?.version).toBe("1.0.0");
    expect(getTree("fever", "1.0.0")?.id).toBe("fever");
    expect(getTree("fever", "9.9.9")).toBeNull();
    expect(getTree("no_such_complaint")).toBeNull();
  });

  it("every tree has at least one reference, and only a named reviewer can mark one reviewed", () => {
    for (const t of listTrees()) {
      expect(t.references.length).toBeGreaterThan(0);
      if (t.reviewStatus === "reviewed") expect(t.reviewedBy, `${t.id} is reviewed by nobody`).toBeTruthy();
      else {
        expect(t.reviewStatus).toBe("pending_clinician_review");
        expect(t.reviewedBy).toBeNull();
      }
    }
  });

  it("pins exactly which trees a clinician has signed off", () => {
    // A tree must not drift into "reviewed" as a side effect of an edit — the chip on the card
    // is the only thing telling a resident whether the content was read by a clinician.
    const reviewed = listTrees().filter((t) => t.reviewStatus === "reviewed").map((t) => t.id).sort();
    expect(reviewed).toEqual([
      "abdominal_distension", "abdominal_pain", "anorectal_pain", "bleeding_per_rectum",
      "breast_lump", "constipation", "dysphagia", "groin_swelling", "haematemesis",
      "leg_ulcer", "lump", "scrotal_swelling",
    ]);
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

describe("paediatric trees", () => {
  const paed = listTrees().filter((t) => t.id.startsWith("paediatric_"));

  it("every paediatric tree carries the background an adult history does not", () => {
    expect(paed.length).toBeGreaterThanOrEqual(4);
    for (const t of paed) {
      const ids = t.slots.map((s) => s.id);
      for (const want of ["birth_history", "immunisation", "development", "feeding_nutrition"]) {
        expect(ids, `${t.id} is missing ${want}`).toContain(want);
      }
    }
  });

  it("records no identifier beyond what the patient record already holds", () => {
    // Only name, age, sex and bed identify a patient (AGENTS.md), so no tree may ask for an
    // address, a phone number, a parent's name or a hospital number.
    const banned = /\b(address|phone|mobile number|aadhaar|father s name|mother s name|hospital number|uhid)\b/i;
    for (const t of listTrees()) {
      for (const s of t.slots) {
        expect(banned.test(s.question), `${t.id}.${s.id} asks for an identifier`).toBe(false);
        expect(banned.test(s.label)).toBe(false);
      }
    }
  });
});

describe("citation integrity", () => {
  it("every PubMed id is digits only, so a fabricated citation cannot slip through", () => {
    for (const t of listTrees()) {
      for (const r of t.references) {
        if (r.pmid !== undefined) expect(r.pmid, `${t.id}: ${r.title}`).toMatch(/^\d{4,9}$/);
      }
    }
  });

  it("never labels an Annals of Emergency Medicine abstract as JAMA", () => {
    // rce() and ebem() exist because these are different journals; mixing them misattributes.
    for (const t of listTrees()) {
      for (const r of t.references) {
        if (/Evidence-Based EM/.test(r.source)) expect(r.source).not.toMatch(/JAMA/);
        if (/^JAMA/.test(r.source)) expect(r.source).not.toMatch(/Annals/);
      }
    }
  });
});

describe("registry size", () => {
  it("keeps the docs honest about how many trees ship", () => {
    // docs/history-check.md states this number; update both together.
    expect(listTrees().length).toBe(46);
  });
});
