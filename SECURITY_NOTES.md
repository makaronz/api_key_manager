# api_key_manager — SECURITY NOTES

## Trust boundaries
- **Renderer (React)** is unprivileged; all privileged work is routed through `window.electronAPI` defined in `electron/preload.ts`.
- **Main process** performs Keychain access, file I/O, clipboard writes, and `openExternal` calls.

## Hardening present in code
| Area | Setting / Source |
|------|------------------|
| Context isolation | `contextIsolation: true`, `nodeIntegration: false` (`electron/main.ts`) |
| Web security flags | `webSecurity: true`, `allowRunningInsecureContent: false` |
| Window creation | `setWindowOpenHandler(() => ({ action: 'deny' }))` prevents pop-ups |
| CSP | `<meta http-equiv="Content-Security-Policy" ...>` in `index.html`<br>``default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https:;`` |
| macOS hardening | Hardened runtime + entitlements in `assets/entitlements.mac.plist`; targets defined in `package.json → build.mac` |

## Secrets & storage
- **Desktop:** Secrets stored with `keytar` in macOS Keychain under service `API-Key-Manager-<service>`.
- **Web:** When `window.electronAPI` is absent, secrets fall back to `localStorage` (`src/stores/apiKeyStore.ts`).

## Network egress
- Outbound `fetch` requests only inside key-test logic (`src/stores/apiKeyStore.ts`) targeting endpoints enumerated in `src/data/apiServices.ts`.
- No telemetry or analytics libraries present.

## IPC surface (attack surface)
| Channel prefix | Purpose |
|----------------|---------|
| `keychain:*` | set/get/delete/find credentials |
| `file:*` | open/save dialogs, read/write file |
| `system:openExternal` | open URL in default browser |
| `clipboard:writeText` | copy text to clipboard |

No other IPC handlers are registered.

## Operator checklist
1. **Context isolation** – Open DevTools in renderer; `window.process` must be `undefined`.
2. **CSP** – Inspect `<meta http-equiv="Content-Security-Policy">`; ensure no `unsafe-eval` or remote origins.
3. **IPC audit** – `Object.keys(window.electronAPI)` should return only `keychain`, `file`, `system`, `clipboard`.
4. **Keychain verification** – After saving a key, open Keychain Access; item name should start with `API-Key-Manager-`.
5. **Entitlements** – Run `codesign -d --entitlements :- <App>` on packaged binary; confirm only declared entitlements are present.
6. **Build flags** – In prod build, verify `NODE_ENV=production` and `process.env.ELECTRON_ENABLE_SECURITY_WARNINGS` is not disabled.

## Recommendations
- Keep CSP strict; avoid adding `unsafe-eval` or remote script sources.
- Limit future IPC additions to minimal, well-typed surfaces.
- Sign and notarize desktop builds; ship with hardened runtime and least-privilege entitlements.
- Serve web build over HTTPS; consider encrypting values before `localStorage` if additional assurance is required.
