import { effectiveUrgency, type Urgency } from "@/lib/urgency";

export type PushPayload = { title: string; body: string; url: string };

type AssignedJob = { urgency: Urgency; graded_at: string | null; recorded_at: string };

/**
 * The handover-time message for one member: the reminder, with how many of the jobs handed to
 * them are red as of now (graded Now, or a Soon that has come due — the same computed-on-read
 * rule the to-do list uses). No patient is named: a notification sits on a lock screen.
 */
export function handoverDigest(assigned: AssignedJob[], now = new Date().toISOString()): PushPayload {
  const red = assigned.filter((j) => effectiveUrgency(j, now).urgency === "red").length;
  return {
    title: "Handover soon",
    body:
      red === 0
        ? "Open WardMate to read the handover."
        : `${red} red ${red === 1 ? "job" : "jobs"} assigned to you still open.`,
    url: "/handover",
  };
}

/** The message when a red job is handed to you. The job's words, never the patient's name. */
export function assignedRedJob(jobText: string, patientId: string): PushPayload {
  return { title: "Job for you — now", body: jobText, url: `/patients/${patientId}` };
}
