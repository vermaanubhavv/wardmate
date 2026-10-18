import { describe, expect, it } from "vitest";
import { buildProgressNote, type ProgressNotePatient } from "@/lib/progress-note";
import { systemPromptFor } from "@/lib/progress-note-ai";
import {
  MED_PRESETS,
  PROGRESS_NOTE_CONFIGS,
  RESERVED_SECTION_IDS,
  medPresetsFor,
  openSpaceHeadings,
  progressNoteConfigFor,
} from "@/lib/progress-note-config";
import { SPECIALTY_KEYS } from "@/lib/specialty/types";
import { TREATMENT_ADVICE } from "@/lib/history-check/schema";
import type { Observation } from "@/lib/patient-state";
import { matchVitalLabel } from "@/lib/vital-ranges";

const obs = (kind: string, label: string, value_text: string | null): Observation =>
  ({
    id: "id",
    kind,
    label,
    value_text,
    value_num: null,
    unit: null,
    source_quote: "",
    needs_confirmation: false,
    confirmed_at: null,
    conflict_note: null,
    done_at: null,
    urgency: null,
    graded_at: null,
    recorded_at: "2026-09-18T04:00:00.000Z",
  }) as Observation;

const patient: ProgressNotePatient = {
  display_name: "Test Patient",
  age_years: 40,
  sex: "female",
  bed: "4",
  uhid_ip_no: null,
  mrd_no: null,
  admitted_on: "2026-09-15T00:00:00.000Z",
};

describe("progress-note configs", () => {
  it("every department has one, and an unknown key falls back to general surgery", () => {
    for (const key of SPECIALTY_KEYS) expect(PROGRESS_NOTE_CONFIGS[key], key).toBeTruthy();
    expect(progressNoteConfigFor("no_such_ward")).toBe(PROGRESS_NOTE_CONFIGS.general_surgery);
    expect(progressNoteConfigFor(null)).toBe(PROGRESS_NOTE_CONFIGS.general_surgery);
  });

  it("section ids are unique, snake_case and never a shared card; labels and aliases lowercase", () => {
    for (const [key, config] of Object.entries(PROGRESS_NOTE_CONFIGS)) {
      const ids = config.examSections.map((s) => s.id);
      expect(new Set(ids).size, key).toBe(ids.length);
      for (const s of config.examSections) {
        expect(s.id, `${key}.${s.id}`).toMatch(/^[a-z][a-z0-9_]*$/);
        expect(RESERVED_SECTION_IDS, `${key}.${s.id}`).not.toContain(s.id);
        expect(s.label, `${key}.${s.id}`).toBe(s.label.toLowerCase());
        expect(s.aliases, `${key}.${s.id}`).toContain(s.label);
        for (const a of s.aliases) expect(a, `${key}.${s.id}`).toBe(a.toLowerCase());
      }
      // Two sections of one department must not claim the same stored label.
      const labels = config.examSections.map((s) => s.label);
      expect(new Set(labels).size, key).toBe(labels.length);
    }
  });

  it("no chip carries a dose or a drug regimen", () => {
    for (const [key, config] of Object.entries(PROGRESS_NOTE_CONFIGS)) {
      const chips = [...config.complaintPills, ...config.planPills, ...config.examSections.flatMap((s) => s.pills)];
      for (const c of chips) expect(TREATMENT_ADVICE.test(c), `${key}: "${c}"`).toBe(false);
    }
  });

  it("general surgery keeps P/Abdomen, Chest and Flatus / Stool", () => {
    const note = buildProgressNote(patient, [], [], null, { noteConfig: PROGRESS_NOTE_CONFIGS.general_surgery });
    expect(note.observation.some((l) => l.startsWith("P/Abdomen -"))).toBe(true);
    expect(note.observation.some((l) => l.startsWith("Chest -"))).toBe(true);
    expect(note.observation.some((l) => l.startsWith("Flatus / Stool -"))).toBe(true);
  });

  it("an eye ward prints each eye and no bowel line, with today's finding against the right eye", () => {
    const todays = [obs("exam", "right eye", "Cornea clear, AC quiet, IOL in place")];
    const note = buildProgressNote(patient, todays, todays, "Cataract", {
      noteConfig: PROGRESS_NOTE_CONFIGS.ophthalmology,
    });
    expect(note.observation).toContain("RE - Cornea clear, AC quiet, IOL in place");
    expect(note.observation).toContain("LE -");
    expect(note.observation.some((l) => l.startsWith("P/Abdomen") || l.startsWith("Flatus"))).toBe(false);
    expect(note.objective).toContain("RE - Cornea clear, AC quiet, IOL in place");
  });

  it("the AI is told which ward it is on and asked for that ward's exam lines", () => {
    const gs = systemPromptFor(PROGRESS_NOTE_CONFIGS.general_surgery);
    expect(gs).toContain("general-surgery ward");
    expect(gs).toContain('"abdomen": string');
    const psych = systemPromptFor(PROGRESS_NOTE_CONFIGS.psychiatry);
    expect(psych).toContain("psychiatry ward");
    expect(psych).toContain('"mood": string');
    expect(psych).not.toContain('"abdomen": string');
  });

  it("general surgery prints Wound and a drains line, and a dictated drain output lands on it", () => {
    const todays = [obs("drain", "drain output", "Pelvic drain 40 ml serous")];
    const note = buildProgressNote(patient, todays, todays, null, { noteConfig: PROGRESS_NOTE_CONFIGS.general_surgery });
    expect(note.observation.some((l) => l.startsWith("Wound -"))).toBe(true);
    expect(note.observation).toContain("Drains / tubes / I-O - Pelvic drain 40 ml serous");
  });
});

describe("medicine's daily note", () => {
  const im = PROGRESS_NOTE_CONFIGS.internal_medicine;
  const gs = PROGRESS_NOTE_CONFIGS.general_surgery;

  it("general surgery is unchanged: its four exam cards, no extra vitals, the surgical Type example", () => {
    expect(gs.examSections.map((s) => s.id)).toEqual(["abdomen", "wound", "drains", "chest"]);
    expect(gs.extraVitals).toBeUndefined();
    expect(gs.bedsideExample).toBe("Day 3 post lap chole, afebrile, drain 30 ml serous…");
  });

  it("medicine has a CNS card, nothing pre-filled, printing once and not on the OE line", () => {
    expect(im.examSections.map((s) => s.id)).toEqual(["cvs", "chest", "abdomen", "nervous_system"]);
    const cns = im.examSections.find((s) => s.id === "nervous_system")!;
    expect(cns.pills).toEqual(expect.arrayContaining(["Plantars flexor", "Neck stiffness", "Reflexes brisk"]));
    const todays = [obs("exam", "nervous system", "Power 4/5 right upper limb, plantars flexor")];
    const note = buildProgressNote(patient, todays, todays, null, { noteConfig: im });
    expect(note.observation).toContain("CNS - Power 4/5 right upper limb, plantars flexor");
    expect(note.observation).toContain("OE - Conscious Oriented");
  });

  it("medicine's Vitals card adds urine output / I-O and GCS, neither read as another vital", () => {
    expect(im.extraVitals?.map((v) => v.key)).toEqual(["Urine output", "GCS"]);
    for (const v of im.extraVitals ?? []) {
      expect(matchVitalLabel(v.key), v.key).toBeNull();
      for (const a of v.aliases) expect(matchVitalLabel(a), a).toBeNull();
    }
  });
});

describe("medication presets", () => {
  it("medicine gets its own short set with no NSAID; every ward's chip still saves amber", () => {
    const im = medPresetsFor("internal_medicine");
    expect(im).toContain("Inj Pantoprazole 40 mg IV OD");
    for (const p of im) expect(p, p).not.toMatch(/diclofenac|ibuprofen|aceclofenac|ketorolac|naproxen|tramadol/i);
    expect(medPresetsFor("general_surgery")).toContain("Inj Tramadol 50 mg IV SOS");
    expect(medPresetsFor("no_such_ward")).toEqual(medPresetsFor("general_surgery"));
    for (const key of SPECIALTY_KEYS) for (const p of medPresetsFor(key)) expect(MED_PRESETS, p).toContain(p);
  });
});

describe("per-ward presets, examples and print spacing", () => {
  const SURGICAL = medPresetsFor("general_surgery");

  it("surgery keeps its list; operative wards share it", () => {
    expect(SURGICAL).toContain("Inj Metronidazole 500 mg IV TDS");
    for (const key of ["orthopaedics", "urology", "burns_plastic_surgery"]) expect(medPresetsFor(key)).toEqual(SURGICAL);
  });

  it("non-surgical wards never get tramadol, an NSAID or metronidazole; children get none", () => {
    expect(medPresetsFor("paediatrics")).toEqual([]);
    for (const key of ["internal_medicine", "medical_oncology", "pulmonary_medicine", "psychiatry", "dermatology", "emergency_medicine"]) {
      for (const p of medPresetsFor(key)) {
        expect(p, `${key}: ${p}`).not.toMatch(/diclofenac|ibuprofen|aceclofenac|ketorolac|naproxen|tramadol|metronidazole/i);
      }
    }
    expect(medPresetsFor("medical_oncology")).toContain("Inj Ondansetron 8 mg IV TDS");
  });

  it("every ward has its own examples; non-surgical ones are not surgical", () => {
    for (const key of SPECIALTY_KEYS) {
      expect(PROGRESS_NOTE_CONFIGS[key].bedsideExample, key).toBeTruthy();
      expect(PROGRESS_NOTE_CONFIGS[key].dictationExample, key).toBeTruthy();
    }
    for (const key of ["internal_medicine", "medical_oncology", "paediatrics", "psychiatry", "dermatology", "emergency_medicine"] as const) {
      const c = PROGRESS_NOTE_CONFIGS[key];
      expect(`${c.bedsideExample} ${c.dictationExample}`, key).not.toMatch(/lap chole|drain|oral sips/i);
    }
    expect(PROGRESS_NOTE_CONFIGS.general_surgery.dictationExample).toBe(
      "no fresh complaints… BP 120 by 80, pulse 84… abdomen soft… drain 50 ml serous… start oral sips…"
    );
  });

  it("open-space headings: surgery exactly as before, others from their own exam lines", () => {
    expect(openSpaceHeadings(PROGRESS_NOTE_CONFIGS.general_surgery)).toEqual(["C/O", "P/Abdomen", "Chest", "Assessment", "Flatus / Stool"]);
    expect(openSpaceHeadings(PROGRESS_NOTE_CONFIGS.internal_medicine)).toEqual(["C/O", "CVS", "Chest", "P/Abdomen", "CNS", "Assessment"]);
    const note = buildProgressNote(patient, [], [], null, { noteConfig: PROGRESS_NOTE_CONFIGS.paediatrics });
    expect(note.openSpace).toEqual(openSpaceHeadings(PROGRESS_NOTE_CONFIGS.paediatrics));
  });
});
