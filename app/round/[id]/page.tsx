import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getActivePatients } from "@/lib/ward";
import { patientName } from "@/lib/patients";
import { matchBed, matchFreeBed } from "@/lib/match-bed";
import type { DraftSegment } from "@/lib/round-draft";
import { applyRound, discardRound } from "./actions";
import BottomBar from "../../bottom-bar";

type WardPatient = {
  id: string;
  display_name: string;
  bed: string;
  age_years: number | null;
  sex: string | null;
};

export default async function RoundReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: dictation } = await supabase
    .from("round_dictations")
    .select("id, ward_id, transcript, raw, status, created_at")
    .eq("id", id)
    .maybeSingle();

  if (!dictation) notFound();

  const segments = ((dictation.raw as { segments?: DraftSegment[] } | null)?.segments ??
    []) as DraftSegment[];

  const { patients } = await getActivePatients(dictation.ward_id);

  if (dictation.status !== "draft") {
    return (
      <main className="flex-1 px-6 py-10 max-w-md mx-auto w-full">
        <h1 className="text-2xl font-semibold">Already dealt with</h1>
        <p className="mt-3 text-sm text-muted">
          This dictation was {dictation.status === "applied" ? "applied" : "discarded"}.
        </p>
        <Link href="/" className="mt-6 inline-block text-sm text-accent underline">
          ← Ward
        </Link>
      </main>
    );
  }

  return (
    <div className="flex-1 flex flex-col max-w-md mx-auto w-full">
      <header className="px-6 pt-8 pb-4">
        <Link href="/" className="text-sm text-muted underline underline-offset-4">
          ← Ward
        </Link>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight">Check before saving</h1>
        <p className="mt-1 text-sm text-muted">
          Nothing has been written yet. Check each bed is the patient you meant, then save.
        </p>

        <details className="mt-3">
          <summary className="text-xs text-muted cursor-pointer">What you said</summary>
          <p className="mt-1.5 text-xs text-muted italic leading-relaxed">
            {dictation.transcript}
          </p>
        </details>
      </header>

      <form action={applyRound} className="flex-1 flex flex-col">
        <input type="hidden" name="dictation_id" value={dictation.id} />

        <section className="px-6 pb-48 flex flex-col gap-4">
          {segments.length === 0 ? (
            <p className="rounded-xl border border-line bg-card p-6 text-sm text-muted">
              No beds were recognised in that recording.
            </p>
          ) : (
            segments.map((segment, i) =>
              segment.intent === "new_patient" ? (
                <AdmitCard key={i} segment={segment} index={i} patients={patients} />
              ) : (
                <UpdateCard key={i} segment={segment} index={i} patients={patients} />
              )
            )
          )}
        </section>

        <BottomBar>
          
            <button
              type="submit"
              className="w-full rounded-xl bg-accent px-4 py-4 text-base font-semibold text-accent-ink"
            >
              Save the ticked ones
            </button>
          </BottomBar>
      </form>

      {/* Its own form, so discarding cannot be reached by pressing enter inside the one above. */}
      <form action={discardRound} className="px-6 pb-10 -mt-32 relative z-10">
        <input type="hidden" name="dictation_id" value={dictation.id} />
        <button className="w-full rounded-xl border border-line px-4 py-3 text-sm text-muted">
          Discard all of it
        </button>
      </form>
    </div>
  );
}

/** An instruction for somebody already on the ward. */
function UpdateCard({
  segment,
  index,
  patients,
}: {
  segment: DraftSegment;
  index: number;
  patients: WardPatient[];
}) {
  // Re-matched against the ward as it stands now, not as it stood when the recording was
  // made, so a bed that changed in between cannot silently send this to the wrong person.
  const match = matchBed(segment.bed, patients);
  const sure = match.status === "matched" && !segment.uncertain;
  const matched = patients.find((p) => p.id === match.patientId);

  return (
    <div
      className={
        "rounded-xl border bg-card p-4 " +
        (sure ? "border-line" : "border-amber-200 bg-amber-50")
      }
    >
      <div className="flex items-baseline gap-2">
        <span className="shrink-0 rounded-lg bg-chip px-2 py-1 font-mono text-xs">
          bed {segment.bed || "?"}
        </span>
        {matched ? (
          <span className="truncate text-sm font-medium">{patientName(matched)}</span>
        ) : (
          <span className="text-sm text-amber-700">Which patient?</span>
        )}
      </div>

      {/* The words, always. Every value below came out of this sentence. */}
      <p className="mt-2 text-sm italic text-muted">“{segment.text}”</p>

      {segment.observations.length > 0 && (
        <ul className="mt-3 flex flex-col gap-1">
          {segment.observations.map((o, k) => (
            <li key={k} className="text-sm">
              <span className="text-muted">{o.label}:</span> {o.value_text}
            </li>
          ))}
        </ul>
      )}

      {segment.observations.length === 0 && (
        <p className="mt-3 text-xs text-muted">
          Nothing could be structured from this — the words above will be saved as they are.
        </p>
      )}

      {(match.note || segment.uncertain) && (
        <p className="mt-3 text-xs text-amber-700">
          {match.note}
          {segment.uncertain &&
            (match.note ? " " : "") + "The recording was unclear here — check it carefully."}
        </p>
      )}

      <label className="mt-3 flex flex-col gap-2">
        <span className="text-xs text-muted">Save this to</span>
        <select
          name={`patient_${index}`}
          defaultValue={sure ? (match.patientId ?? "") : ""}
          className="w-full rounded-lg border border-line bg-background px-3 py-3 text-sm outline-none focus:border-accent"
        >
          {/* Nothing selected means nothing is written for this bed, which is the safe
              default whenever the app is not certain who was meant. */}
          <option value="">Do not save this one</option>
          {patients.map((p) => (
            <option key={p.id} value={p.id}>
              {p.bed} · {p.display_name}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}

/** Somebody being admitted. Shown as editable boxes, because a name heard across a ward is
 *  exactly the thing to correct before it becomes a patient. */
function AdmitCard({
  segment,
  index,
  patients,
}: {
  segment: DraftSegment;
  index: number;
  patients: WardPatient[];
}) {
  const free = matchFreeBed(segment.bed, patients);
  const details = segment.new_patient;

  return (
    <div className="rounded-xl border border-accent/40 bg-card p-4">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-sm font-medium text-accent">New patient</span>
        <label className="flex items-center gap-2 text-xs text-muted">
          <input
            type="checkbox"
            name={`admit_${index}`}
            value="yes"
            defaultChecked={free.status === "free"}
            className="h-5 w-5 accent-accent"
          />
          Admit
        </label>
      </div>

      <p className="mt-2 text-sm italic text-muted">“{segment.text}”</p>

      {free.note && <p className="mt-3 text-xs text-amber-700">{free.note}</p>}

      <div className="mt-3 flex flex-col gap-3">
        <Box label="Bed" name={`bed_${index}`} defaultValue={segment.bed} />
        <Box label="Name" name={`name_${index}`} defaultValue={details?.name ?? ""} />

        <div className="flex gap-3">
          <Box
            label="Age"
            name={`age_${index}`}
            defaultValue={details?.age_years != null ? String(details.age_years) : ""}
            type="number"
          />
          <label className="flex flex-1 flex-col gap-1">
            <span className="text-xs text-muted">Sex</span>
            <select
              name={`sex_${index}`}
              defaultValue={details?.sex ?? ""}
              className="w-full rounded-lg border border-line bg-background px-3 py-3 text-sm outline-none focus:border-accent"
            >
              <option value="">—</option>
              <option value="M">M</option>
              <option value="F">F</option>
              <option value="other">Other</option>
            </select>
          </label>
        </div>

        <Box
          label="Diagnosis"
          name={`diagnosis_${index}`}
          defaultValue={details?.diagnosis ?? ""}
        />
      </div>

      <p className="mt-3 text-xs text-muted">
        Anything you were not heard to say is left blank rather than guessed. Admitted today.
      </p>
    </div>
  );
}

function Box({
  label,
  name,
  defaultValue,
  type = "text",
}: {
  label: string;
  name: string;
  defaultValue: string;
  type?: string;
}) {
  return (
    <label className="flex flex-1 flex-col gap-1">
      <span className="text-xs text-muted">{label}</span>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        className="w-full rounded-lg border border-line bg-background px-3 py-3 text-sm outline-none focus:border-accent"
      />
    </label>
  );
}
