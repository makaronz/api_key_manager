# Repository Map

## Overview
- **Type**: Single-package Electron + React application
- **Purpose**: Manage API keys locally with macOS Keychain support
- **Languages**: TypeScript/TSX
- **Package manager**: npm

## Packages
| Path | Description |
|------|-------------|
| `/` | Electron shell, Vite config, docs |
| `/electron` | Main & preload processes |
| `/src` | React UI, stores, utilities |

## Tech Stack & Tooling
| Area | Tools |
|------|------|
| Build | Vite, TypeScript, electron-builder |
| UI | React 18, Tailwind CSS, lucide-react icons |
| State | Zustand stores |
| Lint | ESLint (TS rules) |
| Packaging | Vercel (web), Electron dmg |

## Architecture
Electron main process exposes Keychain, file, and system IPC handlers → preload bridges APIs into `window.electronAPI` → React renderer (`src/main.tsx` → `App.tsx`) orchestrates tabs, stores, and components.

## Dependency Adjacency (simplified)
```
src/main.tsx -> src/App.tsx
src/App.tsx -> stores/uiStore, stores/apiKeyStore, components/*
components/* -> stores/*, utils/textParser, data/apiServices
stores/apiKeyStore -> data/apiServices, types
stores/uiStore -> types
utils/* -> data/apiServices, types
```

## Entry Points
| File | Purpose |
|------|---------|
| `electron/main.ts` | Bootstraps Electron window and IPC handlers |
| `electron/preload.ts` | Exposes safe IPC bridge to renderer |
| `src/main.tsx` | React renderer entry (web/electron) |
| `api-key-manager.tsx` | Standalone demo page |

## Runtime Surfaces
- Dev server on **http://localhost:5173** (Vite)
- IPC channels: `keychain:*`, `file:*`, `system:openExternal`, `clipboard:writeText`
- Network requests to numerous third‑party API endpoints for key validation
- Local storage: macOS Keychain via `keytar`, optional `localStorage`
