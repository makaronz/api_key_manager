import { contextBridge, ipcRenderer } from 'electron';

// Define the API interface
interface ElectronAPI {
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
  system: {
    openExternal: (url: string) => Promise<{ success: boolean; error?: string }>;
  };
  clipboard: {
    writeText: (text: string) => Promise<{ success: boolean; error?: string }>;
  };
}

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
const electronAPI: ElectronAPI = {
  keychain: {
    setPassword: (service: string, account: string, password: string) =>
      ipcRenderer.invoke('keychain:setPassword', service, account, password),
    getPassword: (service: string, account: string) =>
      ipcRenderer.invoke('keychain:getPassword', service, account),
    deletePassword: (service: string, account: string) =>
      ipcRenderer.invoke('keychain:deletePassword', service, account),
    findCredentials: (service: string) =>
      ipcRenderer.invoke('keychain:findCredentials', service),
  },
  file: {
    showOpenDialog: () => ipcRenderer.invoke('file:showOpenDialog'),
    showSaveDialog: (defaultPath?: string) => ipcRenderer.invoke('file:showSaveDialog', defaultPath),
    readFile: (filePath: string) => ipcRenderer.invoke('file:readFile', filePath),
    writeFile: (filePath: string, content: string) => ipcRenderer.invoke('file:writeFile', filePath, content),
  },
  system: {
    openExternal: (url: string) => ipcRenderer.invoke('system:openExternal', url),
  },
  clipboard: {
    writeText: (text: string) => ipcRenderer.invoke('clipboard:writeText', text),
  },
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);

// Type declaration for the global window object
declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}