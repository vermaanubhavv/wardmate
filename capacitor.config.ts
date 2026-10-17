import type { CapacitorConfig } from "@capacitor/cli";

/**
 * The iOS wrapper.
 *
 * WardMate is a server-rendered app — every screen, the sign-in, and the transcription all
 * come from the server — so there is no version of it that can be frozen into an .ipa and
 * shipped. This wrapper therefore does not bundle the app at all: it opens the live site in a
 * native web view, and `capacitor-shell/` exists only because Capacitor requires a web
 * directory to point at.
 *
 * What it buys, and the only reason to build it: a native microphone permission granted once
 * instead of per-session, recording that survives the screen locking mid-round, and a
 * TestFlight link that can be sent to a colleague.
 *
 * The consequence to remember: because the app is the live site, a `vercel --prod` deploy
 * updates the native app too. Nothing needs rebuilding or resubmitting for a normal change.
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
    allowNavigation: ["wardmate.in", "www.wardmate.in", "*.supabase.co"],

    // First open with no signal, before the offline cache exists: the "cannot reach" page in
    // capacitor-shell/ rather than a blank white screen.
    errorPath: "index.html",
  },

  // How the site knows it is inside this app (app/install-hint.tsx): the web view reports
  // itself as Safari otherwise, and the install banner and the Google button both need hiding.
  appendUserAgent: "WardMateApp",

  ios: {
    // The web app already draws its own safe-area padding from env(safe-area-inset-*), so the
    // web view must not add its own inset on top of it — that is what puts a grey band under
    // the status bar and a second gap above the home indicator.
    contentInset: "never",

    // The offline cache (public/sw.js) only runs in an iOS web view for the domains listed under
    // WKAppBoundDomains in Info.plist, and only with this on. Off, the app had no offline
    // screens at all and waited on the network for every one. Links to anywhere not listed
    // still open in Safari: Capacitor sends them there before WebKit's own block applies.
    limitsNavigationsToAppBoundDomains: true,
  },
};

export default config;
