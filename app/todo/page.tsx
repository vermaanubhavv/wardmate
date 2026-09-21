import Link from "next/link";
import { getCurrentWard } from "@/lib/ward";
import { getWardTasks } from "@/lib/todo";
import { getWardScoringTasks } from "@/lib/scoring/read";
import { createClient } from "@/lib/supabase/server";
import { type WardScoringTask } from "./scoring-section";
import TodoLists from "./todo-lists";
import { stripPatientHonorific } from "@/lib/patients";

export default async function TodoPage() {
  const { ward, error } = await getCurrentWard();

  if (error || !ward) {
    return (
      <main className="flex-1 px-6 py-10 max-w-md mx-auto w-full">
        <h1 className="ios-large-title">To do</h1>
        <p className="mt-4 ios-group px-4 py-3 text-[15px] text-orange-700">
          {error ? `Could not read the database: ${error.message}` : "No ward found."}
        </p>
      </main>
    );
  }

  const tasks = await getWardTasks(ward.id);

  // Score-input to-do items across the unit (inert unless the scoring engine is on for it).
  const scoringByPatient = await getWardScoringTasks(ward.id);
  let scoringTasks: WardScoringTask[] = [];
  if (scoringByPatient.size > 0) {
    const supabase = await createClient();
    const { data: pts } = await supabase
      .from("patients")
      .select("id, bed, display_name")
      .in("id", [...scoringByPatient.keys()]);
    const byId = new Map((pts ?? []).map((p) => [p.id, p]));
    scoringTasks = [...scoringByPatient.values()].flat().map((t) => ({
      ...t,
      bed: byId.get(t.patientId)?.bed ?? "—",
      name: stripPatientHonorific(byId.get(t.patientId)?.display_name ?? ""),
    }));
  }

  return (
    <div className="flex-1 flex flex-col max-w-md mx-auto w-full">
      <header className="px-6 pt-8 pb-4">
        <Link href="/ward" className="text-[17px] text-accent">
          ‹ Ward
        </Link>
        <h1 className="mt-3 ios-large-title">To do</h1>
        <p className="mt-1 text-[15px] text-muted">
          {tasks.length + scoringTasks.length === 0
            ? "Nothing outstanding on the unit"
            : `${tasks.length + scoringTasks.length} outstanding across the unit`}
        </p>
      </header>

      <section className="px-6 pb-16 flex flex-col gap-4">
        <TodoLists tasks={tasks} scoringTasks={scoringTasks} />
      </section>
    </div>
  );
}
