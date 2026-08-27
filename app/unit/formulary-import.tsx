"use client";

import { useActionState, useState } from "react";
import { importFormulary, type ImportFormularyState } from "./actions";

/**
 * Importing the hospital's drug list.
 *
 * Says what happened, every time. The first version of this returned silently on every failure
 * path — no file chosen, wrong file, tables not created yet — which is indistinguishable from a
 * dead button, and is exactly the "absent thing hidden" this app refuses everywhere else.
 */
export default function FormularyImport({
  wardId,
  formularySize,
}: {
  wardId: string;
  formularySize: number;
}) {
  const [state, action, pending] = useActionState<ImportFormularyState, FormData>(
    importFormulary,
    null
  );
  const [fileName, setFileName] = useState<string | null>(null);

  return (
    <form action={action} className="mt-3">
      <input type="hidden" name="ward_id" value={wardId} />
      <input
        type="file"
        name="formulary"
        accept="application/json,.json"
        onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
        className="w-full text-[13px]"
      />
      <button
        disabled={pending}
        className="mt-2 w-full rounded-[10px] bg-card px-4 py-3 text-[17px] font-medium text-accent disabled:opacity-50"
      >
        {pending ? "Importing…" : formularySize > 0 ? "Replace formulary" : "Import formulary"}
      </button>

      {/* Named before submitting, so it is obvious whether the picker actually took the file —
          the commonest reason this appeared to do nothing was pressing Import with none chosen. */}
      {fileName && !state && (
        <p className="mt-2 text-[13px] text-muted">Ready to import {fileName}.</p>
      )}

      {state && (
        <p className={"mt-2 text-[13px] " + (state.ok ? "text-muted" : "text-orange-700")}>
          {state.message}
        </p>
      )}
    </form>
  );
}
