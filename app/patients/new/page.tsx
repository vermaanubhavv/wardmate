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
        <p className="rounded-[10px] bg-warn-bg px-4 py-3 text-subhead text-warn-fg">No ward found for your account.</p>
        <Link href="/ward" className="mt-4 inline-block text-subhead text-muted underline">
          Back
        </Link>
      </main>
    );
  }

  // The unit's department decides which checklist rows the form offers and whether it asks
  // for a chemotherapy cycle at all.
  // The suggestions need only the ward, so they do not wait behind the department read.
  const packP = getWardSpecialtyStored(ward.id).then(getSpecialtyPack);
  const [suggestions, pack, templateChoices] = await Promise.all([
    getDiagnosisSuggestions(ward.id),
    packP,
    packP.then((p) => listTemplateChoices(p.key)),
  ]);

  return (
    <main className="flex-1 px-6 py-10 flex flex-col gap-6 max-w-md mx-auto w-full">
      <header>
        <h1 className="ios-large-title">Add patient</h1>
        <p className="mt-1 text-subhead text-muted">to {ward.name}</p>
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
