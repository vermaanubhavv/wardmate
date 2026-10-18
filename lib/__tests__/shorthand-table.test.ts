import { expect, it } from "vitest";
import { renderTable } from "@/lib/shorthand-derive";

// lib/shorthand-table.ts is generated from the dictation lexicon so the app need not ship the
// lexicon to the browser. This fails the moment the two drift; `-u` regenerates it.
it("lib/shorthand-table.ts is the lexicon's pairs, regenerated", async () => {
  await expect(renderTable()).toMatchFileSnapshot("../shorthand-table.ts");
});
