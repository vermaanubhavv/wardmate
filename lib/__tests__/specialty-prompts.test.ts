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
 */
const PINNED: Record<string, string> = {
  general_surgery: "8fd148deeccdf4eb9f20e80604fbe7e4558e2b7911ae0d67abd4501f19e84a05",
  obstetrics_gynaecology: "7dd3bc56807a1a696bdee6a0959cd1dff4939ae6e7ab7c5908c6da48a9448024",
  ent: "0171d4b6dd0dce7d3cd514bf5bc1bd1db72fb5cd246a12f8def887634616c73a",
  ophthalmology: "214d1fe53705408b34bf0f2b45b59fbb98dff9b818002c739d7952cf12cf0911",
  burns_plastic_surgery: "e0224538ba3425407fbb3d036343ec195888b8605fd722e76a4a6213ef4b8d0d",
  orthopaedics: "0b9dca78dee4ca24c753fbf7f5db0ca425cdc40a66343aa0a8adefed86afb0d1",
  urology: "b457f81091470137982cc60cdb032d9f357765ffae902fd083c3c76a8954828e",
  neurosurgery: "7bf92bb198bae698503688afa66b22d278b627cc315681c52d4e9b90ea3d421c",
};

describe("extraction prompt per unit", () => {
  it("is byte-identical to before for every unit with an operation clock", () => {
    for (const [key, hash] of Object.entries(PINNED)) {
      expect(sha(buildSystemPrompt(getSpecialtyPack(key))), key).toBe(hash);
    }
    expect(sha(buildSystemPrompt())).toBe(PINNED.general_surgery);
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
    // No pack is general surgery — every existing caller is unchanged.
    expect(applyCorrections(said).text).toBe(applyCorrections(said, generalSurgeryPack).text);
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
    expect(categoryQuestion("x").instructions).toBe(
      "`x` is a job from a surgical ward-round plan. Which ward work-stream does the job itself belong to? Judge by the action to be done, not by a word mentioned in passing."
    );
    expect(openQuestion("x").instructions).toMatch(/^A surgical resident dictated `x`/);
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
