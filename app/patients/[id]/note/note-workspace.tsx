"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Field } from "../discharge/discharge-fields";
import {
  SelChip,
  OptionRow,
  statusChip,
  genBtn,
  approveBtn,
  DictateArea,
  UncertainList,
  PillsAndText,
} from "../card-kit";
import {
  replaceTodayNoteSection,
  replaceTodayNoteVitals,
  replaceTodayNoteExam,
  replaceActiveMedications,
  applyCompiledNote,
} from "./actions";
import { medPresetsFor } from "./med-presets";
import LiveDictation, { DictateButton, routeVia, type LiveLine, type LiveSection } from "../live-dictation";
import type { NoteVitalField, ProgressNoteConfig } from "@/lib/progress-note-config";

const vitalKey = (k: string) => `vital:${k.replace(/\W+/g, "_")}`;
const appendTo = (prev: string, add: string) => (prev.trim() ? `${prev.trim()}; ${add}` : add);

export type NoteObs = { kind: string; label: string; value: string | null };

const SENSORIUM_ALIASES = ["sensorium", "cns", "gcs"];
const SENSORIUM = ["Conscious & oriented", "Drowsy", "Altered sensorium", "Irritable"];
const ASSESSMENT = ["Satisfactory", "Stable", "Improving", "Static", "Deteriorating"];
// Placeholders are a dash, never a plausible reading: a grey "120/80" in an empty field reads
// as a recorded value at a glance on a phone.
const SHARED_VITALS: NoteVitalField[] = [
  { key: "BP", label: "BP", ph: "—", aliases: ["bp", "blood pressure"] },
  { key: "PR", label: "PR", ph: "—", aliases: ["pr", "pulse", "pulse rate"] },
  { key: "RR", label: "RR", ph: "—", aliases: ["rr", "respiratory rate"] },
  { key: "Temp", label: "Temp", ph: "—", aliases: ["temp", "temperature"] },
  { key: "SpO2", label: "SpO₂", ph: "—", aliases: ["spo2", "saturation", "oxygen saturation"] },
  { key: "GRBS", label: "GRBS", ph: "—", aliases: ["grbs", "rbs", "cbg"] },
  // Anything here means the patient is on the ICU/HDU — it flags them Critical on the ward
  // list. Free text so the resident can note the support ("on noradrenaline 0.08", "HFNC").
  { key: "ICU", label: "ICU / support", ph: "e.g. on noradrenaline 0.08", aliases: ["icu", "icu / support", "support"] },
];

/** The shared cards are fixed ids; each department's exam cards use their section id. */
type StepId = string;

/** The card order: the lines every sheet shares, with this department's exam cards (and the
 *  Flatus / Stool card where the ward keeps it) in the middle — the order the sheet prints. */
function stepsFor(config: ProgressNoteConfig): { id: StepId; title: string }[] {
  return [
    { id: "complaints", title: "Complaints / overnight" },
    { id: "sensorium", title: "Sensorium" },
    { id: "vitals", title: "Vitals" },
    ...config.examSections.map((sec) => ({ id: sec.id, title: sec.title })),
    ...(config.bowelLine ? [{ id: "bowel", title: "Flatus / stool" }] : []),
    { id: "assessment", title: "Assessment" },
    { id: "plan", title: "Plan" },
    { id: "meds", title: "Medications" },
    { id: "review", title: "Review & print" },
  ];
}

export default function NoteWorkspace({
  patientId,
  dateLabel,
  observations,
  yesterday = [],
  currentMeds,
  suggestedAssessment = "",
  noteConfig,
  medPresets = medPresetsFor(null),
  focus = null,
}: {
  patientId: string;
  dateLabel: string;
  observations: NoteObs[];
  /** Yesterday's round, newest value per label — the source for each card's "Same as
   *  yesterday" shortcut, and the grey hint under each vital. */
  yesterday?: NoteObs[];
  currentMeds: string[];
  /** A pre-fill for the Assessment card on a routine round — "" when nothing should be
   *  suggested (no round yet today, or something on it reads as concerning). */
  suggestedAssessment?: string;
  /** This department's exam cards and chips — lib/progress-note-config.ts. */
  noteConfig: ProgressNoteConfig;
  /** This ward's one-tap drugs — ./med-presets.ts medPresetsFor(). */
  medPresets?: string[];
  /** What to check today for this diagnosis — the matching discharge template's `progressNote`.
   *  Read-only: never saved, never prefilled into a card, never sent to the AI compile. */
  focus?: string | null;
}) {
  const STEPS = useMemo(() => stepsFor(noteConfig), [noteConfig]);
  const VITALS = useMemo(() => [...SHARED_VITALS, ...(noteConfig.extraVitals ?? [])], [noteConfig]);
  // A label one of this ward's vitals fields owns (a GCS field) is not also the Sensorium card's.
  const sensoriumAliases = SENSORIUM_ALIASES.filter((a) => !VITALS.some((v) => v.aliases.includes(a)));
  const sectionById = (id: string) => noteConfig.examSections.find((sec) => sec.id === id);
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [step, setStep] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [generating, setGenerating] = useState<string | null>(null);

  const val = (aliases: string[]) =>
    observations.find((o) => aliases.includes(o.label.toLowerCase().trim()))?.value ?? "";
  const yVal = (aliases: string[]) =>
    yesterday.find((o) => aliases.includes(o.label.toLowerCase().trim()))?.value ?? "";

  // The Assessment card is pre-filled only when nothing was recorded there yet and the round
  // looked routine. Seed it into `dirty` so "Save & next" commits it if the resident agrees by
  // simply moving on; touching any chip keeps it dirty anyway.
  const assessmentPrefilled = !val(["assessment"]) && !!suggestedAssessment;
  const [dirty, setDirty] = useState<Set<StepId>>(
    () => new Set(assessmentPrefilled ? (["assessment"] as StepId[]) : [])
  );
  const planSeed = useMemo(
    () => observations.filter((o) => o.kind === "plan").map((o) => (o.value ?? "").trim()).filter(Boolean),
    [observations]
  );

  const [complaints, setComplaints] = useState(() => val(["complaints", "c/o", "complaint"]));
  const [sensorium, setSensorium] = useState(() => val(sensoriumAliases));
  const [vitals, setVitals] = useState<Record<string, string>>(() =>
    Object.fromEntries(VITALS.map((v) => [v.key, val(v.aliases)]))
  );
  const [exam, setExam] = useState<Record<string, string>>(() =>
    Object.fromEntries(noteConfig.examSections.map((sec) => [sec.id, val(sec.aliases)]))
  );
  const [flatus, setFlatus] = useState(() => val(["flatus", "passed flatus"]));
  const [stool, setStool] = useState(() => val(["stool", "motion", "bowels"]));
  const [assessment, setAssessment] = useState(() => val(["assessment"]) || suggestedAssessment);
  const [planItems, setPlanItems] = useState<string[]>(planSeed);
  const [meds, setMeds] = useState<string[]>(currentMeds);

  const [compiled, setCompiled] = useState<{
    fields: Record<string, string>;
    plan: string[];
    uncertain: string[];
  } | null>(null);

  // Cards filled by "Same as yesterday" since their last save — any number in them is saved
  // amber, for the resident to confirm, rather than as today's confirmed finding.
  const [carried, setCarried] = useState<Set<StepId>>(() => new Set());
  const carry = (id: StepId) => setCarried((s) => new Set(s).add(id));

  // Live dictation: the sections snapshot what each card held when it opened, so the panel
  // shows old text and this session's lines apart. Dictated lines land in the cards' own state
  // and are saved as amber wherever they carry a number or a drug.
  const [live, setLive] = useState<LiveSection[] | null>(null);
  const dictatedMeds = useRef(new Set<string>());
  const toSave = useRef(new Set<StepId>());
  const liveSections = (): LiveSection[] => [
    { key: "complaints", label: "Complaints / overnight", existing: complaints },
    { key: "sensorium", label: "Sensorium", existing: sensorium },
    ...VITALS.map((v) => ({ key: vitalKey(v.key), label: v.label, existing: vitals[v.key] })),
    ...noteConfig.examSections.map((sec) => ({ key: sec.id, label: sec.title, existing: exam[sec.id] })),
    ...(noteConfig.bowelLine
      ? [
          { key: "flatus", label: "Flatus", existing: flatus },
          { key: "stool", label: "Stool", existing: stool },
        ]
      : []),
    { key: "assessment", label: "Assessment", existing: assessment },
    { key: "plan", label: "Plan", existing: planItems.join("; ") },
    { key: "meds", label: "Medications", existing: meds.join("; "), drug: true },
  ];
  function applyDictation(lines: LiveLine[]) {
    const touched = new Set<StepId>();
    for (const { section: k, text } of lines) {
      const vital = VITALS.find((v) => vitalKey(v.key) === k);
      if (k === "complaints") setComplaints((p) => appendTo(p, text));
      else if (k === "sensorium") setSensorium((p) => appendTo(p, text));
      else if (vital) setVitals((p) => ({ ...p, [vital.key]: text }));
      else if (sectionById(k)) setExam((p) => ({ ...p, [k]: appendTo(p[k] ?? "", text) }));
      else if (k === "flatus" || k === "stool") {
        if (!/^(not )?passed\.?$/i.test(text)) continue;
        (k === "flatus" ? setFlatus : setStool)(/^not/i.test(text) ? "Not passed" : "Passed");
      } else if (k === "assessment") setAssessment((p) => appendTo(p, text));
      else if (k === "plan") setPlanItems((p) => [...p, text]);
      else if (k === "meds") {
        dictatedMeds.current.add(text);
        setMeds((p) => [...p, text]);
      } else continue;
      touched.add(vital ? "vitals" : k === "flatus" || k === "stool" ? "bowel" : k);
    }
    setDirty((s) => new Set([...s, ...touched]));
    setCarried((s) => new Set([...s, ...touched]));
    touched.forEach((id) => toSave.current.add(id));
  }
  // Save every card dictation touched once the panel closes — they are not all the card on
  // screen, and leaving the page only flushes that one. Runs after the render that holds them.
  const [saveTick, setSaveTick] = useState(0);
  useEffect(() => {
    const ids = [...toSave.current];
    toSave.current.clear();
    if (ids.length === 0) return;
    startTransition(async () => {
      for (const id of ids) if (!(await persist(id))) return;
      setMessage(`${ids.length} card(s) filled by dictation and saved — anything amber needs your check.`);
      router.refresh();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saveTick]);

  const current = STEPS[step];
  const mark = (id: StepId) => {
    setDirty((s) => new Set(s).add(id));
    setMessage(null);
  };

  async function persist(id: StepId): Promise<boolean> {
    let res: { ok: boolean; error?: string } = { ok: true };
    const c = carried.has(id);
    if (id === "complaints") res = await replaceTodayNoteSection(patientId, "complaints", "note", complaints ? [complaints] : [], c);
    else if (id === "sensorium") res = await replaceTodayNoteExam(patientId, [{ label: "sensorium", kind: "exam", value: sensorium || null, carried: c }]);
    else if (id === "vitals")
      res = await replaceTodayNoteVitals(
        patientId,
        VITALS.map((v) => ({ label: v.key, value: vitals[v.key]?.trim() || null })),
        c
      );
    else if (sectionById(id)) {
      const sec = sectionById(id)!;
      res = await replaceTodayNoteExam(patientId, [{ label: sec.label, kind: "exam", value: exam[sec.id] || null, carried: c }]);
    }
    else if (id === "bowel")
      res = await replaceTodayNoteExam(patientId, [
        { label: "flatus", kind: "exam", value: flatus || null, carried: c },
        { label: "stool", kind: "exam", value: stool || null, carried: c },
      ]);
    else if (id === "assessment") res = await replaceTodayNoteSection(patientId, "assessment", "note", assessment ? [assessment] : [], c);
    else if (id === "plan") res = await replaceTodayNoteSection(patientId, "plan", "plan", planItems, c);
    else if (id === "meds") res = await replaceActiveMedications(patientId, meds, [...dictatedMeds.current]);

    if (!res.ok) {
      setMessage(res.error ?? "Could not save — your edits are still here.");
      return false;
    }
    const drop = (s: Set<StepId>) => {
      const n = new Set(s);
      n.delete(id);
      return n;
    };
    setDirty(drop);
    setCarried(drop);
    return true;
  }

  /** Leaving a changed card saves it first; a failed save keeps the resident on the card with
   *  the error in the bottom bar, rather than moving on as if it had landed. */
  function goTo(index: number) {
    if (index < 0 || index >= STEPS.length || pending) return;
    const move = () => {
      setStep(index);
      setMenuOpen(false);
      window.scrollTo({ top: 0 });
    };
    if (!dirty.has(current.id) || current.id === "review") return move();
    const leaving = current.id;
    startTransition(async () => {
      if (!(await persist(leaving))) return;
      move();
      router.refresh();
    });
  }

  // Leaving the builder altogether — "‹ Patient", another tab, closing the page — saves the card
  // being edited, without blocking the navigation. Only the current card: the Assessment
  // pre-fill is committed by the resident moving past it, never on a card they have not seen.
  const flushRef = useRef<() => void>(() => {});
  useEffect(() => {
    flushRef.current = () => {
      if (dirty.has(current.id) && current.id !== "review") void persist(current.id);
    };
  });
  useEffect(() => {
    const flush = () => flushRef.current();
    window.addEventListener("pagehide", flush);
    return () => {
      window.removeEventListener("pagehide", flush);
      flush();
    };
  }, []);

  async function compile() {
    setGenerating("compile");
    setMessage(null);
    // Flush anything unsaved first so the compile sees it.
    for (const id of Array.from(dirty)) {
      if (id !== "review") await persist(id);
    }
    try {
      const r = await fetch(`/api/patients/${patientId}/note/generate`, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
      const data = await r.json();
      if (!r.ok) setMessage(data.error ?? "Could not compile.");
      else
        setCompiled({
          fields: data.fields,
          plan: Array.isArray(data.plan) ? data.plan : [],
          uncertain: data.uncertainPoints ?? [],
        });
    } catch {
      setMessage("No signal. Try again.");
    }
    setGenerating(null);
  }

  function applyCompiled() {
    if (!compiled) return;
    startTransition(async () => {
      const res = await applyCompiledNote(patientId, { fields: compiled.fields, plan: compiled.plan });
      if (!res.ok) return setMessage(res.error ?? "Could not apply.");
      setCompiled(null);
      setMessage("Note rewritten. Open the print sheet to sign and print.");
      router.refresh();
    });
  }

  async function proposePlan() {
    setGenerating("plan");
    try {
      const r = await fetch(`/api/patients/${patientId}/note/generate`, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
      const data = await r.json();
      if (r.ok && Array.isArray(data.plan) && data.plan.length) {
        setPlanItems((prev) => [...prev, ...data.plan.filter((p: string) => !prev.includes(p))]);
        mark("plan");
      } else if (!r.ok) setMessage(data.error ?? "Could not propose.");
    } catch {
      setMessage("No signal.");
    }
    setGenerating(null);
  }

  function body(): React.ReactNode {
    const id = current.id;
    if (id === "complaints")
      return (
        <>
          <p className="text-caption leading-[1.45] text-muted">Overnight events and any fresh complaint. Tap what fits, add the rest.</p>
          <PillsAndText pills={noteConfig.complaintPills} value={complaints} onChange={(v) => { setComplaints(v); mark("complaints"); }} placeholder="Overnight in the patient's words" />
          <YesterdayButton text={yVal(["complaints", "c/o", "complaint"])} onUse={(v) => { setComplaints(v); mark("complaints"); carry("complaints"); }} />
        </>
      );
    if (id === "sensorium")
      return (
        <div className="flex flex-col gap-2">
          {SENSORIUM.map((s) => (
            <OptionRow key={s} selected={sensorium.startsWith(s)} onClick={() => { setSensorium(s); mark("sensorium"); }}>
              {s}
            </OptionRow>
          ))}
          <DictateArea value={sensorium} onChange={(v) => { setSensorium(v); mark("sensorium"); }} placeholder="Or describe it" rows={2} />
          <YesterdayButton text={yVal(sensoriumAliases)} onUse={(v) => { setSensorium(v); mark("sensorium"); carry("sensorium"); }} />
        </div>
      );
    if (id === "vitals")
      return (
        // Today's vitals are measured, never carried over — yesterday's reading is shown only as
        // a grey hint under each field.
        <div className="grid grid-cols-2 gap-3">
          {VITALS.map((v) => {
            const y = yVal(v.aliases);
            return (
              <div key={v.key} className="flex flex-col gap-1">
                <Field label={v.label} value={vitals[v.key] ?? ""} onChange={(nv) => { setVitals({ ...vitals, [v.key]: nv }); mark("vitals"); }} placeholder={v.ph} />
                {y && <p className="text-caption2 text-muted">Yesterday {y}</p>}
              </div>
            );
          })}
        </div>
      );
    const sec = sectionById(id);
    if (sec) {
      const set = (v: string) => { setExam({ ...exam, [sec.id]: v }); mark(sec.id); };
      return (
        <>
          <PillsAndText pills={sec.pills} value={exam[sec.id] ?? ""} onChange={set} placeholder={sec.placeholder} />
          <YesterdayButton text={yVal(sec.aliases)} onUse={(v) => { set(v); carry(sec.id); }} />
        </>
      );
    }
    if (id === "bowel")
      return (
        <div className="flex flex-col gap-3">
          {[
            { label: "Flatus", val: flatus, set: setFlatus },
            { label: "Stool", val: stool, set: setStool },
          ].map((row) => (
            <div key={row.label} className="flex items-center gap-2">
              <span className="w-16 text-subhead font-medium">{row.label}</span>
              {["Passed", "Not passed"].map((o) => (
                <SelChip key={o} selected={row.val === o} onClick={() => { row.set(row.val === o ? "" : o); mark("bowel"); }}>
                  {o}
                </SelChip>
              ))}
            </div>
          ))}
          <YesterdayButton
            text={[yVal(["flatus", "passed flatus"]), yVal(["stool", "motion", "bowels"])].filter(Boolean).join(" · ")}
            label="Same as yesterday"
            onUse={() => {
              const f = yVal(["flatus", "passed flatus"]);
              const s = yVal(["stool", "motion", "bowels"]);
              if (f) setFlatus(f);
              if (s) setStool(s);
              mark("bowel");
              carry("bowel");
            }}
          />
        </div>
      );
    if (id === "assessment")
      return (
        <>
          {assessmentPrefilled && assessment === suggestedAssessment && (
            <p className="text-caption leading-[1.45] text-muted">
              Pre-filled from a routine round. Change it if it doesn&rsquo;t fit.
            </p>
          )}
          <div className="flex flex-wrap gap-1.5">
            {ASSESSMENT.map((a) => (
              <SelChip key={a} selected={assessment.startsWith(a)} onClick={() => { setAssessment(a); mark("assessment"); }}>
                {a}
              </SelChip>
            ))}
          </div>
          <DictateArea value={assessment} onChange={(v) => { setAssessment(v); mark("assessment"); }} placeholder="Add to the assessment" rows={2} />
        </>
      );
    if (id === "plan")
      return (
        <>
          <p className="text-caption leading-[1.45] text-muted">Today&rsquo;s jobs. Each tap adds a line; the AI can propose from the round.</p>
          <div className="flex flex-wrap gap-1.5">
            {noteConfig.planPills.map((p) => {
              const on = planItems.includes(p);
              return (
                <SelChip key={p} selected={on} onClick={() => { setPlanItems(on ? planItems.filter((x) => x !== p) : [...planItems, p]); mark("plan"); }}>
                  {p}
                </SelChip>
              );
            })}
          </div>
          <div className="flex flex-col gap-2">
            {planItems.map((it, i) => (
              <div key={i} className="flex gap-2">
                <input
                  value={it}
                  onChange={(e) => { setPlanItems(planItems.map((x, j) => (j === i ? e.target.value : x))); mark("plan"); }}
                  className="h-11 flex-1 rounded-[10px] border border-line bg-card px-3 text-subhead outline-none focus:border-accent"
                />
                <button type="button" onClick={() => { setPlanItems(planItems.filter((_, j) => j !== i)); mark("plan"); }} className="tap shrink-0 px-2 text-footnote text-muted">
                  Remove
                </button>
              </div>
            ))}
            <div className="flex gap-3">
              <button type="button" onClick={() => { setPlanItems([...planItems, ""]); mark("plan"); }} className="tap self-start text-footnote font-medium text-accent">
                + Add a line
              </button>
              <button type="button" disabled={generating === "plan"} onClick={proposePlan} className="tap self-start text-footnote font-medium text-accent disabled:opacity-50">
                {generating === "plan" ? "Thinking…" : "Propose with AI"}
              </button>
            </div>
          </div>
        </>
      );

    if (id === "meds")
      return (
        <>
          <p className="text-caption leading-[1.45] text-muted">
            What the patient is on right now — carried over from the last note. Edit doses, drop
            what was stopped, add what was started. This becomes the drug list on today&rsquo;s sheet.
          </p>
          <div className="flex flex-wrap gap-1.5">
            {medPresets.filter((p) => !meds.some((m) => m.toLowerCase().startsWith(p.split(/\s+\d/)[0].toLowerCase()))).map((p) => (
              <SelChip key={p} selected={false} onClick={() => { setMeds([...meds, p]); mark("meds"); }}>
                + {p}
              </SelChip>
            ))}
          </div>
          <div className="flex flex-col gap-2">
            {meds.length === 0 && <p className="text-footnote text-muted">No medications recorded.</p>}
            {meds.map((it, i) => (
              <div key={i} className="flex gap-2">
                <input
                  value={it}
                  onChange={(e) => { setMeds(meds.map((x, j) => (j === i ? e.target.value : x))); mark("meds"); }}
                  placeholder="Drug, dose, route, frequency"
                  className="h-11 flex-1 rounded-[10px] border border-line bg-card px-3 text-subhead outline-none focus:border-accent"
                />
                <button type="button" onClick={() => { setMeds(meds.filter((_, j) => j !== i)); mark("meds"); }} className="tap shrink-0 px-2 text-footnote text-muted">
                  Stop
                </button>
              </div>
            ))}
            <button type="button" onClick={() => { setMeds([...meds, ""]); mark("meds"); }} className="tap self-start text-footnote font-medium text-accent">
              + Add a drug
            </button>
          </div>
        </>
      );

    // review
    return (
      <>
        <p className="text-caption leading-[1.45] text-muted">
          Bind the round into the progress-sheet phrasing, then open the print sheet — it prints onto your unit&rsquo;s own form.
        </p>
        <button type="button" disabled={generating === "compile" || pending} onClick={compile} className={genBtn}>
          {generating === "compile" ? "Writing…" : compiled ? "Rewrite" : "Compile the note with AI"}
        </button>
        {compiled && (
          <>
            <UncertainList points={compiled.uncertain} />
            {[
              { k: "complaints", title: "complaints" },
              { k: "sensorium", title: "sensorium" },
              ...noteConfig.examSections.map((sec) => ({ k: sec.id, title: sec.title })),
              { k: "assessment", title: "assessment" },
            ].map(({ k, title }) =>
              compiled.fields[k] ? (
                <div key={k} className="flex flex-col gap-1">
                  <span className="text-caption2 font-semibold uppercase tracking-wide text-muted">{title}</span>
                  <input
                    value={compiled.fields[k]}
                    onChange={(e) => setCompiled({ ...compiled, fields: { ...compiled.fields, [k]: e.target.value } })}
                    className="h-11 rounded-[10px] border border-line bg-card px-3 text-subhead outline-none focus:border-accent"
                  />
                </div>
              ) : null
            )}
            {compiled.plan.length > 0 && (
              <div className="flex flex-col gap-1">
                <span className="text-caption2 font-semibold uppercase tracking-wide text-muted">plan</span>
                {compiled.plan.map((p, i) => (
                  <input
                    key={i}
                    value={p}
                    onChange={(e) => setCompiled({ ...compiled, plan: compiled.plan.map((x, j) => (j === i ? e.target.value : x)) })}
                    className="h-10 rounded-[10px] border border-line bg-card px-3 text-subhead outline-none focus:border-accent"
                  />
                ))}
              </div>
            )}
            <button type="button" onClick={applyCompiled} disabled={pending} className={approveBtn}>
              Apply to today&rsquo;s note
            </button>
          </>
        )}
        {dirty.size > 0 && <p className="text-footnote text-warn-fg">{dirty.size} card(s) not yet saved — step back into them.</p>}
      </>
    );
  }

  const pct = Math.round(((step + 1) / STEPS.length) * 100);

  return (
    <div className="flex flex-col gap-3 px-4 pb-[var(--bar-height)]">
      {live && (
        <LiveDictation
          patientId={patientId}
          title="Dictating today's note"
          example="e.g. “no fresh complaints overnight… BP 120 by 80, pulse 84… chest clear, abdomen soft… continue same treatment…”"
          sections={live}
          route={routeVia(patientId, live)}
          onLines={applyDictation}
          onClose={() => {
            setLive(null);
            setSaveTick((t) => t + 1);
          }}
        />
      )}
      {!live && (
        <DictateButton
          title="Dictate today's note"
          sub="Speak the whole round — each part fills its card as you talk."
          onClick={() => setLive(liveSections())}
        />
      )}
      {focus && (
        <details className="ios-group px-4 py-3">
          <summary className="tap cursor-pointer text-footnote font-medium text-accent">What to check today</summary>
          <p className="mt-2 text-caption leading-[1.45] text-muted">{focus}</p>
        </details>
      )}
      <div className="ios-group overflow-hidden">
        <div className="px-4 pt-4 pb-3">
          <p className="text-caption2 font-semibold uppercase tracking-[0.03em] text-muted">
            Today&rsquo;s note · {dateLabel} · {step + 1} of {STEPS.length}
          </p>
          <div className="mt-0.5 flex items-start justify-between gap-2">
            <h2 className="text-title1 font-bold leading-tight tracking-[-0.021em]">{current.title}</h2>
            {dirty.has(current.id) && statusChip("unsaved", "warn")}
          </div>
        </div>
        <div className="h-[3px] bg-chip">
          <div className="h-full bg-accent transition-all" style={{ width: `${pct}%` }} />
        </div>
        <div className="flex flex-col gap-3 px-4 py-4">{body()}</div>
      </div>

      <button type="button" onClick={() => setMenuOpen((o) => !o)} className="tap self-center text-footnote font-medium text-accent">
        {menuOpen ? "Hide cards" : "Jump to a card"}
      </button>
      {menuOpen && (
        <div className="ios-group flex flex-col p-1.5">
          {STEPS.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => goTo(i)}
              className={"flex items-center gap-2 rounded-[8px] px-2.5 py-2 text-left text-subhead " + (i === step ? "bg-chip font-medium" : "")}
            >
              <span className={"h-2 w-2 shrink-0 rounded-full " + (dirty.has(s.id) ? "bg-warn-fg" : "bg-line")} />
              <span className="text-muted">{i + 1}.</span>
              <span className="flex-1">{s.title}</span>
            </button>
          ))}
        </div>
      )}

      <div className="bottom-bar fixed inset-x-0 bottom-0 z-10 mx-auto max-w-md border-t border-line bg-background/90 px-4 pt-3 backdrop-blur-xl">
        {message && <p role="status" className="pb-2 text-footnote text-muted">{message}</p>}
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => goTo(step - 1)} disabled={step === 0 || pending} className="rounded-[12px] border border-line px-5 py-3 text-subhead font-semibold disabled:opacity-40">
            Back
          </button>
          {current.id === "review" ? (
            <Link href={`/patients/${patientId}/note`} className="flex-1 rounded-[12px] bg-accent px-4 py-3 text-center text-callout font-semibold text-accent-ink">
              Print sheet
            </Link>
          ) : (
            <button type="button" onClick={() => goTo(step + 1)} disabled={pending} className="flex-1 rounded-[12px] bg-accent px-4 py-3 text-callout font-semibold text-accent-ink disabled:opacity-60">
              {pending ? "Saving…" : dirty.has(current.id) ? "Save & next" : "Next"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/** The shortcut on each card for a patient whose findings have not changed overnight. Renders
 *  nothing when yesterday's round has no value for this line. */
function YesterdayButton({
  text,
  label = "Same as yesterday:",
  onUse,
}: {
  text: string;
  label?: string;
  onUse: (v: string) => void;
}) {
  if (!text.trim()) return null;
  return (
    <button
      type="button"
      onClick={() => onUse(text)}
      className="tap self-start text-left text-footnote font-medium text-accent"
    >
      {label} <span className="font-normal text-muted">{text}</span>
    </button>
  );
}
