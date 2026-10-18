"use client";

import { useState } from "react";
import EditIdentity from "../edit-identity";

/**
 * Asked under the header when a patient has a post-op job ("Remove drain") but no operation on
 * record — so the day reads "Day 46" instead of "POD", and the pre-op card still shows. Either
 * the operation was never entered or the job is someone else's; a question, not a correction,
 * and one tap opens the same edit dialog as the pen, where Post-op and its date are set.
 */
export default function NoOperationQuestion({
  job,
  ...edit
}: { job: string } & React.ComponentProps<typeof EditIdentity>) {
  const [open, setOpen] = useState(0);
  return (
    <div className="text-footnote text-muted">
      “{job}” is a post-op job, but no operation is recorded. Was this patient operated?{" "}
      <button
        type="button"
        onClick={() => setOpen((n) => n + 1)}
        className="font-semibold text-accent active:opacity-60"
      >
        Add the operation
      </button>
      <EditIdentity {...edit} hideTrigger openAsOperated openSignal={open} />
    </div>
  );
}
