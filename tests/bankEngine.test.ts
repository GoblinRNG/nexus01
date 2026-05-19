import { describe, it, expect } from 'vitest'
import { addItem, removeItem, applyOperation, getTotalValue } from '../src/logic/bankEngine.ts'
import type { BankItem, BankOperation } from '../src/types/index.ts'

function makeBank(items: Array<{ name: string; quantity: number; guidePrice?: number }>): BankItem[] {
  return items.map((item, i) => ({
    itemId: i + 1,
    name: item.name,
    quantity: item.quantity,
    guidePrice: item.guidePrice ?? 0,
    lastChanged: new Date().toISOString(),
    source: 'Manual' as const,
  }))
}

function makeOp(partial: Partial<BankOperation> & Pick<BankOperation, 'op'>): BankOperation {
  return {
    id: 'test-id',
    timestamp: new Date().toISOString(),
    sourceEventId: 'test-source-event-id',
    confidence: 0.95,
    confirmed: true,
    inputItem: undefined,
    inputQty: undefined,
    outputItem: undefined,
    outputQty: undefined,
    ...partial,
  }
}

describe('bankEngine', () => {
  it('1. addItem to empty bank → bank has 1 item with correct qty', () => {
    const result = addItem([], 'Logs', 5)
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('Logs')
    expect(result[0].quantity).toBe(5)
  })

  it('2. addItem to bank with existing same item (case insensitive) → qty increases', () => {
    const bank = makeBank([{ name: 'Logs', quantity: 10 }])
    const result = addItem(bank, 'logs', 5)
    expect(result).toHaveLength(1)
    expect(result[0].quantity).toBe(15)
  })

  it('3. removeItem reduces qty', () => {
    const bank = makeBank([{ name: 'Logs', quantity: 10 }])
    const result = removeItem(bank, 'Logs', 3)
    expect(result).toHaveLength(1)
    expect(result[0].quantity).toBe(7)
  })

  it('4. removeItem to 0 → item removed from bank', () => {
    const bank = makeBank([{ name: 'Logs', quantity: 5 }])
    const result = removeItem(bank, 'Logs', 5)
    expect(result).toHaveLength(0)
  })

  it('5. removeItem on non-existing item → bank unchanged', () => {
    const bank = makeBank([{ name: 'Logs', quantity: 10 }])
    const result = removeItem(bank, 'Bones', 3)
    expect(result).toHaveLength(1)
    expect(result[0].quantity).toBe(10)
  })

  it("6. applyOperation 'add' with outputItem:'Logs', outputQty:5 → bank has Logs x5", () => {
    const op = makeOp({ op: 'add', outputItem: 'Logs', outputQty: 5 })
    const result = applyOperation([], op)
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('Logs')
    expect(result[0].quantity).toBe(5)
  })

  it("7. applyOperation 'remove' with inputItem:'Logs', inputQty:2 → removes 2 Logs", () => {
    const bank = makeBank([{ name: 'Logs', quantity: 10 }])
    const op = makeOp({ op: 'remove', inputItem: 'Logs', inputQty: 2 })
    const result = applyOperation(bank, op)
    expect(result).toHaveLength(1)
    expect(result[0].quantity).toBe(8)
  })

  it("8. applyOperation 'transform' → removes input, adds output", () => {
    const bank = makeBank([{ name: 'Logs', quantity: 5 }])
    const op = makeOp({
      op: 'transform',
      inputItem: 'Logs',
      inputQty: 1,
      outputItem: 'Arrow shafts',
      outputQty: 15,
    })
    const result = applyOperation(bank, op)
    const logs = result.find((item) => item.name.toLowerCase() === 'logs')
    const shafts = result.find((item) => item.name.toLowerCase() === 'arrow shafts')
    expect(logs?.quantity).toBe(4)
    expect(shafts?.quantity).toBe(15)
  })

  it('9. getTotalValue returns correct sum', () => {
    const bank = makeBank([
      { name: 'Logs', quantity: 10, guidePrice: 100 },
      { name: 'Bones', quantity: 5, guidePrice: 200 },
    ])
    const total = getTotalValue(bank)
    expect(total).toBe(10 * 100 + 5 * 200)
  })
})
