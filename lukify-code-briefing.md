# Briefing for Claude Code – "Lukify's Punkte" app: enhancements + GitHub publication

## 0. Mission (execute end to end, no check-ins)

Take the existing single-file web app `index.html` (a kids' points and rewards PWA), apply the enhancements in Part A, then publish it to GitHub Pages using my authenticated GitHub account (Part B). Work autonomously from start to finish. Only report back at the very end with: the live URL, a short changelog, and any item you could not complete.

Working preferences:
- High autonomy. Do not pause for confirmation between steps. Make reasonable decisions and proceed.
- Preserve all existing functionality and the German UI strings exactly. Do not translate anything.
- Writing rule for any text you add (UI copy, README, comments, commit messages): never use the long dash (em dash). Use the short dash (en dash, "–") or rephrase.
- Do NOT change the localStorage key (currently `pontosLukas:v5`). Existing user data must survive updates.
- After every code change, validate JS syntax with `node --check` on the extracted script. The app must stay error-free.

## 1. Current state (context)

`index.html` is a self-contained app (HTML + CSS + vanilla JS, no external runtime dependencies, system fonts). It already includes:
- A points/stars economy for a 10-year-old (child "Lukify", T-Rex theme).
- macOS-style light "glass" UI (frosted panels, traffic-light titlebar, bottom Dock), turquoise-to-blue gradient wallpaper, animated glass sheen.
- Categories for tasks (Haushalt, Schule, Körperpflege, Verhalten, Gesundheit) and rewards (Leckereien, Bildschirmzeit, Erlebnisse, Große Ziele), each with its own accent color.
- Pending/approval workflow: the child files entries that stay "pending" until a parent approves them in the "Freigabe" tab, gated by a 4-digit PIN (adult mode). Reward requests work the same way.
- Calendar in the "Verlauf" tab (days with earned stars highlighted, color by amount), full history with date and time, levels, streak, confetti and sound, fully editable tasks/rewards with emoji + category pickers.
- Data persistence in `localStorage` under key `pontosLukas:v5`.
- A Daten-Backup section (export/import the full state as a JSON file).
- Responsive layout with tablet breakpoints and a landscape optimization (target device: Android tablet, landscape).
- A PWA manifest generated at runtime via a Blob URL, and icons generated at runtime via canvas. Meta tags for `apple-mobile-web-app-*` are present.

The app is functional and QA-passed. The goal of Part A is production hardening and a few high-value enhancements, not a redesign.

## 2. Part A – App enhancements

Implement A1 to A4 (required). A5 is optional if time allows. Keep everything else intact.

### A1. Turn it into a real offline PWA (required)

Right now the manifest and icons are injected at runtime, so the install experience and offline support on Android are weak. Convert to a proper static PWA:

1. Create a static `manifest.webmanifest` file with:
   - `name`: "Lukify's 🦖 Punkte", `short_name`: "Lukify"
   - `start_url`: "./", `scope`: "./", `display`: "standalone", `orientation`: "any" (the app handles both, but landscape is the primary use), `lang`: "de"
   - `background_color`: "#14b8a6", `theme_color`: "#0a84ff"
   - `icons`: reference real PNG files (see step 2), sizes 192 and 512, `purpose`: "any maskable"
2. Generate three real PNG icon files and place them next to `index.html`:
   - `icon-192.png` (192x192), `icon-512.png` (512x512), `apple-touch-icon.png` (180x180)
   - Visual: rounded-square ("squircle") with a diagonal gradient from `#5eead4` to `#22d3ee` to `#0a84ff`, and a centered white five-point star. This matches the in-app canvas icon. Use any available tooling (a small Node script with `canvas`/`sharp`, ImageMagick, or a headless render). Keep file sizes small.
3. In `index.html`:
   - Add `<link rel="manifest" href="./manifest.webmanifest">` and `<link rel="apple-touch-icon" href="./apple-touch-icon.png">` in the head.
   - Remove (or keep but make harmless) the runtime manifest/icon injection so it does not override the static manifest. Prefer removing the runtime `setupPWA` manifest/icon code and keep the function as a no-op or delete its calls, without breaking anything else.
   - Register a service worker (see step 4).
4. Add a service worker `sw.js` that precaches the app shell for offline use: `./`, `./index.html`, `./manifest.webmanifest`, `./icon-192.png`, `./icon-512.png`, `./apple-touch-icon.png`. Use a cache-first strategy for these, with a versioned cache name (e.g. `lukify-v1`) and cleanup of old caches on `activate`. Register it from `index.html` with a guard:
   ```js
   if ("serviceWorker" in navigator) {
     window.addEventListener("load", function () {
       navigator.serviceWorker.register("./sw.js").catch(function(){});
     });
   }
   ```
   Important: the service worker only caches the static shell. It must NOT touch or cache `localStorage`. App data stays in `localStorage` as before.

Acceptance: after deploy, the app loads offline (airplane mode) once visited, and Android Chrome offers "App installieren". The home-screen icon is the turquoise-blue star squircle.

### A2. Extend the level ladder (required)

Rewards now reach 10000 stars, but the `LEVELS` array tops out at 2500 ("Legende"). Add higher tiers so there is long-term progression toward the big goals. Keep the existing lower tiers and their colors. Append roughly these (adjust thresholds to feel smooth; keep names German, pick fitting emojis and distinct colors):
- 2500 Legende (existing, keep)
- 4000 Großmeister 🛡️
- 6000 Titan ⚡
- 8000 Eroberer 🐉
- 10000 Mythos 🌌

Make sure the home screen "noch X bis <next level>" and the progress ring still work across all tiers.

### A3. Adult-mode auto-lock (required)

For safety on the child's tablet, automatically leave adult mode after a period of inactivity:
- When `unlocked` is true, start an inactivity timer of 5 minutes. Any user interaction (tap/click anywhere in the app) resets it. On timeout, call `lock()` and re-render.
- Do not auto-lock while a modal that needs adult input is open if that would be disruptive; simplest correct behavior is fine. Keep it lightweight and do not interfere with normal use.

### A4. Accessibility and small polish (required)

- Add `aria-label` to the icon buttons (lock/mute) and to the Dock buttons (use the German labels: Start, Shop, Verlauf, Freigabe, Mehr).
- Add a visible keyboard focus style (`:focus-visible` outline) for buttons and inputs, in keeping with the glass look.
- Verify the calendar renders consistently on phone width, tablet portrait, and tablet landscape (it is capped at `max-width:460px` and centered; confirm it does not stretch oddly).
- Re-check the landscape layout on a typical Android tablet width (around 1280x800): the orb stays compact, task tiles use multiple columns, nothing overflows horizontally.

### A5. Optional (only if quick and safe)

- A subtle one-time "Backup-Erinnerung" note in the Mehr tab if no backup was ever exported (purely a hint, no nagging, no new storage of personal data beyond a simple boolean flag in the existing state object).
- Nothing here should change the data model in a breaking way or change the storage key.

### A6. Guardrails

- Keep the storage key `pontosLukas:v5`.
- Keep all default tasks and rewards exactly as they are (Mikrofon 2000, Spielkonsole 5000, Computer/PC 10000, iPhone 10000, plus the existing smaller items).
- Keep the export/import backup feature working; if the state shape changes (e.g. due to A2/A5), make sure import still validates and loads older backups gracefully (merge over defaults).
- Keep the UI fully in German.
- Final check: extract the inline script and run `node --check`; load the page in a local server and click through Start, Shop, Verlauf, Freigabe (set a PIN, approve an entry), Mehr (export then import the file you just exported), and confirm no console errors.

## 3. Part B – Publish via the connected GitHub repository (Claude Code on the web)

This session runs in the cloud against my connected GitHub repository. Work inside that repository. Do NOT create a new repo and do not use `gh repo create`.

1. Operate on the repository this task was started against. The repository already contains the finalized `index.html` (the starting point), this briefing, and a German `README.md`. Place all deploy files at the repository root: `index.html`, `manifest.webmanifest`, `sw.js`, `icon-192.png`, `icon-512.png`, `apple-touch-icon.png`, and keep `README.md` (you may refine it, but keep it German and do not use the long dash).
2. Commit with a clear message, for example "Lukify Punkte – enhancements, offline PWA, icons". Push the changes. Opening a pull request is expected and fine; I will review and merge it.
3. GitHub Pages: the sandbox usually cannot enable Pages itself. Attempt it only if a GitHub token with repo admin scope is actually available in the environment; if not, do not fail and do not block. Either way, include in the final report the one-time manual step for me to run on GitHub:
   - Repository → Settings → Pages → Source "Deploy from a branch" → Branch `main` → folder `/(root)` → Save.
   - Resulting URL pattern: `https://<my-username>.github.io/<repo-name>/`
4. Once the PR is merged into `main` and Pages is enabled, the app is live at that URL. If you were able to verify it (HTTP 200 and page title "Lukify's 🦖 Punkte"), say so; otherwise state that it goes live after I merge and enable Pages.

Network note: the sandbox network is restricted by default. Prefer tools already present. If generating the PNG icons or any build step needs to install a package, either (a) generate the PNGs with a dependency-free Node script (use the built-in `zlib` to emit valid PNGs) or an already-installed tool, or (b) tell me in the report which domains to allow in the session network settings (for example the npm registry). If real PNG icons cannot be produced in the sandbox, keep the existing runtime-canvas icon as a fallback, still add `sw.js` and a static `manifest.webmanifest`, and note this clearly in the report.

## 4. Final report (only output at the very end)

Provide:
1. The live URL (or the URL pattern it will have once I merge and enable Pages), ready to open on the Android tablet.
2. A short changelog of what changed in Part A.
3. The exact install instruction to relay to me: open the URL in Chrome on the tablet, menu ⋮, "App installieren" (or "Zum Startbildschirm hinzufügen").
4. The update workflow for the future: start a new cloud task on this repo, it pushes a PR, I merge, Pages redeploys automatically; tablet data is preserved because the storage key is unchanged.
5. Any step that needs my manual action: merging the PR, and (if the sandbox could not do it) enabling GitHub Pages once under Settings → Pages → main → /(root). List any network domains I should allow if a build step needed them.

## 5. Definition of done

- App enhanced per A1 to A4, UI still German, `node --check` passes, no console errors in a manual click-through, backup export/import still works, storage key unchanged.
- Changes committed and pushed to the connected repository (PR opened or merged), all deploy files at the repo root.
- Clear final report delivered, including the live URL (or its pattern) and the one-time manual steps for me (merge PR, enable Pages).
