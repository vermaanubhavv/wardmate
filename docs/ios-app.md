# The iOS app

WardMate on the App Store is the website in a native shell. It is not a second app, and there
is no second codebase.

## Why it exists

The home-screen PWA is genuinely good — it installs, it works offline, it looks native. Three
things it cannot do, and they are the entire reason for this wrapper:

1. **Microphone permission is granted once**, to the app, instead of being re-asked by Safari.
2. **Recording survives the screen locking.** A round is twenty minutes with a phone going in
   and out of a pocket; Safari stops the microphone, a native app with the `audio` background
   mode does not.
3. **TestFlight.** A link a colleague taps, rather than a spoken instruction about the Share
   button.

## How it works

`capacitor.config.ts` points a native web view at `https://wardmate.in`. Nothing is bundled:
every screen, the sign-in and the transcription all come from the server, exactly as they do in
the browser.

The consequence worth remembering: **`vercel --prod` updates the native app too.** A normal
change needs no rebuild, no resubmission, and no App Store review. Only the things listed in
"When a rebuild is needed" below do.

`capacitor-shell/index.html` is a single page saying the app could not reach the site. It is the
web directory Capacitor insists on and should never be seen.

## Offline and weak signal

The app uses the same offline cache as the home-screen PWA (`public/sw.js`). An iOS web view
only runs a service worker for the domains listed under `WKAppBoundDomains` in
`ios/App/App/Info.plist`, and only with `limitsNavigationsToAppBoundDomains: true`. Before both
were set, the app had no offline screens at all. A new domain the app must load goes in both
lists, Info.plist's and `allowNavigation`; `localhost` stays, because the "cannot reach" page
(`errorPath`) is served from it.

A screen gets three seconds of network (`PATIENCE_MS` in `sw.js`) before the saved copy is
shown, because one bar of signal stalls a fetch rather than failing it. A saved copy always
carries the orange bar naming the time it was fetched, whether the phone is offline or just
slow (`app/connection-bar.tsx`).

## Sign-in inside the app

**Both sign-ins work: the six-digit email code, and "Continue with Google".** Google refuses
OAuth inside an embedded web view (`disallowed_useragent`), so the app does not load Google in
the web view. The login page asks Supabase for the Google URL without going to it
(`skipBrowserRedirect`) and posts it to the native `googleSignIn` handler
(`ios/App/App/SceneDelegate.swift`), which opens it in Apple's sign-in sheet
(`ASWebAuthenticationSession`) — the system browser, which Google accepts. Google returns to
`in.wardmate.app://auth/callback?code=…`; the sheet closes and the web view loads the site's own
`/auth/callback?code=…`, which exchanges the code exactly as on the web (the PKCE verifier was
set in the web view's cookies when the URL was asked for). A closed sheet comes back as
`error=cancelled`.

**`in.wardmate.app://auth/callback` must be in Supabase → Authentication → URL Configuration →
Redirect URLs.** Without it Supabase sends the sheet to the Site URL instead and it never
returns to the app.

An app build from before the handler has no way to open the sheet, so there the button stays
hidden (`googleSignInSheet()` in `app/login/page.tsx`). The "Put WardMate on your home screen"
banner is hidden in the app too: the web view's user agent ends in `WardMateApp`
(`appendUserAgent` in `capacitor.config.ts`), and `isNativeApp()` in `app/install-hint.tsx`
checks for it.

## Going back

A swipe in from the left edge goes back a screen (`allowsBackForwardNavigationGestures`), as in
Safari. Every screen also has a back bar pinned under the status bar (`BackBar`,
`app/screen-header.tsx`).

## Building it

CocoaPods is not used — the project resolves its dependencies with Swift Package Manager
(`npx cap add ios --packagemanager SPM`), so a Mac with Xcode alone is enough.

```bash
npx cap sync ios      # after any config or icon change
npx cap open ios      # opens Xcode
```

In Xcode: select the **App** target → **Signing & Capabilities** → tick *Automatically manage
signing* and choose your Apple ID team. Then pick your iPhone from the device menu and press ▶.

- With a **free** Apple ID the app installs on your own phone and stops working after 7 days.
- With the **paid** Apple Developer Program ($99/year) you get TestFlight and 90-day builds.

## Testing an unreleased branch on a real phone

Change `server.url` to your Mac's LAN address, add `cleartext: true`, `npx cap sync ios`, and
rebuild:

```ts
server: { url: "http://192.168.1.x:3000", cleartext: true }
```

Set it back to `https://wardmate.in` before building anything you give to somebody else.

## When a rebuild is needed

Only for things baked into the .ipa: the app icon and splash (`assets/`, regenerated with
`npx @capacitor/assets generate --ios --iosProject ios/App`), the permission wording in
`ios/App/App/Info.plist`, `capacitor.config.ts`, and the Capacitor version itself. Everything
else is a deploy.
