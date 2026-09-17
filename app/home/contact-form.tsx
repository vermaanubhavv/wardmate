"use client";

import { useState } from "react";

/**
 * The "Contact us" form on /home. Posts to /api/contact, which writes to the
 * `contact_messages` table (RLS lets an anonymous visitor insert, nothing else). Kept as its
 * own client component for the same reason WaitlistForm is: the page around it stays a server
 * component with real metadata.
 */

const CONTROL =
  "ios-group w-full px-4 py-3.5 text-base outline-none transition-shadow focus:ring-2 focus:ring-accent";
const FIELD_LABEL = "text-[13px] font-medium uppercase tracking-wide text-muted";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const valid = name.trim().length > 0 && email.trim().length > 0 && message.trim().length > 0;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy || !valid) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
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
      <div className="ios-group flex flex-col gap-1.5 px-4 py-4">
        <p className="text-[15px] font-semibold">Message sent</p>
        <p className="text-[14px] text-muted">We&rsquo;ll get back to you at {email}.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-2">
        <span className={FIELD_LABEL}>Your name</span>
        <input
          type="text"
          required
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Dr. …"
          className={CONTROL}
        />
      </label>
      <label className="flex flex-col gap-2">
        <span className={FIELD_LABEL}>Email</span>
        <input
          type="email"
          required
          inputMode="email"
          autoCapitalize="off"
          autoCorrect="off"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className={CONTROL}
        />
      </label>
      <label className="flex flex-col gap-2">
        <span className={FIELD_LABEL}>Message</span>
        <textarea
          required
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="What can we help with?"
          className={`${CONTROL} resize-y`}
        />
      </label>
      <button
        type="submit"
        disabled={!valid || busy}
        className="rounded-[10px] bg-accent px-4 py-3.5 text-[17px] font-semibold text-accent-ink transition-opacity active:opacity-80 disabled:opacity-40"
      >
        {busy ? "Sending…" : "Send message"}
      </button>
      {error && <p className="ios-group px-4 py-3 text-[15px] text-orange-700">{error}</p>}
    </form>
  );
}
