# Module Summaries

## electron/main.ts
- Boots Electron window and registers IPC handlers for Keychain, file, system and clipboard actions
- Exports no public API; runs on app start
- Depends on: none internal; external `electron`, `keytar`, `fs`, `path`
- Side effects: window creation, disk I/O, macOS Keychain access, external URL launching
- Risks: heavy responsibility in one file; limited error handling reuse

## electron/preload.ts
- Bridges vetted IPC methods into `window.electronAPI`
- Provides structured APIs for keychain, file, system, clipboard
- Depends on: none internal; external `electron`
- Side effects: attaches globals
- Risks: any API added here expands attack surface

## src/main.tsx
- Entry for React renderer; mounts `<App />`
- Depends on: `src/App.tsx`
- External deps: `react`, `react-dom`
- Side effects: DOM mount
- Risks: minimal

## src/App.tsx
- Top-level UI; coordinates tabs and data loading
- Key functions: `renderActiveTab`
- Depends on: stores (`apiKeyStore`, `uiStore`), components (`Header`, `TabNavigation`, tab views, `TextParser`, `NotificationContainer`, `LoadingSpinner`)
- External deps: React hooks
- Side effects: triggers key loading
- Risks: component growth may hinder readability

## src/components/Header.tsx
- Static header branding
- Depends on: none internal; external `lucide-react`
- Side effects: none
- Risks: low

## src/components/TabNavigation.tsx
- Renders tab buttons and switches active tab
- Depends on: `uiStore`
- External deps: `lucide-react`
- Side effects: updates store state
- Risks: limited tabs hard‑coded

## src/components/NotificationContainer.tsx
- Displays dismissible notifications
- Depends on: `uiStore`, `types`
- External deps: `lucide-react`
- Side effects: none
- Risks: notification overflow on long sessions

## src/components/LoadingSpinner.tsx
- Simple spinner component
- Depends on: none internal; `lucide-react`
- Side effects: none
- Risks: low

## src/components/ApiKeyCard.tsx
- CRUD UI for a single API key with copy/test actions
- Depends on: `apiKeyStore`, `uiStore`, `types`
- External deps: `lucide-react`
- Side effects: Keychain operations, clipboard writes, network tests
- Risks: many callbacks; moderate complexity

## src/components/TextParser.tsx
- Parses arbitrary text for secrets and imports them
- Depends on: `utils/textParser`, `apiKeyStore`, `uiStore`
- External deps: `lucide-react`
- Side effects: clipboard access, store mutations
- Hotspot: ~400 lines of UI/logic
- Risks: large component; TODOs in parser heuristics

## src/components/tabs/ManageTab.tsx
- Lists services, allows import/export/clear of keys
- Depends on: `apiKeyStore`, `uiStore`, `components/ApiKeyCard`, `data/apiServices`
- External deps: `lucide-react`
- Side effects: file dialogs, key store mutations
- Risks: modal logic and state management could be split

## src/components/tabs/AutoFetchTab.tsx
- Demo interface for future automatic key retrieval
- Depends on: `uiStore`, `types`
- External deps: `lucide-react`
- Side effects: opens external dashboards
- Risks: currently demo only; unused credentials handling

## src/components/tabs/TestTab.tsx
- Runs validation tests for configured keys
- Depends on: `apiKeyStore`, `uiStore`, `data/apiServices`, `types`
- External deps: `lucide-react`
- Side effects: network requests to service endpoints
- Risks: concurrency and rate-limit handling minimal

## src/stores/apiKeyStore.ts
- Zustand store managing keys, Keychain access, and testing
- Depends on: `data/apiServices`, `types`
- External deps: `zustand`
- Side effects: Keychain/localStorage I/O, network fetches
- Hotspot: >300 lines with mixed concerns
- Risks: lacks unit tests; error paths complex

## src/stores/uiStore.ts
- Zustand store for UI state and notifications
- Depends on: `types`
- External deps: `zustand`
- Side effects: timers to auto-clear notifications
- Risks: minimal

## src/utils/apiTester.ts
- Standalone utility to test API keys against service endpoints
- Depends on: `data/apiServices`, `types`
- External deps: `fetch`
- Side effects: network requests
- Risks: currently unused; potential dead code

## src/utils/fileUtils.ts
- Helpers for parsing/exporting `.env` files and validating content
- Depends on: `data/apiServices`, `types`
- External deps: none
- Side effects: string parsing; uses `window.electronAPI.fs`
- Risks: unused; some functions tightly coupled to environment

## src/utils/textParser.ts
- Pattern-based extractor for API keys/secrets from text
- Defines `TextParser` class and utilities (`parseText`, `exportToEnv`, etc.)
- External deps: none
- Side effects: none
- Hotspot: ~400 lines of parsing logic; one TODO placeholder

## src/data/apiServices.ts
- Catalog of supported API services and test metadata
- Depends on: `types`
- External deps: none
- Side effects: none
- Risks: large static array; keeping endpoints updated

## src/types/index.ts
- Shared TypeScript interfaces for services, keys, stores, and Electron API
- Depends on: none
- External deps: none
- Side effects: none
- Risks: mismatch with runtime objects could go unnoticed

## api-key-manager.tsx
- Legacy monolithic demo combining key management, auto-fetch, and tests
- Depends on: none internal
- External deps: `lucide-react`
- Side effects: DOM interactions, network demos
- Risks: ~700 lines; unclear if still used
