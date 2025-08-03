import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

import {
  initializePersistentDB,
  startPersistentSession,
  endPersistentSession,
  updatePersistentSessionTokens
} from 'persistentSessionManager.js';

// Polyfill __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function createWindow() {
  // Ensure DB file is initialized with defaults
  await initializePersistentDB();

  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      // Secure preload bridge
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  // Load your chat UI
  win.loadFile(path.join(__dirname, 'chat.html'));
}

app.whenReady().then(createWindow);

app.on('activate', () => {
  // On macOS, re-create a window when dock icon is clicked and no other windows are open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('window-all-closed', () => {
  // Quit on all platforms except macOS
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// ----------------------------------------------------------------------------
// IPC handlers for renderer ↔ main-process bridge
// ----------------------------------------------------------------------------

ipcMain.handle('initialize-db', async () => {
  await initializePersistentDB();
});

ipcMain.handle('start-session', async (_, userId) => {
  return await startPersistentSession(userId);
});

ipcMain.handle('end-session', async (_, sessionId, insight) => {
  await endPersistentSession(sessionId, insight);
});

ipcMain.handle('track-tokens', async (_, sessionId, tokens) => {
  await updatePersistentSessionTokens(sessionId, tokens);
});

ipcMain.handle('read-db-file', async () => {
  const dbPath = path.join(__dirname, 'utils', 'db.json');
  return await fs.readFile(dbPath, 'utf8');
});

ipcMain.handle('send-chat', async (_, messages) => {
  // Dynamically import here to avoid browser-side imports
  const { sendChatCompletion } = await import('./utils/openaiClient.js');
  return await sendChatCompletion(messages);
});