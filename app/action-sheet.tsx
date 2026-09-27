"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

/**
 * The bottom sheet that asks before something destructive happens.
 *
 * It replaces `window.confirm()`, which is the one element on the page that cannot look like
 * the app and which draws the product's most careful copy in a browser's default font. The
 * shape is iOS's action sheet: the consequence in plain words, the destructive action in red,
 * cancel underneath at the same size so a thumb never has to aim.
 *
 * Two ways in. `ActionSheet` is the sheet itself, for a caller that already has state.
 * `ConfirmSubmit` wraps a form's submit button: it opens the sheet and, on confirm, submits the
 * form it sits in — so a server-action form needs no client state of its own.
 */
export function ActionSheet({
  open,
  title,
  message,
  action,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message?: ReactNode;
  /** The destructive verb, exactly as the button will read. */
  action: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const ref = useRef<HTMLDialogElement | null>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <dialog
      ref={ref}
      onClose={onCancel}
      onClick={(e) => {
        // A tap on the dimmed page behind the sheet is a cancel.
        if (e.target === ref.current) onCancel();
      }}
      className="bottom-bar fixed inset-x-0 bottom-0 top-auto m-0 w-full max-w-md bg-transparent p-2 backdrop:bg-black/40 open:flex open:flex-col open:gap-2 mx-auto"
    >
      <div className="ios-group">
        <div className="px-4 pb-3 pt-4 text-center">
          <p className="text-footnote font-semibold text-muted">{title}</p>
          {message && <p className="mt-1 text-footnote text-muted">{message}</p>}
        </div>
        <button
          type="button"
          onClick={onConfirm}
          className="ios-row block w-full px-4 py-3.5 text-center text-title3 text-critical-fg active:bg-chip"
        >
          {action}
        </button>
      </div>
      <button
        type="button"
        onClick={onCancel}
        autoFocus
        className="ios-group block w-full px-4 py-3.5 text-center text-title3 font-semibold text-accent active:bg-chip"
      >
        Cancel
      </button>
    </dialog>,
    document.body
  );
}

/** A submit button that asks first. Drop it into any `<form action={serverAction}>`. */
export function ConfirmSubmit({
  title,
  message,
  action,
  formAction,
  className,
  children,
}: {
  title: string;
  message?: ReactNode;
  action: string;
  /** A server action other than the form's own — the same thing `formAction` does on a plain
   *  submit button. */
  formAction?: (formData: FormData) => void | Promise<void>;
  className?: string;
  children: ReactNode;
}) {
  const submitter = useRef<HTMLButtonElement | null>(null);
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* The real submit button, never seen: requestSubmit() needs one to carry formAction. */}
      <button ref={submitter} type="submit" formAction={formAction} hidden tabIndex={-1} aria-hidden />
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
        className={className}
      >
        {children}
      </button>
      <ActionSheet
        open={open}
        title={title}
        message={message}
        action={action}
        onCancel={() => setOpen(false)}
        onConfirm={() => {
          setOpen(false);
          const b = submitter.current;
          b?.form?.requestSubmit(b);
        }}
      />
    </>
  );
}
