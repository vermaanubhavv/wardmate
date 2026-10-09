import { FLUID_TOPICS } from "@/content/fluids";
import { validateFluidTopic } from "@/lib/fluids/schema";
import { validatedOnce } from "@/lib/history-check/schema";
import type { FluidTopic } from "@/lib/fluids/types";

/** Validated on first use, like the trees: a bad topic fails loudly, not on the ward. */
export const listFluidTopics = validatedOnce(FLUID_TOPICS, validateFluidTopic, "Fluid topic");

export function getFluidTopic(id: string): FluidTopic | null {
  return listFluidTopics().find((t) => t.id === id) ?? null;
}
