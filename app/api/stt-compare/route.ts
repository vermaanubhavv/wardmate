import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getComparisonTranscribers, MEDICAL_VOCABULARY_HINT } from "@/lib/stt";
import { correctTranscript } from "@/lib/glossary";
import { plainAiError } from "@/lib/ai-error";

/**
 * Runs every configured speech engine on ONE recording and stores what each returned, for the
 * comparison screen at app/tools/transcribe. This is the only route that fans a recording out
 * to more than one engine — every live capture path uses the single engine STT_PROVIDER names.
 *
 * Each engine is timed and its failure is caught on its own: one engine being down or slow
 * must not lose the other two results, since the whole point is the comparison between them.
 * Nothing clinical is written and the audio is not kept — see supabase/patches/0055.
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const form = await request.formData();
  const audio = form.get("audio");
  const seconds = Number(form.get("seconds"));
  const note = String(form.get("note") ?? "").trim() || null;

  if (!(audio instanceof Blob) || audio.size === 0) {
    return NextResponse.json({ error: "No audio was recorded." }, { status: 400 });
  }

  const engines = getComparisonTranscribers();
  if (engines.length === 0) {
    return NextResponse.json(
      { error: "No speech engine is configured. Set at least one of OPENAI_API_KEY, SARVAM_API_KEY or DEEPGRAM_API_KEY." },
      { status: 500 }
    );
  }

  const results = await Promise.all(
    engines.map(async (engine) => {
      const startedAt = Date.now();
      try {
        const heard = await engine.transcribe(audio, MEDICAL_VOCABULARY_HINT);
        const corrected = (await correctTranscript(heard.text)).text;
        return {
          provider: engine.provider,
          model: engine.model,
          text: heard.text,
          corrected_text: corrected === heard.text ? null : corrected,
          ms: Date.now() - startedAt,
          error: null as string | null,
        };
      } catch (e) {
        return {
          provider: engine.provider,
          model: engine.model,
          text: "",
          corrected_text: null,
          ms: Date.now() - startedAt,
          error: plainAiError(e),
        };
      }
    })
  );

  const { data: row, error } = await supabase
    .from("stt_comparisons")
    .insert({
      author_id: user.id,
      results: results as never,
      duration_seconds: Number.isFinite(seconds) && seconds > 0 ? seconds : null,
      note,
    })
    .select("id, created_at")
    .single();

  if (error || !row) {
    // The transcripts are still worth showing even if the save failed.
    return NextResponse.json({ id: null, results, saved: false, error: error?.message ?? null });
  }

  return NextResponse.json({ id: row.id, created_at: row.created_at, results, saved: true });
}

/** Record which engine the resident judged best for a past comparison. */
export async function PATCH(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const body = (await request.json().catch(() => null)) as
    | { id?: string; best_provider?: string | null }
    | null;
  if (!body?.id) return NextResponse.json({ error: "No comparison id." }, { status: 400 });

  const { error } = await supabase
    .from("stt_comparisons")
    .update({ best_provider: body.best_provider ?? null })
    .eq("id", body.id)
    .eq("author_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
