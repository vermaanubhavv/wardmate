"use client";

import { useState, useTransition } from "react";
import { sendTestFeedbackEmail } from "./actions";

const feedbackUrl = "https://wardmate.in/feedback";

export default function FeedbackFormLink() {
  const [copied, setCopied] = useState(false);
  const [testStatus, setTestStatus] = useState<string | null>(null);
  const [sending, startSending] = useTransition();

  function sendTest() {
    startSending(async () => {
      const result = await sendTestFeedbackEmail();
      setTestStatus(result.sentTo ? `Test email sent to ${result.sentTo}.` : result.error ?? "Send failed.");
    });
  }

  async function copy() {
    await navigator.clipboard.writeText(feedbackUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="ios-group px-4 py-3">
      <p className="text-[14px] text-muted">Share this link in a Resend email, WhatsApp, or Instagram DM.</p>
      <p className="mt-2 break-all text-[13px] font-medium">{feedbackUrl}</p>
      <div className="mt-3 flex gap-2">
        <a href="/feedback" target="_blank" className="rounded-lg bg-accent px-3 py-2 text-[13px] font-medium text-accent-ink active:opacity-70">Open form</a>
        <button type="button" onClick={copy} className="rounded-lg bg-chip px-3 py-2 text-[13px] font-medium active:opacity-70">{copied ? "Copied" : "Copy link"}</button>
        <button type="button" onClick={sendTest} disabled={sending} className="rounded-lg bg-chip px-3 py-2 text-[13px] font-medium active:opacity-70 disabled:opacity-50">{sending ? "Sending…" : "Email me a test"}</button>
      </div>
      {testStatus && <p className="mt-2 text-[13px] text-muted">{testStatus}</p>}
    </div>
  );
}
