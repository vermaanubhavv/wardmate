import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getActivePatients } from "@/lib/ward";
import { dayLabel } from "@/lib/patients";
import Recorder from "./recorder";
import { confirmObservation } from "./actions";

type Observation = {
  id: string;
  kind: string;
  label: string;
  value_text: string | null;
  unit: string | null;
  source_quote: string;
  needs_confirmation: boolean;
  confirmed_at: string | null;
  conflict_note: string | null;
  recorded_at: string;
};

type Entry = {
  id: string;
  source: "voice" | "photo" | "manual";
  transcript: string | null;
  recorded_at: string;
  extraction_error: string | null;
  observations: Observation[];
};

export default async function PatientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: patient } = await supabase
    .from("current_patients")
    .select(
      "id, ward_id, display_name, bed, primary_diagnosis, admitted_on, surgery_date, post_op_day, admission_day, status"
    )
    .eq("id", id)
    .maybeSingle();

  if (!patient) notFound();

  // The next bed in walking order, so finishing one patient and starting the next is one tap
  // rather than a trip back through the ward list.
  const { patients: ward } = await getActivePatients(patient.ward_id);
  const here = ward.findIndex((p) => p.id === patient.id);
  const next = here >= 0 ? ward[here + 1] : undefined;
  const position = here >= 0 ? `${here + 1} of ${ward.length}` : null;

  const { data: entriesData } = await supabase
    .from("entries")
    .select(
      "id, source, transcript, recorded_at, extraction_error, observations(id, kind, label, value_text, unit, source_quote, needs_confirmation, confirmed_at, conflict_note, recorded_at)"
    )
    .eq("patient_id", id)
    .order("recorded_at", { ascending: false });

  const entries = (entriesData ?? []) as unknown as Entry[];

  // Yesterday's state, already loaded: the most recent value for each thing, so the resident
  // arrives at the bedside knowing where the patient was left rather than reconstructing it.
  const latest = new Map<string, Observation>();
  for (const entry of entries) {
    for (const obs of entry.observations) {
      const key = `${obs.kind}:${obs.label}`;
      if (!latest.has(key)) latest.set(key, obs);
    }
  }
  const current = [...latest.values()].filter((o) => o.kind !== "note");
  const pending = entries.flatMap((e) =>
    e.observations.filter((o) => o.needs_confirmation && !o.confirmed_at)
  );

  return (
    <div className="flex-1 flex flex-col max-w-md mx-auto w-full">
      <header className="px-6 pt-8 pb-4">
        <div className="flex items-center justify-between gap-3">
          <Link href="/" className="text-sm text-muted underline underline-offset-4">
            ← Ward
          </Link>
          {position && <span className="text-xs text-muted tabular-nums">{position}</span>}
        </div>
        <div className="mt-3 flex items-baseline justify-between gap-3">
          <h1 className="text-2xl font-semibold tracking-tight truncate">
            {patient.display_name}
          </h1>
          <span className="shrink-0 text-sm text-muted tabular-nums">
            {dayLabel(patient)}
          </span>
        </div>
        <p className="text-muted text-sm mt-0.5">
          Bed {patient.bed} · {patient.primary_diagnosis || "No diagnosis recorded"}
        </p>
      </header>

      {pending.length > 0 && (
        <section className="px-6 pb-6">
          <p className="text-sm text-amber-200 mb-2">
            {pending.length} to confirm before handover
          </p>
          <ul className="flex flex-col gap-2">
            {pending.map((o) => (
              <li
                key={o.id}
                className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-3"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-sm">
                    <span className="text-muted">{o.label}</span>{" "}
                    <span className="font-medium">{o.value_text}</span>
                  </span>
                  <form action={confirmObservation}>
                    <input type="hidden" name="observation_id" value={o.id} />
                    <input type="hidden" name="patient_id" value={patient.id} />
                    <button className="shrink-0 rounded-lg bg-amber-400 px-3 py-1.5 text-xs font-semibold text-slate-900">
                      Correct
                    </button>
                  </form>
                </div>
                <p className="mt-1.5 text-xs text-amber-200/70 italic">“{o.source_quote}”</p>
                {o.conflict_note && (
                  <p className="mt-1 text-xs text-amber-100">{o.conflict_note}</p>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {current.length > 0 && (
        <section className="px-6 pb-6">
          <p className="text-sm text-muted mb-2">Where things stand</p>
          <ul className="rounded-xl border border-line bg-card divide-y divide-line">
            {current.map((o) => (
              <li key={o.id} className="flex items-baseline justify-between gap-3 px-4 py-2.5">
                <span className="text-sm text-muted">{o.label}</span>
                <span className="text-sm text-right">{o.value_text}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Bottom padding clears the fixed speak bar so the oldest entry stays reachable. */}
      <section className="px-6 pb-56">
        <p className="text-sm text-muted mb-2">Record</p>
        {entries.length === 0 ? (
          <p className="rounded-xl border border-line bg-card p-5 text-sm text-muted">
            Nothing recorded yet. Hold the button above and say what has changed.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {entries.map((entry) => (
              <li key={entry.id} className="rounded-xl border border-line bg-card p-4">
                <p className="text-xs text-muted">
                  {new Date(entry.recorded_at).toLocaleString("en-IN", {
                    day: "numeric",
                    month: "short",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </p>

                {entry.observations.length > 0 && (
                  <ul className="mt-2 flex flex-col gap-1.5">
                    {entry.observations.map((o) => (
                      <li key={o.id} className="text-sm">
                        <span className="text-muted">{o.label}:</span> {o.value_text}
                      </li>
                    ))}
                  </ul>
                )}

                {entry.extraction_error && (
                  <p className="mt-2 text-xs text-amber-200">
                    Could not be structured — the words below are what was heard.
                  </p>
                )}

                {/* The evidence, one tap away, for anything on screen. */}
                {entry.transcript && (
                  <details className="mt-2">
                    <summary className="text-xs text-muted cursor-pointer">
                      What you said
                    </summary>
                    <p className="mt-1.5 text-xs text-muted italic leading-relaxed">
                      {entry.transcript}
                    </p>
                  </details>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Fixed, so the button is under your thumb no matter how long the record has grown. */}
      <div className="fixed bottom-0 inset-x-0 bg-gradient-to-t from-background via-background to-transparent pt-10 pb-8 px-6">
        <div className="mx-auto max-w-md flex flex-col gap-3">
          <Recorder patientId={patient.id} />
          {next ? (
            <Link
              href={`/patients/${next.id}`}
              className="flex items-center justify-between rounded-xl border border-line bg-card px-4 py-3 text-sm active:opacity-70"
            >
              <span className="text-muted">Next bed</span>
              <span className="truncate">
                <span className="font-mono">{next.bed}</span> · {next.display_name} →
              </span>
            </Link>
          ) : (
            <Link
              href="/"
              className="rounded-xl border border-line px-4 py-3 text-center text-sm text-muted active:opacity-70"
            >
              Last bed — back to ward
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
