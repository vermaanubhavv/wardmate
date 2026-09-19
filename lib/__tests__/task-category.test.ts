import { describe, it, expect } from "vitest";
import { classifyTaskCategory, TASK_CATEGORY_ORDER, TASK_CATEGORY_META } from "@/lib/task-category";

describe("classifyTaskCategory", () => {
  it("classifies sampling tasks", () => {
    expect(classifyTaskCategory("Send fresh ABG")).toBe("sampling");
    expect(classifyTaskCategory("Repeat Hb after transfusion")).toBe("sampling");
    expect(classifyTaskCategory("Send routine investigations — CBC, LFT, KFT, SE")).toBe("sampling");
    expect(classifyTaskCategory("Blood culture and sensitivity")).toBe("sampling");
  });

  it("classifies radiology tasks", () => {
    expect(classifyTaskCategory("Arrange ultrasound abdomen")).toBe("radiology");
    expect(classifyTaskCategory("Repeat chest X-ray")).toBe("radiology");
    expect(classifyTaskCategory("CT abdomen with contrast")).toBe("radiology");
  });

  it("classifies procedure tasks", () => {
    expect(classifyTaskCategory("Remove abdominal drain")).toBe("procedure");
    expect(classifyTaskCategory("Change dressing — surgical site")).toBe("procedure");
    expect(classifyTaskCategory("Reinsert Foley catheter")).toBe("procedure");
  });

  it("classifies consent tasks", () => {
    expect(classifyTaskCategory("Obtain consent for laparoscopic cholecystectomy")).toBe("consent");
    expect(classifyTaskCategory("Blood transfusion consent")).toBe("consent");
  });

  it("prefers the more specific match when keywords overlap", () => {
    // "send" alone would also match the sampling pattern's "send investigations" clause —
    // consent must still win, per lib/task-category.ts's stated match order.
    expect(classifyTaskCategory("Send consent form to the family")).toBe("consent");
  });

  it("returns null for text that matches no category", () => {
    expect(classifyTaskCategory("Discuss goals of care with family")).toBeNull();
    expect(classifyTaskCategory("")).toBeNull();
    expect(classifyTaskCategory(null)).toBeNull();
    expect(classifyTaskCategory(undefined)).toBeNull();
  });

  it("TASK_CATEGORY_ORDER and TASK_CATEGORY_META agree on every category", () => {
    for (const category of TASK_CATEGORY_ORDER) {
      expect(TASK_CATEGORY_META[category].label).toBeTruthy();
    }
  });
});
