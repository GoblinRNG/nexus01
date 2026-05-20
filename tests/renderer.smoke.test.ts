import { describe, it, expect } from 'vitest'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

const RENDERER_HTML = join(__dirname, '../out/renderer/index.html')

// Skip the entire suite when the renderer hasn't been built yet.
// The CI "Unit Tests" job runs npm test before electron-vite build,
// so out/renderer/index.html does not exist there.
// These checks run in the "Build Windows App" job after the build step.
describe.skipIf(!existsSync(RENDERER_HTML))('Production renderer build', () => {
  function readHtml(): string {
    return readFileSync(RENDERER_HTML, 'utf-8')
  }

  it('has no crossorigin attribute (required for file:// protocol)', () => {
    expect(readHtml()).not.toContain(' crossorigin')
  })

  it('uses relative asset paths (./assets/) not absolute (/assets/)', () => {
    const html = readHtml()
    expect(html).not.toMatch(/\bsrc="\//)
    expect(html).not.toMatch(/\bhref="\//)
  })

  it('contains ./assets/ references', () => {
    expect(readHtml()).toContain('./assets/')
  })

  it('references a bundled JS module', () => {
    expect(readHtml()).toMatch(/src="\.\/assets\/[^"]+\.js"/)
  })

  it('references a bundled CSS file', () => {
    expect(readHtml()).toMatch(/href="\.\/assets\/[^"]+\.css"/)
  })

  it('has the correct Content-Security-Policy for RS3 APIs', () => {
    const html = readHtml()
    expect(html).toContain('secure.runescape.com')
    expect(html).toContain('services.runescape.com')
  })

  it('has a <div id="root"> mount point', () => {
    expect(readHtml()).toContain('<div id="root">')
  })
})
