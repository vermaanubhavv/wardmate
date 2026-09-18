import { Capacitor, registerPlugin } from "@capacitor/core";

/**
 * Bracket for RecordingForegroundService (android/app/.../RecordingForegroundService.java) — the
 * one thing that keeps Android's WebView mic stream alive once the screen locks mid-round,
 * matching what iOS already gets for free from `UIBackgroundModes: audio` in Info.plist.
 *
 * A no-op everywhere else: the browser and iOS have nothing to bracket, and `registerPlugin`
 * without a native implementation would otherwise reject every call.
 */

interface RecordingServicePlugin {
  start(): Promise<void>;
  stop(): Promise<void>;
}

const RecordingService = registerPlugin<RecordingServicePlugin>("RecordingService");

function isAndroidNative(): boolean {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === "android";
}

/** Call once the mic stream exists, before it needs to survive being backgrounded. */
export function startBackgroundRecording(): void {
  if (!isAndroidNative()) return;
  void RecordingService.start().catch(() => {
    // Recording still works while the app stays foregrounded — this only means a locked
    // screen can end it early, same as before this existed.
  });
}

/** Call once the round is over, however it ended — idempotent if never started. */
export function stopBackgroundRecording(): void {
  if (!isAndroidNative()) return;
  void RecordingService.stop().catch(() => {});
}
