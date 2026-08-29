"use client";

import { useRef, useState } from "react";
import { PAPER_KINDS, type PaperKind } from "@/lib/read-paper";
import type { DischargeNote } from "@/lib/discharge";
import DischargeSheet from "../../patients/[id]/discharge/sheet";
import PrintButton from "../../patients/[id]/note/print-button";

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

/**
 * A discharge summary for somebody who is not in WardMate.
 *
 * Same reading and the same review as the per-patient flow; what differs is the ending. There
 * is no patient to attach anything to, so the pages are structured, the summary is built, and
 * that is all that survives — close the screen and it is gone. Said on the screen, not only in
 * a comment, because a resident who assumed otherwise would go looking for it tomorrow.
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
    procedure: "",
    surgeryDate: "",
  });
  const [note, setNote] = useState<DischargeNote | null>(null);
  const [building, setBuilding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function addFiles(files: FileList | null) {
    if (!files || files.length === 0) return;

    const fresh: Page[] = Array.from(files).map((file) => ({
      id: crypto.randomUUID(),
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
          // What the operation note says is offered as a starting point for the two boxes the
          // resident would otherwise type. It is filled in only where they have not typed
          // something themselves.
          if (res.ok && data.kind === "ot_note") {
            setIdentity((prev) => ({
              ...prev,
              procedure: prev.procedure || (data.procedure ?? ""),
              surgeryDate: prev.surgeryDate || (data.surgeryDate ?? ""),
            }));
          }
        } catch {
          setPages((prev) =>
            prev.map((p) =>
              p.id === fresh[i].id
                ? { ...p, status: "failed", error: "No signal. Try that page again." }
                : p
            )
          );
        }
      })
    );
  }

  const ready = pages.filter((p) => p.status === "read" && p.include);

  async function build() {
    setBuilding(true);
    setError(null);
    try {
      const res = await fetch("/api/prepare-discharge/build", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identity,
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
      setNote(data.note as DischargeNote);
    } catch {
      setError("No signal. Try again when you have a bar.");
    }
    setBuilding(false);
  }

  if (note) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-[13px] leading-relaxed text-muted print:hidden">
          Nothing here has been stored. Print or save it now — leaving this screen loses it.
        </p>
        <DischargeSheet note={note} wardId="" patientId="" formularySize={0} />
        <div className="print:hidden">
          <PrintButton />
        </div>
        <button
          type="button"
          onClick={() => setNote(null)}
          className="rounded-[10px] border border-line px-4 py-3 text-[15px] print:hidden"
        >
          Back to the papers
        </button>
      </div>
    );
  }

  const field = (
    key: keyof typeof identity,
    label: string,
    placeholder?: string,
    type = "text"
  ) => (
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
            {page.status === "failed" && (
              <span className="shrink-0 text-[13px] text-orange-700">Could not read</span>
            )}
          </div>

          {page.status === "failed" && page.error && (
            <p className="mt-2 text-[13px] leading-relaxed text-orange-700">{page.error}</p>
          )}

          {page.status === "read" && (
            <>
              <label className="mt-3 flex flex-col gap-1.5">
                <span className="text-[13px] text-muted">
                  This page is {page.kindConfidence === "low" && "— I am not sure —"}
                </span>
                <select
                  value={page.kind}
                  onChange={(e) =>
                    setPages((prev) =>
                      prev.map((p) => (p.id === page.id ? { ...p, kind: e.target.value as PaperKind } : p))
                    )
                  }
                  className="h-12 w-full rounded-[10px] border border-line bg-card px-3 text-[17px] outline-none focus:border-accent"
                >
                  {PAPER_KINDS.map((k) => (
                    <option key={k.kind} value={k.kind}>
                      {k.label}
                    </option>
                  ))}
                </select>
              </label>

              {page.unreadable && (
                <p className="mt-2 text-[13px] leading-relaxed text-orange-700">
                  Not read on this page: {page.unreadable}
                </p>
              )}

              {page.kind === "lab_report" && page.labValues && (
                <p className="mt-2 text-[13px] text-muted">
                  {page.labValues.length} values read, with the ranges printed beside them.
                </p>
              )}

              <details className="mt-2">
                <summary className="cursor-pointer text-[13px] text-accent">
                  What it read ({page.transcript.length} characters)
                </summary>
                <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap text-[13px] leading-relaxed">
                  {page.transcript || "Nothing legible."}
                </pre>
              </details>

              <label className="mt-3 flex items-center gap-2 text-[13px] text-muted">
                <input
                  type="checkbox"
                  checked={page.include}
                  onChange={(e) =>
                    setPages((prev) =>
                      prev.map((p) => (p.id === page.id ? { ...p, include: e.target.checked } : p))
                    )
                  }
                />
                Use this page
              </label>
            </>
          )}
        </div>
      ))}

      {/* The identity is typed, not read. An admission paper could be photographed for it, but
          a name is the one thing on a discharge summary nobody should discover was misread. */}
      <section className="ios-group flex flex-col gap-3 p-4">
        <p className="text-[13px] text-muted">
          Who is this summary for? Typed, not read off the papers.
        </p>
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
        {field("procedure", "Procedure", "As the OT note names it")}
      </section>

      {ready.length > 0 && (
        <button
          type="button"
          disabled={building}
          onClick={() => void build()}
          className="rounded-[10px] bg-accent px-4 py-3 text-[17px] font-semibold text-accent-ink disabled:opacity-60"
        >
          {building ? "Building…" : `Make the summary from ${ready.length} ${ready.length === 1 ? "page" : "pages"}`}
        </button>
      )}

      {error && <p className="text-[13px] leading-relaxed text-orange-700">{error}</p>}
    </div>
  );
}
