# External Integrations

| System / Service | Purpose | Where Used |
|-----------------|---------|-----------|
| macOS Keychain (`keytar`) | Secure storage of API keys | `electron/main.ts`, `src/stores/apiKeyStore.ts` |
| Electron clipboard & shell | Copy keys and open docs | `electron/main.ts`, UI components |
| File dialogs & FS | Import/export `.env` files | `electron/main.ts`, `src/components/tabs/ManageTab.tsx` |
| Vercel hosting | Web build deployment | `vercel.json` |
| OpenAI API | Key validation | `src/data/apiServices.ts`, `src/stores/apiKeyStore.ts` |
| Anthropic API | Key validation | same as above |
| GitHub API | Key validation | same |
| Stripe API | Key validation | same |
| Binance API | Key validation | same |
| Coinbase API | Key validation | same |
| SendGrid API | Key validation | same |
| Twilio API | Key validation | same |
| AWS STS | Key validation | same |
| Google Cloud API | Key validation | same |
| Discord API | Key validation | same |
| Slack API | Key validation | same |
| Supabase API | Key validation | same |
