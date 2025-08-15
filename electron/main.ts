import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import * as path from 'path';
import * as keytar from 'keytar';
import { promises as fs } from 'fs';

const SERVICE_NAME = 'API-Key-Manager';
const isDev = process.env.NODE_ENV === 'development';

let mainWindow: BrowserWindow | null = null;

function createWindow(): void {
  console.log('Creating Electron window...');
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: true,
      allowRunningInsecureContent: false,
      experimentalFeatures: false
    },
    show: false,
    icon: path.join(__dirname, '../assets/icon.png')
  });

  // Load the app
  if (isDev) {
    console.log('Loading development URL: http://localhost:5173');
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    console.log('Loading production file');
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    console.log('Window ready to show, making visible...');
    mainWindow?.show();
    mainWindow?.focus();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// App event listeners
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Security: Prevent new window creation
app.on('web-contents-created', (_event, contents) => {
  contents.setWindowOpenHandler(() => {
    return { action: 'deny' };
  });
});

// IPC Handlers for Keychain operations
ipcMain.handle('keychain:setPassword', async (event, service: string, account: string, password: string) => {
  try {
    await keytar.setPassword(`${SERVICE_NAME}-${service}`, account, password);
    return { success: true };
  } catch (error) {
    console.error('Error setting password:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
});

ipcMain.handle('keychain:getPassword', async (event, service: string, account: string) => {
  try {
    const password = await keytar.getPassword(`${SERVICE_NAME}-${service}`, account);
    return { success: true, password };
  } catch (error) {
    console.error('Error getting password:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
});

ipcMain.handle('keychain:deletePassword', async (event, service: string, account: string) => {
  try {
    const deleted = await keytar.deletePassword(`${SERVICE_NAME}-${service}`, account);
    return { success: true, deleted };
  } catch (error) {
    console.error('Error deleting password:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
});

ipcMain.handle('keychain:findCredentials', async (event, service: string) => {
  try {
    const credentials = await keytar.findCredentials(`${SERVICE_NAME}-${service}`);
    return { success: true, credentials };
  } catch (error) {
    console.error('Error finding credentials:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
});

// File operations
ipcMain.handle('file:showOpenDialog', async () => {
  try {
    const result = await dialog.showOpenDialog(mainWindow!, {
      properties: ['openFile'],
      filters: [
        { name: 'Environment Files', extensions: ['env'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    });
    return result;
  } catch (error) {
    console.error('Error showing open dialog:', error);
    return { canceled: true };
  }
});

ipcMain.handle('file:showSaveDialog', async (event, defaultPath?: string) => {
  try {
    const result = await dialog.showSaveDialog(mainWindow!, {
      defaultPath: defaultPath || 'api-keys.env',
      filters: [
        { name: 'Environment Files', extensions: ['env'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    });
    return result;
  } catch (error) {
    console.error('Error showing save dialog:', error);
    return { canceled: true };
  }
});

ipcMain.handle('file:readFile', async (event, filePath: string) => {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return { success: true, content };
  } catch (error) {
    console.error('Error reading file:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
});

ipcMain.handle('file:writeFile', async (event, filePath: string, content: string) => {
  try {
    await fs.writeFile(filePath, content, 'utf-8');
    return { success: true };
  } catch (error) {
    console.error('Error writing file:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
});

// System operations
ipcMain.handle('system:openExternal', async (event, url: string) => {
  try {
    const { shell } = require('electron');
    await shell.openExternal(url);
    return { success: true };
  } catch (error) {
    console.error('Error opening external URL:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
});

ipcMain.handle('clipboard:writeText', async (event, text: string) => {
  try {
    const { clipboard } = require('electron');
    clipboard.writeText(text);
    return { success: true };
  } catch (error) {
    console.error('Error writing to clipboard:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
});