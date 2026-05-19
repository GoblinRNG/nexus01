import { useState } from 'react'
import { Settings, Info, RefreshCw } from 'lucide-react'
import { NEWS_ITEMS } from '../data/skills'

export function LauncherPanel() {
  const [activeGame, setActiveGame] = useState<'rs3' | 'osrs'>('rs3')

  return (
    <div className="flex flex-col bg-nexus-panel border border-nexus-border rounded overflow-hidden" style={{ minWidth: 320 }}>
      {/* Title bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#060d18] border-b border-nexus-border">
        <div className="flex items-center gap-2">
          <JagexLogo />
          <span className="text-[10px] text-nexus-text tracking-widest uppercase font-bold">Jagex</span>
        </div>
        <div className="flex items-center gap-3">
          {[['Settings', <Settings key="s" size={11}/>], ['About', <Info key="a" size={11}/>], ['Update', <RefreshCw key="u" size={11}/>]].map(([label, icon]) => (
            <button key={label as string} className="flex items-center gap-1 text-[10px] text-nexus-text hover:text-nexus-accent transition-colors">
              {icon}
              <span>{label as string}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Game banner */}
      <div className="relative overflow-hidden" style={{ height: 180 }}>
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a1828] via-[#0d2040] to-[#070c14]" />
        {/* Silhouette art */}
        <GameArtwork />
        <div className="absolute inset-0 bg-gradient-to-t from-nexus-bg via-transparent to-transparent" />
        {/* Play button */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
          <button className="px-10 py-2 bg-nexus-green hover:bg-green-400 text-white font-bold text-sm tracking-widest rounded transition-colors glow-green uppercase">
            PLAY
          </button>
        </div>
      </div>

      {/* Game tabs */}
      <div className="flex items-center gap-4 px-3 py-2 border-b border-nexus-border bg-[#0a1220]">
        <button
          onClick={() => setActiveGame('rs3')}
          className={`text-xs font-semibold transition-colors ${activeGame === 'rs3' ? 'tab-active' : 'tab-inactive'}`}
        >
          RuneScape 3
        </button>
        <button
          onClick={() => setActiveGame('osrs')}
          className={`text-xs font-semibold transition-colors ${activeGame === 'osrs' ? 'tab-active' : 'tab-inactive'}`}
        >
          Old School RS
        </button>
      </div>

      {/* Data bar */}
      <div className="flex items-center gap-4 px-3 py-1.5 border-b border-nexus-border bg-[#0a1220] text-[10px] text-nexus-text">
        <span>Quests <span className="text-nexus-accent font-bold">247</span></span>
        <span>Clue Scrolls <span className="text-nexus-gold font-bold">1,204</span></span>
        <span className="ml-auto text-nexus-text-bright">v1.0.0 <span className="text-nexus-green">●</span></span>
      </div>

      {/* News header */}
      <div className="panel-header mt-0 rounded-none">News</div>

      {/* News items */}
      <div className="flex-1 overflow-y-auto">
        {NEWS_ITEMS.map((item) => (
          <div key={item.id} className="news-item border-b border-nexus-border/50">
            <div
              className="flex-shrink-0 w-14 h-10 rounded flex items-center justify-center text-white text-[8px] font-bold"
              style={{ backgroundColor: item.color + '33', border: `1px solid ${item.color}44` }}
            >
              <div className="text-center">
                <div style={{ color: item.color }} className="text-[9px] font-bold">{item.category}</div>
                <div className="text-nexus-text-bright text-[7px]">{item.date}</div>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[11px] text-nexus-text-bright font-medium truncate">{item.title}</div>
              <div className="text-[10px] text-nexus-text mt-0.5">The latest RuneScape news</div>
            </div>
          </div>
        ))}
      </div>

      {/* Nexus CTA */}
      <div className="p-2 border-t border-nexus-border bg-[#061020]">
        <div className="flex items-center justify-between px-2 py-1.5 bg-nexus-accent/10 border border-nexus-accent/30 rounded cursor-pointer hover:bg-nexus-accent/20 transition-colors">
          <span className="text-[10px] text-nexus-accent font-bold tracking-wider uppercase">Jagex Nexus Companion</span>
          <span className="text-nexus-accent text-xs">→</span>
        </div>
      </div>
    </div>
  )
}

function JagexLogo() {
  return (
    <div className="w-6 h-6 flex items-center justify-center">
      <svg viewBox="0 0 24 24" width="20" height="20">
        <polygon points="12,2 22,8 22,16 12,22 2,16 2,8" fill="#00c8e0" opacity="0.9"/>
        <text x="12" y="16" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">J</text>
      </svg>
    </div>
  )
}

function GameArtwork() {
  return (
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 340 180" preserveAspectRatio="xMidYMid slice">
      {/* Sky gradient */}
      <defs>
        <radialGradient id="skyGlow" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#1a3a6a" stopOpacity="0.8"/>
          <stop offset="100%" stopColor="#070c14" stopOpacity="1"/>
        </radialGradient>
        <linearGradient id="groundGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0d2040"/>
          <stop offset="100%" stopColor="#070c14"/>
        </linearGradient>
      </defs>
      <rect width="340" height="180" fill="url(#skyGlow)"/>
      {/* Stars */}
      {[...Array(20)].map((_, i) => (
        <circle key={i} cx={20 + i * 16} cy={10 + (i % 5) * 14} r="0.8" fill="white" opacity={0.3 + (i % 3) * 0.2}/>
      ))}
      {/* Mountains/terrain */}
      <polygon points="0,120 60,70 120,90 180,60 240,80 300,55 340,75 340,180 0,180" fill="#0a1e35" opacity="0.9"/>
      <polygon points="0,140 80,110 160,130 240,105 340,120 340,180 0,180" fill="#061020"/>
      {/* Character silhouettes */}
      <g fill="#00c8e0" opacity="0.6">
        {/* Warrior */}
        <rect x="120" y="95" width="8" height="30" rx="1"/>
        <circle cx="124" cy="91" r="5"/>
        <polygon points="116,100 132,100 128,85 120,85" opacity="0.8"/>
      </g>
      <g fill="#9b59b6" opacity="0.5">
        {/* Mage */}
        <rect x="190" y="98" width="6" height="26" rx="1"/>
        <circle cx="193" cy="94" r="4"/>
      </g>
      {/* Rune symbol glow */}
      <circle cx="170" cy="75" r="20" fill="none" stroke="#00c8e0" strokeWidth="0.5" opacity="0.3"/>
      <text x="170" y="80" textAnchor="middle" fill="#00c8e0" fontSize="14" opacity="0.4" fontFamily="serif">ᚱ</text>
    </svg>
  )
}
