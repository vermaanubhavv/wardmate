"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ADVICE_MODULES,
  CONDITION_VARIABLES,
  DISCHARGE_SECTIONS,
  MEDICATION_STATUSES,
  RED_FLAG_SUGGESTIONS,
  type DischargeDraft,
  type DischargeSectionId,
  type Diagnosis,
  type DiagnosisCategory,
  type HistopathologyStatus,
  type MedicationStatus,
} from "@/lib/discharge-entities";
import { buildConditionProse } from "@/lib/discharge-compile";
import { runDischargeChecks, type DischargeCheckContext } from "@/lib/discharge-checks";
import type { DischargeCheck } from "@/lib/discharge-checks";
import FormularyLink from "./formulary-link";
import { Field, Area, StringList } from "./discharge-fields";
import {
  saveDischargeSection,
  approveDischargeSectionAction,
  finaliseDischargeAction,
  reopenDischargeAction,
  resetDischargeAction,
} from "./actions";

const uid = () => (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `r-${Math.round(Math.random() * 1e9)}`);

const chip = (text: string, tone: "ok" | "warn" | "muted") => (
  <span
    className={
      "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium " +
      (tone === "ok"
        ? "bg-accent/10 text-accent"
        : tone === "warn"
          ? "bg-orange-100 text-orange-700"
          : "bg-chip text-muted")
    }
  >
    {text}
  </span>
);

// --- the stack ------------------------------------------------------------------
//
// One card per protocol section, walked through in order, then a Review card carrying the
// completeness checks and Finalise. Every section arrives compiled from the record
// (lib/discharge-compile.ts) or already saved; the resident confirms or edits, and moving to
// the next card saves the one being left. The section bodies are the same editors the protocol
// needs — the stack only changes how many are on screen at once, which is the whole point on a
// phone at the bedside.

type StepId = DischargeSectionId | "review";

const STEPS: { id: StepId; title: string; required: boolean }[] = [
  ...DISCHARGE_SECTIONS.map((s) => ({ id: s.id as StepId, title: s.title, required: s.required })),
  { id: "review", title: "Review & sign", required: true },
];

export default function DischargeWorkspace({
  patientId,
  initialDraft,
  checkContext,
  wardId,
  formularyAvailable,
}: {
  patientId: string;
  initialDraft: DischargeDraft;
  checkContext: DischargeCheckContext;
  wardId: string;
  formularyAvailable: boolean;
}) {
  const router = useRouter();
  const [draft, setDraft] = useState<DischargeDraft>(initialDraft);
  const [dirty, setDirty] = useState<Set<DischargeSectionId>>(new Set());
  const [pending, startTransition] = useTransition();
  const [generating, setGenerating] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [blocking, setBlocking] = useState<DischargeCheck[] | null>(null);
  const [step, setStep] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  const finalised = draft.status === "finalised";
  const readOnly = finalised;

  const checks = useMemo(() => runDischargeChecks(draft, checkContext), [draft, checkContext]);
  const blockingBySection = useMemo(() => {
    const m = new Map<DischargeSectionId, DischargeCheck[]>();
    for (const c of checks.blocking) m.set(c.section, [...(m.get(c.section) ?? []), c]);
    return m;
  }, [checks]);

  const current = STEPS[step];
  const stepIndexOf = (id: StepId) => STEPS.findIndex((s) => s.id === id);

  function patch<K extends keyof DischargeDraft>(section: DischargeSectionId, key: K, value: DischargeDraft[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
    setDirty((s) => new Set(s).add(section));
    setMessage(null);
  }

  /** Editing an approved AI section clears its approval. */
  function editClinicalCourse(text: string) {
    patch("clinicalCourse", "clinicalCourse", {
      ...draft.clinicalCourse,
      text,
      source: "resident" as const,
      approvedAt: null,
      approvedBy: null,
    });
  }
  function editIndication(text: string) {
    patch("indication", "indicationForAdmission", {
      ...draft.indicationForAdmission,
      text,
      source: "resident" as const,
      approvedAt: null,
      approvedBy: null,
    });
  }

  async function saveSection(section: DischargeSectionId): Promise<boolean> {
    const map: Record<DischargeSectionId, unknown> = {
      indication: draft.indicationForAdmission,
      encounter: draft.encounter,
      diagnoses: draft.diagnoses,
      procedures: draft.procedures,
      clinicalCourse: draft.clinicalCourse,
      relevantInvestigations: draft.relevantInvestigations,
      histopathology: draft.histopathology,
      medications: draft.medications,
      conditionAtDischarge: draft.conditionAtDischarge,
      primaryCareActions: draft.primaryCareActions,
      patientActions: draft.patientActions,
      advice: draft.advice,
      redFlags: draft.redFlags,
      authentication: draft.authentication,
    };
    const result = await saveDischargeSection(patientId, section, map[section]);
    if (!result.ok) {
      setMessage(result.error ?? "Could not save — your edits are still here, try again from Review.");
      return false;
    }
    setDirty((s) => {
      const next = new Set(s);
      next.delete(section);
      return next;
    });
    return true;
  }

  /** Move between cards. The card being left is saved if it changed — a failed save is surfaced
   *  but never traps you, because the edit stays in memory until a refresh. */
  function goTo(index: number) {
    if (index < 0 || index >= STEPS.length) return;
    const leaving = current.id;
    if (leaving !== "review" && dirty.has(leaving as DischargeSectionId)) {
      const section = leaving as DischargeSectionId;
      startTransition(async () => {
        await saveSection(section);
      });
    }
    setStep(index);
    setMenuOpen(false);
    setBlocking(null);
    if (typeof window !== "undefined") window.scrollTo({ top: 0 });
  }

  function saveAll() {
    startTransition(async () => {
      for (const section of Array.from(dirty)) {
        const ok = await saveSection(section);
        if (!ok) return;
      }
      setMessage("Saved.");
      router.refresh();
    });
  }

  async function generate(section: "clinical_course" | "indication" | "investigations") {
    setGenerating(section);
    setMessage(null);
    try {
      const res = await fetch(`/api/patients/${patientId}/discharge/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error ?? "Could not generate.");
        setGenerating(null);
        return;
      }
      if (section === "clinical_course") {
        patch("clinicalCourse", "clinicalCourse", {
          text: data.text ?? "",
          source: "ai" as const,
          model: data.model ?? null,
          generatedAt: new Date().toISOString(),
          approvedAt: null,
          approvedBy: null,
          uncertainPoints: Array.isArray(data.uncertainPoints) ? data.uncertainPoints : [],
        });
      } else if (section === "indication") {
        patch("indication", "indicationForAdmission", {
          text: data.text ?? "",
          source: "ai" as const,
          model: data.model ?? null,
          generatedAt: new Date().toISOString(),
          approvedAt: null,
          approvedBy: null,
        });
      } else {
        const proposed = (Array.isArray(data.items) ? data.items : []).map(
          (it: { group: string; text: string; interpretation: string | null; sourceObservationIds: string[] }) => ({
            id: uid(),
            group: it.group,
            text: it.text,
            interpretation: it.interpretation ?? null,
            accepted: true,
            source: "ai" as const,
            sourceObservationIds: it.sourceObservationIds ?? [],
          })
        );
        patch("relevantInvestigations", "relevantInvestigations", {
          items: proposed,
          approvedAt: null,
          approvedBy: null,
          model: data.model ?? null,
          generatedAt: new Date().toISOString(),
        });
      }
    } catch {
      setMessage("No signal. Try again.");
    }
    setGenerating(null);
  }

  function approve(section: "clinicalCourse" | "indication" | "relevantInvestigations") {
    startTransition(async () => {
      // Save the latest edit first, then approve the stored version.
      const sectionId: DischargeSectionId = section === "relevantInvestigations" ? "relevantInvestigations" : section;
      if (dirty.has(sectionId)) {
        const ok = await saveSection(sectionId);
        if (!ok) return;
      }
      const result = await approveDischargeSectionAction(patientId, section);
      if (!result.ok) {
        setMessage(result.error ?? "Could not approve.");
        return;
      }
      router.refresh();
      setMessage("Approved.");
      const now = new Date().toISOString();
      if (section === "clinicalCourse")
        setDraft((d) => ({ ...d, clinicalCourse: { ...d.clinicalCourse, approvedAt: now } }));
      else if (section === "indication")
        setDraft((d) => ({ ...d, indicationForAdmission: { ...d.indicationForAdmission, approvedAt: now } }));
      else setDraft((d) => ({ ...d, relevantInvestigations: { ...d.relevantInvestigations, approvedAt: now } }));
    });
  }

  function finalise() {
    startTransition(async () => {
      for (const section of Array.from(dirty)) {
        const ok = await saveSection(section);
        if (!ok) return;
      }
      const result = await finaliseDischargeAction(patientId);
      if (!result.ok) {
        setBlocking(result.blocking ?? null);
        setMessage(result.error ?? (result.blocking ? "Some checks are unmet." : "Could not finalise."));
        return;
      }
      setBlocking(null);
      setMessage("Discharge summary finalised.");
      router.refresh();
      setDraft((d) => ({ ...d, status: "finalised" }));
    });
  }

  function reopen() {
    startTransition(async () => {
      const result = await reopenDischargeAction(patientId);
      if (!result.ok) return setMessage(result.error ?? "Could not reopen.");
      setDraft((d) => ({ ...d, status: "draft" }));
      router.refresh();
    });
  }

  function reset() {
    if (!confirm("Discard every edit and rebuild this summary from the record?")) return;
    startTransition(async () => {
      const result = await resetDischargeAction(patientId);
      if (!result.ok) return setMessage(result.error ?? "Could not reset.");
      // A full reload so every section re-reads the freshly compiled draft.
      window.location.reload();
    });
  }

  const dc = draft.conditionAtDischarge;
  const setConditionVar = (key: (typeof CONDITION_VARIABLES)[number]["key"], value: null | true | string) => {
    const vars = { ...dc.vars, [key]: value };
    patch("conditionAtDischarge", "conditionAtDischarge", {
      ...dc,
      vars,
      prose: dc.proseEdited ? dc.prose : buildConditionProse(vars),
    });
  };

  // --- what the section list dots and the badge say --------------------------------
  function filledFor(id: StepId): boolean {
    switch (id) {
      case "indication":
        return !!draft.indicationForAdmission.text.trim();
      case "encounter":
        return true;
      case "diagnoses":
        return draft.diagnoses.some((d) => d.category === "primary" && d.text.trim());
      case "procedures":
        return draft.procedures.length > 0;
      case "clinicalCourse":
        return !!draft.clinicalCourse.text.trim();
      case "relevantInvestigations":
        return draft.relevantInvestigations.items.length > 0;
      case "histopathology":
        return draft.histopathology.length > 0;
      case "medications":
        return draft.medications.length > 0;
      case "conditionAtDischarge":
        return (
          CONDITION_VARIABLES.some((v) => {
            const x = dc.vars[v.key];
            return x === true || (typeof x === "string" && x.trim().length > 0);
          }) || !!dc.freeText?.trim()
        );
      case "primaryCareActions":
        return draft.primaryCareActions.length > 0;
      case "patientActions":
        return draft.patientActions.length > 0;
      case "advice":
        return draft.advice.included;
      case "redFlags":
        return draft.redFlags.included;
      case "authentication":
        return !!draft.authentication.doctorName?.trim();
      default:
        return false;
    }
  }

  function badgeFor(id: StepId): React.ReactNode {
    switch (id) {
      case "indication":
        return draft.indicationForAdmission.approvedAt
          ? chip("approved", "ok")
          : draft.indicationForAdmission.text
            ? chip("review", "warn")
            : chip("empty", "muted");
      case "encounter":
        return chip("compiled", "muted");
      case "diagnoses":
        return draft.diagnoses.some((d) => d.category === "primary")
          ? chip("compiled", "muted")
          : chip("primary missing", "warn");
      case "procedures":
        return chip(draft.procedures.length ? "compiled" : "none", "muted");
      case "clinicalCourse":
        return draft.clinicalCourse.approvedAt
          ? chip("approved", "ok")
          : draft.clinicalCourse.text
            ? chip("review", "warn")
            : chip("required", "warn");
      case "relevantInvestigations":
        return draft.relevantInvestigations.approvedAt
          ? chip("approved", "ok")
          : draft.relevantInvestigations.items.length
            ? chip("review", "warn")
            : chip("optional", "muted");
      case "histopathology":
        return chip(draft.histopathology.length ? "compiled" : "none", "muted");
      case "medications":
        return chip(draft.medications.length ? "compiled" : "none", "muted");
      case "conditionAtDischarge":
        return blockingBySection.has("conditionAtDischarge") ? chip("incomplete", "warn") : chip("compiled", "muted");
      case "primaryCareActions":
        return chip(`${draft.primaryCareActions.length}`, "muted");
      case "patientActions":
        return chip(`${draft.patientActions.length}`, "muted");
      case "advice":
        return draft.advice.included ? chip("included", "ok") : chip("optional", "muted");
      case "redFlags":
        return draft.redFlags.included ? chip("included", "ok") : chip("optional", "muted");
      case "authentication":
        return draft.authentication.doctorName ? chip("compiled", "muted") : chip("name missing", "warn");
      default:
        return null;
    }
  }

  // --- section bodies -------------------------------------------------------------
  function renderSection(id: StepId): React.ReactNode {
    switch (id) {
      case "indication":
        return (
          <>
            <p className="text-[13px] text-muted">
              Why admission was needed — not a repeat of the diagnosis. The AI drafts it from the record; you approve.
            </p>
            <button
              type="button"
              disabled={readOnly || generating === "indication"}
              onClick={() => generate("indication")}
              className="self-start rounded-[10px] border border-line px-3 py-1.5 text-[13px] font-medium text-accent disabled:opacity-50"
            >
              {generating === "indication" ? "Generating…" : "Generate with AI"}
            </button>
            <Area
              value={draft.indicationForAdmission.text}
              onChange={editIndication}
              rows={3}
              placeholder="Patient admitted with … requiring …"
            />
            {draft.indicationForAdmission.text && !draft.indicationForAdmission.approvedAt && !readOnly && (
              <button
                type="button"
                onClick={() => approve("indication")}
                disabled={pending}
                className="self-start text-[13px] font-medium text-accent"
              >
                Approve
              </button>
            )}
          </>
        );

      case "encounter":
        return (
          <div className="grid grid-cols-2 gap-3">
            <Field label="Department" value={draft.encounter.department} onChange={(v) => patch("encounter", "encounter", { ...draft.encounter, department: v })} />
            <Field label="Specialty" value={draft.encounter.specialty} onChange={(v) => patch("encounter", "encounter", { ...draft.encounter, specialty: v })} placeholder="General Surgery" />
            <Field label="Ward" value={draft.encounter.ward} onChange={(v) => patch("encounter", "encounter", { ...draft.encounter, ward: v })} />
            <Field label="Bed" value={draft.encounter.bed} onChange={(v) => patch("encounter", "encounter", { ...draft.encounter, bed: v })} />
            <Field label="Consultant" value={draft.encounter.consultant} onChange={(v) => patch("encounter", "encounter", { ...draft.encounter, consultant: v })} />
            <Field label="Unit" value={draft.encounter.unit} onChange={(v) => patch("encounter", "encounter", { ...draft.encounter, unit: v })} />
            <Field label="Admission type" value={draft.encounter.admissionType} onChange={(v) => patch("encounter", "encounter", { ...draft.encounter, admissionType: v })} placeholder="Emergency / Elective" />
          </div>
        );

      case "diagnoses":
        return (
          <>
            {draft.diagnoses.map((d, i) => (
              <div key={d.id} className="flex flex-col gap-2 rounded-[10px] border border-line p-2">
                <div className="flex gap-2">
                  <select
                    value={d.category}
                    onChange={(e) =>
                      patch(
                        "diagnoses",
                        "diagnoses",
                        draft.diagnoses.map((x, j) => (j === i ? { ...x, category: e.target.value as DiagnosisCategory } : x))
                      )
                    }
                    className="h-11 rounded-[10px] border border-line bg-card px-2 text-[13px] outline-none"
                  >
                    <option value="primary">Primary</option>
                    <option value="secondary">Secondary</option>
                    <option value="complication">Complication</option>
                    <option value="comorbidity">Comorbidity</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => patch("diagnoses", "diagnoses", draft.diagnoses.filter((_, j) => j !== i))}
                    className="ml-auto px-2 text-[13px] text-muted"
                  >
                    Remove
                  </button>
                </div>
                <input
                  value={d.text}
                  onChange={(e) =>
                    patch("diagnoses", "diagnoses", draft.diagnoses.map((x, j) => (j === i ? { ...x, text: e.target.value } : x)))
                  }
                  className="h-11 rounded-[10px] border border-line bg-card px-3 text-[15px] outline-none focus:border-accent"
                />
                {d.derivedFrom && <p className="text-[11px] text-muted">Derived from the operation ({d.derivedFrom}) — confirm it.</p>}
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                patch("diagnoses", "diagnoses", [
                  ...draft.diagnoses,
                  { id: uid(), category: "secondary", text: "", source: "resident" } as Diagnosis,
                ])
              }
              className="self-start text-[13px] font-medium text-accent"
            >
              + Add diagnosis
            </button>
          </>
        );

      case "procedures":
        return (
          <>
            {draft.procedures.map((p, i) => {
              const setP = (patchObj: Partial<typeof p>) =>
                patch("procedures", "procedures", draft.procedures.map((x, j) => (j === i ? { ...x, ...patchObj } : x)));
              return (
                <div key={p.id} className="flex flex-col gap-2 rounded-[10px] border border-line p-2">
                  <Field label="Procedure" value={p.name} onChange={(v) => setP({ name: v })} />
                  <Field label="Date" type="date" value={p.date} onChange={(v) => setP({ date: v || null })} />
                  <Field label="Indication" value={p.indication} onChange={(v) => setP({ indication: v })} />
                  <Field label="Anaesthesia" value={p.anaesthesia} onChange={(v) => setP({ anaesthesia: v })} />
                  <Area label="Significant findings" value={p.findings} onChange={(v) => setP({ findings: v })} rows={2} />
                  <Field label="Drains" value={p.drains} onChange={(v) => setP({ drains: v })} />
                  <Field label="Complications" value={p.complications} onChange={(v) => setP({ complications: v })} />
                  <Field label="Outcome" value={p.outcome} onChange={(v) => setP({ outcome: v })} />
                  <button type="button" onClick={() => patch("procedures", "procedures", draft.procedures.filter((_, j) => j !== i))} className="self-start text-[13px] text-muted">
                    Remove procedure
                  </button>
                </div>
              );
            })}
            <button
              type="button"
              onClick={() =>
                patch("procedures", "procedures", [
                  ...draft.procedures,
                  { id: uid(), name: "", date: null, indication: null, anaesthesia: null, findings: null, drains: null, complications: null, outcome: null, source: "resident" as const },
                ])
              }
              className="self-start text-[13px] font-medium text-accent"
            >
              + Add procedure
            </button>
          </>
        );

      case "clinicalCourse":
        return (
          <>
            <p className="text-[13px] text-muted">
              Mandatory. The AI synthesises it from the whole record; read it against the rounds, edit, then approve.
            </p>
            <button
              type="button"
              disabled={readOnly || generating === "clinical_course"}
              onClick={() => generate("clinical_course")}
              className="self-start rounded-[10px] border border-line px-3 py-1.5 text-[13px] font-medium text-accent disabled:opacity-50"
            >
              {generating === "clinical_course" ? "Generating…" : draft.clinicalCourse.text ? "Regenerate with AI" : "Generate with AI"}
            </button>
            {draft.clinicalCourse.uncertainPoints.length > 0 && (
              <div className="rounded-[10px] bg-orange-50 p-2 text-[13px] text-orange-800">
                <p className="font-medium">The AI could not resolve these — check them:</p>
                <ul className="mt-1 list-disc pl-4">
                  {draft.clinicalCourse.uncertainPoints.map((u, i) => (
                    <li key={i}>{u}</li>
                  ))}
                </ul>
              </div>
            )}
            <Area value={draft.clinicalCourse.text} onChange={editClinicalCourse} rows={8} placeholder="The patient was admitted with …" />
            {draft.clinicalCourse.text && !draft.clinicalCourse.approvedAt && !readOnly && (
              <button
                type="button"
                onClick={() => approve("clinicalCourse")}
                disabled={pending}
                className="self-start rounded-[10px] bg-accent px-3 py-1.5 text-[13px] font-semibold text-accent-ink"
              >
                Approve Clinical Course
              </button>
            )}
          </>
        );

      case "relevantInvestigations":
        return (
          <>
            <p className="text-[13px] text-muted">
              The short, meaningful results — not whole panels. The AI proposes from what was recorded; keep the ones that matter.
            </p>
            <button
              type="button"
              disabled={readOnly || generating === "investigations"}
              onClick={() => generate("investigations")}
              className="self-start rounded-[10px] border border-line px-3 py-1.5 text-[13px] font-medium text-accent disabled:opacity-50"
            >
              {generating === "investigations" ? "Analysing…" : "Propose with AI"}
            </button>
            {draft.relevantInvestigations.items.map((it, i) => {
              const setIt = (o: Partial<typeof it>) =>
                patch("relevantInvestigations", "relevantInvestigations", {
                  ...draft.relevantInvestigations,
                  approvedAt: null,
                  approvedBy: null,
                  items: draft.relevantInvestigations.items.map((x, j) => (j === i ? { ...x, ...o } : x)),
                });
              return (
                <div key={it.id} className="flex flex-col gap-2 rounded-[10px] border border-line p-2">
                  <label className="flex items-center gap-2 text-[13px]">
                    <input type="checkbox" checked={it.accepted} onChange={(e) => setIt({ accepted: e.target.checked })} />
                    Include this result
                  </label>
                  <Field label="Group" value={it.group} onChange={(v) => setIt({ group: v })} />
                  <Area label="Finding" value={it.text} onChange={(v) => setIt({ text: v })} rows={2} />
                  <Field label="Interpretation" value={it.interpretation} onChange={(v) => setIt({ interpretation: v })} />
                  <button
                    type="button"
                    onClick={() =>
                      patch("relevantInvestigations", "relevantInvestigations", {
                        ...draft.relevantInvestigations,
                        items: draft.relevantInvestigations.items.filter((_, j) => j !== i),
                      })
                    }
                    className="self-start text-[13px] text-muted"
                  >
                    Remove
                  </button>
                </div>
              );
            })}
            <button
              type="button"
              onClick={() =>
                patch("relevantInvestigations", "relevantInvestigations", {
                  ...draft.relevantInvestigations,
                  items: [
                    ...draft.relevantInvestigations.items,
                    { id: uid(), group: "", text: "", interpretation: null, accepted: true, source: "resident" as const, sourceObservationIds: [] },
                  ],
                })
              }
              className="self-start text-[13px] font-medium text-accent"
            >
              + Add result
            </button>
            {draft.relevantInvestigations.items.length > 0 && !draft.relevantInvestigations.approvedAt && !readOnly && (
              <button type="button" onClick={() => approve("relevantInvestigations")} disabled={pending} className="self-start text-[13px] font-medium text-accent">
                Approve list
              </button>
            )}
          </>
        );

      case "histopathology":
        return (
          <>
            {draft.histopathology.map((h, i) => {
              const setH = (o: Partial<typeof h>) =>
                patch("histopathology", "histopathology", draft.histopathology.map((x, j) => (j === i ? { ...x, ...o } : x)));
              return (
                <div key={h.id} className="flex flex-col gap-2 rounded-[10px] border border-line p-2">
                  <Field label="Specimen" value={h.specimen} onChange={(v) => setH({ specimen: v })} />
                  <Field label="Date sent" type="date" value={h.dateSent} onChange={(v) => setH({ dateSent: v || null })} />
                  <label className="flex flex-col gap-1">
                    <span className="text-[13px] text-muted">Status</span>
                    <select
                      value={h.status}
                      onChange={(e) => setH({ status: e.target.value as HistopathologyStatus })}
                      className="h-11 rounded-[10px] border border-line bg-card px-2 text-[15px] outline-none"
                    >
                      <option value="pending">Pending</option>
                      <option value="preliminary">Preliminary</option>
                      <option value="final">Final</option>
                    </select>
                  </label>
                  <Area label="Result" value={h.result} onChange={(v) => setH({ result: v })} rows={2} />
                  <Field label="Review plan" value={h.reviewPlan} onChange={(v) => setH({ reviewPlan: v })} placeholder="Review during Surgery OPD follow-up" />
                  <button type="button" onClick={() => patch("histopathology", "histopathology", draft.histopathology.filter((_, j) => j !== i))} className="self-start text-[13px] text-muted">
                    Remove
                  </button>
                </div>
              );
            })}
            <button
              type="button"
              onClick={() =>
                patch("histopathology", "histopathology", [
                  ...draft.histopathology,
                  { id: uid(), specimen: "", dateSent: null, status: "pending" as const, result: null, reviewPlan: null, source: "resident" as const },
                ])
              }
              className="self-start text-[13px] font-medium text-accent"
            >
              + Add specimen
            </button>
          </>
        );

      case "medications":
        return (
          <>
            {draft.medications.map((m, i) => {
              const setM = (o: Partial<typeof m>) =>
                patch("medications", "medications", draft.medications.map((x, j) => (j === i ? { ...x, ...o } : x)));
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
                      <select
                        value={m.status}
                        onChange={(e) => setM({ status: e.target.value as MedicationStatus })}
                        className="h-11 rounded-[10px] border border-line bg-card px-2 text-[15px] outline-none"
                      >
                        {MEDICATION_STATUSES.map((s) => (
                          <option key={s.value} value={s.value}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <Field label="Indication" value={m.indication} onChange={(v) => setM({ indication: v })} />
                  {(m.status === "changed" || m.status === "stopped" || m.status === "new") && (
                    <Field label="Reason" value={m.reason} onChange={(v) => setM({ reason: v })} placeholder="Why started / stopped / changed" />
                  )}
                  {formularyAvailable && (
                    <div className="text-[11px] text-muted">
                      <FormularyLink wardId={wardId} patientId={patientId} drugKey={m.drugKey} drugLabel={m.generic} mapped={null} />
                    </div>
                  )}
                  <button type="button" onClick={() => patch("medications", "medications", draft.medications.filter((_, j) => j !== i))} className="self-start text-[13px] text-muted">
                    Remove
                  </button>
                </div>
              );
            })}
            <button
              type="button"
              onClick={() =>
                patch("medications", "medications", [
                  ...draft.medications,
                  { id: uid(), generic: "", strength: null, dose: null, route: null, frequency: null, duration: null, indication: null, status: "new" as const, reason: null, drugKey: "", source: "resident" as const },
                ])
              }
              className="self-start text-[13px] font-medium text-accent"
            >
              + Add medication
            </button>
          </>
        );

      case "conditionAtDischarge":
        return (
          <>
            <p className="text-[13px] text-muted">Tap what is true today. Set at least five, or add free text.</p>
            <div className="flex flex-wrap gap-2">
              {CONDITION_VARIABLES.map((v) => {
                const val = dc.vars[v.key];
                const active = val === true;
                const note = typeof val === "string" ? val.trim() : "";
                return (
                  <button
                    key={v.key}
                    type="button"
                    onClick={() => setConditionVar(v.key, active ? null : true)}
                    className={
                      "rounded-full px-3 py-1.5 text-[13px] " +
                      (active
                        ? "bg-accent text-accent-ink"
                        : note
                          ? "bg-orange-100 text-orange-700"
                          : "bg-chip text-muted")
                    }
                  >
                    {active ? v.satisfactory : note ? `${v.label}: ${note}` : v.label}
                  </button>
                );
              })}
            </div>
            {CONDITION_VARIABLES.some((v) => typeof dc.vars[v.key] === "string" && (dc.vars[v.key] as string).trim()) && (
              <div className="flex flex-col gap-2 rounded-[10px] border border-line p-2">
                <span className="text-[13px] text-muted">Findings that carry a note — edit or clear</span>
                {CONDITION_VARIABLES.filter((v) => typeof dc.vars[v.key] === "string" && (dc.vars[v.key] as string).trim()).map((v) => (
                  <Field
                    key={v.key}
                    label={v.label}
                    value={dc.vars[v.key] as string}
                    onChange={(nv) => setConditionVar(v.key, nv || null)}
                  />
                ))}
              </div>
            )}
            <Area
              label="Prose (auto-built from the taps — edit to override)"
              value={dc.prose}
              onChange={(v) => patch("conditionAtDischarge", "conditionAtDischarge", { ...dc, prose: v, proseEdited: true })}
              rows={3}
            />
            <Area label="Free text (anything the taps cannot represent)" value={dc.freeText} onChange={(v) => patch("conditionAtDischarge", "conditionAtDischarge", { ...dc, freeText: v || null })} rows={2} />
          </>
        );

      case "primaryCareActions":
        return (
          <>
            <p className="text-[13px] text-muted">Only what the patient&rsquo;s GP genuinely needs to do. Prefer 0–3. Leave empty for &ldquo;None.&rdquo;</p>
            <StringList items={draft.primaryCareActions} onChange={(v) => patch("primaryCareActions", "primaryCareActions", v)} placeholder="e.g. Repeat CBC and renal function after 7 days" noneLabel="None." />
          </>
        );

      case "patientActions":
        return (
          <>
            <p className="text-[13px] text-muted">Clear tasks the patient must do. Prefer 0–3.</p>
            <StringList items={draft.patientActions} onChange={(v) => patch("patientActions", "patientActions", v)} placeholder="e.g. Attend Surgery OPD after 7 days for wound review" noneLabel="None." />
          </>
        );

      case "advice":
        return (
          <>
            <label className="flex items-center gap-2 text-[15px]">
              <input type="checkbox" checked={draft.advice.included} onChange={(e) => patch("advice", "advice", { ...draft.advice, included: e.target.checked })} />
              Include an Advice section
            </label>
            {draft.advice.included && (
              <>
                {draft.advice.items.map((a, i) => (
                  <div key={a.id} className="flex flex-col gap-2 rounded-[10px] border border-line p-2">
                    <select
                      value={a.module}
                      onChange={(e) => patch("advice", "advice", { ...draft.advice, items: draft.advice.items.map((x, j) => (j === i ? { ...x, module: e.target.value } : x)) })}
                      className="h-11 rounded-[10px] border border-line bg-card px-2 text-[15px] outline-none"
                    >
                      <option value="">Choose a module</option>
                      {ADVICE_MODULES.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                    <Area value={a.text} onChange={(v) => patch("advice", "advice", { ...draft.advice, items: draft.advice.items.map((x, j) => (j === i ? { ...x, text: v } : x)) })} rows={2} />
                    <button type="button" onClick={() => patch("advice", "advice", { ...draft.advice, items: draft.advice.items.filter((_, j) => j !== i) })} className="self-start text-[13px] text-muted">
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => patch("advice", "advice", { ...draft.advice, items: [...draft.advice.items, { id: uid(), module: "", text: "" }] })}
                  className="self-start text-[13px] font-medium text-accent"
                >
                  + Add advice
                </button>
              </>
            )}
          </>
        );

      case "redFlags":
        return (
          <>
            <label className="flex items-center gap-2 text-[15px]">
              <input type="checkbox" checked={draft.redFlags.included} onChange={(e) => patch("redFlags", "redFlags", { ...draft.redFlags, included: e.target.checked })} />
              Include a Red Flags section
            </label>
            {draft.redFlags.included && (
              <>
                <div className="flex flex-wrap gap-1.5">
                  {RED_FLAG_SUGGESTIONS.filter((s) => !draft.redFlags.items.includes(s)).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => patch("redFlags", "redFlags", { ...draft.redFlags, items: [...draft.redFlags.items, s] })}
                      className="rounded-full bg-chip px-2 py-1 text-[12px] text-muted"
                    >
                      + {s}
                    </button>
                  ))}
                </div>
                <StringList items={draft.redFlags.items} onChange={(v) => patch("redFlags", "redFlags", { ...draft.redFlags, items: v })} placeholder="Warning sign" noneLabel="Nothing added yet." />
              </>
            )}
          </>
        );

      case "authentication":
        return (
          <>
            <Field label="Discharging doctor" value={draft.authentication.doctorName} onChange={(v) => patch("authentication", "authentication", { ...draft.authentication, doctorName: v })} />
            <Field label="Designation" value={draft.authentication.designation} onChange={(v) => patch("authentication", "authentication", { ...draft.authentication, designation: v })} />
            <Field label="Department" value={draft.authentication.department} onChange={(v) => patch("authentication", "authentication", { ...draft.authentication, department: v })} />
            <Field label="Senior reviewer (if required)" value={draft.authentication.seniorReviewer} onChange={(v) => patch("authentication", "authentication", { ...draft.authentication, seniorReviewer: v })} />
          </>
        );

      case "review":
        return (
          <>
            <p className="text-[13px] text-muted">
              The protocol&rsquo;s completeness checks. A red item blocks finalising — tap it to jump to the section.
            </p>
            {checks.blocking.length === 0 && checks.warnings.length === 0 && (
              <p className="text-[15px] text-accent">Nothing outstanding — ready to finalise.</p>
            )}
            {checks.blocking.map((c) => (
              <button key={c.id} type="button" onClick={() => goTo(stepIndexOf(c.section))} className="block text-left text-[13px] text-red-600">
                ● {c.message}
              </button>
            ))}
            {checks.warnings.map((c) => (
              <button key={c.id} type="button" onClick={() => goTo(stepIndexOf(c.section))} className="block text-left text-[13px] text-orange-700">
                ▲ {c.message}
              </button>
            ))}

            {blocking && blocking.length > 0 && (
              <div className="rounded-[10px] bg-red-50 p-2">
                <p className="text-[13px] font-medium text-red-600">Finalise refused:</p>
                {blocking.map((c) => (
                  <button key={c.id} type="button" onClick={() => goTo(stepIndexOf(c.section))} className="mt-1 block text-left text-[13px] text-red-600">
                    ● {c.message}
                  </button>
                ))}
              </div>
            )}

            {dirty.size > 0 && (
              <button type="button" onClick={saveAll} disabled={pending} className="self-start text-[13px] font-medium text-accent">
                Save {dirty.size} unsaved {dirty.size === 1 ? "section" : "sections"}
              </button>
            )}

            <div className="mt-1 flex gap-4">
              <Link href={`/patients/${patientId}/discharge/print`} className="text-[13px] text-accent">
                Preview the summary
              </Link>
              {!finalised && (
                <button type="button" onClick={reset} disabled={pending} className="text-[13px] text-muted">
                  Rebuild from record
                </button>
              )}
            </div>
          </>
        );

      default:
        return null;
    }
  }

  const pct = Math.round(((step + 1) / STEPS.length) * 100);
  const isOptionalEmpty =
    current.id !== "review" && !current.required && !filledFor(current.id) && !dirty.has(current.id as DischargeSectionId);

  return (
    <div className="flex flex-col gap-3 px-4 pb-40">
      {finalised && (
        <div className="ios-group flex items-center justify-between px-4 py-3">
          <span className="text-[15px] font-medium text-accent">Finalised</span>
          <button type="button" onClick={reopen} className="text-[13px] font-medium text-accent" disabled={pending}>
            Reopen to edit
          </button>
        </div>
      )}

      {/* Progress + the jump list */}
      <div className="ios-group px-4 py-3">
        <button type="button" onClick={() => setMenuOpen((o) => !o)} className="flex w-full items-center justify-between">
          <span className="text-[13px] text-muted">
            Step {step + 1} of {STEPS.length}
          </span>
          <span className="text-[13px] font-medium text-accent">{menuOpen ? "Hide list" : "All sections"}</span>
        </button>
        <div className="mt-2 h-1 overflow-hidden rounded-full bg-chip">
          <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${pct}%` }} />
        </div>

        {menuOpen && (
          <div className="mt-3 flex flex-col">
            {STEPS.map((s, i) => {
              const isBlocking = s.id !== "review" && blockingBySection.has(s.id as DischargeSectionId);
              const done = s.id === "review" ? checks.blocking.length === 0 : filledFor(s.id);
              const dot = isBlocking ? "bg-red-500" : done ? "bg-accent" : "bg-line";
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => goTo(i)}
                  className={
                    "flex items-center gap-2 rounded-[8px] px-2 py-2 text-left text-[14px] " + (i === step ? "bg-chip font-medium" : "")
                  }
                >
                  <span className={"h-2 w-2 shrink-0 rounded-full " + dot} />
                  <span className="text-muted">{i + 1}.</span>
                  <span className="flex-1">{s.title}</span>
                  {dirty.has(s.id as DischargeSectionId) && <span className="text-[11px] text-accent">unsaved</span>}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* The current card */}
      <div className="ios-group flex flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <h2 className="text-[20px] font-semibold leading-tight">{current.title}</h2>
          {current.id !== "review" && badgeFor(current.id)}
        </div>

        {current.id !== "review" && blockingBySection.has(current.id as DischargeSectionId) && (
          <div className="rounded-[10px] bg-red-50 px-3 py-2">
            {blockingBySection.get(current.id as DischargeSectionId)!.map((c) => (
              <p key={c.id} className="text-[13px] text-red-600">
                {c.message}
              </p>
            ))}
          </div>
        )}

        {renderSection(current.id)}
      </div>

      {message && <p className="text-[13px] text-muted">{message}</p>}

      {/* Fixed navigation */}
      <div className="fixed inset-x-0 bottom-0 z-10 mx-auto max-w-md border-t border-line bg-background/90 px-4 py-3 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => goTo(step - 1)}
            disabled={step === 0}
            className="rounded-[12px] border border-line px-5 py-3 text-[15px] font-semibold disabled:opacity-40"
          >
            Back
          </button>

          {current.id !== "review" ? (
            <button
              type="button"
              onClick={() => goTo(step + 1)}
              className="flex-1 rounded-[12px] bg-accent px-4 py-3 text-[15px] font-semibold text-accent-ink"
            >
              {isOptionalEmpty ? "Skip" : "Next"}
            </button>
          ) : finalised ? (
            <Link
              href={`/patients/${patientId}/discharge/print`}
              className="flex-1 rounded-[12px] bg-accent px-4 py-3 text-center text-[15px] font-semibold text-accent-ink"
            >
              Print / download
            </Link>
          ) : (
            <button
              type="button"
              onClick={finalise}
              disabled={pending || checks.blocking.length > 0}
              className="flex-1 rounded-[12px] bg-accent px-4 py-3 text-[15px] font-semibold text-accent-ink disabled:opacity-50"
            >
              {checks.blocking.length > 0 ? `Finalise (${checks.blocking.length} to fix)` : "Finalise"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
