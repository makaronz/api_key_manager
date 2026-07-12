# AGENTS.md

## Cursor Cloud specific instructions

### What this project is
API Key Manager is a **dual-platform** app (see `README.md`):
- A **macOS desktop** build (Electron + `keytar` / macOS Keychain).
- A **web** build (React + Vite, keys stored in `localStorage`).

### Runnable scope in Cloud (Linux)
Only the **web version** runs in this Linux Cloud environment. The Electron
desktop build targets macOS only (it depends on the macOS Keychain via `keytar`),
so `npm run dev` / `npm run dist:mac` are not runnable here. Use the web scripts.

Standard commands are documented in `README.md` and `package.json` scripts. The
web-relevant ones:
- `npm run check` — TypeScript (`tsc --noEmit`) + ESLint. Works everywhere.
- `npm run dev:web` — Vite dev server on `http://localhost:5173` (`strictPort`, so
  free the port first if it's taken).
- `npm run build:web` — production web build into `dist-web/`.

### Non-obvious gotchas
- **`NODE_ENV=production` is set in this environment.** Plain `npm install` therefore
  **omits devDependencies** (vite, eslint, typescript, electron, etc.), leaving the
  project unbuildable. Always install with `npm install --include=dev` (the update
  script does this). This is the single most important setup detail.
- The web store transparently falls back to `localStorage` when `window.electronAPI`
  is absent (`src/stores/apiKeyStore.ts`), which is why the web app is fully
  functional without Electron. Some UI actions that are Electron-only (copy to
  clipboard, open external URL, save-to-file) call `window.electronAPI` directly and
  will throw in the browser — the core add/edit/delete/search/persist flows do not.
- `postcss.config.js` emits a harmless "module type not specified" warning during
  Vite builds; it does not affect output.
