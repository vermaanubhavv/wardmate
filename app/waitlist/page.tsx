"use client";

import { useState } from "react";
import Mark from "@/app/mark";
import styles from "./waitlist.module.css";

/**
 * The waitlist sign-up, linked from the Instagram bio. A public page: middleware lets
 * `/waitlist` through without a session.
 *
 * The form is split into three short steps rather than one long column — an email address, a
 * college, a year — because a stranger meeting WardMate for the first time on their phone is
 * far more likely to finish three one-line asks than one wall of inputs. The look is still the
 * app's: the same grouped-inset controls, the same teal, the system font, one fixed light
 * theme. The motion (steps rising in, the tick drawing itself) lives in waitlist.module.css so
 * it stays on this page.
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
// Most residents sign up with a personal Gmail, so the address is split into a username box
// and a domain box that starts on "gmail.com". Someone on a different provider just edits the
// right-hand box; either way the whole step is one Back tap away.
const EMAIL_DOMAIN_DEFAULT = "gmail.com";
const STEPS = 3;

const FIELD_LABEL = "text-[13px] font-medium uppercase tracking-wide text-muted";
const INPUT =
  "ios-group w-full px-4 py-4 text-base outline-none transition-shadow focus:ring-2 focus:ring-accent";

export default function WaitlistPage() {
  const [step, setStep] = useState(0);
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
    if (step < STEPS - 1) setStep(step + 1);
    else submit();
  }

  if (done) {
    return (
      <main className="flex-1 px-6 py-20 flex flex-col items-center text-center gap-5 max-w-md mx-auto w-full">
        <span
          className={`${styles.rise} inline-flex h-20 w-20 items-center justify-center rounded-full`}
          style={{
            backgroundColor: "color-mix(in srgb, var(--accent) 12%, transparent)",
          }}
        >
          <svg
            viewBox="0 0 52 52"
            className="h-9 w-9"
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

        <h1
          className={`${styles.rise} text-[28px] font-semibold tracking-tight`}
          style={{ animationDelay: "0.05s" }}
        >
          You&rsquo;re on the list
        </h1>
        <p
          className={`${styles.rise} text-muted`}
          style={{ animationDelay: "0.1s" }}
        >
          We&rsquo;ll email{" "}
          <span className="text-foreground">{email.trim().toLowerCase()}</span> the
          moment WardMate opens for your college.
        </p>

        <div
          className={`${styles.rise} ios-group w-full text-left`}
          style={{ animationDelay: "0.15s" }}
        >
          <p className="ios-row px-4 py-3.5 text-[15px]">
            You&rsquo;ll get an invite link — not a waitlist-forever email.
          </p>
        </div>

        <p
          className={`${styles.rise} text-[13px] text-muted`}
          style={{ animationDelay: "0.2s" }}
        >
          You can close this page.
        </p>
      </main>
    );
  }

  return (
    <main className="flex-1 px-6 py-12 flex flex-col gap-8 max-w-md mx-auto w-full">
      <header className="flex flex-col items-center text-center gap-3 pt-2">
        <Mark className="h-12 w-12" />
        <div>
          <h1 className="text-[26px] font-semibold tracking-tight">
            ward<span className="text-accent">mate</span>
          </h1>
          <p className="text-muted mt-1 text-[15px]">
            The ward round, done by the time you leave the bedside.
          </p>
        </div>
      </header>

      <div className="flex items-center gap-3">
        {step > 0 ? (
          <button
            type="button"
            onClick={back}
            className="-ml-1 shrink-0 text-[15px] text-accent"
          >
            ‹ Back
          </button>
        ) : (
          <span className="shrink-0" style={{ width: 44 }} aria-hidden />
        )}
        <span className="h-1 flex-1 overflow-hidden rounded-full bg-chip">
          <span
            className="block h-full rounded-full bg-accent"
            style={{
              width: `${((step + 1) / STEPS) * 100}%`,
              transition: "width 0.5s ease-out",
            }}
          />
        </span>
        <span className="shrink-0 text-[13px] tabular-nums text-muted">
          {step + 1}/{STEPS}
        </span>
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-6">
        <div key={step} className={`${styles.rise} flex flex-col gap-5`}>
          {step === 0 && (
            <>
              <StepHead
                title="Let’s start with your email"
                hint="This is where your invite will land."
              />
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
                    onChange={(e) =>
                      setEmailUser(e.target.value.replace(/\s/g, ""))
                    }
                    onBlur={() => setEmailTouched(true)}
                    placeholder="you"
                    className="ios-group min-w-0 flex-1 px-4 py-4 text-base outline-none transition-shadow focus:ring-2 focus:ring-accent"
                  />
                  <span className="flex items-center text-base text-muted">
                    @
                  </span>
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
                    className="ios-group px-3 py-4 text-base outline-none transition-shadow focus:ring-2 focus:ring-accent"
                    style={{ width: "9rem" }}
                  />
                </span>
                {emailTouched && emailUser.length > 0 && !emailValid ? (
                  <span className="text-[13px] text-orange-700">
                    That doesn’t look like an email address.
                  </span>
                ) : (
                  <span className="text-[13px] text-muted">
                    Defaults to <span className="text-foreground">gmail.com</span>{" "}
                    — edit the right-hand box if yours is different.
                  </span>
                )}
              </label>
              <label className="flex flex-col gap-2">
                <span className={FIELD_LABEL}>
                  Name{" "}
                  <span className="font-normal normal-case">· optional</span>
                </span>
                <input
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Dr. …"
                  className={INPUT}
                />
              </label>
            </>
          )}

          {step === 1 && (
            <>
              <StepHead
                title="Where do you train?"
                hint="We open WardMate up college by college."
              />
              <label className="flex flex-col gap-2">
                <span className={FIELD_LABEL}>College / hospital</span>
                <input
                  type="text"
                  required
                  autoFocus
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  placeholder="e.g. AIIMS Delhi"
                  className={INPUT}
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className={FIELD_LABEL}>Department</span>
                <select
                  required
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className={INPUT}
                  style={{
                    color: department ? "var(--foreground)" : "var(--muted)",
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
                    className={INPUT}
                  />
                </label>
              )}
            </>
          )}

          {step === 2 && (
            <>
              <StepHead
                title="What year are you?"
                hint="Pick the one that fits best."
              />
              <div className="grid grid-cols-2 gap-2.5">
                {YEARS.map((y) => {
                  const active = year === y;
                  return (
                    <button
                      key={y}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setYear(y)}
                      className={`rounded-[10px] px-4 py-3.5 text-[15px] font-medium transition-colors ${
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
            </>
          )}
        </div>

        <button
          type="submit"
          disabled={!stepValid || busy}
          className="rounded-[10px] bg-accent px-4 py-3.5 text-[17px] font-semibold text-accent-ink transition-opacity disabled:opacity-40"
        >
          {busy
            ? "Joining…"
            : step < STEPS - 1
              ? "Continue"
              : "Join the waitlist"}
        </button>
      </form>

      {error && (
        <p className="ios-group px-4 py-3 text-[15px] text-orange-700">{error}</p>
      )}
    </main>
  );
}

function StepHead({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <h2 className="text-[20px] font-semibold tracking-tight">{title}</h2>
      <p className="text-[14px] text-muted">{hint}</p>
    </div>
  );
}
