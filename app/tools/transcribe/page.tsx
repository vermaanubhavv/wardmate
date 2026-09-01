import { redirect } from "next/navigation";
import ScreenHeader from "../../screen-header";
import { createClient } from "@/lib/supabase/server";
import { getComparisonTranscribers } from "@/lib/stt";
import CompareClient, { type PastComparison } from "./compare-client";

// The engine list and the past comparisons are per-request and per-user; nothing here is
// worth caching.
export const dynamic = "force-dynamic";

/**
 * The speech-engine bake-off. Record a stretch of real ward speech once; OpenAI, Sarvam and
 * Deepgram each transcribe that same clip and the results sit next to each other. Tap the one
 * that got the drugs and the shorthand right, build up a week of those, then set the winner as
 * STT_PROVIDER on Vercel. Reached from the Unit page; not part of any patient's record.
 */
export default async function TranscribeComparePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const engines = getComparisonTranscribers().map((e) => ({
    provider: e.provider,
    model: e.model,
  }));

  const { data: past } = await supabase
    .from("stt_comparisons")
    .select("id, created_at, results, duration_seconds, note, best_provider")
    .order("created_at", { ascending: false })
    .limit(30);

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col pb-20">
      <ScreenHeader
        back="/unit"
        backLabel="Unit"
        title="Compare transcription"
        subtitle="Record once. Every speech engine that is set up transcribes the same audio, side by side."
      />
      <div className="px-4">
        <CompareClient engines={engines} past={(past ?? []) as PastComparison[]} />
      </div>
    </div>
  );
}
