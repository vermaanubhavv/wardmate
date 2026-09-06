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

## Sign-in inside the app

**Use the six-digit email code. "Continue with Google" will not work.** Google refuses OAuth
inside an embedded web view (`disallowed_useragent`), so `allowNavigation` deliberately does not
list Google and that button leaves the app for Safari — where signing in does the app no good,
because the two keep separate cookies. Making Google work in here means adding a native OAuth
plugin; it has not been done.

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
