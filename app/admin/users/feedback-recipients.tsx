"use client";

import { useMemo, useState } from "react";

type User = {
  email: string | null;
  is_admin: boolean;
  name: string | null;
  patients_added: number;
  entries: number;
  round_dictations: number;
  discharges: number;
};

type Segment = "used" | "all";

function hasUsedWardmate(user: User) {
  return (
    user.patients_added > 0 ||
    user.entries > 0 ||
    user.round_dictations > 0 ||
    user.discharges > 0
  );
}

function csvValue(value: string) {
  return `"${value.replaceAll('"', '""')}"`;
}

/**
 * Keeps email collection in the browser: the server has already authorized this admin view,
 * and no addresses are sent to a third party merely to make the export.
 */
export default function FeedbackRecipients({ users }: { users: User[] }) {
  const [segment, setSegment] = useState<Segment>("used");
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");

  const recipients = useMemo(() => {
    const seen = new Set<string>();
    return users.filter((user) => {
      const email = user.email?.trim().toLowerCase();
      if (!email || user.is_admin || seen.has(email)) return false;
      if (segment === "used" && !hasUsedWardmate(user)) return false;
      seen.add(email);
      return true;
    });
  }, [segment, users]);

  const emails = recipients.map((user) => user.email!.trim().toLowerCase());

  async function copyEmails() {
    try {
      await navigator.clipboard.writeText(emails.join(", "));
      setState("copied");
    } catch {
      setState("failed");
    }
    window.setTimeout(() => setState("idle"), 2500);
  }

  function downloadCsv() {
    const rows = [
      ["name", "email"],
      ...recipients.map((user) => [user.name?.trim() || "", user.email!.trim().toLowerCase()]),
    ];
    const csv = rows.map((row) => row.map(csvValue).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "wardmate-feedback-recipients.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="ios-group px-4 py-3">
      <label className="block text-[13px] font-medium" htmlFor="feedback-segment">
        Feedback recipients
      </label>
      <select
        id="feedback-segment"
        value={segment}
        onChange={(event) => setSegment(event.target.value as Segment)}
        className="mt-2 w-full rounded-lg border border-line bg-background px-3 py-2 text-[14px]"
      >
        <option value="used">People who have used Wardmate</option>
        <option value="all">Everyone who signed up</option>
      </select>
      <p className="mt-2 text-[12px] text-muted">
        {emails.length} unique email{emails.length === 1 ? "" : "s"} · admin accounts excluded
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={copyEmails}
          disabled={emails.length === 0}
          className="rounded-lg bg-accent px-3 py-2 text-[13px] font-medium text-accent-ink disabled:opacity-50 active:opacity-70"
        >
          {state === "copied" ? "Emails copied" : "Copy emails"}
        </button>
        <button
          type="button"
          onClick={downloadCsv}
          disabled={emails.length === 0}
          className="rounded-lg bg-chip px-3 py-2 text-[13px] font-medium text-foreground disabled:opacity-50 active:opacity-70"
        >
          Download CSV
        </button>
      </div>
      {state === "failed" && (
        <p className="mt-2 text-[12px] text-orange-700">
          Could not copy automatically. Download the CSV instead.
        </p>
      )}
    </div>
  );
}
