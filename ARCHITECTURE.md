# api_key_manager — ARCHITECTURE

## Overview
Dual-target app:
- Desktop: Electron main process + React renderer (Keychain via `keytar`)
- Web: React app build (no Electron APIs)

## Key Paths
- Electron main: `electron/main.ts`
- Electron preload (exposed API): `electron/preload.ts`
- Renderer entry: `src/main.tsx`
- App UI component: `api-key-manager.tsx`
- Vite configs: `vite.config.ts` (desktop), `vite.config.web.ts` (web)
- Packaging: electron-builder config in `package.json` → `build` section
- Web deploy: `vercel.json`
- HTML shell (CSP): `index.html`

## Dev & Ports
- Vite dev server: `http://localhost:5173` (see `vite.config.ts`)
- Electron dev waits for Vite: `scripts.dev:electron` uses `wait-on http://localhost:5173`
- Electron main loads:
  - dev: `loadURL('http://localhost:5173')`
  - prod: `loadFile('../dist/index.html')`

## Electron Main (security & windows)
- Window opts: `contextIsolation: true`, `webSecurity: true`, `allowRunningInsecureContent: false` (in `electron/main.ts`)
- Deny new windows: `web-contents-created` + `setWindowOpenHandler(() => ({action:'deny'}))`
- macOS build focus: electron-builder `mac` target (DMG), hardenedRuntime and entitlements

## IPC Surface (from `electron/main.ts` / bridged in `electron/preload.ts`)
- `keychain:setPassword(service, account, password)` → keytar.setPassword
- `keychain:getPassword(service, account)` → keytar.getPassword
- `keychain:deletePassword(service, account)` → keytar.deletePassword
- `keychain:findCredentials(service)` → keytar.findCredentials
- `file:showOpenDialog()` / `file:showSaveDialog(defaultPath?)` / `file:readFile(path)` / `file:writeFile(path, content)`
- `system:openExternal(url)`
- `clipboard:writeText(text)`

These are exposed to renderer via `window.electronAPI` in `preload.ts`.

## Renderer (React)
- Entry: `src/main.tsx`
- App logic/UI: `api-key-manager.tsx`, Zustand stores under `src/stores/*`, service config in `src/data/apiServices.ts`
- Web fallback: when `window.electronAPI` is undefined, storage uses `localStorage` (see `src/stores/apiKeyStore.ts`)

## Builds
- Desktop build: `npm run build` → `vite build` (frontend) + `tsc -p electron` → `dist/`
- Desktop package: `npm run dist` / `npm run dist:mac` (electron-builder) → `release/`
- Web build: `npm run build:web` → `dist-web/` (see `vite.config.web.ts` & `vercel.json`)

## Security hardening present in code
- CSP meta in `index.html`
- Electron context isolation + limited IPC
- macOS hardened runtime/entitlements in `assets/entitlements.mac.plist`

## Data flow

• **Desktop mode:** React renderer ➜ `window.electronAPI` ➜ IPC bridge in `preload.ts` ➜ Electron **main** handlers ➜ native modules (`keytar`, `fs`, Electron system APIs).  
• **Key storage path:** Renderer call `keychain.setPassword` ➜ IPC ➜ `keytar` writes secret to macOS Keychain.  
• **File ops:** Renderer invokes `file:readFile`/`file:writeFile` ➜ main reads/writes via Node `fs`.  
• **Web mode fallback:** When `window.electronAPI` is undefined, renderer stores keys in **localStorage** and uses standard Web APIs for file download / upload and clipboard access.
