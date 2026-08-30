"use client";

import { useRef, useState } from "react";
import { PAPER_KINDS, type PaperKind } from "@/lib/read-paper";
import type { DischargeDocument } from "@/lib/discharge-render";
import type { DischargeDraft, MedicationStatus } from "@/lib/discharge-entities";
import { MEDICATION_STATUSES, CONDITION_VARIABLES } from "@/lib/discharge-entities";
import { listDischargeTemplates, matchDischargeTemplate } from "@/lib/discharge-templates";
import DischargeSheet from "../../patients/[id]/discharge/sheet";
import PrintButton from "../../patients/[id]/note/print-button";
import { Field, Area, StringList } from "../../patients/[id]/discharge/discharge-fields";

type LabValue = {
  label: string;
  value_text: string;
  value_num: number | null;
  unit: string | null;
  source_quote: string;
  uncertain: boolean;
  ref_low: number | null;
  ref_high: number | null;
  ref_text: string | null;
};

type Page = {
  id: string;
  fileName: string;
  status: "reading" | "read" | "failed";
  error: string | null;
  kind: PaperKind;
  kindConfidence: "high" | "low";
  transcript: string;
  unreadable: string | null;
  labValues: LabValue[] | null;
  procedure: string | null;
  surgeryDate: string | null;
  include: boolean;
};

const uid = () => (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `r-${Date.now()}`);

/**
 * A discharge summary for somebody who is not in WardMate.
 *
 * Nothing is stored. What is new here: the resident picks the DIAGNOSIS, and the sections that
 * are standard for it (indication phrasing, the operation skeleton, wound-care advice, the
 * red-flag list, the follow-up actions) arrive pre-structured with `[ … ]` blanks — a general
 * template for that diagnosis, to fill rather than to write from scratch. See
 * lib/discharge-templates.ts.
 */
export default function OneOff() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [pages, setPages] = useState<Page[]>([]);
  const [identity, setIdentity] = useState({
    name: "",
    age: "",
    sex: "",
    ipNo: "",
    mrdNo: "",
    admittedOn: "",
    diagnosis: "",
    procedure: "",
    surgeryDate: "",
  });
  const [templateKey, setTemplateKey] = useState<string>("auto");
  const [usedTemplateLabel, setUsedTemplateLabel] = useState<string | null>(null);
  const templates = listDischargeTemplates();

  const [draft, setDraft] = useState<DischargeDraft | null>(null);
  const [doc, setDoc] = useState<DischargeDocument | null>(null);
  const [building, setBuilding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function addFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const fresh: Page[] = Array.from(files).map((file) => ({
      id: uid(),
      fileName: file.name,
      status: "reading",
      error: null,
      kind: "other",
      kindConfidence: "low",
      transcript: "",
      unreadable: null,
      labValues: null,
      procedure: null,
      surgeryDate: null,
      include: true,
    }));
    setPages((p) => [...p, ...fresh]);

    await Promise.all(
      Array.from(files).map(async (file, i) => {
        const body = new FormData();
        body.append("photo", file);
        try {
          const res = await fetch("/api/prepare-discharge/read", { method: "POST", body });
          const data = await res.json();
          setPages((prev) =>
            prev.map((p) =>
              p.id !== fresh[i].id
                ? p
                : res.ok
                  ? {
                      ...p,
                      status: "read",
                      kind: data.kind,
                      kindConfidence: data.kindConfidence,
                      transcript: data.transcript ?? "",
                      unreadable: data.unreadable ?? null,
                      labValues: data.labValues ?? null,
                      procedure: data.procedure ?? null,
                      surgeryDate: data.surgeryDate ?? null,
                    }
                  : { ...p, status: "failed", error: data.error ?? "Could not read that photo." }
            )
          );
          if (res.ok && data.kind === "ot_note") {
            setIdentity((prev) => ({
              ...prev,
              procedure: prev.procedure || (data.procedure ?? ""),
              surgeryDate: prev.surgeryDate || (data.surgeryDate ?? ""),
            }));
          }
        } catch {
          setPages((prev) =>
            prev.map((p) => (p.id === fresh[i].id ? { ...p, status: "failed", error: "No signal. Try that page again." } : p))
          );
        }
      })
    );
  }

  const ready = pages.filter((p) => p.status === "read" && p.include);
  const haveSubject = !!(identity.procedure.trim() || identity.diagnosis.trim());

  const autoMatch = matchDischargeTemplate({ procedureText: identity.procedure, diagnosisText: identity.diagnosis });
  const chosenLabel =
    templateKey === "none"
      ? null
      : templateKey === "auto"
        ? (autoMatch?.label ?? null)
        : (templates.find((t) => t.key === templateKey)?.label ?? null);

  async function build() {
    setBuilding(true);
    setError(null);
    try {
      const res = await fetch("/api/prepare-discharge/build", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identity,
          templateKey: templateKey === "auto" ? null : templateKey === "none" ? "__none__" : templateKey,
          pages: ready.map((p) => ({
            kind: p.kind,
            transcript: p.transcript,
            labValues: p.kind === "lab_report" ? p.labValues : null,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not build the summary.");
        setBuilding(false);
        return;
      }
      setDraft(data.draft as DischargeDraft);
      setUsedTemplateLabel(data.template?.label ?? null);
    } catch {
      setError("No signal. Try again when you have a bar.");
    }
    setBuilding(false);
  }

  async function preview() {
    if (!draft) return;
    setBuilding(true);
    setError(null);
    try {
      const res = await fetch("/api/prepare-discharge/render", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identity, draft }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not render the summary.");
        setBuilding(false);
        return;
      }
      setDoc(data.doc as DischargeDocument);
    } catch {
      setError("No signal. Try again when you have a bar.");
    }
    setBuilding(false);
  }

  // --- rendered summary ---------------------------------------------------------
  if (doc) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-[13px] leading-relaxed text-muted print:hidden">
          Nothing here has been stored. Print or save it now — leaving this screen loses it.
        </p>
        <DischargeSheet doc={doc} wardId="" patientId="" formularyAvailable={false} />
        <div className="print:hidden">
          <PrintButton />
        </div>
        <button
          type="button"
          onClick={() => setDoc(null)}
          className="rounded-[10px] border border-line px-4 py-3 text-[15px] print:hidden"
        >
          Back to editing
        </button>
      </div>
    );
  }

  // --- the fill-in editor ------------------------------------------------------
  if (draft) {
    const d = draft;
    const set = (patch: Partial<DischargeDraft>) => setDraft({ ...d, ...patch });
    const primary = d.diagnoses.find((x) => x.category === "primary");

    return (
      <div className="flex flex-col gap-4">
        <p className="text-[13px] leading-relaxed text-muted">
          {usedTemplateLabel ? `Filled from the ${usedTemplateLabel} template. ` : ""}
          Replace every <span className="font-mono">[ … ]</span> with the patient&rsquo;s details.
          Nothing is stored.
        </p>

        <Editor title="Indication for admission">
          <Area value={d.indicationForAdmission.text} rows={3} onChange={(v) => set({ indicationForAdmission: { ...d.indicationForAdmission, text: v, source: "resident" } })} />
        </Editor>

        <Editor title="Primary diagnosis">
          <Field
            label="Diagnosis"
            value={primary?.text ?? ""}
            onChange={(v) =>
              set({
                diagnoses: primary
                  ? d.diagnoses.map((x) => (x === primary ? { ...x, text: v } : x))
                  : [{ id: "dx-primary", category: "primary", text: v, source: "resident" }, ...d.diagnoses],
              })
            }
          />
        </Editor>

        {d.procedures.map((p, i) => {
          const setP = (o: Partial<typeof p>) => set({ procedures: d.procedures.map((x, j) => (j === i ? { ...x, ...o } : x)) });
          return (
            <Editor key={p.id} title={i === 0 ? "Operation / procedure" : `Procedure ${i + 1}`}>
              <Field label="Procedure" value={p.name} onChange={(v) => setP({ name: v })} />
              <Field label="Date" type="date" value={p.date} onChange={(v) => setP({ date: v || null })} />
              <Field label="Anaesthesia" value={p.anaesthesia} onChange={(v) => setP({ anaesthesia: v })} />
              <Area label="Significant findings" value={p.findings} rows={2} onChange={(v) => setP({ findings: v })} />
              <Field label="Drains" value={p.drains} onChange={(v) => setP({ drains: v })} />
              <Field label="Complications" value={p.complications} onChange={(v) => setP({ complications: v })} />
              <Field label="Outcome" value={p.outcome} onChange={(v) => setP({ outcome: v })} />
            </Editor>
          );
        })}

        <Editor title="Clinical course">
          <Area value={d.clinicalCourse.text} rows={7} placeholder="The patient was admitted with … and underwent … on … . Postoperatively …" onChange={(v) => set({ clinicalCourse: { ...d.clinicalCourse, text: v, source: "resident" } })} />
        </Editor>

        <Editor title="Condition at discharge">
          {CONDITION_VARIABLES.map((v) => {
            const val = d.conditionAtDischarge.vars[v.key];
            return (
              <label key={v.key} className="flex items-center gap-2 text-[14px]">
                <input
                  type="checkbox"
                  checked={val === true}
                  onChange={(e) =>
                    set({
                      conditionAtDischarge: {
                        ...d.conditionAtDischarge,
                        vars: { ...d.conditionAtDischarge.vars, [v.key]: e.target.checked ? true : null },
                        proseEdited: true,
                      },
                    })
                  }
                />
                {v.label} — {v.satisfactory}
              </label>
            );
          })}
          <Area label="Prose / free text" value={d.conditionAtDischarge.freeText ?? d.conditionAtDischarge.prose} rows={3} onChange={(v) => set({ conditionAtDischarge: { ...d.conditionAtDischarge, freeText: v, proseEdited: true } })} />
        </Editor>

        <Editor title="Medications on discharge">
          {d.medications.map((m, i) => {
            const setM = (o: Partial<typeof m>) => set({ medications: d.medications.map((x, j) => (j === i ? { ...x, ...o } : x)) });
            return (
              <div key={m.id} className="flex flex-col gap-2 rounded-[10px] border border-line p-2">
                <Field label="Generic name" value={m.generic} onChange={(v) => setM({ generic: v })} />
                <div className="grid grid-cols-2 gap-2">
                  <Field label="Strength" value={m.strength} onChange={(v) => setM({ strength: v })} />
                  <Field label="Dose" value={m.dose} onChange={(v) => setM({ dose: v })} />
                  <Field label="Route" value={m.route} onChange={(v) => setM({ route: v })} />
                  <Field label="Frequency" value={m.frequency} onChange={(v) => setM({ frequency: v })} />
                  <Field label="Duration" value={m.duration} onChange={(v) => setM({ duration: v })} />
                  <label className="flex flex-col gap-1">
                    <span className="text-[13px] text-muted">Status</span>
                    <select value={m.status} onChange={(e) => setM({ status: e.target.value as MedicationStatus })} className="h-11 rounded-[10px] border border-line bg-card px-2 text-[15px] outline-none">
                      {MEDICATION_STATUSES.map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </label>
                </div>
                <button type="button" onClick={() => set({ medications: d.medications.filter((_, j) => j !== i) })} className="self-start text-[13px] text-muted">Remove</button>
              </div>
            );
          })}
          <button
            type="button"
            onClick={() => set({ medications: [...d.medications, { id: uid(), generic: "", strength: null, dose: null, route: null, frequency: null, duration: null, indication: null, status: "new", reason: null, drugKey: "", source: "resident" }] })}
            className="self-start text-[13px] font-medium text-accent"
          >
            + Add medication
          </button>
        </Editor>

        <Editor title="Primary care actions">
          <StringList items={d.primaryCareActions} onChange={(v) => set({ primaryCareActions: v })} placeholder="Action for the GP" noneLabel="None." />
        </Editor>

        <Editor title="Patient actions">
          <StringList items={d.patientActions} onChange={(v) => set({ patientActions: v })} placeholder="Task for the patient" noneLabel="None." />
        </Editor>

        <Editor title="Advice">
          <label className="flex items-center gap-2 text-[14px]">
            <input type="checkbox" checked={d.advice.included} onChange={(e) => set({ advice: { ...d.advice, included: e.target.checked } })} />
            Include the advice section
          </label>
          {d.advice.included &&
            d.advice.items.map((a, i) => (
              <div key={a.id} className="flex flex-col gap-1 rounded-[10px] border border-line p-2">
                <Field label="Module" value={a.module} onChange={(v) => set({ advice: { ...d.advice, items: d.advice.items.map((x, j) => (j === i ? { ...x, module: v } : x)) } })} />
                <Area value={a.text} rows={2} onChange={(v) => set({ advice: { ...d.advice, items: d.advice.items.map((x, j) => (j === i ? { ...x, text: v } : x)) } })} />
                <button type="button" onClick={() => set({ advice: { ...d.advice, items: d.advice.items.filter((_, j) => j !== i) } })} className="self-start text-[13px] text-muted">Remove</button>
              </div>
            ))}
          {d.advice.included && (
            <button type="button" onClick={() => set({ advice: { ...d.advice, items: [...d.advice.items, { id: uid(), module: "", text: "" }] } })} className="self-start text-[13px] font-medium text-accent">
              + Add advice
            </button>
          )}
        </Editor>

        <Editor title="When to seek medical attention (red flags)">
          <label className="flex items-center gap-2 text-[14px]">
            <input type="checkbox" checked={d.redFlags.included} onChange={(e) => set({ redFlags: { ...d.redFlags, included: e.target.checked } })} />
            Include the red-flags section
          </label>
          {d.redFlags.included && (
            <StringList items={d.redFlags.items} onChange={(v) => set({ redFlags: { ...d.redFlags, items: v } })} placeholder="Warning sign" noneLabel="Nothing added." />
          )}
        </Editor>

        <Editor title="Authentication">
          <Field label="Discharging doctor" value={d.authentication.doctorName} onChange={(v) => set({ authentication: { ...d.authentication, doctorName: v } })} />
          <Field label="Designation" value={d.authentication.designation} onChange={(v) => set({ authentication: { ...d.authentication, designation: v } })} />
          <Field label="Department" value={d.authentication.department} onChange={(v) => set({ authentication: { ...d.authentication, department: v } })} />
        </Editor>

        {error && <p className="text-[13px] text-orange-700">{error}</p>}
        <div className="flex gap-2">
          <button type="button" onClick={() => setDraft(null)} className="flex-1 rounded-[10px] border border-line px-4 py-3 text-[15px]">
            Back to the papers
          </button>
          <button type="button" disabled={building} onClick={() => void preview()} className="flex-1 rounded-[10px] bg-accent px-4 py-3 text-[15px] font-semibold text-accent-ink disabled:opacity-60">
            {building ? "Rendering…" : "Preview summary"}
          </button>
        </div>
      </div>
    );
  }

  // --- papers + identity + template card ---------------------------------------
  const field = (key: keyof typeof identity, label: string, placeholder?: string, type = "text") => (
    <label className="flex flex-1 flex-col gap-1.5">
      <span className="text-[13px] text-muted">{label}</span>
      <input
        type={type}
        value={identity[key]}
        placeholder={placeholder}
        onChange={(e) => setIdentity((p) => ({ ...p, [key]: e.target.value }))}
        className="h-12 w-full rounded-[10px] border border-line bg-card px-3 text-[17px] outline-none focus:border-accent"
      />
    </label>
  );

  return (
    <div className="flex flex-col gap-4">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={(e) => {
          void addFiles(e.target.files);
          e.target.value = "";
        }}
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="rounded-[10px] bg-accent px-4 py-3 text-[17px] font-semibold text-accent-ink"
      >
        {pages.length === 0 ? "Add the papers" : "Add more papers"}
      </button>

      {pages.map((page) => (
        <div key={page.id} className="ios-group p-4">
          <div className="flex items-baseline justify-between gap-3">
            <span className="truncate text-[13px] text-muted">{page.fileName}</span>
            {page.status === "reading" && <span className="shrink-0 text-[13px] text-muted">Reading…</span>}
            {page.status === "failed" && <span className="shrink-0 text-[13px] text-orange-700">Could not read</span>}
          </div>
          {page.status === "failed" && page.error && (
            <p className="mt-2 text-[13px] leading-relaxed text-orange-700">{page.error}</p>
          )}
          {page.status === "read" && (
            <>
              <label className="mt-3 flex flex-col gap-1.5">
                <span className="text-[13px] text-muted">This page is {page.kindConfidence === "low" && "— I am not sure —"}</span>
                <select
                  value={page.kind}
                  onChange={(e) => setPages((prev) => prev.map((p) => (p.id === page.id ? { ...p, kind: e.target.value as PaperKind } : p)))}
                  className="h-12 w-full rounded-[10px] border border-line bg-card px-3 text-[17px] outline-none focus:border-accent"
                >
                  {PAPER_KINDS.map((k) => (
                    <option key={k.kind} value={k.kind}>{k.label}</option>
                  ))}
                </select>
              </label>
              {page.unreadable && (
                <p className="mt-2 text-[13px] leading-relaxed text-orange-700">Not read on this page: {page.unreadable}</p>
              )}
              <details className="mt-2">
                <summary className="cursor-pointer text-[13px] text-accent">What it read ({page.transcript.length} characters)</summary>
                <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap text-[13px] leading-relaxed">{page.transcript || "Nothing legible."}</pre>
              </details>
              <label className="mt-3 flex items-center gap-2 text-[13px] text-muted">
                <input type="checkbox" checked={page.include} onChange={(e) => setPages((prev) => prev.map((p) => (p.id === page.id ? { ...p, include: e.target.checked } : p)))} />
                Use this page
              </label>
            </>
          )}
        </div>
      ))}

      <section className="ios-group flex flex-col gap-3 p-4">
        <p className="text-[13px] text-muted">Who is this summary for? Typed, not read off the papers.</p>
        {field("name", "Name", "As it should print")}
        <div className="flex gap-3">
          {field("age", "Age", "Years", "number")}
          {field("sex", "Sex", "M / F")}
        </div>
        <div className="flex gap-3">
          {field("ipNo", "IP no.")}
          {field("mrdNo", "MRD no.")}
        </div>
        <div className="flex gap-3">
          {field("admittedOn", "Admitted on", "", "date")}
          {field("surgeryDate", "Date of surgery", "", "date")}
        </div>
        {field("diagnosis", "Diagnosis", "e.g. Acute calculous cholecystitis")}
        {field("procedure", "Procedure", "As the OT note names it")}
      </section>

      {haveSubject && (
        <section className="ios-group flex flex-col gap-2 p-4">
          <p className="text-[15px] font-medium">Discharge template</p>
          <p className="text-[13px] text-muted">
            The standard sections for this diagnosis — advice, red flags, follow-up, the
            operation skeleton — arrive pre-filled with blanks for you to complete.
          </p>
          <select
            value={templateKey}
            onChange={(e) => setTemplateKey(e.target.value)}
            className="h-12 w-full rounded-[10px] border border-line bg-card px-3 text-[17px] outline-none focus:border-accent"
          >
            <option value="auto">Match automatically from the diagnosis / procedure</option>
            <option value="none">No template — start blank</option>
            {(templates.length ? templates : []).map((t) => (
              <option key={t.key} value={t.key}>{t.label}</option>
            ))}
          </select>
        </section>
      )}

      {ready.length > 0 && (
        <button
          type="button"
          disabled={building}
          onClick={() => void build()}
          className="rounded-[10px] bg-accent px-4 py-3 text-[17px] font-semibold text-accent-ink disabled:opacity-60"
        >
          {building ? "Building…" : `Build the summary${chosenLabel ? ` — ${chosenLabel}` : ""}`}
        </button>
      )}

      {error && <p className="text-[13px] leading-relaxed text-orange-700">{error}</p>}
    </div>
  );
}

function Editor({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="ios-group flex flex-col gap-2 p-4">
      <p className="text-[15px] font-medium">{title}</p>
      {children}
    </section>
  );
}
