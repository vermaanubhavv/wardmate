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
        <h1 className="ios-large-title">Already dealt with</h1>
        <p className="mt-3 text-[15px] text-muted">
          This dictation was {dictation.status === "applied" ? "applied" : "discarded"}.
        </p>
        <Link href="/ward" className="mt-6 inline-block text-[17px] text-accent">
          ‹ Ward
        </Link>
      </main>
    );
  }

  return (
    <div className="flex-1 flex flex-col max-w-md mx-auto w-full">
      <header className="px-6 pt-8 pb-4">
        <Link href="/ward" className="text-[17px] text-accent">
          ‹ Ward
        </Link>
        <h1 className="mt-3 ios-large-title">Check before saving</h1>
        <p className="mt-1 text-[15px] text-muted">
          Nothing has been written yet. Check each bed is the patient you meant, then save.
        </p>

        <details className="mt-3">
          <summary className="text-[13px] text-muted cursor-pointer">What you said</summary>
          <p className="mt-1.5 text-[13px] text-muted italic leading-relaxed">
            {dictation.transcript}
          </p>
        </details>
      </header>

      <form action={applyRound} className="flex-1 flex flex-col">
        <input type="hidden" name="dictation_id" value={dictation.id} />

        <section className="px-6 pb-48 flex flex-col gap-4">
          {segments.length === 0 ? (
            <p className="ios-group p-6 text-[15px] text-muted">
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
              className="w-full rounded-[10px] bg-accent px-4 py-3 text-[17px] font-semibold text-accent-ink"
            >
              Save the ticked ones
            </button>
          </BottomBar>
      </form>

      {/* Its own form, so discarding cannot be reached by pressing enter inside the one above. */}
      <form action={discardRound} className="px-6 pb-10 -mt-32 relative z-10">
        <input type="hidden" name="dictation_id" value={dictation.id} />
        <button className="w-full rounded-[10px] bg-card px-4 py-3 text-[15px] text-muted">
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
        "rounded-[10px] border bg-card p-4 " +
        (sure ? "border-line" : "border-orange-200 bg-orange-50")
      }
    >
      <div className="flex items-baseline gap-2">
        <span className="shrink-0 rounded-md bg-chip px-2 py-1 font-mono text-[13px]">
          bed {segment.bed || "?"}
        </span>
        {matched ? (
          <span className="truncate text-[17px] font-medium">{patientName(matched)}</span>
        ) : (
          <span className="text-[15px] text-orange-700">Which patient?</span>
        )}
      </div>

      {/* The words, always. Every value below came out of this sentence. */}
      <p className="mt-2 text-sm italic text-muted">“{segment.text}”</p>

      {segment.observations.length > 0 && (
        <ul className="mt-3 flex flex-col gap-1">
          {segment.observations.map((o, k) => (
            <li key={k} className="text-[15px]">
              <span className="text-muted">{o.label}:</span> {o.value_text}
            </li>
          ))}
        </ul>
      )}

      {segment.observations.length === 0 && (
        <p className="mt-3 text-[13px] text-muted">
          Nothing could be structured from this — the words above will be saved as they are.
        </p>
      )}

      {(match.note || segment.uncertain) && (
        <p className="mt-3 text-[13px] text-orange-700">
          {match.note}
          {segment.uncertain &&
            (match.note ? " " : "") + "The recording was unclear here — check it carefully."}
        </p>
      )}

      <label className="mt-3 flex flex-col gap-2">
        <span className="text-[13px] text-muted">Save this to</span>
        <select
          name={`patient_${index}`}
          defaultValue={sure ? (match.patientId ?? "") : ""}
          className="w-full rounded-[10px] border border-line bg-card px-3 py-2.5 text-[15px] outline-none focus:border-accent"
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
    <div className="rounded-[10px] border border-accent/40 bg-card p-4">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-[17px] font-medium text-accent">New patient</span>
        <label className="flex items-center gap-2 text-[13px] text-muted">
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

      {free.note && <p className="mt-3 text-[13px] text-orange-700">{free.note}</p>}

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
            <span className="text-[13px] text-muted">Sex</span>
            <select
              name={`sex_${index}`}
              defaultValue={details?.sex ?? ""}
              className="w-full rounded-[10px] border border-line bg-card px-3 py-2.5 text-[15px] outline-none focus:border-accent"
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

      <p className="mt-3 text-[13px] text-muted">
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
      <span className="text-[13px] text-muted">{label}</span>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        className="w-full rounded-[10px] border border-line bg-card px-3 py-2.5 text-[15px] outline-none focus:border-accent"
      />
    </label>
  );
}
