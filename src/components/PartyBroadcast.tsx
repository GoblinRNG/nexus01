import { PARTY_MEMBERS } from '../data/skills'
import { Swords } from 'lucide-react'

export function PartyBroadcast() {
  return (
    <div>
      <div className="panel-header rounded-none -mx-2 px-2 mb-2">Party Broadcast — Hitting</div>
      <div className="space-y-1">
        {PARTY_MEMBERS.map((member) => {
          const pct = Math.round((member.hit / member.maxHit) * 100)
          return (
            <div key={member.rsn} className="flex items-center gap-2">
              <div
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: member.color }}
              />
              <span className="text-[10px] text-nexus-text-bright w-20 truncate">{member.rsn}</span>
              <span className="text-[9px] text-nexus-text w-6 text-right">{member.level}</span>
              <div className="flex-1 h-1.5 bg-nexus-bg rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${pct}%`, backgroundColor: member.color }}
                />
              </div>
              <div className="flex items-center gap-1 text-[9px] text-nexus-text w-14 justify-end">
                <Swords size={8} className="flex-shrink-0"/>
                <span className="text-nexus-text-bright font-bold">{member.hit.toLocaleString()}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
