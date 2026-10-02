"use client";

import { useState } from "react";
import { proofreadDischargeAction } from "./actions";

/** Runs Sonnet's proofread first (showing "Checking…" while it does), then hands the .docx route
 *  to the browser — the download itself comes from its Content-Disposition header. The route
 *  runs the same check, which is skipped here because nothing changed since this one. */
export default function DownloadWordButton({ patientId }: { patientId: string }) {
  const [checking, setChecking] = useState(false);

  async function onDownload() {
    setChecking(true);
    await proofreadDischargeAction(patientId).catch(() => null);
    setChecking(false);
    // A link click, not router.push: this is a file download, not a page.
    const link = document.createElement("a");
    link.href = `/api/patients/${patientId}/discharge-docx`;
    link.click();
  }

  return (
    <button
      type="button"
      onClick={() => void onDownload()}
      disabled={checking}
      className="w-full rounded-xl bg-card px-4 py-3 text-center text-body font-semibold text-accent active:opacity-70 disabled:opacity-60 print:hidden"
    >
      {checking ? "Checking the summary…" : "Download as Word"}
    </button>
  );
}
