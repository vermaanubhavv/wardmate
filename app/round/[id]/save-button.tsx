"use client";

import { useEffect, useState } from "react";

/**
 * Save, with the count of beds it will write — or, while any bed still has no patient chosen,
 * how many are left, and a tap that takes you to the first. Read from the form itself, so it
 * follows every choice made on the cards above.
 */
export default function SaveButton({ form }: { form: string }) {
  const [counts, setCounts] = useState({ save: 0, open: 0 });

  useEffect(() => {
    const el = document.getElementById(form) as HTMLFormElement | null;
    if (!el) return;
    const read = () => {
      const selects = [...el.querySelectorAll<HTMLSelectElement>("select[name^='patient_']")];
      const admits = el.querySelectorAll<HTMLInputElement>("input[name^='admit_']:checked");
      setCounts({
        open: selects.filter((s) => !s.value).length,
        save: selects.filter((s) => s.value && s.value !== "skip").length + admits.length,
      });
    };
    read();
    el.addEventListener("change", read);
    return () => el.removeEventListener("change", read);
  }, [form]);

  if (counts.open > 0) {
    return (
      <button
        type="button"
        onClick={() => {
          const first = [
            ...document.querySelectorAll<HTMLSelectElement>(`#${form} select[name^='patient_']`),
          ].find((s) => !s.value);
          first?.scrollIntoView({ behavior: "smooth", block: "center" });
          first?.focus({ preventScroll: true });
        }}
        className="btn btn-secondary flex-[2] text-warn-fg"
      >
        {counts.open === 1 ? "1 bed needs a patient" : `${counts.open} beds need a patient`}
      </button>
    );
  }

  return (
    <button type="submit" form={form} className="btn btn-primary flex-[2]">
      {counts.save > 0 ? `Save ${counts.save} ${counts.save === 1 ? "bed" : "beds"}` : "Save"}
    </button>
  );
}
