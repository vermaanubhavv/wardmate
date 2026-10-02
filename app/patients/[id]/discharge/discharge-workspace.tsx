"use client";

import { ActionSheet } from "../../../action-sheet";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ADVICE_MODULES,
  ALL_CONDITION_VARIABLES,
  DISCHARGE_SECTIONS,
  MEDICATION_STATUSES,
  RED_FLAG_SUGGESTIONS,
  NO_PROCEDURE_NAME,
  type ConditionVariableKey,
  type DischargeDraft,
  type DischargeSectionId,
  type Diagnosis,
  type DiagnosisCategory,
  type HistopathologyStatus,
} from "@/lib/discharge-entities";
import { buildConditionProse } from "@/lib/discharge-compile";
import { runDischargeChecks, type DischargeCheckContext } from "@/lib/discharge-checks";
import type { DischargeCheck } from "@/lib/discharge-checks";
import FormularyLink from "./formulary-link";
import type { DischargeProfile } from "@/lib/specialty/discharge";
import type { FinalFix } from "@/lib/final-check";
import { Field, Area, StringList, SuggestField, SelectField, SegmentedField } from "./discharge-fields";
import { DEFAULT_UNIT_CONSULTANTS } from "@/lib/unit-consultants";
import DiagnosisCombobox from "../../diagnosis-combobox";
import { IconCheck, statusChip, SelChip, OptionRow, Toggle, genBtn, approveBtn } from "../card-kit";
import {
  saveDischargeSection,
  revalidateDischargeAction,
  approveDischargeSectionAction,
  finaliseDischargeAction,
  reopenDischargeAction,
  resetDischargeAction,
} from "./actions";

const uid = () => (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `r-${Math.round(Math.random() * 1e9)}`);

// The Encounter card's option lists — real ones, kept short. Department/Specialty/Unit are
// suggestions only; typing anything else is still fine. Consultant is a closed set on purpose —
// which unit a discharge is written on already says who the consultant is (compiled in from the
// ward's own setting, lib/unit-consultants.ts), so this is a dropdown to correct it, not a box
// to retype it every time and risk a typo on the paper.
const DEPARTMENT_SUGGESTIONS = ["General Surgery", "Surgical Gastroenterology", "Surgical Oncology"];
const UNIT_SUGGESTIONS = ["Unit Alpha", "Unit 1", "Unit 2", "Unit 3", "Unit 4"];
const CONSULTANT_SUGGESTIONS = Array.from(new Set(Object.values(DEFAULT_UNIT_CONSULTANTS)));
const ADMISSION_TYPES = ["Emergency", "Elective"];

// The operation list, the one-tap drug set and the condition chips are per specialty — see
// dischargeProfileFor() in lib/specialty/discharge.ts; general surgery's are unchanged there.

// --- the look ------------------------------------------------------------------
//
// One card per protocol section, walked through in order like a terminal multi-select, then a
// Review card carrying the completeness checks and Finalise. Every section arrives compiled
// from the record (lib/discharge-compile.ts) or already saved; the resident confirms or edits
// by tapping, and moving to the next card saves the one being left.
//
// The card UI primitives (SelChip, OptionRow, Toggle, …) live in ../card-kit so the
// case-history workspace can wear the same look.

type StepId = DischargeSectionId | "review";

// Patient Actions and Red Flags live inside the Advice card rather than as their own steps —
// same data, same checks, one less card to page through. Diagnoses comes first, ahead of
// Indication: the indication reads against the diagnosis, and the review preview already
// lists it first. Only the cards move; the printed order is DISCHARGE_SECTIONS' own.
const CARD_SECTIONS = DISCHARGE_SECTIONS.filter((s) => s.id !== "patientActions" && s.id !== "redFlags");
const ALL_STEPS: { id: StepId; title: string; required: boolean }[] = [
  ...[
    ...CARD_SECTIONS.filter((s) => s.id === "diagnoses"),
    ...CARD_SECTIONS.filter((s) => s.id !== "diagnoses"),
  ].map((s) => ({
    id: s.id as StepId,
    title: s.title,
    required: s.required,
  })),
  { id: "review", title: "Review & sign", required: true },
];

/** The cards this unit walks through. A non-operating unit sees "Procedures", and no
 *  Histopathology card unless the draft already holds a specimen — nothing on record is hidden. */
function stepsFor(profile: DischargeProfile, hasHistopathology: boolean) {
  if (profile.operative) return ALL_STEPS;
  return ALL_STEPS.filter((s) => s.id !== "histopathology" || hasHistopathology).map((s) =>
    s.id === "procedures" ? { ...s, title: "Procedures" } : s
  );
}

/** Sections whose checks/nav should surface on the Advice card now that they share it. */
function cardSections(id: StepId): DischargeSectionId[] {
  return id === "advice" ? ["advice", "patientActions", "redFlags"] : [id as DischargeSectionId];
}

/** One line of the review preview — reads as the finished summary will, and is the tap target
 *  for editing that section. */
function PreviewLine({
  label,
  onEdit,
  last,
  children,
}: {
  label: string;
  onEdit: () => void;
  last?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onEdit}
      className={
        "flex w-full items-start gap-1.5 px-3 py-2 text-left active:bg-chip" +
        (last ? "" : " border-b border-line/60")
      }
    >
      <span className="shrink-0 font-semibold">{label}:</span>
      <span className="min-w-0 flex-1">{children}</span>
      <span className="shrink-0 text-caption2 text-accent">edit</span>
    </button>
  );
}

const DX_CATEGORIES: { value: DiagnosisCategory; label: string }[] = [
  { value: "primary", label: "Primary" },
  { value: "secondary", label: "Secondary" },
  { value: "comorbidity", label: "Comorbidity" },
  { value: "complication", label: "Complication" },
];

export default function DischargeWorkspace({
  patientId,
  initialDraft,
  checkContext,
  wardId,
  formularyAvailable,
  aiReady,
  finalCheck,
  profile,
}: {
  patientId: string;
  initialDraft: DischargeDraft;
  checkContext: DischargeCheckContext;
  wardId: string;
  formularyAvailable: boolean;
  aiReady: boolean;
  /** Sonnet's proofread from the last finalise — lib/final-check.ts. */
  finalCheck: { fixes: FinalFix[]; questions: string[] } | null;
  /** What this unit's specialty offers — lib/specialty/discharge.ts. */
  profile: DischargeProfile;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [draft, setDraft] = useState<DischargeDraft>(initialDraft);
  // Fixed for the visit: a card must not vanish under the resident mid-edit.
  const STEPS = useMemo(
    () => stepsFor(profile, initialDraft.histopathology.length > 0),
    [profile, initialDraft.histopathology.length]
  );
  const [dirty, setDirty] = useState<Set<DischargeSectionId>>(new Set());
  const [pending, startTransition] = useTransition();
  const [isFinalising, setIsFinalising] = useState(false);
  const [generating, setGenerating] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  // Opens on the card named in ?section — how "tap a line to edit" on the printable summary
  // lands you in the right place. Read once, at first render.
  const [step, setStep] = useState(() => {
    const s = searchParams.get("section");
    const i = s ? STEPS.findIndex((step) => step.id === s) : -1;
    return i >= 0 ? i : 0;
  });
  const [menuOpen, setMenuOpen] = useState(false);
  const [askReset, setAskReset] = useState(false);
  const [openMed, setOpenMed] = useState<string | null>(null);
  // The drug last removed, and where it sat, for the inline Undo — no confirm dialog.
  const [removedMed, setRemovedMed] = useState<{ med: DischargeDraft["medications"][number]; index: number } | null>(null);

  // --- real-time autosave -------------------------------------------------------------
  //
  // Every edit updates `draft` immediately — the checks, the condition prose, the review
  // preview all recompute from it on the same render, so the cards respond as the resident
  // types and taps, not after a round trip. The save to the server happens quietly in the
  // background a moment later; the resident never waits on it and never presses "save".
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const draftRef = useRef(draft);
  const dirtyRef = useRef(dirty);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Keep the refs current so the debounced save and the on-leave flush read the latest values.
  useEffect(() => {
    draftRef.current = draft;
    dirtyRef.current = dirty;
  });

  const sectionValue = (d: DischargeDraft, section: DischargeSectionId): unknown =>
    ({
      indication: d.indicationForAdmission,
      encounter: d.encounter,
      diagnoses: d.diagnoses,
      procedures: d.procedures,
      clinicalCourse: d.clinicalCourse,
      relevantInvestigations: d.relevantInvestigations,
      histopathology: d.histopathology,
      medications: d.medications,
      conditionAtDischarge: d.conditionAtDischarge,
      primaryCareActions: d.primaryCareActions,
      patientActions: d.patientActions,
      advice: d.advice,
      redFlags: d.redFlags,
      authentication: d.authentication,
    })[section];

  // Autosaves skip revalidation (saveDischargeSection); this notes one owed on the way out.
  const savedQuietly = useRef(false);
  const flushSaves = async (revalidate = false): Promise<boolean> => {
    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
      saveTimer.current = null;
    }
    const sections = Array.from(dirtyRef.current);
    if (sections.length === 0) return true;
    setSaveState("saving");
    let ok = true;
    for (const section of sections) {
      const result = await saveDischargeSection(patientId, section, sectionValue(draftRef.current, section), revalidate);
      if (result.ok) {
        if (!revalidate) savedQuietly.current = true;
        setDirty((s) => {
          const n = new Set(s);
          n.delete(section);
          return n;
        });
      } else {
        ok = false;
        setMessage(result.error ?? "Could not save — your edits are still here.");
      }
    }
    setSaveState(ok ? "saved" : "error");
    return ok;
  };

  const scheduleSave = () => {
    setSaveState("saving");
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => void flushSaves(), 900);
  };

  // Anything still unsaved when the resident leaves — flush it without blocking the navigation.
  useEffect(() => {
    return () => {
      if (dirtyRef.current.size > 0) void flushSaves(true);
      else if (savedQuietly.current) void revalidateDischargeAction(patientId);
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const finalised = draft.status === "finalised";
  const readOnly = finalised;

  // Auto-compile the AI sections the moment the workspace opens, so the resident lands on
  // content to READ rather than empty fields with a button (protocol section 20:
  // AI Compilation -> Resident Review). Runs once, only on a fresh draft with enough on the
  // record; each section is written but stays unapproved, so nothing reaches a finalised
  // summary without the resident's sign-off. If the AI is unavailable, the manual "Generate"
  // buttons are still there.
  const autoGenNeeds = useMemo(() => {
    if (finalised || !aiReady) return { course: false, indication: false, investigations: false, any: false };
    const course = !initialDraft.clinicalCourse.text.trim() && !initialDraft.clinicalCourse.generatedAt;
    const indication = !initialDraft.indicationForAdmission.text.trim() && !initialDraft.indicationForAdmission.generatedAt;
    const investigations =
      initialDraft.relevantInvestigations.items.length === 0 && !initialDraft.relevantInvestigations.generatedAt;
    return { course, indication, investigations, any: course || indication || investigations };
  }, [finalised, aiReady, initialDraft]);

  // One request per missing section, in parallel, so each card fills the moment its own draft
  // lands — the short Indication no longer waits on the long Clinical Course.
  type AutoSection = "clinical_course" | "indication" | "investigations";
  const [autoGen, setAutoGen] = useState<Set<AutoSection>>(
    () =>
      new Set(
        (
          [
            autoGenNeeds.course && "clinical_course",
            autoGenNeeds.indication && "indication",
            autoGenNeeds.investigations && "investigations",
          ] as const
        ).filter((x): x is AutoSection => !!x)
      )
  );
  const autoGenStarted = useRef(false);
  useEffect(() => {
    if (autoGenStarted.current) return;
    autoGenStarted.current = true;
    for (const section of autoGen) {
      void (async () => {
        try {
          const res = await fetch(`/api/patients/${patientId}/discharge/generate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ section }),
          });
          const data = await res.json();
          // Only drop the AI draft in where the resident has not started that section
          // themselves while it was compiling.
          if (res.ok && data.section)
            setDraft((d) =>
              section === "clinical_course"
                ? d.clinicalCourse.text.trim() ? d : { ...d, clinicalCourse: data.section }
                : section === "indication"
                  ? d.indicationForAdmission.text.trim() || !data.section.text?.trim()
                    ? d
                    : { ...d, indicationForAdmission: data.section }
                  : d.relevantInvestigations.items.length > 0 || data.section.items?.length === 0
                    ? d
                    : { ...d, relevantInvestigations: data.section }
            );
        } catch {
          // No signal — the resident falls back to the manual buttons.
        }
        setAutoGen((s) => {
          const n = new Set(s);
          n.delete(section);
          return n;
        });
      })();
    }
  }, [autoGen, patientId]);

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
    scheduleSave();
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

  /** Move between cards. Autosave has the card being left; navigation never waits. */
  function goTo(index: number) {
    if (index < 0 || index >= STEPS.length) return;
    setStep(index);
    setMenuOpen(false);
    setOpenMed(null);
    setRemovedMed(null);
    if (typeof window !== "undefined") window.scrollTo({ top: 0 });
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
    // Show it approved at once; persist in the background.
    const now = new Date().toISOString();
    if (section === "clinicalCourse")
      setDraft((d) => ({ ...d, clinicalCourse: { ...d.clinicalCourse, approvedAt: now } }));
    else if (section === "indication")
      setDraft((d) => ({ ...d, indicationForAdmission: { ...d.indicationForAdmission, approvedAt: now } }));
    else setDraft((d) => ({ ...d, relevantInvestigations: { ...d.relevantInvestigations, approvedAt: now } }));

    void (async () => {
      await flushSaves(); // the edited text must be stored before it is approved
      const result = await approveDischargeSectionAction(patientId, section);
      if (!result.ok) {
        setMessage(result.error ?? "Could not approve — try again.");
        // roll the badge back
        if (section === "clinicalCourse")
          setDraft((d) => ({ ...d, clinicalCourse: { ...d.clinicalCourse, approvedAt: null } }));
        else if (section === "indication")
          setDraft((d) => ({ ...d, indicationForAdmission: { ...d.indicationForAdmission, approvedAt: null } }));
        else setDraft((d) => ({ ...d, relevantInvestigations: { ...d.relevantInvestigations, approvedAt: null } }));
      }
    })();
  }

  function finalise() {
    setIsFinalising(true);
    startTransition(async () => {
      if (!(await flushSaves())) return setIsFinalising(false);
      const result = await finaliseDischargeAction(patientId);
      if (!result.ok) {
        setIsFinalising(false);
        setMessage(
          result.error ??
            (result.blocking
              ? `Cannot finalise yet — ${result.blocking.length} check(s) unmet. See "Review & sign".`
              : "Could not finalise.")
        );
        return;
      }
      // Straight to the finished summary — finalise and print are one motion.
      router.push(`/patients/${patientId}/discharge/print`);
    });
  }

  function reopen() {
    setDraft((d) => ({ ...d, status: "draft" }));
    void (async () => {
      const result = await reopenDischargeAction(patientId);
      if (!result.ok) {
        setMessage(result.error ?? "Could not reopen.");
        setDraft((d) => ({ ...d, status: "finalised" }));
      }
    })();
  }

  function reset() {
    setAskReset(false);
    startTransition(async () => {
      const result = await resetDischargeAction(patientId);
      if (!result.ok) return setMessage(result.error ?? "Could not reset.");
      // A full reload so every section re-reads the freshly compiled draft.
      window.location.reload();
    });
  }

  const dc = draft.conditionAtDischarge;
  // This unit's chips in its own order, plus any other variable that already holds a value
  // (compiled from the record or set earlier), so nothing on the draft is ever hidden.
  const conditionVars = [
    ...profile.conditionKeys.flatMap((k) => ALL_CONDITION_VARIABLES.filter((v) => v.key === k)),
    ...ALL_CONDITION_VARIABLES.filter((v) => !profile.conditionKeys.includes(v.key) && dc.vars[v.key] != null),
  ];
  const setConditionVar = (key: ConditionVariableKey, value: null | true | string) => {
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
          ALL_CONDITION_VARIABLES.some((v) => {
            const x = dc.vars[v.key];
            return x === true || (typeof x === "string" && x.trim().length > 0);
          }) || !!dc.freeText?.trim()
        );
      case "primaryCareActions":
        return draft.primaryCareActions.length > 0;
      case "advice":
        return draft.advice.included || draft.patientActions.length > 0 || draft.redFlags.included;
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
          ? statusChip("approved", "ok")
          : draft.indicationForAdmission.text
            ? statusChip("review", "warn")
            : statusChip("empty", "muted");
      case "encounter":
        return statusChip("compiled", "muted");
      case "diagnoses":
        return draft.diagnoses.some((d) => d.category === "primary")
          ? statusChip("compiled", "muted")
          : statusChip("primary missing", "warn");
      case "procedures":
        return statusChip(draft.procedures.length ? "compiled" : "none", "muted");
      case "clinicalCourse":
        return draft.clinicalCourse.approvedAt
          ? statusChip("approved", "ok")
          : draft.clinicalCourse.text
            ? statusChip("review", "warn")
            : statusChip("required", "warn");
      case "relevantInvestigations":
        return draft.relevantInvestigations.approvedAt
          ? statusChip("approved", "ok")
          : draft.relevantInvestigations.items.length
            ? statusChip("review", "warn")
            : statusChip("optional", "muted");
      case "histopathology":
        return statusChip(draft.histopathology.length ? "compiled" : "none", "muted");
      case "medications":
        return statusChip(draft.medications.length ? "compiled" : "none", "muted");
      case "conditionAtDischarge":
        return blockingBySection.has("conditionAtDischarge") ? statusChip("incomplete", "warn") : statusChip("compiled", "muted");
      case "primaryCareActions":
        return statusChip(`${draft.primaryCareActions.length}`, "muted");
      case "advice": {
        const parts: string[] = [];
        if (draft.patientActions.length) parts.push(`${draft.patientActions.length} to patient`);
        if (draft.advice.included) parts.push("advice");
        if (draft.redFlags.included) parts.push("red flags");
        return parts.length ? statusChip(parts.join(" · "), "ok") : statusChip("optional", "muted");
      }
      case "authentication":
        return draft.authentication.doctorName ? statusChip("compiled", "muted") : statusChip("name missing", "warn");
      default:
        return null;
    }
  }

  // --- section bodies -------------------------------------------------------------
  function renderSection(id: StepId): React.ReactNode {
    switch (id) {
      case "indication": {
        const drafting = autoGen.has("indication") && !draft.indicationForAdmission.text.trim();
        return (
          <>
            <p className="text-caption leading-[1.45] text-muted">
              Why admission was needed — not a repeat of the diagnosis. The AI drafts it from the record; you approve.
            </p>
            {drafting ? (
              <p className="text-footnote text-accent">Drafting from the record…</p>
            ) : (
              <button type="button" disabled={readOnly || generating === "indication"} onClick={() => generate("indication")} className={genBtn}>
                {generating === "indication" ? "Generating…" : draft.indicationForAdmission.text ? "Redraft with AI" : "Generate with AI"}
              </button>
            )}
            <Area value={draft.indicationForAdmission.text} onChange={editIndication} rows={3} placeholder="Patient admitted with … requiring …" />
            {draft.indicationForAdmission.text && !draft.indicationForAdmission.approvedAt && !readOnly && (
              <button type="button" onClick={() => approve("indication")} className={approveBtn}>
                Approve
              </button>
            )}
          </>
        );
      }

      case "encounter":
        return (
          <div className="grid grid-cols-2 gap-3">
            <SuggestField label="Department" value={draft.encounter.department} options={DEPARTMENT_SUGGESTIONS} onChange={(v) => patch("encounter", "encounter", { ...draft.encounter, department: v })} />
            <SuggestField label="Specialty" value={draft.encounter.specialty} options={DEPARTMENT_SUGGESTIONS} placeholder={profile.specialtyLabel} onChange={(v) => patch("encounter", "encounter", { ...draft.encounter, specialty: v })} />
            <Field label="Ward" value={draft.encounter.ward} onChange={(v) => patch("encounter", "encounter", { ...draft.encounter, ward: v })} />
            <Field label="Bed" value={draft.encounter.bed} onChange={(v) => patch("encounter", "encounter", { ...draft.encounter, bed: v })} />
            <SelectField label="Consultant" value={draft.encounter.consultant} options={CONSULTANT_SUGGESTIONS} onChange={(v) => patch("encounter", "encounter", { ...draft.encounter, consultant: v })} />
            <SuggestField label="Unit" value={draft.encounter.unit} options={UNIT_SUGGESTIONS} onChange={(v) => patch("encounter", "encounter", { ...draft.encounter, unit: v })} />
            <div className="col-span-2">
              <SegmentedField label="Admission type" value={draft.encounter.admissionType} options={ADMISSION_TYPES} onChange={(v) => patch("encounter", "encounter", { ...draft.encounter, admissionType: v })} />
            </div>
          </div>
        );

      case "diagnoses":
        return (
          <>
            <p className="text-caption leading-[1.45] text-muted">Confirm the compiled diagnosis, fix the wording, or add one.</p>
            {draft.diagnoses.map((d, i) => {
              const setD = (o: Partial<Diagnosis>) =>
                patch("diagnoses", "diagnoses", draft.diagnoses.map((x, j) => (j === i ? { ...x, ...o } : x)));
              return (
                <div key={d.id} className="flex flex-col gap-2 rounded-[10px] border border-line p-2.5">
                  <DiagnosisCombobox
                    value={d.text}
                    onChange={(v) => setD({ text: v })}
                    placeholder="Diagnosis"
                    specialty={profile.specialty}
                    className="h-11 w-full rounded-[10px] border border-line bg-card px-3 text-subhead outline-none focus:border-accent"
                  />
                  <div className="flex flex-wrap gap-1.5">
                    {DX_CATEGORIES.map((c) => (
                      <SelChip key={c.value} selected={d.category === c.value} onClick={() => setD({ category: c.value })}>
                        {c.label}
                      </SelChip>
                    ))}
                  </div>
                  {d.derivedFrom && <p className="text-caption2 text-muted">Derived from the operation ({d.derivedFrom}) — confirm it.</p>}
                  <button type="button" onClick={() => patch("diagnoses", "diagnoses", draft.diagnoses.filter((_, j) => j !== i))} className="self-start text-caption text-muted">
                    Remove
                  </button>
                </div>
              );
            })}
            <OptionRow
              dashed
              onClick={() =>
                patch("diagnoses", "diagnoses", [
                  ...draft.diagnoses,
                  { id: uid(), category: "secondary", text: "", source: "resident" } as Diagnosis,
                ])
              }
            >
              ＋ Add a diagnosis
            </OptionRow>
          </>
        );

      case "procedures":
        return (
          <>
            {draft.procedures.map((p, i) => {
              const setP = (patchObj: Partial<typeof p>) =>
                patch("procedures", "procedures", draft.procedures.map((x, j) => (j === i ? { ...x, ...patchObj } : x)));
              if (p.name === NO_PROCEDURE_NAME)
                return (
                  <div key={p.id} className="flex items-center gap-2 rounded-[10px] border border-line px-3 py-2.5">
                    <span className="flex-1 text-footnote font-semibold">{NO_PROCEDURE_NAME}</span>
                    <span className="text-caption2 text-muted">recorded by you</span>
                    <button type="button" onClick={() => patch("procedures", "procedures", draft.procedures.filter((_, j) => j !== i))} className="min-h-11 text-caption text-accent">
                      Undo
                    </button>
                  </div>
                );
              return (
                <div key={p.id} className="flex flex-col gap-2 rounded-[10px] border border-line p-2.5">
                  <SuggestField label="Procedure" value={p.name} options={profile.procedureSuggestions} onChange={(v) => setP({ name: v })} />
                  <Field label="Date" type="date" value={p.date} onChange={(v) => setP({ date: v || null })} />
                  <Field label="Indication" value={p.indication} onChange={(v) => setP({ indication: v })} />
                  <Field label="Anaesthesia" value={p.anaesthesia} onChange={(v) => setP({ anaesthesia: v })} />
                  <Area label="Significant findings" value={p.findings} onChange={(v) => setP({ findings: v })} rows={2} />
                  <Field label="Drains" value={p.drains} onChange={(v) => setP({ drains: v })} />
                  <Field label="Complications" value={p.complications} onChange={(v) => setP({ complications: v })} />
                  <Field label="Outcome" value={p.outcome} onChange={(v) => setP({ outcome: v })} />
                  <button type="button" onClick={() => patch("procedures", "procedures", draft.procedures.filter((_, j) => j !== i))} className="self-start text-caption text-muted">
                    Remove procedure
                  </button>
                </div>
              );
            })}
            <OptionRow
              dashed
              onClick={() =>
                patch("procedures", "procedures", [
                  ...draft.procedures,
                  { id: uid(), name: "", date: null, indication: null, anaesthesia: null, findings: null, drains: null, complications: null, outcome: null, source: "resident" as const },
                ])
              }
            >
              ＋ Add a procedure
            </OptionRow>
            {/* A positive statement the resident makes, never a default: offered only on an
                empty card, and stored as a row that prints as written. */}
            {!profile.operative && draft.procedures.length === 0 && (
              <OptionRow
                dashed
                onClick={() =>
                  patch("procedures", "procedures", [
                    { id: uid(), name: NO_PROCEDURE_NAME, date: null, indication: null, anaesthesia: null, findings: null, drains: null, complications: null, outcome: null, source: "resident" as const },
                  ])
                }
              >
                No procedure done
              </OptionRow>
            )}
          </>
        );

      case "clinicalCourse": {
        const drafting = autoGen.has("clinical_course") && !draft.clinicalCourse.text.trim();
        return (
          <>
            <p className="text-caption leading-[1.45] text-muted">
              Mandatory. The AI synthesises it from the whole record; read it against the rounds, edit, then approve.
            </p>
            {drafting ? (
              <p className="text-footnote text-accent">Synthesising the admission from the record…</p>
            ) : (
              <button
                type="button"
                disabled={readOnly || generating === "clinical_course"}
                onClick={() => generate("clinical_course")}
                className={genBtn}
              >
                {generating === "clinical_course" ? "Generating…" : draft.clinicalCourse.text ? "Regenerate with AI" : "Generate with AI"}
              </button>
            )}
            {draft.clinicalCourse.uncertainPoints.length > 0 && (
              <div className="rounded-[10px] bg-warn-bg p-2.5 text-footnote text-warn-fg">
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
              <button type="button" onClick={() => approve("clinicalCourse")} className={approveBtn}>
                Approve Clinical Course
              </button>
            )}
          </>
        );
      }

      case "relevantInvestigations": {
        const drafting = autoGen.has("investigations") && draft.relevantInvestigations.items.length === 0;
        return (
          <>
            <p className="text-caption leading-[1.45] text-muted">
              The short, meaningful results — not whole panels. The AI proposes from what was recorded; keep the ones that matter.
            </p>
            {drafting ? (
              <p className="text-footnote text-accent">Picking out the results that mattered…</p>
            ) : (
              <button
                type="button"
                disabled={readOnly || generating === "investigations"}
                onClick={() => generate("investigations")}
                className={genBtn}
              >
                {generating === "investigations" ? "Analysing…" : draft.relevantInvestigations.items.length ? "Propose again with AI" : "Propose with AI"}
              </button>
            )}
            {draft.relevantInvestigations.items.map((it, i) => {
              const setIt = (o: Partial<typeof it>) =>
                patch("relevantInvestigations", "relevantInvestigations", {
                  ...draft.relevantInvestigations,
                  approvedAt: null,
                  approvedBy: null,
                  items: draft.relevantInvestigations.items.map((x, j) => (j === i ? { ...x, ...o } : x)),
                });
              return (
                <div key={it.id} className="flex flex-col gap-2 rounded-[10px] border border-line p-2.5">
                  <div className="flex items-center gap-3">
                    <span className="flex-1 text-footnote font-medium">{it.group || "Result"}</span>
                    <Toggle on={it.accepted} onClick={() => setIt({ accepted: !it.accepted })} />
                  </div>
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
                    className="self-start text-caption text-muted"
                  >
                    Remove
                  </button>
                </div>
              );
            })}
            <OptionRow
              dashed
              onClick={() =>
                patch("relevantInvestigations", "relevantInvestigations", {
                  ...draft.relevantInvestigations,
                  items: [
                    ...draft.relevantInvestigations.items,
                    { id: uid(), group: "", text: "", interpretation: null, accepted: true, source: "resident" as const, sourceObservationIds: [] },
                  ],
                })
              }
            >
              ＋ Add a result
            </OptionRow>
            {draft.relevantInvestigations.items.length > 0 && !draft.relevantInvestigations.approvedAt && !readOnly && (
              <button type="button" onClick={() => approve("relevantInvestigations")} className={approveBtn}>
                Approve list
              </button>
            )}
          </>
        );
      }

      case "histopathology":
        return (
          <>
            {draft.histopathology.map((h, i) => {
              const setH = (o: Partial<typeof h>) =>
                patch("histopathology", "histopathology", draft.histopathology.map((x, j) => (j === i ? { ...x, ...o } : x)));
              return (
                <div key={h.id} className="flex flex-col gap-2 rounded-[10px] border border-line p-2.5">
                  <Field label="Specimen" value={h.specimen} onChange={(v) => setH({ specimen: v })} />
                  <Field label="Date sent" type="date" value={h.dateSent} onChange={(v) => setH({ dateSent: v || null })} />
                  <div className="flex flex-col gap-1">
                    <span className="text-footnote text-muted">Status</span>
                    <div className="flex flex-wrap gap-1.5">
                      {(["pending", "preliminary", "final"] as HistopathologyStatus[]).map((s) => (
                        <SelChip key={s} selected={h.status === s} onClick={() => setH({ status: s })}>
                          {s[0].toUpperCase() + s.slice(1)}
                        </SelChip>
                      ))}
                    </div>
                  </div>
                  <Area label="Result" value={h.result} onChange={(v) => setH({ result: v })} rows={2} />
                  <Field label="Review plan" value={h.reviewPlan} onChange={(v) => setH({ reviewPlan: v })} placeholder="Review during Surgery OPD follow-up" />
                  <button type="button" onClick={() => patch("histopathology", "histopathology", draft.histopathology.filter((_, j) => j !== i))} className="self-start text-caption text-muted">
                    Remove
                  </button>
                </div>
              );
            })}
            <OptionRow
              dashed
              onClick={() =>
                patch("histopathology", "histopathology", [
                  ...draft.histopathology,
                  { id: uid(), specimen: "", dateSent: null, status: "pending" as const, result: null, reviewPlan: null, source: "resident" as const },
                ])
              }
            >
              ＋ Add a specimen
            </OptionRow>
          </>
        );

      case "medications":
        return (
          <>
            <p className="text-caption leading-[1.45] text-muted">Tap a drug to open its details. Remove what this patient does not need.</p>
            {draft.medications.map((m, i) => {
              const setM = (o: Partial<typeof m>) =>
                patch("medications", "medications", draft.medications.map((x, j) => (j === i ? { ...x, ...o } : x)));
              const open = openMed === m.id;
              const summary = [m.dose, m.frequency, m.duration ? `× ${m.duration}` : null].filter(Boolean).join(" ");
              return (
                <div key={m.id} className="rounded-[10px] border border-line">
                  <div className="flex items-center gap-2 px-3 py-2.5">
                    <button type="button" onClick={() => setOpenMed(open ? null : m.id)} className="flex-1 text-left">
                      <span className="text-footnote font-semibold">{m.generic || "New drug"}</span>
                      {m.strength ? <span className="text-footnote font-semibold"> {m.strength}</span> : null}
                      {summary ? <span className="ml-1 text-caption text-muted">{summary}</span> : null}
                    </button>
                    {/* 44px to tap, the same 18px dot to see; the negative margin keeps the row's height. */}
                    <button
                      type="button"
                      onClick={() => {
                        const entry = { med: m, index: i };
                        patch("medications", "medications", draft.medications.filter((_, j) => j !== i));
                        setRemovedMed(entry);
                        setTimeout(() => setRemovedMed((r) => (r === entry ? null : r)), 6000);
                      }}
                      className="-my-2.5 -mr-3 grid h-11 w-11 shrink-0 place-items-center"
                      aria-label="Remove drug"
                    >
                      <span className="grid h-[18px] w-[18px] place-items-center rounded-full bg-chip text-footnote text-muted">×</span>
                    </button>
                  </div>
                  {open && (
                    <div className="flex flex-col gap-2 border-t border-line p-3">
                      <Field label="Generic name" value={m.generic} onChange={(v) => setM({ generic: v })} />
                      <div className="grid grid-cols-2 gap-2">
                        <Field label="Strength" value={m.strength} onChange={(v) => setM({ strength: v })} />
                        <Field label="Dose" value={m.dose} onChange={(v) => setM({ dose: v })} />
                        <Field label="Route" value={m.route} onChange={(v) => setM({ route: v })} />
                        <Field label="Frequency" value={m.frequency} onChange={(v) => setM({ frequency: v })} />
                        <Field label="Duration" value={m.duration} onChange={(v) => setM({ duration: v })} />
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-footnote text-muted">Status</span>
                        <div className="flex flex-wrap gap-1.5">
                          {MEDICATION_STATUSES.map((s) => (
                            <SelChip key={s.value} selected={m.status === s.value} onClick={() => setM({ status: s.value })}>
                              {s.label}
                            </SelChip>
                          ))}
                        </div>
                      </div>
                      <Field label="Indication" value={m.indication} onChange={(v) => setM({ indication: v })} />
                      {(m.status === "changed" || m.status === "stopped" || m.status === "new") && (
                        <Field label="Reason" value={m.reason} onChange={(v) => setM({ reason: v })} placeholder="Why started / stopped / changed" />
                      )}
                      {formularyAvailable && (
                        <div className="text-caption2 text-muted">
                          <FormularyLink wardId={wardId} patientId={patientId} drugKey={m.drugKey} drugLabel={m.generic} mapped={null} />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
            {removedMed && (
              <div className="flex items-center justify-between rounded-[10px] bg-chip pl-3 text-footnote">
                <span className="truncate text-muted">Removed {removedMed.med.generic || "drug"}</span>
                <button
                  type="button"
                  onClick={() => {
                    const meds = [...draft.medications];
                    meds.splice(Math.min(removedMed.index, meds.length), 0, removedMed.med);
                    patch("medications", "medications", meds);
                    setRemovedMed(null);
                  }}
                  className="min-h-11 px-3 font-semibold text-accent"
                >
                  Undo
                </button>
              </div>
            )}
            <OptionRow
              dashed
              onClick={() => {
                const id = uid();
                patch("medications", "medications", [
                  ...draft.medications,
                  { id, generic: "", strength: null, dose: null, route: null, frequency: null, duration: null, indication: null, status: "new" as const, reason: null, drugKey: "", source: "resident" as const },
                ]);
                setOpenMed(id);
              }}
            >
              ＋ Add a medication
            </OptionRow>
            {profile.usualMedicationSet.length > 0 && (
            <OptionRow
              dashed
              onClick={() =>
                patch("medications", "medications", [
                  ...draft.medications,
                  ...profile.usualMedicationSet.map((m) => ({
                    id: uid(),
                    ...m,
                    duration: null,
                    indication: m.indication ?? null,
                    status: "new" as const,
                    reason: null,
                    drugKey: "",
                    source: "resident" as const,
                  })),
                ])
              }
            >
              ＋ Add usual discharge set ({profile.usualMedicationSet.map((m) => m.generic).join(", ")})
            </OptionRow>
            )}
          </>
        );

      case "conditionAtDischarge":
        return (
          <>
            <p className="text-caption leading-[1.45] text-muted">
              Tap what is true today. Set at least {profile.conditionMinimum === 5 ? "five" : profile.conditionMinimum}, or add free text.
            </p>
            <div className="flex flex-wrap gap-2">
              {conditionVars.map((v) => {
                const val = dc.vars[v.key];
                const active = val === true;
                const note = typeof val === "string" ? val.trim() : "";
                return (
                  <SelChip
                    key={v.key}
                    selected={active}
                    tone={note ? "note" : "plain"}
                    onClick={() => setConditionVar(v.key, active ? null : true)}
                  >
                    {active ? v.satisfactory : note ? `${v.label}: ${note}` : v.label}
                  </SelChip>
                );
              })}
            </div>
            {conditionVars.some((v) => typeof dc.vars[v.key] === "string" && (dc.vars[v.key] as string).trim()) && (
              <div className="flex flex-col gap-2 rounded-[10px] border border-line p-2.5">
                <span className="text-footnote text-muted">Findings that carry a note — edit or clear</span>
                {conditionVars.filter((v) => typeof dc.vars[v.key] === "string" && (dc.vars[v.key] as string).trim()).map((v) => (
                  <Field key={v.key} label={v.label} value={dc.vars[v.key] as string} onChange={(nv) => setConditionVar(v.key, nv || null)} />
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
            <p className="text-caption leading-[1.45] text-muted">Only what the patient&rsquo;s GP genuinely needs to do. Prefer 0–3. Leave empty for &ldquo;None.&rdquo;</p>
            <StringList items={draft.primaryCareActions} onChange={(v) => patch("primaryCareActions", "primaryCareActions", v)} placeholder="e.g. Repeat CBC and renal function after 7 days" noneLabel="None." />
          </>
        );

      case "advice":
        return (
          <>
            <div className="flex flex-col gap-2">
              <p className="text-caption leading-[1.45] text-muted">Clear tasks the patient must do. Prefer 0–3.</p>
              <StringList items={draft.patientActions} onChange={(v) => patch("patientActions", "patientActions", v)} placeholder="e.g. Attend Surgery OPD after 7 days for wound review" noneLabel="None." />
            </div>

            <div className="my-1 border-t border-line" />

            <div className="flex items-center gap-3">
              <span className="flex-1 text-subhead">Include an Advice section</span>
              <Toggle on={draft.advice.included} onClick={() => patch("advice", "advice", { ...draft.advice, included: !draft.advice.included })} />
            </div>
            {draft.advice.included && (
              <>
                {draft.advice.items.map((a, i) => (
                  <div key={a.id} className="flex flex-col gap-2 rounded-[10px] border border-line p-2.5">
                    <div className="flex flex-wrap gap-1.5">
                      {ADVICE_MODULES.map((mod) => (
                        <SelChip
                          key={mod}
                          selected={a.module === mod}
                          onClick={() => patch("advice", "advice", { ...draft.advice, items: draft.advice.items.map((x, j) => (j === i ? { ...x, module: mod } : x)) })}
                        >
                          {mod}
                        </SelChip>
                      ))}
                    </div>
                    <Area value={a.text} onChange={(v) => patch("advice", "advice", { ...draft.advice, items: draft.advice.items.map((x, j) => (j === i ? { ...x, text: v } : x)) })} rows={2} />
                    <button type="button" onClick={() => patch("advice", "advice", { ...draft.advice, items: draft.advice.items.filter((_, j) => j !== i) })} className="self-start text-caption text-muted">
                      Remove
                    </button>
                  </div>
                ))}
                <OptionRow dashed onClick={() => patch("advice", "advice", { ...draft.advice, items: [...draft.advice.items, { id: uid(), module: "", text: "" }] })}>
                  ＋ Add advice
                </OptionRow>
              </>
            )}

            <div className="my-1 border-t border-line" />

            <div className="flex items-center gap-3">
              <span className="flex-1 text-subhead">Include a Red Flags section</span>
              <Toggle on={draft.redFlags.included} onClick={() => patch("redFlags", "redFlags", { ...draft.redFlags, included: !draft.redFlags.included })} />
            </div>
            {draft.redFlags.included && (
              <>
                <p className="text-caption text-muted">Tap the warnings that apply.</p>
                <div className="flex flex-wrap gap-1.5">
                  {RED_FLAG_SUGGESTIONS.map((s) => {
                    const on = draft.redFlags.items.includes(s);
                    return (
                      <SelChip
                        key={s}
                        selected={on}
                        onClick={() =>
                          patch("redFlags", "redFlags", {
                            ...draft.redFlags,
                            items: on ? draft.redFlags.items.filter((x) => x !== s) : [...draft.redFlags.items, s],
                          })
                        }
                      >
                        {s}
                      </SelChip>
                    );
                  })}
                </div>
                <StringList
                  items={draft.redFlags.items.filter((x) => !RED_FLAG_SUGGESTIONS.includes(x as (typeof RED_FLAG_SUGGESTIONS)[number]))}
                  onChange={(custom) =>
                    patch("redFlags", "redFlags", {
                      ...draft.redFlags,
                      items: [...draft.redFlags.items.filter((x) => RED_FLAG_SUGGESTIONS.includes(x as (typeof RED_FLAG_SUGGESTIONS)[number])), ...custom],
                    })
                  }
                  placeholder="Another warning sign"
                  noneLabel="Nothing custom added."
                />
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

      case "review": {
        const primary = draft.diagnoses.find((d) => d.category === "primary")?.text;
        const proc = draft.procedures[0]?.name;
        const courseSnippet = draft.clinicalCourse.text.trim().split(/(?<=\.)\s/)[0]?.slice(0, 160) || null;
        const acceptedInv = draft.relevantInvestigations.items.filter(
          (it) => it.accepted || !draft.relevantInvestigations.items.some((x) => x.accepted)
        );
        return (
          <>
            <span
              className={
                "inline-flex items-center gap-1.5 self-start rounded-full px-3 py-1 text-caption font-semibold " +
                (checks.blocking.length === 0 ? "bg-accent/10 text-accent" : "bg-warn-bg text-warn-fg")
              }
            >
              {checks.blocking.length === 0 ? (
                <>
                  <IconCheck className="h-3.5 w-3.5" /> Nothing left to fix
                </>
              ) : (
                `${checks.blocking.length} to fix before finalising`
              )}
            </span>

            {(checks.blocking.length > 0 || checks.warnings.length > 0) && (
              <div className="flex flex-col gap-1">
                {checks.blocking.map((c) => (
                  <button key={c.id} type="button" onClick={() => goTo(stepIndexOf(c.section === "patientActions" || c.section === "redFlags" ? "advice" : c.section))} className="block text-left text-footnote text-critical-fg">
                    ● {c.message}
                  </button>
                ))}
                {checks.warnings.map((c) => (
                  <button key={c.id} type="button" onClick={() => goTo(stepIndexOf(c.section === "patientActions" || c.section === "redFlags" ? "advice" : c.section))} className="block text-left text-footnote text-warn-fg">
                    ▲ {c.message}
                  </button>
                ))}
              </div>
            )}

            {/* The summary as it will read — tap any line to jump to that card and edit it. */}
            <div className="overflow-hidden rounded-[10px] border border-line bg-card text-caption leading-[1.5]">
              <p className="border-b border-line px-3 pb-1.5 pt-2 text-center text-caption2 font-bold uppercase tracking-[0.06em]">
                Discharge summary · tap a line to edit
              </p>
              <PreviewLine label="Diagnosis" onEdit={() => goTo(stepIndexOf("diagnoses"))}>
                {primary || <em className="text-warn-fg">not set</em>}
                {proc ? ` · ${proc}` : ""}
              </PreviewLine>
              <PreviewLine label="Indication" onEdit={() => goTo(stepIndexOf("indication"))}>
                {draft.indicationForAdmission.text.trim().slice(0, 160) || <em className="text-warn-fg">not written</em>}
              </PreviewLine>
              <PreviewLine label="Course" onEdit={() => goTo(stepIndexOf("clinicalCourse"))}>
                {courseSnippet ? `${courseSnippet}…` : <em className="text-warn-fg">not written</em>}
              </PreviewLine>
              <PreviewLine label="Investigations" onEdit={() => goTo(stepIndexOf("relevantInvestigations"))}>
                {acceptedInv.length ? acceptedInv.map((i) => i.group).filter(Boolean).join(", ") : <em className="text-muted">none</em>}
              </PreviewLine>
              {stepIndexOf("histopathology") >= 0 && (
                <PreviewLine label="Histopathology" onEdit={() => goTo(stepIndexOf("histopathology"))}>
                  {draft.histopathology.length
                    ? draft.histopathology.map((h) => `${h.specimen || "specimen"} (${h.status})`).join("; ")
                    : <em className="text-muted">none</em>}
                </PreviewLine>
              )}
              <PreviewLine label="Medication" onEdit={() => goTo(stepIndexOf("medications"))}>
                {draft.medications.length ? draft.medications.map((m) => m.generic).filter(Boolean).join(", ") : <em className="text-muted">none listed</em>}
              </PreviewLine>
              <PreviewLine label="Condition" onEdit={() => goTo(stepIndexOf("conditionAtDischarge"))}>
                {dc.prose.trim() || dc.freeText?.trim() || <em className="text-warn-fg">not set</em>}
              </PreviewLine>
              <PreviewLine label="Patient to" onEdit={() => goTo(stepIndexOf("advice"))}>
                {draft.patientActions.length ? draft.patientActions.join("; ") : <em className="text-muted">nothing added</em>}
              </PreviewLine>
              <PreviewLine label="Advice" onEdit={() => goTo(stepIndexOf("advice"))}>
                {draft.advice.included && draft.advice.items.length
                  ? draft.advice.items.map((a) => a.module || "advice").join(", ")
                  : <em className="text-muted">not included</em>}
              </PreviewLine>
              <PreviewLine label="Red flags" onEdit={() => goTo(stepIndexOf("advice"))}>
                {draft.redFlags.included && draft.redFlags.items.length
                  ? draft.redFlags.items.join(", ")
                  : <em className="text-muted">not included</em>}
              </PreviewLine>
              <PreviewLine label="Signed" onEdit={() => goTo(stepIndexOf("authentication"))} last>
                {draft.authentication.doctorName || <em className="text-warn-fg">name missing</em>}
              </PreviewLine>
            </div>

            <div className="mt-1 flex items-center gap-4">
              <Link href={`/patients/${patientId}/discharge/print`} className="text-footnote text-accent">
                Full page preview
              </Link>
              {!finalised && (
                <button type="button" onClick={() => setAskReset(true)} disabled={pending} className="text-footnote text-muted">
                  Discard edits &amp; rebuild
                </button>
              )}
            </div>
          </>
        );
      }

      default:
        return null;
    }
  }

  const pct = Math.round(((step + 1) / STEPS.length) * 100);
  const isOptionalEmpty =
    current.id !== "review" && !current.required && !filledFor(current.id) && !dirty.has(current.id as DischargeSectionId);
  // An AI card still waiting on approval: the bar's primary approves it on the way past, so
  // the small inline Approve is no longer the only way through and "Next" can't skip it.
  const toApprove: "clinicalCourse" | "indication" | "relevantInvestigations" | null = readOnly
    ? null
    : current.id === "indication" && draft.indicationForAdmission.text && !draft.indicationForAdmission.approvedAt
      ? "indication"
      : current.id === "clinicalCourse" && draft.clinicalCourse.text && !draft.clinicalCourse.approvedAt
        ? "clinicalCourse"
        : current.id === "relevantInvestigations" && draft.relevantInvestigations.items.length > 0 && !draft.relevantInvestigations.approvedAt
          ? "relevantInvestigations"
          : null;

  return (
    <div className="flex flex-col gap-3 px-4 pb-[var(--bar-height)]">
      {finalised && (
        <div className="ios-group flex items-center justify-between px-4 py-3">
          <span className="text-subhead font-medium text-accent">Finalised</span>
          <button type="button" onClick={reopen} className="text-footnote font-medium text-accent" disabled={pending}>
            Reopen to edit
          </button>
        </div>
      )}

      {finalised && finalCheck && (finalCheck.fixes.length > 0 || finalCheck.questions.length > 0) && (
        <div className="ios-group flex flex-col gap-2 px-4 py-3">
          <p className="text-caption2 font-semibold uppercase tracking-[0.03em] text-muted">Final check</p>
          {finalCheck.fixes.length > 0 && (
            <details>
              <summary className="text-footnote">
                Tidied {finalCheck.fixes.length} {finalCheck.fixes.length === 1 ? "thing" : "things"} at the last finalise or print
              </summary>
              <ul className="mt-1 flex flex-col gap-0.5 text-footnote text-muted">
                {finalCheck.fixes.map((f, i) => (
                  <li key={i}>
                    {f.kind === "reworded"
                      ? "Clinical Course re-punctuated and re-framed — every number, side and negative kept"
                      : `“${f.before}” → ${f.after ? `“${f.after}”` : "removed"}`}
                  </li>
                ))}
              </ul>
            </details>
          )}
          {finalCheck.questions.length > 0 && (
            <>
              <p className="text-footnote">Worth a look — reopen to change anything:</p>
              <ul className="flex flex-col gap-1 text-footnote text-warn-fg">
                {finalCheck.questions.map((q, i) => (
                  <li key={i}>{q}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}

      {/* THE CARD */}
      <div className="ios-group overflow-hidden">
        <div className="px-4 pt-4 pb-3">
          <p className="text-caption2 font-semibold uppercase tracking-[0.03em] text-muted">
            Discharge · {step + 1} of {STEPS.length}
          </p>
          <div className="mt-0.5 flex items-start justify-between gap-2">
            <h2 className="text-title1 font-bold leading-tight tracking-[-0.021em]">{current.title}</h2>
            {current.id !== "review" && badgeFor(current.id)}
          </div>
        </div>

        <div className="h-[3px] bg-chip">
          <div className="h-full bg-accent transition-all" style={{ width: `${pct}%` }} />
        </div>

        <div className="flex flex-col gap-3 px-4 py-4">
          {current.id !== "review" && cardSections(current.id).some((s) => blockingBySection.has(s)) && (
            <div className="rounded-[10px] bg-critical-bg px-3 py-2">
              {cardSections(current.id)
                .flatMap((s) => blockingBySection.get(s) ?? [])
                .map((c) => (
                  <p key={c.id} className="text-footnote text-critical-fg">
                    {c.message}
                  </p>
                ))}
            </div>
          )}
          {renderSection(current.id)}
        </div>
      </div>

      {/* jump to any section */}
      <button type="button" onClick={() => setMenuOpen((o) => !o)} className="self-center text-footnote font-medium text-accent">
        {menuOpen ? "Hide sections" : "Jump to a section"}
      </button>

      {/* Reading the paper file in is a step of THIS summary, not a rival to it — so it lives
          here, quietly, rather than as a button on the patient page. */}
      {!finalised && (
        <Link
          href={`/patients/${patientId}/prepare-discharge`}
          className="self-center text-footnote text-muted underline decoration-line underline-offset-2"
        >
          Read in the paper file
        </Link>
      )}
      {menuOpen && (
        <div className="ios-group flex flex-col p-1.5">
          {STEPS.map((s, i) => {
            const isBlocking = s.id !== "review" && cardSections(s.id).some((sec) => blockingBySection.has(sec));
            const done = s.id === "review" ? checks.blocking.length === 0 : filledFor(s.id);
            const dot = isBlocking ? "bg-recording" : done ? "bg-accent" : "bg-line";
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => goTo(i)}
                className={"flex items-center gap-2 rounded-[8px] px-2.5 py-2 text-left text-subhead " + (i === step ? "bg-chip font-medium" : "")}
              >
                <span className={"h-2 w-2 shrink-0 rounded-full " + dot} />
                <span className="text-muted">{i + 1}.</span>
                <span className="flex-1">{s.title}</span>
                {dirty.has(s.id as DischargeSectionId) && <span className="text-caption2 text-accent">unsaved</span>}
              </button>
            );
          })}
        </div>
      )}

      <div className="flex items-center gap-2 text-caption text-muted">
        {saveState === "saving" && <span>Saving…</span>}
        {saveState === "saved" && dirty.size === 0 && <span className="text-accent">All changes saved</span>}
        {saveState === "error" && <span className="text-critical-fg">Not saved — check your connection</span>}
        {message && <span>· {message}</span>}
      </div>

      {/* fixed navigation */}
      <ActionSheet
        open={askReset}
        title="Rebuild this summary from the record?"
        message="Every edit made here is discarded and the summary is compiled again from what was recorded."
        action="Discard edits and rebuild"
        onCancel={() => setAskReset(false)}
        onConfirm={reset}
      />

      <div className="bottom-bar fixed inset-x-0 bottom-0 z-10 mx-auto max-w-md border-t border-line bg-background/90 px-4 pt-3 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => goTo(step - 1)}
            disabled={step === 0}
            className="rounded-[12px] border border-line px-5 py-3 text-subhead font-semibold disabled:opacity-40"
          >
            Back
          </button>

          {current.id !== "review" ? (
            <button
              type="button"
              onClick={() => {
                if (toApprove) approve(toApprove);
                goTo(step + 1);
              }}
              className="flex-1 rounded-[12px] bg-accent px-4 py-3 text-callout font-semibold text-accent-ink"
            >
              {toApprove ? "Approve & next" : isOptionalEmpty ? "Skip" : "Next"}
            </button>
          ) : finalised ? (
            <Link
              href={`/patients/${patientId}/discharge/print`}
              className="flex-1 rounded-[12px] bg-accent px-4 py-3 text-center text-callout font-semibold text-accent-ink"
            >
              Print / download
            </Link>
          ) : (
            <button
              type="button"
              onClick={finalise}
              disabled={pending || checks.blocking.length > 0}
              className="flex-1 rounded-[12px] bg-accent px-4 py-3 text-callout font-semibold text-accent-ink disabled:opacity-50"
            >
              {isFinalising ? "Finalising…" : checks.blocking.length > 0 ? `Finalise (${checks.blocking.length} to fix)` : "Finalise & print"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
