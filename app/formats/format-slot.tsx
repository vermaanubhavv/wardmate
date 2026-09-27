"use client";

import { useActionState, useRef } from "react";
import { uploadFormat, removeFormat, type FormatState } from "./actions";
import { ConfirmSubmit } from "../action-sheet";

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
        <p className="text-body font-medium">{label}</p>
        {current ? (
          <span className="shrink-0 text-caption text-good-fg">held</span>
        ) : (
          <span className="shrink-0 text-footnote text-muted">not uploaded</span>
        )}
      </div>
      <p className="mt-0.5 text-footnote text-muted">{hint}</p>

      {current && (
        <p className="mt-2 truncate text-footnote text-muted">
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
        <p className="mt-1 text-footnote">
          {current.layout && current.layout.length > 0 ? (
            <span className="text-good-fg">
              {current.layout.length} field{current.layout.length === 1 ? "" : "s"} found —
              printing will overlay onto this form.
            </span>
          ) : current.layout_error ? (
            <span className="text-warn-fg">
              Could not read this form&rsquo;s layout ({current.layout_error}). Printing falls
              back to the plain layout — try a straighter, flatter photo.
            </span>
          ) : (
            <span className="text-warn-fg">
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
          className="btn btn-secondary min-h-11 text-footnote text-foreground"
        >
          {pending ? "Uploading…" : current ? "Replace" : "Upload"}
        </button>

        {current && (
          <span className="ml-auto">
            <ConfirmSubmit
              formAction={removeFormat}
              title="Remove this format?"
              message="Summaries already written keep their layout. New ones use the default until another is uploaded."
              action="Remove format"
              className="min-h-11 rounded-lg px-3 text-footnote text-critical-fg"
            >
              Remove
            </ConfirmSubmit>
          </span>
        )}
      </form>

      {state.error && <p className="mt-2 text-footnote text-warn-fg">{state.error}</p>}
    </div>
  );
}
