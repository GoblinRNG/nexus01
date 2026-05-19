import React, { useState, useCallback } from 'react'
import { Home, Users, Gamepad2, Newspaper, Settings, ExternalLink, ChevronDown } from 'lucide-react'
import { useApp } from '../context/AppContext'

type SideIcon = 'home' | 'accounts' | 'games' | 'news' | 'settings'

interface NewsItem {
  id: number
  title: string
  date: string
  cat: string
  color: string
  bgColor: string
}

const NEWS: NewsItem[] = [
  { id: 1, title: 'Necromancy Deep Dive — New Spells Revealed', date: 'Nov 2024', cat: 'UPDATE', color: '#00c8e0', bgColor: '#001a22' },
  { id: 2, title: 'Yak Track Returns — Limited Time Rewards',   date: 'Nov 2024', cat: 'EVENT',  color: '#f0a030', bgColor: '#1a0e00' },
  { id: 3, title: 'Combat Rework Beta Phase 3',                 date: 'Oct 2024', cat: 'BETA',   color: '#22c55e', bgColor: '#001a0a' },
]

const SIDEBAR_ITEMS: Array<{ tab: SideIcon; icon: React.ReactNode; label: string }> = [
  { tab: 'home',     icon: <Home className="w-4 h-4" />,     label: 'Home' },
  { tab: 'accounts', icon: <Users className="w-4 h-4" />,    label: 'Accounts' },
  { tab: 'games',    icon: <Gamepad2 className="w-4 h-4" />, label: 'Games' },
  { tab: 'news',     icon: <Newspaper className="w-4 h-4" />,label: 'News' },
  { tab: 'settings', icon: <Settings className="w-4 h-4" />, label: 'Settings' },
]

function JagexHex({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <polygon
        points="16,2 28,9 28,23 16,30 4,23 4,9"
        fill="#1a0505"
        stroke="#c0392b"
        strokeWidth="1.5"
      />
      <text
        x="16" y="22"
        textAnchor="middle"
        fill="#e8453c"
        fontSize="14"
        fontFamily="Georgia, serif"
        fontWeight="bold"
      >
        J
      </text>
    </svg>
  )
}

function RS3HeroArt() {
  return (
    <svg
      className="absolute inset-0 w-full h-full"
      viewBox="0 0 246 155"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="lp-heroGlow" cx="50%" cy="35%" r="55%">
          <stop offset="0%" stopColor="#1a3560" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#070c14" stopOpacity="1" />
        </radialGradient>
        <linearGradient id="lp-groundGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0d2040" />
          <stop offset="100%" stopColor="#050810" />
        </linearGradient>
        <radialGradient id="lp-orbGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="246" height="155" fill="url(#lp-heroGlow)" />

      {/* Stars */}
      {[6, 22, 38, 54, 70, 14, 30, 46, 62, 78, 18, 42, 66].map((x, i) => (
        <circle key={i} cx={x} cy={8 + (i % 4) * 10} r="0.7" fill="white" opacity={0.2 + ((i * 7) % 5) * 0.1} />
      ))}
      {[100, 130, 160, 190, 220, 110, 145, 175, 205].map((x, i) => (
        <circle key={'r' + i} cx={x} cy={5 + (i % 3) * 8} r="0.6" fill="white" opacity={0.15 + ((i * 3) % 4) * 0.1} />
      ))}

      {/* Distant mountains */}
      <polygon points="0,85 30,55 60,70 90,48 120,60 150,42 180,55 210,40 246,52 246,155 0,155"
        fill="#0a1e38" opacity="0.9" />
      <polygon points="0,100 50,78 100,88 160,72 220,82 246,75 246,155 0,155"
        fill="#080f1e" />

      {/* Tower silhouette */}
      <rect x="105" y="45" width="8" height="55" fill="#061828" />
      <polygon points="101,50 113,50 109,38 105,38" fill="#061828" />
      <rect x="103" y="55" width="2" height="6" fill="#00c8e020" />
      <rect x="109" y="55" width="2" height="6" fill="#00c8e020" />

      {/* Arcane orb atop tower */}
      <circle cx="109" cy="38" r="5" fill="url(#lp-orbGlow)" />
      <circle cx="109" cy="38" r="2" fill="#c084fc" opacity="0.9" />

      {/* Character silhouettes */}
      <g opacity="0.5">
        <rect x="70" y="90" width="6" height="30" rx="1" fill="#00c8e0" />
        <circle cx="73" cy="86" r="4" fill="#00c8e0" />
        <polygon points="68,96 78,96 75,82 71,82" fill="#007a8a" />
      </g>
      <g opacity="0.4">
        <rect x="160" y="93" width="5" height="27" rx="1" fill="#a855f7" />
        <circle cx="162" cy="89" r="3.5" fill="#a855f7" />
      </g>

      {/* Rune circle glow */}
      <circle cx="123" cy="72" r="22" fill="none" stroke="#00c8e0" strokeWidth="0.4" opacity="0.25" />
      <circle cx="123" cy="72" r="14" fill="none" stroke="#00c8e0" strokeWidth="0.3" opacity="0.15" />
      <text x="123" y="77" textAnchor="middle" fill="#00c8e0" fontSize="12" opacity="0.3" fontFamily="serif">ᚱ</text>

      {/* Ground gradient overlay */}
      <rect x="0" y="100" width="246" height="55" fill="url(#lp-groundGrad)" opacity="0.6" />
      {/* Bottom vignette */}
      <rect x="0" y="120" width="246" height="35" fill="#070c14" opacity="0.8" />
    </svg>
  )
}

export function LauncherPanel() {
  const [activeNav, setActiveNav] = useState<SideIcon>('home')
  const { state } = useApp()

  const launcherPath = state.settings.launcherPath ||
    'C:\\Program Files\\Jagex Launcher\\JagexLauncher.exe'

  const launcherDetected  = state.bridgeStatus.launcherDetected
  const gameRunning       = state.bridgeStatus.gameProcessDetected

  const handlePlay = useCallback(() => {
    window?.electronAPI?.launchGame(launcherPath).catch(() => null)
    console.info('[Nexus] PLAY clicked — launching:', launcherPath)
  }, [launcherPath])

  const handleMinimize = useCallback(() => { /* window control handled by OS frame */ }, [])
  const handleClose    = useCallback(() => { /* window control handled by OS frame */ }, [])

  return (
    <div
      className="flex h-full rounded-xl overflow-hidden border border-nexus-border flex-shrink-0"
      style={{
        width: '292px',
        background: 'linear-gradient(180deg, #0a0e1a 0%, #070c14 100%)',
      }}
    >
      {/* Narrow icon sidebar */}
      <div className="flex flex-col items-center py-2 gap-1 border-r border-nexus-border bg-black/20 flex-shrink-0" style={{ width: 44 }}>
        <JagexHex size={24} />
        <div className="my-1 w-6 border-t border-nexus-border" />
        {SIDEBAR_ITEMS.map(item => {
          const active = activeNav === item.tab
          return (
            <button
              key={item.tab}
              onClick={() => setActiveNav(item.tab)}
              title={item.label}
              className={`group relative w-9 h-9 flex items-center justify-center rounded-lg transition-all ${
                active
                  ? 'text-nexus-accent bg-nexus-accent/15 border border-nexus-accent/30'
                  : 'text-nexus-text/50 hover:text-nexus-text hover:bg-nexus-border/20 border border-transparent'
              }`}
            >
              {item.icon}
            </button>
          )
        })}
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Title bar */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-nexus-border bg-black/30 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold text-red-400 tracking-widest uppercase">
              JAGEX LAUNCHER
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleMinimize}
              className="w-3 h-3 rounded-full bg-yellow-500/80 hover:bg-yellow-400 transition-colors"
              title="Minimize"
            />
            <button
              onClick={handleClose}
              className="w-3 h-3 rounded-full bg-red-500/80 hover:bg-red-400 transition-colors"
              title="Close"
            />
          </div>
        </div>

        {/* Hero */}
        <div className="relative overflow-hidden flex-shrink-0" style={{ height: 155 }}>
          <RS3HeroArt />
          <div className="absolute inset-0 flex flex-col items-center justify-end pb-4 gap-2 pointer-events-none">
            <div className="text-center pointer-events-none">
              <div
                className="text-xl font-black tracking-wider"
                style={{
                  fontFamily: '"Georgia", serif',
                  color: '#f0a030',
                  textShadow: '0 0 20px rgba(240,160,48,0.7), 0 2px 4px rgba(0,0,0,0.9)',
                }}
              >
                RuneScape
              </div>
              <div className="text-[9px] font-mono tracking-[0.4em] text-nexus-accent"
                style={{ textShadow: '0 1px 3px rgba(0,0,0,1)' }}>
                RUNESCAPE 3
              </div>
            </div>
            <button
              onClick={handlePlay}
              className="pointer-events-auto px-8 py-2 font-black text-sm tracking-widest uppercase rounded-lg transition-all active:scale-95 relative overflow-hidden group"
              style={{
                background: 'linear-gradient(135deg, #c07010 0%, #f0a030 50%, #c07010 100%)',
                boxShadow: '0 0 20px rgba(240,160,48,0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
                fontFamily: '"Georgia", serif',
                color: '#1a0800',
              }}
            >
              <span className="relative z-10">▶ PLAY</span>
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity" />
            </button>
          </div>
        </div>

        {/* Game card row */}
        <div className="flex items-center gap-2 px-3 py-2 border-b border-nexus-border bg-nexus-card flex-shrink-0">
          <div className="w-6 h-6 rounded bg-nexus-accent/15 border border-nexus-accent/25 flex items-center justify-center flex-shrink-0">
            <Gamepad2 className="w-3.5 h-3.5 text-nexus-accent" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-mono font-bold text-nexus-text-bright leading-none">RuneScape 3</p>
            <div className="flex items-center gap-1 mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-nexus-green" />
              <span className="text-[8px] font-mono text-nexus-green">RuneScape is up to date</span>
            </div>
          </div>
          <div className="relative flex-shrink-0">
            <select className="appearance-none text-[9px] font-mono bg-nexus-bg border border-nexus-border rounded px-2 py-1 text-nexus-text-bright pr-5 focus:outline-none focus:border-nexus-accent">
              <option>RS3 Client</option>
            </select>
            <ChevronDown className="absolute right-1 top-1/2 -translate-y-1/2 w-2.5 h-2.5 text-nexus-text pointer-events-none" />
          </div>
        </div>

        {/* News header */}
        <div className="flex items-center gap-2 px-3 py-1.5 border-b border-nexus-border bg-nexus-bg/30 flex-shrink-0">
          <Newspaper className="w-3 h-3 text-nexus-text" />
          <span className="text-[9px] font-mono text-nexus-text uppercase tracking-widest">News &amp; Updates</span>
        </div>

        {/* News list */}
        <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: '#1a3050 transparent' }}>
          {NEWS.map(item => (
            <div
              key={item.id}
              className="flex gap-2.5 px-3 py-2.5 border-b border-nexus-border/50 hover:bg-nexus-card cursor-pointer transition-colors group"
            >
              {/* Thumbnail */}
              <div
                className="flex-shrink-0 w-14 h-10 rounded-lg flex flex-col items-center justify-center gap-0.5"
                style={{ backgroundColor: item.bgColor, border: `1px solid ${item.color}30` }}
              >
                <span className="text-[8px] font-mono font-bold" style={{ color: item.color }}>{item.cat}</span>
                <span className="text-[7px] font-mono text-nexus-text">{item.date}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-mono text-nexus-text-bright group-hover:text-nexus-accent transition-colors leading-snug line-clamp-2">
                  {item.title}
                </p>
                <span
                  className="inline-block mt-1 text-[8px] font-mono font-bold px-1.5 py-0.5 rounded"
                  style={{ color: item.color, backgroundColor: `${item.color}15`, border: `1px solid ${item.color}25` }}
                >
                  {item.cat}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="flex items-center gap-2 px-3 py-2 border-t border-nexus-border bg-black/30 flex-shrink-0">
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${launcherDetected ? 'bg-nexus-green' : 'bg-amber-400'}`} />
            <span className={`text-[9px] font-mono ${launcherDetected ? 'text-nexus-green' : 'text-amber-400'}`}>
              {launcherDetected ? (gameRunning ? 'Game running' : 'Launcher found') : 'Launcher not found'}
            </span>
            {state.settings.playerName ? (
              <>
                <span className="text-[9px] font-mono text-nexus-text mx-1">·</span>
                <span className="text-[9px] font-mono text-nexus-text-bright font-bold truncate">{state.settings.playerName}</span>
              </>
            ) : null}
          </div>
          <button className="flex items-center gap-1 px-2 py-1 bg-nexus-accent/10 border border-nexus-accent/25 text-nexus-accent text-[9px] font-mono rounded-lg hover:bg-nexus-accent/20 transition-colors flex-shrink-0">
            <ExternalLink className="w-2.5 h-2.5" />
            Open Companion
          </button>
        </div>
      </div>
    </div>
  )
}
