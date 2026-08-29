import { NextResponse } from "next/server";
import { plainAiError } from "@/lib/ai-error";
import { createClient } from "@/lib/supabase/server";
import { getTranscriber, MEDICAL_VOCABULARY_HINT } from "@/lib/stt";
import { correctTranscript } from "@/lib/glossary";
import { buildRoundDraft } from "@/lib/round-draft";
import { getCurrentWard, getActivePatients } from "@/lib/ward";

/**
 * A whole round, dictated in one go. Produces a DRAFT and writes nothing to any patient.
 *
 * The split into beds happens here so the review screen has something to show, but no entry,
 * no observation and no patient exists until the resident has seen which patient each
 * instruction landed on and approved it.
 */
export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const { ward } = await getCurrentWard();
  if (!ward) return NextResponse.json({ error: "No ward found." }, { status: 404 });

  const form = await request.formData();
  const audio = form.get("audio");
  const typed = String(form.get("text") ?? "").trim();

  if (!(audio instanceof Blob) || audio.size === 0) {
    if (!typed) return NextResponse.json({ error: "Nothing was recorded." }, { status: 400 });
  }

  // 1. Speech to text, unless it was typed.
  let transcript = typed;
  let stt: ReturnType<typeof getTranscriber> | null = null;

  if (!transcript && audio instanceof Blob) {
    try {
      stt = getTranscriber();
      const result = await stt.transcribe(audio, MEDICAL_VOCABULARY_HINT);
      // Only what the engine heard. `typed` above is the resident's own writing and is left
      // exactly as they wrote it — this fixes mishearings, not people.
      transcript = (await correctTranscript(result.text)).text;
    } catch (e) {
      return NextResponse.json(
        { error: plainAiError(e) },
        { status: 502 }
      );
    }
  }

  if (!transcript.trim()) {
    return NextResponse.json(
      { error: "Nothing was heard. Tap to record, speak, then tap again to stop." },
      { status: 422 }
    );
  }

  // 2. Split it by bed. The ward's own bed labels go along so "bed 1" is recognised the way
  // this unit writes beds — never so a bed nobody mentioned can acquire instructions.
  const { patients } = await getActivePatients(ward.id);

  let read;
  try {
    read = await buildRoundDraft(transcript, patients);
  } catch (e) {
    return NextResponse.json(
      { error: plainAiError(e) },
      { status: 502 }
    );
  }

  if (read.segments.length === 0) {
    return NextResponse.json(
      {
        error:
          "No bed was recognised in that. Say the bed before each instruction — “bed 4, remove the drain”.",
        transcript,
      },
      { status: 422 }
    );
  }

  // 3. Keep the audio, so a disputed segment can be listened to again.
  let audioPath: string | null = null;
  if (audio instanceof Blob && audio.size > 0) {
    const path = `round/${ward.id}/${crypto.randomUUID()}.webm`;
    const { error: uploadError } = await supabase.storage
      .from("evidence")
      .upload(path, audio, { contentType: audio.type || "audio/webm" });
    if (!uploadError) audioPath = path;
  }

  const { data: dictation, error } = await supabase
    .from("round_dictations")
    .insert({
      ward_id: ward.id,
      author_id: user.id,
      transcript,
      audio_path: audioPath,
      stt_provider: stt?.provider ?? null,
      stt_model: stt?.model ?? null,
      raw: read.raw as never,
      model: read.model,
    })
    .select("id")
    .single();

  if (error || !dictation) {
    return NextResponse.json(
      { error: `Could not save: ${error?.message ?? "unknown error"}` },
      { status: 500 }
    );
  }

  return NextResponse.json({ dictation_id: dictation.id, segments: read.segments.length });
}
