import React, { useState, useMemo, useCallback } from 'react'
import {
  Coins, Grid3X3, BarChart2, Activity, Target, Calendar,
  TrendingUp, Clock, Settings, Search, RefreshCw,
  Home, ChevronRight, Cpu,
} from 'lucide-react'
import type { AppState, AppSettings, NexusTab, BankItem, SourceEvent } from '../types'
import { RS3_SKILL_ORDER } from '../types'
import { StatCards } from './StatCards'
import { BankOverview } from './BankOverview'
import { InventoryMirror } from './InventoryMirror'
import { ActivityFeed } from './ActivityFeed'
import { GoalsPanel } from './GoalsPanel'
import { DailyPanel } from './DailyPanel'
import { SettingsPanel } from './SettingsPanel'
import { AIObserver } from './AIObserver'

// ---------------------------------------------------------------------------
// AppAction type
// ---------------------------------------------------------------------------
export type AppAction =
  | { type: 'SET_TAB'; tab: NexusTab }
  | { type: 'UPDATE_BANK'; bank: BankItem[] }
  | { type: 'APPROVE_EVENT'; id: string }
  | { type: 'REJECT_EVENT'; id: string }
  | { type: 'START_SESSION'; skill: string }
  | { type: 'STOP_SESSION'; id: string }
  | { type: 'COMPLETE_CHALLENGE'; id: string }
  | { type: 'SAVE_SETTINGS'; settings: AppSettings }
  | { type: 'START_OCR' }
  | { type: 'STOP_OCR' }

interface NexusShellProps {
  state:             AppState
  dispatch:          (action: AppAction) => void
  syncHiscores?:     () => Promise<{ success: boolean; error?: string }>
  syncRuneMetrics?:  () => Promise<{ success: boolean; error?: string }>
  syncPrices?:       () => Promise<void>
  onSelectRegion?:   () => Promise<void>
  onEventDetected?:  (event: SourceEvent) => void
}

// ---------------------------------------------------------------------------
// Sidebar nav definition
// ---------------------------------------------------------------------------
interface NavItem {
  tab: NexusTab
  label: string
  icon: React.ReactNode
}

const NAV_ITEMS: NavItem[] = [
  { tab: 'dashboard',  label: 'Dashboard', icon: <Home className="w-4 h-4" /> },
  { tab: 'bank',       label: 'Bank',      icon: <Coins className="w-4 h-4" /> },
  { tab: 'inventory',  label: 'Inventory', icon: <Grid3X3 className="w-4 h-4" /> },
  { tab: 'skills',     label: 'Skills',    icon: <BarChart2 className="w-4 h-4" /> },
  { tab: 'activity',   label: 'Activity',  icon: <Activity className="w-4 h-4" /> },
  { tab: 'observer',   label: 'Observer',  icon: <Cpu className="w-4 h-4" /> },
  { tab: 'goals',      label: 'Goals',     icon: <Target className="w-4 h-4" /> },
  { tab: 'daily',      label: 'Daily',     icon: <Calendar className="w-4 h-4" /> },
  { tab: 'prices',     label: 'Prices',    icon: <TrendingUp className="w-4 h-4" /> },
  { tab: 'sessions',   label: 'Sessions',  icon: <Clock className="w-4 h-4" /> },
  { tab: 'settings',   label: 'Settings',  icon: <Settings className="w-4 h-4" /> },
]

// ---------------------------------------------------------------------------
// Skill colors for the skills grid
// ---------------------------------------------------------------------------
const SKILL_COLORS: Record<string, string> = {
  Overall: '#f0a030', Attack: '#ef4444', Defence: '#3b82f6', Strength: '#22c55e',
  Constitution: '#ef4444', Ranged: '#84cc16', Prayer: '#f0a030', Magic: '#a855f7',
  Cooking: '#f97316', Woodcutting: '#22c55e', Fletching: '#a855f7', Fishing: '#06b6d4',
  Firemaking: '#f97316', Crafting: '#f59e0b', Smithing: '#78716c', Mining: '#78716c',
  Herblore: '#22c55e', Agility: '#3b82f6', Thieving: '#a855f7', Slayer: '#ef4444',
  Farming: '#84cc16', Runecrafting: '#f0a030', Hunter: '#84cc16', Construction: '#f59e0b',
  Summoning: '#06b6d4', Dungeoneering: '#ef4444', Divination: '#06b6d4',
  Invention: '#00c8e0', Archaeology: '#f59e0b', Necromancy: '#8b5cf6',
}

// ---------------------------------------------------------------------------
// Item sprite with fallback
// ---------------------------------------------------------------------------
function ItemSprite({ itemId, name, size = 32 }: { itemId: number; name: string; size?: number }) {
  const [err, setErr] = useState(false)
  if (err) {
    return (
      <div
        className="flex items-center justify-center rounded text-[8px] font-mono text-nexus-text flex-shrink-0"
        style={{ width: size, height: size, background: '#0d1520', border: '1px solid #1a3050' }}
      >
        {name.substring(0, 2).toUpperCase()}
      </div>
    )
  }
  return (
    <img
      src={`https://services.runescape.com/m=itemdb_rs/obj_sprite.gif?id=${itemId}`}
      alt={name}
      width={size}
      height={size}
      className="flex-shrink-0 object-contain"
      style={{ imageRendering: 'pixelated' }}
      onError={() => setErr(true)}
    />
  )
}

// ---------------------------------------------------------------------------
// Skills grid tab
// ---------------------------------------------------------------------------
function SkillsGrid({ state }: { state: AppState }) {
  const skills = state.hiscores?.skills
  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-mono font-bold text-nexus-text-bright">Skills Overview</h3>
        {state.hiscores && (
          <span className="text-[10px] font-mono text-nexus-text">
            Last sync: {new Date(state.hiscores.fetchedAt).toLocaleDateString()}
          </span>
        )}
      </div>
      {!state.hiscores ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <BarChart2 className="w-12 h-12 text-nexus-text/20" />
          <p className="text-sm font-mono text-nexus-text">No HiScores data.</p>
          <p className="text-xs font-mono text-nexus-text/60">Set your player name in Settings and sync.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
          {RS3_SKILL_ORDER.map(skillName => {
            const data = skills?.[skillName]
            const color = SKILL_COLORS[skillName] ?? '#00c8e0'
            const isMax = data && (data.level >= 99 || (skillName === 'Dungeoneering' || skillName === 'Invention' ? data.level >= 120 : false))
            return (
              <div
                key={skillName}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl border bg-nexus-card hover:border-nexus-border/80 transition-colors"
                style={{ borderColor: data ? `${color}30` : '#1a3050' }}
              >
                <div
                  className="w-5 h-5 rounded flex-shrink-0"
                  style={{ backgroundColor: `${color}25`, border: `1px solid ${color}50` }}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-mono text-nexus-text truncate">{skillName}</p>
                  <div className="flex items-baseline gap-1">
                    <span
                      className="text-sm font-mono font-bold leading-none"
                      style={{ color: isMax ? '#f0a030' : (data ? color : '#1a3050') }}
                    >
                      {data?.level ?? '--'}
                    </span>
                    {data && (
                      <span className="text-[9px] font-mono text-nexus-text leading-none">
                        #{data.rank.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Prices tab
// ---------------------------------------------------------------------------
function PricesTab({ state, onSyncPrices }: { state: AppState; onSyncPrices?: () => Promise<void> }) {
  const [syncing, setSyncing] = useState(false)
  const items = Object.values(state.itemPrices)

  const handleSync = useCallback(async () => {
    if (!onSyncPrices || syncing) return
    setSyncing(true)
    await onSyncPrices().catch(console.error)
    setSyncing(false)
  }, [onSyncPrices, syncing])

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-mono font-bold text-nexus-text-bright">Grand Exchange Prices</h3>
        <button
          onClick={handleSync}
          disabled={syncing}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-nexus-accent/10 border border-nexus-accent/30 text-nexus-accent text-xs font-mono rounded-lg hover:bg-nexus-accent/20 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
          {syncing ? 'Syncing…' : 'Sync Prices'}
        </button>
      </div>
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <TrendingUp className="w-12 h-12 text-nexus-text/20" />
          <p className="text-sm font-mono text-nexus-text">No price data cached.</p>
          <p className="text-xs font-mono text-nexus-text/60">Click "Sync Prices" to fetch current GE prices.</p>
        </div>
      ) : (
        <div className="border border-nexus-border rounded-xl overflow-hidden">
          <div className="grid grid-cols-[32px_1fr_100px_100px_80px] gap-3 px-3 py-2 bg-nexus-bg/60 border-b border-nexus-border">
            <div />
            <span className="text-[10px] font-mono text-nexus-text uppercase tracking-wider">Item</span>
            <span className="text-[10px] font-mono text-nexus-text uppercase tracking-wider text-right">Price</span>
            <span className="text-[10px] font-mono text-nexus-text uppercase tracking-wider text-right">Category</span>
            <span className="text-[10px] font-mono text-nexus-text uppercase tracking-wider text-right">Synced</span>
          </div>
          <div className="divide-y divide-nexus-border/50">
            {items.map(item => (
              <div key={item.id} className="grid grid-cols-[32px_1fr_100px_100px_80px] gap-3 items-center px-3 py-2 hover:bg-nexus-bg/40 transition-colors">
                <ItemSprite itemId={item.id} name={item.name} size={32} />
                <span className="text-sm font-mono text-nexus-text-bright truncate">{item.name}</span>
                <span className="text-sm font-mono text-nexus-gold font-bold text-right">
                  {item.guidePrice.toLocaleString()} gp
                </span>
                <span className="text-[10px] font-mono text-nexus-text text-right truncate">{item.category}</span>
                <span className="text-[10px] font-mono text-nexus-text text-right">
                  {new Date(item.lastPriceSync).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Sessions tab
// ---------------------------------------------------------------------------
function SessionsTab({ state, dispatch }: { state: AppState; dispatch: (a: AppAction) => void }) {
  return (
    <div className="p-4 space-y-4">
      <h3 className="text-sm font-mono font-bold text-nexus-text-bright">Training Sessions</h3>
      <DailyPanel
        challenges={state.dailyChallenges}
        sessions={state.sessions}
        onCompleteChallenge={id => dispatch({ type: 'COMPLETE_CHALLENGE', id })}
        onStartSession={skill => dispatch({ type: 'START_SESSION', skill })}
        onStopSession={id => dispatch({ type: 'STOP_SESSION', id })}
      />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Dashboard tab
// ---------------------------------------------------------------------------
function formatGP(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M gp`
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K gp`
  return `${n.toLocaleString()} gp`
}

function timeAgo(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime()
  const s = Math.floor(diff / 1000)
  if (s < 60) return `${s}s ago`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  return `${Math.floor(m / 60)}h ago`
}

function DashboardTab({ state, dispatch }: { state: AppState; dispatch: (a: AppAction) => void }) {
  const topBankItems = useMemo(
    () => [...state.bank].sort((a, b) => b.quantity * b.guidePrice - a.quantity * a.guidePrice).slice(0, 5),
    [state.bank]
  )
  const recentActivity = useMemo(
    () => [...state.activities].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 5),
    [state.activities]
  )
  const primaryGoal = state.goals[0] ?? null
  const activeSession = state.sessions.find(s => s.active) ?? null
  const dailyChallenges = state.dailyChallenges.slice(0, 3)

  const SOURCE_DOT: Record<string, string> = {
    OCR: '#00c8e0', AI: '#a855f7', Manual: '#60a5fa',
    RuneMetrics: '#22c55e', Bridge: '#fb923c', HiScores: '#f0a030',
  }

  return (
    <div className="p-4 grid grid-cols-2 gap-4 auto-rows-min">
      {/* Primary Goal Card */}
      <div className="col-span-2 border border-nexus-border rounded-xl overflow-hidden bg-nexus-card">
        <div className="px-4 py-2 border-b border-nexus-border bg-nexus-accent/5">
          <span className="text-[10px] font-mono text-nexus-accent uppercase tracking-widest font-bold">Primary Goal</span>
        </div>
        {primaryGoal ? (
          <div className="p-4 flex items-start gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-mono font-bold text-nexus-text-bright mb-1">{primaryGoal.title}</h3>
              <p className="text-xs font-mono text-nexus-text">{primaryGoal.description}</p>
            </div>
            <div className="border-l border-nexus-border pl-4 min-w-[200px]">
              <p className="text-[9px] font-mono text-nexus-gold uppercase tracking-wider mb-1">Exact Action</p>
              <p className="text-xs font-mono text-nexus-gold font-semibold">{primaryGoal.exactAction}</p>
            </div>
          </div>
        ) : (
          <div className="p-4 text-center">
            <p className="text-xs font-mono text-nexus-text">No goals set — add one in the Goals tab.</p>
          </div>
        )}
      </div>

      {/* Bank Overview mini */}
      <div className="border border-nexus-border rounded-xl overflow-hidden bg-nexus-card">
        <div className="px-4 py-2 border-b border-nexus-border flex items-center justify-between">
          <span className="text-[10px] font-mono text-nexus-text uppercase tracking-widest">Top Bank Items</span>
          <button onClick={() => dispatch({ type: 'SET_TAB', tab: 'bank' })} className="text-[9px] font-mono text-nexus-accent hover:underline">
            View all
          </button>
        </div>
        <div className="p-3 space-y-1.5">
          {topBankItems.length === 0 ? (
            <p className="text-[10px] font-mono text-nexus-text/60 py-2 text-center">No items tracked</p>
          ) : topBankItems.map(item => (
            <div key={item.itemId} className="flex items-center gap-2">
              <ItemSprite itemId={item.itemId} name={item.name} size={24} />
              <span className="text-[10px] font-mono text-nexus-text-bright flex-1 truncate">{item.name}</span>
              <span className="text-[10px] font-mono text-nexus-gold">{formatGP(item.quantity * item.guidePrice)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Inventory Mirror compact */}
      <div className="border border-nexus-border rounded-xl overflow-hidden bg-nexus-card">
        <div className="px-4 py-2 border-b border-nexus-border flex items-center justify-between">
          <span className="text-[10px] font-mono text-nexus-text uppercase tracking-widest">Inventory</span>
          <button onClick={() => dispatch({ type: 'SET_TAB', tab: 'inventory' })} className="text-[9px] font-mono text-nexus-accent hover:underline">
            Full view
          </button>
        </div>
        <div className="p-3">
          <div className="grid grid-cols-4 gap-1" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
            {Array.from({ length: 28 }, (_, i) => {
              const item = state.inventory[i]
              return (
                <div
                  key={i}
                  className="aspect-square rounded border flex items-center justify-center"
                  style={{
                    background: item ? 'linear-gradient(135deg, #1a2a40 0%, #0d1a2a 100%)' : 'transparent',
                    borderColor: item ? 'rgba(0,200,224,0.15)' : '#1a3050',
                  }}
                  title={item ? item.name : undefined}
                >
                  {item && <ItemSprite itemId={item.itemId} name={item.name} size={20} />}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Daily Challenges card */}
      <div className="border border-nexus-border rounded-xl overflow-hidden bg-nexus-card">
        <div className="px-4 py-2 border-b border-nexus-border flex items-center justify-between">
          <span className="text-[10px] font-mono text-nexus-text uppercase tracking-widest">Daily Challenges</span>
          <button onClick={() => dispatch({ type: 'SET_TAB', tab: 'daily' })} className="text-[9px] font-mono text-nexus-accent hover:underline">
            View all
          </button>
        </div>
        <div className="p-3 space-y-2">
          {dailyChallenges.length === 0 ? (
            <p className="text-[10px] font-mono text-nexus-text/60 py-2 text-center">No challenges</p>
          ) : dailyChallenges.map(ch => (
            <div key={ch.id} className="space-y-1">
              <div className="flex justify-between">
                <span className="text-[10px] font-mono text-nexus-text-bright truncate">{ch.title}</span>
                <span className="text-[10px] font-mono text-nexus-text flex-shrink-0 ml-2">{ch.current}/{ch.target}</span>
              </div>
              <div className="h-1 bg-nexus-border rounded-full overflow-hidden">
                <div className="h-full bg-nexus-gold rounded-full" style={{ width: `${(ch.current / ch.target) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity card */}
      <div className="border border-nexus-border rounded-xl overflow-hidden bg-nexus-card">
        <div className="px-4 py-2 border-b border-nexus-border flex items-center justify-between">
          <span className="text-[10px] font-mono text-nexus-text uppercase tracking-widest">Recent Activity</span>
          <button onClick={() => dispatch({ type: 'SET_TAB', tab: 'activity' })} className="text-[9px] font-mono text-nexus-accent hover:underline">
            View all
          </button>
        </div>
        <div className="p-3 space-y-1.5">
          {recentActivity.length === 0 ? (
            <p className="text-[10px] font-mono text-nexus-text/60 py-2 text-center">No activity yet</p>
          ) : recentActivity.map(ev => (
            <div key={ev.id} className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: SOURCE_DOT[ev.source] ?? '#fff' }} />
              <span className="text-[10px] font-mono text-nexus-text-bright flex-1 truncate">{ev.rawText}</span>
              <span className="text-[9px] font-mono text-nexus-text flex-shrink-0">{timeAgo(ev.timestamp)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Live Session card */}
      <div className="col-span-2 border border-nexus-border rounded-xl overflow-hidden bg-nexus-card">
        <div className="px-4 py-2 border-b border-nexus-border">
          <span className="text-[10px] font-mono text-nexus-text uppercase tracking-widest">Live Session</span>
        </div>
        {activeSession ? (
          <div className="p-4 flex items-center gap-4">
            <div className="w-2 h-2 rounded-full bg-nexus-green animate-pulse" />
            <div>
              <p className="text-sm font-mono font-bold text-nexus-text-bright">{activeSession.skill}</p>
              <p className="text-[10px] font-mono text-nexus-text">
                +{(activeSession.currentXP - activeSession.startXP).toLocaleString()} XP gained · {formatGP(activeSession.gpGained)} profit
              </p>
            </div>
            <button
              onClick={() => dispatch({ type: 'STOP_SESSION', id: activeSession.id })}
              className="ml-auto px-3 py-1.5 bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono rounded-lg hover:bg-red-500/20 transition-colors"
            >
              Stop
            </button>
          </div>
        ) : (
          <div className="p-4 flex items-center justify-between">
            <p className="text-xs font-mono text-nexus-text">No active session.</p>
            <button
              onClick={() => dispatch({ type: 'SET_TAB', tab: 'daily' })}
              className="flex items-center gap-1 px-3 py-1.5 bg-nexus-accent/10 border border-nexus-accent/30 text-nexus-accent text-xs font-mono rounded-lg hover:bg-nexus-accent/20 transition-colors"
            >
              Start a session
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Top bar
// ---------------------------------------------------------------------------
function TopBar({ state, dispatch }: { state: AppState; dispatch: (a: AppAction) => void }) {
  const lastSync = state.lastHiscoresSync
    ? (() => {
        const diff = Date.now() - new Date(state.lastHiscoresSync).getTime()
        const m = Math.floor(diff / 60000)
        if (m < 1) return 'just now'
        if (m < 60) return `${m}m ago`
        return `${Math.floor(m / 60)}h ago`
      })()
    : 'never'

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 border-b border-nexus-border bg-nexus-bg/70 flex-shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <polygon points="14,2 25,8 25,20 14,26 3,20 3,8" fill="#00c8e0" fillOpacity="0.15" stroke="#00c8e0" strokeWidth="1.5" />
          <text x="14" y="19" textAnchor="middle" fill="#00c8e0" fontSize="11" fontFamily="monospace" fontWeight="bold">N</text>
        </svg>
        <div>
          <p className="text-xs font-mono font-bold text-nexus-accent tracking-widest leading-none">GIELINOR</p>
          <p className="text-[9px] font-mono text-nexus-text leading-none tracking-widest">NEXUS</p>
        </div>
      </div>

      <div className="w-px h-6 bg-nexus-border mx-1" />

      {/* Player */}
      <div className="flex items-center gap-1.5">
        <div className="w-6 h-6 rounded-full bg-nexus-accent/20 border border-nexus-accent/30 flex items-center justify-center">
          <span className="text-[8px] font-mono text-nexus-accent font-bold">
            {(state.settings.playerName || 'G').charAt(0).toUpperCase()}
          </span>
        </div>
        <div>
          <p className="text-[10px] font-mono text-nexus-text-bright leading-none">{state.settings.playerName || 'Guest'}</p>
          <p className="text-[9px] font-mono text-nexus-text leading-none">Last sync: {lastSync}</p>
        </div>
      </div>

      {/* Search */}
      <div className="flex-1 max-w-[260px] ml-auto relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-nexus-text" />
        <input
          type="text"
          placeholder="Search..."
          className="w-full pl-7 pr-3 py-1.5 bg-nexus-bg border border-nexus-border rounded-lg text-xs font-mono text-nexus-text-bright placeholder:text-nexus-text focus:outline-none focus:border-nexus-accent transition-colors"
        />
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main NexusShell
// ---------------------------------------------------------------------------
export function NexusShell({
  state, dispatch,
  syncHiscores, syncRuneMetrics, syncPrices,
  onSelectRegion, onEventDetected,
}: NexusShellProps) {
  const tab = state.activeTab

  const setTab = useCallback(
    (t: NexusTab) => dispatch({ type: 'SET_TAB', tab: t }),
    [dispatch]
  )

  const renderContent = () => {
    switch (tab) {
      case 'dashboard':
        return <DashboardTab state={state} dispatch={dispatch} />
      case 'bank':
        return (
          <div className="h-full p-4">
            <BankOverview
              bank={state.bank}
              onUpdate={bank => dispatch({ type: 'UPDATE_BANK', bank })}
            />
          </div>
        )
      case 'inventory':
        return (
          <div className="h-full p-4">
            <InventoryMirror inventory={state.inventory} />
          </div>
        )
      case 'skills':
        return <SkillsGrid state={state} />
      case 'activity':
        return (
          <div className="h-full p-4">
            <ActivityFeed
              activities={state.activities}
              pendingEvents={state.pendingEvents}
              onApprove={id => dispatch({ type: 'APPROVE_EVENT', id })}
              onReject={id => dispatch({ type: 'REJECT_EVENT', id })}
            />
          </div>
        )
      case 'observer':
        return (
          <div className="h-full p-4">
            <AIObserver
              running={state.ocrRunning}
              onStart={() => dispatch({ type: 'START_OCR' })}
              onStop={() => dispatch({ type: 'STOP_OCR' })}
              onSelectRegion={() => { onSelectRegion?.().catch(console.error) }}
              onEventDetected={onEventDetected ?? (() => {})}
              selectedRegion={state.settings.selectedRegion}
              settings={state.settings}
            />
          </div>
        )
      case 'goals':
        return (
          <div className="h-full p-4">
            <GoalsPanel goals={state.goals} />
          </div>
        )
      case 'daily':
        return (
          <div className="h-full p-4">
            <DailyPanel
              challenges={state.dailyChallenges}
              sessions={state.sessions}
              onCompleteChallenge={id => dispatch({ type: 'COMPLETE_CHALLENGE', id })}
              onStartSession={skill => dispatch({ type: 'START_SESSION', skill })}
              onStopSession={id => dispatch({ type: 'STOP_SESSION', id })}
            />
          </div>
        )
      case 'prices':
        return <PricesTab state={state} onSyncPrices={syncPrices} />
      case 'sessions':
        return <SessionsTab state={state} dispatch={dispatch} />
      case 'settings':
        return (
          <div className="h-full p-4">
            <SettingsPanel
              settings={state.settings}
              onSave={settings => dispatch({ type: 'SAVE_SETTINGS', settings })}
              onSyncHiscores={syncHiscores}
              onSyncRuneMetrics={syncRuneMetrics}
            />
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="flex h-full bg-nexus-panel border border-nexus-border rounded-xl overflow-hidden">
      {/* Narrow sidebar */}
      <div className="flex flex-col w-14 bg-nexus-bg border-r border-nexus-border flex-shrink-0 py-2 items-center gap-1">
        {NAV_ITEMS.map(item => {
          const active = tab === item.tab
          return (
            <button
              key={item.tab}
              onClick={() => setTab(item.tab)}
              title={item.label}
              className={`group relative w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                active
                  ? 'bg-nexus-accent/20 border border-nexus-accent/40 text-nexus-accent'
                  : 'text-nexus-text hover:text-nexus-text-bright hover:bg-nexus-border/30 border border-transparent'
              }`}
            >
              {item.icon}
              {/* Tooltip */}
              <div className="absolute left-full ml-2 px-2 py-1 bg-nexus-card border border-nexus-border rounded-lg text-[10px] font-mono text-nexus-text-bright whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-xl">
                {item.label}
              </div>
            </button>
          )
        })}
      </div>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <TopBar state={state} dispatch={dispatch} />

        {/* StatCards row */}
        <div className="px-4 py-3 border-b border-nexus-border bg-nexus-bg/30 flex-shrink-0">
          <StatCards
            hiscores={state.hiscores}
            bank={state.bank}
            sessions={state.sessions}
          />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {renderContent()}
        </div>
      </div>
    </div>
  )
}
