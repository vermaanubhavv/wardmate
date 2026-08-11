/**
 * Checks the extraction step against transcripts with known answers, without needing a
 * microphone. Run with:  node --env-file=.env.local scripts/test-extraction.ts
 *
 * The third case is the important one: it is a transcript that invites the model to fill in
 * values it was never given. Anything it invents there must be discarded, not stored.
 */
// Explicit .ts extension: run directly by Node, this resolves as ESM, which requires it.
import { extractObservations } from "../lib/extract.ts";

const CASES: { name: string; transcript: string; expect: string }[] = [
  {
    name: "The example from the spec",
    transcript:
      "day 3 post lap chole, afebrile, abdomen soft, drain 30 ml serous, tolerating orals, remove drain tomorrow",
    expect: "day 3, afebrile, abdomen soft, drain 30 ml serous, tolerating orals, plan to remove drain",
  },
  {
    name: "Drug and dose",
    transcript:
      "started on ceftriaxone one gram twice daily, pain better, continue same for two more days",
    expect: "ceftriaxone 1 g BD flagged for confirmation",
  },
  {
    name: "Invites invention — must stay absent",
    transcript: "patient looks better today, wound is fine, will review tomorrow",
    expect: "NO temperature, NO pulse, NO lab values — none were said",
  },
  {
    name: "Nothing clinical",
    transcript: "um, hold on, wrong bed",
    expect: "empty list",
  },
];

for (const c of CASES) {
  console.log(`\n=== ${c.name} ===`);
  console.log(`transcript: "${c.transcript}"`);
  console.log(`expecting:  ${c.expect}`);

  const t0 = Date.now();
  try {
    const result = await extractObservations(c.transcript);
    const ms = Date.now() - t0;

    if (result.observations.length === 0) {
      console.log("  (no observations)");
    }
    for (const o of result.observations) {
      const flag = o.needs_confirmation ? " [confirm]" : "";
      const num = o.value_num !== null ? ` num=${o.value_num}${o.unit ?? ""}` : "";
      console.log(`  ${o.kind}/${o.label}: "${o.value_text}"${num}${flag}`);
      console.log(`      quote: "${o.source_quote}"`);
    }
    if (result.rejected.length > 0) {
      console.log(`  DISCARDED ${result.rejected.length} (quote not found in transcript):`);
      for (const r of result.rejected) {
        console.log(`      ${r.label} = "${r.value_text}"  quote: "${r.source_quote}"`);
      }
    }
    console.log(`  ${ms} ms`);
  } catch (e) {
    console.log(`  FAILED: ${e instanceof Error ? e.message : e}`);
  }
}
