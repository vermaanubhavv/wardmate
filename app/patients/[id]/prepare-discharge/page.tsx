import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Prepare from "./prepare";
import { BackBar } from "@/app/screen-header";

/**
 * "Prepare discharge" — the patient's papers photographed, read, checked, and turned into the
 * record the discharge summary is already built from.
 *
 * Nothing new writes the summary. The summary has always been assembled from observations, so
 * the work here is getting what is on the paper INTO observations, through the same pipeline a
 * spoken note goes through. That is why a photographed operation note ends up traceable: one
 * tap on the (i) shows the line of the page it came from.
 */
export default async function PrepareDischargePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: patient } = await supabase
    .from("current_patients")
    .select("id, display_name, bed")
    .eq("id", id)
    .maybeSingle();

  if (!patient) notFound();

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-6 pb-16 pt-8">
      <BackBar href={`/patients/${id}/discharge`} label="Discharge summary" className="-mx-6 -mt-8" />
      <h1 className="mt-4 ios-large-title text-title1 leading-tight">Add investigation reports</h1>
      <p className="mt-1 text-subhead text-muted">
        {patient.display_name}
        {patient.bed ? ` · bed ${patient.bed}` : ""}
      </p>

      <div className="mt-6">
        <Prepare patientId={id} />
      </div>
    </div>
  );
}
