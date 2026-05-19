export type SkillName =
  | 'Overall' | 'Attack' | 'Defence' | 'Strength' | 'Constitution'
  | 'Ranged' | 'Prayer' | 'Magic' | 'Cooking' | 'Woodcutting'
  | 'Fletching' | 'Fishing' | 'Firemaking' | 'Crafting' | 'Smithing'
  | 'Mining' | 'Herblore' | 'Agility' | 'Thieving' | 'Slayer'
  | 'Farming' | 'Runecrafting' | 'Hunter' | 'Construction' | 'Summoning'
  | 'Dungeoneering' | 'Divination' | 'Invention' | 'Archaeology' | 'Necromancy'

export const RS3_SKILL_ORDER: SkillName[] = [
  'Overall', 'Attack', 'Defence', 'Strength', 'Constitution',
  'Ranged', 'Prayer', 'Magic', 'Cooking', 'Woodcutting',
  'Fletching', 'Fishing', 'Firemaking', 'Crafting', 'Smithing',
  'Mining', 'Herblore', 'Agility', 'Thieving', 'Slayer',
  'Farming', 'Runecrafting', 'Hunter', 'Construction', 'Summoning',
  'Dungeoneering', 'Divination', 'Invention', 'Archaeology', 'Necromancy',
]

export interface SkillData {
  rank: number
  level: number
  xp: number
}

export interface PlayerHiscores {
  playerName: string
  fetchedAt: string
  skills: Partial<Record<SkillName, SkillData>>
}

export type EventSource = 'OCR' | 'AI' | 'RuneMetrics' | 'Manual' | 'Bridge' | 'HiScores'

export type BankOpType = 'add' | 'remove' | 'transform'

export interface ParsedOp {
  op: BankOpType
  inputItem?: string
  inputQty?: number
  outputItem?: string
  outputQty?: number
  confidence: number
}

export interface BankOperation {
  id: string
  timestamp: string
  op: BankOpType
  inputItem?: string
  inputQty?: number
  outputItem?: string
  outputQty?: number
  sourceEventId: string
  confidence: number
  confirmed: boolean
}

export interface SourceEvent {
  id: string
  timestamp: string
  source: EventSource
  rawText: string
  confidence: number
  parsedOperation: BankOperation | null
}

export interface BankItem {
  itemId: number
  name: string
  quantity: number
  guidePrice: number
  lastChanged: string
  source: EventSource
}

export interface ItemInfo {
  id: number
  name: string
  guidePrice: number
  lastPriceSync: string
  category: string
  stackable: boolean
  spriteUrl: string
}

export interface BridgeStatus {
  launcherDetected: boolean
  gameProcessDetected: boolean
  windowFocusTracking: boolean
  mouseCaptureActive: boolean
  screenRegionCapture: boolean
  ocrTextReading: boolean
  dataParsingActive: boolean
  bankUpdating: boolean
  accountSyncActive: boolean
  lastSync: string | null
}

export interface Goal {
  id: string
  title: string
  description: string
  prerequisites: string[]
  exactAction: string
  currentProgress: number
  targetProgress: number
  unit: string
  rewards: string[]
  guideUrl?: string
}

export interface DailyChallenge {
  id: string
  title: string
  skill: string
  current: number
  target: number
  completed: boolean
  xpReward: number
  resetTime: string
}

export interface Session {
  id: string
  skill: string
  startTime: string
  endTime?: string
  startXP: number
  currentXP: number
  itemsGained: Array<{ name: string; qty: number }>
  itemsUsed: Array<{ name: string; qty: number }>
  gpGained: number
  active: boolean
}

export interface AppSettings {
  playerName: string
  launcherPath: string
  autoLaunch: boolean
  ocrThreshold: number
  aiConfidenceThreshold: number
  scanInterval: number
  selectedRegion?: { x: number; y: number; width: number; height: number }
}

export interface ClassifiedEvent {
  rawText: string
  operation: BankOperation | null
  confidence: number
  requiresApproval: boolean
  category: string
}

export type NexusTab =
  | 'dashboard' | 'bank' | 'inventory' | 'skills'
  | 'activity' | 'goals' | 'daily' | 'prices' | 'sessions' | 'settings'
  | 'observer'

export interface AppState {
  settings: AppSettings
  bridgeStatus: BridgeStatus
  hiscores: PlayerHiscores | null
  bank: BankItem[]
  inventory: BankItem[]
  activities: SourceEvent[]
  bankOperations: BankOperation[]
  goals: Goal[]
  dailyChallenges: DailyChallenge[]
  sessions: Session[]
  itemPrices: Record<string, ItemInfo>
  ocrRunning: boolean
  lastHiscoresSync: string | null
  pendingEvents: SourceEvent[]
  activeTab: NexusTab
}
