/** The two ways the app writes a moment for a doctor in India: "9 Oct" and "9 Oct, 2:05 pm". */

const SHORT_DATE = new Intl.DateTimeFormat("en-IN", {
  timeZone: "Asia/Kolkata",
  day: "numeric",
  month: "short",
});

const DATE_TIME = new Intl.DateTimeFormat("en-IN", {
  timeZone: "Asia/Kolkata",
  day: "numeric",
  month: "short",
  hour: "numeric",
  minute: "2-digit",
});

export const shortDate = (when: string | number | Date) => SHORT_DATE.format(new Date(when));
export const dateTime = (when: string | number | Date) => DATE_TIME.format(new Date(when));

/** Whole hours left of a `windowHours` grace period that started at `since` (the full window
 *  when it has no start), never below zero. */
export function hoursLeft(since: string | null, windowHours: number): number {
  if (!since) return windowHours;
  const remaining = windowHours - (Date.now() - new Date(since).getTime()) / 3_600_000;
  return Math.max(0, Math.ceil(remaining));
}
