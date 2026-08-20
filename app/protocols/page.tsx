import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { listTemplateChoices } from "@/lib/templates";
import { createProtocol } from "./actions";

export default async function ProtocolsPage() {
  const supabase = await createClient();
  const [{ data: publisher }, { data: protocols }, choices] = await Promise.all([
    supabase.rpc("is_protocol_publisher"),
    supabase.from("company_protocols").select("id, title, version, source_name, source_url, phase, status, review_on, company_protocol_items(id, prompt, position)").order("title"),
    listTemplateChoices(),
  ]);
  const isPublisher = Boolean(publisher);
  return <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
    <header className="px-6 pb-4 pt-8"><Link href="/ward" className="text-[17px] text-accent">‹ Ward</Link><h1 className="ios-large-title mt-3">Protocols</h1><p className="mt-1 text-[15px] text-muted">Company-approved clinical prompts. Review the source before applying anything to a patient.</p></header>
    <main className="px-6 pb-16">
      {isPublisher && <form action={createProtocol} className="ios-group mb-6 flex flex-col gap-3 p-4">
        <p className="text-[17px] font-semibold">New company protocol</p>
        <input required name="title" placeholder="Protocol title" className="rounded-[10px] border border-line px-3 py-2.5" />
        <div className="flex gap-3"><input required name="version" placeholder="Version" className="min-w-0 flex-1 rounded-[10px] border border-line px-3 py-2.5" /><select name="phase" className="flex-1 rounded-[10px] border border-line px-3 py-2.5"><option value="any">Any phase</option><option value="before_surgery">Pre-op</option><option value="after_surgery">Post-op</option></select></div>
        <input required name="source_name" placeholder="Guideline source" className="rounded-[10px] border border-line px-3 py-2.5" /><input name="source_url" placeholder="Source URL (optional)" className="rounded-[10px] border border-line px-3 py-2.5" />
        <select name="template_family" className="rounded-[10px] border border-line px-3 py-2.5"><option value="">All procedures</option>{choices.map(c => <option key={`${c.family}|${c.variant ?? ""}`} value={c.family}>{c.label}</option>)}</select>
        <textarea required name="prompts" rows={5} placeholder="One clinician-review prompt per line" className="rounded-[10px] border border-line px-3 py-2.5" />
        <div className="flex gap-3"><button name="status" value="draft" className="flex-1 rounded-[10px] border border-line px-3 py-3 text-[15px]">Save draft</button><button name="status" value="published" className="flex-1 rounded-[10px] bg-accent px-3 py-3 text-[15px] font-semibold text-accent-ink">Publish</button></div>
      </form>}
      <div className="flex flex-col gap-3">{(protocols ?? []).map((p) => <article key={p.id} className="ios-group p-4"><div className="flex justify-between gap-3"><h2 className="font-semibold">{p.title}</h2><span className="text-[13px] text-muted">v{p.version}</span></div><p className="mt-1 text-[13px] text-muted">{p.source_name} · {p.phase.replace("_", " ")}</p>{p.source_url && <a href={p.source_url} target="_blank" rel="noreferrer" className="mt-2 block text-[13px] text-accent underline">View source</a>}<ul className="mt-3 space-y-1 text-[15px]">{(p.company_protocol_items ?? []).sort((a,b)=>a.position-b.position).map(i=><li key={i.id}>• {i.prompt}</li>)}</ul></article>)}</div>
    </main></div>;
}
