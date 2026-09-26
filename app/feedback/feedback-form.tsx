"use client";

import { FormEvent, useState } from "react";

const OPTIONS = {
  discovered: ["Instagram post", "Instagram story or reel", "Friend or referral", "Other"],
  usage: ["Yes, regularly", "Yes, a few times", "I signed up but have not used it yet", "I only explored it briefly"],
  experience: ["Great", "Good", "Okay", "Not great", "Poor"],
  improvement: ["Make it easier to understand", "Add more useful features", "Improve design and navigation", "Better onboarding or guidance", "Other"],
  return: ["Definitely", "Probably", "Maybe", "Probably not", "Definitely not"],
  talk: ["Yes, contact me", "Maybe later", "No"],
} as const;

type Choice = keyof typeof OPTIONS;

function Question({ label, name, choices, value, onChange }: { label: string; name: Choice; choices: readonly string[]; value: string; onChange: (value: string) => void }) {
  return <fieldset><legend className="text-[15px] font-medium">{label}</legend><div className="mt-2 grid gap-2">{choices.map((choice) => <label key={choice} className="flex cursor-pointer items-center gap-3 rounded-xl border border-line px-3 py-2.5 text-[14px]"><input required type="radio" name={name} value={choice} checked={value === choice} onChange={() => onChange(choice)} /><span>{choice}</span></label>)}</div></fieldset>;
}

export default function FeedbackForm() {
  const [answers, setAnswers] = useState<Record<Choice, string>>({ discovered: "", usage: "", experience: "", improvement: "", return: "", talk: "" });
  const [openFeedback, setOpenFeedback] = useState("");
  const [contact, setContact] = useState("");
  const [state, setState] = useState<"idle" | "submitting" | "done" | "error">("idle");
  const set = (key: Choice) => (value: string) => setAnswers((current) => ({ ...current, [key]: value }));

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setState("submitting");
    const response = await fetch("/api/feedback", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...answers, open_feedback: openFeedback, contact }) });
    setState(response.ok ? "done" : "error");
  }
  if (state === "done") return <div className="mt-8 ios-group px-4 py-5"><h2 className="text-lg font-semibold">Thank you.</h2><p className="mt-1 text-[14px] text-muted">Your feedback will directly help shape Wardmate.</p></div>;
  return <form onSubmit={submit} className="mt-8 space-y-7"><Question label="How did you discover Wardmate?" name="discovered" choices={OPTIONS.discovered} value={answers.discovered} onChange={set("discovered")} /><Question label="Have you used Wardmate?" name="usage" choices={OPTIONS.usage} value={answers.usage} onChange={set("usage")} /><Question label="Overall, how was your experience?" name="experience" choices={OPTIONS.experience} value={answers.experience} onChange={set("experience")} /><Question label="What should we improve first?" name="improvement" choices={OPTIONS.improvement} value={answers.improvement} onChange={set("improvement")} /><Question label="Would you use Wardmate again?" name="return" choices={OPTIONS.return} value={answers.return} onChange={set("return")} /><Question label="Would you be open to a quick 10–15 minute conversation?" name="talk" choices={OPTIONS.talk} value={answers.talk} onChange={set("talk")} />{answers.talk === "Yes, contact me" && <label className="block text-[15px] font-medium">Your email or phone number<input required value={contact} onChange={(event) => setContact(event.target.value)} className="mt-2 w-full rounded-xl border border-line bg-background px-3 py-2.5 text-[14px]" /></label>}<label className="block text-[15px] font-medium">What is one thing you’d like us to know? <span className="font-normal text-muted">Optional</span><textarea value={openFeedback} onChange={(event) => setOpenFeedback(event.target.value)} rows={4} className="mt-2 w-full rounded-xl border border-line bg-background px-3 py-2.5 text-[14px]" /></label>{state === "error" && <p className="text-[14px] text-orange-700">Could not send your feedback. Please try again.</p>}<button disabled={state === "submitting"} className="w-full rounded-xl bg-accent px-4 py-3 text-[16px] font-semibold text-accent-ink disabled:opacity-60">{state === "submitting" ? "Sending…" : "Send feedback"}</button></form>;
}
