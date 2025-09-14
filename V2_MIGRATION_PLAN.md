# api_key_manager — V2 MIGRATION PLAN  

Brings **api_key_manager** in line with the portfolio-wide V2 standards (Node 20, pnpm, GitHub Actions, dual-target build, hardened IPC, security gates).

---

## 0. Prerequisites  

| Item | Notes |
|------|-------|
| Node 20 | `nvm install 20 && nvm use 20` |
| pnpm ≥ 8 | `corepack enable && corepack prepare pnpm@latest --activate` |
| macOS codesign (desktop) | Xcode CLI + Developer ID (optional) |
| GitHub secrets | `GH_TOKEN` (electron-builder), _optional_: `APPLE_ID`, `APPLE_ID_PASS` |

---

## 1. Baseline & Environment  

| Task | Command / File | ✓ |
|------|----------------|---|
| Declare engines | `"engines": { \"node\": \">=20\" }` in `package.json` | [ ] |
| Add **.nvmrc** → `20` | `echo 20 > .nvmrc` | [ ] |
| Add **.editorconfig** & update **.gitignore** | reuse portfolio template | [ ] |
| Create **.env.example** | vars: `VITE_APP_MODE`, `VITE_API_BASE` | [ ] |
| Pin pnpm workspace versions | `pnpm m up -L` | [ ] |

---

## 2. Security & IPC Hardening  

1. **Renderer Isolation** – ensure:  
   ```ts
   new BrowserWindow({
     webPreferences: { contextIsolation: true, nodeIntegration: false }
   })
   ```
2. **Typed preload** (already OK).  
3. **Validate IPC** in `main.ts` – use `zod` schemas or manual checks.  
4. **Keychain usage**  
   - Desktop: `keytar` for all persistence.  
   - Web fallback: AES-encrypted `IndexedDB`.  
5. **Transient data hygiene** – clear Zustand stores on `blur` / `lock`.  

Checklist  

- [ ] All `ipcMain.handle` inputs validated  
- [ ] No untyped `ipcRenderer.send` from renderer  
- [ ] Keytar errors bubbled to UI with safe message  

---

## 3. Build & Scripts  

| Script | Purpose |
|--------|---------|
| `web:dev` | `vite --mode web` |
| `web:build` | `vite build --mode web` |
| `electron:dev` | `electron .` (uses Vite dev server) |
| `electron:pack` | `electron-builder --mac --dir` (no publish) |
| `lint`, `typecheck`, `test:web` | ESLint, `tsc --noEmit`, Vitest |

Update `package.json` root & workspace `scripts`.

---

## 4. CI (GitHub Actions)  

`.github/workflows/node.yml`

```yaml
name: Node CI
on: [push, pull_request]

jobs:
  build-test-web:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: 'pnpm' }
      - run: corepack enable
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint && pnpm typecheck && pnpm test:web
      - run: gitleaks detect --no-git -v || true
      - run: semgrep ci --severity=ERROR || true

  package-macos:
    if: github.event_name == 'workflow_dispatch'
    runs-on: macos-13
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: 'pnpm' }
      - run: corepack enable
      - run: pnpm install --frozen-lockfile
      - run: pnpm electron:pack
```

CI success criteria  

- Web job mandatory, passes on every PR.  
- macOS packaging job manual (does not block).  
- Security jobs annotate only.

---

## 5. Quality Assurance  

| Scope | Tool | Target |
|-------|------|--------|
| Unit tests | Vitest | `electronAPI` wrappers, Zustand stores |
| Desktop E2E (optional) | Playwright + `@playwright/test` | smoke flow (add / copy credential) |
| Lint | ESLint + Prettier | all TS |
| Types | `tsc --noEmit` | strict |

Checklist  

- [ ] ≥ 80 % unit test coverage web target  
- [ ] Playwright smoke scenario documented (even if not in CI)  

---

## 6. Timeline & Owners  

| Week | Deliverable | Owner |
|------|-------------|-------|
| 1 | Section 1 tasks, scripts updated, engines pinned | dev |
| 2 | IPC validation, keytar integration finalised | dev |
| 3 | CI workflow merged & green | dev + reviewer |
| 4 | Desktop pack job verified locally & via CI | dev |
| 5 | QA suite reaches coverage target | dev |

---

## 7. Success Criteria  

- Web **and** desktop builds succeed (`pnpm web:build`, `pnpm electron:pack`).  
- GitHub Actions green on every PR; security jobs annotate but don’t fail.  
- No secrets in repository; **.env.example** present & up to date.  
- All IPC channels validated and covered by tests.  
- Keychain operations function on macOS; web fallback encrypts data.  

_When all boxes are ticked, api_key_manager is V2-compliant and ready for Stage 5 integration._
