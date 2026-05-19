import {
  createContext, useContext, useReducer, useEffect,
  Dispatch, ReactNode,
} from 'react'
import {
  AppState, AppSettings, BankItem, BankOperation, SourceEvent,
  Goal, DailyChallenge, Session, BridgeStatus, PlayerHiscores,
  ItemInfo, NexusTab,
} from '../types'
import goalsSeed from '../data/goals.seed.json'
import itemsSeed from '../data/items.seed.json'

// ── ElectronAPI type ─────────────────────────────────────────────────────────

interface ElectronAPI {
  detectLauncher:  (path?: string) => Promise<{ detected: boolean; path: string | null; isRunning: boolean }>
  launchGame:      (path: string) => Promise<{ success: boolean; error?: string }>
  getBridgeStatus: () => Promise<BridgeStatus>
  fetchHiscores:   (name: string) => Promise<{ success: boolean; skills?: PlayerHiscores['skills']; error?: string }>
  fetchItemPrice:  (id: number) => Promise<{ success: boolean; guidePrice?: number; name?: string }>
  readStore:       (key: string) => Promise<unknown>
  writeStore:      (key: string, value: unknown) => Promise<void>
  getDataDir:      () => Promise<string>
  captureRegion:   (r: { x: number; y: number; width: number; height: number }) => Promise<{ success: boolean; dataUrl?: string }>
  selectRegion:    () => Promise<{ x: number; y: number; width: number; height: number }>
  onBridgeUpdate:  (cb: (status: unknown) => void) => () => void
}

declare global {
  interface Window { electronAPI?: ElectronAPI }
}

// ── Default state ─────────────────────────────────────────────────────────────

const DEFAULT_SETTINGS: AppSettings = {
  playerName:            '',
  launcherPath:          'C:\\Program Files\\Jagex Launcher\\JagexLauncher.exe',
  autoLaunch:            false,
  ocrThreshold:          60,
  aiConfidenceThreshold: 75,
  scanInterval:          2000,
}

const DEFAULT_BRIDGE: BridgeStatus = {
  launcherDetected:    false,
  gameProcessDetected: false,
  windowFocusTracking: true,
  mouseCaptureActive:  false,
  screenRegionCapture: true,
  ocrTextReading:      true,
  dataParsingActive:   true,
  bankUpdating:        true,
  accountSyncActive:   false,
  lastSync:            null,
}

const SAMPLE_CHALLENGES: DailyChallenge[] = [
  { id: 'dc1', title: 'Chop 50 oak logs',       skill: 'Woodcutting', current: 0, target: 50, completed: false, xpReward: 15000, resetTime: '00:00 UTC' },
  { id: 'dc2', title: 'Mine 30 iron ore',        skill: 'Mining',      current: 0, target: 30, completed: false, xpReward: 12000, resetTime: '00:00 UTC' },
  { id: 'dc3', title: 'Catch 20 raw salmon',     skill: 'Fishing',     current: 0, target: 20, completed: false, xpReward: 10000, resetTime: '00:00 UTC' },
]

const INITIAL_STATE: AppState = {
  settings:          DEFAULT_SETTINGS,
  bridgeStatus:      DEFAULT_BRIDGE,
  hiscores:          null,
  bank:              [],
  inventory:         [],
  activities:        [],
  bankOperations:    [],
  goals:             goalsSeed as Goal[],
  dailyChallenges:   SAMPLE_CHALLENGES,
  sessions:          [],
  itemPrices:        Object.fromEntries(
    (itemsSeed as Array<{ id: number; name: string; guidePrice: number; category: string; stackable: boolean }>).map((item) => [
      item.name,
      {
        id:            item.id,
        name:          item.name,
        guidePrice:    item.guidePrice,
        lastPriceSync: '',
        category:      item.category,
        stackable:     item.stackable,
        spriteUrl:     `https://services.runescape.com/m=itemdb_rs/obj_sprite.gif?id=${item.id}`,
      } satisfies ItemInfo,
    ])
  ),
  ocrRunning:        false,
  lastHiscoresSync:  null,
  pendingEvents:     [],
  activeTab:         'dashboard',
}

// ── Actions ───────────────────────────────────────────────────────────────────

export type AppAction =
  | { type: 'SET_TAB';           tab: NexusTab }
  | { type: 'SET_SETTINGS';      settings: AppSettings }
  | { type: 'SET_BRIDGE';        status: BridgeStatus }
  | { type: 'SET_HISCORES';      data: PlayerHiscores }
  | { type: 'SET_BANK';          bank: BankItem[] }
  | { type: 'SET_INVENTORY';     inventory: BankItem[] }
  | { type: 'ADD_EVENT';         event: SourceEvent }
  | { type: 'APPROVE_EVENT';     id: string }
  | { type: 'REJECT_EVENT';      id: string }
  | { type: 'APPLY_OPERATION';   op: BankOperation }
  | { type: 'SET_OCR_RUNNING';   running: boolean }
  | { type: 'SET_GOALS';         goals: Goal[] }
  | { type: 'COMPLETE_CHALLENGE';id: string }
  | { type: 'START_SESSION';     session: Session }
  | { type: 'STOP_SESSION';      id: string }
  | { type: 'UPDATE_PRICES';     prices: Record<string, ItemInfo> }
  | { type: 'SET_LAST_SYNC';     time: string }

function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_TAB':
      return { ...state, activeTab: action.tab }

    case 'SET_SETTINGS':
      return { ...state, settings: action.settings }

    case 'SET_BRIDGE':
      return { ...state, bridgeStatus: action.status }

    case 'SET_HISCORES':
      return { ...state, hiscores: action.data, lastHiscoresSync: new Date().toISOString() }

    case 'SET_BANK':
      return { ...state, bank: action.bank }

    case 'SET_INVENTORY':
      return { ...state, inventory: action.inventory }

    case 'ADD_EVENT': {
      const isLow = action.event.confidence < (state.settings.aiConfidenceThreshold / 100)
      if (isLow) {
        return { ...state, pendingEvents: [action.event, ...state.pendingEvents].slice(0, 50) }
      }
      return {
        ...state,
        activities: [action.event, ...state.activities].slice(0, 200),
      }
    }

    case 'APPROVE_EVENT': {
      const ev = state.pendingEvents.find((e) => e.id === action.id)
      if (!ev) return state
      return {
        ...state,
        pendingEvents: state.pendingEvents.filter((e) => e.id !== action.id),
        activities:    [ev, ...state.activities].slice(0, 200),
      }
    }

    case 'REJECT_EVENT':
      return { ...state, pendingEvents: state.pendingEvents.filter((e) => e.id !== action.id) }

    case 'APPLY_OPERATION': {
      const op = action.op
      let bank = [...state.bank]
      if (op.op === 'add' && op.outputItem) {
        const idx = bank.findIndex((b) => b.name.toLowerCase() === op.outputItem!.toLowerCase())
        if (idx >= 0) bank[idx] = { ...bank[idx], quantity: bank[idx].quantity + (op.outputQty ?? 1), lastChanged: op.timestamp }
        else bank.push({ itemId: 0, name: op.outputItem, quantity: op.outputQty ?? 1, guidePrice: 0, lastChanged: op.timestamp, source: op.confidence >= 0.75 ? 'OCR' : 'Manual' })
      }
      if ((op.op === 'remove' || op.op === 'transform') && op.inputItem) {
        const idx = bank.findIndex((b) => b.name.toLowerCase() === op.inputItem!.toLowerCase())
        if (idx >= 0) {
          const newQty = bank[idx].quantity - (op.inputQty ?? 1)
          if (newQty <= 0) bank.splice(idx, 1)
          else bank[idx] = { ...bank[idx], quantity: newQty, lastChanged: op.timestamp }
        }
      }
      if (op.op === 'transform' && op.outputItem) {
        const idx = bank.findIndex((b) => b.name.toLowerCase() === op.outputItem!.toLowerCase())
        if (idx >= 0) bank[idx] = { ...bank[idx], quantity: bank[idx].quantity + (op.outputQty ?? 1), lastChanged: op.timestamp }
        else bank.push({ itemId: 0, name: op.outputItem, quantity: op.outputQty ?? 1, guidePrice: 0, lastChanged: op.timestamp, source: 'OCR' })
      }
      return {
        ...state,
        bank,
        bankOperations: [op, ...state.bankOperations].slice(0, 500),
      }
    }

    case 'SET_OCR_RUNNING':
      return { ...state, ocrRunning: action.running }

    case 'SET_GOALS':
      return { ...state, goals: action.goals }

    case 'COMPLETE_CHALLENGE':
      return {
        ...state,
        dailyChallenges: state.dailyChallenges.map((c) =>
          c.id === action.id ? { ...c, completed: true, current: c.target } : c
        ),
      }

    case 'START_SESSION':
      return { ...state, sessions: [action.session, ...state.sessions] }

    case 'STOP_SESSION':
      return {
        ...state,
        sessions: state.sessions.map((s) =>
          s.id === action.id ? { ...s, active: false, endTime: new Date().toISOString() } : s
        ),
      }

    case 'UPDATE_PRICES':
      return { ...state, itemPrices: { ...state.itemPrices, ...action.prices } }

    case 'SET_LAST_SYNC':
      return { ...state, lastHiscoresSync: action.time }

    default:
      return state
  }
}

// ── Context ───────────────────────────────────────────────────────────────────

interface AppCtx {
  state:    AppState
  dispatch: Dispatch<AppAction>
}

const AppContext = createContext<AppCtx | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE)

  // Persist settings / bank on change
  useEffect(() => {
    window.electronAPI?.writeStore('settings', state.settings)
  }, [state.settings])

  useEffect(() => {
    window.electronAPI?.writeStore('bank', state.bank)
  }, [state.bank])

  // Load persisted data
  useEffect(() => {
    async function hydrate() {
      const api = window.electronAPI
      if (!api) return
      const savedSettings = await api.readStore('settings')
      if (savedSettings) dispatch({ type: 'SET_SETTINGS', settings: savedSettings as AppSettings })
      const savedBank = await api.readStore('bank')
      if (Array.isArray(savedBank)) dispatch({ type: 'SET_BANK', bank: savedBank as BankItem[] })

      // Initial bridge status
      const status = await api.getBridgeStatus().catch(() => null)
      if (status) dispatch({ type: 'SET_BRIDGE', status })
    }
    hydrate()
  }, [])

  // Bridge status subscription
  useEffect(() => {
    const unsub = window.electronAPI?.onBridgeUpdate((status) => {
      dispatch({ type: 'SET_BRIDGE', status: status as BridgeStatus })
    })
    return unsub
  }, [])

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}
