/**
 * What a resident should be told when a model call fails.
 *
 * The API's own words go to a developer reading a stack trace, not to somebody standing at a
 * bed with a phone. Left raw, a spent account showed up mid-round as a wall of JSON —
 * "invalid_request_error … Please go to Plans & Billing" — under the heading "Could not read".
 * A resident cannot act on that, and worse, cannot tell it apart from a photo that was simply
 * too blurred: one means take the picture again, the other means nothing they do will help.
 *
 * So the cases a person can act on differently are named differently, and anything unrecognised
 * keeps the original wording rather than being flattened into a friendly nothing — an error
 * nobody can diagnose is its own kind of failure.
 */
export function plainAiError(error: unknown): string {
  const raw = error instanceof Error ? error.message : String(error);

  // Out of credit, or the key was rejected. Nothing the resident does will fix it, so the
  // message points at the one person who can, and says the record is unaffected.
  if (/credit balance is too low|billing|insufficient_quota/i.test(raw)) {
    return "WardMate's AI credit has run out, so it cannot read or listen right now. Nothing already on the record is affected. Tell whoever looks after the app — everything else keeps working.";
  }
  if (/authentication_error|invalid x-api-key|401/i.test(raw)) {
    return "WardMate cannot reach its AI service — the key is being refused. Nothing on the record is affected. Tell whoever looks after the app.";
  }

  // Busy or briefly down: worth trying again in a moment, unlike the two above.
  if (/rate_limit|429|overloaded|529/i.test(raw)) {
    return "The AI service is busy. Wait a few seconds and try again — nothing was lost.";
  }
  if (/timeout|ETIMEDOUT|ECONNRESET|fetch failed/i.test(raw)) {
    return "That took too long to come back. Try again — nothing was lost.";
  }

  return raw;
}
