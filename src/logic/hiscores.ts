import type { PlayerHiscores, SkillData, SkillName } from '../types/index.ts'
import { RS3_SKILL_ORDER } from '../types/index.ts'

export function buildHiscoresUrl(playerName: string): string {
  return `https://secure.runescape.com/m=hiscore/index_lite.ws?player=${encodeURIComponent(playerName)}`
}

export function parseHiscoresText(raw: string, playerName: string): PlayerHiscores {
  const lines = raw.trim().split('\n')
  const skills: Partial<Record<SkillName, SkillData>> = {}

  RS3_SKILL_ORDER.forEach((skillName, index) => {
    const line = lines[index]
    if (!line) {
      skills[skillName] = { rank: -1, level: 1, xp: 0 }
      return
    }

    const parts = line.trim().split(',')
    if (parts.length < 3) {
      skills[skillName] = { rank: -1, level: 1, xp: 0 }
      return
    }

    const rank = parseInt(parts[0], 10)
    const level = parseInt(parts[1], 10)
    const xp = parseInt(parts[2], 10)

    if (isNaN(rank) || isNaN(level) || isNaN(xp)) {
      skills[skillName] = { rank: -1, level: 1, xp: 0 }
      return
    }

    skills[skillName] = { rank, level, xp }
  })

  return {
    playerName,
    fetchedAt: new Date().toISOString(),
    skills,
  }
}

export function calcCombatLevel(skills: Partial<Record<SkillName, SkillData>>): number {
  const getLevel = (name: SkillName): number => skills[name]?.level ?? 1

  const defence = getLevel('Defence')
  const constitution = getLevel('Constitution')
  const prayer = getLevel('Prayer')
  const attack = getLevel('Attack')
  const strength = getLevel('Strength')
  const ranged = getLevel('Ranged')
  const magic = getLevel('Magic')

  const base = (defence + constitution + Math.floor(prayer / 2)) / 4
  const melee = (attack + strength) * (13 / 40)
  const rangedContrib = ranged * (13 / 40)
  const magicContrib = magic * (13 / 40)

  return Math.floor(base + Math.max(melee, rangedContrib, magicContrib))
}
