import { contextBridge, ipcRenderer } from 'electron'

// Signal to main process that preload executed successfully
ipcRenderer.invoke('preload:ready').catch(() => {})

contextBridge.exposeInMainWorld('electronAPI', {
  // Launcher
  detectLauncher: (path?: string) =>
    ipcRenderer.invoke('launcher:detect', path),
  launchGame: (path: string) =>
    ipcRenderer.invoke('launcher:launch', path),

  // Bridge status
  getBridgeStatus: () =>
    ipcRenderer.invoke('bridge:status'),

  // HiScores
  fetchHiscores: (playerName: string) =>
    ipcRenderer.invoke('hiscores:fetch', playerName),

  // RuneMetrics public activity feed
  fetchRuneMetrics: (playerName: string) =>
    ipcRenderer.invoke('runemetrics:fetch', playerName),

  // Item prices
  fetchItemPrice: (itemId: number) =>
    ipcRenderer.invoke('prices:fetch', itemId),

  // Storage
  readStore: (key: string) =>
    ipcRenderer.invoke('storage:read', key),
  writeStore: (key: string, value: unknown) =>
    ipcRenderer.invoke('storage:write', key, value),
  getDataDir: () =>
    ipcRenderer.invoke('storage:dir'),

  // Screen capture (OCR)
  captureRegion: (region: { x: number; y: number; width: number; height: number }) =>
    ipcRenderer.invoke('screen:capture', region),
  selectRegion: () =>
    ipcRenderer.invoke('screen:select-region'),

  // Events from main process
  onBridgeUpdate: (cb: (status: unknown) => void) => {
    const handler = (_: Electron.IpcRendererEvent, status: unknown) => cb(status)
    ipcRenderer.on('bridge:status-update', handler)
    return () => ipcRenderer.removeListener('bridge:status-update', handler)
  },
})
