# Mobile UX and Capacitor Readiness Audit

Date: 2026-06-12

## Scope

Audited Telugu Tales as a Capacitor Android app while preserving the existing desktop website and Vercel deployment path.

Verification included:

- Mobile portrait reader layout at 393 x 852.
- Mobile landscape reader layout at 852 x 393.
- `npm run build`.
- `npm run build:capacitor`.
- `npx cap sync android`.

## Issues Found

### Layout and Responsiveness

- The story reader used a desktop-like full-screen modal layout on phones.
- Bottom navigation controls were previously forced to the bottom of the phone viewport while the story page content stretched with `flex-1`, which left a large unused blank area after the Telugu and English text on Pixel 8 portrait.
- The first pass moved controls closer to the text, but `.reader-mobile-height` still applied `min-height: 100vh` / `100dvh` to the mobile reader shell, and the page wrappers still used mobile `flex-1`. That kept painting a tall beige canvas below the controls.
- The second pass made the mobile reader shell content-sized, which removed the beige filler but exposed the dark blurred modal backdrop below the controls.
- The underlying broken architecture was a single shared modal layout trying to serve both mobile and desktop. Mobile inherited desktop-style backdrop, absolute inset shell, full-height flex canvas, and breakpoint-driven behavior.
- Short landscape screens made the story image too tall, pushing reading controls and text below the visible viewport.
- Library shelves used generous desktop spacing on mobile, making the native shell feel sparse.
- Safe-area padding was not explicit for status bars, cutouts, or gesture navigation areas.

### Story Reader Experience

- The image, Telugu text, English text, and controls did not prioritize the phone viewport.
- Touch controls were close to acceptable but not consistently native-sized across the reader.
- Reader action controls did not feel anchored to the app surface.
- Adjacent page images were not preloaded, so quick page turns could feel less smooth.

### Mobile Navigation

- Android hardware back behavior was not explicitly handled.
- Users could rely on visible close/previous controls, but the Android back button did not have reader-aware behavior.

### Capacitor Readiness

- Splash behavior was mostly resource-driven but not explicitly configured in Capacitor.
- The app had native icon/splash placeholders, but startup config was minimal.
- The read-aloud API needs a deployed `VITE_TTS_API_ORIGIN` for Android because the native WebView is not served by the Vercel server route.

### Mobile Performance

- The production bundle is still large, mostly due to story art and app-wide imports.
- Several story images and character assets are multi-megabyte files.
- The first visible story image is now prioritized, but broader image optimization remains a future opportunity.

### Accessibility

- Some mobile controls were below the ideal 44 px native touch target.
- The story reader needed stronger bottom gesture-area clearance.
- Telugu text size was readable, but the text block needed better responsive sizing.

## Changes Made

### Mobile Layout

- Added safe-area CSS variables and utilities:
  - `.safe-x`
  - `.safe-top`
  - `.safe-bottom`
- Switched key mobile surfaces to `100dvh`-aware sizing.
- Added `overscroll-behavior-y: none` to reduce native-shell bounce/jank.
- Tightened mobile library spacing while preserving desktop breakpoints.

### Story Reader

- Reworked the mobile reader as an app-like full-height screen.
- Split `StoryReaderModal` into separate mobile and desktop/tablet layout branches:
  - `.reader-mobile` for phone portrait and short phone landscape.
  - `.reader-desktop` for desktop/tablet modal behavior.
- Made the header safe-area aware and more compact on mobile.
- Moved previous/progress/next controls into the natural mobile reading flow for portrait, so controls appear shortly after the English text instead of leaving a tall blank gap.
- Kept previous/progress/next controls anchored to a bottom safe-area control bar only in short landscape, where reachability matters more than vertical flow.
- Removed mobile dependence on `.reader-shell`, `.reader-body`, and `.reader-scroll`.
- Removed mobile `min-h-[100dvh]`, `flex-1`, and full-height scroll wrappers from the story content path.
- Kept the mobile outer reader as a fixed route-like screen with `overflow-y-auto` and cream background, while the mobile content wrapper remains height-auto.
- Preserved the desktop control layout at `sm` and above.
- Increased mobile touch targets to 44-48 px where needed.
- Reduced wasted vertical space between image, Telugu text, English text, and controls.
- Added short-landscape media rules so story art stays visible without swallowing the viewport.
- Added adjacent story-page image preloading.
- Added eager/high-priority loading for initial reader images.
- Improved offline/read-aloud error messaging.
- Added a 15 second TTS request timeout.

### Android Navigation

- Added `@capacitor/app`.
- Added native-only Android back button handling in the story reader:
  - Back closes the celebration overlay if shown.
  - Back goes to the previous page if the reader is past page one.
  - Back closes the story if on page one.
- The listener is dynamically imported only in `capacitor://` so the normal website does not load native code upfront.

### Capacitor Configuration

- Added explicit SplashScreen configuration in `capacitor.config.ts`.
- Kept native splash assets and icons as placeholders.
- Verified sync detects `@capacitor/app@8.1.0`.

## QA Results

### Pixel 8 Mobile Reader Refactor

Issue found:

- On Pixel 8 portrait, the reader repeatedly showed broken modal artifacts: a large empty beige area, exposed dark blurred backdrop, or controls that felt disconnected from the story content.

Root cause:

- The first gap came from the current page wrapper and reader copy area growing with `flex-1` while controls were positioned at the bottom of the viewport.
- The remaining blank beige area came from `className="reader-mobile-height absolute inset-0 flex flex-col bg-cream"` on the reader shell, where `.reader-mobile-height` set `min-height: 100vh` and `min-height: 100dvh`. The body and scroll wrappers also still had mobile `flex-1`, so the cream reader canvas filled the full Pixel 8 viewport even when content ended around the controls.
- The follow-up dark-overlay issue came from making `.reader-shell` content-height only with `absolute inset-x-0 top-0 max-h-[100dvh]`; once the shell ended after the controls, the parent `fixed` backdrop was still visible below it.
- The final root cause was the shared mobile/desktop modal architecture. Mobile needed a route-like reader screen, not overrides on a desktop modal.

Fix applied:

- Added a dedicated `.reader-mobile` branch in `StoryReaderModal.tsx`:
  - `fixed inset-0`
  - `overflow-y-auto`
  - `bg-cream`
  - no modal card/backdrop inheritance
  - no mobile `flex-1`, `grow`, or `justify-between`
  - controls in normal document flow immediately after text
- Added a separate `.reader-desktop` branch that preserves the desktop/tablet modal behavior and dark blurred backdrop.
- Scoped short-landscape rules to `.reader-mobile` only and explicitly hide `.reader-desktop` in short phone landscape.
- Removed the old mobile classes from the phone path:
  - `.reader-shell`
  - `.reader-body`
  - `.reader-scroll`
  - mobile `min-h-[100dvh]`
  - mobile `sm:flex` branch inheritance
- Increased the mobile story image height using `.reader-mobile .reader-scene-media` so the page feels closer to Google Read Along without using spacer elements.
- Tuned portrait story art to `height: clamp(20rem, 55dvh, 30rem)` so the controls land near the bottom of Pixel 8 naturally.

Remaining recommendation:

- Test this flow on a physical Android device with gesture navigation enabled, because emulator safe-area behavior can differ slightly from real display cutouts and bottom gesture areas.

### Portrait

Viewport: 393 x 852

- No horizontal overflow.
- Story image uses more of the phone viewport without a flex spacer.
- Reader controls sit naturally after the English text, with no large blank gap.
- Mobile content wrapper is height-auto and ends about 16 px after controls.
- Area below controls resolves to `.reader-mobile` cream background, not the dark blurred backdrop.
- Text-to-controls gap remains about 20 px at 393 x 852.
- Page 1 leaves about 68 px after controls; page 2 leaves about 25 px after controls. Both are clean cream background, not spacer-driven layout.
- Main controls measure 44-48 px high.
- Desktop branch is hidden in portrait mobile.

### Landscape

Viewport: 852 x 393

- No horizontal overflow.
- `.reader-mobile` is forced on and `.reader-desktop` is forced off for short phone landscape.
- Story image height is fixed to 30dvh in short landscape.
- Play and page controls remain visible/reachable.
- Reader can still scroll if content exceeds the short viewport.

### Story Artwork Fit

Issue found:

- Some reader illustrations were cropped on mobile, especially wide generated images such as Monkey and the Crocodile and Moonlight Rhymes.

Root cause:

- The reader image used `object-cover` inside a tall mobile media frame. That preserved the filled-frame look, but it zoomed wide images until their left and right edges were clipped.

Fix applied:

- Replaced the reader foreground image with `.reader-scene-image` using `object-contain`, so the full illustration is always visible.
- Added a separate decorative `.reader-scene-backdrop` image behind it using a blurred `object-cover` duplicate, so mismatched image aspect ratios still feel intentional instead of leaving a harsh empty frame.
- Kept the mobile media frame height tuning, so this does not reintroduce the earlier large page-level gap below controls.
- Added a short-landscape padding override for the contained foreground image.

Remaining recommendation:

- For best quality and consistent composition, eventually regenerate or crop-export all story illustrations to one shared aspect ratio, then the blurred backdrop can be reduced or removed.

### Android Read-Aloud

Issue found:

- In the Capacitor Android app, tapping read-aloud showed `Couldn't load audio. Try again.`

Root cause:

- The website can call the server route at `/api/tts`, but the Android app is bundled as static files inside a Capacitor WebView. Without `VITE_TTS_API_ORIGIN`, the native app had no deployed backend origin for `/api/tts`, so TTS requests failed.
- The first native check was too narrow for this app: Android is configured with `androidScheme: "https"`, so the WebView runs as `https://localhost`, not `capacitor://...`. That meant the reader still used the website-relative `/api/tts` path in Android.
- Android then calls the deployed Vercel route from a different origin, so `/api/tts` also needed explicit CORS headers and an `OPTIONS` handler.
- Browser address-bar tests use `GET /api/tts`, but TTS playback uses `POST /api/tts`. Without an explicit `GET` handler, TanStack SSR rendered the route document, which made the API look like it was returning the React app.

Fix applied:

- Changed the Capacitor TTS URL resolver to use `Capacitor.isNativePlatform()` so Android reliably calls `VITE_TTS_API_ORIGIN/api/tts`.
- Added CORS support to `/api/tts` for Android WebView requests from `https://localhost`.
- Added an explicit `GET /api/tts` 405 JSON response so manual browser checks no longer receive the app shell.
- Added a device/browser speech fallback for Capacitor. Sarvam remains the primary path when `VITE_TTS_API_ORIGIN` is configured; if that is missing or unreachable, Android can still read the Telugu text through `speechSynthesis` when available.
- Kept word highlighting active during the fallback using an estimated word timing path.
- Added `.env.example` and updated `CAPACITOR_SETUP.md` with the required Android TTS origin.

Remaining recommendation:

- Set `VITE_TTS_API_ORIGIN` to the deployed Vercel app URL before generating Play Store builds so Android uses the same Sarvam voice and server-side audio cache as the website.
- Use `VITE_TTS_API_ORIGIN=https://gptteluguwithraja.vercel.app npm run cap:sync` or export the variable before `npm run cap:sync`; running only `npx cap sync android` copies the last built bundle and will not bake in a changed Vite environment variable.

### Build Verification

Passed:

```bash
npm run build
npm run build:capacitor
npx cap sync android
```

Capacitor sync result:

- Web assets copied into Android.
- Capacitor config regenerated.
- Android plugins updated.
- `@capacitor/app@8.1.0` found.

## Remaining Recommendations

- Compress and resize large story images and Meenu PNGs. Many assets are 2-3 MB each.
- Consider responsive image variants for covers and story pages.
- Code-split the story library or lazy-load reader/story data to reduce first-load JavaScript.
- Add a native offline screen or toast for whole-app connectivity loss, not just TTS playback.
- Add Android Status Bar plugin if you want fine control over status bar color and icon contrast.
- Add real production app icon and splash art before Play Store submission.
- Test on physical Android devices, especially gesture navigation, display cutouts, and low-end hardware.
- Run Android Studio/Gradle verification after installing Android Studio and a JDK on the machine.
