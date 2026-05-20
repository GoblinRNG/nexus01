import { describe, it, expect } from 'vitest'
import { addItem, removeItem, applyOperation, getTotalValue } from '../src/logic/bankEngine'
import type { BankItem, BankOperation } from '../src/types'

function makeItem(name: string, qty: number, guidePrice = 0): BankItem {
  return { itemId: 1, name, quantity: qty, guidePrice, lastChanged: '', source: 'Manual' }
}

function makeOp(overrides: Partial<BankOperation>): BankOperation {
  return {
    id: 'op-1',
    timestamp: new Date().toISOString(),
    op: 'add',
    sourceEventId: '',
    confidence: 0.9,
    confirmed: true,
    ...overrides,
  }
}

// ── addItem ───────────────────────────────────────────────────────────────────

describe('addItem', () => {
  it('adds a new item to an empty bank', () => {
    const result = addItem([], 'Logs', 10)
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('Logs')
    expect(result[0].quantity).toBe(10)
  })

  it('stacks onto an existing item by name (case-insensitive)', () => {
    const bank = [makeItem('Logs', 5)]
    const result = addItem(bank, 'logs', 3)
    expect(result).toHaveLength(1)
    expect(result[0].quantity).toBe(8)
  })

  it('adds a second distinct item', () => {
    const bank = [makeItem('Logs', 5)]
    const result = addItem(bank, 'Oak logs', 2)
    expect(result).toHaveLength(2)
  })

  it('uses the provided itemId for new items', () => {
    const result = addItem([], 'Coal', 1, 453)
    expect(result[0].itemId).toBe(453)
  })
})

// ── removeItem ────────────────────────────────────────────────────────────────

describe('removeItem', () => {
  it('decrements quantity', () => {
    const bank = [makeItem('Logs', 10)]
    const result = removeItem(bank, 'Logs', 3)
    expect(result[0].quantity).toBe(7)
  })

  it('removes the item entirely when quantity reaches 0', () => {
    const bank = [makeItem('Logs', 5)]
    const result = removeItem(bank, 'Logs', 5)
    expect(result).toHaveLength(0)
  })

  it('removes the item when quantity goes below 0', () => {
    const bank = [makeItem('Logs', 2)]
    const result = removeItem(bank, 'Logs', 10)
    expect(result).toHaveLength(0)
  })

  it('returns the bank unchanged if item not found', () => {
    const bank = [makeItem('Logs', 5)]
    const result = removeItem(bank, 'Coal', 1)
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('Logs')
  })
})

// ── applyOperation ────────────────────────────────────────────────────────────

describe('applyOperation', () => {
  it('add op increases item quantity', () => {
    const bank: BankItem[] = []
    const op = makeOp({ op: 'add', outputItem: 'Yew logs', outputQty: 5 })
    const result = applyOperation(bank, op)
    expect(result[0].quantity).toBe(5)
  })

  it('remove op decreases item quantity', () => {
    const bank = [makeItem('Logs', 10)]
    const op = makeOp({ op: 'remove', inputItem: 'Logs', inputQty: 3 })
    const result = applyOperation(bank, op)
    expect(result[0].quantity).toBe(7)
  })

  it('transform op consumes input and produces output', () => {
    const bank = [makeItem('Logs', 5)]
    const op = makeOp({ op: 'transform', inputItem: 'Logs', inputQty: 1, outputItem: 'Arrow shafts', outputQty: 15 })
    const result = applyOperation(bank, op)
    const logs  = result.find(i => i.name === 'Logs')
    const shafts = result.find(i => i.name === 'Arrow shafts')
    expect(logs?.quantity).toBe(4)
    expect(shafts?.quantity).toBe(15)
  })
})

// ── getTotalValue ─────────────────────────────────────────────────────────────

describe('getTotalValue', () => {
  it('returns 0 for empty bank', () => {
    expect(getTotalValue([])).toBe(0)
  })

  it('sums quantity × guidePrice', () => {
    const bank = [
      makeItem('Coins', 1000, 1),
      makeItem('Yew logs', 500, 200),
    ]
    expect(getTotalValue(bank)).toBe(1000 + 500 * 200)
  })
})
