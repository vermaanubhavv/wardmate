import Link from "next/link";
import { notFound } from "next/navigation";
import { historyCheckEnabled } from "@/lib/history-check/flag";
import { getTree } from "@/lib/history-check/trees";
import { SLOT_GROUPS, type SlotGroup } from "@/lib/history-check/types";
import { statusChip } from "@/app/patients/[id]/card-kit";
import ReferenceList from "../../reference-list";

const GROUP_TITLE: Record<SlotGroup, string> = {
  informant: "Informant",
  hpi: "History of the presenting illness",
  associated: "Associated symptoms and pertinent negatives",
  red_flag: "Must not miss",
  exposure: "Exposures and background",
};

/**
 * One complaint tree as a teaching page: every question in the order a case sheet asks
 * them, which are core and which are for the long case, the teaching line where one has been
 * written, and the differentials as "what separates them" — never as what the patient has.
 */
export default async function LearnHistoryPage({ params }: { params: Promise<{ treeId: string }> }) {
  if (!historyCheckEnabled()) notFound();
  const { treeId } = await params;
  const tree = getTree(treeId);
  if (!tree) notFound();
  const label = new Map(tree.slots.map((s) => [s.id, s.label]));

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
      <header className="flex items-baseline justify-between gap-3 px-4 pb-3 pt-6">
        <Link href="/learn" className="text-[17px] text-accent">‹ Learn</Link>
        <p className="truncate text-[13px] text-muted">{tree.complaint}</p>
      </header>

      <section className="px-4 pb-4">
        <div className="ios-group px-4 py-3">
          <div className="flex items-center justify-between gap-2">
            <h1 className="text-[20px] font-semibold">{tree.complaint}</h1>
            {statusChip(tree.reviewStatus === "reviewed" ? `Reviewed · ${tree.reviewedBy}` : "Pending clinician review", tree.reviewStatus === "reviewed" ? "ok" : "warn")}
          </div>
          <p className="mt-1 text-[13px] text-muted">{tree.setting} · tree v{tree.version}</p>
          <p className="mt-2 text-[13px]">
            Questions marked <span className="font-semibold">detailed</span> belong to the long case; the rest are asked on every ward
            patient. Red flags are asked of everyone, always.
          </p>
        </div>
      </section>

      {SLOT_GROUPS.map((g) => {
        const slots = tree.slots.filter((s) => s.group === g);
        if (slots.length === 0) return null;
        return (
          <section key={g} className="px-4 pb-4">
            <p className={"ios-group-header mb-2 px-4 " + (g === "red_flag" ? "text-orange-700" : "")}>{GROUP_TITLE[g]}</p>
            <ol className="ios-group">
              {slots.map((s) => (
                <li key={s.id} className="border-b border-line px-4 py-3 last:border-b-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-[15px]">{s.question}</p>
                    {s.tier === "detailed" ? statusChip("detailed", "muted") : null}
                  </div>
                  <p className="mt-0.5 text-[12px] text-muted">
                    {s.label}
                    {s.numeric ? " · a number: stays unconfirmed until checked" : ""}
                    {s.kind === "yes_no" ? " · record present, explicitly absent, or not asked" : " · record the patient's own words"}
                  </p>
                  {s.teach && <p className="mt-1 text-[13px]">{s.teach}</p>}
                </li>
              ))}
            </ol>
          </section>
        );
      })}

      <section className="px-4 pb-4">
        <p className="ios-group-header mb-2 px-4">What separates the differentials</p>
        <ul className="ios-group">
          {tree.differentials.map((d) => (
            <li key={d.id} className="border-b border-line px-4 py-3 last:border-b-0">
              <p className="text-[15px] font-semibold">
                {d.name}
                {d.appliesWhen === "post_op" && <span className="ml-1 text-[12px] font-normal text-muted">(after surgery)</span>}
              </p>
              <p className="mt-0.5 text-[13px]">
                <span className="text-muted">Points towards it: </span>
                {d.pointers.map((p) => label.get(p) ?? p).join(", ")}
              </p>
              <p className="mt-0.5 text-[13px]">
                <span className="text-muted">Ask to separate it: </span>
                {d.discriminators.map((p) => label.get(p) ?? p).join(", ")}
              </p>
            </li>
          ))}
        </ul>
        <p className="mt-2 px-4 text-[12px] text-muted">A list of what to ask, not a diagnosis. The app never picks one for you.</p>
      </section>

      <ReferenceList references={tree.references} />
    </div>
  );
}
