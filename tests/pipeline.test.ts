import { describe, it, expect } from 'vitest'
import { isDuplicate, hashEvent } from '../src/logic/dedupe'
import { parseActionMessage } from '../src/logic/parser'
import { classifyEvent, detectCategory } from '../src/logic/aiClassifier'
import type { SourceEvent } from '../src/types'

function makeEvent(overrides: Partial<SourceEvent> = {}): SourceEvent {
  return {
    id:              crypto.randomUUID(),
    timestamp:       new Date().toISOString(),
    source:          'OCR',
    rawText:         'You get some logs.',
    confidence:      0.9,
    parsedOperation: null,
    ...overrides,
  }
}

// ── hashEvent ─────────────────────────────────────────────────────────────────

describe('hashEvent', () => {
  it('produces source:text format', () => {
    const e = makeEvent({ source: 'OCR', rawText: 'You get some logs.' })
    expect(hashEvent(e)).toBe('OCR:you get some logs.')
  })

  it('normalises case', () => {
    const a = makeEvent({ rawText: 'Hello World' })
    const b = makeEvent({ rawText: 'hello world' })
    expect(hashEvent(a)).toBe(hashEvent(b))
  })
})

// ── isDuplicate ───────────────────────────────────────────────────────────────

describe('isDuplicate', () => {
  it('returns false when recent list is empty', () => {
    const ev = makeEvent()
    expect(isDuplicate(ev, [])).toBe(false)
  })

  it('detects identical event within 10-second window', () => {
    const ev = makeEvent({ rawText: 'You get some logs.' })
    expect(isDuplicate(ev, [ev])).toBe(true)
  })

  it('allows the same text from different sources', () => {
    const ev1 = makeEvent({ source: 'OCR',        rawText: 'You get some logs.' })
    const ev2 = makeEvent({ source: 'RuneMetrics', rawText: 'You get some logs.' })
    expect(isDuplicate(ev2, [ev1])).toBe(false)
  })

  it('allows identical text outside the time window', () => {
    const old = makeEvent({
      rawText:   'You get some logs.',
      timestamp: new Date(Date.now() - 20_000).toISOString(),
    })
    const fresh = makeEvent({ rawText: 'You get some logs.' })
    expect(isDuplicate(fresh, [old], 10_000)).toBe(false)
  })

  it('rejects identical text inside a custom window', () => {
    const recent = makeEvent({
      rawText:   'You get some logs.',
      timestamp: new Date(Date.now() - 3_000).toISOString(),
    })
    const fresh = makeEvent({ rawText: 'You get some logs.' })
    expect(isDuplicate(fresh, [recent], 10_000)).toBe(true)
  })
})

// ── parseActionMessage ────────────────────────────────────────────────────────

describe('parseActionMessage', () => {
  it('parses woodcutting oak logs add op', () => {
    const op = parseActionMessage('You get some oak logs.')
    expect(op).not.toBeNull()
    expect(op!.op).toBe('add')
    expect(op!.outputItem).toBe('Oak logs')
    expect(op!.outputQty).toBe(1)
  })

  it('parses generic logs', () => {
    const op = parseActionMessage('You get some logs.')
    expect(op?.outputItem).toBe('Logs')
  })

  it('parses firemaking (log remove)', () => {
    const op = parseActionMessage('The fire catches and the logs begin to burn.')
    expect(op?.op).toBe('remove')
    expect(op?.inputItem).toBe('Logs')
  })

  it('parses fletching transform', () => {
    const op = parseActionMessage('You fletch 15 arrow shafts.')
    expect(op?.op).toBe('transform')
    expect(op?.outputItem).toBe('Arrow shafts')
    expect(op?.outputQty).toBe(15)
  })

  it('parses mining ore add op', () => {
    const op = parseActionMessage('You manage to mine some iron ore.')
    expect(op?.op).toBe('add')
    expect(op?.outputItem).toBe('Iron ore')
  })

  it('returns null for unparseable text', () => {
    expect(parseActionMessage('Random game message.')).toBeNull()
  })

  it('returns null for mid-animation messages', () => {
    expect(parseActionMessage('You swing your hatchet at the tree.')).toBeNull()
  })
})

// ── detectCategory ────────────────────────────────────────────────────────────

describe('detectCategory', () => {
  it('categorises log messages as Woodcutting', () => {
    expect(detectCategory('You get some yew logs.')).toBe('Woodcutting')
  })

  it('categorises fire-catching as Firemaking', () => {
    expect(detectCategory('The fire catches and the logs begin to burn.')).toBe('Firemaking')
  })

  it('categorises fishing messages', () => {
    expect(detectCategory('You catch a raw trout.')).toBe('Fishing')
  })

  it('categorises mining messages', () => {
    expect(detectCategory('You manage to mine some coal ore.')).toBe('Mining')
  })

  it('returns Unknown for unrecognised messages', () => {
    expect(detectCategory('A wild goose appears.')).toBe('Unknown')
  })
})

// ── classifyEvent full pipeline ───────────────────────────────────────────────

describe('classifyEvent', () => {
  it('classifies high-confidence woodcutting event', () => {
    const result = classifyEvent('You get some oak logs.', 0.95)
    expect(result.category).toBe('Woodcutting')
    expect(result.operation).not.toBeNull()
    expect(result.confidence).toBeGreaterThan(0.7)
    expect(result.requiresApproval).toBe(false)
  })

  it('marks low OCR confidence as requires approval', () => {
    const result = classifyEvent('You get some oak logs.', 0.3)
    expect(result.requiresApproval).toBe(true)
  })

  it('handles unparseable text gracefully', () => {
    const result = classifyEvent('Unknown activity here', 1.0)
    expect(result.operation).toBeNull()
    expect(result.requiresApproval).toBe(true)
  })
})
