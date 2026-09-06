import { describe, expect, it } from "vitest";
import { dedupeTasks, quoteAddsNothing, taskKey } from "@/lib/dedupe-tasks";

const task = (value_text: string) => ({ value_text, label: value_text });

describe("taskKey — one job, however it was said", () => {
  it("folds tense and plural, which is how a ward repeats itself", () => {
    expect(taskKey("continue antibiotics")).toBe(taskKey("continued the antibiotic"));
    expect(taskKey("start chest physio")).toBe(taskKey("started chest physio"));
    expect(taskKey("review LFTs")).toBe(taskKey("reviewing LFT"));
    expect(taskKey("remove the drain")).toBe(taskKey("drain removal"));
    expect(taskKey("plan for discharge")).toBe(taskKey("planned discharge"));
    expect(taskKey("increase the dose")).toBe(taskKey("increased doses"));
  });

  it("still ignores when a job was said for, and the order it was said in", () => {
    expect(taskKey("discharge tomorrow")).toBe(taskKey("discharge today"));
    expect(taskKey("drain out")).toBe(taskKey("out drain"));
    // Stemming must not eat the words that mark filler: "evening" would otherwise become
    // "even" and survive the timeframe list.
    expect(taskKey("dressing in the evening")).toBe(taskKey("dressing in the morning"));
  });

  it("does not fold two different jobs together", () => {
    expect(taskKey("remove drain")).not.toBe(taskKey("remove catheter"));
    expect(taskKey("start feeds")).not.toBe(taskKey("stop feeds"));
    // The one a real stemmer gets wrong: on a surgical ward these are not the same word.
    expect(taskKey("operative note")).not.toBe(taskKey("operation booked"));
  });

  it("never merges a job that is only filler", () => {
    expect(taskKey("do it tomorrow")).toBe("");
    const out = dedupeTasks([task("do it tomorrow"), task("please do this now")]);
    expect(out).toHaveLength(2);
  });
});

describe("dedupeTasks — newest kept, older ones counted", () => {
  it("keeps the newest wording and folds the rest under it", () => {
    const out = dedupeTasks([
      task("continue antibiotics"),
      task("continued the antibiotic"),
      task("remove drain tomorrow"),
    ]);
    expect(out).toHaveLength(2);
    expect(out[0].task.value_text).toBe("continue antibiotics");
    expect(out[0].repeats).toHaveLength(1);
  });
});

describe("quoteAddsNothing", () => {
  it("hides a quote that only repeats the job", () => {
    expect(quoteAddsNothing("continue antibiotics", "continued the antibiotics")).toBe(true);
    expect(quoteAddsNothing("continue antibiotics", "temperature is spiking so continue antibiotics")).toBe(true);
  });

  it("keeps a quote that says more than the job does", () => {
    expect(quoteAddsNothing("review LFTs", "he looks jaundiced")).toBe(false);
  });
});
