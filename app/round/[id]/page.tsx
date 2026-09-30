import ScreenHeader from "../../screen-header";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { stripPatientHonorific } from "@/lib/patients";
import { getActivePatients } from "@/lib/ward";
import { patientName } from "@/lib/patients";
import { matchBed, matchFreeBed } from "@/lib/match-bed";
import type { DraftSegment } from "@/lib/round-draft";
import { applyRound, discardRound } from "./actions";
import { ConfirmSubmit } from "../../action-sheet";
import BottomBar from "../../bottom-bar";
import SaveButton from "./save-button";

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
      <main className="flex-1 max-w-md mx-auto w-full">
        <ScreenHeader
          title="Already dealt with"
          subtitle={`This dictation was ${dictation.status === "applied" ? "applied" : "discarded"}.`}
        />
      </main>
    );
  }

  return (
    <div className="flex-1 flex flex-col max-w-md mx-auto w-full">
      <ScreenHeader
        title="Check before saving"
        subtitle="Nothing has been written yet. Check each bed is the patient you meant, then save."
      >
        <details className="mt-3">
          <summary className="min-h-11 text-footnote text-muted cursor-pointer">What you said</summary>
          <p className="mt-1.5 text-footnote text-muted italic leading-relaxed">
            {dictation.transcript}
          </p>
        </details>
      </ScreenHeader>

      <form id="round-form" action={applyRound} className="flex-1 flex flex-col">
        <input type="hidden" name="dictation_id" value={dictation.id} />

        <section className="px-4 pb-[var(--bar-height)] flex flex-col gap-4">
          {segments.length === 0 ? (
            // No bed was recognised. The words are kept rather than lost: file them all to one
            // patient (as they were said, nothing structured out of them), or discard.
            <div className="ios-group p-4 text-subhead">
              <p className="text-muted">
                No bed number was recognised, so this could not be split by bed. Nothing is lost —
                here is what you said.
              </p>
              <p className="mt-3 text-footnote italic leading-relaxed">&ldquo;{dictation.transcript}&rdquo;</p>
              {patients.length > 0 ? (
                <label className="mt-4 flex flex-col gap-2">
                  <span className="text-footnote text-muted">Save all of it, word for word, to</span>
                  <select
                    name="whole_patient"
                    required
                    defaultValue=""
                    className="w-full rounded-[10px] border border-line bg-card px-3 py-2.5 text-subhead outline-none focus:border-accent"
                  >
                    <option value="" disabled>
                      Choose a patient…
                    </option>
                    {patients.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.bed} · {stripPatientHonorific(p.display_name)}
                      </option>
                    ))}
                  </select>
                </label>
              ) : (
                <p className="mt-4 text-footnote text-muted">
                  There are no patients on this ward yet.{" "}
                  <Link href="/patients/new" className="text-accent">Add one</Link> — this dictation
                  waits on the ward list until you come back to it.
                </p>
              )}
              <p className="mt-4 text-footnote text-muted">
                Next time, say the bed before each instruction — &ldquo;bed 4, repeat bloods tomorrow&rdquo; —
                and it is split for you.
              </p>
            </div>
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

      </form>

      {/* Discard is its own form, so it cannot be reached by pressing enter inside the one
          above; the save button reaches its form by id. Both sit in the one bottom bar. */}
      <BottomBar>
        <div className="flex gap-3">
          <form action={discardRound} className="flex-1">
            <input type="hidden" name="dictation_id" value={dictation.id} />
            <ConfirmSubmit
              title="Discard this dictation?"
              message="Nothing from it is written to any patient. The recording is not kept."
              action="Discard dictation"
              className="btn btn-destructive w-full"
            >
              Discard
            </ConfirmSubmit>
          </form>
          <SaveButton form="round-form" />
        </div>
      </BottomBar>
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
        (sure ? "border-line" : "border-warn-fg/30 bg-warn-bg")
      }
    >
      <div className="flex items-baseline gap-2">
        <span className="shrink-0 rounded-md bg-chip px-2 py-1 font-mono text-footnote">
          bed {segment.bed || "?"}
        </span>
        {matched ? (
          <span className="truncate text-body font-medium">{patientName(matched)}</span>
        ) : (
          <span className="text-subhead text-warn-fg">Which patient?</span>
        )}
      </div>

      {/* The words, always. Every value below came out of this sentence. */}
      <p className="mt-2 text-subhead italic text-muted">“{segment.text}”</p>

      {segment.observations.length > 0 && (
        <ul className="mt-3 flex flex-col gap-1">
          {segment.observations.map((o, k) => (
            <li key={k} className="text-subhead">
              {/* Numbers, drugs and doses stay amber: nothing here has been confirmed yet. */}
              <span className="text-muted">{o.label}:</span>{" "}
              <span className={o.needs_confirmation || o.value_num != null ? "text-warn-fg" : undefined}>
                {o.value_text}
              </span>
            </li>
          ))}
        </ul>
      )}

      {segment.observations.length === 0 && (
        <p className="mt-3 text-footnote text-muted">
          Nothing could be structured from this — the words above will be saved as they are.
        </p>
      )}

      {(match.note || segment.uncertain) && (
        <p className="mt-3 text-footnote text-warn-fg">
          {match.note}
          {segment.uncertain &&
            (match.note ? " " : "") + "The recording was unclear here — check it carefully."}
        </p>
      )}

      <label className="mt-3 flex flex-col gap-2">
        <span className="text-footnote text-muted">Save this to</span>
        {/* A sure match is preselected. Anything else must be chosen — a patient, or
            "Don't save this one" — before Save works. It used to default to "Do not save",
            so tapping Save silently dropped every unclear bed while the card still looked
            filled in. Never a guessed patient: the choice is the resident's. */}
        <select
          name={`patient_${index}`}
          required
          defaultValue={sure ? (match.patientId ?? "") : ""}
          className={
            "w-full rounded-[10px] border bg-card px-3 py-2.5 text-subhead outline-none focus:border-accent " +
            (sure ? "border-line" : "border-warn-fg/50")
          }
        >
          <option value="" disabled>
            Choose — the app is not sure who this is
          </option>
          <option value="skip">Don&apos;t save this one</option>
          {patients.map((p) => (
            <option key={p.id} value={p.id}>
              {p.bed} · {stripPatientHonorific(p.display_name)}
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
        <span className="text-body font-medium text-accent">New patient</span>
        <label className="flex items-center gap-2 text-footnote text-muted">
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

      <p className="mt-2 text-subhead italic text-muted">“{segment.text}”</p>

      {free.note && <p className="mt-3 text-footnote text-warn-fg">{free.note}</p>}

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
            <span className="text-footnote text-muted">Sex</span>
            <select
              name={`sex_${index}`}
              defaultValue={details?.sex ?? ""}
              className="w-full rounded-[10px] border border-line bg-card px-3 py-2.5 text-subhead outline-none focus:border-accent"
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

      <p className="mt-3 text-footnote text-muted">
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
      <span className="text-footnote text-muted">{label}</span>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        className="w-full rounded-[10px] border border-line bg-card px-3 py-2.5 text-subhead outline-none focus:border-accent"
      />
    </label>
  );
}
