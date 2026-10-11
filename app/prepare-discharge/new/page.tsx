import Link from "next/link";
import { getCurrentWard, getWardSpecialtyStored } from "@/lib/ward";
import { getSpecialtyPack } from "@/lib/specialty";
import { dischargeProfileFor } from "@/lib/specialty/discharge";
import { derivePatientState } from "@/lib/patient-state";
import { buildOneOffDraft, NO_TEMPLATE, oneOffContext } from "@/lib/discharge-oneoff";
import DischargeWorkspace from "../../patients/[id]/discharge/discharge-workspace";

/**
 * A discharge summary for somebody who is not in WardMate — the patient's own discharge
 * workspace, in one-off mode: the same cards and the unit's own specialty behaviour, a Start
 * card in front, nothing stored.
 */
export default async function OneOffPage() {
  // The unit's own template set and discharge profile — an oncology unit picks from oncology templates.
  const { ward } = await getCurrentWard();
  const pack = getSpecialtyPack(ward ? await getWardSpecialtyStored(ward.id) : null);
  // The cards before Build: the unit's heading on the Admission Details card, everything else empty.
  const { draft, checkContext } = buildOneOffDraft(
    oneOffContext({}, ward ?? null, null, new Map(), [], derivePatientState([], null), [], pack),
    NO_TEMPLATE,
    {}
  );

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col print:max-w-none">
      <header className="flex items-baseline justify-between gap-3 px-4 pb-3 pt-6 print:hidden">
        <Link href="/unit" className="text-body text-accent">
          ‹ Unit
        </Link>
        <p className="truncate text-footnote text-muted">One-off summary · nothing stored</p>
      </header>

      <DischargeWorkspace
        patientId=""
        initialDraft={draft}
        checkContext={checkContext}
        wardId={ward?.id ?? ""}
        formularyAvailable={false}
        aiReady={false}
        finalCheck={null}
        profile={dischargeProfileFor(pack)}
        oneOff
      />
    </div>
  );
}
