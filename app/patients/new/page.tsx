import Link from "next/link";
import { getCurrentWard, getDiagnosisSuggestions } from "@/lib/ward";
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

  const [suggestions, templateChoices] = await Promise.all([
    getDiagnosisSuggestions(ward.id),
    listTemplateChoices(),
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
      />
    </main>
  );
}
