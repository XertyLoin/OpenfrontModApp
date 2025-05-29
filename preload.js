const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  applyMods: (mods) => ipcRenderer.send('apply-mods', mods),
  changeTitle: (title) => ipcRenderer.send('change-title', title)
});

contextBridge.exposeInMainWorld('electron', {
  changeTitle: (title) => ipcRenderer.send('change-title', title)
});