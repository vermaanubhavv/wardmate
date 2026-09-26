import { describe, it, expect } from "vitest";
import { getTree, listTrees, suggestTrees } from "../trees";
import { EVAL_CASES } from "../evals/cases";

describe("tree registry", () => {
  it("lists every shipped complaint once and resolves by id and version", () => {
    const trees = listTrees();
    const ids = trees.map((t) => t.id);
    for (const want of ["fever", "chest_pain", "breathlessness", "abdominal_pain", "jaundice", "cough", "oedema", "headache", "altered_sensorium", "limb_weakness", "diarrhoea", "generalised_weakness", "giddiness", "decreased_urine_output", "constipation", "abdominal_distension", "lump", "bleeding_per_rectum", "burning_micturition", "loss_of_weight_appetite", "palpitations", "joint_pain", "haematemesis", "polyuria", "low_back_pain", "sore_throat", "fever_with_rash", "poisoning_snakebite", "dysphagia", "groin_swelling", "breast_lump", "anorectal_pain", "leg_ulcer", "scrotal_swelling", "head_injury", "shock", "paediatric_fever", "paediatric_diarrhoea", "paediatric_breathing", "paediatric_seizure", "bleeding_pv", "vaginal_discharge", "labour_pains", "febrile_neutropenia", "haematuria", "limb_injury", "thyroid_swelling", "post_op_problem", "burns"]) {
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
    //
    // Forty-seven of the sixty-one are signed off. Fourteen are not, and each for a reason:
    //   - `jaundice` was reviewed at v1.0.0, then gained four obstructive questions at v1.1.0.
    //     The review was of the older content, so the tree went back to pending. Re-signing it
    //     needs a clinician to read the four new slots, not an edit to this list.
    //   - `burns` was reviewed as a different file. Main's independently-written burns tree won
    //     the merge, and a sign-off does not transfer between two pieces of clinical content.
    //   - the twelve ENT / eye / skin / psychiatry / vascular / dental / chest trees have not
    //     been in front of a clinician at all.
    // Adding an id here is a claim that a named clinician read that tree. Nothing else is.
    const reviewed = listTrees().filter((t) => t.reviewStatus === "reviewed").map((t) => t.id).sort();
    expect(reviewed).toEqual([
      "abdominal_distension", "abdominal_pain", "altered_sensorium", "anorectal_pain",
      "bleeding_per_rectum", "bleeding_pv", "breast_lump", "breathlessness",
      "burning_micturition", "chest_pain", "constipation", "cough", "decreased_urine_output",
      "diarrhoea", "dysphagia", "febrile_neutropenia", "fever", "fever_with_rash",
      "generalised_weakness", "giddiness", "groin_swelling", "haematemesis", "haematuria",
      "head_injury", "headache", "joint_pain", "labour_pains", "leg_ulcer", "limb_injury",
      "limb_weakness", "loss_of_weight_appetite", "low_back_pain", "lump", "oedema",
      "paediatric_breathing", "paediatric_diarrhoea", "paediatric_fever", "paediatric_seizure",
      "palpitations", "poisoning_snakebite", "polyuria", "post_op_problem", "scrotal_swelling",
      "shock", "sore_throat", "thyroid_swelling", "vaginal_discharge",
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
    expect(suggestTrees(["hiccups since morning"])).toEqual([]);
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

describe("eval cases", () => {
  it("names only slots its tree actually has, so an eval never fails on a typo", () => {
    for (const c of EVAL_CASES) {
      const tree = getTree(c.treeId ?? "fever");
      expect(tree, `${c.id}: no tree '${c.treeId ?? "fever"}'`).toBeTruthy();
      const ids = new Set(tree!.slots.map((s) => s.id));
      for (const slotId of [...Object.keys(c.expect), ...(c.expectConflict ?? [])]) {
        expect(ids.has(slotId), `${c.id}: ${tree!.id} has no slot '${slotId}'`).toBe(true);
      }
    }
  });
});

describe("the surgical complaints", () => {
  it("each has its own trigger words", () => {
    expect(suggestTrees(["burns since 4 hours"]).map((t) => t.id)).toContain("burns");
    expect(suggestTrees(["swelling in front of neck x 2 years"]).map((t) => t.id)).toContain("thyroid_swelling");
    expect(suggestTrees(["post op day 5, fever"]).map((t) => t.id)).toContain("post_op_problem");
    // "burning micturition" is not a burn, and the burns tree must not fire on it.
    expect(suggestTrees(["burning micturition x 2 days"]).map((t) => t.id)).not.toContain("burns");
  });

  it("asks the obstructive questions of a patient with jaundice", () => {
    const ids = getTree("jaundice")!.slots.map((s) => s.id);
    for (const want of ["pale_stools", "fluctuation", "pain_before_jaundice", "biliary_intervention"]) {
      expect(ids, `jaundice is missing ${want}`).toContain(want);
    }
  });

  it("every general-surgery tree carries the pre-operative background", () => {
    const surgical = ["abdominal_pain", "abdominal_distension", "anorectal_pain", "bleeding_per_rectum", "breast_lump", "constipation", "dysphagia", "groin_swelling", "haematemesis", "leg_ulcer", "lump", "scrotal_swelling", "thyroid_swelling", "post_op_problem", "burns"];
    for (const id of surgical) {
      const ids = getTree(id)!.slots.map((s) => s.id);
      for (const want of ["surg_previous_operations", "surg_anaesthetic_problem", "surg_transfusion", "surg_blood_thinners", "surg_allergy", "surg_exercise_tolerance", "surg_last_meal"]) {
        expect(ids, `${id} is missing ${want}`).toContain(want);
      }
    }
  });
});

describe("registry size", () => {
  it("keeps the docs honest about how many trees ship", () => {
    // docs/history-check.md states this number; update both together.
    expect(listTrees().length).toBe(61);
  });
});
