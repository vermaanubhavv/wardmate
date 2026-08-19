"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/**
 * Sign-in is a 6-digit code sent by email, not a "click this link" email.
 *
 * The reason is the home-screen app: a login link always opens in Safari, which would sign
 * you in *in the browser* and leave the installed app still logged out. A code can be typed
 * straight into the app, so you never leave it.
 */
/**
 * Turn what Supabase says into something the person holding the phone can act on.
 *
 * "Error sending confirmation email" is a 500 from the mail provider, and it means one thing
 * far more often than anything else: the project is still on a shared test sender, which is
 * only allowed to deliver to the address that owns the mail account. The first doctor gets in;
 * every colleague is refused, and the message gives no hint why. Somebody standing in a ward
 * cannot fix that, so the message says who can.
 */
function explain(message: string): string {
  if (/sending|smtp|mail/i.test(message)) {
    return "The app could not send the code to that address. This usually means the unit's email sending is not set up for anyone but the first account — ask whoever set up WardMate to finish that. Nothing is wrong with your email.";
  }
  if (/rate|limit|too many/i.test(message)) {
    return "Too many codes requested. Wait a few minutes and try again.";
  }
  return message;
}

export default function LoginPage() {
  const router = useRouter();
  const [googleBusy, setGoogleBusy] = useState(false);
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // /auth/callback sends the doctor back here with a reason when Google did not work out.
  const failed = useSearchParams().get("failed");

  /**
   * Hand off to Google, and come back at /auth/callback with a code to exchange.
   *
   * redirectTo is given explicitly rather than left to Supabase's Site URL: this app is
   * reachable at more than one address — wardmate.in and the vercel.app one — and a fixed
   * Site URL would land a doctor back on whichever was configured, not the one they started
   * on. window.location.origin returns them where they were.
   */
  async function signInWithGoogle() {
    setGoogleBusy(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });

    // On success the browser is already navigating away, so this only runs on failure.
    if (error) {
      setGoogleBusy(false);
      setError(error.message);
    }
  }

  async function sendCode(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { shouldCreateUser: true },
    });

    setBusy(false);
    if (error) {
      setError(explain(error.message));
      return;
    }
    setStep("code");
  }

  async function verifyCode(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: code.trim(),
      type: "email",
    });

    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <main className="flex-1 px-6 py-16 flex flex-col gap-8 max-w-md mx-auto w-full">
      <header className="flex flex-col items-center text-center gap-3">
        {/* The real mark, large — the one thing on this screen that isn't a form control,
            so it's the one thing allowed to be a little bigger than it needs to be. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/mark.png" alt="" className="h-14 w-14" aria-hidden />
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            ward<span className="text-accent">mate</span>
          </h1>
          <p className="text-muted mt-1">Your Residency Companion</p>
        </div>
      </header>

      {step === "email" && (
        <div className="flex flex-col gap-4">
          <button
            type="button"
            onClick={signInWithGoogle}
            disabled={googleBusy}
            className="flex items-center justify-center gap-2.5 rounded-[10px] bg-card px-4 py-3 text-[17px] font-medium disabled:opacity-60"
          >
            <GoogleMark />
            {googleBusy ? "Opening Google…" : "Continue with Google"}
          </button>

          <div className="flex items-center gap-3">
            <span className="h-px flex-1 bg-line" />
            <span className="text-[13px] text-muted">or</span>
            <span className="h-px flex-1 bg-line" />
          </div>
        </div>
      )}

      {step === "email" ? (
        <form onSubmit={sendCode} className="flex flex-col gap-4">
          <label className="flex flex-col gap-2">
            <span className="text-[15px] text-muted">Your email</span>
            <input
              type="email"
              required
              autoFocus
              autoComplete="email"
              inputMode="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@hospital.in"
              className="ios-group px-4 py-4 text-base outline-none focus:border-accent"
            />
          </label>
          <button
            type="submit"
            disabled={busy}
            className="rounded-[10px] bg-accent px-4 py-3 text-[17px] font-semibold text-accent-ink disabled:opacity-50"
          >
            {busy ? "Sending…" : "Send me a code"}
          </button>
        </form>
      ) : (
        <form onSubmit={verifyCode} className="flex flex-col gap-4">
          <p className="text-[15px] text-muted">
            We sent a code to <span className="text-foreground">{email}</span>. It
            expires in an hour.
          </p>
          <input
            required
            autoFocus
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]*"
            maxLength={10}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            placeholder="the code from the email"
            className="ios-group px-4 py-4 text-center text-xl tracking-[0.25em] outline-none focus:border-accent"
          />
          <button
            type="submit"
            disabled={busy || code.length === 0}
            className="rounded-[10px] bg-accent px-4 py-3 text-[17px] font-semibold text-accent-ink disabled:opacity-50"
          >
            {busy ? "Checking…" : "Sign in"}
          </button>
          <button
            type="button"
            onClick={() => {
              setStep("email");
              setCode("");
              setError(null);
            }}
            className="text-[17px] text-accent"
          >
            Use a different email
          </button>
        </form>
      )}

      {failed && !error && (
        <p className="ios-group px-4 py-3 text-[15px] text-orange-700">
          {failed === "cancelled"
            ? "Google sign-in was cancelled. Use the code instead, or try again."
            : "Google sign-in did not complete. Use the code below instead."}
        </p>
      )}

      {error && (
        <p className="ios-group px-4 py-3 text-[15px] text-orange-700">
          {error}
        </p>
      )}
    </main>
  );
}

/** Google's mark, in its own colours, as their brand terms require. */
function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path
        fill="#4285F4"
        d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"
      />
      <path
        fill="#34A853"
        d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z"
      />
      <path
        fill="#FBBC05"
        d="M11.69 28.18C11.25 26.86 11 25.45 11 24s.25-2.86.69-4.18v-5.7H4.34C2.85 17.09 2 20.45 2 24s.85 6.91 2.34 9.88l7.35-5.7z"
      />
      <path
        fill="#EA4335"
        d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z"
      />
    </svg>
  );
}
