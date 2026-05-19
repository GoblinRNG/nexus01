import type { ParsedOp } from '../types/index.ts'

export function normalizeItemName(raw: string): string {
  return raw.trim().replace(/\b\w/g, (c, i) => {
    // Keep original casing from the raw string but capitalize first letter of each word
    return c.toUpperCase()
  })
}

function capitalize(s: string): string {
  if (!s) return s
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export function parseActionMessage(text: string): ParsedOp | null {
  const t = text.trim()

  // ── Woodcutting ──────────────────────────────────────────────────────────
  // "You swing your hatchet at the tree." → null
  if (/^You swing your hatchet at the tree\.?$/i.test(t)) {
    return null
  }

  // "You get some <type> logs." / "You get some logs."
  const woodcutMatch = t.match(/^You get some (?:(oak|willow|maple|yew|magic) )?logs\.?$/i)
  if (woodcutMatch) {
    const prefix = woodcutMatch[1]
    const itemName = prefix ? capitalize(prefix) + ' logs' : 'Logs'
    return { op: 'add', outputItem: itemName, outputQty: 1, confidence: 0.95 }
  }

  // ── Firemaking ───────────────────────────────────────────────────────────
  // "You attempt to light the logs." → null
  if (/^You attempt to light the logs\.?$/i.test(t)) {
    return null
  }

  // "The fire catches and the logs begin to burn."
  if (/^The fire catches and the logs begin to burn\.?$/i.test(t)) {
    return { op: 'remove', inputItem: 'Logs', inputQty: 1, confidence: 0.95 }
  }

  // "You add a log to the fire."
  if (/^You add a log to the fire\.?$/i.test(t)) {
    return { op: 'remove', inputItem: 'Logs', inputQty: 1, confidence: 0.95 }
  }

  // ── Fletching ────────────────────────────────────────────────────────────
  // "You fletch <qty> arrow shafts."
  const fletchArrowMatch = t.match(/^You fletch (\d+) arrow shafts\.?$/i)
  if (fletchArrowMatch) {
    const qty = parseInt(fletchArrowMatch[1], 10)
    return {
      op: 'transform',
      inputItem: 'Logs',
      inputQty: 1,
      outputItem: 'Arrow shafts',
      outputQty: qty,
      confidence: 0.9,
    }
  }

  // "You make a shortbow (unstrung)."
  if (/^You make a shortbow \(unstrung\)\.?$/i.test(t)) {
    return {
      op: 'transform',
      inputItem: 'Logs',
      inputQty: 1,
      outputItem: 'Shortbow (unstrung)',
      outputQty: 1,
      confidence: 0.85,
    }
  }

  // ── Cooking ──────────────────────────────────────────────────────────────
  // "You successfully cook a raw <fish>."
  const cookSuccessMatch = t.match(/^You successfully cook a (raw \w+)\.?$/i)
  if (cookSuccessMatch) {
    const rawName = cookSuccessMatch[1] // e.g. "raw trout"
    const parts = rawName.toLowerCase().split(' ')
    // Remove "raw" prefix to get cooked name
    const cookedName = capitalize(parts.slice(1).join(' '))
    const inputItem = capitalize(rawName)
    return {
      op: 'transform',
      inputItem,
      inputQty: 1,
      outputItem: cookedName,
      outputQty: 1,
      confidence: 0.9,
    }
  }

  // "You burn the raw <fish>."
  const burnMatch = t.match(/^You burn the (raw \w+)\.?$/i)
  if (burnMatch) {
    const rawName = burnMatch[1]
    const inputItem = capitalize(rawName)
    return {
      op: 'transform',
      inputItem,
      inputQty: 1,
      outputItem: 'Burnt food',
      outputQty: 1,
      confidence: 0.9,
    }
  }

  // ── Fishing ──────────────────────────────────────────────────────────────
  // "You catch a raw <fish>."
  const fishMatch = t.match(/^You catch a (raw \w+)\.?$/i)
  if (fishMatch) {
    const itemName = capitalize(fishMatch[1])
    return { op: 'add', outputItem: itemName, outputQty: 1, confidence: 0.9 }
  }

  // ── Mining ───────────────────────────────────────────────────────────────
  // "You manage to mine some <ore> ore."
  const mineMatch = t.match(/^You manage to mine some (.+? ore)\.?$/i)
  if (mineMatch) {
    const oreName = capitalize(mineMatch[1])
    return { op: 'add', outputItem: oreName, outputQty: 1, confidence: 0.95 }
  }

  // ── Prayer ───────────────────────────────────────────────────────────────
  // "You bury the bones." / "You bury the dragon bones."
  const buryMatch = t.match(/^You bury the (.+?)\.?$/i)
  if (buryMatch) {
    const itemName = capitalize(buryMatch[1])
    return { op: 'remove', inputItem: itemName, inputQty: 1, confidence: 0.95 }
  }

  // "You scatter the ashes."
  if (/^You scatter the ashes\.?$/i.test(t)) {
    return { op: 'remove', inputItem: 'Ashes', inputQty: 1, confidence: 0.95 }
  }

  // ── General acquisition ──────────────────────────────────────────────────
  // "You picked up <qty> x <item>"
  const pickedUpMatch = t.match(/^You picked up (\d+) x (.+)$/i)
  if (pickedUpMatch) {
    const qty = parseInt(pickedUpMatch[1], 10)
    const itemName = pickedUpMatch[2].trim()
    return { op: 'add', outputItem: itemName, outputQty: qty, confidence: 0.95 }
  }

  // "You received <qty> <item>"
  const receivedMatch = t.match(/^You received (\d+) (.+)$/i)
  if (receivedMatch) {
    const qty = parseInt(receivedMatch[1], 10)
    const itemName = capitalize(receivedMatch[2].trim())
    return { op: 'add', outputItem: itemName, outputQty: qty, confidence: 0.95 }
  }

  // "You bought <qty> x <item>"
  const boughtMatch = t.match(/^You bought (\d+) x (.+)$/i)
  if (boughtMatch) {
    const qty = parseInt(boughtMatch[1], 10)
    const itemName = boughtMatch[2].trim()
    return { op: 'add', outputItem: itemName, outputQty: qty, confidence: 0.95 }
  }

  // "You collected <qty> x <item>"
  const collectedMatch = t.match(/^You collected (\d+) x (.+)$/i)
  if (collectedMatch) {
    const qty = parseInt(collectedMatch[1], 10)
    const itemName = collectedMatch[2].trim()
    return { op: 'add', outputItem: itemName, outputQty: qty, confidence: 0.95 }
  }

  // ── General removal ──────────────────────────────────────────────────────
  // "You sold <qty> x <item>"
  const soldMatch = t.match(/^You sold (\d+) x (.+)$/i)
  if (soldMatch) {
    const qty = parseInt(soldMatch[1], 10)
    const itemName = soldMatch[2].trim()
    return { op: 'remove', inputItem: itemName, inputQty: qty, confidence: 0.95 }
  }

  // "You dropped <qty> x <item>"
  const droppedMatch = t.match(/^You dropped (\d+) x (.+)$/i)
  if (droppedMatch) {
    const qty = parseInt(droppedMatch[1], 10)
    const itemName = droppedMatch[2].trim()
    return { op: 'remove', inputItem: itemName, inputQty: qty, confidence: 0.95 }
  }

  // "You used <qty> x <item>"
  const usedMatch = t.match(/^You used (\d+) x (.+)$/i)
  if (usedMatch) {
    const qty = parseInt(usedMatch[1], 10)
    const itemName = usedMatch[2].trim()
    return { op: 'remove', inputItem: itemName, inputQty: qty, confidence: 0.95 }
  }

  return null
}
