"use client";

import { useRef, useState } from "react";
import styles from "./waitlist.module.css";

/**
 * The three-step sign-up itself. Kept as its own client component so the page around it — the
 * header, what-it-does list and footer — can stay a server component with real metadata for
 * the link preview.
 *
 * Three short steps rather than one long column: a stranger meeting WardMate for the first
 * time on their phone is far likelier to finish three one-line asks than a wall of inputs.
 * The controls are the app's own — grouped-inset white on the grey ground, the teal it uses
 * for the thing you press. Motion lives in waitlist.module.css.
 */

const YEARS = ["Intern", "PG1", "PG2", "PG3", "Senior Resident", "Other"];

// The NMC broad-specialty list, alphabetical, so the picker is a choice rather than a
// spelling test. "Other" is the escape hatch and the only path that asks for typing.
const DEPARTMENTS = [
  "Anaesthesiology",
  "Anatomy",
  "Biochemistry",
  "Cardiology",
  "Cardiothoracic & Vascular Surgery",
  "Community Medicine",
  "Dermatology, Venereology & Leprosy",
  "Emergency Medicine",
  "Endocrinology",
  "ENT (Otorhinolaryngology)",
  "Family Medicine",
  "Forensic Medicine",
  "Gastroenterology",
  "General Medicine",
  "General Surgery",
  "Geriatric Medicine",
  "Haematology",
  "Immunohaematology & Blood Transfusion",
  "Medical Oncology",
  "Microbiology",
  "Nephrology",
  "Neurology",
  "Neurosurgery",
  "Nuclear Medicine",
  "Obstetrics & Gynaecology",
  "Ophthalmology",
  "Orthopaedics",
  "Paediatrics",
  "Paediatric Surgery",
  "Pathology",
  "Pharmacology",
  "Physical Medicine & Rehabilitation",
  "Physiology",
  "Plastic & Reconstructive Surgery",
  "Psychiatry",
  "Pulmonary / Respiratory Medicine",
  "Radiodiagnosis",
  "Radiation Oncology",
  "Rheumatology",
  "Surgical Oncology",
  "Urology",
  "Other",
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Most residents sign up with a personal Gmail, so the address is a username box plus an
// editable domain box that starts on "gmail.com". Anyone on another provider edits the one
// box; either way the whole step is one Back tap away.
const EMAIL_DOMAIN_DEFAULT = "gmail.com";
const STEPS = 3;

const FIELD_LABEL = "text-[13px] font-medium uppercase tracking-wide text-muted";
const CONTROL =
  "ios-group w-full appearance-none px-4 py-3.5 text-base outline-none transition-shadow focus:ring-2 focus:ring-accent";
// A single chevron for the department select, so it looks the same on every platform.
const SELECT_CHEVRON =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='none' stroke='%23636366' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M4 6l4 4 4-4'/%3E%3C/svg%3E\")";

const STEP_TITLES = [
  { title: "Your email", hint: "This is where your invite will land." },
  { title: "Where you train", hint: "WardMate opens college by college." },
  { title: "Your year", hint: "Whichever fits best." },
];

export default function WaitlistForm() {
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState<"fwd" | "back">("fwd");
  const [emailUser, setEmailUser] = useState("");
  const [emailDomain, setEmailDomain] = useState(EMAIL_DOMAIN_DEFAULT);
  const [emailTouched, setEmailTouched] = useState(false);
  const [name, setName] = useState("");
  const [college, setCollege] = useState("");
  const [department, setDepartment] = useState("");
  const [departmentOther, setDepartmentOther] = useState("");
  const [year, setYear] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const submittedEmail = useRef("");

  const resolvedDepartment =
    department === "Other" ? departmentOther.trim() : department;
  const email = `${emailUser.trim()}@${emailDomain.trim()}`;
  const emailValid = emailUser.trim().length > 0 && EMAIL_RE.test(email);
  const stepValid =
    step === 0
      ? emailValid
      : step === 1
        ? college.trim().length > 0 && resolvedDepartment.length > 0
        : year.length > 0;

  function back() {
    setError(null);
    setDir("back");
    setStep((s) => Math.max(0, s - 1));
  }

  async function submit() {
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
          department: resolvedDepartment,
          year_of_residency: year,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        submittedEmail.current = email.toLowerCase();
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

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy || !stepValid) return;
    setError(null);
    if (step < STEPS - 1) {
      setDir("fwd");
      setStep(step + 1);
    } else {
      submit();
    }
  }

  if (done) {
    return (
      <div className="flex flex-col items-center gap-5 py-4 text-center">
        <span
          className={`${styles.rise} inline-flex h-16 w-16 items-center justify-center rounded-full`}
          style={{
            backgroundColor: "color-mix(in srgb, var(--accent) 14%, transparent)",
          }}
        >
          <svg
            viewBox="0 0 52 52"
            className="h-8 w-8"
            fill="none"
            stroke="var(--accent)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path className={styles.check} d="M14 27 l8 8 l16 -18" />
          </svg>
        </span>

        <div
          className={`${styles.rise} flex flex-col gap-1.5`}
          style={{ animationDelay: "0.05s" }}
        >
          <h2 className="text-[22px] font-semibold tracking-tight">
            You&rsquo;re on the list
          </h2>
          <p className="text-[15px] text-muted">
            We&rsquo;ll write to{" "}
            <span className="text-foreground">{submittedEmail.current}</span> when
            WardMate opens for your college.
          </p>
        </div>

        <p
          className={`${styles.rise} ios-group w-full px-4 py-3.5 text-left text-[15px] text-muted`}
          style={{ animationDelay: "0.1s" }}
        >
          One email, with an invite link. Nothing else.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      {/* progress */}
      <div className="flex flex-col gap-2">
        <div className="flex gap-1.5" aria-hidden>
          {Array.from({ length: STEPS }, (_, i) => (
            <span
              key={i}
              className="h-1 flex-1 overflow-hidden rounded-full bg-chip"
            >
              <span
                className="block h-full rounded-full bg-accent"
                style={{
                  width: i <= step ? "100%" : "0%",
                  transition: "width 0.4s ease-out",
                }}
              />
            </span>
          ))}
        </div>
        <div className="flex items-center justify-between text-[13px]">
          <span className="text-muted tabular-nums">
            Step {step + 1} of {STEPS}
          </span>
          {step > 0 && (
            <button
              type="button"
              onClick={back}
              className="font-medium text-accent"
            >
              Back
            </button>
          )}
        </div>
      </div>

      <div
        key={step}
        className={`${dir === "fwd" ? styles.stepForward : styles.stepBack} flex flex-col gap-5`}
      >
        <div className="flex flex-col gap-1">
          <h3 className="text-[19px] font-semibold tracking-tight">
            {STEP_TITLES[step].title}
          </h3>
          <p className="text-[14px] text-muted">{STEP_TITLES[step].hint}</p>
        </div>

        {step === 0 && (
          <>
            <label className="flex flex-col gap-2">
              <span className={FIELD_LABEL}>Email</span>
              <span className="flex items-stretch gap-2">
                <input
                  type="text"
                  required
                  autoFocus
                  inputMode="email"
                  autoCapitalize="off"
                  autoCorrect="off"
                  spellCheck={false}
                  autoComplete="username"
                  aria-label="Email username"
                  value={emailUser}
                  onChange={(e) => setEmailUser(e.target.value.replace(/\s/g, ""))}
                  onBlur={() => setEmailTouched(true)}
                  placeholder="you"
                  className="ios-group min-w-0 flex-1 px-4 py-3.5 text-base outline-none transition-shadow focus:ring-2 focus:ring-accent"
                />
                <span className="flex items-center text-base text-muted">@</span>
                <input
                  type="text"
                  required
                  inputMode="email"
                  autoCapitalize="off"
                  autoCorrect="off"
                  spellCheck={false}
                  aria-label="Email provider"
                  value={emailDomain}
                  onChange={(e) =>
                    setEmailDomain(e.target.value.replace(/\s/g, ""))
                  }
                  onBlur={() => setEmailTouched(true)}
                  placeholder="gmail.com"
                  className="ios-group px-3 py-3.5 text-base outline-none transition-shadow focus:ring-2 focus:ring-accent"
                  style={{ width: "8.5rem" }}
                />
              </span>
              {emailTouched && emailUser.length > 0 && !emailValid ? (
                <span className="text-[13px] text-orange-700">
                  That doesn&rsquo;t look like an email address.
                </span>
              ) : (
                <span className="text-[13px] text-muted">
                  Set to <span className="text-foreground">gmail.com</span> — change
                  the right box if yours differs.
                </span>
              )}
            </label>
            <label className="flex flex-col gap-2">
              <span className={FIELD_LABEL}>
                Name <span className="font-normal normal-case">· optional</span>
              </span>
              <input
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Dr. …"
                className={CONTROL}
              />
            </label>
          </>
        )}

        {step === 1 && (
          <>
            <label className="flex flex-col gap-2">
              <span className={FIELD_LABEL}>College / hospital</span>
              <input
                type="text"
                required
                autoFocus
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                placeholder="e.g. Grant Medical College, Mumbai"
                className={CONTROL}
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className={FIELD_LABEL}>Department</span>
              <select
                required
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className={CONTROL}
                style={{
                  color: department ? "var(--foreground)" : "var(--muted)",
                  backgroundImage: SELECT_CHEVRON,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 1rem center",
                  paddingRight: "2.75rem",
                }}
              >
                <option value="" disabled>
                  Select your department
                </option>
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </label>
            {department === "Other" && (
              <label className="flex flex-col gap-2">
                <span className={FIELD_LABEL}>Which department?</span>
                <input
                  type="text"
                  required
                  autoFocus
                  value={departmentOther}
                  onChange={(e) => setDepartmentOther(e.target.value)}
                  placeholder="Type your department"
                  className={CONTROL}
                />
              </label>
            )}
          </>
        )}

        {step === 2 && (
          <div className="grid grid-cols-2 gap-2.5">
            {YEARS.map((y) => {
              const active = year === y;
              return (
                <button
                  key={y}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setYear(y)}
                  className={`rounded-[10px] px-4 py-3.5 text-[15px] font-medium transition-colors active:opacity-80 ${
                    active
                      ? "bg-accent text-accent-ink"
                      : "bg-card text-foreground"
                  }`}
                >
                  {y}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2.5">
        <button
          type="submit"
          disabled={!stepValid || busy}
          className="rounded-[10px] bg-accent px-4 py-3.5 text-[17px] font-semibold text-accent-ink transition-opacity active:opacity-80 disabled:opacity-40"
        >
          {busy
            ? "Joining…"
            : step < STEPS - 1
              ? "Continue"
              : "Join the waitlist"}
        </button>
        <p className="text-center text-[13px] text-muted">
          One email when WardMate opens for your college. Nothing else.
        </p>
      </div>

      {error && (
        <p className="ios-group px-4 py-3 text-[15px] text-orange-700">{error}</p>
      )}
    </form>
  );
}
