# api_key_manager — TESTS

## Automated checks
```bash
npm run check   # tsc --noEmit && eslint
```

## Smoke tests — Desktop (Electron)
1. Start dev: `npm run dev`
2. Add a key for `openai`.
3. Verify stored via Keychain: open **Keychain Access** and search `API-Key-Manager-openai`.
4. Click **“Test All”**. Confirm network calls hit endpoints in `src/data/apiServices.ts` and that responses update `isValid` in store (`src/stores/apiKeyStore.ts`).
5. Export `.env`; ensure file is written via IPC (`file:writeFile`).

## Smoke tests — Web
1. Start web: `npm run dev:web`
2. Add a key for `openai`.
3. Refresh page; key persists (stored in `localStorage`).
4. Import `.env`; ensure UI reflects imported keys.

## IPC contract checks
Open DevTools console in **desktop** build:
```js
await window.electronAPI.keychain.setPassword('api-key-manager','openai','sk-123');
await window.electronAPI.keychain.getPassword('api-key-manager','openai');
await window.electronAPI.file.writeFile('/tmp/keys.env', 'OPENAI_API_KEY=sk-123');
await window.electronAPI.system.openExternal('https://openai.com');
```
All calls should resolve with `{ success: true, ... }`.

## CSP check (web & desktop)
- Inspect `index.html` for the `<meta http-equiv="Content-Security-Policy">` tag.
- Ensure no console errors about blocked inline/eval scripts during normal usage.

## Build & package
```bash
npm run build        # dist/ (renderer + electron)
npm run dist:mac     # release/ DMG
```
Open the packaged app and repeat the desktop smoke tests.
