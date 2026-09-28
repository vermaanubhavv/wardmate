import { FLUID_TOPICS } from "@/content/fluids";
import { validateFluidTopic } from "@/lib/fluids/schema";
import type { FluidGroup, FluidTopic } from "@/lib/fluids/types";

let checked: readonly FluidTopic[] | null = null;

/** Validated on first use, like the trees: a bad topic fails loudly, not on the ward. */
export function listFluidTopics(): readonly FluidTopic[] {
  if (!checked) {
    const ids = new Set<string>();
    for (const t of FLUID_TOPICS) {
      const res = validateFluidTopic(t);
      if (!res.ok) throw new Error(`Fluid topic ${t.id}@${t.version} is invalid — ${res.issues.map((i) => `${i.path}: ${i.message}`).join("; ")}`);
      if (ids.has(t.id)) throw new Error(`Duplicate fluid topic ${t.id}`);
      ids.add(t.id);
    }
    checked = FLUID_TOPICS;
  }
  return checked;
}

export function getFluidTopic(id: string): FluidTopic | null {
  return listFluidTopics().find((t) => t.id === id) ?? null;
}

export function listFluidTopicsByGroup(group: FluidGroup): readonly FluidTopic[] {
  return listFluidTopics().filter((t) => t.group === group);
}
