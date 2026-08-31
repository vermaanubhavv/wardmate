import { NextResponse } from "next/server";
import { plainAiError } from "@/lib/ai-error";
import { createClient } from "@/lib/supabase/server";
import { getTranscriber, MEDICAL_VOCABULARY_HINT } from "@/lib/stt";
import { correctTranscript } from "@/lib/glossary";

/**
 * Speech to text and nothing else — for the "speak" button on a card in the case-history
 * workspace, where the words go straight into a field the resident is looking at and editing.
 *
 * Deliberately stores nothing and extracts nothing. Saving the card is what writes an
 * observation; until then this is just a faster keyboard. The same transcriber and the same
 * ward-vocabulary correction the case-history and round routes use, so a term is heard the same
 * way wherever it is spoken.
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const form = await request.formData();
  const audio = form.get("audio");
  if (!(audio instanceof Blob) || audio.size === 0) {
    return NextResponse.json({ error: "No audio was recorded." }, { status: 400 });
  }

  let heard: string;
  try {
    const stt = getTranscriber();
    const result = await stt.transcribe(audio, MEDICAL_VOCABULARY_HINT);
    heard = result.text;
  } catch (e) {
    return NextResponse.json({ error: plainAiError(e) }, { status: 502 });
  }

  const corrected = await correctTranscript(heard);
  const text = corrected.text.trim();
  if (!text) {
    return NextResponse.json(
      { error: "Nothing was heard. Hold the button while speaking and try again." },
      { status: 422 }
    );
  }

  return NextResponse.json({ text });
}
