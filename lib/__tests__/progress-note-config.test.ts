import { describe, expect, it } from "vitest";
import { buildProgressNote, type ProgressNotePatient } from "@/lib/progress-note";
import { systemPromptFor } from "@/lib/progress-note-ai";
import {
  PROGRESS_NOTE_CONFIGS,
  RESERVED_SECTION_IDS,
  progressNoteConfigFor,
} from "@/lib/progress-note-config";
import { SPECIALTY_KEYS } from "@/lib/specialty/types";
import { TREATMENT_ADVICE } from "@/lib/history-check/schema";
import type { Observation } from "@/lib/patient-state";
import { matchVitalLabel } from "@/lib/vital-ranges";
import { MED_PRESETS, medPresetsFor } from "@/app/patients/[id]/note/med-presets";

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
  it("every department has one, and an unknown key falls back to the general sheet", () => {
    for (const key of SPECIALTY_KEYS) expect(PROGRESS_NOTE_CONFIGS[key], key).toBeTruthy();
    expect(progressNoteConfigFor("no_such_ward")).toBe(PROGRESS_NOTE_CONFIGS.general);
    expect(progressNoteConfigFor(null)).toBe(PROGRESS_NOTE_CONFIGS.general);
    expect(PROGRESS_NOTE_CONFIGS.general.bowelLine).toBe(false);
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
    expect(gs.bedsideExample).toBeUndefined();
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
    expect(medPresetsFor("no_such_ward")).toEqual(medPresetsFor("general"));
    for (const p of medPresetsFor("general")) expect(p, p).not.toMatch(/ceftriaxone|metronidazole|tramadol|diclofenac/i);
    // A department without its own set keeps the one it always had.
    expect(medPresetsFor("orthopaedics")).toEqual(medPresetsFor("general_surgery"));
    for (const key of SPECIALTY_KEYS) for (const p of medPresetsFor(key)) expect(MED_PRESETS, p).toContain(p);
  });
});
