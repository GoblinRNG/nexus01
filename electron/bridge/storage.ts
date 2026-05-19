import { app } from 'electron'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

const DATA_DIR = app.getPath('userData')

function ensureDir() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true })
}

export function readStore<T>(key: string, defaultVal: T): T {
  ensureDir()
  const file = join(DATA_DIR, `${key}.json`)
  try {
    if (!existsSync(file)) return defaultVal
    return JSON.parse(readFileSync(file, 'utf-8')) as T
  } catch {
    return defaultVal
  }
}

export function writeStore<T>(key: string, value: T): void {
  ensureDir()
  const file = join(DATA_DIR, `${key}.json`)
  writeFileSync(file, JSON.stringify(value, null, 2), 'utf-8')
}

export function getDataDir(): string {
  return DATA_DIR
}
