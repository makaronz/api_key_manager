import { create } from 'zustand';
import { ApiKey, ApiKeyStore } from '../types';
import { apiServices, getServiceById, getServiceByKeyName } from '../data/apiServices';

const KEYCHAIN_SERVICE_PREFIX = 'api-key-manager';

export const useApiKeyStore = create<ApiKeyStore>((set, get) => ({
  keys: {},
  isLoading: false,
  error: null,

  setKey: async (service: string, value: string) => {
    set({ isLoading: true, error: null });
    
    try {
      // In web version, use localStorage instead of Keychain
      if (!window.electronAPI) {
        localStorage.setItem(`apikey_${service}`, value);
      } else {
        // Save to macOS Keychain
        const result = await window.electronAPI.keychain.setPassword(
          KEYCHAIN_SERVICE_PREFIX,
          service,
          value
        );

        if (!result.success) {
          throw new Error(result.error || 'Failed to save key to Keychain');
        }
      }

      // Update local state
      const now = new Date();
      set((state) => {
        const existingKey = state.keys[service];
        return {
          keys: {
            ...state.keys,
            [service]: {
              id: existingKey?.id || `${service}-${Date.now()}`,
              service,
              value,
              createdAt: existingKey?.createdAt || now,
              updatedAt: now,
              isValid: undefined, // Reset validation status
            },
          },
          isLoading: false,
        };
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to save API key',
        isLoading: false 
      });
      throw error;
    }
  },

  getKey: async (service: string) => {
    // In web version, use localStorage instead of Keychain
    if (!window.electronAPI) {
      const stored = localStorage.getItem(`apikey_${service}`);
      return stored || null;
    }

    try {
      const result = await window.electronAPI.keychain.getPassword(
        KEYCHAIN_SERVICE_PREFIX,
        service
      );

      if (result.success && result.password) {
        return result.password;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting key from Keychain:', error);
      return null;
    }
  },

  deleteKey: async (service: string) => {
    set({ isLoading: true, error: null });
    
    try {
      // In web version, use localStorage instead of Keychain
      if (!window.electronAPI) {
        localStorage.removeItem(`apikey_${service}`);
      } else {
        // Delete from macOS Keychain
        const result = await window.electronAPI.keychain.deletePassword(
          KEYCHAIN_SERVICE_PREFIX,
          service
        );

        if (!result.success) {
          throw new Error(result.error || 'Failed to delete key from Keychain');
        }
      }

      // Update local state
      set((state) => {
        const newKeys = { ...state.keys };
        delete newKeys[service];
        return {
          keys: newKeys,
          isLoading: false,
        };
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete API key',
        isLoading: false 
      });
      throw error;
    }
  },

  addApiKey: async (key: Omit<ApiKey, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date();
    const apiKey: ApiKey = {
      id: `${key.service}-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
      ...key,
    };

    // Save to Keychain
    await get().setKey(key.service, key.value);

    // Update local state
    set((state) => ({
      keys: {
        ...state.keys,
        [key.service]: apiKey,
      },
    }));
  },

  testKey: async (service: string) => {
    const apiService = getServiceById(service);
    if (!apiService) {
      throw new Error('Service not found');
    }

    if (apiService.isTestable === false || !apiService.testEndpoint) {
      throw new Error('This field is not testable');
    }

    const key = await get().getKey(service);
    if (!key) {
      throw new Error('API key not found');
    }

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...apiService.testHeaders,
      };

      for (const [headerName, headerValue] of Object.entries(headers)) {
        headers[headerName] = headerValue.split('{key}').join(key);
      }

      if (apiService.keyName.toLowerCase().includes('bearer') && !headers.Authorization) {
        headers.Authorization = `Bearer ${key}`;
      } else if (apiService.keyName.toLowerCase().includes('token') && !headers.Authorization) {
        headers.Authorization = `Token ${key}`;
      } else if (
        !Object.keys(apiService.testHeaders).length &&
        apiService.fieldType === 'secret'
      ) {
        headers[apiService.keyName] = key;
      }

      const endpoint = apiService.testEndpoint.split('{key}').join(key);

      const response = await fetch(endpoint, {
        method: apiService.testMethod || 'GET',
        headers,
        body: apiService.testBody ? JSON.stringify(apiService.testBody) : undefined,
      });

      const isValid = response.ok;
      
      // Update key validation status
      set((state) => {
        const existingKey = state.keys[service];
        if (existingKey) {
          return {
            keys: {
              ...state.keys,
              [service]: {
                ...existingKey,
                isValid,
                lastTested: new Date(),
                updatedAt: new Date(),
              },
            },
          };
        }
        return state;
      });

      return isValid;
    } catch (error) {
      // Update key as invalid
      set((state) => {
        const existingKey = state.keys[service];
        if (existingKey) {
          return {
            keys: {
              ...state.keys,
              [service]: {
                ...existingKey,
                isValid: false,
                lastTested: new Date(),
                updatedAt: new Date(),
              },
            },
          };
        }
        return state;
      });
      
      throw error;
    }
  },

  importFromEnv: async (content: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const lines = content.split('\n');
      const importedKeys: Record<string, string> = {};
      
      for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine && !trimmedLine.startsWith('#')) {
          const [key, ...valueParts] = trimmedLine.split('=');
          if (key && valueParts.length > 0) {
            const value = valueParts.join('=').replace(/^["']|["']$/g, '');
            
            const service = getServiceByKeyName(key);
            
            if (service && value) {
              importedKeys[service.id] = value;
            }
          }
        }
      }
      
      // Save all imported keys to Keychain
      for (const [serviceId, value] of Object.entries(importedKeys)) {
        await get().setKey(serviceId, value);
      }
      
      set({ isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to import from .env file',
        isLoading: false 
      });
      throw error;
    }
  },

  exportToEnv: async () => {
    const { keys } = get();
    const lines: string[] = [
      '# API Keys exported from API Key Manager',
      `# Generated on ${new Date().toISOString()}`,
      '',
    ];
    
    for (const [serviceId, apiKey] of Object.entries(keys)) {
      const service = apiServices.find(s => s.id === serviceId);
      if (service && apiKey.value) {
        lines.push(`${service.keyName}=${apiKey.value}`);
      }
    }
    
    return lines.join('\n');
  },

  clearAllKeys: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const { keys } = get();
      
      // Delete all keys from Keychain
      for (const serviceId of Object.keys(keys)) {
        await get().deleteKey(serviceId);
      }
      
      set({ keys: {}, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to clear all keys',
        isLoading: false 
      });
      throw error;
    }
  },

  loadKeys: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const loadedKeys: Record<string, ApiKey> = {};
      
      // Load keys for all known services
      for (const service of apiServices) {
        const value = await get().getKey(service.id);
        if (value) {
          loadedKeys[service.id] = {
            id: `${service.id}-${Date.now()}`,
            service: service.id,
            value,
            createdAt: new Date(), // We don't store creation date in Keychain
            updatedAt: new Date(),
          };
        }
      }
      
      set({ keys: loadedKeys, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load keys from Keychain',
        isLoading: false 
      });
    }
  },
}));