import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPatientDictationKeyterms } from "@/lib/transcription/patient-context";
import { MEDICAL_KEYTERMS } from "@/lib/stt";

/**
 * Mint a short-lived Deepgram token so the browser can open a live-transcription WebSocket
 * straight to Deepgram without ever seeing DEEPGRAM_API_KEY.
 *
 * Used by the bedside mic and the live dictation panel (lib/stt/live.ts). Every other
 * dictation path records a clip and POSTs it to /api/transcribe instead.
 *
 * The response also carries the patient's medical keyterms — Nova-3 fixes its vocabulary when
 * the socket opens, so the list has to be chosen here, before the browser connects. That list
 * is PHI-safe by construction (see lib/transcription/patient-context.ts); nothing else about
 * the patient is returned.
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const key = process.env.DEEPGRAM_API_KEY;
  if (!key) {
    return NextResponse.json(
      { error: "Live dictation is not configured on this server (no Deepgram key)." },
      { status: 501 }
    );
  }

  let body: { patientId?: string };
  try {
    body = (await request.json()) as { patientId?: string };
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }
  // No patient yet is the add-patient screen: the general medical vocabulary instead of a
  // patient's own. A patient given has to be one this user can see — reuse RLS: a row comes
  // back only for a ward member.
  if (body.patientId) {
    const { data: patient } = await supabase
      .from("current_patients")
      .select("id")
      .eq("id", body.patientId)
      .maybeSingle();
    if (!patient) return NextResponse.json({ error: "Patient not found." }, { status: 404 });
  }

  let token: string;
  let expiresIn = 30;
  try {
    const res = await fetch("https://api.deepgram.com/v1/auth/grant", {
      method: "POST",
      headers: { Authorization: `Token ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ ttl_seconds: 30 }),
    });
    if (!res.ok) {
      const detail = await res.text();
      return NextResponse.json(
        { error: `Deepgram refused a token (${res.status}): ${detail.slice(0, 200)}` },
        { status: 502 }
      );
    }
    const data = (await res.json()) as { access_token?: string; expires_in?: number };
    if (!data.access_token) {
      return NextResponse.json({ error: "Deepgram returned no token." }, { status: 502 });
    }
    token = data.access_token;
    if (typeof data.expires_in === "number") expiresIn = data.expires_in;
  } catch {
    return NextResponse.json({ error: "Could not reach Deepgram." }, { status: 502 });
  }

  const keyterms = body.patientId
    ? await getPatientDictationKeyterms(supabase, body.patientId, { noteType: "ward-round" })
    : [...MEDICAL_KEYTERMS];

  return NextResponse.json({ token, expiresIn, keyterms });
}
