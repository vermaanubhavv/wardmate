import type { CapacitorConfig } from "@capacitor/cli";

/**
 * The iOS and Android wrappers.
 *
 * WardMate is a server-rendered app — every screen, the sign-in, and the transcription all
 * come from the server — so there is no version of it that can be frozen into an .ipa or .apk
 * and shipped. Neither wrapper bundles the app at all: each opens the live site in a native web
 * view, and `capacitor-shell/` exists only because Capacitor requires a web directory to point
 * at.
 *
 * What it buys, and the only reason to build either: a native microphone permission granted
 * once instead of per-session, and an install link (TestFlight, or a sideloaded .apk) that can
 * be sent to a colleague instead of a spoken instruction about the browser's Share button.
 *
 * The consequence to remember: because the app is the live site, a `vercel --prod` deploy
 * updates both native apps too. Nothing needs rebuilding or resubmitting for a normal change —
 * see `docs/ios-app.md` and `docs/android-app.md` for what does.
 *
 * The two platforms are NOT at parity on one point: iOS's `UIBackgroundModes: audio` (below)
 * keeps the mic open once the screen locks mid-round. Android has no manifest-only equivalent —
 * it would need a foreground service, which this wrapper does not add — so a locked screen on
 * Android still ends the recording. `lib/use-dictation.ts`'s salvage-on-hide path is what saves
 * a round when that happens; it is not a substitute for the fix.
 */
const config: CapacitorConfig = {
  appId: "in.wardmate.app",
  appName: "WardMate",
  webDir: "capacitor-shell",

  server: {
    // Production. Point this at a local IP (http://192.168.x.x:3000) plus `cleartext: true`
    // to test an unreleased branch on a real phone.
    url: "https://wardmate.in",

    // Anything not listed here opens in Safari rather than inside the app. Supabase is here
    // because sign-in and every query go through it; Google is NOT, deliberately — Google
    // refuses OAuth inside an embedded web view, so that button has to leave the app. The
    // six-digit email code is the sign-in that works in here.
    allowNavigation: ["wardmate.in", "*.supabase.co"],
  },

  ios: {
    // The web app already draws its own safe-area padding from env(safe-area-inset-*), so the
    // web view must not add its own inset on top of it — that is what puts a grey band under
    // the status bar and a second gap above the home indicator.
    contentInset: "never",

    // The recorder is the app. A web view that stops the microphone when the phone is put in
    // a pocket mid-round is the one failure this whole wrapper exists to prevent.
    limitsNavigationsToAppBoundDomains: false,
  },

  android: {
    // Chrome's per-tab getUserMedia re-prompt (and the outright failures some Android phones
    // return instead) is the "issues with live dictation" this wrapper exists to fix. The
    // actual grant comes from RECORD_AUDIO / MODIFY_AUDIO_SETTINGS in AndroidManifest.xml —
    // this block only ever needs touching for a debug build's chrome://inspect.
    webContentsDebuggingEnabled: false,
  },
};

export default config;
