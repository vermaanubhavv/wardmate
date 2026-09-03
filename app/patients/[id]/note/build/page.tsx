import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { stripPatientHonorific } from "@/lib/patients";
import { istDayKey } from "@/lib/patient-state";
import NoteWorkspace, { type NoteObs } from "../note-workspace";

/**
 * Build today's progress note as a card stack — one pass through the sheet's own lines, mostly
 * by tapping, then an AI compile into the progress-sheet phrasing. The printable sheet (/note)
 * renders the result onto the unit's uploaded form, unchanged.
 */
export default async function BuildNotePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: patient } = await supabase
    .from("current_patients")
    .select("id, display_name, bed")
    .eq("id", id)
    .maybeSingle();
  if (!patient) notFound();

  const cutoff = new Date();
  cutoff.setHours(cutoff.getHours() - 48);
  const since = cutoff.toISOString();
  const [{ data: entriesData }, { data: medRows }] = await Promise.all([
    supabase
      .from("entries")
      .select("recorded_at, is_case_history, observations(kind, label, value_text, urgency)")
      .eq("patient_id", id)
      .gte("recorded_at", since),
    // Medications are a standing list — carried forward across the whole admission, newest
    // reading of each drug wins. Same rule buildProgressNote follows.
    supabase
      .from("observations")
      .select("label, value_text, recorded_at")
      .eq("patient_id", id)
      .eq("kind", "medication")
      .order("recorded_at", { ascending: false }),
  ]);

  const seenDrug = new Set<string>();
  const currentMeds = ((medRows ?? []) as { label: string; value_text: string | null }[])
    .filter((m) => {
      const k = m.label.toLowerCase().trim();
      if (seenDrug.has(k)) return false;
      seenDrug.add(k);
      return true;
    })
    .map((m) => (m.value_text ?? m.label).trim())
    .filter(Boolean);

  const now = new Date();
  const today = istDayKey(now.toISOString());
  const yKey = istDayKey(new Date(now.getTime() - 24 * 3600 * 1000).toISOString());
  const roundEntries = ((entriesData ?? []) as unknown as {
    recorded_at: string;
    is_case_history: boolean;
    observations: { kind: string; label: string; value_text: string | null; urgency: string | null }[];
  }[]).filter((e) => !e.is_case_history);

  const todaysRaw = roundEntries
    .filter((e) => istDayKey(e.recorded_at) === today)
    .flatMap((e) => e.observations);
  const observations: NoteObs[] = todaysRaw.map((o) => ({ kind: o.kind, label: o.label, value: o.value_text }));

  // Yesterday's round, for the "Same as yesterday" shortcut on each card. Newest-per-label
  // wins, so a value edited later that day is the one carried forward.
  const ySeen = new Set<string>();
  const yesterday: NoteObs[] = roundEntries
    .filter((e) => istDayKey(e.recorded_at) === yKey)
    .sort((a, b) => b.recorded_at.localeCompare(a.recorded_at))
    .flatMap((e) => e.observations)
    .filter((o) => {
      const k = `${o.kind}:${o.label.toLowerCase().trim()}`;
      if (ySeen.has(k)) return false;
      ySeen.add(k);
      return true;
    })
    .map((o) => ({ kind: o.kind, label: o.label, value: o.value_text }));

  // A default for the Assessment card, so a routine round is one fewer tap. Only offered when
  // a round actually happened today (a vital or a sign was recorded) AND nothing on it reads
  // as concerning — a red-flagged job, or a word like "deteriorating" / "resuture" / "ICU" in
  // any line. The resident still sees it, edits it, and signs the sheet by hand; a blank is
  // safer than a wrong "Satisfactory", so anything doubtful falls back to no suggestion.
  const roundHappened = todaysRaw.some((o) => o.kind === "vital" || o.kind === "exam");
  const concerning = todaysRaw.some(
    (o) =>
      o.urgency === "red" ||
      /\b(deteriorat|worsen|unwell|septic|sepsis|shock|re-?explor|re-?sutur|resutur|burst|dehisc|icu|hdu|critical|peritonit|collapse|arrest)\b/i.test(
        `${o.label} ${o.value_text ?? ""}`
      )
  );
  const suggestedAssessment = roundHappened && !concerning ? "Satisfactory" : "";

  const dateLabel = new Date().toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "short",
  });

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
      <header className="flex items-baseline justify-between gap-3 px-4 pb-3 pt-6">
        <Link href={`/patients/${id}`} className="text-[17px] text-accent">
          ‹ Patient
        </Link>
        <p className="truncate text-[13px] text-muted">
          Today&rsquo;s note · {stripPatientHonorific(patient.display_name)}
          {patient.bed ? ` · bed ${patient.bed}` : ""}
        </p>
      </header>

      <NoteWorkspace
        patientId={id}
        dateLabel={dateLabel}
        observations={observations}
        yesterday={yesterday}
        currentMeds={currentMeds}
        suggestedAssessment={suggestedAssessment}
      />
    </div>
  );
}
