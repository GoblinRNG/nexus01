import { net } from 'electron'
import { RS3_SKILL_ORDER, SkillName, SkillData } from '../../src/types/index'

export interface HiscoresResult {
  success: boolean
  playerName: string
  fetchedAt: string
  skills?: Partial<Record<SkillName, SkillData>>
  error?: string
}

export interface PriceResult {
  success: boolean
  itemId: number
  name?: string
  guidePrice?: number
  error?: string
}

export async function fetchHiscores(playerName: string): Promise<HiscoresResult> {
  const url = `https://secure.runescape.com/m=hiscore/index_lite.ws?player=${encodeURIComponent(playerName)}`
  try {
    const resp = await net.fetch(url)
    if (!resp.ok) {
      return { success: false, playerName, fetchedAt: new Date().toISOString(), error: `HTTP ${resp.status}` }
    }
    const text = await resp.text()
    const lines = text.trim().split('\n')
    const skills: Partial<Record<SkillName, SkillData>> = {}
    RS3_SKILL_ORDER.forEach((name, i) => {
      const parts = (lines[i] ?? '').split(',')
      if (parts.length >= 3) {
        skills[name] = {
          rank:  parseInt(parts[0]) || -1,
          level: parseInt(parts[1]) || 1,
          xp:    parseInt(parts[2]) || 0,
        }
      }
    })
    return { success: true, playerName, fetchedAt: new Date().toISOString(), skills }
  } catch (err) {
    return { success: false, playerName, fetchedAt: new Date().toISOString(), error: String(err) }
  }
}

export async function fetchItemPrice(itemId: number): Promise<PriceResult> {
  const url = `https://services.runescape.com/m=itemdb_rs/api/catalogue/detail.json?item=${itemId}`
  try {
    const resp = await net.fetch(url)
    if (!resp.ok) return { success: false, itemId, error: `HTTP ${resp.status}` }
    const json = await resp.json() as { item?: { name?: string; current?: { price?: string | number } } }
    const item = json?.item
    const rawPrice = item?.current?.price
    const guidePrice = typeof rawPrice === 'number'
      ? rawPrice
      : parseInt(String(rawPrice ?? '0').replace(/,/g, '')) || 0
    return { success: true, itemId, name: item?.name, guidePrice }
  } catch (err) {
    return { success: false, itemId, error: String(err) }
  }
}
