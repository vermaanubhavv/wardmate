import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { plainAiError } from "@/lib/ai-error";
import { tagRequest } from "@/lib/observability";
import { historyCheckEnabled } from "@/lib/history-check/flag";
import { runHistoryCheck } from "@/lib/history-check/store";

/**
 * Run a History check for one patient against one complaint tree.
 *
 * POST { tree_id } → the stored run (reused when nothing has changed since the last one).
 * Reads the case history, stores a mapping of it, creates no observation. Behind the feature
 * flag: with it off this route does not exist as far as the client can tell.
 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!historyCheckEnabled()) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const { id: patientId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  let body: { tree_id?: string };
  try {
    body = (await request.json()) as { tree_id?: string };
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }
  const treeId = String(body.tree_id ?? "").trim();
  if (!treeId) return NextResponse.json({ error: "No complaint chosen." }, { status: 400 });

  tagRequest({ route: "history-check", "tree.id": treeId });

  const outcome = await runHistoryCheck({ supabase, userId: user.id, patientId, treeId });
  if (!outcome.ok) {
    const error = outcome.status === 502 ? plainAiError(new Error(outcome.error)) : outcome.error;
    return NextResponse.json({ error }, { status: outcome.status });
  }
  return NextResponse.json({ run: outcome.run, reused: outcome.reused });
}
