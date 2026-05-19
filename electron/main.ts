import { app, BrowserWindow, ipcMain, screen, desktopCapturer } from 'electron'
import { join } from 'path'
import { existsSync } from 'fs'
import { is } from '@electron-toolkit/utils'
import { readStore, writeStore, getDataDir } from './bridge/storage'
import { detectLauncher, launchGame } from './bridge/launcher'
import { pollStatus } from './bridge/processWatcher'
import { fetchHiscores, fetchItemPrice, fetchRuneMetrics } from './bridge/apiSync'

let mainWindow: BrowserWindow | null = null
let watchInterval: ReturnType<typeof setInterval> | null = null

// ── Path diagnostics ─────────────────────────────────────────────────────────

function logPaths() {
  console.log('[nexus] === Startup Path Diagnostics ===')
  console.log('[nexus] app.isPackaged        :', app.isPackaged)
  console.log('[nexus] __dirname             :', __dirname)
  console.log('[nexus] process.resourcesPath :', process.resourcesPath)
  console.log('[nexus] app.getAppPath()      :', app.getAppPath())
  console.log('[nexus] app.getPath(userData) :', app.getPath('userData'))
}

// Try several candidate paths and return the first that exists on disk.
// In production (ASAR): app.getAppPath() = <install>/resources/app.asar
// electron-vite places the renderer at out/renderer/index.html relative to
// the app root, so both candidates resolve to the same ASAR-internal path.
function resolveRendererPath(): string {
  const candidates = [
    join(app.getAppPath(), 'out/renderer/index.html'),
    join(__dirname, '../renderer/index.html'),
    join(app.getAppPath(), 'dist/renderer/index.html'),
  ]
  for (const p of candidates) {
    if (existsSync(p)) {
      console.log('[nexus] Renderer found         :', p)
      return p
    }
    console.log('[nexus] Candidate not found    :', p)
  }
  console.error('[nexus] FATAL: no renderer candidate exists — app will show fallback page')
  return candidates[0]
}

// ── Window ───────────────────────────────────────────────────────────────────

function createWindow() {
  logPaths()

  mainWindow = new BrowserWindow({
    width:           1440,
    height:          900,
    minWidth:        1200,
    minHeight:       750,
    show:            false,
    frame:           true,
    backgroundColor: '#070c14',
    webPreferences: {
      preload:          join(__dirname, '../preload/preload.js'),
      contextIsolation: true,
      nodeIntegration:  false,
      sandbox:          false,
    },
    titleBarStyle: 'default',
    title:         'Gielinor Nexus — RS3 Companion',
  })

  // ── Renderer event logging ─────────────────────────────────────────────────

  mainWindow.webContents.on('did-start-loading', () => {
    console.log('[nexus] renderer: did-start-loading')
  })

  mainWindow.webContents.on('did-finish-load', () => {
    console.log('[nexus] renderer: did-finish-load ✓')
  })

  mainWindow.webContents.on('did-fail-load', (_evt, errorCode, errorDesc, validatedURL) => {
    console.error(`[nexus] renderer: did-fail-load code=${errorCode} desc="${errorDesc}" url=${validatedURL}`)
    // Show a visible fallback error page with full diagnostics
    const info = {
      attempted_url:   validatedURL,
      error_code:      errorCode,
      error_desc:      errorDesc,
      is_packaged:     app.isPackaged,
      __dirname,
      app_path:        app.getAppPath(),
      resources_path:  process.resourcesPath,
      user_data:       app.getPath('userData'),
    }
    const infoJson = JSON.stringify(info, null, 2).replace(/</g, '&lt;').replace(/>/g, '&gt;')
    const fallback = `<!DOCTYPE html>
<html style="background:#070c14;color:#c8a96e;font-family:monospace;margin:0">
<body style="padding:2rem">
  <h2 style="color:#ef4444;margin-bottom:1rem">&#9888; Renderer Load Failed</h2>
  <pre style="background:#0d1520;border:1px solid #1a3050;padding:1rem;border-radius:8px;font-size:11px;overflow:auto;white-space:pre-wrap">${infoJson}</pre>
  <p style="color:#6b7280;font-size:11px;margin-top:1rem">Open DevTools (Ctrl+Shift+I) for more detail.</p>
</body></html>`
    mainWindow?.webContents.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(fallback)}`)
  })

  mainWindow.webContents.on('render-process-gone', (_evt, details) => {
    console.error('[nexus] renderer: render-process-gone reason=', details.reason, 'exit=', details.exitCode)
  })

  mainWindow.webContents.on('unresponsive', () => {
    console.warn('[nexus] renderer: unresponsive')
  })

  mainWindow.webContents.on('console-message', (_evt, level, message, line, sourceId) => {
    const lvl = ['verbose', 'info', 'warning', 'error'][level] ?? 'log'
    console.log(`[renderer:${lvl}] ${message}  @${sourceId}:${line}`)
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show()
  })

  // ── Load ────────────────────────────────────────────────────────────────────

  if (is.dev && process.env.ELECTRON_RENDERER_URL) {
    console.log('[nexus] dev — loading', process.env.ELECTRON_RENDERER_URL)
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL)
    mainWindow.webContents.openDevTools({ mode: 'detach' })
  } else {
    const rendererPath = resolveRendererPath()
    console.log('[nexus] prod — loadFile:', rendererPath)
    mainWindow.loadFile(rendererPath)
  }
}

// ── IPC handlers ─────────────────────────────────────────────────────────────

ipcMain.handle('preload:ready', () => {
  console.log('[nexus] preload: ready signal received ✓')
  return true
})

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

ipcMain.handle('runemetrics:fetch', (_evt, playerName: string) => {
  return fetchRuneMetrics(playerName)
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
      types:         ['screen'],
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

// ── Bridge polling ────────────────────────────────────────────────────────────

function startBridgePolling() {
  watchInterval = setInterval(async () => {
    if (!mainWindow || mainWindow.isDestroyed()) return
    const result = await pollStatus()
    mainWindow.webContents.send('bridge:status-update', result)
  }, 5000)
}

// ── App lifecycle ─────────────────────────────────────────────────────────────

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
