"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useSyncExternalStore, useTransition } from "react";
import { approveBtn, SelChip, statusChip } from "./card-kit";
import { dismissWrongPatient, resolveHistorySlot } from "./history-check/actions";
import type { AnsweredView, BandView, ConflictView, RunView } from "@/lib/history-check/view";

/**
 * The History check card — what the case history has and has not covered for one complaint.
 *
 * Everything shown is computed on the server from a stored run (lib/history-check/view.ts):
 * this file only chooses a complaint, runs the check, flips Ward/Academic, and records the
 * resident's taps on flagged items. It follows the card-kit look and the app's colour rule:
 * teal for the accent, amber for a gap or an unconfirmed value, red/yellow/green reserved
 * for job urgency and so never used here.
 *
 * Offline: the app only queues audio (lib/outbox.ts). A check is a model call, so with no
 * connection the button is disabled and says so, exactly as the other generate buttons do.
 */

export type TreeChoice = {
  id: string;
  complaint: string;
  /** Named by the chief complaints the resident actually dictated. */
  suggested: boolean;
  /** One of this unit's own department's complaints — see the specialty pack's historyTreeIds. */
  department: boolean;
};
export type CheckMode = "ward" | "academic";

const MODE_KEY = "wardmate.historyCheck.mode";

function subscribeOnline(cb: () => void) {
  window.addEventListener("online", cb);
  window.addEventListener("offline", cb);
  return () => {
    window.removeEventListener("online", cb);
    window.removeEventListener("offline", cb);
  };
}
const useOnline = () =>
  useSyncExternalStore(
    subscribeOnline,
    () => navigator.onLine,
    () => true
  );

export default function HistoryCheckCard({
  patientId,
  trees,
  runs,
  hasSources,
  exams = [],
}: {
  patientId: string;
  trees: TreeChoice[];
  /** Latest run per tree, keyed by tree id. */
  runs: Record<string, RunView>;
  hasSources: boolean;
  /** This department's examination checklists, in order (the pack's examIds). Empty falls back
   *  to the general physical examination. */
  exams?: { id: string; title: string }[];
}) {
  const examLinks = exams.length > 0 ? exams : [{ id: "general_physical", title: "General physical examination" }];
  const router = useRouter();
  const online = useOnline();
  const [mode, setMode] = useState<CheckMode>("ward");
  // Remembered per device, the way the other view preferences are: it is a habit, not data.
  // Read after hydration so the server and first client render agree.
  const savedMode = useSyncExternalStore(
    () => () => {},
    () => {
      try {
        const v = localStorage.getItem(MODE_KEY);
        return v === "ward" || v === "academic" ? v : null;
      } catch {
        return null;
      }
    },
    () => null
  );
  const [touched, setTouched] = useState(false);
  const shownMode: CheckMode = touched ? mode : (savedMode ?? mode);
  const [showAll, setShowAll] = useState(false);
  const [treeId, setTreeId] = useState<string>(() => {
    const withRun = trees.find((t) => runs[t.id]);
    return (withRun ?? trees.find((t) => t.suggested) ?? trees[0])?.id ?? "";
  });
  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  function switchMode(m: CheckMode) {
    setTouched(true);
    setMode(m);
    try {
      localStorage.setItem(MODE_KEY, m);
    } catch {}
  }

  const run = runs[treeId];
  const suggested = trees.filter((t) => t.suggested);
  // What this unit is shown: what was dictated, then its own department's complaints. Everything
  // else is behind "More…" — never removed, because an O&G patient can still have chest pain and
  // a tree nobody can reach would be a worse failure than a long list. A unit whose department
  // names no complaints (an unrecognised specialty, or the packs flag off) sees them all, which
  // is exactly what every unit saw before.
  const own = trees.filter((t) => t.suggested || t.department);
  const visible = showAll || own.length === 0 ? trees : trees.filter((t) => t.suggested || t.department || t.id === treeId);

  async function check() {
    if (!navigator.onLine) {
      setMessage("No connection. Nothing was run.");
      return;
    }
    setRunning(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/patients/${patientId}/history-check`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ tree_id: treeId }),
      });
      const body = (await res.json().catch(() => ({}))) as { error?: string; reused?: boolean };
      if (!res.ok) {
        setMessage(body.error ?? "The check did not run.");
      } else {
        if (body.reused) setMessage("Nothing has changed since the last check — showing that one.");
        router.refresh();
      }
    } catch {
      setMessage("No connection. Nothing was run.");
    } finally {
      setRunning(false);
    }
  }

  const view = run && run.status === "ok" ? (shownMode === "ward" ? run.ward : run.academic) : null;

  return (
    <section className="px-4 pb-6">
      <div className="ios-group">
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <p className="text-subhead font-semibold">History check</p>
          <ModeSwitch mode={shownMode} onChange={switchMode} />
        </div>

        <div className="border-t border-line px-4 py-3">
          <p className="mb-2 text-caption text-muted">
            {suggested.length > 0
              ? "Complaint (suggested from the chief complaints)"
              : !showAll && own.length > 0
                ? "Complaint (this unit's own)"
                : "Complaint"}
          </p>
          <div className="flex flex-wrap gap-2">
            {visible.map((t) => (
              <SelChip key={t.id} selected={t.id === treeId} onClick={() => setTreeId(t.id)}>
                {t.complaint}
              </SelChip>
            ))}
            {!showAll && visible.length < trees.length && (
              <button type="button" onClick={() => setShowAll(true)} className="px-2 text-footnote text-accent">
                More…
              </button>
            )}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button
              type="button"
              className={approveBtn}
              disabled={running || !online || !hasSources || !treeId}
              onClick={check}
            >
              {running ? "Checking…" : run ? "Check again" : "Check history"}
            </button>
            {!hasSources && <span className="text-footnote text-muted">Record or build the case history first.</span>}
            {hasSources && !online && <span className="text-footnote text-warn-fg">No connection.</span>}
          </div>
          {message && <p className="mt-2 text-footnote text-warn-fg">{message}</p>}
        </div>

        {run && run.status === "error" && (
          <div className="border-t border-line px-4 py-3">
            <p className="text-footnote text-warn-fg">The last check failed: {run.error ?? "unknown error"}</p>
            <p className="mt-1 text-caption text-muted">Nothing was stored against the patient. Try again.</p>
          </div>
        )}

        {run && view && (
          <>
            {run.wrongPatient && !run.wrongPatientDismissed && (
              <WrongPatientBox patientId={patientId} runId={run.runId} quote={run.wrongPatient.quote} source={run.wrongPatient.source} />
            )}

            {run.conflicts.map((c) => (
              <ConflictBox key={c.slotId} patientId={patientId} runId={run.runId} conflict={c} />
            ))}

            <GapBands bands={view.bands} unasked={view.unasked} answered={run.answeredCount} leading={run.leading} mode={shownMode} />

            <AnsweredList items={run.answered} />

            <GeneratedHistory text={view.text} />

            <div className="border-t border-line px-4 py-3 text-caption text-muted">
              <p>
                {statusChip("Pending clinician review", "warn")}{" "}
                <span className="ml-1">
                  {run.complaint} tree v{run.treeVersion}
                  {run.rejected > 0 && ` · ${run.rejected} model claim${run.rejected === 1 ? "" : "s"} set aside by the checker`}
                </span>
              </p>
              <p className="mt-1">
                Checked{" "}
                {new Date(run.createdAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}
                . Questions to consider, never a diagnosis. Values in amber are unconfirmed.
              </p>
              {shownMode === "academic" && (
                <p className="mt-2 flex flex-col gap-1">
                  <Link href={`/learn/history/${run.treeId}`} className="font-semibold text-accent">
                    Learn: taking a {run.complaint.toLowerCase()} history ›
                  </Link>
                  {examLinks.map((e) => (
                    <Link key={e.id} href={`/learn/examination/${e.id}`} className="font-semibold text-accent">
                      Learn: {e.title.charAt(0).toLowerCase() + e.title.slice(1)} ›
                    </Link>
                  ))}
                </p>
              )}
            </div>
          </>
        )}

        {!run && shownMode === "academic" && (
          <div className="border-t border-line px-4 py-3 text-footnote">
            <Link href={`/learn/history/${treeId}`} className="font-semibold text-accent">
              Learn: taking this history ›
            </Link>
            {examLinks.map((e) => (
              <span key={e.id}>
                <span className="mx-2 text-muted">·</span>
                <Link href={`/learn/examination/${e.id}`} className="font-semibold text-accent">
                  {e.title} ›
                </Link>
              </span>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function ModeSwitch({ mode, onChange }: { mode: CheckMode; onChange: (m: CheckMode) => void }) {
  const seg = (m: CheckMode, label: string) => (
    <button
      type="button"
      role="radio"
      aria-checked={mode === m}
      onClick={() => onChange(m)}
      className={
        "rounded-full px-3 py-1 text-caption font-semibold transition-colors " +
        (mode === m ? "bg-accent text-accent-ink" : "text-muted")
      }
    >
      {label}
    </button>
  );
  return (
    <div role="radiogroup" aria-label="Ward or academic" className="flex rounded-full bg-chip p-0.5">
      {seg("ward", "Ward")}
      {seg("academic", "Academic")}
    </div>
  );
}

function useAction() {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  function submit(action: (fd: FormData) => Promise<{ error?: string }>, fd: FormData) {
    if (!navigator.onLine) {
      setError("No connection. Nothing was saved.");
      return;
    }
    setError(null);
    start(async () => {
      const r = await action(fd);
      if (r.error) setError(r.error);
    });
  }
  return { pending, error, submit };
}

function Quote({ quote, source }: { quote: string; source: string }) {
  return (
    <p className="text-footnote italic text-muted">
      “{quote}” <span className="not-italic">— {source}</span>
    </p>
  );
}

function WrongPatientBox({ patientId, runId, quote, source }: { patientId: string; runId: string; quote: string; source: string }) {
  const { pending, error, submit } = useAction();
  return (
    <div className="border-t border-line bg-warn-bg px-4 py-3">
      <p className="text-subhead font-semibold text-warn-fg">This dictation may be about another patient</p>
      <div className="mt-1">
        <Quote quote={quote} source={source} />
      </div>
      <p className="mt-2 text-caption text-muted">Only the name, age, sex and bed identify a patient. Check the entry before using this history.</p>
      <div className="mt-2 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={pending}
          className={approveBtn}
          onClick={() => {
            const fd = new FormData();
            fd.set("run_id", runId);
            fd.set("patient_id", patientId);
            submit(dismissWrongPatient, fd);
          }}
        >
          It is this patient
        </button>
        <Link href={`/patients/${patientId}/case-history`} className="rounded-[10px] border border-line px-3 py-1.5 text-footnote font-medium text-accent">
          Review entries ›
        </Link>
      </div>
      {error && <p className="mt-2 text-footnote text-warn-fg">{error}</p>}
    </div>
  );
}

function ConflictBox({ patientId, runId, conflict }: { patientId: string; runId: string; conflict: ConflictView }) {
  const { pending, error, submit } = useAction();
  const pick = (state: "positive" | "negative" | "unasked" | "dismiss") => {
    const fd = new FormData();
    fd.set("run_id", runId);
    fd.set("patient_id", patientId);
    fd.set("slot_id", conflict.slotId);
    fd.set("state", state);
    submit(resolveHistorySlot, fd);
  };
  const btn = "rounded-[10px] border border-line bg-card px-3 py-1.5 text-footnote font-medium disabled:opacity-50";
  return (
    <div className="border-t border-line bg-warn-bg px-4 py-3">
      <p className="text-subhead font-semibold text-warn-fg">Conflicting statements — {conflict.label}</p>
      <p className="mt-0.5 text-footnote">{conflict.question}</p>
      <div className="mt-1 flex flex-col gap-1">
        <Quote quote={conflict.first.quote} source={conflict.first.source} />
        <Quote quote={conflict.second.quote} source={conflict.second.source} />
      </div>
      <p className="mt-2 text-caption text-muted">Which is right? Your answer is recorded as yours, beside the quotes.</p>
      <div className="mt-2 flex flex-wrap gap-2">
        <button type="button" disabled={pending} className={btn} onClick={() => pick("positive")}>Present</button>
        <button type="button" disabled={pending} className={btn} onClick={() => pick("negative")}>Explicitly absent</button>
        <button type="button" disabled={pending} className={btn} onClick={() => pick("unasked")}>Not asked</button>
        <button type="button" disabled={pending} className="px-2 text-footnote text-muted" onClick={() => pick("dismiss")}>
          Leave as is
        </button>
      </div>
      {error && <p className="mt-2 text-footnote text-warn-fg">{error}</p>}
    </div>
  );
}

function GapBands({ bands, unasked, answered, leading, mode }: { bands: BandView[]; unasked: number; answered: number; leading: string[]; mode: CheckMode }) {
  const nonEmpty = bands.filter((b) => b.gaps.length > 0);
  return (
    <div className="border-t border-line px-4 py-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-subhead font-semibold">Not yet asked</p>
        {statusChip(unasked === 0 ? "Complete" : `${unasked} gap${unasked === 1 ? "" : "s"} · ${answered} answered`, unasked === 0 ? "ok" : "warn")}
      </div>
      {leading.length > 0 && (
        <p className="mt-1 text-caption text-muted">Questions that would help separate {leading.join(" / ")}.</p>
      )}
      {nonEmpty.length === 0 && (
        <p className="mt-2 text-footnote text-muted">
          {mode === "ward" ? "Every core question and every red flag has an answer." : "Every question in the tree has an answer."}
        </p>
      )}
      {nonEmpty.map((b) => (
        <div key={b.key} className="mt-3">
          <p className={"text-caption font-semibold uppercase tracking-wide " + (b.key === "red_flag" ? "text-warn-fg" : "text-muted")}>
            {b.title}
          </p>
          <ul className="mt-1 flex flex-col gap-1.5">
            {b.gaps.map((g) => (
              <li key={g.slotId} className="flex gap-2 text-subhead">
                <span className={"mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full " + (g.redFlag ? "bg-warn-fg" : "bg-warn-fg")} aria-hidden />
                <span>
                  {g.question}
                  {g.forDifferentials.length > 0 && b.key !== "discriminating" && (
                    <span className="text-muted"> ({g.forDifferentials.join(", ")})</span>
                  )}
                  {g.teach && <span className="block text-caption text-muted">{g.teach}</span>}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function AnsweredList({ items }: { items: AnsweredView[] }) {
  const [open, setOpen] = useState<string | null>(null);
  if (items.length === 0) return null;
  return (
    <details className="border-t border-line [&[open]_.hc-chev]:rotate-90">
      <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-2.5 text-footnote text-muted active:bg-chip [&::-webkit-details-marker]:hidden">
        <span className="hc-chev shrink-0 text-caption2 transition-transform">&#9654;</span>
        Answered ({items.length}) — tap a line for its source
      </summary>
      <ul className="px-4 pb-3">
        {items.map((a) => (
          <li key={a.slotId} className="border-t border-line py-2 first:border-t-0">
            <button type="button" onClick={() => setOpen(open === a.slotId ? null : a.slotId)} className="flex w-full items-start justify-between gap-2 text-left">
              <span className="text-subhead">
                {a.label}
                {a.value && (
                  <span className={a.unconfirmed ? "ml-1 text-warn-fg" : "ml-1"}>
                    : {a.value}
                    {a.unconfirmed && " (unconfirmed)"}
                  </span>
                )}
              </span>
              {a.resolved ? statusChip("You resolved", "muted") : a.state === "positive" ? statusChip("Present", "ok") : statusChip("Denied", "muted")}
            </button>
            {open === a.slotId && (
              <div className="mt-1">
                {a.quote ? <Quote quote={a.quote.quote} source={a.quote.source} /> : <p className="text-footnote text-muted">Your own answer — no dictated quote.</p>}
              </div>
            )}
          </li>
        ))}
      </ul>
    </details>
  );
}

function GeneratedHistory({ text }: { text: string }) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setState("copied");
    } catch {
      setState("failed");
    }
    setTimeout(() => setState("idle"), 2000);
  }
  return (
    <div className="border-t border-line px-4 py-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-subhead font-semibold">History as recorded</p>
        <button type="button" onClick={copy} className="text-footnote font-semibold text-accent active:opacity-60">
          {state === "copied" ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="mt-2 whitespace-pre-wrap font-sans text-footnote leading-snug">{text}</pre>
      {state === "failed" && <p className="mt-1 text-caption text-warn-fg">Could not copy — select the text and copy it by hand.</p>}
      <p className="mt-2 text-caption text-muted">Only what was dictated, in case-sheet order. &ldquo;Not recorded&rdquo; means not recorded, never absent.</p>
    </div>
  );
}
