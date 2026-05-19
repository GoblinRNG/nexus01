import { describe, it, expect } from 'vitest'
import { buildItemDbUrl, buildSpriteUrl, parseItemDbResponse } from '../src/logic/prices'

// ── buildItemDbUrl ────────────────────────────────────────────────────────────

describe('buildItemDbUrl', () => {
  it('returns the correct catalogue API URL', () => {
    expect(buildItemDbUrl(995)).toBe(
      'https://services.runescape.com/m=itemdb_rs/api/catalogue/detail.json?item=995'
    )
  })

  it('handles non-standard item IDs', () => {
    expect(buildItemDbUrl(536)).toContain('item=536')
  })
})

// ── buildSpriteUrl ────────────────────────────────────────────────────────────

describe('buildSpriteUrl', () => {
  it('returns the GIF sprite URL', () => {
    expect(buildSpriteUrl(1511)).toBe(
      'https://services.runescape.com/m=itemdb_rs/obj_sprite.gif?id=1511'
    )
  })
})

// ── parseItemDbResponse ───────────────────────────────────────────────────────

describe('parseItemDbResponse', () => {
  it('returns empty object for null input', () => {
    expect(parseItemDbResponse(null)).toEqual({})
  })

  it('returns empty object for missing item key', () => {
    expect(parseItemDbResponse({ foo: 'bar' })).toEqual({})
  })

  it('parses numeric guide price', () => {
    const result = parseItemDbResponse({ item: { id: 995, name: 'Coins', price: 1 } })
    expect(result.guidePrice).toBe(1)
    expect(result.name).toBe('Coins')
  })

  it('parses string guide price with commas', () => {
    const result = parseItemDbResponse({ item: { id: 1511, name: 'Logs', price: '1,234' } })
    expect(result.guidePrice).toBe(1234)
  })

  it('parses item id from string', () => {
    const result = parseItemDbResponse({ item: { id: '536', name: 'Dragon bones' } })
    expect(result.id).toBe(536)
  })

  it('prefers icon_large over icon for spriteUrl', () => {
    const result = parseItemDbResponse({
      item: { id: 1, icon: 'small.gif', icon_large: 'large.gif' },
    })
    expect(result.spriteUrl).toBe('large.gif')
  })

  it('falls back to icon if icon_large is missing', () => {
    const result = parseItemDbResponse({ item: { id: 1, icon: 'small.gif' } })
    expect(result.spriteUrl).toBe('small.gif')
  })

  it('parses stackable as boolean from boolean', () => {
    expect(parseItemDbResponse({ item: { id: 995, stackable: true } }).stackable).toBe(true)
    expect(parseItemDbResponse({ item: { id: 100, stackable: false } }).stackable).toBe(false)
  })

  it('parses stackable as boolean from number (1 = true)', () => {
    expect(parseItemDbResponse({ item: { id: 1, stackable: 1 } }).stackable).toBe(true)
    expect(parseItemDbResponse({ item: { id: 1, stackable: 0 } }).stackable).toBe(false)
  })

  it('stamps lastPriceSync when absent from response', () => {
    const result = parseItemDbResponse({ item: { id: 1 } })
    expect(result.lastPriceSync).toBeTruthy()
    expect(new Date(result.lastPriceSync!).getFullYear()).toBeGreaterThan(2020)
  })
})
