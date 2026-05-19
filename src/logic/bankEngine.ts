import type { BankItem, BankOperation } from '../types/index.ts'

export function addItem(bank: BankItem[], name: string, qty: number, itemId?: number): BankItem[] {
  const lowerName = name.toLowerCase().trim()
  const existingIndex = bank.findIndex((item) => item.name.toLowerCase().trim() === lowerName)

  if (existingIndex >= 0) {
    const updated = [...bank]
    updated[existingIndex] = {
      ...updated[existingIndex],
      quantity: updated[existingIndex].quantity + qty,
      lastChanged: new Date().toISOString(),
    }
    return updated
  }

  const newItem: BankItem = {
    itemId: itemId ?? 0,
    name: name.trim(),
    quantity: qty,
    guidePrice: 0,
    lastChanged: new Date().toISOString(),
    source: 'Manual',
  }
  return [...bank, newItem]
}

export function removeItem(bank: BankItem[], name: string, qty: number): BankItem[] {
  const lowerName = name.toLowerCase().trim()
  const existingIndex = bank.findIndex((item) => item.name.toLowerCase().trim() === lowerName)

  if (existingIndex < 0) {
    return bank
  }

  const newQty = bank[existingIndex].quantity - qty

  if (newQty <= 0) {
    return bank.filter((_, i) => i !== existingIndex)
  }

  const updated = [...bank]
  updated[existingIndex] = {
    ...updated[existingIndex],
    quantity: newQty,
    lastChanged: new Date().toISOString(),
  }
  return updated
}

export function applyOperation(bank: BankItem[], op: BankOperation): BankItem[] {
  switch (op.op) {
    case 'add':
      if (op.outputItem !== undefined && op.outputQty !== undefined) {
        return addItem(bank, op.outputItem, op.outputQty)
      }
      return bank

    case 'remove':
      if (op.inputItem !== undefined && op.inputQty !== undefined) {
        return removeItem(bank, op.inputItem, op.inputQty)
      }
      return bank

    case 'transform': {
      let result = bank
      if (op.inputItem !== undefined && op.inputQty !== undefined) {
        result = removeItem(result, op.inputItem, op.inputQty)
      }
      if (op.outputItem !== undefined && op.outputQty !== undefined) {
        result = addItem(result, op.outputItem, op.outputQty)
      }
      return result
    }

    default:
      return bank
  }
}

export function getTotalValue(bank: BankItem[]): number {
  return bank.reduce((sum, item) => sum + item.quantity * item.guidePrice, 0)
}
