"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { replaceTodayNoteSection } from "./note/actions";

type Row = {
  id: string;
  label: string;
  value: string | null;
  missing: boolean;
  pertinentNegative: boolean;
};
type Extra = { id: string; label: string; value: string | null };

/** Rows that ended up with the same recorded sentence (one dictation that answered several
 *  checklist items at once) collapse to a single line — the labels joined, the sentence shown
 *  once. Editing writes back to every label it stands for. */
type Group = { key: string; labels: string[]; value: string | null; missing: boolean };

function groupByValue(items: { label: string; value: string | null; missing: boolean }[]): Group[] {
  const groups: Group[] = [];
  for (const it of items) {
    const norm = (it.value ?? "").trim().toLowerCase();
    const existing = norm ? groups.find((g) => (g.value ?? "").trim().toLowerCase() === norm) : null;
    if (existing) {
      existing.labels.push(it.label);
      existing.missing = existing.missing || it.missing;
    } else {
      groups.push({ key: it.label, labels: [it.label], value: it.value, missing: it.missing });
    }
  }
  return groups;
}

/**
 * One SOAP section on the patient page, with each line tappable to change it in place — the
 * "where things stand" view and a quick editor in one, so a wrong value or a symptom that
 * turned out to be present can be fixed without opening the note builder.
 *
 * Every save writes a real observation for today (via replaceTodayNoteSection), timestamped
 * and confirmed, exactly as the note builder does — nothing here is a display-only patch.
 */
export default function SoapRows({
  patientId,
  writeKind,
  rows,
  extras,
}: {
  patientId: string;
  writeKind: "note" | "exam" | "vital" | "plan";
  rows: Row[];
  extras: Extra[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);

  const negatives = rows.filter((r) => r.pertinentNegative);
  const shown = groupByValue([
    ...rows.filter((r) => !r.pertinentNegative).map((r) => ({ label: r.label, value: r.value, missing: r.missing })),
    ...extras.map((o) => ({ label: o.label, value: o.value, missing: false })),
  ]);

  function open(key: string, value: string | null) {
    setEditing(key);
    setDraft(value ?? "");
    setError(null);
  }

  function save(labels: string[]) {
    const value = draft.trim();
    startTransition(async () => {
      for (const label of labels) {
        const res = await replaceTodayNoteSection(
          patientId,
          label.toLowerCase().trim(),
          writeKind,
          value ? [value] : []
        );
        if (!res.ok) return setError(res.error ?? "Could not save.");
      }
      setEditing(null);
      router.refresh();
    });
  }

  function editor(key: string, labels: string[], placeholder: string) {
    return (
      <div className="flex items-center gap-2 py-1.5">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          autoFocus
          placeholder={placeholder}
          className="min-w-0 flex-1 rounded-md border border-line bg-card px-2 py-1 text-[15px] outline-none focus:border-accent"
        />
        <button type="button" disabled={pending} onClick={() => save(labels)} className="shrink-0 text-[14px] font-semibold text-accent">
          Save
        </button>
        <button type="button" onClick={() => setEditing(null)} className="shrink-0 text-[13px] text-muted">
          Cancel
        </button>
      </div>
    );
  }

  function line(g: Group) {
    const label = g.labels.join(" · ");
    if (editing === g.key) return <div key={g.key}>{editor(g.key, g.labels, "Leave blank to clear")}</div>;
    return (
      <button
        type="button"
        key={g.key}
        onClick={() => open(g.key, g.value)}
        className="block w-full py-1.5 text-left active:bg-chip"
      >
        <span className="block text-[13px] text-muted">{label}</span>
        {g.value ? (
          <span className="mt-0.5 block text-[15px] leading-snug">{g.value}</span>
        ) : (
          <span className={"mt-0.5 block text-[15px] " + (g.missing ? "text-orange-700" : "text-muted/50")}>
            not recorded
          </span>
        )}
      </button>
    );
  }

  return (
    <>
      <div className="divide-y divide-line">{shown.map(line)}</div>

      {negatives.length > 0 && (
        <p className="mt-1.5 text-[13px] text-muted">
          No complaints of{" "}
          {negatives.map((n, i) => (
            <span key={n.label}>
              {i > 0 && (i === negatives.length - 1 ? " and " : ", ")}
              <button
                type="button"
                onClick={() => open(n.label, "")}
                className="underline decoration-dotted underline-offset-2 active:text-accent"
              >
                {n.label}
              </button>
            </span>
          ))}
          . <span className="text-muted/60">Tap one if it&rsquo;s actually present.</span>
        </p>
      )}
      {editing && negatives.some((n) => n.label === editing) &&
        editor(editing, [editing], `e.g. ${editing} present since morning`)}
      {error && <p className="mt-1 text-[13px] text-orange-700">{error}</p>}
    </>
  );
}
