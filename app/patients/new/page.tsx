import Link from "next/link";
import { getCurrentWard, getDiagnosisSuggestions, getWardSpecialtyStored } from "@/lib/ward";
import { getSpecialtyPack } from "@/lib/specialty";
import { listTemplateChoices } from "@/lib/templates";
import PatientForm from "./patient-form";

export default async function NewPatientPage() {
  const { ward } = await getCurrentWard();

  if (!ward) {
    return (
      <main className="flex-1 px-6 py-10 max-w-md mx-auto w-full">
        <p className="text-[15px] text-orange-700">No ward found for your account.</p>
        <Link href="/ward" className="mt-4 inline-block text-[15px] text-muted underline">
          Back
        </Link>
      </main>
    );
  }

  // The unit's department decides which checklist rows the form offers and whether it asks
  // for a chemotherapy cycle at all.
  const pack = getSpecialtyPack(await getWardSpecialtyStored(ward.id));

  const [suggestions, templateChoices] = await Promise.all([
    getDiagnosisSuggestions(ward.id),
    listTemplateChoices(pack.pickerPhase),
  ]);

  return (
    <main className="flex-1 px-6 py-10 flex flex-col gap-6 max-w-md mx-auto w-full">
      <header>
        <h1 className="ios-large-title">Add patient</h1>
        <p className="mt-1 text-[15px] text-muted">to {ward.name}</p>
      </header>

      <PatientForm
        wardId={ward.id}
        diagnosisSuggestions={suggestions}
        templateChoices={templateChoices}
        specialty={pack.key}
      />
    </main>
  );
}
