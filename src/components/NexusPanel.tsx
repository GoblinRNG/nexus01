import { Search, Settings } from 'lucide-react'
import { PlayerStats } from './PlayerStats'
import { SkillsGrid } from './SkillsGrid'
import { PartyBroadcast } from './PartyBroadcast'
import { LiveWindow } from './LiveWindow'
import { CurrentAccount } from './CurrentAccount'

export function NexusPanel() {
  return (
    <div className="flex flex-col bg-nexus-panel border border-nexus-border rounded overflow-hidden flex-1">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#060d18] border-b border-nexus-border">
        <div className="flex items-center gap-2">
          <NexusLogo />
          <div>
            <div className="text-[11px] text-nexus-text-bright font-bold tracking-widest uppercase">Gielinor Nexus</div>
            <div className="text-[8px] text-nexus-accent tracking-wider">Companion v1.0</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-nexus-card border border-nexus-border rounded px-2 py-1">
            <Search size={10} className="text-nexus-text"/>
            <input
              className="bg-transparent text-[10px] text-nexus-text-bright outline-none w-24 placeholder:text-nexus-text"
              placeholder="Search player..."
            />
          </div>
          <button className="text-nexus-text hover:text-nexus-accent transition-colors">
            <Settings size={14}/>
          </button>
        </div>
      </div>

      {/* Content — 2 columns */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left column */}
        <div className="flex flex-col gap-2 p-2 border-r border-nexus-border overflow-y-auto" style={{ width: 280 }}>
          {/* Player stats */}
          <PlayerStats />

          {/* Quest card */}
          <QuestCard />

          {/* Skills */}
          <div className="panel p-2">
            <SkillsGrid />
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-2 p-2 flex-1 overflow-y-auto">
          {/* Player badge / recent activity */}
          <RecentActivity />

          {/* Party broadcast */}
          <div className="panel p-2">
            <PartyBroadcast />
          </div>

          {/* Live window */}
          <div className="panel p-2">
            <LiveWindow />
          </div>

          {/* Current account */}
          <div className="panel p-2">
            <CurrentAccount />
          </div>
        </div>
      </div>
    </div>
  )
}

function NexusLogo() {
  return (
    <div className="w-8 h-8 flex items-center justify-center rounded">
      <svg viewBox="0 0 32 32" width="32" height="32">
        <polygon points="16,2 30,10 30,22 16,30 2,22 2,10" fill="#00c8e0" opacity="0.15" stroke="#00c8e0" strokeWidth="1"/>
        <text x="16" y="21" textAnchor="middle" fill="#00c8e0" fontSize="14" fontWeight="bold" fontFamily="serif">N</text>
      </svg>
    </div>
  )
}

function QuestCard() {
  return (
    <div className="bg-gradient-to-r from-[#0d1e10] to-nexus-card border border-nexus-green/20 rounded p-2">
      <div className="flex items-center gap-1.5 mb-1">
        <div className="w-1.5 h-1.5 rounded-full bg-nexus-green animate-pulse"/>
        <span className="text-[9px] text-nexus-green uppercase font-bold tracking-wider">Active Quest</span>
      </div>
      <div className="text-[11px] text-nexus-text-bright font-semibold">Unlock Necromancy and claim rewards</div>
      <div className="mt-1.5 h-1 bg-nexus-bg rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-nexus-green to-nexus-accent rounded-full" style={{ width: '62%' }}/>
      </div>
      <div className="flex justify-between mt-0.5">
        <span className="text-[8px] text-nexus-text">Progress</span>
        <span className="text-[8px] text-nexus-green font-bold">62%</span>
      </div>
    </div>
  )
}

function RecentActivity() {
  const activities = [
    { label: 'Slayer Task',    value: 'Abyssal Demons ×85',    color: '#e74c3c' },
    { label: 'Last Login',     value: '2 hours ago',           color: '#00c8e0' },
    { label: 'Clue Solved',    value: 'Hard #1,204',           color: '#f39c12' },
    { label: 'Boss Kill',      value: 'Nex × 12',              color: '#9b59b6' },
  ]

  return (
    <div className="panel p-2">
      <div className="panel-header rounded-none -mx-2 px-2 mb-2">Recent Activity</div>
      <div className="space-y-1">
        {activities.map((a) => (
          <div key={a.label} className="flex items-center justify-between">
            <span className="text-[9px] text-nexus-text">{a.label}</span>
            <span className="text-[10px] font-semibold" style={{ color: a.color }}>{a.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
