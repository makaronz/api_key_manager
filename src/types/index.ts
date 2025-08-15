// API Service Types
export interface ApiService {
  id: string;
  name: string;
  keyName: string;
  description: string;
  website: string;
  docsUrl: string;
  loginUrl: string;
  keyUrl: string;
  testEndpoint: string;
  testMethod: 'GET' | 'POST' | 'PUT' | 'DELETE';
  testHeaders: Record<string, string>;
  testBody?: any;
  category: 'ai' | 'development' | 'crypto' | 'social' | 'cloud' | 'other';
  icon: string;
}

// API Key Types
export interface ApiKey {
  id: string;
  service: string;
  value: string;
  isValid?: boolean;
  lastTested?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Store Types
export interface ApiKeyStore {
  keys: Record<string, ApiKey>;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setKey: (service: string, value: string) => Promise<void>;
  getKey: (service: string) => Promise<string | null>;
  deleteKey: (service: string) => Promise<void>;
  testKey: (service: string) => Promise<boolean>;
  addApiKey: (key: Omit<ApiKey, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  importFromEnv: (content: string) => Promise<void>;
  exportToEnv: () => Promise<string>;
  clearAllKeys: () => Promise<void>;
  loadKeys: () => Promise<void>;
}

// UI State Types
export interface UiStore {
  activeTab: 'manage' | 'auto-fetch' | 'test' | 'parser';
  selectedService: string | null;
  isTestingAll: boolean;
  notifications: Notification[];
  isLoading: boolean;
  searchQuery: string;
  selectedCategory: string;
  
  // Actions
  setActiveTab: (tab: 'manage' | 'auto-fetch' | 'test' | 'parser') => void;
  setSelectedService: (service: string | null) => void;
  setTestingAll: (isTestingAll: boolean) => void;
  showSuccess: (message: string, title?: string) => void;
  showError: (message: string, title?: string) => void;
  showWarning: (message: string, title?: string) => void;
  showInfo: (message: string, title?: string) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  setLoading: (loading: boolean) => void;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string) => void;
}

// Notification Types
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  timestamp: Date;
  duration?: number;
}

// File Operation Types
export interface FileOperationResult {
  success: boolean;
  error?: string;
  data?: any;
  message?: string;
  filePath?: string;
  content?: string;
}

// Test Result Types
export interface TestResult {
  service: string;
  success: boolean;
  message: string;
  responseTime?: number;
  isValid: boolean;
  timestamp?: Date;
}

// Auto Fetch Types
export interface AutoFetchCredentials {
  email: string;
  password: string;
  twoFactorCode?: string;
}

// Electron API Types (matching preload.ts)
export interface ElectronAPI {
  keychain: {
    setPassword: (service: string, account: string, password: string) => Promise<{ success: boolean; error?: string }>;
    getPassword: (service: string, account: string) => Promise<{ success: boolean; password?: string | null; error?: string }>;
    deletePassword: (service: string, account: string) => Promise<{ success: boolean; deleted?: boolean; error?: string }>;
    findCredentials: (service: string) => Promise<{ success: boolean; credentials?: Array<{ account: string; password: string }>; error?: string }>;
  };
  file: {
    showOpenDialog: () => Promise<{ canceled: boolean; filePaths?: string[] }>;
    showSaveDialog: (defaultPath?: string) => Promise<{ canceled: boolean; filePath?: string }>;
    readFile: (filePath: string) => Promise<{ success: boolean; content?: string; error?: string }>;
    writeFile: (filePath: string, content: string) => Promise<{ success: boolean; error?: string }>;
  };
  fs: {
    saveFile: (options: { content: string; defaultPath?: string }) => Promise<FileOperationResult>;
    openFile: (options: { filters?: Array<{ name: string; extensions: string[] }> }) => Promise<FileOperationResult>;
  };
  system: {
    openExternal: (url: string) => Promise<{ success: boolean; error?: string }>;
  };
  clipboard: {
    writeText: (text: string) => Promise<{ success: boolean; error?: string }>;
  };
}

// Global Window Type Extension
declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

// Utility Types
export type ServiceCategory = ApiService['category'];
export type TabType = UiStore['activeTab'];
export type NotificationType = Notification['type'];