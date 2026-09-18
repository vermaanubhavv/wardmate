import type { HistoryTree, Slot, SlotState } from "@/lib/history-check/types";
import type { Evidence, HistorySource, SlotResult } from "@/lib/history-check/sources";
import { buildGapList, type CheckMode, type GapList } from "@/lib/history-check/gaps";
import { renderHistoryText, type BackgroundSection } from "@/lib/history-check/render";
import { applyResolutions, type HistoryCheckRun, type Resolutions } from "@/lib/history-check/store";

/**
 * Everything the card needs, computed on the server from a stored run so the client bundle
 * carries no tree content and no validator. Both modes are computed at once; the toggle on
 * the card only picks which one to show.
 *
 * Nothing here is new information: every quote is the model's quote that survived the
 * substring check, every state is the validated state or the resident's own tap.
 */
export type QuoteView = {
  quote: string;
  /** "Voice · 12 Sep" — kind and date of the entry the quote was checked against. */
  source: string;
};

export type AnsweredView = {
  slotId: string;
  label: string;
  group: Slot["group"];
  state: Exclude<SlotState, "unasked">;
  value: string | null;
  /** Numbers, drugs and doses stay amber until confirmed. No confirm flow in v1. */
  unconfirmed: boolean;
  quote: QuoteView | null;
  /** True when the state is the resident's own tap, not a quote. */
  resolved: boolean;
};

export type ConflictView = {
  slotId: string;
  label: string;
  question: string;
  first: QuoteView;
  second: QuoteView;
};

export type GapView = {
  slotId: string;
  label: string;
  question: string;
  /** Empty except in the discriminating band. */
  forDifferentials: string[];
  /** Academic only: why the question is asked. */
  teach: string | null;
  redFlag: boolean;
};

export type BandView = { key: GapList["bands"][number]["key"]; title: string; gaps: GapView[] };

export type ModeView = {
  bands: BandView[];
  text: string;
  unasked: number;
};

export type RunView = {
  runId: string;
  treeId: string;
  treeVersion: string;
  complaint: string;
  reviewStatus: HistoryTree["reviewStatus"];
  status: "ok" | "error";
  error: string | null;
  createdAt: string;
  wrongPatient: QuoteView | null;
  wrongPatientDismissed: boolean;
  conflicts: ConflictView[];
  answered: AnsweredView[];
  answeredCount: number;
  ward: ModeView;
  academic: ModeView;
  /** Downgrades the validator made — shown as a count so the resident knows the model was
   *  overruled, and listed in academic mode. */
  rejected: number;
  /** Leading differentials as "questions that would separate", never as a diagnosis. */
  leading: string[];
};

const KIND_LABEL: Record<HistorySource["kind"], string> = { voice: "Voice", photo: "Photo", manual: "Typed" };

function sourceLabel(sources: HistorySource[], ev: Evidence): string {
  const s = sources[ev.source];
  if (!s) return "Source";
  const date = new Date(s.recordedAt).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short" });
  return `${KIND_LABEL[s.kind]} · ${date}`;
}

function quoteView(sources: HistorySource[], ev: Evidence | null): QuoteView | null {
  return ev ? { quote: ev.quote, source: sourceLabel(sources, ev) } : null;
}

export function buildRunView(
  tree: HistoryTree,
  run: HistoryCheckRun,
  sources: HistorySource[],
  opts: { postOp: boolean; header?: string | null; background?: BackgroundSection[] }
): RunView {
  const base = {
    runId: run.id,
    treeId: tree.id,
    treeVersion: tree.version,
    complaint: tree.complaint,
    reviewStatus: tree.reviewStatus,
    status: run.status,
    error: run.error,
    createdAt: run.created_at,
  };
  const empty: ModeView = { bands: [], text: "", unasked: tree.slots.length };
  if (run.status !== "ok" || !run.result) {
    return { ...base, wrongPatient: null, wrongPatientDismissed: false, conflicts: [], answered: [], answeredCount: 0, ward: empty, academic: empty, rejected: 0, leading: [] };
  }

  const resolutions: Resolutions = run.resolutions ?? {};
  const slots = applyResolutions(run.result.slots, resolutions);
  const byId = new Map(tree.slots.map((s) => [s.id, s]));

  const conflicts: ConflictView[] = [];
  const answered: AnsweredView[] = [];
  for (const r of slots) {
    const slot = byId.get(r.id);
    if (!slot) continue;
    const res = resolutions[r.id];
    const dismissed = Boolean(res && "dismissed" in res && res.dismissed);
    if (r.conflict && r.evidence && !dismissed) {
      conflicts.push({
        slotId: r.id,
        label: slot.label,
        question: slot.question,
        first: quoteView(sources, r.evidence)!,
        second: quoteView(sources, r.conflict)!,
      });
      continue;
    }
    if (r.state === "unasked") continue;
    answered.push({
      slotId: r.id,
      label: slot.label,
      group: slot.group,
      state: r.state,
      value: r.value,
      unconfirmed: Boolean(slot.numeric && r.state === "positive"),
      quote: quoteView(sources, r.evidence),
      resolved: Boolean(r.resolved),
    });
  }

  // A slot still in conflict is not answered: it is neither positive nor negative until the
  // resident says which. Treat it as unasked for the gap list so the question stays visible.
  const forGaps: SlotResult[] = slots.map((r) =>
    conflicts.some((c) => c.slotId === r.id) ? { ...r, state: "unasked", evidence: null, value: null, conflict: null } : r
  );

  const mode = (m: CheckMode): ModeView => {
    const g = buildGapList(tree, forGaps, { postOp: opts.postOp, mode: m });
    return {
      unasked: g.unasked,
      bands: g.bands.map((b) => ({
        key: b.key,
        title: b.title,
        gaps: b.gaps.map((x) => ({
          slotId: x.slot.id,
          label: x.slot.label,
          question: x.slot.question,
          forDifferentials: x.forDifferentials,
          teach: m === "academic" ? (x.slot.teach ?? null) : null,
          redFlag: x.slot.group === "red_flag",
        })),
      })),
      text: renderHistoryText({ tree, results: forGaps, mode: m, header: opts.header, background: opts.background }),
    };
  };

  const ward = mode("ward");
  const academic = mode("academic");
  const leading = buildGapList(tree, forGaps, { postOp: opts.postOp, mode: "ward" }).leading.map((l) => l.name);
  const wp = resolutions.wrong_patient;

  return {
    ...base,
    wrongPatient: quoteView(sources, run.result.wrongPatient),
    wrongPatientDismissed: Boolean(wp?.dismissed),
    conflicts,
    answered,
    answeredCount: answered.length,
    ward,
    academic,
    rejected: run.result.rejections.length,
    leading,
  };
}
