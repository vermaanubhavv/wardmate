import Link from "next/link";
import { notFound } from "next/navigation";
import { historyCheckEnabled } from "@/lib/history-check/flag";
import { getFluidTopic } from "@/lib/fluids/topics";
import { FLUID_GROUP_LABEL, type FluidBlock } from "@/lib/fluids/types";
import ReferenceList from "../../reference-list";
import Calculator from "./calculator";

/**
 * One IV Fluid and Electrolyte Correction topic as a reading page. Unlike the history and
 * examination pages this one carries the book's doses and rates, so it says once at the top
 * that they are the book's, and every topic stays "pending clinician review" until signed off.
 */
export default async function LearnFluidTopicPage({ params }: { params: Promise<{ id: string }> }) {
  if (!historyCheckEnabled()) notFound();
  const { id } = await params;
  const topic = getFluidTopic(id);
  if (!topic) notFound();
  const reviewed = topic.reviewStatus === "reviewed";

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
      <header className="flex items-baseline justify-between gap-3 px-4 pb-3 pt-6">
        <Link href="/learn" className="text-[17px] text-accent">‹ Learn</Link>
        <p className="truncate text-[13px] text-muted">{topic.title}</p>
      </header>

      <section className="px-4 pb-4">
        <div className="ios-group px-4 py-3">
          <div className="flex items-center justify-between gap-2">
            <h1 className="text-[20px] font-semibold">{topic.title}</h1>
            <span className={"shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium " + (reviewed ? "bg-accent/10 text-accent" : "bg-orange-100 text-orange-700")}>
              {reviewed ? `Reviewed · ${topic.reviewedBy}` : "Pending clinician review"}
            </span>
          </div>
          <p className="mt-1 text-[13px] text-muted">
            {FLUID_GROUP_LABEL[topic.group]} · {topic.setting} · v{topic.version}
          </p>
          <p className="mt-2 text-[13px]">{topic.summary}</p>
          <p className="mt-2 rounded-[10px] bg-chip px-3 py-2 text-[12px] leading-relaxed text-muted">
            Digest of chapter {topic.source.chapters.join("; ")} of Pandya&apos;s <span className="italic">Practical Guidelines on Fluid Therapy</span> (PDF pages {topic.source.pages}). Every dose, rate and threshold is the book&apos;s, quoted with its page. It is reading material, not a prescription for the patient in front of you.
          </p>
        </div>
      </section>

      {topic.sections.map((s) => (
        <section key={s.id} className="px-4 pb-4">
          <p className="ios-group-header mb-2 px-4">{s.title}</p>
          {s.intro && <p className="mb-2 px-4 text-[13px] text-muted">{s.intro}</p>}
          <div className="ios-group divide-y divide-line">
            {s.blocks.map((b, i) => (
              <div key={i} className="px-4 py-3">
                <Block block={b} />
              </div>
            ))}
          </div>
        </section>
      ))}

      <ReferenceList references={topic.references} />
    </div>
  );
}

const Label = ({ children }: { children: string }) => (
  <p className="mb-1 text-[11px] font-bold uppercase tracking-wide text-muted">{children}</p>
);

function Block({ block }: { block: FluidBlock }) {
  switch (block.kind) {
    case "points":
      return (
        <>
          {block.title && <Label>{block.title}</Label>}
          <ul className="list-disc space-y-1 pl-5 text-[14px] leading-snug">
            {block.items.map((x, i) => <li key={i}>{x}</li>)}
          </ul>
        </>
      );
    case "steps":
      return (
        <>
          {block.title && <Label>{block.title}</Label>}
          <ol className="list-decimal space-y-1.5 pl-5 text-[14px] leading-snug">
            {block.steps.map((x, i) => <li key={i}>{x}</li>)}
          </ol>
        </>
      );
    case "caution":
      return (
        <div className="rounded-[10px] border border-orange-300 bg-orange-50 px-3 py-2 text-orange-800">
          <Label>{block.title ?? "Caution"}</Label>
          <ul className="list-disc space-y-1 pl-5 text-[13px] leading-snug">
            {block.items.map((x, i) => <li key={i}>{x}</li>)}
          </ul>
        </div>
      );
    case "quote":
      return (
        <blockquote className="border-l-2 border-accent pl-3 text-[13px] italic text-muted">
          “{block.text}” <span className="not-italic">— p. {block.page}</span>
        </blockquote>
      );
    case "table":
      return (
        <>
          {block.title && <Label>{block.title}</Label>}
          <div className="-mx-1 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-[13px] leading-snug">
              <thead>
                <tr>
                  {block.columns.map((c, i) => <th key={i} className="border-b border-line px-1 pb-1 align-bottom font-semibold">{c}</th>)}
                </tr>
              </thead>
              <tbody>
                {block.rows.map((r, i) => (
                  <tr key={i} className="border-b border-line/60 last:border-b-0">
                    {r.map((cell, j) => <td key={j} className="px-1 py-1.5 align-top tabular-nums">{cell}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {block.note && <p className="mt-1 text-[12px] text-muted">{block.note}</p>}
        </>
      );
    case "formula":
      return (
        <>
          <Label>{block.name}</Label>
          <p className="rounded-[8px] bg-chip px-3 py-2 font-mono text-[13px]">{block.expression}</p>
          <ul className="mt-1.5 space-y-0.5 text-[12px] text-muted">
            {block.variables.map((v) => (
              <li key={v.symbol}><span className="font-mono">{v.symbol}</span> — {v.meaning}{v.unit ? ` (${v.unit})` : ""}</li>
            ))}
          </ul>
          {block.example && <p className="mt-1.5 text-[13px]"><span className="font-semibold">Example.</span> {block.example}</p>}
          {block.note && <p className="mt-1 text-[12px] text-muted">{block.note}</p>}
          {block.calc && <Calculator calc={block.calc} />}
        </>
      );
  }
}
