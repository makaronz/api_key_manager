# api_key_manager — RUNBOOK

_Last updated: 2025-09-13_

---

## 1  Processes & Scripts

| Intent            | Script | Notes |
|-------------------|--------|-------|
| **Desktop dev**   | `npm run dev` | Runs Vite on port 5173, then launches Electron after `wait-on` succeeds |
| **Web dev**       | `npm run dev:web` | Pure browser build (same port 5173) |
| **Desktop build** | `npm run build` | Creates `dist/` (renderer) + compiles Electron (`electron/*.ts`) |
| **Web build**     | `npm run build:web` | Creates `dist-web/` for CDN/Vercel |
| **Package**       | `npm run dist` / `npm run dist:mac` | Electron-builder → `release/` dmg/pkg |
| **Lint / Type-check** | `npm run check` | ESLint + TypeScript |

---

## 2  Configuration Knobs

| Area | Location | Default |
|------|----------|---------|
| Dev server port | `vite.config.ts` / `vite.config.web.ts` | **5173** |
| CSP header      | `<meta http-equiv="Content-Security-Policy">` in `index.html` | `default-src 'self'` |
| Electron entitlements | `assets/entitlements.mac.plist` | Hardened runtime, keychain-sharing |
| Builder targets | `package.json → build` | `mac`, `dmg`, `dir` |
| Log level       | `LOG_LEVEL` env var (optional) | `info` |

Environment variables recognised at runtime:

* `NODE_ENV` – `development` / `production` (used by Vite/Electron)
* `ELECTRON_DISABLE_SECURITY_WARNINGS=1` (optional during dev)

---

## 3  Start / Stop Procedures

Desktop development
```bash
npm run dev
# ↳ Terminates with Ctrl-C (stops both Vite & Electron)
```

Web development
```bash
npm run dev:web   # Ctrl-C to stop
```

Production desktop
```bash
npm run build
npm run dist:mac    # produces DMG
open release/API\ Key\ Manager-*.dmg
```

---

## 4  Health Checks

### Desktop
1. Application window appears with Manage/Test/Parser tabs.
2. Create a dummy key → should store in macOS Keychain (verify via Keychain Access).
3. “Test All” returns mixed pass/fail results but network calls succeed (view DevTools > Network).

### Web
1. Navigate to http://localhost:5173 → UI renders without Electron warnings.
2. Add a key, refresh page – key persists via `localStorage`.

---

## 5  Logs & Diagnostics

| Source | How to view |
|--------|-------------|
| Renderer | DevTools → Console / Network |
| Electron main | Terminal running `npm run dev` (stdout / stderr) |
| Build pipeline | `dist/` and `release/` folders + electron-builder output |
| Keychain failures | macOS Console.app → “securityd” or `log stream --info --predicate 'subsystem == "com.apple.security"'` |

Diagnostic tips:

```
# Check port
lsof -i :5173

# Validate CSP
grep Content-Security-Policy dist/index.html
```

---

## 6  Common Failures & Remedies

| Symptom | Probable Cause | Resolution |
|---------|----------------|------------|
| `wait-on http://localhost:5173` hangs | Port already in use | Kill offending process or change port in `vite.config.ts` |
| `ipcRenderer.invoke('keychain:setPassword', …)` returns `{success:false}` | Keychain access denied | Grant access when macOS prompts, or sign/notarize app for prod |
| `window.electronAPI` is `undefined` | Running web build inside browser | Expected; app falls back to `localStorage` |
| “blocked by CSP” console errors | Inline script / eval | Refactor to module import; adjust CSP if absolutely required |

---

## 7  Release Procedure (Desktop)

1. `git pull --ff-only && npm ci`
2. `npm run check` – ensure no lint/type errors.
3. `npm run build`
4. `npm run dist:mac`
5. Codesign & notarize (CI handles if `APPLE_ID` creds present).
6. Upload `release/API Key Manager-<ver>.dmg` to distribution channel.
7. Tag commit: `git tag v<ver> && git push --tags`

---

## 8  Rollback

* **Desktop:** Re-install previous DMG from `release/` archive or distribute prior tag artifact.
* **Web:** Redeploy previous `dist-web/` build (e.g., select earlier Vercel deployment).

---

## 9  Data Considerations

| Platform | Storage path | Backup strategy |
|----------|--------------|-----------------|
| Desktop  | macOS Keychain item `api-key-manager` | Managed by macOS (encrypted, backed up with iCloud Keychain) |
| Web      | `window.localStorage` keys `apikey_<service>` | User-side only; no server copy. Clearing site data deletes secrets |

---

_End of runbook_
