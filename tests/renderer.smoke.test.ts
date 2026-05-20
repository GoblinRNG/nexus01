import { describe, it, expect } from 'vitest'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

const RENDERER_HTML = join(__dirname, '../out/renderer/index.html')

function readHtml(): string {
  return readFileSync(RENDERER_HTML, 'utf-8')
}

describe('Production renderer build', () => {
  it('out/renderer/index.html exists', () => {
    expect(existsSync(RENDERER_HTML)).toBe(true)
  })

  it('has no crossorigin attribute (required for file:// protocol)', () => {
    const html = readHtml()
    expect(html).not.toContain(' crossorigin')
  })

  it('uses relative asset paths (./assets/) not absolute (/assets/)', () => {
    const html = readHtml()
    // No src="/..." or href="/..."
    expect(html).not.toMatch(/\bsrc="\//)
    expect(html).not.toMatch(/\bhref="\//)
  })

  it('contains ./assets/ references', () => {
    const html = readHtml()
    expect(html).toContain('./assets/')
  })

  it('references a bundled JS module', () => {
    const html = readHtml()
    expect(html).toMatch(/src="\.\/assets\/[^"]+\.js"/)
  })

  it('references a bundled CSS file', () => {
    const html = readHtml()
    expect(html).toMatch(/href="\.\/assets\/[^"]+\.css"/)
  })

  it('has the correct Content-Security-Policy for RS3 APIs', () => {
    const html = readHtml()
    expect(html).toContain('secure.runescape.com')
    expect(html).toContain('services.runescape.com')
  })

  it('has a <div id="root"> mount point', () => {
    const html = readHtml()
    expect(html).toContain('<div id="root">')
  })
})
