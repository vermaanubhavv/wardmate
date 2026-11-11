"use client";

import { useEffect, useState, useTransition } from "react";
import { recordPaperReason } from "./actions";

/** Today's key, in the phone's own day — the prompt is a once-a-day question, not a form. */
const todayKey = () => `paper-prompt:${new Date().toLocaleDateString("en-CA")}`;

/**
 * The one question this phase is judged by, asked where the day ends: on the handover
 * screen, once a day, dismissable in one tap. The answer is a few words and nothing else is
 * asked. Hidden for the rest of the day after an answer or a dismissal (this phone's storage;
 * a cleared browser simply asks again).
 */
export default function PaperPrompt() {
  const [show, setShow] = useState(false);
  const [text, setText] = useState("");
  const [sent, setSent] = useState(false);
  const [pending, start] = useTransition();

  useEffect(() => {
    try {
      setShow(!localStorage.getItem(todayKey()));
    } catch {
      setShow(true);
    }
  }, []);

  const done = () => {
    try {
      localStorage.setItem(todayKey(), "1");
    } catch {
      // Asked again tomorrow either way.
    }
    setShow(false);
  };

  if (!show) return null;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!text.trim()) return;
        start(async () => {
          await recordPaperReason(text.trim());
          setSent(true);
          setTimeout(done, 1500);
        });
      }}
      className="ios-group flex flex-col gap-2 p-4"
    >
      <p className="text-subhead font-semibold">What made you reach for paper today?</p>
      {sent ? (
        <p className="text-footnote text-muted">Thanks — noted.</p>
      ) : (
        <>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="e.g. the OT list, a referral letter…"
            className="field"
            autoCapitalize="sentences"
          />
          <div className="flex gap-2">
            <button type="button" onClick={done} className="btn flex-1 bg-chip text-muted">
              Nothing today
            </button>
            <button disabled={pending || !text.trim()} className="btn btn-primary flex-[2]">
              Send
            </button>
          </div>
        </>
      )}
    </form>
  );
}
