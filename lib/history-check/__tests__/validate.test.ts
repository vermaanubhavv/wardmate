import { describe, it, expect } from "vitest";
import { feverV1 } from "@/content/history-trees/fever.v1";
import { validateExtraction, quoteNegatesItem, type RawExtraction } from "../validate";
import { buildSources } from "../sources";

/**
 * These tests are the proof behind the feature's central promise: "not asked" can never be
 * stored as "negative". None of them touches the network.
 */

const SRC = buildSources([
  {
    id: "e1",
    source: "voice",
    recorded_at: "2026-09-10T03:00:00Z",
    transcript:
      "History given by the attendant, wife. Fever since 5 days, high grade, continuous, with chills and rigors. No vomiting. Headache present. Denies rash. Not passing less urine.",
    observations: [],
  },
  {
    id: "e2",
    source: "manual",
    recorded_at: "2026-09-10T04:00:00Z",
    transcript: null,
    observations: [
      { label: "past history", value_text: "K/C/O diabetes on treatment" },
      { label: "history of presenting illness", value_text: "patient himself says he has been vomiting twice today" },
    ],
  },
]);

function raw(slots: RawExtraction["slots"], wrong_patient: RawExtraction["wrong_patient"] = null): RawExtraction {
  return { slots, wrong_patient };
}

const state = (r: ReturnType<typeof validateExtraction>, id: string) => r.slots.find((s) => s.id === id)!;

describe("validateExtraction — the three states", () => {
  it("returns every slot of the tree, unasked by default, when the model returns nothing", () => {
    const r = validateExtraction(feverV1, raw([]), SRC);
    expect(r.slots.length).toBe(feverV1.slots.length);
    expect(r.slots.every((s) => s.state === "unasked" && s.evidence === null && s.value === null)).toBe(true);
    expect(r.rejections).toEqual([]);
    expect(r.wrongPatient).toBeNull();
  });

  it("keeps a positive whose quote is a literal span of its source", () => {
    const r = validateExtraction(feverV1, raw([{ id: "headache", state: "positive", quote: "Headache present", source: 0 }]), SRC);
    expect(state(r, "headache")).toMatchObject({ state: "positive", evidence: { quote: "Headache present", source: 0 } });
  });

  it("keeps a negative whose quote contains an explicit denial of that item", () => {
    const r = validateExtraction(feverV1, raw([
      { id: "vomiting", state: "negative", quote: "No vomiting.", source: 0 },
      { id: "rash", state: "negative", quote: "Denies rash", source: 0 },
    ]), SRC);
    expect(state(r, "vomiting").state).toBe("negative");
    expect(state(r, "rash").state).toBe("negative");
    expect(r.rejections).toEqual([]);
  });

  it("NEVER lets a negative through without a quote — silence is unasked", () => {
    const r = validateExtraction(feverV1, raw([
      { id: "cough", state: "negative", quote: null, source: 0 },
      { id: "bleeding", state: "negative", quote: "", source: 0 },
    ]), SRC);
    expect(state(r, "cough").state).toBe("unasked");
    expect(state(r, "bleeding").state).toBe("unasked");
    expect(r.rejections.map((x) => x.reason)).toEqual(["quote_missing", "quote_missing"]);
  });

  it("downgrades a negative whose quote is not in the source (an invented denial)", () => {
    const r = validateExtraction(feverV1, raw([{ id: "cough", state: "negative", quote: "no cough", source: 0 }]), SRC);
    expect(state(r, "cough").state).toBe("unasked");
    expect(r.rejections[0]).toMatchObject({ slotId: "cough", claimed: "negative", becomes: "unasked", reason: "quote_not_in_source" });
  });

  it("downgrades a negative whose quote is real but carries no negation of the item", () => {
    // The quote is verbatim, but it does not deny headache — it affirms it.
    const r = validateExtraction(feverV1, raw([{ id: "headache", state: "negative", quote: "Headache present", source: 0 }]), SRC);
    expect(state(r, "headache").state).toBe("unasked");
    expect(r.rejections[0].reason).toBe("no_negation_in_quote");
  });

  it("downgrades a negative whose quote denies a DIFFERENT item", () => {
    // "No vomiting" cited for the rash slot: negation present, item absent.
    const r = validateExtraction(feverV1, raw([{ id: "rash", state: "negative", quote: "No vomiting", source: 0 }]), SRC);
    expect(state(r, "rash").state).toBe("unasked");
    expect(r.rejections[0].reason).toBe("term_not_in_quote");
  });

  it("downgrades a negative when the negation comes AFTER the item in the quote", () => {
    // Both words present, but "Headache present. Denies rash" cited for headache denies rash, not headache.
    const r = validateExtraction(feverV1, raw([{ id: "headache", state: "negative", quote: "Headache present. Denies rash", source: 0 }]), SRC);
    expect(state(r, "headache").state).toBe("unasked");
  });

  it("downgrades a positive whose quote is invented or cites a source that does not exist", () => {
    const r = validateExtraction(feverV1, raw([
      { id: "cough", state: "positive", quote: "cough since 2 days", source: 0 },
      { id: "headache", state: "positive", quote: "Headache present", source: 7 },
      { id: "rash", state: "positive", quote: "Denies rash", source: -1 },
    ]), SRC);
    expect(state(r, "cough").state).toBe("unasked");
    expect(state(r, "headache").state).toBe("unasked");
    expect(state(r, "rash").state).toBe("unasked");
    expect(r.rejections.map((x) => x.reason).sort()).toEqual(["quote_not_in_source", "source_index_invalid", "source_index_invalid"]);
  });

  it("matches quotes case- and whitespace-insensitively, and nothing looser", () => {
    const ok = validateExtraction(feverV1, raw([{ id: "vomiting", state: "negative", quote: "no   VOMITING", source: 0 }]), SRC);
    expect(state(ok, "vomiting").state).toBe("negative");
    const bad = validateExtraction(feverV1, raw([{ id: "vomiting", state: "negative", quote: "no vomit", source: 0 }]), SRC);
    // "no vomit" IS a substring of "No vomiting." and "vomit" is a term — accepted. The looser
    // case is a paraphrase: "vomiting absent" is not in the source.
    expect(state(bad, "vomiting").state).toBe("negative");
    const para = validateExtraction(feverV1, raw([{ id: "vomiting", state: "negative", quote: "vomiting absent", source: 0 }]), SRC);
    expect(state(para, "vomiting").state).toBe("unasked");
  });

  it("checks quotes against the source they cite, not any source", () => {
    const r = validateExtraction(feverV1, raw([{ id: "vomiting", state: "negative", quote: "No vomiting", source: 1 }]), SRC);
    expect(state(r, "vomiting").state).toBe("unasked");
    expect(r.rejections[0].reason).toBe("quote_not_in_source");
  });

  it("reads a manual (typed) entry line by line as its own source", () => {
    const r = validateExtraction(feverV1, raw([{ id: "vomiting", state: "positive", quote: "he has been vomiting twice today", source: 1 }]), SRC);
    expect(state(r, "vomiting")).toMatchObject({ state: "positive", evidence: { source: 1 } });
  });
});

describe("validateExtraction — value slots", () => {
  it("keeps a verbatim value and drops one that is not in the source", () => {
    const ok = validateExtraction(feverV1, raw([{ id: "duration", state: "positive", quote: "Fever since 5 days", source: 0, value: "since 5 days" }]), SRC);
    expect(state(ok, "duration")).toMatchObject({ state: "positive", value: "since 5 days" });

    const normalised = validateExtraction(feverV1, raw([{ id: "duration", state: "positive", quote: "Fever since 5 days", source: 0, value: "5 days" }]), SRC);
    expect(state(normalised, "duration").value).toBe("5 days"); // still a literal span

    const invented = validateExtraction(feverV1, raw([{ id: "duration", state: "positive", quote: "Fever since 5 days", source: 0, value: "120 hours" }]), SRC);
    expect(state(invented, "duration").state).toBe("unasked");
    expect(invented.rejections[0].reason).toBe("value_not_in_source");

    const missing = validateExtraction(feverV1, raw([{ id: "duration", state: "positive", quote: "Fever since 5 days", source: 0, value: null }]), SRC);
    expect(state(missing, "duration").state).toBe("unasked");
    expect(missing.rejections[0].reason).toBe("value_missing");
  });

  it("never attaches a value to a yes_no slot", () => {
    const r = validateExtraction(feverV1, raw([{ id: "headache", state: "positive", quote: "Headache present", source: 0, value: "severe" }]), SRC);
    expect(state(r, "headache").value).toBeNull();
  });
});

describe("validateExtraction — conflicts, wrong patient, hygiene", () => {
  it("keeps a conflict whose quote is real and drops one that is not, without touching the state", () => {
    const r = validateExtraction(feverV1, raw([
      { id: "vomiting", state: "negative", quote: "No vomiting", source: 0, conflict: { quote: "he has been vomiting twice today", source: 1 } },
    ]), SRC);
    expect(state(r, "vomiting")).toMatchObject({ state: "negative", conflict: { source: 1 } });

    const bad = validateExtraction(feverV1, raw([
      { id: "vomiting", state: "negative", quote: "No vomiting", source: 0, conflict: { quote: "vomiting galore", source: 1 } },
    ]), SRC);
    expect(state(bad, "vomiting")).toMatchObject({ state: "negative", conflict: null });
    expect(bad.rejections[0].reason).toBe("conflict_quote_not_in_source");
  });

  it("keeps a wrong-patient flag only when its quote is real", () => {
    const yes = validateExtraction(feverV1, raw([], { quote: "History given by the attendant", source: 0 }), SRC);
    expect(yes.wrongPatient).toEqual({ quote: "History given by the attendant", source: 0 });
    const no = validateExtraction(feverV1, raw([], { quote: "this is bed 7's history", source: 0 }), SRC);
    expect(no.wrongPatient).toBeNull();
    expect(no.rejections[0].slotId).toBe("__wrong_patient");
  });

  it("strips quotes and values from unasked, ignores unknown slot ids and duplicate ids, treats unknown states as unasked", () => {
    const r = validateExtraction(feverV1, raw([
      { id: "headache", state: "unasked", quote: "Headache present", source: 0, value: "x" },
      { id: "tail_length", state: "positive", quote: "Headache present", source: 0 },
      { id: "rash", state: "positive", quote: "Denies rash", source: 0 },
      { id: "rash", state: "negative", quote: "Denies rash", source: 0 },
      { id: "cough", state: "maybe", quote: "Headache present", source: 0 },
    ]), SRC);
    expect(state(r, "headache")).toEqual({ id: "headache", state: "unasked", evidence: null, value: null, conflict: null });
    expect(r.slots.some((s) => s.id === "tail_length")).toBe(false);
    expect(r.rejections.some((x) => x.reason === "unknown_slot")).toBe(true);
    expect(state(r, "rash").state).toBe("positive"); // first wins
    expect(state(r, "cough").state).toBe("unasked");
  });

  it("is deterministic — same input, same output", () => {
    const input = raw([{ id: "vomiting", state: "negative", quote: "No vomiting", source: 0 }]);
    expect(validateExtraction(feverV1, input, SRC)).toEqual(validateExtraction(feverV1, input, SRC));
  });
});

describe("quoteNegatesItem — the negation lexicon", () => {
  const terms = ["vomiting", "vomit"];
  it.each([
    ["no vomiting", true],
    ["not vomiting", true],
    ["denies vomiting", true],
    ["nil vomiting", true],
    ["vomiting absent", false], // negation after the item: not accepted, by design
    ["vomiting", false],
    ["vomiting present", false],
    ["no headache, vomiting present", false],
    ["no headache, has vomiting", false],
    ["no vomiting, loose stools present", true],
    ["no h/o vomiting, loose stools, rash", true],
    ["no vomiting since 2 days", false], // ambiguous: safer unasked
    ["no headache or vomiting", true],
    ["did not vomit", true],
    ["vomiting -ve", false],
    ["-ve for vomiting", true],
    ["nothing", false], // "no" inside a word is not a negation
    ["knot in the stomach and vomiting", false],
  ])("%s → %s", (quote, expected) => {
    expect(quoteNegatesItem(quote, terms)).toBe(expected);
  });
});
