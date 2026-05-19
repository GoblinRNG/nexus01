import { describe, it, expect } from 'vitest'
import { buildHiscoresUrl, parseHiscoresText, calcCombatLevel } from '../src/logic/hiscores'
import type { SkillName } from '../src/types'

// ── buildHiscoresUrl ─────────────────────────────────────────────────────────

describe('buildHiscoresUrl', () => {
  it('encodes a plain player name', () => {
    const url = buildHiscoresUrl('Zezima')
    expect(url).toBe('https://secure.runescape.com/m=hiscore/index_lite.ws?player=Zezima')
  })

  it('percent-encodes spaces', () => {
    const url = buildHiscoresUrl('My Player')
    expect(url).toContain('My%20Player')
  })

  it('percent-encodes special characters', () => {
    const url = buildHiscoresUrl('player+name')
    expect(url).toContain('player%2Bname')
  })
})

// ── parseHiscoresText ────────────────────────────────────────────────────────

// Minimal CSV mimicking the RS3 HiScores response (rank,level,xp per skill)
function makeCsvLine(rank: number, level: number, xp: number) {
  return `${rank},${level},${xp}`
}

function makeFullCsv(overrides: Partial<Record<number, string>> = {}): string {
  // RS3 has 30 skills (Overall + 29)
  return Array.from({ length: 30 }, (_, i) =>
    overrides[i] ?? makeCsvLine(i + 1, 99, 13_034_431)
  ).join('\n')
}

describe('parseHiscoresText', () => {
  it('parses Overall rank/level/xp from first line', () => {
    const csv = makeFullCsv({ 0: '1,2277,4_600_000_000'.replace('_', '') })
    const result = parseHiscoresText(csv, 'TestPlayer')
    expect(result.playerName).toBe('TestPlayer')
    expect(result.skills.Overall?.rank).toBe(1)
  })

  it('parses Attack as the second skill (index 1)', () => {
    const csv = makeFullCsv({ 1: '500,99,13034431' })
    const result = parseHiscoresText(csv, 'X')
    expect(result.skills.Attack?.rank).toBe(500)
    expect(result.skills.Attack?.level).toBe(99)
    expect(result.skills.Attack?.xp).toBe(13034431)
  })

  it('parses Necromancy as the last skill (index 29)', () => {
    const csv = makeFullCsv({ 29: '42,120,200000000' })
    const result = parseHiscoresText(csv, 'X')
    expect(result.skills.Necromancy?.level).toBe(120)
    expect(result.skills.Necromancy?.xp).toBe(200000000)
  })

  it('uses default values for a malformed line', () => {
    const csv = makeFullCsv({ 5: 'bad,data' })
    const result = parseHiscoresText(csv, 'X')
    const ranged = result.skills['Ranged' as SkillName]
    expect(ranged?.level).toBe(1)
  })

  it('uses defaults for a missing line', () => {
    const csv = '1,2277,4600000000'  // only 1 line instead of 30
    const result = parseHiscoresText(csv, 'X')
    expect(result.skills.Attack?.level).toBe(1)
  })

  it('stamps fetchedAt as an ISO date string', () => {
    const csv = makeFullCsv()
    const result = parseHiscoresText(csv, 'X')
    expect(() => new Date(result.fetchedAt)).not.toThrow()
    expect(new Date(result.fetchedAt).getFullYear()).toBeGreaterThan(2020)
  })
})

// ── calcCombatLevel ──────────────────────────────────────────────────────────

describe('calcCombatLevel', () => {
  it('returns 1 for a brand-new account (all skills level 1)', () => {
    // base=(1+1+0)/4=0.5, melee=(1+1)*(13/40)=0.65 → floor(1.15)=1
    const skills = {} as Record<SkillName, { rank: number; level: number; xp: number }>
    expect(calcCombatLevel(skills)).toBe(1)
  })

  it('returns a higher level when combat skills are trained', () => {
    const skills = {
      Attack:       { rank: 1, level: 70, xp: 737627 },
      Strength:     { rank: 1, level: 70, xp: 737627 },
      Defence:      { rank: 1, level: 70, xp: 737627 },
      Constitution: { rank: 1, level: 75, xp: 1210421 },
      Prayer:       { rank: 1, level: 43, xp: 50339 },
      Magic:        { rank: 1, level: 1, xp: 0 },
      Ranged:       { rank: 1, level: 1, xp: 0 },
    } as Partial<Record<SkillName, { rank: number; level: number; xp: number }>>
    const level = calcCombatLevel(skills as Record<SkillName, { rank: number; level: number; xp: number }>)
    expect(level).toBeGreaterThan(50)
    expect(level).toBeLessThan(200)
  })

  it('returns 126 for maxed RS3 combat stats (all 99)', () => {
    // base=(99+99+49)/4=61.75, melee=(99+99)*(13/40)=64.35 → floor(126.1)=126
    const maxSkills = Object.fromEntries(
      ['Attack', 'Defence', 'Strength', 'Constitution', 'Prayer', 'Ranged', 'Magic'].map(
        k => [k, { rank: 1, level: 99, xp: 13034431 }]
      )
    ) as Partial<Record<SkillName, { rank: number; level: number; xp: number }>>
    const level = calcCombatLevel(maxSkills as Record<SkillName, { rank: number; level: number; xp: number }>)
    expect(level).toBe(126)
  })
})
