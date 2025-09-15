# api_key_manager — API

## Electron Renderer Surface (`window.electronAPI`)
Exposed in **electron/preload.ts**, typed in **src/types/index.ts**.

### keychain
- `setPassword(service, account, password)` → `{ success, error? }`
- `getPassword(service, account)` → `{ success, password?: string|null, error? }`
- `deletePassword(service, account)` → `{ success, deleted?: boolean, error? }`
- `findCredentials(service)` → `{ success, credentials?: Array<{ account:string; password:string }>, error? }`

### file
- `showOpenDialog()` → `{ canceled, filePaths? }`
- `showSaveDialog(defaultPath?)` → `{ canceled, filePath? }`
- `readFile(filePath)` → `{ success, content?, error? }`
- `writeFile(filePath, content)` → `{ success, error? }`

### fs helpers
- `saveFile({ content, defaultPath? })` → `FileOperationResult`
- `openFile({ filters? })` → `FileOperationResult`

### system
- `openExternal(url)` → `{ success, error? }`

### clipboard
- `writeText(text)` → `{ success, error? }`

Example:
```ts
await window.electronAPI.keychain.setPassword(
  'api-key-manager',  // service
  'openai',           // account
  'sk-...'            // password
);
```

---

## Web-only Fallbacks (no Electron)
When `window.electronAPI` is **undefined** (`src/stores/apiKeyStore.ts`):

| Capability | Desktop (Electron) | Web fallback |
|------------|-------------------|--------------|
| Store key  | Keychain via IPC  | `localStorage.setItem('apikey_'+service, value)` |
| Read key   | Keychain          | `localStorage.getItem('apikey_'+service)` |
| File I/O   | Native dialogs / fs | DOM File input + `Blob` download |
| Clipboard  | `electron.clipboard` | `navigator.clipboard.writeText` |

---

## Zustand Stores

### useApiKeyStore (src/stores/apiKeyStore.ts)
| Method | Purpose |
|--------|---------|
| `setKey(service, value)` | Persist key (Keychain or localStorage) |
| `getKey(service)` | `string \| null` |
| `deleteKey(service)` | Remove key |
| `testKey(service)` | Validate key against service endpoint |
| `importFromEnv(content)` | Bulk import from `.env` text |
| `exportToEnv()` | Return `.env` formatted string |
| `loadKeys()` / `clearAllKeys()` | Sync or purge state |

### useUiStore (src/stores/uiStore.ts)
Navigation, notifications, filters:
`setActiveTab`, `showSuccess|Error|Warning|Info`, `setSearchQuery`, `setSelectedCategory`, `setSelectedService`.

---

## Service Catalog
`src/data/apiServices.ts` holds 13+ predefined service configs (id, testEndpoint, headers).  
`useApiKeyStore.testKey()` consumes these definitions to perform live validation.

---

## Notes
Electron main automatically prefixes every Keychain entry with `API-Key-Manager-<service>` (see `electron/main.ts`).  
Therefore, when the renderer passes plain service IDs such as `openai`, the stored Keychain item will be named `API-Key-Manager-openai`.
