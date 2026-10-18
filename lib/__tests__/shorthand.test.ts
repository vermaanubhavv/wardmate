import { describe, expect, it } from "vitest";
import { shortFinding, shortJob } from "@/lib/shorthand";

describe("shortFinding", () => {
  it("writes the two lines from the ward the way a chart does", () => {
    expect(shortFinding("upper abdomen is tender in the right upper abdomen")).toBe("RUQ tenderness");
    expect(shortFinding("right upper right liver lobe abscess")).toBe("right liver lobe abscess");
  });
  it("shortens fixed phrases, any capitalisation", () => {
    expect(shortFinding("Soft, non tender, bowel sounds present")).toBe("Soft, NT, BS +");
    expect(shortFinding("Air entry equal bilaterally, normal vesicular breath sounds")).toBe("B/L AE =, NVBS");
    expect(shortFinding("Tenderness present over the right iliac fossa")).toBe("RIF tenderness");
  });
  it("never adds a side, a negation or a number, and leaves the unknown alone", () => {
    expect(shortFinding("tender on the right side")).toBe("tender on the right side");
    expect(shortFinding("no guarding")).toBe("no guarding");
    expect(shortFinding("right and left both tender")).toBe("right and left both tender");
    expect(shortFinding("BP 120/80 PR 80")).toBe("BP 120/80 PR 80");
    expect(shortFinding("Voluntary guarding present")).toBe("Voluntary guarding present");
  });
});

describe("shortJob", () => {
  it("puts the verb first and drops the filler", () => {
    expect(shortJob("we need to send a complete blood count tomorrow morning")).toBe("Send a CBC tomorrow AM");
    expect(shortJob("please do ultrasound of the abdomen.")).toBe("Do USG");
    expect(shortJob("Repeat liver function test and renal function test")).toBe("Repeat LFT and RFT");
  });
});
