import { describe, expect, it } from "vitest";
import { createHash } from "node:crypto";
import { buildSystemPrompt } from "@/lib/extract";
import { applyCorrections } from "@/lib/corrections";
import { SPECIALTY_KEYS, generalSurgeryPack, getSpecialtyPack } from "@/lib/specialty";
import { hasOperationClock } from "@/lib/specialty/intake";
import { forWard, speakerOf } from "@/lib/specialty/prompt-words";
import { SYSTEM_PROMPT as roundPrompt } from "@/lib/read-round";
import { SYSTEM_PROMPT as newPatientPrompt } from "@/lib/read-new-patient";
import { SYSTEM_PROMPT as caseSheetPrompt } from "@/lib/read-case-sheet";
import { SYSTEM_PROMPT as paperPrompt } from "@/lib/read-paper";
import { SYSTEM_PROMPT as registerSource, registerPrompt } from "@/lib/read-register";
import { categoryQuestion, openQuestion } from "@/lib/jev-observations";
import { planSystem } from "@/lib/case-history-ai";
import { wardKeyterms } from "@/lib/transcription/patient-context";
import { MEDICAL_KEYTERMS } from "@/lib/stt";

const sha = (s: string) => createHash("sha256").update(s).digest("hex");

/**
 * The extraction prompt every unit with an operation clock sent before department-neutral
 * examples existed, pinned by hash. A change here is a change to what general surgery (and the
 * other operating units) are sent — it must be deliberate, never a side effect.
 * Last deliberate change: rule 3's chart shorthand for exam findings and diagnoses (lib/chart-shorthand.ts).
 */
const PINNED: Record<string, string> = {
  general_surgery: "d88207460aa1044ab33c26e41455acb6314edca78a1d3cb9ee312e9196b36954",
  obstetrics_gynaecology: "23c5ed958923392e6ff63e51b6573777adae2ea4a1b163b920d2160ec9f0425d",
  ent: "88ed5ed5f40e5d552a35f7c5c26ece9865cb7d6fd4401fa5cb114f1211484e36",
  ophthalmology: "420867dfc2d82ba45def9552ecb82fbba0ff5bf19abedc2fdce8b7252dfeed11",
  burns_plastic_surgery: "4fe7a31f3d6c2eecd97be15b61464df6b5fbe5ed8f64a73d2261813183bb934f",
  orthopaedics: "4de20e9b76865f50560edd6eff10a4c173ae81b2c2c8517105ab18988f4b92cf",
  urology: "4ffef888c43dc5eab0eaae19304c5a9d17089f819cc133c4a0db677a1c86a3b0",
  neurosurgery: "0ef5af7b5813528b71562a7bd59175c5ba36607592399d9673f970756572f17e",
};

describe("extraction prompt per unit", () => {
  it("is byte-identical to before for every unit with an operation clock", () => {
    for (const [key, hash] of Object.entries(PINNED)) {
      expect(sha(buildSystemPrompt(getSpecialtyPack(key))), key).toBe(hash);
    }
    // No pack is the general (no-department) base: no operation clock, so no surgical blocks.
    expect(buildSystemPrompt()).toBe(buildSystemPrompt(getSpecialtyPack("general")));
    expect(buildSystemPrompt()).not.toMatch(/post-op day 2|PAC done/);
  });

  it("teaches no post-op flip, PAC or surgical examples to a unit without one", () => {
    for (const key of SPECIALTY_KEYS) {
      const pack = getSpecialtyPack(key);
      if (hasOperationClock(pack)) continue;
      // The pack's own guidance (its file, not the shared body) may name a kind on purpose.
      const prompt = buildSystemPrompt(pack).replace(pack.extractGuidance.trim(), "");
      for (const word of ["procedure_done", "pac_status", "planned_procedure", "post-op day 2", "drain", "cholelithiasis"]) {
        expect(prompt, `${key}: ${word}`).not.toContain(word);
      }
      // Every safety rule is still there.
      expect(prompt).toContain("Never output a clinical value that is not present in the transcript");
      expect(prompt).toContain("Set urgency to null for every observation that is not a plan.");
    }
  });
});

describe("speakerOf", () => {
  it("reads who is speaking off the pack's role line", () => {
    expect(speakerOf(generalSurgeryPack)).toBe("a surgical resident");
    expect(speakerOf(getSpecialtyPack("pulmonary_medicine"))).toBe("a chest physician");
    expect(speakerOf(getSpecialtyPack("emergency_medicine"))).toBe("an emergency physician");
  });
});

const pulm = getSpecialtyPack("pulmonary_medicine");

describe("speech corrections per unit", () => {
  it("keeps PAS as said on a chest ward, and makes it PAC on general surgery", () => {
    const said = "started on PAS and INH, lab chole patient next door, post operative day";
    expect(applyCorrections(said, pulm).text).toBe(said);
    expect(applyCorrections(said, generalSurgeryPack).text).toBe(
      "started on PAC and INH, lap chole patient next door, POD"
    );
    // No pack is the general base: no surgical-only rule fires.
    expect(applyCorrections(said).text).toBe(applyCorrections(said, getSpecialtyPack("general")).text);
    expect(applyCorrections(said).text).toContain("PAS");
  });

  it("still runs the shared rules on every unit", () => {
    expect(applyCorrections("known case of Koch's, blood pressure one twenty by 80", pulm).text).toBe(
      "K/C/O Koch's, BP 120/80"
    );
  });
});

describe("prompts that used to say surgical", () => {
  const prompts = {
    round: roundPrompt,
    newPatient: newPatientPrompt,
    caseSheet: caseSheetPrompt,
    paper: paperPrompt,
  };

  it("are unchanged for general surgery", () => {
    for (const text of Object.values(prompts)) expect(forWard(text, generalSurgeryPack)).toBe(text);
    expect(registerPrompt(generalSurgeryPack)).toBe(registerSource);
    expect(categoryQuestion("x", generalSurgeryPack).instructions).toBe(
      "`x` is a job from a surgical ward-round plan. Which ward work-stream does the job itself belong to? Judge by the action to be done, not by a word mentioned in passing."
    );
    expect(openQuestion("x", generalSurgeryPack).instructions).toMatch(/^A surgical resident dictated `x`/);
    expect(categoryQuestion("x").instructions).not.toMatch(/surgical/i);
    expect(planSystem()).toContain("positioning, consent/PAC, drains, referrals");
  });

  it("name the chest ward instead", () => {
    for (const [name, text] of Object.entries(prompts)) {
      expect(forWard(text, pulm), name).not.toMatch(/surgical/i);
    }
    expect(forWard(roundPrompt, pulm)).toContain("You split a chest physician's dictation");
    expect(forWard(caseSheetPrompt, pulm)).toContain("a pulmonary medicine admission case sheet");
    expect(categoryQuestion("x", pulm).instructions).not.toMatch(/surgical/i);
    expect(openQuestion("x", pulm).instructions).toMatch(/^A chest physician dictated `x`/);
    const register = registerPrompt(pulm);
    for (const word of ["POD", "post-operative", "drain"]) expect(register).not.toContain(word);
    expect(planSystem("a pulmonary medicine admission", false)).not.toMatch(/PAC|drains/);
  });
});

describe("keyterms with no patient", () => {
  it("are the static list on general surgery and the unit's own lexicon elsewhere", () => {
    expect(wardKeyterms(generalSurgeryPack.lexiconSpecialty)).toEqual(MEDICAL_KEYTERMS);
    const chest = wardKeyterms(pulm.lexiconSpecialty);
    expect(chest.length).toBeGreaterThan(0);
    expect(chest).not.toContain("lap chole");
    expect(chest).not.toContain("Monocef");
  });
});
