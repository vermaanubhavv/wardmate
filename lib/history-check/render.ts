import type { HistoryTree, Slot } from "@/lib/history-check/types";
import type { SlotResult } from "@/lib/history-check/sources";
import type { CheckMode } from "@/lib/history-check/gaps";

/**
 * The presentation-ready history, as compact plain text for the Copy button — the same idea
 * as "Copy for WhatsApp" on the handover.
 *
 * Built ONLY from validated slots and the tree's labels. No model writes any of this. Every
 * phrase after a label is the resident's own words (the slot's verbatim value or quote), and
 * anything not dictated prints as "not recorded". Fluency is traded for that on purpose — see
 * the Stage 0 discussion: prose the app cannot check word by word is prose it must not print.
 *
 * Indian long-case order: chief complaint with duration → HPI in tree order → pertinent
 * positives → pertinent negatives → not-recorded line → past / family / medication / surgical
 * history ONLY if dictated (those come from the existing case-history sections, passed in).
 */

export type BackgroundSection = { label: string; lines: string[] };

export type RenderInput = {
  tree: HistoryTree;
  results: SlotResult[];
  mode: CheckMode;
  /** "SW-12 · Sharma · 62/M" or similar. Name/age/sex/bed only — the four allowed identifiers. */
  header?: string | null;
  /** Already-filtered: only sections with something dictated. Empty sections are not passed. */
  background?: BackgroundSection[];
};

const UNCONFIRMED = " (unconfirmed)";

export function renderHistoryText(input: RenderInput): string {
  const { tree, results, mode } = input;
  const byId = new Map(results.map((r) => [r.id, r]));
  const slot = (id: string) => tree.slots.find((s) => s.id === id)!;
  const res = (id: string) => byId.get(id) ?? { id, state: "unasked" as const, evidence: null, value: null, conflict: null };

  const lines: string[] = [];
  if (input.header) lines.push(input.header);

  // Chief complaint with duration.
  const dur = res(tree.output.durationSlot);
  const durSlot = slot(tree.output.durationSlot);
  if (dur.state === "positive" && dur.value) {
    lines.push(`${tree.complaint} x ${dur.value}${durSlot.numeric ? UNCONFIRMED : ""}`);
  } else if (dur.conflict) {
    lines.push(`${tree.complaint}, duration: conflicting statements`);
  } else {
    lines.push(`${tree.complaint}, duration not recorded`);
  }

  // Informant, only if dictated.
  const informant = tree.slots.filter((s) => s.group === "informant");
  const infParts = informant
    .map((s) => ({ s, r: res(s.id) }))
    .filter(({ r }) => r.state === "positive" && r.value)
    .map(({ s, r }) => `${s.label.toLowerCase()}: ${r.value}`);
  if (infParts.length) lines.push(`Informant — ${infParts.join(", ")}`);

  // HPI in the tree's order, then any other hpi slot not listed. Duration already printed.
  const order = [
    ...tree.output.hpiOrder,
    ...tree.slots.filter((s) => s.group === "hpi" && !tree.output.hpiOrder.includes(s.id)).map((s) => s.id),
  ].filter((id) => id !== tree.output.durationSlot);
  const hpi: string[] = [];
  for (const id of order) {
    const s = slot(id);
    const r = res(id);
    hpi.push(`${s.label}: ${phrase(s, r)}`);
  }
  lines.push(`HPI — ${hpi.join("; ")}`);

  // Pertinent positives and negatives: every yes_no slot outside the HPI block.
  const yesNo = tree.slots.filter((s) => s.kind === "yes_no" && s.group !== "hpi");
  // A slot with an open conflict is neither a positive nor a negative until the resident says.
  const settled = yesNo.filter((s) => !res(s.id).conflict);
  const positives = settled.filter((s) => res(s.id).state === "positive").map((s) => s.label.toLowerCase());
  const negatives = settled.filter((s) => res(s.id).state === "negative").map((s) => `no ${s.label.toLowerCase()}`);
  const conflicting = yesNo.filter((s) => res(s.id).conflict).map((s) => s.label.toLowerCase());
  lines.push(`Pertinent positives: ${positives.length ? positives.join(", ") : "none recorded"}`);
  lines.push(`Pertinent negatives: ${negatives.length ? negatives.join(", ") : "none recorded"}`);
  if (conflicting.length) lines.push(`Conflicting statements (resolve): ${conflicting.join(", ")}`);

  // What was not asked. Red flags always; the rest only in academic mode, where the point is
  // to see the whole of what a long case expects.
  const notAsked = tree.slots.filter(
    (s) =>
      s.kind === "yes_no" &&
      s.group !== "hpi" &&
      res(s.id).state === "unasked" &&
      (s.group === "red_flag" || (mode === "academic" && s.group !== "informant"))
  );
  if (notAsked.length) {
    lines.push(
      `Not recorded${mode === "ward" ? " (red flags)" : ""}: ${notAsked.map((s) => s.label.toLowerCase()).join(", ")}`
    );
  }

  for (const b of input.background ?? []) {
    if (b.lines.length === 0) continue;
    lines.push(`${b.label}: ${b.lines.join("; ")}`);
  }

  return lines.join("\n");
}

/** One slot's phrase for the HPI line. */
function phrase(s: Slot, r: SlotResult): string {
  if (r.conflict) return "conflicting statements";
  if (r.state === "unasked") return "not recorded";
  if (s.kind === "value") {
    return r.state === "positive" && r.value ? `${r.value}${s.numeric ? UNCONFIRMED : ""}` : "not recorded";
  }
  return r.state === "positive" ? "present" : "absent";
}
