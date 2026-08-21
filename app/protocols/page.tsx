import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { listTemplateChoices } from "@/lib/templates";
import { createProtocol, setProtocolStatus } from "./actions";

type Item = { id: string; kind: string; prompt: string; position: number; severity: string | null };
type Protocol = {
  id: string;
  title: string;
  version: string;
  source_name: string;
  source_url: string | null;
  phase: string;
  status: string;
  company_protocol_items: Item[];
};

const SEVERITY_STYLE: Record<string, string> = {
  critical: "border-red-300 bg-red-50 text-red-800",
  urgent: "border-orange-300 bg-orange-50 text-orange-800",
  warning: "border-amber-300 bg-amber-50 text-amber-800",
};

export default async function ProtocolsPage() {
  const supabase = await createClient();
  const [{ data: publisher }, { data: protocols }, choices] = await Promise.all([
    supabase.rpc("is_protocol_publisher"),
    supabase
      .from("company_protocols")
      .select(
        "id, title, version, source_name, source_url, phase, status, company_protocol_items(id, kind, prompt, position, severity)"
      )
      .order("title"),
    listTemplateChoices(),
  ]);
  const isPublisher = Boolean(publisher);

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
      <header className="px-6 pb-4 pt-8">
        <Link href="/ward" className="text-[17px] text-accent">
          ‹ Ward
        </Link>
        <h1 className="ios-large-title mt-3">Protocols</h1>
        <p className="mt-1 text-[15px] text-muted">
          Company-approved clinical guidance. Read-only reference — nothing here writes to a
          patient until you choose to act on it yourself.
        </p>
        {/* The one line the whole feature exists under — see the spec's own clinical safety
            boundary. Said once here rather than once per protocol, but said. */}
        <p className="mt-3 rounded-[10px] bg-chip px-3 py-2 text-[13px] leading-relaxed text-muted">
          Decision support based on approved protocol. You remain responsible for assessment
          and management.
        </p>
      </header>

      <main className="flex flex-col gap-4 px-6 pb-16">
        {isPublisher && (
          <details className="ios-group p-4">
            <summary className="cursor-pointer text-[17px] font-semibold">
              New company protocol
            </summary>
            <form action={createProtocol} className="mt-4 flex flex-col gap-3">
              <input
                required
                name="title"
                placeholder="Protocol title"
                className="rounded-[10px] border border-line px-3 py-2.5"
              />
              <div className="flex gap-3">
                <input
                  required
                  name="version"
                  placeholder="Version"
                  className="min-w-0 flex-1 rounded-[10px] border border-line px-3 py-2.5"
                />
                <select name="phase" className="flex-1 rounded-[10px] border border-line px-3 py-2.5">
                  <option value="any">Any phase</option>
                  <option value="before_surgery">Pre-op</option>
                  <option value="after_surgery">Post-op</option>
                </select>
              </div>
              <input
                required
                name="source_name"
                placeholder="Guideline source"
                className="rounded-[10px] border border-line px-3 py-2.5"
              />
              <input
                name="source_url"
                placeholder="Source URL (optional)"
                className="rounded-[10px] border border-line px-3 py-2.5"
              />
              <select
                name="template_family"
                className="rounded-[10px] border border-line px-3 py-2.5"
              >
                <option value="">All procedures</option>
                {choices.map((c) => (
                  <option key={`${c.family}|${c.variant ?? ""}`} value={c.family}>
                    {c.label}
                  </option>
                ))}
              </select>

              <Section
                name="immediate_actions"
                label="Immediate actions"
                hint="One per line — the ordered checklist a resident does first."
              />
              <Section
                name="red_flags"
                label="Escalate urgently if…"
                hint={
                  'One per line. Start a line "critical:" or "warning:" to set how urgent it is — plain lines default to urgent.'
                }
              />
              <Section
                name="investigations"
                label="Investigations"
                hint="Routine and conditional — one per line."
              />
              <Section
                name="pathway_steps"
                label="Definitive-management pathway"
                hint="The high-level next steps — one per line."
              />

              <div className="flex gap-3">
                <button
                  name="status"
                  value="draft"
                  className="flex-1 rounded-[10px] border border-line px-3 py-3 text-[15px]"
                >
                  Save draft
                </button>
                <button
                  name="status"
                  value="published"
                  className="flex-1 rounded-[10px] bg-accent px-3 py-3 text-[15px] font-semibold text-accent-ink"
                >
                  Publish
                </button>
              </div>
            </form>
          </details>
        )}

        <div className="flex flex-col gap-3">
          {((protocols ?? []) as Protocol[]).map((p) => (
            <ProtocolCard key={p.id} protocol={p} isPublisher={isPublisher} />
          ))}
          {(protocols ?? []).length === 0 && (
            <p className="ios-group px-4 py-3 text-[15px] text-muted">
              Nothing published yet.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}

function Section({ name, label, hint }: { name: string; label: string; hint: string }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[13px] font-medium text-muted">{label}</span>
      <textarea
        name={name}
        rows={3}
        placeholder={hint}
        className="rounded-[10px] border border-line px-3 py-2.5 text-[15px]"
      />
    </label>
  );
}

function ProtocolCard({ protocol: p, isPublisher }: { protocol: Protocol; isPublisher: boolean }) {
  const byKind = (kind: string) =>
    p.company_protocol_items.filter((i) => i.kind === kind).sort((a, b) => a.position - b.position);

  const immediate = byKind("immediate_action");
  const redFlags = byKind("red_flag");
  const investigations = byKind("investigation");
  const pathway = byKind("pathway_step");

  return (
    <article id={p.id} className="ios-group scroll-mt-6 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="truncate font-semibold">{p.title}</h2>
          <p className="mt-0.5 text-[13px] text-muted">
            v{p.version} · {p.source_name} · {p.phase.replace("_", " ")}
            {isPublisher && p.status !== "published" && (
              <span className="ml-1.5 rounded-full bg-chip px-1.5 py-0.5 text-[11px] font-medium uppercase tracking-wide text-muted">
                {p.status}
              </span>
            )}
          </p>
        </div>
        {p.source_url && (
          <a
            href={p.source_url}
            target="_blank"
            rel="noreferrer"
            className="shrink-0 text-[13px] text-accent underline"
          >
            Source
          </a>
        )}
      </div>

      {/* Red flags lead, in colour, ahead of everything else — the one thing a resident
          scanning this needs fastest, matching the spec's own "urgent first" ordering. */}
      {redFlags.length > 0 && (
        <div className="mt-3 flex flex-col gap-1.5">
          {redFlags.map((f) => (
            <p
              key={f.id}
              className={
                "rounded-[10px] border px-3 py-2 text-[14px] font-medium " +
                (SEVERITY_STYLE[f.severity ?? "urgent"] ?? SEVERITY_STYLE.urgent)
              }
            >
              {f.prompt}
            </p>
          ))}
        </div>
      )}

      {immediate.length > 0 && (
        <ProtocolList heading="Immediate actions" items={immediate} />
      )}
      {investigations.length > 0 && (
        <ProtocolList heading="Investigations" items={investigations} />
      )}
      {pathway.length > 0 && (
        <ProtocolList heading="Definitive-management pathway" items={pathway} />
      )}

      {isPublisher && (
        <div className="mt-3 flex gap-2 border-t border-line pt-3">
          {p.status !== "published" && (
            <StatusButton protocolId={p.id} status="published" label="Publish" accent />
          )}
          {p.status === "published" && (
            <StatusButton protocolId={p.id} status="retired" label="Retire" />
          )}
          {p.status === "retired" && (
            <StatusButton protocolId={p.id} status="draft" label="Back to draft" />
          )}
        </div>
      )}
    </article>
  );
}

function ProtocolList({ heading, items }: { heading: string; items: Item[] }) {
  return (
    <div className="mt-3">
      <p className="text-[12px] font-semibold uppercase tracking-wide text-muted">{heading}</p>
      <ul className="mt-1 space-y-1 text-[15px]">
        {items.map((i) => (
          <li key={i.id}>· {i.prompt}</li>
        ))}
      </ul>
    </div>
  );
}

function StatusButton({
  protocolId,
  status,
  label,
  accent = false,
}: {
  protocolId: string;
  status: string;
  label: string;
  accent?: boolean;
}) {
  return (
    <form action={setProtocolStatus}>
      <input type="hidden" name="protocol_id" value={protocolId} />
      <input type="hidden" name="status" value={status} />
      <button
        className={
          "rounded-[10px] px-3 py-2 text-[13px] font-medium " +
          (accent ? "bg-accent text-accent-ink" : "border border-line text-muted")
        }
      >
        {label}
      </button>
    </form>
  );
}
