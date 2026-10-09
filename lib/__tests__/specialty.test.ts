import fs from "node:fs";
import { getDefinition } from "@/lib/scoring/definitions/registry";
import path from "node:path";
import { SPECIALTY_KEYS } from "@/lib/specialty/types";
import { burnsPlasticSurgeryPack } from "@/lib/specialty/burns-plastic-surgery";
import { listTrees } from "@/lib/history-check/trees";
import { describe, it, expect } from "vitest";
import {
  getSpecialtyPack,
  generalSurgeryPack,
  medicalOncologyPack,
  internalMedicinePack,
  obstetricsGynaecologyPack,
  listSpecialties,
  offersChecklistFamily,
} from "@/lib/specialty";
import { buildSystemPrompt } from "@/lib/extract";
import { dayLabel } from "@/lib/patients";
import { evaluateTrigger, type TriggerContext } from "@/lib/checklist-triggers";
import { matchDischargeTemplateFor, listDischargeTemplatesFor } from "@/lib/specialty/discharge";
import { HISTORY_SECTION_LABEL, sectionsForSpecialty } from "@/lib/case-history-sections";
import { caseHistorySectionOf, summariseCaseHistory } from "@/lib/case-history";

const surgical = { post_op_day: 2, admission_day: 4 };
const preOp = { post_op_day: null, admission_day: 1 };

describe("getSpecialtyPack — degrade, don't crash", () => {
  it("returns the general (no-department) pack for anything unrecognised, missing or empty", () => {
    for (const input of [null, undefined, "", "  ", "radiodiagnosis", "GENERAL SURGERY!!"]) {
      expect(getSpecialtyPack(input as string | null).key).toBe("general");
    }
    expect(getSpecialtyPack("general_surgery").key).toBe("general_surgery");
  });

  it("is case- and whitespace-insensitive about a real key", () => {
    expect(getSpecialtyPack("  Medical_Oncology ").key).toBe("medical_oncology");
    expect(getSpecialtyPack(" INTERNAL_MEDICINE ").key).toBe("internal_medicine");
    expect(getSpecialtyPack(" Obstetrics_Gynaecology ").key).toBe("obstetrics_gynaecology");
    expect(getSpecialtyPack(" Pulmonary_Medicine ").key).toBe("pulmonary_medicine");
    expect(getSpecialtyPack(" ENT ").key).toBe("ent");
    expect(getSpecialtyPack(" Psychiatry ").key).toBe("psychiatry");
    expect(getSpecialtyPack(" Ophthalmology ").key).toBe("ophthalmology");
    expect(getSpecialtyPack(" Dermatology ").key).toBe("dermatology");
    expect(getSpecialtyPack(" Burns_Plastic_Surgery ").key).toBe("burns_plastic_surgery");
    expect(getSpecialtyPack(" Orthopaedics ").key).toBe("orthopaedics");
    expect(getSpecialtyPack(" Urology ").key).toBe("urology");
    expect(getSpecialtyPack(" Neurosurgery ").key).toBe("neurosurgery");
    expect(getSpecialtyPack(" Paediatrics ").key).toBe("paediatrics");
    expect(getSpecialtyPack(" Emergency_Medicine ").key).toBe("emergency_medicine");
  });

  it("offers every pack to the picker", () => {
    expect(listSpecialties().map((p) => p.key)).toEqual([
      "general",
      "general_surgery",
      "medical_oncology",
      "internal_medicine",
      "obstetrics_gynaecology",
      "pulmonary_medicine",
      "ent",
      "psychiatry",
      "ophthalmology",
      "dermatology",
      "burns_plastic_surgery",
      "orthopaedics",
      "urology",
      "neurosurgery",
      "paediatrics",
      "emergency_medicine",
    ]);
  });

  it("every pack's history trees name trees that actually ship", () => {
    // A pack may lead its picker with the complaints its ward admits, but it cannot invent a
    // complaint: an id here with no tree behind it would silently sort nothing.
    const ids = new Set(listTrees().map((t) => t.id));
    for (const pack of listSpecialties()) {
      for (const id of pack.historyTreeIds) {
        expect({ pack: pack.key, id, known: ids.has(id) }).toEqual({ pack: pack.key, id, known: true });
      }
      expect(new Set(pack.historyTreeIds).size).toBe(pack.historyTreeIds.length);
    }
  });
});

describe("phase 0 is a no-op for a surgical unit", () => {
  it("day labels are exactly what they always were", () => {
    expect(dayLabel(surgical, generalSurgeryPack)).toBe("POD 2");
    expect(dayLabel(preOp, generalSurgeryPack)).toBe("Day 1");
    // No department counts hospital days, operated or not.
    expect(dayLabel(surgical)).toBe("Day 4");
  });

  it("POD 0 is still POD 0, not falsy-collapsed to the admission day", () => {
    expect(dayLabel({ post_op_day: 0, admission_day: 3 }, generalSurgeryPack)).toBe("POD 0");
  });

  it("the extraction prompt still opens as a surgical resident's note", () => {
    const prompt = buildSystemPrompt(generalSurgeryPack);
    expect(prompt.startsWith("You convert a surgical resident's spoken ward-round note")).toBe(true);
    // Neither surgery nor general appends guidance: the two prompts differ only in who is speaking.
    const general = getSpecialtyPack("general");
    expect(buildSystemPrompt()).toBe(prompt.replace(generalSurgeryPack.extractRoleLine, general.extractRoleLine));
    expect(general.extractRoleLine).not.toMatch(/surg/i);
    expect(general.operative).toBe(false);
    expect(generalSurgeryPack.operative).toBe(true);
  });

  it("chemotherapy fields on a surgical patient change nothing", () => {
    expect(dayLabel({ ...surgical, cycle_day: 3, cycle_number: 2 }, generalSurgeryPack)).toBe("POD 2");
  });
});

describe("burns counts from the burn, which happened before the admission", () => {
  const p = burnsPlasticSurgeryPack;

  it("counts post-burn days from 1 — the day of the injury is PBD 1", () => {
    expect(p.dayCount({ post_op_day: null, admission_day: 1, burn_day: 1 })).toEqual({
      clock: "burn",
      n: 1,
      text: "PBD 1",
    });
  });

  it("the burn clock leads even after grafting, and both numbers stay themselves", () => {
    // Burned on the 1st, grafted on the 12th: PBD 14 and POD 3 of the graft on the same day.
    // The ward speaks the first; the label names its clock so neither can be read as the other.
    expect(p.dayCount({ post_op_day: 3, admission_day: 13, burn_day: 14 }).text).toBe("PBD 14");
  });

  it("a plastic-surgery patient who was never burned counts post-operatively", () => {
    // A flap, a contracture release, a cleft: same unit, no burn date, surgical clock.
    expect(p.dayCount({ post_op_day: 2, admission_day: 4 })).toEqual({
      clock: "post_op",
      n: 2,
      text: "POD 2",
    });
  });

  it("with neither, it is the hospital day", () => {
    expect(p.dayCount({ post_op_day: null, admission_day: 5 }).text).toBe("Day 5");
  });

  it("a burn date that arrives as null changes nothing — the app counts as it always did", () => {
    expect(p.dayCount({ post_op_day: null, admission_day: 7, burn_day: null }).text).toBe("Day 7");
  });

  it("offers its own burn severity index and nothing borrowed", () => {
    expect(p.scoringKeys).toEqual(["absi"]);
  });
});

describe("medical oncology counts by the cycle", () => {
  const p = medicalOncologyPack;

  it("names the cycle and the day within it", () => {
    expect(p.dayCount({ post_op_day: null, admission_day: 2, cycle_day: 3, cycle_number: 2 }).text)
      .toBe("C2 D3");
  });

  it("counts the cycle day from 1, not 0 — day 1 is the day the drugs go up", () => {
    const d = p.dayCount({ post_op_day: null, admission_day: 1, cycle_day: 1, cycle_number: 1 });
    expect(d).toEqual({ clock: "cycle", n: 1, text: "C1 D1" });
  });

  it("drops the cycle prefix when the cycle number was never recorded", () => {
    expect(p.dayCount({ post_op_day: null, admission_day: 5, cycle_day: 4 }).text).toBe("D4");
  });

  it("falls back to the hospital day when there is no active cycle", () => {
    expect(p.dayCount({ post_op_day: null, admission_day: 6 })).toEqual({
      clock: "admission",
      n: 6,
      text: "Day 6",
    });
  });

  it("an operation does NOT start the count — a chemoport is not POD 0", () => {
    // A medical oncology patient who had a port inserted still reads by cycle, never POD.
    expect(p.dayCount({ post_op_day: 0, admission_day: 3, cycle_day: 2, cycle_number: 4 }).text)
      .toBe("C4 D2");
    expect(p.dayCount({ post_op_day: 1, admission_day: 3 }).text).toBe("Day 3");
  });

  it("its extraction prompt keeps every shared safety rule and adds ward guidance", () => {
    const prompt = buildSystemPrompt(p);
    expect(prompt.startsWith("You convert a medical oncology resident's")).toBe(true);
    expect(prompt).toContain("Never output a clinical value that is not present in the transcript");
    expect(prompt).toContain("source_quote that is copied VERBATIM");
    expect(prompt).toContain("CHEMOTHERAPY CYCLE DAY");
  });

  it("offers MASCC and no surgical scoring pathway", () => {
    expect(p.scoringKeys).toEqual(["mascc"]);
    expect(generalSurgeryPack.scoringKeys).toContain("acute_pancreatitis");
  });

  it("has no OT notes slot", () => {
    expect(p.formatKinds).not.toContain("ot_notes");
    expect(generalSurgeryPack.formatKinds).toContain("ot_notes");
  });
});

describe("internal medicine counts by the hospital day", () => {
  const p = internalMedicinePack;

  it("always reads the admission day — never POD, never a cycle", () => {
    expect(p.dayCount({ post_op_day: null, admission_day: 3 })).toEqual({
      clock: "admission",
      n: 3,
      text: "Day 3",
    });
    // The admission date is Day 0 — the unit's convention.
    expect(p.dayCount({ post_op_day: null, admission_day: 0 }).text).toBe("Day 0");
    // A bedside procedure (a tap, a line) must not flip a medicine patient to POD 0.
    expect(p.dayCount({ post_op_day: 0, admission_day: 4 }).text).toBe("Day 4");
    // Stray chemo fields (wrong-pack data) are ignored too.
    expect(p.dayCount({ post_op_day: null, admission_day: 5, cycle_day: 2, cycle_number: 1 }).text)
      .toBe("Day 5");
  });

  it("its extraction prompt is a physician's note and keeps every shared safety rule", () => {
    const prompt = buildSystemPrompt(p);
    expect(prompt.startsWith("You convert a physician's spoken ward-round note")).toBe(true);
    expect(prompt).toContain("Never output a clinical value that is not present in the transcript");
    expect(prompt).toContain("source_quote that is copied VERBATIM");
    expect(prompt).toContain("HOSPITAL DAY");
    expect(prompt).toContain("There is no post-op day on this ward");
  });

  it("offers its medicine scores (incl. the batch-2 cross-listed ones) and no surgical pathway, and no OT notes slot", () => {
    expect(p.scoringKeys).toEqual([
      "curb_65",
      "qsofa",
      "cha2ds2_vasc",
      "has_bled",
      "wells_dvt",
      "wells_pe",
      "dka_severity",
      "heart_score",
      "ciwa_ar",
      "child_pugh",
      "kdigo_aki",
    ]);
    expect(p.scoringKeys).not.toContain("acute_pancreatitis");
    expect(p.scoringKeys).not.toContain("nsti");
    expect(p.scoringKeys).not.toContain("perforation_peritonitis");
    expect(p.formatKinds).not.toContain("ot_notes");
  });

  it("anchors its checklist on admission, not the operation", () => {
    expect(p.checklistAnchor).toBe("admission");
  });

  it("ships the condition-keyed templates plus the generic fallback (published 2026-09-13)", () => {
    // MEDICINE_DISCHARGE_TEMPLATES was deliberately empty through the pilot build; published
    // for alpha testing on the product owner's direction — see the file header.
    expect(p.dischargeTemplates.length).toBeGreaterThan(10);
    expect(listDischargeTemplatesFor(p).map((t) => t.key)).toContain(p.genericDischargeTemplate.key);
    expect(matchDischargeTemplateFor(p, { diagnosisText: "dengue fever with warning signs" })?.key).toBe("dengue");
  });

  it("pre-fills typical medicines, but never a number for a titrated or organ-dependent drug", () => {
    // Changed 2026-09-28 on the product owner's direction: medicine now pre-fills a starting set
    // like every other department. What must still never be guessed is a dose that is titrated
    // on the ward or set by organ function or a specialist.
    for (const t of p.dischargeTemplates) expect(t.scaffold.medications.length, t.key).toBeGreaterThan(0);
    expect(p.genericDischargeTemplate.scaffold.medications).toEqual([]);
    const titrated = /insulin|glargine|amlodipine|telmisartan|chlorthalidone|prednisolone|hydroxychloroquine|mycophenolate|azathioprine|att|isoniazid|rifampicin|tenofovir|dolutegravir|cotrimoxazole|metformin|hypoglycaemic/i;
    for (const t of p.dischargeTemplates) {
      for (const m of t.scaffold.medications.filter((m) => titrated.test(m.generic))) {
        expect(`${m.strength ?? ""} ${m.dose ?? ""}`, `${t.key}: ${m.generic}`).not.toMatch(/\d/);
      }
    }
  });
});

describe("every department's scores", () => {
  it("every scoring key a department lists names a registered pathway", () => {
    for (const p of listSpecialties()) {
      // Any status: a draft is registered but not yet offered (see registry.ts).
      for (const k of p.scoringKeys) expect(getDefinition(k, "1.0.0"), `${p.key}: ${k}`).toBeTruthy();
    }
  });

  it("every department except ophthalmology has at least one score (no validated ward score exists for eye)", () => {
    for (const p of listSpecialties()) {
      if (p.key === "ophthalmology") expect(p.scoringKeys).toEqual([]);
      else expect(p.scoringKeys.length, p.key).toBeGreaterThan(0);
    }
  });
});

describe("every department's own discharge templates", () => {
  const packs = SPECIALTY_KEYS.map((k) => getSpecialtyPack(k));

  it("every department has condition templates and a generic that never auto-matches", () => {
    for (const p of packs) {
      // The general pack is department-neutral: only its generic, never another department's.
      if (p.key !== "general") expect(p.dischargeTemplates.length, p.key).toBeGreaterThan(0);
      const keys = [...p.dischargeTemplates, p.genericDischargeTemplate].map((t) => t.key);
      expect(new Set(keys).size, `${p.key} has a duplicate template key`).toBe(keys.length);
      for (const probe of ["cataract", "tonsillectomy", "fever", "LSCS", "fracture", ""]) {
        expect(p.genericDischargeTemplate.match.test(probe), `${p.key} generic matched "${probe}"`).toBe(false);
      }
    }
  });

  it("only general surgery and medicine share their sets — nobody borrows any more", () => {
    const owners = new Map<unknown, string>();
    for (const p of packs) {
      const prior = owners.get(p.dischargeTemplates);
      expect(prior, `${p.key} borrows ${prior}'s templates`).toBeUndefined();
      owners.set(p.dischargeTemplates, p.key);
    }
  });

  it("a paediatric (or infant) template never states a dose", () => {
    const infant = [
      ...getSpecialtyPack("paediatrics").dischargeTemplates,
      ...getSpecialtyPack("neurosurgery").dischargeTemplates.filter((t) => /myelomeningocele/i.test(t.label)),
      ...getSpecialtyPack("burns_plastic_surgery").dischargeTemplates.filter((t) => /cleft/i.test(t.label)),
    ];
    expect(infant.length).toBeGreaterThan(10);
    for (const t of infant) {
      for (const m of t.scaffold.medications) {
        expect(`${m.strength ?? ""} ${m.dose ?? ""}`, `${t.key}: ${m.generic}`).not.toMatch(/\d/);
      }
    }
  });

  it("each department picks its own template for its commonest operation", () => {
    const pick = (k: string, text: string) => matchDischargeTemplateFor(getSpecialtyPack(k), { procedureText: text })?.key;
    expect(pick("ophthalmology", "SICS with PCIOL right eye")).toBe("eye_cataract");
    expect(pick("ent", "Tonsillectomy")).toBe("ent_tonsillectomy");
    expect(pick("urology", "TURP")).toBe("uro_turp");
    expect(pick("orthopaedics", "Total knee replacement")).toBe("ortho_arthroplasty");
    expect(pick("neurosurgery", "VP shunt")).toBe("ns_vp_shunt");
  });
});

describe("obstetrics & gynaecology counts like a surgical unit, not a medicine one", () => {
  const p = obstetricsGynaecologyPack;

  it("an operated or delivered patient reads POD; everyone else reads the admission day", () => {
    expect(p.dayCount(surgical)).toEqual({ clock: "post_op", n: 2, text: "POD 2" });
    expect(p.dayCount(preOp)).toEqual({ clock: "admission", n: 1, text: "Day 1" });
    // POD 0 (delivered/operated today) must not collapse to the admission day.
    expect(p.dayCount({ post_op_day: 0, admission_day: 1 })).toEqual({
      clock: "post_op",
      n: 0,
      text: "POD 0",
    });
  });

  it("its extraction prompt is an O&G resident's note and keeps every shared safety rule", () => {
    const prompt = buildSystemPrompt(p);
    expect(prompt.startsWith("You convert an obstetrics and gynaecology resident's")).toBe(true);
    expect(prompt).toContain("Never output a clinical value that is not present in the transcript");
    expect(prompt).toContain("source_quote that is copied VERBATIM");
    expect(prompt).toContain("GRAVIDA/PARA");
    expect(prompt).toContain("Do not decide PIH versus pre-eclampsia versus eclampsia yourself");
  });

  it("offers MEOWS and no surgical or medicine scoring pathway", () => {
    expect(p.scoringKeys).toEqual(["meows"]);
  });

  it("keeps the OT notes slot — unlike internal medicine, this ward operates", () => {
    expect(p.formatKinds).toContain("ot_notes");
  });

  it("anchors its (not-yet-seeded) checklist on the operation/delivery, the surgical model", () => {
    expect(p.checklistAnchor).toBe("post_op");
  });

  it("ships its own condition templates — LSCS is picked before a normal delivery", () => {
    expect(p.dischargeTemplates.length).toBeGreaterThan(5);
    expect(listDischargeTemplatesFor(p).map((t) => t.key)).toContain(p.genericDischargeTemplate.key);
    expect(matchDischargeTemplateFor(p, { procedureText: "Emergency LSCS" })?.key).toBe("obg_lscs");
    expect(matchDischargeTemplateFor(p, { procedureText: "Normal vaginal delivery" })?.key).toBe("obg_nvd");
  });

  it("uses its own lexicon core, not the surgical or medicine one", () => {
    expect(p.lexiconSpecialty).toBe("obstetrics-gynaecology");
  });
});

describe("cycle-anchored checklist triggers", () => {
  const base: TriggerContext = {
    values: "",
    postOpDay: null,
    hoursSinceSurgery: null,
    hoursSinceAdmission: null,
    hasValue: () => false,
    labs: [],
  };

  it("cycle_day_gte fires only on an active cycle at or past the day", () => {
    const t = { when: [{ type: "cycle_day_gte" as const, days: 8 }] };
    expect(evaluateTrigger(t, { ...base, cycleDay: 8 }).active).toBe(true);
    expect(evaluateTrigger(t, { ...base, cycleDay: 7 }).active).toBe(false);
    expect(evaluateTrigger(t, base).active).toBe(false);
  });

  it("day_of_cycle means cycle day 1", () => {
    const t = { when: [{ type: "day_of_cycle" as const }] };
    expect(evaluateTrigger(t, { ...base, cycleDay: 1 }).active).toBe(true);
    expect(evaluateTrigger(t, { ...base, cycleDay: 2 }).active).toBe(false);
  });

  it("on_regimen needs a recorded regimen", () => {
    const t = { when: [{ type: "on_regimen" as const }] };
    expect(evaluateTrigger(t, { ...base, onRegimen: true }).active).toBe(true);
    expect(evaluateTrigger(t, { ...base, onRegimen: false }).active).toBe(false);
  });

  it("a surgical patient never trips a cycle condition", () => {
    const t = {
      when: [{ type: "cycle_day_gte" as const, days: 1 }, { type: "on_regimen" as const }],
    };
    expect(evaluateTrigger(t, { ...base, postOpDay: 3, hoursSinceSurgery: 72 }).active).toBe(false);
  });
});

describe("discharge templates follow the unit", () => {
  it("febrile neutropenia matches the oncology set, not the surgical one", () => {
    const onc = matchDischargeTemplateFor(medicalOncologyPack, {
      diagnosisText: "febrile neutropenia post chemotherapy",
    });
    expect(onc?.key).toBe("febrile_neutropenia");
    expect(
      matchDischargeTemplateFor(generalSurgeryPack, { diagnosisText: "febrile neutropenia" })
    ).toBeNull();
  });

  it("an operation matches the surgical set, not the oncology one", () => {
    expect(
      matchDischargeTemplateFor(generalSurgeryPack, { diagnosisText: "carcinoma breast for MRM" })
        ?.key
    ).toBe("breast_ca");
  });

  it("every oncology template goes home with the fever red flag", () => {
    const all = [
      ...medicalOncologyPack.dischargeTemplates,
      medicalOncologyPack.genericDischargeTemplate,
    ];
    expect(all.length).toBeGreaterThan(5);
    for (const t of all) {
      expect(t.scaffold.redFlags.some((r) => /100\.4|38 °C/.test(r))).toBe(true);
    }
  });

  it("a checklist family picks the matching oncology summary", () => {
    // What the ward list sets on a patient (care_templates.family, seeded by patch 0061) has
    // to reach the right discharge template even when nobody typed a diagnosis.
    expect(
      matchDischargeTemplateFor(medicalOncologyPack, { templateFamily: "febrile_neutropenia" })
        ?.key
    ).toBe("febrile_neutropenia");
    expect(
      matchDischargeTemplateFor(medicalOncologyPack, { templateFamily: "myeloma" })?.key
    ).toBe("myeloma");
  });

  it("each unit's checklist picker reads its own phase", () => {
    expect(generalSurgeryPack.pickerPhase).toBe("after_surgery");
    // A medical oncology patient never has an operation date, so phaseFor() computes
    // before_surgery for them — the picker has to offer the rows filed under it.
    expect(medicalOncologyPack.pickerPhase).toBe("before_surgery");
  });

  it("the picker lists the unit's own templates plus its generic fallback", () => {
    const keys = listDischargeTemplatesFor(medicalOncologyPack).map((t) => t.key);
    expect(keys).toContain("chemo_cycle");
    expect(keys).toContain("oncology_generic");
    expect(keys).not.toContain("breast_ca");
  });
});

describe("the oncology clerking card stack", () => {
  it("adds the four disease cards and performance status, in that order", () => {
    const onc = sectionsForSpecialty("medical_oncology");
    expect(onc).toEqual(
      expect.arrayContaining([
        "onco_disease",
        "onco_treatment",
        "onco_cycle",
        "onco_toxicity",
        "performance",
      ])
    );
    // The order they are walked in: the disease, what was given, what is running, the damage.
    const idx = (k: string) => onc.indexOf(k as (typeof onc)[number]);
    expect(idx("onco_disease")).toBeLessThan(idx("onco_treatment"));
    expect(idx("onco_treatment")).toBeLessThan(idx("onco_cycle"));
    expect(idx("onco_cycle")).toBeLessThan(idx("onco_toxicity"));
  });

  it("gives a surgical unit exactly the sections it always had", () => {
    const surgical = sectionsForSpecialty("general_surgery");
    for (const k of ["onco_disease", "onco_treatment", "onco_cycle", "onco_toxicity", "performance"]) {
      expect(surgical).not.toContain(k);
    }
    expect(surgical).toContain("complaints");
    expect(surgical).toContain("abdomen");
  });

  it("an unknown or missing specialty gets the base set, never another unit's cards", () => {
    for (const key of [null, undefined, "", "cardiology"]) {
      expect(sectionsForSpecialty(key)).toEqual(sectionsForSpecialty("general_surgery"));
    }
  });

  it("every oncology section has somewhere to be stored", () => {
    for (const k of ["onco_disease", "onco_treatment", "onco_cycle", "onco_toxicity", "performance"]) {
      expect(HISTORY_SECTION_LABEL[k]).toBeTruthy();
    }
  });

  it("the oncology sections read back out of the record they were written to", () => {
    // The label written by the workspace has to resolve to the card that shows it, or a saved
    // clerking would reappear as unfiled 'other'.
    expect(caseHistorySectionOf("oncological history")).toBe("onco_disease");
    expect(caseHistorySectionOf("treatment received")).toBe("onco_treatment");
    expect(caseHistorySectionOf("current cycle")).toBe("onco_cycle");
    expect(caseHistorySectionOf("toxicity since last cycle")).toBe("onco_toxicity");
    expect(caseHistorySectionOf("performance status")).toBe("performance");
  });

  it("none of them prints on a clerking that never filled them", () => {
    // alwaysShow is false for every oncology section, so a surgical case sheet does not grow
    // five "NR" lines it has no way to answer.
    const view = summariseCaseHistory([
      { id: "1", kind: "note", label: "chief complaints", value_text: "pain abdomen 2 days" },
    ]);
    const keys = view.sections.filter((s) => !s.hidden).map((s) => s.key);
    expect(keys).not.toContain("onco_disease");
    expect(keys).not.toContain("performance");
  });

  it("but does print once the oncology clerking has filled it", () => {
    const view = summariseCaseHistory([
      { id: "1", kind: "note", label: "oncological history", value_text: "Ca left breast, IDC grade 2, cT2N1M0" },
    ]);
    const disease = view.sections.find((s) => s.key === "onco_disease");
    expect(disease?.hidden).toBe(false);
    expect(disease?.lines[0].text).toContain("IDC grade 2");
  });
});

describe("the oncology examination cards", () => {
  it("adds a node survey and a mucosa/skin/line card after performance status", () => {
    const onc = sectionsForSpecialty("medical_oncology");
    expect(onc).toEqual(expect.arrayContaining(["onco_nodes", "onco_mucosa_line"]));
    const idx = (k: string) => onc.indexOf(k as (typeof onc)[number]);
    expect(idx("performance")).toBeLessThan(idx("onco_nodes"));
  });

  it("never reaches a non-oncology unit", () => {
    const surgical = sectionsForSpecialty("general_surgery");
    expect(surgical).not.toContain("onco_nodes");
    expect(surgical).not.toContain("onco_mucosa_line");
  });

  it("has a label to be stored under", () => {
    expect(HISTORY_SECTION_LABEL.onco_nodes).toBe("lymph node survey");
    expect(HISTORY_SECTION_LABEL.onco_mucosa_line).toBe("mucosa, skin and vascular access");
  });

  it("falls through to the generic exam bucket on the patient page, same as local examination", () => {
    // Neither label is in exam-summary.ts's SYSTEM_NAMES, so both print as-is rather than
    // being relabelled — the same path "local examination" already takes.
    const view = summariseCaseHistory([
      { id: "1", kind: "exam", label: "lymph node survey", value_text: "Cervical — enlarged, 1.5 cm" },
    ]);
    // Not one of the four HistorySection keys, so it comes back in `other` for the exam
    // summary to render, not silently dropped.
    expect(view.other.some((o) => o.label === "lymph node survey")).toBe(true);
  });
});

describe("offersChecklistFamily — the picker follows the department chosen at unit setup", () => {
  it("keeps oncology and medicine apart, though both are filed under before_surgery", () => {
    expect(offersChecklistFamily(medicalOncologyPack, "chemo_cycle")).toBe(true);
    expect(offersChecklistFamily(medicalOncologyPack, "dengue")).toBe(false);
    expect(offersChecklistFamily(internalMedicinePack, "dengue")).toBe(true);
    expect(offersChecklistFamily(internalMedicinePack, "febrile_neutropenia")).toBe(false);
  });

  it("offers general surgery its own procedure checklists (0097 / 0098) and no other department", () => {
    const families = ["breast_surgery", "colorectal_resection", "gastrectomy", "thyroidectomy", "abscess_debridement",
      "acute_pancreatitis", "perforation_peritonitis", "intestinal_obstruction", "acute_cholecystitis"];
    for (const f of families) {
      expect(offersChecklistFamily(generalSurgeryPack, f), f).toBe(true);
      for (const other of listSpecialties().filter((p) => p.key !== "general_surgery")) {
        expect(offersChecklistFamily(other, f), `${other.key}: ${f}`).toBe(false);
      }
    }
  });

  it("gives the one pack with no list of its own every family no other pack claims", () => {
    // The operations, which live only in care_templates and are never listed in a pack.
    expect(offersChecklistFamily(generalSurgeryPack, "lap_chole")).toBe(true);
    // A claimed one is not on offer here, even by fallback.
    expect(offersChecklistFamily(generalSurgeryPack, "dka")).toBe(false);
  });

  it("never hands a department another department's checklists", () => {
    // Before their own rows existed these departments were given an empty list, so an eye unit
    // was never offered "Lap chole" or an O&G unit an appendicectomy. Now every department has
    // its own (patches 0089–0091), and still none of them is offered surgery's or medicine's.
    for (const pack of listSpecialties().filter((p) => p.checklistFamilies !== null)) {
      if (pack.key === "internal_medicine" || pack.key === "medical_oncology") continue;
      // The general pack has no department, so deliberately no checklists of its own.
      if (pack.key !== "general") expect(pack.checklistFamilies?.length, pack.key).toBeGreaterThan(0);
      for (const family of ["lap_chole", "appendicectomy", "dka", "chemo_cycle"]) {
        expect(offersChecklistFamily(pack, family), `${pack.key}: ${family}`).toBe(false);
      }
    }
  });

  it("every family a department lists is seeded as a picker row by some patch", () => {
    // A family with no care_templates row can never be picked, so the list would be a lie.
    const dir = path.join(process.cwd(), "supabase/patches");
    const sql = fs.readdirSync(dir).filter((f) => f.endsWith(".sql")).map((f) => fs.readFileSync(path.join(dir, f), "utf8")).join("\n");
    for (const pack of listSpecialties()) {
      for (const family of pack.checklistFamilies ?? []) {
        expect(sql.includes(`'${family}'`), `${pack.key}: ${family}`).toBe(true);
      }
    }
  });

  it("lets a neighbouring department share rows on purpose, not by accident", () => {
    const pulmonary = getSpecialtyPack("pulmonary_medicine");
    // Its casemix, borrowed from medicine along with the discharge templates and Wells scores.
    for (const family of ["cap", "pulmonary_tb", "vte_suspected"]) {
      expect(offersChecklistFamily(pulmonary, family)).toBe(true);
      expect(offersChecklistFamily(internalMedicinePack, family)).toBe(true);
    }
    // The rest of medicine's list is not a chest ward's.
    for (const family of ["dka", "sle_flare", "enteric_fever"]) {
      expect(offersChecklistFamily(pulmonary, family)).toBe(false);
    }
  });
});

describe("discharge template: the diagnosis head decides, not a trailing mention", () => {
  const pick = (procedureText: string, diagnosisText: string) =>
    matchDischargeTemplateFor(generalSurgeryPack, { procedureText, diagnosisText })?.key ?? null;

  it("a trailing SAIO no longer picks the obstruction template", () => {
    expect(
      pick(
        "Incision and drainage",
        "Deep organ space SSI ? Post op bile leak with s/p lap cholecystectomy with post exp. laparotomy ivo pyoperitoneum and SAIO With I&D"
      )
    ).toBe("abscess_drainage");
  });

  it("the head still wins over a more specific word in the tail", () => {
    expect(pick("", "Acute appendicitis with localised peritonitis")).toBe("appendicectomy");
    expect(pick("Exploratory laparotomy", "Duodenal ulcer perforation with peritonitis")).toBe("perforation");
    expect(pick("", "SAIO due to adhesions")).toBe("obstruction");
  });

  it("falls back to everything together when the head names nothing", () => {
    expect(pick("", "Pain abdomen with cholelithiasis")).toBe("lap_chole");
  });
});
