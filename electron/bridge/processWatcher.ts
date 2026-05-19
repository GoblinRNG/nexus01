import { exec } from 'child_process'

const RS3_PROCESS_NAMES = ['rs2client.exe', 'jagexlauncher.exe', 'runescapeHD.exe']
const RS3_WINDOW_TITLES = ['runescape', 'rs3', 'jagex']

export interface WatcherStatus {
  launcherRunning: boolean
  gameRunning: boolean
  windowTitle: string | null
}

function runTasklist(): Promise<string> {
  return new Promise((resolve) => {
    if (process.platform !== 'win32') { resolve(''); return }
    exec('tasklist /FO CSV /NH', (err, stdout) => resolve(err ? '' : stdout.toLowerCase()))
  })
}

function getActiveWindowTitle(): Promise<string | null> {
  return new Promise((resolve) => {
    if (process.platform !== 'win32') { resolve(null); return }
    exec(
      'powershell -command "(Get-Process | Where-Object {$_.MainWindowTitle -ne \'\'} | Sort-Object CPU -Descending | Select-Object -First 1 -ExpandProperty MainWindowTitle)"',
      (err, stdout) => resolve(err ? null : stdout.trim() || null)
    )
  })
}

export async function pollStatus(): Promise<WatcherStatus> {
  const [processes, title] = await Promise.all([runTasklist(), getActiveWindowTitle()])

  const launcherRunning = processes.includes('jagexlauncher.exe')
  const gameRunning = RS3_PROCESS_NAMES.some((n) => processes.includes(n))
  const rsWindowActive = title
    ? RS3_WINDOW_TITLES.some((t) => title.toLowerCase().includes(t))
    : false

  return {
    launcherRunning,
    gameRunning,
    windowTitle: rsWindowActive ? title : null,
  }
}
