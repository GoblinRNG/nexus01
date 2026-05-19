#!/usr/bin/env node
// Comprehensive production build smoke test.
// Run AFTER `npm run build` to verify every artifact packaged by
// electron-builder is present and structurally valid.

import { existsSync, readFileSync, statSync } from 'fs'
import { resolve, dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

let passed = 0
let failed = 0

function check(description, fn) {
  try {
    const result = fn()
    if (result === false) throw new Error('check returned false')
    console.log(`  ✓  ${description}`)
    passed++
  } catch (err) {
    console.error(`  ✗  ${description}`)
    console.error(`     ${err.message}`)
    failed++
  }
}

function exists(rel) {
  return existsSync(resolve(root, rel))
}

function readText(rel) {
  return readFileSync(resolve(root, rel), 'utf-8')
}

function fileSize(rel) {
  return statSync(resolve(root, rel)).size
}

console.log('\nGielinor Nexus — Production Smoke Test\n')

// ── Build artifacts ──────────────────────────────────────────────────────────
console.log('Build artifacts:')
check('out/main/main.js exists',           () => exists('out/main/main.js'))
check('out/preload/preload.js exists',     () => exists('out/preload/preload.js'))
check('out/renderer/index.html exists',    () => exists('out/renderer/index.html'))
check('out/renderer/assets/ exists',       () => exists('out/renderer/assets'))

check('main.js is non-empty',              () => fileSize('out/main/main.js') > 1000)
check('preload.js is non-empty',           () => fileSize('out/preload/preload.js') > 100)
check('index.html is non-empty',           () => fileSize('out/renderer/index.html') > 200)

// ── Renderer HTML correctness ────────────────────────────────────────────────
console.log('\nRenderer HTML:')
const html = exists('out/renderer/index.html') ? readText('out/renderer/index.html') : ''

check('index.html has <div id="root">',    () => html.includes('id="root"'))
check('index.html links a JS asset',       () => html.includes('./assets/') && html.includes('.js'))
check('index.html links a CSS asset',      () => html.includes('./assets/') && html.includes('.css'))
check('No absolute /assets/ paths',        () => !html.includes('src="/assets/') && !html.includes('href="/assets/'))
check('No crossorigin attribute',          () => !html.includes(' crossorigin'))

// ── Package config ───────────────────────────────────────────────────────────
console.log('\nPackage config:')
const pkg = JSON.parse(readText('package.json'))
check('package.json main = out/main/main.js', () => pkg.main === 'out/main/main.js')
check('package.json has electron dep',    () => Boolean(pkg.devDependencies?.electron))
check('package.json has electron-builder',() => Boolean(pkg.devDependencies?.['electron-builder']))
check('package.json has build script',    () => Boolean(pkg.scripts?.build))
check('package.json has dist script',     () => Boolean(pkg.scripts?.dist))

// ── electron-builder config ──────────────────────────────────────────────────
console.log('\nElectron-builder config:')
const builderYml = exists('electron-builder.yml') ? readText('electron-builder.yml') : ''
check('electron-builder.yml exists',      () => exists('electron-builder.yml'))
check('Includes out/**/* glob',           () => builderYml.includes('out/**/*'))
check('Output dir is release/',           () => builderYml.includes('release'))
check('Has NSIS target',                  () => builderYml.includes('nsis'))
check('Has portable target',              () => builderYml.includes('portable'))

// ── Production renderer path from main.ts ────────────────────────────────────
console.log('\nMain process path resolution:')
const mainJs = exists('out/main/main.js') ? readText('out/main/main.js') : ''
check('main.js references renderer path', () =>
  mainJs.includes('renderer/index.html') || mainJs.includes('out/renderer')
)
check('main.js calls loadFile()',         () => mainJs.includes('loadFile'))
check('main.js has did-fail-load handler',() => mainJs.includes('did-fail-load'))

// ── Summary ──────────────────────────────────────────────────────────────────
console.log(`\n${'─'.repeat(50)}`)
console.log(`Passed: ${passed}  Failed: ${failed}`)

if (failed > 0) {
  console.error('\nSmoke test FAILED. Fix the issues above before packaging.\n')
  process.exit(1)
}

console.log('\nAll checks passed. Safe to run electron-builder.\n')
