import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getTranscriber, MEDICAL_VOCABULARY_HINT } from "@/lib/stt";
import { applyCorrections } from "@/lib/corrections";
import { readSpokenPatient } from "@/lib/read-new-patient";

/**
 * Speech in, form fields out. Writes nothing.
 *
 * The resident looks at the filled form and presses Add themselves, so this route only ever
 * suggests — which is why it can be this simple, and why a field it gets wrong costs a
 * correction rather than a wrong patient.
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
    return NextResponse.json({ error: "Nothing was recorded." }, { status: 400 });
  }

  let transcript: string;
  try {
    const stt = getTranscriber();
    const result = await stt.transcribe(audio, MEDICAL_VOCABULARY_HINT);
    transcript = applyCorrections(result.text).text;
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Transcription failed." },
      { status: 502 }
    );
  }

  if (!transcript.trim()) {
    return NextResponse.json(
      { error: "Nothing was heard. Tap to record, speak, then tap again to stop." },
      { status: 422 }
    );
  }

  try {
    const { patient } = await readSpokenPatient(transcript);
    return NextResponse.json({ patient, transcript });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Could not read that." },
      { status: 502 }
    );
  }
}
