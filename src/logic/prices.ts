import type { ItemInfo } from '../types/index.ts'

export function buildItemDbUrl(itemId: number): string {
  return `https://services.runescape.com/m=itemdb_rs/api/catalogue/detail.json?item=${itemId}`
}

export function buildSpriteUrl(itemId: number): string {
  return `https://services.runescape.com/m=itemdb_rs/obj_sprite.gif?id=${itemId}`
}

interface ItemDbApiItem {
  id?: unknown
  name?: unknown
  description?: unknown
  type?: unknown
  typeIcon?: unknown
  icon?: unknown
  icon_large?: unknown
  price?: unknown
  lastPriceSync?: unknown
  stackable?: unknown
  noteable?: unknown
  members?: unknown
}

interface ItemDbApiResponse {
  item?: ItemDbApiItem
}

export function parseItemDbResponse(data: unknown): Partial<ItemInfo> {
  if (typeof data !== 'object' || data === null) {
    return {}
  }

  const response = data as ItemDbApiResponse

  if (!response.item || typeof response.item !== 'object') {
    return {}
  }

  const item = response.item
  const result: Partial<ItemInfo> = {}

  if (typeof item.id === 'number') {
    result.id = item.id
  } else if (typeof item.id === 'string') {
    const parsed = parseInt(item.id, 10)
    if (!isNaN(parsed)) result.id = parsed
  }

  if (typeof item.name === 'string') {
    result.name = item.name
  }

  // Guide price may be a string with commas like "1,234" or a number
  if (typeof item.price === 'number') {
    result.guidePrice = item.price
  } else if (typeof item.price === 'string') {
    const cleaned = (item.price as string).replace(/,/g, '')
    const parsed = parseInt(cleaned, 10)
    if (!isNaN(parsed)) result.guidePrice = parsed
  }

  if (typeof item.icon_large === 'string') {
    result.spriteUrl = item.icon_large
  } else if (typeof item.icon === 'string') {
    result.spriteUrl = item.icon
  }

  if (typeof item.type === 'string') {
    result.category = item.type
  }

  if (typeof item.stackable === 'boolean') {
    result.stackable = item.stackable
  } else if (typeof item.stackable === 'number') {
    result.stackable = item.stackable === 1
  }

  if (typeof item.lastPriceSync === 'string') {
    result.lastPriceSync = item.lastPriceSync
  } else {
    result.lastPriceSync = new Date().toISOString()
  }

  return result
}
