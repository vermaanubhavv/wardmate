import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { istDayKey, type Observation } from "@/lib/patient-state";
import { buildProgressNote, formatProgressNoteText } from "@/lib/progress-note";
import { getWardFormats } from "@/lib/formats";
import { getWardLabRanges } from "@/lib/ward-lab-ranges";
import { MANAGEMENT_CHOICES } from "@/lib/patients";
import { getProcedureLabels, procedureFor } from "@/lib/templates";
import CopyNoteButton from "./copy-button";
import PrintButton from "./print-button";
import OverlayNote from "./overlay-note";
import { renderNoteLine } from "./note-line";

/**
 * Today's progress sheet, laid out the way the unit's own paper form is — see the ESIC form the
 * user photographed: letterhead, Name/UHID/Age/Sex, DOA/Unit/Bed/IPD, then Date & Time /
 * Observation / Investigation-Treatment-Management.
 *
 * Everything printed on it is either recorded fact or a blank line — the same rule
 * lib/discharge.ts follows, for the same reason. This is meant to be signed by hand and filed
 * as the day's real progress note, so the one thing worse than a blank field is a filled-in one
 * that was never actually said. The asterisk at the bottom exists because of that: an unsigned
 * printout is a draft, not a record, and it says so on the page itself.
 */
export default async function ProgressNotePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: patient } = await supabase
    .from("current_patients")
    .select(
      "id, ward_id, display_name, age_years, sex, bed, uhid_ip_no, mrd_no, primary_diagnosis, admitted_on, surgery_date, post_op_day, admission_day, management, procedure_text, template_family, template_variant"
    )
    .eq("id", id)
    .maybeSingle();

  if (!patient) notFound();

  const [{ data: wardRow }, { data: entriesData }, wardFormats, { data: profile }, procedures, wardRanges] =
    await Promise.all([
      supabase.from("wards").select("name").eq("id", patient.ward_id).maybeSingle(),
      supabase
        .from("entries")
        .select(
          "recorded_at, is_case_history, observations(id, kind, label, value_text, value_num, unit, source_quote, needs_confirmation, confirmed_at, conflict_note, done_at, urgency, graded_at, recorded_at, pac_verdict, ref_low, ref_high, ref_text)"
        )
        .eq("patient_id", id)
        // Newest first — buildProgressNote's "latest medication per drug" dedup relies on this
        // exact order, the same way derivePatientState does on the main patient page.
        .order("recorded_at", { ascending: false }),
      getWardFormats(patient.ward_id),
      // The rounding doctor's own department, for "Case seen by" — row security already limits
      // this to the caller's own profile, so no id needs asking for.
      supabase.from("profiles").select("department").maybeSingle(),
      getProcedureLabels(),
      // This ward's own learned lab ranges, for judging a deranged result that has no printed
      // range of its own — see lib/ward-lab-ranges.ts, same source Current progress reads.
      getWardLabRanges(patient.ward_id),
    ]);

  // The unit's own uploaded progress-note form, with its fields detected — see
  // lib/read-form-layout.ts. Used only when there is both an image to overlay onto AND at
  // least one box found on it; anything less falls back to the plain layout below rather than
  // printing text against a blank page with nothing found on it.
  const notesFormat = wardFormats.get("notes");
  const overlayZones = (notesFormat?.layout ?? []).filter((z) => z.role !== "signature");
  const canOverlay = Boolean(notesFormat?.url) && overlayZones.length > 0;

  const entries = (entriesData ?? []) as unknown as {
    recorded_at: string;
    is_case_history: boolean;
    observations: Observation[];
  }[];
  const todayKey = istDayKey(new Date().toISOString());

  // Diagnosis fallback the same way the patient page does: the structured field first, then
  // whatever the case history itself named.
  const caseHistoryDiagnosis = entries
    .filter((e) => e.is_case_history)
    .flatMap((e) => e.observations)
    .find((o) => o.kind === "diagnosis");
  const diagnosis = patient.primary_diagnosis ?? caseHistoryDiagnosis?.value_text ?? null;

  // Only today's round — see lib/progress-note.ts for why a day nobody rounded on this patient
  // must print empty against most of the fixed lines, rather than reaching backward for an
  // older value. Medications are the deliberate exception, drawn from allObservations instead.
  const todaysObservations = entries
    .filter((e) => !e.is_case_history && istDayKey(e.recorded_at) === todayKey)
    .flatMap((e) => e.observations);
  const allObservations = entries.flatMap((e) => e.observations);

  // Pre-op / Post Op Day (N) / Conservative / Workup — the same rule
  // lib/patients.ts managementLabel() uses, kept in sync deliberately rather than reused
  // outright: managementLabel prints "POST OP" alone, and this line needs the day number
  // folded in too. The resident's own choice (patient.management) is what shows before an
  // operative date exists; the moment one does, it is superseded automatically — a Pre-op
  // patient who has since gone to theatre is never still shown as Pre-op.
  const status = patient.surgery_date
    ? `Post Op Day (${patient.post_op_day ?? "—"})`
    : (MANAGEMENT_CHOICES.find((c) => c.value === patient.management)?.label ?? null);

  const note = buildProgressNote(patient, allObservations, todaysObservations, diagnosis, {
    wardName: wardRow?.name ?? null,
    department: profile?.department?.trim() || null,
    status,
    procedure: procedureFor(patient, procedures),
    wardRanges,
  });
  const noteText = formatProgressNoteText(note);

  // Assessment and Issues are the round's wrap-up, printed last in note.observation — split
  // here purely for layout, so the plain page can pin that closing pair to the bottom of the
  // Observation block (see the flex column below) instead of leaving them stranded right under
  // Chest with a page's worth of blank space beneath. Falls back to no split (everything in
  // "top") if that heading is ever missing, so a schema change here never throws.
  const assessmentIndex = note.observation.findIndex((line) => line.startsWith("Assessment -"));
  const observationTop = assessmentIndex === -1 ? note.observation : note.observation.slice(0, assessmentIndex);
  const observationTail = assessmentIndex === -1 ? [] : note.observation.slice(assessmentIndex);

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col bg-background print:max-w-none print:bg-white">
      <header className="px-4 pb-3 pt-6 print:hidden">
        <Link href={`/patients/${id}`} className="text-[17px] text-accent">
          ‹ Patient
        </Link>
        <h1 className="mt-3 ios-large-title">Today&rsquo;s note</h1>
        <p className="mt-1 text-[15px] text-muted">
          Everything below is what was actually recorded today. Blank lines are for what
          wasn&rsquo;t.
        </p>
      </header>

      {canOverlay && (
        <p className="px-4 pb-2 text-[13px] text-muted print:hidden">
          Printed onto your unit&rsquo;s own uploaded form. Best effort from a photograph — check
          the fields land where you expect before you print for real.
        </p>
      )}

      {/* The printable sheet itself. On screen it sits in a bordered card; in print the border
          and screen chrome disappear and this becomes the whole page. */}
      <section className="px-4 pb-4 print:px-0">
        {canOverlay && notesFormat?.url ? (
          <div className="ios-group overflow-hidden print:rounded-none print:border-0 print:shadow-none">
            <OverlayNote note={note} formatUrl={notesFormat.url} zones={overlayZones} />
          </div>
        ) : (
          <div className="ios-group px-5 py-5 text-[16px] leading-relaxed text-black print:rounded-none print:border-0 print:p-0 print:shadow-none">
            <div className="text-center">
              <p className="text-[16px] font-bold uppercase">Progress Sheet</p>
            </div>

            {/* The note's own heading, not a line inside either column — it names who is
                rounding, which applies to the whole sheet below it, so it runs the full width
                on its own line rather than being confined to Observation or the Investigation
                column. */}
            <p className="mt-2 border-b-2 border-black pb-1 text-center text-[15px] font-bold underline">
              {note.caseSeenBy}
            </p>

            <div className="mt-3 border-y border-dashed border-line py-2">
              <p>
                <span className="font-semibold">Name:</span> {note.header.name}
                {note.header.ageSex && <span> &nbsp;({note.header.ageSex})</span>}
              </p>
              <p>
                <span className="font-semibold">UHID:</span>{" "}
                {note.header.uhid || "________________"}
              </p>
              <p>
                <span className="font-semibold">DOA:</span> {note.header.doa}
                <span className="ml-4 font-semibold">Unit:</span> {note.header.unit || "____________"}
                <span className="ml-4 font-semibold">Bed:</span> {note.header.bed}
              </p>
            </div>

            <p className="mt-3 font-semibold tabular-nums">{note.dateTime}</p>

            <div className="mt-3 flex min-h-[520px] flex-col print:min-h-[560px]">
              <p className="text-[12px] font-semibold uppercase tracking-wide text-muted">
                Observation
              </p>
              {note.observation.length > 0 ? (
                <>
                  {/* Assessment and Issues are the wrap-up of the round — pinned to the bottom
                      of this block (mt-auto) rather than sitting bunched right under Chest, so
                      the page's own free space spreads out instead of piling up unused below
                      everything. */}
                  <div>{observationTop.map((line, i) => renderNoteLine(line, i))}</div>
                  <div className="mt-auto">
                    {observationTail.map((line, i) => renderNoteLine(line, `tail-${i}`))}
                  </div>
                </>
              ) : (
                <p className="text-muted">Nothing recorded yet today.</p>
              )}
            </div>

            <div className="mt-3">
              <p className="text-[12px] font-semibold uppercase tracking-wide text-muted">
                Investigation / Treatment / Management
              </p>
              {note.plan.length > 0 ? (
                note.plan.map((line, i) => renderNoteLine(line, i))
              ) : (
                <p className="text-muted">Nothing ordered yet today.</p>
              )}
            </div>

            <div className="mt-6 flex items-end justify-end">
              <div className="w-40 border-b border-line pb-1 text-right text-[13px] text-muted">
                Signature
              </div>
            </div>
          </div>
        )}

        {/* Shown every time, whichever layout rendered above it — the one line the whole page
            exists under. */}
        <p className="mt-3 text-[11px] leading-snug text-muted">
          * This sheet is generated from what was recorded in WardMate. It is a draft, not a
          medical record, until signed by the treating doctor — do not accept or file it
          unsigned.
        </p>
      </section>

      <section className="flex flex-col gap-2 px-4 pb-10 print:hidden">
        <PrintButton />
        <CopyNoteButton text={noteText} />
      </section>
    </div>
  );
}
