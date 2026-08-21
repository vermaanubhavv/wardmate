import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentWard } from "@/lib/ward";
import { compareBeds, patientName } from "@/lib/patients";
import { restoreFromTrash } from "../../patients/actions";

type TrashedPatient = {
  id: string;
  display_name: string;
  age_years: number | null;
  sex: string | null;
  bed: string;
  primary_diagnosis: string | null;
  trashed_at: string | null;
};

const TRASH_DAYS = 7;

/**
 * Patients deleted from the ward, recoverable until seven days after they landed here.
 */
export default async function TrashPage() {
  const { ward, error } = await getCurrentWard();

  if (error || !ward) {
    return (
      <main className="flex-1 px-6 py-10 max-w-md mx-auto w-full">
        <h1 className="ios-large-title">Trash</h1>
        <p className="mt-4 ios-group px-4 py-3 text-[15px] text-orange-700">
          {error ? `Could not read the database: ${error.message}` : "No ward found."}
        </p>
      </main>
    );
  }

  const supabase = await createClient();

  // A scheduled job performs deletion on time; this is an additional harmless cleanup for
  // records that expired before that job was configured.
  await supabase.rpc("purge_expired_trash");

  const { data } = await supabase
    .from("patients")
    .select("id, display_name, age_years, sex, bed, primary_diagnosis, trashed_at")
    .eq("ward_id", ward.id)
    .eq("status", "trashed")
    .order("trashed_at", { ascending: false });

  const patients = ((data ?? []) as TrashedPatient[])
    .slice()
    .sort((a, b) => compareBeds(a.bed, b.bed));

  return (
    <div className="flex-1 flex flex-col max-w-md mx-auto w-full">
      <header className="px-6 pt-8 pb-4">
        <Link href="/unit" className="text-[17px] text-accent">
          ‹ Unit
        </Link>
        <h1 className="mt-3 ios-large-title">Trash</h1>
        <p className="mt-0.5 text-[15px] text-muted">
          Deleted from the ward. Kept here for {TRASH_DAYS} days in case that was a mistake,
          then deleted permanently.
        </p>
      </header>

      <section className="px-6 pb-16 flex flex-col gap-3">
        {patients.length === 0 ? (
          <p className="ios-group p-6 text-[15px] text-muted">Nothing is in the trash.</p>
        ) : (
          patients.map((p) => <TrashCard key={p.id} patient={p} />)
        )}
      </section>
    </div>
  );
}

function daysLeft(trashedAt: string | null): number {
  if (!trashedAt) return TRASH_DAYS;
  const elapsedMs = Date.now() - new Date(trashedAt).getTime();
  const remaining = TRASH_DAYS - elapsedMs / 86_400_000;
  return Math.max(0, Math.ceil(remaining));
}

function TrashCard({ patient }: { patient: TrashedPatient }) {
  const left = daysLeft(patient.trashed_at);

  return (
    <div className="ios-group p-4">
      <div className="flex items-baseline gap-2">
        <span className="shrink-0 rounded-md bg-chip px-2 py-1 font-mono text-[13px]">
          {patient.bed}
        </span>
        <span className="truncate text-[17px] font-medium">{patientName(patient)}</span>
      </div>
      <p className="mt-0.5 truncate text-[15px] text-muted">
        {patient.primary_diagnosis || "No diagnosis recorded"}
      </p>
      <p className="mt-1 text-[13px] text-orange-700">
        {left === 0
          ? "Deleted for good very soon."
          : `${left} ${left === 1 ? "day" : "days"} left to recover this patient.`}
      </p>

      <form action={restoreFromTrash} className="mt-3">
        <input type="hidden" name="patient_id" value={patient.id} />
        <button className="w-full rounded-[10px] bg-accent px-4 py-3 text-[17px] font-semibold text-accent-ink">
          Restore to ward
        </button>
      </form>
    </div>
  );
}
