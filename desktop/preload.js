const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("firoozeh", {
  version: () => ipcRenderer.invoke("app:version"),
  dataDir: () => ipcRenderer.invoke("app:data-dir"),
  isDesktop: true,
});
