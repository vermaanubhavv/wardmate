"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">WardMate</h1>
        <p className="text-muted mt-1">Ward rounds by voice.</p>
      </header>

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

      {error && (
        <p className="ios-group px-4 py-3 text-[15px] text-orange-700">
          {error}
        </p>
      )}
    </main>
  );
}
