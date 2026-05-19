import { Clock, Zap, Trophy, Star } from 'lucide-react'

interface StatBoxProps {
  icon: React.ReactNode
  label: string
  value: string
  sub?: string
  accent?: boolean
}

function StatBox({ icon, label, value, sub, accent }: StatBoxProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-0.5 px-2 py-1.5 bg-nexus-card border border-nexus-border rounded">
      <div className={`${accent ? 'text-nexus-accent' : 'text-nexus-text'}`}>{icon}</div>
      <div className={`text-sm font-bold tabular-nums ${accent ? 'text-nexus-accent' : 'text-nexus-text-bright'}`}>
        {value}
      </div>
      {sub && <div className="text-[9px] text-nexus-text">{sub}</div>}
      <div className="text-[8px] text-nexus-text uppercase tracking-wider">{label}</div>
    </div>
  )
}

export function PlayerStats() {
  return (
    <div className="grid grid-cols-4 gap-1.5">
      <StatBox
        icon={<Clock size={12}/>}
        label="Play Time"
        value="134h 38m"
        accent
      />
      <StatBox
        icon={<Star size={12}/>}
        label="Year"
        value="Year 5"
        sub="Veteran"
      />
      <StatBox
        icon={<Zap size={12}/>}
        label="Total XP"
        value="270.8M"
        sub="270,842,134"
      />
      <StatBox
        icon={<Trophy size={12}/>}
        label="Total Level"
        value="2,898"
        sub="/ 3,033"
      />
    </div>
  )
}
