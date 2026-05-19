/**
 * RS3 combat level formula:
 *   base = (Defence + Constitution + floor(Prayer / 2)) / 4
 *   melee = (Attack + Strength) * 13/40
 *   ranged = Ranged * 13/40
 *   magic = Magic * 13/40
 *   combatLevel = floor(base + max(melee, ranged, magic))
 *
 * Summoning is accepted for compatibility but not factored into the standard formula above.
 */
export function calcCombatLevel(
  attack: number,
  strength: number,
  defence: number,
  constitution: number,
  prayer: number,
  ranged: number,
  magic: number,
  _summoning: number = 1
): number {
  const base = (defence + constitution + Math.floor(prayer / 2)) / 4
  const melee = (attack + strength) * (13 / 40)
  const rangedContrib = ranged * (13 / 40)
  const magicContrib = magic * (13 / 40)

  return Math.floor(base + Math.max(melee, rangedContrib, magicContrib))
}
