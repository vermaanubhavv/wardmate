import { redirect } from "next/navigation";
import ScreenHeader from "../screen-header";
import { getCurrentWard, getWardMembers, getWardPack } from "@/lib/ward";
import { getWardTasks } from "@/lib/todo";
import { getWardScoringTasks } from "@/lib/scoring/read";
import { createClient } from "@/lib/supabase/server";
import { type WardScoringTask } from "./scoring-section";
import TodoLists from "./todo-lists";
import { stripPatientHonorific } from "@/lib/patients";

export default async function TodoPage() {
  const { ward, error } = await getCurrentWard();

  if (!ward) {
    if (error) throw new Error(error.message);
    redirect("/onboarding");
  }

  // Independent reads, sent together. The scoring ones are score-input to-do items across the
  // unit (inert unless the scoring engine is on for it).
  const [tasks, scoringByPatient, pack, members] = await Promise.all([
    getWardTasks(ward.id),
    getWardScoringTasks(ward.id),
    getWardPack(ward.id),
    getWardMembers(ward.id),
  ]);
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
      <ScreenHeader
        back="/ward"
        title="To do"
        subtitle={
          // Jobs a resident said; the suggestions below are not counted.
          tasks.length === 0
            ? "Nothing outstanding on the unit"
            : `${tasks.length} outstanding across the unit`
        }
      />

      <section className="px-4 pb-16 flex flex-col gap-4">
        <TodoLists tasks={tasks} scoringTasks={scoringTasks} specialty={pack.key} members={members} />
      </section>
    </div>
  );
}
