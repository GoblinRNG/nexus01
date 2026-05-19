export interface Skill {
  name: string
  level: number
  xp: number
  color: string
  abbr: string
}

export const SKILLS: Skill[] = [
  { name: 'Attack',        level: 99,  xp: 13_034_431, color: '#e74c3c', abbr: 'ATK' },
  { name: 'Hitpoints',     level: 99,  xp: 14_391_160, color: '#c0392b', abbr: 'HP'  },
  { name: 'Mining',        level: 99,  xp: 13_034_431, color: '#95a5a6', abbr: 'MIN' },
  { name: 'Strength',      level: 99,  xp: 13_034_431, color: '#e67e22', abbr: 'STR' },
  { name: 'Agility',       level: 99,  xp: 13_034_431, color: '#3498db', abbr: 'AGI' },
  { name: 'Smithing',      level: 99,  xp: 13_034_431, color: '#7f8c8d', abbr: 'SMI' },
  { name: 'Defence',       level: 99,  xp: 13_034_431, color: '#2980b9', abbr: 'DEF' },
  { name: 'Herblore',      level: 99,  xp: 13_034_431, color: '#27ae60', abbr: 'HER' },
  { name: 'Fishing',       level: 99,  xp: 13_034_431, color: '#5dade2', abbr: 'FSH' },
  { name: 'Ranged',        level: 99,  xp: 13_034_431, color: '#27ae60', abbr: 'RNG' },
  { name: 'Thieving',      level: 99,  xp: 13_034_431, color: '#8e44ad', abbr: 'THI' },
  { name: 'Cooking',       level: 99,  xp: 13_034_431, color: '#e74c3c', abbr: 'COO' },
  { name: 'Prayer',        level: 99,  xp: 13_034_431, color: '#f1c40f', abbr: 'PRY' },
  { name: 'Crafting',      level: 99,  xp: 13_034_431, color: '#d4ac0d', abbr: 'CRA' },
  { name: 'Firemaking',    level: 99,  xp: 13_034_431, color: '#e74c3c', abbr: 'FIR' },
  { name: 'Magic',         level: 99,  xp: 13_034_431, color: '#9b59b6', abbr: 'MAG' },
  { name: 'Fletching',     level: 99,  xp: 13_034_431, color: '#2ecc71', abbr: 'FLE' },
  { name: 'Woodcutting',   level: 99,  xp: 13_034_431, color: '#8d6e63', abbr: 'WC'  },
  { name: 'Runecrafting',  level: 99,  xp: 13_034_431, color: '#f39c12', abbr: 'RC'  },
  { name: 'Slayer',        level: 99,  xp: 13_034_431, color: '#2c3e50', abbr: 'SLY' },
  { name: 'Farming',       level: 99,  xp: 13_034_431, color: '#27ae60', abbr: 'FAR' },
  { name: 'Construction',  level: 99,  xp: 13_034_431, color: '#d4ac0d', abbr: 'CON' },
  { name: 'Hunter',        level: 99,  xp: 13_034_431, color: '#795548', abbr: 'HUN' },
  { name: 'Summoning',     level: 99,  xp: 13_034_431, color: '#e91e63', abbr: 'SUM' },
  { name: 'Dungeoneering', level: 120, xp: 80_618_654, color: '#1a237e', abbr: 'DUN' },
  { name: 'Divination',    level: 99,  xp: 13_034_431, color: '#ab47bc', abbr: 'DIV' },
  { name: 'Invention',     level: 120, xp: 80_618_654, color: '#0097a7', abbr: 'INV' },
  { name: 'Archaeology',   level: 120, xp: 80_618_654, color: '#795548', abbr: 'ARC' },
  { name: 'Necromancy',    level: 120, xp: 80_618_654, color: '#37474f', abbr: 'NEC' },
]

export interface NewsItem {
  id: number
  title: string
  date: string
  category: string
  color: string
}

export const NEWS_ITEMS: NewsItem[] = [
  { id: 1, title: 'The New in RuneScape', date: '18 Nov', category: 'UPDATE', color: '#e74c3c' },
  { id: 2, title: 'Yak Track 3494 §.0', date: '15 Nov', category: 'EVENT', color: '#f39c12' },
  { id: 3, title: 'Combat Beta Phase 3', date: '12 Nov', category: 'BETA', color: '#3498db' },
]

export interface PartyMember {
  rsn: string
  level: number
  hit: number
  maxHit: number
  color: string
}

export const PARTY_MEMBERS: PartyMember[] = [
  { rsn: 'FireMage99',   level: 138, hit: 4210, maxHit: 8500, color: '#e74c3c' },
  { rsn: 'ArchSlayer',   level: 138, hit: 3890, maxHit: 7200, color: '#3498db' },
  { rsn: 'NecroKing',    level: 138, hit: 5100, maxHit: 9100, color: '#9b59b6' },
  { rsn: 'RangedPro',    level: 135, hit: 2760, maxHit: 6400, color: '#27ae60' },
]
