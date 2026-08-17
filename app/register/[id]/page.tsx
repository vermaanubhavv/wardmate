import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentWard, getActivePatients } from "@/lib/ward";
import { matchRegisterRows } from "@/lib/match-register";
import type { RegisterRow } from "@/lib/read-register";
import { applyRegister, discardRegister } from "./actions";
import BottomBar from "../../bottom-bar";

export default async function RegisterReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: read } = await supabase
    .from("register_reads")
    .select("id, ward_id, photo_path, raw, status")
    .eq("id", id)
    .maybeSingle();

  if (!read) notFound();

  const rows = ((read.raw as { rows?: RegisterRow[] } | null)?.rows ?? []) as RegisterRow[];
  const { ward } = await getCurrentWard();
  const { patients } = await getActivePatients(read.ward_id);
  const matches = matchRegisterRows(rows, patients);

  const { data: signed } = await supabase.storage
    .from("evidence")
    .createSignedUrl(read.photo_path, 3600);

  const autoTicked = matches.filter((m) => m.status === "matched").length;

  return (
    <div className="flex-1 flex flex-col max-w-md mx-auto w-full">
      <header className="px-6 pt-8 pb-4">
        <Link href="/" className="text-[17px] text-accent">
          ‹ Ward
        </Link>
        <h1 className="mt-3 ios-large-title">Review the register</h1>
        <p className="mt-1 text-[15px] text-muted">
          {rows.length} {rows.length === 1 ? "entry" : "entries"} read from the page
          {ward ? ` for ${ward.name}` : ""}.{" "}
          <span className="text-foreground">Nothing is saved until you tap Save.</span>
        </p>
      </header>

      {signed?.signedUrl && (
        <div className="px-6 pb-6">
          <a href={signed.signedUrl} target="_blank" rel="noreferrer">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={signed.signedUrl}
              alt="Photographed round register"
              className="w-full rounded-[10px] border border-line"
            />
            <span className="mt-1 block text-[13px] text-muted">Tap to open full size</span>
          </a>
        </div>
      )}

      {read.status !== "draft" ? (
        <p className="px-6 pb-10 text-[15px] text-muted">
          This register page was already {read.status}.
        </p>
      ) : rows.length === 0 ? (
        <div className="px-6 pb-10">
          <p className="text-[15px] text-muted">
            Nothing could be read from that photo. Try again with the page flatter and more
            light on it.
          </p>
          <form action={discardRegister} className="mt-4">
            <input type="hidden" name="read_id" value={read.id} />
            <button className="text-[17px] text-accent">Discard</button>
          </form>
        </div>
      ) : (
        <form action={applyRegister} className="flex-1 flex flex-col">
          <input type="hidden" name="read_id" value={read.id} />

          <ul className="px-6 pb-48 flex flex-col gap-4">
            {matches.map((m, i) => {
              const clean = m.status === "matched";
              return (
                <li
                  key={i}
                  className={
                    "rounded-[10px] border p-4 " +
                    (clean ? "border-line bg-card" : "border-orange-200 bg-orange-50")
                  }
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="font-medium truncate">
                      {m.row.name || "(no name written)"}
                    </span>
                    {m.row.bed && (
                      <span className="shrink-0 font-mono text-[13px] text-muted">
                        bed {m.row.bed}
                      </span>
                    )}
                  </div>

                  {/* The row as written, always visible — this is what you check the photo
                      against, and it is the only verification there is for a photograph. */}
                  <p className="mt-1 text-[13px] text-muted italic">“{m.row.source_quote}”</p>

                  {m.row.uncertain && (
                    <p className="mt-1.5 text-[13px] text-orange-700">
                      Handwriting unclear — read this one against the photo.
                    </p>
                  )}
                  {m.note && <p className="mt-1.5 text-[13px] text-orange-700">{m.note}</p>}

                  {/* Where this row will go. Only a clean match is pre-selected; everything
                      else starts on "Skip" so nothing lands anywhere by default. */}
                  <label className="mt-3 block">
                    <span className="text-[13px] text-muted">Save to</span>
                    <select
                      name={`patient_${i}`}
                      defaultValue={clean ? (m.patientId ?? "") : ""}
                      className="mt-1 w-full rounded-[10px] border border-line bg-card px-3 py-2.5 text-[15px] outline-none focus:border-accent"
                    >
                      <option value="">Skip this row</option>
                      {/* A register row is often the first the app hears of somebody
                          admitted overnight, so the row itself can admit them rather than
                          being skipped and typed in again from memory. */}
                      <option value="new">+ Add as a new patient</option>
                      {(m.candidates.length > 0 ? m.candidates : patients).map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.bed} · {p.display_name}
                        </option>
                      ))}
                      {m.status === "bed_mismatch" && m.patientId && (
                        <option value={m.patientId}>
                          Use the name match anyway ({m.row.name})
                        </option>
                      )}
                    </select>
                  </label>

                  {/* Shown for every row, used only by "Add as a new patient". Editable
                      because these came off handwriting, and a name read wrong becomes a
                      patient who is wrong from their first day. */}
                  <div className="mt-2 flex gap-2">
                    <label className="flex-1">
                      <span className="text-[13px] text-muted">New patient name</span>
                      <input
                        name={`new_name_${i}`}
                        defaultValue={m.row.name}
                        autoCapitalize="words"
                        className="mt-1 w-full rounded-[10px] border border-line bg-card px-3 py-2.5 text-[15px] outline-none focus:border-accent"
                      />
                    </label>
                    <label className="w-28">
                      <span className="text-[13px] text-muted">Bed</span>
                      <input
                        name={`new_bed_${i}`}
                        defaultValue={m.row.bed}
                        autoCapitalize="characters"
                        className="mt-1 w-full rounded-[10px] border border-line bg-card px-3 py-2.5 text-[15px] outline-none focus:border-accent"
                      />
                    </label>
                  </div>

                  {(m.row.findings.length > 0 || m.row.plans.length > 0) && (
                    <ul className="mt-3 flex flex-col gap-1 text-sm">
                      {m.row.findings.map((f, j) => (
                        <li key={`f${j}`}>
                          <span className="text-muted">{f.label}:</span> {f.value_text}
                        </li>
                      ))}
                      {m.row.plans.map((p, j) => (
                        <li key={`p${j}`} className="text-accent">
                          to do: {p}
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>

          <BottomBar>
            
              <p className="text-[13px] text-muted text-center">
                {autoTicked} of {rows.length} matched automatically. Everything saved is
                flagged for you to confirm.
              </p>
              <button className="w-full rounded-[10px] bg-accent px-4 py-3 text-[17px] font-semibold text-accent-ink">
                Save to the ticked patients
              </button>
            </BottomBar>
        </form>
      )}
    </div>
  );
}
