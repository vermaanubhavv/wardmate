import { NextResponse } from "next/server";
import { plainAiError } from "@/lib/ai-error";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth";
import { STT_MODEL, STT_PROVIDER, transcribe } from "@/lib/stt";
import { getPatientDictationKeyterms } from "@/lib/transcription/patient-context";
import { correctTranscript } from "@/lib/glossary";
import { getWardPack, getWardSpecialtyStored } from "@/lib/ward";
import { getSpecialtyPack } from "@/lib/specialty";
import { progressNoteConfigFor } from "@/lib/progress-note-config";
import { routeToSections } from "@/lib/dictation-routing";
import { routeClerkingChunk } from "@/lib/case-history-routing";
import { EXAM_SECTION_LABEL, HISTORY_SECTION_LABEL } from "@/lib/case-history-sections";
import { appendCaseHistoryDictation } from "@/app/patients/[id]/case-history/actions";
import { getDischargeContext } from "@/lib/discharge-data";
import { mergeDischargeDraft, writeDischargeSection } from "@/lib/discharge-store";
import { readReceipt, saveReceipt } from "@/lib/dictation-receipt";
import { revalidatePatient } from "@/lib/revalidate";
import { tagRequest, log } from "@/lib/observability";
import {
  DISCHARGE_DRAFT_KEY,
  DISCHARGE_LIVE_SECTIONS,
  LATE_LABEL,
  LATE_SCREENS,
  NOT_PLACED_LABEL,
  NOT_PLACED_NOTE,
  applyDischargeLines,
  chunks,
  noteRows,
  noteSections,
  offered,
  recordedAtFrom,
  type LateScreen,
  type Line,
} from "@/lib/late-dictation";

/**
 * A live-panel take recorded with no signal (note, discharge or clerking), sent by the outbox
 * once the signal is back. See lib/late-dictation.ts.
 *
 * The screen it was recorded on is usually closed by now, so this does what the screen would
 * have done: transcribe, sort into that screen's sections, and fill them — today's note, the
 * discharge draft, or the clerking. The words are kept verbatim on a voice entry timed when
 * they were SAID (recorded_at), with processed_at beside it. Whatever does not land cleanly on
 * a card goes to "To check". Once the transcript is saved the request succeeds, so the phone
 * deletes the audio — a sorting failure after that leaves the words in "To check", not lost.
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const form = await request.formData();
  const patientId = String(form.get("patient_id") ?? "");
  const audio = form.get("audio");
  const clientUuid = String(form.get("client_uuid") ?? "") || null;
  const screen = String(form.get("screen") ?? "") as LateScreen;
  if (!patientId || !LATE_SCREENS.includes(screen)) return NextResponse.json({ error: "No patient." }, { status: 400 });
  if (!(audio instanceof Blob) || audio.size === 0)
    return NextResponse.json({ error: "No audio was recorded." }, { status: 400 });

  // The same take sent twice (the queue retried after a kill mid-upload): the first answer.
  const prior = await readReceipt(supabase, clientUuid, user.id);
  if (prior) return NextResponse.json(prior);

  const { data: patient } = await supabase
    .from("current_patients")
    .select("id, ward_id, display_name, bed")
    .eq("id", patientId)
    .maybeSingle();
  if (!patient) return NextResponse.json({ error: "Patient not found." }, { status: 404 });
  tagRequest({ "wardmate.route": "entries/late-dictation", "ward.id": patient.ward_id });

  const recordedAt = recordedAtFrom(form.get("recorded_at"));
  const pack = await getWardPack(patient.ward_id);

  let transcript: string;
  let heard: string;
  try {
    heard = (await transcribe(audio, await getPatientDictationKeyterms(supabase, patientId))).text;
    transcript = (await correctTranscript(heard, pack)).text.trim();
  } catch (e) {
    // 5xx: the phone keeps the audio and offers Try again.
    return NextResponse.json({ error: plainAiError(e) }, { status: 502 });
  }
  if (!transcript) {
    return NextResponse.json({ error: "Nothing was heard in that recording." }, { status: 422 });
  }

  // The evidence first, timed when it was said.
  const processedAt = new Date().toISOString();
  const entryRow = {
    patient_id: patientId,
    author_id: user.id,
    source: "voice" as const,
    transcript,
    original_transcript: heard.trim() === transcript ? null : heard,
    stt_provider: STT_PROVIDER,
    stt_model: STT_MODEL,
    recorded_at: recordedAt,
    is_case_history: screen === "clerking",
  };
  let ins = await supabase.from("entries").insert({ ...entryRow, processed_at: processedAt }).select("id").single();
  // A database without 0112 yet: the entry still saves, only without its processed time.
  if (ins.error && /processed_at/.test(ins.error.message))
    ins = await supabase.from("entries").insert(entryRow).select("id").single();
  if (ins.error || !ins.data) {
    return NextResponse.json({ error: `Could not save: ${ins.error?.message ?? "unknown error"}` }, { status: 500 });
  }
  const entryId = ins.data.id as string;

  // Then the cards. Each pause-sized piece is sorted on its own; a piece that fails to sort,
  // or sorts to nothing, goes to "To check" whole.
  const unplaced: string[] = [];
  let placed = 0;
  const now = processedAt;
  const obs = (kind: string, label: string, text: string, amber: boolean, conflict: string | null = null) => ({
    entry_id: entryId,
    patient_id: patientId,
    kind,
    label,
    value_text: text,
    source_quote: text,
    recorded_at: recordedAt,
    conflict_note: conflict,
    ...(amber
      ? { needs_confirmation: true, confirmed_at: null, confirmed_by: null }
      : { needs_confirmation: false, confirmed_at: now, confirmed_by: user.id }),
  });

  try {
    if (screen === "clerking") {
      const specialty = await getWardSpecialtyStored(patient.ward_id);
      for (const piece of chunks(transcript)) {
        try {
          const { segments } = await routeClerkingChunk(piece, [], specialty, { name: patient.display_name, bed: patient.bed });
          const filed = segments.filter((s) => s.section === "hopi" || HISTORY_SECTION_LABEL[s.section] || EXAM_SECTION_LABEL[s.section]);
          if (segments.length === 0) unplaced.push(piece);
          for (const s of segments) if (!filed.includes(s)) unplaced.push(s.complaint ? `${s.complaint}: ${s.text}` : s.text);
          const r = await appendCaseHistoryDictation(patientId, filed);
          if (r.ok) placed += filed.length;
          else unplaced.push(...filed.map((s) => s.text));
        } catch {
          unplaced.push(piece);
        }
      }
    } else {
      const config =
        screen === "note" ? progressNoteConfigFor(getSpecialtyPack(await getWardSpecialtyStored(patient.ward_id)).key) : null;
      const sections = config ? noteSections(config) : DISCHARGE_LIVE_SECTIONS;
      const lines: Line[] = [];
      for (const piece of chunks(transcript)) {
        try {
          const got = await routeToSections(piece, offered(sections), pack);
          if (got.length === 0) unplaced.push(piece);
          lines.push(...got);
        } catch {
          unplaced.push(piece);
        }
      }

      if (config) {
        const { rows, unplaced: rest } = noteRows(lines, config);
        unplaced.push(...rest);
        if (rows.length > 0) {
          const { error } = await supabase.from("observations").insert(rows.map((r) => obs(r.kind, r.label, r.text, r.amber)));
          if (error) unplaced.push(...rows.map((r) => r.text));
          else placed += rows.length;
        }
      } else {
        const ctx = await getDischargeContext(patientId);
        const draft = ctx ? mergeDischargeDraft(ctx) : null;
        // A finalised summary is not reopened behind the resident's back: all of it to check.
        if (!draft || draft.status === "finalised") unplaced.push(...lines.map((l) => l.text));
        else {
          const { draft: next, touched, unplaced: rest } = applyDischargeLines(draft, lines);
          unplaced.push(...rest);
          for (const id of touched) {
            const key = DISCHARGE_DRAFT_KEY[id]!;
            const r = await writeDischargeSection(patientId, id, next[key]);
            const these = lines.filter((l) => sectionOf(l.section) === id);
            if (r.ok) placed += these.length;
            else unplaced.push(...these.map((l) => l.text));
          }
        }
      }
    }
  } catch (e) {
    // Sorting failed outright (the AI is down): the whole take is still on the entry, and goes
    // to "To check" so nobody has to remember it is there.
    log.error("late dictation: sorting failed", { screen, error: plainAiError(e) });
    unplaced.splice(0, unplaced.length, transcript);
  }

  if (unplaced.length > 0) {
    await supabase
      .from("observations")
      .insert(unplaced.map((t) => obs("note", NOT_PLACED_LABEL, t, true, NOT_PLACED_NOTE)));
  }

  revalidatePatient(patientId, `/patients/${patientId}/note`, `/patients/${patientId}/discharge`, `/patients/${patientId}/case-history`);

  const body = {
    entry_id: entryId,
    label: LATE_LABEL[screen],
    recorded_at: recordedAt,
    processed_at: processedAt,
    placed,
    to_check: unplaced.length,
  };
  await saveReceipt(supabase, clientUuid, user.id, "late-dictation", body);
  log.info("late dictation filed", { screen, placed, to_check: unplaced.length });
  return NextResponse.json(body);
}

/** The discharge section id a sorted line's key fills. */
const sectionOf = (key: string) => (key === "condition" ? "conditionAtDischarge" : key);
