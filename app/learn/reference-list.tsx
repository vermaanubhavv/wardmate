import type { Reference } from "@/lib/history-check/types";

/** Where the content came from, with a PubMed link when the source is indexed there. */
export default function ReferenceList({ references }: { references: Reference[] }) {
  return (
    <section className="px-4 pb-8">
      <p className="ios-group-header mb-2 px-4">Sources</p>
      <ol className="ios-group list-decimal px-4 py-3 pl-9 text-[13px] leading-snug text-muted">
        {references.map((r, i) => (
          <li key={i} className="py-1">
            {r.title}. <span className="italic">{r.source}</span>
            {r.year ? ` ${r.year}` : ""}
            {r.pmid && (
              <>
                {" "}
                <a href={`https://pubmed.ncbi.nlm.nih.gov/${r.pmid}/`} className="text-accent" target="_blank" rel="noreferrer">
                  PMID {r.pmid}
                </a>
              </>
            )}
            {r.url && !r.pmid && (
              <>
                {" "}
                <a href={r.url} className="text-accent" target="_blank" rel="noreferrer">
                  link
                </a>
              </>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
