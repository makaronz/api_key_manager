# api_key_manager — SETUP

## Prerequisites
- Node.js ≥ 18 (npm comes bundled)
- macOS (required only for building the Electron desktop version that integrates with Keychain)

## Install
```bash
cd /Users/arkadiuszfudali/Git/api_key_manager
npm install          # installs root + electron deps
```

## Development

Desktop (Electron + Vite, hot-reload):
```bash
npm run dev
# → concurrently:
#    1) vite  → http://localhost:5173
#    2) wait-on http://localhost:5173 && electron .
```

Web-only dev preview:
```bash
npm run dev:web      # vite --config vite.config.web.ts (port 5173)
```

Frontend only (no Electron, desktop assets build untouched):
```bash
npm run dev:vite     # vite (desktop config) on port 5173
```

## Build

Desktop bundle (frontend + Electron):
```bash
npm run build        # => vite build (dist/) + tsc -p electron (dist/)
```

Web bundle:
```bash
npm run build:web    # outputs dist-web/ (web-only build)
```

## Distribute (desktop)

Create signed macOS disk-image:
```bash
npm run dist         # cross-platform targets defined in package.json "build"
npm run dist:mac     # mac-only DMG build
```
Artifacts are placed in `release/`.

## Notes
- Dev server & Electron dev target both expect **http://localhost:5173** (see `vite.config*.ts`).
- In production the Electron main process loads `dist/index.html`; in dev it loads the Vite URL.
- Web deployment template is configured in `vercel.json` (`build:web` + `dist-web/`).
- Use `npm run check` or `npm run lint` before committing to run TypeScript and ESLint.
