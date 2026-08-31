"use client";

import { useMemo, useState, useTransition } from "react";
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
  replaceTodayNoteExam,
  replaceActiveMedications,
  applyCompiledNote,
} from "./actions";

export type NoteObs = { kind: string; label: string; value: string | null };

const MED_PRESETS = [
  "Inj Ceftriaxone 1 g IV BD",
  "Inj Metronidazole 500 mg IV TDS",
  "Inj Pantoprazole 40 mg IV OD",
  "Inj Ondansetron 4 mg IV TDS",
  "Inj Paracetamol 1 g IV SOS",
  "Tab Paracetamol 650 mg PO TDS",
  "Inj Tramadol 50 mg IV SOS",
  "Inj Enoxaparin 40 mg SC OD",
  "IV fluids — RL / DNS alternately",
  "Inj Insulin (sliding scale)",
  "Nebulisation — Duolin / Budecort",
];

const COMPLAINT_PILLS = [
  "No fresh complaints",
  "Pain",
  "Vomiting",
  "Fever",
  "Not passed flatus",
  "Not passed stool",
  "Not tolerating orals",
  "Abdominal distension",
  "Cough",
  "Breathlessness",
  "Giddiness",
];
const SENSORIUM = ["Conscious & oriented", "Drowsy", "Altered sensorium", "Irritable"];
const ABDOMEN_PILLS = [
  "Soft",
  "Non-tender",
  "Tender",
  "Guarding",
  "Distended",
  "Non-distended",
  "Bowel sounds present",
  "Bowel sounds absent",
];
const CHEST_PILLS = ["Clear", "NVBS", "B/L air entry equal", "Added sounds", "Decreased air entry"];
const ASSESSMENT = ["Satisfactory", "Stable", "Improving", "Static", "Deteriorating"];
const PLAN_PILLS = [
  "Continue same treatment",
  "Start orals",
  "Step down antibiotics",
  "Stop IV fluids",
  "Remove drain",
  "Remove catheter",
  "Suture removal",
  "Chest physiotherapy",
  "Ambulate",
  "Repeat CBC",
  "Repeat RFT",
  "PAC / consent",
  "Plan for discharge",
  "Refer",
];
const VITALS: { key: string; label: string; ph: string }[] = [
  { key: "BP", label: "BP", ph: "120/80" },
  { key: "PR", label: "PR", ph: "84 /min" },
  { key: "RR", label: "RR", ph: "18 /min" },
  { key: "Temp", label: "Temp", ph: "Afebrile" },
  { key: "SpO2", label: "SpO₂", ph: "98% RA" },
  { key: "GRBS", label: "GRBS", ph: "—" },
];

type StepId =
  | "complaints"
  | "sensorium"
  | "vitals"
  | "abdomen"
  | "chest"
  | "bowel"
  | "assessment"
  | "plan"
  | "meds"
  | "review";

const STEPS: { id: StepId; title: string }[] = [
  { id: "complaints", title: "Complaints / overnight" },
  { id: "sensorium", title: "Sensorium" },
  { id: "vitals", title: "Vitals" },
  { id: "abdomen", title: "Per abdomen" },
  { id: "chest", title: "Chest" },
  { id: "bowel", title: "Flatus / stool" },
  { id: "assessment", title: "Assessment" },
  { id: "plan", title: "Plan" },
  { id: "meds", title: "Medications" },
  { id: "review", title: "Review & print" },
];

export default function NoteWorkspace({
  patientId,
  dateLabel,
  observations,
  currentMeds,
}: {
  patientId: string;
  dateLabel: string;
  observations: NoteObs[];
  currentMeds: string[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [step, setStep] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [dirty, setDirty] = useState<Set<StepId>>(new Set());
  const [generating, setGenerating] = useState<string | null>(null);

  const val = (aliases: string[]) =>
    observations.find((o) => aliases.includes(o.label.toLowerCase().trim()))?.value ?? "";
  const planSeed = useMemo(
    () => observations.filter((o) => o.kind === "plan").map((o) => (o.value ?? "").trim()).filter(Boolean),
    [observations]
  );

  const [complaints, setComplaints] = useState(() => val(["complaints", "c/o", "complaint"]));
  const [sensorium, setSensorium] = useState(() => val(["sensorium", "cns", "gcs"]));
  const [vitals, setVitals] = useState<Record<string, string>>(() => ({
    BP: val(["bp", "blood pressure"]),
    PR: val(["pr", "pulse", "pulse rate"]),
    RR: val(["rr", "respiratory rate"]),
    Temp: val(["temp", "temperature"]),
    SpO2: val(["spo2", "saturation", "oxygen saturation"]),
    GRBS: val(["grbs", "rbs", "cbg"]),
  }));
  const [abdomen, setAbdomen] = useState(() => val(["per abdomen", "abdomen", "p/a", "pa"]));
  const [chest, setChest] = useState(() => val(["chest", "respiratory system", "rs"]));
  const [flatus, setFlatus] = useState(() => val(["flatus", "passed flatus"]));
  const [stool, setStool] = useState(() => val(["stool", "motion", "bowels"]));
  const [assessment, setAssessment] = useState(() => val(["assessment"]));
  const [planItems, setPlanItems] = useState<string[]>(planSeed);
  const [meds, setMeds] = useState<string[]>(currentMeds);

  const [compiled, setCompiled] = useState<{
    fields: { complaints: string; sensorium: string; abdomen: string; chest: string; assessment: string };
    plan: string[];
    uncertain: string[];
  } | null>(null);

  const current = STEPS[step];
  const mark = (id: StepId) => {
    setDirty((s) => new Set(s).add(id));
    setMessage(null);
  };

  async function persist(id: StepId): Promise<boolean> {
    let res: { ok: boolean; error?: string } = { ok: true };
    if (id === "complaints") res = await replaceTodayNoteSection(patientId, "complaints", "note", complaints ? [complaints] : []);
    else if (id === "sensorium") res = await replaceTodayNoteExam(patientId, [{ label: "sensorium", kind: "exam", value: sensorium || null }]);
    else if (id === "vitals")
      res = await replaceTodayNoteExam(
        patientId,
        VITALS.map((v) => ({ label: v.key, kind: "vital" as const, value: vitals[v.key]?.trim() || null }))
      );
    else if (id === "abdomen") res = await replaceTodayNoteExam(patientId, [{ label: "per abdomen", kind: "exam", value: abdomen || null }]);
    else if (id === "chest") res = await replaceTodayNoteExam(patientId, [{ label: "chest", kind: "exam", value: chest || null }]);
    else if (id === "bowel")
      res = await replaceTodayNoteExam(patientId, [
        { label: "flatus", kind: "exam", value: flatus || null },
        { label: "stool", kind: "exam", value: stool || null },
      ]);
    else if (id === "assessment") res = await replaceTodayNoteSection(patientId, "assessment", "note", assessment ? [assessment] : []);
    else if (id === "plan") res = await replaceTodayNoteSection(patientId, "plan", "plan", planItems);
    else if (id === "meds") res = await replaceActiveMedications(patientId, meds);

    if (!res.ok) {
      setMessage(res.error ?? "Could not save — your edits are still here.");
      return false;
    }
    setDirty((s) => {
      const n = new Set(s);
      n.delete(id);
      return n;
    });
    return true;
  }

  function goTo(index: number) {
    if (index < 0 || index >= STEPS.length) return;
    if (dirty.has(current.id) && current.id !== "review") {
      const leaving = current.id;
      startTransition(async () => {
        await persist(leaving);
        router.refresh();
      });
    }
    setStep(index);
    setMenuOpen(false);
    if (typeof window !== "undefined") window.scrollTo({ top: 0 });
  }

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
      setMessage("Note rewritten. Open the printable sheet to sign and print.");
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
          <p className="text-[12px] leading-[1.45] text-muted">Overnight events and any fresh complaint. Tap what fits, add the rest.</p>
          <PillsAndText pills={COMPLAINT_PILLS} value={complaints} onChange={(v) => { setComplaints(v); mark("complaints"); }} placeholder="Overnight in the patient's words" />
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
        </div>
      );
    if (id === "vitals")
      return (
        <div className="grid grid-cols-2 gap-3">
          {VITALS.map((v) => (
            <Field key={v.key} label={v.label} value={vitals[v.key] ?? ""} onChange={(nv) => { setVitals({ ...vitals, [v.key]: nv }); mark("vitals"); }} placeholder={v.ph} />
          ))}
        </div>
      );
    if (id === "abdomen")
      return <PillsAndText pills={ABDOMEN_PILLS} value={abdomen} onChange={(v) => { setAbdomen(v); mark("abdomen"); }} placeholder="Anything else on the abdomen" />;
    if (id === "chest")
      return <PillsAndText pills={CHEST_PILLS} value={chest} onChange={(v) => { setChest(v); mark("chest"); }} placeholder="Anything else on the chest" />;
    if (id === "bowel")
      return (
        <div className="flex flex-col gap-3">
          {[
            { label: "Flatus", val: flatus, set: setFlatus },
            { label: "Stool", val: stool, set: setStool },
          ].map((row) => (
            <div key={row.label} className="flex items-center gap-2">
              <span className="w-16 text-[14px] font-medium">{row.label}</span>
              {["Passed", "Not passed"].map((o) => (
                <SelChip key={o} selected={row.val === o} onClick={() => { row.set(row.val === o ? "" : o); mark("bowel"); }}>
                  {o}
                </SelChip>
              ))}
            </div>
          ))}
        </div>
      );
    if (id === "assessment")
      return (
        <>
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
          <p className="text-[12px] leading-[1.45] text-muted">Today&rsquo;s jobs. Each tap adds a line; the AI can propose from the round.</p>
          <div className="flex flex-wrap gap-1.5">
            {PLAN_PILLS.map((p) => {
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
                  className="h-11 flex-1 rounded-[10px] border border-line bg-card px-3 text-[15px] outline-none focus:border-accent"
                />
                <button type="button" onClick={() => { setPlanItems(planItems.filter((_, j) => j !== i)); mark("plan"); }} className="shrink-0 px-2 text-[13px] text-muted">
                  Remove
                </button>
              </div>
            ))}
            <div className="flex gap-3">
              <button type="button" onClick={() => { setPlanItems([...planItems, ""]); mark("plan"); }} className="self-start text-[13px] font-medium text-accent">
                + Add a line
              </button>
              <button type="button" disabled={generating === "plan"} onClick={proposePlan} className="self-start text-[13px] font-medium text-accent disabled:opacity-50">
                {generating === "plan" ? "Thinking…" : "Propose with AI"}
              </button>
            </div>
          </div>
        </>
      );

    if (id === "meds")
      return (
        <>
          <p className="text-[12px] leading-[1.45] text-muted">
            What the patient is on right now — carried over from the last note. Edit doses, drop
            what was stopped, add what was started. This becomes the drug list on today&rsquo;s sheet.
          </p>
          <div className="flex flex-wrap gap-1.5">
            {MED_PRESETS.filter((p) => !meds.some((m) => m.toLowerCase().startsWith(p.split(/\s+\d/)[0].toLowerCase()))).map((p) => (
              <SelChip key={p} selected={false} onClick={() => { setMeds([...meds, p]); mark("meds"); }}>
                + {p.split(/\s+\d|\s+—/)[0]}
              </SelChip>
            ))}
          </div>
          <div className="flex flex-col gap-2">
            {meds.length === 0 && <p className="text-[13px] text-muted">No medications recorded.</p>}
            {meds.map((it, i) => (
              <div key={i} className="flex gap-2">
                <input
                  value={it}
                  onChange={(e) => { setMeds(meds.map((x, j) => (j === i ? e.target.value : x))); mark("meds"); }}
                  placeholder="Drug, dose, route, frequency"
                  className="h-11 flex-1 rounded-[10px] border border-line bg-card px-3 text-[15px] outline-none focus:border-accent"
                />
                <button type="button" onClick={() => { setMeds(meds.filter((_, j) => j !== i)); mark("meds"); }} className="shrink-0 px-2 text-[13px] text-muted">
                  Stop
                </button>
              </div>
            ))}
            <button type="button" onClick={() => { setMeds([...meds, ""]); mark("meds"); }} className="self-start text-[13px] font-medium text-accent">
              + Add a drug
            </button>
          </div>
        </>
      );

    // review
    return (
      <>
        <p className="text-[12px] leading-[1.45] text-muted">
          Bind the round into the progress-sheet phrasing, then open the printable sheet — it prints onto your unit&rsquo;s own form.
        </p>
        <button type="button" disabled={generating === "compile" || pending} onClick={compile} className={genBtn}>
          {generating === "compile" ? "Writing…" : compiled ? "Rewrite" : "Compile the note with AI"}
        </button>
        {compiled && (
          <>
            <UncertainList points={compiled.uncertain} />
            {(["complaints", "sensorium", "abdomen", "chest", "assessment"] as const).map((k) =>
              compiled.fields[k] ? (
                <div key={k} className="flex flex-col gap-1">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-muted">{k}</span>
                  <input
                    value={compiled.fields[k]}
                    onChange={(e) => setCompiled({ ...compiled, fields: { ...compiled.fields, [k]: e.target.value } })}
                    className="h-11 rounded-[10px] border border-line bg-card px-3 text-[15px] outline-none focus:border-accent"
                  />
                </div>
              ) : null
            )}
            {compiled.plan.length > 0 && (
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-muted">plan</span>
                {compiled.plan.map((p, i) => (
                  <input
                    key={i}
                    value={p}
                    onChange={(e) => setCompiled({ ...compiled, plan: compiled.plan.map((x, j) => (j === i ? e.target.value : x)) })}
                    className="h-10 rounded-[10px] border border-line bg-card px-3 text-[14px] outline-none focus:border-accent"
                  />
                ))}
              </div>
            )}
            <button type="button" onClick={applyCompiled} disabled={pending} className={approveBtn}>
              Apply to today&rsquo;s note
            </button>
          </>
        )}
        {dirty.size > 0 && <p className="text-[13px] text-orange-700">{dirty.size} card(s) not yet saved — step back into them.</p>}
        <Link href={`/patients/${patientId}/note`} className="mt-1 flex items-center justify-center rounded-[12px] bg-accent px-4 py-3 text-[16px] font-semibold text-accent-ink">
          Open the printable sheet →
        </Link>
      </>
    );
  }

  const pct = Math.round(((step + 1) / STEPS.length) * 100);

  return (
    <div className="flex flex-col gap-3 px-4 pb-40">
      <div className="ios-group overflow-hidden">
        <div className="px-4 pt-4 pb-3">
          <p className="text-[11.5px] font-semibold uppercase tracking-[0.03em] text-muted">
            Today&rsquo;s note · {dateLabel} · {step + 1} of {STEPS.length}
          </p>
          <div className="mt-0.5 flex items-start justify-between gap-2">
            <h2 className="text-[24px] font-bold leading-tight tracking-[-0.021em]">{current.title}</h2>
            {dirty.has(current.id) && statusChip("unsaved", "warn")}
          </div>
        </div>
        <div className="h-[3px] bg-[#e2e2e9]">
          <div className="h-full bg-accent transition-all" style={{ width: `${pct}%` }} />
        </div>
        <div className="flex flex-col gap-3 px-4 py-4">{body()}</div>
      </div>

      <button type="button" onClick={() => setMenuOpen((o) => !o)} className="self-center text-[13px] font-medium text-accent">
        {menuOpen ? "Hide cards" : "Jump to a card"}
      </button>
      {menuOpen && (
        <div className="ios-group flex flex-col p-1.5">
          {STEPS.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => goTo(i)}
              className={"flex items-center gap-2 rounded-[8px] px-2.5 py-2 text-left text-[14px] " + (i === step ? "bg-chip font-medium" : "")}
            >
              <span className={"h-2 w-2 shrink-0 rounded-full " + (dirty.has(s.id) ? "bg-orange-500" : "bg-line")} />
              <span className="text-muted">{i + 1}.</span>
              <span className="flex-1">{s.title}</span>
            </button>
          ))}
        </div>
      )}

      {message && <p className="text-[13px] text-muted">{message}</p>}

      <div className="fixed inset-x-0 bottom-0 z-10 mx-auto max-w-md border-t border-line bg-background/90 px-4 py-3 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => goTo(step - 1)} disabled={step === 0} className="rounded-[12px] border border-line px-5 py-3 text-[15px] font-semibold disabled:opacity-40">
            Back
          </button>
          {current.id === "review" ? (
            <Link href={`/patients/${patientId}/note`} className="flex-1 rounded-[12px] bg-accent px-4 py-3 text-center text-[16px] font-semibold text-accent-ink">
              Printable sheet
            </Link>
          ) : (
            <button type="button" onClick={() => goTo(step + 1)} className="flex-1 rounded-[12px] bg-accent px-4 py-3 text-[16px] font-semibold text-accent-ink">
              {dirty.has(current.id) ? "Save & next" : "Next"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
