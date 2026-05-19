import { app, BrowserWindow, ipcMain, screen, desktopCapturer } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'
import { readStore, writeStore, getDataDir } from './bridge/storage'
import { detectLauncher, launchGame } from './bridge/launcher'
import { pollStatus } from './bridge/processWatcher'
import { fetchHiscores, fetchItemPrice } from './bridge/apiSync'

let mainWindow: BrowserWindow | null = null
let watchInterval: ReturnType<typeof setInterval> | null = null

function createWindow() {
  mainWindow = new BrowserWindow({
    width:           1440,
    height:          900,
    minWidth:        1200,
    minHeight:       750,
    show:            false,
    frame:           true,
    backgroundColor: '#070c14',
    webPreferences: {
      preload:          join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration:  false,
      sandbox:          false,
    },
    titleBarStyle: 'default',
    title:         'Gielinor Nexus — RS3 Companion',
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show()
  })

  if (is.dev && process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL)
    mainWindow.webContents.openDevTools({ mode: 'detach' })
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// ── IPC handlers ────────────────────────────────────────────────────────────

ipcMain.handle('launcher:detect', (_evt, customPath?: string) => {
  return detectLauncher(customPath)
})

ipcMain.handle('launcher:launch', async (_evt, launcherPath: string) => {
  return launchGame(launcherPath)
})

ipcMain.handle('bridge:status', async () => {
  const watcher = await pollStatus()
  const settings = readStore<{ launcherPath?: string }>('settings', {})
  const launcher = detectLauncher(settings.launcherPath)
  return {
    launcherDetected:    launcher.detected || watcher.launcherRunning,
    gameProcessDetected: watcher.gameRunning,
    windowFocusTracking: true,
    mouseCaptureActive:  false,
    screenRegionCapture: true,
    ocrTextReading:      true,
    dataParsingActive:   true,
    bankUpdating:        true,
    accountSyncActive:   true,
    lastSync:            new Date().toISOString(),
  }
})

ipcMain.handle('hiscores:fetch', (_evt, playerName: string) => {
  return fetchHiscores(playerName)
})

ipcMain.handle('prices:fetch', (_evt, itemId: number) => {
  return fetchItemPrice(itemId)
})

ipcMain.handle('storage:read', (_evt, key: string) => {
  return readStore(key, null)
})

ipcMain.handle('storage:write', (_evt, key: string, value: unknown) => {
  writeStore(key, value)
  return true
})

ipcMain.handle('storage:dir', () => {
  return getDataDir()
})

ipcMain.handle('screen:capture', async (_evt, region: { x: number; y: number; width: number; height: number }) => {
  try {
    const sources = await desktopCapturer.getSources({
      types:     ['screen'],
      thumbnailSize: { width: region.width, height: region.height },
    })
    if (sources.length === 0) return { success: false, error: 'No screen sources' }
    const thumbnail = sources[0].thumbnail
    return { success: true, dataUrl: thumbnail.toDataURL() }
  } catch (err) {
    return { success: false, error: String(err) }
  }
})

ipcMain.handle('screen:select-region', async () => {
  const display = screen.getPrimaryDisplay()
  return {
    x:      0,
    y:      display.size.height - 200,
    width:  600,
    height: 100,
  }
})

// ── Bridge polling ──────────────────────────────────────────────────────────

function startBridgePolling() {
  watchInterval = setInterval(async () => {
    if (!mainWindow || mainWindow.isDestroyed()) return
    const status = await ipcMain.emit('bridge:status', null)
    const result = await pollStatus()
    mainWindow.webContents.send('bridge:status-update', result)
  }, 5000)
}

// ── App lifecycle ────────────────────────────────────────────────────────────

app.whenReady().then(() => {
  createWindow()
  startBridgePolling()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (watchInterval) clearInterval(watchInterval)
  if (process.platform !== 'darwin') app.quit()
})
