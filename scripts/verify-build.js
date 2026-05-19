#!/usr/bin/env node
// Checks that all electron-vite build outputs exist before electron-builder packages them.
// Exits with code 1 (and a clear message) if any required file is missing.

import { existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

const required = [
  'out/main/main.js',
  'out/preload/preload.js',
  'out/renderer/index.html',
]

let ok = true
for (const rel of required) {
  const abs = resolve(root, rel)
  if (existsSync(abs)) {
    console.log(`  ✓  ${rel}`)
  } else {
    console.error(`  ✗  MISSING: ${rel}`)
    ok = false
  }
}

if (!ok) {
  console.error('\nBuild verification FAILED. Run "npm run build" first.')
  process.exit(1)
}

console.log('\nBuild verification passed — all renderer/main/preload artifacts present.')
