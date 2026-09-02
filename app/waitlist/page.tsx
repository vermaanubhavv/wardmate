"use client";

import { useState } from "react";
import Mark from "@/app/mark";

/**
 * The waitlist sign-up, linked from the Instagram bio. A public page: middleware lets
 * `/waitlist` through without a session. Styled to sit next to the rest of the app — the
 * same grouped-inset form controls, the same teal button — since a resident who joins here
 * is meeting WardMate for the first time.
 */

const YEARS = ["Intern", "PG1", "PG2", "PG3", "Senior Resident", "Other"];

export default function WaitlistPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [college, setCollege] = useState("");
  const [department, setDepartment] = useState("");
  const [year, setYear] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          name,
          college,
          department,
          year_of_residency: year,
        }),
      });
      const data = await res.json();

      if (data.ok) {
        setDone(true);
        return;
      }
      setError(data.error ?? "Something went wrong. Please try again.");
    } catch {
      setError("Could not reach the server. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <main className="flex-1 px-6 py-16 flex flex-col items-center text-center gap-4 max-w-md mx-auto w-full">
        <Mark className="h-14 w-14" />
        <h1 className="text-3xl font-semibold tracking-tight">You&rsquo;re on the list</h1>
        <p className="text-muted">
          Thanks for signing up. We&rsquo;ll email you at{" "}
          <span className="text-foreground">{email.trim().toLowerCase()}</span> when
          WardMate opens up for your college.
        </p>
      </main>
    );
  }

  return (
    <main className="flex-1 px-6 py-16 flex flex-col gap-8 max-w-md mx-auto w-full">
      <header className="flex flex-col items-center text-center gap-3">
        <Mark className="h-14 w-14" />
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            ward<span className="text-accent">mate</span>
          </h1>
          <p className="text-muted mt-1">Join the waitlist</p>
        </div>
      </header>

      <form onSubmit={submit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-2">
          <span className="text-[15px] text-muted">Your email</span>
          <input
            type="email"
            required
            autoComplete="email"
            inputMode="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@hospital.in"
            className="ios-group px-4 py-4 text-base outline-none focus:border-accent"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-[15px] text-muted">Your name (optional)</span>
          <input
            type="text"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Dr. …"
            className="ios-group px-4 py-4 text-base outline-none focus:border-accent"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-[15px] text-muted">College / hospital</span>
          <input
            type="text"
            required
            value={college}
            onChange={(e) => setCollege(e.target.value)}
            placeholder="e.g. AIIMS Delhi"
            className="ios-group px-4 py-4 text-base outline-none focus:border-accent"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-[15px] text-muted">Department</span>
          <input
            type="text"
            required
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            placeholder="e.g. General Surgery"
            className="ios-group px-4 py-4 text-base outline-none focus:border-accent"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-[15px] text-muted">Year of residency</span>
          <select
            required
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="ios-group px-4 py-4 text-base outline-none focus:border-accent appearance-none bg-card"
          >
            <option value="" disabled>
              Select…
            </option>
            {YEARS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </label>

        <button
          type="submit"
          disabled={busy}
          className="rounded-[10px] bg-accent px-4 py-3 text-[17px] font-semibold text-accent-ink disabled:opacity-50"
        >
          {busy ? "Joining…" : "Join the waitlist"}
        </button>
      </form>

      {error && (
        <p className="ios-group px-4 py-3 text-[15px] text-orange-700">{error}</p>
      )}
    </main>
  );
}
