import { describe, expect, it } from "vitest";
import { displayCase } from "../patients";

describe("displayCase", () => {
  it("capitalises a name typed in lower case", () => {
    expect(displayCase("shikha")).toBe("Shikha");
    expect(displayCase("attar singh")).toBe("Attar Singh");
    expect(displayCase("ram-lal")).toBe("Ram-Lal");
  });

  it("gives a name written in capitals ordinary case", () => {
    expect(displayCase("MANORANJAN")).toBe("Manoranjan");
    expect(displayCase("RAM LAL")).toBe("Ram Lal");
  });

  it("leaves a name with any capital exactly as typed", () => {
    expect(displayCase("McAllister")).toBe("McAllister");
    expect(displayCase("D'Souza")).toBe("D'Souza");
    expect(displayCase("Anubhav Verma")).toBe("Anubhav Verma");
  });
});
