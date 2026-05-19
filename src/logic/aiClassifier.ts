import type { ClassifiedEvent, BankOperation } from '../types/index.ts'
import { parseActionMessage } from './parser.ts'

export function detectCategory(text: string): string {
  const lower = text.toLowerCase()

  if (
    lower.includes('hatchet') ||
    lower.includes('logs') ||
    lower.includes('get some') ||
    lower.includes('willow') ||
    lower.includes('oak') ||
    lower.includes('maple') ||
    lower.includes('yew') ||
    lower.includes('magic log')
  ) {
    // Disambiguate from firemaking
    if (
      lower.includes('fire catches') ||
      lower.includes('add a log to the fire') ||
      lower.includes('attempt to light')
    ) {
      return 'Firemaking'
    }
    return 'Woodcutting'
  }

  if (
    lower.includes('fire catches') ||
    lower.includes('begin to burn') ||
    lower.includes('attempt to light') ||
    lower.includes('add a log to the fire')
  ) {
    return 'Firemaking'
  }

  if (lower.includes('fletch') || lower.includes('shortbow') || lower.includes('arrow shaft')) {
    return 'Fletching'
  }

  if (
    lower.includes('cook') ||
    lower.includes('burn the raw') ||
    lower.includes('burnt food')
  ) {
    return 'Cooking'
  }

  if (lower.includes('catch a raw') || lower.includes('catch a')) {
    return 'Fishing'
  }

  if (lower.includes('mine some') || lower.includes(' ore')) {
    return 'Mining'
  }

  if (lower.includes('bury') || lower.includes('scatter the ashes')) {
    return 'Prayer'
  }

  if (
    lower.includes('picked up') ||
    lower.includes('received') ||
    lower.includes('bought') ||
    lower.includes('collected')
  ) {
    return 'Loot'
  }

  if (
    lower.includes('sold') ||
    lower.includes('dropped') ||
    lower.includes('used ')
  ) {
    return 'Removal'
  }

  return 'Unknown'
}

export function classifyEvent(rawText: string, ocrConfidence: number = 1.0): ClassifiedEvent {
  const parsedOp = parseActionMessage(rawText)
  const category = detectCategory(rawText)

  if (parsedOp === null) {
    return {
      rawText,
      operation: null,
      confidence: 0,
      requiresApproval: true,
      category,
    }
  }

  const combinedConfidence = parsedOp.confidence * ocrConfidence
  const requiresApproval = combinedConfidence < 0.75

  const operation: BankOperation = {
    id: `op-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    timestamp: new Date().toISOString(),
    op: parsedOp.op,
    inputItem: parsedOp.inputItem,
    inputQty: parsedOp.inputQty,
    outputItem: parsedOp.outputItem,
    outputQty: parsedOp.outputQty,
    sourceEventId: '',
    confidence: combinedConfidence,
    confirmed: !requiresApproval,
  }

  return {
    rawText,
    operation,
    confidence: combinedConfidence,
    requiresApproval,
    category,
  }
}
