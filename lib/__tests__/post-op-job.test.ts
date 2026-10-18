import { describe, expect, it } from "vitest";
import { postOpJob } from "../urgency";

const job = (value_text: string) => ({ label: "plan", value_text });

describe("postOpJob", () => {
  it("finds a job that only follows an operation", () => {
    expect(postOpJob([job("Repeat CBC"), job("Remove drain")])?.value_text).toBe("Remove drain");
    expect(postOpJob([job("Suture removal on day 10")])?.value_text).toBe("Suture removal on day 10");
    expect(postOpJob([job("check port sites")])?.value_text).toBe("check port sites");
  });
  it("leaves out a drain put in on the ward", () => {
    expect(postOpJob([job("Remove pigtail drain")])).toBeNull();
    expect(postOpJob([job("ICD drain output chart")])).toBeNull();
    expect(postOpJob([job("Remove intercostal drain")])).toBeNull();
  });
  it("nothing post-op: null", () => {
    expect(postOpJob([job("USG abdomen"), job("Start oral sips")])).toBeNull();
    expect(postOpJob([])).toBeNull();
  });
});
