import { existsSync } from 'fs'
import { exec, spawn } from 'child_process'

const DEFAULT_PATHS_WIN = [
  'C:\\Program Files\\Jagex Launcher\\JagexLauncher.exe',
  'C:\\Program Files (x86)\\Jagex Launcher\\JagexLauncher.exe',
  'C:\\Users\\Public\\Jagex Launcher\\JagexLauncher.exe',
]

export interface LauncherInfo {
  detected: boolean
  path: string | null
  isRunning: boolean
}

export function detectLauncher(customPath?: string): LauncherInfo {
  if (customPath && existsSync(customPath)) {
    return { detected: true, path: customPath, isRunning: false }
  }
  for (const p of DEFAULT_PATHS_WIN) {
    if (existsSync(p)) {
      return { detected: true, path: p, isRunning: false }
    }
  }
  return { detected: false, path: null, isRunning: false }
}

export function launchGame(launcherPath: string): Promise<{ success: boolean; error?: string }> {
  return new Promise((resolve) => {
    if (!existsSync(launcherPath)) {
      resolve({ success: false, error: `Launcher not found: ${launcherPath}` })
      return
    }
    const child = spawn(launcherPath, [], { detached: true, stdio: 'ignore' })
    child.unref()
    child.on('error', (err) => resolve({ success: false, error: err.message }))
    resolve({ success: true })
  })
}

export function isLauncherRunning(): Promise<boolean> {
  return new Promise((resolve) => {
    if (process.platform !== 'win32') {
      resolve(false)
      return
    }
    exec('tasklist /FI "IMAGENAME eq JagexLauncher.exe" /FO CSV /NH', (err, stdout) => {
      if (err) { resolve(false); return }
      resolve(stdout.toLowerCase().includes('jagexlauncher.exe'))
    })
  })
}
