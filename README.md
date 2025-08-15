# 🔐 API Key Manager

A secure, dual-platform application for managing API keys with enterprise-grade security features. Available as both a **macOS desktop app** (with Keychain integration) and a **web application** (with localStorage).

![API Key Manager Interface](assets/icon.png)

## ✨ Features

### 🛡️ Security First
- **macOS Keychain Integration**: Desktop version stores keys in the native macOS Keychain
- **localStorage Fallback**: Web version uses secure browser localStorage
- **Zero Memory Exposure**: Keys are masked by default and loaded on-demand
- **Context Isolation**: Desktop version uses Electron's secure IPC architecture

### 📋 Key Management
- **13+ Pre-configured Services**: OpenAI, GitHub, Stripe, Anthropic, and more
- **Real-time Validation**: Test API keys against live endpoints
- **Import/Export**: Support for `.env` files and bulk operations
- **Search & Filter**: Find keys quickly with real-time search and category filtering

### 🧪 Built-in Testing
- **Live API Testing**: Validate keys against actual service endpoints
- **Batch Testing**: Test multiple keys simultaneously with performance metrics
- **Custom Headers**: Support for Bearer tokens, API keys, and custom authentication

### 📝 Advanced Features
- **Text Parser**: Extract API keys from text with confidence scoring
- **Statistics Dashboard**: Track key counts and validation status
- **Dark Theme Support**: Consistent UI across all tabs
- **Notification System**: Toast notifications for all operations

## 🚀 Quick Start

### Desktop App (macOS)

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build

# Create distributable
npm run dist:mac
```

### Web Version

```bash
# Install dependencies
npm install

# Run web development server
npm run dev:web

# Build for web deployment
npm run build:web
```

## 🏗️ Architecture

### Dual-Platform Design

The application automatically detects its environment and adapts:

```typescript
// Desktop: Uses macOS Keychain via Electron IPC
if (window.electronAPI) {
  await window.electronAPI.keychain.setPassword(service, account, password);
}
// Web: Uses secure localStorage
else {
  localStorage.setItem(`apikey_${service}`, password);
}
```

### Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Desktop Backend**: Electron 28 with secure IPC
- **State Management**: Zustand (dual-store architecture)
- **Styling**: Tailwind CSS with custom design system
- **Icons**: Lucide React
- **Security**: Context isolation + CSP headers

### Project Structure

```
src/
├── components/          # React UI components
│   ├── tabs/           # Tab-specific components
│   │   ├── ManageTab.tsx    # Key management interface
│   │   ├── TestTab.tsx      # API testing interface
│   │   ├── AutoFetchTab.tsx # Automated key fetching
│   │   └── TextParser.tsx   # Text parsing utilities
│   ├── ApiKeyCard.tsx  # Individual key component
│   └── [shared]        # Header, notifications, etc.
├── stores/             # Zustand state management
│   ├── apiKeyStore.ts  # Key operations & persistence
│   └── uiStore.ts      # UI state & notifications
├── data/               # API service configurations
├── types/              # TypeScript definitions
└── utils/              # Testing & file operations

electron/               # Desktop-specific code
├── main.ts            # Main process with IPC handlers
└── preload.ts         # Secure context bridge
```

## 📱 Platform Differences

| Feature | Desktop (Electron) | Web Browser |
|---------|-------------------|-------------|
| **Storage** | macOS Keychain | localStorage |
| **Security** | Native encryption | Browser security |
| **File Operations** | Native file dialogs | Download/upload |
| **System Integration** | Full macOS integration | Browser APIs only |
| **Offline Mode** | Full functionality | Limited to cached data |

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev          # Desktop app development
npm run dev:web      # Web app development
npm run dev:vite     # Frontend only
npm run dev:electron # Electron only

# Building
npm run build        # Build both platforms
npm run build:vite   # Build frontend
npm run build:web    # Build for web deployment
npm run build:electron # Build Electron backend

# Distribution
npm run dist         # Create desktop installer
npm run dist:mac     # macOS-specific build

# Code Quality
npm run check        # TypeScript + ESLint
npm run lint         # ESLint with auto-fix
npm run clean        # Clean build artifacts
```

### Configuration Files

- `vite.config.ts` - Desktop/Electron build configuration
- `vite.config.web.ts` - Web build configuration  
- `tailwind.config.js` - Tailwind CSS customization
- `electron/` - Electron-specific configuration
- `assets/entitlements.mac.plist` - macOS security entitlements

## 🛡️ Security

### Desktop Security Features
- **Hardened Runtime**: Enabled with strict entitlements
- **Code Signing**: Production builds are properly signed
- **Context Isolation**: Renderer process isolation
- **Minimal IPC Surface**: Limited, typed API exposure
- **Keychain Integration**: Native macOS credential storage

### Web Security Features
- **Content Security Policy**: Strict CSP headers
- **localStorage Encryption**: Keys stored securely in browser
- **HTTPS Only**: Production deployment requires HTTPS
- **No Server Storage**: All data remains client-side

## 📋 Supported API Services

| Service | Category | Auth Method |
|---------|----------|------------|
| OpenAI | AI | Bearer Token |
| Anthropic | AI | X-API-Key |
| GitHub | Development | Token |
| Stripe | Payment | Bearer Token |
| Pinecone | Database | API Key |
| Supabase | Backend | Bearer Token |
| Vercel | Deployment | Bearer Token |
| Replicate | AI | Token |
| Hugging Face | AI | Bearer Token |
| Cohere | AI | Bearer Token |
| Stability AI | AI | Bearer Token |
| AssemblyAI | AI | Custom Header |
| ElevenLabs | AI | X-API-Key |

## 🚢 Deployment

### Desktop Distribution

1. **Build**: `npm run build`
2. **Package**: `npm run dist:mac`
3. **Output**: `release/API Key Manager-1.0.0.dmg`

### Web Deployment

1. **Build**: `npm run build:web`
2. **Deploy**: Upload `dist-web/` to your web server
3. **Requirements**: HTTPS required for full functionality

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make changes and test both platforms
4. Run quality checks: `npm run check`
5. Submit a pull request

## 📄 License

MIT License - see `LICENSE` file for details.

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/your-repo/api-key-manager/issues)
- **Documentation**: See `/docs` folder for detailed guides
- **Security**: Report security issues privately via email

---

**Note**: The desktop version provides enhanced security with native Keychain integration, while the web version offers broader accessibility with browser-based storage. Choose the platform that best fits your security and deployment requirements.