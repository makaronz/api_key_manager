# api_key_manager — V2 ARCHITECTURE

## 1. Targets & Use-cases  
| Target | Purpose | Output |
|--------|---------|--------|
| **Web** | Browser-only password manager (dev/demo) | `dist/` bundle served by any static host |
| **Desktop** | Secure credential vault using OS keychain | macOS `.dmg`, Windows `.exe` via `electron-builder` |

## 2. Tech Stack  
• Node 20 + pnpm workspaces  
• Electron 30 (Chromium 124) — `electron/` folder  
• React 18 + Vite — `src/` (renderer + web build)  
• Zustand — state management (`src/store/`)  
• TypeScript everywhere (strict)  

## 3. Directory Layout (key paths)  
```
electron/
  ├─ main.ts        # Main-process: windows, menu, IPC handlers
  └─ preload.ts     # Context-isolated bridge → window.electronAPI
src/
  ├─ index.tsx      # React root
  ├─ store/         # Zustand slices (ui, credentials…)
  ├─ services/      # HTTP & keychain adapters
  └─ components/    # UI
vite.config.ts      # Common config for web & renderer
package.json        # root scripts (pnpm monorepo)
```

## 4. Runtime Flow  
1. **Desktop launch**  
   - `electron .` → `main.ts` creates `BrowserWindow` with `preload.js`  
   - Renderer bootstraps React app (`index.tsx`).  
2. **Web launch**  
   - `pnpm web:dev` → Vite serves React at `http://localhost:5173`.  
3. **IPC contract (preload.ts)**  
   - Exposes minimal, typed API on `window.electronAPI`  
   - Channels:  
     • `keychain.*` → wrap **keytar** ops  
     • `file.*` → open/save dialogs + fs  
     • `system.openExternal` → shell links  
     • `clipboard.writeText` → secure copy  

## 5. State & Services  
- **Zustand stores** keep transient UI state; sensitive data cleared on window blur.  
- `src/services/keychain.ts` calls `electronAPI.keychain.*` (desktop) or falls back to `localStorage` mock (web).  
- `src/services/config.ts` centralises base URL, feature flags, version.

## 6. Configuration & Environment  
| File | Variable | Note |
|------|----------|------|
| `.env.example` | `VITE_API_BASE` | optional remote sync service |
| `src/services/config.ts` | `APP_MODE` | `'web' | 'desktop'` inferred at runtime |

No secrets committed; desktop build relies on OS keychain.

## 7. Build & Dev Commands  
| Task | Command |
|------|---------|
| Web dev | `pnpm web:dev` |
| Web prod build | `pnpm web:build` |
| Electron dev | `pnpm electron:dev` |
| Electron package (mac) | `pnpm electron:pack` |
| Lint & type-check | `pnpm lint && pnpm typecheck` |

Scripts defined in root `package.json`.

## 8. Continuous Integration (Stage 4)  
`.github/workflows/node.yml` (Node 20):  
1. Install → `pnpm install --frozen-lockfile`.  
2. Run `lint`, `typecheck`, `test:web`.  
3. Cache `.pnpm-store`.  
4. Electron packaging job optional & macOS-only (manual trigger).

## 9. Security Notes  
- **Context Isolation** enabled; `nodeIntegration` disabled.  
- Preload whitelist only exposes safe IPC; validate inputs in **main**.  
- Credentials saved with **keytar** (desktop). Web fallback is current `localStorage`; Target (V2): encrypted IndexedDB.
- Secrets never persist in Zustand; reset on app quit / browser tab close.  
- Gitleaks & Semgrep run in CI (warn-only initially).

## 10. Next Steps (Stage 4)  
- Add `.env.example`, `.editorconfig`, pre-commit hooks.  
- Write unit tests for IPC wrappers (`vitest + @testing-library/react`).  
- Draft Electron packaging workflow (`electron-builder --publish=never`).  

_This document defines the actionable V2 architecture for api_key_manager and will guide Stage 4 container & CI scaffolding._
