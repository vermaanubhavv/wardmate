"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { PAPER_KINDS, type PaperKind } from "@/lib/read-paper";

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
  photoPath: string | null;
  model: string | null;
  /** Unticked pages are left out of the record entirely. */
  include: boolean;
};

/**
 * Prepare discharge: the papers in, read, checked by the resident, then stored.
 *
 * The review is the whole point of the screen. Reading happens as soon as a photo is chosen —
 * so the waiting is spent while the pile is still being photographed — but nothing reaches the
 * record until "Add to the record" is pressed. Until then every page can be re-labelled,
 * dropped, or read again.
 */
export default function Prepare({ patientId }: { patientId: string }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [pages, setPages] = useState<Page[]>([]);
  const [storing, setStoring] = useState(false);
  const [storeError, setStoreError] = useState<string | null>(null);

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
      photoPath: null,
      model: null,
      include: true,
    }));
    setPages((p) => [...p, ...fresh]);

    // One request per page, so a page that fails fails alone and the rest keep going.
    await Promise.all(
      Array.from(files).map(async (file, i) => {
        const body = new FormData();
        body.append("photo", file);
        try {
          const res = await fetch(`/api/patients/${patientId}/prepare-discharge/read`, {
            method: "POST",
            body,
          });
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
                      photoPath: data.photoPath ?? null,
                      model: data.model ?? null,
                    }
                  : { ...p, status: "failed", error: data.error ?? "Could not read that photo." }
            )
          );
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

  async function store() {
    setStoring(true);
    setStoreError(null);
    try {
      const res = await fetch(`/api/patients/${patientId}/prepare-discharge/store`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pages: ready.map((p) => ({
            kind: p.kind,
            transcript: p.transcript,
            photoPath: p.photoPath,
            labValues: p.kind === "lab_report" ? p.labValues : null,
            model: p.model,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStoreError(data.error ?? "Could not store these pages.");
        setStoring(false);
        return;
      }
      const failed = (data.stored ?? []).filter((s: { error: string | null }) => s.error);
      if (failed.length > 0) {
        setStoreError(failed.map((f: { error: string }) => f.error).join(" "));
        setStoring(false);
        return;
      }
      router.push(`/patients/${patientId}/discharge`);
    } catch {
      setStoreError("No signal. The pages are still here — try again when you have a bar.");
      setStoring(false);
    }
  }

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

      {pages.length === 0 && (
        <p className="text-[13px] leading-relaxed text-muted">
          Photograph the case sheet, the OT note, the lab reports, the prescription — all of them,
          in any order. Each page is read on its own and shown to you before anything is stored.
        </p>
      )}

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
                <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap text-[13px] leading-relaxed text-foreground">
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

      {ready.length > 0 && (
        <>
          <button
            type="button"
            disabled={storing}
            onClick={() => void store()}
            className="rounded-[10px] bg-accent px-4 py-3 text-[17px] font-semibold text-accent-ink disabled:opacity-60"
          >
            {storing
              ? "Adding…"
              : `Add ${ready.length} ${ready.length === 1 ? "page" : "pages"} and open the discharge`}
          </button>
          <p className="text-[13px] leading-relaxed text-muted">
            Everything read off a photograph is marked for you to confirm — a photograph has no
            second reading behind it the way speech does. Nothing is filled in that the papers do
            not say: the summary prints a blank where nothing was recorded.
          </p>
        </>
      )}

      {storeError && <p className="text-[13px] leading-relaxed text-orange-700">{storeError}</p>}
    </div>
  );
}
