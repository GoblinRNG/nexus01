import { describe, it, expect } from 'vitest'
import { classifyEvent, detectCategory } from '../src/logic/aiClassifier.ts'
import { isDuplicate } from '../src/logic/dedupe.ts'
import type { SourceEvent } from '../src/types/index.ts'

function makeSourceEvent(rawText: string, timestamp?: string): SourceEvent {
  return {
    id: `evt-${Math.random().toString(36).slice(2)}`,
    timestamp: timestamp ?? new Date().toISOString(),
    source: 'OCR',
    rawText,
    confidence: 1.0,
    parsedOperation: null,
  }
}

describe('classifyEvent', () => {
  it('1. "You get some logs." with ocrConfidence:1.0 → requiresApproval:false, confidence >= 0.7', () => {
    const result = classifyEvent('You get some logs.', 1.0)
    expect(result.requiresApproval).toBe(false)
    expect(result.confidence).toBeGreaterThanOrEqual(0.7)
  })

  it('2. "You get some logs." with ocrConfidence:0.5 → requiresApproval:true (low OCR confidence degrades result)', () => {
    const result = classifyEvent('You get some logs.', 0.5)
    expect(result.requiresApproval).toBe(true)
  })

  it('3. Same event text submitted twice → isDuplicate returns true within window', () => {
    const text = 'You get some logs.'
    const now = Date.now()
    const event1 = makeSourceEvent(text, new Date(now).toISOString())
    const event2 = makeSourceEvent(text, new Date(now + 1000).toISOString())
    expect(isDuplicate(event2, [event1])).toBe(true)
  })

  it('4. Low confidence event → operation.confirmed:false', () => {
    const result = classifyEvent('You get some logs.', 0.5)
    expect(result.operation).not.toBeNull()
    expect(result.operation!.confirmed).toBe(false)
  })

  it('5. "You swing your hatchet at the tree." → operation:null', () => {
    const result = classifyEvent('You swing your hatchet at the tree.')
    expect(result.operation).toBeNull()
  })

  it('6. detectCategory("You get some logs.") → Woodcutting', () => {
    expect(detectCategory('You get some logs.')).toBe('Woodcutting')
  })

  it('7. detectCategory("You fletch 15 arrow shafts.") → Fletching', () => {
    expect(detectCategory('You fletch 15 arrow shafts.')).toBe('Fletching')
  })

  it('8. detectCategory("You catch a raw trout.") → Fishing', () => {
    expect(detectCategory('You catch a raw trout.')).toBe('Fishing')
  })
})
