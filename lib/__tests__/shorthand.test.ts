import { describe, expect, it } from "vitest";
import { HAND_RULES, shortFinding, shortJob, shorthandPair, shorthandRules, type ShorthandRule } from "@/lib/shorthand";
import { CORE_PAIRS, DEPARTMENT_PAIRS } from "@/lib/shorthand-table";
import { conflicting, meaningKey, spells } from "@/lib/shorthand-derive";
import { WARD_SHORTHAND } from "@/lib/transcription/lexicon/ward-shorthand";
import { SPECIALTY_KEYS } from "@/lib/specialty/types";

describe("shortFinding", () => {
  it("writes the two lines from the ward the way a chart does", () => {
    expect(shortFinding("upper abdomen is tender in the right upper abdomen")).toBe("RUQ tenderness");
    expect(shortFinding("right upper right liver lobe abscess")).toBe("right liver lobe abscess");
  });
  it("shortens fixed phrases, any capitalisation", () => {
    expect(shortFinding("Soft, non tender, bowel sounds present")).toBe("Soft, NT, BS +");
    expect(shortFinding("Air entry equal bilaterally, normal vesicular breath sounds")).toBe("B/L AE =, NVBS");
    expect(shortFinding("Tenderness present over the right iliac fossa")).toBe("RIF tenderness");
  });
  it("never adds a side, a negation or a number, and leaves the unknown alone", () => {
    expect(shortFinding("tender on the right side")).toBe("tender on the right side");
    expect(shortFinding("no guarding")).toBe("no guarding");
    expect(shortFinding("right and left both tender")).toBe("right and left both tender");
    expect(shortFinding("BP 120/80 PR 80")).toBe("BP 120/80 PR 80");
    expect(shortFinding("Voluntary guarding present")).toBe("Voluntary guarding present");
  });
  it("keeps two findings that share a word: a restart is only over a level or a filler", () => {
    expect(shortFinding("no pain no vomiting")).toBe("no pain no vomiting");
    expect(shortFinding("right knee right ankle swelling")).toBe("right knee right ankle swelling");
  });
  it("reads by the unit's department", () => {
    expect(shortFinding("visual acuity in the right eye 6/9", "ophthalmology")).toBe("VA in the RE 6/9");
    expect(shortFinding("visual acuity in the right eye 6/9", "general_surgery")).toBe("visual acuity in the right eye 6/9");
    expect(shortFinding("Full range of motion, non weight bearing", "orthopaedics")).toBe("Full ROM, NWB");
    expect(shortFinding("per vaginum: os closed", "obstetrics_gynaecology")).toBe("P/V: os closed");
    expect(shortFinding("jugular venous pressure not raised", "internal_medicine")).toBe("JVP not raised");
    expect(shortFinding("history of presenting illness")).toBe("HPI");
    expect(shortFinding("known case of diabetes mellitus", "internal_medicine")).toBe("K/C/O DM");
    // A word that gives two letters, from the hand-checked COMPOUNDS list.
    expect(shortFinding("intraocular pressure raised in the left eye", "ophthalmology")).toBe("IOP raised in the LE");
    expect(shortFinding("posted for transurethral resection of prostate", "urology")).toBe("posted for TURP");
    expect(shortFinding("small subdural haematoma, no midline shift", "neurosurgery")).toBe("small SDH, no MLS");
    expect(shortFinding("ventriculoperitoneal shunt in situ", "neurosurgery")).toBe("VP shunt in situ");
    expect(shortFinding("on electroconvulsive therapy", "psychiatry")).toBe("on ECT");
    expect(shortFinding("postpartum hemorrhage", "obstetrics_gynaecology")).toBe("PPH");
    expect(shortFinding("intrauterine death", "obstetrics_gynaecology")).toBe("intrauterine death");
  });
  it("leaves an abbreviation that would mean two things on that ward as said", () => {
    expect(shortFinding("atrial flutter", "internal_medicine")).toBe("atrial flutter");
    expect(shortFinding("atrial fibrillation", "internal_medicine")).toBe("atrial fibrillation");
    expect(shortFinding("partial response", "medical_oncology")).toBe("partial response");
    expect(shortFinding("pouch of douglas")).toBe("pouch of douglas");
    expect(shortFinding("high risk")).toBe("high risk");
    expect(shortFinding("per rectum", "general_surgery")).toBe("P/R");
  });
  it("never shortens a synonym or an opposite", () => {
    expect(shortFinding("afebrile")).toBe("afebrile");
    expect(shortFinding("not passing flatus")).toBe("not passing flatus");
  });
});

describe("shortJob", () => {
  it("puts the verb first and drops the filler", () => {
    expect(shortJob("we need to send a complete blood count tomorrow morning")).toBe("Send a CBC tomorrow AM");
    expect(shortJob("please do ultrasound of the abdomen.")).toBe("Do USG");
    expect(shortJob("Repeat liver function test and renal function test")).toBe("Repeat LFT and RFT");
    expect(shortJob("please check the visual acuity", "ophthalmology")).toBe("Check the VA");
  });
});

describe("shorthandPair", () => {
  it("reads an edit into a shorter form as a suggestion", () => {
    expect(shorthandPair("pain in the right iliac fossa since morning", "pain RIF since morning")).toBeNull(); // already in the table
    expect(shorthandPair("tenderness at McBurney's point", "tenderness at MBP")).toEqual({ long: "McBurney's point", short: "MBP" });
    expect(shorthandPair("straight leg raising test positive", "SLRT positive", "orthopaedics")).toEqual({ long: "straight leg raising test", short: "SLRT" });
  });
  it("is not a correction: a number, a negation or a plain word is never learned", () => {
    expect(shorthandPair("drain output 50 ml", "drain 30 ml")).toBeNull();
    expect(shorthandPair("no guarding present", "guarding")).toBeNull();
    expect(shorthandPair("bowel sounds sluggish", "bowel sounds ok")).toBeNull();
    expect(shorthandPair("tenderness", "tender")).toBeNull();
  });
});

// ---- Every rule, every department ---------------------------------------------------------

const DEPTS = [undefined, ...SPECIALTY_KEYS] as const;
const own: [string, ShorthandRule][] = [
  ...shorthandRules().map((r) => ["core", r] as [string, ShorthandRule]),
  ...SPECIALTY_KEYS.flatMap((k) => shorthandRules(k).filter((r) => !shorthandRules().includes(r) && !shorthandRules().some((c) => c.example === r.example && c.to === r.to)).map((r) => [k, r] as [string, ShorthandRule])),
];

describe("each rule shortens its own phrase", () => {
  it.each(own.map(([dept, r]) => [dept, r.example, r.to]))("%s: %s → %s", (dept, example, to) => {
    const out = shortFinding(example, dept === "core" ? undefined : dept);
    expect(` ${out} `).toContain(` ${to} `);
  });
});

const SIDE = /\b(right|left|bilateral|both|b\/l)\b/g;
const NEG = /\b(no|not|nil|absent|without|non|denies)\b/g;
const SITE = /\b(eyes?|ears?|nose|knee|hip|femur|abdomen|abdominal|chest|head|neck|arm|leg|foot|hand|spine|brain|liver|kidney|renal|lungs?|heart|cardiac|bladder|prostate|uterus|uterine|cervi\w*|rectum|rectal|vagin\w*|iliac|fossa|quadrant|upper|lower|epigastri\w*|bile|duct|bowel|limb|skin|cerebral|cervical|lumbar|urinary|nasal|tympanic|auditory|retinal|arterial|venous)\b/g;
const set = (s: string, re: RegExp) => new Set(s.toLowerCase().match(re) ?? []);
const nums = (s: string) => new Set(s.match(/\d+/g) ?? []);
const sub = (a: Set<string>, b: Set<string>) => [...a].every((x) => b.has(x));

/** The output read back in words: an abbreviation the input did not have is checked against
 *  the phrase some rule producing it stands for — the guard passes if any one of them fits. */
function addsNothing(input: string, out: string, rules: ShorthandRule[]): string | null {
  if (!sub(nums(out), nums(input))) return "a number";
  const plain = out.replace(/[A-Z][A-Za-z]*(?:[/&][A-Za-z]+)*|S1S2|\+|=/g, " ");
  if (!sub(set(plain, SIDE), set(input, SIDE))) return "a side";
  if (!sub(set(plain, SITE), set(input, SITE))) return "a site";
  for (const tok of out.match(/[A-Z][A-Za-z]*(?:[/&-][A-Za-z]+)*/g) ?? []) {
    if (new RegExp(`\\b${tok.replace(/[/&-]/g, "\\$&")}\\b`, "i").test(input)) continue;
    const means = rules.filter((r) => r.to.split(" ").includes(tok)).map((r) => r.example);
    if (means.length === 0) continue; // a capitalised word the input already had, re-cased
    const fits = means.some(
      (m) => sub(set(m, SIDE), set(input, SIDE)) && sub(set(m, SITE), set(input, SITE)) && sub(set(m, NEG), set(input, NEG))
    );
    if (!fits) return `"${tok}" (${means.join(" / ")})`;
  }
  // A negation is kept exactly: never added, never dropped (NT / ND / NAD carry theirs).
  const negOut = set(plain, NEG).size > 0 || /\b(NT|ND|NAD|NBM|NPO|NWB|NST|NPDR|NIV|NHL)\b/.test(out);
  if (negOut !== set(input, NEG).size > 0) return "a negation";
  return null;
}

describe("table-wide guard", () => {
  const corpus = [
    ...new Set([
      ...HAND_RULES.map((r) => r.example),
      ...CORE_PAIRS.map(([p]) => p),
      ...Object.values(DEPARTMENT_PAIRS).flatMap((l) => l.map(([p]) => p)),
      "no pain no vomiting", "right knee right ankle swelling", "tender on the right side", "not passing flatus",
      "afebrile", "febrile", "range of movement", "pouch of douglas", "atrial flutter", "high risk",
      "partial response", "bullous pemphigoid", "per rectum", "no history of loss of consciousness",
      "left eye visual acuity counting fingers", "no deep vein thrombosis", "BP 120/80 PR 80",
    ]),
  ];

  it("no rule, in any department, adds a number, a side, a site or a negation, or swaps a finding", () => {
    const bad: string[] = [];
    for (const dept of DEPTS) {
      const rules = shorthandRules(dept);
      for (const input of corpus) {
        const out = shortFinding(input, dept);
        const why = addsNothing(input, out, rules);
        if (why) bad.push(`${dept ?? "core"}: "${input}" → "${out}" adds ${why}`);
      }
    }
    expect(bad).toEqual([]);
  });

  it("every lexicon pair is an abbreviation spelling its phrase", () => {
    const pairs = [...CORE_PAIRS, ...Object.values(DEPARTMENT_PAIRS).flat()];
    expect(pairs.filter(([p, a]) => !spells(a, p.split(" ")))).toEqual([]);
  });

  it("an abbreviation means one thing on any one ward", () => {
    const bad: string[] = [];
    for (const dept of DEPTS) {
      const byAbbr = new Map<string, Set<string>>();
      for (const r of shorthandRules(dept).filter((r) => !HAND_RULES.includes(r))) {
        const k = r.to.toUpperCase();
        if (!byAbbr.has(k)) byAbbr.set(k, new Set(HAND_RULES.filter((h) => h.to.toUpperCase() === k).map((h) => meaningKey(h.example))));
        byAbbr.get(k)!.add(meaningKey(r.example));
      }
      for (const [abbr, keys] of byAbbr) if (conflicting([...keys].filter(Boolean))) bad.push(`${dept ?? "core"}: ${abbr} = ${[...keys].join(" / ")}`);
    }
    expect(bad).toEqual([]);
  });

  it("covers every department pack", () => {
    // "general" is the pack with no department (lib/specialty/general.ts): core rules only.
    for (const k of SPECIALTY_KEYS.filter((k) => k !== "general")) expect(DEPARTMENT_PAIRS[k].length, k).toBeGreaterThanOrEqual(14);
  });

  it("every pair written in lexicon/ward-shorthand.ts makes it into a table", () => {
    const all = new Set([...CORE_PAIRS, ...Object.values(DEPARTMENT_PAIRS).flat()].map(([p, a]) => `${p}|${a}`));
    const missing = WARD_SHORTHAND.flatMap((e) => (e.aliases ?? []).map((a) => `${e.term}|${a}`)).filter((k) => !all.has(k));
    expect(missing).toEqual([]);
  });
});
