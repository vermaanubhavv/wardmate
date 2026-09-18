# The Android app

WardMate for Android is the website in a native shell, same as `docs/ios-app.md` describes for
iOS. It is not a second app, and there is no second codebase.

## Why it exists

Android users have been reporting live dictation cutting out or refusing to start at all in the
browser PWA. Two causes, both fixed by a native shell and neither fixable from web code alone:

1. **Mobile Chrome re-prompts for the microphone every session**, and on some OEM builds
   (notably some Xiaomi/Vivo/Oppo skins) silently denies `getUserMedia` audio instead of
   prompting at all. A native shell asks once, through Android's own permission dialog
   (`RECORD_AUDIO` in `AndroidManifest.xml`), and the grant sticks.
2. **TestFlight-equivalent distribution.** A `.apk` a colleague sideloads, rather than a spoken
   instruction about "Add to Home Screen."

## Surviving a locked screen mid-round

Android has no manifest-only equivalent of iOS's `UIBackgroundModes: audio`. Backgrounding an app
on Android suspends its WebView the same way it would a Chrome tab, so without more than a
manifest key the recording would end the moment the phone goes in a pocket.

The fix is a **foreground service**: `RecordingForegroundService.java` holds a persistent
"WardMate is recording" notification (Android's price of admission for keeping a process alive
in the background) with `foregroundServiceType="microphone"`, which is what actually keeps the
WebView's `getUserMedia` stream open through a lock. `RecordingServicePlugin.java` is the
Capacitor bridge that starts and stops it; `lib/stt/background-service.ts` is the web-side
wrapper, called from `lib/stt/live.ts` around every live dictation session (both
`app/patients/[id]/recorder.tsx`'s bedside recorder and the case-history dictation overlay run
through it, since both call `openLiveDictation`). It is a genuine no-op on the browser and iOS —
`registerPlugin` is only ever invoked behind an `isAndroidNative()` check.

**This does not cover the record-then-upload ("batch") path** — `round-recorder.tsx`,
`speak-patient.tsx`, `case-history-capture.tsx`, all on `lib/use-dictation.ts`. That path
deliberately stops and salvages the partial recording on `visibilitychange → hidden` rather than
trying to keep running headless (see that file's own comments), so backgrounding it still ends
the round early by design — the foreground service would keep the mic open, but there is nothing
in that path that resumes writing to the same recorder afterward. If batch recordings losing
data on lock becomes a live complaint, extending the service to that path is the next piece of
work, not a config tweak.

## How it works

`capacitor.config.ts` points a native WebView at `https://wardmate.in`, same as the iOS config.
Nothing is bundled: every screen, the sign-in and the transcription come from the server, exactly
as they do in the browser. `android/` is generated from that config by `npx cap add android` /
`npx cap sync android` — it is not hand-written, and most of it should never be hand-edited.

The consequence worth remembering: **`vercel --prod` updates the native app too.** A normal
change needs no rebuild and no re-distribution. Only the things listed in "When a rebuild is
needed" below do.

## Sign-in inside the app

Same caveat as iOS: **use the six-digit email code.** "Continue with Google" leaves the app for
the system browser (Google refuses OAuth inside an embedded WebView), and the two keep separate
cookies, so signing in out there does the in-app session no good.

## Building it

This repo cannot build the `.apk` itself — the Android SDK and build tools come from
`dl.google.com`, which this sandbox's network policy blocks, so a build has to happen on a
machine (or CI runner) with the Android SDK already installed. What's checked in is everything
short of that: the generated `android/` project, the manifest permissions, and the app icons —
`npx cap sync android` is already done and does not need re-running unless `capacitor.config.ts`
or `assets/` changes.

On a machine with Android Studio (or just the SDK + a JDK 17-21):

```bash
npm install
npx cap sync android      # only after a config, icon, or dependency change
```

Then either open `android/` in Android Studio and press ▶, or from the command line:

```bash
cd android
./gradlew assembleDebug    # unsigned debug .apk, installable via adb or sideloading
```

The output lands at `android/app/build/outputs/apk/debug/app-debug.apk`. For a release build to
hand out or put on the Play Store, it needs a signing key (`./gradlew assembleRelease` plus a
`keystore` — not set up yet) rather than the debug one.

## Testing an unreleased branch on a real phone

Same trick as iOS: point `server.url` at your machine's LAN address with `cleartext: true`, then
resync and rebuild:

```ts
server: { url: "http://192.168.1.x:3000", cleartext: true }
```

Set it back to `https://wardmate.in` before building anything you hand to somebody else.

## When a rebuild is needed

Only for things baked into the `.apk`: the app icon and splash (`assets/`, regenerated with
`npx @capacitor/assets generate --android --androidProject android`), the permissions in
`android/app/src/main/AndroidManifest.xml`, `capacitor.config.ts`, and the Capacitor/Gradle
versions themselves. Everything else is a deploy.
