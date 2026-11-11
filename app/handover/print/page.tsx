import { notFound } from "next/navigation";
import { BackBar } from "@/app/screen-header";
import { getCurrentWard } from "@/lib/ward";
import { formatHandoverText, getWardHandover } from "@/lib/handover";
import PrintButton from "@/app/patients/[id]/note/print-button";

/**
 * The handover on one A4 sheet, for the unit that still files a signed paper handover.
 *
 * Deliberately the same words as the WhatsApp text — formatHandoverText is the one place the
 * handover is composed, and a printed sheet that said anything different from the message
 * the consultant read would be a second handover. The only additions are what paper needs:
 * a signature and date line for whoever hands over and whoever takes over.
 */
export default async function HandoverPrintPage() {
  const { ward } = await getCurrentWard();
  if (!ward) notFound();

  const handover = await getWardHandover(ward);
  const lines = formatHandoverText(handover).split("\n");

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col bg-background print:max-w-none print:bg-white">
      <style>{`
        @page { size: A4 portrait; margin: 12mm; }
        @media print { html, body { background: #fff; -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
      `}</style>
      <BackBar href="/handover" label="Handover" />
      <header className="px-4 pb-3 pt-4 print:hidden">
        <h1 className="ios-large-title">Print handover</h1>
        <p className="mt-1 text-subhead text-muted">The same handover as the message, laid out for A4 with a sign-off line.</p>
      </header>

      <section className="px-4 pb-4 print:px-0">
        <div className="ios-group px-5 py-5 text-callout leading-relaxed text-black print:rounded-none print:border-0 print:p-0 print:shadow-none">
          {lines.map((line, i) => {
            const heading = line.match(/^\*(.+)\*(.*)$/);
            if (heading) {
              return (
                <p key={i} className={"font-bold " + (i === 0 ? "text-title3" : "mt-4 border-b border-black pb-0.5 uppercase")}>
                  {heading[1]}
                  {heading[2]}
                </p>
              );
            }
            if (line.startsWith("- ")) return <p key={i} className="pl-4">– {line.slice(2)}</p>;
            if (line === "") return <div key={i} className="h-2" />;
            return (
              <p key={i} className={line.startsWith("Bed ") ? "mt-2 font-semibold" : ""}>
                {line}
              </p>
            );
          })}

          <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-5 break-inside-avoid border-t-2 border-black pt-3 text-footnote">
            {["Handed over by", "Taken over by", "Signature", "Signature", "Date & time", "Date & time"].map((l, i) => (
              <p key={i} className="flex items-end gap-1.5">
                <span className="shrink-0 font-semibold">{l}:</span>
                <span className="h-4 flex-1 border-b border-black/60" />
              </p>
            ))}
          </div>
        </div>
        <p className="mt-3 text-caption2 leading-snug text-muted">
          * Generated from what was recorded in WardMate. Values marked to check are unconfirmed
          until the doctor signing has checked them against the chart.
        </p>
      </section>

      <section className="flex flex-col gap-2 px-4 pb-10 print:hidden">
        <PrintButton />
      </section>
    </div>
  );
}
