const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  initializePersistentDB: () => ipcRenderer.invoke('initialize-db'),
  startPersistentSession: userId => ipcRenderer.invoke('start-session', userId),
  endPersistentSession: (sessionId, insight) => ipcRenderer.invoke('end-session', sessionId, insight),
  trackTokens: (sessionId, tokens) => ipcRenderer.invoke('track-tokens', sessionId, tokens),
  readUsageFile: () => ipcRenderer.invoke('read-db-file'),
  sendChatCompletion: messages => ipcRenderer.invoke('send-chat', messages)
});