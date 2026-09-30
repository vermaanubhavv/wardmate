/**
 * TypeSafe's Jev: typed judgments (a choice, a yes/no probability) over text. Server-side only.
 *
 * Every caller treats a fallback as "no judgment" and carries on exactly as it did before Jev
 * existed — no key, an error, or a slow answer never blocks a dictation. So a Jev outage costs
 * the extra checks, never a saved entry.
 */

export type JevAnswer = { choice?: string; probabilities?: Record<string, number>; noul?: number };
export type JevAnswers = Record<string, JevAnswer>;

const MODEL = "jev-latest";

export async function askJev(
  state: unknown,
  questions: Record<string, unknown>,
  timeoutMs = 4000
): Promise<{ answers: JevAnswers; model: string } | { fallback: string }> {
  const key = process.env.TYPESAFE_API_KEY;
  if (!key) return { fallback: "no key" };
  if (Object.keys(questions).length === 0) return { answers: {}, model: MODEL };
  try {
    const res = await fetch("https://api.typesafe.ai/v1/systemone", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: MODEL, state, questions }),
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!res.ok) return { fallback: `http ${res.status}` };
    const body = (await res.json()) as { model?: string; answers?: JevAnswers };
    return { answers: body.answers ?? {}, model: body.model ?? MODEL };
  } catch (e) {
    return { fallback: e instanceof Error ? e.name : "error" };
  }
}

/** The probability Jev gave its own pick — 0 when there is no answer. */
export function chosenProbability(a: JevAnswer | undefined): number {
  return a?.choice ? (a.probabilities?.[a.choice] ?? 0) : 0;
}
