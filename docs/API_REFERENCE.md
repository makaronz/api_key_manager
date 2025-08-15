# 📚 API Reference

Complete API documentation for the API Key Manager application, covering both the Electron IPC interface and internal JavaScript APIs.

## 🖥️ Electron API Interface

### Keychain Operations

The desktop version exposes keychain operations through a secure IPC bridge.

#### `window.electronAPI.keychain`

**Type Definition**:
```typescript
interface KeychainAPI {
  setPassword(service: string, account: string, password: string): Promise<IPCResult>;
  getPassword(service: string, account: string): Promise<IPCResult & { password?: string }>;
  deletePassword(service: string, account: string): Promise<IPCResult>;
  findCredentials(service: string): Promise<IPCResult & { credentials?: Array<{ account: string }> }>;
}

interface IPCResult {
  success: boolean;
  error?: string;
}
```

#### Methods

##### `setPassword(service, account, password)`

Securely stores an API key in the macOS Keychain.

**Parameters**:
- `service` (string): Service identifier (prefixed with `API-Key-Manager-`)
- `account` (string): Account name (typically the service ID)
- `password` (string): The API key to store

**Returns**: `Promise<IPCResult>`

**Example**:
```typescript
const result = await window.electronAPI.keychain.setPassword(
  'API-Key-Manager-openai',
  'openai',
  'sk-1234567890abcdef'
);

if (result.success) {
  console.log('Key saved successfully');
} else {
  console.error('Failed to save key:', result.error);
}
```

**Error Conditions**:
- Keychain access denied
- Invalid service/account parameters
- System keychain locked

##### `getPassword(service, account)`

Retrieves an API key from the macOS Keychain.

**Parameters**:
- `service` (string): Service identifier
- `account` (string): Account name

**Returns**: `Promise<IPCResult & { password?: string }>`

**Example**:
```typescript
const result = await window.electronAPI.keychain.getPassword(
  'API-Key-Manager-openai',
  'openai'
);

if (result.success && result.password) {
  console.log('Retrieved key:', result.password.substring(0, 10) + '...');
}
```

##### `deletePassword(service, account)`

Removes an API key from the macOS Keychain.

**Parameters**:
- `service` (string): Service identifier
- `account` (string): Account name

**Returns**: `Promise<IPCResult>`

**Example**:
```typescript
const result = await window.electronAPI.keychain.deletePassword(
  'API-Key-Manager-openai',
  'openai'
);
```

### File System Operations

#### `window.electronAPI.file`

**Type Definition**:
```typescript
interface FileAPI {
  showOpenDialog(options: Electron.OpenDialogOptions): Promise<IPCResult & { filePaths?: string[] }>;
  showSaveDialog(options: Electron.SaveDialogOptions): Promise<IPCResult & { filePath?: string }>;
  readFile(filePath: string): Promise<IPCResult & { content?: string }>;
  writeFile(filePath: string, content: string): Promise<IPCResult>;
}
```

#### Methods

##### `showOpenDialog(options)`

Shows a native file selection dialog.

**Parameters**:
- `options` (OpenDialogOptions): Electron dialog options

**Returns**: `Promise<IPCResult & { filePaths?: string[] }>`

**Example**:
```typescript
const result = await window.electronAPI.file.showOpenDialog({
  filters: [{ name: 'Environment Files', extensions: ['env'] }],
  properties: ['openFile']
});

if (result.success && result.filePaths?.length) {
  const filePath = result.filePaths[0];
  // Process selected file
}
```

##### `readFile(filePath)`

Reads content from a file.

**Parameters**:
- `filePath` (string): Absolute path to file

**Returns**: `Promise<IPCResult & { content?: string }>`

**Example**:
```typescript
const result = await window.electronAPI.file.readFile('/path/to/.env');
if (result.success) {
  console.log('File content:', result.content);
}
```

### System Operations

#### `window.electronAPI.system`

**Type Definition**:
```typescript
interface SystemAPI {
  openExternal(url: string): Promise<void>;
}
```

##### `openExternal(url)`

Opens a URL in the default browser.

**Parameters**:
- `url` (string): URL to open

**Example**:
```typescript
await window.electronAPI.system.openExternal('https://openai.com/api-keys');
```

### Clipboard Operations

#### `window.electronAPI.clipboard`

**Type Definition**:
```typescript
interface ClipboardAPI {
  writeText(text: string): Promise<void>;
}
```

##### `writeText(text)`

Copies text to system clipboard.

**Parameters**:
- `text` (string): Text to copy

**Example**:
```typescript
await window.electronAPI.clipboard.writeText('sk-1234567890abcdef');
```

## 🌐 Web Browser Fallbacks

When running in web mode (`window.electronAPI` is undefined), the application uses browser-based alternatives:

### Storage Operations

**localStorage Wrapper**:
```typescript
// Web version key storage
const setKey = async (service: string, value: string) => {
  if (!window.electronAPI) {
    localStorage.setItem(`apikey_${service}`, value);
    return Promise.resolve();
  }
  // Electron version...
};

const getKey = async (service: string) => {
  if (!window.electronAPI) {
    return localStorage.getItem(`apikey_${service}`);
  }
  // Electron version...
};
```

### File Operations

**Web File API**:
```typescript
// File input for importing
const importFile = () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.env';
  input.onchange = (event) => {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        // Process file content
      };
      reader.readAsText(file);
    }
  };
  input.click();
};

// Download for exporting
const exportFile = (content: string, filename: string) => {
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
```

## 📦 Zustand Store APIs

### ApiKeyStore

**Type Definition**:
```typescript
interface ApiKeyStore {
  // State
  keys: Record<string, ApiKey>;
  isLoading: boolean;
  error: string | null;

  // Core Operations
  setKey: (service: string, value: string) => Promise<void>;
  getKey: (service: string) => Promise<string | null>;
  deleteKey: (service: string) => Promise<void>;
  addApiKey: (service: string, value: string) => Promise<void>;

  // Batch Operations
  loadKeys: () => Promise<void>;
  clearAllKeys: () => Promise<void>;

  // Testing
  testKey: (service: string) => Promise<boolean>;
  testAllKeys: () => Promise<Record<string, boolean>>;

  // Import/Export
  importFromEnv: (content: string) => Promise<{ imported: string[]; errors: string[] }>;
  exportToEnv: () => string;
}
```

#### State Properties

##### `keys`
**Type**: `Record<string, ApiKey>`

Current API keys indexed by service ID.

**Example**:
```typescript
const { keys } = useApiKeyStore();
const openaiKey = keys['openai'];
```

##### `isLoading`
**Type**: `boolean`

Global loading state for keychain/storage operations.

##### `error`
**Type**: `string | null`

Last error message from store operations.

#### Core Operations

##### `setKey(service, value)`

Stores an API key with automatic platform detection.

**Parameters**:
- `service` (string): Service identifier
- `value` (string): API key value

**Returns**: `Promise<void>`

**Example**:
```typescript
const { setKey } = useApiKeyStore();
await setKey('openai', 'sk-1234567890abcdef');
```

**Behavior**:
- Desktop: Saves to macOS Keychain via Electron IPC
- Web: Saves to localStorage with `apikey_${service}` key
- Updates local state with metadata (timestamps, validation status)
- Triggers UI loading states

##### `getKey(service)`

Retrieves an API key value.

**Parameters**:
- `service` (string): Service identifier

**Returns**: `Promise<string | null>`

**Example**:
```typescript
const { getKey } = useApiKeyStore();
const key = await getKey('openai');
if (key) {
  // Use the key
}
```

##### `deleteKey(service)`

Removes an API key from storage.

**Parameters**:
- `service` (string): Service identifier

**Returns**: `Promise<void>`

**Example**:
```typescript
const { deleteKey } = useApiKeyStore();
await deleteKey('openai');
```

#### Testing Operations

##### `testKey(service)`

Validates an API key against the service's test endpoint.

**Parameters**:
- `service` (string): Service identifier

**Returns**: `Promise<boolean>`

**Example**:
```typescript
const { testKey } = useApiKeyStore();
const isValid = await testKey('openai');
console.log('OpenAI key is valid:', isValid);
```

**Implementation**:
```typescript
const testKey = async (service: string) => {
  const key = await getKey(service);
  if (!key) return false;

  const serviceConfig = apiServices.find(s => s.id === service);
  if (!serviceConfig) return false;

  try {
    const response = await fetch(serviceConfig.testEndpoint, {
      method: serviceConfig.testMethod || 'GET',
      headers: {
        ...serviceConfig.testHeaders,
        [serviceConfig.authHeader]: key
      }
    });
    return response.ok;
  } catch {
    return false;
  }
};
```

##### `testAllKeys()`

Tests all stored keys in parallel (with concurrency limit).

**Returns**: `Promise<Record<string, boolean>>`

**Example**:
```typescript
const { testAllKeys } = useApiKeyStore();
const results = await testAllKeys();
// { openai: true, github: false, stripe: true }
```

#### Import/Export Operations

##### `importFromEnv(content)`

Imports API keys from .env file content.

**Parameters**:
- `content` (string): Raw .env file content

**Returns**: `Promise<{ imported: string[]; errors: string[] }>`

**Example**:
```typescript
const { importFromEnv } = useApiKeyStore();
const result = await importFromEnv('OPENAI_API_KEY=sk-123\nGITHUB_TOKEN=ghp-456');
console.log('Imported:', result.imported); // ['openai', 'github']
console.log('Errors:', result.errors);     // []
```

##### `exportToEnv()`

Exports all keys to .env format.

**Returns**: `string`

**Example**:
```typescript
const { exportToEnv } = useApiKeyStore();
const envContent = exportToEnv();
// Returns: "OPENAI_API_KEY=sk-123\nGITHUB_TOKEN=ghp-456\n"
```

### UiStore

**Type Definition**:
```typescript
interface UiStore {
  // Navigation
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;

  // Notifications
  notifications: Notification[];
  showSuccess: (message: string, duration?: number) => void;
  showError: (message: string, duration?: number) => void;
  showWarning: (message: string, duration?: number) => void;
  showInfo: (message: string, duration?: number) => void;
  removeNotification: (id: string) => void;

  // Search & Filter
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  selectedService: string | null;
  setSelectedService: (service: string | null) => void;

  // UI State
  isTestingAll: boolean;
  setIsTestingAll: (testing: boolean) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}
```

#### Navigation

##### `activeTab`
**Type**: `TabType` (`'manage' | 'auto-fetch' | 'test' | 'parser'`)

Currently active tab.

##### `setActiveTab(tab)`

Changes the active tab.

**Example**:
```typescript
const { setActiveTab } = useUiStore();
setActiveTab('test');
```

#### Notifications

##### `showSuccess(message, duration?)`

Shows a success toast notification.

**Parameters**:
- `message` (string): Notification message
- `duration` (number, optional): Auto-dismiss time in ms (default: 5000)

**Example**:
```typescript
const { showSuccess } = useUiStore();
showSuccess('API key saved successfully');
```

##### `showError(message, duration?)`

Shows an error toast notification (does not auto-dismiss).

**Example**:
```typescript
const { showError } = useUiStore();
showError('Failed to save API key');
```

## 🧪 API Testing Framework

### Service Configuration

**Type Definition**:
```typescript
interface ApiService {
  id: string;
  name: string;
  keyName: string;          // Environment variable name
  testEndpoint: string;     // API endpoint for validation
  testMethod?: string;      // HTTP method (default: GET)
  testHeaders: Record<string, string>;  // Headers with {key} placeholder
  authHeader?: string;      // Primary auth header name
  category: string;         // For UI grouping
  websiteUrl?: string;      // Service website
  docsUrl?: string;         // API documentation
  keyUrl?: string;          // Where to get API key
  description?: string;     // Service description
}
```

### Built-in Services

The application includes 13 pre-configured API services:

```typescript
// Example service configurations
const apiServices: ApiService[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    keyName: 'OPENAI_API_KEY',
    testEndpoint: 'https://api.openai.com/v1/models',
    testHeaders: { 'Authorization': 'Bearer {key}' },
    category: 'ai',
    websiteUrl: 'https://openai.com',
    docsUrl: 'https://platform.openai.com/docs',
    keyUrl: 'https://platform.openai.com/api-keys'
  },
  {
    id: 'github',
    name: 'GitHub',
    keyName: 'GITHUB_TOKEN',
    testEndpoint: 'https://api.github.com/user',
    testHeaders: { 'Authorization': 'token {key}' },
    category: 'development'
  }
  // ... more services
];
```

### Testing Implementation

**Test Execution**:
```typescript
const testApiKey = async (service: ApiService, key: string): Promise<boolean> => {
  try {
    // Replace {key} placeholder in headers
    const headers = Object.entries(service.testHeaders).reduce((acc, [name, value]) => {
      acc[name] = value.replace('{key}', key);
      return acc;
    }, {} as Record<string, string>);

    const response = await fetch(service.testEndpoint, {
      method: service.testMethod || 'GET',
      headers: {
        'User-Agent': 'API-Key-Manager/1.0.0',
        ...headers
      }
    });

    return response.ok;
  } catch (error) {
    console.error(`Test failed for ${service.name}:`, error);
    return false;
  }
};
```

## 🔧 Utility Functions

### Text Parser

**Type Definition**:
```typescript
interface ParsedApiKey {
  service: string;
  key: string;
  confidence: number;
  line: number;
}

interface TextParserAPI {
  parseApiKeys: (text: string) => ParsedApiKey[];
  extractFromEnv: (content: string) => Record<string, string>;
  formatAsEnv: (keys: Record<string, string>) => string;
}
```

### File Utilities

**Type Definition**:
```typescript
interface FileUtilsAPI {
  downloadFile: (content: string, filename: string, mimeType?: string) => void;
  uploadFile: (accept?: string) => Promise<string>;
  validateEnvFile: (content: string) => { valid: boolean; errors: string[] };
}
```

---

## 📝 Error Handling

All API methods follow consistent error handling patterns:

**Success Response**:
```typescript
{
  success: true,
  data?: any    // Method-specific data
}
```

**Error Response**:
```typescript
{
  success: false,
  error: string,    // Human-readable error message
  code?: string     // Optional error code
}
```

**Error Types**:
- `KEYCHAIN_ACCESS_DENIED`: macOS Keychain access denied
- `KEYCHAIN_NOT_FOUND`: Key not found in keychain
- `NETWORK_ERROR`: API testing network failure
- `INVALID_KEY_FORMAT`: Invalid API key format
- `FILE_READ_ERROR`: File system operation failed

## 🔍 Type Definitions

Complete TypeScript definitions are available in `src/types/index.ts`:

```typescript
// Core data types
export interface ApiKey { /* ... */ }
export interface ApiService { /* ... */ }
export interface Notification { /* ... */ }

// Store types
export interface ApiKeyStore { /* ... */ }
export interface UiStore { /* ... */ }

// Platform types
export interface ElectronAPI { /* ... */ }
export interface IPCResult { /* ... */ }
```

---

**Note**: This API reference covers both desktop (Electron) and web versions of the application. Methods automatically adapt to the runtime environment.