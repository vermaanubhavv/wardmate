"use client";

import { useRef, useState, type Dispatch, type SetStateAction } from "react";
import { PAPER_KINDS, type PaperKind } from "@/lib/read-paper";
import type { DischargeDraft } from "@/lib/discharge-entities";
import type { DischargeCheckContext } from "@/lib/discharge-checks";
import type { OneOffIdentity } from "@/lib/discharge-oneoff";
import { NO_TEMPLATE } from "@/lib/discharge-oneoff";
import { getSpecialtyPack, type SpecialtyKey } from "@/lib/specialty";
import { listDischargeTemplatesFor, matchDischargeTemplateFor } from "@/lib/specialty/discharge";

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
  include: boolean;
};

/** Everything the Start card holds. It lives in the workspace, not here, so moving to another
 *  card and back keeps the pages and what was typed. */
export type OneOffStartState = {
  pages: Page[];
  identity: Required<OneOffIdentity>;
  /** "auto", NO_TEMPLATE, or a template key. */
  templateKey: string;
};

export const EMPTY_ONE_OFF_START: OneOffStartState = {
  pages: [],
  identity: { name: "", age: "", sex: "", ipNo: "", mrdNo: "", admittedOn: "", diagnosis: "", procedure: "", surgeryDate: "" },
  templateKey: "auto",
};

const uid = () => (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `r-${Date.now()}`);

/**
 * The first card of a one-off discharge — for somebody who is not in WardMate. The resident
 * types who it is for, optionally reads the paper pages in, and picks the DIAGNOSIS template;
 * Build compiles the draft (the same compiler a ward patient's uses, in memory, nothing stored)
 * and the remaining cards are the ordinary discharge cards.
 */
export default function OneOffStart({
  state,
  setState,
  specialty,
  onBuilt,
}: {
  state: OneOffStartState;
  setState: Dispatch<SetStateAction<OneOffStartState>>;
  specialty: SpecialtyKey;
  onBuilt: (draft: DischargeDraft, checkContext: DischargeCheckContext, templateLabel: string | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [building, setBuilding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { pages, identity, templateKey } = state;
  const pack = getSpecialtyPack(specialty);
  const templates = listDischargeTemplatesFor(pack);
  const setPages = (f: (p: Page[]) => Page[]) => setState((s) => ({ ...s, pages: f(s.pages) }));

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
                    }
                  : { ...p, status: "failed", error: data.error ?? "Could not read that photo." }
            )
          );
          if (res.ok && data.kind === "ot_note") {
            setState((s) => ({
              ...s,
              identity: {
                ...s.identity,
                procedure: s.identity.procedure || (data.procedure ?? ""),
                surgeryDate: s.identity.surgeryDate || (data.surgeryDate ?? ""),
              },
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
  const reading = pages.some((p) => p.status === "reading");
  const haveSubject = !!(identity.procedure.trim() || identity.diagnosis.trim());
  const autoMatch = matchDischargeTemplateFor(pack, { procedureText: identity.procedure, diagnosisText: identity.diagnosis });
  const chosenLabel =
    templateKey === NO_TEMPLATE
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
          templateKey: templateKey === "auto" ? null : templateKey,
          pages: ready.map((p) => ({
            kind: p.kind,
            transcript: p.transcript,
            labValues: p.kind === "lab_report" ? p.labValues : null,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error ?? "Could not build the summary.");
      else onBuilt(data.draft as DischargeDraft, data.checkContext as DischargeCheckContext, data.template?.label ?? null);
    } catch {
      setError("No signal. Try again when you have a bar.");
    }
    setBuilding(false);
  }

  const field = (key: keyof OneOffStartState["identity"], label: string, placeholder?: string, type = "text") => (
    <label className="flex flex-1 flex-col gap-1.5">
      <span className="text-footnote text-muted">{label}</span>
      <input
        type={type}
        value={identity[key]}
        placeholder={placeholder}
        onChange={(e) => setState((s) => ({ ...s, identity: { ...s.identity, [key]: e.target.value } }))}
        className="h-12 w-full rounded-[10px] border border-line bg-card px-3 text-body outline-none focus:border-accent"
      />
    </label>
  );

  return (
    <>
      <p className="text-caption leading-[1.45] text-muted">
        For somebody who is not in WardMate. Nothing is stored — this makes a document and keeps no record of it.
      </p>

      <div className="flex flex-col gap-3">
        <p className="text-footnote text-muted">Who is this summary for? Typed, not read off the papers.</p>
        {field("name", "Name", "As it should print")}
        <div className="flex gap-3">
          {field("age", "Age", "Years", "number")}
          {field("sex", "Sex", "M / F")}
        </div>
        <div className="flex gap-3">
          {field("ipNo", "UHID / IP no.")}
          {field("mrdNo", "MRD no.")}
        </div>
        <div className="flex gap-3">
          {field("admittedOn", "Admitted on", "", "date")}
          {field("surgeryDate", "Date of surgery", "", "date")}
        </div>
        {field("diagnosis", "Diagnosis", "e.g. Acute calculous cholecystitis")}
        {field("procedure", "Procedure", "As the OT note names it")}
      </div>

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
        className="min-h-11 self-start rounded-[10px] border border-line bg-card px-3.5 text-subhead font-medium text-accent active:opacity-60"
      >
        {pages.length === 0 ? "Read in the paper pages" : "Add more pages"}
      </button>

      {pages.map((page) => (
        <div key={page.id} className="rounded-[10px] border border-line p-2.5">
          <div className="flex items-baseline justify-between gap-3">
            <span className="truncate text-footnote text-muted">{page.fileName}</span>
            {page.status === "reading" && <span className="shrink-0 text-footnote text-muted">Reading…</span>}
            {page.status === "failed" && <span className="shrink-0 text-footnote text-warn-fg">Could not read</span>}
          </div>
          {page.status === "failed" && page.error && (
            <p className="mt-2 text-footnote leading-relaxed text-warn-fg">{page.error}</p>
          )}
          {page.status === "read" && (
            <>
              <label className="mt-3 flex flex-col gap-1.5">
                <span className="text-footnote text-muted">This page is {page.kindConfidence === "low" && "— I am not sure —"}</span>
                <select
                  value={page.kind}
                  onChange={(e) => setPages((prev) => prev.map((p) => (p.id === page.id ? { ...p, kind: e.target.value as PaperKind } : p)))}
                  className="h-12 w-full rounded-[10px] border border-line bg-card px-3 text-body outline-none focus:border-accent"
                >
                  {PAPER_KINDS.map((k) => (
                    <option key={k.kind} value={k.kind}>{k.label}</option>
                  ))}
                </select>
              </label>
              {page.unreadable && (
                <p className="mt-2 text-footnote leading-relaxed text-warn-fg">Not read on this page: {page.unreadable}</p>
              )}
              <details className="mt-2">
                <summary className="cursor-pointer text-footnote text-accent">What it read ({page.transcript.length} characters)</summary>
                <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap text-footnote leading-relaxed">{page.transcript || "Nothing legible."}</pre>
              </details>
              <label className="mt-3 flex items-center gap-2 text-footnote text-muted">
                <input type="checkbox" checked={page.include} onChange={(e) => setPages((prev) => prev.map((p) => (p.id === page.id ? { ...p, include: e.target.checked } : p)))} />
                Use this page
              </label>
            </>
          )}
        </div>
      ))}

      {haveSubject && (
        <div className="flex flex-col gap-2">
          <p className="text-subhead font-medium">Discharge template</p>
          <p className="text-footnote text-muted">
            The standard sections for this diagnosis — advice, red flags, follow-up, the operation skeleton — arrive
            pre-filled with <span className="font-mono">[ … ]</span> blanks for you to complete.
          </p>
          <select
            value={templateKey}
            onChange={(e) => setState((s) => ({ ...s, templateKey: e.target.value }))}
            className="h-12 w-full rounded-[10px] border border-line bg-card px-3 text-body outline-none focus:border-accent"
          >
            <option value="auto">Match automatically from the diagnosis / procedure</option>
            <option value={NO_TEMPLATE}>No template — start blank</option>
            {templates.map((t) => (
              <option key={t.key} value={t.key}>{t.label}</option>
            ))}
          </select>
        </div>
      )}

      <button
        type="button"
        disabled={building || reading || !identity.name.trim()}
        onClick={() => void build()}
        className="rounded-[10px] bg-accent px-4 py-3 text-body font-semibold text-accent-ink disabled:opacity-60"
      >
        {building ? "Building…" : `Build the summary${chosenLabel ? ` — ${chosenLabel}` : ""}`}
      </button>
      <p className="text-caption2 text-muted">
        {identity.name.trim() ? "Building again replaces what is on the cards." : "Type the name to build the summary."}
      </p>
      {error && <p className="text-footnote leading-relaxed text-warn-fg">{error}</p>}
    </>
  );
}
