# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

API Key Manager is a desktop Electron application for securely managing API keys locally on macOS. The app stores credentials in the macOS Keychain for enhanced security and provides a modern React UI for managing various API service keys.

## Architecture

This is a hybrid Electron + React application with the following key components:

- **Frontend**: React 18 + TypeScript with Vite as the build system
- **Backend**: Electron main process handling keychain operations and file I/O
- **State Management**: Zustand for client-side state
- **UI Framework**: Tailwind CSS with Lucide React icons
- **Security**: macOS Keychain integration via `keytar` package

### Project Structure

```
src/
├── components/          # React UI components
│   ├── tabs/           # Tab-specific components (ManageTab, TestTab, AutoFetchTab)
│   ├── ApiKeyCard.tsx  # Individual API key display component
│   └── ...             # Other UI components
├── stores/             # Zustand state management
│   ├── apiKeyStore.ts  # Main API key operations store
│   └── uiStore.ts      # UI state management
├── types/              # TypeScript type definitions
├── data/               # Static configuration (API services)
├── utils/              # Utility functions
└── main.tsx           # React entry point

electron/
├── main.ts            # Electron main process
└── preload.ts         # Secure IPC bridge
```

## Development Commands

```bash
# Development (runs both Vite dev server and Electron)
npm run dev

# Development components separately
npm run dev:vite      # Start Vite dev server only
npm run dev:electron  # Start Electron only (requires Vite server)

# Building
npm run build         # Build both frontend and Electron backend
npm run build:vite    # Build frontend only
npm run build:electron # Build Electron backend only

# Distribution
npm run dist          # Create distributable app
npm run dist:mac      # Create macOS-specific build

# Code quality
npm run check         # Type checking + linting
npm run lint          # ESLint with auto-fix
npm run clean         # Clean build artifacts
```

## Key Technologies & Patterns

### Electron IPC Architecture
The app uses a secure IPC pattern with contextIsolation enabled:
- `electron/main.ts`: Main process with IPC handlers for keychain/file operations
- `electron/preload.ts`: Secure bridge exposing limited APIs to renderer
- Frontend accesses Electron APIs via `window.electronAPI`

### State Management
- **Zustand stores**: Two main stores (`apiKeyStore`, `uiStore`) for clean separation
- **Keychain integration**: All API keys stored securely in macOS Keychain via `keytar`
- **Local state sync**: UI state synced with keychain operations

### Security Patterns
- Keys stored in macOS Keychain with service prefix: `API-Key-Manager-{service}`
- No sensitive data in localStorage - only UI preferences
- Content Security Policy enforced
- Context isolation enabled in Electron

### API Testing Framework
The app includes a built-in API testing system:
- Service configurations in `src/data/apiServices.ts`
- Automated key validation using actual API endpoints
- Support for various auth patterns (Bearer, Token, API Key headers)

## Common Development Patterns

### Adding New API Service
1. Add service config to `src/data/apiServices.ts`
2. Include test endpoint and authentication pattern
3. UI automatically adapts to new services

### Modifying Keychain Operations
All keychain operations go through `apiKeyStore.ts` methods:
- `setKey()`: Store key in keychain
- `getKey()`: Retrieve key from keychain
- `deleteKey()`: Remove key from keychain

### Adding New UI Tabs
1. Create component in `src/components/tabs/`
2. Update `TabNavigation.tsx` to include new tab
3. Add tab state management to `uiStore.ts`

## Development Notes

- App targets macOS only (uses macOS Keychain)
- Vite dev server runs on port 5173
- Electron connects to localhost:5173 in development
- Production builds bundle everything into `dist/`
- TypeScript strict mode enabled
- ESLint configured for React + TypeScript

## Testing

The app includes built-in API key testing functionality but no separate test suite. To test API keys:
1. Use the "Test" tab in the application
2. Keys are validated against real API endpoints
3. Results show validation status and response times