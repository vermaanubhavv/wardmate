"use client";

import { ActionSheet } from "../../../action-sheet";
import { startWait } from "@/lib/track";
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
import { buildConditionProse } from "@/lib/discharge-entities";
import { runDischargeChecks, type DischargeCheckContext } from "@/lib/discharge-checks";
import type { DischargeCheck } from "@/lib/discharge-checks";
import FormularyLink from "./formulary-link";
import LiveDictation, { routeVia, type LiveLine, type LiveSection } from "../live-dictation";
import { applyDischargeLines, DISCHARGE_LIVE_SECTIONS } from "@/lib/late-dictation";
import type { DischargeProfile } from "@/lib/specialty/discharge-profile";
import type { DischargeTemplateIndex } from "@/lib/discharge-template-match";
import type { FinalFix } from "@/lib/final-check";
import { Field, Area, StringList, SuggestField, SelectField, SegmentedField } from "./discharge-fields";
import { DEFAULT_UNIT_CONSULTANTS } from "@/lib/unit-consultants";
import DiagnosisCombobox from "../../diagnosis-combobox";
import { SelChip, OptionRow, Toggle, genBtn, statusChip } from "../card-kit";
import { usePublishedHeight } from "@/lib/use-published-height";
import { Camera, CircleAlert, Check, ChevronLeft, ChevronRight, Mic, Sparkles, TriangleAlert } from "lucide-react";
import {
  saveDischargeSection,
  setDischargeNotRecordedAction,
  revalidateDischargeAction,
  approveDischargeSectionAction,
  finaliseDischargeAction,
  reopenDischargeAction,
  resetDischargeAction,
} from "./actions";
import OneOffStart, { EMPTY_ONE_OFF_START, type OneOffStartState } from "./one-off-start";
import DischargeSheet from "./sheet";
import PrintButton from "../note/print-button";
import type { DischargeDocument } from "@/lib/discharge-render";

// The Admission Details card's option lists — real ones, kept short. Department/Specialty/Unit are
// suggestions only; typing anything else is still fine. Consultant is a closed set on purpose —
// which unit a discharge is written on already says who the consultant is (compiled in from the
// ward's own setting, lib/unit-consultants.ts), so this is a dropdown to correct it, not a box
// to retype it every time and risk a typo on the paper.
const SURGICAL_DEPARTMENTS = ["General Surgery", "Surgical Gastroenterology", "Surgical Oncology"];
const UNIT_SUGGESTIONS = ["Unit Alpha", "Unit 1", "Unit 2", "Unit 3", "Unit 4"];
const CONSULTANT_SUGGESTIONS = Array.from(new Set(Object.values(DEFAULT_UNIT_CONSULTANTS)));
const ADMISSION_TYPES = ["Emergency", "Elective"];

// The operation list, the one-tap drug set and the condition chips are per specialty — see
// dischargeProfileFor() in lib/specialty/discharge.ts; general surgery's are unchanged there.

// --- the look ------------------------------------------------------------------
//
// The workspace opens on the SUMMARY, not on its first section: what it will say, with what
// still needs the resident pinned on top ("3 things need you") and everything already compiled
// from the record below, one line each, reading as it will print. Most sections arrive ready,
// so the resident's work is the short list at the top, not a walk through every card. Tap a
// line to open that section; finishing one goes to the next that needs you, then back to the
// summary. Finalise is always in the bar, with its count. Every section stays one tap away;
// nothing compiled is hidden, it just stops asking for a tap.
//
// The section editors' primitives (SelChip, OptionRow, Toggle, …) live in ../card-kit so the
// case-history workspace can wear the same look.

type StepId = DischargeSectionId | "start";
type View = StepId | "overview";

// Patient Actions and Red Flags live inside the Advice card rather than as their own sections —
// same data, same checks, one less line. Diagnoses comes first, ahead of Indication: the
// indication reads against the diagnosis. Only the screen order moves; the printed order is
// DISCHARGE_SECTIONS' own.
const CARD_SECTIONS = DISCHARGE_SECTIONS.filter((s) => s.id !== "patientActions" && s.id !== "redFlags");
const ALL_CARDS: { id: StepId; title: string }[] = [
  ...CARD_SECTIONS.filter((s) => s.id === "diagnoses"),
  ...CARD_SECTIONS.filter((s) => s.id !== "diagnoses"),
].map((s) => ({ id: s.id as StepId, title: s.title }));

/** The short label a section goes by on the summary and in "next: …". */
const SHORT: Partial<Record<StepId, string>> = {
  diagnoses: "Diagnosis",
  indication: "Indication",
  admission: "Admission",
  procedures: "Operation",
  clinicalCourse: "Clinical Course",
  conditionAtDischarge: "Condition",
  relevantInvestigations: "Investigations",
  histopathology: "Histopathology",
  medications: "Medications",
  primaryCareActions: "For the GP",
  advice: "Advice",
  authentication: "Signed",
};

/** The sections this unit's summary has. A non-operating unit sees "Procedures", and no
 *  Histopathology unless the draft already holds a specimen — nothing on record is hidden. */
function cardsFor(profile: DischargeProfile, hasHistopathology: boolean) {
  return profile.operative
    ? ALL_CARDS
    : ALL_CARDS.filter((s) => s.id !== "histopathology" || hasHistopathology).map((s) =>
        s.id === "procedures" ? { ...s, title: "Procedures" } : s
      );
}

/** The sections whose checks belong to a card — Advice carries Patient Actions and Red Flags. */
function cardSections(id: StepId): DischargeSectionId[] {
  if (id === "start") return [];
  return id === "advice" ? ["advice", "patientActions", "redFlags"] : [id as DischargeSectionId];
}

/** The card a section is edited on. */
const cardOf = (section: DischargeSectionId): StepId =>
  section === "patientActions" || section === "redFlags" ? "advice" : section;

/** One section on the summary — reads as the finished summary will, and is the tap target for
 *  editing it. */
function SummaryRow({ label, onEdit, last, children }: { label: string; onEdit: () => void; last?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onEdit}
      className={"flex min-h-11 w-full items-start gap-2.5 px-3.5 py-2.5 text-left text-footnote leading-snug active:bg-chip" + (last ? "" : " border-b border-line/60")}
    >
      <Check className="mt-px h-4 w-4 shrink-0 text-accent" strokeWidth={2.4} aria-hidden />
      <span className="min-w-0 flex-1">
        <span className="font-semibold">{label}</span> {children}
      </span>
    </button>
  );
}

const DX_CATEGORIES: { value: DiagnosisCategory; label: string }[] = [
  { value: "primary", label: "Primary" },
  { value: "secondary", label: "Secondary" },
  { value: "comorbidity", label: "Comorbidity" },
  { value: "complication", label: "Complication" },
];

/**
 * The dictated words a compiled row rests on — the same (i) the patient page offers, so a drug
 * or a diagnosis on the summary is never only the compiler's word for it. A value still amber
 * says so, in amber, and the row blocks Finalise until it is confirmed on the patient page.
 */
function Sources({ ids, sources, patientId }: { ids?: string[]; sources?: DischargeCheckContext["sources"]; patientId: string }) {
  const rows = (ids ?? []).map((id) => sources?.[id]).filter((s): s is NonNullable<typeof s> => !!s);
  if (rows.length === 0) return null;
  const unconfirmed = rows.some((r) => r.unconfirmed);
  return (
    <p className={"text-caption2 leading-snug " + (unconfirmed ? "text-warn-fg" : "text-muted")}>
      From: {rows.map((r) => `“${r.quote}”`).join(" · ")}
      {unconfirmed && (
        <>
          {" · "}
          <Link href={`/patients/${patientId}`} className="font-semibold underline">
            not confirmed — confirm on the patient page
          </Link>
        </>
      )}
    </p>
  );
}

export default function DischargeWorkspace({
  patientId,
  initialDraft,
  checkContext,
  wardId,
  formularyAvailable,
  aiReady,
  finalCheck,
  profile,
  oneOff = false,
  templateIndex = { templates: [], generic: { key: "", label: "" } },
}: {
  /** "" in one-off mode. */
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
  /**
   * A discharge for somebody who is not in WardMate (app/prepare-discharge/new). The same cards,
   * with a Start card in front; the draft lives in this component's state only — no autosave,
   * no AI drafting, no dictation, no patient server action — and Finalise becomes Preview &
   * print. Every guard below is `if (oneOff)`, so the patient path is untouched.
   */
  oneOff?: boolean;
  /** One-off mode only: the unit's templates, slim, for the Start card. */
  templateIndex?: DischargeTemplateIndex;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [draft, setDraft] = useState<DischargeDraft>(initialDraft);
  // Fixed for the visit: a card must not vanish under the resident mid-edit. (A one-off's Build
  // can add a specimen, which switches the card on; nothing switches it off.)
  const [oneOffHistopathology, setOneOffHistopathology] = useState(false);
  const hasHistopathology = oneOff ? oneOffHistopathology : initialDraft.histopathology.length > 0;
  const CARDS = useMemo(() => cardsFor(profile, hasHistopathology), [profile, hasHistopathology]);
  // The unit's own department first; surgery's sub-departments only where the unit operates.
  const departmentSuggestions = [...new Set([profile.specialtyLabel, ...(profile.operative ? SURGICAL_DEPARTMENTS : [])])];
  const [dirty, setDirty] = useState<Set<DischargeSectionId>>(new Set());
  const [pending, startTransition] = useTransition();
  const [isFinalising, setIsFinalising] = useState(false);
  const [generating, setGenerating] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  // Opens on the summary — or on the section named in ?section, which is how "tap a line to
  // edit" on the printable summary lands you in the right place. A one-off opens on its Start
  // card: there is no record to summarise yet. Read once, at first render.
  const [view, setView] = useState<View>(() => {
    const s = searchParams.get("section") as DischargeSectionId | null;
    const card = s ? cardOf(s) : null;
    if (card && CARDS.some((c) => c.id === card)) return card;
    return oneOff ? "start" : "overview";
  });
  const [askReset, setAskReset] = useState(false);
  const [openMed, setOpenMed] = useState<string | null>(null);
  // The drug last removed, and where it sat, for the inline Undo — no confirm dialog.
  const [removedMed, setRemovedMed] = useState<{ med: DischargeDraft["medications"][number]; index: number } | null>(null);
  // One-off only: the Start card's pages and identity, the checks' facts from the pages read
  // in, the template the last Build used, and the rendered sheet once previewed.
  const [start, setStart] = useState<OneOffStartState>(EMPTY_ONE_OFF_START);
  const [oneOffCheckContext, setOneOffCheckContext] = useState(checkContext);
  const [usedTemplate, setUsedTemplate] = useState<string | null>(null);
  const [oneOffDoc, setOneOffDoc] = useState<DischargeDocument | null>(null);
  // The floating bar publishes its own height, so the page always leaves room for it.
  const barRef = usePublishedHeight("--bar-height", 16);

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
      admission: d.admission,
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
    if (oneOff) return true; // nothing is stored
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
    if (oneOff) return;
    setSaveState("saving");
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => void flushSaves(), 900);
  };

  // Anything still unsaved when the resident leaves — flush it without blocking the navigation.
  useEffect(() => {
    return () => {
      if (oneOff) return;
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
  //
  // One request per missing section, in parallel, so each card fills the moment its own draft
  // lands — the short Indication no longer waits on the long Clinical Course.
  type AutoSection = "clinical_course" | "indication" | "investigations";
  const [autoGen, setAutoGen] = useState<Set<AutoSection>>(() => {
    const needs = new Set<AutoSection>();
    if (finalised || !aiReady) return needs;
    if (!initialDraft.clinicalCourse.text.trim() && !initialDraft.clinicalCourse.generatedAt) needs.add("clinical_course");
    if (!initialDraft.indicationForAdmission.text.trim() && !initialDraft.indicationForAdmission.generatedAt) needs.add("indication");
    if (initialDraft.relevantInvestigations.items.length === 0 && !initialDraft.relevantInvestigations.generatedAt) {
      needs.add("investigations");
    }
    return needs;
  });
  const autoGenStarted = useRef(false);
  useEffect(() => {
    if (autoGenStarted.current) return;
    autoGenStarted.current = true;
    // Only drop the AI draft in where the resident has not started that section themselves
    // while it was compiling.
    const apply = (section: AutoSection, value: unknown) => {
      const v = value as DischargeDraft[keyof DischargeDraft] & { text?: string; items?: unknown[] };
      if (!v) return;
      setDraft((d) =>
        section === "clinical_course"
          ? d.clinicalCourse.text.trim() ? d : { ...d, clinicalCourse: v as DischargeDraft["clinicalCourse"] }
          : section === "indication"
            ? d.indicationForAdmission.text.trim() || !v.text?.trim()
              ? d
              : { ...d, indicationForAdmission: v as DischargeDraft["indicationForAdmission"] }
            : d.relevantInvestigations.items.length > 0 || v.items?.length === 0
              ? d
              : { ...d, relevantInvestigations: v as DischargeDraft["relevantInvestigations"] }
      );
    };
    const done = (sections: AutoSection[]) =>
      setAutoGen((s) => new Set([...s].filter((x) => !sections.includes(x))));
    const draftOne = async (section: AutoSection) => {
      const stop = startWait(`discharge_draft_${section}`);
      let ok = false;
      try {
        const res = await fetch(`/api/patients/${patientId}/discharge/generate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ section }),
        });
        const data = await res.json();
        ok = res.ok;
        if (res.ok) apply(section, data.section);
      } catch {
        // No signal — the resident falls back to the manual buttons.
      }
      stop(ok);
      done([section]);
    };

    // Drafted only now, on opening the workspace, from the whole stay as it stands.
    autoGen.forEach((s) => void draftOne(s));
  }, [autoGen, patientId]);

  const liveCheckContext = oneOff ? oneOffCheckContext : checkContext;
  const checks = useMemo(() => runDischargeChecks(draft, liveCheckContext), [draft, liveCheckContext]);
  const blockingBySection = useMemo(() => {
    const m = new Map<DischargeSectionId, DischargeCheck[]>();
    for (const c of checks.blocking) m.set(c.section, [...(m.get(c.section) ?? []), c]);
    return m;
  }, [checks]);
  /** A card's red errors, its own and those of any section it carries. */
  const blockingOn = (id: StepId) => cardSections(id).flatMap((s) => blockingBySection.get(s) ?? []);

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

  // Live dictation. Free-text sections take the words straight into the draft (and autosave
  // them like any edit — an AI section loses its approval, exactly as when typed); drugs, the
  // diagnosis and anything unplaced are shown for the resident to put on their card.
  const [live, setLive] = useState<LiveSection[] | null>(null);
  const liveSections = (): LiveSection[] => {
    const existing: Record<string, string> = {
      indication: draft.indicationForAdmission.text,
      diagnoses: draft.diagnoses.map((d) => d.text).filter(Boolean).join("; "),
      clinicalCourse: draft.clinicalCourse.text,
      condition: draft.conditionAtDischarge.freeText ?? "",
      primaryCareActions: draft.primaryCareActions.join("; "),
      patientActions: draft.patientActions.join("; "),
    };
    return DISCHARGE_LIVE_SECTIONS.map((s) => ({ ...s, existing: existing[s.key] }));
  };
  function applyDictation(lines: LiveLine[]) {
    const { touched } = applyDischargeLines(draft, lines);
    if (touched.length === 0) return;
    setDraft((d) => applyDischargeLines(d, lines).draft);
    setDirty((s) => new Set([...s, ...touched]));
    scheduleSave();
  }

  /** Move between the summary and a section. Autosave has the one being left; navigation never
   *  waits. */
  function goTo(next: View) {
    setView(next);
    setOpenMed(null);
    setRemovedMed(null);
    if (typeof window !== "undefined") window.scrollTo({ top: 0 });
  }

  async function generate(section: "clinical_course" | "indication" | "investigations") {
    setGenerating(section);
    setMessage(null);
    const stop = startWait(`discharge_draft_${section}`);
    try {
      const res = await fetch(`/api/patients/${patientId}/discharge/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section }),
      });
      const data = await res.json();
      stop(res.ok);
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
            id: crypto.randomUUID(),
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
    if (oneOff) return; // approval is the resident's, on this screen; nothing to persist

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
    if (oneOff) return void previewOneOff();
    setIsFinalising(true);
    const stop = startWait("discharge_finalise");
    startTransition(async () => {
      if (!(await flushSaves())) {
        stop(false);
        return setIsFinalising(false);
      }
      const result = await finaliseDischargeAction(patientId);
      stop(result.ok);
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

  /** One-off "finalise": render the sheet from the draft as it stands, to print. Nothing stored. */
  async function previewOneOff() {
    setIsFinalising(true);
    setMessage(null);
    try {
      const res = await fetch("/api/prepare-discharge/render", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identity: start.identity, draft }),
      });
      const data = await res.json();
      if (res.ok) {
        setOneOffDoc(data.doc as DischargeDocument);
        if (typeof window !== "undefined") window.scrollTo({ top: 0 });
      } else setMessage(data.error ?? "Could not render the summary.");
    } catch {
      setMessage("No signal. Try again when you have a bar.");
    }
    setIsFinalising(false);
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

  // --- what still needs the resident ------------------------------------------------
  //
  // An AI section with text nobody has approved yet, on this unit's own cards. Only Clinical
  // Course blocks Finalise for it (lib/discharge-checks.ts); the other two are listed so the
  // resident reads them, without blocking.
  function aiPending(id: StepId): boolean {
    if (readOnly) return false;
    if (id === "indication") return !!draft.indicationForAdmission.text.trim() && !draft.indicationForAdmission.approvedAt;
    if (id === "clinicalCourse") return !!draft.clinicalCourse.text.trim() && !draft.clinicalCourse.approvedAt;
    if (id === "relevantInvestigations")
      return draft.relevantInvestigations.items.length > 0 && !draft.relevantInvestigations.approvedAt;
    return false;
  }
  const needs = readOnly ? [] : CARDS.filter((c) => blockingOn(c.id).length > 0 || aiPending(c.id));
  const needsIds = new Set(needs.map((c) => c.id));
  // Warnings on a section already listed under "Needs you" would only say it twice.
  const glance = readOnly ? [] : checks.warnings.filter((w) => !needsIds.has(cardOf(w.section)));
  /** Where finishing this section goes: the next one that needs you, else the summary. */
  function nextAfter(id: StepId): View {
    const order = CARDS.findIndex((c) => c.id === id);
    const rest = needs.filter((c) => c.id !== id);
    return (rest.find((c) => CARDS.findIndex((x) => x.id === c.id) > order) ?? rest[0])?.id ?? "overview";
  }

  /** The one line each section shows on the summary, as it will read when printed. */
  function summaryOf(id: StepId): React.ReactNode {
    const none = (text: string) => <span className="text-muted">{text}</span>;
    const missing = (text: string) => <em className="text-warn-fg">{text}</em>;
    switch (id) {
      case "diagnoses": {
        const primary = draft.diagnoses.find((d) => d.category === "primary")?.text.trim();
        const others = draft.diagnoses.filter((d) => d.category !== "primary" && d.text.trim()).length;
        return primary ? (
          <>
            {primary}
            {others > 0 && <span className="text-muted"> · {others} more</span>}
          </>
        ) : (
          missing("primary not set")
        );
      }
      case "indication":
        return draft.indicationForAdmission.text.trim().slice(0, 140) || none("not written");
      case "admission":
        return (
          [draft.admission.department, draft.admission.unit, draft.admission.admissionType].filter(Boolean).join(" · ") ||
          none("not filled")
        );
      case "procedures":
        return draft.procedures.length
          ? draft.procedures.map((p) => [p.name, p.date].filter(Boolean).join(" · ")).join("; ")
          : none("none this admission");
      case "clinicalCourse": {
        const first = draft.clinicalCourse.text.trim().split(/(?<=\.)\s/)[0]?.slice(0, 140);
        return first ? `${first}…` : missing("not written");
      }
      case "conditionAtDischarge":
        return dc.prose.trim() || dc.freeText?.trim() || missing("not set");
      case "relevantInvestigations": {
        const kept = draft.relevantInvestigations.items.filter((i) => i.accepted);
        return kept.length ? kept.map((i) => i.group).filter(Boolean).join(", ") || `${kept.length} kept` : none("none");
      }
      case "histopathology":
        return draft.histopathology.length
          ? draft.histopathology.map((h) => `${h.specimen || "specimen"} · ${h.status}`).join("; ")
          : none("none");
      case "medications":
        return draft.medications.length
          ? draft.medications.map((m) => [m.generic, m.strength].filter(Boolean).join(" ")).filter(Boolean).join(", ")
          : (draft.notRecorded ?? []).includes("medications")
            ? "None on discharge"
            : none("none listed");
      case "primaryCareActions":
        return draft.primaryCareActions.length ? draft.primaryCareActions.join("; ") : "None.";
      case "advice": {
        const parts = [
          ...draft.patientActions,
          ...(draft.advice.included ? draft.advice.items.map((a) => a.module || "advice") : []),
          ...(draft.redFlags.included && draft.redFlags.items.length ? ["red flags"] : []),
        ];
        return parts.length ? parts.join(" · ") : none("nothing added");
      }
      case "authentication":
        return draft.authentication.doctorName?.trim()
          ? [draft.authentication.doctorName, draft.authentication.designation].filter(Boolean).join(" · ")
          : missing("name missing");
      default:
        return null;
    }
  }

  /** What a "Needs you" row says under its title. */
  function needLine(id: StepId): { text: string; tone: "critical" | "warn" } {
    const blocks = blockingOn(id);
    // An AI draft waiting on approval says just that; its "not approved" blocker would only
    // repeat it at length.
    if (aiPending(id)) return { text: `AI draft to read and approve${blocks.length ? " · blocks Finalise" : ""}`, tone: blocks.length ? "critical" : "warn" };
    if (blocks.length > 0)
      return { text: `Blocks Finalise · ${blocks[0].message}${blocks.length > 1 ? ` (+${blocks.length - 1} more)` : ""}`, tone: "critical" };
    return { text: "", tone: "warn" };
  }

  // --- section bodies -------------------------------------------------------------
  function renderSection(id: StepId): React.ReactNode {
    switch (id) {
      case "start":
        return (
          <OneOffStart
            state={start}
            setState={setStart}
            specialty={profile.specialty}
            templateIndex={templateIndex}
            onBuilt={(built, ctx, label) => {
              setDraft(built);
              if (built.histopathology.length > 0) setOneOffHistopathology(true);
              setOneOffCheckContext(ctx);
              setUsedTemplate(label);
              setDirty(new Set());
              goTo("overview");
            }}
          />
        );

      case "indication": {
        const drafting = autoGen.has("indication") && !draft.indicationForAdmission.text.trim();
        return (
          <>
            <p className="text-caption leading-[1.45] text-muted">
              Why admission was needed — not a repeat of the diagnosis.{oneOff ? "" : " The AI drafts it from the record; you approve."}
            </p>
            {oneOff ? null : drafting ? (
              <p className="text-footnote text-accent">Drafting from the record…</p>
            ) : (
              <button type="button" disabled={readOnly || generating === "indication"} onClick={() => generate("indication")} className={genBtn}>
                {generating === "indication" ? "Generating…" : draft.indicationForAdmission.text ? "Redraft with AI" : "Generate with AI"}
              </button>
            )}
            <Area value={draft.indicationForAdmission.text} onChange={editIndication} rows={3} placeholder="Patient admitted with … requiring …" />
          </>
        );
      }

      case "admission":
        return (
          <div className="grid grid-cols-2 gap-3">
            <SuggestField label="Department" value={draft.admission.department} options={departmentSuggestions} onChange={(v) => patch("admission", "admission", { ...draft.admission, department: v })} />
            <SuggestField label="Specialty" value={draft.admission.specialty} options={departmentSuggestions} placeholder={profile.specialtyLabel} onChange={(v) => patch("admission", "admission", { ...draft.admission, specialty: v })} />
            <Field label="Ward" value={draft.admission.ward} onChange={(v) => patch("admission", "admission", { ...draft.admission, ward: v })} />
            <Field label="Bed" value={draft.admission.bed} onChange={(v) => patch("admission", "admission", { ...draft.admission, bed: v })} />
            <SelectField label="Consultant" value={draft.admission.consultant} options={CONSULTANT_SUGGESTIONS} onChange={(v) => patch("admission", "admission", { ...draft.admission, consultant: v })} />
            <SuggestField label="Unit" value={draft.admission.unit} options={UNIT_SUGGESTIONS} onChange={(v) => patch("admission", "admission", { ...draft.admission, unit: v })} />
            <div className="col-span-2">
              <SegmentedField label="Admission type" value={draft.admission.admissionType} options={ADMISSION_TYPES} onChange={(v) => patch("admission", "admission", { ...draft.admission, admissionType: v })} />
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
                  <Sources ids={d.sourceObservationIds} sources={liveCheckContext.sources} patientId={patientId} />
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
                  { id: crypto.randomUUID(), category: "secondary", text: "", source: "resident" } as Diagnosis,
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
                  <Sources ids={p.sourceObservationIds} sources={liveCheckContext.sources} patientId={patientId} />
                  {/* A unit that does not operate prints one line — what, when, what it found —
                      so it asks only for that. */}
                  {profile.operative ? (
                    <>
                      <Field label="Indication" value={p.indication} onChange={(v) => setP({ indication: v })} />
                      <Field label="Anaesthesia" value={p.anaesthesia} onChange={(v) => setP({ anaesthesia: v })} />
                      <Area label="Significant findings" value={p.findings} onChange={(v) => setP({ findings: v })} rows={2} />
                      <Field label="Drains" value={p.drains} onChange={(v) => setP({ drains: v })} />
                      <Field label="Complications" value={p.complications} onChange={(v) => setP({ complications: v })} />
                      <Field label="Outcome" value={p.outcome} onChange={(v) => setP({ outcome: v })} />
                    </>
                  ) : (
                    <>
                      <Area label="Key findings" value={p.findings} onChange={(v) => setP({ findings: v })} rows={2} />
                      <Field label="Complications" value={p.complications} onChange={(v) => setP({ complications: v })} />
                    </>
                  )}
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
                  { id: crypto.randomUUID(), name: "", date: null, indication: null, anaesthesia: null, findings: null, drains: null, complications: null, outcome: null, source: "resident" as const },
                ])
              }
            >
              ＋ Add a procedure
            </OptionRow>
            {!profile.operative && draft.procedures.length === 0 && (
              <p className="text-caption text-muted">
                Add only a procedure actually done this admission. With none, this section is left off the summary.
              </p>
            )}
          </>
        );

      case "clinicalCourse": {
        const drafting = autoGen.has("clinical_course") && !draft.clinicalCourse.text.trim();
        return (
          <>
            <p className="text-caption leading-[1.45] text-muted">
              Mandatory.{oneOff ? " Write the stay, then approve." : " The AI synthesises it from the whole record; read it against the rounds, edit, then approve."}
            </p>
            {oneOff ? null : drafting ? (
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
          </>
        );
      }

      case "relevantInvestigations": {
        const drafting = autoGen.has("investigations") && draft.relevantInvestigations.items.length === 0;
        return (
          <>
            <p className="text-caption leading-[1.45] text-muted">
              The short, meaningful results — not whole panels.{oneOff ? "" : " The AI proposes from what was recorded; keep the ones that matter."}
            </p>
            {oneOff ? null : drafting ? (
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
                    { id: crypto.randomUUID(), group: "", text: "", interpretation: null, accepted: true, source: "resident" as const, sourceObservationIds: [] },
                  ],
                })
              }
            >
              ＋ Add a result
            </OptionRow>
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
                  { id: crypto.randomUUID(), specimen: "", dateSent: null, status: "pending" as const, result: null, reviewPlan: null, source: "resident" as const },
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
                  <div className="px-3 pb-2 empty:hidden">
                    <Sources ids={m.sourceObservationIds} sources={liveCheckContext.sources} patientId={patientId} />
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
            {draft.medications.length === 0 && !oneOff && (
              <div className="flex items-center gap-3 rounded-[10px] border border-line px-3 py-2.5">
                <div className="flex-1">
                  <p className="text-footnote font-semibold">No medications on discharge</p>
                  <p className="text-caption2 text-muted">
                    Printed in words. Left unmarked, an empty list prints as a blank line and, with drugs on the record, blocks Finalise.
                  </p>
                </div>
                <Toggle
                  on={(draft.notRecorded ?? []).includes("medications")}
                  onClick={() => {
                    const was = (draft.notRecorded ?? []).includes("medications");
                    const next = was
                      ? (draft.notRecorded ?? []).filter((x) => x !== "medications")
                      : [...(draft.notRecorded ?? []), "medications" as DischargeSectionId];
                    setDraft((d) => ({ ...d, notRecorded: next }));
                    void setDischargeNotRecordedAction(patientId, next).then((r) => {
                      if (!r.ok) setMessage(r.error ?? "Could not save the mark.");
                    });
                  }}
                />
              </div>
            )}
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
                const id = crypto.randomUUID();
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
                    id: crypto.randomUUID(),
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
            {/* The resident's own one-tap statement, offered only on an untouched card. Wound and
                drain are findings, and sugars and BP apply only to some patients, so none of those
                is included — the resident taps them separately where true. */}
            {conditionVars.every((v) => dc.vars[v.key] == null) && (
              <button
                type="button"
                onClick={() => {
                  const skip: ConditionVariableKey[] = ["wound", "drain", "sugars", "bp"];
                  const vars = { ...dc.vars };
                  for (const v of conditionVars) if (!skip.includes(v.key)) vars[v.key] = true;
                  patch("conditionAtDischarge", "conditionAtDischarge", {
                    ...dc,
                    vars,
                    prose: dc.proseEdited ? dc.prose : buildConditionProse(vars),
                  });
                }}
                className="min-h-11 self-start rounded-[10px] border border-line bg-card px-3.5 text-subhead font-medium text-accent active:opacity-60"
              >
                Mark the standard items satisfactory
              </button>
            )}
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
              <StringList items={draft.patientActions} onChange={(v) => patch("patientActions", "patientActions", v)} placeholder={profile.operative ? "e.g. Attend Surgery OPD after 7 days for wound review" : `e.g. Attend ${profile.specialtyLabel} OPD after 7 days with reports`} noneLabel="None." />
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
                    {/* A dropdown, not a row of 13 chips: "Wound care" was the first chip, right
                        where a thumb lands, and one stray tap retagged diet advice as wound care
                        on a printed summary. Changing a heading should take a deliberate pick. */}
                    <SelectField
                      label="Heading"
                      value={a.module}
                      onChange={(mod) => patch("advice", "advice", { ...draft.advice, items: draft.advice.items.map((x, j) => (j === i ? { ...x, module: mod } : x)) })}
                      options={[...ADVICE_MODULES]}
                    />
                    <Area value={a.text} onChange={(v) => patch("advice", "advice", { ...draft.advice, items: draft.advice.items.map((x, j) => (j === i ? { ...x, text: v } : x)) })} rows={2} />
                    <button type="button" onClick={() => patch("advice", "advice", { ...draft.advice, items: draft.advice.items.filter((_, j) => j !== i) })} className="self-start text-caption text-muted">
                      Remove
                    </button>
                  </div>
                ))}
                <OptionRow dashed onClick={() => patch("advice", "advice", { ...draft.advice, items: [...draft.advice.items, { id: crypto.randomUUID(), module: "", text: "" }] })}>
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

      default:
        return null;
    }
  }

  // An AI section still waiting on approval: the bar's primary approves it on the way past, so
  // the small inline Approve is not the only way through and moving on can't skip it.
  const toApprove =
    (view === "indication" || view === "clinicalCourse" || view === "relevantInvestigations") && aiPending(view) ? view : null;

  if (oneOffDoc) {
    return (
      <div className="flex flex-col gap-3 px-4 pb-8 print:px-0">
        <p className="text-footnote leading-relaxed text-muted print:hidden">
          Nothing here has been stored. Print or save it now — leaving this screen loses it.
        </p>
        <DischargeSheet doc={oneOffDoc} wardId="" patientId="" formularyAvailable={false} />
        <div className="print:hidden">
          <PrintButton />
        </div>
        <button
          type="button"
          onClick={() => setOneOffDoc(null)}
          className="rounded-[10px] border border-line px-4 py-3 text-subhead print:hidden"
        >
          Back to editing
        </button>
      </div>
    );
  }

  const saveLine = (
    <p className="text-center text-caption text-muted">
      {saveState === "saving" && "Saving…"}
      {saveState === "saved" && dirty.size === 0 && <span className="text-accent">All changes saved</span>}
      {saveState === "error" && <span className="text-critical-fg">Not saved — check your connection</span>}
      {message && <span>{saveState !== "idle" ? " · " : ""}{message}</span>}
    </p>
  );

  const finaliseButton = finalised ? (
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
      {oneOff
        ? isFinalising
          ? "Rendering…"
          : checks.blocking.length > 0
            ? `Preview & print · ${checks.blocking.length} to fix`
            : "Preview & print"
        : isFinalising
          ? "Finalising…"
          : checks.blocking.length > 0
            ? `Finalise · ${checks.blocking.length} to fix`
            : "Finalise & print"}
    </button>
  );

  /** The bar that floats at the foot of the screen: the summary's Finalise, or a section's
   *  way on. */
  const bar = (primary: React.ReactNode, secondary: React.ReactNode) => (
    <div
      ref={barRef}
      className="bottom-bar fixed inset-x-0 bottom-0 z-10 mx-auto flex max-w-md flex-col gap-1.5 border-t border-line bg-background/90 px-4 pt-3 backdrop-blur-xl"
    >
      <div className="flex items-center gap-2">
        {secondary}
        {primary}
      </div>
      {saveLine}
    </div>
  );
  const secondaryBtn = "rounded-[12px] border border-line px-5 py-3 text-subhead font-semibold";

  const dictation = live && (
    <LiveDictation
      patientId={patientId}
      screen="discharge"
      title="Dictating the discharge"
      example="e.g. “admitted with acute appendicitis… underwent lap appendicectomy on day one, uneventful recovery… review in surgery OPD after a week…”"
      sections={live}
      route={routeVia(patientId, live)}
      onLines={applyDictation}
      onClose={() => setLive(null)}
    />
  );

  // --- a section ----------------------------------------------------------------------
  if (view !== "overview") {
    const card = view === "start" ? { id: "start" as StepId, title: "Start" } : CARDS.find((c) => c.id === view);
    const next = view === "start" ? "overview" : nextAfter(view);
    const nextLabel = next === "overview" ? null : SHORT[next];
    const needIndex = needs.findIndex((c) => c.id === view);
    const blocks = blockingOn(view);
    return (
      <div className="flex flex-col gap-3 px-4 pb-[var(--bar-height)]">
        {oneOff && usedTemplate && view !== "start" && (
          <p className="text-footnote leading-relaxed text-muted">
            Filled from the {usedTemplate} template. Replace every <span className="font-mono">[ … ]</span> with the patient&rsquo;s details.
          </p>
        )}
        {dictation}
        <button type="button" onClick={() => goTo("overview")} className="tap flex items-center gap-0.5 self-start text-subhead text-accent">
          <ChevronLeft className="h-5 w-5" aria-hidden /> Summary
        </button>
        <div className="ios-group flex flex-col gap-3 px-4 py-4">
          <div>
            <p className="text-caption2 font-semibold uppercase tracking-[0.03em] text-muted">
              {needIndex >= 0 ? `Needs you · ${needIndex + 1} of ${needs.length}` : "Discharge summary"}
            </p>
            <div className="mt-0.5 flex items-start justify-between gap-2">
              <h2 className="text-title1 font-bold leading-tight tracking-[-0.021em]">{card?.title}</h2>
              {aiPending(view) && (
                <span className="mt-1.5 inline-flex shrink-0 items-center gap-1 rounded-full bg-warn-bg px-2.5 py-1 text-caption font-semibold text-warn-fg">
                  <Sparkles className="h-3 w-3" aria-hidden /> AI draft
                </span>
              )}
              {view === "medications" && draft.medications.length === 0 && (draft.notRecorded ?? []).includes("medications") && statusChip("none on discharge", "muted")}
            </div>
          </div>
          {blocks.length > 0 && (
            <div className="rounded-[10px] bg-critical-bg px-3 py-2">
              {blocks.map((c) => (
                <p key={c.id} className="text-footnote text-critical-fg">
                  {c.message}
                </p>
              ))}
            </div>
          )}
          {renderSection(view)}
        </div>
        {bar(
          view === "start" ? (
            <button type="button" onClick={() => goTo("overview")} className="flex-1 rounded-[12px] bg-accent px-4 py-3 text-callout font-semibold text-accent-ink">
              Go to the summary
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                if (toApprove) approve(toApprove);
                goTo(next);
              }}
              className="flex-1 rounded-[12px] bg-accent px-4 py-3 text-callout font-semibold text-accent-ink"
            >
              {toApprove ? (nextLabel ? `Approve · next: ${nextLabel}` : "Approve · done") : nextLabel ? `Next: ${nextLabel}` : "Done"}
            </button>
          ),
          view === "start" ? null : (
            <button type="button" onClick={() => goTo("overview")} className={secondaryBtn}>
              Summary
            </button>
          )
        )}
      </div>
    );
  }

  // --- the summary --------------------------------------------------------------------
  const readyCards = CARDS.filter((c) => !needsIds.has(c.id));
  const segment = (id: StepId) =>
    blockingOn(id).length > 0 ? "bg-critical-dot" : aiPending(id) ? "bg-warn-dot" : "bg-accent";
  return (
    <div className="flex flex-col gap-3 px-4 pb-[var(--bar-height)]">
      {oneOff && usedTemplate && (
        <p className="text-footnote leading-relaxed text-muted">
          Filled from the {usedTemplate} template. Replace every <span className="font-mono">[ … ]</span> with the patient&rsquo;s details.
        </p>
      )}
      {dictation}

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

      <div className="ios-group flex flex-col gap-2.5 px-4 py-4">
        <p className="text-caption2 font-semibold uppercase tracking-[0.03em] text-muted">Discharge summary</p>
        <div className="flex items-center gap-2.5">
          {(finalised || needs.length === 0) && (
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-accent/10 text-accent">
              <Check className="h-[18px] w-[18px]" strokeWidth={2.6} aria-hidden />
            </span>
          )}
          <h2 className="text-title1 font-bold leading-tight tracking-[-0.021em]">
            {finalised
              ? "Finalised"
              : needs.length === 0
                ? "Ready to finalise"
                : `${needs.length} ${needs.length === 1 ? "thing needs" : "things need"} you`}
          </h2>
        </div>
        <p className="text-footnote text-muted">
          {finalised
            ? "Reopen it to change anything."
            : `${readyCards.length} of ${CARDS.length} sections ready${oneOff ? "" : " from the record"}`}
        </p>
        <div
          className="grid gap-[3px]"
          style={{ gridTemplateColumns: `repeat(${CARDS.length}, minmax(0, 1fr))` }}
          role="img"
          aria-label={`${readyCards.length} of ${CARDS.length} sections ready`}
        >
          {CARDS.map((c) => (
            <span key={c.id} className={"h-1.5 rounded-full " + segment(c.id)} />
          ))}
        </div>
        {finalised ? (
          <button type="button" onClick={reopen} disabled={pending} className="tap self-start text-footnote font-medium text-accent">
            Reopen to edit
          </button>
        ) : oneOff ? (
          <button type="button" onClick={() => goTo("start")} className="tap self-start text-footnote font-medium text-accent">
            Back to Start — who it is for, the papers, the template
          </button>
        ) : (
            <div className="flex gap-2 pt-0.5">
              {!live && (
                <button
                  type="button"
                  onClick={() => setLive(liveSections())}
                  className="flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-[10px] border border-line text-subhead font-semibold text-accent active:bg-chip"
                >
                  <Mic className="h-[18px] w-[18px]" aria-hidden /> Dictate
                </button>
              )}
              {/* Reading the paper file in is a step of THIS summary, not a rival to it. */}
              <Link
                href={`/patients/${patientId}/prepare-discharge`}
                className="flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-[10px] border border-line text-subhead font-semibold text-accent active:bg-chip"
              >
                <Camera className="h-[18px] w-[18px]" aria-hidden /> Read paper file
              </Link>
            </div>
        )}
      </div>

      {needs.length > 0 && (
        <section className="flex flex-col gap-1.5">
          <p className="ios-group-header px-4">Needs you</p>
          <div className="ios-group overflow-hidden">
            {needs.map((c, i) => {
              const line = needLine(c.id);
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => goTo(c.id)}
                  className={"flex min-h-11 w-full items-center gap-3 px-3.5 py-3 text-left active:bg-chip" + (i < needs.length - 1 ? " border-b border-line/60" : "")}
                >
                  <span
                    className={
                      "grid h-7 w-7 shrink-0 place-items-center rounded-full " +
                      (line.tone === "critical" ? "bg-critical-bg text-critical-fg" : "bg-warn-bg text-warn-fg")
                    }
                  >
                    {line.tone === "critical" ? <CircleAlert className="h-4 w-4" aria-hidden /> : <Sparkles className="h-4 w-4" aria-hidden />}
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="text-subhead font-semibold">{c.title}</span>
                    <span className={"text-footnote " + (line.tone === "critical" ? "text-critical-fg" : "text-warn-fg")}>{line.text}</span>
                  </span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted" aria-hidden />
                </button>
              );
            })}
          </div>
        </section>
      )}

      {glance.length > 0 && (
        <section className="flex flex-col gap-1.5">
          <p className="ios-group-header px-4">Worth a glance · not blocking</p>
          <div className="ios-group overflow-hidden">
            {glance.map((w, i) => (
              <button
                key={w.id}
                type="button"
                onClick={() => goTo(cardOf(w.section))}
                className={"flex min-h-11 w-full items-start gap-2.5 px-3.5 py-2.5 text-left text-footnote leading-snug active:bg-chip" + (i < glance.length - 1 ? " border-b border-line/60" : "")}
              >
                <TriangleAlert className="mt-px h-4 w-4 shrink-0 text-warn-fg" aria-hidden />
                <span className="flex-1">
                  <span className="font-semibold">{SHORT[cardOf(w.section)] ?? w.section}</span> {w.message}
                </span>
              </button>
            ))}
          </div>
        </section>
      )}

      {readyCards.length > 0 && (
        <section className="flex flex-col gap-1.5">
          <p className="ios-group-header px-4">{needs.length > 0 ? "Ready · reads as it will print" : "The summary · tap to change"}</p>
          <div className="ios-group overflow-hidden">
            {readyCards.map((c, i) => (
              <SummaryRow key={c.id} label={SHORT[c.id] ?? c.title} onEdit={() => goTo(c.id)} last={i === readyCards.length - 1}>
                {summaryOf(c.id)}
              </SummaryRow>
            ))}
          </div>
          {!finalised && <p className="px-4 text-caption text-muted">Tap any line to change it. Editing an approved section takes its approval back.</p>}
        </section>
      )}

      {!oneOff && !finalised && (
        <button type="button" onClick={() => setAskReset(true)} disabled={pending} className="tap self-center text-footnote text-muted">
          Discard edits &amp; rebuild
        </button>
      )}

      <ActionSheet
        open={askReset}
        title="Rebuild this summary from the record?"
        message="Every edit made here is discarded and the summary is compiled again from what was recorded."
        action="Discard edits and rebuild"
        onCancel={() => setAskReset(false)}
        onConfirm={reset}
      />

      {bar(
        finaliseButton,
        oneOff ? null : (
          <Link href={`/patients/${patientId}/discharge/print`} className={secondaryBtn}>
            Preview
          </Link>
        )
      )}
    </div>
  );
}
