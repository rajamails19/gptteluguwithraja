# Capacitor Android Setup

This project now has a separate Capacitor Android wrapper for the existing Telugu Tales web app.

## App Identity

- App name: `Telugu Tales`
- Android package id: `com.raseklabs.telugutales`
- Capacitor config: `capacitor.config.ts`
- Android project: `android/`
- Capacitor web output: `dist-capacitor/`

## What Changed

- Added Capacitor dependencies:
  - `@capacitor/core`
  - `@capacitor/cli`
  - `@capacitor/android`
- Added `capacitor.config.ts`.
- Added a dedicated mobile-only Vite config: `vite.capacitor.config.ts`.
- Added a Capacitor HTML shell: `capacitor/index.html`.
- Added a Capacitor React entry point: `src/capacitor-main.tsx`.
- Added `scripts/finalize-capacitor-build.mjs` so Capacitor receives `dist-capacitor/index.html`.
- Added Android native project under `android/`.
- Added app icon and splash placeholders:
  - Source placeholders: `resources/icon-placeholder.svg`, `resources/splash-placeholder.svg`
  - Android launcher/splash resources under `android/app/src/main/res/`
- Added Android release signing support through environment variables in `android/app/build.gradle`.
- Left `vite.config.ts` and `vercel.json` unchanged so Vercel deployment continues to use `npm run build`.

## Scripts

```bash
npm run build
npm run build:capacitor
npm run cap:sync
npm run cap:open
npm run cap:copy
```

## Read-Aloud API In Android

The website continues to call `/api/tts`.

Inside Capacitor, the app is bundled as static files inside Android, so relative `/api/tts` does not have a local server route to call. For the production Sarvam voice, set a deployed backend origin before building/syncing:

```bash
VITE_TTS_API_ORIGIN=https://your-vercel-domain.vercel.app npm run cap:sync
```

Do not run only `npx cap sync android` after changing this value. The origin is baked into the Vite JavaScript bundle, so the Capacitor web assets must be rebuilt first. `npm run cap:sync` does both steps: it runs `npm run build:capacitor`, then syncs Android.

This is also valid:

```bash
export VITE_TTS_API_ORIGIN=https://your-vercel-domain.vercel.app
npm run cap:sync
```

Without `VITE_TTS_API_ORIGIN`, the Android shell still builds and opens. The reader falls back to the device/browser Telugu speech engine when available, but Sarvam audio and server-side audio caching require `VITE_TTS_API_ORIGIN`.

For local setup, copy `.env.example` to `.env.local` and fill in:

```bash
VITE_TTS_API_ORIGIN=https://your-vercel-domain.vercel.app
```

## Verification

Completed:

```bash
npm run build
npm run build:capacitor
npx cap sync android
```

Results:

- `npm run build` succeeds and still outputs the Vercel/Nitro build.
- `npm run build:capacitor` succeeds and outputs `dist-capacitor/index.html`.
- `npx cap sync android` succeeds and copies assets into `android/app/src/main/assets/public`.

Android Studio:

```bash
npx cap open android
```

Result on this machine:

- Capacitor attempted to open `/Applications/Android Studio.app`.
- Android Studio was not installed at that path, so the command could not launch it.
- Install Android Studio or set `CAPACITOR_ANDROID_STUDIO_PATH`, then rerun `npm run cap:open`.

Gradle:

```bash
cd android
./gradlew projects
```

Result on this machine:

- Blocked because no Java Runtime was available in the shell.
- Install Android Studio/JDK or configure `JAVA_HOME`, then rerun Gradle commands.

## Open In Android Studio

After Android Studio is installed:

```bash
npm run cap:sync
npm run cap:open
```

If Android Studio is installed in a custom location:

```bash
CAPACITOR_ANDROID_STUDIO_PATH="/path/to/Android Studio.app" npm run cap:open
```

## Generate A Signed Play Store AAB

Run from the project root.

1. Create an upload keystore:

```bash
mkdir -p android/keystores
keytool -genkeypair \
  -v \
  -keystore android/keystores/telugu-tales-upload.jks \
  -storetype JKS \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -alias telugu-tales-upload
```

2. Build and sync the Capacitor assets:

```bash
VITE_TTS_API_ORIGIN=https://your-vercel-domain.vercel.app npm run cap:sync
```

3. Generate the signed release AAB:

```bash
cd android
TELUGU_TALES_UPLOAD_STORE_FILE="$PWD/keystores/telugu-tales-upload.jks" \
TELUGU_TALES_UPLOAD_STORE_PASSWORD="your-keystore-password" \
TELUGU_TALES_UPLOAD_KEY_ALIAS="telugu-tales-upload" \
TELUGU_TALES_UPLOAD_KEY_PASSWORD="your-key-password" \
./gradlew bundleRelease
```

4. The signed Play Store bundle will be created at:

```bash
android/app/build/outputs/bundle/release/app-release.aab
```

Do not commit keystore files or real signing passwords.
