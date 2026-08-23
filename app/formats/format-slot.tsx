"use client";

import { useActionState, useRef } from "react";
import { uploadFormat, removeFormat, type FormatState } from "./actions";

/**
 * One of the five formats: what is held, and how to change it.
 *
 * The file input is hidden behind the row itself, so choosing a file is one tap rather than a
 * tap to reveal and a tap to choose — and it submits on selection, because a chosen file and
 * an unpressed Upload button is a format the unit thinks it has uploaded and has not.
 */
export default function FormatSlot({
  wardId,
  kind,
  label,
  hint,
  current,
}: {
  wardId: string;
  kind: string;
  label: string;
  hint: string;
  current: {
    file_name: string | null;
    uploaded_at: string;
    url: string | null;
    /** Only meaningful for kind "notes" — see lib/read-form-layout.ts. */
    layout?: { role: string }[] | null;
    layout_error?: string | null;
  } | null;
}) {
  const [state, formAction, pending] = useActionState<FormatState, FormData>(uploadFormat, {
    error: null,
  });
  const formRef = useRef<HTMLFormElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  return (
    <div className="ios-group p-4">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-[17px] font-medium">{label}</p>
        {current ? (
          <span className="shrink-0 text-xs text-emerald-600">held</span>
        ) : (
          <span className="shrink-0 text-[13px] text-muted">not uploaded</span>
        )}
      </div>
      <p className="mt-0.5 text-[13px] text-muted">{hint}</p>

      {current && (
        <p className="mt-2 truncate text-[13px] text-muted">
          {current.url ? (
            <a
              href={current.url}
              target="_blank"
              rel="noreferrer"
              className="text-accent underline underline-offset-4"
            >
              {current.file_name || "View"}
            </a>
          ) : (
            current.file_name
          )}
          {" · "}
          {new Date(current.uploaded_at).toLocaleDateString("en-IN", {
            timeZone: "Asia/Kolkata",
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </p>
      )}

      {/* Whether the print overlay actually has anything to work with — read once at upload,
          not guessable from the outside otherwise. Only shown for "notes", the one kind that
          feeds the progress-note print page. */}
      {current && kind === "notes" && (
        <p className="mt-1 text-[13px]">
          {current.layout && current.layout.length > 0 ? (
            <span className="text-emerald-600">
              {current.layout.length} field{current.layout.length === 1 ? "" : "s"} found —
              printing will overlay onto this form.
            </span>
          ) : current.layout_error ? (
            <span className="text-orange-700">
              Could not read this form&rsquo;s layout ({current.layout_error}). Printing falls
              back to the plain layout — try a straighter, flatter photo.
            </span>
          ) : (
            <span className="text-orange-700">
              No fields found on this photo. Printing falls back to the plain layout — try a
              straighter, flatter photo with the whole form visible.
            </span>
          )}
        </p>
      )}

      <form ref={formRef} action={formAction} className="mt-3 flex items-center gap-3">
        <input type="hidden" name="ward_id" value={wardId} />
        <input type="hidden" name="kind" value={kind} />
        <input
          ref={inputRef}
          type="file"
          name="file"
          // No capture attribute: a format is far more often a file or an existing photo
          // than something to be photographed on the spot.
          accept="image/*,application/pdf,image/heic,image/heif"
          className="hidden"
          onChange={() => formRef.current?.requestSubmit()}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={pending}
          className="rounded-lg border border-line px-3 py-2 text-xs text-foreground disabled:opacity-50"
        >
          {pending ? "Uploading…" : current ? "Replace" : "Upload"}
        </button>

        {current && (
          <span className="ml-auto">
            <button
              type="submit"
              formAction={removeFormat}
              className="rounded-lg px-3 py-2 text-xs text-red-600"
            >
              Remove
            </button>
          </span>
        )}
      </form>

      {state.error && <p className="mt-2 text-[13px] text-orange-700">{state.error}</p>}
    </div>
  );
}
